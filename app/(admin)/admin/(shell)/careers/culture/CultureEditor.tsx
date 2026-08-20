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

export function CultureEditor({ initial }: { initial: CareerPageData }) {
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
