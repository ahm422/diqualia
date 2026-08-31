import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { STEPPER_STEPS, stepFromStatus, TONE_CLASS } from "@/lib/portal/status";

/** Horizontal 3-step indicator: Submitted -> In review -> Decision.
 *  rejected/hired both resolve the final step, toned + labelled accordingly. */
export function StatusStepper({ status }: { status: string }) {
  const s = stepFromStatus(status);

  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-[20rem] items-center gap-2" aria-label="Application progress">
        {STEPPER_STEPS.map((step, i) => {
          const isFinal = i === 2;
          const label = isFinal ? s.finalLabel : step;
          const done = i < s.activeIndex;
          const current = i === s.activeIndex;

          const circle = done
            ? "border-transparent bg-[var(--gold)] text-[var(--ink)]"
            : current
              ? isFinal && s.complete
                ? TONE_CLASS[s.finalTone]
                : TONE_CLASS.progress
              : "border-[var(--diq_border)] text-[var(--diq_mid)]";

          return (
            <li
              key={step}
              className="flex flex-1 items-center gap-2"
              {...(current ? { "aria-current": "step" as const } : {})}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-medium transition-colors motion-reduce:transition-none",
                    circle,
                  )}
                >
                  {done ? <Check className="size-4" aria-hidden /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-xs whitespace-nowrap",
                    current ? "text-[var(--foreground)]" : "text-[var(--diq_mid)]",
                  )}
                >
                  {label}
                </span>
              </span>
              {i < STEPPER_STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-px flex-1",
                    i < s.activeIndex ? "bg-[var(--gold)]" : "bg-[var(--diq_border)]",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
