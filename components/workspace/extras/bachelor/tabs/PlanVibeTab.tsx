"use client";

// ── Plan & Vibe tab ────────────────────────────────────────────────────────
// Party Basics · Vibe & Theme · Inspiration Moodboard · Groom's Preferences
// All interactive — writes flow through bachelor-store.

import {
  EyeOff,
  Image as ImageIcon,
  Lock,
  Palette,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  AVOID_TAG_OPTIONS,
  BUDGET_TIER_OPTIONS,
  CREW_OPTIONS,
  DURATION_OPTIONS,
  ENERGY_OPTIONS,
  GROOM_INTEREST_OPTIONS,
  MONTH_OPTIONS,
  MOODBOARD_CATEGORIES,
  STYLE_OPTIONS,
  THEME_PRESETS,
  TRAVEL_MODE_OPTIONS,
} from "@/lib/bachelor-seed";
import { useBachelorStore } from "@/stores/bachelor-store";
import type {
  GroomPreferences,
  MoodboardCategory,
} from "@/types/bachelor";
import { cn } from "@/lib/utils";
import {
  ChipList,
  FieldRow,
  InlineAdd,
  Label,
  Section,
  TextInput,
} from "../ui";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { bachelorVibeQuiz } from "@/lib/quiz/schemas/bachelor-vibe";

export function PlanVibeTab() {
  return (
    <div className="space-y-5">
      <VibeCheckEntry />
      <PartyBasics />
      <VibeTheme />
      <InspirationMoodboard />
      <GroomPrefs />
    </div>
  );
}

// ── Vibe check entry ──────────────────────────────────────────────────────

function VibeCheckEntry() {
  const vibeProfile = useBachelorStore((s) => s.vibeProfile);
  const hasProfile = vibeProfile.energy !== null;

  return (
    <div className="space-y-4">
      <QuizEntryCard schema={bachelorVibeQuiz} categoryId="bachelor" />
      {hasProfile && <VibeProfileSummary />}
    </div>
  );
}

function VibeProfileSummary() {
  const vibeProfile = useBachelorStore((s) => s.vibeProfile);

  const energy = ENERGY_OPTIONS.find((o) => o.value === vibeProfile.energy);
  const crew = CREW_OPTIONS.find((o) => o.value === vibeProfile.crew);
  const duration = DURATION_OPTIONS.find(
    (o) => o.value === vibeProfile.duration,
  );
  const budget = BUDGET_TIER_OPTIONS.find(
    (o) => o.value === vibeProfile.budgetTier,
  );
  const travel = TRAVEL_MODE_OPTIONS.find(
    (o) => o.value === vibeProfile.travelMode,
  );
  const month = MONTH_OPTIONS.find((o) => o.value === vibeProfile.month);
  const interestLabels = vibeProfile.groomInterests
    .map((v) => GROOM_INTEREST_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);
  const avoidLabels = vibeProfile.avoidTags
    .map((v) => AVOID_TAG_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);

  const rows: { label: string; value: string | null }[] = [
    { label: "Energy", value: energy?.label ?? null },
    { label: "Crew", value: crew ? `${crew.label} guys` : null },
    { label: "Duration", value: duration?.label ?? null },
    { label: "Budget", value: budget?.short ?? null },
    { label: "Travel", value: travel?.label ?? null },
    { label: "Month", value: month?.label ?? null },
  ].filter((r) => r.value);

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
            Your crew profile
          </p>
          <h3 className="mt-1.5 font-serif text-[17px] leading-tight text-ink">
            {energy?.blurb ?? "A bachelor tuned to your crew"}
          </h3>
        </div>
        <QuizRetakeLink schema={bachelorVibeQuiz} categoryId="bachelor" />
      </div>

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

      {interestLabels.length > 0 && (
        <div className="mt-4 border-t border-border/60 pt-3">
          <p
            className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Groom's into
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {interestLabels.map((l) => (
              <li
                key={l}
                className="rounded-full border border-gold/40 bg-gold-pale/40 px-2.5 py-0.5 text-[11.5px] text-gold"
              >
                {l}
              </li>
            ))}
          </ul>
        </div>
      )}

      {avoidLabels.length > 0 && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <p
            className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Hard no's
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {avoidLabels.map((l) => (
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

      <p
        className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        See matching destinations in Discover →
      </p>
    </section>
  );
}

// ── Party Basics ──────────────────────────────────────────────────────────

function PartyBasics() {
  const basics = useBachelorStore((s) => s.basics);
  const updateBasics = useBachelorStore((s) => s.updateBasics);
  const addOrganizer = useBachelorStore((s) => s.addOrganizer);
  const removeOrganizer = useBachelorStore((s) => s.removeOrganizer);
  const setSurpriseMode = useBachelorStore((s) => s.setSurpriseMode);

  return (
    <Section
      eyebrow="THE BACHELOR"
      title="The details"
      description="Set the trip anchors — who's going, when, and whether the groom's in the dark."
    >
      <div className="divide-y divide-border/60">
        <FieldRow label="Groom">
          <TextInput
            value={basics.groomName}
            onChange={(v) => updateBasics({ groomName: v })}
            placeholder="Groom's name"
          />
        </FieldRow>
        <FieldRow label="Organizer(s)">
          <div className="space-y-2">
            <ul className="flex flex-wrap gap-2">
              {basics.organizers.map((org) => (
                <li
                  key={org.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-ivory-warm/60 px-3 py-1 text-[12.5px] text-ink"
                >
                  <span>{org.name}</span>
                  {org.role && (
                    <span className="text-ink-muted">· {org.role}</span>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${org.name}`}
                    onClick={() => removeOrganizer(org.id)}
                    className="text-ink-faint hover:text-rose"
                  >
                    <X size={11} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
            <InlineAdd
              placeholder="Add organizer (e.g. Vikram · Best Man)"
              onAdd={(v) => {
                const [name, role] = v.split("·").map((s) => s.trim());
                addOrganizer(name, role || undefined);
              }}
              buttonLabel="Add organizer"
            />
          </div>
        </FieldRow>
        <FieldRow label="Date">
          <TextInput
            value={basics.dateRange}
            onChange={(v) => updateBasics({ dateRange: v })}
            placeholder="e.g. July 12-14, 2026"
          />
        </FieldRow>
        <FieldRow label="Location">
          <TextInput
            value={basics.location}
            onChange={(v) => updateBasics({ location: v })}
            placeholder="City, state, or venue"
          />
        </FieldRow>
        <FieldRow label="Style">
          <div className="flex flex-wrap gap-1.5">
            {STYLE_OPTIONS.map((opt) => {
              const active = basics.style === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updateBasics({ style: active ? null : opt.value })
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
        <FieldRow label="Guest count">
          <TextInput
            type="number"
            value={String(basics.guestCount)}
            onChange={(v) =>
              updateBasics({ guestCount: Math.max(0, Number(v) || 0) })
            }
            className="max-w-[120px]"
          />
        </FieldRow>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-md border border-saffron/30 bg-saffron-pale/30 px-4 py-3">
        <EyeOff
          size={16}
          strokeWidth={1.7}
          className="mt-0.5 shrink-0 text-saffron"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <Label>Surprise mode</Label>
            <button
              type="button"
              onClick={() => setSurpriseMode(!basics.surpriseMode)}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                basics.surpriseMode ? "bg-ink" : "bg-ivory-deep",
              )}
              aria-pressed={basics.surpriseMode}
              aria-label="Toggle surprise mode"
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                  basics.surpriseMode
                    ? "translate-x-[18px]"
                    : "translate-x-0.5",
                )}
              />
            </button>
          </div>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            When on, the groom can't see the itinerary, budget splits, or crew
            messages. He sees only: date, location, packing list.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ── Vibe & Theme ──────────────────────────────────────────────────────────

function VibeTheme() {
  const vibe = useBachelorStore((s) => s.vibe);
  const updateVibe = useBachelorStore((s) => s.updateVibe);
  const setColorScheme = useBachelorStore((s) => s.setColorScheme);
  const addDressCode = useBachelorStore((s) => s.addDressCode);
  const updateDressCode = useBachelorStore((s) => s.updateDressCode);
  const removeDressCode = useBachelorStore((s) => s.removeDressCode);

  function updateColor(index: number, value: string) {
    const next = [...vibe.colorScheme];
    next[index] = value;
    setColorScheme(next);
  }

  function addColor() {
    setColorScheme([...vibe.colorScheme, "#1A1A1A"]);
  }

  function removeColor(index: number) {
    setColorScheme(vibe.colorScheme.filter((_, i) => i !== index));
  }

  return (
    <Section
      eyebrow="WHAT'S THE VIBE?"
      title="Set the tone so the crew shows up dressed right"
    >
      <div className="space-y-5">
        <div>
          <Label>Theme</Label>
          <div className="mt-2 flex flex-col gap-1.5">
            {THEME_PRESETS.map((theme) => {
              const active = vibe.theme === theme.id;
              return (
                <label
                  key={theme.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] transition-colors",
                    active
                      ? "border-ink bg-ink/5 text-ink"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40",
                  )}
                >
                  <input
                    type="radio"
                    name="theme"
                    checked={active}
                    onChange={() => updateVibe({ theme: theme.id })}
                    className="accent-ink"
                  />
                  {theme.label}
                </label>
              );
            })}
          </div>
          {vibe.theme === "custom" && (
            <TextInput
              value={vibe.customTheme}
              onChange={(v) => updateVibe({ customTheme: v })}
              placeholder="Describe your custom theme…"
              className="mt-2"
            />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Colour scheme</Label>
            <button
              type="button"
              onClick={addColor}
              className="text-[11.5px] font-medium text-saffron hover:underline"
            >
              + Add swatch
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Palette size={14} strokeWidth={1.7} className="text-ink-faint" />
            {vibe.colorScheme.length === 0 && (
              <span className="text-[12.5px] italic text-ink-faint">
                No colour scheme
              </span>
            )}
            {vibe.colorScheme.map((hex, i) => (
              <div key={i} className="group relative">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-md border border-border bg-white"
                  aria-label={`Color ${i + 1}`}
                />
                <button
                  type="button"
                  aria-label="Remove swatch"
                  onClick={() => removeColor(i)}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-ink text-ivory group-hover:flex"
                >
                  <X size={8} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Dress code per event</Label>
          <ul className="mt-2 space-y-2">
            {vibe.dressCodes.map((dc) => (
              <li
                key={dc.id}
                className="grid grid-cols-[180px_1fr_auto] items-center gap-2"
              >
                <TextInput
                  value={dc.eventLabel}
                  onChange={(v) => updateDressCode(dc.id, { eventLabel: v })}
                  placeholder="Golf day"
                />
                <TextInput
                  value={dc.description}
                  onChange={(v) => updateDressCode(dc.id, { description: v })}
                  placeholder="Polos + shorts, no cargo please…"
                />
                <button
                  type="button"
                  aria-label="Remove dress code"
                  onClick={() => removeDressCode(dc.id)}
                  className="text-ink-faint hover:text-rose"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
          <InlineAdd
            placeholder="New event label (e.g. Steak dinner)"
            onAdd={(v) => addDressCode(v, "")}
            buttonLabel="Add dress code"
          />
        </div>
      </div>
    </Section>
  );
}

// ── Inspiration Moodboard ────────────────────────────────────────────────

function InspirationMoodboard() {
  const pins = useBachelorStore((s) => s.moodboard);
  const addPin = useBachelorStore((s) => s.addMoodboardPin);
  const removePin = useBachelorStore((s) => s.removeMoodboardPin);
  const [activeCat, setActiveCat] = useState<MoodboardCategory | "all">("all");
  const [draftUrl, setDraftUrl] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [draftCat, setDraftCat] = useState<MoodboardCategory>("activities");

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
      eyebrow="INSPO BOARD"
      title="Pin ideas for venues, activities, must-brings"
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
            onClick={() => setActiveCat(c.value)}
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
                  {pin.category.replace("_", " & ")}
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

// ── Groom's Preferences ───────────────────────────────────────────────────

function GroomPrefs() {
  const groomPrefs = useBachelorStore((s) => s.groomPrefs);
  const addGroomPref = useBachelorStore((s) => s.addGroomPref);
  const removeGroomPref = useBachelorStore((s) => s.removeGroomPref);
  const surpriseMode = useBachelorStore((s) => s.basics.surpriseMode);

  const sections: {
    kind: keyof GroomPreferences;
    label: string;
    placeholder: string;
  }[] = [
    {
      kind: "loves",
      label: "THINGS HE'D LOVE",
      placeholder: "e.g. Poker night with real chips, steak dinner…",
    },
    {
      kind: "avoid",
      label: "THINGS HE DOESN'T WANT",
      placeholder: "e.g. Nothing posted on social before she sees it",
    },
    {
      kind: "dietary",
      label: "DIETARY / NEEDS",
      placeholder: "e.g. One groomsman is GF, one doesn't drink",
    },
  ];

  return (
    <Section
      eyebrow="GROOM'S INPUT"
      title="Even in surprise mode, the groom fills this out"
      description="So the best man knows what he actually wants — without giving away the itinerary."
      right={
        surpriseMode ? (
          <span className="inline-flex items-center gap-1 rounded-sm border border-saffron/40 bg-saffron-pale/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
            <Lock size={10} strokeWidth={2} /> Surprise on
          </span>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {sections.map((sec) => (
          <div key={sec.kind}>
            <Label>{sec.label}</Label>
            <div className="mt-2">
              <ChipList
                items={groomPrefs[sec.kind]}
                onRemove={(i) => removeGroomPref(sec.kind, i)}
                emptyLabel="Nothing added yet."
              />
              <InlineAdd
                placeholder={sec.placeholder}
                onAdd={(v) => addGroomPref(sec.kind, v)}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
