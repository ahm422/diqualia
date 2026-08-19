import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/components/Container";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

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

export default async function IndustriesPage() {
  const prisma = await getDb();
  const [page, sectors] = await Promise.all([
    prisma.industriesPage.findUnique({ where: { id: 1 } }),
    prisma.industrySector.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!page) notFound();

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
        <Container className="relative pb-16 pt-20 md:pb-20 md:pt-28">
          <Eyebrow>{page.eyebrow}</Eyebrow>
          <H1>
            {page.headlineLine1}
            <br />
            <em className="text-primary" style={{ fontStyle: "italic" }}>
              {page.headlineLine2}
            </em>
          </H1>
          <p className="mt-8 max-w-[72ch] text-[15px] leading-8 text-muted-foreground">
            {page.body}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild variant="secondary">
              <Link href="/services">Services</Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/contact">Talk to Us</Link>
            </Button>
          </div>
        </Container>
      </section>

      <Container as="section" className="py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_320px] md:items-start">
          <div>
            <div className="text-[13px] tracking-[0.06em] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              {page.sectorsLabel}
            </div>
            <p className="mt-3 max-w-[70ch] text-[13px] leading-7 text-muted-foreground">
              {page.sectorsDescription}
            </p>
          </div>
          <div
            className="border p-6"
            style={{
              borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
              background: "var(--bg-elev)",
            }}
          >
            <div className="text-[10px] tracking-[0.22em] uppercase text-primary">{page.sidebarLabel}</div>
            <p className="mt-3 text-[12px] leading-7 text-muted-foreground">
              {page.sidebarCopy}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-2">
          {sectors.map((sector) => {
            const className = "max-w-full min-w-0 break-words border px-4 py-3 text-[11px] tracking-[0.18em] uppercase";
            const style = {
              borderColor: sector.visible
                ? "color-mix(in oklab, var(--gold) 65%, transparent)"
                : "color-mix(in oklab, var(--border) 80%, transparent)",
              background: "var(--bg-elev)",
              color: sector.visible
                ? "var(--gold)"
                : "var(--muted-foreground)",
            } as const;

            if (sector.visible) {
              return (
                <Link
                  key={sector.id}
                  href={`/industries/${sector.slug}`}
                  className={`${className} transition-opacity hover:opacity-80`}
                  style={style}
                >
                  {sector.name}
                </Link>
              );
            }

            return (
              <div key={sector.id} className={className} style={style}>
                {sector.name}
              </div>
            );
          })}
        </div>
      </Container>

      <section className="border-t" style={{ background: "var(--bg)", borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <Container className="py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div>
              <Eyebrow>{page.whereNextEyebrow}</Eyebrow>
              <div
                className="mt-4 text-foreground"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
                  lineHeight: 1.1,
                }}
              >
                {page.whereNextTitle1}
                <br />
                {page.whereNextTitle2}
              </div>
              <p className="mt-6 max-w-[62ch] text-[15px] leading-8 text-muted-foreground">
                {page.whereNextBody}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <Button asChild variant="primary">
                <Link href="/contact">Contact</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/process">How We Work</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
