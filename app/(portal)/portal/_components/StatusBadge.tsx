import { cn } from "@/lib/utils";
import { statusMeta, TONE_CLASS } from "@/lib/portal/status";

/** Toned pill for an application status. The text carries the meaning — the
 *  colour and dot are secondary signals only. */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { label, tone } = statusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        TONE_CLASS[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
