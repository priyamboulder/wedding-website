"use client";

// ── Plan & Vibe tab ───────────────────────────────────────────────────────
// Anniversary basics → vibe picker → budget comfort → hard no's →
// "things we loved" free text. All inputs feed the Discover ranking engine.
// Discovery-led, not checklist-led: this tab exists to capture preference
// signal, not to manage tasks.

import { ArrowRight, Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirstAnniversaryStore } from "@/stores/first-anniversary-store";
import {
  BUDGET_TIER_OPTIONS,
  CELEBRATION_WINDOW_OPTIONS,
  DURATION_OPTIONS,
  HARD_NO_OPTIONS,
  VIBE_OPTIONS,
} from "@/lib/first-anniversary-seed";
import type {
  AnniversaryVibe,
  BudgetTier,
  CelebrationWindow,
  DurationPref,
  HardNoTag,
} from "@/types/first-anniversary";
import {
  FieldRow,
  Label,
  Section,
  TextArea,
  TextInput,
} from "../../bachelorette/ui";

interface Props {
  onGoToDiscover: () => void;
}

export function PlanVibeTab({ onGoToDiscover }: Props) {
  return (
    <div className="space-y-5">
      <OpenerCard onGoToDiscover={onGoToDiscover} />
      <DateAndTiming />
      <VibePicker />
      <BudgetComfort />
      <HardNos />
      <ThingsWeLoved />
    </div>
  );
}

// ── Opener / entry card ───────────────────────────────────────────────────

function OpenerCard({ onGoToDiscover }: { onGoToDiscover: () => void }) {
  const vibes = useFirstAnniversaryStore((s) => s.vibe.vibes);
  const budget = useFirstAnniversaryStore((s) => s.vibe.budget);
  const ready = vibes.length > 0 && budget !== null;

  return (
    <section className="rounded-lg border border-border bg-gradient-to-br from-ivory-warm/60 to-white p-5">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Heart
          size={10}
          strokeWidth={1.8}
          className="mr-1 inline-block align-[-1px]"
        />
        Your first anniversary
      </p>
      <h3 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">
        You planned a wedding together.
      </h3>
      <h3 className="font-serif text-[22px] leading-tight text-ink-muted">
        Now plan something just for you two.
      </h3>
      <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink-muted">
        Tell us what you're in the mood for and we'll find the perfect way to
        celebrate — getaway, at-home evening, or something new you learn
        together.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onGoToDiscover}
          disabled={!ready}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[12.5px] font-medium transition-colors",
            ready
              ? "bg-ink text-ivory hover:bg-ink-soft"
              : "cursor-not-allowed border border-border bg-white text-ink-faint",
          )}
        >
          {ready ? "See your matches" : "Pick a vibe + budget first"}
          <ArrowRight size={12} strokeWidth={2} />
        </button>
        {ready && (
          <p className="text-[11.5px] text-ink-muted">
            {vibes.length} vibe{vibes.length === 1 ? "" : "s"} selected
          </p>
        )}
      </div>
    </section>
  );
}

// ── Date & timing ─────────────────────────────────────────────────────────

function DateAndTiming() {
  const basics = useFirstAnniversaryStore((s) => s.basics);
  const updateBasics = useFirstAnniversaryStore((s) => s.updateBasics);
  const setCelebrationWindow = useFirstAnniversaryStore(
    (s) => s.setCelebrationWindow,
  );
  const setDuration = useFirstAnniversaryStore((s) => s.setDuration);

  return (
    <Section
      eyebrow="DATE & TIMING"
      title="When are you celebrating?"
      description="The date anchors seasonality — duration sets the scope of what we'll suggest."
    >
      <div className="divide-y divide-border/60">
        <FieldRow label="Partners">
          <div className="grid grid-cols-2 gap-2">
            <TextInput
              value={basics.partnerOne}
              onChange={(v) => updateBasics({ partnerOne: v })}
              placeholder="Your name"
            />
            <TextInput
              value={basics.partnerTwo}
              onChange={(v) => updateBasics({ partnerTwo: v })}
              placeholder="Partner's name"
            />
          </div>
        </FieldRow>
        <FieldRow label="Anniversary date">
          <TextInput
            value={basics.anniversaryDate}
            onChange={(v) => updateBasics({ anniversaryDate: v })}
            placeholder="e.g. March 15, 2027"
          />
        </FieldRow>
        <FieldRow label="Celebration window">
          <div className="flex flex-wrap gap-1.5">
            {CELEBRATION_WINDOW_OPTIONS.map((opt) => (
              <ChoicePill
                key={opt.value}
                label={opt.label}
                active={basics.celebrationWindow === opt.value}
                onClick={() =>
                  setCelebrationWindow(
                    basics.celebrationWindow === opt.value
                      ? null
                      : (opt.value as CelebrationWindow),
                  )
                }
              />
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Duration">
          <div className="flex flex-col gap-1.5">
            {DURATION_OPTIONS.map((opt) => {
              const active = basics.duration === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-start gap-2 rounded-md border px-3 py-2 text-[13px] transition-colors",
                    active
                      ? "border-ink bg-ink/5 text-ink"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40",
                  )}
                >
                  <input
                    type="radio"
                    name="anniversary-duration"
                    checked={active}
                    onChange={() =>
                      setDuration(opt.value as DurationPref)
                    }
                    className="mt-0.5 accent-ink"
                  />
                  <div>
                    <p className="text-ink">{opt.label}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      {opt.hint}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </FieldRow>
      </div>
    </Section>
  );
}

// ── Vibe picker ───────────────────────────────────────────────────────────

function VibePicker() {
  const vibes = useFirstAnniversaryStore((s) => s.vibe.vibes);
  const toggleVibe = useFirstAnniversaryStore((s) => s.toggleVibe);

  return (
    <Section
      eyebrow="YOUR VIBE"
      title="What are you in the mood for?"
      description="Pick any that feel right — multi-select. Don't overthink it, the algorithm blends them."
    >
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {VIBE_OPTIONS.map((opt) => {
          const active = vibes.includes(opt.value as AnniversaryVibe);
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => toggleVibe(opt.value as AnniversaryVibe)}
                className={cn(
                  "group relative w-full overflow-hidden rounded-lg border p-4 text-left transition-all",
                  active
                    ? "border-ink bg-ink/[0.03]"
                    : "border-border bg-white hover:border-saffron/40",
                )}
                aria-pressed={active}
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-serif text-[16px] leading-tight text-ink">
                    {opt.label}
                  </h4>
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      active
                        ? "border-ink bg-ink text-ivory"
                        : "border-border bg-white text-transparent",
                    )}
                  >
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-snug text-ink-muted">
                  {opt.blurb}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// ── Budget comfort ────────────────────────────────────────────────────────

function BudgetComfort() {
  const budget = useFirstAnniversaryStore((s) => s.vibe.budget);
  const setBudget = useFirstAnniversaryStore((s) => s.setBudget);

  return (
    <Section
      eyebrow="BUDGET COMFORT ZONE"
      title="What feels right to spend?"
      description="We'll use this to rank — if you pick Treat Ourselves, we won't push once-in-a-lifetime trips."
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {BUDGET_TIER_OPTIONS.map((opt) => {
          const active = budget === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setBudget(active ? null : (opt.value as BudgetTier))
              }
              className={cn(
                "flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                active
                  ? "border-ink bg-ink/5"
                  : "border-border bg-white hover:border-saffron/40",
              )}
              aria-pressed={active}
            >
              <div>
                <p className="font-serif text-[15px] text-ink">{opt.label}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {opt.range}
                </p>
              </div>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active
                    ? "border-ink bg-ink text-ivory"
                    : "border-border bg-white text-transparent",
                )}
              >
                <Check size={11} strokeWidth={2.5} />
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

// ── Hard no's ─────────────────────────────────────────────────────────────

function HardNos() {
  const hardNos = useFirstAnniversaryStore((s) => s.vibe.hardNos);
  const toggleHardNo = useFirstAnniversaryStore((s) => s.toggleHardNo);
  const accessibilityNotes = useFirstAnniversaryStore(
    (s) => s.vibe.accessibilityNotes,
  );
  const updateVibe = useFirstAnniversaryStore((s) => s.updateVibe);

  return (
    <Section
      eyebrow="HARD NO'S"
      title="What's off the table?"
      description="Dealbreakers the algorithm will penalise. Toggle any that apply."
    >
      <div className="flex flex-wrap gap-1.5">
        {HARD_NO_OPTIONS.map((opt) => {
          const active = hardNos.includes(opt.value as HardNoTag);
          return (
            <ChoicePill
              key={opt.value}
              label={opt.label}
              active={active}
              onClick={() => toggleHardNo(opt.value as HardNoTag)}
            />
          );
        })}
      </div>

      <div className="mt-5">
        <Label>Dietary or accessibility needs</Label>
        <div className="mt-1.5">
          <TextInput
            value={accessibilityNotes}
            onChange={(v) => updateVibe({ accessibilityNotes: v })}
            placeholder="e.g. Vegetarian, mobility-friendly routes, allergy notes…"
          />
        </div>
      </div>
    </Section>
  );
}

// ── Things we loved (free text → personalization signal) ──────────────────

function ThingsWeLoved() {
  const thingsWeLoved = useFirstAnniversaryStore((s) => s.vibe.thingsWeLoved);
  const updateVibe = useFirstAnniversaryStore((s) => s.updateVibe);

  return (
    <Section
      eyebrow="THINGS YOU LOVED"
      title="What from your first year do you want to build on?"
      description="No wrong answers — specific moments work better than generic ones. A few phrases is plenty."
    >
      <TextArea
        value={thingsWeLoved}
        onChange={(v) => updateVibe({ thingsWeLoved: v })}
        placeholder="That random Sunday morning at the farmer's market. When we tried making pasta from scratch and failed. The weekend we didn't leave the apartment."
        rows={4}
      />
    </Section>
  );
}

// ── Inline primitive ──────────────────────────────────────────────────────

function ChoicePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-[12px] transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
