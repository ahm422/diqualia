import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin";

import { IndustriesPageEditor } from "./IndustriesPageEditor";

export default async function IndustriesAdminPage() {
  await requireAdmin();

  const [page, sectors] = await Promise.all([
    prisma.industriesPage.findUnique({ where: { id: 1 } }),
    prisma.industrySector.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Industries Page" description="Hero, sector tags, and Where Next section" />
      <IndustriesPageEditor initialPage={page} initialSectors={sectors} />
    </div>
  );
}
