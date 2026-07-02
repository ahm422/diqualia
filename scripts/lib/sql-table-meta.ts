import type { ExportTableKey } from "./migration-types";

/** Prisma @@map table names for SQL generation. */
export const SQL_TABLE_NAMES: Record<ExportTableKey, string> = {
  leads: "leads",
  adminUsers: "admin_users",
  siteSettings: "site_settings",
  navItems: "nav_items",
  ctaButtons: "cta_buttons",
  homeHero: "home_hero",
  homeMarqueeItems: "home_marquee_items",
  homeExploreCards: "home_explore_cards",
  homeExploreSection: "home_explore_section",
  homeWhereNext: "home_where_next",
  aboutHero: "about_hero",
  aboutBuiltForItems: "about_built_for_items",
  aboutWhereNext: "about_where_next",
  servicesPage: "services_page",
  serviceSections: "service_sections",
  serviceItems: "service_items",
  processPage: "process_page",
  processSteps: "process_steps",
  industriesPage: "industries_page",
  industrySectors: "industry_sectors",
  storyPage: "story_page",
  contactPage: "contact_page",
  footerSettings: "footer_settings",
  footerNavItems: "footer_nav_items",
};

const RESERVED_COLUMNS = new Set(["order", "group"]);

export function fieldToColumn(field: string): string {
  const column = field.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
  if (RESERVED_COLUMNS.has(column)) {
    return `"${column}"`;
  }
  return column;
}

export function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function rowToInsert(
  table: string,
  row: Record<string, unknown>,
): string {
  const fields = Object.keys(row);
  const columns = fields.map(fieldToColumn).join(", ");
  const values = fields.map((field) => sqlLiteral(row[field])).join(", ");
  return `INSERT INTO ${table} (${columns}) VALUES (${values});`;
}
