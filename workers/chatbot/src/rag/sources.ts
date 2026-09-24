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

import type { KbDocument } from "../types";

type DocsResult = {
  documents: KbDocument[];
  errors: string[];
};

type Row = Record<string, unknown>;

/** Parses a JSON-encoded TEXT column (D1 stores lists as JSON strings). */
function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function asStringList(value: unknown): string[] {
  const parsed = parseJson(value);
  return Array.isArray(parsed)
    ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function asObjectList<T>(value: unknown): T[] {
  const parsed = parseJson(value);
  return Array.isArray(parsed) ? (parsed.filter((item): item is T => !!item && typeof item === "object") as T[]) : [];
}

function str(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

/** HTML (admin rich-text fields) → plain text for embedding. */
function htmlToText(value: unknown): string {
  return str(value)
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|br)\s*>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

/** D1 DATETIME text ("YYYY-MM-DD HH:MM:SS" or ISO) → ISO string. */
function isoOrNull(value: unknown): string | null {
  if (!value) return null;
  const d = new Date(String(value).includes("T") ? String(value) : `${String(value).replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Loads CMS content stored in D1 (one batched round trip). */
async function loadDbDocuments(db: D1Database): Promise<KbDocument[]> {
  const docs: KbDocument[] = [];

  const results = await db.batch<Row>([
    db.prepare(`SELECT * FROM home_hero WHERE id = 1`),
    db.prepare(`SELECT * FROM about_hero WHERE id = 1`),
    db.prepare(`SELECT * FROM about_built_for_items ORDER BY "order"`),
    db.prepare(`SELECT * FROM about_built_for_section WHERE id = 1`),
    db.prepare(`SELECT * FROM services_page WHERE id = 1`),
    db.prepare(`SELECT * FROM service_sections ORDER BY "order"`),
    db.prepare(`SELECT * FROM service_items ORDER BY section_id, "order"`),
    db.prepare(`SELECT * FROM process_page WHERE id = 1`),
    db.prepare(`SELECT * FROM process_steps ORDER BY "order"`),
    db.prepare(`SELECT * FROM industries_page WHERE id = 1`),
    db.prepare(`SELECT * FROM industry_sectors ORDER BY "order"`),
    db.prepare(`SELECT * FROM story_page WHERE id = 1`),
    db.prepare(`SELECT * FROM contact_page WHERE id = 1`),
    db.prepare(`SELECT * FROM career_page WHERE id = 1`),
    db.prepare(`SELECT * FROM job_openings ORDER BY "order"`),
    db.prepare(`SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`),
  ]);
  const [
    homeHero,
    aboutHero,
    builtForItems,
    builtForSection,
    servicesPage,
    sectionRows,
    itemRows,
    processPage,
    steps,
    industriesPage,
    sectors,
    storyPage,
    contactPage,
    careerPage,
    openings,
    posts,
  ] = results.map((r) => r.results);
  const one = (rows: Row[] | undefined): Row | null => rows?.[0] ?? null;
  const itemsBySection = new Map<number, Row[]>();
  for (const item of itemRows ?? []) {
    const sid = Number(item.section_id);
    itemsBySection.set(sid, [...(itemsBySection.get(sid) ?? []), item]);
  }

  // ── Home / positioning ──────────────────────────────────────────────────
  const hh = one(homeHero);
  if (hh) {
    const stats = [hh.stat1_value, hh.stat2_value, hh.stat3_value]
      .map((v, i) => {
        const label = [hh.stat1_label, hh.stat2_label, hh.stat3_label][i];
        return v && label ? `${label}: ${v}` : null;
      })
      .filter(Boolean);
    const body = [
      `DiQualia is a marketing intelligence and research unit for niche B2B companies.`,
      str(hh.body),
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
        stat1_label: str(hh.stat1_label),
        stat1_value: str(hh.stat1_value),
        stat2_label: str(hh.stat2_label),
        stat2_value: str(hh.stat2_value),
        stat3_label: str(hh.stat3_label),
        stat3_value: str(hh.stat3_value),
      },
    });
  }

  // ── About ───────────────────────────────────────────────────────────────
  const ah = one(aboutHero);
  if (ah) {
    docs.push({
      id: "about:hero",
      contentType: "about",
      title: "About DiQualia",
      section: "About",
      sourceUrl: "https://www.diqualia.com/about",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${str(ah.headline)}. ${str(ah.body)}`,
    });
  }
  const bfs = one(builtForSection);
  if (bfs) {
    docs.push({
      id: "about:built-for-section",
      contentType: "about",
      title: "What DiQualia is built for",
      section: "Built for",
      sourceUrl: "https://www.diqualia.com/about",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${str(bfs.eyebrow)}: ${str(bfs.headline_line1)} ${str(bfs.headline_line2)}`,
    });
  }
  for (const item of builtForItems ?? []) {
    docs.push({
      id: `about:built-for:${str(item.id)}`,
      contentType: "about",
      title: str(item.title),
      section: "Built for",
      sourceUrl: "https://www.diqualia.com/about",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${str(item.title)}. ${str(item.description)}`,
    });
  }

  // ── Services ────────────────────────────────────────────────────────────
  const sp = one(servicesPage);
  if (sp) {
    docs.push({
      id: "services:overview",
      contentType: "service",
      title: "DiQualia Services Overview",
      section: "Overview",
      sourceUrl: "https://www.diqualia.com/services",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${str(sp.headline)}. ${str(sp.body)} Headline metrics — ${str(sp.stat1_label)}: ${str(sp.stat1_value)}, ${str(sp.stat2_label)}: ${str(sp.stat2_value)}, ${str(sp.stat3_label)}: ${str(sp.stat3_value)}, ${str(sp.stat4_label)}: ${str(sp.stat4_value)}.`,
      metadata: {
        stat1: str(sp.stat1_value),
        stat2: str(sp.stat2_value),
        stat3: str(sp.stat3_value),
        stat4: str(sp.stat4_value),
      },
    });
  }
  for (const section of sectionRows ?? []) {
    const tabId = str(section.tab_id);
    const overviewParts = [
      str(section.title),
      section.eyebrow ? `(${str(section.eyebrow)})` : "",
      str(section.body),
      section.card_title && section.card_body
        ? `${str(section.card_title)} — ${str(section.card_body)}`
        : str(section.card_title) || str(section.card_body),
      htmlToText(section.overview_html),
    ]
      .filter(Boolean)
      .join(" ");
    docs.push({
      id: `service:${tabId}`,
      contentType: "service",
      title: str(section.title),
      section: "Service overview",
      sourceUrl: `https://www.diqualia.com/services#${tabId}`,
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: overviewParts,
    });
    // Grouped items: keep fact/label pairs together, never mix services.
    const groups = new Map<string, string[]>();
    for (const item of itemsBySection.get(Number(section.id)) ?? []) {
      const group = item.group_label ? str(item.group_label) : "Details";
      const label = item.group_label ? `${group}: ${str(item.title)}` : str(item.title);
      const entry = item.body ? `${label} — ${str(item.body)}` : label;
      groups.set(group, [...(groups.get(group) ?? []), entry]);
    }
    let gi = 0;
    for (const [group, entries] of groups) {
      docs.push({
        id: `service:${tabId}:group:${gi}`,
        contentType: "service",
        title: str(section.title),
        section: group,
        sourceUrl: `https://www.diqualia.com/services#${tabId}`,
        status: "published",
        visibility: "public",
        updatedAt: null,
        body: entries.join("\n"),
      });
      gi += 1;
    }
  }

  // ── Process ─────────────────────────────────────────────────────────────
  const pp = one(processPage);
  if (pp) {
    docs.push({
      id: "process:overview",
      contentType: "process",
      title: "How DiQualia Works — Overview",
      section: "Overview",
      sourceUrl: "https://www.diqualia.com/process",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${str(pp.headline_line1)} ${str(pp.headline_line2)} ${str(pp.headline_line3)}. ${str(pp.body)}`,
    });
  }
  for (const step of steps ?? []) {
    docs.push({
      id: `process:step:${str(step.step_number)}`,
      contentType: "process",
      title: str(step.title),
      section: `${str(step.step_label)} ${str(step.step_number)}`,
      sourceUrl: "https://www.diqualia.com/process",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${str(step.step_label)} ${str(step.step_number)}: ${str(step.title)}. ${str(step.body)}`,
    });
  }

  // ── Industries ──────────────────────────────────────────────────────────
  const ip = one(industriesPage);
  if (ip) {
    docs.push({
      id: "industries:overview",
      contentType: "industry",
      title: "Industries DiQualia Serves",
      section: "Overview",
      sourceUrl: "https://www.diqualia.com/industries",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${str(ip.headline_line1)} ${str(ip.headline_line2)}. ${str(ip.body)} ${str(ip.sidebar_label)}: ${str(ip.sidebar_copy)}`,
    });
  }
  for (const sector of sectors ?? []) {
    const name = str(sector.name);
    const slug = str(sector.slug);
    if (Number(sector.visible) === 1) {
      // Active sector: full detail.
      const why = asObjectList<{ title?: string; body?: string }>(sector.why_points);
      const body = [
        name,
        sector.eyebrow ? `(${str(sector.eyebrow)})` : "",
        sector.headline ? `Headline: ${str(sector.headline)}` : "",
        str(sector.body),
      ]
        .filter(Boolean)
        .join(" ");
      docs.push({
        id: `industry:${slug}`,
        contentType: "industry",
        title: name,
        section: "Active research practice",
        sourceUrl: `https://www.diqualia.com/industries/${slug}`,
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
          id: `industry:${slug}:why:${i}`,
          contentType: "industry",
          title: name,
          section: point.title ?? `Why point ${i + 1}`,
          sourceUrl: `https://www.diqualia.com/industries/${slug}`,
          status: "published",
          visibility: "public",
          updatedAt: null,
          body: point.body ? `${point.title}: ${point.body}` : point.title ?? "",
        });
      }
    } else {
      // Inactive sector: name only, explicitly no fabricated detail.
      docs.push({
        id: `industry:${slug}`,
        contentType: "industry",
        title: name,
        section: "Listed, not an active research practice",
        sourceUrl: "https://www.diqualia.com/industries",
        status: "inactive",
        visibility: "public",
        updatedAt: null,
        body: `${name} is listed on the DiQualia Industries page. It is not currently an active research practice; DiQualia can build the same depth quickly via immersion if this niche is a target.`,
        metadata: { active: false },
      });
    }
  }

  // ── Story ───────────────────────────────────────────────────────────────
  const st = one(storyPage);
  if (st) {
    const manifesto = asStringList(st.manifesto_items);
    docs.push({
      id: "story:hero",
      contentType: "story",
      title: "The DiQualia Story",
      section: "Hero",
      sourceUrl: "https://www.diqualia.com/story",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${str(st.headline_line1)} ${str(st.headline_line2)} ${str(st.headline_line3)}. ${str(st.body)}`,
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
      body: `The Double Experience — ${str(st.dx_num1)} ${str(st.dx_title1)}: ${str(st.dx_body1)} ${str(st.dx_num2)} ${str(st.dx_title2)}: ${str(st.dx_body2)} Tagline: ${str(st.dx_tagline)}`,
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
  const cp = one(contactPage);
  if (cp) {
    const whatToInclude = asStringList(cp.what_to_include_items);
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
        `${str(cp.headline_line1)} ${str(cp.headline_line2)}. ${str(cp.body)}`,
        `${str(cp.email_label)} (${str(cp.email_type)}): ${str(cp.email)}. ${str(cp.email_copy)}`,
        whatToInclude.length > 0 ? `What to include: ${whatToInclude.join("; ")}.` : "",
        `${str(cp.expectation_eyebrow)}: ${str(cp.expectation_text)}`,
      ]
        .filter(Boolean)
        .join(" "),
      metadata: { email: str(cp.email) },
    });
  }

  // ── Careers ─────────────────────────────────────────────────────────────
  const cr = one(careerPage);
  if (cr) {
    const benefits = asStringList(cr.benefits);
    docs.push({
      id: "careers:culture",
      contentType: "careers",
      title: "DiQualia Careers — Culture",
      section: "Culture",
      sourceUrl: "https://www.diqualia.com/careers",
      status: "published",
      visibility: "public",
      updatedAt: null,
      body: `${str(cr.culture_headline)}. ${str(cr.culture_body)} Benefits — ${benefits.join("; ")}.`,
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
      body: `${str(cr.apply_headline)}. ${str(cr.apply_body)}`,
    });
  }
  for (const opening of openings ?? []) {
    // Hidden openings are not on the website, so they are not indexed either.
    if (Number(opening.visible) !== 1) continue;
    const responsibilities = asStringList(opening.responsibilities);
    const requirements = asStringList(opening.requirements);
    const niceToHave = asStringList(opening.nice_to_have);
    const summary = [
      `${str(opening.title)} — ${str(opening.department)} · ${str(opening.location)} · ${str(opening.type)}`,
      opening.seniority ? `Seniority: ${str(opening.seniority)}` : "",
      opening.salary_range ? `Salary range: ${str(opening.salary_range)}` : "",
      opening.remote ? `Remote: ${str(opening.remote)}` : "",
      opening.team_note ? `Team: ${str(opening.team_note)}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
    const body = [
      summary,
      str(opening.description),
      responsibilities.length > 0 ? `Responsibilities:\n- ${responsibilities.join("\n- ")}` : "",
      requirements.length > 0 ? `Requirements:\n- ${requirements.join("\n- ")}` : "",
      niceToHave.length > 0 ? `Nice-to-have:\n- ${niceToHave.join("\n- ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    docs.push({
      id: `job:${str(opening.slug)}`,
      contentType: "job",
      title: str(opening.title),
      section: str(opening.department),
      sourceUrl: `https://www.diqualia.com/careers/${str(opening.slug)}`,
      status: "published",
      visibility: "public",
      updatedAt: isoOrNull(opening.updated_at),
      body,
      metadata: {
        department: str(opening.department),
        location: str(opening.location),
        type: str(opening.type),
        active: true,
      },
    });
  }

  // ── Blog (published only) ───────────────────────────────────────────────
  for (const post of posts ?? []) {
    // Query already restricts to status = 'published' — drafts are never indexed.
    docs.push({
      id: `blog:${str(post.slug)}`,
      contentType: "blog",
      title: str(post.title),
      section: "Insights",
      sourceUrl: `https://www.diqualia.com/blog/${str(post.slug)}`,
      status: "published",
      visibility: "public",
      updatedAt: isoOrNull(post.published_at),
      body: `${str(post.title)}\n\n${str(post.excerpt)}\n\n${str(post.body)}`,
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
export async function loadAllKnowledge(db: D1Database): Promise<DocsResult> {
  const errors: string[] = [];
  let dbDocs: KbDocument[] = [];
  try {
    dbDocs = await loadDbDocuments(db);
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
