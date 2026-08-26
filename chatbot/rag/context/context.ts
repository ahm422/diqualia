/**
 * Context assembly.
 *
 * Merges structured facts (perfect score) with semantic retrieval results,
 * dedupes, drops low-relevance chunks, respects a token budget, and renders a
 * clean context block for the LLM. Also produces a plain concatenated text
 * used by the output guardrail for grounding checks.
 */

import type { RagConfig } from "../../config/config";
import { estimateTokens } from "../ingestion/chunking";
import type { RetrievedContextItem } from "../../models/types";

export type AssembledContext = {
  items: RetrievedContextItem[];
  promptBlock: string;
  plainText: string;
  totalTokens: number;
};

function dedupe(items: RetrievedContextItem[]): RetrievedContextItem[] {
  const seen = new Set<string>();
  const out: RetrievedContextItem[] = [];
  for (const item of items) {
    const key = `${item.contentType}:${item.title}:${item.section ?? ""}:${item.content.slice(0, 120)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function assembleContext(
  structured: RetrievedContextItem[],
  semantic: RetrievedContextItem[],
  cfg: RagConfig,
): AssembledContext {
  // Structured facts carry score 1 and always outrank vector chunks.
  const merged = dedupe([...structured, ...semantic])
    .filter((item) => item.score >= cfg.retrieval.scoreFloor)
    .sort((a, b) => b.score - a.score);

  const items: RetrievedContextItem[] = [];
  let totalTokens = 0;
  for (const item of merged) {
    const tokens = estimateTokens(item.content);
    if (totalTokens + tokens > cfg.retrieval.maxContextTokens && items.length > 0) break;
    items.push(item);
    totalTokens += tokens;
  }

  const block = items
    .map((item) => {
      const section = item.section ? ` (${item.section})` : "";
      const url = item.sourceUrl ? `\nSource: ${item.sourceUrl}` : "";
      return `### [${item.contentType}] ${item.title}${section}${url}\n${item.content}`;
    })
    .join("\n\n");

  const plainText = items.map((item) => item.content).join("\n");

  return { items, promptBlock: block, plainText, totalTokens };
}

/** Injects the assembled context into the (separately supplied) system prompt. */
export function buildSystemMessages(
  basePrompt: string,
  context: AssembledContext,
): string {
  const trimmedBase = basePrompt.trim();
  if (trimmedBase.includes("{{context}}")) {
    return trimmedBase.replace(/\{\{context\}\}/g, context.promptBlock || "(No retrieved context.)");
  }
  const contextSection = context.promptBlock
    ? `\n\n## Retrieved DiQualia context\n\n${context.promptBlock}`
    : "\n\n## Retrieved DiQualia context\n\n(No retrieved context — answer from the public site knowledge only, and say when the website does not specify something.)";
  return `${trimmedBase}${contextSection}`;
}
