import { marked } from "marked";

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "em",
  "strong",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "rel", "target"]),
  img: new Set(["src", "alt", "title"]),
  code: new Set(["class"]),
  pre: new Set(["class"]),
  th: new Set(["align"]),
  td: new Set(["align"]),
};

marked.setOptions({
  gfm: true,
  breaks: false,
});

function isSafeUrl(value: string, kind: "href" | "src"): boolean {
  const trimmed = value.trim();
  if (trimmed.startsWith("#")) return kind === "href";
  if (kind === "href") {
    return /^(https?:|mailto:|\/)/i.test(trimmed);
  }
  return /^(https?:|\/|data:image\/(png|jpeg|jpg|gif|webp);base64,)/i.test(trimmed);
}

/** Lightweight allowlist sanitizer — no DOM / jsdom (Workers-safe). */
export function sanitizeHtml(html: string): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)\/?>/g, (match, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    const isClosing = match.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (isClosing) return `</${tag}>`;

    const selfClosing = match.endsWith("/>") || tag === "br" || tag === "hr" || tag === "img";
    const allowed = ALLOWED_ATTRS[tag];
    if (!allowed || !rawAttrs.trim()) {
      return selfClosing && (tag === "br" || tag === "hr" || tag === "img")
        ? `<${tag}>`
        : `<${tag}>`;
    }

    const attrs: string[] = [];
    const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
    let m: RegExpExecArray | null;
    while ((m = attrRe.exec(rawAttrs)) !== null) {
      const name = m[1].toLowerCase();
      const value = m[2] ?? m[3] ?? m[4] ?? "";
      if (!allowed.has(name)) continue;
      if (name.startsWith("on")) continue;
      if (name === "href" && !isSafeUrl(value, "href")) continue;
      if (name === "src" && !isSafeUrl(value, "src")) continue;
      const escaped = value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
      attrs.push(`${name}="${escaped}"`);
    }

    if (tag === "img" && !attrs.some((a) => a.startsWith("src="))) {
      return "";
    }

    if (tag === "a" && !attrs.some((a) => a.startsWith("rel="))) {
      attrs.push('rel="noopener noreferrer"');
    }

    const attrStr = attrs.length ? ` ${attrs.join(" ")}` : "";
    return `<${tag}${attrStr}>`;
  });
}

export function renderMarkdown(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  return sanitizeHtml(html);
}
