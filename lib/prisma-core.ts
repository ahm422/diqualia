import { PrismaD1 } from "@prisma/adapter-d1";

import { PrismaClient } from "@/lib/generated/prisma/client";

// Do not cache PrismaClient (or the D1 adapter) on globalThis. Cloudflare
// Workers reuse isolates across requests, and D1 is request-scoped I/O —
// reusing a client from a previous request throws and 500s every public page.
export function createPrismaClient(db: D1Database) {
  const adapter = new PrismaD1(db);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}
