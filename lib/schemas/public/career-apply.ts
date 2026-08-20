import { z } from "zod";

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export const MIME_BY_EXT: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

export const ALLOWED_RESUME_EXT = new Set(Object.keys(MIME_BY_EXT));

export const ALLOWED_RESUME_MIME = new Set([
  ...Object.values(MIME_BY_EXT).flat(),
  "application/octet-stream",
]);

export const RESUME_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const CareerApplyFieldsSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  jobSlug: z.string().trim().max(200).optional().or(z.literal("")),
  jobOpeningId: z.string().trim().max(20).optional().or(z.literal("")),
  coverNote: z.string().trim().max(10000).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
});

export type CareerApplyFields = z.infer<typeof CareerApplyFieldsSchema>;

export function resumeExtension(file: File): string | null {
  const name = file.name.toLowerCase();
  const match = name.match(/\.([a-z0-9]+)$/);
  const ext = match?.[1] ?? "";
  if (!(ext in MIME_BY_EXT)) return null;

  const mime = (file.type || "").toLowerCase();
  if (!mime || mime === "application/octet-stream") return ext;
  const known = Object.values(MIME_BY_EXT).flat();
  if (!known.includes(mime)) return null;
  if (!MIME_BY_EXT[ext].includes(mime)) return null;
  return ext;
}

export type ResumeCheck =
  | { ok: true; ext: string }
  | { ok: false; reason: "required" | "too_large" | "type" };

export function classifyResume(file: File | null): ResumeCheck {
  if (!file || file.size === 0) return { ok: false, reason: "required" };
  if (file.size > MAX_RESUME_BYTES) return { ok: false, reason: "too_large" };
  const ext = resumeExtension(file);
  if (!ext) return { ok: false, reason: "type" };
  return { ok: true, ext };
}

export function resumeFileError(file: File | null): string | null {
  const result = classifyResume(file);
  if (result.ok) return null;
  if (result.reason === "required") return "Resume is required.";
  if (result.reason === "too_large") return "Resume must be 5 MB or smaller.";
  return "Resume must be PDF, DOC, or DOCX.";
}
