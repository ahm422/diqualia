"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { fieldErrorsFromFlatten, readApiError, type FieldErrors } from "@/lib/public-form";
import {
  CareerApplyFieldsSchema,
  RESUME_ACCEPT,
  resumeFileError,
} from "@/lib/schemas/public/career-apply";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting"; progress: number | null }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

const idleBorder = "color-mix(in oklab, var(--border) 80%, transparent)";
const errorBorder = "color-mix(in oklab, var(--destructive) 75%, var(--border))";
const okBorder = "color-mix(in oklab, var(--gold) 70%, var(--border))";

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

export function CareerApplyForm({
  jobSlug,
  jobTitle,
  headline,
}: {
  jobSlug: string;
  jobTitle: string;
  headline?: string | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [website, setWebsite] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  function applyFile(file: File | null) {
    const err = file ? resumeFileError(file) : null;
    setResume(file);
    setResumeError(err);
    if (inputRef.current && !file) inputRef.current.value = "";
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setCoverNote("");
    applyFile(null);
    setWebsite("");
    setFields({});
    setState({ status: "idle" });
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    applyFile(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state.status === "submitting") return;

    const parsed = CareerApplyFieldsSchema.safeParse({
      name,
      email,
      phone,
      coverNote,
      jobSlug,
      website,
    });
    const nextFields = parsed.success ? ({} as FieldErrors) : fieldErrorsFromFlatten(parsed.error.flatten());
    const fileErr = resumeFileError(resume);
    if (fileErr) nextFields.resume = fileErr;
    setResumeError(fileErr);
    setFields(nextFields);

    if (!parsed.success || fileErr) {
      setState({ status: "error", message: "Please fix the highlighted fields." });
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

      if (res.status < 200 || res.status >= 300) {
        const parsedErr = readApiError(res.json);
        setFields(parsedErr.fields);
        if (parsedErr.fields.resume) setResumeError(parsedErr.fields.resume);
        setState({ status: "error", message: parsedErr.message });
        return;
      }

      const data = res.json;
      const id =
        typeof data === "object" && data && "id" in data && typeof (data as { id: unknown }).id === "string"
          ? (data as { id: string }).id
          : "";
      setState({ status: "success", id });
    } catch (caught) {
      setState({
        status: "error",
        message: caught instanceof Error ? caught.message : "Submission failed",
      });
    }
  }

  const dropState = dragging ? "dragging" : resumeError ? "error" : resume ? "ok" : "idle";
  const dropBorder =
    dropState === "error" ? errorBorder : dropState === "ok" || dropState === "dragging" ? okBorder : idleBorder;
  const progress = state.status === "submitting" ? state.progress : null;
  const panelStyle = {
    borderColor: idleBorder,
    background: "var(--bg-elev)",
  };

  if (state.status === "success") {
    return (
      <div className="border p-8 md:p-10" style={panelStyle} role="status" aria-live="polite">
        <div className="text-[10px] tracking-[0.22em] uppercase text-primary">Received</div>
        <p
          className="mt-3 text-foreground"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(1.15rem, 2vw, 1.5rem)",
            lineHeight: 1.3,
          }}
        >
          We received your application for {jobTitle}.
        </p>
        <p className="mt-4 text-[13px] leading-7 text-muted-foreground">
          The team will reply with next steps. Typical response is within 5–7 business days.
        </p>
        {state.id ? (
          <p className="mt-4 text-[11px] text-muted-foreground">
            Reference: <span className="font-mono">{state.id}</span>
          </p>
        ) : null}
        <div className="mt-8">
          <Button type="button" variant="primary" onClick={resetForm}>
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border p-8 md:p-10" style={panelStyle} noValidate>
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
            onChange={(e) => {
              setName(e.target.value);
              if (fields.name) setFields((prev) => ({ ...prev, name: "" }));
            }}
            className="mt-2 w-full border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={{ borderColor: fields.name ? errorBorder : idleBorder }}
            placeholder="Your name"
            maxLength={200}
            autoComplete="name"
            aria-invalid={Boolean(fields.name)}
            aria-describedby={fields.name ? "career-name-error" : undefined}
          />
          {fields.name ? (
            <p id="career-name-error" className="mt-2 text-[12px] text-red-400">
              {fields.name}
            </p>
          ) : null}
        </label>

        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Email</div>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fields.email) setFields((prev) => ({ ...prev, email: "" }));
            }}
            className="mt-2 w-full border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={{ borderColor: fields.email ? errorBorder : idleBorder }}
            placeholder="you@company.com"
            maxLength={254}
            inputMode="email"
            autoComplete="email"
            aria-invalid={Boolean(fields.email)}
            aria-describedby={fields.email ? "career-email-error" : undefined}
          />
          {fields.email ? (
            <p id="career-email-error" className="mt-2 text-[12px] text-red-400">
              {fields.email}
            </p>
          ) : null}
        </label>

        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Phone (optional)</div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={{ borderColor: idleBorder }}
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
            style={{ borderColor: idleBorder }}
            placeholder="Niche you know, a piece of work you are proud of, and why this role."
            maxLength={10000}
          />
        </label>

        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
            Resume (PDF, DOC, DOCX · 5 MB)
          </div>
          <div
            className="mt-2 min-h-11 border px-4 py-6 text-center transition-colors"
            style={{
              borderColor: dropBorder,
              background:
                dropState === "dragging"
                  ? "color-mix(in oklab, var(--gold) 10%, transparent)"
                  : dropState === "error"
                    ? "color-mix(in oklab, var(--destructive) 8%, transparent)"
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
            aria-invalid={Boolean(resumeError)}
            aria-describedby={resumeError ? "career-resume-error" : undefined}
          >
            <input
              ref={inputRef}
              type="file"
              accept={RESUME_ACCEPT}
              className="sr-only"
              onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
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
                    className="min-h-11 px-2 text-[11px] tracking-[0.18em] uppercase text-primary"
                    onClick={() => inputRef.current?.click()}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    className="min-h-11 px-2 text-[11px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground"
                    onClick={() => applyFile(null)}
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
                Drop a file here, or <span className="text-primary">click to upload</span>
              </button>
            )}
          </div>
          {resumeError ? (
            <p id="career-resume-error" className="mt-2 text-[12px] text-red-400">
              {resumeError}
            </p>
          ) : null}
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

      {state.status === "error" ? (
        <p className="mt-6 text-[13px] leading-7 text-red-400" role="alert">
          {state.message}
        </p>
      ) : state.status === "idle" ? (
        <p className="mt-6 text-[12px] leading-7 text-muted-foreground">Name, email, and resume are required.</p>
      ) : null}

      <div className="mt-8">
        <Button type="submit" variant="primary" disabled={state.status === "submitting"}>
          {state.status === "submitting" ? "Sending…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
