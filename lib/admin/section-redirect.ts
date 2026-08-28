import { redirect } from "next/navigation";

import { hasPermission, type AdminSession, type PermissionKey } from "@/lib/auth/session";

export function redirectAdminSection<T extends Record<string, string>>(
  map: T,
  section: string | string[] | undefined,
  fallbackKey: keyof T,
): never {
  const key = typeof section === "string" ? section : undefined;
  const dest = (key && key in map ? map[key] : undefined) ?? map[fallbackKey];
  redirect(dest);
}

/**
 * First admin screen a session is allowed to see, in priority order. Used for
 * post-login landing (the dashboard bounces sessions that can't see its metric
 * cards) and as the fallback target for section-index redirects.
 */
export function resolveAdminLanding(session: AdminSession): string {
  const probe: Array<[PermissionKey, string]> = [
    ["cms.view", "/admin/home/hero"],
    ["careers.applications.view", "/admin/careers/applications"],
    ["careers.openings.manage", "/admin/careers/openings"],
    ["contact.view", "/admin/submissions"],
    ["users.manage", "/admin/settings/users"],
    ["roles.manage", "/admin/settings/roles"],
  ];
  for (const [key, dest] of probe) {
    if (hasPermission(session, key)) return dest;
  }
  return "/admin/forbidden";
}
