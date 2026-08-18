"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const ids = useMemo(() => tabs.map((t) => t.id), [tabs]);

  const updateOverflow = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(max - el.scrollLeft > 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateOverflow();
    el.addEventListener("scroll", updateOverflow, { passive: true });
    const ro = new ResizeObserver(updateOverflow);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateOverflow);
      ro.disconnect();
    };
  }, [ids, updateOverflow]);

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

  function scrollTrack(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.max(180, el.clientWidth * 0.55),
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

  return (
    <div
      ref={barRef}
      className="sticky z-[120]"
      style={{
        top: "var(--diq-stickyTop)",
        background: "color-mix(in oklab, var(--card) 92%, transparent)",
        borderBottom: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div className="relative mx-auto flex w-full max-w-6xl items-center gap-1 px-3 sm:px-6">
        <button
          type="button"
          className="diq-serviceTabsArrow hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-opacity sm:flex"
          style={{
            borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
            color: "var(--foreground)",
            opacity: canScrollLeft ? 1 : 0.28,
            pointerEvents: canScrollLeft ? "auto" : "none",
          }}
          aria-label="Show previous services"
          tabIndex={canScrollLeft ? 0 : -1}
          onClick={() => scrollTrack(-1)}
        >
          <Chevron dir="left" />
        </button>

        <div className="relative min-w-0 flex-1">
          {canScrollLeft ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10"
              style={{
                background: "linear-gradient(to right, var(--card), transparent)",
              }}
            />
          ) : null}
          {canScrollRight ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10"
              style={{
                background: "linear-gradient(to left, var(--card), transparent)",
              }}
            />
          ) : null}

          <div
            ref={trackRef}
            role="tablist"
            aria-label="Services"
            className="diq-serviceTabsTrack flex gap-2 overflow-x-auto py-3"
            onKeyDown={onTrackKeyDown}
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
                  className="diq-serviceTab flex shrink-0 items-center gap-2.5 rounded-full border px-3.5 py-2 text-left transition-colors"
                  style={{
                    borderColor: isActive
                      ? "var(--primary)"
                      : "color-mix(in oklab, var(--foreground) 22%, transparent)",
                    background: isActive
                      ? "color-mix(in oklab, var(--gold) 16%, transparent)"
                      : "color-mix(in oklab, var(--foreground) 4%, transparent)",
                    color: isActive ? "var(--primary)" : "var(--foreground)",
                    opacity: isActive ? 1 : 0.88,
                  }}
                >
                  <span
                    aria-hidden
                    className="font-mono text-[10px] tracking-[0.14em]"
                    style={{ color: "var(--primary)" }}
                  >
                    {num}
                  </span>
                  <span className="text-[11px] tracking-[0.14em] uppercase">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="diq-serviceTabsArrow hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-opacity sm:flex"
          style={{
            borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
            color: "var(--foreground)",
            opacity: canScrollRight ? 1 : 0.28,
            pointerEvents: canScrollRight ? "auto" : "none",
          }}
          aria-label="Show next services"
          tabIndex={canScrollRight ? 0 : -1}
          onClick={() => scrollTrack(1)}
        >
          <Chevron dir="right" />
        </button>
      </div>
    </div>
  );
}
