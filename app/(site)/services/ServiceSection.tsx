import Link from "next/link";

import { Container } from "@/app/components/Container";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/markdown";

import { groupItems, type ServiceSectionData } from "./group-items";

const HAIRLINE = "color-mix(in oklab, var(--border) 80%, transparent)";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase text-primary">
      <span aria-hidden className="inline-block h-px w-8 bg-primary" />
      {children}
    </div>
  );
}

/**
 * One service rendered fully inline — a calm "Service Overview" block: ghost
 * number, eyebrow, title, overview prose, then "What You Receive" / feature
 * items / grouped deliverable cards as plain bordered blocks. Server-rendered,
 * no interaction. Keeps `id={section.tabId}` + scroll-margin so `/services#s3`
 * style deep links still land with the sticky-nav offset.
 */
export function ServiceSection({
  section,
  displayNum,
}: {
  section: ServiceSectionData;
  displayNum: string;
}) {
  // Same filters the previous S01 layout used.
  const featureItems = section.items.filter(
    (i) => i.groupLabel === null && i.body !== null,
  );
  const receiveItems = section.items.filter(
    (i) => i.groupLabel === "What You Receive" && i.body === null,
  );
  // Same grouping the previous S02 layout used.
  const groupedCards = groupItems(section.items);

  return (
    <section
      id={section.tabId}
      className="border-b"
      style={{
        borderColor: HAIRLINE,
        scrollMarginTop: "calc(var(--diq-stickyTop) + 8px)",
        ...(section.order % 2 === 1 ? { background: "var(--bg-elev)" } : {}),
      }}
    >
      <Container className="py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-[200px_1fr] md:gap-16">
          <div
            className="diq-ghostNum text-[56px] leading-none md:text-[72px]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
          >
            {displayNum}
          </div>

          <div>
            <Eyebrow>{section.eyebrow}</Eyebrow>
            <h2
              className="mt-4 text-foreground"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(2rem, 3.6vw, 3.1rem)",
                lineHeight: 1.1,
              }}
            >
              {section.title}
            </h2>

            <div className="mt-6 max-w-[72ch]">
              {section.overviewHtml ? (
                <div
                  className="diq-markdown diq-longform"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.overviewHtml) }}
                />
              ) : (
                <p className="diq-proseMuted text-[15px] leading-8">{section.body}</p>
              )}
            </div>

            {section.ctaHref ? (
              <Button asChild variant="primary" className="mt-6">
                <Link href={section.ctaHref}>{section.ctaLabel ?? "Contact Us"}</Link>
              </Button>
            ) : null}

            {receiveItems.length > 0 ? (
              <div className="mt-10 border-t pt-6" style={{ borderColor: HAIRLINE }}>
                <div className="diq-kicker text-[11px] tracking-[0.22em] uppercase">
                  What You Receive
                </div>
                <ul className="diq-proseMuted mt-4 grid gap-3 text-[13px] sm:grid-cols-2">
                  {receiveItems.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                      <span aria-hidden className="text-primary">
                        →
                      </span>
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {featureItems.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {featureItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-l-2 p-5"
                    style={{
                      borderLeftColor: HAIRLINE,
                      background: "color-mix(in oklab, var(--gold) 6%, transparent)",
                    }}
                  >
                    <div className="text-[13px] tracking-[0.06em] text-foreground">
                      {item.title}
                    </div>
                    <p className="diq-proseMuted mt-2 text-[12px] leading-7">{item.body}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {groupedCards.length > 0 ? (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {groupedCards.map((card) => (
                  <div
                    key={card.groupLabel}
                    className="border p-6"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <div className="diq-kicker text-[11px] tracking-[0.22em] uppercase">
                      {card.groupLabel}
                    </div>
                    <div
                      className="mt-3 text-[18px] text-foreground"
                      style={{ fontFamily: "var(--font-display)", fontWeight: 400, lineHeight: 1.2 }}
                    >
                      {card.title}
                    </div>
                    <p className="diq-proseMuted mt-3 text-[13px] leading-7">{card.body}</p>
                    {card.deliverables.length > 0 ? (
                      <ul
                        className="diq-proseMuted mt-4 space-y-2 border-t pt-4 text-[12px]"
                        style={{ borderColor: HAIRLINE }}
                      >
                        {card.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-3">
                            <span aria-hidden className="text-primary">
                              →
                            </span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
