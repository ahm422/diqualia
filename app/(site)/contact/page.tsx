import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/app/components/Container";
import { ContactLeadForm } from "@/app/components/ContactLeadForm";
import { Button } from "@/components/ui/button";
import { CONTACT_AFTER_SUBMIT_STEPS } from "@/lib/contact-copy";
import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

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
  const prisma = await getDb();
  const page = await prisma.contactPage.findUnique({ where: { id: 1 } });

  if (!page) {
    return (
      <main className="diq-pageTop pb-20 text-center text-sm text-muted-foreground">
        Contact content coming soon.
      </main>
    );
  }

  const whatToIncludeItems = Array.isArray(page.whatToIncludeItems)
    ? (page.whatToIncludeItems as string[]).filter(Boolean)
    : [];

  return (
    <div>
      <section id="hero" className="relative overflow-hidden border-b" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
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

        <Container className="relative pb-16 pt-20 md:pb-20 md:pt-28">
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
        </Container>
      </section>

      <Container as="section" className="py-20">
        <div className="grid grid-cols-1 items-start gap-14 md:grid-cols-2 md:gap-x-16 md:gap-y-14 xl:grid-cols-12 xl:gap-10">
          <div className="contents md:flex md:flex-col md:gap-10 xl:contents">
            <div id="email-card" className="xl:order-1 xl:col-span-3">
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

              <div className="mt-10">
                <div className="text-[10px] tracking-[0.22em] uppercase text-primary">After you submit</div>
                <ol className="mt-4 space-y-3 text-[13px] leading-7 text-muted-foreground">
                  {CONTACT_AFTER_SUBMIT_STEPS.map((step, idx) => (
                    <li key={step} className="flex items-start gap-3">
                      <span aria-hidden className="text-[11px] tracking-[0.18em] text-primary">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div id="what-to-include" className="order-3 md:order-none xl:order-3 xl:col-span-4">
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
              <Button asChild variant="secondary">
                <Link href="/services">Services</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/process">How We Work</Link>
              </Button>
            </div>
            </div>
          </div>

          <div className="order-2 md:order-none xl:order-2 xl:col-span-5">
            <ContactLeadForm expectationText={page.expectationText} />
          </div>
        </div>
      </Container>

      <section id="expectation" className="border-t" style={{ background: "var(--bg-elev)", borderTopColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
        <Container className="py-20 text-center">
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
        </Container>
      </section>
    </div>
  );
}
