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

import type { CareerPageData } from "../types";

export function HeroEditor({ initial }: { initial: CareerPageData }) {
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
