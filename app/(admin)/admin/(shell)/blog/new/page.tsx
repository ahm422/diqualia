import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminPageHeader } from "@/components/admin";

import { BlogPostEditor } from "../BlogPostEditor";

export default async function NewBlogPostPage() {
  await requireAdmin();

  return (
    <div>
      <AdminPageHeader
        title="New post"
        description="Create a draft or publish immediately"
      />
      <BlogPostEditor />
    </div>
  );
}
