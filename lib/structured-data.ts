/**
 * schema.org JSON-LD builders. Pure functions returning plain objects — render
 * them through `<StructuredData>` (`app/components/StructuredData.tsx`).
 *
 * Kept free of `server-only` and framework imports so builders can be unit-tested
 * and reused anywhere.
 */

import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
  absoluteUrl,
} from "@/lib/site-config";

type JsonLd = Record<string, unknown>;

/** Organization node — the publisher identity referenced by every other node. */
export function buildOrganizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/diqualia-logo.png"),
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE.tel,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT_ADDRESS.street,
      addressLocality: CONTACT_ADDRESS.city,
      addressRegion: CONTACT_ADDRESS.region,
      postalCode: CONTACT_ADDRESS.postalCode,
      addressCountry: CONTACT_ADDRESS.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: CONTACT_PHONE.tel,
      email: CONTACT_EMAIL,
    },
    ...(SOCIAL_LINKS.length ? { sameAs: [...SOCIAL_LINKS] } : {}),
  };
}

/** WebSite node. No `potentialAction`/`SearchAction` — the site has no on-site search. */
export function buildWebsiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

type BlogPostingInput = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
};

/** BlogPosting node for an individual article. */
export function buildBlogPostingSchema(post: BlogPostingInput): JsonLd {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const org = {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/diqualia-logo.png"),
  };
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    mainEntityOfPage: url,
    url,
    datePublished: (post.publishedAt ?? post.updatedAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: org,
    publisher: org,
    ...(post.coverImageUrl ? { image: absoluteUrl(post.coverImageUrl) } : {}),
  };
}
