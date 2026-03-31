"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

type Theme = "light" | "dark";
type ThemeMode = Theme | "system";

const STORAGE_KEY = "diqualia-theme";
const THEME_EVENT = "diqualia-theme-change";

function getSystemTheme(): Theme {
  // On the server we can't know the user's OS theme; return a deterministic value
  // so SSR markup matches the initial client render.
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyThemeToHtml(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => onStoreChange();
      window.addEventListener("storage", handler);
      window.addEventListener(THEME_EVENT, handler as EventListener);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(THEME_EVENT, handler as EventListener);
      };
    },
    () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark") return stored;
      } catch {
        // ignore
      }
      return "system";
    },
    () => "system"
  ) as ThemeMode;

  const effectiveTheme = useMemo<Theme>(() => {
    if (mode === "system") return getSystemTheme();
    return mode;
  }, [mode]);

  useEffect(() => {
    applyThemeToHtml(effectiveTheme);

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;

    const handler = () => {
      if (mode !== "system") return;
      applyThemeToHtml(getSystemTheme());
    };

    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [effectiveTheme, mode]);

  function toggle() {
    const next: Theme = effectiveTheme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyThemeToHtml(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  const pressed = effectiveTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={pressed}
      aria-label={pressed ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs tracking-[0.18em] uppercase border"
      style={{
        borderColor: "var(--border)",
        color: "var(--text-muted)",
        background: "color-mix(in oklab, var(--bg-elev) 75%, transparent)",
      }}
    >
      <span className="font-mono">{pressed ? "Dark" : "Light"}</span>
      <span aria-hidden className="text-[10px]" style={{ color: "var(--gold)" }}>
        {pressed ? "◐" : "◑"}
      </span>
    </button>
  );
}

