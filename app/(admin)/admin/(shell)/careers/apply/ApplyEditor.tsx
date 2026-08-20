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

export function ApplyEditor({ initial }: { initial: CareerPageData }) {
  const [applyEyebrow, setApplyEyebrow] = useState(initial?.applyEyebrow ?? "");
  const [applyHeadline, setApplyHeadline] = useState(initial?.applyHeadline ?? "");
  const [applyBody, setApplyBody] = useState(initial?.applyBody ?? "");
  const { save, saving } = useAdminSave("/api/admin/career-page");

  return (
    <AdminSection title="Apply instructions">
      <AdminField label="Eyebrow">
        <AdminInput value={applyEyebrow} onChange={setApplyEyebrow} placeholder="How to apply" />
      </AdminField>
      <AdminField label="Headline">
        <AdminInput value={applyHeadline} onChange={setApplyHeadline} placeholder="Send a note. Attach a resume." />
      </AdminField>
      <AdminField label="Body">
        <AdminTextarea value={applyBody} onChange={setApplyBody} rows={4} />
      </AdminField>
      <AdminSaveButton onClick={() => save({ applyEyebrow, applyHeadline, applyBody })} saving={saving} />
    </AdminSection>
  );
}
