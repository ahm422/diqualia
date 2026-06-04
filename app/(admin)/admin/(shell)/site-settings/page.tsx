import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

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
      <h1 className="font-sans text-2xl font-medium mb-8">Site Settings</h1>
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
