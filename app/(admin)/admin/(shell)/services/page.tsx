import { redirectAdminSection } from "@/lib/admin/section-redirect";

const SERVICES_SECTIONS = {
  intro: "/admin/services/intro",
  sections: "/admin/services/sections",
} as const;

export default async function ServicesAdminRedirect({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  redirectAdminSection(SERVICES_SECTIONS, section, "intro");
}
