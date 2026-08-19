import { z } from "zod";

import { blogSlugStr, blogBodyStr } from "./blog";
import { longStr, orderNum, shortStr } from "./shared";

export const jobTypeEnum = z.enum(["Full-time", "Part-time", "Contract", "Internship"]);

export const jobApplicationStatusEnum = z.enum(["new", "reviewing", "rejected", "hired"]);

export const stringList = z.array(z.string().min(1).max(500));

/** Optional short field: omit unchanged on PATCH; empty string stores null. */
const optionalNullShort = z
  .string()
  .max(200)
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    const trimmed = v.trim();
    return trimmed.length === 0 ? null : trimmed;
  });

export const careerPagePatchSchema = z.object({
  eyebrow: shortStr.optional(),
  headlineLine1: shortStr.optional(),
  headlineLine2: shortStr.optional(),
  body: longStr.optional(),
  cultureEyebrow: shortStr.optional(),
  cultureHeadline: shortStr.optional(),
  cultureBody: longStr.optional(),
  benefits: stringList.optional(),
  applyEyebrow: shortStr.optional(),
  applyHeadline: shortStr.optional(),
  applyBody: longStr.optional(),
});
export type CareerPagePatch = z.infer<typeof careerPagePatchSchema>;

export const jobOpeningCreateSchema = z.object({
  title: shortStr,
  slug: blogSlugStr.optional(),
  department: shortStr,
  location: shortStr,
  type: jobTypeEnum,
  description: blogBodyStr,
  requirements: stringList.optional(),
  responsibilities: stringList.optional(),
  niceToHave: stringList.optional().nullable(),
  seniority: optionalNullShort,
  salaryRange: optionalNullShort,
  remote: optionalNullShort,
  teamNote: optionalNullShort,
  visible: z.boolean().optional(),
  order: orderNum.optional(),
});
export type JobOpeningCreate = z.infer<typeof jobOpeningCreateSchema>;

export const jobOpeningPatchSchema = z.object({
  title: shortStr.optional(),
  slug: blogSlugStr.optional(),
  department: shortStr.optional(),
  location: shortStr.optional(),
  type: jobTypeEnum.optional(),
  description: blogBodyStr.optional(),
  requirements: stringList.optional(),
  responsibilities: stringList.optional(),
  niceToHave: stringList.optional().nullable(),
  seniority: optionalNullShort,
  salaryRange: optionalNullShort,
  remote: optionalNullShort,
  teamNote: optionalNullShort,
  visible: z.boolean().optional(),
  order: orderNum.optional(),
});
export type JobOpeningPatch = z.infer<typeof jobOpeningPatchSchema>;

export const jobApplicationPatchSchema = z.object({
  status: jobApplicationStatusEnum,
});
export type JobApplicationPatch = z.infer<typeof jobApplicationPatchSchema>;
