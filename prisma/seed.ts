import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { pgConnectionString, pgSslOption } from "../lib/pgSsl";

const ssl = pgSslOption();
const pool = new Pool({
  connectionString: pgConnectionString(process.env.DATABASE_URL),
  ...(ssl ? { ssl } : {}),
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  await prisma.lead.create({
    data: {
      email: "dev-seed@example.com",
      name: "Dev seed lead",
      message: "Remove me — created by prisma/seed.ts",
      source: "seed",
    },
  });
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
