"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createApplication,
  setMyPendingApplicationId,
} from "@/lib/rishta-circle/storage";
import {
  RELIGIONS,
  type Gender,
  type SubmittedBy,
} from "@/lib/rishta-circle/types";
import { Monogram } from "./Monogram";

// Multi-step application form. Shapes of the form state intentionally mirror
// the Application row in lib/rishta-circle/types so the final create call is a
// simple spread.

interface FormState {
  submittedBy: SubmittedBy;
  submitterName: string;
  submitterRelationship: string;
  submitterContact: string;
  fullName: string;
  age: string;
  gender: Gender;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  hometown: string;
  religion: string;
  religionOther: string;
  profilePhoto: string | null;
  education: string;
  profession: string;
  bio: string;
  lookingFor: string;
  familyValues: string;
  contactEmail: string;
  contactPhone: string;
  consent: boolean;
}

const INITIAL: FormState = {
  submittedBy: "self",
  submitterName: "",
  submitterRelationship: "",
  submitterContact: "",
  fullName: "",
  age: "",
  gender: "female",
  locationCity: "",
  locationState: "",
  locationCountry: "",
  hometown: "",
  religion: "Hindu",
  religionOther: "",
  profilePhoto: null,
  education: "",
  profession: "",
  bio: "",
  lookingFor: "",
  familyValues: "",
  contactEmail: "",
  contactPhone: "",
  consent: false,
};

const STEP_LABELS = [
  "Who is this for",
  "Basic information",
  "About",
  "Review & submit",
];

export function ApplicationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canAdvance = useMemo(() => {
    if (step === 0) {
      if (form.submittedBy === "self") return true;
      return (
        form.submitterName.trim() &&
        form.submitterRelationship.trim() &&
        form.submitterContact.trim()
      );
    }
    if (step === 1) {
      return (
        form.fullName.trim() &&
        Number(form.age) >= 18 &&
        form.locationCity.trim() &&
        form.locationCountry.trim() &&
        form.hometown.trim()
      );
    }
    if (step === 2) {
      return (
        form.education.trim() &&
        form.profession.trim() &&
        form.bio.trim() &&
        form.lookingFor.trim()
      );
    }
    return form.consent;
  }, [step, form]);

  const onSubmit = () => {
    if (!form.consent) return;
    const app = createApplication({
      submittedBy: form.submittedBy,
      submitterName:
        form.submittedBy === "family" ? form.submitterName : undefined,
      submitterRelationship:
        form.submittedBy === "family" ? form.submitterRelationship : undefined,
      submitterContact:
        form.submittedBy === "family" ? form.submitterContact : undefined,
      fullName: form.fullName.trim(),
      age: Number(form.age) || 0,
      gender: form.gender,
      locationCity: form.locationCity.trim(),
      locationState: form.locationState.trim(),
      locationCountry: form.locationCountry.trim(),
      hometown: form.hometown.trim(),
      religion: form.religion,
      religionOther:
        form.religion === "Other" ? form.religionOther.trim() : undefined,
      profilePhoto: form.profilePhoto,
      education: form.education.trim(),
      profession: form.profession.trim(),
      bio: form.bio.trim(),
      lookingFor: form.lookingFor.trim(),
      familyValues: form.familyValues.trim(),
      contactEmail: form.contactEmail.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
    });
    setMyPendingApplicationId(app.id);
    setSubmitted(true);
    window.setTimeout(() => {
      router.push("/community?tab=connect&sub=rishta-circle");
    }, 3000);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl rounded-2xl border border-ink/8 bg-white px-8 py-16 text-center shadow-sm"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-pale">
          <Check size={22} className="text-gold" strokeWidth={2} />
        </div>
        <h2 className="mt-6 font-serif text-[28px] font-semibold text-ink">
          Thank you for applying.
        </h2>
        <p className="mx-auto mt-3 max-w-sm font-serif text-[15px] italic text-ink-muted">
          We'll review your application and get back to you soon.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator step={step} />

      <div className="mt-8 rounded-2xl border border-ink/8 bg-white px-8 py-10 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && <Step0 form={form} set={set} />}
            {step === 1 && <Step1 form={form} set={set} />}
            {step === 2 && <Step2 form={form} set={set} />}
            {step === 3 && <Step3 form={form} set={set} goTo={setStep} />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between border-t border-ink/8 pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={cn(
              "inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink",
              step === 0 && "invisible",
            )}
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              disabled={!canAdvance}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-[13px] font-medium transition-colors",
                canAdvance
                  ? "bg-ink text-white hover:bg-ink-soft"
                  : "cursor-not-allowed bg-ink/20 text-white/70",
              )}
            >
              Continue
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canAdvance}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-[13px] font-medium transition-colors",
                canAdvance
                  ? "bg-gold text-white hover:bg-gold-light"
                  : "cursor-not-allowed bg-gold/40 text-white",
              )}
            >
              Submit application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const progress = ((step + 1) / STEP_LABELS.length) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
          Step {step + 1} of {STEP_LABELS.length}
        </p>
        <p className="font-serif text-[14px] italic text-ink-muted">
          {STEP_LABELS[step]}
        </p>
      </div>
      <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-ink/8">
        <motion.div
          className="h-full bg-gold"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

// ── Steps ───────────────────────────────────────────────────────────────────

function Step0({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="Who is this for"
        title="Creating a profile"
        description="Let us know whether you're submitting for yourself or on behalf of a family member."
      />
      <div className="mt-8 grid gap-3">
        <RadioCard
          label="I'm creating my own profile"
          description="You're the person looking for a partner."
          active={form.submittedBy === "self"}
          onClick={() => set("submittedBy", "self")}
        />
        <RadioCard
          label="I'm submitting on behalf of my son / daughter"
          description="Families are welcome here — we'll collect a bit more context."
          active={form.submittedBy === "family"}
          onClick={() => set("submittedBy", "family")}
        />
      </div>

      {form.submittedBy === "family" && (
        <div className="mt-8 grid gap-4 rounded-xl border border-gold/20 bg-gold-pale/30 p-5">
          <Field label="Your name">
            <TextInput
              value={form.submitterName}
              onChange={(v) => set("submitterName", v)}
              placeholder="e.g. Kavita Singh"
            />
          </Field>
          <Field label="Relationship">
            <TextInput
              value={form.submitterRelationship}
              onChange={(v) => set("submitterRelationship", v)}
              placeholder="e.g. Mother, Father, Aunt"
            />
          </Field>
          <Field label="Your contact (email or phone)">
            <TextInput
              value={form.submitterContact}
              onChange={(v) => set("submitterContact", v)}
              placeholder="email@example.com or +1 555 000 0000"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function Step1({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("profilePhoto", String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Basic information"
        title="Tell us who"
        description="The essentials for the profile. All fields are visible to other approved members."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Field label="Full name" full>
          <TextInput
            value={form.fullName}
            onChange={(v) => set("fullName", v)}
            placeholder="e.g. Ananya Mehta"
          />
        </Field>
        <Field label="Age">
          <TextInput
            type="number"
            value={form.age}
            onChange={(v) => set("age", v)}
            placeholder="e.g. 28"
          />
        </Field>
        <Field label="Gender">
          <select
            value={form.gender}
            onChange={(e) => set("gender", e.target.value as Gender)}
            className="w-full rounded-full border border-ink/10 bg-white px-4 py-2.5 text-[14px] text-ink focus:border-gold focus:outline-none"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
          </select>
        </Field>
        <Field label="City">
          <TextInput
            value={form.locationCity}
            onChange={(v) => set("locationCity", v)}
            placeholder="e.g. New York"
          />
        </Field>
        <Field label="State / Province">
          <TextInput
            value={form.locationState}
            onChange={(v) => set("locationState", v)}
            placeholder="Optional"
          />
        </Field>
        <Field label="Country">
          <TextInput
            value={form.locationCountry}
            onChange={(v) => set("locationCountry", v)}
            placeholder="e.g. USA"
          />
        </Field>
        <Field label="Originally from (hometown)">
          <TextInput
            value={form.hometown}
            onChange={(v) => set("hometown", v)}
            placeholder="e.g. Mumbai, India"
          />
        </Field>
        <Field label="Religion / Tradition">
          <select
            value={form.religion}
            onChange={(e) => set("religion", e.target.value)}
            className="w-full rounded-full border border-ink/10 bg-white px-4 py-2.5 text-[14px] text-ink focus:border-gold focus:outline-none"
          >
            {RELIGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        {form.religion === "Other" && (
          <Field label="Please specify" full>
            <TextInput
              value={form.religionOther}
              onChange={(v) => set("religionOther", v)}
              placeholder="Your tradition"
            />
          </Field>
        )}
        <Field label="Contact email (optional)">
          <TextInput
            type="email"
            value={form.contactEmail}
            onChange={(v) => set("contactEmail", v)}
            placeholder="Shared only after a mutual match"
          />
        </Field>
        <Field label="Contact phone (optional)">
          <TextInput
            value={form.contactPhone}
            onChange={(v) => set("contactPhone", v)}
            placeholder="Shared only after a mutual match"
          />
        </Field>

        <div className="md:col-span-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            Profile photo
          </p>
          <div className="mt-2 flex items-center gap-4">
            {form.profilePhoto ? (
              <img
                src={form.profilePhoto}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <Monogram name={form.fullName || "?"} size={80} />
            )}
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-4 py-2 text-[12.5px] font-medium text-ink transition-colors hover:border-gold"
              >
                <ImagePlus size={13} strokeWidth={2} />
                {form.profilePhoto ? "Replace photo" : "Upload photo"}
              </button>
              <p className="mt-1.5 text-[11px] text-ink-faint">
                Stored locally for now — will move to Supabase Storage later.
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="About"
        title="The person, in their own words"
        description="These are the sections approved members will read most carefully. Keep it warm, specific, and honest."
      />

      <div className="mt-8 grid gap-5">
        <Field label="Education">
          <TextInput
            value={form.education}
            onChange={(v) => set("education", v)}
            placeholder="Degree, institution"
          />
        </Field>
        <Field label="Profession / Current role">
          <TextInput
            value={form.profession}
            onChange={(v) => set("profession", v)}
            placeholder="e.g. Product Manager at a fintech startup"
          />
        </Field>
        <Field
          label="Bio / personal statement"
          hint="Tell us a bit about yourself (or your son/daughter) — personality, interests, what makes them unique."
          counter={`${form.bio.length}/500`}
        >
          <TextArea
            value={form.bio}
            onChange={(v) => set("bio", v.slice(0, 500))}
            rows={5}
          />
        </Field>
        <Field
          label="What are you looking for?"
          hint="Describe the kind of partner or qualities you value."
          counter={`${form.lookingFor.length}/300`}
        >
          <TextArea
            value={form.lookingFor}
            onChange={(v) => set("lookingFor", v.slice(0, 300))}
            rows={3}
          />
        </Field>
        <Field
          label="Family values (optional)"
          hint="Anything else you'd like to share."
          counter={`${form.familyValues.length}/300`}
        >
          <TextArea
            value={form.familyValues}
            onChange={(v) => set("familyValues", v.slice(0, 300))}
            rows={3}
          />
        </Field>
      </div>
    </div>
  );
}

function Step3({
  form,
  set,
  goTo,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  goTo: (step: number) => void;
}) {
  const religionLabel =
    form.religion === "Other" && form.religionOther
      ? form.religionOther
      : form.religion;
  const location = [form.locationCity, form.locationState, form.locationCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <SectionHeader
        eyebrow="Review & submit"
        title="A final look"
        description="Please review every section. You can jump back to edit any step."
      />

      <div className="mt-8 space-y-5">
        <ReviewBlock title="Who is submitting" onEdit={() => goTo(0)}>
          {form.submittedBy === "self" ? (
            <p>Creating their own profile.</p>
          ) : (
            <div className="space-y-1">
              <p>
                <strong>{form.submitterName}</strong> ({form.submitterRelationship}){" "}
                — {form.submitterContact}
              </p>
            </div>
          )}
        </ReviewBlock>

        <ReviewBlock title="Basic information" onEdit={() => goTo(1)}>
          <div className="grid gap-1">
            <p>
              <strong>{form.fullName}</strong>, {form.age}, {form.gender}
            </p>
            <p>{location}</p>
            <p className="text-ink-muted">Originally from {form.hometown}</p>
            <p className="text-ink-muted">Tradition: {religionLabel}</p>
          </div>
        </ReviewBlock>

        <ReviewBlock title="About" onEdit={() => goTo(2)}>
          <div className="space-y-3">
            <p>
              <span className="font-medium">Education:</span> {form.education}
            </p>
            <p>
              <span className="font-medium">Profession:</span> {form.profession}
            </p>
            <p className="font-serif italic text-ink-muted">{form.bio}</p>
            {form.lookingFor && (
              <p>
                <span className="font-medium">Looking for:</span>{" "}
                {form.lookingFor}
              </p>
            )}
            {form.familyValues && (
              <p>
                <span className="font-medium">Family values:</span>{" "}
                {form.familyValues}
              </p>
            )}
          </div>
        </ReviewBlock>

        <label className="flex items-start gap-3 rounded-xl border border-gold/25 bg-gold-pale/30 p-4">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-1 h-4 w-4 accent-gold"
          />
          <span className="text-[13px] leading-relaxed text-ink-soft">
            I confirm this information is accurate and I have consent to submit
            this profile.
          </span>
        </label>
      </div>
    </div>
  );
}

// ── Reusable form primitives ────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-[26px] font-semibold leading-tight text-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-ink-muted">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
  counter,
  full,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  counter?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          {label}
        </p>
        {counter && (
          <p className="text-[11px] text-ink-faint">{counter}</p>
        )}
      </div>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-[12px] text-ink-muted">{hint}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-full border border-ink/10 bg-white px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full resize-none rounded-2xl border border-ink/10 bg-white px-4 py-3 text-[14px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
    />
  );
}

function RadioCard({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-5 py-4 text-left transition-colors",
        active
          ? "border-gold bg-gold-pale/40"
          : "border-ink/10 bg-white hover:border-ink/20",
      )}
    >
      <p className="font-serif text-[16px] font-semibold text-ink">{label}</p>
      <p className="mt-1 text-[13px] text-ink-muted">{description}</p>
    </button>
  );
}

function ReviewBlock({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white px-6 py-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
          {title}
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="text-[12px] font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="mt-3 text-[13.5px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}
