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

import type { IndustriesPageData } from "../types";

export function HeroEditor({ initial }: { initial: IndustriesPageData }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [line1, setLine1] = useState(initial?.headlineLine1 ?? "");
  const [line2, setLine2] = useState(initial?.headlineLine2 ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const { save, saving } = useAdminSave("/api/admin/industries-page");

  return (
    <AdminSection title="Hero">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Industries" /></AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Headline Line 1"><AdminInput value={line1} onChange={setLine1} placeholder="Deep expertise." /></AdminField>
        <AdminField label="Headline Line 2 (italic)"><AdminInput value={line2} onChange={setLine2} placeholder="Broad reach." /></AdminField>
      </div>
      <AdminField label="Body"><AdminTextarea value={body} onChange={setBody} rows={3} placeholder="We operate across…" /></AdminField>
      <AdminSaveButton onClick={() => save({ eyebrow, headlineLine1: line1, headlineLine2: line2, body })} saving={saving} />
    </AdminSection>
  );
}
