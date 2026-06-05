import { z } from "zod";
import { shortStr, longStr } from "./shared";

export const processPagePatchSchema = z.object({
  eyebrow:            shortStr.optional(),
  headlineLine1:      shortStr.optional(),
  headlineLine2:      shortStr.optional(),
  headlineLine3:      shortStr.optional(),
  body:               longStr.optional(),
  whereNextEyebrow:   shortStr.optional(),
  whereNextTitle1:    shortStr.optional(),
  whereNextTitle2:    shortStr.optional(),
  whereNextBody:      longStr.optional(),
});
export type ProcessPagePatch = z.infer<typeof processPagePatchSchema>;

export const processStepPatchSchema = z.object({
  stepLabel:  shortStr.optional(),
  stepNumber: shortStr.optional(),
  title:      shortStr.optional(),
  body:       longStr.optional(),
  order:      z.number().int().min(0).optional(),
});
export type ProcessStepPatch = z.infer<typeof processStepPatchSchema>;

export const processStepPostSchema = z.object({
  stepLabel:  shortStr,
  stepNumber: shortStr,
  title:      shortStr,
  body:       longStr,
});
export type ProcessStepPost = z.infer<typeof processStepPostSchema>;
