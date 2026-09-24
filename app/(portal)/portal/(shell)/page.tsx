import Link from "next/link";
import { FileText } from "lucide-react";

import { requireApplicant } from "@/lib/portal/require-applicant";
import { getDb } from "@/lib/cloudflare-env";
import { formatRelativeTime } from "@/lib/portal/format";

import { AppCard } from "../_components/AppCard";
import { Button } from "../_components/Button";
import { EmptyState } from "../_components/EmptyState";
import { StatCard } from "../_components/StatCard";

export default async function PortalDashboardPage() {
  const session = await requireApplicant();
  const prisma = await getDb();

  const applications = await prisma.jobApplication.findMany({
    where: { email: session.email },
    orderBy: { submittedAt: "desc" },
    select: { id: true, jobTitle: true, submittedAt: true, status: true },
  });

  // Counts derived from the rows already fetched — no extra query.
  const total = applications.length;
  const inReview = applications.filter((a) => a.status === "reviewing").length;
  const offers = applications.filter((a) => a.status === "hired").length;
  const notSelected = applications.filter((a) => a.status === "rejected").length;
  const latest = applications[0]?.submittedAt;

  const name = session.name?.trim();

  return (
    <div>
      <h1 className="text-2xl font-medium text-[var(--foreground)]">
        Welcome back{name ? `, ${name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-[var(--diq_mid)]">
        {latest
          ? `Signed in as ${session.email} · last activity ${formatRelativeTime(latest)}`
          : `Signed in as ${session.email}`}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total applications" value={total || "—"} />
        <StatCard label="In review" value={inReview || "—"} tone={inReview ? "progress" : undefined} />
        <StatCard label="Offers" value={offers || "—"} tone={offers ? "positive" : undefined} />
        <StatCard
          label="Not selected"
          value={notSelected || "—"}
          tone={notSelected ? "negative" : undefined}
        />
      </div>

      <div className="mt-10 flex items-baseline justify-between">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Applications</h2>
        {total > 0 ? <span className="text-sm text-[var(--diq_mid)]">{total}</span> : null}
      </div>

      {total === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Anything you submit through DiQualia Careers will show up here."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/careers">Browse open roles</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {applications.map((app) => (
            <li key={app.id}>
              <AppCard
                id={app.id}
                jobTitle={app.jobTitle}
                submittedAt={app.submittedAt}
                status={app.status}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
