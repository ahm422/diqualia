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
 * One service rendered fully inline as flat editorial copy: ghost number,
 * eyebrow, big title, overview prose, then every sub-topic as a big heading
 * followed by a plain paragraph. No cards, no bullets, no grids — just type.
 * Server-rendered, no interaction. Keeps `id={section.tabId}` + scroll-margin
 * so `/services#s3` style deep links still land with the sticky-nav offset.
 */
export function ServiceSection({
  section,
  displayNum,
}: {
  section: ServiceSectionData;
  displayNum: string;
}) {
  const featureItems = section.items.filter(
    (i) => i.groupLabel === null && i.body !== null,
  );
  const receiveItems = section.items.filter(
    (i) => i.groupLabel === "What You Receive" && i.body === null,
  );
  const groupedCards = groupItems(section.items);

  // Every sub-topic flattened to { kicker?, title, body } — feature items and
  // grouped deliverable blocks read the same way now.
  const topics = [
    ...featureItems.map((i) => ({
      key: `f-${i.id}`,
      kicker: null as string | null,
      title: i.title,
      body: i.body ?? "",
    })),
    ...groupedCards.map((c) => ({
      key: `g-${c.groupLabel}`,
      kicker: c.groupLabel,
      title: c.title,
      body: c.body,
    })),
  ];

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
              <div
                className="mt-12 max-w-[72ch] border-t pt-6"
                style={{ borderColor: HAIRLINE }}
              >
                <div className="diq-kicker text-[11px] tracking-[0.22em] uppercase">
                  What You Receive
                </div>
                <p className="diq-proseMuted mt-3 text-[15px] leading-8">
                  {receiveItems.map((item) => item.title).join(" · ")}
                </p>
              </div>
            ) : null}

            {topics.length > 0 ? (
              <div className="mt-12 max-w-[72ch] space-y-10">
                {topics.map((topic) => (
                  <div key={topic.key}>
                    {topic.kicker ? (
                      <div className="diq-kicker text-[11px] tracking-[0.22em] uppercase">
                        {topic.kicker}
                      </div>
                    ) : null}
                    <h3
                      className={`${topic.kicker ? "mt-2" : ""} text-foreground`}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "clamp(1.25rem, 2.2vw, 1.65rem)",
                        lineHeight: 1.2,
                      }}
                    >
                      {topic.title}
                    </h3>
                    {topic.body ? (
                      <p className="diq-proseMuted mt-3 text-[15px] leading-8">
                        {topic.body}
                      </p>
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
