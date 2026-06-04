-- AlterTable
ALTER TABLE "home_explore_cards" ADD COLUMN "visible" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "home_explore_section" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "home_explore_section_pkey" PRIMARY KEY ("id")
);
