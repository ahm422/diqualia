import "server-only";

import { createPrismaClient } from "@/lib/prisma-core";

export function getPrisma(db: D1Database) {
  return createPrismaClient(db);
}
