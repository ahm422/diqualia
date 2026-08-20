import { redirectAdminSection } from "@/lib/admin/section-redirect";

const ABOUT_SECTIONS = {
  hero: "/admin/about/hero",
  "built-for": "/admin/about/built-for",
  "where-next": "/admin/about/where-next",
} as const;

export default async function AboutAdminRedirect({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  redirectAdminSection(ABOUT_SECTIONS, section, "hero");
}
