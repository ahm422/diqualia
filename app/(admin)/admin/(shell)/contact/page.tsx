import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

import { ContactPageEditor } from "./ContactPageEditor";

export default async function ContactAdminPage() {
  await requireAdmin();

  const contactPage = await prisma.contactPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <h1 className="font-sans text-2xl font-medium mb-8">Contact</h1>
      <ContactPageEditor initialData={contactPage} />
    </div>
  );
}
