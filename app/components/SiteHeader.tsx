"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";

const ThemeToggle = dynamic(() => import("./ThemeToggle").then((m) => m.ThemeToggle), { ssr: false });

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/story", label: "Story" },
];

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-[200]"
      style={{
        background:
          "linear-gradient(to bottom, color-mix(in oklab, var(--bg) 92%, transparent), transparent)",
        borderBottom: "1px solid color-mix(in oklab, var(--border) 70%, transparent)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <Image src="/logo.svg" alt="DiQualia" width={76} height={18} priority />
          <span
            className="hidden sm:inline text-[13px] tracking-[0.18em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Marketing Intelligence &amp; Research
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] tracking-[0.22em] uppercase no-underline transition-colors"
              style={{ color: "var(--text-faint)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="mailto:intel@diqualia.com"
            className="hidden sm:inline-flex items-center rounded-full px-4 py-2 text-[11px] tracking-[0.22em] uppercase no-underline transition-colors"
            style={{
              color: "var(--gold)",
              border: "1px solid color-mix(in oklab, var(--gold) 45%, transparent)",
            }}
          >
            Enquire
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

