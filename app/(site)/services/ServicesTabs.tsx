"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ServiceTab = {
  id: string; // e.g. "s01"
  label: string;
};

function getOffsetTop(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top + window.scrollY;
}

/** Scrolled-nav occupancy + tab bar height + small gap. */
function getSectionScrollOffset(tabBar: HTMLElement | null) {
  const stickyTop = tabBar ? Number.parseFloat(getComputedStyle(tabBar).top) : Number.NaN;
  const tabH = tabBar?.offsetHeight ?? 0;
  const top = Number.isFinite(stickyTop) ? stickyTop : 93;
  return top + tabH + 8;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M8.5 3.5 5 7l3.5 3.5" : "M5.5 3.5 9 7l-3.5 3.5"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ServicesTabs({ tabs }: { tabs: ServiceTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const ids = useMemo(() => tabs.map((t) => t.id), [tabs]);
  const activeIndex = Math.max(0, ids.indexOf(active));
  const progressPct = tabs.length > 0 ? ((activeIndex + 1) / tabs.length) * 100 : 0;
  const prevTab = activeIndex > 0 ? tabs[activeIndex - 1] : null;
  const nextTab = activeIndex < tabs.length - 1 ? tabs[activeIndex + 1] : null;
  const currentTab = tabs[activeIndex] ?? tabs[0];

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((x): x is HTMLElement => Boolean(x));

    if (sections.length === 0) return;

    const offset = getSectionScrollOffset(barRef.current);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).id;
          setActive(id);
        }
      },
      { threshold: 0.3, rootMargin: `-${offset}px 0px -40% 0px` },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ids]);

  useEffect(() => {
    const track = trackRef.current;
    const btn = tabRefs.current[active];
    if (!track || !btn) return;
    const left = btn.offsetLeft - (track.clientWidth - btn.offsetWidth) / 2;
    track.scrollTo({
      left: Math.max(0, left),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [active]);

  function onClick(id: string) {
    setActive(id);
    const target = document.getElementById(id);
    if (!target) return;
    const top = getOffsetTop(target) - getSectionScrollOffset(barRef.current);
    window.scrollTo({
      top,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  function onTrackKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = ids.indexOf(active);
    if (i < 0) return;
    const next = e.key === "ArrowRight" ? Math.min(ids.length - 1, i + 1) : Math.max(0, i - 1);
    const id = ids[next];
    if (id) onClick(id);
  }

  function stepBy(delta: -1 | 1) {
    const next = activeIndex + delta;
    if (next < 0 || next >= ids.length) return;
    const id = ids[next];
    if (id) onClick(id);
  }

  return (
    <div
      ref={barRef}
      className="sticky z-[120]"
      onKeyDown={onTrackKeyDown}
      style={{
        top: "var(--diq-stickyTop)",
        background: "color-mix(in oklab, var(--card) 92%, transparent)",
        borderBottom: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div className="diq-serviceTabsProgressTrack" aria-hidden>
        <div className="diq-serviceTabsProgress" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Mobile compact stepper */}
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-3 py-2.5 md:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-2">
            <span aria-hidden className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-primary">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="truncate text-[11px] tracking-[0.12em] text-foreground uppercase">
              {currentTab?.label ?? ""}
            </span>
          </div>
          {prevTab ? (
            <div className="mt-0.5 truncate text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
              {prevTab.label}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className="diq-serviceTabsArrow flex h-9 w-9 items-center justify-center rounded-full border"
            style={{
              borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
              color: "var(--foreground)",
              opacity: prevTab ? 1 : 0.28,
              pointerEvents: prevTab ? "auto" : "none",
            }}
            aria-label="Previous service"
            tabIndex={prevTab ? 0 : -1}
            onClick={() => stepBy(-1)}
          >
            <Chevron dir="left" />
          </button>
          <span
            className="min-w-[2.75rem] text-center font-mono text-[11px] tracking-[0.08em] text-muted-foreground"
            aria-live="polite"
          >
            {activeIndex + 1}/{tabs.length}
          </span>
          <button
            type="button"
            className="diq-serviceTabsArrow flex h-9 w-9 items-center justify-center rounded-full border"
            style={{
              borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
              color: "var(--foreground)",
              opacity: nextTab ? 1 : 0.28,
              pointerEvents: nextTab ? "auto" : "none",
            }}
            aria-label="Next service"
            tabIndex={nextTab ? 0 : -1}
            onClick={() => stepBy(1)}
          >
            <Chevron dir="right" />
          </button>
        </div>

        <div className="min-w-0 flex-1 text-right">
          {nextTab ? (
            <span className="block truncate text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              {nextTab.label}
            </span>
          ) : null}
        </div>
      </div>

      {/* Desktop / tablet connected rail */}
      <div className="relative mx-auto hidden w-full max-w-6xl px-3 md:block sm:px-6">
        <div
          ref={trackRef}
          role="tablist"
          aria-label="Services"
          className="diq-serviceTabsTrack"
        >
          {tabs.map((t, i) => {
            const isActive = t.id === active;
            const num = String(i + 1).padStart(2, "0");
            return (
              <button
                key={t.id}
                ref={(node) => {
                  tabRefs.current[t.id] = node;
                }}
                type="button"
                role="tab"
                id={`service-tab-${t.id}`}
                aria-selected={isActive}
                aria-controls={t.id}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onClick(t.id)}
                className="diq-serviceTab"
              >
                <span aria-hidden className="diq-serviceTabNum">
                  {num}
                </span>
                <span className="diq-serviceTabLabel">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
