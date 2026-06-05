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

type ContactPageData = {
  id: number;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  body: string;
  emailLabel: string;
  emailType: string;
  email: string;
  emailCopy: string;
  whatToIncludeItems: unknown;
  expectationEyebrow: string;
  expectationText: string;
} | null;

type Props = {
  initialData: ContactPageData;
};

// ─── Main editor ─────────────────────────────────────────────────────────────

type Tab = "hero" | "emailCard" | "whatToInclude" | "expectation";

export function ContactPageEditor({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("hero");

  const tabs: { id: Tab; label: string }[] = [
    { id: "hero",          label: "Hero" },
    { id: "emailCard",     label: "Email Card" },
    { id: "whatToInclude", label: "What to Include" },
    { id: "expectation",   label: "Expectation" },
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

      {activeTab === "hero"          && <HeroTab          initial={initialData} />}
      {activeTab === "emailCard"     && <EmailCardTab     initial={initialData} />}
      {activeTab === "whatToInclude" && <WhatToIncludeTab initial={initialData} />}
      {activeTab === "expectation"   && <ExpectationTab   initial={initialData} />}
    </div>
  );
}

// ─── Hero tab ─────────────────────────────────────────────────────────────────

function HeroTab({ initial }: { initial: ContactPageData }) {
  const [eyebrow,       setEyebrow]       = useState(initial?.eyebrow       ?? "");
  const [headlineLine1, setHeadlineLine1] = useState(initial?.headlineLine1 ?? "");
  const [headlineLine2, setHeadlineLine2] = useState(initial?.headlineLine2 ?? "");
  const [body,          setBody]          = useState(initial?.body          ?? "");
  const { save, saving } = useAdminSave("/api/admin/contact-page");

  return (
    <AdminSection title="Hero">
      <AdminField label="Eyebrow">
        <AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Contact" />
      </AdminField>
      <AdminField label="Headline line 1">
        <AdminInput value={headlineLine1} onChange={setHeadlineLine1} placeholder="Start with" />
      </AdminField>
      <AdminField label="Headline line 2 (italic primary)">
        <AdminInput value={headlineLine2} onChange={setHeadlineLine2} placeholder="intelligence." />
      </AdminField>
      <AdminField label="Body">
        <AdminTextarea value={body} onChange={setBody} rows={4} placeholder="Every engagement begins with…" />
      </AdminField>
      <AdminSaveButton onClick={() => save({ eyebrow, headlineLine1, headlineLine2, body })} saving={saving} />
    </AdminSection>
  );
}

// ─── Email card tab ───────────────────────────────────────────────────────────

function EmailCardTab({ initial }: { initial: ContactPageData }) {
  const [emailLabel, setEmailLabel] = useState(initial?.emailLabel ?? "");
  const [emailType,  setEmailType]  = useState(initial?.emailType  ?? "");
  const [email,      setEmail]      = useState(initial?.email      ?? "");
  const [emailCopy,  setEmailCopy]  = useState(initial?.emailCopy  ?? "");
  const { save, saving } = useAdminSave("/api/admin/contact-page");

  return (
    <AdminSection title="Email Card">
      <AdminField label="Label (e.g. 'Primary contact')">
        <AdminInput value={emailLabel} onChange={setEmailLabel} placeholder="Primary contact" />
      </AdminField>
      <AdminField label="Type (e.g. 'Email')">
        <AdminInput value={emailType} onChange={setEmailType} placeholder="Email" />
      </AdminField>
      <AdminField label="Email address">
        <AdminInput value={email} onChange={setEmail} placeholder="intel@diqualia.com" />
      </AdminField>
      <AdminField label="Copy below email">
        <AdminTextarea value={emailCopy} onChange={setEmailCopy} rows={3} placeholder="Tell us your niche…" />
      </AdminField>
      <AdminSaveButton onClick={() => save({ emailLabel, emailType, email, emailCopy })} saving={saving} />
    </AdminSection>
  );
}

// ─── What to include tab ──────────────────────────────────────────────────────

function WhatToIncludeTab({ initial }: { initial: ContactPageData }) {
  const [items, setItems] = useState<string[]>(
    Array.isArray(initial?.whatToIncludeItems)
      ? (initial.whatToIncludeItems as string[]).filter(Boolean)
      : []
  );
  const { save, saving } = useAdminSave("/api/admin/contact-page");

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

  function addItem() {
    setItems((prev) => [...prev, ""]);
  }

  return (
    <AdminSection title="What to Include Items">
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
              >↑</button>
              <button
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                className="rounded px-1 text-xs text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30"
              >↓</button>
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
            >Delete</button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-3 rounded border border-[var(--diq_border)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
      >
        + Add item
      </button>

      <AdminSaveButton onClick={() => save({ whatToIncludeItems: items })} saving={saving} />
    </AdminSection>
  );
}

// ─── Expectation tab ──────────────────────────────────────────────────────────

function ExpectationTab({ initial }: { initial: ContactPageData }) {
  const [expectationEyebrow, setExpectationEyebrow] = useState(initial?.expectationEyebrow ?? "");
  const [expectationText,    setExpectationText]    = useState(initial?.expectationText    ?? "");
  const { save, saving } = useAdminSave("/api/admin/contact-page");

  return (
    <AdminSection title="Expectation">
      <AdminField label="Eyebrow">
        <AdminInput value={expectationEyebrow} onChange={setExpectationEyebrow} placeholder="Expectation" />
      </AdminField>
      <AdminField label="Text (italic, displayed below eyebrow)">
        <AdminTextarea value={expectationText} onChange={setExpectationText} rows={3} placeholder="No noise. No pressure…" />
      </AdminField>
      <AdminSaveButton onClick={() => save({ expectationEyebrow, expectationText })} saving={saving} />
    </AdminSection>
  );
}
