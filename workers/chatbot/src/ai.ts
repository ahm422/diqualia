/**
 * Workers AI calls: embeddings (bge-m3), reranking (bge-reranker-base) and
 * streamed generation (Llama 3.3 70B).
 */

import { LLM, MODELS, aiOptions } from "./config";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const EMBED_BATCH = 50;

export async function embedTexts(env: Env, texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH) {
    const batch = texts.slice(i, i + EMBED_BATCH);
    const res = await env.AI.run(
      MODELS.embeddings,
      { text: batch, truncate_inputs: true },
      aiOptions(env),
    );
    const data = "data" in res ? res.data : undefined;
    if (!data || data.length !== batch.length) {
      throw new Error(`embeddings: expected ${batch.length} vectors, got ${data?.length ?? 0}`);
    }
    out.push(...data);
  }
  return out;
}

export async function embedQuery(env: Env, text: string): Promise<number[]> {
  const [vector] = await embedTexts(env, [text]);
  return vector!;
}

/** Returns relevance scores in [0,1], indexed like `contexts`. */
export async function rerank(env: Env, query: string, contexts: string[]): Promise<number[]> {
  // The generated input type omits `query`, which the model requires.
  const input: Ai_Cf_Baai_Bge_Reranker_Base_Input & { query: string } = {
    query,
    contexts: contexts.map((text) => ({ text })),
  };
  const res = await env.AI.run(MODELS.reranker, input, aiOptions(env));
  const scores = new Array<number>(contexts.length).fill(0);
  for (const r of res.response ?? []) {
    if (typeof r.id === "number" && typeof r.score === "number") scores[r.id] = r.score;
  }
  return scores;
}

/**
 * Streams generated tokens. Breaking out of the loop cancels the upstream
 * stream, so callers can stop generation when an output guardrail trips.
 */
export async function* streamChat(
  env: Env,
  system: string,
  history: ChatTurn[],
): AsyncGenerator<string> {
  const stream = await env.AI.run(
    MODELS.llm,
    {
      messages: [{ role: "system", content: system }, ...history],
      stream: true,
      max_tokens: LLM.maxTokens,
      temperature: LLM.temperature,
    },
    aiOptions(env),
  );
  if (!(stream instanceof ReadableStream)) {
    throw new Error("llm: expected a stream");
  }

  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        const token = parseSseLine(line);
        if (token === null) return;
        if (token) yield token;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}

/** Returns the token text, "" for non-token lines, or null at [DONE]. */
function parseSseLine(line: string): string | null {
  if (!line.startsWith("data:")) return "";
  const payload = line.slice(5).trim();
  if (payload === "[DONE]") return null;
  try {
    const json = JSON.parse(payload) as {
      response?: string;
      choices?: { delta?: { content?: string } }[];
    };
    return json.response ?? json.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}
