"use client";

// ── Brides onboarding ───────────────────────────────────────────────────────
// Multi-step wizard that introduces a new bride to the community. Six steps:
//   1. Cover photo
//   2. The basics (name, cities, date, guest bucket)
//   3. Dream-wedding quote
//   4. Interest tags
//   5. Fun-fact prompts (optional)
//   6. Preview story card + save
//
// Each step renders a single card so the bride only looks at one question at
// a time. Nothing blocks except step 1 (requires a cover photo or a chosen
// gradient) and step 2's display name.

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StoryCard } from "./StoryCard";
import {
  GUEST_COUNT_BUCKETS,
  type GuestCountRange,
  type CommunityProfile,
} from "@/types/community";
import { INTEREST_TAGS, PROFILE_PROMPTS } from "@/lib/community/seed";
import { readFileAsDataUrl, fallbackGradientFor } from "@/lib/community/photos";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

type OnboardingForm = {
  cover_photo_data_url?: string;
  display_name: string;
  hometown: string;
  wedding_city: string;
  wedding_date: string; // yyyy-mm
  guest_count_range: GuestCountRange | "";
  partner_name: string;
  quote: string;
  looking_for: string[];
  fun_facts: Record<string, string>;
};

const EMPTY: OnboardingForm = {
  display_name: "",
  hometown: "",
  wedding_city: "",
  wedding_date: "",
  guest_count_range: "",
  partner_name: "",
  quote: "",
  looking_for: [],
  fun_facts: {},
};

export function BridesOnboarding({ onSkip }: { onSkip?: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<OnboardingForm>(EMPTY);

  const createMyProfile = useCommunityProfilesStore((s) => s.createMyProfile);

  const next = () => setStep((s) => Math.min(5, s + 1) as Step);
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

  const canAdvance = (() => {
    if (step === 0) return true; // photo is optional — fallback gradient used
    if (step === 1)
      return (
        form.display_name.trim().length > 0 &&
        form.hometown.trim().length > 0 &&
        form.wedding_city.trim().length > 0
      );
    return true;
  })();

  const save = () => {
    createMyProfile({
      display_name: form.display_name.trim(),
      cover_photo_data_url: form.cover_photo_data_url,
      hometown: form.hometown.trim() || undefined,
      wedding_city: form.wedding_city.trim() || undefined,
      wedding_date: form.wedding_date ? `${form.wedding_date}-01` : undefined,
      guest_count_range: form.guest_count_range || undefined,
      partner_name: form.partner_name.trim() || undefined,
      quote: form.quote.trim() || undefined,
      looking_for: form.looking_for,
      fun_facts: form.fun_facts,
      wedding_events: [],
      color_palette: [],
      open_to_connect: true,
    });
  };

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-2xl">
        <StepIndicator step={step} total={6} />

        <div className="mt-6 rounded-2xl border border-gold/20 bg-white p-7 shadow-sm md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {step === 0 && (
                <StepCover
                  value={form.cover_photo_data_url}
                  displayName={form.display_name}
                  onChange={(url) =>
                    setForm((p) => ({ ...p, cover_photo_data_url: url }))
                  }
                />
              )}
              {step === 1 && (
                <StepBasics form={form} setForm={setForm} />
              )}
              {step === 2 && (
                <StepQuote
                  value={form.quote}
                  onChange={(v) => setForm((p) => ({ ...p, quote: v }))}
                />
              )}
              {step === 3 && (
                <StepInterests
                  value={form.looking_for}
                  onChange={(slug) =>
                    setForm((p) => ({
                      ...p,
                      looking_for: p.looking_for.includes(slug)
                        ? p.looking_for.filter((s) => s !== slug)
                        : [...p.looking_for, slug],
                    }))
                  }
                />
              )}
              {step === 4 && (
                <StepFunFacts
                  value={form.fun_facts}
                  onChange={(next) =>
                    setForm((p) => ({ ...p, fun_facts: next }))
                  }
                />
              )}
              {step === 5 && <StepPreview form={form} />}
            </motion.div>
          </AnimatePresence>

          <StepNav
            step={step}
            canAdvance={canAdvance}
            onBack={back}
            onNext={next}
            onSave={save}
            onSkip={step === 0 ? onSkip : undefined}
          />
        </div>
      </div>
    </div>
  );
}

// ── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step, total }: { step: number; total: number }) {
  const labels = [
    "photo",
    "basics",
    "quote",
    "interests",
    "fun facts",
    "preview",
  ];
  return (
    <div className="flex items-center justify-between gap-2">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Community onboarding · step {step + 1} of {total}
      </p>
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-[3px] w-7 rounded-full transition-colors",
              i <= step ? "bg-ink" : "bg-gold/20",
            )}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

// ── Step nav ────────────────────────────────────────────────────────────────

function StepNav({
  step,
  canAdvance,
  onBack,
  onNext,
  onSave,
  onSkip,
}: {
  step: Step;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-gold/15 pt-5">
      <button
        type="button"
        onClick={onBack}
        disabled={step === 0}
        className={cn(
          "inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors",
          step === 0
            ? "cursor-not-allowed text-ink-faint"
            : "text-ink-muted hover:text-ink",
        )}
      >
        <ArrowLeft size={13} strokeWidth={1.8} /> Back
      </button>

      <div className="flex items-center gap-4">
        {onSkip && step === 0 && (
          <button
            type="button"
            onClick={onSkip}
            className="text-[12.5px] text-ink-muted transition-colors hover:text-ink"
          >
            Skip for now
          </button>
        )}
        {step < 5 ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!canAdvance}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-colors",
              canAdvance
                ? "bg-ink text-ivory hover:bg-ink-soft"
                : "cursor-not-allowed bg-ink/40 text-ivory",
            )}
          >
            Next <ArrowRight size={13} strokeWidth={1.8} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-ivory transition-colors hover:bg-ink-soft"
          >
            <Sparkles size={13} strokeWidth={1.8} />
            Join the circle
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step: cover photo ──────────────────────────────────────────────────────

function StepCover({
  value,
  displayName,
  onChange,
}: {
  value?: string;
  displayName: string;
  onChange: (url: string | undefined) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    if (dataUrl) onChange(dataUrl);
  };

  return (
    <div>
      <StepHeader
        eyebrow="Step 1 · the first impression"
        title="let's start with a photo."
        subline="an engagement shot, a cute selfie, a mandap sketch — whatever feels like you. this is the first thing other brides see."
      />

      <div className="mt-8 flex flex-col items-center">
        <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-gold/20">
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur transition-colors hover:bg-ink"
                aria-label="Remove photo"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            </>
          ) : (
            <GradientPreview displayName={displayName} />
          )}
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-ivory transition-colors hover:bg-ink-soft"
        >
          <Camera size={13} strokeWidth={1.8} />
          {value ? "Change photo" : "Upload cover photo"}
        </button>
        <p className="mt-3 text-[12px] text-ink-muted">
          you can add more photos (up to 12) later — venue, mehendi, outfits.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
      </div>
    </div>
  );
}

function GradientPreview({ displayName }: { displayName: string }) {
  const colors = fallbackGradientFor(displayName || "new-bride");
  return (
    <div
      className="flex h-full w-full items-end p-6"
      style={{
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
      }}
    >
      <div>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/80"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          preview · cover placeholder
        </p>
        <p className="mt-1 font-serif text-[22px] italic text-white">
          {displayName || "your name here"}
        </p>
      </div>
    </div>
  );
}

// ── Step: basics ────────────────────────────────────────────────────────────

function StepBasics({
  form,
  setForm,
}: {
  form: OnboardingForm;
  setForm: (updater: (prev: OnboardingForm) => OnboardingForm) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 2 · the basics"
        title="a few details."
        subline="all editable later — first names only, wedding month is fine."
      />

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Your name" required>
          <input
            type="text"
            placeholder="First name or nickname"
            value={form.display_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, display_name: e.target.value }))
            }
            className={inputClass}
          />
        </Field>
        <Field label="Partner's name">
          <input
            type="text"
            placeholder="Optional"
            value={form.partner_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, partner_name: e.target.value }))
            }
            className={inputClass}
          />
        </Field>
        <Field label="From" required>
          <input
            type="text"
            placeholder="Where are you from?"
            value={form.hometown}
            onChange={(e) =>
              setForm((p) => ({ ...p, hometown: e.target.value }))
            }
            className={inputClass}
          />
        </Field>
        <Field label="Getting married in" required>
          <input
            type="text"
            placeholder="Where's the wedding?"
            value={form.wedding_city}
            onChange={(e) =>
              setForm((p) => ({ ...p, wedding_city: e.target.value }))
            }
            className={inputClass}
          />
        </Field>
        <Field label="When">
          <input
            type="month"
            value={form.wedding_date}
            onChange={(e) =>
              setForm((p) => ({ ...p, wedding_date: e.target.value }))
            }
            className={inputClass}
          />
        </Field>
        <Field label="Guest count">
          <div className="mt-1 flex flex-wrap gap-2">
            {GUEST_COUNT_BUCKETS.map((b) => {
              const selected = form.guest_count_range === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      guest_count_range: selected ? "" : b.id,
                    }))
                  }
                  className={cn(
                    "inline-flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors",
                    selected
                      ? "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                  )}
                >
                  <span className="text-[12.5px] font-medium">{b.label}</span>
                  <span
                    className={cn(
                      "text-[10.5px]",
                      selected ? "text-ivory/70" : "text-ink-faint",
                    )}
                  >
                    {b.helper}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </div>
  );
}

// ── Step: quote ─────────────────────────────────────────────────────────────

function StepQuote({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 3 · in your own words"
        title="what does your dream wedding look like?"
        subline="one or two sentences. this is what other brides will read first — paint the picture."
      />
      <textarea
        rows={5}
        maxLength={500}
        placeholder="palace at dusk, marigolds everywhere, and my nani's recipes on the menu…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          inputClass,
          "mt-8 resize-none py-3 font-serif text-[16px] italic leading-[1.6]",
        )}
      />
      <p className="mt-2 text-right text-[11.5px] text-ink-faint">
        {value.length}/500
      </p>
    </div>
  );
}

// ── Step: interests ─────────────────────────────────────────────────────────

function StepInterests({
  value,
  onChange,
}: {
  value: string[];
  onChange: (slug: string) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 4 · what are you figuring out?"
        title="what do you want to talk about?"
        subline="pick as many as feel right — we'll use these to surface brides who overlap."
      />
      <div className="mt-8 flex flex-wrap gap-2">
        {INTEREST_TAGS.map((tag) => {
          const selected = value.includes(tag.slug);
          return (
            <button
              key={tag.slug}
              type="button"
              onClick={() => onChange(tag.slug)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
                selected
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
              )}
            >
              <span aria-hidden>{tag.emoji}</span>
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step: fun facts ────────────────────────────────────────────────────────

function StepFunFacts({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 5 · a little personality"
        title="a few fun facts (optional)."
        subline="these are the lines that turn a profile into a friendship. skip any you want."
      />
      <div className="mt-8 space-y-5">
        {PROFILE_PROMPTS.map((prompt) => (
          <Field label={prompt.prompt_text} key={prompt.slug}>
            <input
              type="text"
              placeholder={prompt.placeholder}
              value={value[prompt.slug] ?? ""}
              onChange={(e) =>
                onChange({ ...value, [prompt.slug]: e.target.value })
              }
              className={inputClass}
            />
          </Field>
        ))}
      </div>
    </div>
  );
}

// ── Step: preview ───────────────────────────────────────────────────────────

function StepPreview({ form }: { form: OnboardingForm }) {
  // Synthesize a preview profile just for rendering; never persisted.
  const preview = useMemo<CommunityProfile>(
    () => ({
      id: "preview",
      user_id: "preview",
      display_name: form.display_name || "your name",
      cover_photo_data_url: form.cover_photo_data_url,
      cover_seed_gradient: form.cover_photo_data_url
        ? undefined
        : fallbackGradientFor(form.display_name || "new-bride"),
      cover_seed_label: form.display_name || undefined,
      quote: form.quote || undefined,
      hometown: form.hometown || undefined,
      wedding_city: form.wedding_city || undefined,
      wedding_date: form.wedding_date ? `${form.wedding_date}-01` : undefined,
      partner_name: form.partner_name || undefined,
      guest_count_range: form.guest_count_range || undefined,
      wedding_events: [],
      color_palette: [],
      fun_facts: form.fun_facts,
      looking_for: form.looking_for,
      open_to_connect: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    [form],
  );

  return (
    <div>
      <StepHeader
        eyebrow="Step 6 · you're in"
        title="here's how you'll appear."
        subline="looks good? you can always edit from settings."
      />
      <div className="mt-8">
        <div className="mx-auto max-w-md">
          <StoryCard profile={preview} onOpen={() => {}} />
        </div>
        <p className="mt-5 flex items-center justify-center gap-2 text-[12.5px] text-ink-muted">
          <Check size={13} strokeWidth={1.8} className="text-saffron" />
          tap "join the circle" below to save and meet the others.
        </p>
      </div>
    </div>
  );
}

// ── Small primitives ───────────────────────────────────────────────────────

function StepHeader({
  eyebrow,
  title,
  subline,
}: {
  eyebrow: string;
  title: string;
  subline: string;
}) {
  return (
    <div>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-[30px] font-medium leading-[1.1] tracking-[-0.005em] text-ink">
        {title}
      </h2>
      <p className="mt-3 max-w-[520px] text-[14.5px] leading-[1.6] text-ink-muted">
        {subline}
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-saffron">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15";
