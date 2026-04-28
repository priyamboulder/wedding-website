"use client";

// ── Dream & Plan tab ───────────────────────────────────────────────────────
// Honeymoon Vision · Brief · Moodboard. Discovery tab (no quiz) — the couple
// sketches the trip in free form so later tabs have something to work against.

import { Image as ImageIcon, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  BUDGET_TIER_OPTIONS,
  CLIMATE_OPTIONS,
  DEALBREAKER_OPTIONS,
  DURATION_OPTIONS,
  FLIGHT_TOLERANCE_OPTIONS,
  MOODBOARD_CATEGORIES,
  PRIORITY_INTEREST_OPTIONS,
  TIMING_V2_OPTIONS,
  TRAVEL_EXPERIENCE_OPTIONS,
  TRIP_DURATION_OPTIONS,
  VIBE_OPTIONS,
  VIBE_TILE_OPTIONS,
  WHEN_OPTIONS,
} from "@/lib/honeymoon-seed";
import { useHoneymoonStore } from "@/stores/honeymoon-store";
import type {
  HoneymoonClimate,
  HoneymoonDuration,
  HoneymoonTimingWhen,
  HoneymoonVibe,
  MoodboardCategory,
} from "@/types/honeymoon";
import { cn } from "@/lib/utils";
import {
  ChipList,
  InlineAdd,
  Label,
  Section,
  TextArea,
  TextInput,
} from "../../bachelorette/ui";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { honeymoonDreamQuiz } from "@/lib/quiz/schemas/honeymoon-dream";
import { JourneyProgress } from "../JourneyProgress";

export function DreamPlanTab() {
  return (
    <div className="space-y-5">
      <DreamSessionEntry />
      <JourneyProgress />
      <HoneymoonVision />
      <HoneymoonBrief />
      <HoneymoonMoodboard />
    </div>
  );
}

// ── 1.0 Dream Session entry ────────────────────────────────────────────────
// The Phase 1 quiz. The entry card hides itself once the quiz has been
// taken; a distilled profile card takes over so returning couples (and the
// demo-seeded workspace) always see their answers at a glance.

function DreamSessionEntry() {
  const profile = useHoneymoonStore((s) => s.vibeProfile);
  const hasProfile = profile.vibes.length > 0 || profile.duration !== null;

  return (
    <div className="space-y-4">
      <QuizEntryCard schema={honeymoonDreamQuiz} categoryId="honeymoon" />
      {hasProfile && <DreamProfileSummary />}
    </div>
  );
}

function DreamProfileSummary() {
  const profile = useHoneymoonStore((s) => s.vibeProfile);

  const vibeLabels = profile.vibes
    .map((v) => VIBE_TILE_OPTIONS.find((o) => o.value === v))
    .filter((v): v is (typeof VIBE_TILE_OPTIONS)[number] => Boolean(v));
  const duration = TRIP_DURATION_OPTIONS.find(
    (o) => o.value === profile.duration,
  );
  const budget = BUDGET_TIER_OPTIONS.find(
    (o) => o.value === profile.budgetTier,
  );
  const flight = FLIGHT_TOLERANCE_OPTIONS.find(
    (o) => o.value === profile.flightTolerance,
  );
  const timing = TIMING_V2_OPTIONS.find((o) => o.value === profile.timing);
  const experience = TRAVEL_EXPERIENCE_OPTIONS.find(
    (o) => o.value === profile.travelExperience,
  );
  const priorityLabels = profile.priorityInterests
    .map((v) => PRIORITY_INTEREST_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);
  const dealbreakerLabels = profile.dealbreakers
    .map((v) => DEALBREAKER_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);

  const headline = vibeLabels.length
    ? vibeLabels.map((v) => v.label).join(" + ")
    : "Your dream session profile";

  const rows: { label: string; value: string | null }[] = [
    { label: "Duration", value: duration?.label ?? null },
    { label: "Total budget", value: budget?.label ?? null },
    { label: "Flights", value: flight?.label ?? null },
    { label: "Timing", value: timing?.label ?? null },
    { label: "Experience", value: experience?.label ?? null },
  ].filter((r) => r.value);

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles
              size={10}
              strokeWidth={1.8}
              className="mr-1 inline-block align-[-1px]"
            />
            Your dream profile
          </p>
          <h3 className="mt-1.5 font-serif text-[17px] leading-tight text-ink">
            {headline}
          </h3>
        </div>
        <QuizRetakeLink schema={honeymoonDreamQuiz} categoryId="honeymoon" />
      </div>

      {rows.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-5 gap-y-2 md:grid-cols-3">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-col">
              <dt
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {r.label}
              </dt>
              <dd className="text-[13px] text-ink">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {priorityLabels.length > 0 && (
        <div className="mt-4 border-t border-border/60 pt-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            What matters most
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {priorityLabels.map((l) => (
              <span
                key={l}
                className="rounded-full border border-border bg-ivory-warm/60 px-2.5 py-0.5 text-[11.5px] text-ink-muted"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {dealbreakerLabels.length > 0 && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Dealbreakers
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {dealbreakerLabels.map((l) => (
              <span
                key={l}
                className="rounded-full border border-rose/30 bg-rose/5 px-2.5 py-0.5 text-[11.5px] text-rose"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── 1.1 Honeymoon Vision ───────────────────────────────────────────────────

function HoneymoonVision() {
  const vision = useHoneymoonStore((s) => s.vision);
  const updateVision = useHoneymoonStore((s) => s.updateVision);
  const toggleVibe = useHoneymoonStore((s) => s.toggleVibe);
  const addDealBreaker = useHoneymoonStore((s) => s.addDealBreaker);
  const removeDealBreaker = useHoneymoonStore((s) => s.removeDealBreaker);

  return (
    <Section
      eyebrow="YOUR HONEYMOON"
      title="Dream first, plan second."
      description="What does the perfect post-wedding escape look like?"
    >
      <div className="space-y-5">
        <div>
          <Label>When</Label>
          <div className="mt-2 flex flex-col gap-1.5">
            {WHEN_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.value}
                checked={vision.when === opt.value}
                label={opt.label}
                onChange={() =>
                  updateVision({
                    when: vision.when === opt.value
                      ? null
                      : (opt.value as HoneymoonTimingWhen),
                  })
                }
              />
            ))}
          </div>
          {vision.when === "later" && (
            <TextInput
              value={vision.laterMonth}
              onChange={(v) => updateVision({ laterMonth: v })}
              placeholder="Which month?"
              className="mt-2 max-w-xs"
            />
          )}
        </div>

        <div>
          <Label>Duration</Label>
          <div className="mt-2 flex flex-col gap-1.5">
            {DURATION_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.value}
                checked={vision.duration === opt.value}
                label={opt.label}
                onChange={() =>
                  updateVision({
                    duration: vision.duration === opt.value
                      ? null
                      : (opt.value as HoneymoonDuration),
                  })
                }
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Vibe — select all that apply</Label>
          <div className="mt-2 grid grid-cols-2 gap-1.5 md:grid-cols-3">
            {VIBE_OPTIONS.map((opt) => {
              const active = vision.vibes.includes(opt.value as HoneymoonVibe);
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px] transition-colors cursor-pointer",
                    active
                      ? "border-ink bg-ink/5 text-ink"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleVibe(opt.value as HoneymoonVibe)}
                    className="accent-ink"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <Label>Climate</Label>
          <div className="mt-2 flex flex-col gap-1.5">
            {CLIMATE_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.value}
                checked={vision.climate === opt.value}
                label={opt.label}
                onChange={() =>
                  updateVision({
                    climate: vision.climate === opt.value
                      ? null
                      : (opt.value as HoneymoonClimate),
                  })
                }
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Deal-breakers</Label>
          <p className="mt-1 text-[12px] italic text-ink-faint">
            e.g. No long flights (max 6 hours), no camping, must have good food,
            need reliable wifi for at least part of the trip.
          </p>
          <div className="mt-2">
            <ChipList
              items={vision.dealBreakers}
              onRemove={removeDealBreaker}
              emptyLabel="Nothing yet."
            />
            <InlineAdd
              placeholder="Add a deal-breaker"
              onAdd={addDealBreaker}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

function RadioRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] transition-colors cursor-pointer",
        checked
          ? "border-ink bg-ink/5 text-ink"
          : "border-border bg-white text-ink-muted hover:border-saffron/40",
      )}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="accent-ink"
      />
      {label}
    </label>
  );
}

// ── 1.2 Honeymoon Brief ────────────────────────────────────────────────────

function HoneymoonBrief() {
  const brief = useHoneymoonStore((s) => s.brief);
  const updateBrief = useHoneymoonStore((s) => s.updateBrief);
  const vision = useHoneymoonStore((s) => s.vision);

  return (
    <Section
      eyebrow="YOUR DREAM TRIP"
      title="Your Honeymoon Brief"
      description="What's the feeling you want on this trip? Not the destination — the emotion."
      right={
        <button
          type="button"
          onClick={() => suggestDestinations(vision, brief.body)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold-light/20 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold-light/40"
          title="AI suggestion — this is a design hint, not a backend call"
        >
          <Sparkles size={12} strokeWidth={1.8} /> Suggest destinations
        </button>
      }
    >
      <TextArea
        value={brief.body}
        onChange={(v) => updateBrief({ body: v })}
        rows={5}
        placeholder="Are you collapsing on a beach with a book? Exploring a city you've always dreamed of? Eating your way through a country? Just being alone together for the first time in months?"
      />
    </Section>
  );
}

function suggestDestinations(
  vision: ReturnType<typeof useHoneymoonStore.getState>["vision"],
  _brief: string,
): void {
  // Design-stub: surfaces a small popup-style alert based on vibe/climate.
  // Real AI integration is aspirational; the button still has to feel alive.
  const vibe = vision.vibes[0] ?? "adventure";
  const climate = vision.climate ?? "tropical";
  const picks: Record<string, string> = {
    adventure_tropical: "Costa Rica (rainforest + beach), Bali, Tanzania (safari + Zanzibar)",
    beach_tropical: "Maldives, Seychelles, Bora Bora",
    city_culture_temperate: "Tokyo + Kyoto, Lisbon, Istanbul",
    food_wine_temperate: "Amalfi Coast, Burgundy, San Sebastián",
    romance_temperate: "Santorini, Paris, Amalfi",
    luxury_tropical: "Maldives, Bora Bora, Nihi Sumba",
  };
  const key = `${vibe}_${climate}`;
  const pick = picks[key] ?? "Bali, Santorini, Costa Rica";
  if (typeof window !== "undefined") {
    window.alert(`Given ${vibe} + ${climate}, consider:\n\n${pick}`);
  }
}

// ── 1.3 Moodboard ──────────────────────────────────────────────────────────

function HoneymoonMoodboard() {
  const pins = useHoneymoonStore((s) => s.moodboard);
  const addPin = useHoneymoonStore((s) => s.addMoodboardPin);
  const removePin = useHoneymoonStore((s) => s.removeMoodboardPin);
  const [activeCat, setActiveCat] = useState<MoodboardCategory | "all">("all");
  const [draftUrl, setDraftUrl] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [draftCat, setDraftCat] = useState<MoodboardCategory>("beaches");

  const filtered = useMemo(
    () =>
      activeCat === "all" ? pins : pins.filter((p) => p.category === activeCat),
    [pins, activeCat],
  );

  function commit() {
    if (!draftUrl.trim() && !draftNote.trim()) return;
    addPin(draftUrl.trim(), draftCat, draftNote.trim() || undefined);
    setDraftUrl("");
    setDraftNote("");
  }

  return (
    <Section
      eyebrow="TRIP INSPO"
      title="Pin the feeling — beaches, hotels, food, scenery, romance"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TabPill
          label="All"
          active={activeCat === "all"}
          onClick={() => setActiveCat("all")}
        />
        {MOODBOARD_CATEGORIES.map((c) => (
          <TabPill
            key={c.value}
            label={c.label}
            active={activeCat === c.value}
            onClick={() => setActiveCat(c.value as MoodboardCategory)}
          />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-[1fr_1fr_180px_auto] gap-2">
        <TextInput
          value={draftUrl}
          onChange={setDraftUrl}
          placeholder="Paste image URL…"
        />
        <TextInput
          value={draftNote}
          onChange={setDraftNote}
          placeholder="Note (optional)"
        />
        <select
          value={draftCat}
          onChange={(e) => setDraftCat(e.target.value as MoodboardCategory)}
          className="rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
        >
          {MOODBOARD_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={commit}
          className="rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          Pin
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-10 text-center">
          <ImageIcon
            size={22}
            strokeWidth={1.4}
            className="mx-auto mb-2 text-ink-faint"
          />
          <p className="text-[13px] text-ink-muted">
            No pins yet in this category — drop an image URL or a quick note.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {filtered.map((pin) => (
            <figure
              key={pin.id}
              className="group overflow-hidden rounded-md border border-border bg-ivory-warm"
            >
              <div className="relative aspect-[4/5] bg-gradient-to-br from-ivory-warm via-ivory-deep to-gold-pale/40">
                {pin.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pin.imageUrl}
                    alt={pin.note ?? "Inspiration"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon
                      size={26}
                      strokeWidth={1.2}
                      className="text-ink-faint/60"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removePin(pin.id)}
                  aria-label="Remove pin"
                  className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-ivory group-hover:flex"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              </div>
              <figcaption className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
                <span className="truncate text-[12px] text-ink">
                  {pin.note ?? "Untitled"}
                </span>
                <span
                  className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {pin.category}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Section>
  );
}

function TabPill({
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
      className={cn(
        "rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
