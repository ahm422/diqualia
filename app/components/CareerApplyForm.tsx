"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { FileDropzone } from "@/app/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { formatCnicInput } from "@/lib/cnic";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fieldErrorsFromFlatten, readApiError, type FieldErrors } from "@/lib/public-form";
import {
  CareerApplyEducationSchema,
  CareerApplyOtherSchema,
  CareerApplyPersonalSchema,
  CareerApplyProfessionalSchema,
  GENDER_VALUES,
  MARITAL_VALUES,
  PHOTO_ACCEPT,
  photoFileError,
  QUALIFICATION_VALUES,
  RESUME_ACCEPT,
  resumeFileError,
} from "@/lib/schemas/public/career-apply";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting"; progress: number | null }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

type StepId = "personal" | "education" | "professional" | "other";

const STEPS: { id: StepId; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "education", label: "Education" },
  { id: "professional", label: "Professional" },
  { id: "other", label: "Other" },
];

const idleBorder = "color-mix(in oklab, var(--border) 80%, transparent)";
const errorBorder = "color-mix(in oklab, var(--destructive) 75%, var(--border))";

const GENDER_LABELS: Record<(typeof GENDER_VALUES)[number], string> = {
  female: "Female",
  male: "Male",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

const MARITAL_LABELS: Record<(typeof MARITAL_VALUES)[number], string> = {
  single: "Single",
  married: "Married",
  divorced: "Divorced",
  widowed: "Widowed",
};

const QUALIFICATION_LABELS: Record<(typeof QUALIFICATION_VALUES)[number], string> = {
  matric: "Matric",
  intermediate: "Intermediate",
  bachelor: "Bachelor's",
  master: "Master's",
  mphil: "MPhil",
  phd: "PhD",
  other: "Other",
};

function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function draftStorageKey(jobOpeningId: number) {
  return `career-apply-draft:${jobOpeningId}`;
}

function readStoredToken(jobOpeningId: number) {
  try {
    return sessionStorage.getItem(draftStorageKey(jobOpeningId));
  } catch {
    return null;
  }
}

function writeStoredToken(jobOpeningId: number, token: string) {
  try {
    sessionStorage.setItem(draftStorageKey(jobOpeningId), token);
  } catch {
    // ignore quota / private mode
  }
}

function clearStoredToken(jobOpeningId: number) {
  try {
    sessionStorage.removeItem(draftStorageKey(jobOpeningId));
  } catch {
    // ignore
  }
}

async function requestJson(
  url: string,
  method: "POST" | "PUT",
  body: unknown,
): Promise<{ status: number; json: unknown }> {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

function putForm(
  url: string,
  form: FormData,
  onProgress: (pct: number | null) => void,
): Promise<{ status: number; json: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
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

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{label}</div>
      {children}
      {error ? <p className="mt-2 text-[12px] text-red-400">{error}</p> : null}
    </label>
  );
}

const inputClass =
  "mt-2 min-h-11 w-full border bg-transparent px-4 py-3 text-[13px] text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color-mix(in_oklab,var(--gold)_70%,white)]";

function ApplySelect({
  id,
  value,
  onChange,
  error,
  placeholder,
  options,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        className="mt-2 bg-transparent"
        style={{
          borderColor: error ? errorBorder : idleBorder,
          background: "transparent",
        }}
        aria-invalid={error || undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CareerApplyForm({
  jobSlug,
  jobOpeningId,
  jobTitle,
  department,
  headline,
}: {
  jobSlug: string;
  jobOpeningId: number;
  jobTitle: string;
  department?: string | null;
  headline?: string | null;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draftToken, setDraftToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [cnic, setCnic] = useState("");
  const [nationality, setNationality] = useState("Pakistan");
  const [currentAddress, setCurrentAddress] = useState("");
  const [city, setCity] = useState("");
  const [highestQualification, setHighestQualification] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [yearOfCompletion, setYearOfCompletion] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [currentEmployer, setCurrentEmployer] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [keySkills, setKeySkills] = useState("");
  const [noticePeriodDays, setNoticePeriodDays] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  useEffect(() => {
    const token = readStoredToken(jobOpeningId);
    if (!token) return;
    let cancelled = false;
    requestJson("/api/careers/apply/draft/load", "POST", { token }).then((res) => {
      if (cancelled) return;
      if (res.status !== 200) {
        clearStoredToken(jobOpeningId);
        return;
      }
      const data = res.json as {
        token?: string;
        personal?: Record<string, unknown> | null;
        education?: Record<string, unknown> | null;
        professional?: Record<string, unknown> | null;
        other?: Record<string, unknown> | null;
      };
      if (typeof data.token === "string") {
        setDraftToken(data.token);
        writeStoredToken(jobOpeningId, data.token);
      }
      const personal = data.personal;
      if (personal) {
        setName(String(personal.name ?? ""));
        setEmail(String(personal.email ?? ""));
        setPhone(String(personal.phone ?? ""));
        setFatherOrHusbandName(String(personal.fatherOrHusbandName ?? ""));
        setDateOfBirth(String(personal.dateOfBirth ?? ""));
        setGender(String(personal.gender ?? ""));
        setMaritalStatus(String(personal.maritalStatus ?? ""));
        setCnic(formatCnicInput(String(personal.cnic ?? "")));
        setNationality(String(personal.nationality ?? "Pakistan"));
        setCurrentAddress(String(personal.currentAddress ?? ""));
        setCity(String(personal.city ?? ""));
      }
      const education = data.education;
      if (education) {
        setHighestQualification(String(education.highestQualification ?? ""));
        setFieldOfStudy(String(education.fieldOfStudy ?? ""));
        setInstitutionName(String(education.institutionName ?? ""));
        setYearOfCompletion(education.yearOfCompletion == null ? "" : String(education.yearOfCompletion));
      }
      const professional = data.professional;
      if (professional) {
        setYearsOfExperience(
          professional.yearsOfExperience == null ? "" : String(professional.yearsOfExperience),
        );
        setCurrentEmployer(String(professional.currentEmployer ?? ""));
        setCurrentJobTitle(String(professional.currentJobTitle ?? ""));
        setCoverNote(String(professional.coverNote ?? ""));
      }
      const other = data.other;
      if (other) {
        setKeySkills(String(other.keySkills ?? ""));
        setNoticePeriodDays(other.noticePeriodDays == null ? "" : String(other.noticePeriodDays));
        setExpectedSalary(other.expectedSalary == null ? "" : String(other.expectedSalary));
        setAvailableFrom(String(other.availableFrom ?? ""));
        setDeclarationAccepted(Boolean(other.declarationAccepted));
        setResumeUploaded(Boolean(other.resumeUploaded));
        setPhotoUploaded(Boolean(other.photoUploaded));
      }
      if (!personal) setStepIndex(0);
      else if (!education) setStepIndex(1);
      else if (!professional) setStepIndex(2);
      else setStepIndex(3);
    });
    return () => {
      cancelled = true;
    };
  }, [jobOpeningId]);

  function clearField(key: string) {
    setFields((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  }

  function applyResume(file: File | null) {
    const err = file ? resumeFileError(file) : resumeUploaded ? null : resumeFileError(file);
    setResume(file);
    setResumeError(err);
  }

  function applyPhoto(file: File | null) {
    const err = file ? photoFileError(file) : photoUploaded ? null : photoFileError(file);
    setPhoto(file);
    setPhotoError(err);
  }

  function resetForm() {
    clearStoredToken(jobOpeningId);
    setDraftToken(null);
    setStepIndex(0);
    setName("");
    setEmail("");
    setPhone("");
    setCoverNote("");
    setFatherOrHusbandName("");
    setDateOfBirth("");
    setGender("");
    setMaritalStatus("");
    setCnic("");
    setNationality("Pakistan");
    setCurrentAddress("");
    setCity("");
    setHighestQualification("");
    setFieldOfStudy("");
    setInstitutionName("");
    setYearOfCompletion("");
    setYearsOfExperience("");
    setCurrentEmployer("");
    setCurrentJobTitle("");
    setKeySkills("");
    setNoticePeriodDays("");
    setExpectedSalary("");
    setAvailableFrom("");
    setDeclarationAccepted(false);
    setResumeUploaded(false);
    setPhotoUploaded(false);
    setResume(null);
    setPhoto(null);
    setResumeError(null);
    setPhotoError(null);
    setWebsite("");
    setFields({});
    setState({ status: "idle" });
  }

  async function ensureToken(): Promise<string | null> {
    if (draftToken) return draftToken;
    const created = await requestJson("/api/careers/apply/draft", "POST", {
      jobSlug,
      jobOpeningId: String(jobOpeningId),
    });
    if (created.status !== 200) {
      const parsedErr = readApiError(created.json);
      setState({ status: "error", message: parsedErr.message });
      return null;
    }
    const token =
      typeof created.json === "object" &&
      created.json &&
      "token" in created.json &&
      typeof (created.json as { token: unknown }).token === "string"
        ? (created.json as { token: string }).token
        : "";
    if (!token) {
      setState({ status: "error", message: "Could not start application." });
      return null;
    }
    setDraftToken(token);
    writeStoredToken(jobOpeningId, token);
    return token;
  }

  function applyApiError(json: unknown, fallback = "Please fix the highlighted fields.") {
    const parsedErr = readApiError(json, fallback);
    setFields(parsedErr.fields);
    if (parsedErr.fields.resume) setResumeError(parsedErr.fields.resume);
    if (parsedErr.fields.photo) setPhotoError(parsedErr.fields.photo);
    setState({ status: "error", message: parsedErr.message });
  }

  async function savePersonal(): Promise<boolean> {
    const parsed = CareerApplyPersonalSchema.safeParse({
      name,
      email,
      phone,
      fatherOrHusbandName,
      dateOfBirth,
      gender,
      maritalStatus,
      cnic,
      nationality,
      currentAddress,
      city,
    });
    if (!parsed.success) {
      setFields(fieldErrorsFromFlatten(parsed.error.flatten()));
      setState({ status: "error", message: "Please fix the highlighted fields." });
      return false;
    }
    setFields({});
    const token = await ensureToken();
    if (!token) return false;
    const res = await requestJson("/api/careers/apply/draft/personal", "PUT", {
      token,
      name,
      email,
      phone,
      fatherOrHusbandName,
      dateOfBirth,
      gender,
      maritalStatus,
      cnic,
      nationality,
      currentAddress,
      city,
    });
    if (res.status < 200 || res.status >= 300) {
      applyApiError(res.json);
      return false;
    }
    return true;
  }

  async function saveEducation(): Promise<boolean> {
    const parsed = CareerApplyEducationSchema.safeParse({
      highestQualification,
      fieldOfStudy,
      institutionName,
      yearOfCompletion,
    });
    if (!parsed.success) {
      setFields(fieldErrorsFromFlatten(parsed.error.flatten()));
      setState({ status: "error", message: "Please fix the highlighted fields." });
      return false;
    }
    if (!draftToken) {
      setState({ status: "error", message: "Start with your personal details." });
      return false;
    }
    setFields({});
    const res = await requestJson("/api/careers/apply/draft/education", "PUT", {
      token: draftToken,
      highestQualification,
      fieldOfStudy,
      institutionName,
      yearOfCompletion,
    });
    if (res.status < 200 || res.status >= 300) {
      applyApiError(res.json);
      return false;
    }
    return true;
  }

  async function saveProfessional(): Promise<boolean> {
    const parsed = CareerApplyProfessionalSchema.safeParse({
      yearsOfExperience,
      currentEmployer,
      currentJobTitle,
      coverNote,
    });
    if (!parsed.success) {
      setFields(fieldErrorsFromFlatten(parsed.error.flatten()));
      setState({ status: "error", message: "Please fix the highlighted fields." });
      return false;
    }
    if (!draftToken) {
      setState({ status: "error", message: "Start with your personal details." });
      return false;
    }
    setFields({});
    const res = await requestJson("/api/careers/apply/draft/professional", "PUT", {
      token: draftToken,
      yearsOfExperience,
      currentEmployer,
      currentJobTitle,
      coverNote,
    });
    if (res.status < 200 || res.status >= 300) {
      applyApiError(res.json);
      return false;
    }
    return true;
  }

  async function saveOtherAndSubmit(): Promise<boolean> {
    const parsed = CareerApplyOtherSchema.safeParse({
      keySkills,
      noticePeriodDays,
      expectedSalary,
      availableFrom,
      declarationAccepted: declarationAccepted ? "true" : "",
    });
    const nextFields = parsed.success ? ({} as FieldErrors) : fieldErrorsFromFlatten(parsed.error.flatten());
    const fileErr = resume || resumeUploaded ? (resume ? resumeFileError(resume) : null) : resumeFileError(null);
    const picErr = photo || photoUploaded ? (photo ? photoFileError(photo) : null) : photoFileError(null);
    if (fileErr) nextFields.resume = fileErr;
    if (picErr) nextFields.photo = picErr;
    if (!declarationAccepted) nextFields.declarationAccepted = "You must accept the declaration.";
    setResumeError(fileErr);
    setPhotoError(picErr);
    setFields(nextFields);
    if (!parsed.success || fileErr || picErr || !declarationAccepted) {
      setState({ status: "error", message: "Please fix the highlighted fields." });
      return false;
    }
    if (!draftToken) {
      setState({ status: "error", message: "Start with your personal details." });
      return false;
    }

    const form = new FormData();
    form.append("token", draftToken);
    form.append("keySkills", keySkills);
    form.append("noticePeriodDays", noticePeriodDays);
    form.append("expectedSalary", expectedSalary);
    form.append("availableFrom", availableFrom);
    form.append("declarationAccepted", "true");
    if (resume) form.append("resume", resume);
    if (photo) form.append("photo", photo);

    setState({ status: "submitting", progress: 0 });
    const saved = await putForm("/api/careers/apply/draft/other", form, (progress) => {
      setState({ status: "submitting", progress });
    });
    if (saved.status < 200 || saved.status >= 300) {
      applyApiError(saved.json);
      return false;
    }
    setResumeUploaded(true);
    setPhotoUploaded(true);

    const submitted = await requestJson("/api/careers/apply/draft/submit", "POST", {
      token: draftToken,
      website,
    });
    if (submitted.status < 200 || submitted.status >= 300) {
      applyApiError(submitted.json);
      return false;
    }
    const data = submitted.json;
    const id =
      typeof data === "object" && data && "id" in data && typeof (data as { id: unknown }).id === "string"
        ? (data as { id: string }).id
        : "";
    clearStoredToken(jobOpeningId);
    setDraftToken(null);
    setState({ status: "success", id });
    return true;
  }

  async function onContinue(e: FormEvent) {
    e.preventDefault();
    if (state.status === "submitting") return;
    setState({ status: "submitting", progress: null });
    try {
      const step = STEPS[stepIndex].id;
      let ok = false;
      if (step === "personal") ok = await savePersonal();
      else if (step === "education") ok = await saveEducation();
      else if (step === "professional") ok = await saveProfessional();
      else ok = await saveOtherAndSubmit();
      if (!ok) return;
      if (step !== "other") {
        setState({ status: "idle" });
        setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
      }
    } catch (caught) {
      setState({
        status: "error",
        message: caught instanceof Error ? caught.message : "Submission failed",
      });
    }
  }

  const progress = state.status === "submitting" ? state.progress : null;
  const panelStyle = {
    borderColor: idleBorder,
    background: "var(--bg-elev)",
  };
  const step = STEPS[stepIndex];

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

  const controlStyle = (key: string) => ({
    borderColor: fields[key] ? errorBorder : idleBorder,
  });

  return (
    <form onSubmit={onContinue} className="border p-8 md:p-10" style={panelStyle} noValidate>
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
        <div className="text-[11px] tracking-[0.18em] uppercase text-primary">Position</div>
        <Field label="Position">
          <input className={inputClass} style={{ borderColor: idleBorder }} value={jobTitle} readOnly />
        </Field>
        <Field label="Department">
          <input
            className={inputClass}
            style={{ borderColor: idleBorder }}
            value={department || "—"}
            readOnly
          />
        </Field>
        <Field label="Date of application">
          <input className={inputClass} style={{ borderColor: idleBorder }} value={todayIso()} readOnly />
        </Field>
      </div>

      <ol className="mt-8 flex flex-wrap gap-2" aria-label="Application steps">
        {STEPS.map((item, index) => {
          const current = index === stepIndex;
          return (
            <li
              key={item.id}
              className="min-h-11 px-3 py-2 text-[11px] tracking-[0.18em] uppercase"
              style={{
                border: `1px solid ${current ? "var(--gold)" : idleBorder}`,
                color: current ? "var(--gold)" : "var(--muted-foreground)",
              }}
              aria-current={current ? "step" : undefined}
            >
              {index + 1}. {item.label}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid grid-cols-1 gap-4">
        {step.id === "personal" ? (
          <>
            <Field label="Name" htmlFor="apply-name" error={fields.name}>
              <input
                id="apply-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearField("name");
                }}
                className={inputClass}
                style={controlStyle("name")}
                placeholder="Your name"
                maxLength={200}
                autoComplete="name"
                aria-invalid={Boolean(fields.name)}
              />
            </Field>
            <Field label="Father’s / husband’s name" error={fields.fatherOrHusbandName}>
              <input
                value={fatherOrHusbandName}
                onChange={(e) => setFatherOrHusbandName(e.target.value)}
                className={inputClass}
                style={controlStyle("fatherOrHusbandName")}
                maxLength={200}
              />
            </Field>
            <Field label="Date of birth" htmlFor="apply-dob" error={fields.dateOfBirth}>
              <input
                id="apply-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  clearField("dateOfBirth");
                }}
                className={inputClass}
                style={controlStyle("dateOfBirth")}
                aria-invalid={Boolean(fields.dateOfBirth)}
              />
            </Field>
            <Field label="Gender" error={fields.gender}>
              <ApplySelect
                value={gender}
                onChange={(value) => {
                  setGender(value);
                  clearField("gender");
                }}
                error={Boolean(fields.gender)}
                placeholder="Select"
                options={GENDER_VALUES.map((value) => ({ value, label: GENDER_LABELS[value] }))}
              />
            </Field>
            <Field label="Marital status" error={fields.maritalStatus}>
              <ApplySelect
                value={maritalStatus}
                onChange={(value) => {
                  setMaritalStatus(value);
                  clearField("maritalStatus");
                }}
                error={Boolean(fields.maritalStatus)}
                placeholder="Select"
                options={MARITAL_VALUES.map((value) => ({ value, label: MARITAL_LABELS[value] }))}
              />
            </Field>
            <Field label="Nationality" error={fields.nationality}>
              <input
                value={nationality}
                onChange={(e) => {
                  setNationality(e.target.value);
                  clearField("nationality");
                }}
                className={inputClass}
                style={controlStyle("nationality")}
                maxLength={80}
              />
            </Field>
            <Field label="CNIC" error={fields.cnic}>
              <input
                value={cnic}
                onChange={(e) => {
                  setCnic(formatCnicInput(e.target.value));
                  clearField("cnic");
                }}
                className={inputClass}
                style={controlStyle("cnic")}
                placeholder="12345-1234567-8"
                maxLength={15}
                inputMode="numeric"
                aria-invalid={Boolean(fields.cnic)}
              />
            </Field>
            <Field label="Email" htmlFor="apply-email" error={fields.email}>
              <input
                id="apply-email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearField("email");
                }}
                className={inputClass}
                style={controlStyle("email")}
                placeholder="you@company.com"
                maxLength={254}
                inputMode="email"
                autoComplete="email"
                aria-invalid={Boolean(fields.email)}
              />
            </Field>
            <Field label="Phone" htmlFor="apply-phone" error={fields.phone}>
              <input
                id="apply-phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearField("phone");
                }}
                className={inputClass}
                style={controlStyle("phone")}
                placeholder="+92…"
                maxLength={50}
                autoComplete="tel"
                aria-invalid={Boolean(fields.phone)}
              />
            </Field>
            <Field label="Current address" error={fields.currentAddress}>
              <textarea
                value={currentAddress}
                onChange={(e) => {
                  setCurrentAddress(e.target.value);
                  clearField("currentAddress");
                }}
                className={`${inputClass} min-h-[100px] resize-y`}
                style={controlStyle("currentAddress")}
                maxLength={500}
              />
            </Field>
            <Field label="City" error={fields.city}>
              <input
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  clearField("city");
                }}
                className={inputClass}
                style={controlStyle("city")}
                maxLength={120}
              />
            </Field>
          </>
        ) : null}

        {step.id === "education" ? (
          <>
            <Field label="Highest qualification" error={fields.highestQualification}>
              <ApplySelect
                value={highestQualification}
                onChange={(value) => {
                  setHighestQualification(value);
                  clearField("highestQualification");
                }}
                error={Boolean(fields.highestQualification)}
                placeholder="Select"
                options={QUALIFICATION_VALUES.map((value) => ({
                  value,
                  label: QUALIFICATION_LABELS[value],
                }))}
              />
            </Field>
            <Field label="Field of study">
              <input
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                className={inputClass}
                style={{ borderColor: idleBorder }}
                maxLength={200}
              />
            </Field>
            <Field label="Institution">
              <input
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className={inputClass}
                style={{ borderColor: idleBorder }}
                maxLength={200}
              />
            </Field>
            <Field label="Year of completion">
              <input
                type="number"
                value={yearOfCompletion}
                onChange={(e) => setYearOfCompletion(e.target.value)}
                className={inputClass}
                style={controlStyle("yearOfCompletion")}
                min={1950}
                max={2100}
              />
            </Field>
          </>
        ) : null}

        {step.id === "professional" ? (
          <>
            <Field label="Years of experience" error={fields.yearsOfExperience}>
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => {
                  setYearsOfExperience(e.target.value);
                  clearField("yearsOfExperience");
                }}
                className={inputClass}
                style={controlStyle("yearsOfExperience")}
                min={0}
              />
            </Field>
            <Field label="Current employer">
              <input
                value={currentEmployer}
                onChange={(e) => setCurrentEmployer(e.target.value)}
                className={inputClass}
                style={{ borderColor: idleBorder }}
                maxLength={200}
              />
            </Field>
            <Field label="Current job title">
              <input
                value={currentJobTitle}
                onChange={(e) => setCurrentJobTitle(e.target.value)}
                className={inputClass}
                style={{ borderColor: idleBorder }}
                maxLength={200}
              />
            </Field>
            <Field label="Cover note (optional)">
              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className={`${inputClass} min-h-[140px] resize-y`}
                style={{ borderColor: idleBorder }}
                placeholder="Niche you know, a piece of work you are proud of, and why this role."
                maxLength={10000}
              />
            </Field>
          </>
        ) : null}

        {step.id === "other" ? (
          <>
            <Field label="Key skills" error={fields.keySkills}>
              <textarea
                value={keySkills}
                onChange={(e) => {
                  setKeySkills(e.target.value);
                  clearField("keySkills");
                }}
                className={`${inputClass} min-h-[140px] resize-y`}
                style={controlStyle("keySkills")}
                maxLength={4000}
              />
            </Field>
            <Field label="Notice period (days)" error={fields.noticePeriodDays}>
              <input
                type="number"
                value={noticePeriodDays}
                onChange={(e) => {
                  setNoticePeriodDays(e.target.value);
                  clearField("noticePeriodDays");
                }}
                className={inputClass}
                style={controlStyle("noticePeriodDays")}
                min={0}
              />
            </Field>
            <Field label="Expected salary (PKR)" error={fields.expectedSalary}>
              <input
                type="number"
                value={expectedSalary}
                onChange={(e) => {
                  setExpectedSalary(e.target.value);
                  clearField("expectedSalary");
                }}
                className={inputClass}
                style={controlStyle("expectedSalary")}
                min={1}
              />
            </Field>
            <Field label="Available from" error={fields.availableFrom}>
              <input
                type="date"
                value={availableFrom}
                onChange={(e) => {
                  setAvailableFrom(e.target.value);
                  clearField("availableFrom");
                }}
                className={inputClass}
                style={controlStyle("availableFrom")}
              />
            </Field>
            <div>
              <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                Resume (PDF, DOC, DOCX · 5 MB)
              </div>
              <FileDropzone
                file={resume}
                onFile={applyResume}
                accept={RESUME_ACCEPT}
                error={resumeError}
                errorId="career-resume-error"
                emptyLabel={resumeUploaded ? "Resume already on file — drop to replace" : "Drop a resume here"}
              />
            </div>
            <div>
              <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                Photograph (JPG, PNG, WebP · 2 MB)
              </div>
              <FileDropzone
                file={photo}
                onFile={applyPhoto}
                accept={PHOTO_ACCEPT}
                error={photoError}
                errorId="career-photo-error"
                emptyLabel={photoUploaded ? "Photo already on file — drop to replace" : "Drop a photo here"}
              />
            </div>
            <label className="flex items-start gap-3 text-[13px] leading-7 text-muted-foreground">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0"
                checked={declarationAccepted}
                onChange={(e) => {
                  setDeclarationAccepted(e.target.checked);
                  clearField("declarationAccepted");
                }}
                aria-invalid={Boolean(fields.declarationAccepted)}
              />
              <span>
                I confirm that the information in this application is true and complete. I understand that a false
                statement may lead to rejection or withdrawal of an offer.
              </span>
            </label>
            {fields.declarationAccepted ? (
              <p className="text-[12px] text-red-400">{fields.declarationAccepted}</p>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="hidden" aria-hidden>
        <label>
          Website
          <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "submitting" ? (
        <div className="mt-6" aria-live="polite">
          <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
            {progress == null ? "Saving…" : `Uploading ${progress}%`}
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
        <p className="mt-6 text-[12px] leading-7 text-muted-foreground">
          {step.id === "other"
            ? "Skills, availability, resume, photo, and declaration are required on this step."
            : "Complete this step to continue. Position details stay on file and are not a saved step."}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        {stepIndex > 0 ? (
          <Button
            type="button"
            variant="outline"
            disabled={state.status === "submitting"}
            onClick={() => {
              setFields({});
              setState({ status: "idle" });
              setStepIndex((index) => Math.max(index - 1, 0));
            }}
          >
            Back
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={state.status === "submitting"}>
          {state.status === "submitting"
            ? "Saving…"
            : step.id === "other"
              ? "Submit application"
              : "Continue"}
        </Button>
      </div>
    </form>
  );
}
