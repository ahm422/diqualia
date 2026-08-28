import { redirect } from "next/navigation";

import { requireApplicant } from "@/lib/portal/require-applicant";

import { PortalHeader } from "./PortalHeader";

export const dynamic = "force-dynamic";

export default async function PortalShellLayout({ children }: { children: React.ReactNode }) {
  const session = await requireApplicant();
  if (session.mustChangePassword) redirect("/portal/change-password");

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
      <PortalHeader email={session.email} />
      <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
