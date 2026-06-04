import { prisma } from "@/lib/prisma";

import { SiteHeaderClient } from "./SiteHeaderClient";

export async function SiteHeader() {
  const [navItems, mobileNavItems, cta, settings] = await Promise.all([
    prisma.navItem.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    prisma.footerNavItem.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] }),
    prisma.ctaButton.findUnique({ where: { id: 1 } }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <SiteHeaderClient
      navItems={navItems.map(({ href, label }) => ({ href, label }))}
      mobileNavItems={mobileNavItems.map(({ href, label }) => ({ href, label }))}
      cta={cta?.visible ? { label: cta.label, href: cta.href } : null}
      logoUrl={settings?.logoUrl ?? null}
      siteName={settings?.siteName ?? "DiQualia"}
    />
  );
}
