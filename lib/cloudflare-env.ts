import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getPrisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

export function getEnv() {
  return getCloudflareContext().env;
}

export function getDb() {
  return getPrisma(getCloudflareContext().env.DB);
}

export function getR2() {
  return getStorage(getCloudflareContext().env.R2);
}
