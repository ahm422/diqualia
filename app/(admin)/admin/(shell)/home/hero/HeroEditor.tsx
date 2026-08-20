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

import type { HomeHero } from "../types";

export function HeroEditor({ initial }: { initial: HomeHero }) {
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
  const set = (key: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [key]: v }));
  const { save, saving } = useAdminSave("/api/admin/home-hero");

  return (
    <AdminSection title="Hero">
      <AdminField label="Eyebrow"><AdminInput value={f.eyebrow} onChange={set("eyebrow")} placeholder="Marketing Intelligence & Research" /></AdminField>
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminField label="Headline Line 1"><AdminInput value={f.headlineLine1} onChange={set("headlineLine1")} placeholder="Intelligence" /></AdminField>
        <AdminField label="Headline Line 2"><AdminInput value={f.headlineLine2} onChange={set("headlineLine2")} placeholder="That Moves" /></AdminField>
        <AdminField label="Headline Line 3"><AdminInput value={f.headlineLine3} onChange={set("headlineLine3")} placeholder="Markets." /></AdminField>
      </div>
      <AdminField label="Body">
        <AdminTextarea value={f.body} onChange={set("body")} rows={3} placeholder="DiQualia is…" />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Button 1 Label"><AdminInput value={f.btn1Label} onChange={set("btn1Label")} placeholder="Our Services" /></AdminField>
        <AdminField label="Button 1 Href"><AdminInput value={f.btn1Href} onChange={set("btn1Href")} placeholder="/services" /></AdminField>
        <AdminField label="Button 2 Label"><AdminInput value={f.btn2Label} onChange={set("btn2Label")} placeholder="Talk to Us" /></AdminField>
        <AdminField label="Button 2 Href"><AdminInput value={f.btn2Href} onChange={set("btn2Href")} placeholder="/contact" /></AdminField>
      </div>
      <div className="mt-2 mb-2 text-xs uppercase tracking-widest text-[var(--diq_mid)]">Stats</div>
      <div className="grid gap-4 sm:grid-cols-3">
        {([["stat1Label", "stat1Value", "Label 1", "Value 1"], ["stat2Label", "stat2Value", "Label 2", "Value 2"], ["stat3Label", "stat3Value", "Label 3", "Value 3"]] as const).map(([lk, vk, lp, vp]) => (
          <div key={lk} className="rounded border border-[var(--diq_border2)] p-3">
            <AdminField label="Label"><AdminInput value={f[lk]} onChange={set(lk)} placeholder={lp} /></AdminField>
            <AdminField label="Value"><AdminInput value={f[vk]} onChange={set(vk)} placeholder={vp} /></AdminField>
          </div>
        ))}
      </div>
      <AdminSaveButton onClick={() => save(f)} saving={saving} />
    </AdminSection>
  );
}
