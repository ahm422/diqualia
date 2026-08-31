import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/portal/status";

const TONE_TEXT: Record<StatusTone, string> = {
  neutral: "text-[var(--foreground)]",
  progress: "text-[var(--status-progress)]",
  positive: "text-[var(--status-positive)]",
  negative: "text-[var(--status-negative)]",
};

export function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number | string;
  tone?: StatusTone;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--diq_border)] bg-[var(--card)] p-4">
      <p className="font-mono text-[11px] uppercase tracking-wide text-[var(--diq_mid)]">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-medium tabular-nums",
          tone ? TONE_TEXT[tone] : "text-[var(--foreground)]",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[var(--diq_mid)]">{hint}</p> : null}
    </div>
  );
}
