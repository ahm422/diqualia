import Image from "next/image";
import Link from "next/link";

import { formatBlogDate } from "@/lib/blog/format";
import type { BlogCardData } from "@/lib/blog/card";
import { formatReadingTime } from "@/lib/blog/reading-time";

type PostCardVariant = "featured" | "grid" | "related";

const VARIANT = {
  featured: {
    aspect: "aspect-[16/9]",
    sizes: "(max-width: 768px) 100vw, 1100px",
    title: "clamp(1.9rem, 3.4vw, 2.9rem)",
    showExcerpt: true,
  },
  grid: {
    aspect: "aspect-[3/2]",
    sizes: "(max-width: 640px) 100vw, 50vw",
    title: "clamp(1.35rem, 2vw, 1.7rem)",
    showExcerpt: true,
  },
  related: {
    aspect: "aspect-[3/2]",
    sizes: "(max-width: 640px) 100vw, 33vw",
    title: "1.1rem",
    showExcerpt: false,
  },
} as const;

export function PostCard({
  post,
  variant = "grid",
  priority = false,
}: {
  post: BlogCardData;
  variant?: PostCardVariant;
  priority?: boolean;
}) {
  const v = VARIANT[variant];
  const meta = [formatBlogDate(post.publishedAtIso), formatReadingTime(post.readingMinutes)]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="diq-blog-card group block transition-transform duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)]"
    >
      {post.coverImageUrl ? (
        <div
          className={`relative ${v.aspect} overflow-hidden`}
          style={{ border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)" }}
        >
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes={v.sizes}
            className="diq-blog-card__img object-cover"
          />
        </div>
      ) : null}

      <div className={post.coverImageUrl ? "pt-5" : ""}>
        {meta ? (
          <p
            className="text-[11px] tracking-[0.22em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            {meta}
          </p>
        ) : null}
        <h3
          className="mt-3 text-foreground transition-colors group-hover:text-primary"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            lineHeight: 1.15,
            fontSize: v.title,
          }}
        >
          {post.title}
        </h3>
        {v.showExcerpt && post.excerpt ? (
          <p
            className={`mt-3 text-[15px] leading-8 text-muted-foreground ${
              variant === "featured" ? "max-w-[62ch]" : "line-clamp-3"
            }`}
          >
            {post.excerpt}
          </p>
        ) : null}
        {variant === "featured" ? (
          <span
            className="mt-5 inline-block text-[11px] tracking-[0.22em] uppercase"
            style={{ color: "var(--primary)" }}
          >
            Read →
          </span>
        ) : null}
      </div>
    </Link>
  );
}
