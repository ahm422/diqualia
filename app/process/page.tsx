import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How We Work — DiQualia",
  description:
    "DiQualia’s process is research-first: sector immersion, buyer mapping, intelligence briefs, precision execution, and continuous refinement.",
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

export default function ProcessPage() {
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
          <Eyebrow>How We Work</Eyebrow>
          <H1>
            Research.
            <br />
            <em className="text-primary" style={{ fontStyle: "italic" }}>
              Precision.
            </em>{" "}
            Results.
          </H1>
          <p className="mt-8 max-w-[70ch] text-[15px] leading-8 text-muted-foreground">
            We don’t start with tactics. We start with intelligence — then build everything on top of it. Here’s the
            process we follow to ensure your positioning, outreach, and pipeline growth are evidence-led.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/services" className="diq-btnGhost">
              Services
            </Link>
            <Link href="/contact" className="diq-btnGold">
              Start a Discovery Call
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-px md:grid-cols-5" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
          {[
            [
              "Step One",
              "01",
              "Sector Immersion",
              "We start by learning your industry — language, buying cycles, competitive dynamics, and decision drivers. No strategy until we know the market.",
            ],
            [
              "Step Two",
              "02",
              "Buyer Mapping",
              "We identify and profile your ideal buyers — roles, triggers, objections, and what moves them from interest to action.",
            ],
            [
              "Step Three",
              "03",
              "Intelligence Brief",
              "We compile research into a clear intelligence brief — market map, ICP, positioning, and a plan that prioritizes what will move pipeline.",
            ],
            [
              "Step Four",
              "04",
              "Precision Execution",
              "Outreach, content, enablement, and campaigns are designed around the intelligence — calibrated to your buyers and your category.",
            ],
            [
              "Step Five",
              "05",
              "Refine & Scale",
              "We track signals, report with clarity, and refine the system — so each cycle improves the next and growth compounds over time.",
            ],
          ].map(([tag, num, title, body]) => (
            <div key={num} className="p-8" style={{ background: "var(--bg-elev)" }}>
              <div className="text-[10px] tracking-[0.22em] uppercase text-primary">{tag}</div>
              <div
                className="mt-4 text-[36px] leading-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  color: "color-mix(in oklab, var(--gold) 18%, transparent)",
                }}
              >
                {num}
              </div>
              <div className="mt-4 text-[13px] tracking-[0.06em] text-foreground">{title}</div>
              <p className="mt-3 text-[12px] leading-7 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t" style={{ background: "var(--bg)", borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div>
              <Eyebrow>Next</Eyebrow>
              <div
                className="mt-4 text-foreground"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
                  lineHeight: 1.1,
                }}
              >
                See what this looks like
                <br />
                in your market.
              </div>
              <p className="mt-6 max-w-[60ch] text-[15px] leading-8 text-muted-foreground">
                We’ll run a short discovery call, learn your niche, and outline what an intelligence-first engagement
                would produce for your pipeline.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <Link href="/contact" className="diq-btnGold">
                Contact
              </Link>
              <Link href="/industries" className="diq-btnGhost">
                Industries
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

