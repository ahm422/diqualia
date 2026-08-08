"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { slugify } from "@/lib/slugify";

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

export function BlogPostEditor({ initial }: Props) {
  const router = useRouter();
  const isNew = !initial;

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    initial?.coverImageUrl ?? null,
  );
  const [status, setStatus] = useState<"draft" | "published">(
    initial?.status === "published" ? "published" : "draft",
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        <AdminField label="Title">
          <AdminInput
            value={title}
            onChange={handleTitleChange}
            placeholder="Post title"
          />
        </AdminField>

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

        <AdminField label="Excerpt">
          <AdminTextarea
            value={excerpt}
            onChange={setExcerpt}
            rows={3}
            placeholder="Short summary for the listing and SEO description"
          />
        </AdminField>

        <AdminField label="Body (Markdown)">
          <AdminTextarea
            value={body}
            onChange={setBody}
            rows={16}
            placeholder="Write the post in Markdown…"
          />
        </AdminField>

        <AdminField label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </AdminField>

        <AdminImageField
          label="Cover image"
          currentUrl={coverImageUrl}
          onUpload={(url) => setCoverImageUrl(url)}
          onRemove={() => setCoverImageUrl(null)}
        />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {isNew ? (
            <AdminSaveButton onClick={handleCreate} saving={creating} />
          ) : (
            <AdminSaveButton onClick={handleSave} saving={saving} />
          )}
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="mt-4 rounded border border-red-400/40 px-4 py-2 text-xs uppercase tracking-widest text-red-400 hover:bg-red-400/10 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </AdminSection>
    </div>
  );
}
