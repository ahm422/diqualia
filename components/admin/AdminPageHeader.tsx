export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-sans text-2xl font-medium text-foreground">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-[var(--diq_mid)]">{description}</p>
      )}
    </div>
  );
}
