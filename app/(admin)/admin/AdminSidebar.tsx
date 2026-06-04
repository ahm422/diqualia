"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/home", label: "Home" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/process", label: "Process" },
  { href: "/admin/industries", label: "Industries" },
  { href: "/admin/story", label: "Story" },
  { href: "/admin/contact", label: "Contact" },
  { href: "/admin/site-settings", label: "Site Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col min-h-screen border-r border-[var(--diq_border)] bg-[var(--diq_deep)] py-8 px-4 gap-1">
      <div className="font-mono text-xs tracking-widest text-[var(--gold)] uppercase mb-8 px-2">
        DiQualia Admin
      </div>
      {NAV.map(({ href, label }) => {
        const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={[
              "rounded px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-[var(--gold)] text-[var(--ink)] font-medium"
                : "text-[var(--diq_mid)] hover:text-[var(--foreground)] hover:bg-[var(--diq_panel)]",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
      <div className="flex-1" />
      <button
        onClick={handleLogout}
        className="mt-4 rounded px-3 py-2 text-sm text-[var(--diq_mid)] hover:text-[var(--foreground)] hover:bg-[var(--diq_panel)] text-left transition-colors"
      >
        Logout
      </button>
    </aside>
  );
}
