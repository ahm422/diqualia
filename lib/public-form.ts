type FlattenLike = {
  fieldErrors?: Record<string, string[] | undefined>;
};

export type FieldErrors = Record<string, string>;

export function fieldErrorsFromFlatten(flatten: FlattenLike): FieldErrors {
  const out: FieldErrors = {};
  for (const [key, messages] of Object.entries(flatten.fieldErrors ?? {})) {
    const first = messages?.[0];
    if (first) out[key] = first;
  }
  return out;
}

export function readApiError(
  data: unknown,
  fallback = "Submission failed",
): { message: string; fields: FieldErrors } {
  if (typeof data !== "object" || data == null) {
    return { message: fallback, fields: {} };
  }
  const record = data as { error?: unknown; details?: FlattenLike };
  const message = typeof record.error === "string" && record.error.length > 0 ? record.error : fallback;
  const fields = record.details ? fieldErrorsFromFlatten(record.details) : {};
  return { message, fields };
}
