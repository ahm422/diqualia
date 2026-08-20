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

import type { AboutHero } from "../types";

export function HeroEditor({ initial }: { initial: AboutHero }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const { save, saving } = useAdminSave("/api/admin/about-hero");

  return (
    <AdminSection title="Hero">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="About" /></AdminField>
      <AdminField label="Headline"><AdminInput value={headline} onChange={setHeadline} placeholder="Not an agency. An intelligence unit." /></AdminField>
      <AdminField label="Body"><AdminTextarea value={body} onChange={setBody} rows={4} placeholder="DiQualia operates at the intersection of…" /></AdminField>
      <AdminSaveButton onClick={() => save({ eyebrow, headline, body })} saving={saving} />
    </AdminSection>
  );
}
