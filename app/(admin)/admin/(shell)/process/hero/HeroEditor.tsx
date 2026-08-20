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

import type { ProcessPageData } from "../types";

export function HeroEditor({ initial }: { initial: ProcessPageData }) {
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
