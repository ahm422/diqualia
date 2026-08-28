#!/usr/bin/env node
/**
 * RBAC matrix against local preview (http://127.0.0.1:8787).
 *
 * Covers: bootstrap super_admin, admin, editor, hr (seeded system role), and a
 * custom "Recruiter" role (careers.applications.view only) — nav/route guards,
 * post-login landing, and the applications PII sub-gate.
 *
 * DANGER: mutates local D1 (creates/deletes extra admin users, a custom role,
 * a marquee row, a blog draft, one job application).
 * Loopback-only — same host allowlist as scripts/e2e-preview.ts.
 *
 * Prerequisites: migrate + seed-admin, preview running, ADMIN_EMAIL/ADMIN_PASSWORD in .env
 *
 * Usage:
 *   npm run cf:e2e:rbac
 */
import "dotenv/config";

import { ROLE_IDS } from "@/lib/auth/rbac-ids";

import {
  CookieJar,
  E2eFail,
  assert,
  createClient,
  logOk,
  parseArgs,
  pngBlob,
  jpegBlob,
  section,
  stepLabel,
} from "./lib/e2e-client";

const { base } = parseArgs(process.argv.slice(2));
const TS = Date.now();
const bootstrapEmail = process.env.ADMIN_EMAIL;
const bootstrapPassword = process.env.ADMIN_PASSWORD;
if (!bootstrapEmail || !bootstrapPassword) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD required in .env");
  process.exit(1);
}

const adminEmail = `rbac-admin-${TS}@example.com`;
const editorEmail = `rbac-editor-${TS}@example.com`;
const extraPassword = `rbac-${TS}-Aa1!`;

type Json = Record<string, unknown>;

function client(jar: CookieJar) {
  return createClient(base, jar);
}

async function login(email: string, password: string) {
  const jar = new CookieJar();
  const { request } = client(jar);
  const res = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert(res.status === 200, stepLabel(`login ${email} → 200 (got ${res.status})`));
  return { jar, request };
}

async function jsonRequest(
  request: ReturnType<typeof createClient>["request"],
  path: string,
  init: RequestInit = {},
) {
  return request(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
}

async function main() {
  section("Bootstrap super_admin");
  const superSession = await login(bootstrapEmail, bootstrapPassword);
  const me = await superSession.request("/api/admin/me");
  assert(me.status === 200, stepLabel(`GET /api/admin/me → 200 (got ${me.status})`));
  const meBody = me.json as Json;
  assert(meBody.email === bootstrapEmail, stepLabel("me.email is bootstrap"));
  const perms = meBody.permissions as string[];
  assert(perms.includes("users.delete"), stepLabel("super_admin has users.delete"));
  assert(perms.includes("roles.manage"), stepLabel("super_admin has roles.manage"));
  assert(perms.includes("applications.pii"), stepLabel("super_admin has applications.pii"));
  logOk("bootstrap session is super_admin");

  const createdUserIds: string[] = [];
  const createdRoleIds: string[] = [];
  let customRoleId: string | null = null;
  let marqueeId: number | null = null;
  let draftPostId: string | null = null;

  try {
    section("A. super_admin users/roles/content");
    const createAdmin = await jsonRequest(superSession.request, "/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email: adminEmail,
        name: "RBAC Admin",
        roleId: ROLE_IDS.admin,
        password: extraPassword,
      }),
    });
    assert(createAdmin.status === 201, stepLabel(`create admin user → 201 (got ${createAdmin.status})`));
    createdUserIds.push((createAdmin.json as Json).id as string);

    const createEditor = await jsonRequest(superSession.request, "/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email: editorEmail,
        name: "RBAC Editor",
        roleId: ROLE_IDS.editor,
        password: extraPassword,
      }),
    });
    assert(createEditor.status === 201, stepLabel(`create editor user → 201 (got ${createEditor.status})`));
    const editorId = (createEditor.json as Json).id as string;
    createdUserIds.push(editorId);

    const selfDelete = await superSession.request(`/api/admin/users/${meBody.id as string}`, {
      method: "DELETE",
    });
    assert(selfDelete.status === 400, stepLabel(`delete self → 400 (got ${selfDelete.status})`));

    const renameSystem = await jsonRequest(
      superSession.request,
      `/api/admin/roles/${ROLE_IDS.editor}`,
      { method: "PATCH", body: JSON.stringify({ name: "editor_renamed", permissionKeys: ["content.edit"] }) },
    );
    assert(renameSystem.status === 400, stepLabel(`rename system role → 400 (got ${renameSystem.status})`));

    const deleteSystem = await superSession.request(`/api/admin/roles/${ROLE_IDS.admin}`, {
      method: "DELETE",
    });
    assert(deleteSystem.status === 400, stepLabel(`delete system role → 400 (got ${deleteSystem.status})`));

    const customRole = await jsonRequest(superSession.request, "/api/admin/roles", {
      method: "POST",
      body: JSON.stringify({ name: `rbac_custom_${TS}`, permissionKeys: ["content.edit"] }),
    });
    assert(customRole.status === 201, stepLabel(`create custom role → 201 (got ${customRole.status})`));
    customRoleId = (customRole.json as Json).id as string;

    const collide = await jsonRequest(superSession.request, "/api/admin/roles", {
      method: "POST",
      body: JSON.stringify({ name: "editor", permissionKeys: ["content.edit"] }),
    });
    assert(collide.status === 400, stepLabel(`custom role named editor → 400 (got ${collide.status})`));

    const marquee = await jsonRequest(superSession.request, "/api/admin/home-marquee", {
      method: "POST",
      body: JSON.stringify({ text: `RBAC ${TS}` }),
    });
    assert(marquee.status === 201, stepLabel(`super POST marquee → 201 (got ${marquee.status})`));
    marqueeId = (marquee.json as Json).id as number;

    const draft = await jsonRequest(superSession.request, "/api/admin/blog-posts", {
      method: "POST",
      body: JSON.stringify({
        slug: `rbac-draft-${TS}`,
        title: `RBAC draft ${TS}`,
        excerpt: "RBAC excerpt for publish checks.",
        body: "RBAC body.",
        status: "draft",
      }),
    });
    assert(draft.status === 201, stepLabel(`super POST blog draft → 201 (got ${draft.status})`));
    draftPostId = (draft.json as Json).id as string;

    const publish = await jsonRequest(superSession.request, `/api/admin/blog-posts/${draftPostId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "published" }),
    });
    assert(publish.status === 200, stepLabel(`super publish → 200 (got ${publish.status})`));
    const unpublish = await jsonRequest(superSession.request, `/api/admin/blog-posts/${draftPostId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "draft" }),
    });
    assert(unpublish.status === 200, stepLabel(`super unpublish → 200`));
    logOk("super_admin users/roles/content");

    section("B. admin");
    const adminSession = await login(adminEmail, extraPassword);
    const adminMe = await adminSession.request("/api/admin/me");
    const adminPerms = (adminMe.json as Json).permissions as string[];
    // admin (system role) holds every permission except users.delete.
    assert(!adminPerms.includes("users.delete"), stepLabel("admin lacks users.delete"));
    assert(adminPerms.includes("roles.manage"), stepLabel("admin has roles.manage"));
    assert(adminPerms.includes("users.manage"), stepLabel("admin has users.manage"));

    const usersPage = await adminSession.request("/admin/settings/users");
    assert(usersPage.status === 200, stepLabel(`admin Users page → 200 (got ${usersPage.status})`));
    const rolesPage = await adminSession.request("/admin/settings/roles");
    assert(rolesPage.status === 200, stepLabel(`admin Roles page → 200 (got ${rolesPage.status})`));

    const rolesApi = await adminSession.request("/api/admin/roles");
    assert(rolesApi.status === 200, stepLabel(`admin GET roles → 200 (got ${rolesApi.status})`));

    // ...but not users.delete.
    const delUser = await adminSession.request(`/api/admin/users/${editorId}`, { method: "DELETE" });
    assert(delUser.status === 403, stepLabel(`admin DELETE user → 403 (got ${delUser.status})`));

    const assignSuper = await jsonRequest(adminSession.request, `/api/admin/users/${editorId}`, {
      method: "PATCH",
      body: JSON.stringify({ roleId: ROLE_IDS.super_admin }),
    });
    assert(assignSuper.status === 400, stepLabel(`admin assign super_admin → 400 (got ${assignSuper.status})`));

    const adminPatch = await jsonRequest(adminSession.request, `/api/admin/home-marquee/${marqueeId}`, {
      method: "PATCH",
      body: JSON.stringify({ text: `RBAC admin ${TS}` }),
    });
    assert(adminPatch.status === 200, stepLabel(`admin PATCH marquee → 200 (got ${adminPatch.status})`));
    const adminDel = await adminSession.request(`/api/admin/home-marquee/${marqueeId}`, { method: "DELETE" });
    assert(adminDel.status === 200, stepLabel(`admin DELETE marquee → 200 (got ${adminDel.status})`));
    marqueeId = null;

    const recreate = await jsonRequest(adminSession.request, "/api/admin/home-marquee", {
      method: "POST",
      body: JSON.stringify({ text: `RBAC leftover ${TS}` }),
    });
    assert(recreate.status === 201, stepLabel(`admin POST marquee → 201`));
    marqueeId = (recreate.json as Json).id as number;

    const adminPublish = await jsonRequest(adminSession.request, `/api/admin/blog-posts/${draftPostId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "published" }),
    });
    assert(adminPublish.status === 200, stepLabel(`admin publish → 200 (got ${adminPublish.status})`));
    await jsonRequest(adminSession.request, `/api/admin/blog-posts/${draftPostId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "draft" }),
    });
    logOk("admin matrix");

    const adminRefresh = await adminSession.request("/api/auth/refresh", { method: "POST" });
    assert(adminRefresh.status === 200, stepLabel(`admin refresh → 200 (got ${adminRefresh.status})`));
    logOk("non-bootstrap refresh rotates");

    section("C. editor");
    const editorSession = await login(editorEmail, extraPassword);
    const editorMe = await editorSession.request("/api/admin/me");
    const editorPerms = (editorMe.json as Json).permissions as string[];
    assert(
      editorPerms.includes("cms.view") && editorPerms.includes("cms.edit"),
      stepLabel("editor has cms.view + cms.edit"),
    );
    assert(
      !editorPerms.includes("careers.applications.view") &&
        !editorPerms.includes("contact.view") &&
        !editorPerms.includes("users.manage"),
      stepLabel("editor lacks careers/contact/users perms"),
    );

    const editorUsers = await editorSession.request("/api/admin/users");
    assert(editorUsers.status === 403, stepLabel(`editor GET users → 403 (got ${editorUsers.status})`));
    const editorRoles = await editorSession.request("/api/admin/roles");
    assert(editorRoles.status === 403, stepLabel(`editor GET roles → 403 (got ${editorRoles.status})`));
    const editorUsersPage = await editorSession.request("/admin/settings/users");
    assert(
      editorUsersPage.status === 307 || editorUsersPage.status === 302,
      stepLabel(`editor Users URL → redirect (got ${editorUsersPage.status})`),
    );

    const editorPost = await jsonRequest(editorSession.request, "/api/admin/home-marquee", {
      method: "POST",
      body: JSON.stringify({ text: `RBAC editor ${TS}` }),
    });
    assert(editorPost.status === 201, stepLabel(`editor POST marquee → 201 (got ${editorPost.status})`));
    const editorMarqueeId = (editorPost.json as Json).id as number;

    const editorPatch = await jsonRequest(editorSession.request, `/api/admin/home-marquee/${editorMarqueeId}`, {
      method: "PATCH",
      body: JSON.stringify({ text: `RBAC editor patched ${TS}` }),
    });
    assert(editorPatch.status === 200, stepLabel(`editor PATCH marquee → 200`));

    // cms.edit now covers delete — the legacy content.delete key is no longer checked.
    const editorDelete = await editorSession.request(`/api/admin/home-marquee/${editorMarqueeId}`, {
      method: "DELETE",
    });
    assert(editorDelete.status === 200, stepLabel(`editor DELETE marquee → 200 (got ${editorDelete.status})`));

    // editor keeps content.publish (seeded via migration 0011_rbac_expansion).
    const editorPublish = await jsonRequest(editorSession.request, `/api/admin/blog-posts/${draftPostId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "published" }),
    });
    assert(editorPublish.status === 200, stepLabel(`editor publish → 200 (got ${editorPublish.status})`));
    await jsonRequest(editorSession.request, `/api/admin/blog-posts/${draftPostId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "draft" }),
    });

    const editorGet = await editorSession.request("/api/admin/blog-posts");
    assert(editorGet.status === 200, stepLabel(`editor GET blog-posts → 200`));

    const form = new FormData();
    form.set("file", pngBlob(), "rbac.png");
    const upload = await editorSession.request("/api/admin/upload", { method: "POST", body: form });
    assert(upload.status === 200, stepLabel(`editor upload POST → 200 (got ${upload.status})`));

    // editor has no careers.applications.view.
    const editorApps = await editorSession.request("/api/admin/job-applications");
    assert(editorApps.status === 403, stepLabel(`editor GET job-applications → 403 (got ${editorApps.status})`));
    const editorAppsPage = await editorSession.request("/admin/careers/applications");
    assert(
      editorAppsPage.status === 307 || editorAppsPage.status === 302,
      stepLabel(`editor applications page → redirect (got ${editorAppsPage.status})`),
    );
    logOk("editor matrix");

    section("Applicant fixture + PII gate");
    const apply = new FormData();
    apply.append("name", `RBAC Applicant ${TS}`);
    apply.append("email", `rbac-apply-${TS}@example.com`);
    apply.append("phone", "+923001111111");
    apply.append("jobSlug", "research-analyst");
    apply.append("dateOfBirth", "1994-04-04");
    apply.append("gender", "male");
    apply.append("nationality", "Pakistan");
    const rbacCnic = `35401${String(Date.now()).slice(-8)}`;
    apply.append("cnic", rbacCnic);
    apply.append("currentAddress", "Street 1");
    apply.append("city", "Lahore");
    apply.append("highestQualification", "bachelor");
    apply.append("yearsOfExperience", "2");
    apply.append("keySkills", "research");
    apply.append("noticePeriodDays", "15");
    apply.append("expectedSalary", "120000");
    const now = new Date();
    const availableFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    apply.append("availableFrom", availableFrom);
    apply.append("declarationAccepted", "true");
    apply.append("resume", new Blob(["%PDF-1.4\n"], { type: "application/pdf" }), "resume.pdf");
    apply.append("photo", jpegBlob(), "photo.jpg");
    const applyRes = await fetch(`${base}/api/careers/apply`, { method: "POST", body: apply, redirect: "manual" });
    assert(applyRes.status === 200, stepLabel(`public apply for rbac → 200 (got ${applyRes.status})`));
    const applyJson = (await applyRes.json()) as { id?: string };
    assert(typeof applyJson.id === "string", stepLabel("rbac apply returns id"));

    const adminResume = await adminSession.request(`/api/admin/job-applications/${applyJson.id}/resume`);
    assert(adminResume.status === 200, stepLabel(`admin GET resume → 200 (got ${adminResume.status})`));
    const superPhoto = await superSession.request(`/api/admin/job-applications/${applyJson.id}/photo`);
    assert(superPhoto.status === 200, stepLabel(`super_admin GET photo → 200 (got ${superPhoto.status})`));
    const superDetail = await superSession.request(`/api/admin/job-applications/${applyJson.id}`);
    const superRow = superDetail.json as { cnic?: string | null };
    assert(superRow.cnic === rbacCnic, stepLabel("super_admin detail has raw CNIC"));
    logOk("applicant fixture ready");

    section("D. hr");
    const hrEmail = `rbac-hr-${TS}@example.com`;
    const createHr = await jsonRequest(superSession.request, "/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email: hrEmail,
        name: "RBAC HR",
        roleId: ROLE_IDS.hr,
        password: extraPassword,
      }),
    });
    assert(createHr.status === 201, stepLabel(`create hr user → 201 (got ${createHr.status})`));
    createdUserIds.push((createHr.json as Json).id as string);

    const hrSession = await login(hrEmail, extraPassword);
    const hrMe = await hrSession.request("/api/admin/me");
    const hrPerms = ((hrMe.json as Json).permissions as string[]).slice().sort();
    const expectedHrPerms = [
      "applications.pii",
      "careers.applications.manage",
      "careers.applications.view",
      "careers.openings.manage",
      "contact.manage",
      "contact.view",
    ];
    assert(
      hrPerms.length === expectedHrPerms.length &&
        expectedHrPerms.every((p, i) => hrPerms[i] === p),
      stepLabel(`hr permissions == 6 careers/contact keys (got ${hrPerms.join(",")})`),
    );

    const hrHero = await jsonRequest(hrSession.request, "/api/admin/home-hero", {
      method: "PATCH",
      body: JSON.stringify({ headline: "nope" }),
    });
    assert(hrHero.status === 403, stepLabel(`hr PATCH home-hero → 403 (got ${hrHero.status})`));
    const hrUsers = await hrSession.request("/api/admin/users");
    assert(hrUsers.status === 403, stepLabel(`hr GET users → 403 (got ${hrUsers.status})`));

    const hrApps = await hrSession.request("/api/admin/job-applications");
    assert(hrApps.status === 200, stepLabel(`hr GET job-applications → 200 (got ${hrApps.status})`));
    const hrRow = (hrApps.json as { id: string; cnic?: string | null; cnicMasked?: string }[]).find(
      (row) => row.id === applyJson.id,
    );
    assert(hrRow != null, stepLabel("hr list includes new application"));
    assert(hrRow.cnic === rbacCnic, stepLabel("hr sees raw CNIC (has applications.pii)"));

    const hrResume = await hrSession.request(`/api/admin/job-applications/${applyJson.id}/resume`);
    assert(hrResume.status === 200, stepLabel(`hr GET resume → 200 (got ${hrResume.status})`));

    const hrHeroPage = await hrSession.request("/admin/home/hero");
    assert(
      hrHeroPage.status === 307 || hrHeroPage.status === 302,
      stepLabel(`hr /admin/home/hero → redirect (got ${hrHeroPage.status})`),
    );
    const hrLanding = await hrSession.request("/admin");
    assert(
      (hrLanding.status === 307 || hrLanding.status === 302) &&
        (hrLanding.headers.get("location") ?? "").includes("/admin/careers/applications"),
      stepLabel(
        `hr /admin → redirect to applications (got ${hrLanding.status} ${hrLanding.headers.get("location") ?? ""})`,
      ),
    );
    logOk("hr matrix");

    section("E. custom Recruiter role");
    const recruiterRole = await jsonRequest(superSession.request, "/api/admin/roles", {
      method: "POST",
      body: JSON.stringify({
        name: `rbac_recruiter_${TS}`,
        permissionKeys: ["careers.applications.view"],
      }),
    });
    assert(recruiterRole.status === 201, stepLabel(`create recruiter role → 201 (got ${recruiterRole.status})`));
    const recruiterRoleId = (recruiterRole.json as Json).id as string;
    createdRoleIds.push(recruiterRoleId);

    const recruiterEmail = `rbac-recruiter-${TS}@example.com`;
    const createRecruiter = await jsonRequest(superSession.request, "/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email: recruiterEmail,
        name: "RBAC Recruiter",
        roleId: recruiterRoleId,
        password: extraPassword,
      }),
    });
    assert(createRecruiter.status === 201, stepLabel(`create recruiter user → 201 (got ${createRecruiter.status})`));
    createdUserIds.push((createRecruiter.json as Json).id as string);

    const recruiterSession = await login(recruiterEmail, extraPassword);
    const recruiterMe = await recruiterSession.request("/api/admin/me");
    const recruiterPerms = (recruiterMe.json as Json).permissions as string[];
    assert(
      recruiterPerms.length === 1 && recruiterPerms[0] === "careers.applications.view",
      stepLabel(`recruiter has exactly careers.applications.view (got ${recruiterPerms.join(",")})`),
    );

    const recruiterApps = await recruiterSession.request("/api/admin/job-applications");
    assert(recruiterApps.status === 200, stepLabel(`recruiter GET job-applications → 200 (got ${recruiterApps.status})`));
    const recruiterRow = (
      recruiterApps.json as { id: string; cnic?: string | null; cnicMasked?: string }[]
    ).find((row) => row.id === applyJson.id);
    assert(recruiterRow != null, stepLabel("recruiter list includes new application"));
    assert(recruiterRow.cnic == null, stepLabel("recruiter CNIC is masked (no applications.pii)"));
    assert(typeof recruiterRow.cnicMasked === "string", stepLabel("recruiter row has cnicMasked"));

    const recruiterResume = await recruiterSession.request(
      `/api/admin/job-applications/${applyJson.id}/resume`,
    );
    assert(recruiterResume.status === 403, stepLabel(`recruiter GET resume → 403 (got ${recruiterResume.status})`));
    const recruiterCsv = await recruiterSession.request("/api/admin/job-applications/export.csv");
    assert(recruiterCsv.status === 403, stepLabel(`recruiter GET export.csv → 403 (got ${recruiterCsv.status})`));

    const recruiterLanding = await recruiterSession.request("/admin");
    assert(
      (recruiterLanding.status === 307 || recruiterLanding.status === 302) &&
        (recruiterLanding.headers.get("location") ?? "").includes("/admin/careers/applications"),
      stepLabel(`recruiter /admin → redirect to applications (got ${recruiterLanding.status})`),
    );
    logOk("custom recruiter role matrix");

    section("Negative auth");
    const anon = client(new CookieJar());
    const anonApi = await anon.request("/api/admin/me");
    assert(anonApi.status === 401, stepLabel(`logged-out GET /me → 401 (got ${anonApi.status})`));
    const bad = await jsonRequest(anon.request, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: bootstrapEmail, password: "wrong-password" }),
    });
    assert(bad.status === 401, stepLabel(`wrong password → 401 (got ${bad.status})`));
    logOk("negative auth");

    await superSession.request(`/api/admin/home-marquee/${editorMarqueeId}`, { method: "DELETE" }).catch(() => {});
  } finally {
    section("Cleanup");
    const cleanup = await login(bootstrapEmail, bootstrapPassword);
    if (draftPostId) {
      await cleanup.request(`/api/admin/blog-posts/${draftPostId}`, { method: "DELETE" }).catch(() => {});
    }
    if (marqueeId) {
      await cleanup.request(`/api/admin/home-marquee/${marqueeId}`, { method: "DELETE" }).catch(() => {});
    }
    for (const id of createdUserIds.reverse()) {
      await cleanup.request(`/api/admin/users/${id}`, { method: "DELETE" }).catch(() => {});
    }
    // Roles only after their users are gone (DELETE /roles/[id] rejects while _count.users > 0).
    for (const id of createdRoleIds.reverse()) {
      await cleanup.request(`/api/admin/roles/${id}`, { method: "DELETE" }).catch(() => {});
    }
    if (customRoleId) {
      await cleanup.request(`/api/admin/roles/${customRoleId}`, { method: "DELETE" }).catch(() => {});
    }
    logOk("cleanup extra users/roles/content");
  }

  console.log("\nRBAC e2e passed.");
}

main().catch((error) => {
  if (!(error instanceof E2eFail)) console.error(error);
  process.exit(1);
});
