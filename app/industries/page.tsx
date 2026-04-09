import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Industries — DiQualia",
  description:
    "DiQualia operates across niche B2B sectors with dedicated research practices built for each industry we enter.",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase text-primary">
      <span aria-hidden className="inline-block h-px w-8 bg-primary" />
      {children}
    </div>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="mt-8 text-foreground"
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 300,
        lineHeight: 1.02,
        fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
      }}
    >
      {children}
    </h1>
  );
}

export default function IndustriesPage() {
  const industries: Array<{ name: string; active: boolean }> = [
    { name: "Construction & Built Environment", active: true },
    { name: "Technical Services", active: true },
    { name: "Engineering & Infrastructure", active: true },
    { name: "Real Estate", active: false },
    { name: "Industrial & Manufacturing", active: false },
    { name: "Professional Services", active: false },
    { name: "Energy & Utilities", active: false },
    { name: "Logistics & Supply Chain", active: false },
    { name: "Healthcare Services", active: false },
    { name: "Legal & Compliance", active: false },
    { name: "Financial Services", active: false },
    { name: "SaaS & Technology", active: false },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(color-mix(in oklab, var(--gold) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--gold) 6%, transparent) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            opacity: 0.35,
          }}
        />
        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-20 md:pb-20 md:pt-28">
          <Eyebrow>Industries</Eyebrow>
          <H1>
            Deep expertise.
            <br />
            <em className="text-primary" style={{ fontStyle: "italic" }}>
              Broad reach.
            </em>
          </H1>
          <p className="mt-8 max-w-[72ch] text-[15px] leading-8 text-muted-foreground">
            We operate across a growing range of niche B2B sectors — with dedicated research practices built for each
            industry we enter.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/services" className="diq-btnGhost">
              Services
            </Link>
            <Link href="/contact" className="diq-btnGold">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_320px] md:items-start">
          <div>
            <div className="text-[13px] tracking-[0.06em] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              Sectors we actively research
            </div>
            <p className="mt-3 max-w-[70ch] text-[13px] leading-7 text-muted-foreground">
              Highlighted industries represent where we currently have active research practices and up-to-date market
              intelligence frameworks.
            </p>
          </div>
          <div
            className="border p-6"
            style={{
              borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
              background: "var(--bg-elev)",
            }}
          >
            <div className="text-[10px] tracking-[0.22em] uppercase text-primary">Active research</div>
            <p className="mt-3 text-[12px] leading-7 text-muted-foreground">
              If your niche isn’t listed, that’s okay — we can build the same depth quickly via immersion.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-2">
          {industries.map((x) => (
            <div
              key={x.name}
              className="border px-4 py-3 text-[11px] tracking-[0.18em] uppercase"
              style={{
                borderColor: x.active
                  ? "color-mix(in oklab, var(--green) 65%, transparent)"
                  : "color-mix(in oklab, var(--border) 80%, transparent)",
                background: "var(--bg-elev)",
                color: x.active ? "color-mix(in oklab, var(--green) 85%, var(--foreground))" : "var(--muted-foreground)",
              }}
            >
              {x.name}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t" style={{ background: "var(--bg)", borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div>
              <Eyebrow>Start here</Eyebrow>
              <div
                className="mt-4 text-foreground"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
                  lineHeight: 1.1,
                }}
              >
                Tell us your niche —
                <br />
                we’ll map your buyers.
              </div>
              <p className="mt-6 max-w-[62ch] text-[15px] leading-8 text-muted-foreground">
                A no-cost discovery call: 30 minutes, no pitch, just research. We’ll clarify your market, your buyers,
                and what intelligence-led growth would look like.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <Link href="/contact" className="diq-btnGold">
                Contact
              </Link>
              <Link href="/process" className="diq-btnGhost">
                How We Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

