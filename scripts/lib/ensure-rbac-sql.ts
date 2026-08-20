import { PERMISSION_IDS, ROLE_IDS } from "@/lib/auth/rbac-ids";

/** Safety net if 0007_rbac.sql was somehow skipped. Migration is the source of truth. */
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
    ('${PERMISSION_IDS["applications.pii"]}', 'applications.pii');

INSERT OR IGNORE INTO "roles" ("id", "name", "is_system", "created_at", "updated_at") VALUES
    ('${ROLE_IDS.super_admin}', 'super_admin', 1, ${now}, ${now}),
    ('${ROLE_IDS.admin}', 'admin', 1, ${now}, ${now}),
    ('${ROLE_IDS.editor}', 'editor', 1, ${now}, ${now});

INSERT OR IGNORE INTO "role_permissions" ("role_id", "permission_id") VALUES
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["content.create"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["content.edit"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["content.delete"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["content.publish"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["users.manage"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["users.delete"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["roles.manage"]}'),
    ('${ROLE_IDS.super_admin}', '${PERMISSION_IDS["applications.pii"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["content.create"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["content.edit"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["content.delete"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["content.publish"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["users.manage"]}'),
    ('${ROLE_IDS.admin}', '${PERMISSION_IDS["applications.pii"]}'),
    ('${ROLE_IDS.editor}', '${PERMISSION_IDS["content.create"]}'),
    ('${ROLE_IDS.editor}', '${PERMISSION_IDS["content.edit"]}');
`.trim();
}
