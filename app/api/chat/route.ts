import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { CHAT_MAX_USER_CHARS, CHAT_SESSION_COOKIE } from "@/lib/chat/config";
import { getEnv } from "@/lib/cloudflare-env";

/**
 * Thin proxy to the diqualia-chatbot Worker (workers/chatbot) over the
 * CHATBOT service binding. This route only owns the session cookie; RAG,
 * guardrails, history, and rate limiting all live in the Worker.
 */

const ChatBodySchema = z.object({
  message: z.string().trim().min(1).max(CHAT_MAX_USER_CHARS),
});

const UNAVAILABLE = "The assistant is taking a break right now. Please try again in a minute.";

const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readSessionId(request: NextRequest): string | null {
  const value = request.cookies.get(CHAT_SESSION_COOKIE)?.value;
  return value && SESSION_ID_RE.test(value) ? value : null;
}

// The service binding needs an absolute URL; the host is ignored.
const CHATBOT_ORIGIN = "https://chatbot.internal";

function getClientIp(request: NextRequest) {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function cookieSecure() {
  return process.env.COOKIE_SECURE === "true"
    ? true
    : process.env.COOKIE_SECURE === "false"
      ? false
      : process.env.NODE_ENV === "production";
}

async function getChatbot() {
  const env = await getEnv();
  return env.CHATBOT ?? null;
}

function callChatbot(
  chatbot: Fetcher,
  path: string,
  sessionId: string,
  init: { method: string; body?: string; ip?: string },
) {
  const headers = new Headers({ "X-Session-Id": sessionId });
  if (init.ip) headers.set("X-Client-Ip", init.ip);
  if (init.body) headers.set("Content-Type", "application/json");
  return chatbot.fetch(`${CHATBOT_ORIGIN}${path}`, {
    method: init.method,
    headers,
    body: init.body,
  });
}

export async function POST(request: NextRequest) {
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
    return NextResponse.json(
      { error: "Your message looks too long or malformed. Please shorten it and try again." },
      { status: 400 },
    );
  }

  const chatbot = await getChatbot();
  if (!chatbot) {
    console.error("[chat] CHATBOT service binding is not configured.");
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
  }

  const existing = readSessionId(request);
  const sessionId = existing ?? crypto.randomUUID();

  let upstream: Response;
  try {
    upstream = await callChatbot(chatbot, "/chat", sessionId, {
      method: "POST",
      body: JSON.stringify({ message: parsed.data.message }),
      ip: getClientIp(request),
    });
  } catch (err) {
    console.error("[chat] chatbot Worker unreachable:", err);
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
  }

  const res = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
  if (!existing) {
    res.cookies.set(CHAT_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: cookieSecure(),
    });
  }
  return res;
}

/** Restores the current session's conversation for the widget. */
export async function GET(request: NextRequest) {
  const sessionId = readSessionId(request);
  const chatbot = await getChatbot();
  if (!sessionId || !chatbot) return NextResponse.json({ messages: [] });

  try {
    const upstream = await callChatbot(chatbot, "/history", sessionId, { method: "GET" });
    const data = (await upstream.json()) as { messages?: unknown };
    return NextResponse.json(
      { messages: Array.isArray(data.messages) ? data.messages : [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[chat] history fetch failed:", err);
    return NextResponse.json({ messages: [] });
  }
}

/** Clears the session history ("Clear chat"). */
export async function DELETE(request: NextRequest) {
  const sessionId = readSessionId(request);
  const chatbot = await getChatbot();
  if (sessionId && chatbot) {
    try {
      await callChatbot(chatbot, "/history", sessionId, { method: "DELETE" });
    } catch (err) {
      console.error("[chat] history clear failed:", err);
    }
  }
  return NextResponse.json({ ok: true });
}
