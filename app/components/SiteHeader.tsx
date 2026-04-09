"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = { href: string; label: string };

const primaryNavItems: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "How We Work" },
  { href: "/industries", label: "Industries" },
  { href: "/story", label: "Story" },
];

const footerNavItems: NavItem[] = [
  ...primaryNavItems,
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteHeader() {
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
        <div className="diq-navRow">
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
              {primaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`diq-navLink${pathname === item.href ? " active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/contact" className="diq-navCta">
                Talk to Us
              </Link>
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
              {footerNavItems.map((item) => (
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

            <div className="diq-sheetCta">
              <Link href="/contact" className="diq-navCta" onClick={() => setMenuOpen(false)}>
                Talk to Us
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

