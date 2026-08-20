import "server-only";

import { getDb } from "@/lib/cloudflare-env";

import { verifyAdminToken } from "./jwt";
import { isPermissionKey, type AdminSession } from "./session";

export async function loadAdminSessionFromToken(token: string): Promise<AdminSession | null> {
  let payload: { sub: string };
  try {
    payload = await verifyAdminToken(token);
  } catch {
    return null;
  }

  const prisma = await getDb();
  const user = await prisma.adminUser.findUnique({
    where: { id: payload.sub },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });

  if (!user?.role) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: {
      id: user.role.id,
      name: user.role.name,
      isSystem: user.role.isSystem,
    },
    permissions: user.role.permissions
      .map((row) => row.permission.key)
      .filter(isPermissionKey),
  };
}
