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

export function DoubleExperienceEditor({ initial }: { initial: StoryPageData }) {
  const [dxNum1, setDxNum1] = useState(initial?.dxNum1 ?? "");
  const [dxTitle1, setDxTitle1] = useState(initial?.dxTitle1 ?? "");
  const [dxBody1, setDxBody1] = useState(initial?.dxBody1 ?? "");
  const [dxNum2, setDxNum2] = useState(initial?.dxNum2 ?? "");
  const [dxTitle2, setDxTitle2] = useState(initial?.dxTitle2 ?? "");
  const [dxBody2, setDxBody2] = useState(initial?.dxBody2 ?? "");
  const [dxTagline, setDxTagline] = useState(initial?.dxTagline ?? "");
  const { save, saving } = useAdminSave("/api/admin/story-page");

  return (
    <>
      <AdminSection title="DX Card 1">
        <AdminField label="Number">
          <AdminInput value={dxNum1} onChange={setDxNum1} placeholder="01" />
        </AdminField>
        <AdminField label="Title">
          <AdminInput value={dxTitle1} onChange={setDxTitle1} placeholder="Human Intelligence" />
        </AdminField>
        <AdminField label="Body">
          <AdminTextarea value={dxBody1} onChange={setDxBody1} rows={4} placeholder="Years of real market understanding…" />
        </AdminField>
      </AdminSection>

      <AdminSection title="DX Card 2">
        <AdminField label="Number">
          <AdminInput value={dxNum2} onChange={setDxNum2} placeholder="02" />
        </AdminField>
        <AdminField label="Title">
          <AdminInput value={dxTitle2} onChange={setDxTitle2} placeholder="System Precision" />
        </AdminField>
        <AdminField label="Body">
          <AdminTextarea value={dxBody2} onChange={setDxBody2} rows={4} placeholder="The power of intelligent tools…" />
        </AdminField>
      </AdminSection>

      <AdminSection title="Tagline">
        <AdminField label="Tagline (italic, shown below both cards)">
          <AdminTextarea value={dxTagline} onChange={setDxTagline} rows={2} placeholder="Together, they produce something neither can achieve alone…" />
        </AdminField>
        <AdminSaveButton onClick={() => save({ dxNum1, dxTitle1, dxBody1, dxNum2, dxTitle2, dxBody2, dxTagline })} saving={saving} />
      </AdminSection>
    </>
  );
}
