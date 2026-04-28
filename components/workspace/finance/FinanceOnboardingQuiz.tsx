"use client";

// ── Finance onboarding quiz ───────────────────────────────────────────────
// Multi-step wizard that establishes the financial structure for the
// wedding before the couple opens the rest of the Finance module. Captures
// split model, contributors + pledges, category responsibility notes, total
// budget, and personal-expense tracking preference. Persists everything
// through the existing finance store mutations — no schema migration needed
// post-quiz.
//
// Surfaces as a full-bleed overlay; can be dismissed (skipped) or completed.
// Lives next to the canvas so the canvas can decide whether to render the
// quiz before the tabs based on `settings.onboarding.completed`.

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/finance-store";
import {
  formatDollars,
  parseDollarsToCents,
} from "@/lib/finance/format";
import type {
  FinanceContributor,
  SplitModel,
} from "@/types/finance";
import { SPLIT_MODEL_LABEL } from "@/types/finance";

interface Props {
  onClose: () => void;
}

interface DraftContributor {
  // Either an existing id (so we patch in place) or a temp_ id pending insert.
  id: string;
  name: string;
  relationship: string;
  pledged_str: string; // dollars, may be "" for TBD
  scope_note: string;
}

interface QuizDraft {
  split_model: SplitModel | null;
  contributors: DraftContributor[];
  total_budget_str: string;
  no_total_budget: boolean;
  track_personal: "yes" | "no" | "some" | null;
}

const STEP_TITLES = [
  "How are you splitting costs?",
  "Who's contributing?",
  "Category responsibilities",
  "Total wedding budget",
  "Personal expenses",
  "Review",
];

const STEP_EYEBROWS = [
  "Step 1 of 6",
  "Step 2 of 6",
  "Step 3 of 6",
  "Step 4 of 6",
  "Step 5 of 6",
  "Almost there",
];

export function FinanceOnboardingQuiz({ onClose }: Props) {
  const settings = useFinanceStore((s) => s.settings);
  const contributors = useFinanceStore((s) => s.contributors);
  const addContributor = useFinanceStore((s) => s.addContributor);
  const updateContributor = useFinanceStore((s) => s.updateContributor);
  const setTotalBudget = useFinanceStore((s) => s.setTotalBudget);
  const setOnboarding = useFinanceStore((s) => s.setOnboarding);
  const completeOnboarding = useFinanceStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<QuizDraft>(() => ({
    split_model: settings.onboarding.split_model ?? null,
    contributors: contributors.map((c) => ({
      id: c.id,
      name: c.name,
      relationship: c.relationship,
      pledged_str:
        c.pledged_cents > 0 ? (c.pledged_cents / 100).toFixed(0) : "",
      scope_note:
        settings.onboarding.category_responsibility_notes.find(
          (n) => n.contributor_id === c.id,
        )?.scope ?? c.notes ?? "",
    })),
    total_budget_str:
      settings.total_budget_cents > 0
        ? (settings.total_budget_cents / 100).toFixed(0)
        : "",
    no_total_budget: settings.total_budget_cents === 0,
    track_personal: settings.onboarding.track_personal,
  }));

  // ── Step navigation ─────────────────────────────────────────────────────
  const canAdvance = useMemo(() => {
    if (step === 0) return draft.split_model != null;
    if (step === 1) {
      return draft.contributors.length > 0 &&
        draft.contributors.every(
          (c) => c.name.trim().length > 0 && c.relationship.trim().length > 0,
        );
    }
    if (step === 3) {
      if (draft.no_total_budget) return true;
      const cents = parseDollarsToCents(draft.total_budget_str);
      return cents != null && cents > 0;
    }
    if (step === 4) return draft.track_personal != null;
    return true;
  }, [step, draft]);

  const advance = () => {
    if (step < STEP_TITLES.length - 1) setStep(step + 1);
  };
  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  // ── Final commit ────────────────────────────────────────────────────────
  const commit = () => {
    // 1. Upsert contributors. New rows get inserted; existing rows get the
    // pledged amount + relationship updated only if they actually changed.
    const persistedIds: string[] = [];
    const responsibilityNotes: Array<{
      contributor_id: string;
      scope: string;
    }> = [];
    for (const c of draft.contributors) {
      const cents = parseDollarsToCents(c.pledged_str) ?? 0;
      const isNew = c.id.startsWith("temp_");
      if (isNew) {
        const created = addContributor({
          name: c.name.trim(),
          relationship: c.relationship.trim(),
          pledged_cents: cents,
          paid_cents: 0,
          notes: c.scope_note.trim() || null,
        });
        persistedIds.push(created.id);
        if (c.scope_note.trim()) {
          responsibilityNotes.push({
            contributor_id: created.id,
            scope: c.scope_note.trim(),
          });
        }
      } else {
        updateContributor(c.id, {
          name: c.name.trim(),
          relationship: c.relationship.trim(),
          pledged_cents: cents,
          notes: c.scope_note.trim() || null,
        });
        persistedIds.push(c.id);
        if (c.scope_note.trim()) {
          responsibilityNotes.push({
            contributor_id: c.id,
            scope: c.scope_note.trim(),
          });
        }
      }
    }

    // 2. Total budget (or zero if "figure it out as we go").
    if (draft.no_total_budget) {
      setTotalBudget(0);
    } else {
      const cents = parseDollarsToCents(draft.total_budget_str);
      if (cents != null) setTotalBudget(cents);
    }

    // 3. Onboarding state
    setOnboarding({
      split_model: draft.split_model,
      has_total_budget: !draft.no_total_budget,
      track_personal: draft.track_personal,
      category_responsibility_notes: responsibilityNotes,
    });
    completeOnboarding();
    onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-ink/40 backdrop-blur-sm">
      <div className="my-8 flex w-full max-w-3xl flex-col rounded-xl border border-gold/20 bg-ivory shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-gold/15 px-8 pb-5 pt-7">
          <div className="flex-1">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {STEP_EYEBROWS[step]}
            </p>
            <h2 className="mt-2 font-serif text-[26px] leading-tight text-ink">
              {STEP_TITLES[step]}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close onboarding"
            className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-white hover:text-ink"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </header>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 border-b border-gold/10 bg-white/40 px-8 py-3">
          {STEP_TITLES.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < step
                  ? "bg-saffron"
                  : i === step
                    ? "bg-ink"
                    : "bg-ink-faint/30",
              )}
            />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          {step === 0 && (
            <SplitStep
              value={draft.split_model}
              onChange={(v) => setDraft({ ...draft, split_model: v })}
            />
          )}
          {step === 1 && (
            <ContributorsStep
              value={draft.contributors}
              onChange={(v) => setDraft({ ...draft, contributors: v })}
            />
          )}
          {step === 2 && (
            <ResponsibilitiesStep
              value={draft.contributors}
              onChange={(v) => setDraft({ ...draft, contributors: v })}
            />
          )}
          {step === 3 && (
            <BudgetStep
              value={draft.total_budget_str}
              noBudget={draft.no_total_budget}
              onChange={(value, noBudget) =>
                setDraft({
                  ...draft,
                  total_budget_str: value,
                  no_total_budget: noBudget,
                })
              }
            />
          )}
          {step === 4 && (
            <PersonalStep
              value={draft.track_personal}
              onChange={(v) => setDraft({ ...draft, track_personal: v })}
            />
          )}
          {step === 5 && <ReviewStep draft={draft} />}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-gold/15 bg-white/60 px-8 py-4">
          <button
            type="button"
            onClick={step === 0 ? onClose : back}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] text-ink-muted transition-colors hover:bg-white hover:text-ink"
          >
            <ArrowLeft size={13} strokeWidth={1.8} />
            {step === 0 ? "Skip for now" : "Back"}
          </button>
          {step < STEP_TITLES.length - 1 ? (
            <button
              type="button"
              onClick={advance}
              disabled={!canAdvance}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft",
                !canAdvance && "cursor-not-allowed opacity-50",
              )}
            >
              Continue
              <ArrowRight size={13} strokeWidth={1.8} />
            </button>
          ) : (
            <button
              type="button"
              onClick={commit}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft"
            >
              <Check size={14} strokeWidth={1.8} />
              Save and continue
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

// ── Step 1: Split model ────────────────────────────────────────────────────

const SPLIT_OPTIONS: Array<{
  value: SplitModel;
  title: string;
  description: string;
}> = [
  {
    value: "fifty_fifty",
    title: "50/50 between both families",
    description: "Bride's and groom's families each cover roughly half of the costs.",
  },
  {
    value: "primary_family",
    title: "One family is covering most",
    description: "One side is the primary contributor, with smaller pledges from the other.",
  },
  {
    value: "by_event",
    title: "Each family covers specific events",
    description: "e.g. bride's family covers Mehendi & Sangeet, groom's covers Ceremony & Reception.",
  },
  {
    value: "couple_only",
    title: "We're paying for everything ourselves",
    description: "The couple is funding the wedding without family contributions.",
  },
  {
    value: "custom",
    title: "Custom split",
    description: "Define your own percentages or amounts per contributor.",
  },
];

function SplitStep({
  value,
  onChange,
}: {
  value: SplitModel | null;
  onChange: (v: SplitModel) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-ink-muted">
        This sets the starting point — you can fine-tune individual pledges in
        the next step.
      </p>
      <div className="space-y-2">
        {SPLIT_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                active
                  ? "border-ink bg-white shadow-sm"
                  : "border-border bg-white/60 hover:border-saffron/60 hover:bg-white",
              )}
            >
              <span
                className={cn(
                  "mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  active ? "border-ink" : "border-ink-faint",
                )}
              >
                {active && <span className="h-2 w-2 rounded-full bg-ink" />}
              </span>
              <div className="flex-1">
                <p className="font-serif text-[15px] text-ink">{opt.title}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-muted">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Contributors ──────────────────────────────────────────────────

function ContributorsStep({
  value,
  onChange,
}: {
  value: DraftContributor[];
  onChange: (v: DraftContributor[]) => void;
}) {
  const addRow = () => {
    onChange([
      ...value,
      {
        id: `temp_${Math.random().toString(36).slice(2, 8)}`,
        name: "",
        relationship: "",
        pledged_str: "",
        scope_note: "",
      },
    ]);
  };
  const removeRow = (id: string) => {
    onChange(value.filter((c) => c.id !== id));
  };
  const updateRow = (id: string, patch: Partial<DraftContributor>) => {
    onChange(value.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-ink-muted">
        Add everyone contributing to the wedding fund. Pledged amount is the
        total they're committing — leave blank if it's still TBD.
      </p>
      <div className="space-y-3">
        {value.map((c, idx) => (
          <div
            key={c.id}
            className="rounded-lg border border-border bg-white p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Contributor {idx + 1}
              </p>
              <button
                type="button"
                onClick={() => removeRow(c.id)}
                aria-label="Remove contributor"
                className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-rose"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <FieldInput
                label="Name"
                placeholder="e.g. Shalini & Vikram Patel"
                value={c.name}
                onChange={(v) => updateRow(c.id, { name: v })}
              />
              <FieldInput
                label="Relationship"
                placeholder="e.g. Bride's parents"
                value={c.relationship}
                onChange={(v) => updateRow(c.id, { relationship: v })}
              />
              <FieldDollar
                label="Pledged (USD)"
                placeholder="TBD"
                value={c.pledged_str}
                onChange={(v) => updateRow(c.id, { pledged_str: v })}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-white/60 px-4 py-2 text-[12.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
      >
        <Plus size={13} strokeWidth={1.8} />
        Add another contributor
      </button>
    </div>
  );
}

// ── Step 3: Responsibilities (per-contributor scope notes) ────────────────

function ResponsibilitiesStep({
  value,
  onChange,
}: {
  value: DraftContributor[];
  onChange: (v: DraftContributor[]) => void;
}) {
  const updateRow = (id: string, patch: Partial<DraftContributor>) => {
    onChange(value.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-ink-muted">
        Are there specific events or categories that a particular family or
        person is solely responsible for? Add a quick note per contributor —
        examples: "Covering venue + catering", "Mehendi & Sangeet only",
        "Photography and videography".
      </p>
      <div className="space-y-3">
        {value.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-border bg-white p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-serif text-[15px] text-ink">
                  {c.name || "(Unnamed contributor)"}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {c.relationship || "—"}
                </p>
              </div>
              {c.pledged_str && (
                <span
                  className="font-mono text-[11px] tabular-nums text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Pledged ${Number(c.pledged_str).toLocaleString()}
                </span>
              )}
            </div>
            <textarea
              value={c.scope_note}
              onChange={(e) => updateRow(c.id, { scope_note: e.target.value })}
              placeholder="What are they covering? Leave blank if it's flexible."
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-ivory/40 px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-ink focus:bg-white focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 4: Total budget ──────────────────────────────────────────────────

function BudgetStep({
  value,
  noBudget,
  onChange,
}: {
  value: string;
  noBudget: boolean;
  onChange: (value: string, noBudget: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-[14px] leading-relaxed text-ink-muted">
        Setting a target helps the budget stack and category allocations align.
        You can change this any time from Settings.
      </p>
      <div>
        <label
          className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Total wedding budget (USD)
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-3">
          <span className="font-serif text-[24px] text-ink-faint">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={value}
            disabled={noBudget}
            onChange={(e) =>
              onChange(e.target.value.replace(/[^0-9,.]/g, ""), false)
            }
            placeholder="500,000"
            className={cn(
              "w-full bg-transparent font-serif text-[24px] tabular-nums text-ink placeholder:text-ink-faint focus:outline-none",
              noBudget && "opacity-40",
            )}
          />
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-md border border-border bg-white/60 px-4 py-3 text-[13px] text-ink hover:bg-white">
        <input
          type="checkbox"
          checked={noBudget}
          onChange={(e) => onChange(value, e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-ink"
        />
        <span>
          <span className="block font-medium text-ink">
            We'll figure it out as we go
          </span>
          <span className="mt-0.5 block text-[12px] text-ink-muted">
            Skip the cap. The budget tab still tracks spend, just without a
            target ceiling.
          </span>
        </span>
      </label>
    </div>
  );
}

// ── Step 5: Personal expense tracking ─────────────────────────────────────

function PersonalStep({
  value,
  onChange,
}: {
  value: "yes" | "no" | "some" | null;
  onChange: (v: "yes" | "no" | "some") => void;
}) {
  const opts: Array<{
    value: "yes" | "no" | "some";
    title: string;
    description: string;
  }> = [
    {
      value: "yes",
      title: "Yes — track personal expenses too",
      description:
        "Each contributor can log outfits, jewelry, grooming, etc. as personal expenses that don't draw from the shared fund.",
    },
    {
      value: "some",
      title: "Some contributors do",
      description:
        "Personal tracking is available, but only certain contributors will use it.",
    },
    {
      value: "no",
      title: "No — shared fund only",
      description:
        "Keep things simple. Only the pooled wedding fund is tracked; personal spend is out of scope.",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-ink-muted">
        Some people buy things for the wedding on their own — outfits, jewelry,
        personal grooming — that don't come from the shared fund. Do you want
        to track those alongside the shared spend?
      </p>
      <div className="space-y-2">
        {opts.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                active
                  ? "border-ink bg-white shadow-sm"
                  : "border-border bg-white/60 hover:border-saffron/60 hover:bg-white",
              )}
            >
              <span
                className={cn(
                  "mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  active ? "border-ink" : "border-ink-faint",
                )}
              >
                {active && <span className="h-2 w-2 rounded-full bg-ink" />}
              </span>
              <div className="flex-1">
                <p className="font-serif text-[15px] text-ink">{opt.title}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-muted">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 6: Review ────────────────────────────────────────────────────────

function ReviewStep({ draft }: { draft: QuizDraft }) {
  const totalPledged = draft.contributors.reduce(
    (s, c) => s + (parseDollarsToCents(c.pledged_str) ?? 0),
    0,
  );
  const totalBudgetCents = draft.no_total_budget
    ? 0
    : (parseDollarsToCents(draft.total_budget_str) ?? 0);
  const personalLabel =
    draft.track_personal === "yes"
      ? "All contributors track personal expenses"
      : draft.track_personal === "some"
        ? "Some contributors track personal expenses"
        : draft.track_personal === "no"
          ? "Shared fund only"
          : "—";

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-sage/40 bg-sage/5 px-4 py-3">
        <Sparkles size={16} strokeWidth={1.8} className="mt-1 text-sage" />
        <p className="text-[13px] leading-relaxed text-ink">
          Here's what we'll set up. You can edit any of this from the Finance
          settings later.
        </p>
      </div>

      <ReviewRow label="Split model">
        {draft.split_model
          ? SPLIT_MODEL_LABEL[draft.split_model]
          : "—"}
      </ReviewRow>

      <ReviewRow label="Contributors">
        <ul className="space-y-1">
          {draft.contributors.map((c) => {
            const cents = parseDollarsToCents(c.pledged_str) ?? 0;
            return (
              <li
                key={c.id}
                className="flex items-baseline justify-between gap-3 text-[13px]"
              >
                <span className="text-ink">
                  {c.name}
                  <span className="text-ink-muted"> · {c.relationship}</span>
                </span>
                <span
                  className="font-mono text-[12px] tabular-nums text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {cents > 0 ? formatDollars(cents) : "TBD"}
                </span>
              </li>
            );
          })}
        </ul>
        <p
          className="mt-2 border-t border-border pt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Total pledged · {formatDollars(totalPledged)}
        </p>
      </ReviewRow>

      <ReviewRow label="Responsibilities">
        {draft.contributors.some((c) => c.scope_note.trim()) ? (
          <ul className="space-y-1.5 text-[13px]">
            {draft.contributors
              .filter((c) => c.scope_note.trim())
              .map((c) => (
                <li key={c.id}>
                  <span className="text-ink">{c.name}:</span>{" "}
                  <span className="text-ink-muted">{c.scope_note}</span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-[12.5px] text-ink-muted">
            No specific category responsibilities set.
          </p>
        )}
      </ReviewRow>

      <ReviewRow label="Total budget">
        {draft.no_total_budget
          ? "Open — no hard cap"
          : formatDollars(totalBudgetCents)}
      </ReviewRow>

      <ReviewRow label="Personal expense tracking">
        {personalLabel}
      </ReviewRow>
    </div>
  );
}

function ReviewRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3">
      <p
        className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <div className="text-[13.5px] text-ink">{children}</div>
    </div>
  );
}

// ── Field primitives ──────────────────────────────────────────────────────

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-ivory/40 px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-ink focus:bg-white focus:outline-none"
      />
    </label>
  );
}

function FieldDollar({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1 rounded-md border border-border bg-ivory/40 px-3 py-2 focus-within:border-ink focus-within:bg-white">
        <span className="text-ink-faint">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9,.]/g, ""))}
          placeholder={placeholder}
          className="w-full bg-transparent text-right font-mono text-[12.5px] tabular-nums text-ink placeholder:text-ink-faint focus:outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </div>
    </label>
  );
}
