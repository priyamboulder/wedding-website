"use client";

// 9-step wedding intake wizard. Submits the WeddingProfile to the launcher,
// which POSTs to the API and commits tasks to the existing checklist store.

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BUDGET_LABELS,
  BLENDING_LABELS,
  EMPTY_PROFILE,
  EVENTS_LABELS,
  FAITH_LABELS,
  GUESTS_LABELS,
  HINDU_REGION_LABELS,
  type BudgetTier,
  type EventsScale,
  type Faith,
  type GuestScale,
  type HinduRegion,
  type InterfaithBlending,
  type WeddingProfile,
} from "@/lib/ai-checklist/profile";

interface Props {
  initial: WeddingProfile;
  hasExistingAiTasks: boolean;
  onClose: () => void;
  onSubmit: (profile: WeddingProfile, replace: boolean) => Promise<void>;
}

// Steps are computed dynamically — some are conditional. We keep a list of
// step ids and render based on the current index.
type StepId =
  | "date"
  | "faiths"
  | "hindu_regions"
  | "interfaith"
  | "events"
  | "guests"
  | "budget"
  | "location"
  | "review";

function computeSteps(profile: WeddingProfile): StepId[] {
  const steps: StepId[] = ["date", "faiths"];
  if (profile.faiths.includes("hindu")) steps.push("hindu_regions");
  if (profile.faiths.length >= 2) steps.push("interfaith");
  steps.push("events", "guests", "budget", "location", "review");
  return steps;
}

const FAITH_OPTIONS: Faith[] = [
  "hindu",
  "christian",
  "muslim",
  "jewish",
  "sikh",
  "buddhist",
  "secular",
  "other",
];

const HINDU_REGION_OPTIONS: HinduRegion[] = [
  "gujarati",
  "punjabi",
  "bengali",
  "tamil",
  "telugu",
  "marathi",
  "rajasthani",
  "kashmiri",
  "malayali",
  "north_indian_generic",
  "other",
];

const BLENDING_OPTIONS: InterfaithBlending[] = [
  "combined_ceremony",
  "separate_ceremonies",
  "multi_day_hybrid",
];

const EVENTS_OPTIONS: EventsScale[] = ["3", "4_5", "6_7", "8_plus"];
const GUESTS_OPTIONS: GuestScale[] = ["lt100", "100_200", "200_400", "gt400"];
const BUDGET_OPTIONS: BudgetTier[] = ["modest", "mid", "premium", "luxury"];

export function AIQuestionnaireModal({
  initial,
  hasExistingAiTasks,
  onClose,
  onSubmit,
}: Props) {
  const [profile, setProfile] = useState<WeddingProfile>(initial ?? EMPTY_PROFILE);
  const [stepIdx, setStepIdx] = useState(0);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = useMemo(() => computeSteps(profile), [profile]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const isLast = stepIdx >= steps.length - 1;
  const isFirst = stepIdx === 0;

  // If prior steps altered conditional visibility, clamp stepIdx.
  useEffect(() => {
    if (stepIdx > steps.length - 1) setStepIdx(steps.length - 1);
  }, [steps, stepIdx]);

  const canAdvance = stepValid(step, profile);

  function next() {
    if (!canAdvance) return;
    if (!isLast) setStepIdx((i) => i + 1);
  }

  function back() {
    if (!isFirst) setStepIdx((i) => i - 1);
  }

  function toggle<T extends string>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  async function handleGenerate() {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(profile, replaceExisting);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-ivory shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <div>
              <div className="text-sm font-medium text-ink">Wedding AI</div>
              <div className="text-xs text-ink-faint">
                Step {Math.min(stepIdx + 1, steps.length)} of {steps.length}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-ink-faint hover:bg-border hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 border-b border-border bg-white px-6 py-2.5">
          {steps.map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < stepIdx
                  ? "bg-gold"
                  : i === stepIdx
                    ? "bg-gold/60"
                    : "bg-border",
              )}
            />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === "date" ? (
            <Field
              label="When is your wedding?"
              hint="All task due dates are computed back from this date."
            >
              <input
                type="date"
                autoFocus
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                value={profile.weddingDate}
                onChange={(e) =>
                  setProfile({ ...profile, weddingDate: e.target.value })
                }
              />
            </Field>
          ) : null}

          {step === "faiths" ? (
            <Field
              label="Which religious or spiritual traditions should the wedding reflect?"
              hint="Select all that apply. Interfaith couples should select both."
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FAITH_OPTIONS.map((f) => (
                  <Pill
                    key={f}
                    selected={profile.faiths.includes(f)}
                    onClick={() =>
                      setProfile({ ...profile, faiths: toggle(profile.faiths, f) })
                    }
                  >
                    {FAITH_LABELS[f]}
                  </Pill>
                ))}
              </div>
            </Field>
          ) : null}

          {step === "hindu_regions" ? (
            <Field
              label="Which Hindu regional traditions?"
              hint="Hindu weddings vary dramatically by region — select all that apply so rituals are named correctly."
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {HINDU_REGION_OPTIONS.map((r) => (
                  <Pill
                    key={r}
                    selected={profile.hinduRegions.includes(r)}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        hinduRegions: toggle(profile.hinduRegions, r),
                      })
                    }
                  >
                    {HINDU_REGION_LABELS[r]}
                  </Pill>
                ))}
              </div>
            </Field>
          ) : null}

          {step === "interfaith" ? (
            <Field
              label="How do you want to blend the traditions?"
              hint="Ceremonies can be combined, sequential, or spread across multiple days."
            >
              <div className="grid grid-cols-1 gap-2">
                {BLENDING_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() =>
                      setProfile({ ...profile, interfaithBlending: b })
                    }
                    className={cn(
                      "rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                      profile.interfaithBlending === b
                        ? "border-gold bg-gold-pale/50"
                        : "border-border bg-white hover:border-ink-faint/50",
                    )}
                  >
                    {BLENDING_LABELS[b]}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-faint">
                  Must-include traditions from each side
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Pheras from my side; unity candle and priest-led vows from theirs."
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  value={profile.interfaithNotes}
                  onChange={(e) =>
                    setProfile({ ...profile, interfaithNotes: e.target.value })
                  }
                />
              </div>
            </Field>
          ) : null}

          {step === "events" ? (
            <Field
              label="How many events across the celebration?"
              hint="Some families do 3 days, others spread across 7+ events — affects vendor and logistics tasks."
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {EVENTS_OPTIONS.map((e) => (
                  <Pill
                    key={e}
                    selected={profile.eventsScale === e}
                    onClick={() => setProfile({ ...profile, eventsScale: e })}
                  >
                    {EVENTS_LABELS[e]}
                  </Pill>
                ))}
              </div>
            </Field>
          ) : null}

          {step === "guests" ? (
            <Field
              label="Estimated guest count"
              hint="Affects vendor sizing, stationery quantities, and logistics tasks."
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {GUESTS_OPTIONS.map((g) => (
                  <Pill
                    key={g}
                    selected={profile.guestScale === g}
                    onClick={() => setProfile({ ...profile, guestScale: g })}
                  >
                    {GUESTS_LABELS[g]}
                  </Pill>
                ))}
              </div>
            </Field>
          ) : null}

          {step === "budget" ? (
            <Field
              label="Budget tier"
              hint="Scales task complexity — modest skips niceties; luxury adds custom design, drone, live-stream, etc."
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BUDGET_OPTIONS.map((b) => (
                  <Pill
                    key={b}
                    selected={profile.budgetTier === b}
                    onClick={() => setProfile({ ...profile, budgetTier: b })}
                  >
                    {BUDGET_LABELS[b]}
                  </Pill>
                ))}
              </div>
            </Field>
          ) : null}

          {step === "location" ? (
            <Field
              label="Where is the wedding?"
              hint="Domestic city + state, or destination country. Affects travel & logistics tasks."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  placeholder="City"
                  className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  value={profile.locationCity}
                  onChange={(e) =>
                    setProfile({ ...profile, locationCity: e.target.value })
                  }
                />
                <input
                  placeholder="State / Region"
                  className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  value={profile.locationRegion}
                  onChange={(e) =>
                    setProfile({ ...profile, locationRegion: e.target.value })
                  }
                />
                <input
                  placeholder="Country"
                  className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  value={profile.locationCountry}
                  onChange={(e) =>
                    setProfile({ ...profile, locationCountry: e.target.value })
                  }
                />
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={profile.isDestination}
                  onChange={(e) =>
                    setProfile({ ...profile, isDestination: e.target.checked })
                  }
                />
                This is a destination wedding
              </label>
            </Field>
          ) : null}

          {step === "review" ? (
            <div>
              <div className="mb-4">
                <div className="font-serif text-xl text-ink">Ready to generate</div>
                <div className="mt-1 text-sm text-ink-faint">
                  Review and confirm, then we'll populate your checklist.
                </div>
              </div>
              <ReviewRow
                label="Wedding date"
                value={profile.weddingDate || "—"}
                onEdit={() => setStepIdx(steps.indexOf("date"))}
              />
              <ReviewRow
                label="Faith(s)"
                value={
                  profile.faiths.map((f) => FAITH_LABELS[f]).join(", ") || "—"
                }
                onEdit={() => setStepIdx(steps.indexOf("faiths"))}
              />
              {profile.faiths.includes("hindu") ? (
                <ReviewRow
                  label="Hindu region(s)"
                  value={
                    profile.hinduRegions
                      .map((r) => HINDU_REGION_LABELS[r])
                      .join(", ") || "—"
                  }
                  onEdit={() => setStepIdx(steps.indexOf("hindu_regions"))}
                />
              ) : null}
              {profile.faiths.length >= 2 ? (
                <ReviewRow
                  label="Blending"
                  value={
                    profile.interfaithBlending
                      ? BLENDING_LABELS[profile.interfaithBlending]
                      : "—"
                  }
                  onEdit={() => setStepIdx(steps.indexOf("interfaith"))}
                />
              ) : null}
              <ReviewRow
                label="Events"
                value={profile.eventsScale ? EVENTS_LABELS[profile.eventsScale] : "—"}
                onEdit={() => setStepIdx(steps.indexOf("events"))}
              />
              <ReviewRow
                label="Guests"
                value={profile.guestScale ? GUESTS_LABELS[profile.guestScale] : "—"}
                onEdit={() => setStepIdx(steps.indexOf("guests"))}
              />
              <ReviewRow
                label="Budget"
                value={profile.budgetTier ? BUDGET_LABELS[profile.budgetTier] : "—"}
                onEdit={() => setStepIdx(steps.indexOf("budget"))}
              />
              <ReviewRow
                label="Location"
                value={
                  [profile.locationCity, profile.locationRegion, profile.locationCountry]
                    .filter(Boolean)
                    .join(", ") || "—"
                }
                onEdit={() => setStepIdx(steps.indexOf("location"))}
              />

              {hasExistingAiTasks ? (
                <div className="mt-6 rounded-lg border border-gold/40 bg-gold-pale/20 p-3">
                  <div className="mb-2 text-sm font-medium text-ink">
                    You already have AI-generated tasks in your checklist.
                  </div>
                  <label className="flex items-start gap-2 text-sm text-ink-soft">
                    <input
                      type="radio"
                      name="replace"
                      checked={replaceExisting}
                      onChange={() => setReplaceExisting(true)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium text-ink">Replace</span> the
                      previous AI tasks with this fresh batch (recommended).
                    </span>
                  </label>
                  <label className="mt-2 flex items-start gap-2 text-sm text-ink-soft">
                    <input
                      type="radio"
                      name="replace"
                      checked={!replaceExisting}
                      onChange={() => setReplaceExisting(false)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium text-ink">Add alongside</span>{" "}
                      existing tasks (may create duplicates).
                    </span>
                  </label>
                </div>
              ) : null}

              {error ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-white px-6 py-3">
          <button
            onClick={back}
            disabled={isFirst || submitting}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-ink-faint hover:text-ink disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {isLast ? (
            <button
              onClick={handleGenerate}
              disabled={!canAdvance || submitting}
              className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold/90 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate checklist
                </>
              )}
            </button>
          ) : (
            <button
              onClick={next}
              disabled={!canAdvance}
              className="flex items-center gap-1 rounded-lg bg-ink px-4 py-1.5 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function stepValid(step: StepId, p: WeddingProfile): boolean {
  switch (step) {
    case "date":
      return !!p.weddingDate;
    case "faiths":
      return p.faiths.length > 0;
    case "hindu_regions":
      return p.hinduRegions.length > 0;
    case "interfaith":
      return !!p.interfaithBlending;
    case "events":
      return !!p.eventsScale;
    case "guests":
      return !!p.guestScale;
    case "budget":
      return !!p.budgetTier;
    case "location":
      return true;
    case "review":
      return true;
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 font-serif text-xl text-ink">{label}</div>
      {hint ? <div className="mb-4 text-sm text-ink-faint">{hint}</div> : null}
      <div>{children}</div>
    </div>
  );
}

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-2 text-sm transition-colors",
        selected
          ? "border-gold bg-gold-pale/60 text-ink"
          : "border-border bg-white text-ink-soft hover:border-ink-faint/50 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
      <div>
        <div className="text-[11px] uppercase tracking-wider text-ink-faint">
          {label}
        </div>
        <div className="text-sm text-ink">{value}</div>
      </div>
      <button
        onClick={onEdit}
        className="text-xs text-gold hover:underline"
      >
        Edit
      </button>
    </div>
  );
}
