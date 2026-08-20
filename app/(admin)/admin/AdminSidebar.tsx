"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ExternalLink } from "lucide-react";

import { BrandLogo } from "@/app/components/BrandLogo";

import {
  ADMIN_NAV,
  findActiveGroupId,
  isLeafActive,
  type NavGroup,
} from "./adminNav";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentGroupId = findActiveGroupId(pathname, searchParams);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[var(--diq_border)] bg-[var(--diq_deep)]">
      <div className="px-4 pt-6 pb-4">
        <Link
          href="/admin"
          aria-label="DiQualia admin dashboard"
          className={`flex flex-col gap-1 rounded ${FOCUS}`}
        >
          <span className="diq-logo diq-logoLight">
            <BrandLogo variant="black" width={140} decorative />
          </span>
          <span className="diq-logo diq-logoDark">
            <BrandLogo variant="white" width={140} decorative />
          </span>
          <span className="px-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
            Admin
          </span>
        </Link>
      </div>

      <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <NavTree
          key={currentGroupId ?? "none"}
          currentGroupId={currentGroupId}
          pathname={pathname}
          searchParams={searchParams}
        />
      </nav>

      <div className="border-t border-[var(--diq_border)] px-3 py-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 rounded px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--diq_panel)] hover:text-[var(--foreground)] ${FOCUS}`}
        >
          <ExternalLink size={14} />
          Preview site
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className={`mt-0.5 w-full rounded px-3 py-2 text-left text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--diq_panel)] hover:text-[var(--foreground)] ${FOCUS}`}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function NavTree({
  currentGroupId,
  pathname,
  searchParams,
}: {
  currentGroupId: string | null;
  pathname: string;
  searchParams: Pick<URLSearchParams, "get">;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => (currentGroupId ? new Set([currentGroupId]) : new Set()),
  );

  function toggleGroup(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {ADMIN_NAV.map((group) => (
        <NavGroupItem
          key={group.id}
          group={group}
          expanded={expanded.has(group.id)}
          pathname={pathname}
          searchParams={searchParams}
          onToggle={() => toggleGroup(group.id)}
        />
      ))}
    </ul>
  );
}

function NavGroupItem({
  group,
  expanded,
  pathname,
  searchParams,
  onToggle,
}: {
  group: NavGroup;
  expanded: boolean;
  pathname: string;
  searchParams: Pick<URLSearchParams, "get">;
  onToggle: () => void;
}) {
  const Icon = group.icon;
  const panelId = `admin-nav-${group.id}`;

  return (
    <li>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className={`flex w-full items-center gap-2 rounded px-2 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--diq_panel)] ${FOCUS}`}
      >
        <Icon size={16} className="shrink-0 text-[var(--muted-foreground)]" />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-[var(--muted-foreground)] transition-transform ${expanded ? "" : "-rotate-90"}`}
        />
      </button>
      <ul
        id={panelId}
        className={`mt-0.5 mb-1 flex-col gap-0.5 ${expanded ? "flex" : "hidden"}`}
      >
        {group.children.map((leaf) => {
          const active = isLeafActive(leaf, group, pathname, searchParams);
          return (
            <li key={leaf.href}>
              <Link
                href={leaf.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "block rounded-r py-1.5 pr-2 pl-8 text-[13px] transition-colors",
                  FOCUS,
                  active
                    ? "border-l-2 border-[var(--gold)] bg-[var(--muted)] font-medium text-[var(--foreground)]"
                    : "border-l-2 border-transparent text-[var(--muted-foreground)] hover:bg-[var(--diq_panel)] hover:text-[var(--foreground)]",
                ].join(" ")}
              >
                {leaf.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
