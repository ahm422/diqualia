import Link from "next/link";

import { Button } from "../../_components/Button";

export default function ApplicationNotFound() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-[var(--diq_border)] bg-[var(--card)] px-6 py-14 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--gold)]">DiQualia</p>
      <h1 className="mt-2 text-2xl font-medium text-[var(--foreground)]">Application not found</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--diq_mid)]">
        It may have been removed, or it belongs to a different account.
      </p>
      <div className="mt-6 flex justify-center">
        <Button asChild variant="primary" size="md">
          <Link href="/portal">Back to your applications</Link>
        </Button>
      </div>
    </div>
  );
}
