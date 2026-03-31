"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const ThemeToggle = dynamic(() => import("./ThemeToggle").then((m) => m.ThemeToggle), { ssr: false });

const navItems = [
  { href: "/services", label: "Services" },
  { href: "/story", label: "Approach" },
  { href: "/services", label: "Industries" },
  { href: "/story", label: "Insights" },
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
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 no-underline">
          <Image src="/logo.svg" alt="DiQualia" width={86} height={21} priority />
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <nav className="flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="text-[10px] tracking-[0.28em] uppercase no-underline transition-colors text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="hidden sm:inline-flex rounded-full border-primary/40 text-primary hover:bg-accent hover:text-primary"
          >
            <a href="mailto:intel@diqualia.com">Enquire</a>
          </Button>
          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full md:hidden"
                aria-label="Open navigation menu"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden className="text-primary">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[85vw] sm:max-w-sm">
              <SheetHeader>
                <SheetTitle className="tracking-[0.16em] uppercase text-xs text-muted-foreground">
                  Menu
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 grid gap-3">
                {navItems.map((item) => (
                  <SheetClose asChild key={`${item.href}-${item.label}`}>
                    <Link
                      href={item.href}
                      className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="grid gap-3">
                <SheetClose asChild>
                  <Button asChild className="w-full rounded-full">
                    <a href="mailto:intel@diqualia.com">Enquire</a>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

