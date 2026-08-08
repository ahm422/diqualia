/** URL-safe kebab slug from a display name / title. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/**
 * Return `base` slugified, or `base-2`, `base-3`, … until `exists` is false.
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "sector";
  if (!(await exists(root))) return root;

  for (let i = 2; i < 1000; i++) {
    const suffix = `-${i}`;
    const candidate = `${root.slice(0, Math.max(1, 200 - suffix.length))}${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }

  throw new Error("Could not generate unique slug");
}
