"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin/careers", label: "Page", exact: true },
  { href: "/admin/careers/openings", label: "Openings" },
  { href: "/admin/careers/applications", label: "Applications" },
];

export function CareersSubNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--diq_border)] pb-4">
      {ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
              isActive
                ? "border border-[var(--gold)] text-[var(--gold)]"
                : "border border-[var(--diq_border)] text-[var(--diq_mid)] hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
