import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/components/Container";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

type WhyPoint = { title: string; body: string };
type CaseStudyRef = { label: string; href: string };

function parseWhyPoints(value: unknown): WhyPoint[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is WhyPoint =>
      item != null &&
      typeof item === "object" &&
      typeof (item as WhyPoint).title === "string" &&
      typeof (item as WhyPoint).body === "string",
  );
}

function parseCaseStudyRefs(value: unknown): CaseStudyRef[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is CaseStudyRef =>
      item != null &&
      typeof item === "object" &&
      typeof (item as CaseStudyRef).label === "string" &&
      typeof (item as CaseStudyRef).href === "string",
  );
}

const getVisibleSector = cache(async (slug: string) => {
  const prisma = await getDb();
  return prisma.industrySector.findFirst({
    where: { slug, visible: true },
  });
});

function excerpt(text: string | null | undefined, max = 160): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sector = await getVisibleSector(slug);
  if (!sector) {
    return { title: "Industries" };
  }

  const titleBase = sector.headline?.trim() || sector.name;
  const description =
    excerpt(sector.body) ??
    `DiQualia research practice for ${sector.name}.`;
  const canonical = `/industries/${sector.slug}`;

  return {
    title: sector.name,
    description,
    alternates: { canonical },
    openGraph: {
      title: titleBase,
      description,
      url: canonical,
      ...(sector.heroImageUrl ? { images: [{ url: sector.heroImageUrl }] } : {}),
    },
  };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase text-primary">
      <span aria-hidden className="inline-block h-px w-8 bg-primary" />
      {children}
    </div>
  );
}

export default async function IndustrySectorPage({ params }: PageProps) {
  const { slug } = await params;
  const sector = await getVisibleSector(slug);
  if (!sector) notFound();

  const whyPoints = parseWhyPoints(sector.whyPoints);
  const caseStudyRefs = parseCaseStudyRefs(sector.caseStudyRefs);
  const headline = sector.headline?.trim() || sector.name;
  const eyebrow = sector.eyebrow?.trim() || sector.name;

  return (
    <div>
      <section
        className="relative overflow-hidden border-b"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        {sector.heroImageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={sector.heroImageUrl}
              alt={sector.headline?.trim() || sector.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, color-mix(in oklab, var(--bg) 72%, transparent), color-mix(in oklab, var(--bg) 92%, transparent))",
              }}
            />
          </div>
        ) : (
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
        )}

        <Container className="relative pb-16 pt-20 md:pb-20 md:pt-28">
          <Link
            href="/industries"
            className="text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-primary"
            style={{ color: "var(--text-muted)" }}
          >
            ← Industries
          </Link>
          <div className="mt-8">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <h1
            className="mt-8 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              lineHeight: 1.02,
              fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
            }}
          >
            {headline}
          </h1>
          {sector.body ? (
            <p className="mt-8 max-w-[72ch] text-[15px] leading-8 text-muted-foreground">
              {sector.body}
            </p>
          ) : null}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild variant="primary">
              <Link href="/contact">Talk to Us</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/process">How We Work</Link>
            </Button>
          </div>
        </Container>
      </section>

      {whyPoints.length > 0 ? (
        <Container as="section" className="py-20">
          <Eyebrow>Why this industry</Eyebrow>
          <h2
            className="mt-6 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              lineHeight: 1.15,
            }}
          >
            What makes {sector.name} different
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {whyPoints.map((point) => (
              <div key={point.title}>
                <div
                  className="text-[15px] text-foreground"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                >
                  {point.title}
                </div>
                <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{point.body}</p>
              </div>
            ))}
          </div>
        </Container>
      ) : null}

      {caseStudyRefs.length > 0 ? (
        <section
          className="border-t"
          style={{ borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
        >
          <Container className="py-20">
            <Eyebrow>Selected work</Eyebrow>
            <h2
              className="mt-6 text-foreground"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                lineHeight: 1.15,
              }}
            >
              Case studies
            </h2>
            <ul className="mt-10 space-y-4">
              {caseStudyRefs.map((ref) => (
                <li key={`${ref.href}-${ref.label}`}>
                  <Link
                    href={ref.href}
                    className="text-[14px] text-primary underline-offset-4 hover:underline"
                  >
                    {ref.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <section
        className="border-t"
        style={{
          background: "var(--bg)",
          borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)",
        }}
      >
        <Container className="py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div>
              <Eyebrow>Next step</Eyebrow>
              <div
                className="mt-4 text-foreground"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
                  lineHeight: 1.1,
                }}
              >
                Explore how we work
                <br />
                in {sector.name}.
              </div>
              <p className="mt-6 max-w-[62ch] text-[15px] leading-8 text-muted-foreground">
                A short discovery conversation clarifies your market, buyers, and whether
                intelligence-led growth fits.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <Button asChild variant="primary">
                <Link href="/contact">Contact</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/industries">All industries</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
