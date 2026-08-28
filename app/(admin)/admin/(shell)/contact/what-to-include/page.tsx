import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { WhatToIncludeEditor } from "./WhatToIncludeEditor";

export default async function ContactWhatToIncludeAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const contactPage = await prisma.contactPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="What to Include"
        description="The “What to include” list next to the Contact form."
        previewHref="/contact#what-to-include"
      />
      <WhatToIncludeEditor initial={contactPage} />
    </div>
  );
}
