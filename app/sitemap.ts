import type { MetadataRoute } from "next";

import { getDb } from "@/lib/cloudflare-env";
import { SITE_PATHS } from "@/lib/revalidate-site";
import { absoluteUrl } from "@/lib/site-config";

// Rendered at request time, not at build. The rest of the public site is
// `force-dynamic` via app/(site)/layout.tsx; this metadata route sits outside
// that layout, so without this it would be prerendered during `next build` and
// hit D1 before migrations have run on the target database (P2021 / "no such
// table") — failing the deploy. Kept fresh by the on-demand revalidateSitemap()
// fired from the admin blog / industry / job-opening routes plus this per-request
// render.
export const dynamic = "force-dynamic";

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
  const now = new Date();

  // Degrade to a static-routes-only sitemap if the database is unreachable or a
  // table is missing (e.g. migrations not yet applied to a fresh environment) —
  // a temporarily thin sitemap is better than a hard 500 / failed build.
  const { posts, sectors, openings } = await fetchDynamicRoutes();

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

type DynamicRoutes = {
  posts: Array<{ slug: string; updatedAt: Date }>;
  sectors: Array<{ slug: string }>;
  openings: Array<{ slug: string; updatedAt: Date }>;
};

async function fetchDynamicRoutes(): Promise<DynamicRoutes> {
  try {
    const prisma = await getDb();
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
    return { posts, sectors, openings };
  } catch (err) {
    console.error("sitemap: failed to load dynamic routes, serving static only", err);
    return { posts: [], sectors: [], openings: [] };
  }
}
