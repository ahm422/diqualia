import Image from "next/image";
import Link from "next/link";

import { formatBlogDate } from "@/lib/blog/format";
import type { BlogCardData } from "@/lib/blog/card";
import { formatReadingTime } from "@/lib/blog/reading-time";

type PostCardVariant = "row" | "related";

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
          fontSize: "clamp(3rem, 8vw, 6rem)",
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
  feature = false,
  imgRight = false,
  priority = false,
}: {
  post: BlogCardData;
  variant?: PostCardVariant;
  feature?: boolean;
  imgRight?: boolean;
  priority?: boolean;
}) {
  if (variant === "related") {
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

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="diq-blog-row group grid items-center gap-6 md:gap-10 lg:gap-14 focus:outline-none"
      data-feature={feature ? "" : undefined}
    >
      <div
        className={`diq-blog-row__media relative w-full overflow-hidden rounded-xl border ${
          feature ? "aspect-[16/9]" : "aspect-[16/10]"
        } ${imgRight ? "lg:order-2" : "lg:order-1"}`}
        style={{ borderColor: "color-mix(in oklab, var(--border) 75%, transparent)" }}
      >
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes={feature ? "(max-width: 1024px) 100vw, 56vw" : "(max-width: 1024px) 100vw, 50vw"}
            className="diq-blog-card__img object-cover"
          />
        ) : (
          <CoverPlaceholder title={post.title} />
        )}
      </div>

      <div className={`flex flex-col gap-4 ${imgRight ? "lg:order-1" : "lg:order-2"}`}>
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
            lineHeight: 1.15,
            fontSize: feature
              ? "clamp(1.9rem, 3.4vw, 3rem)"
              : "clamp(1.4rem, 2vw, 1.9rem)",
          }}
        >
          {post.title}
        </h3>
        {post.excerpt ? (
          <p
            className={`text-muted-foreground ${
              feature
                ? "max-w-[62ch] text-[15px] leading-8"
                : "line-clamp-3 max-w-[54ch] text-[14.5px] leading-7"
            }`}
          >
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
