import { redirectAdminSection } from "@/lib/admin/section-redirect";

const CAREER_SECTIONS = {
  hero: "/admin/careers/hero",
  culture: "/admin/careers/culture",
  benefits: "/admin/careers/benefits",
  apply: "/admin/careers/apply",
} as const;

export default async function CareersAdminRedirect({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  redirectAdminSection(CAREER_SECTIONS, section, "hero");
}
