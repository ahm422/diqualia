import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

import { AboutPageEditor } from "./AboutPageEditor";

export default async function AboutPage() {
  await requireAdmin();

  const [hero, builtFor, whereNext] = await Promise.all([
    prisma.aboutHero.findUnique({ where: { id: 1 } }),
    prisma.aboutBuiltForItem.findMany({ orderBy: { order: "asc" } }),
    prisma.aboutWhereNext.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <div>
      <h1 className="font-sans text-2xl font-medium mb-8">About Page</h1>
      <AboutPageEditor
        initialHero={hero}
        initialBuiltFor={builtFor}
        initialWhereNext={whereNext}
      />
    </div>
  );
}
