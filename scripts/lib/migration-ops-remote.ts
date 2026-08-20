import type { ExportPayload, ExportTableKey } from "./migration-types";
import { SQL_TABLE_NAMES, rowToInsert, withAdminUserRole } from "./sql-table-meta";
import { INSERT_ORDER, WIPE_ORDER } from "./table-order";
import { assertRemoteSchema, countAllRemoteTables, execRemoteD1Sql, queryRemoteScalar } from "./d1-wrangler-remote";

export async function wipeRemoteTables() {
  const statements = WIPE_ORDER.map(
    (key) => `DELETE FROM ${SQL_TABLE_NAMES[key]};`,
  ).join("\n");
  await execRemoteD1Sql(statements);
  for (const key of WIPE_ORDER) {
    console.error(`wiped ${key}`);
  }
}

export async function importRemoteTables(payload: ExportPayload) {
  const statements: string[] = [];

  for (const key of INSERT_ORDER) {
    const table = SQL_TABLE_NAMES[key];
    const rows = payload[key] as Record<string, unknown>[];
    for (const row of rows) {
      const prepared = key === "adminUsers" ? withAdminUserRole(row) : row;
      statements.push(rowToInsert(table, prepared));
    }
    console.error(`queued ${key}: ${rows.length}`);
  }

  await execRemoteD1Sql(statements.join("\n"));
  console.error(`committed ${statements.length} rows`);
}

export async function countRemoteTables() {
  return countAllRemoteTables();
}

export async function importRemote(payload: ExportPayload, force: boolean) {
  await assertRemoteSchema();
  if (force) {
    await wipeRemoteTables();
  }
  await importRemoteTables(payload);
}

export async function queryRemoteJsonColumn(
  table: ExportTableKey,
  column: string,
): Promise<unknown> {
  const sqlTable = SQL_TABLE_NAMES[table];
  const sqlColumn = column.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
  const row = await queryRemoteScalar<Record<string, unknown>>(
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
