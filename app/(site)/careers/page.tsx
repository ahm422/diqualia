import type { Metadata } from "next";

import { Container } from "@/app/components/Container";
import { CareerRolesFilter } from "@/app/components/CareerRolesFilter";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase text-primary ${center ? "justify-center" : ""}`}>
      <span aria-hidden className="inline-block h-px w-8 bg-primary" />
      {children}
      {center ? <span aria-hidden className="inline-block h-px w-8 bg-primary" /> : null}
    </div>
  );
}

async function loadCareers() {
  try {
    const prisma = await getDb();
    const [page, openings] = await Promise.all([
      prisma.careerPage.findUnique({ where: { id: 1 } }),
      prisma.jobOpening.findMany({
        where: { visible: true },
        orderBy: { order: "asc" },
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
    return { page, openings };
  } catch (err) {
    console.error("[careers] loadCareers failed:", err);
    return { page: null, openings: [] as { id: number; slug: string; title: string; department: string; location: string; type: string }[] };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await loadCareers();
  if (!page) {
    return { title: "Careers — DiQualia" };
  }
  return {
    title: `${page.eyebrow || "Careers"} — DiQualia`,
    description: page.body,
  };
}

export default async function CareersPage() {
  const { page, openings } = await loadCareers();

  if (!page) {
    return (
      <main className="diq-pageTop pb-20 text-center text-sm text-muted-foreground">
        Careers content coming soon.
      </main>
    );
  }

  const benefits = Array.isArray(page.benefits)
    ? (page.benefits as string[]).filter(Boolean)
    : [];

  const departmentCount = new Set(openings.map((o) => o.department).filter(Boolean)).size;
  const locationCount = new Set(openings.map((o) => o.location).filter(Boolean)).size;
  const typeCount = new Set(openings.map((o) => o.type).filter(Boolean)).size;

  const stats = [
    { value: openings.length, label: openings.length === 1 ? "Open role" : "Open roles" },
    { value: departmentCount, label: departmentCount === 1 ? "Department" : "Departments" },
    { value: locationCount, label: locationCount === 1 ? "Location" : "Locations" },
    { value: typeCount, label: typeCount === 1 ? "Contract type" : "Contract types" },
  ].filter((s) => s.value > 0);

  const applyHref = openings.length > 0 ? `/careers/${openings[0].slug}#apply` : "#roles";

  const hireSteps = [
    {
      num: "01",
      label: "Apply",
      title: "Send a note and a resume",
      body: "PDF, DOC, or DOCX. A short cover note on the niche you know and a piece of work you are proud of.",
    },
    {
      num: "02",
      label: "Review",
      title: "We read the work",
      body: "Intelligence and delivery review the application against the role. No automated filter theatre.",
    },
    {
      num: "03",
      label: "Conversation",
      title: "A working conversation",
      body: "If there is a fit, we talk about a market, a brief, and how you think — not a panel gauntlet.",
    },
    {
      num: "04",
      label: "Offer",
      title: "A clear next step",
      body: "We reply with next steps. If we make an offer, it is specific about the work, not a vague pipeline.",
    },
  ];

  return (
    <div>
      <section
        id="hero"
        className="relative overflow-hidden border-b"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <div aria-hidden className="diq-career-grid" />
        <div aria-hidden className="diq-career-wash" />
        <Container className="relative pb-16 pt-20 md:pb-24 md:pt-28">
          <div className="max-w-[52ch]">
            <Eyebrow>{page.eyebrow}</Eyebrow>
            <h1
              className="mt-8 text-foreground"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                lineHeight: 1.02,
                fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
              }}
            >
              {page.headlineLine1}
              <br />
              <em className="text-primary" style={{ fontStyle: "italic" }}>
                {page.headlineLine2}
              </em>
            </h1>
            <p className="mt-8 max-w-[70ch] text-[15px] leading-8 text-muted-foreground">
              {page.body}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild variant="primary" size="sm">
                <a href="#roles">
                  {openings.length > 0 ? "View open roles" : "See how we hire"}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="#how">How we hire</a>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {stats.length > 0 ? (
        <section
          className="border-b"
          style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
        >
          <Container
            className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4"
            style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="px-8 py-10" style={{ background: "var(--bg-elev)" }}>
                <div
                  className="diq-ghostNum text-[36px] leading-none [font-variant-numeric:tabular-nums]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
                >
                  {String(stat.value).padStart(2, "0")}
                </div>
                <div className="mt-3 text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </Container>
        </section>
      ) : null}

      <section id="culture" className="diq-sectionY" style={{ background: "var(--diq_ink)" }}>
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <Eyebrow>{page.cultureEyebrow}</Eyebrow>
            <h2
              className="mt-6 text-foreground"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                lineHeight: 1.1,
              }}
            >
              {page.cultureHeadline}
            </h2>
            <p className="mt-6 max-w-[62ch] text-[15px] leading-8 text-muted-foreground">
              {page.cultureBody}
            </p>
          </div>
          {benefits.length > 0 ? (
            <ul id="benefits" className="grid grid-cols-1 gap-3 self-start sm:grid-cols-2 lg:grid-cols-1">
              {benefits.map((item) => (
                <li
                  key={item}
                  className="diq-career-benefit text-[13px] leading-7 text-muted-foreground"
                >
                  <span aria-hidden className="mt-[2px] text-primary">
                    →
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </section>

      <section
        id="how"
        className="diq-sectionY border-t"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <Container>
          <Eyebrow>How we hire</Eyebrow>
          <div className="diq-career-process mt-12">
            {hireSteps.map((step) => (
              <div key={step.num} className="diq-career-processStep">
                <div className="diq-career-processNum">{step.num}</div>
                <div className="mt-5 text-[10px] tracking-[0.22em] uppercase text-primary">
                  {step.label}
                </div>
                <div className="mt-3 text-[13px] tracking-[0.04em] text-foreground">
                  {step.title}
                </div>
                <p className="mt-3 max-w-[34ch] text-[12px] leading-7 text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section
        id="roles"
        className="diq-sectionY border-t scroll-mt-28"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <Container>
          <Eyebrow>Open roles</Eyebrow>
          {openings.length === 0 ? (
            <p className="mt-8 max-w-[62ch] text-[15px] leading-8 text-muted-foreground">
              No open roles right now. You can still read how we work and how to apply below.
            </p>
          ) : (
            <CareerRolesFilter roles={openings} />
          )}
        </Container>
      </section>

      <section
        id="apply"
        className="diq-sectionY border-t"
        style={{ borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <Container>
          <div className="diq-career-ctaFrame text-center">
            <div className="relative">
              <Eyebrow center>{page.applyEyebrow}</Eyebrow>
              <h2
                className="mx-auto mt-8 max-w-3xl text-foreground"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                  lineHeight: 1.25,
                }}
              >
                {page.applyHeadline}
              </h2>
              <p className="mx-auto mt-6 max-w-[62ch] text-[15px] leading-8 text-muted-foreground">
                {page.applyBody}
              </p>
              <div className="mt-9 flex justify-center">
                <Button asChild variant="primary">
                  <a href={applyHref}>
                    {openings.length > 0 ? "Apply now" : "View open roles"}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
