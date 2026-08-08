import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getDb } from "@/lib/cloudflare-env";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Insights — DiQualia",
  description:
    "Research notes, points of view, and field observations from the DiQualia practice.",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase"
      style={{ color: "var(--gold)" }}
    >
      <span aria-hidden className="inline-block h-px w-8" style={{ background: "var(--gold)" }} />
      {children}
    </div>
  );
}

function formatDate(value: Date | null): string {
  if (!value) return "";
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndexPage() {
  const prisma = await getDb();
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <section
        className="relative overflow-hidden border-b"
        style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 0%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 55%), linear-gradient(color-mix(in oklab, var(--gold) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--gold) 5%, transparent) 1px, transparent 1px)",
            backgroundSize: "auto, 72px 72px, 72px 72px",
            opacity: 0.9,
          }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-20 md:pb-20 md:pt-28">
          <Eyebrow>Insights</Eyebrow>
          <h1
            className="mt-8 text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              lineHeight: 1.02,
              fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
            }}
          >
            Field notes
            <br />
            <em className="text-primary" style={{ fontStyle: "italic" }}>
              from the practice.
            </em>
          </h1>
          <p className="mt-8 max-w-[62ch] text-[15px] leading-8 text-muted-foreground">
            Research observations, delivery lessons, and points of view — published when
            they are ready.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        {posts.length === 0 ? (
          <p className="text-[15px] leading-8" style={{ color: "var(--text-faint)" }}>
            No published insights yet. Check back soon.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}>
            {posts.map((post) => (
              <li
                key={post.id}
                className="border-b py-10 first:pt-0"
                style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
              >
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
                    <div>
                      {post.publishedAt ? (
                        <time
                          dateTime={post.publishedAt.toISOString()}
                          className="text-[11px] tracking-[0.22em] uppercase"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {formatDate(post.publishedAt)}
                        </time>
                      ) : null}
                      <h2
                        className="mt-3 text-foreground transition-colors group-hover:text-primary"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 300,
                          fontSize: "clamp(1.5rem, 2.4vw, 2rem)",
                          lineHeight: 1.2,
                        }}
                      >
                        {post.title}
                      </h2>
                      <p className="mt-4 max-w-[68ch] text-[15px] leading-8 text-muted-foreground">
                        {post.excerpt}
                      </p>
                      <span
                        className="mt-5 inline-block text-[11px] tracking-[0.22em] uppercase"
                        style={{ color: "var(--gold)" }}
                      >
                        Read →
                      </span>
                    </div>
                    {post.coverImageUrl ? (
                      <div
                        className="relative aspect-[4/3] overflow-hidden"
                        style={{
                          border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
                        }}
                      >
                        <Image
                          src={post.coverImageUrl}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="220px"
                        />
                      </div>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
