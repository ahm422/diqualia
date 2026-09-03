"use client";

import { Suspense, useState } from "react";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminSaveButton,
  useAdminSave,
  useScrollToSection,
} from "@/components/admin";

import type { ServicesPageData } from "../types";

export function IntroEditor({ initial }: { initial: ServicesPageData }) {
  return (
    <Suspense fallback={null}>
      <IntroEditorInner initial={initial} />
    </Suspense>
  );
}

function IntroEditorInner({ initial }: { initial: ServicesPageData }) {
  useScrollToSection();

  return (
    <div>
      <HeroBlock initial={initial} />
      <CtaBlock initial={initial} />
    </div>
  );
}

function HeroBlock({ initial }: { initial: ServicesPageData }) {
  const [f, setF] = useState({
    eyebrow: initial?.eyebrow ?? "",
    headline: initial?.headline ?? "",
    body: initial?.body ?? "",
    stat1Value: initial?.stat1Value ?? "",
    stat1Label: initial?.stat1Label ?? "",
    stat2Value: initial?.stat2Value ?? "",
    stat2Label: initial?.stat2Label ?? "",
    stat3Value: initial?.stat3Value ?? "",
    stat3Label: initial?.stat3Label ?? "",
    stat4Value: initial?.stat4Value ?? "",
    stat4Label: initial?.stat4Label ?? "",
  });
  const set = (key: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [key]: v }));
  const { save, saving } = useAdminSave("/api/admin/services-page");

  return (
    <AdminSection id="hero" title="Hero">
      <AdminField label="Eyebrow"><AdminInput value={f.eyebrow} onChange={set("eyebrow")} placeholder="Our Intelligence Services" /></AdminField>
      <AdminField label="Headline"><AdminInput value={f.headline} onChange={set("headline")} placeholder="What We Do for You." /></AdminField>
      <AdminField label="Body"><AdminTextarea value={f.body} onChange={set("body")} rows={3} /></AdminField>
      <div className="mt-2 mb-2 text-xs uppercase tracking-widest text-[var(--diq_mid)]">Stats</div>
      <div className="grid gap-4 sm:grid-cols-2">
        {([
          ["stat1Value", "stat1Label", "6", "Core Services"],
          ["stat2Value", "stat2Label", "94%", "Lead Quality Rate"],
          ["stat3Value", "stat3Label", "3.8x", "Pipeline Growth"],
          ["stat4Value", "stat4Label", "~21d", "First Qualified Lead"],
        ] as const).map(([vk, lk, vp, lp]) => (
          <div key={vk} className="rounded border border-[var(--diq_border2)] p-3">
            <AdminField label="Value"><AdminInput value={f[vk]} onChange={set(vk)} placeholder={vp} /></AdminField>
            <AdminField label="Label"><AdminInput value={f[lk]} onChange={set(lk)} placeholder={lp} /></AdminField>
          </div>
        ))}
      </div>
      <AdminSaveButton onClick={() => save(f)} saving={saving} />
    </AdminSection>
  );
}

function CtaBlock({ initial }: { initial: ServicesPageData }) {
  const [f, setF] = useState({
    ctaEyebrow: initial?.ctaEyebrow ?? "",
    ctaHeadline: initial?.ctaHeadline ?? "",
    ctaBody: initial?.ctaBody ?? "",
    ctaBtn1Label: initial?.ctaBtn1Label ?? "",
    ctaBtn1Href: initial?.ctaBtn1Href ?? "",
    ctaEmailHref: initial?.ctaEmailHref ?? "",
  });
  const set = (key: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [key]: v }));
  const { save, saving } = useAdminSave("/api/admin/services-page");

  return (
    <AdminSection id="cta" title="CTA Strip">
      <AdminField label="Eyebrow"><AdminInput value={f.ctaEyebrow} onChange={set("ctaEyebrow")} placeholder="Begin With Intelligence" /></AdminField>
      <AdminField label="Headline"><AdminInput value={f.ctaHeadline} onChange={set("ctaHeadline")} placeholder="Ready to Start?" /></AdminField>
      <AdminField label="Body"><AdminTextarea value={f.ctaBody} onChange={set("ctaBody")} rows={2} /></AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Button Label"><AdminInput value={f.ctaBtn1Label} onChange={set("ctaBtn1Label")} placeholder="Contact" /></AdminField>
        <AdminField label="Button Href"><AdminInput value={f.ctaBtn1Href} onChange={set("ctaBtn1Href")} placeholder="/contact" /></AdminField>
        <AdminField label="Email (mailto)"><AdminInput value={f.ctaEmailHref} onChange={set("ctaEmailHref")} placeholder="intel@diqualia.com" /></AdminField>
      </div>
      <AdminSaveButton onClick={() => save(f)} saving={saving} />
    </AdminSection>
  );
}
