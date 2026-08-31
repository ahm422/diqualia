"use client";

// Advisory strength meter — a light length + character-class heuristic, no
// dependency. It never gates submit; minLength={8} and the match check remain
// the real guards.

const LABELS = ["Weak", "Fair", "Good", "Strong"] as const;

const SEGMENT_TONE = [
  "bg-[var(--status-negative)]",
  "bg-[var(--status-progress)]",
  "bg-[var(--status-progress)]",
  "bg-[var(--status-positive)]",
];

function score(value: string): number {
  if (!value) return 0;
  let s = 0;
  if (value.length >= 8) s += 1;
  if (value.length >= 12) s += 1;
  const classes =
    Number(/[a-z]/.test(value)) +
    Number(/[A-Z]/.test(value)) +
    Number(/\d/.test(value)) +
    Number(/[^A-Za-z0-9]/.test(value));
  if (classes >= 2) s += 1;
  if (classes >= 3) s += 1;
  return Math.min(s, 4);
}

export function PasswordStrength({ value }: { value: string }) {
  const s = score(value);
  const label = s === 0 ? "" : LABELS[s - 1];

  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors motion-reduce:transition-none ${
              i < s ? SEGMENT_TONE[s - 1] : "bg-[var(--diq_border)]"
            }`}
          />
        ))}
      </div>
      <p role="status" aria-live="polite" className="mt-1 text-xs text-[var(--diq_mid)]">
        {label ? `${label} · at least 8 characters` : "At least 8 characters"}
      </p>
    </div>
  );
}
