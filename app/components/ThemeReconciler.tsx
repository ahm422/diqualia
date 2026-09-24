"use client";

import { useEffect } from "react";

const STORAGE_KEY = "diqualia-theme";
const DARK_CLASS = "dark";

/**
 * Post-hydration reconciliation only — the initial paint is handled by the
 * render-blocking inline script in <head> (see ThemeScript.tsx). This keeps the
 * theme in sync with live OS `prefers-color-scheme` changes while the user is in
 * "system" mode. Explicit light/dark choices (including the admin ThemeToggle)
 * are stored in localStorage and win over OS preference.
 */
export function ThemeReconciler() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      if (stored === "light" || stored === "dark") return; // explicit choice wins
      const dark = mq.matches;
      const d = document.documentElement;
      d.classList.toggle(DARK_CLASS, dark);
      d.style.colorScheme = dark ? "dark" : "light";
    };

    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return null;
}
