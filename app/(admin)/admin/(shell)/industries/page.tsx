import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

import { IndustriesPageEditor } from "./IndustriesPageEditor";

export default async function IndustriesAdminPage() {
  await requireAdmin();

  const [page, sectors] = await Promise.all([
    prisma.industriesPage.findUnique({ where: { id: 1 } }),
    prisma.industrySector.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-sans text-2xl font-medium mb-8">Industries Page</h1>
      <IndustriesPageEditor initialPage={page} initialSectors={sectors} />
    </div>
  );
}
