-- Drop Supabase RLS policies on profiles (safe on both Supabase and plain PG)
DROP POLICY IF EXISTS "profiles_select_own" ON "profiles";
DROP POLICY IF EXISTS "profiles_update_own" ON "profiles";
DROP POLICY IF EXISTS "profiles_insert_own" ON "profiles";

-- Drop profiles table (was coupled to Supabase auth.users)
DROP TABLE IF EXISTS "profiles";

-- Disable RLS on leads (app enforces access via JWT middleware + server-only Prisma)
ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");
