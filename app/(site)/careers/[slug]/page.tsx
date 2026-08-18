import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CareerApplyForm } from "@/app/components/CareerApplyForm";
import { Markdown } from "@/app/components/Markdown";
import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getVisibleOpening(slug: string) {
  const prisma = await getDb();
  return prisma.jobOpening.findFirst({
    where: { slug, visible: true },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opening = await getVisibleOpening(slug);
  if (!opening) {
    return { title: "Careers — DiQualia" };
  }
  return {
    title: `${opening.title} — Careers — DiQualia`,
    description: `${opening.department} · ${opening.location} · ${opening.type}`,
  };
}

export default async function JobOpeningPage({ params }: PageProps) {
  const { slug } = await params;
  const opening = await getVisibleOpening(slug);
  if (!opening) notFound();

  const requirements = Array.isArray(opening.requirements)
    ? (opening.requirements as string[]).filter(Boolean)
    : [];

  return (
    <article>
      <header
        className="relative overflow-hidden border-b"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 0%, color-mix(in oklab, var(--gold) 10%, transparent), transparent 50%)",
          }}
        />
        <div className="diq-padX relative mx-auto w-full max-w-3xl pb-14 pt-20 md:pt-28">
          <Link
            href="/careers"
            className="text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-primary"
            style={{ color: "var(--text-muted)" }}
          >
            ← Careers
          </Link>
          <div className="mt-8 text-[11px] tracking-[0.22em] uppercase text-primary">
            {opening.department} · {opening.location} · {opening.type}
          </div>
          <h1
            className="mt-4 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              lineHeight: 1.1,
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            }}
          >
            {opening.title}
          </h1>
        </div>
      </header>

      <div className="diq-padX mx-auto w-full max-w-3xl py-14 md:py-20">
        <Markdown source={opening.description} />

        {requirements.length > 0 ? (
          <div className="mt-12">
            <div className="text-[11px] tracking-[0.22em] uppercase text-primary">Requirements</div>
            <ul className="mt-6 space-y-3 text-[13px] leading-7 text-muted-foreground">
              {requirements.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span aria-hidden className="text-primary">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-16">
          <CareerApplyForm jobSlug={opening.slug} />
        </div>
      </div>
    </article>
  );
}
