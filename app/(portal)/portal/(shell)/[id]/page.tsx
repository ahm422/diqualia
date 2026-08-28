import Link from "next/link";
import { notFound } from "next/navigation";

import { requireApplicant } from "@/lib/portal/require-applicant";
import { getDb } from "@/lib/cloudflare-env";
import { maskCnic } from "@/lib/cnic";

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-wrap gap-2 border-b border-[var(--diq_border)] py-2 text-sm last:border-0">
      <dt className="w-48 shrink-0 text-[var(--diq_mid)]">{label}</dt>
      <dd className="min-w-0 flex-1">{String(value)}</dd>
    </div>
  );
}

export default async function PortalApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireApplicant();
  const prisma = await getDb();
  const { id } = await params;

  const app = await prisma.jobApplication.findUnique({ where: { id } });
  if (!app || (app.email !== session.email && app.applicantUserId !== session.id)) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/portal"
        className="text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:text-[var(--gold)]"
      >
        ← All applications
      </Link>

      <h1 className="mt-4 text-xl font-medium">{app.jobTitle}</h1>
      <p className="mt-1 text-sm text-[var(--diq_mid)]">
        Submitted {app.submittedAt.toISOString().slice(0, 10)} · status{" "}
        <span className="uppercase tracking-wide">{app.status}</span>
      </p>

      <dl className="mt-6 rounded-lg border border-[var(--diq_border)] bg-[var(--card)] px-4 py-2">
        <Row label="Name" value={app.name} />
        <Row label="Email" value={app.email} />
        <Row label="Phone" value={app.phone} />
        <Row label="CNIC" value={maskCnic(app.cnic)} />
        <Row label="City" value={app.city} />
        <Row label="Nationality" value={app.nationality} />
        <Row label="Highest qualification" value={app.highestQualification} />
        <Row label="Years of experience" value={app.yearsOfExperience} />
        <Row label="Notice period (days)" value={app.noticePeriodDays} />
        <Row label="Available from" value={app.availableFrom} />
      </dl>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <a
          href={`/api/portal/applications/${app.id}/resume`}
          className="rounded-md border border-[var(--diq_border)] px-3 py-2 hover:border-[var(--gold)]"
        >
          Download résumé
        </a>
        {app.photoKey ? (
          <a
            href={`/api/portal/applications/${app.id}/photo`}
            className="rounded-md border border-[var(--diq_border)] px-3 py-2 hover:border-[var(--gold)]"
          >
            Download photo
          </a>
        ) : null}
      </div>
    </div>
  );
}
