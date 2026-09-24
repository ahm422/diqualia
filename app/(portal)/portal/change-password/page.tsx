import { requireApplicant } from "@/lib/portal/require-applicant";

import { AuthLayout } from "../_components/AuthLayout";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function PortalChangePasswordPage() {
  const session = await requireApplicant();

  return (
    <AuthLayout
      title="Change your password"
      subtitle={
        session.mustChangePassword
          ? "Set a new password to continue — the one from your email is temporary."
          : undefined
      }
    >
      <ChangePasswordForm forced={session.mustChangePassword} />
    </AuthLayout>
  );
}
