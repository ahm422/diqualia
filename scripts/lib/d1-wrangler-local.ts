import { execFile } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import type { ExportTableKey } from "./migration-types";
import { TABLE_MANIFEST } from "./migration-types";
import { SQL_TABLE_NAMES } from "./sql-table-meta";

const execFileAsync = promisify(execFile);

const DATABASE_NAME = "diqualia-db";

type WranglerD1Result = Array<{
  results: unknown[];
  success: boolean;
}>;

function parseWranglerJson(stdout: string, stderr: string): WranglerD1Result {
  if (stdout.includes('"error"')) {
    const jsonStart = stdout.indexOf("{");
    const payload = JSON.parse(stdout.slice(jsonStart)) as { error?: { text?: string } };
    throw new Error(payload.error?.text ?? stdout);
  }

  const jsonStart = stdout.indexOf("[");
  if (jsonStart === -1) {
    throw new Error(stderr || stdout || "wrangler d1 execute returned no JSON");
  }

  return JSON.parse(stdout.slice(jsonStart)) as WranglerD1Result;
}

async function runWranglerD1(args: string[]): Promise<WranglerD1Result> {
  const { stdout, stderr } = await execFileAsync(
    "npx",
    ["wrangler", "d1", "execute", DATABASE_NAME, "--local", ...args, "--json"],
    {
      cwd: process.cwd(),
      maxBuffer: 64 * 1024 * 1024,
      env: process.env,
    },
  );
  return parseWranglerJson(stdout, stderr);
}

export async function execLocalD1Sql(sql: string): Promise<WranglerD1Result> {
  const file = join(tmpdir(), `diqualia-d1-local-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  await writeFile(file, sql, "utf8");

  try {
    return await runWranglerD1(["--file", file]);
  } finally {
    await unlink(file).catch(() => {});
  }
}

export async function queryLocalScalar<T>(sql: string): Promise<T | undefined> {
  const result = await runWranglerD1(["--command", sql]);
  const row = result[0]?.results?.[0] as T | undefined;
  return row;
}

export async function countAllLocalTables(): Promise<Record<ExportTableKey, number>> {
  const counts = {} as Record<ExportTableKey, number>;

  for (const { key } of TABLE_MANIFEST) {
    const table = SQL_TABLE_NAMES[key];
    const row = await queryLocalScalar<{ c: number }>(
      `SELECT COUNT(*) as c FROM ${table}`,
    );
    counts[key] = row?.c ?? 0;
  }

  return counts;
}

export async function assertLocalSchema() {
  const row = await queryLocalScalar<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'leads'",
  );
  if (!row) {
    throw new Error(
      "Local D1 schema not found (missing leads table). Run: npm run db:migrate",
    );
  }
}
