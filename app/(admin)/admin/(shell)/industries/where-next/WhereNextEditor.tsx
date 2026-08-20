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

export function WhereNextEditor({ initial }: { initial: IndustriesPageData }) {
  const [eyebrow, setEyebrow] = useState(initial?.whereNextEyebrow ?? "");
  const [title1, setTitle1] = useState(initial?.whereNextTitle1 ?? "");
  const [title2, setTitle2] = useState(initial?.whereNextTitle2 ?? "");
  const [body, setBody] = useState(initial?.whereNextBody ?? "");
  const { save, saving } = useAdminSave("/api/admin/industries-page");

  return (
    <AdminSection title="Where Next CTA">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Start here" /></AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Title Line 1"><AdminInput value={title1} onChange={setTitle1} placeholder="Tell us your niche —" /></AdminField>
        <AdminField label="Title Line 2"><AdminInput value={title2} onChange={setTitle2} placeholder="we'll map your buyers." /></AdminField>
      </div>
      <AdminField label="Body"><AdminTextarea value={body} onChange={setBody} rows={3} /></AdminField>
      <AdminSaveButton onClick={() => save({ whereNextEyebrow: eyebrow, whereNextTitle1: title1, whereNextTitle2: title2, whereNextBody: body })} saving={saving} />
    </AdminSection>
  );
}
