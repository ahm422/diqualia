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

type ProcessPageData = {
  id: number;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  body: string;
  whereNextEyebrow: string;
  whereNextTitle1: string;
  whereNextTitle2: string;
  whereNextBody: string;
} | null;

type ProcessStepData = {
  id: number;
  stepLabel: string;
  stepNumber: string;
  title: string;
  body: string;
  order: number;
};

type Props = {
  initialPage: ProcessPageData;
  initialSteps: ProcessStepData[];
};

// ─── Main editor ─────────────────────────────────────────────────────────────

type Tab = "hero" | "steps" | "whereNext";

export function ProcessPageEditor({ initialPage, initialSteps }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("hero");

  const tabs: { id: Tab; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "steps", label: "Steps" },
    { id: "whereNext", label: "Where Next" },
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

      {activeTab === "hero" && <HeroSection initial={initialPage} />}
      {activeTab === "steps" && <StepsSection initial={initialSteps} />}
      {activeTab === "whereNext" && <WhereNextSection initial={initialPage} />}
    </div>
  );
}

// ─── Hero tab ─────────────────────────────────────────────────────────────────

function HeroSection({ initial }: { initial: ProcessPageData }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [headlineLine1, setHeadlineLine1] = useState(initial?.headlineLine1 ?? "");
  const [headlineLine2, setHeadlineLine2] = useState(initial?.headlineLine2 ?? "");
  const [headlineLine3, setHeadlineLine3] = useState(initial?.headlineLine3 ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const { save, saving } = useAdminSave("/api/admin/process-page");

  return (
    <AdminSection title="Hero">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="How We Work" /></AdminField>
      <AdminField label="Headline line 1"><AdminInput value={headlineLine1} onChange={setHeadlineLine1} placeholder="Research." /></AdminField>
      <AdminField label="Headline line 2 (italic)"><AdminInput value={headlineLine2} onChange={setHeadlineLine2} placeholder="Precision." /></AdminField>
      <AdminField label="Headline line 3"><AdminInput value={headlineLine3} onChange={setHeadlineLine3} placeholder="Results." /></AdminField>
      <AdminField label="Body"><AdminTextarea value={body} onChange={setBody} rows={4} placeholder="We don't start with tactics…" /></AdminField>
      <AdminSaveButton onClick={() => save({ eyebrow, headlineLine1, headlineLine2, headlineLine3, body })} saving={saving} />
    </AdminSection>
  );
}

// ─── Steps tab ────────────────────────────────────────────────────────────────

function StepsSection({ initial }: { initial: ProcessStepData[] }) {
  const [steps, setSteps] = useState<ProcessStepData[]>(initial);
  const [newLabel, setNewLabel] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [adding, setAdding] = useState(false);

  async function patch(id: number, data: Partial<ProcessStepData>) {
    const res = await fetch(`/api/admin/process-steps/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = (await res.json()) as ProcessStepData;
      setSteps((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
  }

  async function move(id: number, dir: -1 | 1) {
    const idx = steps.findIndex((s) => s.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= steps.length) return;
    const a = steps[idx];
    const b = steps[swapIdx];
    await Promise.all([patch(a.id, { order: b.order }), patch(b.id, { order: a.order })]);
    const next = [...steps];
    next[idx] = { ...a, order: b.order };
    next[swapIdx] = { ...b, order: a.order };
    setSteps(next.sort((x, y) => x.order - y.order));
  }

  async function del(id: number) {
    if (!confirm("Delete this step?")) return;
    const res = await fetch(`/api/admin/process-steps/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setSteps((prev) => prev.filter((s) => s.id !== id).map((s, idx) => ({ ...s, order: idx })));
  }

  async function add() {
    if (!newLabel.trim() || !newNumber.trim() || !newTitle.trim() || !newBody.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/process-steps", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepLabel: newLabel,
        stepNumber: newNumber,
        title: newTitle,
        body: newBody,
      }),
    });
    if (res.ok) {
      const step = (await res.json()) as ProcessStepData;
      setSteps((prev) => [...prev, step]);
      setNewLabel("");
      setNewNumber("");
      setNewTitle("");
      setNewBody("");
    }
    setAdding(false);
  }

  return (
    <AdminSection title="Process Steps">
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="rounded border border-[var(--diq_border2)] p-4">
            <div className="mb-2 grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Step label</label>
                <input
                  defaultValue={step.stepLabel}
                  onBlur={(e) => { if (e.target.value !== step.stepLabel) patch(step.id, { stepLabel: e.target.value }); }}
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Step number</label>
                <input
                  defaultValue={step.stepNumber}
                  onBlur={(e) => { if (e.target.value !== step.stepNumber) patch(step.id, { stepNumber: e.target.value }); }}
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="mb-2">
              <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Title</label>
              <input
                defaultValue={step.title}
                onBlur={(e) => { if (e.target.value !== step.title) patch(step.id, { title: e.target.value }); }}
                className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Body</label>
              <textarea
                defaultValue={step.body}
                onBlur={(e) => { if (e.target.value !== step.body) patch(step.id, { body: e.target.value }); }}
                rows={3}
                className="w-full resize-y rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <button onClick={() => move(step.id, -1)} disabled={idx === 0} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↑</button>
                <button onClick={() => move(step.id, 1)} disabled={idx === steps.length - 1} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↓</button>
              </div>
              <button onClick={() => del(step.id)} className="ml-auto text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[var(--diq_border2)] pt-4">
        <div className="mb-3 text-xs uppercase tracking-widest text-[var(--diq_mid)]">Add step</div>
        <div className="mb-2 grid gap-2 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Step label</label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Step Six"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Step number</label>
            <input
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="06"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
            />
          </div>
        </div>
        <div className="mb-2">
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Title</label>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New step title"
            className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
          />
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Body</label>
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Step description…"
            rows={2}
            className="w-full resize-y rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
          />
        </div>
        <button
          onClick={add}
          disabled={adding || !newLabel.trim() || !newNumber.trim() || !newTitle.trim() || !newBody.trim()}
          className="rounded border border-[var(--gold)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50"
        >
          Add Step
        </button>
      </div>
    </AdminSection>
  );
}

// ─── Where Next tab ──────────────────────────────────────────────────────────

function WhereNextSection({ initial }: { initial: ProcessPageData }) {
  const [whereNextEyebrow, setWhereNextEyebrow] = useState(initial?.whereNextEyebrow ?? "");
  const [whereNextTitle1, setWhereNextTitle1] = useState(initial?.whereNextTitle1 ?? "");
  const [whereNextTitle2, setWhereNextTitle2] = useState(initial?.whereNextTitle2 ?? "");
  const [whereNextBody, setWhereNextBody] = useState(initial?.whereNextBody ?? "");
  const { save, saving } = useAdminSave("/api/admin/process-page");

  return (
    <AdminSection title="Where Next">
      <AdminField label="Eyebrow"><AdminInput value={whereNextEyebrow} onChange={setWhereNextEyebrow} placeholder="Next" /></AdminField>
      <AdminField label="Title line 1"><AdminInput value={whereNextTitle1} onChange={setWhereNextTitle1} placeholder="See what this looks like" /></AdminField>
      <AdminField label="Title line 2"><AdminInput value={whereNextTitle2} onChange={setWhereNextTitle2} placeholder="in your market." /></AdminField>
      <AdminField label="Body"><AdminTextarea value={whereNextBody} onChange={setWhereNextBody} rows={4} placeholder="We'll run a short discovery call…" /></AdminField>
      <AdminSaveButton onClick={() => save({ whereNextEyebrow, whereNextTitle1, whereNextTitle2, whereNextBody })} saving={saving} />
    </AdminSection>
  );
}
