/**
 * Embedding client.
 *
 * Default provider: Qwen3-Embedding-0.6B through an OpenAI-compatible
 * embeddings endpoint (SiliconFlow by default). The model, base URL, API key,
 * and dimensions are configurable via env vars so the model can be swapped
 * later without touching the RAG architecture.
 *
 * Dev-only "dummy" provider (EMBEDDINGS_PROVIDER=dummy): deterministic local
 * hashed vectors, used ONLY to exercise the ingestion/retrieval pipeline
 * offline. Never use it in production, and never mix real and dummy vectors
 * in the same collection.
 */


import { OpenAIEmbeddings } from "@langchain/openai";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";

import { getRagConfig } from "../../config/config";

let cached: EmbeddingsInterface | null = null;

/** Deterministic pseudo-vector for offline pipeline smoke tests only. */
class DummyEmbeddings implements EmbeddingsInterface {
  constructor(private readonly dimensions: number) {}

  private vectorFor(text: string): number[] {
    const out = new Array<number>(this.dimensions).fill(0);
    let seed = 0;
    for (const ch of text) seed = (seed * 31 + ch.charCodeAt(0)) % 1_000_000_007;
    let x = seed;
    for (let i = 0; i < this.dimensions; i += 1) {
      x = (x * 1103515245 + 12345) % 2147483648;
      out[i] = (x % 2000) / 1000 - 1;
    }
    const norm = Math.sqrt(out.reduce((acc, v) => acc + v * v, 0)) || 1;
    return out.map((v) => v / norm);
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.vectorFor(text);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.vectorFor(t));
  }
}

export function getEmbeddings(): EmbeddingsInterface {
  if (cached) return cached;
  const cfg = getRagConfig();
  if (cfg.embeddings.provider === "dummy") {
    cached = new DummyEmbeddings(cfg.embeddings.dimensions);
    return cached;
  }
  cached = new OpenAIEmbeddings({
    model: cfg.embeddings.model,
    apiKey: cfg.embeddings.apiKey,
    maxRetries: 2,
    configuration: {
      baseURL: cfg.embeddings.baseUrl,
    },
  });
  return cached;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const embeddings = getEmbeddings();
  const cfg = getRagConfig();
  const vectors: number[][] = [];
  for (let i = 0; i < texts.length; i += cfg.embeddings.maxBatchSize) {
    const batch = texts.slice(i, i + cfg.embeddings.maxBatchSize);
    vectors.push(...(await embeddings.embedDocuments(batch)));
  }
  return vectors;
}

export async function embedQuery(text: string): Promise<number[]> {
  return getEmbeddings().embedQuery(text);
}
