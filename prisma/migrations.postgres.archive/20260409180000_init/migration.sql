-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "name" TEXT,
    "message" TEXT,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- Row Level Security (Supabase): API writes to leads via Prisma use DB role that bypasses RLS;
-- anon/authenticated JWT clients cannot read or write leads directly.
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
ON "profiles"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON "profiles"
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON "profiles"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
