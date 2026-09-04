import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/components/Container";
import { Markdown } from "@/app/components/Markdown";
import { StructuredData } from "@/app/components/StructuredData";
import { toCardData } from "@/lib/blog/card";
import { formatBlogDate } from "@/lib/blog/format";
import {
  getAdjacentPosts,
  getPublishedPost,
  getRelatedPosts,
  listPublishedPosts,
  type PublishedPost,
} from "@/lib/blog/queries";
import { formatReadingTime, readingTimeMinutes } from "@/lib/blog/reading-time";
import { buildBlogPostingSchema } from "@/lib/structured-data";

import { PostCard } from "../_components/PostCard";
import { ReadingProgress } from "../_components/ReadingProgress";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) {
    return { title: "Insights" };
  }

  const canonical = `/blog/${post.slug}`;
  const images = post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: post.title,
      description: post.excerpt,
      publishedTime: (post.publishedAt ?? post.updatedAt).toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      ...(images ? { images } : {}),
    },
  };
}

function AdjacentLink({
  post,
  direction,
}: {
  post: PublishedPost;
  direction: "older" | "newer";
}) {
  const isNewer = direction === "newer";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`diq-postAdjacent group flex h-full items-center gap-5 border p-5 md:p-7 ${
        isNewer ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      {post.coverImageUrl ? (
        <span className="relative hidden h-16 w-24 shrink-0 overflow-hidden sm:block md:h-20 md:w-32">
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span
          className="block text-[11px] tracking-[0.22em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          {isNewer ? "Newer →" : "← Older"}
        </span>
        <span
          className="mt-2 block text-foreground transition-colors group-hover:text-primary"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(1.1rem, 1.8vw, 1.35rem)",
            lineHeight: 1.3,
          }}
        >
          {post.title}
        </span>
      </span>
    </Link>
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const all = await listPublishedPosts();
  const { older, newer } = getAdjacentPosts(all, slug);
  const related = getRelatedPosts(all, slug, 3);
  const minutes = readingTimeMinutes(post.body);
  const publishedLabel = formatBlogDate(post.publishedAt);
  const readingLabel = formatReadingTime(minutes);
  const publishedIso = post.publishedAt?.toISOString();
  const meta = [publishedLabel, readingLabel].filter(Boolean).join(" · ");

  return (
    <article>
      <StructuredData data={buildBlogPostingSchema(post)} />
      <ReadingProgress />

      <header
        className="relative overflow-hidden border-b"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 0%, color-mix(in oklab, var(--gold) 10%, transparent), transparent 50%)",
          }}
        />
        <Container className="relative pb-10 pt-20 md:pb-12 md:pt-28">
          <Link
            href="/blog"
            className="text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-primary"
            style={{ color: "var(--text-muted)" }}
          >
            ← Insights
          </Link>
          {meta ? (
            <p
              className="mt-8 text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "var(--gold)" }}
            >
              {publishedIso ? <time dateTime={publishedIso}>{meta}</time> : meta}
            </p>
          ) : null}
          <h1
            className="mt-4 max-w-[24ch] text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              lineHeight: 1.08,
              fontSize: "clamp(2.4rem, 5.2vw, 4rem)",
            }}
          >
            {post.title}
          </h1>
          {post.excerpt ? (
            <p
              className="mt-5 max-w-[54ch] text-[1.05rem] leading-8 text-muted-foreground md:text-[1.15rem]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {post.excerpt}
            </p>
          ) : null}
        </Container>
      </header>

      <Container className="py-10 md:py-14 lg:py-16">
        {/* Thin gold rule separating the header from the reading body. */}
        <div
          aria-hidden
          className="mb-10 h-px w-20 md:mb-14"
          style={{ background: "color-mix(in oklab, var(--gold) 55%, transparent)" }}
        />

        <div className="lg:grid lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-x-14">
          {/* Left rail — sticky meta + back link. Collapses below lg. */}
          <aside className="hidden lg:block">
            <div
              className="sticky self-start"
              style={{ top: "calc(var(--diq-stickyTop) + 1.5rem)" }}
            >
              {meta ? (
                <dl
                  className="space-y-3 text-[11px] tracking-[0.22em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  {publishedLabel ? (
                    <div>
                      <dt className="sr-only">Published</dt>
                      <dd>
                        {publishedIso ? (
                          <time dateTime={publishedIso}>{publishedLabel}</time>
                        ) : (
                          publishedLabel
                        )}
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="sr-only">Reading time</dt>
                    <dd>{readingLabel}</dd>
                  </div>
                </dl>
              ) : null}
              <Link
                href="/blog"
                className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-primary"
                style={{ color: "var(--text-muted)" }}
              >
                <span aria-hidden>←</span>
                Back to all notes
              </Link>
            </div>
          </aside>

          {/* Prose column — spans the full width; text stays left-aligned. */}
          <div className="min-w-0">
            {post.coverImageUrl ? (
              <figure
                className="relative mb-8 aspect-[16/9] w-full max-w-[var(--diq-blog-media)] overflow-hidden rounded-lg border md:mb-10"
                style={{
                  borderColor: "color-mix(in oklab, var(--border) 75%, transparent)",
                  background: "color-mix(in oklab, var(--gold) 6%, var(--card))",
                }}
              >
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                />
                {/* No caption source in the model; <figure> is kept for future use. */}
              </figure>
            ) : null}
            <div className="diq-longform diq-article">
              <Markdown source={post.body} />
            </div>
          </div>
        </div>

        {older || newer ? (
          <nav
            className="mt-14 grid gap-4 border-t pt-10 sm:grid-cols-2 md:mt-16"
            style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
            aria-label="More posts"
          >
            {older ? <AdjacentLink post={older} direction="older" /> : <div className="hidden sm:block" />}
            {newer ? <AdjacentLink post={newer} direction="newer" /> : null}
          </nav>
        ) : null}
      </Container>

      {related.length > 0 ? (
        <section
          className="border-t"
          style={{
            borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
            background:
              "radial-gradient(ellipse 50% 80% at 0% 0%, color-mix(in oklab, var(--gold) 8%, transparent), transparent 60%)",
          }}
        >
          <Container className="py-14 md:py-20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2
                className="text-foreground"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)",
                }}
              >
                More field notes
              </h2>
              <Link
                href="/blog"
                className="text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-primary"
                style={{ color: "var(--text-muted)" }}
              >
                View all insights →
              </Link>
            </div>
            {related.length === 1 ? (
              <div className="mt-10 sm:max-w-md">
                <PostCard post={toCardData(related[0])} variant="related" />
              </div>
            ) : (
              <div
                className={`mt-10 grid gap-x-8 gap-y-12 ${
                  related.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {related.map((p) => (
                  <PostCard key={p.slug} post={toCardData(p)} variant="related" />
                ))}
              </div>
            )}
          </Container>
        </section>
      ) : null}

      <section
        className="border-t"
        style={{
          borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
          background:
            "radial-gradient(ellipse 60% 120% at 100% 0%, color-mix(in oklab, var(--gold) 8%, transparent), transparent 60%)",
        }}
      >
        <Container className="flex flex-col items-start gap-5 py-14 sm:flex-row sm:items-center sm:justify-between md:py-20">
          <p
            className="max-w-[28ch] text-foreground sm:max-w-none"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(1.4rem, 2.4vw, 2rem)",
              lineHeight: 1.25,
            }}
          >
            Looking for a point of view on your market?
          </p>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded border px-7 py-3.5 text-[11px] tracking-[0.22em] uppercase transition-colors hover:border-[var(--gold)] hover:text-primary"
            style={{
              borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
              color: "var(--text-muted)",
            }}
          >
            Talk to us
            <span aria-hidden>→</span>
          </Link>
        </Container>
      </section>
    </article>
  );
}
