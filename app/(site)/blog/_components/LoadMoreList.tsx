"use client";

import { useState } from "react";

import type { BlogCardData } from "@/lib/blog/card";

import { PostCard } from "./PostCard";

export function LoadMoreList({
  posts,
  pageSize = 8,
}: {
  posts: BlogCardData[];
  pageSize?: number;
}) {
  const [count, setCount] = useState(pageSize);
  const visible = posts.slice(0, count);
  const hasMore = count < posts.length;

  return (
    <div>
      <div className="flex flex-col">
        {visible.map((post, i) => (
          <div
            key={post.slug}
            className={i > 0 ? "mt-12 border-t pt-12 md:mt-16 md:pt-16" : ""}
            style={
              i > 0
                ? { borderColor: "color-mix(in oklab, var(--border) 70%, transparent)" }
                : undefined
            }
          >
            <PostCard
              post={post}
              variant="row"
              feature={i === 0}
              imgRight={i % 2 === 1}
              priority={i === 0}
            />
          </div>
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
