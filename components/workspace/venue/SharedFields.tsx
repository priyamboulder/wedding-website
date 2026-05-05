"use client";

// Shared venue form fields. The same React components render inside the
// guided journey sessions and inside the Dream & Discover tab — completing
// either flips the same venue-store fields, so progress moves both ways.
//
// Each component reads its slice from useVenueStore and writes via the
// canonical setter. No localStorage detours, no duplicate state.

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVenueStore } from "@/stores/venue-store";
import type {
  AccommodationPreference,
  SingleVsMultiVenue,
} from "@/types/venue";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";

const FONT_MONO = "var(--font-mono)";

// ── Single vs multi venue ────────────────────────────────────────────────

export function SingleMultiVenue() {
  const value = useVenueStore((s) => s.discovery.single_vs_multi_venue);
  const set = useVenueStore((s) => s.setSingleVsMultiVenue);

  const options: Array<{
    id: NonNullable<SingleVsMultiVenue>;
    label: string;
    blurb: string;
  }> = [
    {
      id: "single",
      label: "Everything under one roof",
      blurb: "All events at one venue — easier on guests, simpler logistics.",
    },
    {
      id: "multiple",
      label: "Different venues for different events",
      blurb: "Mehendi at home, ceremony at temple, reception at a hotel.",
    },
  ];

  return (
    <PanelCard title="one venue or many?">
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        How do you imagine the celebration moving across spaces?
      </p>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {options.map((o) => {
          const on = value === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => set(on ? null : o.id)}
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

// ── Location preferences ─────────────────────────────────────────────────

export function LocationPreferences() {
  const items = useVenueStore((s) => s.discovery.location_preferences);
  const set = useVenueStore((s) => s.setLocationPreferences);
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (items.some((i) => i.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    set([...items, v]);
    setDraft("");
  }

  return (
    <PanelCard title="where in the world?">
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        Cities, regions, or "destination — we're open." Add as many as feel
        right.
      </p>
      {items.length === 0 ? (
        <EmptyRow>
          Nothing yet — add a city, region, or "destination."
        </EmptyRow>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {items.map((loc, idx) => (
            <li
              key={`${loc}-${idx}`}
              className="inline-flex items-center gap-1 rounded-full border border-saffron bg-saffron-pale/50 px-2.5 py-1 text-[12px] text-saffron"
            >
              <span>{loc}</span>
              <button
                type="button"
                onClick={() => set(items.filter((_, i) => i !== idx))}
                className="opacity-70 hover:opacity-100"
                aria-label={`Remove ${loc}`}
              >
                <X size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Udaipur, Goa, Lake Como…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          <Plus size={11} /> Add
        </button>
      </div>
    </PanelCard>
  );
}

// ── Budget range ─────────────────────────────────────────────────────────

const BUDGET_MIN = 10000;
const BUDGET_MAX = 500000;
const BUDGET_STEP = 5000;

export function BudgetRange() {
  const min = useVenueStore((s) => s.discovery.quiz.answers.budget_min);
  const max = useVenueStore((s) => s.discovery.quiz.answers.budget_max);
  const setQuiz = useVenueStore((s) => s.setQuizAnswers);

  return (
    <PanelCard title="your venue budget">
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        Venue fee only — catering, décor, and the rest are budgeted in their
        own workspaces. Flows into AI venue suggestions.
      </p>
      <div className="rounded-md border border-border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow>Min</Eyebrow>
            <p
              className="mt-1 text-[20px] font-bold leading-tight text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ${min.toLocaleString()}
            </p>
          </div>
          <span className="text-ink-faint">—</span>
          <div className="text-right">
            <Eyebrow>Max</Eyebrow>
            <p
              className="mt-1 text-[20px] font-bold leading-tight text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ${max.toLocaleString()}
              {max >= BUDGET_MAX ? "+" : ""}
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint"
              style={{ fontFamily: FONT_MONO }}
            >
              Min
            </span>
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={min}
              onChange={(e) =>
                setQuiz({
                  budget_min: Math.min(Number(e.target.value), max),
                })
              }
              className="mt-1 w-full accent-saffron"
            />
          </label>
          <label className="block">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint"
              style={{ fontFamily: FONT_MONO }}
            >
              Max
            </span>
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={max}
              onChange={(e) =>
                setQuiz({
                  budget_max: Math.max(Number(e.target.value), min),
                })
              }
              className="mt-1 w-full accent-saffron"
            />
          </label>
        </div>
      </div>
    </PanelCard>
  );
}

// ── Guest count range ───────────────────────────────────────────────────

export function GuestCountRange() {
  const range = useVenueStore((s) => s.discovery.guest_count_range);
  const set = useVenueStore((s) => s.setGuestCountRange);

  return (
    <PanelCard title="how many guests, smallest to largest event?">
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        Mehendi might be 80, the reception might be 400 — venues need to flex
        between both. Flows into capacity matching.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 rounded-md border border-border bg-white p-3">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: FONT_MONO }}
          >
            Smallest event
          </span>
          <input
            type="number"
            min={0}
            value={range.smallest_event || ""}
            onChange={(e) =>
              set({ smallest_event: Number(e.target.value) || 0 })
            }
            placeholder="e.g. 80"
            className="bg-transparent text-[18px] font-medium text-ink placeholder:text-ink-faint focus:outline-none"
            style={{ fontFamily: "var(--font-display)" }}
          />
        </label>
        <label className="flex flex-col gap-1.5 rounded-md border border-border bg-white p-3">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: FONT_MONO }}
          >
            Largest event
          </span>
          <input
            type="number"
            min={0}
            value={range.largest_event || ""}
            onChange={(e) =>
              set({ largest_event: Number(e.target.value) || 0 })
            }
            placeholder="e.g. 400"
            className="bg-transparent text-[18px] font-medium text-ink placeholder:text-ink-faint focus:outline-none"
            style={{ fontFamily: "var(--font-display)" }}
          />
        </label>
      </div>
    </PanelCard>
  );
}

// ── Accommodation preference ────────────────────────────────────────────

export function AccommodationPreferenceField() {
  const value = useVenueStore((s) => s.discovery.accommodation_preference);
  const set = useVenueStore((s) => s.setAccommodationPreference);

  const options: Array<{
    id: NonNullable<AccommodationPreference>;
    label: string;
    blurb: string;
  }> = [
    {
      id: "on_site",
      label: "On site",
      blurb: "Rooms at the venue — easiest for elders and out-of-towners.",
    },
    {
      id: "nearby",
      label: "Nearby",
      blurb: "Walking or short shuttle distance.",
    },
    {
      id: "not_important",
      label: "Not important",
      blurb: "Most guests are local or sorting it out themselves.",
    },
  ];

  return (
    <PanelCard title="where do guests sleep?">
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {options.map((o) => {
          const on = value === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => set(on ? null : o.id)}
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

// ── Accessibility requirements ──────────────────────────────────────────

const ACCESSIBILITY_SUGGESTIONS = [
  "Step-free path from car to ceremony",
  "Wheelchair access to dining and ceremony spaces",
  "Elevator access to upstairs spaces",
  "Seating for elders during ceremony",
  "Accessible restrooms",
  "Quiet space for sensory breaks",
];

export function AccessibilityRequirements() {
  const items = useVenueStore((s) => s.discovery.accessibility_requirements);
  const set = useVenueStore((s) => s.setAccessibilityRequirements);
  const [draft, setDraft] = useState("");

  const selectedLower = new Set(items.map((i) => i.toLowerCase()));

  function toggleSuggestion(s: string) {
    if (selectedLower.has(s.toLowerCase())) {
      set(items.filter((i) => i.toLowerCase() !== s.toLowerCase()));
    } else {
      set([...items, s]);
    }
  }

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (selectedLower.has(v.toLowerCase())) {
      setDraft("");
      return;
    }
    set([...items, v]);
    setDraft("");
  }

  const customExtras = items.filter(
    (i) =>
      !ACCESSIBILITY_SUGGESTIONS.some(
        (s) => s.toLowerCase() === i.toLowerCase(),
      ),
  );

  return (
    <PanelCard title="accessibility & access">
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        The needs your guests bring. Tap suggestions or write your own.
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {ACCESSIBILITY_SUGGESTIONS.map((s) => {
          const on = selectedLower.has(s.toLowerCase());
          return (
            <li key={s}>
              <button
                type="button"
                onClick={() => toggleSuggestion(s)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                  on
                    ? "border-saffron bg-saffron-pale/50 text-saffron"
                    : "border-border bg-white text-ink-muted hover:border-saffron/50",
                )}
              >
                {s}
              </button>
            </li>
          );
        })}
        {customExtras.map((s) => (
          <li key={`custom-${s}`}>
            <button
              type="button"
              onClick={() => toggleSuggestion(s)}
              className="rounded-full border border-saffron bg-saffron-pale/50 px-2.5 py-1 text-[12px] text-saffron"
            >
              {s} <X size={10} className="inline align-text-top" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a specific requirement…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      </div>
    </PanelCard>
  );
}

// ── Brief editor with couple_approved checkbox ──────────────────────────

export function VenueBriefEditor({
  showApproval = false,
}: {
  showApproval?: boolean;
}) {
  const brief = useVenueStore((s) => s.discovery.brief_body);
  const setBrief = useVenueStore((s) => s.setBrief);
  const approved = useVenueStore((s) => s.discovery.couple_approved_brief);
  const setApproved = useVenueStore((s) => s.setCoupleApprovedBrief);

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] leading-relaxed text-ink-muted">
        Describe the feeling you want your venue to create — not logistics. Are
        your guests walking through a candlelit courtyard? Standing at the edge
        of a lake at sunset? Dancing under a tent in your backyard? Write
        freely — your planner and AI will translate this into a real search.
      </p>
      <div className="rounded-md border border-gold/15 bg-ivory-warm/40 p-4">
        <InlineText
          value={brief}
          onSave={setBrief}
          variant="block"
          allowEmpty
          multilineRows={8}
          className="!p-0 font-serif text-[15px] italic leading-relaxed text-ink"
          placeholder="We want our families to feel like they've stepped into another world…"
          emptyLabel="Click to start writing — no wrong answers."
        />
      </div>
      {showApproval && (
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
            className="accent-sage"
          />
          <span
            className={cn(
              "text-[12.5px]",
              approved ? "text-sage" : "text-ink-muted",
            )}
          >
            We're happy with this brief
          </span>
        </label>
      )}
    </div>
  );
}
