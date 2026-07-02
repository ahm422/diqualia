/**
 * Export all production data from Supabase Postgres to JSON (stdout).
 *
 * Requires DIRECT_DATABASE_URL (direct port 5432, not pooled 6543).
 * Counts and progress go to stderr; stdout is reserved for JSON only.
 *
 * Usage:
 *   npm run db:export
 *   tsx scripts/export-postgres-data.ts > scratch/export.json
 *
 * Production cutover (Phase 9 — run immediately before import):
 *   npm run db:export
 *   npm run db:migrate:remote
 *   npm run db:import:remote -- --force
 *   npm run db:migrate:validate -- --remote
 *
 * Security: export contains passwordHash — scratch/ is gitignored.
 * Phase 10: remove pg devDeps and this script after cutover.
 */
import "dotenv/config";

import { exportAllTables } from "./lib/migration-ops";
import { createPostgresPrisma } from "./lib/postgres-prisma";

async function main() {
  const prisma = createPostgresPrisma();
  try {
    const payload = await exportAllTables(prisma);
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
