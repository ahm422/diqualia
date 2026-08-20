import { ExternalLink } from "lucide-react";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

export function AdminPreviewLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--diq_panel)] hover:text-[var(--foreground)] ${FOCUS}`}
    >
      <ExternalLink size={14} />
      Preview on site
    </a>
  );
}
