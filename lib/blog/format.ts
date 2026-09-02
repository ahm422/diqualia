// Server-deterministic date formatting for the public blog. `timeZone: "UTC"` is
// pinned so the string never shifts between the Cloudflare Worker runtime, Node
// in CI, and a reviewer's machine (Prisma returns a UTC instant).

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** e.g. `January 5, 2026`. Empty string for null / invalid input. */
export function formatBlogDate(value: Date | string | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return DATE_FMT.format(date);
}
