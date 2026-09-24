/**
 * Upload a single image to R2 via the admin upload route.
 *
 * Shared by `AdminImageField` (cover images) and `RichTextEditor` (inline images).
 * The route enforces auth (`cms.edit`), a 5 MB limit, and JPEG/PNG/WebP/SVG only;
 * failures come back as `{ error }` and are re-thrown with that message so callers
 * can surface it in a toast.
 */
export async function uploadAdminImage(
  file: File,
): Promise<{ url: string; key: string }> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  const data = (await res.json().catch(() => null)) as
    | { url?: string; key?: string; error?: string }
    | null;

  if (!res.ok || !data?.url || !data?.key) {
    throw new Error(data?.error ?? "Upload failed");
  }

  return { url: data.url, key: data.key };
}
