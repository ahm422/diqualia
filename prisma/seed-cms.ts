import type { PrismaClient } from "../lib/generated/prisma/client";

export async function seedCms(prisma: PrismaClient): Promise<void> {
  // ─── SiteSettings ─────────────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, siteName: "DiQualia", logoUrl: null },
    update: { siteName: "DiQualia", logoUrl: null },
  });
  console.log("SiteSettings ready");

  // ─── NavItem ──────────────────────────────────────────────────────────────
  await prisma.navItem.deleteMany();
  await prisma.navItem.createMany({
    data: [
      { href: "/about", label: "About", order: 0, visible: true },
      { href: "/services", label: "Services", order: 1, visible: true },
      { href: "/process", label: "How We Work", order: 2, visible: true },
      { href: "/industries", label: "Industries", order: 3, visible: true },
      { href: "/story", label: "Story", order: 4, visible: true },
    ],
  });
  console.log("NavItem ready (5)");

  // ─── CtaButton ────────────────────────────────────────────────────────────
  await prisma.ctaButton.upsert({
    where: { id: 1 },
    create: { id: 1, label: "Talk to Us", href: "/contact", visible: true },
    update: { label: "Talk to Us", href: "/contact", visible: true },
  });
  console.log("CtaButton ready");

  // ─── HomeHero ─────────────────────────────────────────────────────────────
  await prisma.homeHero.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: "Marketing Intelligence & Research",
      headlineLine1: "Intelligence",
      headlineLine2: "That Moves",
      headlineLine3: "Markets.",
      body: "DiQualia is a marketing intelligence and research unit for niche B2B companies. We research your market deeply, map your buyers precisely, and build intelligence-led strategies that create real, lasting pipeline growth.",
      btn1Label: "Our Services",
      btn1Href: "/services",
      btn2Label: "Talk to Us",
      btn2Href: "/contact",
      stat1Label: "Lead Quality",
      stat1Value: "94%",
      stat2Label: "Pipeline Growth",
      stat2Value: "3.8x",
      stat3Label: "First Lead",
      stat3Value: "~21d",
    },
    update: {
      eyebrow: "Marketing Intelligence & Research",
      headlineLine1: "Intelligence",
      headlineLine2: "That Moves",
      headlineLine3: "Markets.",
      body: "DiQualia is a marketing intelligence and research unit for niche B2B companies. We research your market deeply, map your buyers precisely, and build intelligence-led strategies that create real, lasting pipeline growth.",
      btn1Label: "Our Services",
      btn1Href: "/services",
      btn2Label: "Talk to Us",
      btn2Href: "/contact",
      stat1Label: "Lead Quality",
      stat1Value: "94%",
      stat2Label: "Pipeline Growth",
      stat2Value: "3.8x",
      stat3Label: "First Lead",
      stat3Value: "~21d",
    },
  });
  console.log("HomeHero ready");

  // ─── HomeMarqueeItem (6 unique items from 12-entry ticker loop) ───────────
  await prisma.homeMarqueeItem.deleteMany();
  await prisma.homeMarqueeItem.createMany({
    data: [
      { text: "Market Research — Niche B2B Intelligence", order: 0 },
      { text: "Buyer Mapping — Decision Maker Profiling", order: 1 },
      { text: "Competitive Intel — Precision Positioning", order: 2 },
      { text: "Lead Generation — Qualified & Targeted", order: 3 },
      { text: "Sales Enablement — Data-Backed Strategy", order: 4 },
      { text: "Sector Research — Deep Industry Expertise", order: 5 },
    ],
  });
  console.log("HomeMarqueeItem ready (6)");

  // ─── HomeExploreCard ──────────────────────────────────────────────────────
  await prisma.homeExploreCard.deleteMany();
  await prisma.homeExploreCard.createMany({
    data: [
      { href: "/about", title: "About", sectionLabel: "About", body: "What DiQualia is — and why intelligence-first beats tactics.", order: 0, visible: true },
      { href: "/services", title: "Services", sectionLabel: "Services", body: "Six core intelligence services designed to move pipeline.", order: 1, visible: true },
      { href: "/process", title: "How We Work", sectionLabel: "How We Work", body: "The research-first process that makes results repeatable.", order: 2, visible: true },
      { href: "/industries", title: "Industries", sectionLabel: "Industries", body: "Where we operate — and how we build depth quickly in new niches.", order: 3, visible: true },
      { href: "/story", title: "Story", sectionLabel: "Story", body: "The point of view behind DiQualia and the Double Experience.", order: 4, visible: true },
      { href: "/contact", title: "Contact", sectionLabel: "Contact", body: "Start with a discovery call. No pitch — just research.", order: 5, visible: true },
    ],
  });
  console.log("HomeExploreCard ready (6)");

  // ─── HomeExploreSection ───────────────────────────────────────────────────
  await prisma.homeExploreSection.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: "Explore",
      headlineLine1: "A multi-page site",
      headlineLine2: "built for clarity.",
      body: "Jump into the pages below — each one keeps navigation consistent across mobile and desktop.",
    },
    update: {
      eyebrow: "Explore",
      headlineLine1: "A multi-page site",
      headlineLine2: "built for clarity.",
      body: "Jump into the pages below — each one keeps navigation consistent across mobile and desktop.",
    },
  });
  console.log("HomeExploreSection ready");

  // ─── HomeWhereNext ────────────────────────────────────────────────────────
  await prisma.homeWhereNext.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: "Begin With Intelligence",
      headline: "Ready to Know Your Market Better Than Anyone?",
      body: "Every engagement begins with a no-cost discovery call — 30 minutes, no pitch, just research.",
      btnLabel: "Contact",
      btnHref: "/contact",
    },
    update: {
      eyebrow: "Begin With Intelligence",
      headline: "Ready to Know Your Market Better Than Anyone?",
      body: "Every engagement begins with a no-cost discovery call — 30 minutes, no pitch, just research.",
      btnLabel: "Contact",
      btnHref: "/contact",
    },
  });
  console.log("HomeWhereNext ready");

  // ─── AboutHero ────────────────────────────────────────────────────────────
  await prisma.aboutHero.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: "About",
      headline: "Not an agency. An intelligence unit.",
      body: "DiQualia operates at the intersection of deep market research and precision go-to-market strategy. We immerse ourselves in your sector before we touch a single campaign — so your marketing decisions are grounded in evidence, not assumption.",
    },
    update: {
      eyebrow: "About",
      headline: "Not an agency. An intelligence unit.",
      body: "DiQualia operates at the intersection of deep market research and precision go-to-market strategy. We immerse ourselves in your sector before we touch a single campaign — so your marketing decisions are grounded in evidence, not assumption.",
    },
  });
  console.log("AboutHero ready");

  // ─── AboutBuiltForItem ────────────────────────────────────────────────────
  await prisma.aboutBuiltForItem.deleteMany();
  await prisma.aboutBuiltForItem.createMany({
    data: [
      {
        title: "Research Before Everything",
        description: "Every engagement begins with deep sector immersion. No strategy until we know your market as well as you do — often better.",
        order: 0,
      },
      {
        title: "Precision Over Volume",
        description: "We don't generate noise. We identify the exact buyers who are ready, able, and willing to engage — then reach them with purpose.",
        order: 1,
      },
      {
        title: "Intelligence That Compounds",
        description: "The intelligence we build doesn't expire. Every engagement makes the next one faster, sharper, and more effective.",
        order: 2,
      },
      {
        title: "Built to Scale Across Niches",
        description: "We grow with you — from one niche to many, one market to several, without ever losing the depth that makes intelligence valuable.",
        order: 3,
      },
    ],
  });
  console.log("AboutBuiltForItem ready (4)");

  // ─── AboutWhereNext ───────────────────────────────────────────────────────
  await prisma.aboutWhereNext.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: "Where next",
      headline: "See how we work — then start with intelligence.",
      btn1Label: "How We Work",
      btn1Href: "/process",
      btn2Label: "Contact",
      btn2Href: "/contact",
    },
    update: {
      eyebrow: "Where next",
      headline: "See how we work — then start with intelligence.",
      btn1Label: "How We Work",
      btn1Href: "/process",
      btn2Label: "Contact",
      btn2Href: "/contact",
    },
  });
  console.log("AboutWhereNext ready");

  // ─── ServicesPage ─────────────────────────────────────────────────────────
  await prisma.servicesPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: "Our Intelligence Services",
      headline: "What We Do for You.",
      body: "Six core intelligence services — each built on deep research, each designed to move your B2B pipeline from invisible to inevitable.",
      stat1Value: "6",
      stat1Label: "Core Services",
      stat2Value: "94%",
      stat2Label: "Lead Quality Rate",
      stat3Value: "3.8x",
      stat3Label: "Pipeline Growth",
      stat4Value: "~21d",
      stat4Label: "First Qualified Lead",
      ctaEyebrow: "Begin With Intelligence",
      ctaHeadline: "Ready to Start? Let's Build Your Intelligence.",
      ctaBody: "Every engagement begins with a no-cost discovery call — 30 minutes, no pitch, just research.",
      ctaBtn1Label: "Contact",
      ctaBtn1Href: "/contact",
      ctaEmailHref: "intel@diqualia.com",
    },
    update: {
      eyebrow: "Our Intelligence Services",
      headline: "What We Do for You.",
      body: "Six core intelligence services — each built on deep research, each designed to move your B2B pipeline from invisible to inevitable.",
      stat1Value: "6",
      stat1Label: "Core Services",
      stat2Value: "94%",
      stat2Label: "Lead Quality Rate",
      stat3Value: "3.8x",
      stat3Label: "Pipeline Growth",
      stat4Value: "~21d",
      stat4Label: "First Qualified Lead",
      ctaEyebrow: "Begin With Intelligence",
      ctaHeadline: "Ready to Start? Let's Build Your Intelligence.",
      ctaBody: "Every engagement begins with a no-cost discovery call — 30 minutes, no pitch, just research.",
      ctaBtn1Label: "Contact",
      ctaBtn1Href: "/contact",
      ctaEmailHref: "intel@diqualia.com",
    },
  });
  console.log("ServicesPage ready");

  // ─── ServiceSection + ServiceItem ─────────────────────────────────────────
  type SectionDef = {
    tabId: string;
    order: number;
    eyebrow: string;
    title: string;
    body: string;
    cardTitle?: string;
    cardBody?: string;
    items: Array<{
      groupLabel: string | null;
      title: string;
      body: string | null;
    }>;
  };

  const serviceSections: SectionDef[] = [
    {
      tabId: "s01",
      order: 0,
      eyebrow: "Intelligence Service One",
      title: "Market Research & Intelligence",
      body: "Before we build a single strategy, we map your entire market landscape — demand signals, buyer behavior, emerging trends, and the whitespace your competitors haven't discovered yet. This is the intelligence foundation everything else is built on.",
      cardTitle: "Know Your Market Before Anyone Else Does",
      cardBody: "We conduct deep, immersive research into your specific niche — studying who is buying, who is searching, where demand is growing, and where the gaps in your market exist. The result is a complete market intelligence brief that becomes your strategic compass.",
      items: [
        // Right-side bullet group cards
        { groupLabel: null, title: "Demand Signal Analysis", body: "We track where buyers are actively searching, what questions they ask, and what problems they urgently need solved — giving you a live map of market demand." },
        { groupLabel: null, title: "Trend Intelligence", body: "We identify emerging patterns in your sector before they become mainstream — so your positioning stays ahead of the market, not behind it." },
        { groupLabel: null, title: "Whitespace Discovery", body: "We find the gaps in your market — underserved segments, unmet needs, and positioning angles that no competitor has claimed yet." },
        { groupLabel: null, title: "Sector Language Mapping", body: "We decode the exact vocabulary your buyers use — the words that signal urgency, the phrases that build trust, the language that makes them act." },
        // "What You Receive" bullets
        { groupLabel: "What You Receive", title: "Full market landscape report — demand, trends, and growth signals", body: null },
        { groupLabel: "What You Receive", title: "Buyer segment analysis — who buys, why, and when", body: null },
        { groupLabel: "What You Receive", title: "Whitespace mapping — opportunities your competitors are missing", body: null },
        { groupLabel: "What You Receive", title: "Market sizing and addressable opportunity assessment", body: null },
        { groupLabel: "What You Receive", title: "Industry language guide — how buyers actually speak", body: null },
      ],
    },
    {
      tabId: "s02",
      order: 1,
      eyebrow: "Intelligence Service Two",
      title: "Buyer Identification & Profiling",
      body: "We go beyond demographics. We build precise, research-backed profiles of your ideal buyers — who they are, how they think, what triggers their decisions, and exactly where to find them. Every profile is built from real market data, not assumptions.",
      items: [
        { groupLabel: "02 · A — Decision Maker Mapping", title: "Who Actually Makes the Decision", body: "We identify the exact decision-makers in your target organisations — their titles, their roles in the buying process, their priorities, and the pressures they're under. We map the full buying committee, not just the obvious contact." },
        { groupLabel: "02 · A — Decision Maker Mapping", title: "Decision-maker profile database per target segment", body: null },
        { groupLabel: "02 · A — Decision Maker Mapping", title: "Buying committee map — influencers, gatekeepers, champions", body: null },
        { groupLabel: "02 · A — Decision Maker Mapping", title: "Role-specific pain point analysis", body: null },
        { groupLabel: "02 · B — Psychographic Profiling", title: "How They Think & What Moves Them", body: "Beyond job titles, we study how your buyers think — their risk tolerance, their ambitions, their frustrations, and the emotional triggers that push them from consideration to action. This is the intelligence that makes outreach feel personal." },
        { groupLabel: "02 · B — Psychographic Profiling", title: "Psychographic buyer profiles per segment", body: null },
        { groupLabel: "02 · B — Psychographic Profiling", title: "Trigger event mapping — what makes buyers move now", body: null },
        { groupLabel: "02 · B — Psychographic Profiling", title: "Objection library with intelligence-backed responses", body: null },
        { groupLabel: "02 · C — Buyer Journey Mapping", title: "The Path from Problem to Purchase", body: "We map every stage of your buyer's journey — from the moment they recognise a problem to the moment they sign a contract. Understanding this path lets us intercept buyers at exactly the right moment with exactly the right message." },
        { groupLabel: "02 · C — Buyer Journey Mapping", title: "Full buyer journey map with touchpoint analysis", body: null },
        { groupLabel: "02 · C — Buyer Journey Mapping", title: "Channel preference analysis per buyer stage", body: null },
        { groupLabel: "02 · C — Buyer Journey Mapping", title: "Content and messaging matrix per journey stage", body: null },
        { groupLabel: "02 · D — ICP Definition", title: "Your Ideal Client Profile — Precisely Defined", body: "We define your Ideal Client Profile with surgical precision — industry, company size, revenue range, team structure, growth stage, and the specific signals that indicate a prospect is ready and able to buy from you right now." },
        { groupLabel: "02 · D — ICP Definition", title: "Written ICP document with all qualifying criteria", body: null },
        { groupLabel: "02 · D — ICP Definition", title: "Negative ICP — who to deprioritise and why", body: null },
        { groupLabel: "02 · D — ICP Definition", title: "Prospect scoring framework for your sales team", body: null },
      ],
    },
    {
      tabId: "s03",
      order: 2,
      eyebrow: "Intelligence Service Three",
      title: "Positioning & Messaging Strategy",
      body: "Most B2B companies are excellent at what they do but invisible in how they communicate it. We translate your technical expertise into sharp, resonant market language that makes decision-makers immediately understand your value — and immediately prefer you.",
      items: [
        { groupLabel: "03 · A — Market Positioning", title: "Where You Stand. Why You Win.", body: "We craft a positioning strategy that places you in the ideal spot in your market — differentiated from competitors, aligned with buyer priorities, and occupying territory no one else has claimed. Clear, ownable, and built to last." },
        { groupLabel: "03 · A — Market Positioning", title: "Positioning statement — clear, distinct, ownable", body: null },
        { groupLabel: "03 · A — Market Positioning", title: "Competitive differentiation map", body: null },
        { groupLabel: "03 · A — Market Positioning", title: "Market category definition and ownership strategy", body: null },
        { groupLabel: "03 · B — Messaging Architecture", title: "The Right Words for Every Buyer", body: "We build a complete messaging architecture — from your core value proposition down to role-specific talking points for every buyer in the purchasing committee. One coherent story, precisely adapted for every audience." },
        { groupLabel: "03 · B — Messaging Architecture", title: "Master messaging document — core narrative and proof points", body: null },
        { groupLabel: "03 · B — Messaging Architecture", title: "Role-specific messaging variants per buyer persona", body: null },
        { groupLabel: "03 · B — Messaging Architecture", title: "Tagline and headline options with intelligence rationale", body: null },
        { groupLabel: "03 · C — Value Proposition", title: "Why You. Why Now. Why Not Anyone Else.", body: "We build a value proposition that answers the buyer's three hardest questions before they even ask them — grounded in real market research and tested against actual buyer priorities in your sector." },
        { groupLabel: "03 · C — Value Proposition", title: "Primary value proposition — full and compressed versions", body: null },
        { groupLabel: "03 · C — Value Proposition", title: "Supporting proof points and evidence framework", body: null },
        { groupLabel: "03 · C — Value Proposition", title: "Website and LinkedIn copy recommendations", body: null },
        { groupLabel: "03 · D — Brand Voice", title: "How You Sound Across Every Channel", body: "We define your brand voice — the tone, style, and language that makes all your communications feel consistent, credible, and distinctly yours. From cold emails to LinkedIn posts to proposal documents, one coherent voice." },
        { groupLabel: "03 · D — Brand Voice", title: "Brand voice guide with do's and don'ts", body: null },
        { groupLabel: "03 · D — Brand Voice", title: "Tone spectrum — formal to conversational contexts", body: null },
        { groupLabel: "03 · D — Brand Voice", title: "Sample copy examples across key channels", body: null },
      ],
    },
    {
      tabId: "s04",
      order: 3,
      eyebrow: "Intelligence Service Four",
      title: "B2B Lead Generation",
      body: "Every lead we generate is pre-qualified by intelligence. We don't spray and pray — we identify buyers who match your ICP precisely, engage them on the channels they actually use, and deliver conversations with people who are genuinely ready to listen.",
      items: [
        { groupLabel: "04 · A — LinkedIn Outreach", title: "LinkedIn — Where B2B Decisions Happen", body: "We build and execute targeted LinkedIn outreach campaigns — from profile optimisation and connection strategies to message sequences that open conversations with decision-makers in your exact target market." },
        { groupLabel: "04 · A — LinkedIn Outreach", title: "LinkedIn profile and company page optimisation", body: null },
        { groupLabel: "04 · A — LinkedIn Outreach", title: "Targeted connection and outreach sequences", body: null },
        { groupLabel: "04 · A — LinkedIn Outreach", title: "Weekly qualified conversation reports", body: null },
        { groupLabel: "04 · B — Email Campaigns", title: "Cold Email That Doesn't Feel Cold", body: "We write and execute email outreach campaigns grounded in buyer research — every sequence is personalised to the recipient's industry, role, and likely pain points. High open rates. High reply rates. Zero spam feel." },
        { groupLabel: "04 · B — Email Campaigns", title: "Research-backed email sequences (5–7 touches)", body: null },
        { groupLabel: "04 · B — Email Campaigns", title: "A/B tested subject lines and CTAs", body: null },
        { groupLabel: "04 · B — Email Campaigns", title: "Reply handling scripts and objection responses", body: null },
        { groupLabel: "04 · C — Prospect Lists", title: "Precision-Built Prospect Databases", body: "We build hand-verified prospect lists of companies and contacts that match your ICP exactly — no generic data scrapes, no outdated contacts. Every name on the list is a real decision-maker with a real reason to speak with you." },
        { groupLabel: "04 · C — Prospect Lists", title: "Verified prospect database per target segment", body: null },
        { groupLabel: "04 · C — Prospect Lists", title: "Contact details — name, title, LinkedIn, email", body: null },
        { groupLabel: "04 · C — Prospect Lists", title: "Personalisation notes per prospect", body: null },
        { groupLabel: "04 · D — Pipeline Reporting", title: "Intelligence You Can Act On — Weekly", body: "We deliver weekly pipeline intelligence reports — who opened, who replied, who engaged, what patterns we're seeing, and what we're adjusting. You always know exactly where your pipeline stands and why." },
        { groupLabel: "04 · D — Pipeline Reporting", title: "Weekly pipeline performance dashboard", body: null },
        { groupLabel: "04 · D — Pipeline Reporting", title: "Lead quality scoring and classification", body: null },
        { groupLabel: "04 · D — Pipeline Reporting", title: "Strategic adjustments and next-week plan", body: null },
      ],
    },
    {
      tabId: "s05",
      order: 4,
      eyebrow: "Intelligence Service Five",
      title: "Competitive Intelligence",
      body: "Know your competitors better than they know themselves. We track how they position, what they promise, how they price, and where they're winning and losing. This intelligence becomes your unfair advantage in every sales conversation.",
      items: [
        { groupLabel: "05 · A — Competitor Analysis", title: "Full Competitor Landscape Audit", body: "We conduct a comprehensive audit of your top competitors — their positioning, messaging, pricing signals, service offerings, client types, and the gaps and weaknesses in their market approach that you can exploit." },
        { groupLabel: "05 · A — Competitor Analysis", title: "Competitor profile cards — full analysis per competitor", body: null },
        { groupLabel: "05 · A — Competitor Analysis", title: "Positioning comparison matrix", body: null },
        { groupLabel: "05 · A — Competitor Analysis", title: "Competitor weakness and gap report", body: null },
        { groupLabel: "05 · B — Win/Loss Intelligence", title: "Why Deals Are Won and Lost", body: "We analyse patterns in your industry's win/loss dynamics — what makes buyers choose one provider over another, what objections come up most, and what the decisive factors are in competitive shortlisting situations." },
        { groupLabel: "05 · B — Win/Loss Intelligence", title: "Win/loss pattern analysis for your sector", body: null },
        { groupLabel: "05 · B — Win/Loss Intelligence", title: "Decision factor ranking by buyer type", body: null },
        { groupLabel: "05 · B — Win/Loss Intelligence", title: "Competitive battle cards for your sales team", body: null },
        { groupLabel: "05 · C — Pricing Intelligence", title: "What the Market Will Bear", body: "We research pricing signals, packaging approaches, and value anchoring strategies across your competitive set — giving you the intelligence to price with confidence and position your fees as an investment, not a cost." },
        { groupLabel: "05 · C — Pricing Intelligence", title: "Competitive pricing signal report", body: null },
        { groupLabel: "05 · C — Pricing Intelligence", title: "Packaging and tier structure recommendations", body: null },
        { groupLabel: "05 · C — Pricing Intelligence", title: "Value anchoring and pricing language guide", body: null },
        { groupLabel: "05 · D — Ongoing Monitoring", title: "Stay One Step Ahead — Always", body: "Markets move. Competitors pivot. We provide ongoing competitive monitoring — tracking changes in your competitive landscape and alerting you to new threats, opportunities, and shifts that require a strategic response." },
        { groupLabel: "05 · D — Ongoing Monitoring", title: "Monthly competitive intelligence briefing", body: null },
        { groupLabel: "05 · D — Ongoing Monitoring", title: "Alert system for significant competitor moves", body: null },
        { groupLabel: "05 · D — Ongoing Monitoring", title: "Quarterly landscape reassessment report", body: null },
      ],
    },
    {
      tabId: "s06",
      order: 5,
      eyebrow: "Intelligence Service Six",
      title: "Sales Enablement & Content",
      body: "Intelligence only creates value when it translates into tools your team can use every day. We build the proposals, pitch decks, case studies, and outreach sequences that arm your sales team with everything they need to close — consistently and confidently.",
      items: [
        { groupLabel: "06 · A — Proposals", title: "Proposals That Win", body: "We build proposal templates and custom proposals grounded in buyer research — structured to address the exact concerns of each decision-maker, backed by relevant proof, and designed to make the decision to choose you feel obvious." },
        { groupLabel: "06 · A — Proposals", title: "Master proposal template — fully customisable", body: null },
        { groupLabel: "06 · A — Proposals", title: "Sector-specific proposal variants", body: null },
        { groupLabel: "06 · A — Proposals", title: "Proposal review and optimisation service", body: null },
        { groupLabel: "06 · B — Pitch Decks", title: "Decks That Open Doors", body: "We design pitch decks that tell a compelling, intelligence-led story — from the problem your client is facing to the precise solution you offer to the proof that you can deliver. Every slide earns its place." },
        { groupLabel: "06 · B — Pitch Decks", title: "Full pitch deck — narrative, design, content", body: null },
        { groupLabel: "06 · B — Pitch Decks", title: "Short version — 5-slide executive summary", body: null },
        { groupLabel: "06 · B — Pitch Decks", title: "Leave-behind one-pager", body: null },
        { groupLabel: "06 · C — Case Studies", title: "Proof That Persuades", body: "We build case studies that go beyond testimonials — structured as before/after intelligence stories that show the problem, the approach, and the measurable results. The kind of proof that removes a buyer's last objection." },
        { groupLabel: "06 · C — Case Studies", title: "Long-form case study — full problem/solution/result", body: null },
        { groupLabel: "06 · C — Case Studies", title: "Compact case study — one-page format", body: null },
        { groupLabel: "06 · C — Case Studies", title: "LinkedIn case study post version", body: null },
        { groupLabel: "06 · D — Outreach Sequences", title: "Words That Start Conversations", body: "We write outreach sequences — email and LinkedIn — that feel researched, relevant, and human. Every sequence is built from buyer intelligence, designed to open a real conversation, not trigger an unsubscribe." },
        { groupLabel: "06 · D — Outreach Sequences", title: "Full outreach sequence — 5 to 7 touch points", body: null },
        { groupLabel: "06 · D — Outreach Sequences", title: "Follow-up and re-engagement sequences", body: null },
        { groupLabel: "06 · D — Outreach Sequences", title: "Personalisation framework for your team", body: null },
      ],
    },
  ];

  for (const sec of serviceSections) {
    const section = await prisma.serviceSection.upsert({
      where: { tabId: sec.tabId },
      create: {
        tabId: sec.tabId,
        order: sec.order,
        eyebrow: sec.eyebrow,
        title: sec.title,
        body: sec.body,
        cardTitle: sec.cardTitle ?? null,
        cardBody: sec.cardBody ?? null,
      },
      update: {
        order: sec.order,
        eyebrow: sec.eyebrow,
        title: sec.title,
        body: sec.body,
        cardTitle: sec.cardTitle ?? null,
        cardBody: sec.cardBody ?? null,
      },
    });
    await prisma.serviceItem.deleteMany({ where: { sectionId: section.id } });
    await prisma.serviceItem.createMany({
      data: sec.items.map((item, i) => ({
        sectionId: section.id,
        groupLabel: item.groupLabel,
        title: item.title,
        body: item.body,
        order: i,
      })),
    });
    console.log(`ServiceSection ${sec.tabId} ready (${sec.items.length} items)`);
  }

  // ─── ProcessPage ──────────────────────────────────────────────────────────
  await prisma.processPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: "How We Work",
      headlineLine1: "Research.",
      headlineLine2: "Precision.",
      headlineLine3: "Results.",
      body: "We don't start with tactics. We start with intelligence — then build everything on top of it. Here's the process we follow to ensure your positioning, outreach, and pipeline growth are evidence-led.",
      whereNextEyebrow: "Next",
      whereNextTitle1: "See what this looks like",
      whereNextTitle2: "in your market.",
      whereNextBody: "We'll run a short discovery call, learn your niche, and outline what an intelligence-first engagement would produce for your pipeline.",
    },
    update: {
      eyebrow: "How We Work",
      headlineLine1: "Research.",
      headlineLine2: "Precision.",
      headlineLine3: "Results.",
      body: "We don't start with tactics. We start with intelligence — then build everything on top of it. Here's the process we follow to ensure your positioning, outreach, and pipeline growth are evidence-led.",
      whereNextEyebrow: "Next",
      whereNextTitle1: "See what this looks like",
      whereNextTitle2: "in your market.",
      whereNextBody: "We'll run a short discovery call, learn your niche, and outline what an intelligence-first engagement would produce for your pipeline.",
    },
  });
  console.log("ProcessPage ready");

  // ─── ProcessStep ──────────────────────────────────────────────────────────
  await prisma.processStep.deleteMany();
  await prisma.processStep.createMany({
    data: [
      { stepLabel: "Step One", stepNumber: "01", title: "Sector Immersion", body: "We start by learning your industry — language, buying cycles, competitive dynamics, and decision drivers. No strategy until we know the market.", order: 0 },
      { stepLabel: "Step Two", stepNumber: "02", title: "Buyer Mapping", body: "We identify and profile your ideal buyers — roles, triggers, objections, and what moves them from interest to action.", order: 1 },
      { stepLabel: "Step Three", stepNumber: "03", title: "Intelligence Brief", body: "We compile research into a clear intelligence brief — market map, ICP, positioning, and a plan that prioritizes what will move pipeline.", order: 2 },
      { stepLabel: "Step Four", stepNumber: "04", title: "Precision Execution", body: "Outreach, content, enablement, and campaigns are designed around the intelligence — calibrated to your buyers and your category.", order: 3 },
      { stepLabel: "Step Five", stepNumber: "05", title: "Refine & Scale", body: "We track signals, report with clarity, and refine the system — so each cycle improves the next and growth compounds over time.", order: 4 },
    ],
  });
  console.log("ProcessStep ready (5)");

  // ─── IndustriesPage ───────────────────────────────────────────────────────
  await prisma.industriesPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: "Industries",
      headlineLine1: "Deep expertise.",
      headlineLine2: "Broad reach.",
      body: "We operate across a growing range of niche B2B sectors — with dedicated research practices built for each industry we enter.",
      sectorsLabel: "Sectors we actively research",
      sectorsDescription: "Highlighted industries represent where we currently have active research practices and up-to-date market intelligence frameworks.",
      sidebarLabel: "Active research",
      sidebarCopy: "If your niche isn't listed, that's okay — we can build the same depth quickly via immersion.",
      whereNextEyebrow: "Start here",
      whereNextTitle1: "Tell us your niche —",
      whereNextTitle2: "we'll map your buyers.",
      whereNextBody: "A no-cost discovery call: 30 minutes, no pitch, just research. We'll clarify your market, your buyers, and what intelligence-led growth would look like.",
    },
    update: {
      eyebrow: "Industries",
      headlineLine1: "Deep expertise.",
      headlineLine2: "Broad reach.",
      body: "We operate across a growing range of niche B2B sectors — with dedicated research practices built for each industry we enter.",
      sectorsLabel: "Sectors we actively research",
      sectorsDescription: "Highlighted industries represent where we currently have active research practices and up-to-date market intelligence frameworks.",
      sidebarLabel: "Active research",
      sidebarCopy: "If your niche isn't listed, that's okay — we can build the same depth quickly via immersion.",
      whereNextEyebrow: "Start here",
      whereNextTitle1: "Tell us your niche —",
      whereNextTitle2: "we'll map your buyers.",
      whereNextBody: "A no-cost discovery call: 30 minutes, no pitch, just research. We'll clarify your market, your buyers, and what intelligence-led growth would look like.",
    },
  });
  console.log("IndustriesPage ready");

  // ─── IndustrySector ───────────────────────────────────────────────────────
  await prisma.industrySector.deleteMany();
  await prisma.industrySector.createMany({
    data: [
      { name: "Construction & Built Environment", visible: true, order: 0 },
      { name: "Technical Services", visible: true, order: 1 },
      { name: "Engineering & Infrastructure", visible: true, order: 2 },
      { name: "Real Estate", visible: false, order: 3 },
      { name: "Industrial & Manufacturing", visible: false, order: 4 },
      { name: "Professional Services", visible: false, order: 5 },
      { name: "Energy & Utilities", visible: false, order: 6 },
      { name: "Logistics & Supply Chain", visible: false, order: 7 },
      { name: "Healthcare Services", visible: false, order: 8 },
      { name: "Legal & Compliance", visible: false, order: 9 },
      { name: "Financial Services", visible: false, order: 10 },
      { name: "SaaS & Technology", visible: false, order: 11 },
    ],
  });
  console.log("IndustrySector ready (12)");

  // ─── StoryPage ────────────────────────────────────────────────────────────
  await prisma.storyPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: "Our Story",
      headlineLine1: "We did not build",
      headlineLine2: "a brand. We built",
      headlineLine3: "a point of view.",
      body: "DiQualia was born from a question most agencies are unwilling to ask: in an age when everyone has access to the same tools, what does it truly mean to deliver intelligence?",
      dxNum1: "01",
      dxTitle1: "Human Intelligence",
      dxBody1: "Years of real market understanding. The ability to read context, sense nuance, and make the kind of judgement calls that no algorithm can replicate. We bring pattern recognition built from genuine experience — not training data.",
      dxNum2: "02",
      dxTitle2: "System Precision",
      dxBody2: "The power of intelligent tools, applied with intention. Speed without noise. Scale without sacrifice of quality. We use AI as a sharpening instrument — never as a replacement for the thinking that matters.",
      dxTagline: "Together, they produce something neither can achieve alone: intelligence that is both felt and proven.",
      manifestoItems: [
        "We believe intelligence is the only sustainable competitive advantage.",
        "We believe AI is a tool, not a substitute for expertise.",
        "We believe the best marketing starts with understanding the market, not performing for it.",
        "We believe clarity is a service — and noise is a disservice.",
        "We believe human judgement and machine precision are stronger together.",
        "We believe every B2B company deserves to be truly understood by its marketing partner.",
        "We believe in intelligence that moves markets.",
      ],
    },
    update: {
      eyebrow: "Our Story",
      headlineLine1: "We did not build",
      headlineLine2: "a brand. We built",
      headlineLine3: "a point of view.",
      body: "DiQualia was born from a question most agencies are unwilling to ask: in an age when everyone has access to the same tools, what does it truly mean to deliver intelligence?",
      dxNum1: "01",
      dxTitle1: "Human Intelligence",
      dxBody1: "Years of real market understanding. The ability to read context, sense nuance, and make the kind of judgement calls that no algorithm can replicate. We bring pattern recognition built from genuine experience — not training data.",
      dxNum2: "02",
      dxTitle2: "System Precision",
      dxBody2: "The power of intelligent tools, applied with intention. Speed without noise. Scale without sacrifice of quality. We use AI as a sharpening instrument — never as a replacement for the thinking that matters.",
      dxTagline: "Together, they produce something neither can achieve alone: intelligence that is both felt and proven.",
      manifestoItems: [
        "We believe intelligence is the only sustainable competitive advantage.",
        "We believe AI is a tool, not a substitute for expertise.",
        "We believe the best marketing starts with understanding the market, not performing for it.",
        "We believe clarity is a service — and noise is a disservice.",
        "We believe human judgement and machine precision are stronger together.",
        "We believe every B2B company deserves to be truly understood by its marketing partner.",
        "We believe in intelligence that moves markets.",
      ],
    },
  });
  console.log("StoryPage ready");

  // ─── ContactPage ──────────────────────────────────────────────────────────
  await prisma.contactPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: "Contact",
      headlineLine1: "Start with",
      headlineLine2: "intelligence.",
      body: "Every engagement begins with a no-cost discovery call — 30 minutes, no pitch, just research. We'll map your market, clarify your buyer reality, and outline what an intelligence-first engagement would produce.",
      emailLabel: "Primary contact",
      emailType: "Email",
      email: "intel@diqualia.com",
      emailCopy: `Tell us your niche, your offer, and what "qualified pipeline" means for your team — we'll reply with next steps.`,
      whatToIncludeItems: [
        "Your niche and the buyer you sell to (role + industry)",
        "Current acquisition channels (what's working / not working)",
        "Your average deal size and typical sales cycle",
        "Where you feel uncertain (positioning, segments, messaging, outreach)",
        "A link to your site / LinkedIn (if available)",
      ],
      expectationEyebrow: "Expectation",
      expectationText: "No noise. No pressure. Just clear intelligence about your market — and what to do next.",
    },
    update: {
      eyebrow: "Contact",
      headlineLine1: "Start with",
      headlineLine2: "intelligence.",
      body: "Every engagement begins with a no-cost discovery call — 30 minutes, no pitch, just research. We'll map your market, clarify your buyer reality, and outline what an intelligence-first engagement would produce.",
      emailLabel: "Primary contact",
      emailType: "Email",
      email: "intel@diqualia.com",
      emailCopy: `Tell us your niche, your offer, and what "qualified pipeline" means for your team — we'll reply with next steps.`,
      whatToIncludeItems: [
        "Your niche and the buyer you sell to (role + industry)",
        "Current acquisition channels (what's working / not working)",
        "Your average deal size and typical sales cycle",
        "Where you feel uncertain (positioning, segments, messaging, outreach)",
        "A link to your site / LinkedIn (if available)",
      ],
      expectationEyebrow: "Expectation",
      expectationText: "No noise. No pressure. Just clear intelligence about your market — and what to do next.",
    },
  });
  console.log("ContactPage ready");

  // ─── FooterSettings ───────────────────────────────────────────────────────
  await prisma.footerSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      tagline1: "Marketing Intelligence & Research",
      tagline2: "Niche B2B · Data-Driven Strategy",
      copyright: "© 2026 DiQualia",
      allRights: "All rights reserved",
      domain: "diqualia.com",
    },
    update: {
      tagline1: "Marketing Intelligence & Research",
      tagline2: "Niche B2B · Data-Driven Strategy",
      copyright: "© 2026 DiQualia",
      allRights: "All rights reserved",
      domain: "diqualia.com",
    },
  });
  console.log("FooterSettings ready");

  // ─── FooterNavItem ────────────────────────────────────────────────────────
  await prisma.footerNavItem.deleteMany();
  await prisma.footerNavItem.createMany({
    data: [
      { href: "/about", label: "About", group: "primary", order: 0 },
      { href: "/services", label: "Services", group: "primary", order: 1 },
      { href: "/process", label: "How We Work", group: "primary", order: 2 },
      { href: "/industries", label: "Industries", group: "primary", order: 3 },
      { href: "/story", label: "Story", group: "primary", order: 4 },
      { href: "/contact", label: "Contact", group: "secondary", order: 0 },
      { href: "/privacy", label: "Privacy", group: "secondary", order: 1 },
      { href: "/terms", label: "Terms", group: "secondary", order: 2 },
    ],
  });
  console.log("FooterNavItem ready (8)");

  console.log("CMS seed complete.");
}
