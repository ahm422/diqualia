import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { normalizeSector, type IndustrySector } from "../types";
import { SectorsEditor } from "./SectorsEditor";

export default async function IndustriesSectorsAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const [page, sectors] = await Promise.all([
    prisma.industriesPage.findUnique({ where: { id: 1 } }),
    prisma.industrySector.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Sectors"
        description="Sectors copy and tags on /industries. Each visible sector also has its own landing page at /industries/[slug]."
        previewHref="/industries#sectors"
      />
      <SectorsEditor
        initialPage={page}
        initialSectors={(sectors as IndustrySector[]).map(normalizeSector)}
      />
    </div>
  );
}
