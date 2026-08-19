"use client";

import { useState } from "react";

export function ShareRoleButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: `${title} — DiQualia`, url });
        return;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="text-left text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-primary"
      style={{ color: "var(--text-muted)" }}
    >
      {copied ? "Link copied" : "Share this role"}
    </button>
  );
}
