import Link from "next/link";

import { BrandLogo } from "./BrandLogo";

export function SiteFooter() {
  return (
    <footer className="diq-footer">
      <div className="diq-fBrand">
        <Link href="/" aria-label="Diqualia home" className="diq-fLogo">
          <span className="diq-logo diq-logoLight">
            <BrandLogo variant="black" width={132} decorative />
          </span>
          <span className="diq-logo diq-logoDark">
            <BrandLogo variant="white" width={132} decorative />
          </span>
        </Link>
        <div className="diq-fTag">Marketing Intelligence &amp; Research</div>
        <div className="diq-fSub">Niche B2B · Data-Driven Strategy</div>
      </div>

      <nav className="diq-fLinks" aria-label="Footer">
        <Link href="/about">About</Link>
        <Link href="/services">Services</Link>
        <Link href="/process">How We Work</Link>
        <Link href="/industries">Industries</Link>
        <Link href="/story">Story</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>

      <div className="diq-fCopy">
        © 2026 DiQualia
        <br />
        All rights reserved
        <br />
        diqualia.com
      </div>
    </footer>
  );
}

