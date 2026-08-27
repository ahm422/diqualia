import { PERMISSION_KEYS, type PermissionKey } from "@/lib/auth/session";

export type PermissionGroup = "CMS" | "Careers" | "Contact" | "Users & Roles";

export type PermissionCatalogEntry = {
  key: PermissionKey;
  label: string;
  group: PermissionGroup;
};

/**
 * Human-readable label + group for every permission key. Written in display order.
 * The `satisfies` clause is the exhaustiveness check: a new key added to
 * PERMISSION_KEYS without an entry here (or an entry for a key that no longer
 * exists) is a compile error.
 */
const CATALOG_BY_KEY = {
  "cms.view": { label: "View CMS content", group: "CMS" },
  "cms.edit": { label: "Edit CMS content", group: "CMS" },
  "content.create": { label: "Create content", group: "CMS" },
  "content.edit": { label: "Edit content (legacy)", group: "CMS" },
  "content.delete": { label: "Delete content", group: "CMS" },
  "content.publish": { label: "Publish content", group: "CMS" },
  "careers.openings.manage": { label: "Manage job openings", group: "Careers" },
  "careers.applications.view": { label: "View job applications", group: "Careers" },
  "careers.applications.manage": {
    label: "Manage job applications (status, notes)",
    group: "Careers",
  },
  "applications.pii": {
    label: "Access applicant PII (unmask CNIC, download resume/photo)",
    group: "Careers",
  },
  "contact.view": { label: "View contact submissions", group: "Contact" },
  "contact.manage": {
    label: "Manage contact submissions (mark read / delete)",
    group: "Contact",
  },
  "users.manage": { label: "Manage admin users", group: "Users & Roles" },
  "users.delete": { label: "Delete admin users", group: "Users & Roles" },
  "roles.manage": { label: "Manage roles", group: "Users & Roles" },
} satisfies Record<PermissionKey, { label: string; group: PermissionGroup }>;

export const PERMISSION_CATALOG: PermissionCatalogEntry[] = (
  Object.keys(CATALOG_BY_KEY) as PermissionKey[]
).map((key) => ({ key, ...CATALOG_BY_KEY[key] }));

// Runtime guard: catalog and key tuple stay the same size.
if (PERMISSION_CATALOG.length !== PERMISSION_KEYS.length) {
  throw new Error(
    `PERMISSION_CATALOG (${PERMISSION_CATALOG.length}) and PERMISSION_KEYS (${PERMISSION_KEYS.length}) are out of sync`,
  );
}
