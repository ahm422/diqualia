#!/usr/bin/env node
/**
 * Phase 8 RBAC matrix against local preview (http://127.0.0.1:8787).
 *
 * DANGER: mutates local D1 (creates/deletes extra admin users and a marquee row).
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
    assert(!adminPerms.includes("users.delete"), stepLabel("admin lacks users.delete"));
    assert(!adminPerms.includes("roles.manage"), stepLabel("admin lacks roles.manage"));

    const usersPage = await adminSession.request("/admin/settings/users");
    assert(usersPage.status === 200, stepLabel(`admin Users page → 200 (got ${usersPage.status})`));
    const rolesPage = await adminSession.request("/admin/settings/roles");
    assert(
      rolesPage.status === 307 || rolesPage.status === 302,
      stepLabel(`admin Roles page → redirect (got ${rolesPage.status})`),
    );

    const rolesApi = await adminSession.request("/api/admin/roles");
    assert(rolesApi.status === 403, stepLabel(`admin GET roles → 403 (got ${rolesApi.status})`));

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

    const editorDelete = await editorSession.request(`/api/admin/home-marquee/${editorMarqueeId}`, {
      method: "DELETE",
    });
    assert(editorDelete.status === 403, stepLabel(`editor DELETE marquee → 403 (got ${editorDelete.status})`));

    const editorPublish = await jsonRequest(editorSession.request, `/api/admin/blog-posts/${draftPostId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "published" }),
    });
    assert(editorPublish.status === 403, stepLabel(`editor publish → 403 (got ${editorPublish.status})`));

    const editorCreatePublished = await jsonRequest(editorSession.request, "/api/admin/blog-posts", {
      method: "POST",
      body: JSON.stringify({
        slug: `rbac-published-${TS}`,
        title: `RBAC published ${TS}`,
        excerpt: "Should be forbidden for editor.",
        body: "Body",
        status: "published",
      }),
    });
    assert(
      editorCreatePublished.status === 403,
      stepLabel(`editor POST published → 403 (got ${editorCreatePublished.status})`),
    );

    const editorGet = await editorSession.request("/api/admin/blog-posts");
    assert(editorGet.status === 200, stepLabel(`editor GET blog-posts → 200`));

    const form = new FormData();
    form.set("file", pngBlob(), "rbac.png");
    const upload = await editorSession.request("/api/admin/upload", { method: "POST", body: form });
    assert(upload.status === 200, stepLabel(`editor upload POST → 200 (got ${upload.status})`));

    const apply = new FormData();
    apply.append("name", `RBAC Applicant ${TS}`);
    apply.append("email", `rbac-apply-${TS}@example.com`);
    apply.append("phone", "+923001111111");
    apply.append("jobSlug", "research-analyst");
    apply.append("dateOfBirth", "1994-04-04");
    apply.append("gender", "male");
    apply.append("nationality", "Pakistan");
    apply.append("cnic", "3520112345678");
    apply.append("currentAddress", "Street 1");
    apply.append("city", "Lahore");
    apply.append("highestQualification", "bachelor");
    apply.append("yearsOfExperience", "2");
    apply.append("keySkills", "research");
    apply.append("noticePeriodDays", "15");
    apply.append("expectedSalary", "120000");
    apply.append("availableFrom", new Date().toISOString().slice(0, 10));
    apply.append("declarationAccepted", "true");
    apply.append("resume", new Blob(["%PDF-1.4\n"], { type: "application/pdf" }), "resume.pdf");
    apply.append("photo", jpegBlob(), "photo.jpg");
    const applyRes = await fetch(`${base}/api/careers/apply`, { method: "POST", body: apply, redirect: "manual" });
    assert(applyRes.status === 200, stepLabel(`public apply for rbac → 200 (got ${applyRes.status})`));
    const applyJson = (await applyRes.json()) as { id?: string };
    assert(typeof applyJson.id === "string", stepLabel("rbac apply returns id"));

    const editorList = await editorSession.request("/api/admin/job-applications");
    assert(editorList.status === 200, stepLabel(`editor GET job-applications → 200 (got ${editorList.status})`));
    const editorApps = editorList.json as { id: string; cnic?: string | null; cnicMasked?: string }[];
    const editorRow = editorApps.find((row) => row.id === applyJson.id);
    assert(editorRow != null, stepLabel("editor list includes new application"));
    assert(editorRow.cnic == null, stepLabel("editor list CNIC is masked/absent"));
    assert(typeof editorRow.cnicMasked === "string", stepLabel("editor list has cnicMasked"));

    const editorResume = await editorSession.request(`/api/admin/job-applications/${applyJson.id}/resume`);
    assert(editorResume.status === 403, stepLabel(`editor GET resume → 403 (got ${editorResume.status})`));
    const editorPhoto = await editorSession.request(`/api/admin/job-applications/${applyJson.id}/photo`);
    assert(editorPhoto.status === 403, stepLabel(`editor GET photo → 403 (got ${editorPhoto.status})`));

    const adminResume = await adminSession.request(`/api/admin/job-applications/${applyJson.id}/resume`);
    assert(adminResume.status === 200, stepLabel(`admin GET resume → 200 (got ${adminResume.status})`));
    const superPhoto = await superSession.request(`/api/admin/job-applications/${applyJson.id}/photo`);
    assert(superPhoto.status === 200, stepLabel(`super_admin GET photo → 200 (got ${superPhoto.status})`));
    const superDetail = await superSession.request(`/api/admin/job-applications/${applyJson.id}`);
    const superRow = superDetail.json as { cnic?: string | null };
    assert(superRow.cnic === "3520112345678", stepLabel("super_admin detail has raw CNIC"));
    logOk("editor matrix");

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
