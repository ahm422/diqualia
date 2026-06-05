import { z } from "zod";
import { shortStr, longStr, urlStr, labelStr, statStr } from "./shared";

export const servicesPagePatchSchema = z.object({
  eyebrow:    shortStr.optional(),
  headline:   shortStr.optional(),
  body:       longStr.optional(),
  stat1Value: statStr.optional(),  stat1Label: labelStr.optional(),
  stat2Value: statStr.optional(),  stat2Label: labelStr.optional(),
  stat3Value: statStr.optional(),  stat3Label: labelStr.optional(),
  stat4Value: statStr.optional(),  stat4Label: labelStr.optional(),
  ctaEyebrow:   shortStr.optional(),
  ctaHeadline:  shortStr.optional(),
  ctaBody:      longStr.optional(),
  ctaBtn1Label: labelStr.optional(),
  ctaBtn1Href:  urlStr.optional(),
  ctaEmailHref: z.string().min(1).max(254).optional(),
});
export type ServicesPagePatch = z.infer<typeof servicesPagePatchSchema>;

export const serviceSectionPatchSchema = z.object({
  tabId:     z.string().min(1).max(50).optional(),
  eyebrow:   shortStr.optional(),
  title:     shortStr.optional(),
  body:      longStr.optional(),
  cardTitle: shortStr.optional().nullable(),
  cardBody:  longStr.optional().nullable(),
  order:     z.number().int().min(0).optional(),
});
export type ServiceSectionPatch = z.infer<typeof serviceSectionPatchSchema>;

export const serviceSectionPostSchema = z.object({
  tabId:     z.string().min(1).max(50),
  eyebrow:   shortStr,
  title:     shortStr,
  body:      longStr,
  cardTitle: shortStr.optional(),
  cardBody:  longStr.optional(),
});
export type ServiceSectionPost = z.infer<typeof serviceSectionPostSchema>;

export const serviceItemPatchSchema = z.object({
  groupLabel: shortStr.optional().nullable(),
  title:      shortStr.optional(),
  body:       longStr.optional().nullable(),
  order:      z.number().int().min(0).optional(),
});
export type ServiceItemPatch = z.infer<typeof serviceItemPatchSchema>;

export const serviceItemPostSchema = z.object({
  groupLabel: shortStr.optional(),
  title:      shortStr,
  body:       longStr.optional(),
});
export type ServiceItemPost = z.infer<typeof serviceItemPostSchema>;
