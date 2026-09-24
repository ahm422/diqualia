export function EmptyState() {
  return (
    <div
      className="relative overflow-hidden rounded border px-8 py-14 text-center"
      style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 0%, color-mix(in oklab, var(--gold) 7%, transparent), transparent 60%)",
        }}
      />
      <div className="relative">
        <div
          className="flex items-center justify-center gap-3 text-[11px] tracking-[0.35em] uppercase"
          style={{ color: "var(--primary)" }}
        >
          <span
            aria-hidden
            className="inline-block h-px w-8"
            style={{ background: "var(--primary)" }}
          />
          Field notes
          <span
            aria-hidden
            className="inline-block h-px w-8"
            style={{ background: "var(--primary)" }}
          />
        </div>
        <p
          className="mx-auto mt-6 max-w-[36ch] text-foreground"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
            lineHeight: 1.25,
          }}
        >
          Nothing published just yet.
        </p>
        <p className="mx-auto mt-4 max-w-[46ch] text-[14px] leading-7 text-muted-foreground">
          We publish research notes and points of view when they are ready. Check back soon.
        </p>
      </div>
    </div>
  );
}
