import Link from "next/link";

import { Button } from "./_components/Button";

export default function PortalNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--diq_border)] bg-[var(--card)] px-6 py-14 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--gold)]">DiQualia</p>
        <h1 className="mt-2 text-2xl font-medium text-[var(--foreground)]">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--diq_mid)]">
          That portal page doesn&apos;t exist.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild variant="primary" size="md">
            <Link href="/portal">Go to your dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
