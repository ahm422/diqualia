import "server-only";

import { cache } from "react";

import { getDb } from "@/lib/cloudflare-env";

/**
 * All published posts, newest first. Wrapped in `React.cache` so the index page,
 * and the detail page's metadata + body + prev/next + related, share a single
 * query per render.
 */
export const listPublishedPosts = cache(async () => {
  const prisma = await getDb();
  return prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });
});

export type PublishedPost = Awaited<ReturnType<typeof listPublishedPosts>>[number];

/** One published post by slug. Cached so `generateMetadata` + the page body dedupe. */
export const getPublishedPost = cache(async (slug: string): Promise<PublishedPost | null> => {
  const prisma = await getDb();
  return prisma.blogPost.findFirst({ where: { slug, status: "published" } });
});

/** Neighbours in the newest-first list: `newer` is more recent, `older` is next. */
export function getAdjacentPosts(
  posts: PublishedPost[],
  slug: string,
): { older: PublishedPost | null; newer: PublishedPost | null } {
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { older: null, newer: null };
  return {
    newer: posts[i - 1] ?? null,
    older: posts[i + 1] ?? null,
  };
}

/** Up to `limit` other published posts (no taxonomy yet — just the most recent). */
export function getRelatedPosts(
  posts: PublishedPost[],
  slug: string,
  limit = 3,
): PublishedPost[] {
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}
