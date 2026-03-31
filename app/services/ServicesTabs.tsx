"use client";

import { useEffect, useMemo, useState } from "react";

export type ServiceTab = {
  id: string; // e.g. "s01"
  label: string;
};

function getOffsetTop(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top + window.scrollY;
}

export function ServicesTabs({ tabs }: { tabs: ServiceTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  const ids = useMemo(() => tabs.map((t) => t.id), [tabs]);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((x): x is HTMLElement => Boolean(x));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).id;
          setActive(id);
        }
      },
      { threshold: 0.3, rootMargin: "-120px 0px -40% 0px" },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ids]);

  function onClick(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    const top = getOffsetTop(target) - 140;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div
      className="sticky z-[120] top-[72px] overflow-x-auto"
      style={{
        background: "color-mix(in oklab, var(--bg-elev) 92%, transparent)",
        borderBottom: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center px-6">
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onClick(t.id)}
              className="shrink-0 border-b-2 px-5 py-4 text-[11px] tracking-[0.22em] uppercase transition-colors"
              style={{
                borderBottomColor: isActive ? "var(--gold)" : "transparent",
                color: isActive ? "var(--gold)" : "var(--text-muted)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

