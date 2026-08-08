import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { BlogPostEditor } from "../BlogPostEditor";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const prisma = await getDb();
  await requireAdmin();

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Edit post"
        description={post.slug}
      />
      <BlogPostEditor initial={post} />
    </div>
  );
}
