/**
 * Chatbot configuration. Everything runs on Cloudflare — model ids are Workers
 * AI catalog ids and are typed against the generated AiModels map, so a
 * renamed/removed model fails `npm run typecheck` instead of at runtime.
 */

import { BASE_SYSTEM_PROMPT } from "./prompts/systemPrompt";

export const MODELS = {
  /** Generation (streaming chat). */
  llm: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  /** Embeddings — multilingual (handles English + Roman Urdu), 1024 dims. */
  embeddings: "@cf/baai/bge-m3",
  /** Cross-encoder reranker for semantic candidates. */
  reranker: "@cf/baai/bge-reranker-base",
} as const satisfies Record<string, keyof AiModels>;

/** Must match `wrangler vectorize create diqualia-kb --dimensions=...`. */
export const EMBEDDING_DIMENSIONS = 1024;

export const CHAT = {
  /** Max characters in one user message. */
  maxUserChars: 1000,
  /** Turns (user + assistant messages) sent to the LLM as history. */
  historyWindow: 20,
  /** Turns kept per session in the ChatSession Durable Object. */
  historyStored: 40,
  /** Session history is dropped after this much inactivity. */
  sessionTtlMs: 24 * 60 * 60 * 1000,
} as const;

export const LLM = {
  temperature: 0.2,
  maxTokens: 1024,
} as const;

export const RETRIEVAL = {
  /** Vectorize candidates (max 20 when returning all metadata). */
  candidateK: 15,
  /** Semantic chunks kept after reranking. */
  finalK: 6,
  /** Minimum cosine similarity for a Vectorize candidate. */
  scoreFloor: 0.3,
  maxContextTokens: 2600,
} as const;

export const CHUNKING = {
  targetTokens: 400,
  minTokens: 150,
  maxTokens: 700,
  overlapTokens: 40,
} as const;

export type ChunkingConfig = typeof CHUNKING;

export const SYSTEM_PROMPT = BASE_SYSTEM_PROMPT;

/** Optional AI Gateway routing (caching, analytics) when AI_GATEWAY_ID is set. */
export function aiOptions(env: Env): AiOptions | undefined {
  return env.AI_GATEWAY_ID ? { gateway: { id: env.AI_GATEWAY_ID } } : undefined;
}
