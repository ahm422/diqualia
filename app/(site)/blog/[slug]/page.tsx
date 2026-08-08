import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/app/components/Markdown";
import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getPublishedPost(slug: string) {
  const prisma = await getDb();
  return prisma.blogPost.findFirst({
    where: { slug, status: "published" },
  });
}

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
      ...(post.coverImageUrl
        ? { images: [{ url: post.coverImageUrl }] }
        : {}),
    },
  };
}

function formatDate(value: Date | null): string {
  if (!value) return "";
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  return (
    <article>
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
        <div className="relative mx-auto w-full max-w-3xl px-6 pb-14 pt-20 md:pt-28">
          <Link
            href="/blog"
            className="text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-primary"
            style={{ color: "var(--text-muted)" }}
          >
            ← Insights
          </Link>
          {post.publishedAt ? (
            <time
              dateTime={post.publishedAt.toISOString()}
              className="mt-8 block text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "var(--gold)" }}
            >
              {formatDate(post.publishedAt)}
            </time>
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
          <p className="mt-6 max-w-[62ch] text-[15px] leading-8 text-muted-foreground">
            {post.excerpt}
          </p>
        </div>
      </header>

      {post.coverImageUrl ? (
        <div className="mx-auto w-full max-w-5xl px-6 pt-10">
          <div
            className="relative aspect-[21/9] w-full overflow-hidden"
            style={{
              border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
            }}
          >
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-3xl px-6 py-14 md:py-20">
        <Markdown source={post.body} />
      </div>
    </article>
  );
}
