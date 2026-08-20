import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { PERMISSION_IDS } from "@/lib/auth/rbac-ids";
import { isSystemRoleName, jsonError, loadRoleOrNull, roleToJson } from "@/lib/auth/rbac";
import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { roleWriteSchema } from "@/lib/schemas/admin/roles";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("roles.manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Invalid id", 400);

  const role = await loadRoleOrNull(prisma, id);
  if (!role) return jsonError("Not found", 404);
  return NextResponse.json(roleToJson(role));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("roles.manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Invalid id", 400);

  const existing = await loadRoleOrNull(prisma, id);
  if (!existing) return jsonError("Not found", 404);
  if (existing.isSystem) return jsonError("Cannot modify a system role", 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = roleWriteSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const { name, permissionKeys } = parsed.data;
  if (isSystemRoleName(name)) {
    return jsonError("Role name collides with a system role", 400);
  }

  if (name !== existing.name) {
    const conflict = await prisma.role.findUnique({ where: { name } });
    if (conflict) return jsonError("name already exists", 400);
  }

  await prisma.rolePermission.deleteMany({ where: { roleId: id } });
  const role = await prisma.role.update({
    where: { id },
    data: {
      name,
      permissions: {
        create: permissionKeys.map((key) => ({
          permissionId: PERMISSION_IDS[key],
        })),
      },
    },
    include: { permissions: { include: { permission: true } } },
  });

  return NextResponse.json(roleToJson(role));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("roles.manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Invalid id", 400);

  const existing = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  if (!existing) return jsonError("Not found", 404);
  if (existing.isSystem) return jsonError("Cannot delete a system role", 400);
  if (existing._count.users > 0) {
    return jsonError("Unassign this role from users before deleting", 400);
  }

  await prisma.role.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
