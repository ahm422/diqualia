/**
 * RAG orchestrator.
 *
 *   input guardrails → query analysis → structured retrieval (D1)
 *   → semantic retrieval (Vectorize) → rerank → context assembly
 *   → Workers AI generation with session history
 *   → incremental output guardrails → streamed plain text
 */

import { embedQuery, rerank, streamChat, type ChatTurn } from "./ai";
import { CHAT, RETRIEVAL, SYSTEM_PROMPT } from "./config";
import { GREETING_RESPONSE, guardUserInput, isGreeting } from "./guardrails/input";
import { GROUNDED_FALLBACK, checkOutputStreaming } from "./guardrails/output";
import { analyzeQuery } from "./rag/analyze";
import { assembleContext, buildSystemMessages } from "./rag/context";
import { retrieveStructured } from "./rag/structured";
import { searchPublic } from "./rag/vectorstore";
import type { RetrievedContextItem } from "./types";
import type { RagLogger } from "./utils/logger";

const NO_RESPONSE_FALLBACK =
  "I couldn't put an answer together just now. Please try again in a moment.";

const SCOPE_RESPONSE =
  "I'm the DiQualia website assistant, so I can only help with DiQualia — our services, industries, process, engagement models, careers and contact. For anything else, I won't be able to help. Ask me something about DiQualia.";

export type ChatRun = {
  /** Whether this exchange belongs in the session history. */
  persist: boolean;
  chunks: AsyncGenerator<string>;
};

async function* once(text: string): AsyncGenerator<string> {
  yield text;
}

/**
 * Text used for retrieval. Short follow-ups ("and the second one?") carry no
 * topic on their own, so the previous user turn is prepended.
 */
function retrievalQuery(history: ChatTurn[], message: string): string {
  const previous = history.filter((t) => t.role === "user").at(-1)?.content;
  if (!previous || message.split(/\s+/).length > 12) return message;
  return `${previous}\n${message}`;
}

async function semanticSearch(
  env: Env,
  query: string,
  logger: RagLogger,
): Promise<RetrievedContextItem[]> {
  logger.mark("embed_start");
  const vector = await embedQuery(env, query);
  logger.mark("embed");
  const candidates = (await searchPublic(env, vector, RETRIEVAL.candidateK)).filter(
    (c) => c.score >= RETRIEVAL.scoreFloor && c.content,
  );
  logger.mark("vectorize_search");
  logger.count("candidate_chunks", candidates.length);
  if (candidates.length <= 1) return candidates;

  try {
    const scores = await rerank(env, query, candidates.map((c) => c.content));
    logger.mark("rerank");
    return candidates
      .map((c, i) => ({ ...c, score: scores[i] ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, RETRIEVAL.finalK);
  } catch {
    logger.count("rerank_error", 1);
    return candidates.slice(0, RETRIEVAL.finalK);
  }
}

export async function runChat(
  env: Env,
  history: ChatTurn[],
  message: string,
  logger: RagLogger,
): Promise<ChatRun> {
  // 1. Input guardrails — blocked attempts are not written to history.
  const guarded = guardUserInput(message);
  if (!guarded.ok) {
    logger.count(`guardrail_input:${guarded.reason}`, 1);
    logger.flush();
    return { persist: false, chunks: once(guarded.message) };
  }

  if (isGreeting(message)) {
    logger.count("greeting", 1);
    logger.flush();
    return { persist: true, chunks: once(GREETING_RESPONSE) };
  }

  // 2. Query analysis — off-topic/technical questions never reach the LLM.
  const analysis = analyzeQuery(message);
  if (analysis.offTopic) {
    logger.count("off_topic", 1);
    logger.flush();
    return { persist: true, chunks: once(SCOPE_RESPONSE) };
  }

  const query = retrievalQuery(history, message);
  const topics = query === message ? analysis.structuredTopics : analyzeQuery(query).structuredTopics;

  // 3–4. Structured (D1) + semantic (Vectorize) retrieval in parallel.
  const [structured, semantic] = await Promise.all([
    topics.length > 0 ? retrieveStructured(env.DB, topics) : Promise.resolve([]),
    analysis.needsVector
      ? semanticSearch(env, query, logger).catch((err: unknown) => {
          logger.count("semantic_error", 1);
          console.error("[chat] semantic retrieval failed:", err);
          return [];
        })
      : Promise.resolve([]),
  ]);
  logger.count("structured_items", structured.length);

  // 5–6. Context + system prompt; history gives the model the conversation.
  const assembled = assembleContext(structured, semantic);
  logger.count("final_context_items", assembled.items.length);
  const system = buildSystemMessages(SYSTEM_PROMPT, assembled);
  const turns: ChatTurn[] = [
    ...history.slice(-(CHAT.historyWindow - 1)),
    { role: "user", content: message },
  ];

  return { persist: true, chunks: generate(env, system, turns, assembled.plainText, assembled.items.length > 0, logger) };
}

/**
 * 7–8. Streams tokens at word boundaries, emitting only prefixes that pass
 * the output guardrails; a violation stops generation.
 */
async function* generate(
  env: Env,
  system: string,
  turns: ChatTurn[],
  contextText: string,
  groundNumbers: boolean,
  logger: RagLogger,
): AsyncGenerator<string> {
  logger.mark("llm_start");
  let acc = "";
  let emitted = 0;
  let violation: string | null = null;

  const safeCut = (force: boolean): string => {
    const pending = acc.slice(emitted);
    if (!pending) return "";
    let cut = pending.length;
    if (!force) {
      const ws = pending.search(/\s(?=\S)/);
      cut = ws === -1 ? 0 : ws + 1;
    }
    if (cut === 0) return "";
    if (checkOutputStreaming(acc.slice(0, emitted + cut), contextText, { groundNumbers })) return "";
    emitted += cut;
    return pending.slice(0, cut);
  };

  try {
    for await (const token of streamChat(env, system, turns)) {
      acc += token;
      violation = checkOutputStreaming(acc, contextText, { groundNumbers });
      if (violation) break;
      const out = safeCut(false);
      if (out) yield out;
    }
  } catch (err) {
    logger.count("llm_error", 1);
    logger.flush({ llmError: err instanceof Error ? err.message : "unknown" });
    yield acc.trim()
      ? "\n\nI couldn't finish that answer — please try again in a moment."
      : "I couldn't reach the assistant right now. Please try again in a moment.";
    return;
  }
  logger.mark("llm_done");

  if (violation) {
    logger.count(`guardrail_output:${violation}`, 1);
    // Nothing safe emitted → complete fallback; otherwise end at the last safe word.
    if (emitted === 0) yield GROUNDED_FALLBACK;
  } else if (!acc.trim()) {
    logger.count("guardrail_output:empty", 1);
    yield NO_RESPONSE_FALLBACK;
  } else {
    const rest = acc.slice(emitted);
    if (rest) yield rest;
  }
  logger.flush();
}
