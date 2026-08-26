/**
 * Ingestion pipeline.
 *
 *   D1/hardcoded content → normalize → hash → chunk → embed → Qdrant
 *
 * Incremental: only content whose hash changed is reprocessed. Deterministic
 * vector ids + content-id filters avoid duplicate vectors. Structured facts
 * (contact, stats, engagement models, values) are normalized into kb_facts.
 * Stale vectors/rows are removed when a content id disappears.
 */

import type { ChatbotDataSource } from "../../models/datasource";
import { getRagConfig } from "../../config/config";
import { chunkDocument } from "./chunking";
import { hashText } from "../../utils/hash";
import { loadAllKnowledge } from "./sources";
import { deleteContentVectors, upsertChunks } from "../vectorstore/qdrant";
import type { KbDocument, KbFact } from "../../models/types";

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
  contentId: string;
  contentType: string;
  contentHash: string;
};

async function listExisting(prisma: ChatbotDataSource): Promise<ExistingRow[]> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT content_id AS contentId, content_type AS contentType, content_hash AS contentHash
       FROM kb_documents`,
    );
    return rows.map((r) => ({
      contentId: String(r.contentId),
      contentType: String(r.contentType),
      contentHash: String(r.contentHash),
    }));
  } catch {
    return [];
  }
}

async function upsertDocRecord(
  prisma: ChatbotDataSource,
  doc: KbDocument,
  hash: string,
  chunkCount: number,
) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO kb_documents (content_type, content_id, content_hash, chunk_count, status, updated_at, indexed_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(content_type, content_id) DO UPDATE SET
       content_hash = excluded.content_hash,
       chunk_count = excluded.chunk_count,
       status = excluded.status,
       updated_at = excluded.updated_at,
       indexed_at = excluded.indexed_at`,
    doc.contentType,
    doc.id,
    hash,
    chunkCount,
    doc.status,
    doc.updatedAt,
  );
}

async function deleteDocRecord(prisma: ChatbotDataSource, contentType: string, contentId: string) {
  try {
    await prisma.$executeRawUnsafe(
      `DELETE FROM kb_documents WHERE content_type = ? AND content_id = ?`,
      contentType,
      contentId,
    );
  } catch {
    /* ignore */
  }
}

async function upsertFact(prisma: ChatbotDataSource, fact: KbFact) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO kb_facts (id, fact_type, fact_key, fact_value, source_url, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(fact_type, fact_key) DO UPDATE SET
       fact_value = excluded.fact_value,
       source_url = excluded.source_url,
       updated_at = excluded.updated_at`,
    fact.id,
    fact.factType,
    fact.factKey,
    fact.factValue,
    fact.sourceUrl ?? null,
    fact.updatedAt ?? null,
  );
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

export async function runIngestion(
  prisma: ChatbotDataSource,
  opts: { force?: boolean; logger?: (line: string) => void } = {},
): Promise<IngestResult> {
  const log = opts.logger ?? ((line: string) => console.log(line));
  const cfg = getRagConfig();
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

  const { documents, errors } = await loadAllKnowledge(prisma);
  result.errors.push(...errors);
  result.totalDocuments = documents.length;
  log(`Loaded ${documents.length} knowledge documents`);

  const existing = await listExisting(prisma);
  const existingByContentId = new Map(existing.map((e) => [e.contentId, e]));
  const currentIds = new Set(documents.map((d) => d.id));

  // Seed structured facts first (cheap, idempotent).
  const facts = buildFacts(documents);
  for (const fact of facts) {
    try {
      await upsertFact(prisma, fact);
      result.facts += 1;
    } catch (err) {
      result.errors.push(`fact ${fact.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  log(`Upserted ${result.facts} structured facts`);

  for (const doc of documents) {
    const hash = await hashText(
      `${doc.body}\n${doc.status}\n${doc.visibility}\n${doc.updatedAt ?? ""}`,
    );
    const prior = existingByContentId.get(doc.id);

    if (!opts.force && prior && prior.contentHash === hash) {
      result.unchanged += 1;
      continue;
    }

    const chunks = chunkDocument(doc, cfg.chunking);
    try {
      if (chunks.length > 0) {
        // Replace: remove old vectors for this content id first (idempotent).
        await deleteContentVectors(doc.id);
        result.vectors += await upsertChunks(chunks);
      }
      await upsertDocRecord(prisma, doc, hash, chunks.length);
      if (prior) {
        result.updated += 1;
        log(`Updated ${doc.id} (${chunks.length} chunks)`);
      } else {
        result.added += 1;
        log(`Added ${doc.id} (${chunks.length} chunks)`);
      }
    } catch (err) {
      result.errors.push(`doc ${doc.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Stale removal: content no longer in the site.
  for (const row of existing) {
    if (!currentIds.has(row.contentId)) {
      try {
        await deleteContentVectors(row.contentId);
        await deleteDocRecord(prisma, row.contentType, row.contentId);
        result.removed += 1;
        log(`Removed stale ${row.contentId}`);
      } catch (err) {
        result.errors.push(
          `stale ${row.contentId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  log(
    `Ingestion complete: +${result.added} added, ~${result.updated} updated, ${result.unchanged} unchanged, -${result.removed} removed, ${result.vectors} vectors.`,
  );
  return result;
}
