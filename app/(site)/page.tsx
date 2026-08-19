import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/components/Container";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

type HeroStat = { label: string; value: string };

function excerpt(text: string, max = 128) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  const cut = compact.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${cut.slice(0, at > 72 ? at : max)}…`;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(10px, 2.8vw, 11px)",
        letterSpacing: "0.35em",
        textTransform: "uppercase",
        color: "var(--primary)",
      }}
    >
      <span aria-hidden className="inline-block h-px w-8" style={{ background: "var(--primary)" }} />
      {children}
    </div>
  );
}

function IntelligenceHud({ stats }: { stats: HeroStat[] }) {
  return (
    <div className="diq-homeHud diq-homeHud--bleed relative w-full overflow-hidden lg:w-[300px] lg:shrink-0">
      <span aria-hidden className="diq-homeHudTick diq-homeHudTick--tl" />
      <span aria-hidden className="diq-homeHudTick diq-homeHudTick--tr" />
      <span aria-hidden className="diq-homeHudTick diq-homeHudTick--bl" />
      <span aria-hidden className="diq-homeHudTick diq-homeHudTick--br" />
      <span aria-hidden className="diq-homeHudScan" />

      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--diq_border2)" }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "3.5px",
            textTransform: "uppercase",
            color: "var(--primary)",
          }}
        >
          Intelligence Panel
        </div>
        <div className="diq-homeLive flex items-center gap-2">
          <span aria-hidden className="diq-homeLiveDot" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--primary)",
            }}
          >
            Live
          </span>
        </div>
      </div>

      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="px-5 py-4"
          style={{
            borderBottom: i === stats.length - 1 ? "none" : "1px solid var(--diq_border2)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              color: "var(--diq_mid)",
            }}
          >
            {stat.label}
          </div>
          <div
            className="mt-1.5"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1,
              color: "var(--primary)",
              letterSpacing: "-0.5px",
            }}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function highlightYou(text: string) {
  const word = "You.";
  const idx = text.lastIndexOf(word);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <em style={{ fontStyle: "italic", color: "var(--primary)" }}>{word}</em>
    </>
  );
}

function StatementHeadline({ text }: { text: string }) {
  const needle = "intelligence";
  const idx = text.toLowerCase().indexOf(needle);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <em style={{ fontStyle: "italic", color: "var(--primary)" }}>{text.slice(idx)}</em>
    </>
  );
}

export default async function Home() {
  const prisma = await getDb();
  const [
    hero,
    marqueeItems,
    whereNext,
    aboutHero,
    principles,
    servicesPage,
    services,
    processPage,
    processSteps,
    industriesPage,
    sectors,
  ] = await Promise.all([
    prisma.homeHero.findUnique({ where: { id: 1 } }),
    prisma.homeMarqueeItem.findMany({ orderBy: { order: "asc" } }),
    prisma.homeWhereNext.findUnique({ where: { id: 1 } }),
    prisma.aboutHero.findUnique({ where: { id: 1 } }),
    prisma.aboutBuiltForItem.findMany({ orderBy: { order: "asc" } }),
    prisma.servicesPage.findUnique({ where: { id: 1 } }),
    prisma.serviceSection.findMany({
      orderBy: { order: "asc" },
      select: { tabId: true, title: true, body: true, eyebrow: true },
    }),
    prisma.processPage.findUnique({ where: { id: 1 } }),
    prisma.processStep.findMany({ orderBy: { order: "asc" } }),
    prisma.industriesPage.findUnique({ where: { id: 1 } }),
    prisma.industrySector.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  if (!hero) notFound();

  const heroStats: HeroStat[] = [
    { label: hero.stat1Label, value: hero.stat1Value },
    { label: hero.stat2Label, value: hero.stat2Value },
    { label: hero.stat3Label, value: hero.stat3Value },
  ];
  const line2Words = hero.headlineLine2.split(" ");
  const line2Last = line2Words.pop();
  const ticker = [...marqueeItems, ...marqueeItems];
  const headlineParts = whereNext?.headline?.split(" Better ") ?? [];

  return (
    <div style={{ background: "var(--diq_ink)" }}>
      {/* HERO */}
      <section className="diq-hero diq-homeHero relative flex min-h-[100svh] flex-col overflow-hidden">
        <div
          aria-hidden
          className="diq-gridDrift pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(var(--diq_grid) 1px, transparent 1px), linear-gradient(90deg, var(--diq_grid) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div
          aria-hidden
          className="diq-gridDrift pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in oklab, var(--gold) 2%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--gold) 2%, transparent) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            animationDuration: "90s",
          }}
        />
        <div aria-hidden className="diq-homeOrb diq-homeOrb--gold pointer-events-none" />
        <div aria-hidden className="diq-homeOrb diq-homeOrb--gold2 pointer-events-none" />
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[88px] h-px"
          style={{ background: "linear-gradient(90deg, transparent, var(--diq_border), transparent)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, var(--diq_border), transparent)" }}
        />

        <div className="relative z-[1] flex flex-1 flex-col justify-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <Container className="min-w-0 flex-1">
            <div className="min-w-0 max-w-[820px]">
              <p
                className="diq-fadeUp mb-[clamp(16px,3vw,28px)] flex flex-wrap items-center gap-3"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "5px",
                  textTransform: "uppercase",
                  color: "var(--primary)",
                  "--diq-fade-dur": "0.7s",
                  "--diq-fade-delay": "0.15s",
                } as CSSProperties}
              >
                <span aria-hidden className="inline-block h-px w-7" style={{ background: "var(--primary)" }} />
                {hero.eyebrow}
              </p>
              <h1
                className="diq-fadeUp"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.45rem, 7.2vw, 5.6rem)",
                  fontWeight: 700,
                  lineHeight: 1.02,
                  letterSpacing: "-0.04em",
                  marginBottom: 20,
                  maxWidth: 820,
                  overflowWrap: "break-word",
                  "--diq-fade-dur": "0.9s",
                  "--diq-fade-delay": "0.28s",
                } as CSSProperties}
              >
                <span className="block">{hero.headlineLine1}</span>
                <span className="block">
                  {line2Words.join(" ")}{" "}
                  <em style={{ fontStyle: "italic", color: "var(--primary)" }}>{line2Last}</em>
                </span>
                <span
                  aria-hidden
                  className="mt-0 hidden md:block"
                  style={{
                    WebkitTextStroke: "1px var(--gold-ghost)",
                    color: "transparent",
                  }}
                >
                  {hero.headlineLine3}
                </span>
                <span className="sr-only">{hero.headlineLine3}</span>
              </h1>
              <p
                className="diq-fadeUp"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(15px, 1.6vw, 18px)",
                  fontWeight: 300,
                  color: "var(--diq_pale)",
                  lineHeight: 1.85,
                  maxWidth: 540,
                  marginBottom: "clamp(24px, 4vw, 36px)",
                  "--diq-fade-dur": "0.8s",
                  "--diq-fade-delay": "0.48s",
                } as CSSProperties}
              >
                {hero.body}
              </p>
              <div
                className="diq-fadeUp flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
                style={{
                  "--diq-fade-dur": "0.8s",
                  "--diq-fade-delay": "0.68s",
                } as CSSProperties}
              >
                <Button asChild variant="primary" className="w-full text-center sm:w-auto">
                  <Link href={hero.btn1Href}>{hero.btn1Label}</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full text-center sm:w-auto">
                  <Link href={hero.btn2Href}>{hero.btn2Label}</Link>
                </Button>
              </div>
            </div>
          </Container>

          <div
            className="diq-fadeUp w-full px-[var(--diq-gutter)] lg:w-auto lg:shrink-0 lg:px-0"
            style={{
              "--diq-fade-dur": "1s",
              "--diq-fade-delay": "0.55s",
            } as CSSProperties}
          >
            <IntelligenceHud stats={heroStats} />
          </div>
        </div>

        <div className="diq-homeScroll relative z-[1] mt-10 hidden md:flex" aria-hidden>
          <span>Scroll</span>
          <i />
        </div>
      </section>

      {/* TICKER */}
      {marqueeItems.length > 0 && (
        <div className="diq-homeMarquee overflow-hidden border-y" style={{ borderColor: "var(--diq_border)" }}>
          <div className="diq-homeMarqueeTrack" style={{ animationDuration: `${Math.max(28, marqueeItems.length * 6)}s` }}>
            {ticker.map((item, idx) => {
              const dashIdx = item.text.indexOf(" — ");
              const bold = dashIdx >= 0 ? item.text.slice(0, dashIdx) : item.text;
              const rest = dashIdx >= 0 ? item.text.slice(dashIdx) : "";
              return (
                <div key={`${item.id}-${idx}`} className="diq-homeMarqueeItem">
                  <b>{bold}</b>
                  {rest}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STATEMENT + PRINCIPLES */}
      {(aboutHero || principles.length > 0) && (
        <section
          className="diq-sectionY relative overflow-hidden"
          style={{ background: "var(--diq_deep)", borderTop: "1px solid var(--diq_border)" }}
        >
          <Container className="relative">
            {aboutHero && (
              <div className="diq-reveal">
                <Eyebrow>{aboutHero.eyebrow}</Eyebrow>
                <h2
                  className="mt-6"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 5vw, 4.2rem)",
                    fontWeight: 500,
                    color: "var(--diq_ivory)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.03em",
                  }}
                >
                  <StatementHeadline text={aboutHero.headline} />
                </h2>
                <p
                  className="mt-6 max-w-[62ch]"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(15px, 1.5vw, 17px)",
                    fontWeight: 300,
                    color: "var(--muted-foreground)",
                    lineHeight: 1.85,
                  }}
                >
                  {aboutHero.body}
                </p>
              </div>
            )}

            {principles.length > 0 && (
              <div className="mt-14 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: "var(--diq_border2)" }}>
                {principles.map((item, i) => (
                  <article
                    key={item.id}
                    className="diq-homeCard diq-homeCard--deep diq-reveal p-7 md:p-8"
                    style={{ transitionDelay: `${i * 70}ms` }}
                  >
                    <div
                      className="diq-ghostNum"
                      style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, lineHeight: 1 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3
                      className="mt-5"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 20,
                        fontWeight: 500,
                        color: "var(--diq_ivory)",
                        lineHeight: 1.25,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[13px] leading-7" style={{ color: "var(--muted-foreground)" }}>
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* SERVICES */}
      {services.length > 0 && (
        <section className="diq-sectionY relative" style={{ background: "var(--diq_ink)" }}>
          <Container>
            <div className="diq-reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>{servicesPage?.eyebrow ?? "Intelligence services"}</Eyebrow>
                <h2
                  className="mt-6"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 4.4vw, 3.4rem)",
                    fontWeight: 500,
                    color: "var(--diq_ivory)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {servicesPage ? highlightYou(servicesPage.headline) : "What we do for you."}
                </h2>
              </div>
              <Button asChild variant="secondary" className="self-start md:self-auto">
                <Link href="/services">All services</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-2 xl:grid-cols-3" style={{ background: "var(--diq_border2)" }}>
              {services.map((service, i) => (
                <Link
                  key={service.tabId}
                  href={`/services#${service.tabId}`}
                  className="diq-homeCard diq-reveal group flex flex-col p-8 no-underline md:p-10"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "var(--primary)",
                      }}
                    >
                      {service.eyebrow}
                    </div>
                    <span
                      className="diq-ghostNum"
                      style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3
                    className="mt-5"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      fontWeight: 500,
                      color: "var(--diq_ivory)",
                      lineHeight: 1.25,
                    }}
                  >
                    {service.title}
                  </h3>
                  <p className="mt-4 flex-1 text-[13px] leading-7" style={{ color: "var(--muted-foreground)" }}>
                    {excerpt(service.body)}
                  </p>
                  <div
                    className="mt-7 text-[11px] tracking-[0.22em] uppercase"
                    style={{ color: "var(--primary)", fontFamily: "var(--font-mono)" }}
                  >
                    Open →
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* PROCESS */}
      {processSteps.length > 0 && (
        <section
          className="diq-sectionY relative overflow-hidden"
          style={{ background: "var(--diq_deep)", borderTop: "1px solid var(--diq_border)" }}
        >
          <Container>
            <div className="diq-reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>{processPage?.eyebrow ?? "How we work"}</Eyebrow>
                <h2
                  className="mt-6"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 4.4vw, 3.4rem)",
                    fontWeight: 500,
                    color: "var(--diq_ivory)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {processPage ? (
                    <>
                      {processPage.headlineLine1}{" "}
                      <em style={{ fontStyle: "italic", color: "var(--primary)" }}>{processPage.headlineLine2}</em>{" "}
                      {processPage.headlineLine3}
                    </>
                  ) : (
                    "Research. Precision. Results."
                  )}
                </h2>
              </div>
              <Button asChild variant="secondary" className="self-start md:self-auto">
                <Link href="/process">Full process</Link>
              </Button>
            </div>

            <div className="diq-homeProcess mt-14">
              {processSteps.map((step, i) => (
                <article
                  key={step.id}
                  className="diq-homeProcessStep diq-reveal"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="diq-homeProcessNum">{step.stepNumber}</div>
                  <div
                    className="mt-5 text-[10px] tracking-[0.22em] uppercase"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}
                  >
                    {step.stepLabel}
                  </div>
                  <h3
                    className="mt-3"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 20,
                      fontWeight: 500,
                      color: "var(--diq_ivory)",
                      lineHeight: 1.25,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-7" style={{ color: "var(--muted-foreground)" }}>
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* INDUSTRIES */}
      {sectors.length > 0 && (
        <section className="diq-sectionY" style={{ background: "var(--diq_ink)", borderTop: "1px solid var(--diq_border)" }}>
          <Container>
            <div className="diq-reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Eyebrow>{industriesPage?.eyebrow ?? "Industries"}</Eyebrow>
                <h2
                  className="mt-6"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 4.4vw, 3.4rem)",
                    fontWeight: 500,
                    color: "var(--diq_ivory)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {industriesPage ? (
                    <>
                      {industriesPage.headlineLine1}
                      <br />
                      <em style={{ fontStyle: "italic", color: "var(--primary)" }}>{industriesPage.headlineLine2}</em>
                    </>
                  ) : (
                    "Deep expertise. Broad reach."
                  )}
                </h2>
              </div>
              <Button asChild variant="secondary" className="self-start lg:self-auto">
                <Link href="/industries">All industries</Link>
              </Button>
            </div>
            <div className="diq-reveal mt-10 flex flex-wrap gap-3">
              {sectors.map((sector) => (
                <Link key={sector.slug} href={`/industries/${sector.slug}`} className="diq-homeChip">
                  {sector.name}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      {whereNext && (
        <section className="diq-cta diq-homeCta relative overflow-hidden text-center" style={{ background: "var(--diq_ink)" }}>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(var(--diq_grid) 1px, transparent 1px), linear-gradient(90deg, var(--diq_grid) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
          <div aria-hidden className="diq-homeOrb diq-homeOrb--cta pointer-events-none" />
          <Container>
          <div className="diq-reveal diq-homeCtaFrame relative z-[1]">
            <p
              className="mb-[18px] flex items-center justify-center gap-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(10px, 2.8vw, 11px)",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "var(--primary)",
              }}
            >
              <span aria-hidden className="inline-block h-px w-5" style={{ background: "var(--primary)" }} />
              {whereNext.eyebrow}
              <span aria-hidden className="inline-block h-px w-5" style={{ background: "var(--primary)" }} />
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.1rem, 5.2vw, 4.4rem)",
                fontWeight: 600,
                color: "var(--diq_ivory)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                marginBottom: 16,
              }}
            >
              {headlineParts.length === 2 ? (
                <>
                  {headlineParts[0]}
                  <br />
                  <em style={{ fontStyle: "italic", color: "var(--primary)" }}>Better</em>
                  <br />
                  {headlineParts[1]}
                </>
              ) : (
                whereNext.headline
              )}
            </h2>
            <p
              className="mx-auto max-w-[52ch]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(16px, 1.8vw, 18px)",
                fontStyle: "italic",
                color: "var(--muted-foreground)",
                marginBottom: 36,
                lineHeight: 1.7,
              }}
            >
              {whereNext.body}
            </p>
            <Button asChild variant="primary">
              <Link href={whereNext.btnHref}>{whereNext.btnLabel}</Link>
            </Button>
          </div>
          </Container>
        </section>
      )}
    </div>
  );
}
