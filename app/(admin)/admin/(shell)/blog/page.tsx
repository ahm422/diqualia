import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";

import { BlogPostsList } from "./BlogPostsList";

export default async function BlogAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-medium text-foreground">Blog</h1>
          <p className="mt-1 text-sm text-[var(--diq_mid)]">
            Draft and publish Insights posts. Drafts stay off the public site.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="shrink-0 rounded border border-[var(--gold)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--diq_ink)]"
        >
          New post
        </Link>
      </div>
      <BlogPostsList initialPosts={posts} />
    </div>
  );
}
