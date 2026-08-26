
import { BASE_SYSTEM_PROMPT } from "../prompts/systemPrompt";

/**
 * RAG configuration — all values come from environment variables so the
 * production Qdrant / embedding / DeepSeek infrastructure can be changed
 * without code changes. Never hardcode keys or machine-specific paths.
 *
 * Required (server-side only) for the RAG path:
 *   DEEPSEEK_API_KEY
 *   EMBEDDINGS_API_KEY        (Qwen3-Embedding-0.6B provider)
 *   QDRANT_URL                (default http://127.0.0.1:6333)
 *
 * See .env.example for the full list.
 */

export type RagConfig = {
  enabled: boolean;
  deepseek: {
    apiKey: string;
    baseUrl: string;
    model: string;
    temperature: number;
    maxTokens: number;
    timeoutMs: number;
  };
  qdrant: {
    url: string;
    apiKey: string;
    collection: string;
  };
  embeddings: {
    apiKey: string;
    provider: string;
    baseUrl: string;
    model: string;
    dimensions: number;
    maxBatchSize: number;
  };
  retrieval: {
    candidateK: number;
    finalK: number;
    maxContextTokens: number;
    scoreFloor: number;
  };
  chunking: {
    targetTokens: number;
    minTokens: number;
    maxTokens: number;
    overlapTokens: number;
  };
  systemPrompt: string;
};

function intOr(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolOr(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw.toLowerCase() === "true" || raw === "1";
}

/**
 * The final chatbot system prompt is supplied separately and is not authored
 * by the RAG implementation. Prefer CHAT_SYSTEM_PROMPT at runtime; otherwise
 * fall back to the placeholder in chatbot/prompts/systemPrompt.ts.
 */
function loadSystemPrompt(): string {
  const fromEnv = process.env.CHAT_SYSTEM_PROMPT;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;
  return BASE_SYSTEM_PROMPT;
}

export function getRagConfig(): RagConfig {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY ?? "";
  const embeddingsApiKey = process.env.EMBEDDINGS_API_KEY ?? "";
  const qdrantUrl = process.env.QDRANT_URL ?? "http://127.0.0.1:6333";
  const embeddingsProvider = process.env.EMBEDDINGS_PROVIDER ?? "openai";

  const embeddingsConfigured =
    embeddingsApiKey.length > 0 || embeddingsProvider === "dummy";

  const enabled =
    boolOr("RAG_ENABLED", false) ||
    boolOr(
      "RAG_AUTO_ENABLED",
      deepseekApiKey.length > 0 && qdrantUrl.length > 0 && embeddingsConfigured,
    );

  return {
    enabled,
    deepseek: {
      apiKey: deepseekApiKey,
      baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1",
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
      temperature: 0.2,
      maxTokens: intOr("DEEPSEEK_MAX_TOKENS", 1024),
      timeoutMs: intOr("DEEPSEEK_TIMEOUT_MS", 60_000),
    },
    qdrant: {
      url: qdrantUrl,
      apiKey: process.env.QDRANT_API_KEY ?? "",
      collection: process.env.QDRANT_COLLECTION ?? "diqualia_kb",
    },
    embeddings: {
      apiKey: embeddingsApiKey,
      provider: embeddingsProvider,
      baseUrl:
        process.env.EMBEDDINGS_BASE_URL ?? "https://api.siliconflow.cn/v1",
      model: process.env.EMBEDDINGS_MODEL ?? "Qwen/Qwen3-Embedding-0.6B",
      dimensions: intOr("EMBEDDINGS_DIMENSIONS", 1024),
      maxBatchSize: intOr("EMBEDDINGS_MAX_BATCH", 32),
    },
    retrieval: {
      candidateK: intOr("RAG_CANDIDATE_K", 15),
      finalK: intOr("RAG_FINAL_K", 6),
      maxContextTokens: intOr("RAG_MAX_CONTEXT_TOKENS", 2600),
      scoreFloor: 0.25,
    },
    chunking: {
      targetTokens: intOr("RAG_TARGET_TOKENS", 400),
      minTokens: intOr("RAG_MIN_TOKENS", 150),
      maxTokens: intOr("RAG_MAX_TOKENS", 700),
      overlapTokens: intOr("RAG_OVERLAP_TOKENS", 40),
    },
    systemPrompt: loadSystemPrompt(),
  };
}
