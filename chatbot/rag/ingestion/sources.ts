/**
 * Knowledge source loader.
 *
 * Loads every piece of public DiQualia website knowledge into a normalized
 * KbDocument shape:
 *   1. D1 / CMS content (source of truth for structured content)
 *   2. Hardcoded public content that lives in page components, not D1
 *      (engagement models, Why DiQualia values, story chapters,
 *       intelligence process strip, how-we-hire steps)
 *
 * Never includes private/user data (leads, applications, admin, roles, etc.).
 */

import type { ChatbotDataSource } from "../../models/datasource";
import type { KbDocument } from "../../models/types";

type DocsResult = {
  documents: KbDocument[];
  errors: string[];
};

function asStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function asObjectList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter((item): item is T => !!item && typeof item === "object") as T[]) : [];
}

function truncateJsonField(value: unknown): string {
  if (typeof value !== "string") return "";
  return value;
}

/** Loads CMS content stored in D1. */
async function loadDbDocuments(prisma: ChatbotDataSource): Promise<KbDocument[]> {
  const docs: KbDocument[] = [];

  const [
    homeHero,
    aboutHero,
    builtForItems,
    servicesPage,
    sections,
    processPage,
    steps,
    industriesPage,
    sectors,
    storyPage,
    contactPage,
    careerPage,
    openings,
    posts,
  ] = await Promise.all([
    prisma.homeHero.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.aboutHero.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.aboutBuiltForItem.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.servicesPage.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.serviceSection
      .findMany({ orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } })
      .catch(() => []),
    prisma.processPage.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.processStep.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.industriesPage.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.industrySector.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.storyPage.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.contactPage.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.careerPage.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.jobOpening.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } }).catch(() => []),
  ]);

  // ── Home / positioning ──────────────────────────────────────────────────
  if (homeHero) {
    const stats = [homeHero.stat1Value, homeHero.stat2Value, homeHero.stat3Value]
      .map((v, i) => {
        const label = [homeHero.stat1Label, homeHero.stat2Label, homeHero.stat3Label][i];
        return v && label ? `${label}: ${v}` : null;
      })
      .filter(Boolean);
    const body = [
      `DiQualia is a marketing intelligence and research unit for niche B2B companies.`,
      homeHero.body,
      stats.length > 0 ? `Headline metrics — ${stats.join(" · ")}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
    docs.push({
      id: "home:hero",
      contentType: "home",
      title: "DiQualia — Marketing Intelligence & Research",
      section: "Home",
      sourceUrl: "https://www.diqualia.com/",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body,
      metadata: {
        stat1_label: homeHero.stat1Label,
        stat1_value: homeHero.stat1Value,
        stat2_label: homeHero.stat2Label,
        stat2_value: homeHero.stat2Value,
        stat3_label: homeHero.stat3Label,
        stat3_value: homeHero.stat3Value,
      },
    });
  }

  // ── About ───────────────────────────────────────────────────────────────
  if (aboutHero) {
    docs.push({
      id: "about:hero",
      contentType: "about",
      title: "About DiQualia",
      section: "About",
      sourceUrl: "https://www.diqualia.com/about",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${aboutHero.headline}. ${aboutHero.body}`,
    });
  }
  for (const item of builtForItems) {
    docs.push({
      id: `about:built-for:${item.id}`,
      contentType: "about",
      title: item.title,
      section: "Built for",
      sourceUrl: "https://www.diqualia.com/about",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${item.title}. ${item.description}`,
    });
  }

  // ── Services ────────────────────────────────────────────────────────────
  if (servicesPage) {
    docs.push({
      id: "services:overview",
      contentType: "service",
      title: "DiQualia Services Overview",
      section: "Overview",
      sourceUrl: "https://www.diqualia.com/services",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${servicesPage.headline}. ${servicesPage.body} Headline metrics — ${servicesPage.stat1Label}: ${servicesPage.stat1Value}, ${servicesPage.stat2Label}: ${servicesPage.stat2Value}, ${servicesPage.stat3Label}: ${servicesPage.stat3Value}, ${servicesPage.stat4Label}: ${servicesPage.stat4Value}.`,
      metadata: {
        stat1: servicesPage.stat1Value,
        stat2: servicesPage.stat2Value,
        stat3: servicesPage.stat3Value,
        stat4: servicesPage.stat4Value,
      },
    });
  }
  for (const section of sections) {
    const overviewParts = [
      section.title,
      section.eyebrow ? `(${section.eyebrow})` : "",
      section.body,
      section.cardTitle && section.cardBody
        ? `${section.cardTitle} — ${section.cardBody}`
        : section.cardTitle || section.cardBody,
    ]
      .filter(Boolean)
      .join(" ");
    docs.push({
      id: `service:${section.tabId}`,
      contentType: "service",
      title: section.title,
      section: "Service overview",
      sourceUrl: `https://www.diqualia.com/services#${section.tabId}`,
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: overviewParts,
    });
    // Grouped items: keep fact/label pairs together, never mix services.
    const groups = new Map<string, string[]>();
    for (const item of section.items) {
      const group = item.groupLabel ?? "Details";
      const label = item.groupLabel ? `${group}: ${item.title}` : item.title;
      const entry = item.body ? `${label} — ${truncateJsonField(item.body)}` : label;
      groups.set(group, [...(groups.get(group) ?? []), entry]);
    }
    let gi = 0;
    for (const [group, entries] of groups) {
      docs.push({
        id: `service:${section.tabId}:group:${gi}`,
        contentType: "service",
        title: section.title,
        section: group,
        sourceUrl: `https://www.diqualia.com/services#${section.tabId}`,
        status: "published",
        visibility: "public",
        updatedAt: null,
        body: entries.join("\n"),
      });
      gi += 1;
    }
  }

  // ── Process ─────────────────────────────────────────────────────────────
  if (processPage) {
    docs.push({
      id: "process:overview",
      contentType: "process",
      title: "How DiQualia Works — Overview",
      section: "Overview",
      sourceUrl: "https://www.diqualia.com/process",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${processPage.headlineLine1} ${processPage.headlineLine2} ${processPage.headlineLine3}. ${processPage.body}`,
    });
  }
  for (const step of steps) {
    docs.push({
      id: `process:step:${step.stepNumber}`,
      contentType: "process",
      title: step.title,
      section: `${step.stepLabel} ${step.stepNumber}`,
      sourceUrl: "https://www.diqualia.com/process",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${step.stepLabel} ${step.stepNumber}: ${step.title}. ${step.body}`,
    });
  }

  // ── Industries ──────────────────────────────────────────────────────────
  if (industriesPage) {
    docs.push({
      id: "industries:overview",
      contentType: "industry",
      title: "Industries DiQualia Serves",
      section: "Overview",
      sourceUrl: "https://www.diqualia.com/industries",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${industriesPage.headlineLine1} ${industriesPage.headlineLine2}. ${industriesPage.body} ${industriesPage.sidebarLabel}: ${industriesPage.sidebarCopy}`,
    });
  }
  for (const sector of sectors) {
    if (sector.visible) {
      // Active sector: full detail.
      const why = asObjectList<{ title?: string; body?: string }>(sector.whyPoints);
      const body = [
        sector.name,
        sector.eyebrow ? `(${sector.eyebrow})` : "",
        sector.headline ? `Headline: ${sector.headline}` : "",
        sector.body ?? "",
      ]
        .filter(Boolean)
        .join(" ");
      docs.push({
        id: `industry:${sector.slug}`,
        contentType: "industry",
        title: sector.name,
        section: "Active research practice",
        sourceUrl: `https://www.diqualia.com/industries/${sector.slug}`,
        status: "published",
        visibility: "public",
        updatedAt: null,
        body,
        metadata: { active: true },
      });
      for (let i = 0; i < why.length; i += 1) {
        const point = why[i];
        if (!point?.title && !point?.body) continue;
        docs.push({
          id: `industry:${sector.slug}:why:${i}`,
          contentType: "industry",
          title: sector.name,
          section: point.title ?? `Why point ${i + 1}`,
          sourceUrl: `https://www.diqualia.com/industries/${sector.slug}`,
          status: "published",
          visibility: "public",
          updatedAt: null,
          body: point.body ? `${point.title}: ${point.body}` : point.title ?? "",
        });
      }
    } else {
      // Inactive sector: name only, explicitly no fabricated detail.
      docs.push({
        id: `industry:${sector.slug}`,
        contentType: "industry",
        title: sector.name,
        section: "Listed, not an active research practice",
        sourceUrl: "https://www.diqualia.com/industries",
        status: "inactive",
        visibility: "public",
        updatedAt: null,
        body: `${sector.name} is listed on the DiQualia Industries page. It is not currently an active research practice; DiQualia can build the same depth quickly via immersion if this niche is a target.`,
        metadata: { active: false },
      });
    }
  }

  // ── Story ───────────────────────────────────────────────────────────────
  if (storyPage) {
    const manifesto = asStringList(storyPage.manifestoItems);
    docs.push({
      id: "story:hero",
      contentType: "story",
      title: "The DiQualia Story",
      section: "Hero",
      sourceUrl: "https://www.diqualia.com/story",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${storyPage.headlineLine1} ${storyPage.headlineLine2} ${storyPage.headlineLine3}. ${storyPage.body}`,
    });
    docs.push({
      id: "story:double-experience",
      contentType: "story",
      title: "The Double Experience",
      section: "Double Experience",
      sourceUrl: "https://www.diqualia.com/story#dx",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `The Double Experience — ${storyPage.dxNum1} ${storyPage.dxTitle1}: ${storyPage.dxBody1} ${storyPage.dxNum2} ${storyPage.dxTitle2}: ${storyPage.dxBody2} Tagline: ${storyPage.dxTagline}`,
    });
    if (manifesto.length > 0) {
      docs.push({
        id: "story:manifesto",
        contentType: "story",
        title: "The DiQualia Manifesto",
        section: "Manifesto",
        sourceUrl: "https://www.diqualia.com/story#manifesto",
        status: "published",
        visibility: "public",
        updatedAt: null,
        body: manifesto.join("\n"),
      });
    }
  }

  // ── Contact ─────────────────────────────────────────────────────────────
  if (contactPage) {
    const whatToInclude = asStringList(contactPage.whatToIncludeItems);
    docs.push({
      id: "contact:overview",
      contentType: "contact",
      title: "Contact DiQualia",
      section: "Contact",
      sourceUrl: "https://www.diqualia.com/contact",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: [
        `${contactPage.headlineLine1} ${contactPage.headlineLine2}. ${contactPage.body}`,
        `${contactPage.emailLabel} (${contactPage.emailType}): ${contactPage.email}. ${contactPage.emailCopy}`,
        whatToInclude.length > 0 ? `What to include: ${whatToInclude.join("; ")}.` : "",
        `${contactPage.expectationEyebrow}: ${contactPage.expectationText}`,
      ]
        .filter(Boolean)
        .join(" "),
      metadata: { email: contactPage.email },
    });
  }

  // ── Careers ─────────────────────────────────────────────────────────────
  if (careerPage) {
    const benefits = asStringList(careerPage.benefits);
    docs.push({
      id: "careers:culture",
      contentType: "careers",
      title: "DiQualia Careers — Culture",
      section: "Culture",
      sourceUrl: "https://www.diqualia.com/careers",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${careerPage.cultureHeadline}. ${careerPage.cultureBody} Benefits — ${benefits.join("; ")}.`,
    });
    docs.push({
      id: "careers:apply",
      contentType: "careers",
      title: "How to Apply at DiQualia",
      section: "Apply",
      sourceUrl: "https://www.diqualia.com/careers",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${careerPage.applyHeadline}. ${careerPage.applyBody}`,
    });
  }
  for (const opening of openings) {
    const responsibilities = asStringList(opening.responsibilities);
    const requirements = asStringList(opening.requirements);
    const niceToHave = asStringList(opening.niceToHave);
    const summary = [
      `${opening.title} — ${opening.department} · ${opening.location} · ${opening.type}`,
      opening.seniority ? `Seniority: ${opening.seniority}` : "",
      opening.salaryRange ? `Salary range: ${opening.salaryRange}` : "",
      opening.remote ? `Remote: ${opening.remote}` : "",
      opening.teamNote ? `Team: ${opening.teamNote}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
    const body = [
      summary,
      opening.description,
      responsibilities.length > 0 ? `Responsibilities:\n- ${responsibilities.join("\n- ")}` : "",
      requirements.length > 0 ? `Requirements:\n- ${requirements.join("\n- ")}` : "",
      niceToHave.length > 0 ? `Nice-to-have:\n- ${niceToHave.join("\n- ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    docs.push({
      id: `job:${opening.slug}`,
      contentType: "job",
      title: opening.title,
      section: opening.department,
      sourceUrl: `https://www.diqualia.com/careers/${opening.slug}`,
      status: opening.visible ? "published" : "inactive",
      visibility: "public",
      updatedAt: opening.updatedAt ? opening.updatedAt.toISOString() : null,
      body,
      metadata: {
        department: opening.department,
        location: opening.location,
        type: opening.type,
        active: opening.visible,
      },
    });
  }

  // ── Blog (published only) ───────────────────────────────────────────────
  for (const post of posts) {
    if (post.status !== "published") continue; // never index drafts/unpublished
    docs.push({
      id: `blog:${post.slug}`,
      contentType: "blog",
      title: post.title,
      section: "Insights",
      sourceUrl: `https://www.diqualia.com/blog/${post.slug}`,
      status: "published",
      visibility: "public",
      updatedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      body: `${post.title}\n\n${post.excerpt}\n\n${post.body}`,
    });
  }

  return docs;
}

/**
 * Hardcoded public content that is NOT stored in D1.
 * Mirrors the arrays that live inside page components (services/page.tsx,
 * story/page.tsx, careers/page.tsx) so the chatbot can answer from them.
 * If a page's hardcoded copy changes, update the matching string here.
 */
function loadHardcodedDocuments(): KbDocument[] {
  const docs: KbDocument[] = [];
  const published = "published" as const;
  const publicVis = "public" as const;

  // ── Intelligence process strip (/services) ───────────────────────────────
  const processStrip: Array<[string, string, string, string]> = [
    ["Step One", "01", "Sector Immersion", "We spend the first week doing nothing but learning your industry — its language, rhythms, buyers, and dynamics. No strategy until we know your market deeply."],
    ["Step Two", "02", "Buyer Mapping", "We identify and profile your ideal buyers — building precise, evidence-based profiles that inform every piece of outreach and content we create."],
    ["Step Three", "03", "Intelligence Brief", "We compile all research into a strategic intelligence brief — your market, your buyers, your positioning, and your go-to-market plan. The compass for everything that follows."],
    ["Step Four", "04", "Execution", "With intelligence in hand, we execute — campaigns, content, outreach, and enablement tools — all grounded in research, all calibrated to your exact market."],
    ["Step Five", "05", "Optimise & Scale", "We measure what matters, learn from every signal, and continuously refine the intelligence engine — making your pipeline grow smarter and stronger every week."],
  ];
  for (const [label, num, title, body] of processStrip) {
    docs.push({
      id: `services:process-strip:${num}`,
      contentType: "process",
      title,
      section: `${label} (${num})`,
      sourceUrl: "https://www.diqualia.com/services",
      status: published,
      visibility: publicVis,
      updatedAt: null,
      body: `${label} (${num}): ${title}. ${body}`,
    });
  }

  // ── Engagement models (/services) ────────────────────────────────────────
  const engagements: Array<{ tier: string; name: string; desc: string; features: string[]; featured?: boolean }> = [
    {
      tier: "Intelligence Starter",
      name: "Market Intelligence Sprint",
      desc: "A focused 30-day intelligence engagement — ideal for companies entering a new market or needing a complete market picture before making strategic decisions.",
      features: [
        "Full market research & landscape report",
        "ICP definition and buyer profiling",
        "Positioning and messaging strategy",
        "Competitor analysis — top 5 competitors",
        "Strategic intelligence brief",
      ],
    },
    {
      tier: "Intelligence Partnership",
      name: "90-Day Growth Engagement",
      desc: "Our full intelligence and execution partnership — research, positioning, lead generation, and sales enablement running together for 90 days of measurable pipeline growth.",
      featured: true,
      features: [
        "Everything in Intelligence Starter",
        "B2B lead generation — LinkedIn + email",
        "Ongoing competitive monitoring",
        "Proposals, pitch deck, case studies",
        "Weekly pipeline intelligence reports",
        "Bi-weekly strategy calls",
        "Outreach sequence copywriting",
      ],
    },
    {
      tier: "Ongoing Intelligence",
      name: "Retained Intelligence Partner",
      desc: "A long-term intelligence partnership — we embed as your dedicated market intelligence and research unit, continuously building pipeline and adapting strategy as your market evolves.",
      features: [
        "Everything in 90-Day Engagement",
        "Monthly market intelligence updates",
        "Quarterly strategic reviews",
        "Dedicated intelligence analyst",
        "Priority response and execution",
        "Custom reporting dashboard",
      ],
    },
  ];
  for (const eng of engagements) {
    const features = eng.features.map((f) => `- ${f}`).join("\n");
    docs.push({
      id: `engagement:${eng.tier.toLowerCase().replace(/\s+/g, "-")}`,
      contentType: "engagement",
      title: eng.tier,
      section: eng.name,
      sourceUrl: "https://www.diqualia.com/services",
      status: published,
      visibility: publicVis,
      updatedAt: null,
      body: `${eng.tier} — ${eng.name}. ${eng.desc}${eng.featured ? " This is the most popular engagement model." : ""}\n\nIncluded:\n${features}`,
      metadata: { tier: eng.tier },
    });
  }

  // ── Why DiQualia values (/services) ──────────────────────────────────────
  const values: Array<[string, string, string]> = [
    ["R", "Research Before Everything", "Every service begins with deep, unhurried research into your market. We never launch before we understand your sector as well as you do — often better."],
    ["N", "Niche B2B Specialists", "We work exclusively in niche B2B industries — not mass markets, not B2C, not general marketing. Deep specialisation is how we move markets."],
    ["D", "Data-Driven, Always", "Every recommendation we make is backed by evidence. Every strategy is grounded in real market data. We don't guess — we research, we verify, then we act."],
    ["P", "Precision Over Volume", "We don't generate hundreds of unqualified leads. We generate a precise number of deeply qualified conversations with buyers ready, able, and willing to engage."],
    ["I", "Intelligence That Compounds", "The intelligence we build doesn't expire after a campaign. It compounds — each engagement making the next one faster, sharper, and more effective."],
    ["T", "Transparent Reporting", "Weekly reports, clear metrics, honest assessments. No vanity numbers. Only the metrics that actually matter to your business."],
  ];
  docs.push({
    id: "values:why-diqualia",
    contentType: "value",
    title: "Why DiQualia — the R.N.D.P.I.T Framework",
    section: "Values",
    sourceUrl: "https://www.diqualia.com/services",
    status: published,
    visibility: publicVis,
    updatedAt: null,
    body: values.map(([icon, title, body]) => `${icon} — ${title}: ${body}`).join("\n"),
  });

  // ── Story chapters (/story) ──────────────────────────────────────────────
  docs.push({
    id: "story:chapter-2-problem",
    contentType: "story",
    title: "The Problem We Saw",
    section: "Story — Chapter 2",
    sourceUrl: "https://www.diqualia.com/story",
    status: published,
    visibility: publicVis,
    updatedAt: null,
    body:
      "A world full of data, starved of real intelligence. When artificial intelligence arrived in marketing, something unexpected happened. Rather than elevating the quality of insight, it democratised mediocrity. Every agency, every consultant, every freelancer suddenly had access to the same tools — and began producing the same outputs. The market became flooded, not with intelligence, but with the appearance of intelligence: dashboards that looked authoritative, reports that read convincingly, strategies that sounded sophisticated. All of it generated at speed, none of it built on genuine understanding. DiQualia chose not to participate in that. In the age of AI, the rarest thing you can offer a business is not speed — it is judgement.",
  });
  docs.push({
    id: "story:chapter-4-why-now",
    contentType: "story",
    title: "Why Now — Real Intelligence in the Age of Artificial Everything",
    section: "Story — Chapter 4",
    sourceUrl: "https://www.diqualia.com/story",
    status: published,
    visibility: publicVis,
    updatedAt: null,
    body:
      "Why Now: Real intelligence in the age of artificial everything. Businesses have never had more data, more tools, or more automated insight available to them. Yet the number of companies that feel genuinely understood by their marketing partners has never been lower. The reason is simple: intelligence requires context, and context requires the kind of sustained, focused attention that no tool can manufacture on demand. The Market Reality: everyone sounds the same — AI has given every agency the ability to produce polished, credible-sounding output without the expertise to back it up. The DiQualia Difference: we are the human layer — our value is not the tools we use, it is the expertise that directs them. The Result for Clients: clarity in a noisy market — when a DiQualia client makes a decision, they make it with confidence, because they were given genuine intelligence to see their market clearly and move with precision.",
  });
  docs.push({
    id: "story:chapter-6-founding-vision",
    contentType: "story",
    title: "Built for the Businesses That Cannot Afford to Guess",
    section: "Story — Chapter 6",
    sourceUrl: "https://www.diqualia.com/story",
    status: published,
    visibility: publicVis,
    updatedAt: null,
    body:
      "Where DiQualia is going: built for the businesses that cannot afford to guess. DiQualia was built with a very specific client in mind: the B2B enterprise operating in a niche, high-stakes market — where a wrong positioning decision costs not just a campaign, but a quarter. These businesses do not need more content or more impressions. They need precision — someone who has done the real work of understanding their market and can translate that understanding into decisions they can act on with confidence. DiQualia is not here to do marketing for the sake of marketing. It is here to move markets, for the businesses smart enough to know the difference.",
  });

  // ── Careers: how we hire (/careers) ──────────────────────────────────────
  const hireSteps: Array<[string, string, string, string]> = [
    ["01", "Apply", "Send a note and a resume", "PDF, DOC, or DOCX. A short cover note on the niche you know and a piece of work you are proud of."],
    ["02", "Review", "We read the work", "Intelligence and delivery review the application against the role. No automated filter theatre."],
    ["03", "Conversation", "A working conversation", "If there is a fit, we talk about a market, a brief, and how you think — not a panel gauntlet."],
    ["04", "Offer", "A clear next step", "We reply with next steps. If we make an offer, it is specific about the work, not a vague pipeline."],
  ];
  docs.push({
    id: "careers:how-we-hire",
    contentType: "careers",
    title: "How DiQualia Hires",
    section: "How we hire",
    sourceUrl: "https://www.diqualia.com/careers",
    status: published,
    visibility: publicVis,
    updatedAt: null,
    body: hireSteps
      .map(([num, label, title, body]) => `Step ${num} — ${label}: ${title}. ${body}`)
      .join("\n"),
  });

  return docs;
}

/**
 * Loads all public knowledge for ingestion.
 */
export async function loadAllKnowledge(prisma: ChatbotDataSource): Promise<DocsResult> {
  const errors: string[] = [];
  let dbDocs: KbDocument[] = [];
  try {
    dbDocs = await loadDbDocuments(prisma);
  } catch (err) {
    errors.push(`db: ${err instanceof Error ? err.message : String(err)}`);
  }

  const hardcoded = loadHardcodedDocuments();

  // Deduplicate by id (db wins over hardcoded for identical ids).
  const byId = new Map<string, KbDocument>();
  for (const doc of [...hardcoded, ...dbDocs]) {
    byId.set(doc.id, doc);
  }

  return { documents: [...byId.values()], errors };
}
