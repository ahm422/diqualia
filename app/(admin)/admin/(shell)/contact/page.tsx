import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin";

import { ContactPageEditor } from "./ContactPageEditor";

export default async function ContactAdminPage() {
  await requireAdmin();

  const contactPage = await prisma.contactPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Contact Page"
        description="Hero, email card, What to Include list, and Expectation"
      />
      <ContactPageEditor initialData={contactPage} />
    </div>
  );
}
