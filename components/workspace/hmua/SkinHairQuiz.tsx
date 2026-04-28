"use client";

// ── Skin & Hair Profile Quiz ─────────────────────────────────────────────
// A Buzzfeed-style guided quiz that replaces the "clinical form" feel of
// the old SkinHairProfile card. One question per screen, progress dots,
// friendly copy. Writes results into the same useHmuaStore profile fields
// so all downstream references continue to work.
//
// The quiz is entered from SkinHairQuizEntry (the CTA card shown on Vision
// & Mood). Once the final question is submitted, the profile card below
// becomes the authoritative summary — and can be edited manually.

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useHmuaStore,
  type CurlHold,
  type HairConcern,
  type HairLength,
  type HairTreatment,
  type HairType,
  type SkinConcern,
  type SkinHairProfile,
  type SkinReaction,
  type SkinTone,
  type SkinType,
  type SpfHabit,
} from "@/stores/hmua-store";

// ── Question definitions ─────────────────────────────────────────────────
// Each question carries its display copy, options with helper text + emoji,
// and a setter that writes into a partial SkinHairProfile draft.

type Option<T extends string> = { value: T; label: string; hint?: string; emoji?: string };

interface SingleQuestion<K extends SingleSelectKey> {
  kind: "single";
  field: K;
  title: string;
  subtitle?: string;
  prompt: string;
  options: Option<ProfileValueOf<K> & string>[];
}

interface MultiQuestion<K extends MultiSelectKey> {
  kind: "multi";
  field: K;
  title: string;
  subtitle?: string;
  prompt: string;
  helper?: string;
  options: Option<MultiSelectItem<K>>[];
  optional?: boolean;
}

interface TextQuestion<K extends TextKey> {
  kind: "text";
  field: K;
  title: string;
  subtitle?: string;
  prompt: string;
  placeholder: string;
  optional?: boolean;
}

type SingleSelectKey =
  | "skin_type"
  | "skin_tone"
  | "skin_reaction"
  | "spf_habit"
  | "hair_type"
  | "hair_treatment"
  | "hair_length"
  | "curl_hold";

type MultiSelectKey = "skin_concerns" | "hair_concerns";
type TextKey = "allergies" | "skin_conditions";

type ProfileValueOf<K extends keyof SkinHairProfile> = SkinHairProfile[K];
type MultiSelectItem<K extends MultiSelectKey> = K extends "skin_concerns"
  ? SkinConcern
  : HairConcern;

type Question =
  | SingleQuestion<SingleSelectKey>
  | MultiQuestion<MultiSelectKey>
  | TextQuestion<TextKey>;

const SKIN_QUESTIONS: Question[] = [
  {
    kind: "single",
    field: "skin_type",
    title: "Skin",
    subtitle: "1 of 5",
    prompt: "How does your skin usually behave by 4pm?",
    options: [
      { value: "oily" as SkinType, label: "Shiny everywhere", hint: "T-zone and cheeks both", emoji: "✨" },
      { value: "dry" as SkinType, label: "Tight or flaky", hint: "Makeup cracks around nose", emoji: "🍂" },
      { value: "combination" as SkinType, label: "Oily T-zone, dry cheeks", hint: "The classic two-faced", emoji: "🎭" },
      { value: "sensitive" as SkinType, label: "Red + reactive", hint: "Bumps, flushes easily", emoji: "🌡" },
    ],
  },
  {
    kind: "multi",
    field: "skin_concerns",
    title: "Skin concerns",
    subtitle: "2 of 5",
    prompt: "What do you want the artist to work around?",
    helper: "Pick as many as apply. Skip if nothing stands out.",
    optional: true,
    options: [
      { value: "acne" as SkinConcern, label: "Breakouts", emoji: "🔴" },
      { value: "rosacea" as SkinConcern, label: "Rosacea / redness", emoji: "🌹" },
      { value: "pigmentation" as SkinConcern, label: "Hyperpigmentation", emoji: "🌗" },
      { value: "texture" as SkinConcern, label: "Texture / unevenness", emoji: "🪨" },
      { value: "fine_lines" as SkinConcern, label: "Fine lines", emoji: "〰️" },
      { value: "dullness" as SkinConcern, label: "Dullness", emoji: "☁️" },
      { value: "sensitivity" as SkinConcern, label: "General sensitivity", emoji: "💗" },
    ],
  },
  {
    kind: "single",
    field: "skin_reaction",
    title: "Reaction tendency",
    subtitle: "3 of 5",
    prompt: "How often does your skin react to new products?",
    options: [
      { value: "often" as SkinReaction, label: "Often", hint: "Even gentle products can sting", emoji: "🚨" },
      { value: "sometimes" as SkinReaction, label: "Sometimes", hint: "Depends on the product", emoji: "🤷" },
      { value: "rarely" as SkinReaction, label: "Rarely", hint: "Usually fine", emoji: "🌿" },
      { value: "never" as SkinReaction, label: "Never", hint: "I can wear anything", emoji: "🪨" },
    ],
  },
  {
    kind: "single",
    field: "spf_habit",
    title: "Sun",
    subtitle: "4 of 5",
    prompt: "Do you wear SPF?",
    options: [
      { value: "daily" as SpfHabit, label: "Daily — religiously", emoji: "☀️" },
      { value: "sometimes" as SpfHabit, label: "Most days", emoji: "⛅" },
      { value: "rarely" as SpfHabit, label: "Only when outside for a while", emoji: "🌤" },
      { value: "never" as SpfHabit, label: "Honestly never", emoji: "🌑" },
    ],
  },
  {
    kind: "text",
    field: "allergies",
    title: "Allergies",
    subtitle: "5 of 5",
    prompt: "Anything to keep out of your kit?",
    placeholder: "Latex, lash adhesive, fragrance, specific ingredients…",
    optional: true,
  },
];

const HAIR_QUESTIONS: Question[] = [
  {
    kind: "single",
    field: "hair_type",
    title: "Hair texture",
    subtitle: "1 of 5",
    prompt: "Natural texture?",
    options: [
      { value: "straight" as HairType, label: "Straight", emoji: "▮" },
      { value: "wavy" as HairType, label: "Wavy", emoji: "〰️" },
      { value: "curly" as HairType, label: "Curly", emoji: "🌀" },
      { value: "coily" as HairType, label: "Coily", emoji: "🧬" },
    ],
  },
  {
    kind: "single",
    field: "hair_treatment",
    title: "Treatments",
    subtitle: "2 of 5",
    prompt: "What's happening on your hair?",
    options: [
      { value: "natural" as HairTreatment, label: "Natural, untouched", emoji: "🌱" },
      { value: "color" as HairTreatment, label: "Colored", emoji: "🎨" },
      { value: "highlights" as HairTreatment, label: "Highlights / balayage", emoji: "✨" },
      { value: "keratin" as HairTreatment, label: "Keratin / smoothing", emoji: "💆" },
      { value: "extensions" as HairTreatment, label: "Extensions", emoji: "💇‍♀️" },
    ],
  },
  {
    kind: "multi",
    field: "hair_concerns",
    title: "Hair concerns",
    subtitle: "3 of 5",
    prompt: "What drives you crazy about your hair?",
    helper: "Pick as many as apply. Skip if nothing stands out.",
    optional: true,
    options: [
      { value: "frizz" as HairConcern, label: "Frizz", emoji: "🌬" },
      { value: "thinning" as HairConcern, label: "Thinning", emoji: "🪶" },
      { value: "breakage" as HairConcern, label: "Breakage", emoji: "💔" },
      { value: "oiliness" as HairConcern, label: "Gets oily fast", emoji: "💧" },
      { value: "dryness" as HairConcern, label: "Dryness", emoji: "🍂" },
      { value: "dandruff" as HairConcern, label: "Dandruff / flakes", emoji: "❄️" },
    ],
  },
  {
    kind: "single",
    field: "hair_length",
    title: "Length",
    subtitle: "4 of 5",
    prompt: "Current length?",
    options: [
      { value: "short" as HairLength, label: "Short", hint: "Above shoulders", emoji: "✂️" },
      { value: "medium" as HairLength, label: "Medium", hint: "Collarbone to mid-back", emoji: "💇" },
      { value: "long" as HairLength, label: "Long", hint: "Mid-back or longer", emoji: "🌾" },
    ],
  },
  {
    kind: "single",
    field: "curl_hold",
    title: "Curl holding",
    subtitle: "5 of 5",
    prompt: "How well does your hair hold a curl or style?",
    options: [
      { value: "great" as CurlHold, label: "Great", hint: "A pinned updo lasts all night", emoji: "🔒" },
      { value: "okay" as CurlHold, label: "Okay", hint: "Needs product to stay", emoji: "🔧" },
      { value: "poor" as CurlHold, label: "Poor", hint: "Curls fall out fast", emoji: "🪶" },
    ],
  },
];

const TONE_QUESTION: SingleQuestion<"skin_tone"> = {
  kind: "single",
  field: "skin_tone",
  title: "Skin tone",
  subtitle: "First, a baseline",
  prompt: "Which feels closest to your undertone?",
  options: [
    { value: "fair" as SkinTone, label: "Fair", emoji: "🤍" },
    { value: "medium" as SkinTone, label: "Medium", emoji: "🤎" },
    { value: "olive" as SkinTone, label: "Olive", emoji: "🫒" },
    { value: "deep" as SkinTone, label: "Deep", emoji: "🖤" },
  ],
};

const ALL_QUESTIONS: Question[] = [TONE_QUESTION, ...SKIN_QUESTIONS, ...HAIR_QUESTIONS];

// ── Entry card (CTA shown when quiz hasn't been completed) ───────────────

export function SkinHairQuizEntry({
  onStart,
  completed,
  onRetake,
}: {
  onStart: () => void;
  completed: boolean;
  onRetake: () => void;
}) {
  if (completed) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-sage/30 bg-sage-pale/15 px-4 py-3">
        <div className="flex items-center gap-2">
          <Check size={14} strokeWidth={1.8} className="text-sage" />
          <span className="text-[12.5px] text-ink">
            Skin & hair profile complete. Your artist reads this first.
          </span>
        </div>
        <button
          type="button"
          onClick={onRetake}
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-saffron hover:underline"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Retake quiz
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      className="group flex w-full items-center gap-4 rounded-lg border border-saffron/40 bg-gradient-to-r from-saffron-pale/40 via-ivory-warm/60 to-ivory-warm/20 p-4 text-left transition-all hover:border-saffron hover:shadow-[0_2px_8px_rgba(210,150,60,0.12)]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron/20 text-saffron">
        <Sparkles size={18} strokeWidth={1.6} />
      </span>
      <div className="flex-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Two minutes. One cleaner brief for every artist.
        </p>
        <h3 className="mt-0.5 font-serif text-[18px] leading-tight text-ink">
          Take the Skin & Hair quiz
        </h3>
        <p className="mt-0.5 text-[12.5px] text-ink-muted">
          Skip the 12-field form. Eleven fast questions → a shareable profile card.
        </p>
      </div>
      <ArrowRight
        size={16}
        strokeWidth={1.8}
        className="text-saffron transition-transform group-hover:translate-x-0.5"
      />
    </button>
  );
}

// ── Runner (the actual quiz modal) ───────────────────────────────────────

export function SkinHairQuizRunner({
  categoryId,
  onClose,
}: {
  categoryId: string;
  onClose: () => void;
}) {
  const setProfile = useHmuaStore((s) => s.setProfile);
  const initial = useHmuaStore((s) => s.getProfile(categoryId));
  const [draft, setDraft] = useState<SkinHairProfile>(initial);
  const [index, setIndex] = useState(0);
  const question = ALL_QUESTIONS[index]!;
  const isFinal = index === ALL_QUESTIONS.length - 1;

  const progress = useMemo(
    () => ((index + 1) / ALL_QUESTIONS.length) * 100,
    [index],
  );

  function patch<K extends keyof SkinHairProfile>(field: K, value: SkinHairProfile[K]) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  function answered(q: Question): boolean {
    if (q.kind === "multi" || q.kind === "text") {
      if (q.optional) return true;
    }
    if (q.kind === "single") {
      const v = draft[q.field];
      return typeof v === "string" && v.length > 0;
    }
    if (q.kind === "multi") {
      const v = draft[q.field];
      return Array.isArray(v) && v.length > 0;
    }
    const v = draft[q.field];
    return typeof v === "string" && v.trim().length > 0;
  }

  function advance() {
    if (!answered(question)) return;
    if (isFinal) {
      setProfile(categoryId, {
        ...draft,
        quiz_completed_at: new Date().toISOString(),
      });
      onClose();
      return;
    }
    setIndex((i) => Math.min(ALL_QUESTIONS.length - 1, i + 1));
  }

  function back() {
    setIndex((i) => Math.max(0, i - 1));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-ivory shadow-[0_24px_48px_rgba(26,26,26,0.18)]">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-ink-muted ring-1 ring-border hover:text-ink"
          aria-label="Close quiz"
        >
          <X size={14} strokeWidth={1.8} />
        </button>

        {/* Progress */}
        <div className="relative h-1 w-full bg-ivory-warm">
          <div
            className="h-full bg-saffron transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-8 pb-8 pt-10">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {question.subtitle ?? question.title}
          </p>
          <h2 className="mt-2 font-serif text-[26px] font-bold leading-tight text-ink">
            {question.prompt}
          </h2>
          {question.kind === "multi" && question.helper && (
            <p className="mt-1.5 text-[12.5px] italic text-ink-muted">
              {question.helper}
            </p>
          )}

          <div className="mt-6">
            {question.kind === "single" ? (
              <SingleOptions
                question={question}
                value={draft[question.field] as string}
                onPick={(v) => {
                  patch(question.field, v as never);
                }}
              />
            ) : question.kind === "multi" ? (
              <MultiOptions
                question={question}
                selected={(draft[question.field] as string[]) ?? []}
                onToggle={(v) => {
                  const current = (draft[question.field] as string[]) ?? [];
                  const next = current.includes(v)
                    ? current.filter((x) => x !== v)
                    : [...current, v];
                  patch(question.field, next as never);
                }}
              />
            ) : (
              <textarea
                value={(draft[question.field] as string) ?? ""}
                onChange={(e) => patch(question.field, e.target.value as never)}
                placeholder={question.placeholder}
                rows={4}
                className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 font-serif text-[14px] italic leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              />
            )}
          </div>

          {/* Dots */}
          <div className="mt-8 flex items-center justify-center gap-1.5">
            {ALL_QUESTIONS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-saffron"
                    : i < index
                      ? "w-1.5 bg-saffron/50"
                      : "w-1.5 bg-border",
                )}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={index === 0}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] transition-colors",
                index === 0
                  ? "cursor-not-allowed text-ink-faint"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              <ChevronLeft size={13} strokeWidth={1.8} />
              Back
            </button>
            <button
              type="button"
              onClick={advance}
              disabled={!answered(question)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[12.5px] font-medium transition-colors",
                answered(question)
                  ? "bg-ink text-ivory hover:opacity-90"
                  : "bg-ivory-warm text-ink-faint",
              )}
            >
              {isFinal ? "See my profile card" : "Next"}
              <ArrowRight size={13} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleOptions({
  question,
  value,
  onPick,
}: {
  question: SingleQuestion<SingleSelectKey>;
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {question.options.map((o) => {
        const active = value === o.value;
        return (
          <li key={o.value}>
            <button
              type="button"
              onClick={() => onPick(o.value)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-all",
                active
                  ? "border-saffron bg-saffron-pale/40 shadow-[0_1px_4px_rgba(210,150,60,0.15)]"
                  : "border-border bg-white hover:border-saffron/40 hover:bg-saffron-pale/10",
              )}
            >
              {o.emoji && (
                <span className="text-[22px] leading-none">{o.emoji}</span>
              )}
              <span className="flex-1">
                <span className="block font-serif text-[15px] leading-tight text-ink">
                  {o.label}
                </span>
                {o.hint && (
                  <span className="mt-0.5 block text-[11.5px] italic text-ink-muted">
                    {o.hint}
                  </span>
                )}
              </span>
              {active && (
                <Check size={14} strokeWidth={2} className="mt-0.5 text-saffron" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MultiOptions({
  question,
  selected,
  onToggle,
}: {
  question: MultiQuestion<MultiSelectKey>;
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {question.options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <li key={o.value}>
            <button
              type="button"
              onClick={() => onToggle(o.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] transition-all",
                active
                  ? "border-saffron bg-saffron-pale/50 text-saffron"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40",
              )}
            >
              {o.emoji && <span>{o.emoji}</span>}
              {o.label}
              {active && <Check size={12} strokeWidth={2} />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ── Profile card summary (the shareable result) ──────────────────────────
// Renders once the quiz has been completed. Quietly replaces the empty
// panel with a premium-feeling summary the bride can screenshot.

export function SkinHairProfileResultCard({
  profile,
}: {
  profile: SkinHairProfile;
}) {
  const concernLabels = profile.skin_concerns.map(labelFor);
  const hairConcernLabels = profile.hair_concerns.map(labelFor);
  const completedAt = profile.quiz_completed_at
    ? new Date(profile.quiz_completed_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="relative overflow-hidden rounded-lg border border-saffron/30 bg-gradient-to-br from-ivory via-ivory-warm/40 to-saffron-pale/20 p-5 shadow-[0_1px_2px_rgba(26,26,26,0.04)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Skin & Hair Profile Card
          </p>
          <h3 className="mt-1 font-serif text-[20px] font-bold leading-tight text-ink">
            Your dossier for every artist
          </h3>
        </div>
        {completedAt && (
          <span
            className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {completedAt}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ResultBlock label="Skin">
          <Fact label="Type" value={labelFor(profile.skin_type)} />
          <Fact label="Tone" value={labelFor(profile.skin_tone) || profile.skin_tone_custom} />
          <Fact
            label="Concerns"
            value={concernLabels.length ? concernLabels.join(", ") : "None flagged"}
          />
          <Fact label="Reactivity" value={labelFor(profile.skin_reaction)} />
          <Fact label="SPF" value={labelFor(profile.spf_habit)} />
          {profile.allergies && <Fact label="Allergies" value={profile.allergies} />}
          {profile.skin_conditions && (
            <Fact label="Conditions" value={profile.skin_conditions} />
          )}
        </ResultBlock>
        <ResultBlock label="Hair">
          <Fact label="Texture" value={labelFor(profile.hair_type)} />
          <Fact label="Treatment" value={labelFor(profile.hair_treatment)} />
          <Fact label="Length" value={labelFor(profile.hair_length)} />
          <Fact
            label="Concerns"
            value={hairConcernLabels.length ? hairConcernLabels.join(", ") : "None flagged"}
          />
          <Fact label="Curl hold" value={labelFor(profile.curl_hold)} />
        </ResultBlock>
      </div>
    </div>
  );
}

function ResultBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md bg-white/70 p-4 ring-1 ring-border">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <dl className="mt-2 space-y-1.5">{children}</dl>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-2">
      <dt
        className="w-20 shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd className="flex-1 text-[12.5px] text-ink">{value}</dd>
    </div>
  );
}

// ── Label helpers ────────────────────────────────────────────────────────

const LABELS: Record<string, string> = {
  // Skin type
  oily: "Oily",
  dry: "Dry",
  combination: "Combination",
  sensitive: "Sensitive",
  normal: "Normal",
  // Skin tone
  fair: "Fair",
  medium: "Medium",
  olive: "Olive",
  deep: "Deep",
  // Reaction
  often: "Reacts often — handle gently",
  sometimes: "Sometimes — patch test new things",
  rarely: "Rarely reacts",
  never: "Never reacts",
  // SPF
  daily: "Daily, religiously",
  // Hair type
  straight: "Straight",
  wavy: "Wavy",
  curly: "Curly",
  coily: "Coily",
  // Hair length
  short: "Short",
  long: "Long",
  // Hair treatment
  natural: "Natural, untouched",
  color: "Colored",
  highlights: "Highlights / balayage",
  keratin: "Keratin / smoothing",
  extensions: "Extensions",
  // Concerns — skin
  acne: "Breakouts",
  rosacea: "Rosacea / redness",
  pigmentation: "Hyperpigmentation",
  texture: "Texture",
  fine_lines: "Fine lines",
  dullness: "Dullness",
  sensitivity: "General sensitivity",
  // Concerns — hair
  frizz: "Frizz",
  thinning: "Thinning",
  breakage: "Breakage",
  oiliness: "Oily-prone",
  dryness: "Dryness",
  dandruff: "Dandruff / flakes",
  // Curl hold
  great: "Holds great",
  okay: "Holds okay",
  poor: "Holds poorly",
};

function labelFor(v: string | undefined | null): string {
  if (!v) return "";
  return LABELS[v] ?? v;
}
