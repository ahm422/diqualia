export default function Home() {
  return (
    <div>
      <style>{`
        @keyframes diq_ticker { from { transform: translateX(0);} to { transform: translateX(-50%);} }
        @keyframes diq_growBar { from { transform: scaleY(0); opacity: 0;} to { transform: scaleY(1); opacity: 1;} }
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 75% 50%, color-mix(in oklab, var(--gold) 10%, transparent) 0%, transparent 70%)",
          }}
        />

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 pb-20 pt-20 md:grid-cols-2 md:pb-24 md:pt-28">
          <div className="flex flex-col justify-end">
            <div
              className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase"
              style={{ color: "var(--gold)" }}
            >
              <span
                aria-hidden
                className="inline-block h-px w-10"
                style={{ background: "var(--gold)" }}
              />
              Marketing Intelligence &amp; Research
            </div>

            <h1
              className="mt-7 text-balance text-foreground"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                lineHeight: 1.02,
                fontSize: "clamp(3rem, 5.2vw, 5.5rem)",
              }}
            >
              Intelligence that
              <br />
              <em className="text-primary" style={{ fontStyle: "italic" }}>
                moves
              </em>{" "}
              markets.
            </h1>

            <p className="mt-7 max-w-[44ch] text-[15px] leading-8 text-muted-foreground">
              DiQualia delivers precision marketing research and strategic intelligence for B2B enterprises
              operating in niche, high-stakes industries.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="/services"
                className="inline-flex items-center gap-3 px-7 py-4 text-[11px] tracking-[0.22em] uppercase no-underline transition-colors"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Explore Services
                <span aria-hidden className="inline-block translate-y-[1px]">
                  →
                </span>
              </a>

              <a
                href="/services#contact"
                className="inline-flex items-center gap-3 border-b pb-1 text-[11px] tracking-[0.22em] uppercase no-underline transition-colors"
                style={{
                  borderColor: "color-mix(in oklab, var(--text-faint) 35%, transparent)",
                }}
              >
                <span className="text-muted-foreground">See Our Approach</span> <span aria-hidden>→</span>
              </a>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative hidden md:flex md:items-center md:justify-center">
            <div className="relative w-full max-w-[460px] aspect-[3/4]">
              <div
                className="absolute inset-0 overflow-hidden p-10"
                style={{
                  background: "var(--panel)",
                  border: "1px solid color-mix(in oklab, var(--gold) 18%, transparent)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-3/5"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklab, var(--gold) 12%, transparent) 0%, transparent 60%)",
                  }}
                />

                <div
                  className="absolute right-0 top-0 translate-x-5 -translate-y-5 px-5 py-3 text-[10px] tracking-[0.18em] uppercase"
                  style={{ background: "var(--gold)", color: "var(--ink)" }}
                >
                  Live Intelligence
                </div>

                <div className="relative mt-8 flex h-20 items-end gap-2">
                  {[
                    ["45%", "0.1s"],
                    ["70%", "0.2s"],
                    ["55%", "0.3s"],
                    ["90%", "0.4s"],
                    ["65%", "0.5s"],
                    ["80%", "0.6s"],
                    ["100%", "0.7s"],
                  ].map(([h, d], i) => (
                    <div
                      key={i}
                      className="flex-1 origin-bottom rounded-sm"
                      style={{
                        height: h,
                        background:
                          i === 6
                            ? "linear-gradient(to top, var(--gold-lt), color-mix(in oklab, var(--gold-lt) 25%, transparent))"
                            : "linear-gradient(to top, var(--gold), color-mix(in oklab, var(--gold) 20%, transparent))",
                        animation: `diq_growBar 1.5s ease forwards`,
                        animationDelay: d,
                        transform: "scaleY(0)",
                        opacity: 0,
                      }}
                    />
                  ))}
                </div>

                <div className="relative mt-10 text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--gold)" }}>
                  Market Penetration Score
                </div>
                <div
                  className="relative mt-1 text-4xl text-foreground"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
                >
                  87.4%
                </div>
                <div className="relative mt-1 text-[12px] text-muted-foreground">
                  +12.3% vs prior quarter — North America B2B
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div
        className="overflow-hidden border-y"
        style={{
          borderColor: "color-mix(in oklab, var(--text) 6%, transparent)",
        }}
      >
        <div
          className="flex w-max"
          style={{
            animation: "diq_ticker 30s linear infinite",
          }}
        >
          {[
            "Marketing Intelligence",
            "Competitive Research",
            "B2B Strategy",
            "Niche Industry Analysis",
            "Brand Positioning",
            "Market Entry Intelligence",
            "Data-Driven Growth",
            "Sales Enablement",
            "Marketing Intelligence",
            "Competitive Research",
            "B2B Strategy",
            "Niche Industry Analysis",
            "Brand Positioning",
            "Market Entry Intelligence",
            "Data-Driven Growth",
            "Sales Enablement",
          ].map((label, idx) => (
            <div
              key={idx}
              className="flex items-center gap-8 px-12 py-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span className="text-[11px] tracking-[0.26em] uppercase whitespace-nowrap">{label}</span>
              <span
                aria-hidden
                className="h-1 w-1 rounded-full"
                style={{ background: "var(--gold)" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES GRID */}
      <section style={{ background: "var(--bg-elev)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-end md:gap-16">
            <div>
              <div
                className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase"
                style={{ color: "var(--gold)" }}
              >
                <span aria-hidden className="inline-block h-px w-8" style={{ background: "var(--gold)" }} />
                What We Do
              </div>
              <h2
                className="mt-4 text-foreground"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                  lineHeight: 1.1,
                }}
              >
                Built for
                <br />
                <em className="text-primary" style={{ fontStyle: "italic" }}>
                  niche B2B
                </em>
                <br />
                precision.
              </h2>
            </div>
            <p className="text-[15px] leading-8" style={{ color: "var(--text-muted)" }}>
              We specialize in marketing intelligence for industries where generic research falls short. Every
              insight we deliver is built for decision-makers who can&apos;t afford noise.
            </p>
          </div>

          <div
            className="mt-14 grid grid-cols-1 gap-px md:grid-cols-3"
            style={{
              background: "color-mix(in oklab, var(--gold) 12%, transparent)",
              border: "1px solid color-mix(in oklab, var(--gold) 12%, transparent)",
            }}
          >
            {[
              [
                "01",
                "Market Intelligence & Research",
                "Deep-dive analysis of your target markets, competitive landscape, and buyer behaviour patterns unique to your niche sector.",
              ],
              [
                "02",
                "Data-Driven Campaign Strategy",
                "Marketing strategies grounded in real market data — not assumptions. From positioning to channel selection to message architecture.",
              ],
              [
                "03",
                "Brand Intelligence & Positioning",
                "We identify where your brand sits in the market and how to reposition it for maximum resonance with your ideal buyer profile.",
              ],
              [
                "04",
                "Audience & Buyer Research",
                "Precise profiling of who your buyers are, what drives their decisions, and how to reach them through the right channels.",
              ],
              [
                "05",
                "Competitive Intelligence",
                "Systematic tracking of competitor activity, messaging, and strategy to keep your team one step ahead at every stage.",
              ],
              [
                "06",
                "Sales Enablement Intelligence",
                "Arming your sales teams with insight-backed tools, scripts, and collateral that convert conversations into contracts.",
              ],
            ].map(([num, title, desc]) => (
              <div
                key={num}
                className="p-10 transition-colors"
                style={{
                  background: "var(--bg-elev)",
                }}
              >
                <div className="text-[12px] tracking-[0.22em]" style={{ color: "color-mix(in oklab, var(--gold) 40%, transparent)" }}>
                  {num}
                </div>
                <div
                  className="mt-3 text-[22px] text-foreground"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </div>
                <p className="mt-4 text-[13px] leading-7 text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY DIQUALIA */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:items-center md:gap-24">
            <div>
              <div
                className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase"
                style={{ color: "var(--gold)" }}
              >
                <span aria-hidden className="inline-block h-px w-8" style={{ background: "var(--gold)" }} />
                Why DiQualia
              </div>
              <h2
                className="mt-4 text-foreground"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                  lineHeight: 1.1,
                }}
              >
                Research built for
                <br />
                <em className="text-primary" style={{ fontStyle: "italic" }}>
                  your
                </em>{" "}
                industry.
              </h2>

              <p className="mt-6 max-w-[56ch] text-[15px] leading-8 text-muted-foreground">
                Generic agencies produce generic results. DiQualia operates at the intersection of rigorous
                research methodology and deep niche industry understanding — delivering intelligence that
                actually moves the needle.
              </p>
              <a
                href="/services"
                className="mt-8 inline-flex items-center gap-2 border-b pb-1 text-[11px] tracking-[0.22em] uppercase no-underline"
                style={{
                  borderColor: "color-mix(in oklab, var(--text-faint) 35%, transparent)",
                }}
              >
                <span className="text-muted-foreground">Our Services</span> <span aria-hidden>→</span>
              </a>
            </div>

            <div
              className="grid grid-cols-2 gap-px"
              style={{ background: "color-mix(in oklab, var(--gold) 10%, transparent)" }}
            >
              {[
                ["B2B", "Exclusive Focus"],
                ["Niche", "Industry Depth"],
                ["Data", "First Philosophy"],
                ["ROI", "Intelligence Driven"],
              ].map(([big, label]) => (
                <div key={big} className="p-10" style={{ background: "var(--bg-elev)" }}>
                  <div
                    className="text-[44px] leading-none"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: "var(--gold)" }}
                  >
                    {big}
                  </div>
                  <div className="mt-3 text-[11px] tracking-[0.18em] uppercase" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section style={{ background: "var(--bg-elev)" }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div
            className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase"
            style={{ color: "var(--gold)" }}
          >
            <span aria-hidden className="inline-block h-px w-8" style={{ background: "var(--gold)" }} />
            How We Work
          </div>
          <h2
            className="mt-4 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
              lineHeight: 1.1,
            }}
          >
            From brief to
            <br />
            <em className="text-primary" style={{ fontStyle: "italic" }}>
              breakthrough.
            </em>
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
            {[
              ["01", "Discovery", "We immerse ourselves in your market, your goals, and the competitive forces shaping your niche."],
              [
                "02",
                "Intelligence Gathering",
                "Primary and secondary research executed with rigour — from buyer interviews to digital signal analysis.",
              ],
              [
                "03",
                "Strategy Synthesis",
                "Raw data becomes actionable intelligence — clear, decisive recommendations your team can act on immediately.",
              ],
              ["04", "Execution Support", "We don't just hand off reports. We partner with your team to implement, measure, and iterate."],
            ].map(([num, title, body]) => (
              <div key={num} className="relative">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{
                    border: "1px solid color-mix(in oklab, var(--gold) 45%, transparent)",
                    color: "var(--gold)",
                    background: "var(--bg-elev)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {num}
                </div>
                <div
                  className="mt-6 text-[20px] text-foreground"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                  }}
                >
                  {title}
                </div>
                <p className="mt-3 text-[13px] leading-7 text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[680px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(ellipse, color-mix(in oklab, var(--gold) 10%, transparent) 0%, transparent 70%)",
          }}
        />
        <div className="mx-auto w-full max-w-3xl px-6 py-24">
          <div className="text-[11px] tracking-[0.35em] uppercase" style={{ color: "var(--gold)" }}>
            Get Started
          </div>
          <h2
            className="mt-5 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
              lineHeight: 1.1,
            }}
          >
            Ready to build on
            <br />
            <em className="text-primary" style={{ fontStyle: "italic" }}>
              real intelligence?
            </em>
          </h2>
          <p className="mx-auto mt-6 text-[15px] leading-8 text-muted-foreground">
            Tell us about your market and what you need to know. We&apos;ll show you what precision research
            can unlock for your business.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <a
              href="mailto:intel@diqualia.com"
              className="inline-flex items-center gap-3 px-7 py-4 text-[11px] tracking-[0.22em] uppercase no-underline"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Start a Conversation <span aria-hidden>→</span>
            </a>
            <a
              href="/services"
              className="inline-flex items-center gap-3 border-b pb-1 text-[11px] tracking-[0.22em] uppercase no-underline"
              style={{
                borderColor: "color-mix(in oklab, var(--text-faint) 35%, transparent)",
              }}
            >
              <span className="text-muted-foreground">Download Credentials</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
