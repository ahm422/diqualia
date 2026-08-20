import "server-only";

import { ROLE_IDS } from "@/lib/auth/rbac-ids";
import { isSuperAdminSession } from "@/lib/auth/rbac";
import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";

import type { RoleOption } from "./UserEditor";

export async function loadAssignableRoles(currentRoleId?: string): Promise<RoleOption[]> {
  const session = await requirePermission("users.manage");
  const prisma = await getDb();
  const roles = await prisma.role.findMany({
    select: { id: true, name: true, isSystem: true },
    orderBy: { name: "asc" },
  });

  const assignable = isSuperAdminSession(session)
    ? roles
    : roles.filter((role) => role.id !== ROLE_IDS.super_admin);

  if (currentRoleId && !assignable.some((role) => role.id === currentRoleId)) {
    const current = roles.find((role) => role.id === currentRoleId);
    if (current) return [...assignable, current];
  }

  return assignable;
}
