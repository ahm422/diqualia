import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  House,
  Info,
  Layers,
  ListOrdered,
  Mail,
  Newspaper,
  Settings,
} from "lucide-react";

import type { PermissionKey } from "@/lib/auth/session";

export type NavLeafMatch = "exact" | "prefix" | "section";

export type NavLeaf = {
  href: string;
  label: string;
  match?: NavLeafMatch;
  permission?: PermissionKey;
};

export type NavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
};

export const ADMIN_NAV: NavGroup[] = [
  {
    id: "home",
    label: "Home",
    icon: House,
    children: [
      { href: "/admin/home/hero", label: "Hero", permission: "cms.view" },
      { href: "/admin/home/marquee", label: "Marquee", permission: "cms.view" },
      { href: "/admin/home/explore?section=header", label: "Explore Header", permission: "cms.view" },
      { href: "/admin/home/explore?section=cards", label: "Explore Cards", permission: "cms.view" },
      { href: "/admin/home/where-next", label: "Where Next", permission: "cms.view" },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: Info,
    children: [
      { href: "/admin/about/hero", label: "Hero", permission: "cms.view" },
      { href: "/admin/about/built-for?section=header", label: "Built-For Header", permission: "cms.view" },
      { href: "/admin/about/built-for?section=items", label: "Built-For Items", permission: "cms.view" },
      { href: "/admin/about/where-next", label: "Where Next", permission: "cms.view" },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: Layers,
    children: [
      { href: "/admin/services/intro?section=hero", label: "Intro Hero", permission: "cms.view" },
      { href: "/admin/services/intro?section=cta", label: "Intro CTA", permission: "cms.view" },
      { href: "/admin/services/sections", label: "Sections & Items", permission: "cms.view" },
    ],
  },
  {
    id: "process",
    label: "How We Work",
    icon: ListOrdered,
    children: [
      { href: "/admin/process/hero", label: "Hero", permission: "cms.view" },
      { href: "/admin/process/steps", label: "Steps", permission: "cms.view" },
      { href: "/admin/process/where-next", label: "Where Next", permission: "cms.view" },
    ],
  },
  {
    id: "industries",
    label: "Industries",
    icon: Building2,
    children: [
      { href: "/admin/industries/hero", label: "Hero", permission: "cms.view" },
      { href: "/admin/industries/sectors?section=copy", label: "Sectors copy", permission: "cms.view" },
      { href: "/admin/industries/sectors?section=tags", label: "Sector tags", permission: "cms.view" },
      { href: "/admin/industries/where-next", label: "Where Next", permission: "cms.view" },
    ],
  },
  {
    id: "story",
    label: "Story",
    icon: BookOpen,
    children: [
      { href: "/admin/story/hero", label: "Hero", permission: "cms.view" },
      { href: "/admin/story/dx?section=card1", label: "DX Card 1", permission: "cms.view" },
      { href: "/admin/story/dx?section=card2", label: "DX Card 2", permission: "cms.view" },
      { href: "/admin/story/dx?section=tagline", label: "DX Tagline", permission: "cms.view" },
      { href: "/admin/story/manifesto", label: "Manifesto", permission: "cms.view" },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    icon: Newspaper,
    children: [
      { href: "/admin/blog", label: "Posts", match: "prefix", permission: "cms.view" },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
    children: [
      { href: "/admin/contact/hero", label: "Hero", permission: "cms.view" },
      { href: "/admin/contact/email-card", label: "Email Card", permission: "cms.view" },
      { href: "/admin/contact/what-to-include", label: "What to Include", permission: "cms.view" },
      { href: "/admin/contact/expectation", label: "Expectation", permission: "cms.view" },
      { href: "/admin/submissions", label: "Submissions", permission: "contact.view" },
    ],
  },
  {
    id: "site-wide",
    label: "Site-wide",
    icon: Settings,
    children: [
      { href: "/admin/site-settings?section=site", label: "Site Settings", permission: "cms.edit" },
      { href: "/admin/site-settings?section=nav", label: "Nav Items", permission: "cms.edit" },
      { href: "/admin/site-settings?section=footer", label: "Footer", permission: "cms.edit" },
      { href: "/admin/settings/users", label: "Users", permission: "users.manage" },
      { href: "/admin/settings/roles", label: "Roles", permission: "roles.manage" },
    ],
  },
];

export function parseAdminHref(href: string): { pathname: string; section: string | null } {
  const q = href.indexOf("?");
  const pathname = q === -1 ? href : href.slice(0, q);
  if (q === -1) return { pathname, section: null };
  return { pathname, section: new URLSearchParams(href.slice(q + 1)).get("section") };
}

export function leafMatch(leaf: NavLeaf): NavLeafMatch {
  if (leaf.match) return leaf.match;
  return parseAdminHref(leaf.href).section ? "section" : "exact";
}

export function isLeafActive(
  leaf: NavLeaf,
  group: NavGroup,
  pathname: string,
  searchParams: Pick<URLSearchParams, "get">,
): boolean {
  const { pathname: leafPath } = parseAdminHref(leaf.href);
  const match = leafMatch(leaf);

  if (match === "prefix") {
    return pathname === leafPath || pathname.startsWith(`${leafPath}/`);
  }
  if (pathname !== leafPath) return false;
  if (match === "exact") return true;

  const current = searchParams.get("section");
  const sectionLeaves = group.children.filter(
    (child) => parseAdminHref(child.href).pathname === leafPath,
  );
  const matched = current
    ? sectionLeaves.find((child) => parseAdminHref(child.href).section === current)
    : undefined;
  return (matched ?? sectionLeaves[0]) === leaf;
}

export function filterAdminNav(groups: NavGroup[], permissions: PermissionKey[]): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      children: group.children.filter(
        (leaf) => !leaf.permission || permissions.includes(leaf.permission),
      ),
    }))
    .filter((group) => group.children.length > 0);
}

export function findActiveGroupId(
  pathname: string,
  searchParams: Pick<URLSearchParams, "get">,
  groups: NavGroup[] = ADMIN_NAV,
): string | null {
  for (const group of groups) {
    if (group.children.some((leaf) => isLeafActive(leaf, group, pathname, searchParams))) {
      return group.id;
    }
  }
  return null;
}
