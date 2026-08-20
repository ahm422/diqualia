import { redirectAdminSection } from "@/lib/admin/section-redirect";

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
  const { section } = await searchParams;
  redirectAdminSection(HOME_SECTIONS, section, "hero");
}
