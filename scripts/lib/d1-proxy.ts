import { readFile } from "node:fs/promises";
import path from "node:path";

import "dotenv/config";
import { getPlatformProxy } from "wrangler";

import { createPrismaClient } from "../../lib/prisma-core";
import type { PrismaClient } from "../../lib/generated/prisma/client";
import type { ExportPayload } from "./migration-types";

export type D1Target = "local" | "remote";

export type MigrationCliOptions = {
  target: D1Target;
  file: string;
  dryRun: boolean;
  force: boolean;
};

export function parseMigrationCliArgs(argv: string[]): MigrationCliOptions {
  const hasLocal = argv.includes("--local");
  const hasRemote = argv.includes("--remote");

  if (hasLocal && hasRemote) {
    throw new Error("Use only one of --local or --remote");
  }

  let file = "scratch/export.json";
  const fileFlagIndex = argv.indexOf("--file");
  if (fileFlagIndex !== -1) {
    const next = argv[fileFlagIndex + 1];
    if (!next || next.startsWith("-")) {
      throw new Error("--file requires a path argument");
    }
    file = next;
  }

  return {
    target: hasRemote ? "remote" : "local",
    file,
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
  };
}

export async function readExportFile(filePath: string): Promise<ExportPayload> {
  const absolute = path.resolve(filePath);
  const raw = await readFile(absolute, "utf8");
  return JSON.parse(raw) as ExportPayload;
}

export async function connectD1(target: D1Target) {
  const proxyOptions =
    target === "local"
      ? { persist: true as const, remoteBindings: false as const }
      : {
          remoteBindings: true as const,
          environment: "remote" as const,
        };

  const { env, dispose } = await getPlatformProxy<Env>(proxyOptions);
  const prisma = createPrismaClient(env.DB);
  return { prisma, dispose };
}

export async function assertD1Schema(prisma: PrismaClient) {
  const tables = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'leads'
  `;
  if (tables.length === 0) {
    throw new Error(
      "D1 schema not found (missing leads table). Run: npm run db:migrate",
    );
  }
}

export async function withD1Client<T>(
  target: D1Target,
  fn: (prisma: PrismaClient, dispose: () => Promise<void>) => Promise<T>,
): Promise<T> {
  const { prisma, dispose } = await connectD1(target);
  try {
    return await fn(prisma, dispose);
  } finally {
    await prisma.$disconnect();
    await dispose();
  }
}
