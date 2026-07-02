import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { AboutPageEditor } from "./AboutPageEditor";

export default async function AboutPage() {
  const prisma = getDb();
  await requireAdmin();

  const [hero, builtFor, whereNext] = await Promise.all([
    prisma.aboutHero.findUnique({ where: { id: 1 } }),
    prisma.aboutBuiltForItem.findMany({ orderBy: { order: "asc" } }),
    prisma.aboutWhereNext.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="About Page" description="Hero, built-for items, and Where Next section" />
      <AboutPageEditor
        initialHero={hero}
        initialBuiltFor={builtFor}
        initialWhereNext={whereNext}
      />
    </div>
  );
}
