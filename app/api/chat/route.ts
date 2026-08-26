import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { buildSystemPrompt } from "@/lib/chat/buildSystemPrompt";
import {
  CHAT_MAX_MESSAGES,
  CHAT_MAX_USER_CHARS,
  CHAT_MODEL,
  CHAT_RATE_LIMIT,
} from "@/lib/chat/config";
import { getAI, getDb } from "@/lib/cloudflare-env";
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
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Workers AI `stream: true` yields SSE (`data: {"response":"..."}`).
 * Transform to plain token text for a simpler client (`text/plain` stream).
 */
function sseToPlainText(aiStream: ReadableStream): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return aiStream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload) as { response?: string };
            if (typeof parsed.response === "string" && parsed.response.length > 0) {
              controller.enqueue(encoder.encode(parsed.response));
            }
          } catch {
            // skip malformed SSE chunks
          }
        }
      },
      flush(controller) {
        const line = buffer.trim();
        if (!line.startsWith("data:")) return;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") return;
        try {
          const parsed = JSON.parse(payload) as { response?: string };
          if (typeof parsed.response === "string" && parsed.response.length > 0) {
            controller.enqueue(encoder.encode(parsed.response));
          }
        } catch {
          // ignore
        }
      },
    }),
  );
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ChatBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const trimmed = parsed.data.messages.slice(-CHAT_MAX_MESSAGES);

  // ── RAG path (DeepSeek + Qdrant + Qwen embeddings) ───────────────────────
  // Enabled only when the server-side RAG env vars are configured. Uses the
  // existing frontend contract: POST { messages } → text/plain stream.
  const ragCfg = getRagConfig();
  if (ragCfg.enabled) {
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
      return NextResponse.json({ error: "Assistant temporarily unavailable." }, { status: 503 });
    }
  }

  // ── Legacy Workers AI path (kept as fallback when RAG is not configured) ─
  let ai: Ai | undefined;
  try {
    ai = await getAI();
  } catch (err) {
    console.error("[chat] Failed to resolve AI binding:", err);
    return NextResponse.json({ error: "AI unavailable" }, { status: 503 });
  }

  if (!ai) {
    return NextResponse.json({ error: "AI unavailable" }, { status: 503 });
  }

  let systemPrompt: string;
  try {
    systemPrompt = await buildSystemPrompt();
  } catch (err) {
    console.error("[chat] Failed to build system prompt:", err);
    return NextResponse.json({ error: "Failed to load site content" }, { status: 500 });
  }

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...trimmed.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const result = await ai.run(CHAT_MODEL, {
      messages,
      stream: true,
    });

    // Binding returns ReadableStream when stream: true
    if (!(result instanceof ReadableStream)) {
      console.error("[chat] Unexpected non-stream AI response");
      return NextResponse.json({ error: "Inference failed" }, { status: 500 });
    }

    const body = sseToPlainText(result as ReadableStream<Uint8Array>);

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[chat] Inference failed:", err);
    return NextResponse.json({ error: "Inference failed" }, { status: 500 });
  }
}
