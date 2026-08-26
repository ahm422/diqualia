/**
 * DeepSeek generation client (backend only).
 *
 * DeepSeek is OpenAI-compatible, so we use LangChain's ChatOpenAI pointed at
 * the DeepSeek base URL. The API key and model come from environment
 * variables and are never exposed to the browser.
 */


import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";

import type { RagConfig } from "../config/config";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export function toLangChainMessages(
  system: string,
  history: ChatTurn[],
): BaseMessage[] {
  const messages: BaseMessage[] = [new SystemMessage(system)];
  for (const turn of history) {
    if (turn.role === "user") messages.push(new HumanMessage(turn.content));
    else messages.push(new AIMessage(turn.content));
  }
  return messages;
}

export async function generateDeepSeek(
  system: string,
  history: ChatTurn[],
  cfg: RagConfig,
  onToken?: (token: string) => void,
): Promise<string> {
  const model = new ChatOpenAI({
    model: cfg.deepseek.model,
    apiKey: cfg.deepseek.apiKey,
    temperature: cfg.deepseek.temperature,
    maxTokens: cfg.deepseek.maxTokens,
    timeout: cfg.deepseek.timeoutMs,
    maxRetries: 2,
    configuration: {
      baseURL: cfg.deepseek.baseUrl,
    },
  });

  const messages = toLangChainMessages(system, history);

  if (onToken) {
    let full = "";
    const stream = await model.stream(messages);
    for await (const chunk of stream) {
      const delta = typeof chunk.content === "string" ? chunk.content : "";
      if (delta) {
        full += delta;
        onToken(delta);
      }
    }
    return full;
  }

  const response = await model.invoke(messages);
  const content = response.content;
  return typeof content === "string" ? content : JSON.stringify(content);
}

/**
 * Streams DeepSeek tokens as they arrive. Breaking out of the iteration
 * aborts the upstream request, so callers can cut generation off early
 * (e.g. when an output guardrail trips mid-stream).
 */
export async function* streamDeepSeekTokens(
  system: string,
  history: ChatTurn[],
  cfg: RagConfig,
): AsyncGenerator<string> {
  const model = new ChatOpenAI({
    model: cfg.deepseek.model,
    apiKey: cfg.deepseek.apiKey,
    temperature: cfg.deepseek.temperature,
    maxTokens: cfg.deepseek.maxTokens,
    timeout: cfg.deepseek.timeoutMs,
    maxRetries: 2,
    configuration: {
      baseURL: cfg.deepseek.baseUrl,
    },
  });

  const messages = toLangChainMessages(system, history);
  const stream = await model.stream(messages);
  for await (const chunk of stream) {
    const delta = typeof chunk.content === "string" ? chunk.content : "";
    if (delta) yield delta;
  }
}
