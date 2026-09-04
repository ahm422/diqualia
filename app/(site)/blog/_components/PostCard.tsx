import Image from "next/image";
import Link from "next/link";

import { formatBlogDate } from "@/lib/blog/format";
import type { BlogCardData } from "@/lib/blog/card";
import { formatReadingTime } from "@/lib/blog/reading-time";

type PostCardVariant = "row" | "related" | "grid";

function CoverPlaceholder({ title }: { title: string }) {
  const letter = title.trim().charAt(0).toUpperCase() || "D";
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse 90% 80% at 25% 15%, color-mix(in oklab, var(--gold) 20%, transparent), transparent 62%), color-mix(in oklab, var(--gold) 6%, var(--card))",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          fontSize: "clamp(2rem, 6vw, 3.25rem)",
          lineHeight: 1,
          color: "color-mix(in oklab, var(--gold) 55%, transparent)",
        }}
      >
        {letter}
      </span>
    </div>
  );
}

function Meta({ post }: { post: BlogCardData }) {
  const meta = [formatBlogDate(post.publishedAtIso), formatReadingTime(post.readingMinutes)]
    .filter(Boolean)
    .join(" · ");
  if (!meta) return null;
  return (
    <p
      className="text-[11px] tracking-[0.22em] uppercase"
      style={{ color: "var(--text-muted)" }}
    >
      {meta}
    </p>
  );
}

export function PostCard({
  post,
  variant = "row",
  index = 0,
  feature = false,
  priority = false,
}: {
  post: BlogCardData;
  variant?: PostCardVariant;
  index?: number;
  feature?: boolean;
  priority?: boolean;
}) {
  if (variant === "related" || variant === "grid") {
    const meta = [formatBlogDate(post.publishedAtIso), formatReadingTime(post.readingMinutes)]
      .filter(Boolean)
      .join(" · ");
    return (
      <Link href={`/blog/${post.slug}`} className="diq-blog-card group flex h-full flex-col">
        <div
          className="relative aspect-[16/10] w-full overflow-hidden rounded-md border"
          style={{ borderColor: "color-mix(in oklab, var(--border) 75%, transparent)" }}
        >
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="diq-blog-card__img object-cover"
            />
          ) : (
            <CoverPlaceholder title={post.title} />
          )}
        </div>
        <div className="flex flex-1 flex-col pt-5">
          {meta ? (
            <p
              className="text-[10.5px] tracking-[0.2em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              {meta}
            </p>
          ) : null}
          <h3
            className="mt-2 text-foreground transition-colors group-hover:text-primary"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              lineHeight: 1.25,
              fontSize: "clamp(1.15rem, 1.6vw, 1.35rem)",
            }}
          >
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="mt-3 line-clamp-2 text-[14px] leading-7 text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          <span
            className="mt-auto pt-4 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase transition-colors group-hover:text-primary"
            style={{ color: "var(--text-muted)" }}
          >
            Read
            <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    );
  }

  // Compact editorial index row: [ 01 ] [ thumbnail ] [ meta / title / excerpt / Read ].
  // Same layout for every row — no side-alternation. The first post reads as the
  // "feature" with a slightly larger thumbnail, still nowhere near full-bleed.
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="diq-blog-row group focus:outline-none"
      data-feature={feature ? "" : undefined}
    >
      <span aria-hidden className="diq-blog-row__num diq-ghostNum">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div
        className="diq-blog-row__media relative aspect-[4/3] w-[55%] max-w-[240px] overflow-hidden rounded-md border sm:w-[42%] lg:w-full lg:max-w-none"
        style={{ borderColor: "color-mix(in oklab, var(--border) 75%, transparent)" }}
      >
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 1024px) 55vw, 260px"
            className="diq-blog-card__img object-cover"
          />
        ) : (
          <CoverPlaceholder title={post.title} />
        )}
      </div>

      <div className="flex flex-col gap-3">
        {feature ? (
          <span
            className="text-[11px] tracking-[0.3em] uppercase"
            style={{ color: "var(--primary)" }}
          >
            Latest
          </span>
        ) : null}
        <Meta post={post} />
        <h3
          className="text-foreground transition-colors group-hover:text-primary"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            lineHeight: 1.2,
            fontSize: feature
              ? "clamp(1.5rem, 2.6vw, 2rem)"
              : "clamp(1.2rem, 1.8vw, 1.5rem)",
          }}
        >
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="line-clamp-2 max-w-[64ch] text-[14px] leading-7 text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
        <span
          className="mt-1 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase transition-colors group-hover:text-primary"
          style={{ color: "var(--text-muted)" }}
        >
          Read
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
