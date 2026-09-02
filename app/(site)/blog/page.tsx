import type { Metadata } from "next";

import { Container } from "@/app/components/Container";
import { toCardData } from "@/lib/blog/card";
import { listPublishedPosts } from "@/lib/blog/queries";

import { EmptyState } from "./_components/EmptyState";
import { LoadMoreList } from "./_components/LoadMoreList";
import { PostCard } from "./_components/PostCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — DiQualia",
  description:
    "Research notes, points of view, and field observations from the DiQualia practice.",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase"
      style={{ color: "var(--primary)" }}
    >
      <span aria-hidden className="inline-block h-px w-8" style={{ background: "var(--primary)" }} />
      {children}
    </div>
  );
}

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();
  const [featured, ...rest] = posts;

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
        <Container className="relative pb-14 pt-20 md:pb-16 md:pt-28">
          <Eyebrow>Blog</Eyebrow>
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
        </Container>
      </section>

      <Container as="section" className="py-16 md:py-20">
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-16">
            <PostCard post={toCardData(featured)} variant="featured" priority />
            {rest.length > 0 ? (
              <div
                className="border-t pt-16"
                style={{ borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" }}
              >
                <LoadMoreList posts={rest.map(toCardData)} pageSize={9} />
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </div>
  );
}
