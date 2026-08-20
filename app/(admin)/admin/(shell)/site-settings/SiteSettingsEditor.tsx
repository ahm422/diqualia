"use client";

import { Suspense, useState } from "react";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminSaveButton,
  AdminImageField,
  useAdminSave,
  useScrollToSection,
} from "@/components/admin";
import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

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

// ─── Main editor ─────────────────────────────────────────────────────────────

export function SiteSettingsEditor(props: Props) {
  return (
    <Suspense fallback={null}>
      <SiteSettingsEditorInner {...props} />
    </Suspense>
  );
}

function SiteSettingsEditorInner({ initialSiteSettings, initialNavItems, initialCta, initialFooter, initialFooterNav }: Props) {
  useScrollToSection();

  return (
    <div>
      <div id="site" className="scroll-mt-8">
        <LogoSection initial={initialSiteSettings} />
        <CtaSection initial={initialCta} />
      </div>
      <NavSection initial={initialNavItems} />
      <div id="footer" className="scroll-mt-8">
        <FooterCopySection initial={initialFooter} />
        <FooterNavSection initial={initialFooterNav} />
      </div>
    </div>
  );
}

// ─── 1. Logo & Site Name ──────────────────────────────────────────────────────

function LogoSection({ initial }: { initial: SiteSettings }) {
  const [siteName, setSiteName] = useState(initial?.siteName ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(initial?.logoUrl ?? null);
  const { save, saving } = useAdminSave("/api/admin/site-settings");

  return (
    <AdminSection title="Logo & Site Name">
      <AdminField label="Site Name">
        <AdminInput value={siteName} onChange={setSiteName} placeholder="DiQualia" />
      </AdminField>

      <AdminImageField
        label="Logo"
        currentUrl={logoUrl}
        onUpload={(url) => setLogoUrl(url)}
        onRemove={() => setLogoUrl(null)}
      />

      <AdminSaveButton onClick={() => save({ siteName, logoUrl })} saving={saving} />
    </AdminSection>
  );
}

// ─── 2. Header Navigation ─────────────────────────────────────────────────────

function NavSection({ initial }: { initial: NavItem[] }) {
  const canCreate = useCan("content.create");
  const canDelete = useCan("content.delete");
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
      const updated = (await res.json()) as NavItem;
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
      const item = (await res.json()) as NavItem;
      setItems((prev) => [...prev, item]);
      setNewHref("");
      setNewLabel("");
    }
    setAdding(false);
  }

  return (
    <AdminSection id="nav" title="Header Navigation">
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
                  {canDelete && (
                    <button onClick={() => del(item.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canCreate && (
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
      )}
    </AdminSection>
  );
}

// ─── 3. CTA Button ────────────────────────────────────────────────────────────

function CtaSection({ initial }: { initial: CtaButton }) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [href, setHref] = useState(initial?.href ?? "");
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const { save, saving } = useAdminSave("/api/admin/cta-button");

  return (
    <AdminSection title="CTA Button">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Label"><AdminInput value={label} onChange={setLabel} placeholder="Talk to Us" /></AdminField>
        <AdminField label="Href"><AdminInput value={href} onChange={setHref} placeholder="/contact" /></AdminField>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="accent-[var(--gold)]" />
        Show CTA in header
      </label>
      <AdminSaveButton onClick={() => save({ label, href, visible })} saving={saving} />
    </AdminSection>
  );
}

// ─── 4. Footer Copy ───────────────────────────────────────────────────────────

function FooterCopySection({ initial }: { initial: FooterSettings }) {
  const [tagline1, setTagline1] = useState(initial?.tagline1 ?? "");
  const [tagline2, setTagline2] = useState(initial?.tagline2 ?? "");
  const [copyright, setCopyright] = useState(initial?.copyright ?? "");
  const [allRights, setAllRights] = useState(initial?.allRights ?? "");
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const { save, saving } = useAdminSave("/api/admin/footer");

  return (
    <AdminSection title="Footer Copy">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Tagline 1"><AdminInput value={tagline1} onChange={setTagline1} placeholder="Marketing Intelligence & Research" /></AdminField>
        <AdminField label="Tagline 2"><AdminInput value={tagline2} onChange={setTagline2} placeholder="Niche B2B · Data-Driven Strategy" /></AdminField>
        <AdminField label="Copyright"><AdminInput value={copyright} onChange={setCopyright} placeholder="© 2026 DiQualia" /></AdminField>
        <AdminField label="All Rights Text"><AdminInput value={allRights} onChange={setAllRights} placeholder="All rights reserved" /></AdminField>
        <AdminField label="Domain"><AdminInput value={domain} onChange={setDomain} placeholder="diqualia.com" /></AdminField>
      </div>
      <AdminSaveButton onClick={() => save({ tagline1, tagline2, copyright, allRights, domain })} saving={saving} />
    </AdminSection>
  );
}

// ─── 5. Footer Navigation ─────────────────────────────────────────────────────

function FooterNavSection({ initial }: { initial: FooterNavItem[] }) {
  const canCreate = useCan("content.create");
  const canDelete = useCan("content.delete");
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
      const updated = (await res.json()) as FooterNavItem;
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
      const item = (await res.json()) as FooterNavItem;
      setItems((prev) => [...prev, item]);
      setNewHref("");
      setNewLabel("");
    }
    setAdding(false);
  }

  const sorted = [...items].sort((a, b) => a.group.localeCompare(b.group) || a.order - b.order);

  return (
    <AdminSection title="Footer Navigation">
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
                    {canDelete && (
                      <button onClick={() => del(item.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {canCreate && (
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
      )}
    </AdminSection>
  );
}
