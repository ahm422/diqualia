import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { loadAdminSessionFromToken } from "./load-admin-session";
import { COOKIE_NAME, hasPermission, type AdminSession, type PermissionKey } from "./session";

export async function requireAdmin(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) redirect("/admin/login");

  const session = await loadAdminSessionFromToken(token);
  if (!session) redirect("/admin/login");

  return session;
}

export async function requirePermission(key: PermissionKey): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!hasPermission(session, key)) redirect("/admin/forbidden");
  return session;
}
