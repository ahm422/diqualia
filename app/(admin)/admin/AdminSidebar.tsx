"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ExternalLink, Menu } from "lucide-react";

import { BrandLogo } from "@/app/components/BrandLogo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  ADMIN_NAV,
  filterAdminNav,
  findActiveGroupId,
  isLeafActive,
  type NavGroup,
} from "./adminNav";
import { useAdminSession } from "./AdminSessionProvider";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

export function AdminSidebar() {
  return (
    <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-[var(--diq_border)] bg-[var(--diq_deep)] min-[961px]:flex">
      <AdminNavBody idPrefix="desktop" />
    </aside>
  );
}

export function AdminMobileHeader() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const route = `${pathname}?${search}`;
  const [open, setOpen] = useState(false);
  const [openForRoute, setOpenForRoute] = useState(route);
  if (openForRoute !== route) {
    setOpenForRoute(route);
    if (open) setOpen(false);
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 min-[961px]:hidden">
      <button
        type="button"
        className={`inline-flex size-11 items-center justify-center rounded ${FOCUS}`}
        aria-label="Open admin navigation"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>
      <Link href="/admin" aria-label="DiQualia admin dashboard" className={`rounded ${FOCUS}`}>
        <span className="diq-logo diq-logoLight">
          <BrandLogo variant="black" width={110} decorative />
        </span>
        <span className="diq-logo diq-logoDark">
          <BrandLogo variant="white" width={110} decorative />
        </span>
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="flex h-full w-72 max-w-[85vw] flex-col gap-0 border-[var(--diq_border)] bg-[var(--diq_deep)] p-0 sm:max-w-72"
        >
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SheetDescription className="sr-only">CMS sections and settings</SheetDescription>
          <AdminNavBody idPrefix="mobile" onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}

function AdminNavBody({
  idPrefix,
  onNavigate,
}: {
  idPrefix: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const session = useAdminSession();
  const nav = filterAdminNav(ADMIN_NAV, session.permissions);
  const currentGroupId = findActiveGroupId(pathname, searchParams, nav);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
  }

  return (
    <>
      <div className="px-4 pt-6 pb-4">
        <Link
          href="/admin"
          aria-label="DiQualia admin dashboard"
          className={`flex flex-col gap-1 rounded ${FOCUS}`}
          onClick={onNavigate}
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
          key={`${idPrefix}-${currentGroupId ?? "none"}`}
          idPrefix={idPrefix}
          groups={nav}
          currentGroupId={currentGroupId}
          pathname={pathname}
          searchParams={searchParams}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="border-t border-[var(--diq_border)] px-3 py-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex min-h-11 items-center gap-2 rounded px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--diq_panel)] hover:text-[var(--foreground)] ${FOCUS}`}
        >
          <ExternalLink size={14} />
          Preview site
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className={`mt-0.5 min-h-11 w-full rounded px-3 py-2 text-left text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--diq_panel)] hover:text-[var(--foreground)] ${FOCUS}`}
        >
          Logout
        </button>
      </div>
    </>
  );
}

function NavTree({
  idPrefix,
  groups,
  currentGroupId,
  pathname,
  searchParams,
  onNavigate,
}: {
  idPrefix: string;
  groups: NavGroup[];
  currentGroupId: string | null;
  pathname: string;
  searchParams: Pick<URLSearchParams, "get">;
  onNavigate?: () => void;
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
      {groups.map((group) => (
        <NavGroupItem
          key={group.id}
          idPrefix={idPrefix}
          group={group}
          expanded={expanded.has(group.id)}
          pathname={pathname}
          searchParams={searchParams}
          onToggle={() => toggleGroup(group.id)}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}

function NavGroupItem({
  idPrefix,
  group,
  expanded,
  pathname,
  searchParams,
  onToggle,
  onNavigate,
}: {
  idPrefix: string;
  group: NavGroup;
  expanded: boolean;
  pathname: string;
  searchParams: Pick<URLSearchParams, "get">;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const Icon = group.icon;
  const panelId = `admin-nav-${idPrefix}-${group.id}`;

  return (
    <li>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className={`flex min-h-11 w-full items-center gap-2 rounded px-2 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--diq_panel)] ${FOCUS}`}
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
                onClick={onNavigate}
                className={[
                  "block min-h-11 rounded-r py-1.5 pr-2 pl-8 text-[13px] leading-[2.2] transition-colors",
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
