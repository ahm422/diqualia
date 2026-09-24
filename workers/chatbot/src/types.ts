/**
 * Shared knowledge types for the DiQualia RAG pipeline.
 */

export type KbContentType =
  | "service"
  | "engagement"
  | "value"
  | "process"
  | "industry"
  | "story"
  | "about"
  | "home"
  | "careers"
  | "job"
  | "blog"
  | "contact";

export type KbVisibility = "public" | "internal";

export type KbStatus = "published" | "draft" | "inactive";

/**
 * A single normalized knowledge document, before chunking. Every piece of
 * public website knowledge (DB-sourced or hardcoded) is normalized into this
 * shape so the ingestion pipeline has a single source of truth.
 */
export interface KbDocument {
  /** Deterministic identity, e.g. "service:s01" or "job:research-analyst". */
  id: string;
  contentType: KbContentType;
  title: string;
  /** Optional subsection label, e.g. "Buyer Journey Mapping". */
  section?: string;
  sourceUrl: string;
  status: KbStatus;
  visibility: KbVisibility;
  updatedAt: string | null;
  body: string;
  /** Free-form metadata that is persisted to the vector payload. */
  metadata?: Record<string, string | number | boolean | null>;
}

/** A chunk produced by the chunker, ready for embedding. */
export interface KbChunk {
  documentId: string;
  /** Position within the document; with documentId it derives the vector id. */
  index: number;
  contentType: KbContentType;
  title: string;
  section?: string;
  sourceUrl: string;
  status: KbStatus;
  visibility: KbVisibility;
  updatedAt: string | null;
  text: string;
  metadata?: Record<string, string | number | boolean | null>;
}

/** Normalized structured fact used by the structured retrieval layer. */
export interface KbFact {
  id: string;
  factType: string;
  factKey: string;
  factValue: string;
  sourceUrl?: string;
  updatedAt?: string;
}

/** A retrieved context item handed to the LLM. */
export interface RetrievedContextItem {
  contentType: string;
  title: string;
  section?: string;
  sourceUrl: string;
  content: string;
  score: number;
}
