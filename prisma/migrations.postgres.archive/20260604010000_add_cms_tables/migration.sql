-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "site_name" TEXT NOT NULL,
    "logo_url" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nav_items" (
    "id" SERIAL NOT NULL,
    "href" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "nav_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cta_buttons" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,

    CONSTRAINT "cta_buttons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_hero" (
    "id" INTEGER NOT NULL DEFAULT 1,
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
    "stat3_value" TEXT NOT NULL,

    CONSTRAINT "home_hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_marquee_items" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "home_marquee_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_explore_cards" (
    "id" SERIAL NOT NULL,
    "href" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "section_label" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "home_explore_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_where_next" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "btn_label" TEXT NOT NULL,
    "btn_href" TEXT NOT NULL,

    CONSTRAINT "home_where_next_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_hero" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "about_hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_built_for_items" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "about_built_for_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_where_next" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "btn1_label" TEXT NOT NULL,
    "btn1_href" TEXT NOT NULL,
    "btn2_label" TEXT NOT NULL,
    "btn2_href" TEXT NOT NULL,

    CONSTRAINT "about_where_next_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services_page" (
    "id" INTEGER NOT NULL DEFAULT 1,
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
    "cta_email_href" TEXT NOT NULL,

    CONSTRAINT "services_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_sections" (
    "id" SERIAL NOT NULL,
    "tab_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "card_title" TEXT,
    "card_body" TEXT,

    CONSTRAINT "service_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_items" (
    "id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "group_label" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "service_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_page" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL,
    "headline_line3" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "where_next_eyebrow" TEXT NOT NULL,
    "where_next_title1" TEXT NOT NULL,
    "where_next_title2" TEXT NOT NULL,
    "where_next_body" TEXT NOT NULL,

    CONSTRAINT "process_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_steps" (
    "id" SERIAL NOT NULL,
    "step_label" TEXT NOT NULL,
    "step_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "process_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industries_page" (
    "id" INTEGER NOT NULL DEFAULT 1,
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
    "where_next_body" TEXT NOT NULL,

    CONSTRAINT "industries_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_sectors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "industry_sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_page" (
    "id" INTEGER NOT NULL DEFAULT 1,
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
    "manifesto_items" JSONB NOT NULL,

    CONSTRAINT "story_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_page" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "email_label" TEXT NOT NULL,
    "email_type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_copy" TEXT NOT NULL,
    "what_to_include_items" JSONB NOT NULL,
    "expectation_eyebrow" TEXT NOT NULL,
    "expectation_text" TEXT NOT NULL,

    CONSTRAINT "contact_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "tagline1" TEXT NOT NULL,
    "tagline2" TEXT NOT NULL,
    "copyright" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "all_rights" TEXT NOT NULL,

    CONSTRAINT "footer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_nav_items" (
    "id" SERIAL NOT NULL,
    "href" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "footer_nav_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_sections_tab_id_key" ON "service_sections"("tab_id");

-- AddForeignKey
ALTER TABLE "service_items" ADD CONSTRAINT "service_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "service_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
