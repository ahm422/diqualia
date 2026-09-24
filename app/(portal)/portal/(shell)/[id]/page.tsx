import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ImageIcon } from "lucide-react";

import { requireApplicant } from "@/lib/portal/require-applicant";
import { getDb } from "@/lib/cloudflare-env";
import { maskCnic } from "@/lib/cnic";
import { formatDate } from "@/lib/portal/format";

import { SectionCard } from "../../_components/SectionCard";
import { StatusBadge } from "../../_components/StatusBadge";
import { StatusStepper } from "../../_components/StatusStepper";

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-wrap gap-2 border-b border-[var(--diq_border)] py-2 text-sm last:border-0">
      <dt className="w-44 shrink-0 text-xs uppercase tracking-wide text-[var(--diq_mid)]">{label}</dt>
      <dd className="min-w-0 flex-1 break-words">{String(value)}</dd>
    </div>
  );
}

const DOC_LINK =
  "inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--diq_border)] px-3 py-2 text-sm transition-colors hover:border-[var(--gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] motion-reduce:transition-none";

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
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:text-[var(--gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        All applications
      </Link>

      <h1 className="mt-4 text-2xl font-medium text-[var(--foreground)]">{app.jobTitle}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <StatusBadge status={app.status} />
        <p className="text-sm text-[var(--diq_mid)]">Submitted {formatDate(app.submittedAt)}</p>
      </div>

      <div className="mt-6">
        <StatusStepper status={app.status} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SectionCard title="Personal">
          <dl>
            <Row label="Name" value={app.name} />
            <Row label="Email" value={app.email} />
            <Row label="Phone" value={app.phone} />
            <Row label="CNIC" value={maskCnic(app.cnic)} />
            <Row label="City" value={app.city} />
            <Row label="Nationality" value={app.nationality} />
          </dl>
        </SectionCard>

        <SectionCard title="Professional">
          <dl>
            <Row label="Highest qualification" value={app.highestQualification} />
            <Row label="Years of experience" value={app.yearsOfExperience} />
            <Row label="Notice period (days)" value={app.noticePeriodDays} />
            <Row label="Available from" value={app.availableFrom} />
          </dl>
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Documents">
          <div className="flex flex-wrap gap-3">
            <a href={`/api/portal/applications/${app.id}/resume`} className={DOC_LINK}>
              <FileText className="size-4 shrink-0 text-[var(--diq_mid)]" aria-hidden />
              Download résumé
            </a>
            {app.photoKey ? (
              <a href={`/api/portal/applications/${app.id}/photo`} className={DOC_LINK}>
                <ImageIcon className="size-4 shrink-0 text-[var(--diq_mid)]" aria-hidden />
                Download photo
              </a>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
