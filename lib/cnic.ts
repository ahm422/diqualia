export const CNIC_INPUT_RE = /^(\d{5}-\d{7}-\d|\d{13})$/;

export function isPakistanNationality(value: string | null | undefined): boolean {
  return (value ?? "").trim().toLowerCase() === "pakistan";
}

export function normalizeCnic(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length === 13 ? digits : null;
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
