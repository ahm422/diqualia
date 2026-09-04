import Image from "next/image";
import Link from "next/link";

import { formatBlogDate } from "@/lib/blog/format";
import type { BlogCardData } from "@/lib/blog/card";
import { formatReadingTime } from "@/lib/blog/reading-time";

type PostCardVariant = "feature" | "row" | "related" | "grid";

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

function metaLine(post: BlogCardData): string {
  return [formatBlogDate(post.publishedAtIso), formatReadingTime(post.readingMinutes)]
    .filter(Boolean)
    .join(" · ");
}

function Meta({ post, className }: { post: BlogCardData; className?: string }) {
  const meta = metaLine(post);
  if (!meta) return null;
  return (
    <p
      className={`text-[11px] tracking-[0.22em] uppercase ${className ?? ""}`}
      style={{ color: "var(--text-muted)" }}
    >
      {meta}
    </p>
  );
}

function ReadMore() {
  return (
    <span
      className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase transition-colors group-hover:text-primary"
      style={{ color: "var(--text-muted)" }}
    >
      Read
      <span aria-hidden>→</span>
    </span>
  );
}

export function PostCard({
  post,
  variant = "row",
  priority = false,
}: {
  post: BlogCardData;
  variant?: PostCardVariant;
  priority?: boolean;
}) {
  const href = `/blog/${post.slug}`;
  const borderStyle = { borderColor: "color-mix(in oklab, var(--border) 75%, transparent)" };

  // Featured post — one wide horizontal card. Image is a supporting column,
  // capped so the title/excerpt stay dominant. Stacks on mobile.
  if (variant === "feature") {
    return (
      <Link
        href={href}
        className="diq-blog-card group grid gap-5 sm:grid-cols-[minmax(0,420px)_minmax(0,1fr)] sm:items-center sm:gap-8"
      >
        <div
          className="diq-blog-row__media relative aspect-[16/9] w-full max-h-[220px] overflow-hidden rounded-md border sm:max-h-none"
          style={borderStyle}
        >
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, 420px"
              className="diq-blog-card__img object-cover"
            />
          ) : (
            <CoverPlaceholder title={post.title} />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <span
            className="text-[11px] tracking-[0.3em] uppercase"
            style={{ color: "var(--primary)" }}
          >
            Latest
          </span>
          <Meta post={post} />
          <h3
            className="text-foreground transition-colors group-hover:text-primary"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              lineHeight: 1.2,
              fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)",
            }}
          >
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="line-clamp-2 max-w-[60ch] text-[14px] leading-7 text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          <ReadMore />
        </div>
      </Link>
    );
  }

  if (variant === "related" || variant === "grid") {
    return (
      <Link href={href} className="diq-blog-card group flex h-full flex-col">
        <div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-md border"
          style={borderStyle}
        >
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt=""
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
          <Meta post={post} className="text-[10.5px]" />
          <h3
            className="mt-2 text-foreground transition-colors group-hover:text-primary"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              lineHeight: 1.25,
              fontSize: "clamp(1.2rem, 1.8vw, 1.45rem)",
            }}
          >
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="mt-3 line-clamp-2 text-[14px] leading-7 text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          <span className="mt-auto pt-4">
            <ReadMore />
          </span>
        </div>
      </Link>
    );
  }

  // Compact editorial index row: [ small thumbnail ] [ meta / title / excerpt ].
  // Uniform height — the thumbnail never exceeds the text block.
  return (
    <Link href={href} className="diq-blog-row group focus:outline-none">
      <div
        className="diq-blog-row__media relative aspect-[4/3] w-full overflow-hidden rounded border"
        style={borderStyle}
      >
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes="116px"
            className="diq-blog-card__img object-cover"
          />
        ) : (
          <CoverPlaceholder title={post.title} />
        )}
      </div>

      <div className="min-w-0">
        <Meta post={post} />
        <h3
          className="mt-1.5 text-foreground transition-colors group-hover:text-primary"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            lineHeight: 1.25,
            fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)",
          }}
        >
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-1.5 line-clamp-1 text-[13.5px] leading-7 text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
