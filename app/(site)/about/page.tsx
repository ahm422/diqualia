import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

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

function renderHeroHeadline(headline: string) {
  const dotIdx = headline.indexOf(". ");
  if (dotIdx === -1) return highlightIntelligence(headline);
  const line1 = headline.slice(0, dotIdx + 1);
  const line2 = headline.slice(dotIdx + 2);
  return (
    <>
      {line1}
      <br />
      {highlightIntelligence(line2)}
    </>
  );
}

function highlightIntelligence(text: string) {
  const word = "intelligence";
  const idx = text.toLowerCase().indexOf(word);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <em className="text-primary" style={{ fontStyle: "italic" }}>{text.slice(idx, idx + word.length)}</em>
      {text.slice(idx + word.length)}
    </>
  );
}

function renderWhereNextHeadline(headline: string) {
  const parts = headline.split(" — ");
  if (parts.length < 2) return <>{headline}</>;
  return (
    <>
      {parts[0]} —
      <br />
      {parts.slice(1).join(" — ")}
    </>
  );
}

export default async function AboutPage() {
  const [hero, builtForItems, whereNext] = await Promise.all([
    prisma.aboutHero.findUnique({ where: { id: 1 } }),
    prisma.aboutBuiltForItem.findMany({ orderBy: { order: "asc" } }),
    prisma.aboutWhereNext.findUnique({ where: { id: 1 } }),
  ]);

  if (!hero) notFound();

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
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <H1>{renderHeroHeadline(hero.headline)}</H1>
          <p className="mt-8 max-w-[68ch] text-[15px] leading-8 text-muted-foreground">
            {hero.body}
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
        <Eyebrow>What we&apos;re built for</Eyebrow>
        <H2>
          Intelligence that compounds —
          <br />
          not tactics that expire.
        </H2>

        <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-2" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
          {builtForItems.map((item) => (
            <div key={item.id} className="p-10" style={{ background: "var(--bg)" }}>
              <div className="text-[16px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                {item.title}
              </div>
              <p className="mt-3 text-[13px] leading-7 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {whereNext && (
        <section className="border-t" style={{ background: "var(--bg-elev)", borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <Eyebrow>{whereNext.eyebrow}</Eyebrow>
            <H2>{renderWhereNextHeadline(whereNext.headline)}</H2>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href={whereNext.btn1Href} className="diq-btnGhost">
                {whereNext.btn1Label}
              </Link>
              <Link href={whereNext.btn2Href} className="diq-btnGold">
                {whereNext.btn2Label}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
