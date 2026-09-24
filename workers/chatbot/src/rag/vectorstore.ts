/**
 * Vectorize store for the DiQualia knowledge base (index `diqualia-kb`).
 *
 * Vector ids are derived deterministically from `${documentId}#${chunkIndex}`
 * (hashed — Vectorize ids are capped at 64 bytes), so re-indexing a document
 * overwrites its vectors in place and stale chunks can be deleted by id
 * without a delete-by-filter. The chunk text lives in metadata so retrieval
 * needs no second lookup. Retrieval always applies the public-only filter
 * server-side (requires the `visibility` + `status` metadata indexes).
 */

import { embedTexts } from "../ai";
import { hashText } from "../utils/hash";
import type { KbChunk, RetrievedContextItem } from "../types";

const UPSERT_BATCH = 500;
const DELETE_BATCH = 500;

export async function vectorId(documentId: string, chunkIndex: number): Promise<string> {
  return (await hashText(`${documentId}#${chunkIndex}`)).slice(0, 40);
}

export async function upsertChunks(env: Env, chunks: KbChunk[]): Promise<number> {
  if (chunks.length === 0) return 0;
  const values = await embedTexts(env, chunks.map((c) => c.text));
  const vectors: VectorizeVector[] = await Promise.all(
    chunks.map(async (chunk, i) => ({
      id: await vectorId(chunk.documentId, chunk.index),
      values: values[i]!,
      metadata: {
        content_type: chunk.contentType,
        content_id: chunk.documentId,
        title: chunk.title,
        section: chunk.section ?? "",
        source_url: chunk.sourceUrl,
        status: chunk.status,
        visibility: chunk.visibility,
        updated_at: chunk.updatedAt ?? "",
        text: chunk.text,
      },
    })),
  );
  for (let i = 0; i < vectors.length; i += UPSERT_BATCH) {
    await env.VECTORIZE.upsert(vectors.slice(i, i + UPSERT_BATCH));
  }
  return vectors.length;
}

/** Deletes chunk vectors [fromIndex, toIndex) of a document. */
export async function deleteChunkRange(
  env: Env,
  documentId: string,
  fromIndex: number,
  toIndex: number,
): Promise<void> {
  if (toIndex <= fromIndex) return;
  const ids = await Promise.all(
    Array.from({ length: toIndex - fromIndex }, (_, i) => vectorId(documentId, fromIndex + i)),
  );
  for (let i = 0; i < ids.length; i += DELETE_BATCH) {
    await env.VECTORIZE.deleteByIds(ids.slice(i, i + DELETE_BATCH));
  }
}

/** Semantic retrieval with the public-only filter enforced server-side. */
export async function searchPublic(
  env: Env,
  queryVector: number[],
  topK: number,
): Promise<RetrievedContextItem[]> {
  const res = await env.VECTORIZE.query(queryVector, {
    topK,
    returnMetadata: "all",
    filter: {
      visibility: "public",
      status: { $in: ["published", "inactive"] },
    },
  });
  return res.matches.map((m) => {
    const md = m.metadata ?? {};
    return {
      contentType: String(md.content_type ?? "unknown"),
      title: String(md.title ?? "Untitled"),
      section: md.section ? String(md.section) : undefined,
      sourceUrl: String(md.source_url ?? ""),
      content: String(md.text ?? ""),
      score: m.score,
    };
  });
}
