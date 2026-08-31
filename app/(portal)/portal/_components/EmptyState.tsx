import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--diq_border)] bg-[var(--card)] px-6 py-14 text-center">
      {Icon ? <Icon aria-hidden className="mx-auto size-10 text-[var(--diq_mid)]" /> : null}
      <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--diq_mid)]">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
