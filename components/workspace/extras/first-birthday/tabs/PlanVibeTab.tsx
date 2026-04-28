"use client";

// ── Plan & Vibe tab ───────────────────────────────────────────────────────
// Captures the family's vision, cultural context, kid-safety signals, and
// emotional register. Feeds the Discover ranking engine + Discover mode
// detection. Conditional ceremony section appears when the family's vibes
// or traditions imply a cultural ceremony.

import { ArrowRight, Check, Heart, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirstBirthdayStore } from "@/stores/first-birthday-store";
import {
  CEREMONY_INTEGRATION_OPTIONS,
  CEREMONY_TRADITION_OPTIONS,
  DURATION_OPTIONS,
  GUEST_MIX_OPTIONS,
  GUEST_TIER_OPTIONS,
  HARD_NO_OPTIONS,
  KID_AGE_RANGE_OPTIONS,
  OFFICIANT_OPTIONS,
  VENUE_TYPE_OPTIONS,
  VIBE_OPTIONS,
  deriveDiscoverMode,
} from "@/lib/first-birthday-seed";
import type {
  AllergySeverity,
  FirstBirthdayCeremonyIntegration,
  FirstBirthdayCeremonyTradition,
  FirstBirthdayDuration,
  FirstBirthdayGuestMix,
  FirstBirthdayGuestTier,
  FirstBirthdayHardNo,
  FirstBirthdayKidAgeRange,
  FirstBirthdayOfficiant,
  FirstBirthdayVenueType,
  FirstBirthdayVibe,
} from "@/types/first-birthday";
import {
  FieldRow,
  Label,
  Section,
  TextArea,
  TextInput,
} from "../../bachelorette/ui";
import { useState } from "react";

interface Props {
  onGoToDiscover: () => void;
}

export function PlanVibeTab({ onGoToDiscover }: Props) {
  const plan = useFirstBirthdayStore((s) => s.plan);
  const showCeremonySection =
    plan.vibes.includes("cultural_ceremony") ||
    plan.vibes.includes("combined_ceremony_party");

  return (
    <div className="space-y-5">
      <OpenerCard onGoToDiscover={onGoToDiscover} />
      <Basics />
      <VibePicker />
      {showCeremonySection && <CeremonySection />}
      <VenuePreference />
      <KidSafety />
      <HardNos />
      <WhatThisYearHasMeant />
    </div>
  );
}

// ── Opener ─────────────────────────────────────────────────────────────────

function OpenerCard({ onGoToDiscover }: { onGoToDiscover: () => void }) {
  const plan = useFirstBirthdayStore((s) => s.plan);
  const ceremony = useFirstBirthdayStore((s) => s.ceremony);
  const mode = deriveDiscoverMode(plan.vibes, plan.discoverModeOverride);
  const ready = plan.vibes.length > 0;

  const modeCopy: Record<string, string> = {
    party: "Party mode — themes, activities, menus, vendors",
    ceremony: "Ceremony mode — ritual guides and setup checklists",
    combined: "Combined mode — ceremony guides first, party ideas after",
    grand: "Grand mode — venue-scale themes and professional vendors",
  };

  const babyName = plan.babyName.trim() || "your baby";

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
        {babyName}'s first birthday
      </p>
      <h3 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">
        One whole year.
      </h3>
      <h3 className="font-serif text-[22px] leading-tight text-ink-muted">
        You did it — now plan something that feels like yours.
      </h3>
      <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink-muted">
        Whether it's a backyard cake smash, a traditional ceremony, or a ballroom
        full of family — tell us the shape of the day and we'll find ideas that
        honor your traditions and your kid's nap schedule.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
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
          {ready ? "See your matches" : "Pick at least one vibe first"}
          <ArrowRight size={12} strokeWidth={2} />
        </button>
        {ready && (
          <p className="text-[11.5px] text-ink-muted">
            {modeCopy[mode]}
            {ceremony.traditions.length > 0
              ? ` · ${ceremony.traditions.length} tradition${ceremony.traditions.length === 1 ? "" : "s"}`
              : ""}
          </p>
        )}
      </div>
    </section>
  );
}

// ── Basics ─────────────────────────────────────────────────────────────────

function Basics() {
  const plan = useFirstBirthdayStore((s) => s.plan);
  const updatePlan = useFirstBirthdayStore((s) => s.updatePlan);

  return (
    <Section
      eyebrow="THE BASICS"
      title="Who, when, and how big"
      description="Anchor the day — everything else ranks against these inputs."
    >
      <div className="divide-y divide-border/60">
        <FieldRow label="Baby's name">
          <TextInput
            value={plan.babyName}
            onChange={(v) => updatePlan({ babyName: v })}
            placeholder="e.g. Arya"
          />
        </FieldRow>
        <FieldRow label="Birthday date">
          <TextInput
            value={plan.birthdayDate}
            onChange={(v) => updatePlan({ birthdayDate: v })}
            placeholder="e.g. October 10, 2026"
          />
        </FieldRow>
        <FieldRow label="Party date">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <TextInput
              value={plan.partyDate}
              onChange={(v) => updatePlan({ partyDate: v })}
              placeholder="e.g. October 10, 2026"
            />
            <TextInput
              value={plan.partyWindow}
              onChange={(v) => updatePlan({ partyWindow: v })}
              placeholder='Window ("On the day", nearest weekend…)'
            />
          </div>
        </FieldRow>
        <FieldRow label="Duration">
          <div className="flex flex-col gap-1.5">
            {DURATION_OPTIONS.map((opt) => {
              const active = plan.duration === opt.value;
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
                    name="fb-duration"
                    checked={active}
                    onChange={() =>
                      updatePlan({ duration: opt.value as FirstBirthdayDuration })
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
        <FieldRow label="Guest count">
          <div className="flex flex-wrap gap-1.5">
            {GUEST_TIER_OPTIONS.map((opt) => {
              const active = plan.guestTier === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updatePlan({
                      guestTier: active
                        ? null
                        : (opt.value as FirstBirthdayGuestTier),
                    })
                  }
                  className={cn(
                    "flex flex-col items-start rounded-md border px-3 py-2 text-left transition-colors",
                    active
                      ? "border-ink bg-ink/5"
                      : "border-border bg-white hover:border-saffron/40",
                  )}
                >
                  <span className="text-[12.5px] text-ink">{opt.label}</span>
                  <span className="text-[11px] text-ink-muted">{opt.range}</span>
                </button>
              );
            })}
          </div>
        </FieldRow>
        <FieldRow label="Guest mix">
          <div className="flex flex-col gap-1.5">
            {GUEST_MIX_OPTIONS.map((opt) => {
              const active = plan.guestMix === opt.value;
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
                    name="fb-guest-mix"
                    checked={active}
                    onChange={() =>
                      updatePlan({
                        guestMix: opt.value as FirstBirthdayGuestMix,
                      })
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
  const vibes = useFirstBirthdayStore((s) => s.plan.vibes);
  const toggleVibe = useFirstBirthdayStore((s) => s.toggleVibe);

  return (
    <Section
      eyebrow="YOUR VIBE"
      title="What are you picturing?"
      description="Multi-select — the algorithm blends them. Don't overthink it."
    >
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {VIBE_OPTIONS.map((opt) => {
          const active = vibes.includes(opt.value as FirstBirthdayVibe);
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => toggleVibe(opt.value as FirstBirthdayVibe)}
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

// ── Ceremony section (conditional) ────────────────────────────────────────

function CeremonySection() {
  const ceremony = useFirstBirthdayStore((s) => s.ceremony);
  const updateCeremony = useFirstBirthdayStore((s) => s.updateCeremony);
  const toggleTradition = useFirstBirthdayStore((s) => s.toggleTradition);

  return (
    <Section
      eyebrow="CULTURAL CEREMONY"
      title="Which traditions are you honoring?"
      description="Here's the general shape — your family may have its own variations, and that's exactly right."
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {CEREMONY_TRADITION_OPTIONS.map((opt) => {
          const active = ceremony.traditions.includes(
            opt.value as FirstBirthdayCeremonyTradition,
          );
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                toggleTradition(opt.value as FirstBirthdayCeremonyTradition)
              }
              aria-pressed={active}
              className={cn(
                "flex items-start gap-2 rounded-md border px-3 py-2 text-left transition-colors",
                active
                  ? "border-ink bg-ink/5"
                  : "border-border bg-white hover:border-saffron/40",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active
                    ? "border-ink bg-ink text-ivory"
                    : "border-border bg-white text-transparent",
                )}
              >
                <Check size={9} strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-[13px] text-ink">{opt.label}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {opt.blurb}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <Label>Other tradition (describe)</Label>
        <div className="mt-1.5">
          <TextInput
            value={ceremony.otherTraditionText}
            onChange={(v) => updateCeremony({ otherTraditionText: v })}
            placeholder="Your family's ceremony — what to call it and what it looks like…"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Officiant / pandit / priest?</Label>
          <div className="mt-1.5 flex gap-1.5">
            {OFFICIANT_OPTIONS.map((opt) => {
              const active = ceremony.officiant === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updateCeremony({
                      officiant: opt.value as FirstBirthdayOfficiant,
                    })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-[12px] transition-colors",
                    active
                      ? "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label>Integration with party</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {CEREMONY_INTEGRATION_OPTIONS.map((opt) => {
              const active = ceremony.integration === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updateCeremony({
                      integration: opt.value as FirstBirthdayCeremonyIntegration,
                    })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-[12px] transition-colors",
                    active
                      ? "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Label>Ritual items / setup requirements</Label>
        <div className="mt-1.5">
          <TextArea
            value={ceremony.ritualItemsNotes}
            onChange={(v) => updateCeremony({ ritualItemsNotes: v })}
            placeholder="Thali, payesh, specific fabrics, heirloom items, ritual seating preferences…"
            rows={3}
          />
        </div>
      </div>
    </Section>
  );
}

// ── Venue preference ──────────────────────────────────────────────────────

function VenuePreference() {
  const plan = useFirstBirthdayStore((s) => s.plan);
  const updatePlan = useFirstBirthdayStore((s) => s.updatePlan);

  const showVenueDetails =
    plan.venueType &&
    ["banquet_hall", "hotel", "restaurant"].includes(plan.venueType);
  const showCulturalVenueDetails = plan.venueType === "cultural_center";

  return (
    <Section
      eyebrow="VENUE PREFERENCE"
      title="Where are you picturing this?"
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {VENUE_TYPE_OPTIONS.map((opt) => {
          const active = plan.venueType === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                updatePlan({
                  venueType: active
                    ? null
                    : (opt.value as FirstBirthdayVenueType),
                })
              }
              className={cn(
                "flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                active
                  ? "border-ink bg-ink/5"
                  : "border-border bg-white hover:border-saffron/40",
              )}
            >
              <span className="text-[13px] text-ink">{opt.label}</span>
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active
                    ? "border-ink bg-ink text-ivory"
                    : "border-border bg-white text-transparent",
                )}
              >
                <Check size={9} strokeWidth={2.5} />
              </span>
            </button>
          );
        })}
      </div>

      {showVenueDetails && (
        <div className="mt-5 space-y-3 rounded-md border border-border/60 bg-ivory-warm/30 p-4">
          <p className="text-[11.5px] text-ink-muted">
            Tell us what the venue covers so we don't double-book vendors.
          </p>
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
              placeholder="e.g. 150"
            />
          </FieldRow>
          <FieldRow label="Catering included?">
            <TriPill
              value={plan.cateringIncluded}
              onChange={(v) => updatePlan({ cateringIncluded: v })}
            />
          </FieldRow>
          <FieldRow label="AV / sound system?">
            <TriPill
              value={plan.avAvailable}
              onChange={(v) => updatePlan({ avAvailable: v })}
            />
          </FieldRow>
          <FieldRow label="Restrictions">
            <TextInput
              value={plan.venueRestrictions}
              onChange={(v) => updatePlan({ venueRestrictions: v })}
              placeholder="Decor rules, noise limits, kid-friendly facilities…"
            />
          </FieldRow>
        </div>
      )}

      {showCulturalVenueDetails && (
        <div className="mt-5 space-y-2 rounded-md border border-saffron/30 bg-saffron-pale/20 p-4">
          <p className="text-[12px] text-ink">
            For religious / cultural venues, confirm:
          </p>
          <ul className="list-disc pl-5 text-[12px] text-ink-muted">
            <li>Is the venue providing ceremonial setup?</li>
            <li>Prasad / ceremonial food handled by venue or family?</li>
            <li>Venue-specific rules — dress code, footwear, photography restrictions?</li>
          </ul>
          <TextInput
            value={plan.venueRestrictions}
            onChange={(v) => updatePlan({ venueRestrictions: v })}
            placeholder="Notes…"
          />
        </div>
      )}
    </Section>
  );
}

function TriPill({
  value,
  onChange,
}: {
  value: "yes" | "no" | "unsure" | null;
  onChange: (v: "yes" | "no" | "unsure" | null) => void;
}) {
  const options: { v: "yes" | "no" | "unsure"; label: string }[] = [
    { v: "yes", label: "Yes" },
    { v: "no", label: "No" },
    { v: "unsure", label: "Not sure" },
  ];
  return (
    <div className="flex gap-1.5">
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(active ? null : o.v)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] transition-colors",
              active
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-saffron/40",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Kid safety ────────────────────────────────────────────────────────────

function KidSafety() {
  const plan = useFirstBirthdayStore((s) => s.plan);
  const updatePlan = useFirstBirthdayStore((s) => s.updatePlan);
  const addAllergy = useFirstBirthdayStore((s) => s.addAllergyFlag);
  const removeAllergy = useFirstBirthdayStore((s) => s.removeAllergyFlag);
  const updateAllergy = useFirstBirthdayStore((s) => s.updateAllergyFlag);
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState<AllergySeverity>("moderate");

  function commitAllergy() {
    if (!allergen.trim()) return;
    addAllergy(allergen.trim(), severity);
    setAllergen("");
  }

  return (
    <Section
      eyebrow="KID-FRIENDLINESS & SAFETY"
      title="The stuff other events don't have to think about"
      description="Nap schedules, allergens, and sensitivities shape what the day can hold — and when."
    >
      <div className="divide-y divide-border/60">
        <FieldRow label="Kid age range">
          <div className="flex flex-wrap gap-1.5">
            {KID_AGE_RANGE_OPTIONS.map((opt) => {
              const active = plan.kidAgeRange === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updatePlan({
                      kidAgeRange: active
                        ? null
                        : (opt.value as FirstBirthdayKidAgeRange),
                    })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-[12px] transition-colors",
                    active
                      ? "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </FieldRow>
        <FieldRow label="Baby's nap time">
          <TextInput
            value={plan.napTime}
            onChange={(v) => updatePlan({ napTime: v })}
            placeholder="e.g. 12:30 PM — we'll flag conflicts on the itinerary"
          />
        </FieldRow>
        <FieldRow label="Allergy flags">
          <div className="space-y-2">
            <ul className="space-y-1.5">
              {plan.allergyFlags.map((a) => (
                <li
                  key={a.id}
                  className="grid grid-cols-[1fr_140px_auto] items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5"
                >
                  <TextInput
                    value={a.allergen}
                    onChange={(v) => updateAllergy(a.id, { allergen: v })}
                  />
                  <select
                    value={a.severity}
                    onChange={(e) =>
                      updateAllergy(a.id, {
                        severity: e.target.value as AllergySeverity,
                      })
                    }
                    className="rounded-md border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <button
                    type="button"
                    aria-label={`Remove ${a.allergen}`}
                    onClick={() => removeAllergy(a.id)}
                    className="text-ink-faint hover:text-rose"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </li>
              ))}
              {plan.allergyFlags.length === 0 && (
                <li className="text-[12.5px] italic text-ink-faint">
                  No allergens flagged yet.
                </li>
              )}
            </ul>
            <div className="grid grid-cols-[1fr_140px_auto] gap-2">
              <TextInput
                value={allergen}
                onChange={setAllergen}
                placeholder="Allergen (e.g. Peanuts)"
              />
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AllergySeverity)}
                className="rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
              <button
                type="button"
                onClick={commitAllergy}
                className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
              >
                <Plus size={12} strokeWidth={2} /> Add
              </button>
            </div>
          </div>
        </FieldRow>
        <FieldRow label="Special sensitivities">
          <TextInput
            value={plan.specialSensitivities}
            onChange={(v) => updatePlan({ specialSensitivities: v })}
            placeholder="Loud noises, crowds, overstimulation, specific fears…"
          />
        </FieldRow>
      </div>
    </Section>
  );
}

// ── Hard no's ─────────────────────────────────────────────────────────────

function HardNos() {
  const plan = useFirstBirthdayStore((s) => s.plan);
  const updatePlan = useFirstBirthdayStore((s) => s.updatePlan);
  const toggleHardNo = useFirstBirthdayStore((s) => s.toggleHardNo);

  return (
    <Section
      eyebrow="HARD NO'S"
      title="What's off the table"
      description="Dealbreakers the algorithm will penalize. Toggle any that apply."
    >
      <div className="flex flex-wrap gap-1.5">
        {HARD_NO_OPTIONS.map((opt) => {
          const active = plan.hardNos.includes(opt.value as FirstBirthdayHardNo);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleHardNo(opt.value as FirstBirthdayHardNo)}
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

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label>Dietary restrictions</Label>
          <div className="mt-1.5">
            <TextInput
              value={plan.dietaryRestrictions}
              onChange={(v) => updatePlan({ dietaryRestrictions: v })}
              placeholder="e.g. vegetarian, halal"
            />
          </div>
        </div>
        <div>
          <Label>Accessibility needs</Label>
          <div className="mt-1.5">
            <TextInput
              value={plan.accessibilityNeeds}
              onChange={(v) => updatePlan({ accessibilityNeeds: v })}
              placeholder="e.g. wheelchair, quiet room"
            />
          </div>
        </div>
        <div>
          <Label>Budget ceiling (optional, USD)</Label>
          <div className="mt-1.5 flex items-center gap-1">
            <span className="text-[12px] text-ink-faint">$</span>
            <input
              type="number"
              value={plan.budgetCeilingCents / 100}
              onChange={(e) =>
                updatePlan({
                  budgetCeilingCents: Math.max(
                    0,
                    Math.round(Number(e.target.value) * 100),
                  ),
                })
              }
              className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
              aria-label="Budget ceiling"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── What this year has meant ──────────────────────────────────────────────

function WhatThisYearHasMeant() {
  const plan = useFirstBirthdayStore((s) => s.plan);
  const updatePlan = useFirstBirthdayStore((s) => s.updatePlan);

  return (
    <Section
      eyebrow="WHAT THIS YEAR HAS MEANT"
      title="What would you want this party to say?"
      description="Optional, but it genuinely helps. Specific beats generic — a few phrases is plenty."
    >
      <TextArea
        value={plan.whatThisYearHasMeant}
        onChange={(v) => updatePlan({ whatThisYearHasMeant: v })}
        placeholder="We barely slept but we'd do it again. She's obsessed with dogs and we want dogs everywhere. We just want to eat cake and cry happy tears."
        rows={4}
      />
    </Section>
  );
}
