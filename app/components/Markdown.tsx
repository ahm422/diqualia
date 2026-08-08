import { renderMarkdown } from "@/lib/markdown";

export function Markdown({ source }: { source: string }) {
  const html = renderMarkdown(source);

  return (
    <div
      className="diq-markdown text-[15px] leading-8"
      style={{ color: "var(--text-faint)" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
