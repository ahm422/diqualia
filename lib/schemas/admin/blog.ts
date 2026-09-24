import { z } from "zod";
import { shortStr } from "./shared";

export const blogSlugStr = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

export const blogExcerptStr = z.string().min(1).max(500);

// Body is sanitized HTML (TipTap editor output), which runs ~2x the size of the
// equivalent Markdown, so the cap is generous relative to the old 50k Markdown limit.
export const blogBodyStr = z.string().min(1).max(100000);

export const blogStatusEnum = z.enum(["draft", "published"]);

export const blogPostCreateSchema = z.object({
  slug: blogSlugStr,
  title: shortStr,
  excerpt: blogExcerptStr,
  body: blogBodyStr,
  coverImageUrl: z.string().url().optional().nullable(),
  status: blogStatusEnum.optional(),
});
export type BlogPostCreate = z.infer<typeof blogPostCreateSchema>;

export const blogPostPatchSchema = z.object({
  slug: blogSlugStr.optional(),
  title: shortStr.optional(),
  excerpt: blogExcerptStr.optional(),
  body: blogBodyStr.optional(),
  coverImageUrl: z.string().url().optional().nullable(),
  status: blogStatusEnum.optional(),
});
export type BlogPostPatch = z.infer<typeof blogPostPatchSchema>;
