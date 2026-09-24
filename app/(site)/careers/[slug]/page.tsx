import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/components/Container";
import { CareerApplyForm } from "@/app/components/CareerApplyForm";
import { CareerRoleCard } from "@/app/components/CareerRoleCard";
import { Markdown } from "@/app/components/Markdown";
import { ShareRoleButton } from "@/app/components/ShareRoleButton";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function asStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

const loadRole = cache(async (slug: string) => {
  try {
    const prisma = await getDb();
    const [opening, careerPage, related] = await Promise.all([
      prisma.jobOpening.findFirst({ where: { slug, visible: true } }),
      prisma.careerPage.findUnique({ where: { id: 1 } }),
      prisma.jobOpening.findMany({
        where: { visible: true, slug: { not: slug } },
        orderBy: { order: "asc" },
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          department: true,
          location: true,
          type: true,
        },
      }),
    ]);
    return { opening, careerPage, related };
  } catch (err) {
    console.error("[careers] loadRole failed:", err);
    return { opening: null, careerPage: null, related: [] };
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { opening } = await loadRole(slug);
  if (!opening) {
    return { title: "Careers" };
  }
  const description = `${opening.department} · ${opening.location} · ${opening.type}`;
  const canonical = `/careers/${opening.slug}`;
  return {
    title: `${opening.title} — Careers`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${opening.title} — Careers — DiQualia`,
      description,
      url: canonical,
    },
  };
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="border-b pb-3 text-[11px] tracking-[0.22em] uppercase text-primary"
      style={{ borderColor: "color-mix(in oklab, var(--border) 70%, transparent)" }}
    >
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3 text-[13px] leading-7 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-[3px] inline-flex h-4 w-4 flex-none items-center justify-center text-[11px] text-primary"
            style={{ background: "color-mix(in oklab, var(--gold) 12%, transparent)" }}
          >
            →
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function JobOpeningPage({ params }: PageProps) {
  const { slug } = await params;
  const { opening, careerPage, related } = await loadRole(slug);
  if (!opening) notFound();

  const responsibilities = asStringList(opening.responsibilities);
  const requirements = asStringList(opening.requirements);
  const niceToHave = asStringList(opening.niceToHave);

  const summary: { label: string; value: string }[] = [
    { label: "Department", value: opening.department },
    { label: "Location", value: opening.location },
    { label: "Type", value: opening.type },
  ];
  if (opening.seniority) summary.push({ label: "Seniority", value: opening.seniority });
  if (opening.salaryRange) summary.push({ label: "Salary", value: opening.salaryRange });
  if (opening.remote) summary.push({ label: "Remote", value: opening.remote });
  if (opening.teamNote) summary.push({ label: "Team", value: opening.teamNote });

  const metaChips = [
    opening.location,
    opening.type,
    opening.seniority,
    opening.remote,
  ].filter((v): v is string => typeof v === "string" && v.trim().length > 0);

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
        <Container className="relative pb-14 pt-20 md:pt-28">
          <Link
            href="/careers"
            className="text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-primary"
            style={{ color: "var(--text-muted)" }}
          >
            ← All roles
          </Link>
          <div className="mt-8 text-[11px] tracking-[0.22em] uppercase text-primary">
            {opening.department}
          </div>
          <h1
            className="mt-4 max-w-3xl text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              lineHeight: 1.1,
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            }}
          >
            {opening.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-2">
            {metaChips.map((chip, i) => (
              <span
                key={`${chip}-${i}`}
                className="border px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase text-muted-foreground"
                style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="sm">
              <a href="#apply">Apply now</a>
            </Button>
            <ShareRoleButton title={opening.title} />
          </div>
        </Container>
      </header>

      <Container className="grid grid-cols-1 gap-12 py-14 md:grid-cols-[minmax(0,1fr)_280px] md:gap-16 md:py-20">
        <div>
          <SectionHeading>About</SectionHeading>
          <div className="mt-6">
            <Markdown source={opening.description} />
          </div>

          {responsibilities.length > 0 ? (
            <div className="mt-12">
              <SectionHeading>Responsibilities</SectionHeading>
              <BulletList items={responsibilities} />
            </div>
          ) : null}

          {requirements.length > 0 ? (
            <div className="mt-12">
              <SectionHeading>Requirements</SectionHeading>
              <BulletList items={requirements} />
            </div>
          ) : null}

          {niceToHave.length > 0 ? (
            <div className="mt-12">
              <SectionHeading>Nice-to-have</SectionHeading>
              <BulletList items={niceToHave} />
            </div>
          ) : null}

          <div id="apply" className="mt-16 scroll-mt-28">
            <CareerApplyForm
              jobSlug={opening.slug}
              jobOpeningId={opening.id}
              jobTitle={opening.title}
              department={opening.department}
              headline={careerPage?.applyHeadline}
            />
          </div>
        </div>

        <aside className="md:sticky md:top-[calc(var(--diq-stickyTop)+1.5rem)] md:self-start">
          <div
            className="border p-6"
            style={{
              borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
              background: "var(--bg-elev)",
            }}
          >
            <div className="text-[10px] tracking-[0.22em] uppercase text-primary">Role summary</div>
            <dl className="mt-5 space-y-4">
              {summary.map((row) => (
                <div key={row.label}>
                  <dt className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{row.label}</dt>
                  <dd className="mt-1 text-[13px] leading-6 text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
            <Button asChild variant="primary" className="mt-8 w-full">
              <a href="#apply">Apply now</a>
            </Button>
            <div className="mt-5 flex flex-col gap-3">
              <ShareRoleButton title={opening.title} />
              <Link
                href="/careers"
                className="text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-primary"
                style={{ color: "var(--text-muted)" }}
              >
                Back to all roles
              </Link>
            </div>
          </div>
        </aside>
      </Container>

      {related.length > 0 ? (
        <section
          className="border-t"
          style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
        >
          <Container className="py-16">
            <div className="text-[11px] tracking-[0.22em] uppercase text-primary">Related roles</div>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((role) => (
                <CareerRoleCard
                  key={role.id}
                  slug={role.slug}
                  title={role.title}
                  department={role.department}
                  type={role.type}
                  location={role.location}
                  headingLevel="h2"
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </article>
  );
}
