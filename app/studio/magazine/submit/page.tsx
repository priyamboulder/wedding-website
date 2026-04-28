"use client";

// ── /studio/magazine/submit ─────────────────────────────────────────────────
// Editorial submission form for the You & Partner digital magazine. Five-step
// wizard: basics → story → visuals → team → review. Warm, invitation-toned
// copy; terracotta accent system layered over the platform's ivory.
//
// All state is local (useState). Photo "uploads" are mocked with placeholder
// thumbnails; no file handling, no network, no persistence.

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import NextLink from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";

// ── Palette (spec) ──────────────────────────────────────────────────────────
// Warm white background, terracotta accent, warm grays — distinct from the
// broader app so the submission surface reads as an editorial cover sheet.
const C = {
  bg: "#FEFCFA",
  terracotta: "#C45D3E",
  terracottaSoft: "#E8C7B8",
  terracottaPale: "#F6E9E2",
  ink: "#1A1A1A",
  inkSoft: "#3A3A3A",
  muted: "#6B6B6B",
  faint: "#A3A3A3",
  border: "#D4CFC9",
  borderSoft: "#E6E1DA",
};

const SERIF = "'Playfair Display', 'Cormorant Garamond', Georgia, serif";

// ── Types ───────────────────────────────────────────────────────────────────

type Tradition =
  | "Hindu"
  | "Muslim"
  | "Sikh"
  | "Christian"
  | "Jewish"
  | "Interfaith"
  | "Non-religious"
  | "Other";

const TRADITIONS: Tradition[] = [
  "Hindu",
  "Muslim",
  "Sikh",
  "Christian",
  "Jewish",
  "Interfaith",
  "Non-religious",
  "Other",
];

const GUEST_OPTIONS = [
  "Under 50",
  "50–150",
  "150–300",
  "300–500",
  "500+",
] as const;

const EVENT_OPTIONS = ["1 day", "2 days", "3 days", "4+ days"] as const;

const PHOTO_CATEGORIES = [
  "Getting ready / prep",
  "Ceremony",
  "Couple portraits",
  "Detail shots (décor, flowers, invitations, food)",
  "Family & group photos",
  "Reception / party",
  "Mehendi / Sangeet / pre-wedding events",
] as const;

const VENDOR_CATEGORIES = [
  "Venue",
  "Planner",
  "Photographer",
  "Videographer",
  "Florist",
  "Caterer",
  "DJ/Band",
  "Makeup Artist",
  "Mehendi Artist",
  "Invitations/Stationery",
  "Décor",
  "Officiant",
  "Other",
] as const;

type VendorRow = {
  id: string;
  category: string;
  name: string;
  link: string;
};

type MockPhoto = {
  id: string;
  label: string;
  gradient: string;
};

type FormState = {
  // Step 1
  yourName: string;
  partnerName: string;
  weddingDate: string;
  city: string;
  venue: string;
  region: string;
  guestCount: string;
  eventDays: string;
  traditions: Tradition[];
  traditionOther: string;
  // Step 2
  howMet: string;
  vision: string;
  memorableMoment: string;
  meaningfulRituals: string;
  advice: string;
  pullQuote: string;
  // Step 3
  photographerName: string;
  photographerEmail: string;
  photos: MockPhoto[];
  photoCategories: string[];
  // Step 4
  vendors: VendorRow[];
  // Step 5
  consent: boolean;
};

const INITIAL_STATE: FormState = {
  yourName: "",
  partnerName: "",
  weddingDate: "",
  city: "",
  venue: "",
  region: "",
  guestCount: "",
  eventDays: "",
  traditions: [],
  traditionOther: "",
  howMet: "",
  vision: "",
  memorableMoment: "",
  meaningfulRituals: "",
  advice: "",
  pullQuote: "",
  photographerName: "",
  photographerEmail: "",
  photos: [],
  photoCategories: [],
  vendors: [
    { id: "v-0", category: "", name: "", link: "" },
    { id: "v-1", category: "", name: "", link: "" },
    { id: "v-2", category: "", name: "", link: "" },
    { id: "v-3", category: "", name: "", link: "" },
  ],
  consent: false,
};

// Filled example vendor row rendered as static reference inside Step 4.
const EXAMPLE_VENDOR = {
  category: "Photographer",
  name: "Stories by Joseph Radhik",
  link: "@josephradhik",
};

// Mock thumbnail gradients — stand in for "uploaded" files on Step 3.
const MOCK_PHOTO_SEED: MockPhoto[] = [
  { id: "p1", label: "ceremony-01.jpg", gradient: "from-[#F3D9C7] via-[#E8B496] to-[#C48A6A]" },
  { id: "p2", label: "couple-portraits-04.jpg", gradient: "from-[#E9C8B5] via-[#D8A080] to-[#B56A4A]" },
  { id: "p3", label: "mehendi-detail-02.jpg", gradient: "from-[#EEDCB0] via-[#D6B77A] to-[#9C7A3E]" },
  { id: "p4", label: "reception-wide-07.jpg", gradient: "from-[#E4DCC8] via-[#C7BFA7] to-[#8AA38C]" },
];

// ── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  { key: "basics", label: "the basics" },
  { key: "story", label: "your story" },
  { key: "visuals", label: "the visuals" },
  { key: "team", label: "the team" },
  { key: "review", label: "review & submit" },
] as const;

type StepKey = typeof STEPS[number]["key"];

// ── Page ────────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [fading, setFading] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as string];
        return next;
      });
    }
  };

  const gotoStep = (idx: number) => {
    if (idx === stepIdx) return;
    setFading(true);
    window.setTimeout(() => {
      setStepIdx(idx);
      setFading(false);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 160);
  };

  const validate = (key: StepKey): Record<string, string> => {
    const e: Record<string, string> = {};
    if (key === "basics") {
      if (!form.yourName.trim()) e.yourName = "Please share your name.";
      if (!form.partnerName.trim()) e.partnerName = "Add your partner's name.";
      if (!form.weddingDate) e.weddingDate = "Pick a date.";
      if (!form.city.trim()) e.city = "Add a city.";
      if (!form.venue.trim()) e.venue = "Add the venue name.";
      if (!form.region.trim()) e.region = "Add state or country.";
      if (!form.guestCount) e.guestCount = "Choose a range.";
      if (!form.eventDays) e.eventDays = "Choose a length.";
      if (form.traditions.length === 0) e.traditions = "Pick at least one.";
    }
    if (key === "story") {
      if (!form.howMet.trim()) e.howMet = "Tell us the beginning.";
      if (!form.vision.trim()) e.vision = "A sentence or two is plenty.";
      if (!form.memorableMoment.trim()) e.memorableMoment = "One moment, in your words.";
    }
    if (key === "visuals") {
      if (!form.photographerName.trim()) e.photographerName = "Credit your photographer.";
      if (!form.photographerEmail.trim()) e.photographerEmail = "An email lets us reach them.";
      if (form.photos.length === 0) e.photos = "Add at least a few photos.";
    }
    if (key === "team") {
      const filled = form.vendors.filter((v) => v.name.trim() && v.category);
      if (filled.length === 0) e.vendors = "Tag at least one vendor.";
    }
    if (key === "review") {
      if (!form.consent) e.consent = "Please confirm to submit.";
    }
    return e;
  };

  const handleContinue = () => {
    const key = STEPS[stepIdx].key;
    const e = validate(key);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    if (stepIdx < STEPS.length - 1) gotoStep(stepIdx + 1);
  };

  const handleBack = () => {
    setErrors({});
    if (stepIdx > 0) gotoStep(stepIdx - 1);
  };

  const handleSubmit = () => {
    const e = validate("review");
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSubmitted(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <TopNav />

      <main className="pb-24 pt-10 md:pt-14">
        <div className="mx-auto w-full max-w-[720px] px-5 md:px-8">
          <PageHeader currentStep={stepIdx} submitted={submitted} onJump={gotoStep} />

          <div
            className={[
              "mt-12 transition-all duration-200",
              fading ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100",
            ].join(" ")}
          >
            {submitted ? (
              <ConfirmationCard name={form.yourName} />
            ) : (
              <>
                {STEPS[stepIdx].key === "basics" && (
                  <StepBasics form={form} errors={errors} update={update} />
                )}
                {STEPS[stepIdx].key === "story" && (
                  <StepStory form={form} errors={errors} update={update} />
                )}
                {STEPS[stepIdx].key === "visuals" && (
                  <StepVisuals form={form} errors={errors} update={update} />
                )}
                {STEPS[stepIdx].key === "team" && (
                  <StepTeam form={form} errors={errors} update={update} />
                )}
                {STEPS[stepIdx].key === "review" && (
                  <StepReview
                    form={form}
                    errors={errors}
                    update={update}
                    onJump={gotoStep}
                  />
                )}

                <StepNav
                  stepIdx={stepIdx}
                  total={STEPS.length}
                  onBack={handleBack}
                  onContinue={handleContinue}
                  onSubmit={handleSubmit}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Header + Progress ───────────────────────────────────────────────────────

function PageHeader({
  currentStep,
  submitted,
  onJump,
}: {
  currentStep: number;
  submitted: boolean;
  onJump: (idx: number) => void;
}) {
  return (
    <header>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: C.terracotta }}
      >
        The Magazine
      </p>
      <h1
        className="mt-3 text-[34px] font-semibold leading-[1.04] tracking-[-0.01em] md:text-[40px]"
        style={{ fontFamily: SERIF, color: C.ink }}
      >
        share your story.
      </h1>
      <p
        className="mt-4 max-w-[580px] text-[15px] italic leading-[1.55]"
        style={{ fontFamily: SERIF, color: C.muted }}
      >
        every wedding has a moment that made everyone hold their breath. we want
        to hear about yours.
      </p>

      {!submitted && (
        <div className="mt-10">
          <StepTracker currentStep={currentStep} onJump={onJump} />
        </div>
      )}
    </header>
  );
}

function StepTracker({
  currentStep,
  onJump,
}: {
  currentStep: number;
  onJump: (idx: number) => void;
}) {
  return (
    <div>
      {/* Progress bar */}
      <div
        className="relative h-[2px] w-full"
        style={{ backgroundColor: C.borderSoft }}
      >
        <div
          className="absolute left-0 top-0 h-full transition-all duration-500"
          style={{
            width: `${((currentStep + 1) / STEPS.length) * 100}%`,
            backgroundColor: C.terracotta,
          }}
        />
      </div>

      {/* Step labels */}
      <ol className="mt-4 flex items-start justify-between gap-2">
        {STEPS.map((s, i) => {
          const active = i === currentStep;
          const done = i < currentStep;
          const clickable = i <= currentStep;
          return (
            <li key={s.key} className="flex flex-1 flex-col items-start">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onJump(i)}
                className="group flex items-center gap-2 text-left disabled:cursor-default"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors"
                  style={{
                    borderColor: active || done ? C.terracotta : C.border,
                    backgroundColor: active
                      ? C.terracotta
                      : done
                        ? C.terracottaPale
                        : "transparent",
                    color: active ? "#FFFFFF" : done ? C.terracotta : C.faint,
                  }}
                >
                  {done ? <Check size={12} strokeWidth={2.5} /> : i + 1}
                </span>
                <span
                  className="hidden text-[10.5px] font-medium uppercase tracking-[0.18em] sm:inline"
                  style={{
                    color: active ? C.terracotta : done ? C.inkSoft : C.faint,
                  }}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Shared form primitives ──────────────────────────────────────────────────

function StepIntro({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="mb-8">
      <h2
        className="text-[24px] font-semibold leading-tight"
        style={{ fontFamily: SERIF, color: C.ink }}
      >
        {title}
      </h2>
      <p
        className="mt-2 text-[15px] leading-[1.6]"
        style={{ fontFamily: SERIF, color: C.muted }}
      >
        {copy}
      </p>
    </div>
  );
}

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label
      className="mb-2 block text-[10.5px] font-semibold uppercase tracking-[0.18em]"
      style={{ color: C.ink }}
    >
      {children}
      {required && <span className="ml-1" style={{ color: C.terracotta }}>*</span>}
    </label>
  );
}

function Help({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-1.5 text-[12.5px] italic leading-[1.5]"
      style={{ fontFamily: SERIF, color: C.faint }}
    >
      {children}
    </p>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-1.5 text-[12.5px] italic"
      style={{ fontFamily: SERIF, color: C.terracotta }}
    >
      {children}
    </p>
  );
}

function Field({
  label,
  required,
  error,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  help?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {help && !error && <Help>{help}</Help>}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

const INPUT_BASE =
  "w-full rounded-sm border bg-white px-3.5 py-3 text-[15px] text-[#1A1A1A] outline-none transition-colors placeholder:text-[#A3A3A3] focus:border-[#C45D3E]";

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  invalid?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT_BASE}
      style={{ borderColor: invalid ? C.terracotta : C.border }}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  invalid?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${INPUT_BASE} resize-none leading-[1.55]`}
      style={{
        borderColor: invalid ? C.terracotta : C.border,
        fontFamily: SERIF,
      }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} appearance-none pr-10`}
        style={{ borderColor: invalid ? C.terracotta : C.border }}
      >
        <option value="">{placeholder ?? "Select…"}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px]"
        style={{ color: C.muted }}
      >
        ▾
      </span>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5">
      <span
        className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors"
        style={{
          borderColor: checked ? C.terracotta : C.border,
          backgroundColor: checked ? C.terracotta : "#FFFFFF",
        }}
      >
        {checked && <Check size={12} strokeWidth={3} color="#FFFFFF" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className="text-[14.5px] leading-[1.5]"
        style={{ fontFamily: SERIF, color: C.inkSoft }}
      >
        {label}
      </span>
    </label>
  );
}

// ── Step 1: the basics ──────────────────────────────────────────────────────

type StepProps = {
  form: FormState;
  errors: Record<string, string>;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

function StepBasics({ form, errors, update }: StepProps) {
  const toggleTradition = (t: Tradition) => {
    const next = form.traditions.includes(t)
      ? form.traditions.filter((x) => x !== t)
      : [...form.traditions, t];
    update("traditions", next);
  };

  return (
    <section>
      <StepIntro
        title="the basics"
        copy="Let's start with the essentials — who, where, and when."
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Your name" required error={errors.yourName}>
            <TextInput
              value={form.yourName}
              onChange={(v) => update("yourName", v)}
              placeholder="Sneha"
              invalid={!!errors.yourName}
            />
          </Field>
          <Field label="Partner's name" required error={errors.partnerName}>
            <TextInput
              value={form.partnerName}
              onChange={(v) => update("partnerName", v)}
              placeholder="Arjun"
              invalid={!!errors.partnerName}
            />
          </Field>
        </div>

        <Field label="Wedding date" required error={errors.weddingDate}>
          <TextInput
            type="date"
            value={form.weddingDate}
            onChange={(v) => update("weddingDate", v)}
            invalid={!!errors.weddingDate}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="City" required error={errors.city}>
            <TextInput
              value={form.city}
              onChange={(v) => update("city", v)}
              placeholder="Udaipur"
              invalid={!!errors.city}
            />
          </Field>
          <Field label="Venue name" required error={errors.venue}>
            <TextInput
              value={form.venue}
              onChange={(v) => update("venue", v)}
              placeholder="Taj Lake Palace"
              invalid={!!errors.venue}
            />
          </Field>
        </div>

        <Field label="State / Country" required error={errors.region}>
          <TextInput
            value={form.region}
            onChange={(v) => update("region", v)}
            placeholder="Rajasthan, India"
            invalid={!!errors.region}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Number of guests" required error={errors.guestCount}>
            <Select
              value={form.guestCount}
              onChange={(v) => update("guestCount", v)}
              options={GUEST_OPTIONS}
              placeholder="Choose a range"
              invalid={!!errors.guestCount}
            />
          </Field>
          <Field label="How many events / days?" required error={errors.eventDays}>
            <Select
              value={form.eventDays}
              onChange={(v) => update("eventDays", v)}
              options={EVENT_OPTIONS}
              placeholder="Choose a length"
              invalid={!!errors.eventDays}
            />
          </Field>
        </div>

        <div>
          <Label required>Cultural traditions represented</Label>
          <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            {TRADITIONS.map((t) => (
              <Checkbox
                key={t}
                checked={form.traditions.includes(t)}
                onChange={() => toggleTradition(t)}
                label={t}
              />
            ))}
          </div>
          {form.traditions.includes("Other") && (
            <div className="mt-3">
              <TextInput
                value={form.traditionOther}
                onChange={(v) => update("traditionOther", v)}
                placeholder="Tell us more…"
              />
            </div>
          )}
          {errors.traditions && <ErrorText>{errors.traditions}</ErrorText>}
        </div>
      </div>
    </section>
  );
}

// ── Step 2: your story ──────────────────────────────────────────────────────

function StepStory({ form, errors, update }: StepProps) {
  return (
    <section>
      <StepIntro
        title="your story"
        copy="This is the heart of it. Tell us about your wedding — in whatever way feels right."
      />

      <div className="space-y-6">
        <Field label="How did you two meet?" required error={errors.howMet}>
          <TextArea
            value={form.howMet}
            onChange={(v) => update("howMet", v)}
            placeholder="The version you'd tell at dinner, not the one you put on Instagram."
            rows={4}
            invalid={!!errors.howMet}
          />
        </Field>

        <Field
          label="Describe the vision for your wedding in a sentence or two."
          required
          error={errors.vision}
        >
          <TextArea
            value={form.vision}
            onChange={(v) => update("vision", v)}
            placeholder="Candlelit, barefoot, a little chaotic — the opposite of formal."
            rows={3}
            invalid={!!errors.vision}
          />
        </Field>

        <Field
          label="What was the most memorable moment?"
          required
          error={errors.memorableMoment}
        >
          <TextArea
            value={form.memorableMoment}
            onChange={(v) => update("memorableMoment", v)}
            placeholder="The one you keep replaying."
            rows={4}
            invalid={!!errors.memorableMoment}
          />
        </Field>

        <Field label="Any cultural traditions or rituals that were especially meaningful?">
          <TextArea
            value={form.meaningfulRituals}
            onChange={(v) => update("meaningfulRituals", v)}
            placeholder="What surprised you, or what you adapted to make your own."
            rows={3}
          />
        </Field>

        <Field label="Is there anything you'd want other brides to know — a tip, a lesson, a vendor you couldn't have done it without?">
          <TextArea
            value={form.advice}
            onChange={(v) => update("advice", v)}
            placeholder="The wisdom you wish someone had handed you a year ago."
            rows={3}
          />
        </Field>

        <Field
          label="A quote from you or your partner about the day:"
          help="This may be used as a pull quote in your feature."
        >
          <TextArea
            value={form.pullQuote}
            onChange={(v) => update("pullQuote", v)}
            placeholder="“Something true, in your own voice.”"
            rows={3}
          />
        </Field>
      </div>
    </section>
  );
}

// ── Step 3: the visuals ─────────────────────────────────────────────────────

function StepVisuals({ form, errors, update }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Simulated "upload": when the user clicks or drops, seed in 3–4 mock
  // thumbnails from MOCK_PHOTO_SEED. If they already have some, append more.
  const simulateUpload = () => {
    const existing = form.photos.length;
    const toAdd = MOCK_PHOTO_SEED.slice(0, Math.max(1, 4 - (existing % 4)));
    const next = [
      ...form.photos,
      ...toAdd.map((p, i) => ({ ...p, id: `${p.id}-${existing + i}-${Date.now()}` })),
    ];
    update("photos", next);
  };

  const removePhoto = (id: string) => {
    update(
      "photos",
      form.photos.filter((p) => p.id !== id),
    );
  };

  const onFakeInput = (_e: ChangeEvent<HTMLInputElement>) => {
    simulateUpload();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePhotoCategory = (c: string) => {
    const next = form.photoCategories.includes(c)
      ? form.photoCategories.filter((x) => x !== c)
      : [...form.photoCategories, c];
    update("photoCategories", next);
  };

  return (
    <section>
      <StepIntro
        title="the visuals"
        copy="Great photography is what brings a feature to life. Share your best shots — we recommend 30–50 images."
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Photographer name & studio"
            required
            error={errors.photographerName}
          >
            <TextInput
              value={form.photographerName}
              onChange={(v) => update("photographerName", v)}
              placeholder="Joseph Radhik — Stories"
              invalid={!!errors.photographerName}
            />
          </Field>
          <Field
            label="Photographer email"
            required
            error={errors.photographerEmail}
            help="We'll reach out to coordinate high-res files if selected."
          >
            <TextInput
              type="email"
              value={form.photographerEmail}
              onChange={(v) => update("photographerEmail", v)}
              placeholder="studio@example.com"
              invalid={!!errors.photographerEmail}
            />
          </Field>
        </div>

        <div>
          <Label required>Upload photos</Label>
          <button
            type="button"
            onClick={() => {
              simulateUpload();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              simulateUpload();
            }}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-sm border border-dashed px-6 py-12 text-center transition-colors"
            style={{
              borderColor: dragOver ? C.terracotta : C.border,
              backgroundColor: dragOver ? C.terracottaPale : "#FFFFFF",
            }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: C.terracottaPale, color: C.terracotta }}
            >
              <Upload size={18} strokeWidth={1.8} />
            </span>
            <span
              className="text-[15px] font-medium"
              style={{ fontFamily: SERIF, color: C.ink }}
            >
              Drag photos here, or click to browse
            </span>
            <span
              className="text-[12.5px]"
              style={{ fontFamily: SERIF, color: C.muted }}
            >
              JPG or PNG · 30–50 images recommended · 10MB max per file
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={onFakeInput}
              className="hidden"
            />
          </button>
          {errors.photos && <ErrorText>{errors.photos}</ErrorText>}

          {form.photos.length > 0 && (
            <div className="mt-4">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: C.muted }}
              >
                {form.photos.length} {form.photos.length === 1 ? "photo" : "photos"} attached
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {form.photos.map((p) => (
                  <div
                    key={p.id}
                    className="group relative aspect-square overflow-hidden rounded-sm border"
                    style={{ borderColor: C.borderSoft }}
                  >
                    <div
                      className={`h-full w-full bg-gradient-to-br ${p.gradient}`}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/55 to-transparent px-2 py-1.5"
                    >
                      <ImageIcon size={11} color="#FFFFFF" strokeWidth={2} />
                      <span className="truncate text-[10.5px] font-medium text-white">
                        {p.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(p.id)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                      aria-label={`Remove ${p.label}`}
                    >
                      <X size={12} color={C.ink} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Label>Photo categories to include</Label>
          <div className="grid grid-cols-1 gap-x-6 gap-y-1">
            {PHOTO_CATEGORIES.map((c) => (
              <Checkbox
                key={c}
                checked={form.photoCategories.includes(c)}
                onChange={() => togglePhotoCategory(c)}
                label={c}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Step 4: the team ────────────────────────────────────────────────────────

function StepTeam({ form, errors, update }: StepProps) {
  const updateVendor = (id: string, patch: Partial<VendorRow>) => {
    update(
      "vendors",
      form.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    );
  };

  const addVendor = () => {
    update("vendors", [
      ...form.vendors,
      { id: `v-${Date.now()}`, category: "", name: "", link: "" },
    ]);
  };

  const removeVendor = (id: string) => {
    if (form.vendors.length <= 1) return;
    update(
      "vendors",
      form.vendors.filter((v) => v.id !== id),
    );
  };

  return (
    <section>
      <StepIntro
        title="the team"
        copy="Give credit where it's due. Tag your vendors and they'll be linked in your feature."
      />

      {/* Example reference row */}
      <div
        className="mb-6 rounded-sm border px-4 py-3"
        style={{ borderColor: C.terracottaSoft, backgroundColor: C.terracottaPale }}
      >
        <p
          className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: C.terracotta }}
        >
          Example
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr_160px]">
          <span className="text-[14px]" style={{ fontFamily: SERIF, color: C.inkSoft }}>
            {EXAMPLE_VENDOR.category}
          </span>
          <span className="text-[14px]" style={{ fontFamily: SERIF, color: C.inkSoft }}>
            {EXAMPLE_VENDOR.name}
          </span>
          <span className="text-[14px]" style={{ fontFamily: SERIF, color: C.muted }}>
            {EXAMPLE_VENDOR.link}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {form.vendors.map((v, i) => (
          <div
            key={v.id}
            className="rounded-sm border bg-white p-4"
            style={{ borderColor: C.borderSoft }}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: C.muted }}
              >
                Vendor {i + 1}
              </p>
              {form.vendors.length > 1 && (
                <RemoveVendorButton onClick={() => removeVendor(v.id)} />
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
              <Select
                value={v.category}
                onChange={(val) => updateVendor(v.id, { category: val })}
                options={VENDOR_CATEGORIES}
                placeholder="Category"
              />
              <TextInput
                value={v.name}
                onChange={(val) => updateVendor(v.id, { name: val })}
                placeholder="Vendor name"
              />
            </div>
            <div className="mt-3">
              <TextInput
                value={v.link}
                onChange={(val) => updateVendor(v.id, { link: val })}
                placeholder="Website or @instagram"
              />
            </div>
          </div>
        ))}
      </div>

      {errors.vendors && (
        <div className="mt-2">
          <ErrorText>{errors.vendors}</ErrorText>
        </div>
      )}

      <button
        type="button"
        onClick={addVendor}
        className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors"
        style={{ color: C.terracotta }}
      >
        <Plus size={14} strokeWidth={2} />
        Add another vendor
      </button>
    </section>
  );
}

function RemoveVendorButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-1 text-[12px] transition-colors"
      style={{ color: hover ? C.terracotta : C.faint }}
      aria-label="Remove vendor"
    >
      <Trash2 size={13} strokeWidth={1.8} />
      Remove
    </button>
  );
}

// ── Step 5: review & submit ─────────────────────────────────────────────────

function StepReview({
  form,
  errors,
  update,
  onJump,
}: StepProps & { onJump: (idx: number) => void }) {
  const filledVendors = form.vendors.filter((v) => v.name.trim() || v.category);

  return (
    <section>
      <StepIntro
        title="review & submit"
        copy="Almost there. Take a look at everything before you submit."
      />

      <div className="space-y-5">
        <ReviewSection title="the basics" onEdit={() => onJump(0)}>
          <ReviewRow label="Couple" value={`${form.yourName || "—"} & ${form.partnerName || "—"}`} />
          <ReviewRow label="Date" value={form.weddingDate || "—"} />
          <ReviewRow
            label="Venue"
            value={`${form.venue || "—"}, ${form.city || "—"}, ${form.region || "—"}`}
          />
          <ReviewRow label="Guests" value={form.guestCount || "—"} />
          <ReviewRow label="Length" value={form.eventDays || "—"} />
          <ReviewRow
            label="Traditions"
            value={
              form.traditions.length
                ? form.traditions
                    .map((t) => (t === "Other" && form.traditionOther ? `Other (${form.traditionOther})` : t))
                    .join(", ")
                : "—"
            }
          />
        </ReviewSection>

        <ReviewSection title="your story" onEdit={() => onJump(1)}>
          <ReviewParagraph label="How we met" value={form.howMet} />
          <ReviewParagraph label="Vision" value={form.vision} />
          <ReviewParagraph label="Most memorable" value={form.memorableMoment} />
          {form.meaningfulRituals && (
            <ReviewParagraph label="Meaningful rituals" value={form.meaningfulRituals} />
          )}
          {form.advice && <ReviewParagraph label="For other brides" value={form.advice} />}
          {form.pullQuote && <ReviewParagraph label="Pull quote" value={form.pullQuote} />}
        </ReviewSection>

        <ReviewSection title="the visuals" onEdit={() => onJump(2)}>
          <ReviewRow label="Photographer" value={form.photographerName || "—"} />
          <ReviewRow label="Email" value={form.photographerEmail || "—"} />
          <ReviewRow
            label="Photos"
            value={`${form.photos.length} attached`}
          />
          {form.photoCategories.length > 0 && (
            <ReviewRow label="Categories" value={form.photoCategories.join(", ")} />
          )}
        </ReviewSection>

        <ReviewSection title="the team" onEdit={() => onJump(3)}>
          {filledVendors.length === 0 ? (
            <p className="text-[14px]" style={{ fontFamily: SERIF, color: C.muted }}>
              No vendors added yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {filledVendors.map((v) => (
                <li
                  key={v.id}
                  className="grid grid-cols-[140px_1fr] gap-3 text-[14px]"
                  style={{ fontFamily: SERIF }}
                >
                  <span style={{ color: C.muted }}>{v.category || "—"}</span>
                  <span style={{ color: C.ink }}>
                    {v.name}
                    {v.link && (
                      <span style={{ color: C.faint }}> · {v.link}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ReviewSection>
      </div>

      <div
        className="mt-8 rounded-sm border p-5"
        style={{ borderColor: C.borderSoft, backgroundColor: "#FFFFFF" }}
      >
        <Checkbox
          checked={form.consent}
          onChange={(v) => update("consent", v)}
          label={
            <>
              I confirm these photos are from my wedding and I have the right to
              share them. I understand the You & Partner editorial team will
              review my submission and may reach out for additional details.
            </>
          }
        />
        {errors.consent && <ErrorText>{errors.consent}</ErrorText>}
      </div>
    </section>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-sm border bg-white p-5"
      style={{ borderColor: C.borderSoft }}
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: C.terracotta }}
        >
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-[12px] font-medium underline-offset-4 transition-colors hover:underline"
          style={{ color: C.muted }}
        >
          Edit
        </button>
      </div>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="grid grid-cols-[110px_1fr] gap-3 text-[14px]"
      style={{ fontFamily: SERIF }}
    >
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ color: C.ink }}>{value}</span>
    </div>
  );
}

function ReviewParagraph({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[14px]" style={{ fontFamily: SERIF }}>
      <div
        className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: C.muted, fontFamily: "inherit" }}
      >
        {label}
      </div>
      <p className="mt-1 leading-[1.55]" style={{ color: C.inkSoft }}>
        {value || "—"}
      </p>
    </div>
  );
}

// ── Step navigation ─────────────────────────────────────────────────────────

function StepNav({
  stepIdx,
  total,
  onBack,
  onContinue,
  onSubmit,
}: {
  stepIdx: number;
  total: number;
  onBack: () => void;
  onContinue: () => void;
  onSubmit: () => void;
}) {
  const isLast = stepIdx === total - 1;
  return (
    <div className="mt-12 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        disabled={stepIdx === 0}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity disabled:cursor-default disabled:opacity-40"
        style={{ color: C.inkSoft }}
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Back
      </button>

      {isLast ? (
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex items-center gap-2 rounded-sm px-7 py-3.5 text-[14px] font-medium text-white transition-colors"
          style={{ backgroundColor: C.ink }}
        >
          Submit to the Magazine
          <ArrowRight size={15} strokeWidth={1.8} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-sm px-6 py-3 text-[14px] font-medium text-white transition-colors"
          style={{ backgroundColor: C.ink }}
        >
          Continue
          <ArrowRight size={15} strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

// ── Confirmation ────────────────────────────────────────────────────────────

function ConfirmationCard({ name }: { name: string }) {
  const firstName = (name || "").trim().split(/\s+/)[0] || "friend";
  return (
    <div
      className="rounded-sm border px-8 py-14 text-center md:px-12 md:py-20"
      style={{ borderColor: C.borderSoft, backgroundColor: "#FFFFFF" }}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: C.terracottaPale, color: C.terracotta }}
      >
        <Check size={22} strokeWidth={2} />
      </div>

      <h2
        className="mt-6 text-[32px] font-semibold leading-[1.05] tracking-[-0.01em] md:text-[38px]"
        style={{ fontFamily: SERIF, color: C.ink }}
      >
        thank you, {firstName.toLowerCase()}.
      </h2>

      <p
        className="mx-auto mt-5 max-w-[460px] text-[15.5px] leading-[1.6]"
        style={{ fontFamily: SERIF, color: C.muted }}
      >
        your story is in our hands now. our editorial team reviews every
        submission personally — if selected, we&apos;ll reach out within 2–3
        weeks to coordinate your feature.
      </p>

      <div
        className="mx-auto my-8 h-px w-16"
        style={{ backgroundColor: C.terracottaSoft }}
      />

      <NextLink
        href="/community?tab=editorial&sub=magazine"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-80"
        style={{ color: C.terracotta }}
      >
        In the meantime, explore other love stories in the magazine
        <ArrowUpRight size={14} strokeWidth={1.8} />
      </NextLink>
    </div>
  );
}
