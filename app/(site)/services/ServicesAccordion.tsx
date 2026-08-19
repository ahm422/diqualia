"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Container } from "@/app/components/Container";

import { ServiceSectionView, type ServiceSectionData } from "./ServiceSectionView";

export type AccordionSection = ServiceSectionData & { displayNum: string };

function excerpt(text: string, max = 110) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  const sentence = compact.match(/^[^.!?]+[.!?]/);
  if (sentence && sentence[0].length <= max + 40) return sentence[0].trim();
  const cut = compact.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${cut.slice(0, at > 72 ? at : max)}…`;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getStickyOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--diq-stickyTop").trim();
  const top = Number.parseFloat(raw);
  return (Number.isFinite(top) ? top : 93) + 8;
}

function parseServiceHash(ids: string[]) {
  const raw = window.location.hash.replace(/^#/, "");
  return ids.includes(raw) ? raw : null;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - getStickyOffset();
  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

function replaceHash(id: string | null) {
  const next = id ? `#${id}` : `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", next);
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
                      className="shrink-0 transition-transform duration-300 motion-reduce:transition-none"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path
        d="M3.5 5.25 7 8.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ServicesAccordion({ sections }: { sections: AccordionSection[] }) {
  const ids = useMemo(() => sections.map((s) => s.tabId), [sections]);
  const [openId, setOpenId] = useState<string | null>(null);
  const pendingScroll = useRef(false);

  const openFromHash = useCallback(() => {
    const id = parseServiceHash(ids);
    setOpenId(id);
    if (id) pendingScroll.current = true;
  }, [ids]);

  useLayoutEffect(() => {
    openFromHash();
  }, [openFromHash]);

  useEffect(() => {
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [openFromHash]);

  useEffect(() => {
    if (!pendingScroll.current || !openId) return;
    pendingScroll.current = false;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => scrollToSection(openId));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openId]);

  function onToggle(id: string) {
    const next = openId === id ? null : id;
    setOpenId(next);
    replaceHash(next);
    if (next) pendingScroll.current = true;
  }

  return (
    <section
      className="border-b"
      style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
    >
      <Container className="py-10 md:py-14">
        <div
          className="overflow-hidden border"
          style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
        >
          {sections.map((section, i) => {
            const open = openId === section.tabId;
            const panelId = `${section.tabId}-panel`;
            const bg = i % 2 === 0 ? "var(--bg-elev)" : "var(--bg)";
            return (
              <article
                key={section.tabId}
                id={section.tabId}
                className="diq-serviceAccordionItem border-b last:border-b-0"
                style={{
                  background: bg,
                  borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
                  scrollMarginTop: "calc(var(--diq-stickyTop) + 8px)",
                }}
              >
                <h2 className="m-0">
                  <button
                    type="button"
                    id={`${section.tabId}-trigger`}
                    className="flex w-full items-start gap-5 px-6 py-7 text-left md:gap-8 md:px-10 md:py-9 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color-mix(in_oklab,var(--gold)_70%,white)]"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => onToggle(section.tabId)}
                  >
                    <span
                      className="diq-ghostNum shrink-0 text-[28px] leading-none md:text-[36px]"
                      style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
                    >
                      {section.displayNum}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase text-primary">
                        <span aria-hidden className="inline-block h-px w-6 bg-primary" />
                        {section.eyebrow}
                      </span>
                      <span
                        className="mt-3 block text-foreground"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 400,
                          fontSize: "clamp(1.35rem, 2.4vw, 2rem)",
                          lineHeight: 1.2,
                        }}
                      >
                        {section.title}
                      </span>
                      {!open ? (
                        <span className="mt-3 block max-w-[72ch] text-[13px] leading-7 text-muted-foreground">
                          {excerpt(section.body)}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 text-primary">
                      <Chevron open={open} />
                    </span>
                  </button>
                </h2>
                {open ? (
                  <div id={panelId} className="px-6 pb-8 md:px-10 md:pb-12" role="region" aria-labelledby={`${section.tabId}-trigger`}>
                    <ServiceSectionView
                      section={section}
                      displayNum={section.displayNum}
                      embedded
                    />
                  </div>
                ) : (
                  <div id={panelId} hidden />
                )}
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
