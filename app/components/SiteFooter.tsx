import Link from "next/link";

import { getDb } from "@/lib/cloudflare-env";

import { BrandLogo } from "./BrandLogo";

export async function SiteFooter() {
  const prisma = getDb();
  const [settings, navItems, siteSettings] = await Promise.all([
    prisma.footerSettings.findUnique({ where: { id: 1 } }),
    prisma.footerNavItem.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  const logoUrl = siteSettings?.logoUrl ?? null;

  return (
    <footer className="diq-footer">
      <div className="diq-fBrand">
        <Link href="/" aria-label={`${siteSettings?.siteName ?? "DiQualia"} home`} className="diq-fLogo">
          <span className="diq-logo diq-logoLight">
            <BrandLogo variant="black" width={132} decorative src={logoUrl} />
          </span>
          <span className="diq-logo diq-logoDark">
            <BrandLogo variant="white" width={132} decorative src={logoUrl} />
          </span>
        </Link>
        {settings?.tagline1 && <div className="diq-fTag">{settings.tagline1}</div>}
        {settings?.tagline2 && <div className="diq-fSub">{settings.tagline2}</div>}
      </div>

      <nav className="diq-fLinks" aria-label="Footer">
        {navItems.map((item) => (
          <Link key={item.id} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      {settings && (
        <div className="diq-fCopy">
          {settings.copyright}
          <br />
          {settings.allRights}
          <br />
          {settings.domain}
        </div>
      )}
    </footer>
  );
}
