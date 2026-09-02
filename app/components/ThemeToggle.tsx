"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";
type ThemeMode = Theme | "system";

const STORAGE_KEY = "diqualia-theme";
const THEME_EVENT = "diqualia-theme-change";
const DARK_CLASS = "dark";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyThemeToHtml(theme: Theme) {
  const d = document.documentElement;
  d.classList.toggle(DARK_CLASS, theme === "dark");
  d.style.colorScheme = theme === "dark" ? "dark" : "light";
}

function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_EVENT, onStoreChange);
  };
}

function getStoredMode(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  return "system";
}

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const mode = useSyncExternalStore<ThemeMode>(subscribeTheme, getStoredMode, () => "system");

  const effectiveTheme = useMemo<Theme>(() => {
    if (mode === "system") return mounted ? getSystemTheme() : "light";
    return mode;
  }, [mode, mounted]);

  useEffect(() => {
    // Derive from live state, not the render-time `effectiveTheme` (whose server
    // snapshot is always "light") so we never clobber the pre-paint inline script
    // for a `system` + dark user on first mount.
    const resolved: Theme = mode === "system" ? getSystemTheme() : mode;
    applyThemeToHtml(resolved);

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;

    const handler = () => {
      if (mode !== "system") return;
      applyThemeToHtml(getSystemTheme());
    };

    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [mode]);

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
    >
      {pressed ? <Moon aria-hidden className="text-primary" /> : <Sun aria-hidden className="text-primary" />}
      <span className="sr-only">{pressed ? "Dark theme" : "Light theme"}</span>
    </Button>
  );
}
