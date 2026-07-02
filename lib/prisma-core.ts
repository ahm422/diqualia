import { PrismaD1 } from "@prisma/adapter-d1";

import { PrismaClient } from "@/lib/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export function createPrismaClient(db: D1Database) {
  if (global.__prismaClient) return global.__prismaClient;
  const adapter = new PrismaD1(db);
  global.__prismaClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
  return global.__prismaClient;
}
