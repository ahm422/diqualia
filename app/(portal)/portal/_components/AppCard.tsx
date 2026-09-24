import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { formatDate } from "@/lib/portal/format";
import { StatusBadge } from "./StatusBadge";

/** Scannable application card — the whole card is one link to the detail page. */
export function AppCard({
  id,
  jobTitle,
  submittedAt,
  status,
}: {
  id: string;
  jobTitle: string;
  submittedAt: Date;
  status: string;
}) {
  return (
    <Link
      href={`/portal/${id}`}
      className="group flex items-center gap-4 rounded-xl border border-[var(--diq_border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] motion-reduce:transition-none"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--foreground)]">{jobTitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusBadge status={status} />
          <time className="text-xs text-[var(--diq_mid)]" dateTime={submittedAt.toISOString()}>
            {formatDate(submittedAt)}
          </time>
        </div>
      </div>
      <ChevronRight
        aria-hidden
        className="size-4 shrink-0 text-[var(--diq_mid)] transition-colors group-hover:text-[var(--gold)] motion-reduce:transition-none"
      />
    </Link>
  );
}
