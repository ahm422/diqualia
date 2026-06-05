"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StoryPageData = {
  id: number;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  body: string;
  dxNum1: string;
  dxTitle1: string;
  dxBody1: string;
  dxNum2: string;
  dxTitle2: string;
  dxBody2: string;
  dxTagline: string;
  manifestoItems: unknown;
} | null;

type Props = {
  initialData: StoryPageData;
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

async function apiPatch(data: Record<string, unknown>) {
  return fetch("/api/admin/story-page", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ─── Main editor ─────────────────────────────────────────────────────────────

type Tab = "hero" | "doubleExperience" | "manifesto";

export function StoryPageEditor({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("hero");

  const tabs: { id: Tab; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "doubleExperience", label: "Double Experience" },
    { id: "manifesto", label: "Manifesto" },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-[var(--diq_border)] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
              activeTab === tab.id
                ? "border border-[var(--gold)] text-[var(--gold)]"
                : "border border-[var(--diq_border)] text-[var(--diq_mid)] hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "hero" && <HeroTab initial={initialData} />}
      {activeTab === "doubleExperience" && <DoubleExperienceTab initial={initialData} />}
      {activeTab === "manifesto" && <ManifestoTab initial={initialData} />}
    </div>
  );
}

// ─── Hero tab ─────────────────────────────────────────────────────────────────

function HeroTab({ initial }: { initial: StoryPageData }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [headlineLine1, setHeadlineLine1] = useState(initial?.headlineLine1 ?? "");
  const [headlineLine2, setHeadlineLine2] = useState(initial?.headlineLine2 ?? "");
  const [headlineLine3, setHeadlineLine3] = useState(initial?.headlineLine3 ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [status, setStatus] = useState<SaveState>("idle");

  async function save() {
    setStatus("saving");
    const res = await apiPatch({ eyebrow, headlineLine1, headlineLine2, headlineLine3, body });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="Hero">
      <Field label="Eyebrow">
        <Input value={eyebrow} onChange={setEyebrow} placeholder="Our Story" />
      </Field>
      <Field label="Headline line 1">
        <Input value={headlineLine1} onChange={setHeadlineLine1} placeholder="We did not build" />
      </Field>
      <Field label="Headline line 2">
        <Input value={headlineLine2} onChange={setHeadlineLine2} placeholder="a brand. We built" />
      </Field>
      <Field label="Headline line 3 (italic gold)">
        <Input value={headlineLine3} onChange={setHeadlineLine3} placeholder="a point of view." />
      </Field>
      <Field label="Body">
        <Textarea value={body} onChange={setBody} rows={4} placeholder="DiQualia was born from a question…" />
      </Field>
      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}

// ─── Double Experience tab ────────────────────────────────────────────────────

function DoubleExperienceTab({ initial }: { initial: StoryPageData }) {
  const [dxNum1, setDxNum1] = useState(initial?.dxNum1 ?? "");
  const [dxTitle1, setDxTitle1] = useState(initial?.dxTitle1 ?? "");
  const [dxBody1, setDxBody1] = useState(initial?.dxBody1 ?? "");
  const [dxNum2, setDxNum2] = useState(initial?.dxNum2 ?? "");
  const [dxTitle2, setDxTitle2] = useState(initial?.dxTitle2 ?? "");
  const [dxBody2, setDxBody2] = useState(initial?.dxBody2 ?? "");
  const [dxTagline, setDxTagline] = useState(initial?.dxTagline ?? "");
  const [status, setStatus] = useState<SaveState>("idle");

  async function save() {
    setStatus("saving");
    const res = await apiPatch({ dxNum1, dxTitle1, dxBody1, dxNum2, dxTitle2, dxBody2, dxTagline });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <>
      <Section title="DX Card 1">
        <Field label="Number">
          <Input value={dxNum1} onChange={setDxNum1} placeholder="01" />
        </Field>
        <Field label="Title">
          <Input value={dxTitle1} onChange={setDxTitle1} placeholder="Human Intelligence" />
        </Field>
        <Field label="Body">
          <Textarea value={dxBody1} onChange={setDxBody1} rows={4} placeholder="Years of real market understanding…" />
        </Field>
      </Section>

      <Section title="DX Card 2">
        <Field label="Number">
          <Input value={dxNum2} onChange={setDxNum2} placeholder="02" />
        </Field>
        <Field label="Title">
          <Input value={dxTitle2} onChange={setDxTitle2} placeholder="System Precision" />
        </Field>
        <Field label="Body">
          <Textarea value={dxBody2} onChange={setDxBody2} rows={4} placeholder="The power of intelligent tools…" />
        </Field>
      </Section>

      <Section title="Tagline">
        <Field label="Tagline (italic, shown below both cards)">
          <Textarea value={dxTagline} onChange={setDxTagline} rows={2} placeholder="Together, they produce something neither can achieve alone…" />
        </Field>
        <SaveBtn onClick={save} status={status} />
      </Section>
    </>
  );
}

// ─── Manifesto tab ────────────────────────────────────────────────────────────

function ManifestoTab({ initial }: { initial: StoryPageData }) {
  const [items, setItems] = useState<string[]>(
    Array.isArray(initial?.manifestoItems)
      ? (initial.manifestoItems as string[]).filter(Boolean)
      : []
  );
  const [status, setStatus] = useState<SaveState>("idle");

  function update(idx: number, val: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? val : it)));
  }

  function remove(idx: number) {
    if (!confirm("Delete this manifesto item?")) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    const next = [...items];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setItems(next);
  }

  function addItem() {
    setItems((prev) => [...prev, ""]);
  }

  async function save() {
    setStatus("saving");
    const res = await apiPatch({ manifestoItems: items });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="Manifesto Items">
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 rounded border border-[var(--diq_border2)] p-3"
          >
            <div className="flex shrink-0 flex-col gap-1 pt-1">
              <button
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="rounded px-1 text-xs text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                className="rounded px-1 text-xs text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            <textarea
              value={item}
              onChange={(e) => update(idx, e.target.value)}
              rows={2}
              className="flex-1 resize-y rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
            />
            <button
              onClick={() => remove(idx)}
              className="shrink-0 pt-1 text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-3 rounded border border-[var(--diq_border)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
      >
        + Add item
      </button>

      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}
