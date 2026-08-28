import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { MarqueeEditor } from "./MarqueeEditor";

export default async function HomeMarqueeAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const marqueeItems = await prisma.homeMarqueeItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Marquee"
        description="Scrolling ticker under the hero (Label — Sublabel)."
        previewHref="/#marquee"
      />
      <MarqueeEditor initial={marqueeItems} />
    </div>
  );
}
