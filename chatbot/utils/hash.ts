/**
 * Content hashing for incremental ingestion.
 * Uses Web Crypto so it works in both Node (tsx scripts) and the Worker.
 */

export async function hashText(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Deterministic UUID v5-style from a string. Qdrant point ids must be UUIDs or
 * integers, so stable logical ids (e.g. "service:s01__chunk-0") are hashed
 * into stable UUIDs — the same content always maps to the same point id,
 * preventing duplicate vectors on re-ingestion.
 */
export async function deterministicUuid(input: string): Promise<string> {
  const data = new TextEncoder().encode(`diqualia:${input}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest.slice(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
