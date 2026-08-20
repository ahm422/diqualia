export function AdminInput({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={[
        "w-full rounded border bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:outline-none focus:ring-1 disabled:opacity-60",
        error
          ? "border-red-400 focus:ring-red-400"
          : "border-[var(--diq_border)] focus:ring-[var(--gold)]",
      ].join(" ")}
    />
  );
}
