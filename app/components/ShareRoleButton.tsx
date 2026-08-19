"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

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
    <Button
      type="button"
      onClick={share}
      variant="ghost"
      size="sm"
      className="h-auto justify-start px-0 text-muted-foreground hover:text-primary"
    >
      {copied ? "Link copied" : "Share this role"}
    </Button>
  );
}
