export type IndustriesPageData = {
  id: number;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  body: string;
  sectorsLabel: string;
  sectorsDescription: string;
  sidebarLabel: string;
  sidebarCopy: string;
  whereNextEyebrow: string;
  whereNextTitle1: string;
  whereNextTitle2: string;
  whereNextBody: string;
} | null;

export type WhyPoint = { title: string; body: string };
export type CaseStudyRef = { label: string; href: string };

export type IndustrySector = {
  id: number;
  slug: string;
  name: string;
  visible: boolean;
  order: number;
  eyebrow: string | null;
  headline: string | null;
  body: string | null;
  heroImageUrl: string | null;
  whyPoints: WhyPoint[] | null;
  caseStudyRefs: CaseStudyRef[] | null;
};

export function parseWhyPoints(value: unknown): WhyPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is WhyPoint =>
      item != null &&
      typeof item === "object" &&
      typeof (item as WhyPoint).title === "string" &&
      typeof (item as WhyPoint).body === "string",
    )
    .map((item) => ({ title: item.title, body: item.body }));
}

export function parseCaseStudyRefs(value: unknown): CaseStudyRef[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is CaseStudyRef =>
      item != null &&
      typeof item === "object" &&
      typeof (item as CaseStudyRef).label === "string" &&
      typeof (item as CaseStudyRef).href === "string",
    )
    .map((item) => ({ label: item.label, href: item.href }));
}

export function normalizeSector(raw: IndustrySector): IndustrySector {
  return {
    ...raw,
    whyPoints: parseWhyPoints(raw.whyPoints),
    caseStudyRefs: parseCaseStudyRefs(raw.caseStudyRefs),
  };
}
