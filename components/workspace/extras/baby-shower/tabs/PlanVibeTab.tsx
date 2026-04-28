"use client";

// ── Plan & Vibe tab ────────────────────────────────────────────────────────
// Captures preferences, constraints, and the shower's personality so the
// Discover tab can rank themes & experiences. Sections: Basics · Vibe ·
// Venue · Season · Hard No's · Things That Feel Like Us.

import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyShowerStore } from "@/stores/baby-shower-store";
import {
  GUEST_MIX_OPTIONS,
  GUEST_TIER_OPTIONS,
  HARD_NO_OPTIONS,
  PLANNER_ROLE_OPTIONS,
  SEASON_OPTIONS,
  VENUE_OPTIONS,
  VIBE_OPTIONS,
  FORMAL_VENUE_TYPES,
} from "@/lib/baby-shower-seed";
import {
  ChipList,
  FieldRow,
  InlineAdd,
  Label,
  Section,
  TextArea,
  TextInput,
} from "../../bachelorette/ui";

export function PlanVibeTab({
  onGoToDiscover,
}: {
  onGoToDiscover: () => void;
}) {
  const plan = useBabyShowerStore((s) => s.plan);
  const hasVibe = plan.vibes.length > 0 && plan.venueType !== null;

  return (
    <div className="space-y-5">
      {hasVibe && <PlanSummary onGoToDiscover={onGoToDiscover} />}
      <BasicsSection />
      <VibeSection />
      <VenueSection />
      <SeasonAndHardNos />
      <FeelLikeUsSection />
    </div>
  );
}

// ── Summary card ──────────────────────────────────────────────────────────

function PlanSummary({ onGoToDiscover }: { onGoToDiscover: () => void }) {
  const plan = useBabyShowerStore((s) => s.plan);

  const vibeLabels = plan.vibes
    .map((v) => VIBE_OPTIONS.find((o) => o.value === v))
    .filter(Boolean)
    .map((o) => `${o!.emoji} ${o!.label}`);
  const venue = VENUE_OPTIONS.find((o) => o.value === plan.venueType);
  const tier = GUEST_TIER_OPTIONS.find((o) => o.value === plan.guestTier);

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
            Your shower at a glance
          </p>
          <h3 className="mt-1.5 font-serif text-[17px] leading-tight text-ink">
            {vibeLabels.length > 0
              ? vibeLabels.slice(0, 2).join(" + ")
              : "A shower that feels like yours"}
          </h3>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-2 md:grid-cols-3">
        {venue && <SummaryItem label="Venue" value={venue.label} />}
        {tier && <SummaryItem label="Guest count" value={tier.label} />}
        {plan.showerDate && (
          <SummaryItem label="Shower date" value={plan.showerDate} />
        )}
        {plan.dueDate && <SummaryItem label="Due date" value={plan.dueDate} />}
        {plan.season && (
          <SummaryItem
            label="Season"
            value={
              SEASON_OPTIONS.find((o) => o.value === plan.season)?.label ?? ""
            }
          />
        )}
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Next → themes tuned to this brief
        </p>
        <button
          type="button"
          onClick={onGoToDiscover}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          See themes
          <ArrowRight size={12} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
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

// ── Basics ────────────────────────────────────────────────────────────────

function BasicsSection() {
  const parentName = useBabyShowerStore((s) => s.parentName);
  const setParentName = useBabyShowerStore((s) => s.setParentName);
  const plan = useBabyShowerStore((s) => s.plan);
  const updatePlan = useBabyShowerStore((s) => s.updatePlan);

  return (
    <Section
      eyebrow="THE BASICS"
      title="Dates, planner, and the guest shape"
      description="Editable any time — Discover re-scores as these change."
    >
      <div className="divide-y divide-border/60">
        <FieldRow label="Parent-to-be">
          <TextInput
            value={parentName}
            onChange={setParentName}
            placeholder="Name of the parent-to-be"
          />
        </FieldRow>
        <FieldRow label="Due date">
          <TextInput
            value={plan.dueDate}
            onChange={(v) => updatePlan({ dueDate: v })}
            placeholder="e.g. Saturday, September 5, 2026"
          />
        </FieldRow>
        <FieldRow label="Shower date">
          <TextInput
            value={plan.showerDate}
            onChange={(v) => updatePlan({ showerDate: v })}
            placeholder="e.g. Sunday, July 19, 2026"
          />
        </FieldRow>
        <FieldRow label="Who's planning">
          <select
            value={plan.plannerRole ?? ""}
            onChange={(e) =>
              updatePlan({
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
        <FieldRow label="Guest count">
          <div className="flex flex-wrap gap-1.5">
            {GUEST_TIER_OPTIONS.map((opt) => {
              const active = plan.guestTier === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updatePlan({ guestTier: active ? null : opt.value })
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
        <FieldRow label="Guest mix">
          <div className="flex flex-wrap gap-1.5">
            {GUEST_MIX_OPTIONS.map((opt) => {
              const active = plan.guestMix === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updatePlan({ guestMix: active ? null : opt.value })
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
        <FieldRow label="Surprise?">
          <label className="inline-flex items-center gap-2 text-[13px] text-ink-muted">
            <input
              type="checkbox"
              checked={plan.isSurprise}
              onChange={(e) =>
                updatePlan({ isSurprise: e.target.checked })
              }
              className="h-4 w-4 rounded border-border text-ink focus:ring-saffron/40"
            />
            Don't tell the parent(s)-to-be
          </label>
        </FieldRow>
      </div>
    </Section>
  );
}

// ── Vibe ──────────────────────────────────────────────────────────────────

function VibeSection() {
  const plan = useBabyShowerStore((s) => s.plan);
  const toggleVibe = useBabyShowerStore((s) => s.toggleVibe);

  return (
    <Section
      eyebrow="VIBE"
      title="Pick what feels right"
      description="Multi-select. Each vibe shifts what Discover recommends — pick 1–3 for the strongest signal."
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
        {VIBE_OPTIONS.map((opt) => {
          const active = plan.vibes.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleVibe(opt.value)}
              className={cn(
                "group flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                active
                  ? "border-ink bg-ivory-warm/40 shadow-sm"
                  : "border-border bg-white hover:border-saffron/40",
              )}
            >
              <span className="font-serif text-[15px] leading-tight text-ink">
                {opt.emoji} {opt.label}
              </span>
              <span className="text-[12px] leading-snug text-ink-muted">
                {opt.blurb}
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

// ── Venue ─────────────────────────────────────────────────────────────────

function VenueSection() {
  const plan = useBabyShowerStore((s) => s.plan);
  const updatePlan = useBabyShowerStore((s) => s.updatePlan);
  const isFormal =
    plan.venueType !== null && FORMAL_VENUE_TYPES.includes(plan.venueType);

  return (
    <Section
      eyebrow="VENUE"
      title="Where it's happening"
      description="Discover adapts to your venue — home gets DIY-friendly themes, banquet halls get grand decor with vendor recommendations."
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {VENUE_OPTIONS.map((opt) => {
          const active = plan.venueType === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                updatePlan({ venueType: active ? null : opt.value })
              }
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors",
                active
                  ? "border-ink bg-ivory-warm/40"
                  : "border-border bg-white hover:border-saffron/40",
              )}
            >
              <span className="text-[15px]">{opt.emoji}</span>
              <span className="text-[13px] text-ink">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {isFormal && (
        <div className="mt-4 divide-y divide-border/60 rounded-md border border-border/60 bg-ivory-warm/30 p-4">
          <FieldRow label="Venue name">
            <TextInput
              value={plan.venueName}
              onChange={(v) => updatePlan({ venueName: v })}
              placeholder="If already booked"
            />
          </FieldRow>
          <FieldRow label="Capacity">
            <TextInput
              value={plan.venueCapacity}
              onChange={(v) => updatePlan({ venueCapacity: v })}
              placeholder="e.g. 80 seated"
            />
          </FieldRow>
          <FieldRow label="Catering included">
            <select
              value={plan.cateringIncluded ?? ""}
              onChange={(e) =>
                updatePlan({
                  cateringIncluded: (e.target.value || null) as any,
                })
              }
              className="rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
            >
              <option value="">—</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="unsure">Not sure</option>
            </select>
          </FieldRow>
          <FieldRow label="AV / sound">
            <select
              value={plan.avAvailable ?? ""}
              onChange={(e) =>
                updatePlan({
                  avAvailable: (e.target.value || null) as any,
                })
              }
              className="rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
            >
              <option value="">—</option>
              <option value="yes">Available</option>
              <option value="no">Bring our own</option>
              <option value="unsure">Not sure</option>
            </select>
          </FieldRow>
          <FieldRow label="Restrictions">
            <TextArea
              value={plan.venueRestrictions}
              onChange={(v) => updatePlan({ venueRestrictions: v })}
              placeholder="Some venues restrict candles, confetti, wall mounting, etc."
              rows={2}
            />
          </FieldRow>
        </div>
      )}
    </Section>
  );
}

// ── Season + Hard No's ────────────────────────────────────────────────────

function SeasonAndHardNos() {
  const plan = useBabyShowerStore((s) => s.plan);
  const updatePlan = useBabyShowerStore((s) => s.updatePlan);
  const toggleHardNo = useBabyShowerStore((s) => s.toggleHardNo);

  return (
    <Section
      eyebrow="SEASON & HARD NO'S"
      title="What to avoid — and what to work around"
    >
      <div className="space-y-5">
        <div>
          <Label>SEASON</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SEASON_OPTIONS.map((opt) => {
              const active = plan.season === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updatePlan({ season: active ? null : opt.value })
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
        </div>

        <div>
          <Label>HARD NO'S</Label>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {HARD_NO_OPTIONS.map((opt) => {
              const active = plan.hardNos.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleHardNo(opt.value)}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-md border p-3 text-left transition-colors",
                    active
                      ? "border-rose/50 bg-rose-pale/30"
                      : "border-border bg-white hover:border-saffron/40",
                  )}
                >
                  <span className="text-[13px] text-ink">
                    {active ? "✕ " : ""}
                    {opt.label}
                  </span>
                  <span className="text-[11.5px] text-ink-muted">
                    {opt.blurb}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="divide-y divide-border/60">
          <FieldRow label="Dietary notes">
            <TextInput
              value={plan.dietaryRestrictions}
              onChange={(v) => updatePlan({ dietaryRestrictions: v })}
              placeholder="Group-wide notes (individuals tracked on guest list)"
            />
          </FieldRow>
          <FieldRow label="Accessibility">
            <TextInput
              value={plan.accessibilityNeeds}
              onChange={(v) => updatePlan({ accessibilityNeeds: v })}
              placeholder="e.g. Shaded seating, wheelchair access, quiet nursing corner"
            />
          </FieldRow>
          <FieldRow label="Budget ceiling">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-ink-muted">$</span>
              <TextInput
                type="number"
                value={String(plan.budgetCeilingCents / 100)}
                onChange={(v) =>
                  updatePlan({
                    budgetCeilingCents: Math.round(Number(v) * 100 || 0),
                  })
                }
                className="max-w-[180px]"
              />
              <span className="text-[12px] text-ink-faint">
                (soft cap — Discover filters accordingly)
              </span>
            </div>
          </FieldRow>
        </div>
      </div>
    </Section>
  );
}

// ── Things That Feel Like Us ──────────────────────────────────────────────

function FeelLikeUsSection() {
  const plan = useBabyShowerStore((s) => s.plan);
  const addPhrase = useBabyShowerStore((s) => s.addPersonalPhrase);
  const removePhrase = useBabyShowerStore((s) => s.removePersonalPhrase);

  return (
    <Section
      eyebrow="THINGS THAT FEEL LIKE US"
      title="What makes this family yours?"
      description="One specific detail shifts what we recommend. 'We're obsessed with board games,' 'our friend group speaks in memes,' 'Partner's family is huge and loud and we love it.'"
    >
      <ChipList
        items={plan.thingsThatFeelLikeUs}
        onRemove={removePhrase}
        emptyLabel="Nothing added yet."
      />
      <InlineAdd
        placeholder="e.g. Priya's mom's mithai recipes have to be on the menu"
        onAdd={addPhrase}
      />
    </Section>
  );
}
