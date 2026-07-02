/**
 * Validate D1 row counts and JSON fields against scratch/export.json.
 *
 * Usage:
 *   npm run db:migrate:validate
 *   npm run db:migrate:validate -- --remote   # Phase 9 cutover
 *   tsx scripts/validate-migration.ts --local --file scratch/export.json
 *
 * Exits 1 if any table count mismatch or JSON spot-check fails.
 */
import {
  parseMigrationCliArgs,
  readExportFile,
  withD1Client,
} from "./lib/d1-proxy";
import { countD1Tables, validateExportCounts } from "./lib/migration-ops";
import {
  countRemoteTables,
  queryRemoteJsonColumn,
} from "./lib/migration-ops-remote";
import { TABLE_MANIFEST } from "./lib/migration-types";

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
    await withD1Client(options.target, async (prisma) => {
    const d1Counts = await countD1Tables(prisma);

    console.error(`\nRow counts (${options.target}):\n`);
    for (const { key } of TABLE_MANIFEST) {
      const expected = payload.counts[key];
      const actual = d1Counts[key];
      const ok = expected === actual;
      if (!ok) failed = true;
      const mark = ok ? "✅" : "❌";
      const label = key.padEnd(20);
      console.error(`${mark} ${label} ${actual}/${expected}`);
    }

    const storyRows = payload.storyPage;
    const contactRows = payload.contactPage;

    if (storyRows.length > 0) {
      const manifesto = (storyRows[0] as { manifestoItems?: unknown }).manifestoItems;
      const story = await prisma.storyPage.findFirst();
      const d1Manifesto = story?.manifestoItems;
      const exportOk = isNonEmptyStringArray(manifesto);
      const d1Ok = isNonEmptyStringArray(d1Manifesto);
      if (!exportOk || !d1Ok) {
        failed = true;
        console.error("\n❌ storyPage.manifestoItems spot-check failed");
      } else {
        console.error("\n✅ storyPage.manifestoItems is a non-empty string[]");
      }
    }

    if (contactRows.length > 0) {
      const whatToInclude = (contactRows[0] as { whatToIncludeItems?: unknown })
        .whatToIncludeItems;
      const contact = await prisma.contactPage.findFirst();
      const d1WhatToInclude = contact?.whatToIncludeItems;
      const exportOk = isNonEmptyStringArray(whatToInclude);
      const d1Ok = isNonEmptyStringArray(d1WhatToInclude);
      if (!exportOk || !d1Ok) {
        failed = true;
        console.error("❌ contactPage.whatToIncludeItems spot-check failed");
      } else {
        console.error("✅ contactPage.whatToIncludeItems is a non-empty string[]");
      }
    }
  });
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
