/**
 * Canonical site identity — single source of truth for absolute URLs, the brand
 * name, and the marketing description reused across metadata + structured data.
 *
 * Plain constants only (no `server-only`) so this is safe to import from both
 * Server Components / metadata and the odd Client Component.
 */

export const SITE_URL = "https://diqualia.com";

export const SITE_NAME = "DiQualia";

/** Reused as the meta description fallback and the Organization schema description. */
export const SITE_DESCRIPTION =
  "DiQualia is a marketing intelligence and research unit for niche B2B companies — research-first strategy, buyer mapping, and precision pipeline growth.";

/**
 * Public social / profile URLs. Feeds both the footer social row and the
 * Organization `sameAs` array.
 *
 * TODO(seo-9.7): populate with the real LinkedIn / X company profile URLs, then
 * render the footer social row and the `sameAs` node (both are skipped while empty).
 */
export const SOCIAL_LINKS: readonly string[] = [];

/** Resolve a site-relative path (or pass through an absolute URL) to an absolute URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
