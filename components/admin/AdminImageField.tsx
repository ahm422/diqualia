"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function AdminImageField({
  label,
  currentUrl,
  onUpload,
  onRemove,
  accept = "image/jpeg,image/png,image/webp,image/svg+xml",
}: {
  label: string;
  currentUrl: string | null;
  onUpload: (url: string, key: string) => void;
  onRemove?: () => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function keyFromUrl(url: string | null): string | null {
    if (!url) return null;
    try {
      const path = new URL(url).pathname;
      return path.startsWith("/") ? path.slice(1) : path;
    } catch {
      return null;
    }
  }

  const activeKey = storageKey ?? keyFromUrl(currentUrl);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = (await res.json()) as { url?: string; key?: string; error?: string };
      if (res.ok && data.url && data.key) {
        setStorageKey(data.key);
        onUpload(data.url, data.key);
        toast.success("Image uploaded");
      } else {
        toast.error(data.error ?? "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!activeKey && !currentUrl) {
      onRemove?.();
      return;
    }

    setRemoving(true);
    try {
      if (activeKey) {
        const res = await fetch("/api/admin/upload", {
          method: "DELETE",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key: activeKey }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          toast.error(data?.error ?? "Failed to remove image");
          return;
        }
      }
      setStorageKey(null);
      onRemove?.();
      toast.success("Image removed");
    } catch {
      toast.error("Failed to remove image");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="mb-4">
      <label className="mb-1 block text-xs uppercase tracking-widest text-[var(--diq_mid)]">
        {label}
      </label>
      <div className="flex flex-wrap items-start gap-4">
        {currentUrl && (
          <div className="relative">
            <Image
              src={currentUrl}
              alt={`${label} preview`}
              width={160}
              height={50}
              className="rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] object-contain p-2"
              style={{ height: 50, width: "auto" }}
            />
            <button
              onClick={handleRemove}
              disabled={removing}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white disabled:opacity-50"
              title="Remove image"
            >
              ×
            </button>
          </div>
        )}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`img-upload-${label.toLowerCase().replace(/\s+/g, "-")}`}
          />
          <label
            htmlFor={`img-upload-${label.toLowerCase().replace(/\s+/g, "-")}`}
            className="cursor-pointer rounded border border-[var(--diq_border)] px-3 py-2 text-xs text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            {uploading ? "Uploading…" : currentUrl ? "Replace image" : "Upload image"}
          </label>
          <p className="mt-1 text-[11px] text-[var(--diq_mid)]">JPEG, PNG, WebP, SVG · max 5 MB</p>
        </div>
      </div>
    </div>
  );
}
