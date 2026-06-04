"use client";

import Image from "next/image";
import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SiteSettings = { id: number; siteName: string; logoUrl: string | null } | null;
type NavItem = { id: number; href: string; label: string; order: number; visible: boolean };
type CtaButton = { id: number; label: string; href: string; visible: boolean } | null;
type FooterSettings = { id: number; tagline1: string; tagline2: string; copyright: string; domain: string; allRights: string } | null;
type FooterNavItem = { id: number; href: string; label: string; group: string; order: number };

type Props = {
  initialSiteSettings: SiteSettings;
  initialNavItems: NavItem[];
  initialCta: CtaButton;
  initialFooter: FooterSettings;
  initialFooterNav: FooterNavItem[];
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SaveStatus({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  if (status === "saving") return <span className="text-xs text-[var(--diq_mid)]">Saving…</span>;
  if (status === "saved") return <span className="text-xs text-green-500">Saved ✓</span>;
  return <span className="text-xs text-red-400">Error — try again</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 rounded-xl border border-[var(--diq_border)] bg-[var(--diq_surface)] p-6">
      <h2 className="mb-5 text-base font-medium text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-xs uppercase tracking-widest text-[var(--diq_mid)]">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
    />
  );
}

function SaveBtn({ onClick, status }: { onClick: () => void; status: "idle" | "saving" | "saved" | "error" }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={status === "saving"}
        className="rounded border border-[var(--gold)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50"
      >
        Save
      </button>
      <SaveStatus status={status} />
    </div>
  );
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export function SiteSettingsEditor({ initialSiteSettings, initialNavItems, initialCta, initialFooter, initialFooterNav }: Props) {
  return (
    <div>
      <LogoSection initial={initialSiteSettings} />
      <NavSection initial={initialNavItems} />
      <CtaSection initial={initialCta} />
      <FooterCopySection initial={initialFooter} />
      <FooterNavSection initial={initialFooterNav} />
    </div>
  );
}

// ─── 1. Logo & Site Name ──────────────────────────────────────────────────────

function LogoSection({ initial }: { initial: SiteSettings }) {
  const [siteName, setSiteName] = useState(initial?.siteName ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(initial?.logoUrl ?? null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (res.ok) setLogoUrl(data.url);
      else alert(data.error ?? "Upload failed");
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName, logoUrl }),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="Logo & Site Name">
      <Field label="Site Name">
        <Input value={siteName} onChange={setSiteName} placeholder="DiQualia" />
      </Field>

      <Field label="Logo">
        <div className="flex flex-wrap items-start gap-4">
          {logoUrl && (
            <div className="relative">
              <Image src={logoUrl} alt="Logo preview" width={160} height={50} className="rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] object-contain p-2" style={{ height: 50, width: "auto" }} />
              <button
                onClick={() => setLogoUrl(null)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
                title="Remove logo"
              >
                ×
              </button>
            </div>
          )}
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleFileChange} className="hidden" id="logo-upload" />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer rounded border border-[var(--diq_border)] px-3 py-2 text-xs text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              {uploading ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
            </label>
            <p className="mt-1 text-[11px] text-[var(--diq_mid)]">JPEG, PNG, WebP, SVG · max 5 MB</p>
          </div>
        </div>
      </Field>

      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}

// ─── 2. Header Navigation ─────────────────────────────────────────────────────

function NavSection({ initial }: { initial: NavItem[] }) {
  const [items, setItems] = useState<NavItem[]>(initial);
  const [newHref, setNewHref] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  async function patch(id: number, data: Partial<NavItem>) {
    const res = await fetch(`/api/admin/nav-items/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    }
  }

  async function move(id: number, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const a = items[idx];
    const b = items[swapIdx];
    await Promise.all([patch(a.id, { order: b.order }), patch(b.id, { order: a.order })]);
    const next = [...items];
    next[idx] = { ...a, order: b.order };
    next[swapIdx] = { ...b, order: a.order };
    setItems(next.sort((x, y) => x.order - y.order));
  }

  async function toggleVisible(item: NavItem) {
    await patch(item.id, { visible: !item.visible });
  }

  async function del(id: number) {
    if (!confirm("Delete this nav link?")) return;
    const res = await fetch(`/api/admin/nav-items/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      const remaining = items.filter((i) => i.id !== id).map((i, idx) => ({ ...i, order: idx }));
      setItems(remaining);
    }
  }

  async function add() {
    if (!newHref || !newLabel) return;
    setAdding(true);
    const res = await fetch("/api/admin/nav-items", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ href: newHref, label: newLabel }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
      setNewHref("");
      setNewLabel("");
    }
    setAdding(false);
  }

  return (
    <Section title="Header Navigation">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--diq_border)] text-left text-xs uppercase tracking-wider text-[var(--diq_mid)]">
              <th className="pb-2 pr-4">Label</th>
              <th className="pb-2 pr-4">Href</th>
              <th className="pb-2 pr-4">Visible</th>
              <th className="pb-2 pr-4">Order</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-[var(--diq_border2)] last:border-0">
                <td className="py-2 pr-4">
                  <input
                    defaultValue={item.label}
                    onBlur={(e) => { if (e.target.value !== item.label) patch(item.id, { label: e.target.value }); }}
                    className="w-full rounded border border-transparent bg-transparent px-1 text-sm focus:border-[var(--diq_border)] focus:outline-none"
                  />
                </td>
                <td className="py-2 pr-4">
                  <input
                    defaultValue={item.href}
                    onBlur={(e) => { if (e.target.value !== item.href) patch(item.id, { href: e.target.value }); }}
                    className="w-full rounded border border-transparent bg-transparent px-1 font-mono text-xs focus:border-[var(--diq_border)] focus:outline-none"
                  />
                </td>
                <td className="py-2 pr-4">
                  <input type="checkbox" checked={item.visible} onChange={() => toggleVisible(item)} className="accent-[var(--gold)]" />
                </td>
                <td className="py-2 pr-4">
                  <div className="flex gap-1">
                    <button onClick={() => move(item.id, -1)} disabled={idx === 0} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30">↑</button>
                    <button onClick={() => move(item.id, 1)} disabled={idx === items.length - 1} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30">↓</button>
                  </div>
                </td>
                <td className="py-2">
                  <button onClick={() => del(item.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-[var(--diq_border2)] pt-4">
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Label</label>
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="About" className="rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Href</label>
          <input value={newHref} onChange={(e) => setNewHref(e.target.value)} placeholder="/about" className="rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
        </div>
        <button onClick={add} disabled={adding || !newHref || !newLabel} className="rounded border border-[var(--gold)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50">
          Add
        </button>
      </div>
    </Section>
  );
}

// ─── 3. CTA Button ────────────────────────────────────────────────────────────

function CtaSection({ initial }: { initial: CtaButton }) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [href, setHref] = useState(initial?.href ?? "");
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/cta-button", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, href, visible }),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="CTA Button">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label"><Input value={label} onChange={setLabel} placeholder="Talk to Us" /></Field>
        <Field label="Href"><Input value={href} onChange={setHref} placeholder="/contact" /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="accent-[var(--gold)]" />
        Show CTA in header
      </label>
      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}

// ─── 4. Footer Copy ───────────────────────────────────────────────────────────

function FooterCopySection({ initial }: { initial: FooterSettings }) {
  const [tagline1, setTagline1] = useState(initial?.tagline1 ?? "");
  const [tagline2, setTagline2] = useState(initial?.tagline2 ?? "");
  const [copyright, setCopyright] = useState(initial?.copyright ?? "");
  const [allRights, setAllRights] = useState(initial?.allRights ?? "");
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/footer", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagline1, tagline2, copyright, allRights, domain }),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="Footer Copy">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tagline 1"><Input value={tagline1} onChange={setTagline1} placeholder="Marketing Intelligence & Research" /></Field>
        <Field label="Tagline 2"><Input value={tagline2} onChange={setTagline2} placeholder="Niche B2B · Data-Driven Strategy" /></Field>
        <Field label="Copyright"><Input value={copyright} onChange={setCopyright} placeholder="© 2026 DiQualia" /></Field>
        <Field label="All Rights Text"><Input value={allRights} onChange={setAllRights} placeholder="All rights reserved" /></Field>
        <Field label="Domain"><Input value={domain} onChange={setDomain} placeholder="diqualia.com" /></Field>
      </div>
      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}

// ─── 5. Footer Navigation ─────────────────────────────────────────────────────

function FooterNavSection({ initial }: { initial: FooterNavItem[] }) {
  const [items, setItems] = useState<FooterNavItem[]>(initial);
  const [newHref, setNewHref] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newGroup, setNewGroup] = useState<"primary" | "secondary">("primary");
  const [adding, setAdding] = useState(false);

  async function patch(id: number, data: Partial<FooterNavItem>) {
    const res = await fetch(`/api/admin/footer-nav/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    }
  }

  async function move(id: number, dir: -1 | 1) {
    const groupItems = items.filter((i) => i.group === items.find((x) => x.id === id)?.group).sort((a, b) => a.order - b.order);
    const idx = groupItems.findIndex((i) => i.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= groupItems.length) return;
    const a = groupItems[idx];
    const b = groupItems[swapIdx];
    await Promise.all([patch(a.id, { order: b.order }), patch(b.id, { order: a.order })]);
    setItems((prev) => prev.map((i) => {
      if (i.id === a.id) return { ...i, order: b.order };
      if (i.id === b.id) return { ...i, order: a.order };
      return i;
    }));
  }

  async function del(id: number) {
    if (!confirm("Delete this footer link?")) return;
    const res = await fetch(`/api/admin/footer-nav/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function add() {
    if (!newHref || !newLabel) return;
    setAdding(true);
    const res = await fetch("/api/admin/footer-nav", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ href: newHref, label: newLabel, group: newGroup }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
      setNewHref("");
      setNewLabel("");
    }
    setAdding(false);
  }

  const sorted = [...items].sort((a, b) => a.group.localeCompare(b.group) || a.order - b.order);

  return (
    <Section title="Footer Navigation">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--diq_border)] text-left text-xs uppercase tracking-wider text-[var(--diq_mid)]">
              <th className="pb-2 pr-4">Group</th>
              <th className="pb-2 pr-4">Label</th>
              <th className="pb-2 pr-4">Href</th>
              <th className="pb-2 pr-4">Order</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => {
              const groupItems = sorted.filter((i) => i.group === item.group);
              const idx = groupItems.findIndex((i) => i.id === item.id);
              return (
                <tr key={item.id} className="border-b border-[var(--diq_border2)] last:border-0">
                  <td className="py-2 pr-4">
                    <select
                      value={item.group}
                      onChange={(e) => patch(item.id, { group: e.target.value as "primary" | "secondary" })}
                      className="rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1 text-xs text-foreground focus:outline-none"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                    </select>
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      defaultValue={item.label}
                      onBlur={(e) => { if (e.target.value !== item.label) patch(item.id, { label: e.target.value }); }}
                      className="w-full rounded border border-transparent bg-transparent px-1 text-sm focus:border-[var(--diq_border)] focus:outline-none"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      defaultValue={item.href}
                      onBlur={(e) => { if (e.target.value !== item.href) patch(item.id, { href: e.target.value }); }}
                      className="w-full rounded border border-transparent bg-transparent px-1 font-mono text-xs focus:border-[var(--diq_border)] focus:outline-none"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-1">
                      <button onClick={() => move(item.id, -1)} disabled={idx === 0} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30">↑</button>
                      <button onClick={() => move(item.id, 1)} disabled={idx === groupItems.length - 1} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30">↓</button>
                    </div>
                  </td>
                  <td className="py-2">
                    <button onClick={() => del(item.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-[var(--diq_border2)] pt-4">
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Group</label>
          <select value={newGroup} onChange={(e) => setNewGroup(e.target.value as "primary" | "secondary")} className="rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]">
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Label</label>
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Contact" className="rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Href</label>
          <input value={newHref} onChange={(e) => setNewHref(e.target.value)} placeholder="/contact" className="rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
        </div>
        <button onClick={add} disabled={adding || !newHref || !newLabel} className="rounded border border-[var(--gold)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50">
          Add
        </button>
      </div>
    </Section>
  );
}
