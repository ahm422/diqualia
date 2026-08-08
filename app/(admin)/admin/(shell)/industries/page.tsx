import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { IndustriesPageEditor } from "./IndustriesPageEditor";

export default async function IndustriesAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const [page, sectors] = await Promise.all([
    prisma.industriesPage.findUnique({ where: { id: 1 } }),
    prisma.industrySector.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Industries Page" description="Hero, sector tags, landing pages, and Where Next section" />
      <IndustriesPageEditor
        initialPage={page}
        initialSectors={sectors as Parameters<typeof IndustriesPageEditor>[0]["initialSectors"]}
      />
    </div>
  );
}
