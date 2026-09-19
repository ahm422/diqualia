import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  CHAT_MAX_MESSAGES,
  CHAT_MAX_USER_CHARS,
  CHAT_RATE_LIMIT,
} from "@/lib/chat/config";
import { getDb } from "@/lib/cloudflare-env";
import { runChat, getRagConfig } from "@/chatbot/api";
import { RagLogger } from "@/chatbot/utils/logger";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(CHAT_MAX_USER_CHARS),
});

const ChatBodySchema = z
  .object({
    messages: z.array(MessageSchema).min(1).max(CHAT_MAX_MESSAGES + 5),
  })
  .superRefine((val, ctx) => {
    const last = val.messages[val.messages.length - 1];
    if (!last || last.role !== "user") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Last message must be from the user.",
        path: ["messages"],
      });
    }
  });

function getClientIp(request: NextRequest) {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({
    key: `chat:${ip}`,
    limit: CHAT_RATE_LIMIT.limit,
    windowMs: CHAT_RATE_LIMIT.windowMs,
  });
  if (!rl.ok) return rateLimitResponse(rl.resetAtMs);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Something went wrong with your message. Please try again." },
      { status: 400 },
    );
  }

  const parsed = ChatBodySchema.safeParse(json);
  if (!parsed.success) {
    // Log details server-side; return a friendly message to the client.
    console.error("[chat] Validation failed:", parsed.error.flatten());
    return NextResponse.json(
      {
        error:
          "Your message looks too long or malformed. Please shorten it and try again.",
      },
      { status: 400 },
    );
  }

  const trimmed = parsed.data.messages.slice(-CHAT_MAX_MESSAGES);

  // ── RAG pipeline (input guardrails → retrieval → DeepSeek → output guardrails)
  const ragCfg = getRagConfig();
  if (!ragCfg.enabled) {
    console.error(
      "[chat] RAG is not configured (DEEPSEEK_API_KEY / QDRANT_URL / EMBEDDINGS_API_KEY). Refusing to serve an unguarded model.",
    );
    return NextResponse.json(
      { error: "The assistant is taking a break right now. Please try again in a minute." },
      { status: 503 },
    );
  }

  const requestId = crypto.randomUUID();
  const logger = new RagLogger(requestId);
  try {
    const prisma = await getDb();
    const stream = await runChat(
      prisma,
      trimmed.map((m) => ({ role: m.role, content: m.content })),
      logger,
    );
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
      },
    });
  } catch (err) {
    console.error("[chat][rag] Failed:", err);
    logger.count("route_error", 1);
    logger.flush();
    return NextResponse.json(
      { error: "The assistant is taking a break right now. Please try again in a minute." },
      { status: 503 },
    );
  }
}
