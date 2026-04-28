"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BudgetRange } from "@/types/creator";
import type { CouplePreferences } from "@/types/matching";
import {
  AESTHETIC_TILES,
} from "@/lib/creators/services-seed";
import {
  ALL_BUDGET_RANGES,
  BUDGET_RANGE_LABELS,
} from "@/stores/matching-store";

// ── MatchingQuiz ──────────────────────────────────────────────────────────
// Four-step preference capture. Collects what the matching algorithm needs
// without an explanation screen — each step is a single question. The final
// step calls onComplete with the shape the store's savePreferences wants.

type QuizInput = Omit<
  CouplePreferences,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

const MODULES: { id: string; label: string; hint: string }[] = [
  { id: "phase-0", label: "Foundation & Vision", hint: "Budget, dates, venue direction" },
  { id: "phase-3", label: "Attire & Styling", hint: "Outfits, jewelry, beauty" },
  { id: "phase-4", label: "Vendors — Experience", hint: "Catering, décor, entertainment" },
  { id: "phase-5", label: "Paper & Stationery", hint: "Invitations, day-of paper" },
  { id: "phase-7", label: "Ceremony Specifics", hint: "Mandap, rituals, ceremony design" },
  { id: "phase-2", label: "Core Bookings", hint: "Photographer, priest, venue" },
];

const STYLES: { id: string; label: string }[] = [
  { id: "grand", label: "Grand" },
  { id: "traditional", label: "Traditional" },
  { id: "minimalist", label: "Minimalist" },
  { id: "modern", label: "Modern" },
  { id: "heirloom", label: "Heirloom" },
  { id: "romantic", label: "Romantic" },
  { id: "couture", label: "Couture" },
  { id: "considered", label: "Considered" },
];

const TRADITIONS: { id: string; label: string }[] = [
  { id: "hindu", label: "Hindu" },
  { id: "sikh", label: "Sikh" },
  { id: "muslim", label: "Muslim" },
  { id: "christian", label: "Christian" },
  { id: "jain", label: "Jain" },
  { id: "secular", label: "Secular / Mixed" },
];

export function MatchingQuiz({
  initial,
  onComplete,
  onCancel,
}: {
  initial?: Partial<QuizInput>;
  onComplete: (input: QuizInput) => void;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [priorityModules, setPriorityModules] = useState<string[]>(
    initial?.priorityModules ?? [],
  );
  const [styleTags, setStyleTags] = useState<string[]>(
    initial?.styleTags ?? [],
  );
  const [traditionTags, setTraditionTags] = useState<string[]>(
    initial?.traditionTags ?? [],
  );
  const [budgetRange, setBudgetRange] = useState<BudgetRange | null>(
    initial?.budgetRange ?? null,
  );
  const [aestheticImageIds, setAestheticImageIds] = useState<string[]>(
    initial?.aestheticImageIds ?? [],
  );

  const canAdvance = useMemo(() => {
    if (step === 0) return priorityModules.length > 0;
    if (step === 1) return styleTags.length > 0;
    if (step === 2) return budgetRange !== null;
    if (step === 3) return aestheticImageIds.length >= 1;
    return false;
  }, [step, priorityModules, styleTags, budgetRange, aestheticImageIds]);

  const submit = () => {
    if (!budgetRange) return;
    // Merge aesthetic-derived tags into the couple's style tags so the
    // matching algorithm has more signal when the user skipped style tags.
    const aestheticTags = aestheticImageIds
      .flatMap(
        (id) => AESTHETIC_TILES.find((t) => t.id === id)?.styleTags ?? [],
      );
    const mergedStyleTags = Array.from(
      new Set([...styleTags, ...aestheticTags]),
    );
    onComplete({
      priorityModules,
      styleTags: mergedStyleTags,
      traditionTags,
      budgetRange,
      aestheticImageIds,
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <QuizHeader step={step} />

      <div className="mt-8">
        {step === 0 && (
          <ModuleStep
            selected={priorityModules}
            onChange={setPriorityModules}
          />
        )}
        {step === 1 && (
          <StyleStep
            styleSelected={styleTags}
            traditionSelected={traditionTags}
            onStyleChange={setStyleTags}
            onTraditionChange={setTraditionTags}
          />
        )}
        {step === 2 && (
          <BudgetStep selected={budgetRange} onChange={setBudgetRange} />
        )}
        {step === 3 && (
          <AestheticStep
            selected={aestheticImageIds}
            onChange={setAestheticImageIds}
          />
        )}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-gold/15 pt-6">
        {step === 0 ? (
          onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-[12px] text-ink-muted underline-offset-4 hover:underline"
            >
              Cancel
            </button>
          ) : (
            <span />
          )
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={1.8} /> Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            disabled={!canAdvance}
            onClick={() => setStep((s) => s + 1)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-5 py-2 text-[12px] font-medium uppercase tracking-wider transition-colors",
              canAdvance
                ? "border-ink bg-ink text-ivory hover:bg-ink/90"
                : "cursor-not-allowed border-ink/20 bg-ivory-warm text-ink-faint",
            )}
          >
            Next <ChevronRight size={13} strokeWidth={1.8} />
          </button>
        ) : (
          <button
            type="button"
            disabled={!canAdvance}
            onClick={submit}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-5 py-2 text-[12px] font-medium uppercase tracking-wider transition-colors",
              canAdvance
                ? "border-gold bg-gold text-ivory hover:bg-gold/90"
                : "cursor-not-allowed border-ink/20 bg-ivory-warm text-ink-faint",
            )}
          >
            Show my matches <ChevronRight size={13} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────

const STEP_TITLES = [
  "What do you need help with?",
  "What's your style?",
  "What's your budget?",
  "Which of these feels like your wedding?",
];

const STEP_SUBTITLES = [
  "Pick the areas you'd most want an expert's eye on. You can choose more than one.",
  "Tap the words and traditions that describe the wedding you're building.",
  "A rough range helps us match you with creators who work at your tier.",
  "Select at least one — the vibes that make you stop scrolling.",
];

function QuizHeader({ step }: { step: number }) {
  return (
    <header>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Step {step + 1} of 4
      </p>
      <h2 className="mt-2 font-serif text-[30px] leading-[1.1] text-ink">
        {STEP_TITLES[step]}
      </h2>
      <p className="mt-2 text-[13.5px] text-ink-muted">
        {STEP_SUBTITLES[step]}
      </p>
      <ProgressDots step={step} total={4} />
    </header>
  );
}

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="mt-5 flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-[2px] w-10 rounded-full transition-colors",
            i <= step ? "bg-ink" : "bg-ink/15",
          )}
        />
      ))}
    </div>
  );
}

// ── Step 1: Modules ───────────────────────────────────────────────────────

function ModuleStep({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {MODULES.map((m) => {
        const active = selected.includes(m.id);
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => toggle(m.id)}
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-white p-4 text-left transition-colors",
              active
                ? "border-ink bg-ivory-warm"
                : "border-border hover:border-gold/40",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border",
                active ? "border-ink bg-ink" : "border-ink/30 bg-white",
              )}
            >
              {active && <Check size={10} strokeWidth={2.5} className="text-ivory" />}
            </span>
            <span className="flex-1">
              <span className="block font-serif text-[15px] text-ink">
                {m.label}
              </span>
              <span className="mt-0.5 block text-[11.5px] text-ink-muted">
                {m.hint}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Step 2: Style + Tradition ─────────────────────────────────────────────

function StyleStep({
  styleSelected,
  traditionSelected,
  onStyleChange,
  onTraditionChange,
}: {
  styleSelected: string[];
  traditionSelected: string[];
  onStyleChange: (next: string[]) => void;
  onTraditionChange: (next: string[]) => void;
}) {
  const toggleStyle = (id: string) =>
    onStyleChange(
      styleSelected.includes(id)
        ? styleSelected.filter((s) => s !== id)
        : [...styleSelected, id],
    );
  const toggleTradition = (id: string) =>
    onTraditionChange(
      traditionSelected.includes(id)
        ? traditionSelected.filter((s) => s !== id)
        : [...traditionSelected, id],
    );

  return (
    <div className="space-y-8">
      <div>
        <p
          className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Style (pick 1–4)
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => {
            const active = styleSelected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleStyle(s.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[12px] transition-colors",
                  active
                    ? "border-ink bg-ink text-ivory"
                    : "border-border bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p
          className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Traditions (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {TRADITIONS.map((t) => {
            const active = traditionSelected.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTradition(t.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[12px] transition-colors",
                  active
                    ? "border-gold bg-gold-pale/50 text-gold"
                    : "border-border bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Budget ────────────────────────────────────────────────────────

function BudgetStep({
  selected,
  onChange,
}: {
  selected: BudgetRange | null;
  onChange: (next: BudgetRange) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
      {ALL_BUDGET_RANGES.map((r) => {
        const active = selected === r;
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={cn(
              "rounded-lg border bg-white px-3 py-4 text-center transition-colors",
              active
                ? "border-ink bg-ivory-warm"
                : "border-border hover:border-gold/40",
            )}
          >
            <span className="block font-serif text-[15px] text-ink">
              {BUDGET_RANGE_LABELS[r]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Step 4: Aesthetic tiles ───────────────────────────────────────────────

function AestheticStep({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {AESTHETIC_TILES.map((tile) => {
        const active = selected.includes(tile.id);
        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => toggle(tile.id)}
            className={cn(
              "group relative overflow-hidden rounded-lg border text-left transition-all",
              active
                ? "border-ink shadow-md ring-2 ring-ink/40 ring-offset-2"
                : "border-transparent hover:shadow-sm",
            )}
          >
            <div
              aria-hidden
              className="h-36 w-full"
              style={{ background: tile.gradient }}
            />
            <div className="border-t border-border bg-white px-3 py-2">
              <p className="font-serif text-[13px] text-ink">{tile.label}</p>
            </div>
            {active && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-ivory shadow">
                <Check size={11} strokeWidth={2.5} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
