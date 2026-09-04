"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminSaveButton,
  AdminImageField,
  useAdminSave,
} from "@/components/admin";
import { Markdown } from "@/app/components/Markdown";
import { formatBlogDate } from "@/lib/blog/format";
import { renderMarkdown } from "@/lib/markdown";
import { slugify } from "@/lib/slugify";
import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

// TipTap is heavy and client-only — keep it out of the shared admin bundle.
const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-64 rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-3 text-sm text-[var(--diq_mid)]">
        Loading editor…
      </div>
    ),
  },
);

const EXCERPT_MAX = 500;

/**
 * Body is stored as sanitized HTML (TipTap output). Posts created before this
 * editor hold Markdown — convert those to HTML once on load so they open
 * formatted rather than showing literal syntax. The next save persists the HTML.
 */
function toEditorHtml(body: string): string {
  if (!body) return "";
  return /^\s*</.test(body) ? body : renderMarkdown(body);
}

export type BlogPostData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  status: string;
  publishedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Props = {
  initial?: BlogPostData | null;
};

type Status = "draft" | "published";

function StatusControl({
  status,
  onChange,
  canPublish,
}: {
  status: Status;
  onChange: (next: Status) => void;
  canPublish: boolean;
}) {
  if (!canPublish) {
    return (
      <p className="text-sm text-[var(--diq_mid)]">
        {status === "published" ? "Published" : "Draft"}
      </p>
    );
  }

  const options: Status[] = ["draft", "published"];
  return (
    <div>
      <div
        role="group"
        aria-label="Status"
        className="inline-flex rounded border border-[var(--diq_border)] p-1"
      >
        {options.map((opt) => {
          const active = status === opt;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt)}
              className="rounded px-3 py-1.5 text-xs uppercase tracking-widest transition-colors"
              style={{
                color: active ? "var(--gold)" : "var(--diq_mid)",
                background: active
                  ? "color-mix(in oklab, var(--gold) 14%, transparent)"
                  : "transparent",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-[var(--diq_mid)]">
        Published posts appear on /blog immediately.
      </p>
    </div>
  );
}

function PreviewPane({
  title,
  excerpt,
  coverImageUrl,
  body,
}: {
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--diq_border)] bg-[var(--diq_surface)] p-6 md:p-8">
      {title ? (
        <h1
          className="text-foreground"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            lineHeight: 1.1,
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
          }}
        >
          {title}
        </h1>
      ) : (
        <p className="text-sm text-[var(--diq_mid)]">Add a title to see it here.</p>
      )}
      {excerpt ? (
        <p
          className="mt-4 max-w-[54ch] text-[1.05rem] leading-8 text-muted-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {excerpt}
        </p>
      ) : null}
      {coverImageUrl ? (
        <div className="relative mx-auto mt-6 aspect-[3/2] w-full max-w-[40rem] overflow-hidden rounded-lg border border-[var(--diq_border)]">
          <Image src={coverImageUrl} alt="" fill sizes="640px" className="object-cover" />
        </div>
      ) : null}
      <div className="diq-longform diq-article mt-8">
        {body ? (
          <Markdown source={body} />
        ) : (
          <p className="text-sm text-[var(--diq_mid)]">Nothing written yet.</p>
        )}
      </div>
    </div>
  );
}

export function BlogPostEditor({ initial }: Props) {
  const router = useRouter();
  const isNew = !initial;
  const canDelete = useCan("content.delete");
  const canPublish = useCan("content.publish");

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const initialBody = useMemo(() => toEditorHtml(initial?.body ?? ""), [initial?.body]);
  const [body, setBody] = useState(initialBody);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    initial?.coverImageUrl ?? null,
  );
  const [status, setStatus] = useState<Status>(
    initial?.status === "published" ? "published" : "draft",
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mode, setMode] = useState<"write" | "preview">("write");

  const { save, saving } = useAdminSave(
    initial ? `/api/admin/blog-posts/${initial.id}` : "/api/admin/blog-posts",
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/blog-posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title,
          excerpt,
          body,
          coverImageUrl,
          status,
        }),
      });
      const result = (await res.json()) as { id?: string; error?: string };
      if (res.ok && result.id) {
        toast.success("Created");
        router.push(`/admin/blog/${result.id}`);
        router.refresh();
      } else {
        toast.error(typeof result.error === "string" ? result.error : "Create failed");
      }
    } catch {
      toast.error("Create failed — try again");
    } finally {
      setCreating(false);
    }
  }

  function handleSave() {
    save(
      { slug, title, excerpt, body, coverImageUrl, status },
      () => router.refresh(),
    );
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`Delete “${initial.title}”? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog-posts/${initial.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Deleted");
        router.push("/admin/blog");
        router.refresh();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed — try again");
    } finally {
      setDeleting(false);
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--diq_border)] bg-[var(--diq_deep)] p-4">
        <p className="mb-3 text-xs uppercase tracking-widest text-[var(--diq_mid)]">Status</p>
        <StatusControl status={status} onChange={setStatus} canPublish={canPublish} />
      </div>

      <div className="rounded-lg border border-[var(--diq_border)] bg-[var(--diq_deep)] p-4">
        <AdminImageField
          label="Cover image"
          currentUrl={coverImageUrl}
          onUpload={(url) => setCoverImageUrl(url)}
          onRemove={() => setCoverImageUrl(null)}
        />
        {!coverImageUrl && (
          <p className="text-[11px] text-[var(--diq_mid)]">
            Optional. Shown on /blog and at the top of the post.
          </p>
        )}
      </div>

      {!isNew && initial && (
        <div className="rounded-lg border border-[var(--diq_border)] bg-[var(--diq_deep)] p-4">
          <p className="mb-3 text-xs uppercase tracking-widest text-[var(--diq_mid)]">Details</p>
          <dl className="space-y-1.5 text-xs text-[var(--diq_mid)]">
            <div className="flex justify-between gap-4">
              <dt>Created</dt>
              <dd>{formatBlogDate(initial.createdAt) || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Updated</dt>
              <dd>{formatBlogDate(initial.updatedAt) || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Published</dt>
              <dd>{formatBlogDate(initial.publishedAt) || "—"}</dd>
            </div>
          </dl>
          {initial.status === "published" && (
            <a
              href={`/blog/${initial.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs uppercase tracking-widest text-[var(--gold)] hover:underline"
            >
              View post ↗
            </a>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/blog"
          className="text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:text-[var(--gold)]"
        >
          ← All posts
        </Link>
      </div>

      <AdminSection title={isNew ? "New post" : "Edit post"}>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-x-8">
          {/* Tab bar */}
          <div className="mb-5 flex gap-1 lg:col-start-1">
            {(["write", "preview"] as const).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMode(m)}
                  className="rounded px-3 py-1.5 text-xs uppercase tracking-widest transition-colors"
                  style={{
                    color: active ? "var(--gold)" : "var(--diq_mid)",
                    background: active
                      ? "color-mix(in oklab, var(--gold) 14%, transparent)"
                      : "transparent",
                  }}
                >
                  {m === "write" ? "Write" : "Preview"}
                </button>
              );
            })}
          </div>

          {mode === "write" ? (
            <>
              <div className="lg:col-start-1">
                <AdminField label="Title">
                  <AdminInput
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Post title"
                  />
                </AdminField>
              </div>

              <div className="lg:col-start-1">
                <AdminField label="Slug">
                  <AdminInput
                    value={slug}
                    onChange={(v) => {
                      setSlugTouched(true);
                      setSlug(v);
                    }}
                    placeholder="lowercase-kebab-slug"
                  />
                </AdminField>
                <p className="-mt-2 mb-4 text-[11px] text-[var(--diq_mid)]">
                  Auto-generated from the title; edit to override.
                </p>
              </div>

              <div className="lg:col-start-1">
                <AdminField label="Excerpt">
                  <AdminTextarea
                    value={excerpt}
                    onChange={setExcerpt}
                    rows={3}
                    placeholder="Short summary for the listing and SEO description"
                  />
                </AdminField>
                <p className="-mt-2 mb-4 text-[11px] text-[var(--diq_mid)]">
                  {excerpt.length}/{EXCERPT_MAX} characters
                </p>
              </div>

              {/* Sidebar — flows above the body on small screens, right rail on lg+ */}
              <div className="mb-6 lg:col-start-2 lg:row-start-1 lg:row-span-6 lg:mb-0">
                <div className="lg:sticky lg:top-6">{sidebar}</div>
              </div>

              <div className="lg:col-start-1">
                <AdminField label="Body">
                  <RichTextEditor
                    value={body}
                    onChange={setBody}
                    placeholder="Write the post…"
                  />
                </AdminField>
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-start-1 lg:row-start-2">
                <PreviewPane
                  title={title}
                  excerpt={excerpt}
                  coverImageUrl={coverImageUrl}
                  body={body}
                />
              </div>
              <div className="mt-6 lg:col-start-2 lg:row-start-1 lg:row-span-6 lg:mt-0">
                <div className="lg:sticky lg:top-6">{sidebar}</div>
              </div>
            </>
          )}
        </div>
      </AdminSection>

      {/* Sticky action bar — always reachable regardless of scroll position. */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-[var(--diq_border)] bg-[var(--diq_ink)] px-4 py-3 min-[961px]:-mx-8 min-[961px]:px-8">
        {isNew ? (
          <AdminSaveButton onClick={handleCreate} saving={creating} />
        ) : (
          <AdminSaveButton onClick={handleSave} saving={saving} />
        )}
        {!isNew && canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="mt-4 rounded border border-[var(--destructive)]/40 px-4 py-2 text-xs uppercase tracking-widest text-[var(--destructive)] hover:bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
