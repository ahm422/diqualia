-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "name" TEXT,
    "message" TEXT,
    "source" TEXT,
    "read" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "site_name" TEXT NOT NULL,
    "logo_url" TEXT
);

-- CreateTable
CREATE TABLE "nav_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "href" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "visible" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "cta_buttons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "visible" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "home_hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL,
    "headline_line3" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "btn1_label" TEXT NOT NULL,
    "btn1_href" TEXT NOT NULL,
    "btn2_label" TEXT NOT NULL,
    "btn2_href" TEXT NOT NULL,
    "stat1_label" TEXT NOT NULL,
    "stat1_value" TEXT NOT NULL,
    "stat2_label" TEXT NOT NULL,
    "stat2_value" TEXT NOT NULL,
    "stat3_label" TEXT NOT NULL,
    "stat3_value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "home_marquee_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "home_explore_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "href" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "section_label" TEXT,
    "order" INTEGER NOT NULL,
    "visible" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "home_explore_section" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL,
    "body" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "home_where_next" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "btn_label" TEXT NOT NULL,
    "btn_href" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "about_hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "about_built_for_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "about_where_next" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "btn1_label" TEXT NOT NULL,
    "btn1_href" TEXT NOT NULL,
    "btn2_label" TEXT NOT NULL,
    "btn2_href" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "services_page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "stat1_value" TEXT NOT NULL,
    "stat1_label" TEXT NOT NULL,
    "stat2_value" TEXT NOT NULL,
    "stat2_label" TEXT NOT NULL,
    "stat3_value" TEXT NOT NULL,
    "stat3_label" TEXT NOT NULL,
    "stat4_value" TEXT NOT NULL,
    "stat4_label" TEXT NOT NULL,
    "cta_eyebrow" TEXT NOT NULL,
    "cta_headline" TEXT NOT NULL,
    "cta_body" TEXT NOT NULL,
    "cta_btn1_label" TEXT NOT NULL,
    "cta_btn1_href" TEXT NOT NULL,
    "cta_email_href" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "service_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tab_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "card_title" TEXT,
    "card_body" TEXT
);

-- CreateTable
CREATE TABLE "service_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "section_id" INTEGER NOT NULL,
    "group_label" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "order" INTEGER NOT NULL,
    CONSTRAINT "service_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "service_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "process_page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL,
    "headline_line3" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "where_next_eyebrow" TEXT NOT NULL,
    "where_next_title1" TEXT NOT NULL,
    "where_next_title2" TEXT NOT NULL,
    "where_next_body" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "process_steps" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "step_label" TEXT NOT NULL,
    "step_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "industries_page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sectors_label" TEXT NOT NULL,
    "sectors_description" TEXT NOT NULL,
    "sidebar_label" TEXT NOT NULL,
    "sidebar_copy" TEXT NOT NULL,
    "where_next_eyebrow" TEXT NOT NULL,
    "where_next_title1" TEXT NOT NULL,
    "where_next_title2" TEXT NOT NULL,
    "where_next_body" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "industry_sectors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "visible" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "story_page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL,
    "headline_line3" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "dx_num1" TEXT NOT NULL,
    "dx_title1" TEXT NOT NULL,
    "dx_body1" TEXT NOT NULL,
    "dx_num2" TEXT NOT NULL,
    "dx_title2" TEXT NOT NULL,
    "dx_body2" TEXT NOT NULL,
    "dx_tagline" TEXT NOT NULL,
    "manifesto_items" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "contact_page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "email_label" TEXT NOT NULL,
    "email_type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_copy" TEXT NOT NULL,
    "what_to_include_items" TEXT NOT NULL,
    "expectation_eyebrow" TEXT NOT NULL,
    "expectation_text" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "footer_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "tagline1" TEXT NOT NULL,
    "tagline2" TEXT NOT NULL,
    "copyright" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "all_rights" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "footer_nav_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "href" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "service_sections_tab_id_key" ON "service_sections"("tab_id");
