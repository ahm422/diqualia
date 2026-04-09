export default function Home() {
  return (
    <div style={{ background: "var(--diq_ink)" }}>
      {/* HERO */}
      <section className="diq-hero relative min-h-screen overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(var(--diq_grid) 1px, transparent 1px), linear-gradient(90deg, var(--diq_grid) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(202,168,75,.018) 1px, transparent 1px), linear-gradient(90deg, rgba(202,168,75,.018) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[20%] -right-[10%] h-[70vw] w-[70vw] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(202,168,75,.055) 0%, transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[25%] -left-[5%] h-[50vw] w-[50vw] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(58,138,122,.06) 0%, transparent 65%)",
          }}
        />
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

        {/* Cipher watermark */}
        <div
          aria-hidden
          className="absolute top-1/2 hidden -translate-y-1/2 opacity-[0.05] md:block"
          style={{ right: "var(--diq-gutter)" }}
        >
          <svg viewBox="0 0 340 400" fill="none" width="340">
            <circle cx="30" cy="30" r="5.5" fill="#CAA84B" opacity=".1" />
            <circle cx="98" cy="30" r="3" fill="#CAA84B" opacity=".06" />
            <circle cx="166" cy="30" r="6" fill="#CAA84B" opacity=".09" />
            <circle cx="234" cy="30" r="3.8" fill="#CAA84B" opacity=".05" />
            <circle cx="302" cy="30" r="6.2" fill="#CAA84B" opacity=".11" />
            <circle cx="30" cy="98" r="3" fill="#CAA84B" opacity=".05" />
            <circle cx="98" cy="98" r="6.8" fill="#CAA84B" opacity=".12" />
            <circle cx="166" cy="98" r="4.5" fill="#CAA84B" opacity=".07" />
            <circle cx="234" cy="98" r="6.5" fill="#CAA84B" opacity=".1" />
            <circle cx="302" cy="98" r="2.8" fill="#CAA84B" opacity=".04" />
            <circle cx="30" cy="170" r="6" fill="#CAA84B" opacity=".09" />
            <circle cx="98" cy="170" r="3.8" fill="#CAA84B" opacity=".06" />
            <circle cx="166" cy="170" r="11" fill="#CAA84B" opacity=".14" />
            <circle cx="166" cy="170" r="20" fill="none" stroke="#CAA84B" strokeWidth="1.5" opacity=".07" />
            <circle cx="166" cy="170" r="4.5" fill="#3A8A7A" opacity=".18" />
            <circle cx="234" cy="170" r="3" fill="#CAA84B" opacity=".05" />
            <circle cx="302" cy="170" r="7" fill="#CAA84B" opacity=".1" />
            <circle cx="30" cy="238" r="3.5" fill="#CAA84B" opacity=".05" />
            <circle cx="98" cy="238" r="6.2" fill="#CAA84B" opacity=".09" />
            <circle cx="166" cy="238" r="2.8" fill="#CAA84B" opacity=".04" />
            <circle cx="234" cy="238" r="7.5" fill="#CAA84B" opacity=".11" />
            <circle cx="302" cy="238" r="4" fill="#CAA84B" opacity=".06" />
            <circle cx="30" cy="306" r="6.8" fill="#CAA84B" opacity=".09" />
            <circle cx="98" cy="306" r="3" fill="#CAA84B" opacity=".04" />
            <circle cx="166" cy="306" r="5.5" fill="#CAA84B" opacity=".08" />
            <circle cx="234" cy="306" r="3.5" fill="#CAA84B" opacity=".05" />
            <circle cx="302" cy="306" r="6" fill="#3A8A7A" opacity=".1" />
            <circle cx="30" cy="374" r="2.8" fill="#CAA84B" opacity=".04" />
            <circle cx="98" cy="374" r="7" fill="#CAA84B" opacity=".1" />
            <circle cx="166" cy="374" r="3.5" fill="#CAA84B" opacity=".06" />
            <circle cx="234" cy="374" r="5" fill="#CAA84B" opacity=".08" />
            <circle cx="302" cy="374" r="6.8" fill="#CAA84B" opacity=".09" />
            <rect x="142" y="148" width="48" height="44" fill="none" stroke="#CAA84B" strokeWidth="1" opacity=".06" rx="1" />
          </svg>
        </div>

        {/* Hero stat box */}
        <div
          className="absolute top-[160px] hidden w-[224px] border md:block"
          style={{
            background: "var(--diq_surface)",
            borderColor: "var(--diq_border)",
            borderTop: "2px solid var(--gold)",
            right: "var(--diq-gutter)",
          }}
        >
          <div
            className="px-[18px] py-[14px]"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "8px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "var(--gold)",
              borderBottom: "1px solid var(--diq_border2)",
            }}
          >
            [ Intelligence Panel ]
          </div>
          {[
            ["Lead Quality", "94%"],
            ["Pipeline Growth", "3.8x"],
            ["First Lead", "~21d"],
          ].map(([l, v]) => (
            <div
              key={l}
              className="flex items-center justify-between px-[18px] py-[13px]"
              style={{ borderBottom: "1px solid var(--diq_border2)" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "var(--diq_mid)",
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "var(--gold)",
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-[1] max-w-[860px]">
          <p
            className="mb-7 flex items-center gap-3"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: "rgba(74,173,160,1)",
              animation: "diq_fadeUp .7s ease .2s forwards",
              opacity: 0,
            }}
          >
            <span aria-hidden className="inline-block h-px w-7" style={{ background: "rgba(74,173,160,1)" }} />
            Marketing Intelligence &amp; Research
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(48px, 6.5vw, 96px)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-1px",
              marginBottom: 16,
              opacity: 0,
              animation: "diq_fadeUp .9s ease .35s forwards",
              maxWidth: 820,
            }}
          >
            Intelligence
            <br />
            That <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Moves</em>
            <br />
            <span
              aria-hidden
              style={{
                WebkitTextStroke: "1px rgba(202,168,75,.3)",
                color: "transparent",
              }}
            >
              Markets.
            </span>
            <span className="sr-only">Markets.</span>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(15px, 1.6vw, 18px)",
              fontWeight: 300,
              color: "var(--diq_pale)",
              lineHeight: 1.9,
              maxWidth: 540,
              marginBottom: 52,
              opacity: 0,
              animation: "diq_fadeUp .8s ease .55s forwards",
            }}
          >
            DiQualia is a marketing intelligence and research unit for niche B2B companies. We research your market
            deeply, map your buyers precisely, and build intelligence-led strategies that create real, lasting pipeline
            growth.
          </p>
          <div
            className="flex items-center gap-4"
            style={{ opacity: 0, animation: "diq_fadeUp .8s ease .75s forwards" }}
          >
            <a href="#services" className="diq-btnGold">
              Our Services
            </a>
            <a href="#contact" className="diq-btnGhost">
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div
        className="overflow-hidden border-y"
        style={{
          background: "var(--diq_surface)",
          borderColor: "var(--diq_border)",
          padding: "12px 0",
          whiteSpace: "nowrap",
        }}
      >
        <div className="inline-flex" style={{ animation: "diq_ticker 36s linear infinite" }}>
          {[
            ["Market Research", "Niche B2B Intelligence"],
            ["Buyer Mapping", "Decision Maker Profiling"],
            ["Competitive Intel", "Precision Positioning"],
            ["Lead Generation", "Qualified & Targeted"],
            ["Sales Enablement", "Data-Backed Strategy"],
            ["Sector Research", "Deep Industry Expertise"],
            ["Market Research", "Niche B2B Intelligence"],
            ["Buyer Mapping", "Decision Maker Profiling"],
            ["Competitive Intel", "Precision Positioning"],
            ["Lead Generation", "Qualified & Targeted"],
            ["Sales Enablement", "Data-Backed Strategy"],
            ["Sector Research", "Deep Industry Expertise"],
          ].map(([b, rest], idx) => (
            <div
              key={`${b}-${idx}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--diq_mid)",
                padding: "0 44px",
                borderRight: "1px solid var(--diq_border)",
              }}
            >
              <b style={{ color: "var(--gold)", fontWeight: 400 }}>{b}</b> — {rest}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <div id="about" className="diq-sectionY" style={{ background: "var(--diq_ivory)" }}>
        <div className="diq-padX mx-auto grid max-w-[1300px] grid-cols-1 gap-[100px] md:grid-cols-2">
          <div className="diq-reveal">
            <p
              className="mb-[14px] flex items-center gap-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "5px",
                textTransform: "uppercase",
                color: "#8A6E28",
              }}
            >
              <span aria-hidden className="inline-block h-px w-[22px]" style={{ background: "#8A6E28" }} />
              What Is DiQualia
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px,4.5vw,60px)",
                fontWeight: 700,
                color: "var(--diq_ink)",
                lineHeight: 1.02,
                letterSpacing: "-0.5px",
                marginBottom: 18,
              }}
            >
              Not an Agency.
              <br />
              An <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Intelligence</em>
              <br />
              Unit.
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, lineHeight: 1.9, color: "#4A4638", maxWidth: 560 }}>
              DiQualia operates at the intersection of deep market research and precision go-to-market strategy. We
              immerse ourselves in your industry before we touch a single campaign — understanding your buyers, your
              competitors, and your whitespace better than anyone else in the room.
            </p>
          </div>

          <div className="diq-reveal">
            {[
              ["I", "Research Before Everything", "Every engagement begins with deep sector immersion. No strategy until we know your market as well as you do — often better."],
              ["II", "Precision Over Volume", "We don't generate noise. We identify the exact buyers who are ready, able, and willing to engage — then reach them with precision."],
              ["III", "Intelligence That Compounds", "The intelligence we build doesn't expire. Every engagement makes the next one faster, sharper, and more effective."],
              ["IV", "Built to Scale Across Industries", "We grow with you — from one niche to many, one market to several, without ever losing the depth that makes intelligence valuable."],
            ].map(([num, title, body]) => (
              <div
                key={num}
                className="grid grid-cols-[40px_1fr] gap-4 py-7"
                style={{ borderBottom: "1px solid rgba(202,168,75,.15)" }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic", color: "var(--gold)" }}>
                  {num}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: "var(--diq_ink)", marginBottom: 7 }}>
                    {title}
                  </div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#6A6250", lineHeight: 1.8 }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATEMENT */}
      <div className="diq-statement relative overflow-hidden" style={{ background: "var(--gold)" }}>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(8,9,12,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(8,9,12,.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative z-[1] mx-auto flex max-w-[1300px] items-center justify-between gap-[60px]">
          <div className="hidden h-px flex-1 md:block" style={{ background: "rgba(8,9,12,.18)" }} />
          <div className="max-w-[680px] text-center">
            <div
              aria-hidden
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 72,
                color: "rgba(8,9,12,.1)",
                lineHeight: 0.7,
                marginBottom: 4,
              }}
            >
              &quot;
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(20px,2.8vw,32px)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "rgba(8,9,12,.75)",
                lineHeight: 1.5,
              }}
            >
              The finest B2B companies don&apos;t just market harder — they understand their market more deeply and more
              precisely than anyone else in it.
            </p>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                letterSpacing: "5px",
                textTransform: "uppercase",
                color: "var(--diq_ivory)",
                marginTop: 14,
              }}
            >
              DiQualia · Marketing Intelligence &amp; Research
            </div>
          </div>
          <div className="hidden h-px flex-1 md:block" style={{ background: "rgba(8,9,12,.18)" }} />
        </div>
      </div>

      {/* SERVICES */}
      <div id="services" className="diq-sectionY" style={{ background: "var(--diq_deep)", borderTop: "1px solid var(--diq_border)" }}>
        <div className="diq-padX mx-auto max-w-[1300px]">
          <div className="diq-reveal grid grid-cols-1 gap-[80px] md:grid-cols-2 md:items-end" style={{ marginBottom: 60 }}>
            <div>
              <p
                className="mb-[14px] flex items-center gap-3"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "5px",
                  textTransform: "uppercase",
                  color: "rgba(74,173,160,1)",
                }}
              >
                <span aria-hidden className="inline-block h-px w-[22px]" style={{ background: "rgba(74,173,160,1)" }} />
                Intelligence Services
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px,4vw,52px)",
                  fontWeight: 700,
                  color: "var(--diq_ivory)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.5px",
                  marginBottom: 18,
                }}
              >
                Six Services.
                <br />
                <em style={{ fontStyle: "italic", color: "var(--gold)" }}>All Research-First.</em>
              </h2>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic", color: "var(--diq_mid)", lineHeight: 1.8 }}>
              We don&apos;t start with tactics. We start with intelligence — then build everything on top of it.
            </p>
          </div>

          <div className="diq-reveal grid grid-cols-1 gap-px md:grid-cols-3" style={{ background: "var(--diq_border2)" }}>
            {[
              ["I.", "Market Research & Intelligence", "Comprehensive sector analysis — demand signals, buyer behaviour, market trends, and the whitespace your competitors haven't found yet.", ["Full market landscape report", "Buyer segment analysis", "Whitespace & opportunity map"]],
              ["II.", "Buyer Identification & Profiling", "Precise, research-backed profiles of your ideal buyers — who they are, how they decide, and the exact language that moves them to act.", ["Decision-maker profiles", "Buyer journey mapping", "ICP definition document"]],
              ["III.", "Positioning & Messaging", "We translate your technical expertise into sharp, resonant market language that makes decision-makers immediately understand your value.", ["Positioning strategy document", "Messaging architecture", "Value proposition framework"]],
              ["IV.", "B2B Lead Generation", "Precision-targeted outreach across LinkedIn, email, and industry platforms — reaching qualified buyers who are actively looking for what you offer.", ["LinkedIn & email campaigns", "Verified prospect lists", "Weekly pipeline reports"]],
              ["V.", "Competitive Intelligence", "Know how competitors are positioning, pricing, and selling. We give you the intelligence to differentiate clearly and stay one step ahead.", ["Competitor landscape audit", "Win/loss intelligence", "Competitive battle cards"]],
              ["VI.", "Sales Enablement & Content", "Proposals, pitch decks, case studies, and outreach sequences — all built from research, designed to shorten your sales cycle and improve close rates.", ["Proposals & pitch decks", "Case studies & content", "Outreach sequences"]],
            ].map(([icon, title, body, delivs]) => (
              <div key={icon as string} className="p-10" style={{ background: "var(--diq_deep)" }}>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    fontStyle: "italic",
                    color: "var(--gold)",
                    marginBottom: 14,
                    lineHeight: 1,
                  }}
                >
                  {icon}
                </span>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--diq_ivory)", marginBottom: 10, lineHeight: 1.2 }}>
                  {title}
                </div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 300, color: "var(--diq_mid)", lineHeight: 1.85 }}>
                  {body}
                </p>
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--diq_border2)" }}>
                  {(delivs as string[]).map((d) => (
                    <div key={d} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--diq_pale)", padding: "5px 0", display: "flex", gap: 8 }}>
                      <span aria-hidden style={{ color: "rgba(74,173,160,1)" }}>
                        →
                      </span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NUMBERS */}
      <div style={{ background: "var(--gold)" }}>
        <div className="diq-numbersInner mx-auto max-w-[1300px]">
          {[
            ["94%", "Lead Quality", "Intelligence-qualified only"],
            ["3.8x", "Pipeline Growth", "Average per engagement"],
            ["21d", "First Qualified Lead", "Post-research phase"],
            ["100%", "Research First", "No guesswork. Ever."],
          ].map(([n, l, s]) => (
            <div
              key={l}
              className="diq-numbersItem text-center"
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(44px,5vw,68px)", fontWeight: 700, color: "var(--diq_ink)", lineHeight: 1, letterSpacing: "-1px" }}>
                {n}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(8,9,12,.5)", marginTop: 10 }}>
                {l}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "rgba(8,9,12,.38)", marginTop: 4 }}>
                {s}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROCESS */}
      <div id="process" className="diq-sectionY" style={{ background: "var(--diq_ink)", borderTop: "1px solid var(--diq_border)" }}>
        <div className="diq-padX mx-auto max-w-[1300px]">
          <div className="diq-reveal">
            <p
              className="mb-[14px] flex items-center gap-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "5px",
                textTransform: "uppercase",
                color: "rgba(74,173,160,1)",
              }}
            >
              <span aria-hidden className="inline-block h-px w-[22px]" style={{ background: "rgba(74,173,160,1)" }} />
              How We Work
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px,4.5vw,60px)",
                fontWeight: 700,
                color: "var(--diq_ivory)",
                lineHeight: 1.02,
                letterSpacing: "-0.5px",
                marginBottom: 18,
              }}
            >
              Research.
              <br />
              <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Precision.</em> Results.
            </h2>
          </div>

          <div className="mt-[60px] grid grid-cols-1 gap-[80px] md:grid-cols-2">
            <div className="diq-reveal">
              {[
                ["I", "Immerse in Your Sector", "We begin every engagement with deep research into your industry — its language, buying cycles, competitive dynamics, and what truly drives decisions at the buyer level. No strategy until we know your market."],
                ["II", "Map Your Market & Buyers", "We build a precision map of who your ideal clients are, where they operate, and how they discover solutions — before any outreach begins. Every move is calculated, not assumed."],
                ["III", "Execute with Precision", "Campaigns are designed around the intelligence — right positioning, right channels, right cadence. Every touchpoint is purposeful. Every message is grounded in research, not guesswork."],
                ["IV", "Measure, Learn & Refine", "We track what matters, report with clarity, and continuously improve. Every data point feeds back into the intelligence engine — making your pipeline grow smarter over time."],
              ].map(([n, t, b], idx) => (
                <div
                  key={n}
                  className="grid grid-cols-[60px_1fr] gap-5 py-[30px]"
                  style={{ borderBottom: idx === 3 ? "none" : "1px solid var(--diq_border2)" }}
                >
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--gold)", fontStyle: "italic", lineHeight: 1 }}>
                    {n}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--diq_ivory)", marginBottom: 8 }}>
                      {t}
                    </div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 300, color: "var(--diq_mid)", lineHeight: 1.85 }}>
                      {b}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="diq-reveal md:sticky md:top-24">
              <div
                style={{
                  background: "var(--diq_surface)",
                  border: "1px solid var(--diq_border)",
                  borderTop: "2px solid var(--gold)",
                }}
              >
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    borderBottom: "1px solid var(--diq_border)",
                    background: "rgba(202,168,75,.04)",
                  }}
                >
                  <span>[ Intelligence Snapshot ]</span>
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block h-[5px] w-[5px] rounded-full"
                      style={{ background: "rgba(74,173,160,1)", animation: "diq_pulse 2s ease-in-out infinite" }}
                    />
                    <span style={{ color: "rgba(74,173,160,1)" }}>Live</span>
                  </span>
                </div>
                <div className="flex justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--diq_border2)" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--diq_mid)" }}>
                      Lead Quality Score
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(74,173,160,1)", marginTop: 2 }}>
                      ↑ intelligence-qualified
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--gold)" }}>94%</div>
                </div>
                <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--diq_border2)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--diq_mid)", marginBottom: 14 }}>
                    Pipeline by Buyer Type
                  </div>
                  {[
                    ["Decision Makers", "44%"],
                    ["Procurement Teams", "28%"],
                    ["End Users / Operators", "18%"],
                    ["Partners & Referrers", "10%"],
                  ].map(([l, v]) => (
                    <div key={l} className="mb-[10px]">
                      <div className="mb-1 flex justify-between">
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--diq_mid)" }}>{l}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(74,173,160,1)" }}>{v}</span>
                      </div>
                      <div style={{ height: 2, background: "rgba(202,168,75,.08)" }}>
                        <div
                          aria-hidden
                          style={{
                            height: "100%",
                            width: v,
                            background: "linear-gradient(90deg, var(--gold), var(--green))",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {[
                  ["Avg. Pipeline Growth", "per engagement", "3.8x"],
                  ["Time to First Lead", "post-research phase", "~21d"],
                ].map(([l, s, v]) => (
                  <div key={l} className="flex justify-between px-6 py-4" style={{ borderBottom: l.includes("Time") ? "none" : "1px solid var(--diq_border2)" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--diq_mid)" }}>
                        {l}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(74,173,160,1)", marginTop: 2 }}>
                        {s}
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--gold)" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INDUSTRIES */}
      <div id="industries" className="py-[80px]" style={{ background: "var(--diq_panel)", borderTop: "1px solid var(--diq_border)" }}>
        <div className="diq-padX mx-auto max-w-[1300px]">
          <div className="diq-reveal">
            <p
              className="mb-[14px] flex items-center gap-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "5px",
                textTransform: "uppercase",
                color: "rgba(74,173,160,1)",
              }}
            >
              <span aria-hidden className="inline-block h-px w-[22px]" style={{ background: "rgba(74,173,160,1)" }} />
              Industries We Serve
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px,3.5vw,48px)",
                fontWeight: 700,
                color: "var(--diq_ivory)",
                lineHeight: 1.02,
                letterSpacing: "-0.5px",
                marginBottom: 18,
              }}
            >
              Deep Expertise.
              <br />
              <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Broad Reach.</em>
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 300, color: "var(--diq_pale)", lineHeight: 1.9, marginTop: 12 }}>
              We operate across a growing range of niche B2B sectors — with dedicated research practices built for each
              industry we enter.
            </p>
          </div>

          <div className="diq-reveal mt-10 flex flex-wrap gap-[2px]">
            {[
              ["Construction & Built Environment", true],
              ["Technical Services", true],
              ["Engineering & Infrastructure", true],
              ["Real Estate", false],
              ["Industrial & Manufacturing", false],
              ["Professional Services", false],
              ["Energy & Utilities", false],
              ["Logistics & Supply Chain", false],
              ["Healthcare Services", false],
              ["Legal & Compliance", false],
              ["Financial Services", false],
              ["SaaS & Technology", false],
            ].map(([t, active]) => (
              <div
                key={t as string}
                style={{
                  background: "var(--diq_surface)",
                  border: `1px solid ${active ? "var(--green)" : "var(--diq_border)"}`,
                  padding: "11px 24px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: active ? "rgba(74,173,160,1)" : "var(--diq_mid)",
                  cursor: "default",
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "3px", textTransform: "uppercase", color: "var(--green)", marginTop: 18 }}>
            highlighted = active research practices
          </p>
        </div>
      </div>

      {/* CTA */}
      <div id="contact" className="diq-cta relative overflow-hidden text-center" style={{ background: "var(--diq_ink)" }}>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(var(--diq_grid) 1px, transparent 1px), linear-gradient(90deg, var(--diq_grid) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[50vw] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(202,168,75,.05) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="absolute top-[52px] h-px"
          style={{
            background: "linear-gradient(90deg, transparent, var(--diq_border), transparent)",
            left: "var(--diq-gutter)",
            right: "var(--diq-gutter)",
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-[52px] h-px"
          style={{
            background: "linear-gradient(90deg, transparent, var(--diq_border), transparent)",
            left: "var(--diq-gutter)",
            right: "var(--diq-gutter)",
          }}
        />
        <div className="diq-reveal relative z-[1] mx-auto max-w-[800px]">
          <p
            className="mb-[18px] flex items-center justify-center gap-3"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "5px",
              textTransform: "uppercase",
              color: "rgba(74,173,160,1)",
            }}
          >
            <span aria-hidden className="inline-block h-px w-5" style={{ background: "rgba(74,173,160,1)" }} />
            Begin With Intelligence
            <span aria-hidden className="inline-block h-px w-5" style={{ background: "rgba(74,173,160,1)" }} />
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px,5.5vw,72px)",
              fontWeight: 700,
              color: "var(--diq_ivory)",
              lineHeight: 1.0,
              letterSpacing: "-1px",
              marginBottom: 16,
            }}
          >
            Ready to Know
            <br />
            Your Market <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Better</em>
            <br />
            Than Anyone?
          </h2>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic", color: "var(--diq_pale)", marginBottom: 52, lineHeight: 1.7 }}>
            Every engagement begins with a no-cost discovery call — 30 minutes, no pitch, just research.
          </p>
          <a href="mailto:intel@diqualia.com" className="diq-ctaEmail">
            intel@diqualia.com
          </a>
        </div>
      </div>
    </div>
  );
}
