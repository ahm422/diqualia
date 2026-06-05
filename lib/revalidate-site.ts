import { revalidatePath } from "next/cache";

export const SITE_PATHS = [
  "/",
  "/about",
  "/services",
  "/process",
  "/industries",
  "/contact",
  "/story",
] as const;

/** Revalidate a single public page */
export function revalidatePage(path: (typeof SITE_PATHS)[number]) {
  revalidatePath(path);
}

/** Revalidate SiteHeader/SiteFooter layout data shown on every public page */
export function revalidateSiteLayout() {
  for (const path of SITE_PATHS) {
    revalidatePath(path, "layout");
  }
}
