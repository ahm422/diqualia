import { z } from "zod";
import { shortStr, longStr } from "./shared";
import { blogSlugStr } from "./blog";

const optionalShort = z.string().max(200).optional().nullable();
const optionalLong = z.string().max(5000).optional().nullable();
const optionalUrl = z.union([z.string().url(), z.literal("")]).optional().nullable();
const hrefStr = z.string().min(1).max(500);

export const whyPointSchema = z.object({
  title: shortStr,
  body: longStr,
});

export const caseStudyRefSchema = z.object({
  label: shortStr,
  href: hrefStr,
});

export const industriesPagePatchSchema = z.object({
  eyebrow:            shortStr.optional(),
  headlineLine1:      shortStr.optional(),
  headlineLine2:      shortStr.optional(),
  body:               longStr.optional(),
  sectorsLabel:       shortStr.optional(),
  sectorsDescription: longStr.optional(),
  sidebarLabel:       shortStr.optional(),
  sidebarCopy:        longStr.optional(),
  whereNextEyebrow:   shortStr.optional(),
  whereNextTitle1:    shortStr.optional(),
  whereNextTitle2:    shortStr.optional(),
  whereNextBody:      longStr.optional(),
});
export type IndustriesPagePatch = z.infer<typeof industriesPagePatchSchema>;

export const industrySectorPostSchema = z.object({
  name: shortStr,
});
export type IndustrySectorPost = z.infer<typeof industrySectorPostSchema>;

export const industrySectorPatchSchema = z.object({
  name:          shortStr.optional(),
  visible:       z.boolean().optional(),
  order:         z.number().int().min(0).optional(),
  slug:          blogSlugStr.optional(),
  eyebrow:       optionalShort,
  headline:      optionalShort,
  body:          optionalLong,
  heroImageUrl:  optionalUrl,
  whyPoints:     z.array(whyPointSchema).optional().nullable(),
  caseStudyRefs: z.array(caseStudyRefSchema).optional().nullable(),
});
export type IndustrySectorPatch = z.infer<typeof industrySectorPatchSchema>;
