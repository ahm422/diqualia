export function AdminTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={[
        "w-full resize-y rounded border bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:outline-none focus:ring-1",
        error
          ? "border-[var(--destructive)] focus:ring-[var(--destructive)]"
          : "border-[var(--diq_border)] focus:ring-[var(--gold)]",
      ].join(" ")}
    />
  );
}
