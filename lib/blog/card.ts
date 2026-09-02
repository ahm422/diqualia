import type { PublishedPost } from "./queries";
import { readingTimeMinutes } from "./reading-time";

/**
 * Plain, client-safe shape for a blog card. `body` is deliberately excluded —
 * reading time is precomputed on the server so the large HTML never ships to the
 * client, and `Date` is serialized to an ISO string so it can cross the RSC
 * boundary into `LoadMoreList`.
 */
export type BlogCardData = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAtIso: string | null;
  readingMinutes: number;
};

export function toCardData(post: PublishedPost): BlogCardData {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    publishedAtIso: post.publishedAt ? post.publishedAt.toISOString() : null,
    readingMinutes: readingTimeMinutes(post.body),
  };
}
