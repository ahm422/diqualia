import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      className="mt-auto"
      style={{
        background: "var(--bg-elev)",
        borderTop: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="text-[12px] tracking-[0.06em]" style={{ color: "var(--text-muted)" }}>
          © 2026 DiQualia. Marketing Intelligence &amp; Research.
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          <Link
            href="/privacy"
            className="text-[11px] tracking-[0.18em] uppercase no-underline"
            style={{ color: "var(--text-muted)" }}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-[11px] tracking-[0.18em] uppercase no-underline"
            style={{ color: "var(--text-muted)" }}
          >
            Terms
          </Link>
          <a
            href="mailto:intel@diqualia.com"
            className="text-[11px] tracking-[0.18em] uppercase no-underline"
            style={{ color: "var(--text-muted)" }}
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

