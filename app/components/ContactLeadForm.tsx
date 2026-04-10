"use client";

import { useMemo, useState } from "react";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

export function ContactLeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const canSubmit = useMemo(() => {
    const hasEmail = email.trim().length > 0;
    const hasMessage = message.trim().length > 0;
    return hasEmail || hasMessage;
  }, [email, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || state.status === "submitting") return;

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          source: "contact-page",
          website,
        }),
      });

      const data = (await res.json()) as unknown;
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data && typeof (data as any).error === "string"
            ? (data as any).error
            : "Submission failed";
        setState({ status: "error", message: msg });
        return;
      }

      const id = typeof (data as any)?.id === "string" ? (data as any).id : "";
      setState({ status: "success", id });
      setName("");
      setEmail("");
      setMessage("");
      setWebsite("");
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Submission failed" });
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border p-10"
      style={{
        borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
        background: "var(--bg-elev)",
      }}
    >
      <div className="text-[10px] tracking-[0.22em] uppercase text-primary">Send a message</div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
            placeholder="Your name"
            maxLength={200}
            autoComplete="name"
          />
        </label>

        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
            placeholder="you@company.com"
            maxLength={254}
            inputMode="email"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Message</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2 min-h-[140px] w-full resize-y border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
            placeholder="What are you trying to figure out?"
            maxLength={5000}
          />
        </label>

        {/* Honeypot field: hidden from humans */}
        <div className="hidden" aria-hidden>
          <label>
            Website
            <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="submit" className="diq-btnGhost" disabled={!canSubmit || state.status === "submitting"}>
          {state.status === "submitting" ? "Sending…" : "Send"}
        </button>
        <div className="text-[12px] leading-7 text-muted-foreground">
          {state.status === "idle" ? "Email or message is required." : null}
          {state.status === "success" ? "Received — we’ll reply with next steps." : null}
          {state.status === "error" ? state.message : null}
        </div>
      </div>
      {state.status === "success" ? (
        <div className="mt-4 text-[11px] text-muted-foreground">
          Reference: <span className="font-mono">{state.id}</span>
        </div>
      ) : null}
    </form>
  );
}

