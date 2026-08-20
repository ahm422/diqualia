import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { EmailCardEditor } from "./EmailCardEditor";

export default async function ContactEmailCardAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const contactPage = await prisma.contactPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Email Card"
        description="The email card on the Contact page (label, type, address, and supporting copy)."
        previewHref="/contact#email-card"
      />
      <EmailCardEditor initial={contactPage} />
    </div>
  );
}
