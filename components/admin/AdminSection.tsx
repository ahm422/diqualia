export function AdminSection({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`mb-8 rounded-xl border border-[var(--diq_border)] bg-[var(--diq_surface)] p-6${id ? " scroll-mt-8" : ""}`}
    >
      <h2 className="mb-5 text-base font-medium text-foreground">{title}</h2>
      {children}
    </section>
  );
}
