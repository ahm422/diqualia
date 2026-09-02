"use client";

import { useState } from "react";

import type { BlogCardData } from "@/lib/blog/card";

import { PostCard } from "./PostCard";

export function LoadMoreList({
  posts,
  pageSize = 9,
}: {
  posts: BlogCardData[];
  pageSize?: number;
}) {
  const [count, setCount] = useState(pageSize);
  const visible = posts.slice(0, count);
  const hasMore = count < posts.length;

  return (
    <div>
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
        {visible.map((post) => (
          <PostCard key={post.slug} post={post} variant="grid" />
        ))}
      </div>
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
