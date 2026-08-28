import { redirectAdminSection } from "@/lib/admin/section-redirect";
import { requirePermission } from "@/lib/auth/require-admin";

const HOME_SECTIONS = {
  hero: "/admin/home/hero",
  marquee: "/admin/home/marquee",
  explore: "/admin/home/explore",
  "where-next": "/admin/home/where-next",
} as const;

export default async function HomeAdminRedirect({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  await requirePermission("cms.view");
  const { section } = await searchParams;
  redirectAdminSection(HOME_SECTIONS, section, "hero");
}
