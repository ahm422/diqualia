"use client";

import { useState } from "react";

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

// ─── Shared helpers ───────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveStatus({ status }: { status: SaveState }) {
  if (status === "idle")    return null;
  if (status === "saving")  return <span className="text-xs text-[var(--diq_mid)]">Saving…</span>;
  if (status === "saved")   return <span className="text-xs text-green-500">Saved ✓</span>;
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
      className="w-full resize-y rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
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
  return fetch("/api/admin/contact-page", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

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
  const [status, setStatus] = useState<SaveState>("idle");

  async function save() {
    setStatus("saving");
    const res = await apiPatch({ eyebrow, headlineLine1, headlineLine2, body });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="Hero">
      <Field label="Eyebrow">
        <Input value={eyebrow} onChange={setEyebrow} placeholder="Contact" />
      </Field>
      <Field label="Headline line 1">
        <Input value={headlineLine1} onChange={setHeadlineLine1} placeholder="Start with" />
      </Field>
      <Field label="Headline line 2 (italic primary)">
        <Input value={headlineLine2} onChange={setHeadlineLine2} placeholder="intelligence." />
      </Field>
      <Field label="Body">
        <Textarea value={body} onChange={setBody} rows={4} placeholder="Every engagement begins with…" />
      </Field>
      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}

// ─── Email card tab ───────────────────────────────────────────────────────────

function EmailCardTab({ initial }: { initial: ContactPageData }) {
  const [emailLabel, setEmailLabel] = useState(initial?.emailLabel ?? "");
  const [emailType,  setEmailType]  = useState(initial?.emailType  ?? "");
  const [email,      setEmail]      = useState(initial?.email      ?? "");
  const [emailCopy,  setEmailCopy]  = useState(initial?.emailCopy  ?? "");
  const [status, setStatus] = useState<SaveState>("idle");

  async function save() {
    setStatus("saving");
    const res = await apiPatch({ emailLabel, emailType, email, emailCopy });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="Email Card">
      <Field label="Label (e.g. 'Primary contact')">
        <Input value={emailLabel} onChange={setEmailLabel} placeholder="Primary contact" />
      </Field>
      <Field label="Type (e.g. 'Email')">
        <Input value={emailType} onChange={setEmailType} placeholder="Email" />
      </Field>
      <Field label="Email address">
        <Input value={email} onChange={setEmail} placeholder="intel@diqualia.com" />
      </Field>
      <Field label="Copy below email">
        <Textarea value={emailCopy} onChange={setEmailCopy} rows={3} placeholder="Tell us your niche…" />
      </Field>
      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}

// ─── What to include tab ──────────────────────────────────────────────────────

function WhatToIncludeTab({ initial }: { initial: ContactPageData }) {
  const [items, setItems] = useState<string[]>(
    Array.isArray(initial?.whatToIncludeItems)
      ? (initial.whatToIncludeItems as string[]).filter(Boolean)
      : []
  );
  const [status, setStatus] = useState<SaveState>("idle");

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

  async function save() {
    setStatus("saving");
    const res = await apiPatch({ whatToIncludeItems: items });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="What to Include Items">
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

      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}

// ─── Expectation tab ──────────────────────────────────────────────────────────

function ExpectationTab({ initial }: { initial: ContactPageData }) {
  const [expectationEyebrow, setExpectationEyebrow] = useState(initial?.expectationEyebrow ?? "");
  const [expectationText,    setExpectationText]    = useState(initial?.expectationText    ?? "");
  const [status, setStatus] = useState<SaveState>("idle");

  async function save() {
    setStatus("saving");
    const res = await apiPatch({ expectationEyebrow, expectationText });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <Section title="Expectation">
      <Field label="Eyebrow">
        <Input value={expectationEyebrow} onChange={setExpectationEyebrow} placeholder="Expectation" />
      </Field>
      <Field label="Text (italic, displayed below eyebrow)">
        <Textarea value={expectationText} onChange={setExpectationText} rows={3} placeholder="No noise. No pressure…" />
      </Field>
      <SaveBtn onClick={save} status={status} />
    </Section>
  );
}
