import type { PrismaClient as D1PrismaClient } from "../../lib/generated/prisma/client";
import {
  TABLE_MANIFEST,
  getDelegateForKey,
  type ExportPayload,
  type ExportTableKey,
  type PrismaDelegate,
} from "./migration-types";
import { INSERT_ORDER, WIPE_ORDER } from "./table-order";

function getModelDelegate(prisma: D1PrismaClient, delegate: PrismaDelegate) {
  return prisma[delegate as keyof D1PrismaClient] as unknown as {
    findMany: () => Promise<Record<string, unknown>[]>;
    count: () => Promise<number>;
    deleteMany: () => Promise<unknown>;
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
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

  for (const op of operations) {
    await op;
  }
  console.error(`committed ${operations.length} rows`);
}

export async function countD1Tables(prisma: D1PrismaClient) {
  const counts: Record<ExportTableKey, number> = {} as Record<ExportTableKey, number>;
  for (const { key, delegate } of TABLE_MANIFEST) {
    counts[key] = await getModelDelegate(prisma, delegate).count();
  }
  return counts;
}
