import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminPageHeader } from "@/components/admin";

import { CareersSubNav } from "../../CareersSubNav";
import { JobOpeningEditor } from "../JobOpeningEditor";

export default async function NewJobOpeningPage() {
  await requireAdmin();

  return (
    <div>
      <AdminPageHeader
        title="New opening"
        description="Create a role. Hidden openings 404 on the public site."
      />
      <CareersSubNav />
      <JobOpeningEditor />
    </div>
  );
}
