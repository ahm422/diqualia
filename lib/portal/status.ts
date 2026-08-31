// Presentation metadata for the four job-application statuses.
// Canonical vocabulary: lib/schemas/admin/career.ts -> ["new","reviewing","rejected","hired"].
// Portal-only; the admin table keeps its own local statusVariant().

export type StatusTone = "neutral" | "progress" | "positive" | "negative";

export type PortalStatus = "new" | "reviewing" | "rejected" | "hired";

export interface StatusMeta {
  label: string;
  tone: StatusTone;
}

export const STATUS_META: Record<PortalStatus, StatusMeta> = {
  new: { label: "Submitted", tone: "neutral" },
  reviewing: { label: "In review", tone: "progress" },
  hired: { label: "Hired", tone: "positive" },
  rejected: { label: "Not selected", tone: "negative" },
};

export const STATUS_FALLBACK: StatusMeta = { label: "Submitted", tone: "neutral" };

/** Safe lookup — the DB `status` column is typed `string`, so tolerate unknowns. */
export function statusMeta(status: string): StatusMeta {
  return STATUS_META[status as PortalStatus] ?? STATUS_FALLBACK;
}

/** Node labels for the 3-step progress stepper (final label is swapped once decided). */
export const STEPPER_STEPS = ["Submitted", "In review", "Decision"] as const;

export interface StepState {
  /** 0-based index of the furthest reached node (0..2). */
  activeIndex: 0 | 1 | 2;
  /** true once a terminal decision (hired/rejected) is reached. */
  complete: boolean;
  /** tone for the final ("Decision") node. */
  finalTone: StatusTone;
  /** label for the final node — resolves to the outcome once decided. */
  finalLabel: string;
}

export function stepFromStatus(status: string): StepState {
  switch (status) {
    case "reviewing":
      return { activeIndex: 1, complete: false, finalTone: "neutral", finalLabel: "Decision" };
    case "hired":
      return { activeIndex: 2, complete: true, finalTone: "positive", finalLabel: "Hired" };
    case "rejected":
      return { activeIndex: 2, complete: true, finalTone: "negative", finalLabel: "Not selected" };
    case "new":
    default:
      return { activeIndex: 0, complete: false, finalTone: "neutral", finalLabel: "Decision" };
  }
}

/**
 * Tailwind class strings per tone. Kept as a static map because the Tailwind v4
 * JIT cannot see interpolated class names (never `text-[var(--status-${tone})]`).
 * Each entry sets text + fill + border for a toned pill / node.
 */
export const TONE_CLASS: Record<StatusTone, string> = {
  neutral:
    "text-[var(--status-neutral)] bg-[var(--status-neutral-tint)] border-[color-mix(in_oklab,var(--status-neutral)_30%,transparent)]",
  progress:
    "text-[var(--status-progress)] bg-[var(--status-progress-tint)] border-[color-mix(in_oklab,var(--status-progress)_35%,transparent)]",
  positive:
    "text-[var(--status-positive)] bg-[var(--status-positive-tint)] border-[color-mix(in_oklab,var(--status-positive)_35%,transparent)]",
  negative:
    "text-[var(--status-negative)] bg-[var(--status-negative-tint)] border-[color-mix(in_oklab,var(--status-negative)_35%,transparent)]",
};
