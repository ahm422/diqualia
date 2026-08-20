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

import type { ContactPageData } from "../types";

export function HeroEditor({ initial }: { initial: ContactPageData }) {
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
