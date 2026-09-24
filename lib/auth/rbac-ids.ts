/** Fixed UUIDs from d1/migrations/0007_rbac.sql, 0008_career_application_fields.sql, and 0011_rbac_expansion.sql — keep in sync. */

export const PERMISSION_IDS = {
  "content.create": "11111111-1111-4111-8111-111111111001",
  "content.edit": "11111111-1111-4111-8111-111111111002",
  "content.delete": "11111111-1111-4111-8111-111111111003",
  "content.publish": "11111111-1111-4111-8111-111111111004",
  "users.manage": "11111111-1111-4111-8111-111111111005",
  "users.delete": "11111111-1111-4111-8111-111111111006",
  "roles.manage": "11111111-1111-4111-8111-111111111007",
  "applications.pii": "11111111-1111-4111-8111-111111111008",
  "cms.view": "11111111-1111-4111-8111-111111111009",
  "cms.edit": "11111111-1111-4111-8111-111111111010",
  "careers.openings.manage": "11111111-1111-4111-8111-111111111011",
  "careers.applications.view": "11111111-1111-4111-8111-111111111012",
  "careers.applications.manage": "11111111-1111-4111-8111-111111111013",
  "contact.view": "11111111-1111-4111-8111-111111111014",
  "contact.manage": "11111111-1111-4111-8111-111111111015",
} as const;

export const ROLE_IDS = {
  super_admin: "22222222-2222-4222-8222-222222222001",
  admin: "22222222-2222-4222-8222-222222222002",
  editor: "22222222-2222-4222-8222-222222222003",
  hr: "22222222-2222-4222-8222-222222222004",
  employee: "22222222-2222-4222-8222-222222222005",
} as const;

export const SYSTEM_ROLE_NAMES = ["super_admin", "admin", "editor", "hr", "employee"] as const;
