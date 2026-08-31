import Link from "next/link";

import { requireApplicant } from "@/lib/portal/require-applicant";
import { getDb } from "@/lib/cloudflare-env";

export default async function PortalDashboardPage() {
  const session = await requireApplicant();
  const prisma = await getDb();

  const applications = await prisma.jobApplication.findMany({
    where: { email: session.email },
    orderBy: { submittedAt: "desc" },
    select: { id: true, jobTitle: true, submittedAt: true, status: true },
  });

  return (
    <div>
      <h1 className="text-xl font-medium">Your applications</h1>
      <p className="mt-1 text-sm text-[var(--diq_mid)]">
        Everything you&apos;ve submitted, most recent first.
      </p>

      {applications.length === 0 ? (
        <p className="mt-8 rounded-lg border border-[var(--diq_border)] bg-[var(--card)] px-4 py-10 text-center text-sm text-[var(--diq_mid)]">
          No applications on this account yet.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-[var(--diq_border)] overflow-hidden rounded-lg border border-[var(--diq_border)] bg-[var(--card)]">
          {applications.map((app) => (
            <li key={app.id}>
              <Link
                href={`/portal/${app.id}`}
                className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--diq_panel)]"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{app.jobTitle}</span>
                <span className="text-xs uppercase tracking-wide text-[var(--diq_mid)]">
                  {app.status}
                </span>
                <time
                  className="text-xs text-[var(--diq_mid)]"
                  dateTime={app.submittedAt.toISOString()}
                >
                  {app.submittedAt.toISOString().slice(0, 10)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
