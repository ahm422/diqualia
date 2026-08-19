"use client";

import { useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";

import { Button } from "@/components/ui/button";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set(["pdf", "doc", "docx"]);
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);
const ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting"; progress: number | null }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

function fileError(file: File | null): string | null {
  if (!file) return "Resume is required.";
  if (file.size > MAX_BYTES) return "Resume must be 5 MB or smaller.";
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (!ALLOWED_EXT.has(ext)) return "Resume must be PDF, DOC, or DOCX.";
  if (file.type && !ALLOWED_MIME.has(file.type.toLowerCase())) {
    return "Resume must be PDF, DOC, or DOCX.";
  }
  return null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function postForm(
  form: FormData,
  onProgress: (pct: number | null) => void,
): Promise<{ status: number; json: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/careers/apply");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      } else {
        onProgress(null);
      }
    };
    xhr.onload = () => {
      try {
        resolve({ status: xhr.status, json: JSON.parse(xhr.responseText) as unknown });
      } catch {
        reject(new Error("Submission failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Submission failed"));
    xhr.send(form);
  });
}

export function CareerApplyForm({ jobSlug, headline }: { jobSlug: string; headline?: string | null }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && email.trim().length > 0 && resume != null && resumeError == null;
  }, [name, email, resume, resumeError]);

  function applyFile(file: File | null) {
    const err = fileError(file);
    setResume(file);
    setResumeError(file ? err : null);
    if (inputRef.current && !file) inputRef.current.value = "";
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    applyFile(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || state.status === "submitting") return;

    const err = fileError(resume);
    if (err) {
      setResumeError(err);
      setState({ status: "error", message: err });
      return;
    }

    setState({ status: "submitting", progress: 0 });
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      form.append("phone", phone);
      form.append("coverNote", coverNote);
      form.append("jobSlug", jobSlug);
      form.append("website", website);
      if (resume) form.append("resume", resume);

      const res = await postForm(form, (progress) => {
        setState({ status: "submitting", progress });
      });

      const data = res.json;
      if (res.status < 200 || res.status >= 300) {
        const msg =
          typeof data === "object" && data && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Submission failed";
        setState({ status: "error", message: msg });
        return;
      }

      const id =
        typeof data === "object" && data && "id" in data && typeof (data as { id: unknown }).id === "string"
          ? (data as { id: string }).id
          : "";
      setState({ status: "success", id });
      setName("");
      setEmail("");
      setPhone("");
      setCoverNote("");
      applyFile(null);
      setWebsite("");
    } catch (caught) {
      setState({
        status: "error",
        message: caught instanceof Error ? caught.message : "Submission failed",
      });
    }
  }

  const fieldBorder = { borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" };
  const progress = state.status === "submitting" ? state.progress : null;

  return (
    <form
      onSubmit={onSubmit}
      className="border p-8 md:p-10"
      style={{
        borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
        background: "var(--bg-elev)",
      }}
    >
      <div className="text-[10px] tracking-[0.22em] uppercase text-primary">Apply</div>
      {headline ? (
        <div
          className="mt-3 text-foreground"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(1.15rem, 2vw, 1.5rem)",
            lineHeight: 1.3,
          }}
        >
          {headline}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4">
        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={fieldBorder}
            placeholder="Your name"
            maxLength={200}
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={fieldBorder}
            placeholder="you@company.com"
            maxLength={254}
            inputMode="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Phone (optional)</div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={fieldBorder}
            placeholder="+1…"
            maxLength={50}
            autoComplete="tel"
          />
        </label>

        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Cover note (optional)</div>
          <textarea
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            className="mt-2 min-h-[140px] w-full resize-y border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={fieldBorder}
            placeholder="Niche you know, a piece of work you are proud of, and why this role."
            maxLength={10000}
          />
        </label>

        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
            Resume (PDF, DOC, DOCX · 5 MB)
          </div>
          <div
            className="mt-2 border px-4 py-6 text-center transition-colors"
            style={{
              ...fieldBorder,
              background: dragging
                ? "color-mix(in oklab, var(--gold) 10%, transparent)"
                : "transparent",
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
              required={!resume}
            />
            {resume ? (
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                <div className="text-left">
                  <div className="text-[13px] text-foreground">{resume.name}</div>
                  <div className="text-[11px] text-muted-foreground">{formatBytes(resume.size)}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-[11px] tracking-[0.18em] uppercase text-primary"
                    onClick={() => inputRef.current?.click()}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground"
                    onClick={() => applyFile(null)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="text-[13px] text-muted-foreground"
                onClick={() => inputRef.current?.click()}
              >
                Drop a file here, or <span className="text-primary">click to upload</span>
              </button>
            )}
          </div>
          {resumeError ? <div className="mt-2 text-[12px] text-red-400">{resumeError}</div> : null}
        </div>

        <div className="hidden" aria-hidden>
          <label>
            Website
            <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      {state.status === "submitting" ? (
        <div className="mt-6" aria-live="polite">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
            {progress == null ? "Uploading…" : `Uploading ${progress}%`}
          </div>
          <div
            className="mt-2 h-0.5 w-full overflow-hidden"
            style={{ background: "color-mix(in oklab, var(--border) 80%, transparent)" }}
          >
            <div
              className={progress == null ? "diq-uploadIndeterminate h-full" : "h-full"}
              style={{
                width: progress == null ? "40%" : `${progress}%`,
                background: "var(--primary)",
                transition: progress == null ? undefined : "width 0.2s ease",
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button type="submit" variant="secondary" disabled={!canSubmit || state.status === "submitting"}>
          {state.status === "submitting" ? "Sending…" : "Submit application"}
        </Button>
        <div className="text-[12px] leading-7 text-muted-foreground">
          {state.status === "idle" ? "Name, email, and resume are required." : null}
          {state.status === "success" ? "Received — we’ll reply with next steps." : null}
          {state.status === "error" ? state.message : null}
        </div>
      </div>
      {state.status === "success" ? (
        <div className="mt-4 text-[11px] text-muted-foreground">
          Reference: <span className="font-mono">{state.id}</span>
        </div>
      ) : null}
    </form>
  );
}
