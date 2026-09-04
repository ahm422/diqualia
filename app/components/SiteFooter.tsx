import Link from "next/link";

import { getDb } from "@/lib/cloudflare-env";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SOCIAL_PROFILES,
} from "@/lib/site-config";

import { BrandLogo } from "./BrandLogo";
import { Container } from "./Container";

export async function SiteFooter() {
  const prisma = await getDb();
  const [settings, navItems, siteSettings] = await Promise.all([
    prisma.footerSettings.findUnique({ where: { id: 1 } }),
    prisma.footerNavItem.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  const logoUrl = siteSettings?.logoUrl ?? null;

  return (
    <footer className="diq-footer">
      <Container className="diq-footerInner">
        <div className="diq-fBrand">
          <Link href="/" aria-label={`${siteSettings?.siteName ?? "DiQualia"} home`} className="diq-fLogo">
            <span className="diq-logo diq-logoLight">
              <BrandLogo variant="black" width={132} src={logoUrl} />
            </span>
            <span className="diq-logo diq-logoDark">
              <BrandLogo variant="white" width={132} decorative src={logoUrl} />
            </span>
          </Link>
          {settings?.tagline1 && <div className="diq-fTag">{settings.tagline1}</div>}
          {settings?.tagline2 && <div className="diq-fSub">{settings.tagline2}</div>}

          <address className="diq-fContact">
            <a href={`tel:${CONTACT_PHONE.tel}`}>{CONTACT_PHONE.display}</a>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href={CONTACT_ADDRESS.mapUrl} target="_blank" rel="noreferrer">
              {CONTACT_ADDRESS.display}
            </a>
          </address>

          <div className="diq-fSocial">
            {SOCIAL_PROFILES.map((profile) => (
              <a key={profile.url} href={profile.url} target="_blank" rel="noreferrer">
                {profile.label}
              </a>
            ))}
          </div>
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
      </Container>
    </footer>
  );
}
