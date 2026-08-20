import { redirectAdminSection } from "@/lib/admin/section-redirect";

const INDUSTRIES_SECTIONS = {
  hero: "/admin/industries/hero",
  sectors: "/admin/industries/sectors",
  "where-next": "/admin/industries/where-next",
} as const;

export default async function IndustriesAdminRedirect({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  redirectAdminSection(INDUSTRIES_SECTIONS, section, "hero");
}
