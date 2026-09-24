import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { BuiltForEditor } from "./BuiltForEditor";

export default async function AboutBuiltForAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const [builtForSection, builtFor] = await Promise.all([
    prisma.aboutBuiltForSection.findUnique({ where: { id: 1 } }),
    prisma.aboutBuiltForItem.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Built For"
        description="Eyebrow, headline, and cards for /about#built-for. The cards also appear as the principles grid on the homepage."
        previewHref="/about#built-for"
      />
      <BuiltForEditor initialSection={builtForSection} initial={builtFor} />
    </div>
  );
}
