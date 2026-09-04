import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/components/Container";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/cloudflare-env";

import { ServiceSection } from "./ServiceSection";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Services",
  description:
    "Six core intelligence services — built on deep research, designed to move B2B pipeline from invisible to inevitable.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services — DiQualia",
    description:
      "Six core intelligence services — built on deep research, designed to move B2B pipeline from invisible to inevitable.",
    url: "/services",
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

function renderHeroHeadline(headline: string) {
  // Split before " Do" to match 2-line layout; wrap final "You." in <em>
  const doIdx = headline.indexOf(" Do ");
  if (doIdx === -1) return highlightYou(headline);
  const line1 = headline.slice(0, doIdx);
  const line2 = headline.slice(doIdx + 1);
  return (
    <>
      {line1}
      <br />
      {highlightYou(line2)}
    </>
  );
}

function highlightYou(text: string) {
  const word = "You.";
  const idx = text.lastIndexOf(word);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <em className="text-primary" style={{ fontStyle: "italic" }}>{word}</em>
    </>
  );
}

export default async function ServicesPage() {
  const prisma = await getDb();
  const [page, sections] = await Promise.all([
    prisma.servicesPage.findUnique({ where: { id: 1 } }),
    prisma.serviceSection.findMany({
      orderBy: { order: "asc" },
      include: { items: { orderBy: { order: "asc" } } },
    }),
  ]);

  if (!page) notFound();

  const serviceSections = sections.map((section, i) => ({
    id: section.id,
    tabId: section.tabId,
    eyebrow: section.eyebrow,
    title: section.title,
    body: section.body,
    cardTitle: section.cardTitle,
    cardBody: section.cardBody,
    overviewHtml: section.overviewHtml,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
    order: section.order,
    displayNum: (i + 1).toString().padStart(2, "0"),
    items: section.items.map((item) => ({
      id: item.id,
      groupLabel: item.groupLabel,
      title: item.title,
      body: item.body,
      order: item.order,
    })),
  }));
  const stats = [
    { value: page.stat1Value, label: page.stat1Label },
    { value: page.stat2Value, label: page.stat2Label },
    { value: page.stat3Value, label: page.stat3Label },
    { value: page.stat4Value, label: page.stat4Label },
  ];

  return (
    <div>
      {/* PAGE HERO */}
      <section id="hero" className="relative overflow-hidden border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(color-mix(in oklab, var(--gold) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--gold) 6%, transparent) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            opacity: 0.35,
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 10%, transparent) 0%, transparent 65%)",
          }}
        />

        <Container className="grid grid-cols-1 gap-12 pb-16 pt-20 md:grid-cols-2 md:items-end md:gap-20 md:pb-20 md:pt-28">
          <div>
            <Eyebrow>{page.eyebrow}</Eyebrow>
            <h1
              className="mt-7 text-foreground"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                lineHeight: 0.98,
                fontSize: "clamp(2.8rem, 5.2vw, 4.8rem)",
              }}
            >
              {renderHeroHeadline(page.headline)}
            </h1>
          </div>

          <div className="pb-2">
            <p className="text-[15px] leading-8 text-muted-foreground">{page.body}</p>

            <div
              className="mt-8 grid grid-cols-2 gap-px"
              style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}
            >
              {stats.map((s) => (
                <div key={s.label} className="bg-card p-6">
                  <div
                    className="text-[28px] leading-none"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "var(--primary)" }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-2 text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* SERVICES — every service rendered fully inline, server-rendered. */}
      <section
        id="sections"
        className="border-b"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <Container className="pt-12 md:pt-16">
          <Eyebrow>The Six Services</Eyebrow>
          <nav
            aria-label="Services"
            className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3"
          >
            {serviceSections.map((s) => (
              <a
                key={s.tabId}
                href={`#${s.tabId}`}
                className="group inline-flex items-baseline gap-2 text-[13px] text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="diq-ghostNum text-[11px] tracking-[0.22em]">{s.displayNum}</span>
                <span className="border-b border-transparent group-hover:border-current">
                  {s.title}
                </span>
              </a>
            ))}
          </nav>
        </Container>
      </section>

      {serviceSections.map((section) => (
        <ServiceSection key={section.tabId} section={section} displayNum={section.displayNum} />
      ))}

      {/* INTELLIGENCE PROCESS STRIP */}
      <section className="border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <Container className="py-20">
          <Eyebrow>How Every Service Begins</Eyebrow>
          <h2
            className="mt-4 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
              lineHeight: 1.1,
            }}
          >
            The DiQualia Intelligence Process
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-3 xl:grid-cols-5" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
            {[
              ["Step One", "01", "Sector Immersion", "We spend the first week doing nothing but learning your industry — its language, rhythms, buyers, and dynamics. No strategy until we know your market deeply."],
              ["Step Two", "02", "Buyer Mapping", "We identify and profile your ideal buyers — building precise, evidence-based profiles that inform every piece of outreach and content we create."],
              ["Step Three", "03", "Intelligence Brief", "We compile all research into a strategic intelligence brief — your market, your buyers, your positioning, and your go-to-market plan. The compass for everything that follows."],
              ["Step Four", "04", "Execution", "With intelligence in hand, we execute — campaigns, content, outreach, and enablement tools — all grounded in research, all calibrated to your exact market."],
              ["Step Five", "05", "Optimise & Scale", "We measure what matters, learn from every signal, and continuously refine the intelligence engine — making your pipeline grow smarter and stronger every week."],
            ].map(([tag, num, title, body]) => (
              <div key={num} className="p-8" style={{ background: "var(--bg-elev)" }}>
                <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>{tag}</div>
                <div
                  className="diq-ghostNum mt-4 text-[36px] leading-none"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
                >
                  {num}
                </div>
                <div className="mt-4 text-[13px] tracking-[0.06em] text-foreground">{title}</div>
                <p className="mt-3 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ENGAGEMENT MODELS */}
      <section className="border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <Container className="py-20">
          <Eyebrow>How We Engage</Eyebrow>
          <h2
            className="mt-4 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
              lineHeight: 1.1,
            }}
          >
            Choose Your Intelligence Model
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-3" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
            {[
              [
                "Intelligence Starter",
                "Market Intelligence Sprint",
                "A focused 30-day intelligence engagement — ideal for companies entering a new market or needing a complete market picture before making strategic decisions.",
                [
                  "Full market research & landscape report",
                  "ICP definition and buyer profiling",
                  "Positioning and messaging strategy",
                  "Competitor analysis — top 5 competitors",
                  "Strategic intelligence brief",
                ],
                "Start a Sprint",
                false,
              ],
              [
                "Intelligence Partnership",
                "90-Day Growth Engagement",
                "Our full intelligence and execution partnership — research, positioning, lead generation, and sales enablement running together for 90 days of measurable pipeline growth.",
                [
                  "Everything in Intelligence Starter",
                  "B2B lead generation — LinkedIn + email",
                  "Ongoing competitive monitoring",
                  "Proposals, pitch deck, case studies",
                  "Weekly pipeline intelligence reports",
                  "Bi-weekly strategy calls",
                  "Outreach sequence copywriting",
                ],
                "Start Partnership",
                true,
              ],
              [
                "Ongoing Intelligence",
                "Retained Intelligence Partner",
                "A long-term intelligence partnership — we embed as your dedicated market intelligence and research unit, continuously building pipeline and adapting strategy as your market evolves.",
                [
                  "Everything in 90-Day Engagement",
                  "Monthly market intelligence updates",
                  "Quarterly strategic reviews",
                  "Dedicated intelligence analyst",
                  "Priority response and execution",
                  "Custom reporting dashboard",
                ],
                "Discuss Retainer",
                false,
              ],
            ].map(([tag, title, desc, items, cta, featured]) => (
              <div
                key={title as string}
                className="relative p-10"
                style={{
                  background: featured ? "var(--bg-elev)" : "var(--bg)",
                  borderTop: featured ? "2px solid var(--gold)" : "2px solid transparent",
                }}
              >
                {featured ? (
                  <div
                    className="absolute right-6 top-6 px-3 py-1 text-[10px] tracking-[0.18em] uppercase"
                    style={{ background: "var(--gold)", color: "var(--ink)" }}
                  >
                    Most Popular
                  </div>
                ) : null}
                <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>{tag}</div>
                <div
                  className="mt-4 text-[22px] text-foreground"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, lineHeight: 1.2 }}
                >
                  {title}
                </div>
                <p className="mt-4 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>{desc}</p>
                <div className="mt-7 border-t pt-6" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
                  <ul className="space-y-3 text-[12px]" style={{ color: "color-mix(in oklab, var(--text) 70%, var(--bg))" }}>
                    {(items as string[]).map((x) => (
                      <li key={x} className="flex items-center gap-3">
                        <span aria-hidden style={{ color: "var(--gold)" }}>✓</span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild variant="secondary" className="mt-8 w-full">
                  <a href="/contact">{cta}</a>
                </Button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* WHY DIQUALIA GRID */}
      <section className="border-b" style={{ background: "var(--bg-elev)", borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <Container className="py-20">
          <Eyebrow>Why DiQualia</Eyebrow>
          <h2
            className="mt-4 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
              lineHeight: 1.1,
            }}
          >
            Not a Marketing Agency. A Marketing Intelligence Unit.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-3" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
            {[
              ["R", "Research Before Everything", "Every service begins with deep, unhurried research into your market. We never launch before we understand your sector as well as you do — often better."],
              ["N", "Niche B2B Specialists", "We work exclusively in niche B2B industries — not mass markets, not B2C, not general marketing. Deep specialisation is how we move markets."],
              ["D", "Data-Driven, Always", "Every recommendation we make is backed by evidence. Every strategy is grounded in real market data. We don't guess — we research, we verify, then we act."],
              ["P", "Precision Over Volume", "We don't generate hundreds of unqualified leads. We generate a precise number of deeply qualified conversations with buyers ready, able, and willing to engage."],
              ["I", "Intelligence That Compounds", "The intelligence we build doesn't expire after a campaign. It compounds — each engagement making the next one faster, sharper, and more effective."],
              ["T", "Transparent Reporting", "Weekly reports, clear metrics, honest assessments. No vanity numbers. Only the metrics that actually matter to your business."],
            ].map(([icon, title, body]) => (
              <div key={icon} className="p-10" style={{ background: "var(--bg-elev)" }}>
                <div
                  className="flex h-10 w-10 items-center justify-center border text-[16px]"
                  style={{
                    borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
                    color: "var(--gold)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {icon}
                </div>
                <div
                  className="mt-5 text-[16px] text-foreground"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                >
                  {title}
                </div>
                <p className="mt-3 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CONTACT CTA STRIP */}
      <section id="contact" className="relative overflow-hidden text-center" style={{ background: "var(--gold)" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(color-mix(in oklab, var(--ink) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--ink) 6%, transparent) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <Container className="relative py-20">
          <div className="text-[11px] tracking-[0.35em] uppercase" style={{ color: "color-mix(in oklab, var(--ink) 55%, transparent)" }}>
            {page.ctaEyebrow}
          </div>
          <h2
            className="mt-6"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2.1rem, 4.4vw, 3.6rem)",
              lineHeight: 1.05,
              color: "var(--ink)",
            }}
          >
            {page.ctaHeadline}
          </h2>
          <p className="mx-auto mt-4 max-w-[62ch] text-[15px] leading-8" style={{ color: "color-mix(in oklab, var(--ink) 55%, transparent)" }}>
            {page.ctaBody}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="onGold">
              <Link href={page.ctaBtn1Href}>{page.ctaBtn1Label}</Link>
            </Button>
            <a
              href={`mailto:${page.ctaEmailHref}`}
              className="inline-block border-b-2 pb-1 text-[22px] no-underline"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                letterSpacing: "0.04em",
                color: "var(--ink)",
                borderBottomColor: "color-mix(in oklab, var(--ink) 30%, transparent)",
              }}
            >
              {page.ctaEmailHref}
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
}
