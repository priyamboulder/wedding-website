"use client";

// ── Bride Brief tab ────────────────────────────────────────────────────────
// The planner's articulation layer: quiz entry, brief summary, specific
// bride preferences (loves/dislikes/colors/registry), and a CTA to the
// Concepts tab once the brief is filled.

import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBridalShowerStore } from "@/stores/bridal-shower-store";
import {
  BUDGET_TIER_OPTIONS,
  CONTRIBUTION_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  FORMAT_OPTIONS,
  GUEST_COMPOSITION_OPTIONS,
  GUEST_COUNT_OPTIONS,
  PERSONALITY_OPTIONS,
  PLANNER_ROLE_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  VENUE_OPTIONS,
} from "@/lib/bridal-shower-seed";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { bridalShowerBriefQuiz } from "@/lib/quiz/schemas/bridal-shower-brief";
import {
  ChipList,
  FieldRow,
  InlineAdd,
  Label,
  Section,
  TextInput,
} from "../../bachelorette/ui";

export function BrideBriefTab({
  onGoToConcepts,
}: {
  onGoToConcepts: () => void;
}) {
  const brief = useBridalShowerStore((s) => s.brief);
  const hasBrief = brief.bridePersonality.length > 0 && brief.format !== null;

  return (
    <div className="space-y-5">
      <QuizEntryCard
        schema={bridalShowerBriefQuiz}
        categoryId="bridal_shower"
      />
      {hasBrief && <BriefSummary onGoToConcepts={onGoToConcepts} />}
      <BriefBasics />
      <BridePreferencesSection />
    </div>
  );
}

// ── Brief summary card ─────────────────────────────────────────────────────

function BriefSummary({ onGoToConcepts }: { onGoToConcepts: () => void }) {
  const brief = useBridalShowerStore((s) => s.brief);

  const personalities = brief.bridePersonality
    .map((p) => PERSONALITY_OPTIONS.find((o) => o.value === p))
    .filter(Boolean);
  const format = FORMAT_OPTIONS.find((o) => o.value === brief.format);
  const venue = VENUE_OPTIONS.find((o) => o.value === brief.venueType);
  const count = GUEST_COUNT_OPTIONS.find((o) => o.value === brief.guestCount);
  const budget = BUDGET_TIER_OPTIONS.find(
    (o) => o.value === brief.budgetTier,
  );
  const composition = brief.guestComposition
    .map((c) => GUEST_COMPOSITION_OPTIONS.find((o) => o.value === c)?.label)
    .filter(Boolean) as string[];
  const planner = PLANNER_ROLE_OPTIONS.find(
    (o) => o.value === brief.plannerRole,
  );

  const primaryPersonality = personalities[0];

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles
              size={10}
              strokeWidth={1.8}
              className="mr-1 inline-block align-[-1px]"
            />
            Your bride brief
          </p>
          <h3 className="mt-1.5 font-serif text-[17px] leading-tight text-ink">
            {primaryPersonality
              ? `${primaryPersonality.emoji} ${primaryPersonality.label} — ${primaryPersonality.blurb}`
              : "A shower tuned to who she really is"}
          </h3>
        </div>
        <QuizRetakeLink
          schema={bridalShowerBriefQuiz}
          categoryId="bridal_shower"
        />
      </div>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-2 md:grid-cols-3">
        {planner && (
          <SummaryItem label="Your role" value={planner.label} />
        )}
        {format && (
          <SummaryItem label="Format" value={`${format.emoji} ${format.label}`} />
        )}
        {venue && <SummaryItem label="Venue" value={venue.label} />}
        {count && <SummaryItem label="Guest count" value={count.label} />}
        {budget && (
          <SummaryItem label="Budget" value={budget.label} />
        )}
      </dl>

      {composition.length > 0 && (
        <div className="mt-4 border-t border-border/60 pt-3">
          <p
            className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Guest mix
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {composition.map((l) => (
              <li
                key={l}
                className="rounded-full border border-border bg-ivory-warm/60 px-2.5 py-0.5 text-[11.5px] text-ink-muted"
              >
                {l}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Next → concepts tuned to this brief
        </p>
        <button
          type="button"
          onClick={onGoToConcepts}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          See concepts
          <ArrowRight size={12} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col">
      <dt
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd className="text-[13px] text-ink">{value}</dd>
    </div>
  );
}

// ── Basics (editable fields — date, day, city, etc.) ──────────────────────

function BriefBasics() {
  const brief = useBridalShowerStore((s) => s.brief);
  const brideName = useBridalShowerStore((s) => s.brideName);
  const setBrideName = useBridalShowerStore((s) => s.setBrideName);
  const updateBrief = useBridalShowerStore((s) => s.updateBrief);

  return (
    <Section
      eyebrow="THE DETAILS"
      title="When, where, and who's planning"
      description="Editable at any time — the Concepts tab re-filters as you change these."
    >
      <div className="divide-y divide-border/60">
        <FieldRow label="Bride">
          <TextInput
            value={brideName}
            onChange={setBrideName}
            placeholder="Bride's name"
          />
        </FieldRow>
        <FieldRow label="Your role">
          <select
            value={brief.plannerRole ?? ""}
            onChange={(e) =>
              updateBrief({
                plannerRole: (e.target.value || null) as any,
              })
            }
            className="rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
          >
            <option value="">—</option>
            {PLANNER_ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="Target date">
          <TextInput
            value={brief.dateTarget}
            onChange={(v) => updateBrief({ dateTarget: v })}
            placeholder="e.g. Saturday, May 16, 2026"
          />
        </FieldRow>
        <FieldRow label="Day of week">
          <div className="flex flex-wrap gap-1.5">
            {DAY_OF_WEEK_OPTIONS.map((opt) => {
              const active = brief.dayOfWeek === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updateBrief({ dayOfWeek: active ? null : opt.value })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-[12px] transition-colors",
                    active
                      ? "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </FieldRow>
        <FieldRow label="Time of day">
          <div className="flex flex-wrap gap-1.5">
            {TIME_OF_DAY_OPTIONS.map((opt) => {
              const active = brief.timeOfDay === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updateBrief({ timeOfDay: active ? null : opt.value })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-[12px] transition-colors",
                    active
                      ? "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </FieldRow>
        <FieldRow label="City">
          <TextInput
            value={brief.city}
            onChange={(v) => updateBrief({ city: v })}
            placeholder="City, state"
          />
        </FieldRow>
        <FieldRow label="Contribution">
          <select
            value={brief.contribution ?? ""}
            onChange={(e) =>
              updateBrief({
                contribution: (e.target.value || null) as any,
              })
            }
            className="rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
          >
            <option value="">—</option>
            {CONTRIBUTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldRow>
      </div>
    </Section>
  );
}

// ── Bride preferences (loves, dislikes, colors, registry) ─────────────────

function BridePreferencesSection() {
  const prefs = useBridalShowerStore((s) => s.preferences);
  const addPref = useBridalShowerStore((s) => s.addPref);
  const removePref = useBridalShowerStore((s) => s.removePref);
  const updatePrefs = useBridalShowerStore((s) => s.updatePrefs);

  return (
    <Section
      eyebrow="HER SPECIFIC PREFERENCES"
      title="What she'd love — and what she'd quietly hate"
      description="Even one specific detail transforms what we recommend. 'She's obsessed with lemons' or 'she hates party games' goes a long way."
    >
      <div className="space-y-5">
        <div>
          <Label>SHE'D LOVE</Label>
          <div className="mt-2">
            <ChipList
              items={prefs.loves}
              onRemove={(i) => removePref("loves", i)}
              emptyLabel="Nothing added yet."
            />
            <InlineAdd
              placeholder="e.g. A long table with everyone together"
              onAdd={(v) => addPref("loves", v)}
            />
          </div>
        </div>

        <div>
          <Label>PLEASE NO</Label>
          <div className="mt-2">
            <ChipList
              items={prefs.dislikes}
              onRemove={(i) => removePref("dislikes", i)}
              emptyLabel="Nothing added yet."
            />
            <InlineAdd
              placeholder="e.g. No shower games, no opening gifts in front of everyone"
              onAdd={(v) => addPref("dislikes", v)}
            />
          </div>
        </div>

        <div className="divide-y divide-border/60">
          <FieldRow label="Wedding colors">
            <TextInput
              value={prefs.weddingColors}
              onChange={(v) => updatePrefs({ weddingColors: v })}
              placeholder="For loose coordination — shower should complement, not match"
            />
          </FieldRow>
          <FieldRow label="Registered at">
            <TextInput
              value={prefs.registryAt}
              onChange={(v) => updatePrefs({ registryAt: v })}
              placeholder="e.g. Crate & Barrel, Anthropologie Home"
            />
          </FieldRow>
        </div>
      </div>
    </Section>
  );
}
