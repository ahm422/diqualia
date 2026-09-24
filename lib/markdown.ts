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
  "u",
  "s",
  "del",
  "span",
  "mark",
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
  span: new Set(["style"]),
  mark: new Set(["style", "data-color"]),
  p: new Set(["style"]),
  h1: new Set(["style"]),
  h2: new Set(["style"]),
  h3: new Set(["style"]),
  h4: new Set(["style"]),
  li: new Set(["style"]),
  blockquote: new Set(["style"]),
  th: new Set(["align", "colspan", "rowspan", "style"]),
  td: new Set(["align", "colspan", "rowspan", "style"]),
};

/** CSS properties permitted inside a sanitized `style` attribute. */
const ALLOWED_STYLE_PROPS = new Set(["color", "background-color", "text-align"]);
const TEXT_ALIGN_VALUES = /^(left|right|center|justify)$/i;

/** CSS named colours (+ transparent / currentcolor). Lower-cased lookup. */
const NAMED_COLORS = new Set([
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque",
  "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood",
  "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk",
  "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray",
  "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen",
  "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
  "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise",
  "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue",
  "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro",
  "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "grey",
  "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
  "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral",
  "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey",
  "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray",
  "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen",
  "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue",
  "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue",
  "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue",
  "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace",
  "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod",
  "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff",
  "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red",
  "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen",
  "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray",
  "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle",
  "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow",
  "yellowgreen", "transparent", "currentcolor",
]);

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

/** Fragments that make any CSS value unsafe regardless of the property. */
function isUnsafeStyleFragment(value: string): boolean {
  return /url\(|expression|\/\*|\\|<|!important/i.test(value);
}

function isColorValue(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(v)) return true;
  if (/^rgba?\(\s*[0-9.\s,%/]+\)$/.test(v)) return true;
  if (/^hsla?\(\s*[0-9.\s,%/deg]+\)$/.test(v)) return true;
  return NAMED_COLORS.has(v);
}

/**
 * Parse a raw `style` attribute, keep only allowlisted + valid `prop: value`
 * pairs, and re-serialize. Returns "" when nothing valid remains (caller then
 * drops the attribute). Splitting on `;` inherently discards any extra chained
 * declarations that are not on the allowlist.
 */
export function sanitizeStyle(raw: string): string {
  const out: string[] = [];
  for (const decl of raw.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim();
    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
    if (!value || isUnsafeStyleFragment(value)) continue;
    if (prop === "text-align") {
      if (!TEXT_ALIGN_VALUES.test(value)) continue;
      out.push(`text-align:${value.toLowerCase()}`);
    } else {
      if (!isColorValue(value)) continue;
      out.push(`${prop}:${value}`);
    }
  }
  return out.join(";");
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
      if (name === "style") {
        const cleaned = sanitizeStyle(value);
        if (!cleaned) continue;
        const escapedStyle = cleaned.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        attrs.push(`style="${escapedStyle}"`);
        continue;
      }
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

const EMOJI_RE =
  /[\p{Extended_Pictographic}\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu;

/** Removes markdown emphasis markers and emojis from chat text. */
export function stripDecorations(text: string): string {
  return text.replace(/(\*\*|__|\*)/g, "").replace(EMOJI_RE, "");
}
