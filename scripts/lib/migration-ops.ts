import type { PrismaClient as PostgresPrismaClient } from "../../lib/generated/prisma-postgres/client";
import type { PrismaClient as D1PrismaClient } from "../../lib/generated/prisma/client";
import {
  SCHEMA_VERSION,
  TABLE_MANIFEST,
  getDelegateForKey,
  type ExportPayload,
  type ExportTableKey,
  type PrismaDelegate,
  serializeRow,
} from "./migration-types";
import { INSERT_ORDER, WIPE_ORDER } from "./table-order";

type AnyPrismaClient = PostgresPrismaClient | D1PrismaClient;

function getModelDelegate(prisma: AnyPrismaClient, delegate: PrismaDelegate) {
  return prisma[delegate as keyof AnyPrismaClient] as {
    findMany: () => Promise<Record<string, unknown>[]>;
    count: () => Promise<number>;
    deleteMany: () => Promise<unknown>;
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
}

export async function exportAllTables(prisma: PostgresPrismaClient) {
  const payload: Partial<ExportPayload> = {
    meta: {
      exportedAt: new Date().toISOString(),
      source: "postgres",
      schemaVersion: SCHEMA_VERSION,
    },
    counts: {} as Record<ExportTableKey, number>,
  };

  console.error(`Exporting ${TABLE_MANIFEST.length} tables…`);

  for (const { key, delegate } of TABLE_MANIFEST) {
    const rows = await getModelDelegate(prisma, delegate).findMany();
    const serialized = rows.map((row) => serializeRow(row));
    (payload as Record<string, unknown>)[key] = serialized;
    payload.counts![key] = serialized.length;
    console.error(`${key}: ${serialized.length}`);
  }

  return payload as ExportPayload;
}

export function validateExportCounts(payload: ExportPayload) {
  for (const { key } of TABLE_MANIFEST) {
    const rows = payload[key];
    if (!Array.isArray(rows)) {
      throw new Error(`Export payload missing array for "${key}"`);
    }
    const expected = payload.counts[key];
    if (rows.length !== expected) {
      throw new Error(
        `Count mismatch for "${key}": meta says ${expected}, array has ${rows.length}`,
      );
    }
  }
}

export async function wipeD1Tables(prisma: D1PrismaClient) {
  for (const key of WIPE_ORDER) {
    const delegate = getDelegateForKey(key);
    await getModelDelegate(prisma, delegate).deleteMany();
    console.error(`wiped ${key}`);
  }
}

export async function importTables(prisma: D1PrismaClient, payload: ExportPayload) {
  const operations = [];

  for (const key of INSERT_ORDER) {
    const delegate = getDelegateForKey(key);
    const rows = payload[key];
    for (const row of rows) {
      operations.push(
        getModelDelegate(prisma, delegate).create({
          data: row as Record<string, unknown>,
        }),
      );
    }
    console.error(`queued ${key}: ${rows.length}`);
  }

  await prisma.$transaction(operations);
  console.error(`committed ${operations.length} rows`);
}

export async function countD1Tables(prisma: D1PrismaClient) {
  const counts: Record<ExportTableKey, number> = {} as Record<ExportTableKey, number>;
  for (const { key, delegate } of TABLE_MANIFEST) {
    counts[key] = await getModelDelegate(prisma, delegate).count();
  }
  return counts;
}
