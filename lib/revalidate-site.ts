import { revalidatePath } from "next/cache";

export const SITE_PATHS = [
  "/",
  "/about",
  "/services",
  "/process",
  "/industries",
  "/contact",
  "/story",
  "/blog",
  "/careers",
] as const;

/** Revalidate a single public page */
export function revalidatePage(path: (typeof SITE_PATHS)[number]) {
  revalidatePath(path);
}

/** Revalidate several public pages at once (e.g. content shown on both `/` and a dedicated page) */
export function revalidatePages(...paths: (typeof SITE_PATHS)[number][]) {
  for (const path of paths) revalidatePath(path);
}

/** Revalidate a dynamic blog post path (not in SITE_PATHS) */
export function revalidateBlogPost(slug: string) {
  revalidatePath(`/blog/${slug}`);
}

/** Revalidate a dynamic industry sector path (not in SITE_PATHS) */
export function revalidateIndustrySector(slug: string) {
  revalidatePath(`/industries/${slug}`);
}

/** Revalidate a dynamic job opening path (not in SITE_PATHS) */
export function revalidateJobOpening(slug: string) {
  revalidatePath(`/careers/${slug}`);
}

/** Revalidate SiteHeader/SiteFooter layout data shown on every public page */
export function revalidateSiteLayout() {
  for (const path of SITE_PATHS) {
    revalidatePath(path, "layout");
  }
}
