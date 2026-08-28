import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { BuiltForEditor } from "./BuiltForEditor";

export default async function AboutBuiltForAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const builtFor = await prisma.aboutBuiltForItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Built-For Items"
        description="The “What we’re built for” grid on the About page."
        previewHref="/about#built-for"
      />
      <BuiltForEditor initial={builtFor} />
    </div>
  );
}
