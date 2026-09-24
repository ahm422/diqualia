-- RAG knowledge base support tables.
-- kb_documents tracks ingestion state (content identity + hash) so the
-- pipeline can index incrementally and remove stale vectors.
-- kb_facts holds normalized structured/exact knowledge that has no natural
-- business table (engagement models, hero stats, contact facts, values).
-- Neither table is a business table; the website data model is untouched.

CREATE TABLE IF NOT EXISTS kb_documents (
  content_type TEXT NOT NULL,
  content_id   TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  chunk_count  INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'published',
  updated_at   TEXT,
  indexed_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_kb_documents_type ON kb_documents(content_type);

CREATE TABLE IF NOT EXISTS kb_facts (
  id         TEXT PRIMARY KEY,
  fact_type  TEXT NOT NULL,
  fact_key   TEXT NOT NULL,
  fact_value TEXT NOT NULL,
  source_url TEXT,
  updated_at TEXT,
  UNIQUE (fact_type, fact_key)
);

CREATE INDEX IF NOT EXISTS idx_kb_facts_type ON kb_facts(fact_type);
