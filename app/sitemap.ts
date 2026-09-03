import type { MetadataRoute } from "next";

import { getDb } from "@/lib/cloudflare-env";
import { SITE_PATHS } from "@/lib/revalidate-site";
import { absoluteUrl } from "@/lib/site-config";

// Re-generate hourly in addition to the on-demand revalidateSitemap() fired from
// the admin blog / industry / job-opening routes.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: Entry["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  ...SITE_PATHS.filter((p) => p !== "/").map((path) => ({
    path,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = await getDb();
  const now = new Date();

  const [posts, sectors, openings] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.industrySector.findMany({
      where: { visible: true },
      select: { slug: true },
    }),
    prisma.jobOpening.findMany({
      where: { visible: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticEntries: Entry[] = STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const blogEntries: Entry[] = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // IndustrySector has no updatedAt column — omit lastModified rather than fake it.
  const sectorEntries: Entry[] = sectors.map((s) => ({
    url: absoluteUrl(`/industries/${s.slug}`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const jobEntries: Entry[] = openings.map((o) => ({
    url: absoluteUrl(`/careers/${o.slug}`),
    lastModified: o.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticEntries, ...blogEntries, ...sectorEntries, ...jobEntries];
}
