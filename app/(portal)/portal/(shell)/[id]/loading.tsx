import { Skeleton } from "../../_components/Skeleton";

export default function DetailLoading() {
  return (
    <div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-4 h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-40" />

      <div className="mt-6 flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-3 w-16" />
            {i < 2 ? <Skeleton className="h-px flex-1" /> : null}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--diq_border)] p-6">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 5 }).map((__, j) => (
              <Skeleton key={j} className="mt-3 h-4 w-full" />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[var(--diq_border)] p-6">
        <Skeleton className="h-4 w-24" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-11 w-40 rounded-lg" />
          <Skeleton className="h-11 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
