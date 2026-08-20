"use client";

import { Suspense, useState } from "react";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminSaveButton,
  useAdminSave,
  useAdminSectionTab,
} from "@/components/admin";

export type CareerPageData = {
  id: number;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  body: string;
  cultureEyebrow: string;
  cultureHeadline: string;
  cultureBody: string;
  benefits: unknown;
  applyEyebrow: string;
  applyHeadline: string;
  applyBody: string;
} | null;

type Props = {
  initialData: CareerPageData;
};

const CAREER_TABS = ["hero", "culture", "benefits", "apply"] as const;
type Tab = (typeof CAREER_TABS)[number];

export function CareerPageEditor(props: Props) {
  return (
    <Suspense fallback={null}>
      <CareerPageEditorInner {...props} />
    </Suspense>
  );
}

function CareerPageEditorInner({ initialData }: Props) {
  const { activeTab, setTab } = useAdminSectionTab(CAREER_TABS, "hero");

  const tabs: { id: Tab; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "culture", label: "Culture" },
    { id: "benefits", label: "Benefits" },
    { id: "apply", label: "Apply instructions" },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-[var(--diq_border)] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
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
      {activeTab === "culture" && <CultureTab initial={initialData} />}
      {activeTab === "benefits" && <BenefitsTab initial={initialData} />}
      {activeTab === "apply" && <ApplyTab initial={initialData} />}
    </div>
  );
}

function HeroTab({ initial }: { initial: CareerPageData }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [headlineLine1, setHeadlineLine1] = useState(initial?.headlineLine1 ?? "");
  const [headlineLine2, setHeadlineLine2] = useState(initial?.headlineLine2 ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const { save, saving } = useAdminSave("/api/admin/career-page");

  return (
    <AdminSection title="Hero">
      <AdminField label="Eyebrow">
        <AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Careers" />
      </AdminField>
      <AdminField label="Headline line 1">
        <AdminInput value={headlineLine1} onChange={setHeadlineLine1} placeholder="Build intelligence." />
      </AdminField>
      <AdminField label="Headline line 2 (italic primary)">
        <AdminInput value={headlineLine2} onChange={setHeadlineLine2} placeholder="Join the unit." />
      </AdminField>
      <AdminField label="Body">
        <AdminTextarea value={body} onChange={setBody} rows={4} placeholder="DiQualia is a small research unit…" />
      </AdminField>
      <AdminSaveButton onClick={() => save({ eyebrow, headlineLine1, headlineLine2, body })} saving={saving} />
    </AdminSection>
  );
}

function CultureTab({ initial }: { initial: CareerPageData }) {
  const [cultureEyebrow, setCultureEyebrow] = useState(initial?.cultureEyebrow ?? "");
  const [cultureHeadline, setCultureHeadline] = useState(initial?.cultureHeadline ?? "");
  const [cultureBody, setCultureBody] = useState(initial?.cultureBody ?? "");
  const { save, saving } = useAdminSave("/api/admin/career-page");

  return (
    <AdminSection title="Culture">
      <AdminField label="Eyebrow">
        <AdminInput value={cultureEyebrow} onChange={setCultureEyebrow} placeholder="Culture" />
      </AdminField>
      <AdminField label="Headline">
        <AdminInput value={cultureHeadline} onChange={setCultureHeadline} placeholder="A unit, not a factory." />
      </AdminField>
      <AdminField label="Body">
        <AdminTextarea value={cultureBody} onChange={setCultureBody} rows={4} />
      </AdminField>
      <AdminSaveButton
        onClick={() => save({ cultureEyebrow, cultureHeadline, cultureBody })}
        saving={saving}
      />
    </AdminSection>
  );
}

function StringListEditor({
  title,
  field,
  initialItems,
}: {
  title: string;
  field: string;
  initialItems: unknown;
}) {
  const [items, setItems] = useState<string[]>(
    Array.isArray(initialItems) ? (initialItems as string[]).filter(Boolean) : [],
  );
  const { save, saving } = useAdminSave("/api/admin/career-page");

  function update(idx: number, val: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? val : it)));
  }

  function remove(idx: number) {
    if (!confirm("Delete this item?")) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    const next = [...items];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setItems(next);
  }

  return (
    <AdminSection title={title}>
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
        onClick={() => setItems((prev) => [...prev, ""])}
        className="mt-3 rounded border border-[var(--diq_border)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
      >
        + Add item
      </button>
      <AdminSaveButton onClick={() => save({ [field]: items.filter((item) => item.trim().length > 0) })} saving={saving} />
    </AdminSection>
  );
}

function BenefitsTab({ initial }: { initial: CareerPageData }) {
  return <StringListEditor title="Benefits" field="benefits" initialItems={initial?.benefits} />;
}

function ApplyTab({ initial }: { initial: CareerPageData }) {
  const [applyEyebrow, setApplyEyebrow] = useState(initial?.applyEyebrow ?? "");
  const [applyHeadline, setApplyHeadline] = useState(initial?.applyHeadline ?? "");
  const [applyBody, setApplyBody] = useState(initial?.applyBody ?? "");
  const { save, saving } = useAdminSave("/api/admin/career-page");

  return (
    <AdminSection title="Apply instructions">
      <AdminField label="Eyebrow">
        <AdminInput value={applyEyebrow} onChange={setApplyEyebrow} placeholder="How to apply" />
      </AdminField>
      <AdminField label="Headline">
        <AdminInput value={applyHeadline} onChange={setApplyHeadline} placeholder="Send a note. Attach a resume." />
      </AdminField>
      <AdminField label="Body">
        <AdminTextarea value={applyBody} onChange={setApplyBody} rows={4} />
      </AdminField>
      <AdminSaveButton onClick={() => save({ applyEyebrow, applyHeadline, applyBody })} saving={saving} />
    </AdminSection>
  );
}
