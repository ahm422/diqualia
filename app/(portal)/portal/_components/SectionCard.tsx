import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Bordered surface with an optional uppercase-label heading and right-aligned action. */
export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--diq_border)] bg-[var(--card)] p-6",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title ? (
            <h2 className="font-mono text-sm uppercase tracking-wide text-[var(--diq_mid)]">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <div className={cn(title || action ? "mt-4" : undefined)}>{children}</div>
    </section>
  );
}

export { SectionCard as Panel };
