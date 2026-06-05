"use client";

import { useState } from "react";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminSaveButton,
  useAdminSave,
} from "@/components/admin";

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
  const { save, saving } = useAdminSave("/api/admin/story-page");

  return (
    <AdminSection title="Hero">
      <AdminField label="Eyebrow">
        <AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Our Story" />
      </AdminField>
      <AdminField label="Headline line 1">
        <AdminInput value={headlineLine1} onChange={setHeadlineLine1} placeholder="We did not build" />
      </AdminField>
      <AdminField label="Headline line 2">
        <AdminInput value={headlineLine2} onChange={setHeadlineLine2} placeholder="a brand. We built" />
      </AdminField>
      <AdminField label="Headline line 3 (italic gold)">
        <AdminInput value={headlineLine3} onChange={setHeadlineLine3} placeholder="a point of view." />
      </AdminField>
      <AdminField label="Body">
        <AdminTextarea value={body} onChange={setBody} rows={4} placeholder="DiQualia was born from a question…" />
      </AdminField>
      <AdminSaveButton onClick={() => save({ eyebrow, headlineLine1, headlineLine2, headlineLine3, body })} saving={saving} />
    </AdminSection>
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
  const { save, saving } = useAdminSave("/api/admin/story-page");

  return (
    <>
      <AdminSection title="DX Card 1">
        <AdminField label="Number">
          <AdminInput value={dxNum1} onChange={setDxNum1} placeholder="01" />
        </AdminField>
        <AdminField label="Title">
          <AdminInput value={dxTitle1} onChange={setDxTitle1} placeholder="Human Intelligence" />
        </AdminField>
        <AdminField label="Body">
          <AdminTextarea value={dxBody1} onChange={setDxBody1} rows={4} placeholder="Years of real market understanding…" />
        </AdminField>
      </AdminSection>

      <AdminSection title="DX Card 2">
        <AdminField label="Number">
          <AdminInput value={dxNum2} onChange={setDxNum2} placeholder="02" />
        </AdminField>
        <AdminField label="Title">
          <AdminInput value={dxTitle2} onChange={setDxTitle2} placeholder="System Precision" />
        </AdminField>
        <AdminField label="Body">
          <AdminTextarea value={dxBody2} onChange={setDxBody2} rows={4} placeholder="The power of intelligent tools…" />
        </AdminField>
      </AdminSection>

      <AdminSection title="Tagline">
        <AdminField label="Tagline (italic, shown below both cards)">
          <AdminTextarea value={dxTagline} onChange={setDxTagline} rows={2} placeholder="Together, they produce something neither can achieve alone…" />
        </AdminField>
        <AdminSaveButton onClick={() => save({ dxNum1, dxTitle1, dxBody1, dxNum2, dxTitle2, dxBody2, dxTagline })} saving={saving} />
      </AdminSection>
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
  const { save, saving } = useAdminSave("/api/admin/story-page");

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

  return (
    <AdminSection title="Manifesto Items">
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

      <AdminSaveButton onClick={() => save({ manifestoItems: items })} saving={saving} />
    </AdminSection>
  );
}
