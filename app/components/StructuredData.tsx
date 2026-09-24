/**
 * Renders one or more schema.org JSON-LD `<script>` tags. Server component.
 *
 * Follows the Next.js recommended pattern (`docs/01-app/02-guides/json-ld.md`):
 * a native `<script type="application/ld+json">` with `JSON.stringify`, escaping
 * `<` to its unicode form so a malicious string in the data can't break out of
 * the script element.
 */

type JsonLd = Record<string, unknown>;

export function StructuredData({ data }: { data: JsonLd | JsonLd[] }) {
  const nodes = Array.isArray(data) ? data : [data];
  return (
    <>
      {nodes.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
