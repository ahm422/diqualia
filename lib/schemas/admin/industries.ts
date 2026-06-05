import { z } from "zod";
import { shortStr, longStr } from "./shared";

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

export const industrySectorPatchSchema = z.object({
  name:    shortStr.optional(),
  visible: z.boolean().optional(),
  order:   z.number().int().min(0).optional(),
});
export type IndustrySectorPatch = z.infer<typeof industrySectorPatchSchema>;

export const industrySectorPostSchema = z.object({
  name: shortStr,
});
export type IndustrySectorPost = z.infer<typeof industrySectorPostSchema>;
