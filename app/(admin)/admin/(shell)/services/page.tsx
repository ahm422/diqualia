import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

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
      <h1 className="font-sans text-2xl font-medium mb-8">Services Page</h1>
      <ServicesPageEditor initialPage={page} initialSections={sections} />
    </div>
  );
}
