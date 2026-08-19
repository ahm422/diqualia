"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./ThemeToggle";

type NavLink = { href: string; label: string };

type Props = {
  navItems: NavLink[];
  mobileNavItems: NavLink[];
  cta: { label: string; href: string } | null;
  logoUrl: string | null;
  siteName: string;
};

export function SiteHeaderClient({ navItems, mobileNavItems, cta, logoUrl, siteName }: Props) {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogId = useId();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key !== "Tab") return;

      const root = document.getElementById(dialogId);
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, dialogId]);

  useEffect(() => {
    if (menuOpen) return;
    lastActiveRef.current?.focus?.();
  }, [menuOpen]);

  return (
    <>
      <nav id="nav" className="diq-nav">
        <div className="diq-navInner">
          <div className="diq-navRow">
            <Link href="/" aria-label={`${siteName} home`} className="diq-navLogo">
              <span className="diq-logo diq-logoLight">
                <BrandLogo variant="black" width={132} decorative src={logoUrl} />
              </span>
              <span className="diq-logo diq-logoDark">
                <BrandLogo variant="white" width={132} decorative src={logoUrl} />
              </span>
            </Link>

            <div className="diq-navRight">
              <div className="diq-navLinks" aria-label="Primary">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`diq-navLink${pathname === item.href ? " active" : ""}`}
                  >
                    {item.label}
                  </Link>
                ))}
                {cta && (
                  <Button asChild variant="secondary" size="sm">
                    <Link href={cta.href}>{cta.label}</Link>
                  </Button>
                )}
              </div>

              <div className="diq-navMobile" aria-label="Mobile navigation">
                <div className="diq-themeToggle diq-themeToggleMobile">
                  <ThemeToggle />
                </div>
                <button
                  type="button"
                  className="diq-navMenuBtn"
                  aria-haspopup="dialog"
                  aria-controls={dialogId}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(true)}
                >
                  <span className="sr-only">Open menu</span>
                  <span aria-hidden className="diq-hamburger">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              </div>

              <div className="diq-themeToggle diq-themeToggleDesktop">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {menuOpen ? (
        <div className="diq-sheetOverlay" role="presentation" onClick={() => setMenuOpen(false)}>
          <div
            id={dialogId}
            className="diq-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="diq-sheetTop">
              <div className="diq-sheetTitle">Menu</div>
              <button
                type="button"
                className="diq-sheetClose"
                onClick={() => setMenuOpen(false)}
                ref={closeBtnRef}
              >
                <span className="sr-only">Close menu</span>
                <span aria-hidden>×</span>
              </button>
            </div>

            <div className="diq-sheetLinks" aria-label="Primary">
              {/* Mobile menu uses footer nav items (same 8-link set as current hardcoded behavior) */}
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`diq-sheetLink${pathname === item.href ? " active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {cta && (
              <div className="diq-sheetCta">
                <Button asChild variant="secondary" className="w-full">
                  <Link href={cta.href} onClick={() => setMenuOpen(false)}>
                    {cta.label}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
