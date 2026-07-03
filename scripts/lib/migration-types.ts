/** Export payload compatibility marker (TABLE_MANIFEST tables from 0001_init). Not the latest D1 migration filename. */
export const SCHEMA_VERSION = "0001_init";

export const TABLE_MANIFEST = [
  { key: "leads", delegate: "lead" },
  { key: "adminUsers", delegate: "adminUser" },
  { key: "siteSettings", delegate: "siteSettings" },
  { key: "navItems", delegate: "navItem" },
  { key: "ctaButtons", delegate: "ctaButton" },
  { key: "homeHero", delegate: "homeHero" },
  { key: "homeMarqueeItems", delegate: "homeMarqueeItem" },
  { key: "homeExploreCards", delegate: "homeExploreCard" },
  { key: "homeExploreSection", delegate: "homeExploreSection" },
  { key: "homeWhereNext", delegate: "homeWhereNext" },
  { key: "aboutHero", delegate: "aboutHero" },
  { key: "aboutBuiltForItems", delegate: "aboutBuiltForItem" },
  { key: "aboutWhereNext", delegate: "aboutWhereNext" },
  { key: "servicesPage", delegate: "servicesPage" },
  { key: "serviceSections", delegate: "serviceSection" },
  { key: "serviceItems", delegate: "serviceItem" },
  { key: "processPage", delegate: "processPage" },
  { key: "processSteps", delegate: "processStep" },
  { key: "industriesPage", delegate: "industriesPage" },
  { key: "industrySectors", delegate: "industrySector" },
  { key: "storyPage", delegate: "storyPage" },
  { key: "contactPage", delegate: "contactPage" },
  { key: "footerSettings", delegate: "footerSettings" },
  { key: "footerNavItems", delegate: "footerNavItem" },
] as const;

export type ExportTableKey = (typeof TABLE_MANIFEST)[number]["key"];
export type PrismaDelegate = (typeof TABLE_MANIFEST)[number]["delegate"];

export type ExportMeta = {
  exportedAt: string;
  source: "postgres";
  schemaVersion: string;
};

export type ExportPayload = {
  meta: ExportMeta;
  counts: Record<ExportTableKey, number>;
} & Record<ExportTableKey, unknown[]>;

export function isExportTableKey(key: string): key is ExportTableKey {
  return TABLE_MANIFEST.some((entry) => entry.key === key);
}

export function getDelegateForKey(key: ExportTableKey): PrismaDelegate {
  const entry = TABLE_MANIFEST.find((item) => item.key === key);
  if (!entry) throw new Error(`Unknown export table key: ${key}`);
  return entry.delegate;
}

export function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}
