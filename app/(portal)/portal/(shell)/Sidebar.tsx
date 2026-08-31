import Link from "next/link";

import { BrandLogo } from "@/app/components/BrandLogo";
import { NavLinks } from "./NavLinks";
import { SignOutButton } from "./SignOutButton";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

/** Persistent desktop rail. Shown/hidden purely by CSS so there is no layout
 *  shift between routes; the 15rem width is always reserved at >= 961px. */
export function Sidebar({ email }: { email: string }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--diq_border)] bg-[var(--diq_deep)] min-[961px]:flex">
      <div className="px-4 pt-6 pb-4">
        <Link
          href="/portal"
          aria-label="DiQualia applicant portal"
          className={`flex flex-col gap-1 rounded ${FOCUS}`}
        >
          <span className="diq-logo diq-logoLight">
            <BrandLogo variant="black" width={130} decorative />
          </span>
          <span className="diq-logo diq-logoDark">
            <BrandLogo variant="white" width={130} decorative />
          </span>
          <span className="px-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
            Applicant
          </span>
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        <NavLinks />
      </div>

      <div className="border-t border-[var(--diq_border)] p-4">
        <p className="truncate text-xs text-[var(--diq_mid)]" title={email}>
          {email}
        </p>
        <div className="mt-3">
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
