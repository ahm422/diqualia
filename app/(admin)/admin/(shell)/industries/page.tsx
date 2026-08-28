import { redirectAdminSection } from "@/lib/admin/section-redirect";
import { requirePermission } from "@/lib/auth/require-admin";

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
  await requirePermission("cms.view");
  const { section } = await searchParams;
  redirectAdminSection(INDUSTRIES_SECTIONS, section, "hero");
}
