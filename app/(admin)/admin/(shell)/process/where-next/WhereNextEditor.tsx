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

export function WhereNextEditor({ initial }: { initial: ProcessPageData }) {
  const [whereNextEyebrow, setWhereNextEyebrow] = useState(initial?.whereNextEyebrow ?? "");
  const [whereNextTitle1, setWhereNextTitle1] = useState(initial?.whereNextTitle1 ?? "");
  const [whereNextTitle2, setWhereNextTitle2] = useState(initial?.whereNextTitle2 ?? "");
  const [whereNextBody, setWhereNextBody] = useState(initial?.whereNextBody ?? "");
  const { save, saving } = useAdminSave("/api/admin/process-page");

  return (
    <AdminSection title="Where Next">
      <AdminField label="Eyebrow"><AdminInput value={whereNextEyebrow} onChange={setWhereNextEyebrow} placeholder="Next" /></AdminField>
      <AdminField label="Title line 1"><AdminInput value={whereNextTitle1} onChange={setWhereNextTitle1} placeholder="See what this looks like" /></AdminField>
      <AdminField label="Title line 2"><AdminInput value={whereNextTitle2} onChange={setWhereNextTitle2} placeholder="in your market." /></AdminField>
      <AdminField label="Body"><AdminTextarea value={whereNextBody} onChange={setWhereNextBody} rows={4} placeholder="We'll run a short discovery call…" /></AdminField>
      <AdminSaveButton onClick={() => save({ whereNextEyebrow, whereNextTitle1, whereNextTitle2, whereNextBody })} saving={saving} />
    </AdminSection>
  );
}
