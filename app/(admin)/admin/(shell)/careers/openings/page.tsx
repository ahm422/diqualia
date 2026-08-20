import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { Button } from "@/components/ui/button";

import { JobOpeningsList } from "./JobOpeningsList";

export default async function JobOpeningsAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const openings = await prisma.jobOpening.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-medium text-foreground">Job openings</h1>
          <p className="mt-1 text-sm text-[var(--diq_mid)]">Public roles listed on /careers</p>
        </div>
        <Button asChild variant="secondary" className="shrink-0">
          <Link href="/admin/careers/openings/new">New opening</Link>
        </Button>
      </div>
      <JobOpeningsList initialOpenings={openings} />
    </div>
  );
}
