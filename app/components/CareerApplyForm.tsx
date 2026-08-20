"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { FileDropzone } from "@/app/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { fieldErrorsFromFlatten, readApiError, type FieldErrors } from "@/lib/public-form";
import {
  CareerApplyFieldsSchema,
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

const idleBorder = "color-mix(in oklab, var(--border) 80%, transparent)";
const errorBorder = "color-mix(in oklab, var(--destructive) 75%, var(--border))";

type SectionId =
  | "position"
  | "personal"
  | "contact"
  | "education"
  | "experience"
  | "skills"
  | "documents"
  | "declaration";

const SECTION_LABELS: Record<SectionId, string> = {
  position: "Position",
  personal: "Personal",
  contact: "Contact",
  education: "Education",
  experience: "Experience",
  skills: "Skills & availability",
  documents: "Documents",
  declaration: "Declaration",
};

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

function ApplySection({
  id,
  accordion,
  open,
  onToggle,
  children,
}: {
  id: SectionId;
  accordion: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  if (accordion) {
    return (
      <div className="border-b last:border-b-0" style={{ borderColor: idleBorder }}>
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between py-3 text-left text-[11px] tracking-[0.18em] uppercase text-primary"
          aria-expanded={open}
          onClick={onToggle}
        >
          {SECTION_LABELS[id]}
          <span aria-hidden>{open ? "−" : "+"}</span>
        </button>
        {open ? <div className="grid grid-cols-1 gap-4 pb-6">{children}</div> : null}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="pt-2 text-[11px] tracking-[0.18em] uppercase text-primary">{SECTION_LABELS[id]}</div>
      {children}
    </div>
  );
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

export function CareerApplyForm({
  jobSlug,
  jobTitle,
  department,
  headline,
}: {
  jobSlug: string;
  jobTitle: string;
  department?: string | null;
  headline?: string | null;
}) {
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
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [accordion, setAccordion] = useState(true);
  const [openSection, setOpenSection] = useState<SectionId>("personal");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setAccordion(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function clearField(key: string) {
    setFields((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  }

  function applyResume(file: File | null) {
    const err = file ? resumeFileError(file) : null;
    setResume(file);
    setResumeError(err);
  }

  function applyPhoto(file: File | null) {
    const err = file ? photoFileError(file) : null;
    setPhoto(file);
    setPhotoError(err);
  }

  function resetForm() {
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
    applyResume(null);
    applyPhoto(null);
    setWebsite("");
    setFields({});
    setState({ status: "idle" });
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
      fatherOrHusbandName,
      dateOfBirth,
      gender,
      maritalStatus,
      cnic,
      nationality,
      currentAddress,
      city,
      highestQualification,
      fieldOfStudy,
      institutionName,
      yearOfCompletion,
      yearsOfExperience,
      currentEmployer,
      currentJobTitle,
      keySkills,
      noticePeriodDays,
      expectedSalary,
      availableFrom,
      declarationAccepted: declarationAccepted ? "true" : "",
    });
    const nextFields = parsed.success ? ({} as FieldErrors) : fieldErrorsFromFlatten(parsed.error.flatten());
    const fileErr = resumeFileError(resume);
    const picErr = photoFileError(photo);
    if (fileErr) nextFields.resume = fileErr;
    if (picErr) nextFields.photo = picErr;
    if (!declarationAccepted) nextFields.declarationAccepted = "You must accept the declaration.";
    setResumeError(fileErr);
    setPhotoError(picErr);
    setFields(nextFields);

    if (!parsed.success || fileErr || picErr || !declarationAccepted) {
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
      form.append("fatherOrHusbandName", fatherOrHusbandName);
      form.append("dateOfBirth", dateOfBirth);
      form.append("gender", gender);
      form.append("maritalStatus", maritalStatus);
      form.append("cnic", cnic);
      form.append("nationality", nationality);
      form.append("currentAddress", currentAddress);
      form.append("city", city);
      form.append("highestQualification", highestQualification);
      form.append("fieldOfStudy", fieldOfStudy);
      form.append("institutionName", institutionName);
      form.append("yearOfCompletion", yearOfCompletion);
      form.append("yearsOfExperience", yearsOfExperience);
      form.append("currentEmployer", currentEmployer);
      form.append("currentJobTitle", currentJobTitle);
      form.append("keySkills", keySkills);
      form.append("noticePeriodDays", noticePeriodDays);
      form.append("expectedSalary", expectedSalary);
      form.append("availableFrom", availableFrom);
      form.append("declarationAccepted", "true");
      if (resume) form.append("resume", resume);
      if (photo) form.append("photo", photo);

      const res = await postForm(form, (progress) => {
        setState({ status: "submitting", progress });
      });

      if (res.status < 200 || res.status >= 300) {
        const parsedErr = readApiError(res.json);
        setFields(parsedErr.fields);
        if (parsedErr.fields.resume) setResumeError(parsedErr.fields.resume);
        if (parsedErr.fields.photo) setPhotoError(parsedErr.fields.photo);
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

  const progress = state.status === "submitting" ? state.progress : null;
  const panelStyle = {
    borderColor: idleBorder,
    background: "var(--bg-elev)",
  };

  function sectionOpen(id: SectionId) {
    return !accordion || openSection === id;
  }

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

      <div className={accordion ? "mt-6" : "mt-6 grid grid-cols-1 gap-8"}>
        <ApplySection id="position" accordion={accordion} open={sectionOpen("position")} onToggle={() => setOpenSection("position")}>
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
        </ApplySection>

        <ApplySection id="personal" accordion={accordion} open={sectionOpen("personal")} onToggle={() => setOpenSection("personal")}>
          <Field label="Name" error={fields.name}>
            <input
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
          <Field label="Date of birth" error={fields.dateOfBirth}>
            <input
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
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                clearField("gender");
              }}
              className={inputClass}
              style={controlStyle("gender")}
              aria-invalid={Boolean(fields.gender)}
            >
              <option value="">Select</option>
              {GENDER_VALUES.map((value) => (
                <option key={value} value={value}>
                  {GENDER_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Marital status" error={fields.maritalStatus}>
            <select
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
              className={inputClass}
              style={controlStyle("maritalStatus")}
            >
              <option value="">Select</option>
              {MARITAL_VALUES.map((value) => (
                <option key={value} value={value}>
                  {MARITAL_LABELS[value]}
                </option>
              ))}
            </select>
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
                setCnic(e.target.value);
                clearField("cnic");
              }}
              className={inputClass}
              style={controlStyle("cnic")}
              placeholder="xxxxx-xxxxxxx-x"
              maxLength={15}
              inputMode="numeric"
            />
          </Field>
        </ApplySection>

        <ApplySection id="contact" accordion={accordion} open={sectionOpen("contact")} onToggle={() => setOpenSection("contact")}>
          <Field label="Email" error={fields.email}>
            <input
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
          <Field label="Phone" error={fields.phone}>
            <input
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
        </ApplySection>

        <ApplySection id="education" accordion={accordion} open={sectionOpen("education")} onToggle={() => setOpenSection("education")}>
          <Field label="Highest qualification" error={fields.highestQualification}>
            <select
              value={highestQualification}
              onChange={(e) => {
                setHighestQualification(e.target.value);
                clearField("highestQualification");
              }}
              className={inputClass}
              style={controlStyle("highestQualification")}
            >
              <option value="">Select</option>
              {QUALIFICATION_VALUES.map((value) => (
                <option key={value} value={value}>
                  {QUALIFICATION_LABELS[value]}
                </option>
              ))}
            </select>
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
        </ApplySection>

        <ApplySection id="experience" accordion={accordion} open={sectionOpen("experience")} onToggle={() => setOpenSection("experience")}>
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
        </ApplySection>

        <ApplySection id="skills" accordion={accordion} open={sectionOpen("skills")} onToggle={() => setOpenSection("skills")}>
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
        </ApplySection>

        <ApplySection id="documents" accordion={accordion} open={sectionOpen("documents")} onToggle={() => setOpenSection("documents")}>
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
              emptyLabel="Drop a resume here"
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
              emptyLabel="Drop a photo here"
            />
          </div>
        </ApplySection>

        <ApplySection id="declaration" accordion={accordion} open={sectionOpen("declaration")} onToggle={() => setOpenSection("declaration")}>
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
        </ApplySection>
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
        <p className="mt-6 text-[12px] leading-7 text-muted-foreground">
          Name, email, phone, date of birth, gender, nationality, address, city, qualification, experience, key
          skills, notice period, expected salary, available-from, resume, photo, and declaration are required. CNIC is
          required for Pakistani applicants.
        </p>
      ) : null}

      <div className="mt-8">
        <Button type="submit" variant="primary" disabled={state.status === "submitting"}>
          {state.status === "submitting" ? "Sending…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
