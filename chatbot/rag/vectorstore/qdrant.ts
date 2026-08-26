/**
 * Qdrant store for the DiQualia knowledge base.
 *
 * A dedicated collection (default `diqualia_kb`) holds vector records whose
 * payload carries useful metadata (content_type, content_id, title, section,
 * source_url, status, visibility, updated_at). Retrieval filters are built
 * server-side and always enforce public visibility.
 */


import { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant";
import type { Schemas } from "@qdrant/js-client-rest";

import { getEmbeddings, embedTexts } from "../embeddings/embeddings";
import { getRagConfig } from "../../config/config";
import { deterministicUuid } from "../../utils/hash";
import type { KbChunk, RetrievedContextItem } from "../../models/types";

export const CONTENT_KEY = "pageContent";
export const METADATA_KEY = "metadata";

let cachedStore: QdrantVectorStore | null = null;

export function getVectorStore(): QdrantVectorStore {
  if (cachedStore) return cachedStore;
  const cfg = getRagConfig();
  cachedStore = new QdrantVectorStore(getEmbeddings(), {
    url: cfg.qdrant.url,
    apiKey: cfg.qdrant.apiKey || undefined,
    collectionName: cfg.qdrant.collection,
    contentPayloadKey: CONTENT_KEY,
    metadataPayloadKey: METADATA_KEY,
    collectionConfig: {
      vectors: {
        size: cfg.embeddings.dimensions,
        distance: "Cosine",
      },
    },
  });
  return cachedStore;
}

/** Clears the singleton (used by scripts/tests). */
export function resetVectorStore() {
  cachedStore = null;
}

/** Ensures the collection exists (idempotent). */
export async function ensureCollection(): Promise<void> {
  await getVectorStore().ensureCollection();
}

/** True when a Qdrant error is simply "collection not found". */
function isNotFound(err: unknown): boolean {
  return (
    err instanceof Error &&
    /not found/i.test(err.message) &&
    (err.message.includes("404") || /collection/i.test(err.message) || err.message === "Not Found")
  );
}

function chunkToDocument(chunk: KbChunk): Document {
  return new Document({
    pageContent: chunk.text,
    metadata: {
      content_type: chunk.contentType,
      content_id: chunk.documentId,
      title: chunk.title,
      section: chunk.section ?? "",
      source_url: chunk.sourceUrl,
      status: chunk.status,
      visibility: chunk.visibility,
      updated_at: chunk.updatedAt ?? "",
    },
  });
}

/** Upserts chunks with deterministic ids, replacing any existing vectors. */
export async function upsertChunks(chunks: KbChunk[]): Promise<number> {
  if (chunks.length === 0) return 0;
  const store = getVectorStore();
  const vectors = await embedTexts(chunks.map((c) => c.text));
  const ids = await Promise.all(chunks.map((c) => deterministicUuid(c.id)));
  await store.addVectors(vectors, chunks.map(chunkToDocument), { ids });
  return chunks.length;
}

/** Deletes all vectors belonging to a content id (re-index + stale removal). */
export async function deleteContentVectors(contentId: string): Promise<void> {
  const store = getVectorStore();
  try {
    await store.ensureCollection();
    await store.delete({
      filter: {
        must: [{ key: `metadata.content_id`, match: { value: contentId } }],
      },
    });
  } catch (err) {
    if (!isNotFound(err)) throw err;
  }
}

/** Public-visibility filter enforced server-side; users cannot supply filters. */
function publicFilter(): Schemas["Filter"] {
  return {
    must: [
      { key: `metadata.visibility`, match: { value: "public" } },
      { key: `metadata.status`, match: { any: ["published", "inactive"] } },
    ],
  };
}

/**
 * Semantic retrieval. Candidates are fetched server-side with the public
 * visibility filter; the caller reduces them into the final context.
 */
export async function searchPublic(
  queryVector: number[],
  k: number,
): Promise<RetrievedContextItem[]> {
  const store = getVectorStore();
  const results = await store.similaritySearchVectorWithScore(
    queryVector,
    k,
    publicFilter(),
  );
  return results.map(([doc, score]) => ({
    contentType: String(doc.metadata?.content_type ?? "unknown"),
    title: String(doc.metadata?.title ?? "Untitled"),
    section: doc.metadata?.section ? String(doc.metadata.section) : undefined,
    sourceUrl: String(doc.metadata?.source_url ?? ""),
    content: doc.pageContent,
    score,
  }));
}

export { embedQuery, embedTexts } from "../embeddings/embeddings";