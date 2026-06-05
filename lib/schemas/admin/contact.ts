import { z } from "zod";
import { shortStr, longStr } from "./shared";

export const contactPagePatchSchema = z.object({
  eyebrow:            shortStr.optional(),
  headlineLine1:      shortStr.optional(),
  headlineLine2:      shortStr.optional(),
  body:               longStr.optional(),
  emailLabel:         shortStr.optional(),
  emailType:          shortStr.optional(),
  email:              shortStr.optional(),
  emailCopy:          longStr.optional(),
  whatToIncludeItems: z.array(z.string().min(1).max(500)).optional(),
  expectationEyebrow: shortStr.optional(),
  expectationText:    longStr.optional(),
});
export type ContactPagePatch = z.infer<typeof contactPagePatchSchema>;
