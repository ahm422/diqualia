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
  "cms.view",
  "cms.edit",
  "careers.openings.manage",
  "careers.applications.view",
  "careers.applications.manage",
  "contact.view",
  "contact.manage",
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

/**
 * Equivalence map: asking for KEY is also satisfied if the session holds ANY key
 * in the array. The legacy `content.*` keys and the newer `cms.*` keys are two
 * names for the same capability, so the mapping is bidirectional — a role that
 * only holds `cms.edit` passes the legacy `content.edit` gate, and an older
 * custom role that only holds `content.edit` passes the `cms.edit`-guarded API
 * routes.
 *
 * NOTE: `content.publish` is intentionally NOT aliased to `cms.edit` — blog
 * publishing requires `content.publish` in addition to `cms.edit` (see
 * lib/auth/permission-catalog.ts).
 */
const PERMISSION_ALIASES: Partial<Record<string, string[]>> = {
  "content.create": ["cms.edit"],
  "content.edit": ["cms.edit"],
  "content.delete": ["cms.edit"],
  "content.view": ["cms.view", "cms.edit"], // defensive: no such key today
  "cms.edit": ["content.edit", "content.create", "content.delete"],
  "cms.view": ["cms.edit", "content.edit", "content.view"],
};

export function hasPermission(session: AdminSession, key: PermissionKey): boolean {
  const held = session.permissions as readonly string[];
  if (held.includes(key)) return true;
  const aliases = PERMISSION_ALIASES[key];
  return aliases?.some((k) => held.includes(k)) ?? false;
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
