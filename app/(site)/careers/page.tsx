import type { Metadata } from "next";
import Link from "next/link";

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
  const prisma = await getDb();
  const [page, openings] = await Promise.all([
    prisma.careerPage.findUnique({ where: { id: 1 } }),
    prisma.jobOpening.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    }),
  ]);
  return { page, openings };
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
        className="relative overflow-hidden border-b"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
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
        <div className="diq-padX relative mx-auto w-full max-w-6xl pb-16 pt-20 md:pb-20 md:pt-28">
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
        </div>
      </section>

      <section
        className="border-b"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <div className="diq-padX mx-auto grid w-full max-w-6xl grid-cols-2 gap-px md:grid-cols-2" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
          {[
            { value: String(openings.length).padStart(2, "0"), label: "Open roles" },
            { value: String(departmentCount).padStart(2, "0"), label: departmentCount === 1 ? "Department" : "Departments" },
          ].map((stat) => (
            <div key={stat.label} className="px-8 py-10" style={{ background: "var(--bg-elev)" }}>
              <div
                className="diq-ghostNum text-[36px] leading-none"
                style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
              >
                {stat.value}
              </div>
              <div className="mt-3 text-[11px] tracking-[0.22em] uppercase text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="diq-sectionY" style={{ background: "var(--diq_ink)" }}>
        <div className="diq-padX mx-auto w-full max-w-6xl">
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
          {benefits.length > 0 ? (
            <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {benefits.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border px-5 py-4 text-[13px] leading-7 text-muted-foreground"
                  style={{
                    borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
                    background: "var(--bg-elev)",
                  }}
                >
                  <span aria-hidden className="text-primary">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="diq-sectionY border-t" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="diq-padX mx-auto w-full max-w-6xl">
          <Eyebrow>How we hire</Eyebrow>
          <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-4" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
            {hireSteps.map((step) => (
              <div key={step.num} className="p-8" style={{ background: "var(--bg-elev)" }}>
                <div className="text-[10px] tracking-[0.22em] uppercase text-primary">{step.label}</div>
                <div
                  className="diq-ghostNum mt-4 text-[36px] leading-none"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
                >
                  {step.num}
                </div>
                <div className="mt-4 text-[13px] tracking-[0.06em] text-foreground">{step.title}</div>
                <p className="mt-3 text-[12px] leading-7 text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="diq-sectionY border-t" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="diq-padX mx-auto w-full max-w-6xl">
          <Eyebrow>Open roles</Eyebrow>
          {openings.length === 0 ? (
            <p className="mt-8 max-w-[62ch] text-[15px] leading-8 text-muted-foreground">
              No open roles right now. You can still read how we work and how to apply below.
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {openings.map((opening) => (
                <Link
                  key={opening.id}
                  href={`/careers/${opening.slug}`}
                  className="group block border p-8 no-underline transition-colors"
                  style={{
                    borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
                    background: "var(--bg-elev)",
                  }}
                >
                  <div className="text-[10px] tracking-[0.22em] uppercase text-primary">
                    {opening.department} · {opening.type}
                  </div>
                  <h3
                    className="mt-4 text-foreground group-hover:text-primary"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      fontSize: "clamp(1.35rem, 2.4vw, 1.75rem)",
                      lineHeight: 1.2,
                    }}
                  >
                    {opening.title}
                  </h3>
                  <p className="mt-3 text-[13px] text-muted-foreground">{opening.location}</p>
                  <div className="mt-6 text-[11px] tracking-[0.22em] uppercase text-primary">
                    View role →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className="border-t"
        style={{
          background: "var(--bg-elev)",
          borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)",
        }}
      >
        <div className="diq-padX mx-auto w-full max-w-5xl py-20 text-center">
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
        </div>
      </section>
    </div>
  );
}
