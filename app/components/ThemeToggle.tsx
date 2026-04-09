"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";

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
  // SSR/initial client render must be deterministic to avoid hydration mismatches.
  // We start at "system" and then sync from storage after mount.
  const [mode, setMode] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    function syncFromStorage() {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark") {
          setMode(stored);
          return;
        }
      } catch {
        // ignore
      }
      setMode("system");
    }

    const handler = () => syncFromStorage();
    window.addEventListener("storage", handler);
    window.addEventListener(THEME_EVENT, handler as EventListener);
    syncFromStorage();

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(THEME_EVENT, handler as EventListener);
    };
  }, []);

  const effectiveTheme = useMemo<Theme>(() => {
    // Keep SSR and the *first* client render identical.
    // After mount, we can safely read OS theme.
    if (mode === "system") return mounted ? getSystemTheme() : "light";
    return mode;
  }, [mode, mounted]);

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
      {pressed ? <Moon aria-hidden className="text-primary" /> : <Sun aria-hidden className="text-primary" />}
      <span className="sr-only">{pressed ? "Dark theme" : "Light theme"}</span>
    </Button>
  );
}

