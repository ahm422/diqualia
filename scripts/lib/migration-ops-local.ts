import type { ExportPayload, ExportTableKey } from "./migration-types";
import { SQL_TABLE_NAMES, rowToInsert } from "./sql-table-meta";
import { INSERT_ORDER, WIPE_ORDER } from "./table-order";
import {
  assertLocalSchema,
  countAllLocalTables,
  execLocalD1Sql,
  queryLocalScalar,
} from "./d1-wrangler-local";

export async function wipeLocalTables() {
  const statements = WIPE_ORDER.map(
    (key) => `DELETE FROM ${SQL_TABLE_NAMES[key]};`,
  ).join("\n");
  await execLocalD1Sql(statements);
  for (const key of WIPE_ORDER) {
    console.error(`wiped ${key}`);
  }
}

export async function importLocalTables(payload: ExportPayload) {
  const statements: string[] = [];

  for (const key of INSERT_ORDER) {
    const table = SQL_TABLE_NAMES[key];
    const rows = payload[key] as Record<string, unknown>[];
    for (const row of rows) {
      statements.push(rowToInsert(table, row));
    }
    console.error(`queued ${key}: ${rows.length}`);
  }

  await execLocalD1Sql(statements.join("\n"));
  console.error(`committed ${statements.length} rows`);
}

export async function countLocalTables() {
  return countAllLocalTables();
}

export async function importLocal(payload: ExportPayload, force: boolean) {
  await assertLocalSchema();
  if (force) {
    await wipeLocalTables();
  }
  await importLocalTables(payload);
}

export async function queryLocalJsonColumn(
  table: ExportTableKey,
  column: string,
): Promise<unknown> {
  const sqlTable = SQL_TABLE_NAMES[table];
  const sqlColumn = column.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
  const row = await queryLocalScalar<Record<string, unknown>>(
    `SELECT ${sqlColumn} as value FROM ${sqlTable} LIMIT 1`,
  );
  const raw = row?.value;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return raw;
    }
  }
  return raw;
}
