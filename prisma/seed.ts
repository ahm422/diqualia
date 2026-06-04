import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";

import { pgConnectionString, pgSslOption } from "../lib/pgSsl";
import { seedCms } from "./seed-cms";

const ssl = pgSslOption();
const pool = new Pool({
  connectionString: pgConnectionString(process.env.DATABASE_URL),
  ...(ssl ? { ssl } : {}),
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`Admin user ready: ${admin.email} (id: ${admin.id})`);

  const existing = await prisma.lead.findFirst({ where: { source: "seed" } });
  if (!existing) {
    await prisma.lead.create({
      data: {
        email: "dev-seed@example.com",
        name: "Dev seed lead",
        message: "Remove me — created by prisma/seed.ts",
        source: "seed",
      },
    });
    console.log("Test lead created");
  }

  await seedCms(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
