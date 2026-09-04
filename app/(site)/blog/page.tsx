import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/app/components/Container";
import { toCardData } from "@/lib/blog/card";
import { listPublishedPosts } from "@/lib/blog/queries";

import { EmptyState } from "./_components/EmptyState";
import { LoadMoreList } from "./_components/LoadMoreList";

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
        <Container className="relative flex flex-col gap-8 pb-12 pt-20 md:flex-row md:items-end md:justify-between md:pb-14 md:pt-28">
          <div>
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
          </div>
          <div className="md:max-w-[42ch] md:text-right">
            <p className="text-[15px] leading-8 text-muted-foreground">
              Research observations, delivery lessons, and points of view — published
              when they are ready.
            </p>
          </div>
        </Container>
      </section>

      <Container as="section" className="pb-16 pt-14 md:pb-20 md:pt-20">
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <LoadMoreList posts={posts.map(toCardData)} pageSize={8} />
        )}
      </Container>

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
            className="text-foreground"
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
    </div>
  );
}
