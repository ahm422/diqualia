import { PERMISSION_KEYS, type PermissionKey } from "@/lib/auth/session";

export type PermissionGroup = "CMS" | "Careers" | "Contact" | "Users & Roles";

export type PermissionCatalogEntry = {
  key: PermissionKey;
  label: string;
  description: string;
  group: PermissionGroup;
};

/**
 * Human-readable label + one-line description + group for every permission key,
 * written in display order. The `satisfies` clause is the exhaustiveness check:
 * a new key added to PERMISSION_KEYS without an entry here (or an entry for a key
 * that no longer exists) is a compile error.
 */
const CATALOG_BY_KEY = {
  "cms.view": {
    label: "View CMS content",
    description: "Open every CMS editor screen (Home, About, Services, Blog, …) read-only.",
    group: "CMS",
  },
  "cms.edit": {
    label: "Edit CMS content",
    description: "Create, update, delete, and publish any CMS content, and upload media.",
    group: "CMS",
  },
  "content.create": {
    label: "Create content (legacy)",
    description: "Deprecated — superseded by cms.edit. Kept for older custom roles.",
    group: "CMS",
  },
  "content.edit": {
    label: "Edit content (legacy)",
    description: "Deprecated — superseded by cms.edit. Kept for older custom roles.",
    group: "CMS",
  },
  "content.delete": {
    label: "Delete content (legacy)",
    description: "Deprecated — superseded by cms.edit. Kept for older custom roles.",
    group: "CMS",
  },
  "content.publish": {
    label: "Publish content",
    description: "Required to move a blog post from draft to published (in addition to cms.edit).",
    group: "CMS",
  },
  "careers.openings.manage": {
    label: "Manage job openings",
    description: "Create, edit, reorder, and remove the roles listed on /careers.",
    group: "Careers",
  },
  "careers.applications.view": {
    label: "View job applications",
    description: "Open the Applications inbox and read submissions (CNIC stays masked).",
    group: "Careers",
  },
  "careers.applications.manage": {
    label: "Manage job applications",
    description: "Change an application's status and notes.",
    group: "Careers",
  },
  "applications.pii": {
    label: "Access applicant PII",
    description: "Unmask CNIC and download applicant resume, photo, and the CSV export.",
    group: "Careers",
  },
  "contact.view": {
    label: "View contact submissions",
    description: "Open the Submissions inbox and read /contact leads.",
    group: "Contact",
  },
  "contact.manage": {
    label: "Manage contact submissions",
    description: "Mark submissions read/unread and delete them.",
    group: "Contact",
  },
  "users.manage": {
    label: "Manage admin users",
    description: "Create and edit admin users and assign their roles.",
    group: "Users & Roles",
  },
  "users.delete": {
    label: "Delete admin users",
    description: "Permanently remove an admin user account.",
    group: "Users & Roles",
  },
  "roles.manage": {
    label: "Manage roles",
    description: "Create, edit, and delete custom roles and their permission sets.",
    group: "Users & Roles",
  },
} satisfies Record<PermissionKey, { label: string; description: string; group: PermissionGroup }>;

export const PERMISSION_CATALOG: PermissionCatalogEntry[] = (
  Object.keys(CATALOG_BY_KEY) as PermissionKey[]
).map((key) => ({ key, ...CATALOG_BY_KEY[key] }));

/** Groups in the order the Role-builder renders them (first appearance in the catalog). */
export const PERMISSION_GROUP_ORDER: PermissionGroup[] = PERMISSION_CATALOG.reduce<PermissionGroup[]>(
  (acc, entry) => (acc.includes(entry.group) ? acc : [...acc, entry.group]),
  [],
);

/** Catalog entries bucketed by group, each bucket in catalog order. */
export function permissionCatalogByGroup(): Array<{
  group: PermissionGroup;
  entries: PermissionCatalogEntry[];
}> {
  return PERMISSION_GROUP_ORDER.map((group) => ({
    group,
    entries: PERMISSION_CATALOG.filter((entry) => entry.group === group),
  }));
}

// Runtime guard: catalog and key tuple stay the same size.
if (PERMISSION_CATALOG.length !== PERMISSION_KEYS.length) {
  throw new Error(
    `PERMISSION_CATALOG (${PERMISSION_CATALOG.length}) and PERMISSION_KEYS (${PERMISSION_KEYS.length}) are out of sync`,
  );
}
