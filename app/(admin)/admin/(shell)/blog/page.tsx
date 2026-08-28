import Link from "next/link";

import { requirePermission } from "@/lib/auth/require-admin";
import { hasPermission } from "@/lib/auth/session";
import { getDb } from "@/lib/cloudflare-env";
import { Button } from "@/components/ui/button";

import { BlogPostsList } from "./BlogPostsList";

export default async function BlogAdminPage() {
  const prisma = await getDb();
  const session = await requirePermission("cms.view");
  const canCreate = hasPermission(session, "cms.edit");

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
        {canCreate && (
          <Button asChild variant="secondary" size="admin" className="shrink-0">
            <Link href="/admin/blog/new">New post</Link>
          </Button>
        )}
      </div>
      <BlogPostsList initialPosts={posts} />
    </div>
  );
}
