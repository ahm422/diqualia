import "server-only";

import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { ROLE_IDS } from "@/lib/auth/rbac-ids";
import {
  ADMIN_USER_PUBLIC_SELECT,
  isSuperAdminSession,
  jsonError,
} from "@/lib/auth/rbac";
import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { userCreateSchema } from "@/lib/schemas/admin/users";

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("users.manage");
  if (session instanceof NextResponse) return session;

  const [users, roles] = await Promise.all([
    prisma.adminUser.findMany({
      select: ADMIN_USER_PUBLIC_SELECT,
      orderBy: { email: "asc" },
    }),
    prisma.role.findMany({
      select: { id: true, name: true, isSystem: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const assignableRoles = isSuperAdminSession(session)
    ? roles
    : roles.filter((role) => role.id !== ROLE_IDS.super_admin);

  return NextResponse.json({ users, roles: assignableRoles });
}

export async function POST(request: Request) {
  const prisma = await getDb();
  const session = await requirePermissionApi("users.manage");
  if (session instanceof NextResponse) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const { email, name, roleId, password } = parsed.data;

  if (roleId === ROLE_IDS.super_admin && !isSuperAdminSession(session)) {
    return jsonError("Cannot assign the super_admin role", 400);
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) return jsonError("Role not found", 400);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return jsonError("email already exists", 400);

  const user = await prisma.adminUser.create({
    data: {
      email,
      name: name ?? null,
      roleId,
      passwordHash: await hashPassword(password),
    },
    select: ADMIN_USER_PUBLIC_SELECT,
  });

  return NextResponse.json(user, { status: 201 });
}
