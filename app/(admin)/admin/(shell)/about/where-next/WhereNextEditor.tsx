"use client";

import { useState } from "react";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminSaveButton,
  useAdminSave,
} from "@/components/admin";

import type { AboutWhereNext } from "../types";

export function WhereNextEditor({ initial }: { initial: AboutWhereNext }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [btn1Label, setBtn1Label] = useState(initial?.btn1Label ?? "");
  const [btn1Href, setBtn1Href] = useState(initial?.btn1Href ?? "");
  const [btn2Label, setBtn2Label] = useState(initial?.btn2Label ?? "");
  const [btn2Href, setBtn2Href] = useState(initial?.btn2Href ?? "");
  const { save, saving } = useAdminSave("/api/admin/about-where-next");

  return (
    <AdminSection title="Where Next CTA">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Where next" /></AdminField>
      <AdminField label="Headline"><AdminInput value={headline} onChange={setHeadline} placeholder="See how we work — then start with intelligence." /></AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Button 1 Label"><AdminInput value={btn1Label} onChange={setBtn1Label} placeholder="How We Work" /></AdminField>
        <AdminField label="Button 1 Href"><AdminInput value={btn1Href} onChange={setBtn1Href} placeholder="/process" /></AdminField>
        <AdminField label="Button 2 Label"><AdminInput value={btn2Label} onChange={setBtn2Label} placeholder="Contact" /></AdminField>
        <AdminField label="Button 2 Href"><AdminInput value={btn2Href} onChange={setBtn2Href} placeholder="/contact" /></AdminField>
      </div>
      <AdminSaveButton onClick={() => save({ eyebrow, headline, btn1Label, btn1Href, btn2Label, btn2Href })} saving={saving} />
    </AdminSection>
  );
}
