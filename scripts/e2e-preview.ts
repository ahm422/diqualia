#!/usr/bin/env node
/**
 * Phase 7 local E2E regression against preview (http://127.0.0.1:8787).
 *
 * DANGER: this suite mutates the D1 bound to --base via admin PATCH/POST.
 * It must never be pointed at a shared, preview, workers.dev, or production database.
 * Allowed target: local `npm run preview` / `npm run cf:preview` on loopback only
 * (127.0.0.1, localhost, [::1]). Host allowlist is enforced in parseArgs().
 *
 * Prerequisites:
 *   npm run db:migrate && npm run db:import:local && npm run db:seed:admin
 *   Copy .dev.vars.example → .dev.vars (JWT_SECRET, ADMIN_EMAIL, COOKIE_SECURE=false)
 *   ADMIN_PASSWORD in .env (used by seed-admin + this script)
 *   npm run build && npm run preview   (separate terminal; cf:preview is an alias)
 *
 * Usage:
 *   npm run cf:e2e
 *   npm run cf:e2e -- --base http://127.0.0.1:8787
 *
 * Contact email is best-effort via Cloudflare Email Service (EMAIL binding).
 * This suite asserts lead save only; delivery is not required for pass.
 */
import "dotenv/config";

import {
  CookieJar,
  E2eFail,
  assert,
  createClient,
  d1JsonColumn,
  d1Query,
  logOk,
  parseArgs,
  pngBlob,
  jpegBlob,
  r2ObjectExists,
  section,
  stepLabel,
} from "./lib/e2e-client";

const { base } = parseArgs(process.argv.slice(2));
const TS = `e2e-${Date.now()}`;
const jar = new CookieJar();
const { request } = createClient(base, jar);

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD required in .env");
  process.exit(1);
}

// ─── 1. Auth ───────────────────────────────────────────────────────────────

async function testAuth() {
  section("Auth");

  const bad = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "wrong-password" }),
  });
  assert(bad.status === 401, stepLabel(`wrong password → 401 (got ${bad.status})`));
  logOk("wrong password → 401");

  const login = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert(login.status === 200, stepLabel(`login → 200 (got ${login.status})`));
  assert((login.json as { ok?: boolean })?.ok === true, stepLabel("login body ok"));
  assert(jar.get("dq_admin_token"), stepLabel("dq_admin_token cookie set"));
  assert(jar.get("dq_admin_refresh"), stepLabel("dq_admin_refresh cookie set"));
  logOk("login → 200 with access + refresh cookies");

  const admin = await request("/admin");
  assert(admin.status === 200, stepLabel(`GET /admin authed → 200 (got ${admin.status})`));
  assert(
    admin.text.includes("data-admin-overview") &&
      admin.text.includes("Recent activity") &&
      admin.text.includes("Quick actions"),
    stepLabel("GET /admin HTML is overview (metrics/activity/actions)"),
  );
  assert(!admin.text.includes(">Sections<"), stepLabel("GET /admin HTML has no Sections directory grid"));
  logOk("GET /admin authed → 200 overview");

  const oldRefresh = jar.get("dq_admin_refresh")!;
  const refresh = await request("/api/auth/refresh", { method: "POST" });
  assert(refresh.status === 200, stepLabel(`refresh → 200 (got ${refresh.status})`));
  assert(jar.get("dq_admin_token"), stepLabel("new access cookie after refresh"));
  assert(jar.get("dq_admin_refresh"), stepLabel("new refresh cookie after refresh"));
  assert(jar.get("dq_admin_refresh") !== oldRefresh, stepLabel("refresh token rotated"));
  logOk("POST /api/auth/refresh → rotate cookies");

  const staleJar = new CookieJar();
  staleJar.ingest(
    new Response(null, {
      headers: { "set-cookie": `dq_admin_refresh=${oldRefresh}; Path=/; HttpOnly` },
    }),
  );
  const staleClient = createClient(base, staleJar);
  const reuse = await staleClient.request("/api/auth/refresh", { method: "POST" });
  assert(reuse.status === 401, stepLabel(`reuse old refresh → 401 (got ${reuse.status})`));
  logOk("reuse old refresh token → 401");

  const logout = await request("/api/auth/logout", { method: "POST" });
  assert(logout.status === 200, stepLabel(`logout → 200 (got ${logout.status})`));
  logOk("logout → 200");

  const adminAfter = await request("/admin");
  assert(
    adminAfter.status === 307 || adminAfter.status === 302,
    stepLabel(`GET /admin after logout → redirect (got ${adminAfter.status})`),
  );
  logOk("GET /admin after logout → redirect");

  const revokedRows = d1Query(
    `SELECT revoked_at FROM refresh_tokens WHERE revoked_at IS NOT NULL ORDER BY created_at DESC LIMIT 1;`,
  ) as { revoked_at?: string }[];
  assert(revokedRows.length > 0 && revokedRows[0].revoked_at, stepLabel("D1 refresh_tokens has revoked row"));
  logOk("D1 refresh_tokens revoked_at populated");

  // Re-login for remaining suites
  const relogin = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert(relogin.status === 200, stepLabel(`re-login for CRUD → 200 (got ${relogin.status})`));
  logOk("re-login for remaining suites");
}

// ─── 2. Singleton PATCH routes ─────────────────────────────────────────────

type SingletonRoute = { path: string; field: string; value: string };

const SINGLETONS: SingletonRoute[] = [
  { path: "/api/admin/site-settings", field: "siteName", value: `DiQualia ${TS}` },
  { path: "/api/admin/cta-button", field: "label", value: `CTA ${TS}` },
  { path: "/api/admin/home-hero", field: "eyebrow", value: `Hero ${TS}` },
  { path: "/api/admin/home-explore-section", field: "eyebrow", value: `Explore ${TS}` },
  { path: "/api/admin/home-where-next", field: "eyebrow", value: `Where ${TS}` },
  { path: "/api/admin/about-hero", field: "eyebrow", value: `About ${TS}` },
  { path: "/api/admin/about-where-next", field: "eyebrow", value: `AboutWN ${TS}` },
  { path: "/api/admin/services-page", field: "eyebrow", value: `Services ${TS}` },
  { path: "/api/admin/process-page", field: "eyebrow", value: `Process ${TS}` },
  { path: "/api/admin/industries-page", field: "eyebrow", value: `Industries ${TS}` },
  { path: "/api/admin/story-page", field: "eyebrow", value: `Story ${TS}` },
  { path: "/api/admin/contact-page", field: "eyebrow", value: `Contact ${TS}` },
  { path: "/api/admin/career-page", field: "eyebrow", value: `Careers ${TS}` },
  { path: "/api/admin/footer", field: "tagline1", value: `Tagline ${TS}` },
];

/** Seed defaults used when a snapshot is already dirty from a previous E2E run. */
const SINGLETON_FALLBACKS: Record<string, unknown> = {
  "/api/admin/site-settings:siteName": "DiQualia",
  "/api/admin/cta-button:label": "Talk to Us",
  "/api/admin/home-hero:eyebrow": "Marketing Intelligence & Research",
  "/api/admin/home-explore-section:eyebrow": "Explore",
  "/api/admin/home-where-next:eyebrow": "Begin With Intelligence",
  "/api/admin/about-hero:eyebrow": "About",
  "/api/admin/about-where-next:eyebrow": "Where next",
  "/api/admin/services-page:eyebrow": "Our Intelligence Services",
  "/api/admin/process-page:eyebrow": "How We Work",
  "/api/admin/industries-page:eyebrow": "Industries",
  "/api/admin/story-page:eyebrow": "Our Story",
  "/api/admin/contact-page:eyebrow": "Contact",
  "/api/admin/career-page:eyebrow": "Careers",
  "/api/admin/footer:tagline1": "Marketing Intelligence & Research",
};

function singletonKey(path: string, field: string) {
  return `${path}:${field}`;
}

function sanitizeSnapshotValue(path: string, field: string, original: unknown): unknown {
  if (!isE2eText(original)) return original;
  const fallback = SINGLETON_FALLBACKS[singletonKey(path, field)];
  return fallback !== undefined ? fallback : original;
}

async function testSingletons(snapshot: CmsSnapshot) {
  section("Admin singleton PATCH");

  const originals = new Map(
    snapshot.singletons.map((row) => [singletonKey(row.path, row.field), row.original]),
  );

  for (const route of SINGLETONS) {
    const unauth = await fetch(`${base}${route.path}`);
    assert(unauth.status === 401, stepLabel(`${route.path} unauth GET → 401 (got ${unauth.status})`));

    const get = await request(route.path);
    assert(get.status === 200, stepLabel(`${route.path} GET → 200 (got ${get.status})`));
    assert(
      (get.json as { id?: number })?.id != null,
      stepLabel(`${route.path} GET has id`),
    );

    const patch = await request(route.path, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [route.field]: route.value }),
    });
    assert(patch.status === 200, stepLabel(`${route.path} PATCH → 200 (got ${patch.status})`));
    assert(
      (patch.json as Record<string, unknown>)[route.field] === route.value,
      stepLabel(`${route.path} PATCH wrote ${route.field}`),
    );

    const original = originals.get(singletonKey(route.path, route.field));
    const restore = await request(route.path, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [route.field]: original }),
    });
    assert(restore.status === 200, stepLabel(`${route.path} restore → 200 (got ${restore.status})`));
    logOk(`${route.path} GET/PATCH/restore`);
  }
}

// ─── 3. Collection CRUD ────────────────────────────────────────────────────

async function collectionCrud(
  basePath: string,
  postBody: Record<string, unknown>,
  patchBody: Record<string, unknown>,
) {
  const created = await request(basePath, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(postBody),
  });
  assert(created.status === 201, stepLabel(`${basePath} POST → 201 (got ${created.status})`));
  const id = (created.json as { id?: number })?.id;
  assert(id != null, stepLabel(`${basePath} POST returns id`));

  try {
    const patched = await request(`${basePath}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patchBody),
    });
    assert(patched.status === 200, stepLabel(`${basePath}/${id} PATCH → 200 (got ${patched.status})`));

    const del = await request(`${basePath}/${id}`, { method: "DELETE" });
    assert(del.status === 200, stepLabel(`${basePath}/${id} DELETE → 200 (got ${del.status})`));
    logOk(`${basePath} POST/PATCH/DELETE`);
  } catch (err) {
    await request(`${basePath}/${id}`, { method: "DELETE" }).catch(() => {});
    throw err;
  }
}

async function testCollections() {
  section("Admin collection CRUD");

  await collectionCrud(
    "/api/admin/nav-items",
    { href: `/e2e-${TS}`, label: `Nav ${TS}` },
    { label: `Nav patched ${TS}` },
  );

  await collectionCrud(
    "/api/admin/home-marquee",
    { text: `Marquee ${TS}` },
    { text: `Marquee patched ${TS}` },
  );

  await collectionCrud(
    "/api/admin/home-explore",
    { href: `/e2e-${TS}`, title: `Card ${TS}`, body: "E2E body" },
    { title: `Card patched ${TS}` },
  );

  await collectionCrud(
    "/api/admin/about-built-for",
    { title: `Built ${TS}`, description: "E2E description" },
    { title: `Built patched ${TS}` },
  );

  await collectionCrud(
    "/api/admin/process-steps",
    { stepLabel: "E2E", stepNumber: "99", title: `Step ${TS}`, body: "E2E step body" },
    { title: `Step patched ${TS}` },
  );

  await collectionCrud(
    "/api/admin/industry-sectors",
    { name: `Sector ${TS}` },
    { name: `Sector patched ${TS}` },
  );

  await collectionCrud(
    "/api/admin/footer-nav",
    { href: `/e2e-${TS}`, label: `Footer ${TS}`, group: "primary" },
    { label: `Footer patched ${TS}` },
  );

  await collectionCrud(
    "/api/admin/job-openings",
    {
      title: `Opening ${TS}`,
      slug: TS,
      department: "Intelligence",
      location: "Remote",
      type: "Full-time",
      description: `E2E opening body ${TS}`,
      requirements: [`Req ${TS}`],
    },
    { title: `Opening patched ${TS}` },
  );

  const sectionRes = await request("/api/admin/service-sections", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tabId: `e2e-tab-${TS}`,
      eyebrow: "E2E",
      title: `Section ${TS}`,
      body: "E2E section body",
    }),
  });
  assert(sectionRes.status === 201, stepLabel(`service-sections POST → 201 (got ${sectionRes.status})`));
  const sectionId = (sectionRes.json as { id?: number })?.id;
  assert(sectionId != null, stepLabel("service-sections POST returns id"));

  try {
    const itemRes = await request(`/api/admin/service-sections/${sectionId}/items`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: `Item ${TS}` }),
    });
    assert(itemRes.status === 201, stepLabel(`service-items POST → 201 (got ${itemRes.status})`));
    const itemId = (itemRes.json as { id?: number })?.id;
    assert(itemId != null, stepLabel("service-items POST returns id"));

    try {
      const itemPatch = await request(
        `/api/admin/service-sections/${sectionId}/items/${itemId}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title: `Item patched ${TS}` }),
        },
      );
      assert(itemPatch.status === 200, stepLabel(`service-items PATCH → 200 (got ${itemPatch.status})`));

      const itemDel = await request(
        `/api/admin/service-sections/${sectionId}/items/${itemId}`,
        { method: "DELETE" },
      );
      assert(itemDel.status === 200, stepLabel(`service-items DELETE → 200 (got ${itemDel.status})`));
      logOk("service-sections/[id]/items POST/PATCH/DELETE");
    } catch (err) {
      const iid = (itemRes.json as { id?: number })?.id;
      if (iid) {
        await request(`/api/admin/service-sections/${sectionId}/items/${iid}`, {
          method: "DELETE",
        }).catch(() => {});
      }
      throw err;
    }

    const sectionDel = await request(`/api/admin/service-sections/${sectionId}`, {
      method: "DELETE",
    });
    assert(sectionDel.status === 200, stepLabel(`service-sections DELETE → 200 (got ${sectionDel.status})`));
    logOk("service-sections POST/DELETE");
  } catch (err) {
    await request(`/api/admin/service-sections/${sectionId}`, { method: "DELETE" }).catch(() => {});
    throw err;
  }
}

// ─── 4. JSON round-trip ────────────────────────────────────────────────────

async function testJsonRoundTrip() {
  section("JSON fields round-trip");

  const storyItems = [`E2E line A ${TS}`, `E2E line B ${TS}`];
  const storyPatch = await request("/api/admin/story-page", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ manifestoItems: storyItems }),
  });
  assert(storyPatch.status === 200, stepLabel(`story-page PATCH manifestoItems → 200 (got ${storyPatch.status})`));

  const storyGet = await request("/api/admin/story-page");
  const gotStory = (storyGet.json as { manifestoItems?: unknown })?.manifestoItems;
  assert(Array.isArray(gotStory), stepLabel("story manifestoItems is array"));
  assert(
    JSON.stringify(gotStory) === JSON.stringify(storyItems),
    stepLabel(`story manifestoItems round-trip: ${JSON.stringify(gotStory)}`),
  );

  const storyHtml = await request("/story");
  assert(storyHtml.status === 200, stepLabel(`GET /story → 200 (got ${storyHtml.status})`));
  for (const line of storyItems) {
    assert(storyHtml.text.includes(line), stepLabel(`/story HTML contains "${line}"`));
  }

  const d1Story = d1JsonColumn("SELECT manifesto_items FROM story_page WHERE id = 1;", "manifesto_items");
  assert(Array.isArray(d1Story), stepLabel("D1 manifesto_items is JSON array"));
  logOk("story-page manifestoItems round-trip");

  const contactItems = [`Include A ${TS}`, `Include B ${TS}`];
  const contactPatch = await request("/api/admin/contact-page", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ whatToIncludeItems: contactItems }),
  });
  assert(contactPatch.status === 200, stepLabel(`contact-page PATCH → 200 (got ${contactPatch.status})`));

  const contactGet = await request("/api/admin/contact-page");
  const gotContact = (contactGet.json as { whatToIncludeItems?: unknown })?.whatToIncludeItems;
  assert(Array.isArray(gotContact), stepLabel("contact whatToIncludeItems is array"));
  assert(
    JSON.stringify(gotContact) === JSON.stringify(contactItems),
    stepLabel(`contact whatToIncludeItems round-trip`),
  );

  const contactHtml = await request("/contact");
  assert(contactHtml.status === 200, stepLabel(`GET /contact → 200 (got ${contactHtml.status})`));
  for (const line of contactItems) {
    assert(contactHtml.text.includes(line), stepLabel(`/contact HTML contains "${line}"`));
  }

  const d1Contact = d1JsonColumn(
    "SELECT what_to_include_items FROM contact_page WHERE id = 1;",
    "what_to_include_items",
  );
  assert(Array.isArray(d1Contact), stepLabel("D1 what_to_include_items is JSON array"));
  logOk("contact-page whatToIncludeItems round-trip");

  const careerItems = [`Benefit A ${TS}`, `Benefit B ${TS}`];
  const careerPatch = await request("/api/admin/career-page", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ benefits: careerItems }),
  });
  assert(careerPatch.status === 200, stepLabel(`career-page PATCH benefits → 200 (got ${careerPatch.status})`));

  const careerGet = await request("/api/admin/career-page");
  const gotCareer = (careerGet.json as { benefits?: unknown })?.benefits;
  assert(Array.isArray(gotCareer), stepLabel("career benefits is array"));
  assert(
    JSON.stringify(gotCareer) === JSON.stringify(careerItems),
    stepLabel("career benefits round-trip"),
  );

  const careerHtml = await request("/careers");
  assert(careerHtml.status === 200, stepLabel(`GET /careers → 200 (got ${careerHtml.status})`));
  for (const line of careerItems) {
    assert(careerHtml.text.includes(line), stepLabel(`/careers HTML contains "${line}"`));
  }

  const d1Career = d1JsonColumn("SELECT benefits FROM career_page WHERE id = 1;", "benefits");
  assert(Array.isArray(d1Career), stepLabel("D1 career_page.benefits is JSON array"));
  logOk("career-page benefits round-trip");
}

// ─── 5. R2 upload + delete ───────────────────────────────────────────────────

async function testR2() {
  section("R2 upload + delete");

  const form = new FormData();
  form.append("file", pngBlob(), "e2e.png");
  const uploadRes = await fetch(`${base}/api/admin/upload`, {
    method: "POST",
    headers: jar.header() ? { cookie: jar.header()! } : {},
    body: form,
  });
  jar.ingest(uploadRes);
  const uploadJson = (await uploadRes.json()) as { url?: string; key?: string };
  assert(uploadRes.status === 200, stepLabel(`upload POST → 200 (got ${uploadRes.status})`));
  assert(uploadJson.url && uploadJson.key, stepLabel("upload returns url + key"));
  const { url, key } = uploadJson as { url: string; key: string };
  logOk(`upload → key=${key}`);

  const localExists = r2ObjectExists(key);
  const imgGet = await fetch(url);
  assert(
    localExists || imgGet.status === 200,
    stepLabel(`R2 object visible locally or at public URL (local=${localExists}, http=${imgGet.status})`),
  );
  if (localExists) logOk("R2 object exists locally");
  if (imgGet.status === 200) {
    assert(
      (imgGet.headers.get("content-type") ?? "").includes("image/png"),
      stepLabel(`public url content-type image/png (got ${imgGet.headers.get("content-type")})`),
    );
    logOk("GET public R2 URL → 200 image/png");
  } else {
    logOk(`GET public R2 URL → ${imgGet.status} (expected locally — object only in wrangler --local R2)`);
  }

  const logoPatch = await request("/api/admin/site-settings", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ logoUrl: url }),
  });
  assert(logoPatch.status === 200, stepLabel(`site-settings logoUrl PATCH → 200 (got ${logoPatch.status})`));

  const home = await request("/");
  assert(home.status === 200, stepLabel(`GET / with logo → 200 (got ${home.status})`));
  assert(home.text.includes(url), stepLabel("home HTML contains logo URL"));
  logOk("logo renders on home");

  const del = await request("/api/admin/upload", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key }),
  });
  assert(del.status === 200, stepLabel(`upload DELETE → 200 (got ${del.status})`));

  assert(!r2ObjectExists(key), stepLabel("R2 object gone after delete (wrangler --local)"));
  logOk("DELETE removes R2 object");

  const imgAfter = await fetch(url);
  if (imgAfter.status === 404 || imgGet.status !== 200) {
    logOk(`GET public R2 URL after delete → ${imgAfter.status}`);
  } else {
    assert(imgAfter.status === 404, stepLabel(`GET public url after delete → 404 (got ${imgAfter.status})`));
  }

  const clearLogo = await request("/api/admin/site-settings", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ logoUrl: null }),
  });
  assert(clearLogo.status === 200, stepLabel(`clear logoUrl → 200 (got ${clearLogo.status})`));

  const homeAfter = await request("/");
  assert(homeAfter.status === 200, stepLabel(`GET / after logo clear → 200 (got ${homeAfter.status})`));
  logOk("home loads after logo cleared");
}

// ─── 6. Contact + Leads ──────────────────────────────────────────────────────

async function testContact() {
  section("Contact form + Leads");

  const leadEmail = `${TS}@example.com`;
  const contact = await request("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: `E2E ${TS}`,
      email: leadEmail,
      message: `Phase 7 E2E contact ${TS}`,
      source: "e2e-preview",
    }),
  });
  assert(contact.status === 200, stepLabel(`POST /api/contact → 200 (got ${contact.status})`));
  assert((contact.json as { ok?: boolean })?.ok === true, stepLabel("contact ok:true"));
  const leadId = (contact.json as { id?: string })?.id;
  assert(leadId, stepLabel("contact returns lead id"));
  logOk(`contact lead created id=${leadId}`);

  const list = await request("/api/admin/submissions");
  assert(list.status === 200, stepLabel(`GET submissions → 200 (got ${list.status})`));
  const leads = list.json as { id: string; email?: string }[];
  assert(
    Array.isArray(leads) && leads.some((l) => l.id === leadId),
    stepLabel("submissions list includes new lead"),
  );

  const markRead = await request(`/api/admin/submissions/${leadId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ read: true }),
  });
  assert(markRead.status === 200, stepLabel(`PATCH submission read → 200 (got ${markRead.status})`));
  assert((markRead.json as { read?: boolean })?.read === true, stepLabel("lead read:true"));
  logOk("lead marked read");
  logOk("CF Email Service send is best-effort (lead saved regardless of delivery)");
}

function pdfBlob(): Blob {
  return new Blob(["%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF\n"], { type: "application/pdf" });
}

function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function validApplyForm(email: string, extras?: { cnic?: string; dob?: string; photo?: Blob | null; photoName?: string; photoType?: string; declaration?: string | null }) {
  const apply = new FormData();
  apply.append("name", `Applicant ${TS}`);
  apply.append("email", email);
  apply.append("phone", "+923001111111");
  apply.append("jobSlug", "research-analyst");
  apply.append("coverNote", `Cover ${TS}`);
  apply.append("dateOfBirth", extras?.dob ?? "1995-06-15");
  apply.append("gender", "female");
  apply.append("nationality", "Pakistan");
  if (extras?.cnic !== "") apply.append("cnic", extras?.cnic ?? "35201-1234567-1");
  apply.append("currentAddress", "Street 1, Gulberg");
  apply.append("city", "Lahore");
  apply.append("highestQualification", "bachelor");
  apply.append("yearsOfExperience", "3");
  apply.append("keySkills", "research, writing");
  apply.append("noticePeriodDays", "30");
  apply.append("expectedSalary", "150000");
  apply.append("availableFrom", todayIso());
  if (extras?.declaration !== null) apply.append("declarationAccepted", extras?.declaration ?? "true");
  apply.append("resume", pdfBlob(), "resume.pdf");
  if (extras?.photo !== null) {
    const photo = extras?.photo ?? jpegBlob();
    apply.append("photo", photo, extras?.photoName ?? "photo.jpg");
  }
  return apply;
}

async function testCareers() {
  section("Careers apply + hidden opening");

  const hiddenSlug = `e2e-hidden-${TS}`;
  const hidden = await request("/api/admin/job-openings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: `Hidden ${TS}`,
      slug: hiddenSlug,
      department: "Intelligence",
      location: "Remote",
      type: "Full-time",
      description: `Hidden opening ${TS}`,
      visible: false,
    }),
  });
  assert(hidden.status === 201, stepLabel(`hidden opening POST → 201 (got ${hidden.status})`));
  const hiddenBody = hidden.json as { id?: number; responsibilities?: unknown; seniority?: unknown };
  const hiddenId = hiddenBody.id;
  assert(hiddenId != null, stepLabel("hidden opening returns id"));
  assert(
    Array.isArray(hiddenBody.responsibilities),
    stepLabel("opening POST omitting new fields still 201 with responsibilities[]"),
  );

  try {
    const hiddenPublic = await request(`/careers/${hiddenSlug}`);
    assert(
      hiddenPublic.status === 404,
      stepLabel(`GET /careers/${hiddenSlug} hidden → 404 (got ${hiddenPublic.status})`),
    );
    logOk("hidden opening 404s on public site");
  } finally {
    await request(`/api/admin/job-openings/${hiddenId}`, { method: "DELETE" }).catch(() => {});
  }

  const trapEmail = `trap-${TS}@example.com`;
  const trap = new FormData();
  trap.append("name", `Trap ${TS}`);
  trap.append("email", trapEmail);
  trap.append("jobSlug", "research-analyst");
  trap.append("website", "https://spam.example");
  const trapRes = await fetch(`${base}/api/careers/apply`, { method: "POST", body: trap, redirect: "manual" });
  const trapJson = (await trapRes.json()) as { error?: string };
  assert(trapRes.status === 400, stepLabel(`apply honeypot → 400 (got ${trapRes.status})`));
  assert(trapJson.error === "Invalid submission", stepLabel("honeypot error Invalid submission"));
  const trapList = await request("/api/admin/job-applications");
  assert(trapList.status === 200, stepLabel(`GET job-applications after honeypot → 200 (got ${trapList.status})`));
  const trapApps = trapList.json as { email?: string }[];
  assert(
    Array.isArray(trapApps) && !trapApps.some((row) => row.email === trapEmail),
    stepLabel("honeypot created no job_applications row"),
  );
  logOk("honeypot apply → 400, no row");

  const missingCnic = validApplyForm(`cnic-${TS}@example.com`, { cnic: "" });
  const missingCnicRes = await fetch(`${base}/api/careers/apply`, { method: "POST", body: missingCnic, redirect: "manual" });
  assert(missingCnicRes.status === 400, stepLabel(`apply missing PK CNIC → 400 (got ${missingCnicRes.status})`));

  const missingPhoto = validApplyForm(`photo-${TS}@example.com`, { photo: null });
  const missingPhotoRes = await fetch(`${base}/api/careers/apply`, { method: "POST", body: missingPhoto, redirect: "manual" });
  assert(missingPhotoRes.status === 400, stepLabel(`apply missing photo → 400 (got ${missingPhotoRes.status})`));

  const missingDecl = validApplyForm(`decl-${TS}@example.com`, { declaration: null });
  const missingDeclRes = await fetch(`${base}/api/careers/apply`, { method: "POST", body: missingDecl, redirect: "manual" });
  assert(missingDeclRes.status === 400, stepLabel(`apply missing declaration → 400 (got ${missingDeclRes.status})`));

  // Rate limit is careers:${ip} 5/min — wait a window before more POSTs.
  await new Promise((resolve) => setTimeout(resolve, 61_000));

  const bigPhoto = new Blob([new Uint8Array(2 * 1024 * 1024 + 1)], { type: "image/jpeg" });
  const oversize = validApplyForm(`oversize-${TS}@example.com`, { photo: bigPhoto, photoName: "photo.jpg" });
  const oversizeRes = await fetch(`${base}/api/careers/apply`, { method: "POST", body: oversize, redirect: "manual" });
  assert(oversizeRes.status === 413, stepLabel(`apply oversized photo → 413 (got ${oversizeRes.status})`));

  const badMime = validApplyForm(`mime-${TS}@example.com`, {
    photo: new Blob(["gif"], { type: "image/gif" }),
    photoName: "photo.gif",
  });
  const badMimeRes = await fetch(`${base}/api/careers/apply`, { method: "POST", body: badMime, redirect: "manual" });
  assert(badMimeRes.status === 400, stepLabel(`apply bad photo MIME → 400 (got ${badMimeRes.status})`));

  const futureDob = validApplyForm(`dob-${TS}@example.com`, { dob: "2099-01-01" });
  const futureDobRes = await fetch(`${base}/api/careers/apply`, { method: "POST", body: futureDob, redirect: "manual" });
  assert(futureDobRes.status === 400, stepLabel(`apply future DOB → 400 (got ${futureDobRes.status})`));
  logOk("apply validation: CNIC / photo / declaration / size / MIME / DOB");

  const applyEmail = `${TS}@example.com`;
  const apply = validApplyForm(applyEmail);
  const applyRes = await fetch(`${base}/api/careers/apply`, { method: "POST", body: apply, redirect: "manual" });
  const applyJson = (await applyRes.json()) as Record<string, unknown>;
  assert(applyRes.status === 200, stepLabel(`apply happy path → 200 (got ${applyRes.status})`));
  assert(applyJson.ok === true, stepLabel("apply ok:true"));
  assert(typeof applyJson.id === "string", stepLabel("apply returns id"));
  assert(!("url" in applyJson), stepLabel("apply JSON has no url"));
  assert(!("resumeKey" in applyJson), stepLabel("apply JSON has no resumeKey"));
  assert(!("photoKey" in applyJson), stepLabel("apply JSON has no photoKey"));
  logOk(`apply created id=${applyJson.id}`);

  const detail = await request(`/api/admin/job-applications/${applyJson.id}`);
  assert(detail.status === 200, stepLabel(`GET job-application detail → 200 (got ${detail.status})`));
  const row = detail.json as { jobTitle?: string; resumeKey?: string; photoKey?: string; cnic?: string | null };
  assert(row.jobTitle === "Research Analyst", stepLabel("denormalized job_title persisted"));
  assert(typeof row.resumeKey === "string" && row.resumeKey.startsWith("resumes/"), stepLabel("resume_key under resumes/"));
  assert(typeof row.photoKey === "string" && row.photoKey.startsWith("photos/"), stepLabel("photo_key under photos/"));
  assert(row.cnic === "3520112345671", stepLabel("CNIC stored as 13 digits"));
  const resumeKey = row.resumeKey;

  const inbox = await request("/api/admin/job-applications");
  assert(inbox.status === 200, stepLabel(`GET job-applications → 200 (got ${inbox.status})`));
  const apps = inbox.json as { id: string }[];
  assert(Array.isArray(apps) && apps.some((item) => item.id === applyJson.id), stepLabel("inbox includes new application"));

  const resumeGet = await request(`/api/admin/job-applications/${applyJson.id}/resume`);
  assert(resumeGet.status === 200, stepLabel(`admin resume GET → 200 (got ${resumeGet.status})`));
  const photoGet = await request(`/api/admin/job-applications/${applyJson.id}/photo`);
  assert(photoGet.status === 200, stepLabel(`admin photo GET → 200 (got ${photoGet.status})`));
  const localResume = r2ObjectExists(resumeKey!);
  assert(
    localResume || resumeGet.status === 200,
    stepLabel(`resume in local R2 or admin stream (local=${localResume})`),
  );
  logOk("admin resume + photo download → 200");
  logOk("apply 200 is independent of applicant confirmation email");

  const noTokenEdu = await fetch(`${base}/api/careers/apply/draft/education`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ highestQualification: "bachelor" }),
    redirect: "manual",
  });
  assert(
    noTokenEdu.status === 400 || noTokenEdu.status === 404,
    stepLabel(`education PUT without token → 400/404 (got ${noTokenEdu.status})`),
  );

  const draftCreate = await fetch(`${base}/api/careers/apply/draft`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jobSlug: "research-analyst" }),
    redirect: "manual",
  });
  const draftCreateJson = (await draftCreate.json()) as { token?: string; jobOpeningId?: number };
  assert(draftCreate.status === 200, stepLabel(`draft create → 200 (got ${draftCreate.status})`));
  assert(typeof draftCreateJson.token === "string", stepLabel("draft create returns token"));
  logOk("draft step 1 create returns token");

  const stamp = String(Date.now()).slice(-8);
  const cnicDup = `35301${stamp}`;
  const emailDup = `dup-${TS}@example.com`;
  const emailCnic = `cnic-dup-${TS}@example.com`;

  async function putPersonal(token: string, applyEmail: string, applyCnic: string) {
    return fetch(`${base}/api/careers/apply/draft/personal`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token,
        name: `Wizard ${TS}`,
        email: applyEmail,
        phone: "+923001111111",
        dateOfBirth: "1995-06-15",
        gender: "female",
        nationality: "Pakistan",
        cnic: applyCnic,
        currentAddress: "Street 1, Gulberg",
        city: "Lahore",
      }),
      redirect: "manual",
    });
  }

  async function putEducation(token: string) {
    return fetch(`${base}/api/careers/apply/draft/education`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, highestQualification: "bachelor" }),
      redirect: "manual",
    });
  }

  async function putProfessional(token: string) {
    return fetch(`${base}/api/careers/apply/draft/professional`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, yearsOfExperience: 3, coverNote: `Cover ${TS}` }),
      redirect: "manual",
    });
  }

  async function putOther(token: string) {
    const form = new FormData();
    form.append("token", token);
    form.append("keySkills", "research, writing");
    form.append("noticePeriodDays", "30");
    form.append("expectedSalary", "150000");
    form.append("availableFrom", todayIso());
    form.append("declarationAccepted", "true");
    form.append("resume", pdfBlob(), "resume.pdf");
    form.append("photo", jpegBlob(), "photo.jpg");
    return fetch(`${base}/api/careers/apply/draft/other`, { method: "PUT", body: form, redirect: "manual" });
  }

  async function fillDraft(applyEmail: string, applyCnic: string) {
    const created = await fetch(`${base}/api/careers/apply/draft`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobSlug: "research-analyst" }),
      redirect: "manual",
    });
    const createdJson = (await created.json()) as { token?: string };
    assert(created.status === 200 && typeof createdJson.token === "string", stepLabel("draft header created"));
    const token = createdJson.token!;
    const personal = await putPersonal(token, applyEmail, applyCnic);
    assert(personal.status === 200, stepLabel(`draft personal → 200 (got ${personal.status})`));
    const education = await putEducation(token);
    assert(education.status === 200, stepLabel(`draft education → 200 (got ${education.status})`));
    const professional = await putProfessional(token);
    assert(professional.status === 200, stepLabel(`draft professional → 200 (got ${professional.status})`));
    const other = await putOther(token);
    assert(other.status === 200, stepLabel(`draft other → 200 (got ${other.status})`));
    return token;
  }

  const tokenA = await fillDraft(emailDup, cnicDup);
  const tokenB = await fillDraft(emailDup, cnicDup);
  const tokenC = await fillDraft(emailCnic, cnicDup);
  logOk("two in-progress drafts for same email+job allowed");

  await new Promise((resolve) => setTimeout(resolve, 61_000));

  const submitA = await fetch(`${base}/api/careers/apply/draft/submit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: tokenA }),
    redirect: "manual",
  });
  const submitAJson = (await submitA.json()) as Record<string, unknown>;
  assert(submitA.status === 200, stepLabel(`draft submit A → 200 (got ${submitA.status})`));
  assert(submitAJson.ok === true, stepLabel("draft submit A ok:true"));
  assert(typeof submitAJson.id === "string", stepLabel("draft submit A returns id"));
  assert(!("resumeKey" in submitAJson), stepLabel("draft submit JSON has no resumeKey"));
  assert(!("photoKey" in submitAJson), stepLabel("draft submit JSON has no photoKey"));

  const wizardDetail = await request(`/api/admin/job-applications/${submitAJson.id}`);
  assert(wizardDetail.status === 200, stepLabel(`wizard application detail → 200 (got ${wizardDetail.status})`));
  const wizardRow = wizardDetail.json as { cnic?: string | null; resumeKey?: string; photoKey?: string };
  assert(wizardRow.cnic === cnicDup, stepLabel("wizard CNIC stored as 13 digits"));
  assert(typeof wizardRow.resumeKey === "string" && wizardRow.resumeKey.startsWith("resumes/"), stepLabel("wizard resume_key under resumes/"));
  assert(typeof wizardRow.photoKey === "string" && wizardRow.photoKey.startsWith("photos/"), stepLabel("wizard photo_key under photos/"));

  const submitB = await fetch(`${base}/api/careers/apply/draft/submit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: tokenB }),
    redirect: "manual",
  });
  const submitBJson = (await submitB.json()) as {
    error?: string;
    alreadyApplied?: boolean;
    portalUrl?: string;
  };
  assert(submitB.status === 409, stepLabel(`second submit same email → 409 (got ${submitB.status})`));
  assert(submitBJson.error === "You've already applied for this role.", stepLabel("duplicate message is stable"));
  assert(submitBJson.alreadyApplied === true, stepLabel("duplicate response has alreadyApplied:true"));
  assert(
    submitBJson.portalUrl === "/portal/login?next=/portal",
    stepLabel("duplicate response points at the portal"),
  );
  assert(!("existingId" in submitBJson), stepLabel("duplicate response leaks no application id"));

  const submitC = await fetch(`${base}/api/careers/apply/draft/submit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: tokenC }),
    redirect: "manual",
  });
  assert(submitC.status === 409, stepLabel(`same CNIC different email → 409 (got ${submitC.status})`));

  const inboxAfter = await request("/api/admin/job-applications");
  const inboxApps = inboxAfter.json as { id?: string; email?: string }[];
  const dupRows = Array.isArray(inboxApps) ? inboxApps.filter((row) => row.email === emailDup) : [];
  assert(dupRows.length === 1, stepLabel(`one job_applications row for duplicate email (got ${dupRows.length})`));
  logOk("draft uniqueness: email + CNIC 409, one row");
}

// ─── 7. Public routes ────────────────────────────────────────────────────────

async function testPublicRoutes() {
  section("Public routes");

  const paths = [
    "/",
    "/about",
    "/services",
    "/process",
    "/industries",
    "/industries/construction-built-environment",
    "/story",
    "/blog",
    "/careers",
    "/careers/research-analyst",
    "/contact",
    "/privacy",
    "/terms",
  ];

  for (const path of paths) {
    const res = await request(path);
    assert(res.status === 200, stepLabel(`${path} → 200 (got ${res.status})`));
    logOk(`${path} → 200`);
  }
}

// ─── Snapshot / teardown (restore even if a suite throws) ─────────────────────

type CmsSnapshot = {
  singletons: { path: string; field: string; original: unknown }[];
  manifestoItems: unknown;
  whatToIncludeItems: unknown;
  careerBenefits: unknown;
};

function isE2eText(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (
    value === "E2E" ||
    value === "E2E description" ||
    value === "E2E body" ||
    value === "E2E step body" ||
    value === "E2E section body"
  ) {
    return true;
  }
  return /e2e-/i.test(value) || value.includes(TS);
}

async function snapshotCms(): Promise<CmsSnapshot> {
  section("CMS snapshot");

  const singletons: CmsSnapshot["singletons"] = [];
  let manifestoItems: unknown;
  let whatToIncludeItems: unknown;
  let careerBenefits: unknown;

  for (const route of SINGLETONS) {
    const get = await request(route.path);
    assert(get.status === 200, stepLabel(`snapshot ${route.path} GET → 200 (got ${get.status})`));
    const body = get.json as Record<string, unknown> | null;
    assert(body != null, stepLabel(`snapshot ${route.path} JSON body`));
    singletons.push({
      path: route.path,
      field: route.field,
      original: sanitizeSnapshotValue(route.path, route.field, body[route.field]),
    });
    if (route.path === "/api/admin/site-settings") {
      singletons.push({ path: route.path, field: "logoUrl", original: body.logoUrl ?? null });
    }
    if (route.path === "/api/admin/story-page") manifestoItems = body.manifestoItems;
    if (route.path === "/api/admin/contact-page") whatToIncludeItems = body.whatToIncludeItems;
    if (route.path === "/api/admin/career-page") careerBenefits = body.benefits;
  }

  assert(Array.isArray(manifestoItems), stepLabel("snapshot manifestoItems is array"));
  assert(Array.isArray(whatToIncludeItems), stepLabel("snapshot whatToIncludeItems is array"));
  assert(Array.isArray(careerBenefits), stepLabel("snapshot careerBenefits is array"));
  logOk(`snapshotted ${singletons.length} singleton fields + JSON lists`);

  return { singletons, manifestoItems, whatToIncludeItems, careerBenefits };
}

async function restoreSingletons(snapshot: CmsSnapshot) {
  const errors: string[] = [];

  for (const row of snapshot.singletons) {
    const patch = await request(row.path, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [row.field]: row.original }),
    });
    if (patch.status !== 200) {
      errors.push(`${row.path}.${row.field} restore → ${patch.status}`);
      continue;
    }
    logOk(`restored ${row.path}.${row.field}`);
  }

  const storyPatch = await request("/api/admin/story-page", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ manifestoItems: snapshot.manifestoItems }),
  });
  if (storyPatch.status !== 200) {
    errors.push(`story-page manifestoItems restore → ${storyPatch.status}`);
  } else {
    logOk("restored story-page.manifestoItems");
  }

  const contactPatch = await request("/api/admin/contact-page", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ whatToIncludeItems: snapshot.whatToIncludeItems }),
  });
  if (contactPatch.status !== 200) {
    errors.push(`contact-page whatToIncludeItems restore → ${contactPatch.status}`);
  } else {
    logOk("restored contact-page.whatToIncludeItems");
  }

  const careerPatch = await request("/api/admin/career-page", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ benefits: snapshot.careerBenefits }),
  });
  if (careerPatch.status !== 200) {
    errors.push(`career-page benefits restore → ${careerPatch.status}`);
  } else {
    logOk("restored career-page.benefits");
  }

  return errors;
}

type CollectionSweep = {
  listPath: string;
  deletePath: (id: number) => string;
  match: (row: Record<string, unknown>) => boolean;
};

async function sweepE2eCollections() {
  const sweeps: CollectionSweep[] = [
    {
      listPath: "/api/admin/nav-items",
      deletePath: (id) => `/api/admin/nav-items/${id}`,
      match: (row) => isE2eText(row.href) || isE2eText(row.label),
    },
    {
      listPath: "/api/admin/home-marquee",
      deletePath: (id) => `/api/admin/home-marquee/${id}`,
      match: (row) => isE2eText(row.text),
    },
    {
      listPath: "/api/admin/home-explore",
      deletePath: (id) => `/api/admin/home-explore/${id}`,
      match: (row) => isE2eText(row.href) || isE2eText(row.title),
    },
    {
      listPath: "/api/admin/about-built-for",
      deletePath: (id) => `/api/admin/about-built-for/${id}`,
      match: (row) => isE2eText(row.title) || isE2eText(row.description),
    },
    {
      listPath: "/api/admin/process-steps",
      deletePath: (id) => `/api/admin/process-steps/${id}`,
      match: (row) => isE2eText(row.stepLabel) || isE2eText(row.title),
    },
    {
      listPath: "/api/admin/industry-sectors",
      deletePath: (id) => `/api/admin/industry-sectors/${id}`,
      match: (row) => isE2eText(row.name),
    },
    {
      listPath: "/api/admin/footer-nav",
      deletePath: (id) => `/api/admin/footer-nav/${id}`,
      match: (row) => isE2eText(row.href) || isE2eText(row.label),
    },
    {
      listPath: "/api/admin/service-sections",
      deletePath: (id) => `/api/admin/service-sections/${id}`,
      match: (row) => isE2eText(row.tabId) || isE2eText(row.eyebrow) || isE2eText(row.title),
    },
    {
      listPath: "/api/admin/job-openings",
      deletePath: (id) => `/api/admin/job-openings/${id}`,
      match: (row) => isE2eText(row.slug) || isE2eText(row.title),
    },
  ];

  const errors: string[] = [];

  for (const sweep of sweeps) {
    const list = await request(sweep.listPath);
    if (list.status !== 200 || !Array.isArray(list.json)) {
      errors.push(`${sweep.listPath} GET → ${list.status}`);
      continue;
    }
    const rows = list.json as Record<string, unknown>[];
    for (const row of rows) {
      if (!sweep.match(row)) continue;
      const id = row.id;
      if (typeof id !== "number") {
        errors.push(`${sweep.listPath} leftover missing numeric id`);
        continue;
      }
      const del = await request(sweep.deletePath(id), { method: "DELETE" });
      if (del.status !== 200) {
        errors.push(`${sweep.deletePath(id)} DELETE → ${del.status}`);
        continue;
      }
      logOk(`swept ${sweep.deletePath(id)}`);
    }
  }

  return errors;
}

function deleteE2eLeads() {
  d1Query(
    `DELETE FROM leads WHERE source = 'e2e-preview' OR email LIKE '%e2e-%@example.com' OR message LIKE '%Phase 7 E2E%';`,
  );
  logOk("deleted e2e-preview leads");
}

function deleteE2eApplications() {
  d1Query(
    `DELETE FROM job_applications WHERE email LIKE '%e2e-%@example.com' OR name LIKE '%e2e-%' OR job_title LIKE '%e2e-%';`,
  );
  logOk("deleted e2e-preview job_applications");
}

function restorePublicCtaIfDirty() {
  d1Query(
    `UPDATE cta_buttons SET label = 'Talk to Us', href = '/contact' WHERE label LIKE '%e2e-%';`,
  );
  const rows = d1Query(`SELECT label FROM cta_buttons WHERE id = 1;`) as { label?: string }[];
  const label = rows[0]?.label ?? "";
  assert(!/e2e-/i.test(label), stepLabel(`cta_buttons.label is public copy (got ${label})`));
  logOk(`cta_buttons.label = ${label}`);
}

async function teardownCms(snapshot: CmsSnapshot) {
  section("CMS teardown");
  const errors = [
    ...(await restoreSingletons(snapshot)),
    ...(await sweepE2eCollections()),
  ];
  try {
    deleteE2eLeads();
    deleteE2eApplications();
    restorePublicCtaIfDirty();
  } catch (err) {
    errors.push(`lead delete failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (errors.length > 0) {
    throw new Error(`CMS teardown failed:\n  - ${errors.join("\n  - ")}`);
  }
  logOk("CMS restored");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`E2E preview regression — base=${base} suffix=${TS}`);
  await testAuth();

  const snapshot = await snapshotCms();

  let testError: unknown;
  try {
    await testSingletons(snapshot);
    await testCollections();
    await testJsonRoundTrip();
    await testR2();
    await testContact();
    await testCareers();
    await testPublicRoutes();
    console.log("\n✓ All Phase 7 E2E checks passed");
  } catch (err) {
    testError = err;
  } finally {
    try {
      await teardownCms(snapshot);
    } catch (teardownErr) {
      console.error("\n✗ CMS teardown failed — local D1 may still be dirty");
      console.error(teardownErr);
      if (testError && !(testError instanceof E2eFail)) console.error(testError);
      process.exit(1);
    }
  }

  if (testError) throw testError;
}

main().catch((err) => {
  if (!(err instanceof E2eFail)) console.error(err);
  process.exit(1);
});
