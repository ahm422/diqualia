/** Max conversation turns kept server-side (user + assistant pairs count as separate messages). */
export const CHAT_MAX_MESSAGES = 20;

/** Max characters per message content (kept small to limit abuse surface). */
export const CHAT_MAX_USER_CHARS = 1000;

/** Per-IP rate limit for the chat endpoint. */
export const CHAT_RATE_LIMIT = { limit: 12, windowMs: 60_000 } as const;
