/**
 * Validate D1 row counts and JSON fields against scratch/export.json.
 *
 * Usage:
 *   npm run db:migrate:validate
 *   npm run db:migrate:validate -- --remote   # Phase 9 cutover
 *   tsx scripts/validate-migration.ts --local --file scratch/export.json
 *
 * Exits 1 if any CMS table count mismatch or JSON spot-check fails.
 * `leads` and `adminUsers` are operational (seed/e2e) and are not compared.
 */
import {
  parseMigrationCliArgs,
  readExportFile,
} from "./lib/d1-proxy";
import { validateExportCounts } from "./lib/migration-ops";
import {
  countLocalTables,
  queryLocalJsonColumn,
} from "./lib/migration-ops-local";
import {
  countRemoteTables,
  queryRemoteJsonColumn,
} from "./lib/migration-ops-remote";
import { TABLE_MANIFEST, type ExportTableKey } from "./lib/migration-types";

/** Seed/e2e mutate these; they are not part of the CMS snapshot contract. */
const OPERATIONAL_KEYS = new Set<ExportTableKey>(["leads", "adminUsers"]);

function isNonEmptyStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string")
  );
}

async function main() {
  const options = parseMigrationCliArgs(process.argv.slice(2));
  const payload = await readExportFile(options.file);
  validateExportCounts(payload);

  let failed = false;

  if (options.target === "remote") {
    const d1Counts = await countRemoteTables();

    console.error(`\nRow counts (remote):\n`);
    for (const { key } of TABLE_MANIFEST) {
      const expected = payload.counts[key];
      const actual = d1Counts[key];
      if (OPERATIONAL_KEYS.has(key)) {
        const label = key.padEnd(20);
        console.error(`⏭️  ${label} ${actual} (operational, not compared)`);
        continue;
      }
      const ok = expected === actual;
      if (!ok) failed = true;
      const mark = ok ? "✅" : "❌";
      const label = key.padEnd(20);
      console.error(`${mark} ${label} ${actual}/${expected}`);
    }

    if (payload.storyPage.length > 0) {
      const manifesto = (payload.storyPage[0] as { manifestoItems?: unknown })
        .manifestoItems;
      const d1Manifesto = await queryRemoteJsonColumn("storyPage", "manifestoItems");
      const exportOk = isNonEmptyStringArray(manifesto);
      const d1Ok = isNonEmptyStringArray(d1Manifesto);
      if (!exportOk || !d1Ok) {
        failed = true;
        console.error("\n❌ storyPage.manifestoItems spot-check failed");
      } else {
        console.error("\n✅ storyPage.manifestoItems is a non-empty string[]");
      }
    }

    if (payload.contactPage.length > 0) {
      const whatToInclude = (payload.contactPage[0] as { whatToIncludeItems?: unknown })
        .whatToIncludeItems;
      const d1WhatToInclude = await queryRemoteJsonColumn(
        "contactPage",
        "whatToIncludeItems",
      );
      const exportOk = isNonEmptyStringArray(whatToInclude);
      const d1Ok = isNonEmptyStringArray(d1WhatToInclude);
      if (!exportOk || !d1Ok) {
        failed = true;
        console.error("❌ contactPage.whatToIncludeItems spot-check failed");
      } else {
        console.error("✅ contactPage.whatToIncludeItems is a non-empty string[]");
      }
    }
  } else {
    const d1Counts = await countLocalTables();

    console.error(`\nRow counts (${options.target}):\n`);
    for (const { key } of TABLE_MANIFEST) {
      const expected = payload.counts[key];
      const actual = d1Counts[key];
      if (OPERATIONAL_KEYS.has(key)) {
        const label = key.padEnd(20);
        console.error(`⏭️  ${label} ${actual} (operational, not compared)`);
        continue;
      }
      const ok = expected === actual;
      if (!ok) failed = true;
      const mark = ok ? "✅" : "❌";
      const label = key.padEnd(20);
      console.error(`${mark} ${label} ${actual}/${expected}`);
    }

    if (payload.storyPage.length > 0) {
      const manifesto = (payload.storyPage[0] as { manifestoItems?: unknown })
        .manifestoItems;
      const d1Manifesto = await queryLocalJsonColumn("storyPage", "manifestoItems");
      const exportOk = isNonEmptyStringArray(manifesto);
      const d1Ok = isNonEmptyStringArray(d1Manifesto);
      if (!exportOk || !d1Ok) {
        failed = true;
        console.error("\n❌ storyPage.manifestoItems spot-check failed");
      } else {
        console.error("\n✅ storyPage.manifestoItems is a non-empty string[]");
      }
    }

    if (payload.contactPage.length > 0) {
      const whatToInclude = (payload.contactPage[0] as { whatToIncludeItems?: unknown })
        .whatToIncludeItems;
      const d1WhatToInclude = await queryLocalJsonColumn(
        "contactPage",
        "whatToIncludeItems",
      );
      const exportOk = isNonEmptyStringArray(whatToInclude);
      const d1Ok = isNonEmptyStringArray(d1WhatToInclude);
      if (!exportOk || !d1Ok) {
        failed = true;
        console.error("❌ contactPage.whatToIncludeItems spot-check failed");
      } else {
        console.error("✅ contactPage.whatToIncludeItems is a non-empty string[]");
      }
    }
  }

  if (failed) {
    console.error("\nValidation failed.");
    process.exit(1);
  }

  console.error("\nAll checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
