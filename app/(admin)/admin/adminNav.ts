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
      { href: "/admin/home/hero", label: "Hero" },
      { href: "/admin/home/marquee", label: "Marquee" },
      { href: "/admin/home/explore", label: "Explore Cards" },
      { href: "/admin/home/where-next", label: "Where Next" },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: Info,
    children: [
      { href: "/admin/about/hero", label: "Hero" },
      { href: "/admin/about/built-for", label: "Built-For Items" },
      { href: "/admin/about/where-next", label: "Where Next" },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: Layers,
    children: [
      { href: "/admin/services/intro", label: "Page Intro" },
      { href: "/admin/services/sections", label: "Sections & Items" },
    ],
  },
  {
    id: "process",
    label: "How We Work",
    icon: ListOrdered,
    children: [
      { href: "/admin/process/hero", label: "Hero" },
      { href: "/admin/process/steps", label: "Steps" },
      { href: "/admin/process/where-next", label: "Where Next" },
    ],
  },
  {
    id: "industries",
    label: "Industries",
    icon: Building2,
    children: [
      { href: "/admin/industries/hero", label: "Hero" },
      { href: "/admin/industries/sectors", label: "Sectors" },
      { href: "/admin/industries/where-next", label: "Where Next" },
    ],
  },
  {
    id: "story",
    label: "Story",
    icon: BookOpen,
    children: [
      { href: "/admin/story/hero", label: "Hero" },
      { href: "/admin/story/dx", label: "Double Experience" },
      { href: "/admin/story/manifesto", label: "Manifesto" },
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
      { href: "/admin/careers/hero", label: "Hero" },
      { href: "/admin/careers/culture", label: "Culture" },
      { href: "/admin/careers/benefits", label: "Benefits" },
      { href: "/admin/careers/apply", label: "Apply instructions" },
      { href: "/admin/careers/openings", label: "Job Openings", match: "prefix" },
      { href: "/admin/careers/applications", label: "Applications", match: "prefix" },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
    children: [
      { href: "/admin/contact/hero", label: "Hero" },
      { href: "/admin/contact/email-card", label: "Email Card" },
      { href: "/admin/contact/what-to-include", label: "What to Include" },
      { href: "/admin/contact/expectation", label: "Expectation" },
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
