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
 * Public contact point. `display` is what humans read; `tel` is the RFC 3966
 * form for `href="tel:"` and the Organization `telephone` node.
 */
export const CONTACT_PHONE = {
  display: "0300 3968398",
  tel: "+923003968398",
} as const;

/** Primary inbound email — rendered as a `mailto:` and fed to the Organization node. */
export const CONTACT_EMAIL = "info@diqualia.com";

/**
 * Registered office. Structured parts feed the schema.org `PostalAddress`;
 * `display` is the single-line human form and `mapUrl` opens Google Maps.
 */
export const CONTACT_ADDRESS = {
  street: "20-J, Commercial Market, W Block, Farid Town",
  city: "Sahiwal",
  region: "Punjab",
  postalCode: "57000",
  country: "PK",
  display: "20-J, Commercial Market, W Block, Farid Town, Sahiwal, 57000",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=20-J%2C%20Commercial%20Market%2C%20W%20Block%2C%20Farid%20Town%2C%20Sahiwal%2C%2057000",
} as const;

/**
 * Public social / profile URLs, labelled for the footer/contact social rows.
 * The bare URLs also feed the Organization `sameAs` array via {@link SOCIAL_LINKS}.
 */
export const SOCIAL_PROFILES = [
  { label: "LinkedIn", url: "https://www.linkedin.com/company/diqualia" },
  { label: "Facebook", url: "https://www.facebook.com/p/DiQualia-61577542509052/" },
  { label: "Instagram", url: "https://www.instagram.com/di_qualia/" },
] as const;

/** Feeds the footer social row and the Organization `sameAs` array. */
export const SOCIAL_LINKS: readonly string[] = SOCIAL_PROFILES.map((p) => p.url);

/** Resolve a site-relative path (or pass through an absolute URL) to an absolute URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
