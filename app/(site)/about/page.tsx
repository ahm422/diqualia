import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/components/Container";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description:
    "DiQualia is a marketing intelligence and research unit for niche B2B companies — built to deliver research-first strategy and precision pipeline growth.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About DiQualia",
    description:
      "DiQualia is a marketing intelligence and research unit for niche B2B companies — built to deliver research-first strategy and precision pipeline growth.",
    url: "/about",
  },
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
  const prisma = await getDb();
  const [hero, builtForSection, builtForItems, whereNext] = await Promise.all([
    prisma.aboutHero.findUnique({ where: { id: 1 } }),
    prisma.aboutBuiltForSection.findUnique({ where: { id: 1 } }),
    prisma.aboutBuiltForItem.findMany({ orderBy: { order: "asc" } }),
    prisma.aboutWhereNext.findUnique({ where: { id: 1 } }),
  ]);

  if (!hero) notFound();

  return (
    <div>
      <section id="hero" className="relative overflow-hidden border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
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
        <Container className="relative pb-16 pt-20 md:pb-20 md:pt-28">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <H1>{renderHeroHeadline(hero.headline)}</H1>
          <p className="mt-8 max-w-[68ch] text-[15px] leading-8 text-muted-foreground">
            {hero.body}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild variant="primary">
              <Link href="/services">Explore Services</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/contact">Talk to Us</Link>
            </Button>
          </div>
        </Container>
      </section>

      <Container as="section" id="built-for" className="py-20">
        <Eyebrow>{builtForSection?.eyebrow ?? "What we're built for"}</Eyebrow>
        <H2>
          {builtForSection?.headlineLine1 ?? "Intelligence that compounds —"}
          <br />
          {builtForSection?.headlineLine2 ?? "not tactics that expire."}
        </H2>

        <div className="mt-12 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
          {builtForItems.map((item) => (
            <div key={item.id} className="p-10" style={{ background: "var(--bg)" }}>
              <div className="text-[16px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                {item.title}
              </div>
              <p className="mt-3 text-[13px] leading-7 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>

      {whereNext && (
        <section id="where-next" className="border-t" style={{ background: "var(--bg-elev)", borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
          <Container className="py-20">
            <Eyebrow>{whereNext.eyebrow}</Eyebrow>
            <H2>{renderWhereNextHeadline(whereNext.headline)}</H2>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="secondary">
                <Link href={whereNext.btn1Href}>{whereNext.btn1Label}</Link>
              </Button>
              <Button asChild variant="primary">
                <Link href={whereNext.btn2Href}>{whereNext.btn2Label}</Link>
              </Button>
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
