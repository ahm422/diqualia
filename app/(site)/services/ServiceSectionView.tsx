import Link from "next/link";

import { Container } from "@/app/components/Container";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/markdown";
import type { ServiceItemData } from "./group-items";
import { groupItems } from "./group-items";

export type ServiceSectionData = {
  id: number;
  tabId: string;
  eyebrow: string;
  title: string;
  body: string;
  cardTitle: string | null;
  cardBody: string | null;
  overviewHtml: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  order: number;
  items: ServiceItemData[];
};

/**
 * Section intro. When `overviewHtml` is set it renders sanitised rich text
 * (headings/lists/tables/images) in place of the plain `body` paragraph, plus an
 * optional CTA button when `ctaHref` is set.
 */
function Overview({ section, className }: { section: ServiceSectionData; className?: string }) {
  if (!section.overviewHtml) {
    return <p className={className}>{section.body}</p>;
  }
  return (
    <div>
      <div
        className="diq-markdown diq-longform"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.overviewHtml) }}
      />
      {section.ctaHref ? (
        <Button asChild variant="primary" className="mt-6">
          <Link href={section.ctaHref}>{section.ctaLabel ?? "Contact Us"}</Link>
        </Button>
      ) : null}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase text-primary">
      <span aria-hidden className="inline-block h-px w-8 bg-primary" />
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
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

function SectionHeader({ displayNum, section }: { displayNum: string; section: ServiceSectionData }) {
  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr] md:gap-16">
      <div
        className="diq-ghostNum text-[72px] leading-none"
        style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
      >
        {displayNum}
      </div>
      <div>
        <Eyebrow>{section.eyebrow}</Eyebrow>
        <SectionTitle>{section.title}</SectionTitle>
        <div className="mt-6">
          <Overview section={section} className="diq-proseMuted text-[15px] leading-8" />
        </div>
      </div>
    </div>
  );
}

function S01Layout({ section }: { section: ServiceSectionData }) {
  const featureItems = section.items.filter((i) => i.groupLabel === null && i.body !== null);
  const receiveItems = section.items.filter((i) => i.groupLabel === "What You Receive" && i.body === null);

  return (
    <div
      className="mt-14 overflow-hidden border"
      style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
    >
      <div
        className="h-0.5 w-full"
        style={{ background: "linear-gradient(90deg, var(--gold), color-mix(in oklab, var(--gold) 35%, transparent), var(--gold))" }}
      />
      <div className="grid grid-cols-1 gap-10 bg-card p-10 md:grid-cols-2 md:gap-14 md:p-12">
        <div>
          <div className="diq-kicker text-[11px] tracking-[0.22em] uppercase">
            Core Intelligence Service · {section.tabId.replace("s", "").padStart(2, "0")}
          </div>
          <div
            className="mt-5 text-[26px] text-foreground"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, lineHeight: 1.2 }}
          >
            {section.cardTitle}
          </div>
          <p className="diq-proseMuted mt-4 text-[13px] leading-7">{section.cardBody}</p>

          {receiveItems.length > 0 && (
            <div className="mt-7 border-t pt-6" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
              <div className="diq-kicker text-[10px] tracking-[0.22em] uppercase">What You Receive</div>
              <ul className="diq-proseMuted mt-4 space-y-3 text-[12px]">
                {receiveItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <span aria-hidden className="text-primary">→</span>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {featureItems.map((item) => (
            <div
              key={item.id}
              className="border-l-2 p-5"
              style={{
                background: "color-mix(in oklab, var(--gold) 6%, transparent)",
                borderLeftColor: "color-mix(in oklab, var(--border) 100%, transparent)",
              }}
            >
              <div className="text-[13px] tracking-[0.06em] text-foreground">{item.title}</div>
              <p className="diq-proseMuted mt-2 text-[12px] leading-7">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function S02Layout({ section }: { section: ServiceSectionData }) {
  const cards = groupItems(section.items);
  const sectionBg = section.order % 2 === 1 ? "var(--bg-elev)" : "var(--bg)";

  return (
    <div
      className="mt-14 grid grid-cols-1 gap-px md:grid-cols-2"
      style={{ background: "color-mix(in oklab, var(--border) 100%, transparent)" }}
    >
      {cards.map((card) => (
        <div key={card.groupLabel} className="p-10" style={{ background: sectionBg === "var(--bg-elev)" ? "var(--bg)" : "var(--bg-elev)" }}>
          <div className="diq-kicker text-[11px] tracking-[0.22em] uppercase">
            {card.groupLabel}
          </div>
          <div
            className="mt-4 text-[20px] text-foreground"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, lineHeight: 1.2 }}
          >
            {card.title}
          </div>
          <p className="diq-proseMuted mt-4 text-[12px] leading-7">{card.body}</p>
          {card.deliverables.length > 0 && (
            <div className="mt-6 border-t pt-5" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
              <div className="diq-kicker text-[10px] tracking-[0.22em] uppercase">Deliverables</div>
              <ul className="diq-proseMuted mt-3 space-y-2 text-[12px]">
                {card.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-3">
                    <span aria-hidden className="text-primary">→</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ServiceSectionView({
  section,
  displayNum,
  embedded = false,
}: {
  section: ServiceSectionData;
  displayNum: string;
  embedded?: boolean;
}) {
  const isS01Style = section.cardTitle !== null;
  const layouts = isS01Style ? <S01Layout section={section} /> : <S02Layout section={section} />;

  if (embedded) {
    return (
      <div className="pb-4">
        <Overview section={section} className="diq-proseMuted max-w-[72ch] text-[15px] leading-8" />
        {layouts}
      </div>
    );
  }

  const bgStyle = section.order % 2 === 1 ? { background: "var(--bg-elev)" } : {};

  return (
    <section
      id={section.tabId}
      className="border-b"
      style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)", ...bgStyle }}
    >
      <Container className="py-20">
        <SectionHeader displayNum={displayNum} section={section} />
        {layouts}
      </Container>
    </section>
  );
}
