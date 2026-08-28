import { requireApplicant } from "@/lib/portal/require-applicant";

import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function PortalChangePasswordPage() {
  const session = await requireApplicant();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[var(--gold)]">DiQualia</p>
          <h1 className="text-2xl font-medium">Change your password</h1>
        </div>
        <ChangePasswordForm forced={session.mustChangePassword} />
      </div>
    </div>
  );
}
