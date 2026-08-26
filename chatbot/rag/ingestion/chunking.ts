/**
 * Document-aware chunking.
 *
 * Splits on headings/paragraph boundaries first, keeps short sections whole,
 * never splits a sentence or separates a fact from its label. Chunk size is
 * configurable via RAG_TARGET_TOKENS / RAG_MAX_TOKENS / RAG_OVERLAP_TOKENS.
 */

import type { RagConfig } from "../../config/config";
import type { KbChunk, KbDocument } from "../../models/types";

const AVERAGE_CHARS_PER_TOKEN = 4;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / AVERAGE_CHARS_PER_TOKEN);
}

/** Splits text into paragraphs (blank-line separated). */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Splits a single paragraph into sentences, keeping sentence pairs when short. */
function splitSentences(paragraph: string): string[] {
  // Keep abbreviations/decimals safe: split on ". " / "! " / "? " boundaries.
  const parts = paragraph.split(/(?<=[.!?])\s+/);
  const sentences = parts.map((s) => s.trim()).filter(Boolean);
  return sentences.length > 1 ? sentences : [paragraph];
}

/**
 * Chunks a normalized knowledge document.
 * Short documents stay as one chunk; long prose is split on paragraph
 * boundaries with a small overlap. Deterministic chunk ids allow
 * incremental replace/delete.
 */
export function chunkDocument(doc: KbDocument, cfg: RagConfig["chunking"]): KbChunk[] {
  const text = doc.body.trim();
  if (!text) return [];

  const bodyTokens = estimateTokens(text);
  if (bodyTokens <= cfg.maxTokens) {
    return [
      {
        id: `${doc.id}__chunk-0`,
        documentId: doc.id,
        contentType: doc.contentType,
        title: doc.title,
        section: doc.section,
        sourceUrl: doc.sourceUrl,
        status: doc.status,
        visibility: doc.visibility,
        updatedAt: doc.updatedAt,
        text,
        metadata: doc.metadata,
      },
    ];
  }

  // Long prose: paragraph-aware splitting.
  const paragraphs = splitParagraphs(text);
  const chunks: KbChunk[] = [];
  let current: string[] = [];
  let currentTokens = 0;

  const flush = () => {
    if (current.length === 0) return;
    const body = current.join("\n\n");
    // If the accumulated chunk is still too long (one giant paragraph),
    // split it sentence-wise.
    if (estimateTokens(body) > cfg.maxTokens && current.length === 1) {
      for (const sentenceGroup of groupSentences(current[0], cfg)) {
        pushChunk(sentenceGroup);
      }
    } else {
      pushChunk(body);
    }
    current = [];
    currentTokens = 0;
  };

  const pushChunk = (body: string) => {
    chunks.push({
      id: `${doc.id}__chunk-${chunks.length}`,
      documentId: doc.id,
      contentType: doc.contentType,
      title: doc.title,
      section: doc.section,
      sourceUrl: doc.sourceUrl,
      status: doc.status,
      visibility: doc.visibility,
      updatedAt: doc.updatedAt,
      text: body,
      metadata: doc.metadata,
    });
  };

  for (const paragraph of paragraphs) {
    const tokens = estimateTokens(paragraph);
    if (tokens > cfg.maxTokens) {
      // Overly long paragraph: split into sentence groups on its own.
      flush();
      for (const group of groupSentences(paragraph, cfg)) pushChunk(group);
      continue;
    }
    if (currentTokens + tokens > cfg.maxTokens && current.length > 0) {
      flush();
    }
    current.push(paragraph);
    currentTokens += tokens;
  }
  flush();

  // Apply overlap between adjacent chunks to avoid context loss at seams.
  return applyOverlap(chunks, cfg);
}

/** Groups sentences of an over-long paragraph into target-sized groups. */
function groupSentences(paragraph: string, cfg: RagConfig["chunking"]): string[] {
  const sentences = splitSentences(paragraph);
  const groups: string[] = [];
  let current: string[] = [];
  let tokens = 0;
  for (const sentence of sentences) {
    const t = estimateTokens(sentence);
    if (current.length > 0 && tokens + t > cfg.targetTokens) {
      groups.push(current.join(" "));
      current = [];
      tokens = 0;
    }
    current.push(sentence);
    tokens += t;
  }
  if (current.length > 0) groups.push(current.join(" "));
  return groups;
}

/** Applies a small tail-overlap to consecutive chunks (idempotent). */
function applyOverlap(chunks: KbChunk[], cfg: RagConfig["chunking"]): KbChunk[] {
  if (chunks.length < 2 || cfg.overlapTokens <= 0) return chunks;
  const out: KbChunk[] = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    if (i < chunks.length - 1) {
      const next = chunks[i + 1];
      const sentences = splitSentences(next.text);
      const overlap: string[] = [];
      let tokens = 0;
      for (const s of sentences) {
        if (tokens + estimateTokens(s) > cfg.overlapTokens) break;
        overlap.push(s);
        tokens += estimateTokens(s);
      }
      out.push({
        ...chunk,
        text: overlap.length > 0 ? `${chunk.text}\n\n${overlap.join(" ")}` : chunk.text,
      });
    } else {
      out.push(chunk);
    }
  }
  return out;
}
