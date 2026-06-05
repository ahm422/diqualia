import { z } from "zod";
import { shortStr, longStr, urlStr, labelStr, statStr } from "./shared";

export const homeHeroPatchSchema = z.object({
  eyebrow:       shortStr.optional(),
  headlineLine1: shortStr.optional(),
  headlineLine2: shortStr.optional(),
  headlineLine3: shortStr.optional(),
  body:          longStr.optional(),
  btn1Label:     labelStr.optional(),
  btn1Href:      urlStr.optional(),
  btn2Label:     labelStr.optional(),
  btn2Href:      urlStr.optional(),
  stat1Label:    labelStr.optional(),
  stat1Value:    statStr.optional(),
  stat2Label:    labelStr.optional(),
  stat2Value:    statStr.optional(),
  stat3Label:    labelStr.optional(),
  stat3Value:    statStr.optional(),
});
export type HomeHeroPatch = z.infer<typeof homeHeroPatchSchema>;

export const homeMarqueeItemPatchSchema = z.object({
  text:  shortStr.optional(),
  order: z.number().int().min(0).optional(),
});
export type HomeMarqueeItemPatch = z.infer<typeof homeMarqueeItemPatchSchema>;

export const homeMarqueeItemPostSchema = z.object({
  text: shortStr,
});
export type HomeMarqueeItemPost = z.infer<typeof homeMarqueeItemPostSchema>;

export const homeExploreSectionPatchSchema = z.object({
  eyebrow:       shortStr.optional(),
  headlineLine1: shortStr.optional(),
  headlineLine2: shortStr.optional(),
  body:          longStr.optional(),
});
export type HomeExploreSectionPatch = z.infer<typeof homeExploreSectionPatchSchema>;

export const homeExploreCardPatchSchema = z.object({
  href:         urlStr.optional(),
  title:        shortStr.optional(),
  body:         longStr.optional(),
  sectionLabel: shortStr.optional().nullable(),
  visible:      z.boolean().optional(),
  order:        z.number().int().min(0).optional(),
});
export type HomeExploreCardPatch = z.infer<typeof homeExploreCardPatchSchema>;

export const homeExploreCardPostSchema = z.object({
  href:  urlStr,
  title: shortStr,
  body:  longStr,
});
export type HomeExploreCardPost = z.infer<typeof homeExploreCardPostSchema>;

export const homeWhereNextPatchSchema = z.object({
  eyebrow:  shortStr.optional(),
  headline: shortStr.optional(),
  body:     longStr.optional(),
  btnLabel: labelStr.optional(),
  btnHref:  urlStr.optional(),
});
export type HomeWhereNextPatch = z.infer<typeof homeWhereNextPatchSchema>;
