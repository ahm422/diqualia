import "server-only";

import { NextResponse } from "next/server";

import { PERMISSION_IDS } from "@/lib/auth/rbac-ids";
import { isSystemRoleName, jsonError, loadRoleOrNull, roleToJson } from "@/lib/auth/rbac";
import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { roleWriteSchema } from "@/lib/schemas/admin/roles";

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("roles.manage");
  if (session instanceof NextResponse) return session;

  const roles = await prisma.role.findMany({
    include: { permissions: { include: { permission: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(roles.map(roleToJson));
}

export async function POST(request: Request) {
  const prisma = await getDb();
  const session = await requirePermissionApi("roles.manage");
  if (session instanceof NextResponse) return session;

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

  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) return jsonError("name already exists", 400);

  const role = await prisma.role.create({
    data: {
      name,
      isSystem: false,
      permissions: {
        create: permissionKeys.map((key) => ({
          permissionId: PERMISSION_IDS[key],
        })),
      },
    },
    include: { permissions: { include: { permission: true } } },
  });

  return NextResponse.json(roleToJson(role), { status: 201 });
}
