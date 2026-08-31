import { cn } from "@/lib/utils";

/** Shimmer placeholder. Pulse is disabled under prefers-reduced-motion. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-[var(--diq_panel)] motion-reduce:animate-none",
        className,
      )}
    />
  );
}
