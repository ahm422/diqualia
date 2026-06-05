"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useAdminSave(endpoint: string) {
  const [saving, setSaving] = useState(false);

  async function save(
    data: Record<string, unknown>,
    onSuccess?: (result: unknown) => void,
  ) {
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await res.json()) as Record<string, unknown>;
      if (res.ok) {
        toast.success("Saved");
        onSuccess?.(result);
      } else {
        const msg =
          typeof result?.error === "string" ? result.error : "Save failed — try again";
        toast.error(msg);
      }
    } catch {
      toast.error("Save failed — try again");
    } finally {
      setSaving(false);
    }
  }

  return { save, saving };
}
