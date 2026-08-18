"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminSaveButton,
  useAdminSave,
} from "@/components/admin";
import { slugify } from "@/lib/slugify";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;

export type JobOpeningData = {
  id: number;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: unknown;
  order: number;
  visible: boolean;
};

type Props = {
  initial?: JobOpeningData | null;
};

export function JobOpeningEditor({ initial }: Props) {
  const router = useRouter();
  const isNew = !initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [type, setType] = useState<(typeof JOB_TYPES)[number]>(
    JOB_TYPES.includes(initial?.type as (typeof JOB_TYPES)[number])
      ? (initial?.type as (typeof JOB_TYPES)[number])
      : "Full-time",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [requirements, setRequirements] = useState<string[]>(
    Array.isArray(initial?.requirements)
      ? (initial.requirements as string[]).filter(Boolean)
      : [],
  );
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { save, saving } = useAdminSave(
    initial ? `/api/admin/job-openings/${initial.id}` : "/api/admin/job-openings",
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function payload() {
    const parsedOrder = parseInt(order, 10);
    const base: Record<string, unknown> = {
      title,
      department,
      location,
      type,
      description,
      requirements: requirements.filter((item) => item.trim().length > 0),
      visible,
    };
    if (slug.trim()) base.slug = slug.trim();
    if (!isNew) base.order = Number.isFinite(parsedOrder) ? parsedOrder : 0;
    return base;
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/job-openings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const result = (await res.json()) as { id?: number; error?: string };
      if (res.ok && result.id != null) {
        toast.success("Created");
        router.push(`/admin/careers/openings/${result.id}`);
        router.refresh();
      } else {
        toast.error(typeof result.error === "string" ? result.error : "Create failed");
      }
    } catch {
      toast.error("Create failed — try again");
    } finally {
      setCreating(false);
    }
  }

  function handleSave() {
    save(payload(), () => router.refresh());
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`Delete “${initial.title}”? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/job-openings/${initial.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Deleted");
        router.push("/admin/careers/openings");
        router.refresh();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed — try again");
    } finally {
      setDeleting(false);
    }
  }

  function updateRequirement(idx: number, val: string) {
    setRequirements((prev) => prev.map((it, i) => (i === idx ? val : it)));
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/careers/openings"
          className="text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:text-[var(--gold)]"
        >
          ← All openings
        </Link>
      </div>

      <AdminSection title={isNew ? "New opening" : "Edit opening"}>
        <AdminField label="Title">
          <AdminInput value={title} onChange={handleTitleChange} placeholder="Research Analyst" />
        </AdminField>
        <AdminField label="Slug">
          <AdminInput
            value={slug}
            onChange={(v) => {
              setSlugTouched(true);
              setSlug(v);
            }}
            placeholder="lowercase-kebab-slug"
          />
        </AdminField>
        <AdminField label="Department">
          <AdminInput value={department} onChange={setDepartment} placeholder="Intelligence" />
        </AdminField>
        <AdminField label="Location">
          <AdminInput value={location} onChange={setLocation} placeholder="Remote" />
        </AdminField>
        <AdminField label="Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as (typeof JOB_TYPES)[number])}
            className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
          >
            {JOB_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Description (Markdown)">
          <AdminTextarea value={description} onChange={setDescription} rows={12} />
        </AdminField>
        <AdminField label="Requirements">
          <div className="space-y-2">
            {requirements.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <AdminInput
                  value={item}
                  onChange={(v) => updateRequirement(idx, v)}
                  placeholder="Requirement"
                />
                <button
                  type="button"
                  onClick={() => setRequirements((prev) => prev.filter((_, i) => i !== idx))}
                  className="shrink-0 text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setRequirements((prev) => [...prev, ""])}
              className="rounded border border-[var(--diq_border)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              + Add requirement
            </button>
          </div>
        </AdminField>
        {!isNew && (
          <AdminField label="Order">
            <AdminInput value={order} onChange={setOrder} type="number" />
          </AdminField>
        )}
        <label className="flex items-center gap-2 text-sm text-[var(--diq_mid)]">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="accent-[var(--gold)]"
          />
          Visible on /careers
        </label>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {isNew ? (
            <AdminSaveButton onClick={handleCreate} saving={creating} />
          ) : (
            <AdminSaveButton onClick={handleSave} saving={saving} />
          )}
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="mt-4 rounded border border-red-400/40 px-4 py-2 text-xs uppercase tracking-widest text-red-400 hover:bg-red-400/10 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </AdminSection>
    </div>
  );
}
