import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin";

import { SiteSettingsEditor } from "./SiteSettingsEditor";

export default async function SiteSettingsPage() {
  await requireAdmin();

  const [siteSettings, navItems, cta, footer, footerNav] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.navItem.findMany({ orderBy: { order: "asc" } }),
    prisma.ctaButton.findUnique({ where: { id: 1 } }),
    prisma.footerSettings.findUnique({ where: { id: 1 } }),
    prisma.footerNavItem.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Logo, navigation, CTA button, and footer" />
      <SiteSettingsEditor
        initialSiteSettings={siteSettings}
        initialNavItems={navItems}
        initialCta={cta}
        initialFooter={footer}
        initialFooterNav={footerNav}
      />
    </div>
  );
}
