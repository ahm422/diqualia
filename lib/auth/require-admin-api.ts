import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { loadAdminSessionFromToken } from "./load-admin-session";
import { COOKIE_NAME, hasPermission, type AdminSession, type PermissionKey } from "./session";

export async function requireAdminApi(): Promise<AdminSession | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await loadAdminSessionFromToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return session;
}

export async function requirePermissionApi(
  key: PermissionKey,
): Promise<AdminSession | NextResponse> {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  if (!hasPermission(session, key)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
