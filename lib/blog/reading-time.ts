// Reading-time estimate for a blog post body. The body is sanitized HTML
// (TipTap editor output), so tags are stripped before counting words. Pure and
// DOM-free — safe on the Cloudflare Worker runtime.

const WORDS_PER_MINUTE = 200;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Strip HTML tags (and `<script>` / `<style>` blocks) and decode a few entities. */
export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function readingTimeMinutes(html: string): number {
  return Math.max(1, Math.round(countWords(stripHtml(html)) / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
