import { z } from "zod";
import { shortStr, longStr, urlStr } from "./shared";

export const aboutHeroPatchSchema = z.object({
  eyebrow:  shortStr.optional(),
  headline: shortStr.optional(),
  body:     longStr.optional(),
});
export type AboutHeroPatch = z.infer<typeof aboutHeroPatchSchema>;

export const aboutBuiltForItemPatchSchema = z.object({
  title:       shortStr.optional(),
  description: longStr.optional(),
  order:       z.number().int().min(0).optional(),
});
export type AboutBuiltForItemPatch = z.infer<typeof aboutBuiltForItemPatchSchema>;

export const aboutBuiltForItemPostSchema = z.object({
  title:       shortStr,
  description: longStr,
});
export type AboutBuiltForItemPost = z.infer<typeof aboutBuiltForItemPostSchema>;

export const aboutWhereNextPatchSchema = z.object({
  eyebrow:  shortStr.optional(),
  headline: shortStr.optional(),
  btn1Label: z.string().min(1).max(100).optional(),
  btn1Href:  urlStr.optional(),
  btn2Label: z.string().min(1).max(100).optional(),
  btn2Href:  urlStr.optional(),
});
export type AboutWhereNextPatch = z.infer<typeof aboutWhereNextPatchSchema>;
