import { redirect } from "next/navigation";

import { redirectAdminSection } from "@/lib/admin/section-redirect";
import { requireAdmin, requirePermission } from "@/lib/auth/require-admin";
import { hasPermission } from "@/lib/auth/session";

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
  const session = await requireAdmin();
  const { section } = await searchParams;

  // The Careers group mixes CMS leaves with the openings/applications screens.
  // Land on the first sub-screen this session can actually reach.
  if (hasPermission(session, "cms.view")) {
    redirectAdminSection(CAREER_SECTIONS, section, "hero");
  }
  if (hasPermission(session, "careers.openings.manage")) {
    redirect("/admin/careers/openings");
  }
  if (hasPermission(session, "careers.applications.view")) {
    redirect("/admin/careers/applications");
  }
  // No Careers access at all — force the standard forbidden redirect.
  await requirePermission("cms.view");
}
