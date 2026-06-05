import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin";

import { ServicesPageEditor } from "./ServicesPageEditor";

export default async function ServicesAdminPage() {
  await requireAdmin();

  const [page, sections] = await Promise.all([
    prisma.servicesPage.findUnique({ where: { id: 1 } }),
    prisma.serviceSection.findMany({
      orderBy: { order: "asc" },
      include: { items: { orderBy: { order: "asc" } } },
    }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Services Page" description="Page hero, service tabs, and items" />
      <ServicesPageEditor initialPage={page} initialSections={sections} />
    </div>
  );
}
