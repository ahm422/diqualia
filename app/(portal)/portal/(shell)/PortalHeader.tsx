"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PortalHeader({ email }: { email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    try {
      await fetch("/api/portal/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore — cookies are cleared server-side regardless */
    }
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-[var(--diq_border)] px-4 py-3 md:px-8">
      <Link href="/portal" className="font-mono text-xs uppercase tracking-widest text-[var(--gold)]">
        DiQualia · Applications
      </Link>
      <div className="flex items-center gap-4 text-sm text-[var(--diq_mid)]">
        <span className="hidden sm:inline">{email}</span>
        <button
          type="button"
          onClick={signOut}
          disabled={loading}
          className="rounded-md border border-[var(--diq_border)] px-3 py-1 text-xs hover:border-[var(--gold)] disabled:opacity-50"
        >
          {loading ? "…" : "Sign out"}
        </button>
      </div>
    </header>
  );
}
