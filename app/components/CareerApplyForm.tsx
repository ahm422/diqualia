"use client";

import { useMemo, useState, type FormEvent } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set(["pdf", "doc", "docx"]);
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
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

export function CareerApplyForm({ jobSlug }: { jobSlug: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && email.trim().length > 0 && resume != null;
  }, [name, email, resume]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || state.status === "submitting") return;

    const err = fileError(resume);
    if (err) {
      setState({ status: "error", message: err });
      return;
    }

    setState({ status: "submitting" });
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      form.append("phone", phone);
      form.append("coverNote", coverNote);
      form.append("jobSlug", jobSlug);
      form.append("website", website);
      if (resume) form.append("resume", resume);

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        body: form,
      });

      const data = (await res.json()) as unknown;
      if (!res.ok) {
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
      setResume(null);
      setWebsite("");
    } catch (caught) {
      setState({
        status: "error",
        message: caught instanceof Error ? caught.message : "Submission failed",
      });
    }
  }

  const fieldBorder = { borderColor: "color-mix(in oklab, var(--border) 80%, transparent)" };

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

        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Resume (PDF, DOC, DOCX · 5 MB)</div>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setResume(e.target.files?.[0] ?? null)}
            className="mt-2 w-full text-[13px] text-foreground file:mr-3 file:rounded file:border file:border-[var(--diq_border)] file:bg-transparent file:px-3 file:py-2 file:text-[11px] file:uppercase file:tracking-widest file:text-primary"
            required
          />
        </label>

        <div className="hidden" aria-hidden>
          <label>
            Website
            <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="submit" className="diq-btnGhost" disabled={!canSubmit || state.status === "submitting"}>
          {state.status === "submitting" ? "Sending…" : "Submit application"}
        </button>
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
