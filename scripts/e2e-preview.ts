#!/usr/bin/env node
/**
 * Phase 7 local E2E regression against preview (http://127.0.0.1:8787).
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
  assert,
  createClient,
  d1JsonColumn,
  d1Query,
  fail,
  logOk,
  parseArgs,
  pngBlob,
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
if (!email || !password) fail("ADMIN_EMAIL and ADMIN_PASSWORD required in .env");

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
  logOk("GET /admin authed → 200");

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
  { path: "/api/admin/footer", field: "tagline1", value: `Tagline ${TS}` },
];

async function testSingletons() {
  section("Admin singleton PATCH");

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
    logOk(`${route.path} GET/PATCH`);
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

  assert(r2ObjectExists(key), stepLabel(`wrangler r2 object get --local succeeds for ${key}`));
  logOk("R2 object exists locally");

  const imgGet = await fetch(url);
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

// ─── 7. Public routes ────────────────────────────────────────────────────────

async function testPublicRoutes() {
  section("Public routes");

  const paths = [
    "/",
    "/about",
    "/services",
    "/process",
    "/industries",
    "/story",
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

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`E2E preview regression — base=${base} suffix=${TS}`);
  await testAuth();
  await testSingletons();
  await testCollections();
  await testJsonRoundTrip();
  await testR2();
  await testContact();
  await testPublicRoutes();
  console.log("\n✓ All Phase 7 E2E checks passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
