import { z } from "zod";

export const ContactBodySchema = z
  .object({
    email: z.string().trim().email().max(254).optional().or(z.literal("")),
    name: z.string().trim().min(1).max(200).optional().or(z.literal("")),
    message: z.string().trim().min(1).max(5000).optional().or(z.literal("")),
    source: z.string().trim().min(1).max(100).optional().or(z.literal("")),
    website: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    const hasEmail = typeof val.email === "string" && val.email.trim().length > 0;
    const hasMessage = typeof val.message === "string" && val.message.trim().length > 0;
    if (!hasEmail && !hasMessage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least one of email or message.",
        path: ["email"],
      });
    }
  });

export type ContactBody = z.infer<typeof ContactBodySchema>;
