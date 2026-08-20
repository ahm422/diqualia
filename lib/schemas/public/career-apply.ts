import { z } from "zod";

import { CNIC_INPUT_RE, isPakistanNationality, normalizeCnic } from "@/lib/cnic";

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export const MIME_BY_EXT: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

export const PHOTO_MIME_BY_EXT: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
};

export const ALLOWED_RESUME_EXT = new Set(Object.keys(MIME_BY_EXT));
export const ALLOWED_PHOTO_EXT = new Set(Object.keys(PHOTO_MIME_BY_EXT));

export const ALLOWED_RESUME_MIME = new Set([
  ...Object.values(MIME_BY_EXT).flat(),
  "application/octet-stream",
]);

export const ALLOWED_PHOTO_MIME = new Set([
  ...Object.values(PHOTO_MIME_BY_EXT).flat(),
  "application/octet-stream",
]);

export const RESUME_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const PHOTO_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

export const GENDER_VALUES = ["female", "male", "other", "prefer_not_to_say"] as const;
export const MARITAL_VALUES = ["single", "married", "divorced", "widowed"] as const;
export const QUALIFICATION_VALUES = [
  "matric",
  "intermediate",
  "bachelor",
  "master",
  "mphil",
  "phd",
  "other",
] as const;

const optionalText = z.string().trim().max(200).optional().or(z.literal(""));
const optionalLong = z.string().trim().max(10000).optional().or(z.literal(""));

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE_RE.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.toISOString().slice(0, 10) !== value) return null;
  return parsed;
}

function todayLocalIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysIso(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function ageYears(dobIso: string, onIso: string): number {
  const [y, m, d] = dobIso.split("-").map(Number);
  const [oy, om, od] = onIso.split("-").map(Number);
  let age = oy - y;
  if (om < m || (om === m && od < d)) age -= 1;
  return age;
}

const declarationAcceptedSchema = z
  .union([z.literal(true), z.literal("true"), z.literal("on"), z.literal("1")])
  .transform(() => true as const);

export const CareerApplyFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(1).max(50),
    jobSlug: z.string().trim().max(200).optional().or(z.literal("")),
    jobOpeningId: z.string().trim().max(20).optional().or(z.literal("")),
    coverNote: optionalLong,
    website: optionalText,
    fatherOrHusbandName: optionalText,
    dateOfBirth: z.string().trim().min(1),
    gender: z.enum(GENDER_VALUES),
    maritalStatus: z.enum(MARITAL_VALUES).optional().or(z.literal("")),
    cnic: optionalText,
    nationality: z.string().trim().min(1).max(80),
    currentAddress: z.string().trim().min(1).max(500),
    city: z.string().trim().min(1).max(120),
    highestQualification: z.enum(QUALIFICATION_VALUES),
    fieldOfStudy: optionalText,
    institutionName: optionalText,
    yearOfCompletion: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce.number().int().min(1950).max(2100).optional(),
    ),
    yearsOfExperience: z.coerce.number().int().min(0).max(80),
    currentEmployer: optionalText,
    currentJobTitle: optionalText,
    keySkills: z.string().trim().min(1).max(4000),
    noticePeriodDays: z.coerce.number().int().min(0).max(3650),
    expectedSalary: z.coerce.number().int().positive().max(1_000_000_000),
    availableFrom: z.string().trim().min(1),
    declarationAccepted: declarationAcceptedSchema,
  })
  .superRefine((data, ctx) => {
    const dob = parseIsoDate(data.dateOfBirth);
    if (!dob) {
      ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Enter a valid date of birth." });
    } else {
      const today = todayLocalIso();
      if (data.dateOfBirth > today) {
        ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Date of birth cannot be in the future." });
      } else if (ageYears(data.dateOfBirth, today) < 16) {
        ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "You must be at least 16 years old." });
      }
    }

    const available = parseIsoDate(data.availableFrom);
    if (!available) {
      ctx.addIssue({ code: "custom", path: ["availableFrom"], message: "Enter a valid available-from date." });
    } else {
      const min = addDaysIso(todayLocalIso(), -1);
      if (data.availableFrom < min) {
        ctx.addIssue({
          code: "custom",
          path: ["availableFrom"],
          message: "Available-from cannot be more than one day in the past.",
        });
      }
    }

    const cnicRaw = data.cnic?.trim() ?? "";
    if (isPakistanNationality(data.nationality)) {
      if (!cnicRaw) {
        ctx.addIssue({ code: "custom", path: ["cnic"], message: "CNIC is required for Pakistani applicants." });
      } else if (!CNIC_INPUT_RE.test(cnicRaw) || !normalizeCnic(cnicRaw)) {
        ctx.addIssue({
          code: "custom",
          path: ["cnic"],
          message: "Enter a 13-digit CNIC, with or without dashes.",
        });
      }
    } else if (cnicRaw && (!CNIC_INPUT_RE.test(cnicRaw) || !normalizeCnic(cnicRaw))) {
      ctx.addIssue({
        code: "custom",
        path: ["cnic"],
        message: "Enter a 13-digit CNIC, with or without dashes.",
      });
    }
  })
  .transform((data) => ({
    ...data,
    cnic: data.cnic?.trim() ? normalizeCnic(data.cnic) : null,
    fatherOrHusbandName: data.fatherOrHusbandName?.trim() ? data.fatherOrHusbandName.trim() : null,
    maritalStatus: data.maritalStatus?.trim() ? data.maritalStatus : null,
    coverNote: data.coverNote?.trim() ? data.coverNote.trim() : null,
    fieldOfStudy: data.fieldOfStudy?.trim() ? data.fieldOfStudy.trim() : null,
    institutionName: data.institutionName?.trim() ? data.institutionName.trim() : null,
    currentEmployer: data.currentEmployer?.trim() ? data.currentEmployer.trim() : null,
    currentJobTitle: data.currentJobTitle?.trim() ? data.currentJobTitle.trim() : null,
    yearOfCompletion: data.yearOfCompletion ?? null,
  }));

export type CareerApplyFields = z.infer<typeof CareerApplyFieldsSchema>;

function extensionFromName(file: File): string {
  const name = file.name.toLowerCase();
  const match = name.match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function resumeExtension(file: File): string | null {
  const ext = extensionFromName(file);
  if (!(ext in MIME_BY_EXT)) return null;

  const mime = (file.type || "").toLowerCase();
  if (!mime || mime === "application/octet-stream") return ext;
  const known = Object.values(MIME_BY_EXT).flat();
  if (!known.includes(mime)) return null;
  if (!MIME_BY_EXT[ext].includes(mime)) return null;
  return ext;
}

export function photoExtension(file: File): string | null {
  const ext = extensionFromName(file);
  if (!(ext in PHOTO_MIME_BY_EXT)) return null;

  const mime = (file.type || "").toLowerCase();
  if (!mime || mime === "application/octet-stream") return ext;
  const known = Object.values(PHOTO_MIME_BY_EXT).flat();
  if (!known.includes(mime)) return null;
  if (!PHOTO_MIME_BY_EXT[ext].includes(mime)) return null;
  return ext;
}

export type ResumeCheck =
  | { ok: true; ext: string }
  | { ok: false; reason: "required" | "too_large" | "type" };

export type PhotoCheck = ResumeCheck;

export function classifyResume(file: File | null): ResumeCheck {
  if (!file || file.size === 0) return { ok: false, reason: "required" };
  if (file.size > MAX_RESUME_BYTES) return { ok: false, reason: "too_large" };
  const ext = resumeExtension(file);
  if (!ext) return { ok: false, reason: "type" };
  return { ok: true, ext };
}

export function classifyPhoto(file: File | null): PhotoCheck {
  if (!file || file.size === 0) return { ok: false, reason: "required" };
  if (file.size > MAX_PHOTO_BYTES) return { ok: false, reason: "too_large" };
  const ext = photoExtension(file);
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

export function photoFileError(file: File | null): string | null {
  const result = classifyPhoto(file);
  if (result.ok) return null;
  if (result.reason === "required") return "Photograph is required.";
  if (result.reason === "too_large") return "Photograph must be 2 MB or smaller.";
  return "Photograph must be JPG, PNG, or WebP.";
}
