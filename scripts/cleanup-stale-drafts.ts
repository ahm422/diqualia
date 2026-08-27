/**
 * Clean up stale career-application drafts (issue #102).
 *
 * A draft with status = 'in_progress' and updated_at older than 30 days,
 * with no matching job_applications row for its (job_opening_id, email),
 * is considered abandoned: the D1 row is deleted (cascading to its 4 child
 * step tables) and its resume/photo R2 objects are removed.
 * status = 'completed' drafts are never touched — their R2 keys are also
 * referenced by the resulting job_applications row.
 *
 * This is the manual/smoke-test counterpart to the daily Cron Trigger
 * wired in src/worker/custom-worker.ts (same cleanupStaleDrafts()).
 *
 * Dry run — count/list candidates, no deletes (default: local D1):
 *
 *   npx tsx scripts/cleanup-stale-drafts.ts
 *   npx tsx scripts/cleanup-stale-drafts.ts --remote --dry-run
 *
 * Actually delete:
 *
 *   npx tsx scripts/cleanup-stale-drafts.ts --local --run
 *   npx tsx scripts/cleanup-stale-drafts.ts --remote --run
 *
 * Custom retention window (days):
 *
 *   npx tsx scripts/cleanup-stale-drafts.ts --run --days 14
 */
import "dotenv/config";
import { getPlatformProxy } from "wrangler";

import { cleanupStaleDrafts } from "../lib/careers/cleanup-drafts";
import { createPrismaClient } from "../lib/prisma-core";

function readDaysFlag(argv: string[]): number | undefined {
  const idx = argv.indexOf("--days");
  if (idx === -1) return undefined;
  const value = Number(argv[idx + 1]);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("--days requires a positive number");
  }
  return value;
}

async function main() {
  const argv = process.argv.slice(2);
  const remote = argv.includes("--remote");
  // Default is dry-run: an explicit --run is required to actually delete.
  const run = argv.includes("--run") && !argv.includes("--dry-run");
  const olderThanDays = readDaysFlag(argv);

  const { env, dispose } = await getPlatformProxy<Env>(
    remote ? { remoteBindings: true, environment: "remote" } : { persist: true, remoteBindings: false },
  );

  if (!env.R2) {
    console.error("R2 binding unavailable from getPlatformProxy; aborting.");
    process.exit(1);
  }
  const bucket = env.R2;
  const prisma = createPrismaClient(env.DB);

  try {
    const summary = await cleanupStaleDrafts(
      prisma,
      {
        deleteObject: async ({ key }) => {
          await bucket.delete(key);
        },
      },
      { olderThanDays, dryRun: !run },
    );

    console.error(
      `${run ? "Deleted" : "Would delete"} ${summary.deleted}/${summary.scanned} stale draft(s) ` +
        `(${remote ? "remote" : "local"}${olderThanDays ? `, --days ${olderThanDays}` : ""}); ` +
        `${summary.r2ObjectsDeleted} R2 object(s), ${summary.skippedLinked} skipped (linked application), ` +
        `${summary.errors.length} error(s).`,
    );
    if (summary.errors.length > 0) {
      for (const { token, error } of summary.errors) {
        console.error(`  error: ${token}: ${error}`);
      }
    }
    if (!run) {
      console.error("Dry run — no rows or R2 objects were deleted. Pass --run to actually delete.");
    }
  } finally {
    await prisma.$disconnect();
    await dispose();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
