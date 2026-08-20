"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { fieldErrorsFromFlatten, readApiError, type FieldErrors } from "@/lib/public-form";
import { CONTACT_AFTER_SUBMIT_STEPS } from "@/lib/contact-copy";
import { ContactBodySchema } from "@/lib/schemas/public/contact";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

const idleBorder = "color-mix(in oklab, var(--border) 80%, transparent)";
const errorBorder = "color-mix(in oklab, var(--destructive) 75%, var(--border))";

function validateContact(values: { name: string; email: string; message: string; website: string }) {
  const parsed = ContactBodySchema.safeParse({
    ...values,
    source: "contact-page",
  });
  if (parsed.success) return { ok: true as const, fields: {} as FieldErrors };
  const fields = fieldErrorsFromFlatten(parsed.error.flatten());
  if (!values.email.trim() && !values.message.trim()) {
    const msg = "Provide at least one of email or message.";
    fields.email = fields.email ?? msg;
    fields.message = fields.message ?? msg;
  }
  return { ok: false as const, fields };
}

export function ContactLeadForm({
  expectationText,
  afterSubmitSteps = [...CONTACT_AFTER_SUBMIT_STEPS],
}: {
  expectationText?: string | null;
  afterSubmitSteps?: readonly string[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
    setWebsite("");
    setFields({});
    setState({ status: "idle" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.status === "submitting") return;

    const next = validateContact({ name, email, message, website });
    if (!next.ok) {
      setFields(next.fields);
      setState({ status: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setFields({});
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          source: "contact-page",
          website,
        }),
      });

      const data = (await res.json()) as unknown;
      if (!res.ok) {
        const parsed = readApiError(data);
        setFields(parsed.fields);
        setState({ status: "error", message: parsed.message });
        return;
      }

      const id =
        typeof data === "object" && data && "id" in data && typeof (data as { id: unknown }).id === "string"
          ? (data as { id: string }).id
          : "";
      setState({ status: "success", id });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Submission failed" });
    }
  }

  const panelStyle = {
    borderColor: idleBorder,
    background: "var(--bg-elev)",
  };

  if (state.status === "success") {
    return (
      <div className="border p-10" style={panelStyle} role="status" aria-live="polite">
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
          We have your note and will reply with next steps.
        </p>
        <div className="mt-6 text-[10px] tracking-[0.22em] uppercase text-primary">After you submit</div>
        <ol className="mt-4 space-y-3 text-[13px] leading-7 text-muted-foreground">
          {afterSubmitSteps.map((step, idx) => (
            <li key={step} className="flex items-start gap-3">
              <span aria-hidden className="text-[11px] tracking-[0.18em] text-primary">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {expectationText ? (
          <p className="mt-6 text-[13px] leading-7 text-muted-foreground">{expectationText}</p>
        ) : null}
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
    <form onSubmit={onSubmit} className="border p-10" style={panelStyle} noValidate>
      <div className="text-[10px] tracking-[0.22em] uppercase text-primary">Send a message</div>

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
            aria-describedby={fields.name ? "contact-name-error" : undefined}
          />
          {fields.name ? (
            <p id="contact-name-error" className="mt-2 text-[12px] text-red-400">
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
            aria-describedby={fields.email ? "contact-email-error" : undefined}
          />
          {fields.email ? (
            <p id="contact-email-error" className="mt-2 text-[12px] text-red-400">
              {fields.email}
            </p>
          ) : null}
        </label>

        <label className="block">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Message</div>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (fields.message) setFields((prev) => ({ ...prev, message: "" }));
            }}
            className="mt-2 min-h-[140px] w-full resize-y border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none"
            style={{ borderColor: fields.message ? errorBorder : idleBorder }}
            placeholder="What are you trying to figure out?"
            maxLength={5000}
            aria-invalid={Boolean(fields.message)}
            aria-describedby={fields.message ? "contact-message-error" : undefined}
          />
          {fields.message ? (
            <p id="contact-message-error" className="mt-2 text-[12px] text-red-400">
              {fields.message}
            </p>
          ) : null}
        </label>

        <div className="hidden" aria-hidden>
          <label>
            Website
            <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      {state.status === "error" ? (
        <p className="mt-6 text-[13px] leading-7 text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <p className="mt-6 text-[12px] leading-7 text-muted-foreground">Email or message is required.</p>
      )}

      <div className="mt-8">
        <Button type="submit" variant="primary" disabled={state.status === "submitting"}>
          {state.status === "submitting" ? "Sending…" : "Send"}
        </Button>
      </div>
    </form>
  );
}
