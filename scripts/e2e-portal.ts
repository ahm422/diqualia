#!/usr/bin/env node
/**
 * Applicant portal (/portal) e2e against local preview (http://127.0.0.1:8787).
 *
 * DANGER: mutates local D1 — seeds/deletes applicant_users + job_applications.
 * Loopback-only. Prereqs: migrate (0012 applied) + preview running,
 * ADMIN_EMAIL/ADMIN_PASSWORD in .env for the cross-surface isolation checks.
 *
 *   npm run cf:e2e:portal
 */
import "dotenv/config";

import { hashPassword } from "@/lib/auth/password";

import {
  CookieJar,
  E2eFail,
  assert,
  createClient,
  d1Query,
  logOk,
  parseArgs,
  section,
  stepLabel,
} from "./lib/e2e-client";

const { base } = parseArgs(process.argv.slice(2));
const TS = Date.now();

function client(jar: CookieJar) {
  return createClient(base, jar);
}

function sql(strings: TemplateStringsArray, ...values: (string | number)[]) {
  return strings.reduce((acc, s, i) => acc + s + (i < values.length ? String(values[i]) : ""), "");
}

async function login(base_: string, path: string, body: unknown) {
  const jar = new CookieJar();
  const { request } = client(jar);
  const res = await request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { jar, request, res };
}

const aEmail = `portal-a-${TS}@example.com`;
const bEmail = `portal-b-${TS}@example.com`;
const aInitialPw = `portal-a-${TS}-Aa1!`;
const bPw = `portal-b-${TS}-Aa1!`;
const aNewPw = `portal-a-${TS}-Zz9!-new`;

const aUserId = crypto.randomUUID();
const bUserId = crypto.randomUUID();
const appA1 = crypto.randomUUID();
const appA2 = crypto.randomUUID();

async function seed() {
  const aHash = await hashPassword(aInitialPw);
  const bHash = await hashPassword(bPw);
  // Applicant A: forced password change on first login.
  d1Query(
    sql`INSERT INTO applicant_users (id, email, password_hash, must_change_password, created_at)
        VALUES ('${aUserId}', '${aEmail}', '${aHash}', 1, CURRENT_TIMESTAMP)`,
  );
  // Applicant B: already changed — used for the ownership check.
  d1Query(
    sql`INSERT INTO applicant_users (id, email, password_hash, must_change_password, created_at)
        VALUES ('${bUserId}', '${bEmail}', '${bHash}', 0, CURRENT_TIMESTAMP)`,
  );
  for (const [id, title, key] of [
    [appA1, `Portal Role One ${TS}`, `resumes/${crypto.randomUUID()}.pdf`],
    [appA2, `Portal Role Two ${TS}`, `resumes/${crypto.randomUUID()}.pdf`],
  ] as const) {
    d1Query(
      sql`INSERT INTO job_applications (id, name, email, job_title, resume_key, status, submitted_at, declaration_accepted, applicant_user_id)
          VALUES ('${id}', 'Portal A', '${aEmail}', '${title}', '${key}', 'new', CURRENT_TIMESTAMP, 1, '${aUserId}')`,
    );
  }
}

function cleanup() {
  d1Query(sql`DELETE FROM job_applications WHERE email IN ('${aEmail}', '${bEmail}')`);
  d1Query(sql`DELETE FROM applicant_users WHERE email IN ('${aEmail}', '${bEmail}')`);
}

async function main() {
  section("Seed");
  seed();
  logOk("seeded 2 applicant accounts + 2 applications");

  try {
    section("A. login + forced password change");
    const wrong = await login(base, "/api/portal/login", { email: aEmail, password: "nope" });
    assert(wrong.res.status === 401, stepLabel(`wrong password → 401 (got ${wrong.res.status})`));

    const a = await login(base, "/api/portal/login", { email: aEmail, password: aInitialPw });
    assert(a.res.status === 200, stepLabel(`login A → 200 (got ${a.res.status})`));
    assert(
      (a.res.json as { mustChangePassword?: boolean }).mustChangePassword === true,
      stepLabel("login A reports mustChangePassword"),
    );

    const shellWhileForced = await a.request("/portal");
    assert(
      (shellWhileForced.status === 307 || shellWhileForced.status === 302) &&
        (shellWhileForced.headers.get("location") ?? "").includes("/portal/change-password"),
      stepLabel(`/portal while forced → redirect to change-password (got ${shellWhileForced.status})`),
    );

    const badChange = await a.request("/api/portal/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword: "wrong", newPassword: aNewPw }),
    });
    assert(badChange.status === 400, stepLabel(`change-password wrong current → 400 (got ${badChange.status})`));

    const okChange = await a.request("/api/portal/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword: aInitialPw, newPassword: aNewPw }),
    });
    assert(okChange.status === 200, stepLabel(`change-password → 200 (got ${okChange.status})`));
    logOk("forced password change");

    section("B. dashboard + detail");
    const a2 = await login(base, "/api/portal/login", { email: aEmail, password: aNewPw });
    assert(a2.res.status === 200, stepLabel(`re-login A with new password → 200 (got ${a2.res.status})`));
    assert(
      (a2.res.json as { mustChangePassword?: boolean }).mustChangePassword === false,
      stepLabel("re-login A no longer forced"),
    );

    const dash = await a2.request("/portal");
    assert(dash.status === 200, stepLabel(`/portal → 200 (got ${dash.status})`));
    assert(
      dash.text.includes(`Portal Role One ${TS}`) && dash.text.includes(`Portal Role Two ${TS}`),
      stepLabel("/portal lists both of A's applications"),
    );

    const detail = await a2.request(`/portal/${appA1}`);
    assert(detail.status === 200, stepLabel(`/portal/<id> → 200 (got ${detail.status})`));

    section("C. ownership + cross-surface isolation");
    const b = await login(base, "/api/portal/login", { email: bEmail, password: bPw });
    assert(b.res.status === 200, stepLabel(`login B → 200 (got ${b.res.status})`));
    const bReadsA = await b.request(`/api/portal/applications/${appA1}/resume`);
    assert(bReadsA.status === 404, stepLabel(`B reads A's resume → 404 (got ${bReadsA.status})`));

    // Admin session must not satisfy the portal.
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const admin = await login(base, "/api/auth/login", { email: adminEmail, password: adminPassword });
      assert(admin.res.status === 200, stepLabel(`admin login → 200 (got ${admin.res.status})`));
      const adminOnPortal = await admin.request(`/api/portal/applications/${appA1}/resume`);
      assert(adminOnPortal.status === 401, stepLabel(`admin cookie on portal route → 401 (got ${adminOnPortal.status})`));
    } else {
      console.warn("  (skipped admin-cookie check — ADMIN_EMAIL/ADMIN_PASSWORD not set)");
    }

    // Portal session must not satisfy the admin API.
    const portalOnAdmin = await a2.request("/api/admin/me");
    assert(portalOnAdmin.status === 401, stepLabel(`portal cookie on /api/admin/me → 401 (got ${portalOnAdmin.status})`));

    const anon = client(new CookieJar());
    const anonPortal = await anon.request("/portal");
    assert(
      anonPortal.status === 307 || anonPortal.status === 302,
      stepLabel(`anon /portal → redirect (got ${anonPortal.status})`),
    );
    logOk("ownership + isolation");
  } finally {
    section("Cleanup");
    cleanup();
    logOk("removed seeded rows");
  }

  console.log("\nPortal e2e passed.");
}

main().catch((error) => {
  if (!(error instanceof E2eFail)) console.error(error);
  process.exit(1);
});
