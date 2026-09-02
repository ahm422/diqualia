import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/components/Container";
import { Markdown } from "@/app/components/Markdown";
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
    return { title: "Insights — DiQualia" };
  }

  return {
    title: `${post.title} — DiQualia`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl }] } : {}),
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
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group block ${direction === "newer" ? "text-right" : ""}`}
    >
      <span
        className="text-[11px] tracking-[0.22em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {direction === "newer" ? "Newer →" : "← Older"}
      </span>
      <span
        className="mt-2 block text-foreground transition-colors group-hover:text-primary"
        style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "1.15rem", lineHeight: 1.25 }}
      >
        {post.title}
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
  const meta = [formatBlogDate(post.publishedAt), formatReadingTime(minutes)]
    .filter(Boolean)
    .join(" · ");

  return (
    <article>
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
        <Container size="narrow" className="relative pb-12 pt-20 md:pt-28">
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
              {post.publishedAt ? (
                <time dateTime={post.publishedAt.toISOString()}>{meta}</time>
              ) : (
                meta
              )}
            </p>
          ) : null}
          <h1
            className="mt-4 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              lineHeight: 1.1,
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            }}
          >
            {post.title}
          </h1>
          <p
            className="mt-6 max-w-[60ch] text-[1.15rem] leading-8 text-muted-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {post.excerpt}
          </p>
        </Container>
      </header>

      {post.coverImageUrl ? (
        <Container className="pt-10">
          <figure className="mx-auto w-full max-w-4xl">
            <div
              className="relative aspect-[16/10] max-h-[72vh] w-full overflow-hidden"
              style={{ border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)" }}
            >
              <Image
                src={post.coverImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
            </div>
            {/* <figcaption> slot — add when the model carries a caption field. */}
          </figure>
        </Container>
      ) : null}

      <Container size="narrow" className="py-14 md:py-20">
        <div className="diq-longform">
          <Markdown source={post.body} />
        </div>

        {(older || newer) && (
          <nav
            className="mt-16 grid gap-8 border-t pt-10 sm:grid-cols-2"
            style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
            aria-label="More posts"
          >
            <div>{older ? <AdjacentLink post={older} direction="older" /> : null}</div>
            <div>{newer ? <AdjacentLink post={newer} direction="newer" /> : null}</div>
          </nav>
        )}
      </Container>

      {related.length > 0 ? (
        <Container
          as="section"
          className="border-t py-16 md:py-20"
          style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
        >
          <h2
            className="text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(1.5rem, 2.4vw, 2rem)",
            }}
          >
            More field notes
          </h2>
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={toCardData(p)} variant="related" />
            ))}
          </div>
        </Container>
      ) : null}
    </article>
  );
}
