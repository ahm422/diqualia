/**
 * Ingestion: D1 CMS + hardcoded copy → normalize → hash → chunk → embed
 * (Workers AI) → Vectorize.
 *
 * Incremental: kb_documents stores each document's content hash and chunk
 * count, so only changed documents are re-embedded, shrunk documents lose
 * their surplus chunk vectors, and documents that disappeared (deleted, or
 * unpublished) have all their vectors removed. kb_facts is rebuilt atomically.
 */

import { CHUNKING } from "../config";
import { hashText } from "../utils/hash";
import type { KbDocument, KbFact } from "../types";
import { chunkDocument } from "./chunking";
import { loadAllKnowledge } from "./sources";
import { deleteChunkRange, upsertChunks } from "./vectorstore";

export type IngestResult = {
  totalDocuments: number;
  added: number;
  updated: number;
  unchanged: number;
  removed: number;
  vectors: number;
  facts: number;
  errors: string[];
};

type ExistingRow = {
  contentType: string;
  contentId: string;
  contentHash: string;
  chunkCount: number;
};

async function listExisting(db: D1Database): Promise<ExistingRow[]> {
  const { results } = await db
    .prepare(
      `SELECT content_type AS contentType, content_id AS contentId,
              content_hash AS contentHash, chunk_count AS chunkCount
       FROM kb_documents`,
    )
    .all<ExistingRow>();
  return results;
}

function upsertDocRecord(db: D1Database, doc: KbDocument, hash: string, chunkCount: number) {
  return db
    .prepare(
      `INSERT INTO kb_documents (content_type, content_id, content_hash, chunk_count, status, updated_at, indexed_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(content_type, content_id) DO UPDATE SET
         content_hash = excluded.content_hash,
         chunk_count = excluded.chunk_count,
         status = excluded.status,
         updated_at = excluded.updated_at,
         indexed_at = excluded.indexed_at`,
    )
    .bind(doc.contentType, doc.id, hash, chunkCount, doc.status, doc.updatedAt)
    .run();
}

/** Builds normalized structured facts from the knowledge documents. */
function buildFacts(docs: KbDocument[]): KbFact[] {
  const facts: KbFact[] = [];

  const contact = docs.find((d) => d.id === "contact:overview");
  if (contact) {
    const email = contact.metadata?.email ? String(contact.metadata.email) : "";
    if (email) {
      facts.push({
        id: "contact:email",
        factType: "contact",
        factKey: "contact email",
        factValue: email,
        sourceUrl: contact.sourceUrl,
        updatedAt: contact.updatedAt ?? undefined,
      });
    }
    facts.push({
      id: "contact:how-to-start",
      factType: "contact",
      factKey: "how to start",
      factValue:
        "Every engagement begins with a no-cost discovery call — 30 minutes, no pitch, just research. Contact via the Contact page or the email shown on it.",
      sourceUrl: contact.sourceUrl,
      updatedAt: contact.updatedAt ?? undefined,
    });
  }

  const home = docs.find((d) => d.id === "home:hero");
  if (home?.metadata) {
    for (const i of [1, 2, 3]) {
      const label = home.metadata[`stat${i}_label`];
      const value = home.metadata[`stat${i}_value`];
      if (label && value) {
        facts.push({
          id: `stats:${i}`,
          factType: "stats",
          factKey: String(label),
          factValue: String(value),
          sourceUrl: home.sourceUrl,
          updatedAt: home.updatedAt ?? undefined,
        });
      }
    }
  }

  for (const doc of docs) {
    if (doc.contentType === "engagement") {
      facts.push({
        id: `engagement:${doc.id}`,
        factType: "engagement",
        factKey: doc.title,
        factValue: doc.body,
        sourceUrl: doc.sourceUrl,
        updatedAt: doc.updatedAt ?? undefined,
      });
    } else if (doc.contentType === "value" && doc.id === "values:why-diqualia") {
      facts.push({
        id: "values:why-diqualia",
        factType: "value",
        factKey: "Why DiQualia",
        factValue: doc.body,
        sourceUrl: doc.sourceUrl,
        updatedAt: doc.updatedAt ?? undefined,
      });
    }
  }

  return facts;
}

/** Replaces kb_facts in one atomic batch (removes facts that no longer exist). */
async function replaceFacts(db: D1Database, facts: KbFact[]): Promise<void> {
  const insert = db.prepare(
    `INSERT INTO kb_facts (id, fact_type, fact_key, fact_value, source_url, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(fact_type, fact_key) DO UPDATE SET
       fact_value = excluded.fact_value,
       source_url = excluded.source_url,
       updated_at = excluded.updated_at`,
  );
  await db.batch([
    db.prepare(`DELETE FROM kb_facts`),
    ...facts.map((f) =>
      insert.bind(f.id, f.factType, f.factKey, f.factValue, f.sourceUrl ?? null, f.updatedAt ?? null),
    ),
  ]);
}

export async function runIngestion(
  env: Env,
  opts: { force?: boolean } = {},
): Promise<IngestResult> {
  const result: IngestResult = {
    totalDocuments: 0,
    added: 0,
    updated: 0,
    unchanged: 0,
    removed: 0,
    vectors: 0,
    facts: 0,
    errors: [],
  };

  const { documents, errors } = await loadAllKnowledge(env.DB);
  result.errors.push(...errors);
  result.totalDocuments = documents.length;
  // A failed CMS read must not be mistaken for "everything was deleted".
  if (errors.length > 0) return result;

  const existing = await listExisting(env.DB);
  const existingById = new Map(existing.map((e) => [e.contentId, e]));
  const currentIds = new Set(documents.map((d) => d.id));

  const facts = buildFacts(documents);
  await replaceFacts(env.DB, facts);
  result.facts = facts.length;

  for (const doc of documents) {
    const hash = await hashText(
      `${doc.title}\n${doc.section ?? ""}\n${doc.sourceUrl}\n${doc.body}\n${doc.status}\n${doc.visibility}\n${doc.updatedAt ?? ""}`,
    );
    const prior = existingById.get(doc.id);
    if (!opts.force && prior && prior.contentHash === hash) {
      result.unchanged += 1;
      continue;
    }

    const chunks = chunkDocument(doc, CHUNKING);
    try {
      result.vectors += await upsertChunks(env, chunks);
      if (prior) await deleteChunkRange(env, doc.id, chunks.length, prior.chunkCount);
      await upsertDocRecord(env.DB, doc, hash, chunks.length);
      if (prior) result.updated += 1;
      else result.added += 1;
    } catch (err) {
      result.errors.push(`doc ${doc.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (const row of existing) {
    if (currentIds.has(row.contentId)) continue;
    try {
      await deleteChunkRange(env, row.contentId, 0, row.chunkCount);
      await env.DB.prepare(`DELETE FROM kb_documents WHERE content_type = ? AND content_id = ?`)
        .bind(row.contentType, row.contentId)
        .run();
      result.removed += 1;
    } catch (err) {
      result.errors.push(`stale ${row.contentId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}
