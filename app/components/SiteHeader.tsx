"use client";

import Link from "next/link";

import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "How We Work" },
  { href: "#industries", label: "Industries" },
];

export function SiteHeader() {
  return (
    <nav id="nav" className="diq-nav">
      <Link href="/" aria-label="Diqualia home" className="diq-navLogo">
        <span className="diq-logo diq-logoLight">
          <BrandLogo variant="black" width={132} decorative />
        </span>
        <span className="diq-logo diq-logoDark">
          <BrandLogo variant="white" width={132} decorative />
        </span>
      </Link>

      <div className="diq-navRight">
        <div className="diq-navLinks" aria-label="Primary">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="diq-navLink">
              {item.label}
            </a>
          ))}
          <a href="#contact" className="diq-navCta">
            Talk to Us
          </a>
        </div>

        <div className="diq-themeToggle">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

