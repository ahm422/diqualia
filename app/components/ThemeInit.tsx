"use client";

import { useLayoutEffect } from "react";

const STORAGE_KEY = "diqualia-theme";
const DARK_CLASS = "dark";

type Theme = "light" | "dark";
type ThemeMode = Theme | "system";

export function ThemeInit() {
  useLayoutEffect(() => {
    let mode: ThemeMode = "system";
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") mode = stored;
    } catch {
      // ignore
    }

    const system: Theme =
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
    const effective: Theme = mode === "system" ? system : mode;

    document.documentElement.classList.toggle(DARK_CLASS, effective === "dark");
  }, []);

  return null;
}

