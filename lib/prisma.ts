import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

import { pgConnectionString, pgSslOption } from "./pgSsl";

declare global {
  // eslint-disable-next-line no-var
  var __prismaPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

function getPool() {
  const ssl = pgSslOption();
  const common = {
    connectionString: pgConnectionString(process.env.DATABASE_URL),
    ...(ssl ? { ssl } : {}),
  };

  if (process.env.NODE_ENV === "production") {
    return new Pool(common);
  }

  if (!global.__prismaPool) {
    global.__prismaPool = new Pool(common);
  }

  return global.__prismaPool;
}

export const prisma =
  global.__prismaClient ??
  new PrismaClient({
    adapter: new PrismaPg(getPool()),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.__prismaClient = prisma;

