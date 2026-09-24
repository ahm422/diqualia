/**
 * diqualia-chatbot Worker.
 *
 * Reached only through the website's service binding (CHATBOT); it has no
 * public route. The website owns the session cookie and forwards:
 *   X-Session-Id  — visitor session (UUID) → ChatSession Durable Object
 *   X-Client-Ip   — for per-IP rate limiting
 *
 *   POST   /chat      {"message": "..."} → streamed text/plain answer
 *   GET    /history   → {"messages": [...]} for the session
 *   DELETE /history   → clears the session
 *   POST   /sync      {"force"?: true} → re-index now (normally cron does this)
 *   GET    /health
 */

import { CHAT } from "./config";
import { runChat } from "./orchestrator";
import { RagLogger } from "./utils/logger";

export { ChatSession } from "./session";
export { KbSync } from "./sync";

const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVERY_MINUTE = "* * * * *";

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function sessionStub(env: Env, request: Request) {
  const id = request.headers.get("X-Session-Id") ?? "";
  return SESSION_ID_RE.test(id) ? env.CHAT_SESSION.getByName(id.toLowerCase()) : null;
}

async function handleChat(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const session = sessionStub(env, request);
  if (!session) return json({ error: "Missing session." }, 400);

  const ip = request.headers.get("X-Client-Ip") || "unknown";
  const { success } = await env.CHAT_LIMITER.limit({ key: `chat:${ip}` });
  if (!success) return json({ error: "Too many requests — wait a moment and try again." }, 429);

  let message: unknown;
  try {
    message = ((await request.json()) as { message?: unknown }).message;
  } catch {
    message = undefined;
  }
  if (typeof message !== "string" || !message.trim() || message.length > CHAT.maxUserChars) {
    return json(
      { error: "Your message looks too long or malformed. Please shorten it and try again." },
      400,
    );
  }
  const text = message.trim();

  const requestId = crypto.randomUUID();
  const logger = new RagLogger(requestId);
  const history = await session.history(CHAT.historyWindow);
  const run = await runChat(env, history, text, logger);

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // The pump runs under waitUntil so the turn is saved even if the visitor
  // closes the widget mid-answer.
  const pump = async () => {
    let answer = "";
    let clientGone = false;
    try {
      for await (const chunk of run.chunks) {
        answer += chunk;
        if (!clientGone) {
          await writer.write(encoder.encode(chunk)).catch(() => {
            clientGone = true;
          });
        }
      }
    } catch (err) {
      console.error("[chat] stream failed:", err);
    } finally {
      await writer.close().catch(() => {});
    }
    if (run.persist && answer.trim()) {
      await session.append([
        { role: "user", content: text },
        { role: "assistant", content: answer.trim() },
      ]);
    }
  };
  ctx.waitUntil(pump());

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
    },
  });
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const { pathname } = new URL(request.url);
    const method = request.method;

    try {
      if (pathname === "/chat" && method === "POST") return await handleChat(request, env, ctx);

      if (pathname === "/history" && (method === "GET" || method === "DELETE")) {
        const session = sessionStub(env, request);
        if (!session) return json({ messages: [] });
        if (method === "DELETE") {
          await session.clear();
          return json({ ok: true });
        }
        return json({ messages: await session.history(CHAT.historyStored) });
      }

      if (pathname === "/sync" && method === "POST") {
        const body = (await request.json().catch(() => ({}))) as { force?: boolean };
        const outcome = await env.KB_SYNC.getByName("global").sync({
          force: body.force === true,
          always: true,
        });
        return json(outcome);
      }

      if (pathname === "/health") return json({ ok: true });
      return json({ error: "Not found" }, 404);
    } catch (err) {
      console.error(`[chatbot] ${method} ${pathname} failed:`, err);
      return json({ error: "The assistant is taking a break right now. Please try again in a minute." }, 503);
    }
  },

  async scheduled(controller, env): Promise<void> {
    // Every minute: drain the D1-trigger outbox. Every 6h: full hash reconcile.
    await env.KB_SYNC.getByName("global").sync({ always: controller.cron !== EVERY_MINUTE });
  },
} satisfies ExportedHandler<Env>;
