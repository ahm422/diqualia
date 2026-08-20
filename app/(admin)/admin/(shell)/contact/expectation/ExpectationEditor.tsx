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

export function ExpectationEditor({ initial }: { initial: ContactPageData }) {
  const [expectationEyebrow, setExpectationEyebrow] = useState(initial?.expectationEyebrow ?? "");
  const [expectationText,    setExpectationText]    = useState(initial?.expectationText    ?? "");
  const { save, saving } = useAdminSave("/api/admin/contact-page");

  return (
    <AdminSection title="Expectation">
      <AdminField label="Eyebrow">
        <AdminInput value={expectationEyebrow} onChange={setExpectationEyebrow} placeholder="Expectation" />
      </AdminField>
      <AdminField label="Text (italic, displayed below eyebrow)">
        <AdminTextarea value={expectationText} onChange={setExpectationText} rows={3} placeholder="No noise. No pressure…" />
      </AdminField>
      <AdminSaveButton onClick={() => save({ expectationEyebrow, expectationText })} saving={saving} />
    </AdminSection>
  );
}
