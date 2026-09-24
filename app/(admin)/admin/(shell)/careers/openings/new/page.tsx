import { requirePermission } from "@/lib/auth/require-admin";
import { AdminPageHeader } from "@/components/admin";

import { JobOpeningEditor } from "../JobOpeningEditor";

export default async function NewJobOpeningPage() {
  await requirePermission("careers.openings.manage");

  return (
    <div>
      <AdminPageHeader
        title="New opening"
        description="Create a role listed on /careers. Hidden openings 404 on the public site."
        previewHref="/careers"
      />
      <JobOpeningEditor />
    </div>
  );
}
