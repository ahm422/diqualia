import { z } from "zod";
import { shortStr, longStr, urlStr, labelStr } from "./shared";

export const siteSettingsPatchSchema = z.object({
  siteName: shortStr.optional(),
  logoUrl:  z.string().url().optional().nullable(),
});
export type SiteSettingsPatch = z.infer<typeof siteSettingsPatchSchema>;

export const navItemPatchSchema = z.object({
  href:    urlStr.optional(),
  label:   shortStr.optional(),
  visible: z.boolean().optional(),
  order:   z.number().int().min(0).optional(),
});
export type NavItemPatch = z.infer<typeof navItemPatchSchema>;

export const navItemPostSchema = z.object({
  href:  urlStr,
  label: shortStr,
});
export type NavItemPost = z.infer<typeof navItemPostSchema>;

export const ctaButtonPatchSchema = z.object({
  label:   labelStr.optional(),
  href:    urlStr.optional(),
  visible: z.boolean().optional(),
});
export type CtaButtonPatch = z.infer<typeof ctaButtonPatchSchema>;

export const footerSettingsPatchSchema = z.object({
  tagline1:  shortStr.optional(),
  tagline2:  shortStr.optional(),
  copyright: shortStr.optional(),
  allRights: shortStr.optional(),
  domain:    shortStr.optional(),
});
export type FooterSettingsPatch = z.infer<typeof footerSettingsPatchSchema>;

export const footerNavItemPatchSchema = z.object({
  href:  urlStr.optional(),
  label: shortStr.optional(),
  group: z.enum(["primary", "secondary"]).optional(),
  order: z.number().int().min(0).optional(),
});
export type FooterNavItemPatch = z.infer<typeof footerNavItemPatchSchema>;

export const footerNavItemPostSchema = z.object({
  href:  urlStr,
  label: shortStr,
  group: z.enum(["primary", "secondary"]),
});
export type FooterNavItemPost = z.infer<typeof footerNavItemPostSchema>;
