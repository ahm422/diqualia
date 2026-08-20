import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { ExpectationEditor } from "./ExpectationEditor";

export default async function ContactExpectationAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const contactPage = await prisma.contactPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Expectation"
        description="The closing expectation band at the bottom of the Contact page."
        previewHref="/contact#expectation"
      />
      <ExpectationEditor initial={contactPage} />
    </div>
  );
}
