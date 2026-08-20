/**
 * Create or update the CMS bootstrap super-admin in D1 (admin_users only — CMS content untouched).
 *
 * Login accepts any admin_users email + password. ADMIN_EMAIL is the seed identity
 * and the contact/careers notification recipient — not a login allowlist.
 *
 * Usage:
 *   npm run db:seed:admin          # local D1 (.wrangler/state — npm run dev)
 *   npm run db:seed:admin:remote   # remote diqualia-db (production CMS data)
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";

import { hashPassword } from "@/lib/auth/password";
import { ROLE_IDS } from "@/lib/auth/rbac-ids";

import { execLocalD1Sql, queryLocalScalar } from "./lib/d1-wrangler-local";
import { execRemoteD1Sql, queryRemoteScalar } from "./lib/d1-wrangler-remote";
import { ensureRbacSql } from "./lib/ensure-rbac-sql";

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

async function upsertAdminSql(
  execSql: (sql: string) => Promise<unknown>,
  queryScalar: <T>(sql: string) => Promise<T | undefined>,
  email: string,
  password: string,
  label: string,
) {
  await execSql(ensureRbacSql());

  const passwordHash = await hashPassword(password);
  const existing = await queryScalar<{ id: string; role_id: string | null }>(
    `SELECT id, role_id FROM admin_users WHERE email = ${sqlString(email)} LIMIT 1`,
  );

  if (existing?.id) {
    const roleClause = existing.role_id
      ? ""
      : `, role_id = ${sqlString(ROLE_IDS.super_admin)}`;
    await execSql(
      `UPDATE admin_users SET password_hash = ${sqlString(passwordHash)}, updated_at = datetime('now')${roleClause} WHERE email = ${sqlString(email)}`,
    );
    console.error(`Super-admin updated (${label}): ${email} (id: ${existing.id})`);
    return existing.id;
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  await execSql(
    `INSERT INTO admin_users (id, email, name, password_hash, role_id, created_at, updated_at) VALUES (${sqlString(id)}, ${sqlString(email)}, 'Super admin', ${sqlString(passwordHash)}, ${sqlString(ROLE_IDS.super_admin)}, ${sqlString(now)}, ${sqlString(now)})`,
  );
  console.error(`Super-admin created (${label}): ${email} (id: ${id})`);
  return id;
}

async function main() {
  const { email, password } = requireAdminEnv();
  const target = process.argv.includes("--remote") ? "remote" : "local";

  if (target === "remote") {
    await upsertAdminSql(execRemoteD1Sql, queryRemoteScalar, email, password, "remote");
  } else {
    await upsertAdminSql(execLocalD1Sql, queryLocalScalar, email, password, "local");
  }

  console.error(`\nCMS login: /admin/login`);
  console.error(`  email:    ${email}`);
  console.error(`  password: value of ADMIN_PASSWORD in .env`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
