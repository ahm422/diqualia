// Canonical CNIC shape is 12345-1234567-8 (5 + 7 + 1 digits). The stored value is
// always the 13 bare digits (see normalizeCnic).
export const CNIC_INPUT_RE = /^\d{5}-\d{7}-\d$/;

export function isPakistanNationality(value: string | null | undefined): boolean {
  return (value ?? "").trim().toLowerCase() === "pakistan";
}

/**
 * Auto-format free text into the canonical `#####-#######-#` shape as the user
 * types. Strips non-digits, hard-caps at 13 digits, and inserts a dash after the
 * 5th and 12th digit once that group has started. Pure, no side effects.
 *
 *   ""              -> ""
 *   "abc12345"      -> "12345"
 *   "123451234567"  -> "12345-1234567"
 *   "1234512345678" -> "12345-1234567-8"
 *   "12345123456789"-> "12345-1234567-8"   (14th digit dropped)
 */
export function formatCnicInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function normalizeCnic(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length === 13 ? digits : null;
}

/** Full `#####-#######-#` render of a stored 13-digit value (unmasked, PII-gated). */
export function formatCnic(digits: string | null | undefined): string {
  if (!digits || digits.length !== 13) return "—";
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function maskCnic(digits: string | null | undefined): string {
  if (!digits || digits.length !== 13) return "—";
  const last4 = digits.slice(-4);
  return `*****-****${last4.slice(0, 3)}-${last4.slice(3)}`;
}

export function cnicLast4(digits: string | null | undefined): string {
  if (!digits || digits.length < 4) return "—";
  return digits.slice(-4);
}
