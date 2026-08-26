/**
 * Structured knowledge retrieval — D1 stays the source of truth for
 * exact/deterministic information (contact, jobs, industries list, services
 * list, engagement models, stats). These facts are fetched directly here
 * rather than relying on vector search, and are merged into the final context
 * by the context-assembly layer.
 */

import type { ChatbotDataSource } from "../../models/datasource";
import type { RetrievedContextItem } from "../../models/types";

export type StructuredTopic =
  | "contact"
  | "stats"
  | "engagement"
  | "values"
  | "jobs"
  | "services_list"
  | "industries_list"
  | "process_list";

function asStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

/** Loads exact facts from the dedicated kb_facts table (non-sensitive only). */
async function loadKbFacts(prisma: ChatbotDataSource): Promise<
  Array<{ factType: string; factKey: string; factValue: string; sourceUrl: string | null }>
> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT fact_type AS factType, fact_key AS factKey, fact_value AS factValue, source_url AS sourceUrl
       FROM kb_facts`,
    );
    return rows.map((r) => ({
      factType: String(r.factType),
      factKey: String(r.factKey),
      factValue: String(r.factValue),
      sourceUrl: r.sourceUrl ? String(r.sourceUrl) : null,
    }));
  } catch {
    // kb_facts may not exist if the migration hasn't been applied.
    return [];
  }
}

function factItem(f: {
  factType: string;
  factKey: string;
  factValue: string;
  sourceUrl: string | null;
}): RetrievedContextItem {
  return {
    contentType: f.factType,
    title: f.factKey.replace(/:/g, " — "),
    sourceUrl: f.sourceUrl ?? "",
    content: f.factValue,
    score: 1,
  };
}

/**
 * Retrieves structured facts for the requested topics and returns them as
 * context items with a perfect score so they always outrank vector chunks
 * during dedupe.
 */
export async function retrieveStructured(
  prisma: ChatbotDataSource,
  topics: StructuredTopic[],
): Promise<RetrievedContextItem[]> {
  const items: RetrievedContextItem[] = [];
  if (topics.length === 0) return items;

  const facts = await loadKbFacts(prisma);
  const factsByType = new Map<string, Array<(typeof facts)[number]>>();
  for (const f of facts) {
    factsByType.set(f.factType, [...(factsByType.get(f.factType) ?? []), f]);
  }

  if (topics.includes("contact")) {
    for (const f of factsByType.get("contact") ?? []) items.push(factItem(f));
  }
  if (topics.includes("stats")) {
    for (const f of factsByType.get("stats") ?? []) items.push(factItem(f));
  }
  if (topics.includes("engagement")) {
    for (const f of factsByType.get("engagement") ?? []) items.push(factItem(f));
  }
  if (topics.includes("values")) {
    for (const f of factsByType.get("value") ?? []) items.push(factItem(f));
  }

  if (topics.includes("jobs")) {
    try {
      const openings = await prisma.jobOpening.findMany({
        where: { visible: true },
        orderBy: { order: "asc" },
        select: { slug: true, title: true, department: true, location: true, type: true, seniority: true },
      });
      if (openings.length > 0) {
        items.push({
          contentType: "jobs",
          title: "Current open roles",
          sourceUrl: "https://www.diqualia.com/careers",
          content: openings
            .map(
              (o) =>
                `${o.title} — ${o.department} · ${o.location} · ${o.type}${o.seniority ? ` (${o.seniority})` : ""} — https://www.diqualia.com/careers/${o.slug}`,
            )
            .join("\n"),
          score: 1,
        });
      } else {
        items.push({
          contentType: "jobs",
          title: "Current open roles",
          sourceUrl: "https://www.diqualia.com/careers",
          content: "There are no open roles listed on the DiQualia careers page right now.",
          score: 1,
        });
      }
    } catch {
      /* jobs query failed — skip structured jobs */
    }
  }

  if (topics.includes("services_list")) {
    try {
      const sections = await prisma.serviceSection.findMany({
        orderBy: { order: "asc" },
        select: { tabId: true, title: true },
      });
      if (sections.length > 0) {
        items.push({
          contentType: "services",
          title: "DiQualia services",
          sourceUrl: "https://www.diqualia.com/services",
          content: sections.map((s) => `${s.title} (https://www.diqualia.com/services#${s.tabId})`).join("\n"),
          score: 1,
        });
      }
    } catch {
      /* ignore */
    }
  }

  if (topics.includes("industries_list")) {
    try {
      const sectors = await prisma.industrySector.findMany({ orderBy: { order: "asc" } });
      if (sectors.length > 0) {
        const active = sectors
          .filter((s) => s.visible)
          .map((s) => `${s.name} (active research practice)`)
          .join("\n");
        const listed = sectors
          .filter((s) => !s.visible)
          .map((s) => s.name)
          .join(", ");
        items.push({
          contentType: "industries",
          title: "DiQualia industries",
          sourceUrl: "https://www.diqualia.com/industries",
          content: `Active research practices:\n${active}\n\nAlso listed (not currently active research practices): ${listed}`,
          score: 1,
        });
      }
    } catch {
      /* ignore */
    }
  }

  if (topics.includes("process_list")) {
    try {
      const steps = await prisma.processStep.findMany({ orderBy: { order: "asc" } });
      if (steps.length > 0) {
        items.push({
          contentType: "process",
          title: "The DiQualia intelligence process",
          sourceUrl: "https://www.diqualia.com/process",
          content: steps.map((s) => `${s.stepLabel} (${s.stepNumber}): ${s.title} — ${s.body}`).join("\n"),
          score: 1,
        });
      }
    } catch {
      /* ignore */
    }
  }

  return items;
}

export { asStringList };
