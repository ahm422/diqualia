// Server-deterministic date formatting for the applicant portal.
// `timeZone: "UTC"` is pinned so the rendered string never shifts between the
// Cloudflare Worker runtime, Node in CI, and a reviewer's machine (Prisma returns
// a UTC instant); it also avoids an off-by-one near local midnight.

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** e.g. `05 Jan 2026`. Returns an em dash for an invalid input. */
export function formatDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FMT.format(date);
}

// Re-exported so portal pages have a single import site for time helpers.
// Used for the dashboard "last activity" line.
export { formatRelativeTime } from "@/lib/format-relative-time";
