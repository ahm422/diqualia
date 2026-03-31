"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";
type ThemeMode = Theme | "system";

const STORAGE_KEY = "diqualia-theme";
const THEME_EVENT = "diqualia-theme-change";
const DARK_CLASS = "dark";

function getSystemTheme(): Theme {
  // On the server we can't know the user's OS theme; return a deterministic value
  // so SSR markup matches the initial client render.
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyThemeToHtml(theme: Theme) {
  document.documentElement.classList.toggle(DARK_CLASS, theme === "dark");
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
    <Button
      type="button"
      onClick={toggle}
      aria-pressed={pressed}
      aria-label={pressed ? "Switch to light theme" : "Switch to dark theme"}
      variant="ghost"
      size="icon"
      className="rounded-full"
    >
      {pressed ? (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="text-primary">
          <path
            d="M12 3a9 9 0 1 0 9 9c0-.35-.02-.7-.06-1.04A7 7 0 0 1 12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="text-primary">
          <path
            d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span className="sr-only">{pressed ? "Dark theme" : "Light theme"}</span>
    </Button>
  );
}

