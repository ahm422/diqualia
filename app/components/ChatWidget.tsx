"use client";

import Link from "next/link";
import { Eraser, Send, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { NAV_COLLAPSE_MQ } from "@/lib/breakpoints";
import { renderMarkdown, stripDecorations } from "@/lib/markdown";
import { BrandLogo } from "./BrandLogo";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  { label: "Services", text: "What services does DiQualia offer?" },
  { label: "Industries", text: "Which industries do you work with?" },
  { label: "How we work", text: "How does DiQualia work with clients?" },
] as const;

function subscribeNavCollapse(onStoreChange: () => void) {
  const mq = window.matchMedia(NAV_COLLAPSE_MQ);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getNavCollapsed() {
  return window.matchMedia(NAV_COLLAPSE_MQ).matches;
}

function useIsNavCollapsed() {
  return useSyncExternalStore(subscribeNavCollapse, getNavCollapsed, () => false);
}

type ChatPanelProps = {
  listRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  messages: ChatMessage[];
  streaming: boolean;
  error: string | null;
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
  onClose: () => void;
  onChip: (text: string) => void;
};

function ChatPanel({
  listRef,
  inputRef,
  messages,
  streaming,
  error,
  input,
  setInput,
  onSubmit,
  onKeyDown,
  onClear,
  onClose,
  onChip,
}: ChatPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="diq-logo diq-logoLight shrink-0">
            <BrandLogo variant="black" width={56} decorative />
          </span>
          <span className="diq-logo diq-logoDark shrink-0">
            <BrandLogo variant="white" width={56} decorative />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium tracking-[0.08em] text-foreground">
              DiQualia
            </div>
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
              Assistant
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            disabled={streaming || messages.length === 0}
            aria-label="Clear chat"
          >
            <Eraser />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X />
          </Button>
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div>
            <p className="text-[13px] leading-6 text-muted-foreground">
              Ask about services, industries, or our process.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  disabled={streaming}
                  onClick={() => onChip(chip.text)}
                  className="border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
                  style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              {m.role === "user" ? (
                <div className="max-w-[85%] px-3 py-2 text-[13px] leading-6 bg-gold text-ink">
                  {m.content}
                </div>
              ) : (
                <div
                  className="max-w-[92%] px-3 py-2 text-[13px] leading-6 text-foreground [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-[15px] [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-[14px] [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-[13px] [&_h3]:font-semibold [&_strong]:font-semibold [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_code]:text-[12px] [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic"
                  style={{
                    background: "var(--bg-elev)",
                    border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
                  }}
                >
                  {m.content ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(stripDecorations(m.content)),
                      }}
                    />
                  ) : streaming && i === messages.length - 1 ? (
                    "…"
                  ) : null}
                </div>
              )}
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
        onSubmit={onSubmit}
        className="border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <div className="flex items-end gap-2">
          <label className="block min-w-0 flex-1">
            <span className="sr-only">Message</span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              maxLength={1000}
              disabled={streaming}
              placeholder="Ask a question…"
              className="w-full resize-none border bg-transparent px-3 py-2 text-[13px] text-foreground outline-none"
              style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
            />
          </label>
          <Button
            type="submit"
            variant="primary"
            size="icon"
            disabled={streaming || !input.trim()}
            aria-label={streaming ? "Sending" : "Send message"}
          >
            <Send />
          </Button>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
          For proposals or calls →{" "}
          <Link href="/contact" className="text-primary underline-offset-2 hover:underline">
            Contact
          </Link>
        </p>
      </form>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const isNavCollapsed = useIsNavCollapsed();

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, streaming]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (wasOpen.current && !open) {
      launcherRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open || isNavCollapsed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isNavCollapsed]);

  const close = useCallback(() => setOpen(false), []);

  function clearChat() {
    if (streaming) return;
    setMessages([]);
    setError(null);
    setInput("");
  }

  async function sendUserText(raw: string) {
    const text = raw.trim();
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
        try {
          const data = (await res.json()) as { error?: string };
          if (typeof data?.error === "string" && data.error.length > 0) {
            message = data.error;
          } else if (res.status === 429) {
            message = "Too many requests — wait a moment and try again.";
          } else if (res.status === 503) {
            message = "Assistant is temporarily unavailable.";
          }
        } catch {
          if (res.status === 429) {
            message = "Too many requests — wait a moment and try again.";
          } else if (res.status === 503) {
            message = "Assistant is temporarily unavailable.";
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

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void sendUserText(input);
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendUserText(input);
    }
  }

  const panel = (
    <ChatPanel
      listRef={listRef}
      inputRef={inputRef}
      messages={messages}
      streaming={streaming}
      error={error}
      input={input}
      setInput={setInput}
      onSubmit={onSubmit}
      onKeyDown={onKeyDown}
      onClear={clearChat}
      onClose={close}
      onChip={(text) => void sendUserText(text)}
    />
  );

  return (
    <>
      {isNavCollapsed ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            hideClose
            className="flex h-[100dvh] w-full flex-col gap-0 border-0 p-0 sm:max-w-none"
          >
            <SheetTitle className="sr-only">DiQualia assistant</SheetTitle>
            <SheetDescription className="sr-only">Ask about DiQualia</SheetDescription>
            {panel}
          </SheetContent>
        </Sheet>
      ) : null}

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {!isNavCollapsed && open ? (
          <div
            className="diq-fadeUp flex w-[min(100vw-2.5rem,22rem)] flex-col overflow-hidden border shadow-sm"
            style={{
              borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
              background: "var(--bg-elev)",
              maxHeight: "min(70vh, 32rem)",
              height: "min(70vh, 32rem)",
            }}
            role="dialog"
            aria-label="DiQualia assistant"
          >
            {panel}
          </div>
        ) : null}

        {!(open && isNavCollapsed) ? (
          <Button
            ref={launcherRef}
            type="button"
            variant={open ? "ghost" : "secondary"}
            size={open ? "icon" : "default"}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close chat assistant" : "Open chat assistant"}
            aria-expanded={open}
          >
            {open ? <X /> : "Ask DiQualia"}
          </Button>
        ) : null}
      </div>
    </>
  );
}
