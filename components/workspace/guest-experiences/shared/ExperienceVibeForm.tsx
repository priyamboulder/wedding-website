"use client";

// ── Shared Experience Vibe form ─────────────────────────────────────────────
// Captures priorities, vibe keywords, budget approach, guest profile, and
// which events to focus on. Used in both the guided journey (Session 1) and
// as a section above the Experience Explorer in full workspace mode.
//
// Reads/writes a single bag of form_data — same shape regardless of mode.
// In guided mode the bag lives in the journey state under "experience_vibe".
// In manual mode it lives in localStorage under the same key, so flipping
// modes never loses data.

import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  defaultJourneyState,
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";

export interface VibeFormData {
  experience_priorities?: string[];
  vibe_keywords?: string[];
  vibe_keywords_custom?: string[];
  budget_approach?: "splurge_on_few" | "spread_across_many" | "no_budget_constraint";
  guest_profile?: {
    mostly_young_crowd?: boolean;
    significant_elderly?: boolean;
    many_children?: boolean;
    mixed_indian_western?: boolean;
  };
  events_to_focus?: string[];
}

const PRIORITY_OPTIONS = [
  { value: "guest_entertainment", label: "Guest entertainment" },
  { value: "photo_moments", label: "Instagram-worthy photos" },
  { value: "food_experiences", label: "Interactive food & drink" },
  { value: "wow_spectacles", label: "Big wow moments" },
  { value: "keepsakes", label: "Thoughtful keepsakes" },
  { value: "cultural_traditions", label: "Cultural traditions" },
] as const;

const VIBE_SUGGESTIONS = [
  "playful",
  "glamorous",
  "intimate",
  "high_energy",
  "instagram_worthy",
  "culturally_rich",
  "unexpected",
  "classic",
  "elegant",
  "luxurious",
  "warm",
];

const BUDGET_OPTIONS = [
  { value: "splurge_on_few", label: "Splurge on a few wow moments" },
  { value: "spread_across_many", label: "Spread across many smaller touches" },
  { value: "no_budget_constraint", label: "No constraint — show me everything" },
] as const;

const EVENT_OPTIONS = [
  { value: "haldi", label: "Haldi" },
  { value: "mehendi", label: "Mehendi" },
  { value: "sangeet", label: "Sangeet" },
  { value: "cocktail_hour", label: "Cocktail hour" },
  { value: "wedding", label: "Wedding ceremony" },
  { value: "reception", label: "Reception" },
  { value: "after_party", label: "After-party" },
] as const;

const GUEST_FLAGS: Array<{ key: keyof NonNullable<VibeFormData["guest_profile"]>; label: string }> = [
  { key: "mostly_young_crowd", label: "Mostly a young crowd" },
  { key: "significant_elderly", label: "Significant elderly guests" },
  { key: "many_children", label: "Lots of children" },
  { key: "mixed_indian_western", label: "Mix of Indian & Western guests" },
];

// ── Reusable hook used by both modes ──────────────────────────────────────
// Reads/writes the experience_vibe slice of the guest_experiences journey
// state. The journey state is the source of truth for vibe data, so guided
// and manual modes naturally stay in sync.
export function useVibeForm(): {
  data: VibeFormData;
  set: <K extends keyof VibeFormData>(key: K, value: VibeFormData[K]) => void;
  setGuestFlag: (
    flag: keyof NonNullable<VibeFormData["guest_profile"]>,
    value: boolean,
  ) => void;
} {
  const [state, update] = useCategoryJourneyState("guest_experiences");
  const data = (state.formData["experience_vibe"] ?? {}) as VibeFormData;

  function set<K extends keyof VibeFormData>(key: K, value: VibeFormData[K]) {
    update((s) => setSessionFormPath(s, "experience_vibe", key as string, value));
  }

  function setGuestFlag(
    flag: keyof NonNullable<VibeFormData["guest_profile"]>,
    value: boolean,
  ) {
    update((s) =>
      setSessionFormPath(s, "experience_vibe", `guest_profile.${flag}`, value),
    );
  }

  return { data, set, setGuestFlag };
}

// ── Component ─────────────────────────────────────────────────────────────

export function ExperienceVibeForm({
  variant = "section",
}: {
  variant?: "section" | "guided";
}) {
  const { data, set, setGuestFlag } = useVibeForm();

  // Keep the eyebrow / framing aware of the variant. Guided mode leans on
  // the GuidedJourneyShell's own eyebrow + subtitle, so we render fields only.
  return (
    <div className={cn("space-y-6", variant === "section" && "")}>
      {variant === "section" && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron">
            Your experience vibe
          </p>
          <h2 className="mt-1.5 font-serif font-bold text-[22px] leading-tight text-ink">
            What kind of guest experience do you want?
          </h2>
          <p className="mt-1.5 max-w-3xl text-[13px] text-ink-muted">
            Tell us what matters most and a bit about your guests — we'll
            prioritise the catalog accordingly. Editable any time.
          </p>
        </div>
      )}

      <FieldGroup label="What matters most">
        <ChipGroup
          options={PRIORITY_OPTIONS}
          values={data.experience_priorities ?? []}
          onToggle={(v) => set("experience_priorities", toggle(data.experience_priorities, v))}
        />
      </FieldGroup>

      <FieldGroup label="The vibe you want" helper="Tap as many as feel right.">
        <ChipGroup
          options={VIBE_SUGGESTIONS.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
          values={data.vibe_keywords ?? []}
          onToggle={(v) => set("vibe_keywords", toggle(data.vibe_keywords, v))}
        />
      </FieldGroup>

      <FieldGroup label="How do you want to spend?">
        <div className="flex flex-col gap-2">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("budget_approach", opt.value)}
              className={cn(
                "rounded-md border px-3 py-2 text-left text-[13px] transition-colors",
                data.budget_approach === opt.value
                  ? "border-saffron bg-saffron/5 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        label="Your guest profile"
        helper="Helps us surface what's most likely to land."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GUEST_FLAGS.map((g) => (
            <ToggleRow
              key={g.key}
              label={g.label}
              checked={data.guest_profile?.[g.key] === true}
              onToggle={() =>
                setGuestFlag(g.key, !(data.guest_profile?.[g.key] === true))
              }
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        label="Events to focus on"
        helper="We'll surface experiences for these events first."
      >
        <ChipGroup
          options={EVENT_OPTIONS}
          values={data.events_to_focus ?? []}
          onToggle={(v) => set("events_to_focus", toggle(data.events_to_focus, v))}
        />
      </FieldGroup>

      {variant === "section" && (
        <div className="rounded-md border border-gold/25 bg-ivory-warm/40 px-4 py-3 text-[12.5px] text-ink-muted">
          <Sparkles size={12} className="mr-1 inline-block text-saffron" />
          Your vibe shapes which categories surface first in the Explorer below.
        </div>
      )}
    </div>
  );
}

// Compute the prioritised category order from a vibe form bag. Used by the
// shared Experience Explorer to decide which categories to show first.
export function priorityCategoryOrder(data: VibeFormData | undefined): string[] {
  const priorityToCategory: Record<string, string[]> = {
    guest_entertainment: ["live_artists", "games", "wow_moments"],
    photo_moments: ["photo_capture"],
    food_experiences: ["food_drink"],
    wow_spectacles: ["wow_moments", "arrivals"],
    keepsakes: ["keepsakes"],
    cultural_traditions: ["arrivals", "live_artists"],
  };
  const order: string[] = [];
  for (const p of data?.experience_priorities ?? []) {
    for (const cat of priorityToCategory[p] ?? []) {
      if (!order.includes(cat)) order.push(cat);
    }
  }
  // Append the remaining standard categories not yet in the order.
  for (const c of ["arrivals", "photo_capture", "live_artists", "food_drink", "keepsakes", "wow_moments", "games"]) {
    if (!order.includes(c)) order.push(c);
  }
  return order;
}

// Read the persisted vibe bag without mounting the form. Used by the
// Explorer to know how to re-order categories. Returns an empty object on
// the server so the import is safe in any context.
export function readVibeData(): VibeFormData {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(
      "marigold:guided-journey:v1:guest_experiences",
    );
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed?.formData?.experience_vibe ?? {}) as VibeFormData;
  } catch {
    return {};
  }
}

// Subscribe to vibe changes. Polls localStorage on the storage event so
// other tabs / re-renders pick up vibe edits. Lightweight — the data is
// small and the recompute path inside the Explorer is cheap.
export function useVibeData(): VibeFormData {
  const { data } = useVibeForm();
  // Force the journey state hook to keep us subscribed. Returning data is
  // enough — the parent component re-renders whenever the journey state
  // changes, which is the only path that mutates this bag.
  useEffect(() => {
    void defaultJourneyState; // touch import so it isn't tree-shaken
  }, []);
  return data;
}

// ── Subcomponents ─────────────────────────────────────────────────────────

function FieldGroup({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          {label}
        </div>
        {helper && (
          <div className="mt-1 font-serif text-[13px] italic text-ink-muted">
            {helper}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function ChipGroup<T extends { value: string; label: string }>({
  options,
  values,
  onToggle,
}: {
  options: readonly T[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] transition-colors",
              active
                ? "border-saffron bg-saffron/10 text-saffron"
                : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center justify-between rounded-md border px-3 py-2 text-left text-[13px] transition-colors",
        checked
          ? "border-saffron bg-saffron/5 text-ink"
          : "border-border bg-white text-ink-muted hover:border-saffron/40",
      )}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded border",
          checked ? "border-saffron bg-saffron text-white" : "border-border bg-white",
        )}
      >
        {checked ? "✓" : ""}
      </span>
    </button>
  );
}

function toggle(arr: string[] | undefined, value: string): string[] {
  const list = arr ?? [];
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
