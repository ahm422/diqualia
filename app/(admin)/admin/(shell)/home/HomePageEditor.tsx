"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type HomeHero = {
  id: number; eyebrow: string;
  headlineLine1: string; headlineLine2: string; headlineLine3: string;
  body: string;
  btn1Label: string; btn1Href: string; btn2Label: string; btn2Href: string;
  stat1Label: string; stat1Value: string;
  stat2Label: string; stat2Value: string;
  stat3Label: string; stat3Value: string;
} | null;

type MarqueeItem = { id: number; text: string; order: number };
type ExploreSection = { id: number; eyebrow: string; headlineLine1: string; headlineLine2: string; body: string } | null;
type ExploreCard = { id: number; href: string; title: string; body: string; sectionLabel: string | null; visible: boolean; order: number };
type WhereNext = { id: number; eyebrow: string; headline: string; body: string; btnLabel: string; btnHref: string } | null;

type Props = {
  initialHero: HomeHero;
  initialMarquee: MarqueeItem[];
  initialExploreSection: ExploreSection;
  initialExploreCards: ExploreCard[];
  initialWhereNext: WhereNext;
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveStatus({ status }: { status: SaveState }) {
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

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)] resize-y"
    />
  );
}

function SaveBtn({ onClick, status }: { onClick: () => void; status: SaveState }) {
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

async function apiPatch(url: string, data: Record<string, unknown>) {
  return fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export function HomePageEditor({ initialHero, initialMarquee, initialExploreSection, initialExploreCards, initialWhereNext }: Props) {
  return (
    <div>
      <HeroSection initial={initialHero} />
      <MarqueeSection initial={initialMarquee} />
      <ExploreSectionHeader initial={initialExploreSection} />
      <ExploreCardsSection initial={initialExploreCards} />
      <WhereNextSection initial={initialWhereNext} />
    </div>
  );
}

// ─── 1. Hero ─────────────────────────────────────────────────────────────────

function HeroSection({ initial }: { initial: HomeHero }) {
  const [f, setF] = useState({
    eyebrow: initial?.eyebrow ?? "",
    headlineLine1: initial?.headlineLine1 ?? "",
    headlineLine2: initial?.headlineLine2 ?? "",
    headlineLine3: initial?.headlineLine3 ?? "",
    body: initial?.body ?? "",
    btn1Label: initial?.btn1Label ?? "",
    btn1Href: initial?.btn1Href ?? "",
    btn2Label: initial?.btn2Label ?? "",
    btn2Href: initial?.btn2Href ?? "",
    stat1Label: initial?.stat1Label ?? "",
    stat1Value: initial?.stat1Value ?? "",
    stat2Label: initial?.stat2Label ?? "",
    stat2Value: initial?.stat2Value ?? "",
    stat3Label: initial?.stat3Label ?? "",
    stat3Value: initial?.stat3Value ?? "",
  });
  const [status, setStatus] = useState<SaveState>("idle");

  const set = (key: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [key]: v }));

  async function save() {
    setStatus("saving");
    const res = await apiPatch("/api/admin/home-hero", f);
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="Hero">
      <Field label="Eyebrow"><Input value={f.eyebrow} onChange={set("eyebrow")} placeholder="Marketing Intelligence & Research" /></Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Headline Line 1"><Input value={f.headlineLine1} onChange={set("headlineLine1")} placeholder="Intelligence" /></Field>
        <Field label="Headline Line 2"><Input value={f.headlineLine2} onChange={set("headlineLine2")} placeholder="That Moves" /></Field>
        <Field label="Headline Line 3"><Input value={f.headlineLine3} onChange={set("headlineLine3")} placeholder="Markets." /></Field>
      </div>
      <Field label="Body">
        <Textarea value={f.body} onChange={set("body")} rows={3} placeholder="DiQualia is…" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Button 1 Label"><Input value={f.btn1Label} onChange={set("btn1Label")} placeholder="Our Services" /></Field>
        <Field label="Button 1 Href"><Input value={f.btn1Href} onChange={set("btn1Href")} placeholder="/services" /></Field>
        <Field label="Button 2 Label"><Input value={f.btn2Label} onChange={set("btn2Label")} placeholder="Talk to Us" /></Field>
        <Field label="Button 2 Href"><Input value={f.btn2Href} onChange={set("btn2Href")} placeholder="/contact" /></Field>
      </div>
      <div className="mt-2 mb-2 text-xs uppercase tracking-widest text-[var(--diq_mid)]">Stats</div>
      <div className="grid gap-4 sm:grid-cols-3">
        {([["stat1Label", "stat1Value", "Label 1", "Value 1"], ["stat2Label", "stat2Value", "Label 2", "Value 2"], ["stat3Label", "stat3Value", "Label 3", "Value 3"]] as const).map(([lk, vk, lp, vp]) => (
          <div key={lk} className="rounded border border-[var(--diq_border2)] p-3">
            <Field label="Label"><Input value={f[lk]} onChange={set(lk)} placeholder={lp} /></Field>
            <Field label="Value"><Input value={f[vk]} onChange={set(vk)} placeholder={vp} /></Field>
          </div>
        ))}
      </div>
      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}

// ─── 2. Marquee Ticker ────────────────────────────────────────────────────────

function MarqueeSection({ initial }: { initial: MarqueeItem[] }) {
  const [items, setItems] = useState<MarqueeItem[]>(initial);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  async function patch(id: number, data: Partial<MarqueeItem>) {
    const res = await fetch(`/api/admin/home-marquee/${id}`, {
      method: "PATCH", credentials: "include",
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
    const a = items[idx]; const b = items[swapIdx];
    await Promise.all([patch(a.id, { order: b.order }), patch(b.id, { order: a.order })]);
    const next = [...items];
    next[idx] = { ...a, order: b.order };
    next[swapIdx] = { ...b, order: a.order };
    setItems(next.sort((x, y) => x.order - y.order));
  }

  async function del(id: number) {
    if (!confirm("Delete this ticker item?")) return;
    const res = await fetch(`/api/admin/home-marquee/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id).map((i, idx) => ({ ...i, order: idx })));
  }

  async function add() {
    if (!newText.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/home-marquee", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    if (res.ok) { const item = await res.json(); setItems((prev) => [...prev, item]); setNewText(""); }
    setAdding(false);
  }

  return (
    <Section title="Marquee Ticker">
      <p className="mb-4 text-xs text-[var(--diq_mid)]">Format: &quot;Label — Sublabel&quot; (bold/rest split on &quot; — &quot;)</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--diq_border)] text-left text-xs uppercase tracking-wider text-[var(--diq_mid)]">
              <th className="pb-2 pr-4">Text</th>
              <th className="pb-2 pr-4">Order</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-[var(--diq_border2)] last:border-0">
                <td className="py-2 pr-4">
                  <input
                    defaultValue={item.text}
                    onBlur={(e) => { if (e.target.value !== item.text) patch(item.id, { text: e.target.value }); }}
                    className="w-full rounded border border-transparent bg-transparent px-1 text-sm focus:border-[var(--diq_border)] focus:outline-none"
                  />
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
        <div className="flex-1">
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">New item</label>
          <input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Market Research — Niche B2B Intelligence"
            className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
        </div>
        <button onClick={add} disabled={adding || !newText.trim()}
          className="rounded border border-[var(--gold)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50">
          Add
        </button>
      </div>
    </Section>
  );
}

// ─── 3. Explore Section Header ────────────────────────────────────────────────

function ExploreSectionHeader({ initial }: { initial: ExploreSection }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [line1, setLine1] = useState(initial?.headlineLine1 ?? "");
  const [line2, setLine2] = useState(initial?.headlineLine2 ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [status, setStatus] = useState<SaveState>("idle");

  async function save() {
    setStatus("saving");
    const res = await apiPatch("/api/admin/home-explore-section", { eyebrow, headlineLine1: line1, headlineLine2: line2, body });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="Explore Section Header">
      <Field label="Eyebrow"><Input value={eyebrow} onChange={setEyebrow} placeholder="Explore" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Headline Line 1"><Input value={line1} onChange={setLine1} placeholder="A multi-page site" /></Field>
        <Field label="Headline Line 2"><Input value={line2} onChange={setLine2} placeholder="built for clarity." /></Field>
      </div>
      <Field label="Subtext"><Textarea value={body} onChange={setBody} rows={2} /></Field>
      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}

// ─── 4. Explore Cards ─────────────────────────────────────────────────────────

function ExploreCardsSection({ initial }: { initial: ExploreCard[] }) {
  const [cards, setCards] = useState<ExploreCard[]>(initial);
  const [newHref, setNewHref] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [adding, setAdding] = useState(false);

  async function patch(id: number, data: Partial<ExploreCard>) {
    const res = await fetch(`/api/admin/home-explore/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }

  async function move(id: number, dir: -1 | 1) {
    const idx = cards.findIndex((c) => c.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= cards.length) return;
    const a = cards[idx]; const b = cards[swapIdx];
    await Promise.all([patch(a.id, { order: b.order }), patch(b.id, { order: a.order })]);
    const next = [...cards];
    next[idx] = { ...a, order: b.order };
    next[swapIdx] = { ...b, order: a.order };
    setCards(next.sort((x, y) => x.order - y.order));
  }

  async function del(id: number) {
    if (!confirm("Delete this explore card?")) return;
    const res = await fetch(`/api/admin/home-explore/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setCards((prev) => prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })));
  }

  async function add() {
    if (!newHref || !newTitle || !newBody) return;
    setAdding(true);
    const res = await fetch("/api/admin/home-explore", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ href: newHref, title: newTitle, body: newBody }),
    });
    if (res.ok) { const card = await res.json(); setCards((prev) => [...prev, card]); setNewHref(""); setNewTitle(""); setNewBody(""); }
    setAdding(false);
  }

  return (
    <Section title="Explore Cards">
      <div className="space-y-4">
        {cards.map((card, idx) => (
          <div key={card.id} className="rounded border border-[var(--diq_border2)] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Title</label>
                <input defaultValue={card.title} onBlur={(e) => { if (e.target.value !== card.title) patch(card.id, { title: e.target.value }); }}
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Href</label>
                <input defaultValue={card.href} onBlur={(e) => { if (e.target.value !== card.href) patch(card.id, { href: e.target.value }); }}
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm font-mono focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Body</label>
                <input defaultValue={card.body} onBlur={(e) => { if (e.target.value !== card.body) patch(card.id, { body: e.target.value }); }}
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input type="checkbox" checked={card.visible} onChange={() => patch(card.id, { visible: !card.visible })} className="accent-[var(--gold)]" />
                Visible on site
              </label>
              <div className="flex gap-1">
                <button onClick={() => move(card.id, -1)} disabled={idx === 0} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↑</button>
                <button onClick={() => move(card.id, 1)} disabled={idx === cards.length - 1} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↓</button>
              </div>
              <button onClick={() => del(card.id)} className="text-xs text-red-400 hover:text-red-300 ml-auto">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[var(--diq_border2)] pt-4">
        <div className="text-xs uppercase tracking-widest text-[var(--diq_mid)] mb-3">Add card</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Title</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="About"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Href</label>
            <input value={newHref} onChange={(e) => setNewHref(e.target.value)} placeholder="/about"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Body</label>
            <input value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="What DiQualia is…"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
          </div>
        </div>
        <button onClick={add} disabled={adding || !newHref || !newTitle || !newBody}
          className="mt-3 rounded border border-[var(--gold)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50">
          Add Card
        </button>
      </div>
    </Section>
  );
}

// ─── 5. Where Next CTA ───────────────────────────────────────────────────────

function WhereNextSection({ initial }: { initial: WhereNext }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [btnLabel, setBtnLabel] = useState(initial?.btnLabel ?? "");
  const [btnHref, setBtnHref] = useState(initial?.btnHref ?? "");
  const [status, setStatus] = useState<SaveState>("idle");

  async function save() {
    setStatus("saving");
    const res = await apiPatch("/api/admin/home-where-next", { eyebrow, headline, body, btnLabel, btnHref });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="Where Next CTA">
      <Field label="Eyebrow"><Input value={eyebrow} onChange={setEyebrow} placeholder="Begin With Intelligence" /></Field>
      <Field label="Headline"><Input value={headline} onChange={setHeadline} placeholder="Ready to Know Your Market Better Than Anyone?" /></Field>
      <Field label="Body"><Textarea value={body} onChange={setBody} rows={2} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Button Label"><Input value={btnLabel} onChange={setBtnLabel} placeholder="Contact" /></Field>
        <Field label="Button Href"><Input value={btnHref} onChange={setBtnHref} placeholder="/contact" /></Field>
      </div>
      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}
