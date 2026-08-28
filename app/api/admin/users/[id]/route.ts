import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { ROLE_IDS } from "@/lib/auth/rbac-ids";
import {
  ADMIN_USER_PUBLIC_SELECT,
  countRolesManageHolders,
  countSuperAdminUsers,
  isSuperAdminSession,
  jsonError,
  roleGrantsRolesManage,
} from "@/lib/auth/rbac";
import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { userPatchSchema } from "@/lib/schemas/admin/users";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("users.manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Invalid id", 400);

  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: ADMIN_USER_PUBLIC_SELECT,
  });
  if (!user) return jsonError("Not found", 404);
  return NextResponse.json(user);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("users.manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Invalid id", 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = userPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  const nextRoleId = parsed.data.roleId ?? existing.roleId;
  const actorIsSuper = isSuperAdminSession(session);

  if (nextRoleId === ROLE_IDS.super_admin && !actorIsSuper) {
    return jsonError("Cannot assign the super_admin role", 400);
  }
  if (existing.roleId === ROLE_IDS.super_admin && nextRoleId !== ROLE_IDS.super_admin) {
    if (!actorIsSuper) {
      return jsonError("Cannot change a super_admin user", 400);
    }
    const remaining = await countSuperAdminUsers(prisma);
    if (remaining <= 1) {
      return jsonError("Cannot demote the last super_admin", 400);
    }
  }

  if (parsed.data.roleId) {
    const role = await prisma.role.findUnique({ where: { id: parsed.data.roleId } });
    if (!role) return jsonError("Role not found", 400);
  }

  // Don't let a role change strip the last roles.manage holder.
  if (parsed.data.roleId && parsed.data.roleId !== existing.roleId) {
    const losesRolesManage =
      (await roleGrantsRolesManage(prisma, existing.roleId)) &&
      !(await roleGrantsRolesManage(prisma, parsed.data.roleId));
    if (losesRolesManage && (await countRolesManageHolders(prisma)) <= 1) {
      return jsonError("Cannot remove the last roles.manage holder", 400);
    }
  }

  if (parsed.data.email && parsed.data.email !== existing.email) {
    const conflict = await prisma.adminUser.findUnique({
      where: { email: parsed.data.email },
    });
    if (conflict) return jsonError("email already exists", 400);
  }

  const user = await prisma.adminUser.update({
    where: { id },
    data: {
      ...(parsed.data.email ? { email: parsed.data.email } : {}),
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.roleId ? { roleId: parsed.data.roleId } : {}),
      ...(parsed.data.password
        ? { passwordHash: await hashPassword(parsed.data.password) }
        : {}),
    },
    select: ADMIN_USER_PUBLIC_SELECT,
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("users.delete");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Invalid id", 400);

  if (id === session.id) return jsonError("Cannot delete your own user", 400);

  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  if (existing.roleId === ROLE_IDS.super_admin) {
    const remaining = await countSuperAdminUsers(prisma);
    if (remaining <= 1) {
      return jsonError("Cannot delete the last super_admin", 400);
    }
  }

  if (await roleGrantsRolesManage(prisma, existing.roleId)) {
    if ((await countRolesManageHolders(prisma)) <= 1) {
      return jsonError("Cannot remove the last roles.manage holder", 400);
    }
  }

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
