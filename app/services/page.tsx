import type { Metadata } from "next";

import { ServicesTabs, type ServiceTab } from "./ServicesTabs";

export const metadata: Metadata = {
  title: "Services — DiQualia",
  description:
    "Six core intelligence services — built on deep research, designed to move B2B pipeline from invisible to inevitable.",
};

const tabs: ServiceTab[] = [
  { id: "s01", label: "Market Research" },
  { id: "s02", label: "Buyer Intelligence" },
  { id: "s03", label: "Positioning" },
  { id: "s04", label: "Lead Generation" },
  { id: "s05", label: "Competitive Intel" },
  { id: "s06", label: "Sales Enablement" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase" style={{ color: "var(--gold)" }}>
      <span aria-hidden className="inline-block h-px w-8" style={{ background: "var(--gold)" }} />
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-4"
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 300,
        fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
        lineHeight: 1.1,
        color: "var(--white)",
      }}
    >
      {children}
    </h2>
  );
}

export default function ServicesPage() {
  return (
    <div>
      {/* PAGE HERO */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
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

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 pb-16 pt-20 md:grid-cols-2 md:items-end md:gap-20 md:pb-20 md:pt-28">
          <div>
            <Eyebrow>Our Intelligence Services</Eyebrow>
            <h1
              className="mt-7"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                lineHeight: 0.98,
                fontSize: "clamp(2.8rem, 5.2vw, 4.8rem)",
                color: "var(--white)",
              }}
            >
              What We
              <br />
              Do for <em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>You.</em>
            </h1>
          </div>

          <div className="pb-2">
            <p className="text-[15px] leading-8" style={{ color: "var(--text-muted)" }}>
              Six core intelligence services — each built on deep research, each designed to move your B2B pipeline from
              invisible to inevitable.
            </p>

            <div
              className="mt-8 grid grid-cols-2 gap-px"
              style={{
                background: "color-mix(in oklab, var(--border) 100%, transparent)",
              }}
            >
              {[
                ["6", "Core Services"],
                ["94%", "Lead Quality Rate"],
                ["3.8x", "Pipeline Growth"],
                ["~21d", "First Qualified Lead"],
              ].map(([n, l]) => (
                <div key={l} className="p-6" style={{ background: "var(--bg-elev)" }}>
                  <div
                    className="text-[28px] leading-none"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "var(--gold)" }}
                  >
                    {n}
                  </div>
                  <div className="mt-2 text-[11px] tracking-[0.18em] uppercase" style={{ color: "var(--text-muted)" }}>
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServicesTabs tabs={tabs} />

      {/* SERVICE 01 */}
      <section id="s01" className="border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr] md:gap-16">
            <div
              className="text-[72px] leading-none"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "color-mix(in oklab, var(--gold) 12%, transparent)" }}
            >
              01
            </div>
            <div>
              <Eyebrow>Intelligence Service One</Eyebrow>
              <SectionTitle>Market Research &amp; Intelligence</SectionTitle>
              <p className="mt-6 text-[15px] leading-8" style={{ color: "var(--text-muted)" }}>
                Before we build a single strategy, we map your entire market landscape — demand signals, buyer behavior,
                emerging trends, and the whitespace your competitors haven&apos;t discovered yet. This is the intelligence
                foundation everything else is built on.
              </p>
            </div>
          </div>

          <div
            className="mt-14 overflow-hidden border"
            style={{
              borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
              background: "var(--bg-elev)",
            }}
          >
            <div
              className="h-0.5 w-full"
              style={{ background: "linear-gradient(90deg, var(--gold), color-mix(in oklab, var(--gold) 35%, transparent), var(--gold))" }}
            />

            <div className="grid grid-cols-1 gap-10 p-10 md:grid-cols-2 md:gap-14 md:p-12">
              <div>
                <div className="text-[11px] tracking-[0.22em] uppercase" style={{ color: "color-mix(in oklab, var(--gold) 35%, transparent)" }}>
                  Core Intelligence Service · 01
                </div>
                <div
                  className="mt-5 text-[26px]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--white)", lineHeight: 1.2 }}
                >
                  Know Your Market Before Anyone Else Does
                </div>
                <p className="mt-4 text-[13px] leading-7" style={{ color: "var(--text-muted)" }}>
                  We conduct deep, immersive research into your specific niche — studying who is buying, who is
                  searching, where demand is growing, and where the gaps in your market exist. The result is a complete
                  market intelligence brief that becomes your strategic compass.
                </p>

                <div className="mt-7 border-t pt-6" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
                  <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
                    What You Receive
                  </div>
                  <ul className="mt-4 space-y-3 text-[12px]" style={{ color: "color-mix(in oklab, var(--text) 70%, var(--bg))" }}>
                    {[
                      "Full market landscape report — demand, trends, and growth signals",
                      "Buyer segment analysis — who buys, why, and when",
                      "Whitespace mapping — opportunities your competitors are missing",
                      "Market sizing and addressable opportunity assessment",
                      "Industry language guide — how buyers actually speak",
                    ].map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <span aria-hidden style={{ color: "var(--gold)" }}>
                          →
                        </span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  [
                    "Demand Signal Analysis",
                    "We track where buyers are actively searching, what questions they ask, and what problems they urgently need solved — giving you a live map of market demand.",
                  ],
                  [
                    "Trend Intelligence",
                    "We identify emerging patterns in your sector before they become mainstream — so your positioning stays ahead of the market, not behind it.",
                  ],
                  [
                    "Whitespace Discovery",
                    "We find the gaps in your market — underserved segments, unmet needs, and positioning angles that no competitor has claimed yet.",
                  ],
                  [
                    "Sector Language Mapping",
                    "We decode the exact vocabulary your buyers use — the words that signal urgency, the phrases that build trust, the language that makes them act.",
                  ],
                ].map(([t, b]) => (
                  <div
                    key={t}
                    className="border-l-2 p-5"
                    style={{
                      background: "color-mix(in oklab, var(--gold) 6%, transparent)",
                      borderLeftColor: "color-mix(in oklab, var(--border) 100%, transparent)",
                    }}
                  >
                    <div className="text-[13px] tracking-[0.06em]" style={{ color: "var(--white)" }}>
                      {t}
                    </div>
                    <p className="mt-2 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>
                      {b}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE 02 */}
      <section
        id="s02"
        className="border-b"
        style={{ background: "var(--bg-elev)", borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr] md:gap-16">
            <div
              className="text-[72px] leading-none"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "color-mix(in oklab, var(--gold) 12%, transparent)" }}
            >
              02
            </div>
            <div>
              <Eyebrow>Intelligence Service Two</Eyebrow>
              <SectionTitle>Buyer Identification &amp; Profiling</SectionTitle>
              <p className="mt-6 text-[15px] leading-8" style={{ color: "var(--text-muted)" }}>
                We go beyond demographics. We build precise, research-backed profiles of your ideal buyers — who they
                are, how they think, what triggers their decisions, and exactly where to find them. Every profile is
                built from real market data, not assumptions.
              </p>
            </div>
          </div>

          <div
            className="mt-14 grid grid-cols-1 gap-px md:grid-cols-2"
            style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}
          >
            {[
              [
                "02 · A — Decision Maker Mapping",
                "Who Actually Makes the Decision",
                "We identify the exact decision-makers in your target organisations — their titles, their roles in the buying process, their priorities, and the pressures they're under. We map the full buying committee, not just the obvious contact.",
                ["Decision-maker profile database per target segment", "Buying committee map — influencers, gatekeepers, champions", "Role-specific pain point analysis"],
              ],
              [
                "02 · B — Psychographic Profiling",
                "How They Think & What Moves Them",
                "Beyond job titles, we study how your buyers think — their risk tolerance, their ambitions, their frustrations, and the emotional triggers that push them from consideration to action. This is the intelligence that makes outreach feel personal.",
                ["Psychographic buyer profiles per segment", "Trigger event mapping — what makes buyers move now", "Objection library with intelligence-backed responses"],
              ],
              [
                "02 · C — Buyer Journey Mapping",
                "The Path from Problem to Purchase",
                "We map every stage of your buyer's journey — from the moment they recognise a problem to the moment they sign a contract. Understanding this path lets us intercept buyers at exactly the right moment with exactly the right message.",
                ["Full buyer journey map with touchpoint analysis", "Channel preference analysis per buyer stage", "Content and messaging matrix per journey stage"],
              ],
              [
                "02 · D — ICP Definition",
                "Your Ideal Client Profile — Precisely Defined",
                "We define your Ideal Client Profile with surgical precision — industry, company size, revenue range, team structure, growth stage, and the specific signals that indicate a prospect is ready and able to buy from you right now.",
                ["Written ICP document with all qualifying criteria", "Negative ICP — who to deprioritise and why", "Prospect scoring framework for your sales team"],
              ],
            ].map(([k, t, b, delivs]) => (
              <div key={String(k)} className="p-10" style={{ background: "var(--bg)" }}>
                <div className="text-[11px] tracking-[0.22em] uppercase" style={{ color: "color-mix(in oklab, var(--gold) 35%, transparent)" }}>
                  {k}
                </div>
                <div
                  className="mt-4 text-[20px]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--white)", lineHeight: 1.2 }}
                >
                  {t}
                </div>
                <p className="mt-4 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>
                  {b}
                </p>
                <div className="mt-6 border-t pt-5" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
                  <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
                    Deliverables
                  </div>
                  <ul className="mt-3 space-y-2 text-[12px]" style={{ color: "color-mix(in oklab, var(--text) 70%, var(--bg))" }}>
                    {(delivs as string[]).map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <span aria-hidden style={{ color: "var(--gold)" }}>
                          →
                        </span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE 03 */}
      <section id="s03" className="border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr] md:gap-16">
            <div
              className="text-[72px] leading-none"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "color-mix(in oklab, var(--gold) 12%, transparent)" }}
            >
              03
            </div>
            <div>
              <Eyebrow>Intelligence Service Three</Eyebrow>
              <SectionTitle>Positioning &amp; Messaging Strategy</SectionTitle>
              <p className="mt-6 text-[15px] leading-8" style={{ color: "var(--text-muted)" }}>
                Most B2B companies are excellent at what they do but invisible in how they communicate it. We translate
                your technical expertise into sharp, resonant market language that makes decision-makers immediately
                understand your value — and immediately prefer you.
              </p>
            </div>
          </div>

          <div
            className="mt-14 grid grid-cols-1 gap-px md:grid-cols-2"
            style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}
          >
            {[
              [
                "03 · A — Market Positioning",
                "Where You Stand. Why You Win.",
                "We craft a positioning strategy that places you in the ideal spot in your market — differentiated from competitors, aligned with buyer priorities, and occupying territory no one else has claimed. Clear, ownable, and built to last.",
                ["Positioning statement — clear, distinct, ownable", "Competitive differentiation map", "Market category definition and ownership strategy"],
              ],
              [
                "03 · B — Messaging Architecture",
                "The Right Words for Every Buyer",
                "We build a complete messaging architecture — from your core value proposition down to role-specific talking points for every buyer in the purchasing committee. One coherent story, precisely adapted for every audience.",
                ["Master messaging document — core narrative and proof points", "Role-specific messaging variants per buyer persona", "Tagline and headline options with intelligence rationale"],
              ],
              [
                "03 · C — Value Proposition",
                "Why You. Why Now. Why Not Anyone Else.",
                "We build a value proposition that answers the buyer's three hardest questions before they even ask them — grounded in real market research and tested against actual buyer priorities in your sector.",
                ["Primary value proposition — full and compressed versions", "Supporting proof points and evidence framework", "Website and LinkedIn copy recommendations"],
              ],
              [
                "03 · D — Brand Voice",
                "How You Sound Across Every Channel",
                "We define your brand voice — the tone, style, and language that makes all your communications feel consistent, credible, and distinctly yours. From cold emails to LinkedIn posts to proposal documents, one coherent voice.",
                ["Brand voice guide with do's and don'ts", "Tone spectrum — formal to conversational contexts", "Sample copy examples across key channels"],
              ],
            ].map(([k, t, b, delivs]) => (
              <div key={String(k)} className="p-10" style={{ background: "var(--bg-elev)" }}>
                <div className="text-[11px] tracking-[0.22em] uppercase" style={{ color: "color-mix(in oklab, var(--gold) 35%, transparent)" }}>
                  {k}
                </div>
                <div
                  className="mt-4 text-[20px]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--white)", lineHeight: 1.2 }}
                >
                  {t}
                </div>
                <p className="mt-4 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>
                  {b}
                </p>
                <div className="mt-6 border-t pt-5" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
                  <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
                    Deliverables
                  </div>
                  <ul className="mt-3 space-y-2 text-[12px]" style={{ color: "color-mix(in oklab, var(--text) 70%, var(--bg))" }}>
                    {(delivs as string[]).map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <span aria-hidden style={{ color: "var(--gold)" }}>
                          →
                        </span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE 04 */}
      <section
        id="s04"
        className="border-b"
        style={{ background: "var(--bg-elev)", borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr] md:gap-16">
            <div
              className="text-[72px] leading-none"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "color-mix(in oklab, var(--gold) 12%, transparent)" }}
            >
              04
            </div>
            <div>
              <Eyebrow>Intelligence Service Four</Eyebrow>
              <SectionTitle>B2B Lead Generation</SectionTitle>
              <p className="mt-6 text-[15px] leading-8" style={{ color: "var(--text-muted)" }}>
                Every lead we generate is pre-qualified by intelligence. We don&apos;t spray and pray — we identify buyers who
                match your ICP precisely, engage them on the channels they actually use, and deliver conversations with
                people who are genuinely ready to listen.
              </p>
            </div>
          </div>

          <div
            className="mt-14 grid grid-cols-1 gap-px md:grid-cols-2"
            style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}
          >
            {[
              [
                "04 · A — LinkedIn Outreach",
                "LinkedIn — Where B2B Decisions Happen",
                "We build and execute targeted LinkedIn outreach campaigns — from profile optimisation and connection strategies to message sequences that open conversations with decision-makers in your exact target market.",
                ["LinkedIn profile and company page optimisation", "Targeted connection and outreach sequences", "Weekly qualified conversation reports"],
              ],
              [
                "04 · B — Email Campaigns",
                "Cold Email That Doesn't Feel Cold",
                "We write and execute email outreach campaigns grounded in buyer research — every sequence is personalised to the recipient's industry, role, and likely pain points. High open rates. High reply rates. Zero spam feel.",
                ["Research-backed email sequences (5–7 touches)", "A/B tested subject lines and CTAs", "Reply handling scripts and objection responses"],
              ],
              [
                "04 · C — Prospect Lists",
                "Precision-Built Prospect Databases",
                "We build hand-verified prospect lists of companies and contacts that match your ICP exactly — no generic data scrapes, no outdated contacts. Every name on the list is a real decision-maker with a real reason to speak with you.",
                ["Verified prospect database per target segment", "Contact details — name, title, LinkedIn, email", "Personalisation notes per prospect"],
              ],
              [
                "04 · D — Pipeline Reporting",
                "Intelligence You Can Act On — Weekly",
                "We deliver weekly pipeline intelligence reports — who opened, who replied, who engaged, what patterns we're seeing, and what we're adjusting. You always know exactly where your pipeline stands and why.",
                ["Weekly pipeline performance dashboard", "Lead quality scoring and classification", "Strategic adjustments and next-week plan"],
              ],
            ].map(([k, t, b, delivs]) => (
              <div key={String(k)} className="p-10" style={{ background: "var(--bg)" }}>
                <div className="text-[11px] tracking-[0.22em] uppercase" style={{ color: "color-mix(in oklab, var(--gold) 35%, transparent)" }}>
                  {k}
                </div>
                <div
                  className="mt-4 text-[20px]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--white)", lineHeight: 1.2 }}
                >
                  {t}
                </div>
                <p className="mt-4 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>
                  {b}
                </p>
                <div className="mt-6 border-t pt-5" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
                  <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
                    Deliverables
                  </div>
                  <ul className="mt-3 space-y-2 text-[12px]" style={{ color: "color-mix(in oklab, var(--text) 70%, var(--bg))" }}>
                    {(delivs as string[]).map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <span aria-hidden style={{ color: "var(--gold)" }}>
                          →
                        </span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE 05 */}
      <section id="s05" className="border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr] md:gap-16">
            <div
              className="text-[72px] leading-none"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "color-mix(in oklab, var(--gold) 12%, transparent)" }}
            >
              05
            </div>
            <div>
              <Eyebrow>Intelligence Service Five</Eyebrow>
              <SectionTitle>Competitive Intelligence</SectionTitle>
              <p className="mt-6 text-[15px] leading-8" style={{ color: "var(--text-muted)" }}>
                Know your competitors better than they know themselves. We track how they position, what they promise,
                how they price, and where they&apos;re winning and losing. This intelligence becomes your unfair advantage in
                every sales conversation.
              </p>
            </div>
          </div>

          <div
            className="mt-14 grid grid-cols-1 gap-px md:grid-cols-2"
            style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}
          >
            {[
              [
                "05 · A — Competitor Analysis",
                "Full Competitor Landscape Audit",
                "We conduct a comprehensive audit of your top competitors — their positioning, messaging, pricing signals, service offerings, client types, and the gaps and weaknesses in their market approach that you can exploit.",
                ["Competitor profile cards — full analysis per competitor", "Positioning comparison matrix", "Competitor weakness and gap report"],
              ],
              [
                "05 · B — Win/Loss Intelligence",
                "Why Deals Are Won and Lost",
                "We analyse patterns in your industry's win/loss dynamics — what makes buyers choose one provider over another, what objections come up most, and what the decisive factors are in competitive shortlisting situations.",
                ["Win/loss pattern analysis for your sector", "Decision factor ranking by buyer type", "Competitive battle cards for your sales team"],
              ],
              [
                "05 · C — Pricing Intelligence",
                "What the Market Will Bear",
                "We research pricing signals, packaging approaches, and value anchoring strategies across your competitive set — giving you the intelligence to price with confidence and position your fees as an investment, not a cost.",
                ["Competitive pricing signal report", "Packaging and tier structure recommendations", "Value anchoring and pricing language guide"],
              ],
              [
                "05 · D — Ongoing Monitoring",
                "Stay One Step Ahead — Always",
                "Markets move. Competitors pivot. We provide ongoing competitive monitoring — tracking changes in your competitive landscape and alerting you to new threats, opportunities, and shifts that require a strategic response.",
                ["Monthly competitive intelligence briefing", "Alert system for significant competitor moves", "Quarterly landscape reassessment report"],
              ],
            ].map(([k, t, b, delivs]) => (
              <div key={String(k)} className="p-10" style={{ background: "var(--bg-elev)" }}>
                <div className="text-[11px] tracking-[0.22em] uppercase" style={{ color: "color-mix(in oklab, var(--gold) 35%, transparent)" }}>
                  {k}
                </div>
                <div
                  className="mt-4 text-[20px]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--white)", lineHeight: 1.2 }}
                >
                  {t}
                </div>
                <p className="mt-4 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>
                  {b}
                </p>
                <div className="mt-6 border-t pt-5" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
                  <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
                    Deliverables
                  </div>
                  <ul className="mt-3 space-y-2 text-[12px]" style={{ color: "color-mix(in oklab, var(--text) 70%, var(--bg))" }}>
                    {(delivs as string[]).map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <span aria-hidden style={{ color: "var(--gold)" }}>
                          →
                        </span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE 06 */}
      <section
        id="s06"
        className="border-b"
        style={{ background: "var(--bg-elev)", borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr] md:gap-16">
            <div
              className="text-[72px] leading-none"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "color-mix(in oklab, var(--gold) 12%, transparent)" }}
            >
              06
            </div>
            <div>
              <Eyebrow>Intelligence Service Six</Eyebrow>
              <SectionTitle>Sales Enablement &amp; Content</SectionTitle>
              <p className="mt-6 text-[15px] leading-8" style={{ color: "var(--text-muted)" }}>
                Intelligence only creates value when it translates into tools your team can use every day. We build the
                proposals, pitch decks, case studies, and outreach sequences that arm your sales team with everything
                they need to close — consistently and confidently.
              </p>
            </div>
          </div>

          <div
            className="mt-14 grid grid-cols-1 gap-px md:grid-cols-2"
            style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}
          >
            {[
              [
                "06 · A — Proposals",
                "Proposals That Win",
                "We build proposal templates and custom proposals grounded in buyer research — structured to address the exact concerns of each decision-maker, backed by relevant proof, and designed to make the decision to choose you feel obvious.",
                ["Master proposal template — fully customisable", "Sector-specific proposal variants", "Proposal review and optimisation service"],
              ],
              [
                "06 · B — Pitch Decks",
                "Decks That Open Doors",
                "We design pitch decks that tell a compelling, intelligence-led story — from the problem your client is facing to the precise solution you offer to the proof that you can deliver. Every slide earns its place.",
                ["Full pitch deck — narrative, design, content", "Short version — 5-slide executive summary", "Leave-behind one-pager"],
              ],
              [
                "06 · C — Case Studies",
                "Proof That Persuades",
                "We build case studies that go beyond testimonials — structured as before/after intelligence stories that show the problem, the approach, and the measurable results. The kind of proof that removes a buyer's last objection.",
                ["Long-form case study — full problem/solution/result", "Compact case study — one-page format", "LinkedIn case study post version"],
              ],
              [
                "06 · D — Outreach Sequences",
                "Words That Start Conversations",
                "We write outreach sequences — email and LinkedIn — that feel researched, relevant, and human. Every sequence is built from buyer intelligence, designed to open a real conversation, not trigger an unsubscribe.",
                ["Full outreach sequence — 5 to 7 touch points", "Follow-up and re-engagement sequences", "Personalisation framework for your team"],
              ],
            ].map(([k, t, b, delivs]) => (
              <div key={String(k)} className="p-10" style={{ background: "var(--bg)" }}>
                <div className="text-[11px] tracking-[0.22em] uppercase" style={{ color: "color-mix(in oklab, var(--gold) 35%, transparent)" }}>
                  {k}
                </div>
                <div
                  className="mt-4 text-[20px]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--white)", lineHeight: 1.2 }}
                >
                  {t}
                </div>
                <p className="mt-4 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>
                  {b}
                </p>
                <div className="mt-6 border-t pt-5" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
                  <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
                    Deliverables
                  </div>
                  <ul className="mt-3 space-y-2 text-[12px]" style={{ color: "color-mix(in oklab, var(--text) 70%, var(--bg))" }}>
                    {(delivs as string[]).map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <span aria-hidden style={{ color: "var(--gold)" }}>
                          →
                        </span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTELLIGENCE PROCESS STRIP */}
      <section className="border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <Eyebrow>How Every Service Begins</Eyebrow>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
              lineHeight: 1.1,
              color: "var(--white)",
            }}
          >
            The DiQualia Intelligence Process
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-5" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
            {[
              ["Step One", "01", "Sector Immersion", "We spend the first week doing nothing but learning your industry — its language, rhythms, buyers, and dynamics. No strategy until we know your market deeply."],
              ["Step Two", "02", "Buyer Mapping", "We identify and profile your ideal buyers — building precise, evidence-based profiles that inform every piece of outreach and content we create."],
              ["Step Three", "03", "Intelligence Brief", "We compile all research into a strategic intelligence brief — your market, your buyers, your positioning, and your go-to-market plan. The compass for everything that follows."],
              ["Step Four", "04", "Execution", "With intelligence in hand, we execute — campaigns, content, outreach, and enablement tools — all grounded in research, all calibrated to your exact market."],
              ["Step Five", "05", "Optimise & Scale", "We measure what matters, learn from every signal, and continuously refine the intelligence engine — making your pipeline grow smarter and stronger every week."],
            ].map(([tag, num, title, body]) => (
              <div key={num} className="p-8" style={{ background: "var(--bg-elev)" }}>
                <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
                  {tag}
                </div>
                <div
                  className="mt-4 text-[36px] leading-none"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "color-mix(in oklab, var(--gold) 18%, transparent)" }}
                >
                  {num}
                </div>
                <div className="mt-4 text-[13px] tracking-[0.06em]" style={{ color: "var(--white)" }}>
                  {title}
                </div>
                <p className="mt-3 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENGAGEMENT MODELS */}
      <section className="border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <Eyebrow>How We Engage</Eyebrow>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
              lineHeight: 1.1,
              color: "var(--white)",
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

                <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
                  {tag}
                </div>
                <div
                  className="mt-4 text-[22px]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--white)", lineHeight: 1.2 }}
                >
                  {title}
                </div>
                <p className="mt-4 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>
                  {desc}
                </p>
                <div className="mt-7 border-t pt-6" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
                  <ul className="space-y-3 text-[12px]" style={{ color: "color-mix(in oklab, var(--text) 70%, var(--bg))" }}>
                    {(items as string[]).map((x) => (
                      <li key={x} className="flex items-center gap-3">
                        <span aria-hidden style={{ color: "var(--gold)" }}>
                          ✓
                        </span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#contact"
                  className="mt-8 block border px-4 py-3 text-center text-[11px] tracking-[0.22em] uppercase no-underline transition-colors"
                  style={{
                    borderColor: featured ? "var(--gold)" : "color-mix(in oklab, var(--border) 80%, transparent)",
                    color: featured ? "var(--gold)" : "var(--text-muted)",
                  }}
                >
                  {cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY DIQUALIA GRID (services version) */}
      <section className="border-b" style={{ background: "var(--bg-elev)", borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <Eyebrow>Why DiQualia</Eyebrow>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
              lineHeight: 1.1,
              color: "var(--white)",
            }}
          >
            Not a Marketing Agency. A Marketing Intelligence Unit.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-3" style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}>
            {[
              ["R", "Research Before Everything", "Every service begins with deep, unhurried research into your market. We never launch before we understand your sector as well as you do — often better."],
              ["N", "Niche B2B Specialists", "We work exclusively in niche B2B industries — not mass markets, not B2C, not general marketing. Deep specialisation is how we move markets."],
              ["D", "Data-Driven, Always", "Every recommendation we make is backed by evidence. Every strategy is grounded in real market data. We don’t guess — we research, we verify, then we act."],
              ["P", "Precision Over Volume", "We don’t generate hundreds of unqualified leads. We generate a precise number of deeply qualified conversations with buyers ready, able, and willing to engage."],
              ["I", "Intelligence That Compounds", "The intelligence we build doesn’t expire after a campaign. It compounds — each engagement making the next one faster, sharper, and more effective."],
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
                  className="mt-5 text-[16px]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--white)" }}
                >
                  {title}
                </div>
                <p className="mt-3 text-[12px] leading-7" style={{ color: "var(--text-muted)" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
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
        <div className="relative mx-auto w-full max-w-3xl px-6 py-20">
          <div className="text-[11px] tracking-[0.35em] uppercase" style={{ color: "color-mix(in oklab, var(--ink) 55%, transparent)" }}>
            Begin With Intelligence
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
            Ready to Start?
            <br />
            Let&apos;s Build Your Intelligence.
          </h2>
          <p className="mx-auto mt-4 max-w-[62ch] text-[15px] leading-8" style={{ color: "color-mix(in oklab, var(--ink) 55%, transparent)" }}>
            Every engagement begins with a no-cost discovery call — 30 minutes, no pitch, just research.
          </p>
          <a
            href="mailto:intel@diqualia.com"
            className="mt-10 inline-block border-b-2 pb-1 text-[22px] no-underline"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              letterSpacing: "0.04em",
              color: "var(--ink)",
              borderBottomColor: "color-mix(in oklab, var(--ink) 30%, transparent)",
            }}
          >
            intel@diqualia.com
          </a>
        </div>
      </section>
    </div>
  );
}

