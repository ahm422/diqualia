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

export function EmailCardEditor({ initial }: { initial: ContactPageData }) {
  const [emailLabel, setEmailLabel] = useState(initial?.emailLabel ?? "");
  const [emailType,  setEmailType]  = useState(initial?.emailType  ?? "");
  const [email,      setEmail]      = useState(initial?.email      ?? "");
  const [emailCopy,  setEmailCopy]  = useState(initial?.emailCopy  ?? "");
  const { save, saving } = useAdminSave("/api/admin/contact-page");

  return (
    <AdminSection title="Email Card">
      <AdminField label="Label (e.g. 'Primary contact')">
        <AdminInput value={emailLabel} onChange={setEmailLabel} placeholder="Primary contact" />
      </AdminField>
      <AdminField label="Type (e.g. 'Email')">
        <AdminInput value={emailType} onChange={setEmailType} placeholder="Email" />
      </AdminField>
      <AdminField label="Email address">
        <AdminInput value={email} onChange={setEmail} placeholder="info@diqualia.com" />
      </AdminField>
      <AdminField label="Copy below email">
        <AdminTextarea value={emailCopy} onChange={setEmailCopy} rows={3} placeholder="Tell us your niche…" />
      </AdminField>
      <AdminSaveButton onClick={() => save({ emailLabel, emailType, email, emailCopy })} saving={saving} />
    </AdminSection>
  );
}
