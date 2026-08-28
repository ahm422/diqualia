import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { SectionsEditor } from "./SectionsEditor";

export default async function ServicesSectionsAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const sections = await prisma.serviceSection.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Sections & Items"
        description="Accordion tabs and nested items on the Services page."
        previewHref="/services#sections"
      />
      <SectionsEditor initial={sections} />
    </div>
  );
}
