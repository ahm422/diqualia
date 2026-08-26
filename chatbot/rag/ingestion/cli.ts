/**
 * KB ingestion CLI.
 *
 * Usage:
 *   npm run kb:ingest               # incremental (only changed content)
 *   npm run kb:ingest -- --force    # re-embed everything
 *   npm run kb:ingest -- --remote   # target remote D1 (production)
 *
 * Requires: local Qdrant running (default http://127.0.0.1:6333) and the RAG
 * environment variables (see .env.example). Run `npm run db:migrate` first so
 * the kb_documents / kb_facts tables exist.
 */

import "dotenv/config";

import { connectD1 } from "../../../scripts/lib/d1-proxy";
import { runIngestion } from "./pipeline";

async function main() {
  const argv = process.argv.slice(2);
  const target = argv.includes("--remote") ? "remote" : "local";
  const force = argv.includes("--force");

  const { prisma, dispose } = await connectD1(target);
  try {
    const result = await runIngestion(prisma, { force });
    console.log("\n=== Ingestion summary ===");
    console.log(`Target D1: ${target}`);
    console.log(`Documents:  ${result.totalDocuments}`);
    console.log(`Added:      ${result.added}`);
    console.log(`Updated:    ${result.updated}`);
    console.log(`Unchanged:  ${result.unchanged}`);
    console.log(`Removed:    ${result.removed}`);
    console.log(`Vectors:    ${result.vectors}`);
    console.log(`Facts:      ${result.facts}`);
    if (result.errors.length > 0) {
      console.error(`\nErrors (${result.errors.length}):`);
      for (const err of result.errors) console.error(`  - ${err}`);
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
    await dispose();
  }
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
