import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getPrisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

export async function getEnv() {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return getPrisma(env.DB);
}

export async function getR2() {
  const { env } = await getCloudflareContext({ async: true });
  return getStorage(env.R2);
}

export async function getEmail() {
  const { env } = await getCloudflareContext({ async: true });
  return env.EMAIL;
}
