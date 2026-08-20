"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useAdminSectionTab<T extends string>(
  validIds: readonly T[],
  fallback: T,
): { activeTab: T; setTab: (id: T) => void } {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = searchParams.get("section");
  const activeTab = (raw && (validIds as readonly string[]).includes(raw) ? raw : fallback) as T;

  function setTab(id: T) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return { activeTab, setTab };
}

export function useScrollToSection() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  useEffect(() => {
    if (!section) return;
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [section]);
}
