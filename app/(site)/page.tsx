import Link from "next/link";

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
              color: "var(--green)",
              animation: "diq_fadeUp .7s ease .2s forwards",
              opacity: 0,
            }}
          >
            <span aria-hidden className="inline-block h-px w-7" style={{ background: "var(--green)" }} />
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
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
            style={{ opacity: 0, animation: "diq_fadeUp .8s ease .75s forwards" }}
          >
            <Link href="/services" className="diq-btnGold w-full text-center sm:w-auto">
              Our Services
            </Link>
            <Link href="/contact" className="diq-btnGhost w-full text-center sm:w-auto">
              Talk to Us
            </Link>
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

      {/* QUICK NAV / PREVIEWS */}
      <section className="diq-sectionY" style={{ background: "var(--diq_deep)", borderTop: "1px solid var(--diq_border)" }}>
        <div className="diq-padX mx-auto max-w-[1300px]">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-end">
            <div>
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
                Explore
              </div>
              <h2
                className="mt-6"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px,4vw,52px)",
                  fontWeight: 700,
                  color: "var(--diq_ivory)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.5px",
                }}
              >
                A multi-page site
                <br />
                built for clarity.
              </h2>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic", color: "var(--muted-foreground)", lineHeight: 1.8 }}>
              Jump into the pages below — each one keeps navigation consistent across mobile and desktop.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-3" style={{ background: "var(--diq_border2)" }}>
            {[
              ["/about", "About", "What DiQualia is — and why intelligence-first beats tactics."],
              ["/services", "Services", "Six core intelligence services designed to move pipeline."],
              ["/process", "How We Work", "The research-first process that makes results repeatable."],
              ["/industries", "Industries", "Where we operate — and how we build depth quickly in new niches."],
              ["/story", "Story", "The point of view behind DiQualia and the Double Experience."],
              ["/contact", "Contact", "Start with a discovery call. No pitch — just research."],
            ].map(([href, title, body]) => (
              <Link
                key={href}
                href={href}
                className="group block p-10 no-underline"
                style={{ background: "var(--diq_deep)" }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--primary)" }}>
                  {title}
                </div>
                <div
                  className="mt-4 text-[20px] text-foreground"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600, lineHeight: 1.2, color: "var(--diq_ivory)" }}
                >
                  {title}
                </div>
                <p className="mt-4 text-[13px] leading-7" style={{ color: "var(--muted-foreground)" }}>
                  {body}
                </p>
                <div className="mt-6 text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--primary)" }}>
                  Open →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="diq-cta relative overflow-hidden text-center" style={{ background: "var(--diq_ink)" }}>
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
        <div className="diq-reveal relative z-[1] mx-auto max-w-[860px]">
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
            Begin With Intelligence
            <span aria-hidden className="inline-block h-px w-5" style={{ background: "var(--primary)" }} />
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(34px,5.5vw,72px)",
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
          <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic", color: "var(--muted-foreground)", marginBottom: 40, lineHeight: 1.7 }}>
            Every engagement begins with a no-cost discovery call — 30 minutes, no pitch, just research.
          </p>
          <Link href="/contact" className="diq-btnGold">
            Contact
          </Link>
        </div>
      </section>
    </div>
  );
}
