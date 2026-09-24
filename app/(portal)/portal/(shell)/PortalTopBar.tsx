"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";

import { BrandLogo } from "@/app/components/BrandLogo";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { NavLinks } from "./NavLinks";
import { SignOutButton } from "./SignOutButton";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

/** Mobile top bar + focus-trapped nav drawer (Radix dialog via Sheet). */
export function PortalTopBar({ email }: { email: string }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const route = `${pathname}?${search}`;
  const [open, setOpen] = useState(false);
  const [openForRoute, setOpenForRoute] = useState(route);

  // Close the drawer whenever the route changes.
  if (openForRoute !== route) {
    setOpenForRoute(route);
    if (open) setOpen(false);
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 min-[961px]:hidden">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className={`inline-flex size-11 items-center justify-center rounded ${FOCUS}`}
      >
        <Menu size={20} />
      </button>

      <Link href="/portal" aria-label="DiQualia applicant portal" className={`rounded ${FOCUS}`}>
        <span className="diq-logo diq-logoLight">
          <BrandLogo variant="black" width={104} decorative />
        </span>
        <span className="diq-logo diq-logoDark">
          <BrandLogo variant="white" width={104} decorative />
        </span>
      </Link>

      <span className="ml-auto hidden truncate text-xs text-[var(--diq_mid)] min-[420px]:block">
        {email}
      </span>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="flex h-full w-72 max-w-[85vw] flex-col gap-0 border-[var(--diq_border)] bg-[var(--diq_deep)] p-0 sm:max-w-72"
        >
          <SheetTitle className="sr-only">Portal navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Your dashboard, identity, and sign out
          </SheetDescription>

          <div className="px-4 pt-6 pb-4">
            <span className="diq-logo diq-logoLight">
              <BrandLogo variant="black" width={130} decorative />
            </span>
            <span className="diq-logo diq-logoDark">
              <BrandLogo variant="white" width={130} decorative />
            </span>
            <p className="px-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
              Applicant
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto py-2">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>

          <div className="border-t border-[var(--diq_border)] p-4">
            <p className="truncate text-xs text-[var(--diq_mid)]" title={email}>
              {email}
            </p>
            <div className="mt-3">
              <SignOutButton />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
