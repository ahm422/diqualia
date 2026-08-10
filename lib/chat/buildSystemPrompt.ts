import "server-only";

import { getDb } from "@/lib/cloudflare-env";
import { CHAT_BODY_TRUNCATE } from "@/lib/chat/config";

function truncate(text: string | null | undefined, max = CHAT_BODY_TRUNCATE): string {
  if (!text) return "";
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function formatWhyPoints(whyPoints: unknown): string {
  if (!Array.isArray(whyPoints) || whyPoints.length === 0) return "";
  return whyPoints
    .map((p) => {
      if (!p || typeof p !== "object") return null;
      const title = "title" in p && typeof p.title === "string" ? p.title : "";
      const body = "body" in p && typeof p.body === "string" ? truncate(p.body, 240) : "";
      if (!title && !body) return null;
      return `  - ${title}${body ? `: ${body}` : ""}`;
    })
    .filter(Boolean)
    .join("\n");
}

const GUARDRAILS = `You are DiQualia's on-site assistant. Answer only from the provided site content below.
If something is unknown or not in the content: say so briefly and point to relevant pages (/services, /industries, /process, /about) or /contact.
Never book meetings, quote custom pricing, promise timelines, or collect email/phone — direct those requests to /contact.
Stay on-brand: concise, research-led B2B tone; no hype or filler.
Do not invent case studies, clients, or capabilities that are not listed.`;

export async function buildSystemPrompt(): Promise<string> {
  const prisma = await getDb();

  const [
    servicesPage,
    sections,
    industriesPage,
    sectors,
    processPage,
    steps,
    aboutHero,
    builtForItems,
  ] = await Promise.all([
    prisma.servicesPage.findUnique({ where: { id: 1 } }),
    prisma.serviceSection.findMany({
      orderBy: { order: "asc" },
      include: { items: { orderBy: { order: "asc" } } },
    }),
    prisma.industriesPage.findUnique({ where: { id: 1 } }),
    prisma.industrySector.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    }),
    prisma.processPage.findUnique({ where: { id: 1 } }),
    prisma.processStep.findMany({ orderBy: { order: "asc" } }),
    prisma.aboutHero.findUnique({ where: { id: 1 } }),
    prisma.aboutBuiltForItem.findMany({ orderBy: { order: "asc" } }),
  ]);

  const parts: string[] = [GUARDRAILS, "", "=== SITE CONTENT ===", ""];

  if (aboutHero) {
    parts.push("## About");
    if (aboutHero.eyebrow) parts.push(`Eyebrow: ${aboutHero.eyebrow}`);
    parts.push(`Headline: ${aboutHero.headline}`);
    parts.push(truncate(aboutHero.body));
    if (builtForItems.length > 0) {
      parts.push("Built for:");
      for (const item of builtForItems) {
        parts.push(`- ${item.title}: ${truncate(item.description, 200)}`);
      }
    }
    parts.push("");
  }

  if (servicesPage || sections.length > 0) {
    parts.push("## Services (/services)");
    if (servicesPage) {
      parts.push(`Headline: ${servicesPage.headline}`);
      parts.push(truncate(servicesPage.body));
    }
    for (const section of sections) {
      parts.push(`### ${section.title}`);
      if (section.eyebrow) parts.push(`Eyebrow: ${section.eyebrow}`);
      parts.push(truncate(section.body));
      if (section.cardTitle) {
        parts.push(`Card: ${section.cardTitle}${section.cardBody ? ` — ${truncate(section.cardBody, 200)}` : ""}`);
      }
      for (const item of section.items) {
        const label = item.groupLabel ? `[${item.groupLabel}] ` : "";
        parts.push(`- ${label}${item.title}${item.body ? `: ${truncate(item.body, 200)}` : ""}`);
      }
    }
    parts.push("");
  }

  if (industriesPage || sectors.length > 0) {
    parts.push("## Industries (/industries)");
    if (industriesPage) {
      parts.push(
        `Headline: ${industriesPage.headlineLine1} ${industriesPage.headlineLine2}`.trim(),
      );
      parts.push(truncate(industriesPage.body));
    }
    for (const sector of sectors) {
      parts.push(`### ${sector.name} (slug: ${sector.slug})`);
      if (sector.eyebrow) parts.push(`Eyebrow: ${sector.eyebrow}`);
      if (sector.headline) parts.push(`Headline: ${sector.headline}`);
      if (sector.body) parts.push(truncate(sector.body));
      const why = formatWhyPoints(sector.whyPoints);
      if (why) {
        parts.push("Why DiQualia:");
        parts.push(why);
      }
    }
    parts.push("");
  }

  if (processPage || steps.length > 0) {
    parts.push("## Process (/process)");
    if (processPage) {
      parts.push(
        `Headline: ${processPage.headlineLine1} ${processPage.headlineLine2} ${processPage.headlineLine3}`.trim(),
      );
      parts.push(truncate(processPage.body));
    }
    for (const step of steps) {
      parts.push(
        `${step.stepLabel} ${step.stepNumber}: ${step.title} — ${truncate(step.body, 280)}`,
      );
    }
    parts.push("");
  }

  parts.push("Contact for proposals, calls, pricing, or next steps: /contact");

  return parts.join("\n");
}
