import "server-only";

import { getDb } from "@/lib/cloudflare-env";

import { verifyPortalToken } from "./portal-jwt";
import type { PortalSession } from "./session";

export async function loadPortalSessionFromToken(token: string): Promise<PortalSession | null> {
  let payload: { sub: string };
  try {
    payload = await verifyPortalToken(token);
  } catch {
    return null;
  }

  const prisma = await getDb();
  const user = await prisma.applicantUser.findUnique({ where: { id: payload.sub } });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    mustChangePassword: user.mustChangePassword,
  };
}
