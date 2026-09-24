-- Automatic chatbot knowledge-base sync (Cloudflare-native chatbot, workers/chatbot).
--
-- Every INSERT / UPDATE / DELETE on a public CMS table appends a row to
-- kb_sync_outbox. The diqualia-chatbot Worker's cron (every minute) sees
-- pending rows, re-indexes the changed content into Vectorize, and clears the
-- rows it covered. Works for every writer: admin panel, seed scripts,
-- `wrangler d1 execute`.
--
-- Private tables (leads, job_applications, admin_users, ...) have no triggers
-- and are never indexed.

CREATE TABLE IF NOT EXISTS kb_sync_outbox (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  op         TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- home_hero
CREATE TRIGGER IF NOT EXISTS kb_sync_home_hero_insert AFTER INSERT ON "home_hero"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('home_hero', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_home_hero_update AFTER UPDATE ON "home_hero"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('home_hero', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_home_hero_delete AFTER DELETE ON "home_hero"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('home_hero', 'delete');
END;

-- about_hero
CREATE TRIGGER IF NOT EXISTS kb_sync_about_hero_insert AFTER INSERT ON "about_hero"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('about_hero', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_about_hero_update AFTER UPDATE ON "about_hero"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('about_hero', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_about_hero_delete AFTER DELETE ON "about_hero"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('about_hero', 'delete');
END;

-- about_built_for_items
CREATE TRIGGER IF NOT EXISTS kb_sync_about_built_for_items_insert AFTER INSERT ON "about_built_for_items"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('about_built_for_items', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_about_built_for_items_update AFTER UPDATE ON "about_built_for_items"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('about_built_for_items', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_about_built_for_items_delete AFTER DELETE ON "about_built_for_items"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('about_built_for_items', 'delete');
END;

-- services_page
CREATE TRIGGER IF NOT EXISTS kb_sync_services_page_insert AFTER INSERT ON "services_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('services_page', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_services_page_update AFTER UPDATE ON "services_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('services_page', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_services_page_delete AFTER DELETE ON "services_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('services_page', 'delete');
END;

-- service_sections
CREATE TRIGGER IF NOT EXISTS kb_sync_service_sections_insert AFTER INSERT ON "service_sections"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('service_sections', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_service_sections_update AFTER UPDATE ON "service_sections"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('service_sections', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_service_sections_delete AFTER DELETE ON "service_sections"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('service_sections', 'delete');
END;

-- service_items
CREATE TRIGGER IF NOT EXISTS kb_sync_service_items_insert AFTER INSERT ON "service_items"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('service_items', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_service_items_update AFTER UPDATE ON "service_items"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('service_items', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_service_items_delete AFTER DELETE ON "service_items"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('service_items', 'delete');
END;

-- process_page
CREATE TRIGGER IF NOT EXISTS kb_sync_process_page_insert AFTER INSERT ON "process_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('process_page', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_process_page_update AFTER UPDATE ON "process_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('process_page', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_process_page_delete AFTER DELETE ON "process_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('process_page', 'delete');
END;

-- process_steps
CREATE TRIGGER IF NOT EXISTS kb_sync_process_steps_insert AFTER INSERT ON "process_steps"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('process_steps', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_process_steps_update AFTER UPDATE ON "process_steps"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('process_steps', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_process_steps_delete AFTER DELETE ON "process_steps"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('process_steps', 'delete');
END;

-- industries_page
CREATE TRIGGER IF NOT EXISTS kb_sync_industries_page_insert AFTER INSERT ON "industries_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('industries_page', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_industries_page_update AFTER UPDATE ON "industries_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('industries_page', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_industries_page_delete AFTER DELETE ON "industries_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('industries_page', 'delete');
END;

-- industry_sectors
CREATE TRIGGER IF NOT EXISTS kb_sync_industry_sectors_insert AFTER INSERT ON "industry_sectors"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('industry_sectors', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_industry_sectors_update AFTER UPDATE ON "industry_sectors"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('industry_sectors', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_industry_sectors_delete AFTER DELETE ON "industry_sectors"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('industry_sectors', 'delete');
END;

-- story_page
CREATE TRIGGER IF NOT EXISTS kb_sync_story_page_insert AFTER INSERT ON "story_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('story_page', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_story_page_update AFTER UPDATE ON "story_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('story_page', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_story_page_delete AFTER DELETE ON "story_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('story_page', 'delete');
END;

-- contact_page
CREATE TRIGGER IF NOT EXISTS kb_sync_contact_page_insert AFTER INSERT ON "contact_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('contact_page', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_contact_page_update AFTER UPDATE ON "contact_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('contact_page', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_contact_page_delete AFTER DELETE ON "contact_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('contact_page', 'delete');
END;

-- career_page
CREATE TRIGGER IF NOT EXISTS kb_sync_career_page_insert AFTER INSERT ON "career_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('career_page', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_career_page_update AFTER UPDATE ON "career_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('career_page', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_career_page_delete AFTER DELETE ON "career_page"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('career_page', 'delete');
END;

-- job_openings
CREATE TRIGGER IF NOT EXISTS kb_sync_job_openings_insert AFTER INSERT ON "job_openings"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('job_openings', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_job_openings_update AFTER UPDATE ON "job_openings"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('job_openings', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_job_openings_delete AFTER DELETE ON "job_openings"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('job_openings', 'delete');
END;

-- blog_posts
CREATE TRIGGER IF NOT EXISTS kb_sync_blog_posts_insert AFTER INSERT ON "blog_posts"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('blog_posts', 'insert');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_blog_posts_update AFTER UPDATE ON "blog_posts"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('blog_posts', 'update');
END;
CREATE TRIGGER IF NOT EXISTS kb_sync_blog_posts_delete AFTER DELETE ON "blog_posts"
BEGIN
  INSERT INTO kb_sync_outbox (table_name, op) VALUES ('blog_posts', 'delete');
END;

-- Vectors previously lived in Qdrant. Reset ingestion state so the first
-- sync re-embeds everything into Vectorize, and queue that first sync.
DELETE FROM kb_documents;
INSERT INTO kb_sync_outbox (table_name, op) VALUES ('*', 'bootstrap');
