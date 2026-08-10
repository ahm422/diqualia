/**
 * Swap here when the Workers AI catalog changes.
 * Verify at https://developers.cloudflare.com/workers-ai/models/
 *
 * `@cf/meta/llama-3.1-8b-instruct` is deprecated in the catalog (as of 2026);
 * use the FP8 instruct variant as the balanced Llama 3.1 8B default.
 */
export const CHAT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8" as const;

/** Max conversation turns kept server-side (user + assistant pairs count as separate messages). */
export const CHAT_MAX_MESSAGES = 20;

/** Max characters per message content. */
export const CHAT_MAX_USER_CHARS = 2000;

/** Soft in-memory rate limit (same pattern as contact/leads). */
export const CHAT_RATE_LIMIT = { limit: 20, windowMs: 60_000 } as const;

/** Soft cap for knowledge-pack body snippets (chars). */
export const CHAT_BODY_TRUNCATE = 600;
