import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getPrisma } from "@/lib/prisma";

export function getEnv() {
  return getCloudflareContext().env;
}

export function getDb() {
  return getPrisma(getCloudflareContext().env.DB);
}
