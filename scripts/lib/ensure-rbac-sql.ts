import { PERMISSION_IDS, ROLE_IDS } from "@/lib/auth/rbac-ids";

/**
 * Safety net if 0007_rbac.sql / 0011_rbac_expansion.sql were somehow skipped.
 * Migrations are the source of truth. Additive only (INSERT OR IGNORE, no DELETE).
 */
export function ensureRbacSql(): string {
  const now = "datetime('now')";
  return `
INSERT OR IGNORE INTO "permissions" ("id", "key") VALUES
    ('${PERMISSION_IDS["content.create"]}', 'content.create'),
    ('${PERMISSION_IDS["content.edit"]}', 'content.edit'),
    ('${PERMISSION_IDS["content.delete"]}', 'content.delete'),
    ('${PERMISSION_IDS["content.publish"]}', 'content.publish'),
    ('${PERMISSION_IDS["users.manage"]}', 'users.manage'),
    ('${PERMISSION_IDS["users.delete"]}', 'users.delete'),
    ('${PERMISSION_IDS["roles.manage"]}', 'roles.manage'),
    ('${PERMISSION_IDS["applications.pii"]}', 'applications.pii'),
    ('${PERMISSION_IDS["cms.view"]}', 'cms.view'),
    ('${PERMISSION_IDS["cms.edit"]}', 'cms.edit'),
    ('${PERMISSION_IDS["careers.openings.manage"]}', 'careers.openings.manage'),
    ('${PERMISSION_IDS["careers.applications.view"]}', 'careers.applications.view'),
    ('${PERMISSION_IDS["careers.applications.manage"]}', 'careers.applications.manage'),
    ('${PERMISSION_IDS["contact.view"]}', 'contact.view'),
    ('${PERMISSION_IDS["contact.manage"]}', 'contact.manage');

INSERT OR IGNORE INTO "roles" ("id", "name", "is_system", "created_at", "updated_at") VALUES
    ('${ROLE_IDS.super_admin}', 'super_admin', 1, ${now}, ${now}),
    ('${ROLE_IDS.admin}', 'admin', 1, ${now}, ${now}),
    ('${ROLE_IDS.editor}', 'editor', 1, ${now}, ${now}),
    ('${ROLE_IDS.hr}', 'hr', 1, ${now}, ${now}),
    ('${ROLE_IDS.employee}', 'employee', 1, ${now}, ${now});

INSERT OR IGNORE INTO "role_permissions" ("role_id", "permission_id") VALUES
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["content.create"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["content.edit"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["content.delete"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["content.publish"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["users.manage"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["users.delete"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["roles.manage"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["applications.pii"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["cms.view"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["cms.edit"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["careers.openings.manage"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["careers.applications.view"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["careers.applications.manage"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["contact.view"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["contact.manage"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["content.create"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["content.edit"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["content.delete"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["content.publish"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["users.manage"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["applications.pii"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["roles.manage"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["cms.view"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["cms.edit"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["careers.openings.manage"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["careers.applications.view"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["careers.applications.manage"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["contact.view"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["contact.manage"]}'),
    ('${ROLE_IDS.hr}', '${PERMISSION_IDS["careers.openings.manage"]}'),
    ('${ROLE_IDS.hr}', '${PERMISSION_IDS["careers.applications.view"]}'),
    ('${ROLE_IDS.hr}', '${PERMISSION_IDS["careers.applications.manage"]}'),
    ('${ROLE_IDS.hr}', '${PERMISSION_IDS["applications.pii"]}'),
    ('${ROLE_IDS.hr}', '${PERMISSION_IDS["contact.view"]}'),
    ('${ROLE_IDS.hr}', '${PERMISSION_IDS["contact.manage"]}'),
    ('${ROLE_IDS.editor}', '${PERMISSION_IDS["content.create"]}'),
    ('${ROLE_IDS.editor}', '${PERMISSION_IDS["content.edit"]}'),
    ('${ROLE_IDS.editor}', '${PERMISSION_IDS["cms.view"]}'),
    ('${ROLE_IDS.editor}', '${PERMISSION_IDS["cms.edit"]}'),
    ('${ROLE_IDS.editor}', '${PERMISSION_IDS["content.publish"]}');
`.trim();
}
