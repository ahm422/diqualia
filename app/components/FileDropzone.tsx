"use client";

import { useRef, type DragEvent } from "react";

const idleBorder = "color-mix(in oklab, var(--border) 80%, transparent)";
const errorBorder = "color-mix(in oklab, var(--destructive) 75%, var(--border))";
const okBorder = "color-mix(in oklab, var(--gold) 70%, var(--border))";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({
  file,
  onFile,
  accept,
  error,
  errorId,
  emptyLabel,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  accept: string;
  error: string | null;
  errorId: string;
  emptyLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function setFile(next: File | null) {
    onFile(next);
    if (inputRef.current && !next) inputRef.current.value = "";
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.dataset.dragging = "false";
    setFile(e.dataTransfer.files?.[0] ?? null);
  }

  const dropState = error ? "error" : file ? "ok" : "idle";
  const dropBorder =
    dropState === "error" ? errorBorder : dropState === "ok" ? okBorder : idleBorder;

  return (
    <div>
      <div
        className="mt-2 min-h-11 border px-4 py-6 text-center transition-colors"
        style={{
          borderColor: dropBorder,
          background:
            dropState === "error"
              ? "color-mix(in oklab, var(--destructive) 8%, transparent)"
              : "transparent",
        }}
        data-dragging="false"
        onDragEnter={(e) => {
          e.preventDefault();
          e.currentTarget.dataset.dragging = "true";
          e.currentTarget.style.borderColor = okBorder;
          e.currentTarget.style.background = "color-mix(in oklab, var(--gold) 10%, transparent)";
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.dataset.dragging = "false";
          e.currentTarget.style.borderColor = dropBorder;
          e.currentTarget.style.background =
            dropState === "error"
              ? "color-mix(in oklab, var(--destructive) 8%, transparent)"
              : "transparent";
        }}
        onDrop={onDrop}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <div className="text-left">
              <div className="text-[13px] text-foreground">{file.name}</div>
              <div className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="min-h-11 px-2 text-[11px] tracking-[0.18em] uppercase text-primary"
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </button>
              <button
                type="button"
                className="min-h-11 px-2 text-[11px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground"
                onClick={() => setFile(null)}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="min-h-11 text-[13px] text-muted-foreground"
            onClick={() => inputRef.current?.click()}
          >
            {emptyLabel}, or <span className="text-primary">click to upload</span>
          </button>
        )}
      </div>
      {error ? (
        <p id={errorId} className="mt-2 text-[12px] text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
