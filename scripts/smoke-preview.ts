#!/usr/bin/env node
import "dotenv/config";
const base = "http://127.0.0.1:8787";

async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${base}${path}`, init);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, headers: res.headers, text, json, url: res.url };
}

async function main() {
  console.log("=== Public routes ===");
  for (const path of ["/", "/about", "/services", "/process", "/industries", "/industries/construction-built-environment", "/story", "/blog", "/contact", "/privacy", "/terms"]) {
    const res = await request(path);
    console.log(`${path} -> ${res.status}`);
  }

  console.log("\n=== Admin redirect ===");
  const admin = await request("/admin", { redirect: "manual" });
  console.log(`/admin -> ${admin.status} location=${admin.headers.get("location")}`);

  console.log("\n=== Admin login ===");
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD required in env");

  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    redirect: "manual",
  });
  const setCookie = loginRes.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  console.log(`login -> ${loginRes.status}`);
  const loginJson = (await loginRes.json().catch(() => null)) as { ok?: boolean } | null;
  console.log(`login body ok: ${loginJson?.ok === true}`);

  const adminAuthed = await request("/admin", {
    headers: cookie ? { cookie } : {},
    redirect: "manual",
  });
  console.log(`/admin authed -> ${adminAuthed.status}`);
  console.log(
    `/admin overview -> ${adminAuthed.text.includes("data-admin-overview") && adminAuthed.text.includes("Recent activity") && !adminAuthed.text.includes(">Sections<")}`,
  );

  console.log("\n=== CRUD site-settings PATCH ===");
  const patch = await request("/api/admin/site-settings", {
    method: "PATCH",
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify({ siteName: "DiQualia" }),
  });
  console.log(`patch -> ${patch.status} hasId=${Boolean((patch.json as { id?: unknown })?.id)}`);

  console.log("\n=== Contact form ===");
  const contact = await request("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Test",
      email: "smoke@example.com",
      message: "Phase 6 preview test",
      source: "smoke-test",
    }),
  });
  console.log(`contact -> ${contact.status} ok=${(contact.json as { ok?: boolean })?.ok}`);

  console.log("\n=== Upload ===");
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const form = new FormData();
  form.append("file", new Blob([png], { type: "image/png" }), "smoke.png");
  const uploadRes = await fetch(`${base}/api/admin/upload`, {
    method: "POST",
    headers: cookie ? { cookie } : {},
    body: form,
  });
  const uploadJson = await uploadRes.json().catch(() => null);
  console.log(`upload -> ${uploadRes.status} hasUrl=${Boolean(uploadJson?.url)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
