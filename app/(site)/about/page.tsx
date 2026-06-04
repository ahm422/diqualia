import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — DiQualia",
  description:
    "DiQualia is a marketing intelligence and research unit for niche B2B companies — built to deliver research-first strategy and precision pipeline growth.",
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

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-4 text-foreground"
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 300,
        fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
        lineHeight: 1.1,
      }}
    >
      {children}
    </h2>
  );
}

export default function AboutPage() {
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
          <Eyebrow>About</Eyebrow>
          <H1>
            Not an agency.
            <br />
            An <em className="text-primary" style={{ fontStyle: "italic" }}>intelligence</em> unit.
          </H1>
          <p className="mt-8 max-w-[68ch] text-[15px] leading-8 text-muted-foreground">
            DiQualia operates at the intersection of deep market research and precision go-to-market strategy. We immerse
            ourselves in your sector before we touch a single campaign — so your marketing decisions are grounded in
            evidence, not assumption.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/services" className="diq-btnGold">
              Explore Services
            </Link>
            <Link href="/contact" className="diq-btnGhost">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <Eyebrow>What we’re built for</Eyebrow>
        <H2>
          Intelligence that compounds —
          <br />
          not tactics that expire.
        </H2>

        <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-2" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
          {[
            [
              "Research Before Everything",
              "Every engagement begins with deep sector immersion. No strategy until we know your market as well as you do — often better.",
            ],
            [
              "Precision Over Volume",
              "We don’t generate noise. We identify the exact buyers who are ready, able, and willing to engage — then reach them with purpose.",
            ],
            [
              "Intelligence That Compounds",
              "The intelligence we build doesn’t expire. Every engagement makes the next one faster, sharper, and more effective.",
            ],
            [
              "Built to Scale Across Niches",
              "We grow with you — from one niche to many, one market to several, without ever losing the depth that makes intelligence valuable.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="p-10" style={{ background: "var(--bg)" }}>
              <div className="text-[16px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                {title}
              </div>
              <p className="mt-3 text-[13px] leading-7 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t" style={{ background: "var(--bg-elev)", borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <Eyebrow>Where next</Eyebrow>
          <H2>
            See how we work —
            <br />
            then start with intelligence.
          </H2>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/process" className="diq-btnGhost">
              How We Work
            </Link>
            <Link href="/contact" className="diq-btnGold">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

