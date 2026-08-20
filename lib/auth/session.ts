import type { NextRequest, NextResponse } from "next/server";

export const COOKIE_NAME = "dq_admin_token";

export const PERMISSION_KEYS = [
  "content.create",
  "content.edit",
  "content.delete",
  "content.publish",
  "users.manage",
  "users.delete",
  "roles.manage",
  "applications.pii",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type AdminSession = {
  id: string;
  email: string;
  name: string | null;
  role: { id: string; name: string; isSystem: boolean };
  permissions: PermissionKey[];
};

export function isPermissionKey(value: string): value is PermissionKey {
  return (PERMISSION_KEYS as readonly string[]).includes(value);
}

export function hasPermission(session: AdminSession, key: PermissionKey): boolean {
  return session.permissions.includes(key);
}

const BASE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export function setSessionCookie(res: NextResponse, token: string) {
  const secure =
    process.env.COOKIE_SECURE === "true"
      ? true
      : process.env.COOKIE_SECURE === "false"
        ? false
        : process.env.NODE_ENV === "production";
  res.cookies.set(COOKIE_NAME, token, {
    ...BASE_OPTS,
    secure,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", { ...BASE_OPTS, maxAge: 0 });
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value ?? null;
}
