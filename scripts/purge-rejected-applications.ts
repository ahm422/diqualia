/**
 * Purge rejected job applications older than 12 months (D1 row + R2 resume + R2 photo).
 *
 * Keeps new / reviewing / hired. Hired rows are never auto-purged.
 * Run monthly (local D1 or production):
 *
 *   npx tsx scripts/purge-rejected-applications.ts
 *   npx tsx scripts/purge-rejected-applications.ts --remote
 *
 * Dry run (print ids, do not delete):
 *
 *   npx tsx scripts/purge-rejected-applications.ts --dry-run
 *   npx tsx scripts/purge-rejected-applications.ts --remote --dry-run
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const DATABASE_NAME = "diqualia-db";
const BUCKET = "diqualia-assets";

type Row = {
  id: string;
  resume_key: string;
  photo_key: string | null;
};

function parseWranglerJson<T>(stdout: string, stderr: string): T {
  const jsonStart = stdout.indexOf("[");
  if (jsonStart === -1) {
    throw new Error(stderr || stdout || "wrangler returned no JSON");
  }
  return JSON.parse(stdout.slice(jsonStart)) as T;
}

async function d1Query(remote: boolean, sql: string): Promise<Row[]> {
  const args = [
    "wrangler",
    "d1",
    "execute",
    DATABASE_NAME,
    ...(remote ? ["--remote"] : ["--local"]),
    "--command",
    sql,
    "--json",
  ];
  const { stdout, stderr } = await execFileAsync("npx", args, {
    cwd: process.cwd(),
    maxBuffer: 16 * 1024 * 1024,
    env: process.env,
  });
  const parsed = parseWranglerJson<Array<{ results?: Row[] }>>(stdout, stderr);
  return parsed[0]?.results ?? [];
}

async function d1Exec(remote: boolean, sql: string): Promise<void> {
  await d1Query(remote, sql);
}

async function r2Delete(remote: boolean, key: string): Promise<void> {
  const args = [
    "wrangler",
    "r2",
    "object",
    "delete",
    `${BUCKET}/${key}`,
    ...(remote ? ["--remote"] : ["--local"]),
  ];
  try {
    await execFileAsync("npx", args, {
      cwd: process.cwd(),
      env: process.env,
    });
  } catch (err) {
    console.error(`  warn: failed to delete R2 ${key}:`, err);
  }
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main() {
  const remote = process.argv.includes("--remote");
  const dryRun = process.argv.includes("--dry-run");
  const rows = await d1Query(
    remote,
    `SELECT id, resume_key, photo_key FROM job_applications
     WHERE status = 'rejected'
       AND submitted_at <= datetime('now', '-12 months')`,
  );

  console.error(
    `${dryRun ? "Would purge" : "Purging"} ${rows.length} rejected application(s) (${remote ? "remote" : "local"})`,
  );

  for (const row of rows) {
    console.error(`  ${row.id} resume=${row.resume_key} photo=${row.photo_key ?? "—"}`);
    if (dryRun) continue;
    if (row.resume_key) await r2Delete(remote, row.resume_key);
    if (row.photo_key) await r2Delete(remote, row.photo_key);
    await d1Exec(remote, `DELETE FROM job_applications WHERE id = ${sqlString(row.id)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
