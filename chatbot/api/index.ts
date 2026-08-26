/**
 * Chatbot public API — the only entry point the application should use.
 *
 * The rest of DiQualia talks to the chatbot through this thin boundary:
 *   import { runChat } from "@/chatbot/api";
 *
 * Everything below this folder is self-contained; the application only
 * supplies its D1 data source (the Prisma client) and the conversation.
 */
import type { ChatbotDataSource } from "../models/datasource";
import type { RagLogger } from "../utils/logger";
import { runRag as runChat, runRagToText } from "../core/orchestrator";
import { getRagConfig } from "../config/config";
import type { ChatTurn } from "../llm/deepseek";
import type { RagConfig } from "../config/config";

export {
  runChat,
  runRagToText,
  getRagConfig,
};
export type { ChatbotDataSource, RagLogger, ChatTurn, RagConfig };
