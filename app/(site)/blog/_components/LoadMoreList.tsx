"use client";

import { useState, useSyncExternalStore } from "react";

import type { BlogCardData } from "@/lib/blog/card";

import { PostCard } from "./PostCard";

type BlogView = "list" | "card";

const VIEW_STORAGE_KEY = "diq-blog-view";
const VIEW_EVENT = "diq-blog-view-change";

function subscribeView(onChange: () => void) {
  window.addEventListener(VIEW_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(VIEW_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readStoredView(): BlogView {
  try {
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === "card" ? "card" : "list";
  } catch {
    return "list";
  }
}

/** SSR-safe localStorage-backed view preference (no setState-in-effect). */
function useBlogView(): [BlogView, (next: BlogView) => void] {
  const view = useSyncExternalStore(subscribeView, readStoredView, () => "list" as BlogView);

  function setView(next: BlogView) {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // ignore unavailable storage
    }
    window.dispatchEvent(new Event(VIEW_EVENT));
  }

  return [view, setView];
}

function ViewToggle({
  view,
  onChange,
}: {
  view: BlogView;
  onChange: (next: BlogView) => void;
}) {
  const options: { value: BlogView; label: string; icon: React.ReactNode }[] = [
    {
      value: "list",
      label: "List",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      value: "card",
      label: "Cards",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      ),
    },
  ];

  return (
    <div
      role="group"
      aria-label="Blog layout"
      className="inline-flex items-center gap-1 rounded border p-1"
      style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
    >
      {options.map((opt) => {
        const active = view === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className="inline-flex items-center gap-2 rounded px-3 py-1.5 text-[11px] tracking-[0.22em] uppercase transition-colors"
            style={{
              color: active ? "var(--primary)" : "var(--text-muted)",
              background: active
                ? "color-mix(in oklab, var(--gold) 12%, transparent)"
                : "transparent",
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function LoadMoreList({
  posts,
  pageSize = 8,
}: {
  posts: BlogCardData[];
  pageSize?: number;
}) {
  const [count, setCount] = useState(pageSize);
  const [view, changeView] = useBlogView();

  const visible = posts.slice(0, count);
  const hasMore = count < posts.length;

  return (
    <div>
      <div className="mb-10 flex items-center justify-between md:mb-12">
        <p
          className="text-[11px] tracking-[0.22em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          {posts.length} {posts.length === 1 ? "article" : "articles"}
        </p>
        <ViewToggle view={view} onChange={changeView} />
      </div>

      {view === "card" ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post, i) => (
            <PostCard key={post.slug} post={post} variant="grid" index={i} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col">
          {visible.map((post, i) => (
            <div
              key={post.slug}
              className={i > 0 ? "mt-10 border-t pt-10 md:mt-12 md:pt-12" : ""}
              style={
                i > 0
                  ? { borderColor: "color-mix(in oklab, var(--border) 70%, transparent)" }
                  : undefined
              }
            >
              <PostCard post={post} variant="row" index={i} feature={i === 0} priority={i === 0} />
            </div>
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => setCount((c) => c + pageSize)}
            className="rounded border px-6 py-3 text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-primary"
            style={{
              borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
              color: "var(--text-muted)",
            }}
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
