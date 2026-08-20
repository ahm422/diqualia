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

import type { StoryPageData } from "../types";

export function HeroEditor({ initial }: { initial: StoryPageData }) {
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
