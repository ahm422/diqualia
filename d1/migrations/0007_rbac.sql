-- Role-based access control: roles, permissions, admin_users.role_id
-- Fixed UUIDs must match lib/auth/rbac-ids.ts

CREATE TABLE "roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "is_system" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

CREATE TABLE "permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL
);

CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

CREATE TABLE "role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    PRIMARY KEY ("role_id", "permission_id"),
    FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
    FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
);

INSERT INTO "permissions" ("id", "key") VALUES
    ('11111111-1111-4111-8111-111111111001', 'content.create'),
    ('11111111-1111-4111-8111-111111111002', 'content.edit'),
    ('11111111-1111-4111-8111-111111111003', 'content.delete'),
    ('11111111-1111-4111-8111-111111111004', 'content.publish'),
    ('11111111-1111-4111-8111-111111111005', 'users.manage'),
    ('11111111-1111-4111-8111-111111111006', 'users.delete'),
    ('11111111-1111-4111-8111-111111111007', 'roles.manage');

INSERT INTO "roles" ("id", "name", "is_system", "created_at", "updated_at") VALUES
    ('22222222-2222-4222-8222-222222222001', 'super_admin', 1, datetime('now'), datetime('now')),
    ('22222222-2222-4222-8222-222222222002', 'admin', 1, datetime('now'), datetime('now')),
    ('22222222-2222-4222-8222-222222222003', 'editor', 1, datetime('now'), datetime('now'));

-- super_admin: all seven keys
INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
    ('22222222-2222-4222-8222-222222222001', '11111111-1111-4111-8111-111111111001'),
    ('22222222-2222-4222-8222-222222222001', '11111111-1111-4111-8111-111111111002'),
    ('22222222-2222-4222-8222-222222222001', '11111111-1111-4111-8111-111111111003'),
    ('22222222-2222-4222-8222-222222222001', '11111111-1111-4111-8111-111111111004'),
    ('22222222-2222-4222-8222-222222222001', '11111111-1111-4111-8111-111111111005'),
    ('22222222-2222-4222-8222-222222222001', '11111111-1111-4111-8111-111111111006'),
    ('22222222-2222-4222-8222-222222222001', '11111111-1111-4111-8111-111111111007');

-- admin: all except users.delete and roles.manage
INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
    ('22222222-2222-4222-8222-222222222002', '11111111-1111-4111-8111-111111111001'),
    ('22222222-2222-4222-8222-222222222002', '11111111-1111-4111-8111-111111111002'),
    ('22222222-2222-4222-8222-222222222002', '11111111-1111-4111-8111-111111111003'),
    ('22222222-2222-4222-8222-222222222002', '11111111-1111-4111-8111-111111111004'),
    ('22222222-2222-4222-8222-222222222002', '11111111-1111-4111-8111-111111111005');

-- editor: content.create + content.edit
INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
    ('22222222-2222-4222-8222-222222222003', '11111111-1111-4111-8111-111111111001'),
    ('22222222-2222-4222-8222-222222222003', '11111111-1111-4111-8111-111111111002');

ALTER TABLE "admin_users" ADD COLUMN "name" TEXT;
ALTER TABLE "admin_users" ADD COLUMN "role_id" TEXT;

UPDATE "admin_users"
SET "role_id" = '22222222-2222-4222-8222-222222222001'
WHERE "role_id" IS NULL;

-- SQLite cannot add a NOT NULL FK via ALTER; rebuild the table.
-- defer_foreign_keys keeps refresh_tokens.admin_user_id valid across DROP+RENAME.
PRAGMA foreign_keys = OFF;
PRAGMA defer_foreign_keys = TRUE;

CREATE TABLE "admin_users_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    FOREIGN KEY ("role_id") REFERENCES "roles"("id")
);

INSERT INTO "admin_users_new" ("id", "email", "name", "password_hash", "role_id", "created_at", "updated_at")
SELECT "id", "email", "name", "password_hash", "role_id", "created_at", "updated_at"
FROM "admin_users";

DROP TABLE "admin_users";
ALTER TABLE "admin_users_new" RENAME TO "admin_users";

CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

PRAGMA foreign_keys = ON;
