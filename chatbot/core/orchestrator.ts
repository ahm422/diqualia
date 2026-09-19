/**
 * RAG orchestrator.
 *
 *   input validation → query analysis → structured retrieval (D1)
 *   → semantic retrieval (Qdrant) → context assembly → DeepSeek
 *   → incremental output guardrails → streamed plain-text response
 *
 * The final system prompt is supplied separately (chatbot/prompts/systemPrompt.ts or
 * CHAT_SYSTEM_PROMPT); this layer only injects the assembled context into it.
 */

import type { ChatbotDataSource } from "../models/datasource";
import { getRagConfig } from "../config/config";
import { assembleContext, buildSystemMessages } from "../rag/context/context";
import {
  guardUserInput,
  isGreeting,
  GREETING_RESPONSE,
} from "../guardrails/input";
import {
  checkOutputStreaming,
  GROUNDED_FALLBACK,
} from "../guardrails/output";
import { streamDeepSeekTokens, type ChatTurn } from "../llm/deepseek";
import type { RagLogger } from "../utils/logger";
import { embedQuery, searchPublic } from "../rag/vectorstore/qdrant";
import { analyzeQuery } from "../rag/retrieval/analyze";
import { retrieveStructured } from "../rag/retrieval/structured";

const NO_RESPONSE_FALLBACK =
  "I couldn't put an answer together just now. Please try again in a moment.";

const SCOPE_RESPONSE =
  "I'm the DiQualia website assistant, so I can only help with DiQualia — our services, industries, process, engagement models, careers and contact. For anything else, I won't be able to help. Ask me something about DiQualia.";

/** Runs the pipeline and returns the final text (used by scripts/tests). */
export async function runRagToText(
  prisma: ChatbotDataSource,
  history: ChatTurn[],
  logger: RagLogger,
): Promise<string> {
  const stream = await runRag(prisma, history, logger);
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return text.trim();
}

function textStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

export async function runRag(
  prisma: ChatbotDataSource,
  history: ChatTurn[],
  logger: RagLogger,
): Promise<ReadableStream<Uint8Array>> {
  const cfg = getRagConfig();
  const lastUser = history.filter((m) => m.role === "user").at(-1)?.content ?? "";

  // 1. Input guardrails.
  const guarded = guardUserInput(lastUser);
  if (!guarded.ok) {
    logger.count("guardrail_input", 1);
    logger.count(`guardrail_input:${guarded.reason}`, 1);
    return textStream(guarded.message);
  }

  // 1b. Greetings — instant reply, no LLM call.
  if (isGreeting(lastUser)) {
    logger.count("greeting", 1);
    return textStream(GREETING_RESPONSE);
  }

  // 2. Query analysis — general-knowledge and technical questions are
  //    blocked here and never reach the LLM.
  logger.mark("query_analysis");
  const analysis = analyzeQuery(lastUser);
  if (analysis.offTopic) {
    logger.count("off_topic", 1);
    logger.mark("guardrail_done");
    logger.flush();
    return textStream(SCOPE_RESPONSE);
  }

  // 3. Structured retrieval (D1 source of truth).
  let structured: Awaited<ReturnType<typeof retrieveStructured>> = [];
  if (analysis.structuredTopics.length > 0) {
    logger.mark("structured_start");
    structured = await retrieveStructured(prisma, analysis.structuredTopics);
    logger.mark("structured");
    logger.count("structured_items", structured.length);
  }

  // 4. Semantic retrieval (Qdrant, public visibility enforced server-side).
  let semantic: Awaited<ReturnType<typeof searchPublic>> = [];
  if (analysis.needsVector) {
    try {
      logger.mark("embed_start");
      const queryVector = await embedQuery(lastUser);
      logger.mark("embed");
      semantic = await searchPublic(queryVector, cfg.retrieval.candidateK);
      logger.mark("qdrant_search");
      logger.count("candidate_chunks", semantic.length);
    } catch (err) {
      logger.count("semantic_error", 1);
      // Fall back to structured-only retrieval; never expose internals.
      logger.flush({ semanticError: err instanceof Error ? err.message : "unknown" });
    }
  }

  // 5. Context assembly.
  logger.mark("context_assembly");
  const assembled = assembleContext(structured, semantic, cfg);
  logger.count("final_context_items", assembled.items.length);
  logger.mark("context_done");

  // 6. Build system prompt (supplied separately) + history.
  const systemPrompt = buildSystemMessages(cfg.systemPrompt, assembled);
  const historyWindow = history.slice(-20);

  // 7–8. Generate (streamed token-by-token) with incremental output
  //      guardrails. Unsafe content cuts the stream off mid-generation.
  logger.mark("llm_start");
  const encoder = new TextEncoder();
  // Strict numeric grounding only makes sense against retrieved DiQualia
  // context; general-knowledge answers (no context) skip price/stat checks.
  const groundNumbers = assembled.items.length > 0;
  let acc = "";
  // Chars of `acc` already enqueued. Tokens stream out incrementally at word
  // boundaries so the response appears token-by-token; only guardrail-safe
  // prefixes are ever sent, so a violation just stops further emission.
  let emitted = 0;
  let violation: string | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const flushSafe = (force: boolean): void => {
        const pending = acc.slice(emitted);
        if (!pending) return;
        const cut = force
          ? pending.length
          : (() => {
              const ws = pending.search(/\s(?=\S)/);
              return ws === -1 ? 0 : ws + 1;
            })();
        if (cut === 0) return;
        const candidate = acc.slice(0, emitted + cut);
        if (checkOutputStreaming(candidate, assembled.plainText, { groundNumbers })) return;
        controller.enqueue(encoder.encode(pending.slice(0, cut)));
        emitted += cut;
      };

      try {
        for await (const token of streamDeepSeekTokens(systemPrompt, historyWindow, cfg)) {
          acc += token;
          violation = checkOutputStreaming(acc, assembled.plainText, { groundNumbers });
          if (violation) break;
          flushSafe(false);
        }
      } catch (err) {
        logger.count("llm_error", 1);
        logger.mark("llm_done");
        logger.flush({ llmError: err instanceof Error ? err.message : "unknown" });
        controller.enqueue(
          encoder.encode(
            acc.trim()
              ? "\n\nI couldn't finish that answer — please try again in a moment."
              : "I couldn't reach the assistant right now. Please try again in a moment.",
          ),
        );
        controller.close();
        return;
      }
      logger.mark("llm_done");

      if (violation) {
        logger.count("guardrail_output", 1);
        logger.count(`guardrail_output:${violation}`, 1);
        if (emitted === 0) {
          // Nothing safe was emitted — fall back to a complete, helpful reply.
          controller.enqueue(encoder.encode(GROUNDED_FALLBACK));
        }
        // Otherwise the answer simply ends at the last complete sentence.
      } else {
        const rest = acc.slice(emitted);
        if (rest) controller.enqueue(encoder.encode(rest));
        if (!acc.trim()) {
          logger.count("guardrail_output", 1);
          logger.count("guardrail_output:empty", 1);
          controller.enqueue(encoder.encode(NO_RESPONSE_FALLBACK));
        }
      }
      logger.mark("guardrail_done");
      logger.flush();
      controller.close();
    },
  });

  return stream;
}
