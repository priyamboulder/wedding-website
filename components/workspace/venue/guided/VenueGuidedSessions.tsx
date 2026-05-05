"use client";

// Bespoke guided-journey session bodies for the Venue category.
//
// Each session below renders the same React components used in the
// Dream & Discover tab, all bound to the venue-store. Touching anything
// in a guided session shows up in the full workspace and vice versa.
//
// Sessions:
//   1. venue_discovery   — 8-step quiz, AI direction cards, inspiration
//   2. venue_priorities  — priority pills, want/avoid lists, single/multi,
//                          location, budget, guest count
//   3. venue_requirements — indoor/outdoor, catering, fire, alcohol,
//                          accommodation, accessibility, rain, setup
//   4. venue_brief       — the "close your eyes" brief + couple approval
//
// The fourth session uses VenueBriefEditor (also reused on Tab 1).

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useVenueStore } from "@/stores/venue-store";
import { VENUE_KEYWORD_LIBRARY } from "@/lib/venue-seed";
import { Heart, Image as ImageIcon, Plus, Trash2, X } from "lucide-react";
import {
  EmptyRow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { VenueDiscoveryQuiz } from "../VenueDiscoveryQuiz";
import {
  AccessibilityRequirements,
  AccommodationPreferenceField,
  BudgetRange,
  GuestCountRange,
  LocationPreferences,
  SingleMultiVenue,
  VenueBriefEditor,
} from "../SharedFields";
import type {
  AlcoholPolicyPreference,
  CateringPref,
  IndoorOutdoorPref,
} from "@/types/venue";

// ── Session 1 · Discovery ────────────────────────────────────────────────

export function VenueDiscoverySession() {
  return (
    <div className="space-y-6">
      <VenueDiscoveryQuiz />
      <DirectionsSection />
      <InspirationSection />
    </div>
  );
}

function DirectionsSection() {
  const directions = useVenueStore((s) => s.discovery.directions);
  const react = useVenueStore((s) => s.setDirectionReaction);

  return (
    <PanelCard title="the places that pulled you in">
      <p className="mb-4 text-[12.5px] leading-relaxed text-ink-muted">
        Six directions your brief could go. React to each — the ones you love
        shape the AI suggestions on the Shortlist tab.
      </p>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {directions.map((d) => (
          <li
            key={d.id}
            className={cn(
              "group overflow-hidden rounded-md border bg-white transition-colors",
              d.reaction === "love"
                ? "border-saffron"
                : d.reaction === "not_for_us"
                  ? "border-ink opacity-60"
                  : "border-border hover:border-saffron/40",
            )}
          >
            <div className="relative aspect-[4/3] bg-ivory-warm">
              <img
                src={d.imageUrl}
                alt={d.label}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {d.reaction === "love" && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-saffron bg-saffron px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ivory">
                  <Heart size={9} /> Love
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-[13.5px] font-medium text-ink">{d.label}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                {d.description}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <ReactionButton
                  active={d.reaction === "love"}
                  onClick={() => react(d.id, "love")}
                  tone="love"
                >
                  <Heart size={9} /> Love
                </ReactionButton>
                <ReactionButton
                  active={d.reaction === "not_for_us"}
                  onClick={() => react(d.id, "not_for_us")}
                  tone="not"
                >
                  <X size={9} /> Not for us
                </ReactionButton>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

function InspirationSection() {
  const images = useVenueStore((s) => s.discovery.inspiration);
  const add = useVenueStore((s) => s.addInspiration);
  const react = useVenueStore((s) => s.setInspirationReaction);
  const remove = useVenueStore((s) => s.removeInspiration);
  const [urlDraft, setUrlDraft] = useState("");

  function onPaste() {
    if (!urlDraft.trim()) return;
    add(urlDraft.trim());
    setUrlDraft("");
  }

  return (
    <PanelCard title="inspiration gallery">
      {images.length === 0 ? (
        <EmptyRow>
          Drop inspiration here. Paste a Pinterest link or react to what we've
          suggested below.
        </EmptyRow>
      ) : (
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
          {images.map((img) => (
            <li
              key={img.id}
              className={cn(
                "group relative overflow-hidden rounded-md ring-1 transition-colors",
                img.reaction === "love"
                  ? "ring-saffron"
                  : img.reaction === "not_for_us"
                    ? "opacity-40 ring-border"
                    : "ring-border",
              )}
            >
              <div className="relative aspect-[4/3] bg-ivory-warm">
                <img
                  src={img.url}
                  alt={img.caption}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {img.reaction === "love" && (
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full border border-saffron bg-saffron px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ivory">
                    <Heart size={8} />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <Trash2 size={10} strokeWidth={1.8} />
                </button>
              </div>
              <div className="flex items-center gap-1 border-t border-border bg-white px-1.5 py-1.5">
                <ReactionButton
                  active={img.reaction === "love"}
                  onClick={() => react(img.id, "love")}
                  tone="love"
                  size="sm"
                >
                  <Heart size={9} /> Love
                </ReactionButton>
                <ReactionButton
                  active={img.reaction === "not_for_us"}
                  onClick={() => react(img.id, "not_for_us")}
                  tone="not"
                  size="sm"
                >
                  <X size={9} />
                </ReactionButton>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onPaste();
            }
          }}
          placeholder="Paste a Pinterest or image URL…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <button
          type="button"
          onClick={onPaste}
          className="flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          <Plus size={11} /> Add
        </button>
      </div>
    </PanelCard>
  );
}

function ReactionButton({
  active,
  onClick,
  tone,
  children,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  tone: "love" | "not";
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const activeClass =
    tone === "love"
      ? "border-saffron bg-saffron text-ivory"
      : "border-ink bg-ink text-ivory";
  const inactiveClass =
    "border-border bg-white text-ink-muted hover:border-ink";
  const sizeClass =
    size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border font-mono uppercase tracking-[0.06em] transition-colors",
        sizeClass,
        active ? activeClass : inactiveClass,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </button>
  );
}

// ── Session 2 · Priorities ──────────────────────────────────────────────

export function VenuePrioritiesSession() {
  return (
    <div className="space-y-6">
      <VenuePriorityPills />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DefinitelyWantList />
        <NotForUsList />
      </div>
      <SingleMultiVenue />
      <LocationPreferences />
      <BudgetRange />
      <GuestCountRange />
    </div>
  );
}

function VenuePriorityPills() {
  const selected = useVenueStore((s) => s.discovery.keyword_chips);
  const toggle = useVenueStore((s) => s.toggleKeywordChip);
  const [draft, setDraft] = useState("");

  const selectedLower = new Set(selected.map((c) => c.toLowerCase()));
  const extras = selected.filter(
    (c) =>
      !VENUE_KEYWORD_LIBRARY.some(
        (k) => k.toLowerCase() === c.toLowerCase(),
      ),
  );

  return (
    <PanelCard title="what matters most to you?">
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        Tap the ones that feel right. Add your own at the bottom — these
        separate must-haves from nice-to-haves when we match venues.
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {VENUE_KEYWORD_LIBRARY.map((chip) => {
          const on = selectedLower.has(chip.toLowerCase());
          return (
            <li key={chip}>
              <button
                type="button"
                onClick={() => toggle(chip)}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] transition-colors",
                  on
                    ? "border-saffron bg-saffron-pale/50 text-saffron"
                    : "border-border bg-white text-ink-muted hover:border-saffron/50",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {chip}
              </button>
            </li>
          );
        })}
        {extras.map((chip) => (
          <li key={`extra-${chip}`}>
            <button
              type="button"
              onClick={() => toggle(chip)}
              className="rounded-full border border-saffron bg-saffron-pale/50 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {chip} <X size={9} className="inline align-text-top" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              toggle(draft.trim());
              setDraft("");
            }
          }}
          placeholder="+ Add your own…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      </div>
    </PanelCard>
  );
}

function DefinitelyWantList() {
  const items = useVenueStore((s) => s.discovery.definitely_want);
  const set = useVenueStore((s) => s.setDefinitelyWant);
  return (
    <SimpleTextList
      title="I definitely want …"
      items={items}
      onChange={set}
      placeholder="Lakeside view at ceremony · Mandap on stone platform · Rooms on-site"
      tone="saffron"
    />
  );
}

function NotForUsList() {
  const items = useVenueStore((s) => s.discovery.not_for_us);
  const set = useVenueStore((s) => s.setNotForUs);
  return (
    <SimpleTextList
      title="Not for us …"
      items={items}
      onChange={set}
      placeholder="Hotel ballroom with no view · In-house caterer only · Anything generic"
      tone="ink"
    />
  );
}

function SimpleTextList({
  title,
  items,
  onChange,
  placeholder,
  tone,
}: {
  title: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  tone: "saffron" | "ink";
}) {
  const [draft, setDraft] = useState("");
  const dotClass = tone === "saffron" ? "bg-saffron" : "bg-ink";
  return (
    <PanelCard title={title}>
      <ul className="space-y-1.5">
        {items.length === 0 ? (
          <EmptyRow>Nothing yet — write freely.</EmptyRow>
        ) : (
          items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="group flex items-start gap-2 text-[13px] leading-relaxed text-ink"
            >
              <span
                className={cn(
                  "mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full",
                  dotClass,
                )}
              />
              <span className="flex-1">
                <InlineText
                  value={item}
                  onSave={(next) =>
                    onChange(items.map((x, j) => (j === i ? next : x)))
                  }
                  className="!p-0 text-[13px]"
                />
              </span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                aria-label="Remove"
              >
                <X size={11} />
              </button>
            </li>
          ))
        )}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      </div>
    </PanelCard>
  );
}

// ── Session 3 · Requirements ────────────────────────────────────────────

export function VenueRequirementsSession() {
  return (
    <div className="space-y-6">
      <IndoorOutdoorField />
      <CateringPolicyField />
      <FireCeremonyField />
      <AlcoholPolicyField />
      <AccommodationPreferenceField />
      <AccessibilityRequirements />
      <RainPlanField />
      <SetupTeardownField />
    </div>
  );
}

function IndoorOutdoorField() {
  const value = useVenueStore((s) => s.discovery.quiz.answers.indoor_outdoor);
  const set = useVenueStore((s) => s.setQuizAnswers);

  const options: Array<{ id: IndoorOutdoorPref; label: string; blurb: string }> =
    [
      { id: "indoor", label: "Indoor", blurb: "Climate-controlled." },
      { id: "outdoor", label: "Outdoor", blurb: "Open sky, garden, lawn." },
      {
        id: "flexible",
        label: "Both / Flexible",
        blurb: "Mix events across spaces.",
      },
    ];

  return (
    <PanelCard title="indoor or outdoor?">
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {options.map((o) => {
          const on = value === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() =>
                  set({ indoor_outdoor: on ? null : o.id })
                }
                className={cn(
                  "flex w-full flex-col items-start gap-1 rounded-md border bg-white p-4 text-left transition-all",
                  on
                    ? "border-saffron ring-2 ring-saffron/30"
                    : "border-border hover:border-saffron/40",
                )}
              >
                <span className="text-[14px] font-medium text-ink">
                  {o.label}
                </span>
                <span className="text-[12px] text-ink-muted">{o.blurb}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </PanelCard>
  );
}

function CateringPolicyField() {
  const value = useVenueStore((s) => s.discovery.quiz.answers.catering);
  const set = useVenueStore((s) => s.setQuizAnswers);

  const options: Array<{ id: CateringPref; label: string; blurb: string }> = [
    {
      id: "venue",
      label: "Venue catering is fine",
      blurb: "Let the venue handle food end-to-end.",
    },
    {
      id: "outside",
      label: "Outside catering required",
      blurb: "We have a chef / caterer we want to bring.",
    },
    {
      id: "flexible",
      label: "No preference",
      blurb: "Open either way — depends on the venue.",
    },
  ];

  return (
    <PanelCard title="catering policy">
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {options.map((o) => {
          const on = value === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => set({ catering: on ? null : o.id })}
                className={cn(
                  "flex w-full flex-col items-start gap-1 rounded-md border bg-white p-4 text-left transition-all",
                  on
                    ? "border-saffron ring-2 ring-saffron/30"
                    : "border-border hover:border-saffron/40",
                )}
              >
                <span className="text-[14px] font-medium text-ink">
                  {o.label}
                </span>
                <span className="text-[12px] text-ink-muted">{o.blurb}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </PanelCard>
  );
}

function FireCeremonyField() {
  const value = useVenueStore((s) => s.discovery.fire_ceremony_needed);
  const set = useVenueStore((s) => s.setFireCeremonyNeeded);
  return (
    <PanelCard title="fire ceremony / havan kund">
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        Many venues quietly ban open flame indoors. Mark this if it's a
        non-negotiable so we surface the right ones.
      </p>
      <BoolToggle value={value} onChange={set} label="We need fire allowed" />
    </PanelCard>
  );
}

function AlcoholPolicyField() {
  const value = useVenueStore((s) => s.discovery.alcohol_policy_preference);
  const set = useVenueStore((s) => s.setAlcoholPolicyPreference);

  const options: Array<{
    id: NonNullable<AlcoholPolicyPreference>;
    label: string;
  }> = [
    { id: "full_bar", label: "Full bar" },
    { id: "beer_wine", label: "Beer & wine" },
    { id: "byob", label: "BYOB" },
    { id: "dry", label: "Dry" },
    { id: "no_preference", label: "No preference" },
  ];

  return (
    <PanelCard title="alcohol policy">
      <ul className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => set(on ? null : o.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                  on
                    ? "border-saffron bg-saffron text-ivory"
                    : "border-border bg-white text-ink-muted hover:border-saffron hover:text-saffron",
                )}
              >
                {o.label}
              </button>
            </li>
          );
        })}
      </ul>
    </PanelCard>
  );
}

function RainPlanField() {
  const value = useVenueStore((s) => s.discovery.rain_plan_needed);
  const set = useVenueStore((s) => s.setRainPlanNeeded);
  return (
    <PanelCard title="rain plan">
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        If outdoor matters but the season is unpredictable, we'll prioritize
        venues with a true indoor backup of equal vibe.
      </p>
      <BoolToggle
        value={value}
        onChange={set}
        label="We need a strong indoor backup"
      />
    </PanelCard>
  );
}

function SetupTeardownField() {
  const value = useVenueStore((s) => s.discovery.setup_teardown_needs);
  const set = useVenueStore((s) => s.setSetupTeardownNeeds);
  return (
    <PanelCard title="setup &amp; teardown">
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        Décor build-time, load-in windows, mandap anchoring — anything venues
        should know up front.
      </p>
      <textarea
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder="Need full day before for décor build…"
        rows={3}
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
      />
    </PanelCard>
  );
}

function BoolToggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors",
        value
          ? "border-saffron bg-saffron-pale/40 text-saffron"
          : "border-border bg-white text-ink-muted hover:border-saffron/40",
      )}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-saffron"
      />
      <span className="text-[13px]">{label}</span>
    </label>
  );
}

// ── Session 4 · Brief ───────────────────────────────────────────────────

export function VenueBriefSession() {
  return <VenueBriefEditor showApproval />;
}
