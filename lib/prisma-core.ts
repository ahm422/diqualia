import { PrismaD1 } from "@prisma/adapter-d1";

import { PrismaClient } from "@/lib/generated/prisma/client";

declare global {
  var __prismaClient: PrismaClient | undefined;
}

// tsx scripts (seed/ingest) run outside a Next runtime and cannot load the
// generated `./query_compiler_fast_bg.wasm?module` import (a bundler-only
// convention). Under Next.js dev the Turbopack bundler handles that import
// natively, so the override is only applied outside NEXT_RUNTIME.
const needsNodeWasmOverride =
  typeof process !== "undefined" && !!process.versions?.node && !process.env.NEXT_RUNTIME;

export function createPrismaClient(db: D1Database) {
  if (global.__prismaClient) return global.__prismaClient;
  const adapter = new PrismaD1(db);
  global.__prismaClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    __internal: needsNodeWasmOverride
      ? {
          configOverride: (config) => ({
            ...config,
            compilerWasm: {
              ...config.compilerWasm,
              getQueryCompilerWasmModule: async () => {
                const { readFile } = await import("node:fs/promises");
                const wasmPath = new URL(
                  "./generated/prisma/internal/query_compiler_fast_bg.wasm",
                  import.meta.url,
                );
                const bytes = await readFile(wasmPath);
                return new WebAssembly.Module(bytes);
              },
            },
          }),
        }
      : undefined,
  });
  return global.__prismaClient;
}
