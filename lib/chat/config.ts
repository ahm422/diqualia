/** Max characters per message content (kept small to limit abuse surface). */
export const CHAT_MAX_USER_CHARS = 1000;

/**
 * Chat session cookie. A browser-session cookie (no Max-Age): the chatbot
 * Worker keeps the history for this id in a Durable Object, so the
 * conversation survives page reloads but not closing the browser.
 */
export const CHAT_SESSION_COOKIE = "dq_chat_sid";
