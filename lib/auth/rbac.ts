import "server-only";

import { NextResponse } from "next/server";

import { PERMISSION_IDS, ROLE_IDS, SYSTEM_ROLE_NAMES } from "@/lib/auth/rbac-ids";
import type { AdminSession } from "@/lib/auth/session";
import type { PrismaClient } from "@/lib/generated/prisma/client";

export const ADMIN_USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  roleId: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true, isSystem: true } },
} as const;

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function isSuperAdminSession(session: AdminSession): boolean {
  return session.role.name === "super_admin";
}

export async function countSuperAdminUsers(prisma: PrismaClient): Promise<number> {
  return prisma.adminUser.count({ where: { roleId: ROLE_IDS.super_admin } });
}

/** Does this role grant roles.manage (system super_admin/admin, or a custom role)? */
export async function roleGrantsRolesManage(
  prisma: PrismaClient,
  roleId: string,
): Promise<boolean> {
  const row = await prisma.rolePermission.findFirst({
    where: { roleId, permissionId: PERMISSION_IDS["roles.manage"] },
    select: { roleId: true },
  });
  return row !== null;
}

/** Number of admin users whose role grants roles.manage — used to block removing the last one. */
export async function countRolesManageHolders(prisma: PrismaClient): Promise<number> {
  return prisma.adminUser.count({
    where: {
      role: { permissions: { some: { permissionId: PERMISSION_IDS["roles.manage"] } } },
    },
  });
}

export function isSystemRoleName(name: string): boolean {
  return (SYSTEM_ROLE_NAMES as readonly string[]).includes(name);
}

export async function loadRoleOrNull(prisma: PrismaClient, id: string) {
  return prisma.role.findUnique({
    where: { id },
    include: { permissions: { include: { permission: true } } },
  });
}

export function roleToJson(
  role: NonNullable<Awaited<ReturnType<typeof loadRoleOrNull>>>,
) {
  return {
    id: role.id,
    name: role.name,
    isSystem: role.isSystem,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    permissionKeys: role.permissions.map((row) => row.permission.key),
  };
}
