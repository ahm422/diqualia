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

import type { WhereNext } from "../types";

export function WhereNextEditor({ initial }: { initial: WhereNext }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [btnLabel, setBtnLabel] = useState(initial?.btnLabel ?? "");
  const [btnHref, setBtnHref] = useState(initial?.btnHref ?? "");
  const { save, saving } = useAdminSave("/api/admin/home-where-next");

  return (
    <AdminSection title="Where Next CTA">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Begin With Intelligence" /></AdminField>
      <AdminField label="Headline"><AdminInput value={headline} onChange={setHeadline} placeholder="Ready to Know Your Market Better Than Anyone?" /></AdminField>
      <AdminField label="Body"><AdminTextarea value={body} onChange={setBody} rows={2} /></AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Button Label"><AdminInput value={btnLabel} onChange={setBtnLabel} placeholder="Contact" /></AdminField>
        <AdminField label="Button Href"><AdminInput value={btnHref} onChange={setBtnHref} placeholder="/contact" /></AdminField>
      </div>
      <AdminSaveButton onClick={() => save({ eyebrow, headline, body, btnLabel, btnHref })} saving={saving} />
    </AdminSection>
  );
}
