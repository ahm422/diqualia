import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { ContactLeadForm } from "@/app/components/ContactLeadForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact — DiQualia",
  description:
    "Start with intelligence. Book a no-cost discovery call to map your market, buyers, and the fastest path to precision pipeline growth.",
};

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase text-primary ${center ? "justify-center" : ""}`}>
      <span aria-hidden className="inline-block h-px w-8 bg-primary" />
      {children}
      {center ? <span aria-hidden className="inline-block h-px w-8 bg-primary" /> : null}
    </div>
  );
}

export default async function ContactPage() {
  const page = await prisma.contactPage.findUnique({ where: { id: 1 } });

  if (!page) {
    return (
      <main className="py-20 text-center text-sm text-muted-foreground">
        Contact content coming soon.
      </main>
    );
  }

  const whatToIncludeItems = Array.isArray(page.whatToIncludeItems)
    ? (page.whatToIncludeItems as string[]).filter(Boolean)
    : [];

  return (
    <div>
      <section className="relative overflow-hidden border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
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

        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-20 md:pb-20 md:pt-28">
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

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-20">
          <div className="border p-10" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)", background: "var(--bg-elev)" }}>
            <div className="text-[10px] tracking-[0.22em] uppercase text-primary">{page.emailLabel}</div>
            <div className="mt-6 text-[14px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              {page.emailType}
            </div>
            <a href={`mailto:${page.email}`} className="mt-4 block no-underline">
              <span
                className="diq-ctaEmail"
                style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)" }}
              >
                {page.email}
              </span>
            </a>
            <p className="mt-5 text-[12px] leading-7 text-muted-foreground">
              {page.emailCopy}
            </p>
          </div>

          <div>
            <ContactLeadForm />

            <div className="mt-14">
              <Eyebrow>What to include</Eyebrow>
              <div
                className="mt-4 text-foreground"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
                  lineHeight: 1.1,
                }}
              >
                Make the first call
                <br />
                count.
              </div>
              <ul className="mt-8 space-y-3 text-[13px] leading-7 text-muted-foreground">
                {whatToIncludeItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span aria-hidden className="text-primary">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/services" className="diq-btnGhost">Services</Link>
                <Link href="/process" className="diq-btnGhost">How We Work</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t" style={{ background: "var(--bg-elev)", borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <div className="mx-auto w-full max-w-5xl px-6 py-20 text-center">
          <Eyebrow center>{page.expectationEyebrow}</Eyebrow>
          <p
            className="mx-auto mt-8 max-w-3xl text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
              lineHeight: 1.25,
            }}
          >
            {page.expectationText}
          </p>
        </div>
      </section>
    </div>
  );
}
