import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/components/Container";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

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

export default async function ProcessPage() {
  const prisma = await getDb();
  const [page, steps] = await Promise.all([
    prisma.processPage.findUnique({ where: { id: 1 } }),
    prisma.processStep.findMany({ orderBy: { order: "asc" } }),
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
            </em>{" "}
            {page.headlineLine3}
          </H1>
          <p className="mt-8 max-w-[70ch] text-[15px] leading-8 text-muted-foreground">
            {page.body}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild variant="secondary">
              <Link href="/services">Services</Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/contact">Start a Discovery Call</Link>
            </Button>
          </div>
        </Container>
      </section>

      <Container as="section" className="py-20">
        <div className="grid grid-cols-1 gap-px md:grid-cols-5" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
          {steps.map((step) => (
            <div key={step.id} className="p-8" style={{ background: "var(--bg-elev)" }}>
              <div className="text-[10px] tracking-[0.22em] uppercase text-primary">{step.stepLabel}</div>
              <div
                className="diq-ghostNum mt-4 text-[36px] leading-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                }}
              >
                {step.stepNumber}
              </div>
              <div className="mt-4 text-[13px] tracking-[0.06em] text-foreground">{step.title}</div>
              <p className="mt-3 text-[12px] leading-7 text-muted-foreground">{step.body}</p>
            </div>
          ))}
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
              <p className="mt-6 max-w-[60ch] text-[15px] leading-8 text-muted-foreground">
                {page.whereNextBody}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <Button asChild variant="primary">
                <Link href="/contact">Contact</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/industries">Industries</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
