/**
 * Create or update the CMS super-admin in D1 (admin_users only — CMS content untouched).
 *
 * The login route only accepts process.env.ADMIN_EMAIL; password is verified against
 * admin_users.password_hash (bcrypt, same as lib/auth/password.ts).
 *
 * Usage:
 *   npm run db:seed:admin          # local D1 (.wrangler/state — npm run dev)
 *   npm run db:seed:admin:remote   # remote diqualia-db (production CMS data)
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";

import { hashPassword } from "@/lib/auth/password";

import { assertD1Schema, withD1Client } from "./lib/d1-proxy";
import { upsertAdminUser } from "./lib/seed-admin-core";
import { execRemoteD1Sql, queryRemoteScalar } from "./lib/d1-wrangler-remote";

function requireAdminEnv() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }
  return { email, password };
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function seedAdminRemote(email: string, password: string) {
  const passwordHash = await hashPassword(password);
  const existing = await queryRemoteScalar<{ id: string }>(
    `SELECT id FROM admin_users WHERE email = ${sqlString(email)} LIMIT 1`,
  );

  if (existing?.id) {
    await execRemoteD1Sql(
      `UPDATE admin_users SET password_hash = ${sqlString(passwordHash)}, updated_at = datetime('now') WHERE email = ${sqlString(email)}`,
    );
    console.error(`Super-admin updated (remote): ${email} (id: ${existing.id})`);
    return existing.id;
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  await execRemoteD1Sql(
    `INSERT INTO admin_users (id, email, password_hash, created_at, updated_at) VALUES (${sqlString(id)}, ${sqlString(email)}, ${sqlString(passwordHash)}, ${sqlString(now)}, ${sqlString(now)})`,
  );
  console.error(`Super-admin created (remote): ${email} (id: ${id})`);
  return id;
}

async function main() {
  const { email, password } = requireAdminEnv();
  const target = process.argv.includes("--remote") ? "remote" : "local";

  if (target === "remote") {
    await seedAdminRemote(email, password);
  } else {
    await withD1Client("local", async (prisma) => {
      await assertD1Schema(prisma);
      const admin = await upsertAdminUser(prisma, email, password);
      console.error(`Super-admin ready (local): ${admin.email} (id: ${admin.id})`);
    });
  }

  console.error(`\nCMS login: /admin/login`);
  console.error(`  email:    ${email}`);
  console.error(`  password: value of ADMIN_PASSWORD in .env`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
