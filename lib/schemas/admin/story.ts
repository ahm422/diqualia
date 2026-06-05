import { z } from "zod";
import { shortStr, longStr } from "./shared";

export const storyPagePatchSchema = z.object({
  eyebrow:        shortStr.optional(),
  headlineLine1:  shortStr.optional(),
  headlineLine2:  shortStr.optional(),
  headlineLine3:  shortStr.optional(),
  body:           longStr.optional(),
  dxNum1:         shortStr.optional(),
  dxTitle1:       shortStr.optional(),
  dxBody1:        longStr.optional(),
  dxNum2:         shortStr.optional(),
  dxTitle2:       shortStr.optional(),
  dxBody2:        longStr.optional(),
  dxTagline:      longStr.optional(),
  manifestoItems: z.array(z.string().min(1).max(2000)).optional(),
});
export type StoryPagePatch = z.infer<typeof storyPagePatchSchema>;
