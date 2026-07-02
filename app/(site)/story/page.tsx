import type { Metadata } from "next";
import Link from "next/link";

import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Story — DiQualia",
  description:
    "DiQualia was built on the Double Experience — the deliberate convergence of deep human expertise and the precision of intelligent systems.",
};

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase ${center ? "justify-center" : ""}`}
      style={{ color: "var(--gold)" }}
    >
      <span aria-hidden className="inline-block h-px w-8" style={{ background: "var(--gold)" }} />
      {children}
      {center ? <span aria-hidden className="inline-block h-px w-8" style={{ background: "var(--gold)" }} /> : null}
    </div>
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

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[15px] leading-8" style={{ color: "var(--text-faint)" }}>
      {children}
    </div>
  );
}

function PullQuote({ quote, cite }: { quote: React.ReactNode; cite: string }) {
  return (
    <section
      className="relative overflow-hidden border-y px-6 py-20 text-center"
      style={{
        borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-[180px] leading-none"
        style={{ fontFamily: "var(--font-display)", color: "color-mix(in oklab, var(--gold) 8%, transparent)" }}
      >
        "
      </div>
      <blockquote
        className="mx-auto max-w-4xl"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: "clamp(1.6rem, 3vw, 3rem)",
          lineHeight: 1.25,
        }}
      >
        <span className="text-foreground">{quote}</span>
      </blockquote>
      <div className="mt-6 text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--text-muted)" }}>
        {cite}
      </div>
    </section>
  );
}

export default async function StoryPage() {
  const prisma = getDb();
  const page = await prisma.storyPage.findUnique({ where: { id: 1 } });

  if (!page) {
    return (
      <main className="py-20 text-center text-sm" style={{ color: "var(--text-faint)" }}>
        Story content coming soon.
      </main>
    );
  }

  const manifestoItems = Array.isArray(page.manifestoItems)
    ? (page.manifestoItems as string[]).filter(Boolean)
    : [];

  return (
    <div>
      {/* Top back link */}
      <div className="mx-auto w-full max-w-6xl px-6 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase no-underline"
          style={{ color: "var(--text-faint)" }}
        >
          <span aria-hidden>←</span> Back to Home
        </Link>
      </div>

      {/* HERO */}
      <section className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(ellipse, color-mix(in oklab, var(--gold) 10%, transparent) 0%, transparent 65%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-4xl">
          <Eyebrow center>{page.eyebrow}</Eyebrow>
          <h1
            className="mt-10 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(3rem, 6vw, 6.2rem)",
              lineHeight: 1.05,
            }}
          >
            {page.headlineLine1}
            <br />{page.headlineLine2}
            <br /><em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>{page.headlineLine3}</em>
          </h1>
          <p className="mx-auto mt-10 max-w-[64ch] text-[16px] leading-9" style={{ color: "var(--text-muted)" }}>
            {page.body}
          </p>
          <div className="mt-14 flex flex-col items-center gap-4 text-[11px] tracking-[0.22em] uppercase" style={{ color: "color-mix(in oklab, var(--text-muted) 65%, transparent)" }}>
            <span
              aria-hidden
              className="inline-block h-14 w-px"
              style={{ background: "linear-gradient(to bottom, var(--gold), transparent)" }}
            />
            Read the story
          </div>
        </div>
      </section>

      {/* CHAPTER 2 */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-24">
          <div>
            <Eyebrow>The Problem We Saw</Eyebrow>
            <H2>
              A world full of
              <br />
              data. Starved of
              <br />
              <em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>real intelligence.</em>
            </H2>
          </div>
          <div>
            <Prose>
              <p>
                When artificial intelligence arrived in marketing, something unexpected happened. Rather than elevating
                the quality of insight, it democratised mediocrity. Every agency, every consultant, every freelancer
                suddenly had access to the same tools — and began producing the same outputs.
              </p>
              <p className="mt-6">
                The market became flooded. Not with intelligence, but with the <strong style={{ color: "var(--paper)", fontWeight: 400 }}>appearance of intelligence</strong>. Dashboards
                that looked authoritative. Reports that read convincingly. Strategies that sounded sophisticated. All of
                it generated at speed. None of it built on genuine understanding.
              </p>
              <p className="mt-6">We watched this happen. And we chose not to participate in it.</p>
            </Prose>
          </div>
        </div>
      </section>

      <PullQuote
        quote={
          <>
            In the age of AI, the rarest thing you can offer a business is not speed — it is{" "}
            <span style={{ color: "var(--gold-lt)", fontStyle: "normal" }}>judgement.</span>
          </>
        }
        cite="The founding principle of DiQualia"
      />

      {/* CHAPTER 3 — Double Experience */}
      <section style={{ background: "var(--bg-elev)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-24">
            <div className="order-2 md:order-1">
              <div
                className="grid grid-cols-1 gap-px"
                style={{ background: "color-mix(in oklab, var(--gold) 12%, transparent)", border: "1px solid color-mix(in oklab, var(--gold) 12%, transparent)" }}
              >
                <div className="p-10" style={{ background: "var(--bg-elev)" }}>
                  <div
                    className="text-[52px] leading-none"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "color-mix(in oklab, var(--gold) 18%, transparent)" }}
                  >
                    {page.dxNum1}
                  </div>
                  <div className="mt-5 text-[22px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                    {page.dxTitle1}
                  </div>
                  <p className="mt-4 text-[13px] leading-7" style={{ color: "var(--text-muted)" }}>
                    {page.dxBody1}
                  </p>
                </div>
                <div className="p-10" style={{ background: "var(--bg-elev)" }}>
                  <div
                    className="text-[52px] leading-none"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "color-mix(in oklab, var(--gold) 18%, transparent)" }}
                  >
                    {page.dxNum2}
                  </div>
                  <div className="mt-5 text-[22px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                    {page.dxTitle2}
                  </div>
                  <p className="mt-4 text-[13px] leading-7" style={{ color: "var(--text-muted)" }}>
                    {page.dxBody2}
                  </p>
                </div>
                <div className="p-8 text-center" style={{ background: "var(--panel)", borderTop: "1px solid color-mix(in oklab, var(--gold) 15%, transparent)" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 300,
                      fontStyle: "italic",
                      fontSize: "20px",
                      color: "var(--gold-lt)",
                    }}
                  >
                    {page.dxTagline}
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <Eyebrow>Our Answer</Eyebrow>
              <H2>
                The Double
                <br />
                <em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>Experience.</em>
              </H2>
              <div className="mt-8">
                <Prose>
                  <p>
                    DiQualia is built on a philosophy we call the Double Experience — the deliberate convergence of deep
                    human expertise and the precision of intelligent systems.
                  </p>
                  <p className="mt-6">
                    Not one or the other. Not humans pretending AI doesn&apos;t exist. Not AI pretending it has wisdom. But
                    both — working in concert, each making the other more powerful than it could ever be alone.
                  </p>
                </Prose>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER 4 */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <Eyebrow>Why Now</Eyebrow>
        <H2>
          Real intelligence
          <br />
          in the age of <em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>artificial</em> everything.
        </H2>
        <div className="mt-8 max-w-3xl">
          <Prose>
            <p>
              We are living through a paradox. Businesses have never had more data, more tools, or more automated insight
              available to them. And yet, the number of companies that feel genuinely understood by their marketing
              partners has never been lower.
            </p>
            <p className="mt-6">
              The reason is simple: intelligence requires context. And context requires the kind of sustained, focused
              attention that no tool can manufacture on demand.
            </p>
          </Prose>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px md:grid-cols-3" style={{ background: "color-mix(in oklab, var(--text) 6%, transparent)" }}>
          {[
            [
              "The Market Reality",
              "Everyone sounds the same.",
              "AI has given every agency the ability to produce polished, credible-sounding output — without the expertise to back it up. Clients are increasingly unable to distinguish between insight and imitation.",
            ],
            [
              "The DiQualia Difference",
              "We are the human layer.",
              "Our value is not in the tools we use — it is in the expertise that directs them. We ask better questions, build better frameworks, and deliver conclusions that hold up under scrutiny.",
            ],
            [
              "The Result for Clients",
              "Clarity in a noisy market.",
              "When a DiQualia client makes a decision, they make it with confidence — because we gave them genuine intelligence to see their market clearly and move with precision.",
            ],
          ].map(([ey, title, body]) => (
            <div key={ey} className="p-10" style={{ background: "var(--bg)" }}>
              <div className="text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
                {ey}
              </div>
              <div className="mt-4 text-[20px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                {title}
              </div>
              <p className="mt-3 text-[13px] leading-7" style={{ color: "var(--text-muted)" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section style={{ background: "var(--bg-elev)" }}>
        <div className="mx-auto w-full max-w-5xl px-6 py-24 text-center">
          <Eyebrow center>What We Believe</Eyebrow>
          <h2
            className="mx-auto mt-8 max-w-[680px] text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
              lineHeight: 1.1,
            }}
          >
            The DiQualia
            <br />
            <em className="text-primary" style={{ fontStyle: "italic" }}>
              Manifesto.
            </em>
          </h2>

          <div className="mx-auto mt-12 max-w-3xl">
            {manifestoItems.map((line, idx) => (
              <div
                key={idx}
                className="py-5"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(1.2rem, 2.2vw, 2rem)",
                  color: idx === manifestoItems.length - 1 ? "var(--foreground)" : "var(--muted-foreground)",
                  borderBottom: "1px solid color-mix(in oklab, var(--text) 6%, transparent)",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDING VISION */}
      <section style={{ background: "var(--bg-elev)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[260px_1fr] md:gap-20">
            <div className="md:sticky md:top-28">
              <div className="text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--text-muted)" }}>
                Chapter Six
              </div>
              <div
                className="mt-3 text-[72px] leading-none"
                style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "color-mix(in oklab, var(--gold) 18%, transparent)" }}
              >
                06
              </div>
              <div
                aria-hidden
                className="mt-6 h-20 w-px"
                style={{ background: "linear-gradient(to bottom, var(--gold), transparent)" }}
              />
              <div className="mt-6">
                <Eyebrow>Where We Are Going</Eyebrow>
              </div>
            </div>

            <div>
              <H2>
                Built for the
                <br />
                businesses that
                <br />
                <em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>cannot afford to guess.</em>
              </H2>
              <div className="mt-8 max-w-3xl">
                <Prose>
                  <p>
                    DiQualia was built with a very specific client in mind: the B2B enterprise operating in a niche,
                    high-stakes market — where a wrong positioning decision costs not just a campaign, but a quarter.
                  </p>
                  <p className="mt-6">
                    These businesses do not need more content. They do not need more impressions. They need{" "}
                    <strong style={{ color: "var(--paper)", fontWeight: 400 }}>precision.</strong> They need someone who has done the real work of understanding their market — and
                    can translate that understanding into decisions they can act on with confidence.
                  </p>
                  <p className="mt-6">
                    We are not here to do marketing for the sake of marketing. We are here to move markets. For the
                    businesses smart enough to know the difference.
                  </p>
                </Prose>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PullQuote
        quote={
          <>
            We are not the loudest agency in the room. We are the one whose{" "}
            <span style={{ color: "var(--gold-lt)", fontStyle: "normal" }}>work speaks last</span> — after the noise has
            cleared.
          </>
        }
        cite="DiQualia — Brand Positioning Document, 2025"
      />

      {/* TAGLINE CLOSER */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[680px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(ellipse, color-mix(in oklab, var(--gold) 12%, transparent) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-4xl">
          {[
            ["Intelligence", false],
            ["that moves", true],
            ["markets.", false],
          ].map(([word, emphasize]) => (
            <div
              key={String(word)}
              className="text-foreground"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(3.5rem, 8vw, 8rem)",
                lineHeight: 1.0,
                fontStyle: emphasize ? "italic" : "normal",
                color: emphasize ? "var(--gold-lt)" : undefined,
              }}
            >
              {word}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
