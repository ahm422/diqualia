import { AdminPreviewLink } from "./AdminPreviewLink";

export function AdminPageHeader({
  title,
  description,
  previewHref,
}: {
  title: string;
  description?: string;
  previewHref?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-sans text-2xl font-medium text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--diq_mid)]">{description}</p>
        )}
      </div>
      {previewHref ? <AdminPreviewLink href={previewHref} /> : null}
    </div>
  );
}
