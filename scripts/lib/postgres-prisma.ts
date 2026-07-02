import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../lib/generated/prisma-postgres/client";

export function createPostgresPrisma() {
  const url = process.env.DIRECT_DATABASE_URL;
  if (!url) {
    throw new Error(
      "DIRECT_DATABASE_URL is required for Postgres export (direct port 5432, not pooled 6543)",
    );
  }

  const ssl =
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "false"
      ? { rejectUnauthorized: false as const }
      : undefined;

  const adapter = new PrismaPg({ connectionString: url, ssl });
  return new PrismaClient({ adapter });
}
