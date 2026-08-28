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

/** UTC-calendar Date for YYYY-MM-DD civil days. Never local midnight / toISOString(). */
export function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE_RE.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  const utc = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(utc.getTime())) return null;
  if (utc.getUTCFullYear() !== y || utc.getUTCMonth() !== m - 1 || utc.getUTCDate() !== d) {
    return null;
  }
  return utc;
}

export function todayLocalIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysIso(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

function refineDateOfBirth(dateOfBirth: string, ctx: z.RefinementCtx) {
  const dob = parseIsoDate(dateOfBirth);
  if (!dob) {
    ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Enter a valid date of birth." });
    return;
  }
  const today = todayLocalIso();
  if (dateOfBirth > today) {
    ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Date of birth cannot be in the future." });
  } else if (ageYears(dateOfBirth, today) < 16) {
    ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "You must be at least 16 years old." });
  }
}

function refineAvailableFrom(availableFrom: string, ctx: z.RefinementCtx) {
  const available = parseIsoDate(availableFrom);
  if (!available) {
    ctx.addIssue({ code: "custom", path: ["availableFrom"], message: "Enter a valid available-from date." });
    return;
  }
  const min = addDaysIso(todayLocalIso(), -1);
  if (availableFrom < min) {
    ctx.addIssue({
      code: "custom",
      path: ["availableFrom"],
      message: "Available-from cannot be more than one day in the past.",
    });
  }
}

// Accept the canonical dashed shape (12345-1234567-8) that the form now produces,
// OR any value that normalizes to 13 digits — draft-resume and direct API callers
// may still send bare digits.
function isValidCnicInput(cnicRaw: string): boolean {
  return CNIC_INPUT_RE.test(cnicRaw) || normalizeCnic(cnicRaw) != null;
}

function refineCnic(nationality: string, cnic: string | undefined, ctx: z.RefinementCtx) {
  const cnicRaw = cnic?.trim() ?? "";
  if (isPakistanNationality(nationality)) {
    if (!cnicRaw) {
      ctx.addIssue({ code: "custom", path: ["cnic"], message: "CNIC is required for Pakistani applicants." });
    } else if (!isValidCnicInput(cnicRaw)) {
      ctx.addIssue({
        code: "custom",
        path: ["cnic"],
        message: "Enter a 13-digit CNIC, with or without dashes.",
      });
    }
  } else if (cnicRaw && !isValidCnicInput(cnicRaw)) {
    ctx.addIssue({
      code: "custom",
      path: ["cnic"],
      message: "Enter a 13-digit CNIC, with or without dashes.",
    });
  }
}

const personalObject = {
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(1).max(50),
  fatherOrHusbandName: optionalText,
  dateOfBirth: z.string().trim().min(1),
  gender: z.enum(GENDER_VALUES),
  maritalStatus: z.enum(MARITAL_VALUES).optional().or(z.literal("")),
  cnic: optionalText,
  nationality: z.string().trim().min(1).max(80),
  currentAddress: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(120),
};

const educationObject = {
  highestQualification: z.enum(QUALIFICATION_VALUES),
  fieldOfStudy: optionalText,
  institutionName: optionalText,
  yearOfCompletion: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(1950).max(2100).optional(),
  ),
};

const professionalObject = {
  yearsOfExperience: z.coerce.number().int().min(0).max(80),
  currentEmployer: optionalText,
  currentJobTitle: optionalText,
  coverNote: optionalLong,
};

const otherObject = {
  keySkills: z.string().trim().min(1).max(4000),
  noticePeriodDays: z.coerce.number().int().min(0).max(3650),
  expectedSalary: z.coerce.number().int().positive().max(1_000_000_000),
  availableFrom: z.string().trim().min(1),
  declarationAccepted: declarationAcceptedSchema,
};

function nullIfBlank(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const CareerApplyPersonalSchema = z
  .object(personalObject)
  .superRefine((data, ctx) => {
    refineDateOfBirth(data.dateOfBirth, ctx);
    refineCnic(data.nationality, data.cnic, ctx);
  })
  .transform((data) => ({
    ...data,
    email: data.email.trim().toLowerCase(),
    cnic: data.cnic?.trim() ? normalizeCnic(data.cnic) : null,
    fatherOrHusbandName: nullIfBlank(data.fatherOrHusbandName),
    maritalStatus: data.maritalStatus?.trim() ? data.maritalStatus : null,
  }));

export const CareerApplyEducationSchema = z.object(educationObject).transform((data) => ({
  ...data,
  fieldOfStudy: nullIfBlank(data.fieldOfStudy),
  institutionName: nullIfBlank(data.institutionName),
  yearOfCompletion: data.yearOfCompletion ?? null,
}));

export const CareerApplyProfessionalSchema = z.object(professionalObject).transform((data) => ({
  ...data,
  coverNote: nullIfBlank(data.coverNote),
  currentEmployer: nullIfBlank(data.currentEmployer),
  currentJobTitle: nullIfBlank(data.currentJobTitle),
}));

export const CareerApplyOtherSchema = z
  .object(otherObject)
  .superRefine((data, ctx) => {
    refineAvailableFrom(data.availableFrom, ctx);
  });

export const CareerApplyFieldsSchema = z
  .object({
    ...personalObject,
    ...educationObject,
    ...professionalObject,
    ...otherObject,
    jobSlug: z.string().trim().max(200).optional().or(z.literal("")),
    jobOpeningId: z.string().trim().max(20).optional().or(z.literal("")),
    website: optionalText,
  })
  .superRefine((data, ctx) => {
    refineDateOfBirth(data.dateOfBirth, ctx);
    refineAvailableFrom(data.availableFrom, ctx);
    refineCnic(data.nationality, data.cnic, ctx);
  })
  .transform((data) => ({
    ...data,
    email: data.email.trim().toLowerCase(),
    cnic: data.cnic?.trim() ? normalizeCnic(data.cnic) : null,
    fatherOrHusbandName: nullIfBlank(data.fatherOrHusbandName),
    maritalStatus: data.maritalStatus?.trim() ? data.maritalStatus : null,
    coverNote: nullIfBlank(data.coverNote),
    fieldOfStudy: nullIfBlank(data.fieldOfStudy),
    institutionName: nullIfBlank(data.institutionName),
    currentEmployer: nullIfBlank(data.currentEmployer),
    currentJobTitle: nullIfBlank(data.currentJobTitle),
    yearOfCompletion: data.yearOfCompletion ?? null,
  }));

export type CareerApplyFields = z.infer<typeof CareerApplyFieldsSchema>;
export type CareerApplyPersonal = z.infer<typeof CareerApplyPersonalSchema>;
export type CareerApplyEducation = z.infer<typeof CareerApplyEducationSchema>;
export type CareerApplyProfessional = z.infer<typeof CareerApplyProfessionalSchema>;
export type CareerApplyOther = z.infer<typeof CareerApplyOtherSchema>;

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
