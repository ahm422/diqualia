import { redirect } from "next/navigation";

import { requireApplicant } from "@/lib/portal/require-applicant";

import { PortalTopBar } from "./PortalTopBar";
import { Sidebar } from "./Sidebar";

export const dynamic = "force-dynamic";

export default async function PortalShellLayout({ children }: { children: React.ReactNode }) {
  const session = await requireApplicant();
  if (session.mustChangePassword) redirect("/portal/change-password");

  return (
    <div className="min-h-screen md:flex">
      <Sidebar email={session.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PortalTopBar email={session.email} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
