import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  Building2,
  House,
  Info,
  Layers,
  ListOrdered,
  Mail,
  Newspaper,
  Settings,
} from "lucide-react";

export type NavLeafMatch = "exact" | "prefix" | "section";

export type NavLeaf = {
  href: string;
  label: string;
  match?: NavLeafMatch;
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
      { href: "/admin/home?section=hero", label: "Hero" },
      { href: "/admin/home?section=marquee", label: "Marquee" },
      { href: "/admin/home?section=explore", label: "Explore Cards" },
      { href: "/admin/home?section=where-next", label: "Where Next" },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: Info,
    children: [
      { href: "/admin/about?section=hero", label: "Hero" },
      { href: "/admin/about?section=built-for", label: "Built-For Items" },
      { href: "/admin/about?section=where-next", label: "Where Next" },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: Layers,
    children: [
      { href: "/admin/services?section=intro", label: "Page Intro" },
      { href: "/admin/services?section=sections", label: "Sections & Items" },
    ],
  },
  {
    id: "process",
    label: "How We Work",
    icon: ListOrdered,
    children: [
      { href: "/admin/process?section=hero", label: "Hero" },
      { href: "/admin/process?section=steps", label: "Steps" },
      { href: "/admin/process?section=where-next", label: "Where Next" },
    ],
  },
  {
    id: "industries",
    label: "Industries",
    icon: Building2,
    children: [
      { href: "/admin/industries?section=hero", label: "Hero" },
      { href: "/admin/industries?section=sectors", label: "Sectors" },
      { href: "/admin/industries?section=where-next", label: "Where Next" },
    ],
  },
  {
    id: "story",
    label: "Story",
    icon: BookOpen,
    children: [
      { href: "/admin/story?section=hero", label: "Hero" },
      { href: "/admin/story?section=dx", label: "Double Experience" },
      { href: "/admin/story?section=manifesto", label: "Manifesto" },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    icon: Newspaper,
    children: [{ href: "/admin/blog", label: "Posts", match: "prefix" }],
  },
  {
    id: "careers",
    label: "Careers",
    icon: Briefcase,
    children: [
      { href: "/admin/careers", label: "Page Copy", match: "exact" },
      { href: "/admin/careers/openings", label: "Job Openings", match: "prefix" },
      { href: "/admin/careers/applications", label: "Applications", match: "prefix" },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
    children: [
      { href: "/admin/contact?section=hero", label: "Page Copy", match: "exact" },
      { href: "/admin/submissions", label: "Submissions" },
    ],
  },
  {
    id: "site-wide",
    label: "Site-wide",
    icon: Settings,
    children: [
      { href: "/admin/site-settings?section=site", label: "Site Settings" },
      { href: "/admin/site-settings?section=nav", label: "Nav Items" },
      { href: "/admin/site-settings?section=footer", label: "Footer" },
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

export function findActiveGroupId(
  pathname: string,
  searchParams: Pick<URLSearchParams, "get">,
): string | null {
  for (const group of ADMIN_NAV) {
    if (group.children.some((leaf) => isLeafActive(leaf, group, pathname, searchParams))) {
      return group.id;
    }
  }
  return null;
}
