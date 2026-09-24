/**
 * Content hashing for incremental ingestion.
 * Uses Web Crypto (available in the Workers runtime).
 */

export async function hashText(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
