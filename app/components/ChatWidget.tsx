"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, streaming]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function clearChat() {
    if (streaming) return;
    setMessages([]);
    setError(null);
    setInput("");
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    setError(null);
    setInput("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        let message = "Something went wrong. Please try again.";
        if (res.status === 429) {
          message = "Too many requests — wait a moment and try again.";
        } else if (res.status === 503) {
          message = "Assistant is temporarily unavailable.";
        } else {
          try {
            const data = (await res.json()) as { error?: string };
            if (data?.error) message = data.error;
          } catch {
            // keep default
          }
        }
        setMessages(nextMessages);
        setError(message);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setMessages(nextMessages);
        setError("No response stream.");
        return;
      }

      const decoder = new TextDecoder();
      let assistant = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        const snapshot = assistant;
        setMessages([...nextMessages, { role: "assistant", content: snapshot }]);
      }

      assistant += decoder.decode();
      if (!assistant.trim()) {
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: "I don’t have enough site content for that. Try /services or /contact.",
          },
        ]);
      } else {
        setMessages([...nextMessages, { role: "assistant", content: assistant }]);
      }
    } catch (err) {
      setMessages(nextMessages);
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setStreaming(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div
          className="flex w-[min(100vw-2.5rem,22rem)] flex-col overflow-hidden border shadow-sm"
          style={{
            borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
            background: "var(--bg-elev)",
            maxHeight: "min(70vh, 32rem)",
          }}
          role="dialog"
          aria-label="DiQualia assistant"
        >
          <div
            className="flex items-center justify-between gap-3 border-b px-4 py-3"
            style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
          >
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-primary">Assistant</div>
              <div className="mt-1 text-[12px] text-muted-foreground">Ask about DiQualia</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={clearChat}
                disabled={streaming || messages.length === 0}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                Close
              </Button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <p className="text-[13px] leading-6 text-muted-foreground">
                Ask about services, industries, or our process.
              </p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={m.role === "user" ? "text-right" : "text-left"}
                >
                  <div
                    className={`inline-block max-w-[95%] px-3 py-2 text-[13px] leading-6 ${
                      m.role === "user" ? "text-foreground" : "text-foreground"
                    }`}
                    style={
                      m.role === "user"
                        ? {
                            border: "1px solid color-mix(in oklab, var(--gold) 45%, transparent)",
                            background: "color-mix(in oklab, var(--gold) 8%, transparent)",
                          }
                        : {
                            border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
                          }
                    }
                  >
                    {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
                  </div>
                </div>
              ))
            )}
            {error ? (
              <p className="text-[12px] leading-6 text-muted-foreground" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <form
            onSubmit={sendMessage}
            className="border-t px-4 py-3"
            style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
          >
            <label className="block">
              <span className="sr-only">Message</span>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                maxLength={2000}
                disabled={streaming}
                placeholder="Ask a question…"
                className="w-full resize-none border bg-transparent px-3 py-2 text-[13px] text-foreground outline-none"
                style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
              />
            </label>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-[11px] leading-5 text-muted-foreground">
                For proposals or calls →{" "}
                <Link href="/contact" className="text-primary underline-offset-2 hover:underline">
                  Contact
                </Link>
              </p>
              <Button type="submit" variant="secondary" size="sm" disabled={streaming || !input.trim()}>
                {streaming ? "…" : "Send"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
      >
        {open ? "Chat" : "Ask DiQualia"}
      </Button>
    </div>
  );
}
