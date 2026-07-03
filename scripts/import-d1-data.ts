/**
 * Import scratch/export.json into Cloudflare D1 (local or remote).
 *
 * Usage:
 *   npm run db:migrate                    # ensure local D1 schema first
 *   npm run db:import:local -- --dry-run
 *   npm run db:import:local -- --force
 *   npm run db:import:remote -- --force # Phase 9 cutover only
 *
 * Flags:
 *   --local       Local .wrangler/state D1 (default)
 *   --remote      Remote diqualia-db via wrangler proxy
 *   --file <path> Export file (default: scratch/export.json)
 *   --dry-run     Parse + print planned ops; no writes
 *   --force       Wipe target tables before import (required for re-run)
 *
 * Manual validation after local import (Phase 3.4 / Phase 7):
 *   - Admin Story editor: manifestoItems renders and saves
 *   - Admin Contact editor: whatToIncludeItems renders and saves
 *   - Public /story and /contact show migrated lists
 *   - Admin login works with migrated adminUsers password hash
 */
import path from "node:path";

import { parseMigrationCliArgs, readExportFile } from "./lib/d1-proxy";
import { validateExportCounts } from "./lib/migration-ops";
import { importLocal } from "./lib/migration-ops-local";
import { importRemote } from "./lib/migration-ops-remote";
import { INSERT_ORDER } from "./lib/table-order";

async function main() {
  const options = parseMigrationCliArgs(process.argv.slice(2));
  const payload = await readExportFile(options.file);
  validateExportCounts(payload);

  const totalRows = INSERT_ORDER.reduce((sum, key) => sum + payload[key].length, 0);
  console.error(
    `Import plan (${options.target}): ${INSERT_ORDER.length} tables, ${totalRows} rows from ${path.resolve(options.file)}`,
  );

  if (options.dryRun) {
    for (const key of INSERT_ORDER) {
      console.error(`  would insert ${key}: ${payload[key].length}`);
    }
    if (options.force) {
      console.error("  would wipe all tables first (--force)");
    } else {
      console.error("  no wipe (--force not set)");
    }
    console.error("Dry run complete — no writes.");
    return;
  }

  if (options.target === "remote") {
    await importRemote(payload, options.force);
    console.error("Import complete (remote).");
    return;
  }

  await importLocal(payload, options.force);
  console.error(`Import complete (${options.target}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
