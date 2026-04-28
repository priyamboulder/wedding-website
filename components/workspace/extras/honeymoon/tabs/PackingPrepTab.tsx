"use client";

// ── Packing & Prep tab ─────────────────────────────────────────────────────
// Pre-trip checklist grouped by section (documents, health, practical) plus a
// packing list. Everything checkable — progress counts in each section head.

import { AlertTriangle, Plus, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useHoneymoonStore } from "@/stores/honeymoon-store";
import type {
  ChecklistItem,
  HoneymoonVibeProfile,
  PackingSection,
} from "@/types/honeymoon";
import { cn } from "@/lib/utils";
import { Section, TextInput } from "../../bachelorette/ui";
import {
  DESTINATION_CONCEPTS,
  type DestinationConcept,
} from "@/lib/honeymoon/destination-catalog";

const SECTIONS: { value: PackingSection; title: string; description: string }[] = [
  {
    value: "documents",
    title: "Documents",
    description: "Passports, visas, insurance, confirmations.",
  },
  {
    value: "health",
    title: "Health",
    description: "Vaccines, prescriptions, travel kit.",
  },
  {
    value: "practical",
    title: "Practical",
    description: "Phone, currency, adapters, out-of-office.",
  },
  {
    value: "packing",
    title: "Packing list",
    description: "What goes in the suitcase — generated or hand-curated.",
  },
];

export function PackingPrepTab() {
  return (
    <div className="space-y-5">
      <TripPrepGenerator />
      {SECTIONS.map((s) => (
        <ChecklistSection
          key={s.value}
          section={s.value}
          title={s.title}
          description={s.description}
        />
      ))}
    </div>
  );
}

// ── Top-of-tab generator ───────────────────────────────────────────────────
// One button that seeds items across all four sections based on the
// leading destination's catalog data (kind, triggers, flight hours,
// deep-dive logistics) plus the couple's vibe profile.

function TripPrepGenerator() {
  const vision = useHoneymoonStore((s) => s.vision);
  const vibeProfile = useHoneymoonStore((s) => s.vibeProfile);
  const checklist = useHoneymoonStore((s) => s.checklist);
  const destinations = useHoneymoonStore((s) => s.destinations);
  const addChecklistItem = useHoneymoonStore((s) => s.addChecklistItem);

  const leading = destinations.find((d) => d.status === "leading");
  const concept = leading ? matchConcept(leading.name) : null;

  const suggestions = suggestPackingList({
    oldVibes: vision.vibes,
    profile: vibeProfile,
    concept,
    destinationName: leading?.name,
  });
  const existing = new Set(
    checklist.map((c) => c.label.trim().toLowerCase()),
  );
  const newSuggestions = suggestions.filter(
    (s) => !existing.has(s.label.trim().toLowerCase()),
  );

  function generate() {
    for (const s of newSuggestions) {
      addChecklistItem(s.label, s.section);
    }
  }

  if (newSuggestions.length === 0) return null;

  return (
    <section className="rounded-lg border border-gold/30 bg-gradient-to-br from-ivory-warm/60 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
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
            Trip-aware prep
          </p>
          <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
            Seed your prep list from{" "}
            {concept ? concept.title : leading ? leading.name : "your profile"}
          </h3>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-ink-muted">
            {concept
              ? `${newSuggestions.length} destination-aware items across documents, health, practical, and packing. Built from the ${concept.title} trip guide — only additions, nothing is overwritten.`
              : leading
                ? `${newSuggestions.length} vibe-driven items. Set a catalog match as Leading for richer, destination-specific picks.`
                : `${newSuggestions.length} vibe-driven items from your dream profile. Mark a destination as Leading for richer recommendations.`}
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_1px_3px_rgba(184,134,11,0.2)] transition-opacity hover:opacity-90"
        >
          <Sparkles size={12} strokeWidth={1.8} /> Seed {newSuggestions.length}{" "}
          items
        </button>
      </div>
    </section>
  );
}

function ChecklistSection({
  section,
  title,
  description,
}: {
  section: PackingSection;
  title: string;
  description: string;
}) {
  const checklist = useHoneymoonStore((s) => s.checklist);
  const addChecklistItem = useHoneymoonStore((s) => s.addChecklistItem);

  const items = useMemo(
    () => checklist.filter((c) => c.section === section),
    [checklist, section],
  );
  const done = items.filter((i) => i.done).length;

  const [draft, setDraft] = useState("");

  function commit() {
    if (!draft.trim()) return;
    addChecklistItem(draft.trim(), section);
    setDraft("");
  }

  return (
    <Section
      eyebrow={title.toUpperCase()}
      title={title}
      description={description}
      right={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {done}/{items.length}
        </span>
      }
    >
      {items.length === 0 ? (
        <p className="mb-3 text-[13px] italic text-ink-faint">
          Nothing here yet — add something you don't want to forget.
        </p>
      ) : (
        <ul className="mb-3 divide-y divide-border/40">
          {items.map((item) => (
            <ChecklistRow key={item.id} item={item} />
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <TextInput
          value={draft}
          onChange={setDraft}
          placeholder={`Add ${title.toLowerCase()} item`}
        />
        <button
          type="button"
          onClick={commit}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={11} strokeWidth={2} /> Add
        </button>
      </div>
    </Section>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const toggleChecklist = useHoneymoonStore((s) => s.toggleChecklist);
  const updateChecklistItem = useHoneymoonStore((s) => s.updateChecklistItem);
  const removeChecklistItem = useHoneymoonStore((s) => s.removeChecklistItem);

  return (
    <li className="flex items-center gap-3 py-2">
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => toggleChecklist(item.id)}
        className="h-4 w-4 shrink-0 accent-ink"
        aria-label={item.done ? "Unmark" : "Mark done"}
      />
      <div className="min-w-0 flex-1">
        <input
          value={item.label}
          onChange={(e) =>
            updateChecklistItem(item.id, { label: e.target.value })
          }
          className={cn(
            "w-full border-none bg-transparent text-[13px] focus:outline-none",
            item.done ? "text-ink-faint line-through" : "text-ink",
          )}
          aria-label="Checklist item"
        />
        {item.note && (
          <p
            className={cn(
              "mt-0.5 text-[11.5px]",
              item.warning ? "text-rose" : "text-ink-muted",
            )}
          >
            {item.note}
          </p>
        )}
      </div>
      {item.warning && (
        <AlertTriangle
          size={13}
          strokeWidth={2}
          className="shrink-0 text-rose"
          aria-label="Warning"
        />
      )}
      <button
        type="button"
        onClick={() => removeChecklistItem(item.id)}
        className="text-ink-faint hover:text-rose"
        aria-label="Remove item"
      >
        <X size={13} strokeWidth={2} />
      </button>
    </li>
  );
}

// Match a free-form destination name (as typed by the couple) to a catalog
// concept. Exact title match first, then stop-name match.
function matchConcept(name: string): DestinationConcept | null {
  const n = name.trim().toLowerCase();
  if (!n) return null;
  const byTitle = DESTINATION_CONCEPTS.find(
    (c) => c.title.trim().toLowerCase() === n,
  );
  if (byTitle) return byTitle;
  return (
    DESTINATION_CONCEPTS.find((c) =>
      c.stops.some((s) => s.trim().toLowerCase() === n),
    ) ?? null
  );
}

interface PackingSuggestion {
  label: string;
  section: PackingSection;
}

interface PackingInput {
  oldVibes: string[];
  profile: HoneymoonVibeProfile;
  concept: DestinationConcept | null;
  destinationName?: string;
}

// Produces a destination-aware list of suggestions across all four
// sections (documents, health, practical, packing). When a concept is
// matched, adds tier-specific items (malaria meds, altitude, long-flight
// gear). Otherwise falls back to a generic vibe-based list.
function suggestPackingList(input: PackingInput): PackingSuggestion[] {
  const out: PackingSuggestion[] = [];
  const add = (label: string, section: PackingSection) =>
    out.push({ label, section });

  // ── Baseline across every trip
  add("Passport + 2 copies", "documents");
  add("Flight confirmations saved offline", "documents");
  add("Hotel confirmations saved offline", "documents");
  add("Travel insurance policy", "documents");
  add("Phone + charger", "practical");
  add("Prescriptions & basic first-aid", "health");
  add("Everyday outfits × duration + 2", "packing");
  add("Underwear & socks × duration + 2", "packing");
  add("Toiletries (3-1-1 compliant)", "packing");

  // ── Vibe tiles (new quiz) ────────────────────────────────────────────
  const tiles = input.profile.vibes;
  if (tiles.includes("barefoot_unplugged")) {
    add("Swimsuits × 3", "packing");
    add("Reef-safe sunscreen", "packing");
    add("Sunglasses + sun hat", "packing");
    add("Beach cover-up", "packing");
    add("Physical book / journal", "packing");
  }
  if (tiles.includes("adventure_for_two")) {
    add("Light hiking shoes", "packing");
    add("Quick-dry shirts × 2", "packing");
    add("Daypack", "packing");
    add("Trail blister kit", "health");
  }
  if (tiles.includes("wine_dine_romance") || tiles.includes("full_luxury")) {
    add("Smart-casual dinner outfit × 2", "packing");
    add("Dress shoes / heels", "packing");
    add("Jewellery pouch", "packing");
  }
  if (tiles.includes("wander_discover")) {
    add("Comfortable walking shoes (broken in)", "packing");
    add("Tote or crossbody for daily walks", "packing");
  }
  // Legacy old-vibes fallback (pre-quiz users) — mirror minimum
  if (tiles.length === 0) {
    if (input.oldVibes.includes("beach")) {
      add("Swimsuits × 2–3", "packing");
      add("Reef-safe sunscreen", "packing");
    }
    if (input.oldVibes.includes("adventure")) {
      add("Light hiking shoes", "packing");
    }
  }

  // ── Dealbreakers → prep items
  const dealbreakers = input.profile.dealbreakers;
  if (dealbreakers.includes("extreme_heat")) {
    add("Electrolyte tabs", "health");
    add("Light linen layers", "packing");
  }

  // ── Concept-derived items ─────────────────────────────────────────────
  const c = input.concept;
  if (c) {
    if (c.requiresPassport) {
      add("Confirm passport has 6+ months validity", "documents");
    }
    if (c.flightHoursFromDFW[0] >= 8) {
      add("Compression socks for long flight", "health");
      add("Neck pillow + eye mask", "packing");
      add("Offline entertainment downloaded", "practical");
    }
    if (c.triggers.includes("malaria")) {
      add("Malaria prophylaxis — confirm with doctor", "health");
      add("DEET-based insect repellent", "health");
    }
    if (c.triggers.includes("altitude")) {
      add("Altitude medication (Diamox) consult", "health");
    }
    if (c.triggers.includes("health_advisory")) {
      add("Check CDC travel page before departure", "health");
    }
    // Climate inference from best months + region heuristics
    const tropical =
      c.kind === "beach" ||
      c.regions.some((r) =>
        ["Indonesia", "Maldives", "Mexico", "Costa Rica", "Tanzania", "French Polynesia", "Sri Lanka"].includes(r),
      );
    if (tropical) {
      add("Mosquito repellent (tropical strength)", "health");
      add("Lightweight rain shell", "packing");
    }
    if (c.kind === "adventure") {
      add("Rain shell + quick-dry layers", "packing");
    }
    if (c.kind === "domestic") {
      add("No passport needed — state ID is fine", "documents");
    }
    // Money + connectivity from logistics (deep-dive only)
    if (c.deepDive) {
      add(c.deepDive.logistics.money, "practical");
      add(c.deepDive.logistics.connectivity, "practical");
      if (c.deepDive.logistics.language) {
        add(`Language: ${c.deepDive.logistics.language}`, "practical");
      }
    }
    // Destination-tagged note so the couple knows what the list was
    // generated against.
    add(`Destination-specific: packing tuned for ${c.title}`, "packing");
  } else if (input.destinationName) {
    add(`Destination-specific: notes for ${input.destinationName}`, "packing");
  }

  // Universal practical items that don't depend on the trip
  add("Notify bank of international travel", "practical");
  add("Out-of-office messages set up", "practical");
  return out;
}
