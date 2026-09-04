"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";
import { formatReadingTime, readingTimeMinutes } from "@/lib/blog/reading-time";
import type { BlogPostData } from "./BlogPostEditor";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogPostsList({ initialPosts }: { initialPosts: BlogPostData[] }) {
  const router = useRouter();
  const canCreate = useCan("content.create");
  const canDelete = useCan("content.delete");
  const [posts, setPosts] = useState(initialPosts);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(post: BlogPostData) {
    if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setDeletingId(post.id);
    try {
      const res = await fetch(`/api/admin/blog-posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        toast.success("Deleted");
        router.refresh();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed — try again");
    } finally {
      setDeletingId(null);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded border border-[var(--diq_border)] px-6 py-12 text-center">
        <p className="text-sm text-[var(--diq_mid)]">No posts yet.</p>
        {canCreate && (
          <Link
            href="/admin/blog/new"
            className="mt-4 inline-block text-xs uppercase tracking-widest text-[var(--gold)] hover:underline"
          >
            Create the first post
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-[var(--diq_border)]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--diq_border)] text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">
            <th className="px-4 py-3 font-normal" />
            <th className="px-4 py-3 font-normal">Title</th>
            <th className="px-4 py-3 font-normal">Status</th>
            <th className="px-4 py-3 font-normal">Read</th>
            <th className="px-4 py-3 font-normal">Updated</th>
            <th className="px-4 py-3 font-normal">Published</th>
            <th className="px-4 py-3 font-normal" />
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post.id}
              className="border-b border-[var(--diq_border)] last:border-0 hover:bg-[var(--diq_panel)]"
            >
              <td className="py-3 pl-4 pr-0">
                <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded border border-[var(--diq_border)] bg-[var(--diq_deep)]">
                  {post.coverImageUrl ? (
                    <Image
                      src={post.coverImageUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 text-foreground">
                <Link href={`/admin/blog/${post.id}`} className="hover:text-[var(--gold)]">
                  {post.title}
                </Link>
                <span className="mt-0.5 block font-mono text-[11px] text-[var(--diq_mid)]">
                  {post.slug}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={[
                    "rounded px-2 py-0.5 text-[11px] uppercase tracking-wider",
                    post.status === "published"
                      ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                      : "bg-[var(--diq_panel)] text-[var(--diq_mid)]",
                  ].join(" ")}
                >
                  {post.status}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--diq_mid)]">
                {formatReadingTime(readingTimeMinutes(post.body))}
              </td>
              <td className="px-4 py-3 text-[var(--diq_mid)]">
                {formatDate(post.updatedAt)}
              </td>
              <td className="px-4 py-3 text-[var(--diq_mid)]">
                {formatDate(post.publishedAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="text-xs text-[var(--diq_mid)] hover:text-[var(--gold)]"
                  >
                    Edit
                  </Link>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(post)}
                      disabled={deletingId === post.id}
                      className="text-xs text-[var(--destructive)] hover:opacity-80 disabled:opacity-50"
                    >
                      {deletingId === post.id ? "…" : "Delete"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
