"use client";

// ── Experience Suggestions Modal ────────────────────────────────────────
// Inspirational flow: user describes their event (type, guests, budget,
// venue, vibe, must-haves), model responds with curated experiences
// grouped by themed zone. User checks the ones they want, hits "Add
// selected to floor plan" and the elements drop onto the canvas.

import { useMemo, useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSeatingStore } from "@/stores/seating-store";
import { getElementDef } from "@/lib/floor-plan-library";
import type {
  BudgetTier,
  ExperienceSuggestRequestBody,
  ExperienceSuggestResponse,
  SuggestedExperience,
  VenueType,
} from "@/app/api/seating/experience-suggest/route";

interface Props {
  eventId: string;
  eventLabel: string;
  guestCount: number;
  guestDemographics?: string;
  onClose: () => void;
}

type Phase = "config" | "loading" | "results" | "error";

const VIBE_OPTIONS = [
  "Traditional & Elegant",
  "Modern & Chic",
  "Fun & Festive",
  "Intimate & Warm",
  "Grand & Opulent",
  "Rustic & Earthy",
  "Destination & Tropical",
];

const VENUE_OPTIONS: Array<{ value: VenueType; label: string }> = [
  { value: "indoor_banquet", label: "Indoor Banquet Hall" },
  { value: "outdoor_lawn", label: "Outdoor Lawn" },
  { value: "beach", label: "Beach" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "hotel_ballroom", label: "Hotel Ballroom" },
  { value: "rooftop", label: "Rooftop" },
];

export function ExperienceSuggestModal({
  eventId,
  eventLabel,
  guestCount,
  guestDemographics,
  onClose,
}: Props) {
  const fixed = useSeatingStore((s) => s.fixed);
  const addFixedElement = useSeatingStore((s) => s.addFixedElement);

  const [phase, setPhase] = useState<Phase>("config");
  const [error, setError] = useState("");
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("premium");
  const [venueType, setVenueType] = useState<VenueType>("indoor_banquet");
  const [vibes, setVibes] = useState<string[]>([
    "Grand & Opulent",
    "Fun & Festive",
  ]);
  const [mustHaves, setMustHaves] = useState("");
  const [summary, setSummary] = useState("");
  const [zones, setZones] = useState<
    NonNullable<ExperienceSuggestResponse["zones"]>
  >([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleVibe = (v: string) => {
    setVibes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  };

  const flatExperiences = useMemo(
    () => zones.flatMap((z) => z.experiences.map((e) => ({ zone: z.name, exp: e }))),
    [zones],
  );

  const allCount = flatExperiences.length;

  const runGenerate = async () => {
    setPhase("loading");
    setError("");
    const body: ExperienceSuggestRequestBody = {
      eventId,
      eventLabel,
      guestCount,
      guestDemographics,
      budgetTier,
      venueType,
      vibes,
      mustHaves,
      existingElements: fixed.map((f) => ({
        id: f.id,
        name: f.label,
        category: f.kind,
      })),
    };
    try {
      const res = await fetch("/api/seating/experience-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as ExperienceSuggestResponse;
      if (!data.ok || !data.zones) {
        setError(data.error ?? "Failed to generate suggestions.");
        setPhase("error");
        return;
      }
      setZones(data.zones);
      setSummary(data.summary ?? "");
      // Pre-select all by default — user un-checks what they don't want
      const all = new Set<string>();
      for (const z of data.zones) for (const e of z.experiences) all.add(e.id);
      setSelected(all);
      setPhase("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
      setPhase("error");
    }
  };

  const applySelected = () => {
    let added = 0;
    for (const { exp } of flatExperiences) {
      if (!selected.has(exp.id)) continue;
      placeExperience(exp);
      added += 1;
    }
    onClose();
    // We can't toast from here; caller watches store for count changes.
    void added;
  };

  const placeExperience = (exp: SuggestedExperience) => {
    if (!exp.libraryId) return;
    const def = getElementDef(exp.libraryId);
    if (!def) return;
    addFixedElement(exp.libraryId, {
      label: exp.name,
      width: exp.suggestedWidth ?? def.defaultWidth,
      height: exp.suggestedHeight ?? def.defaultHeight,
      properties: {
        vendorName: "",
        staffingCount: exp.staffing,
      },
      notes: exp.description + (exp.reasoning ? `\n\nWhy: ${exp.reasoning}` : ""),
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-ink/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mt-8 max-h-[88vh] w-[780px] overflow-hidden rounded-xl border border-border bg-gradient-to-br from-white via-ivory/40 to-gold-pale/15 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-border bg-white/70 px-6 py-4 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} strokeWidth={1.6} className="text-gold" />
              <div className="font-serif text-[20px] text-ink">
                Experience suggestions
              </div>
            </div>
            <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              {eventLabel} · {guestCount} guests
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-white hover:text-ink"
          >
            <X size={14} strokeWidth={1.6} />
          </button>
        </header>

        <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
          {phase === "config" && (
            <ConfigStep
              budgetTier={budgetTier}
              setBudgetTier={setBudgetTier}
              venueType={venueType}
              setVenueType={setVenueType}
              vibes={vibes}
              toggleVibe={toggleVibe}
              mustHaves={mustHaves}
              setMustHaves={setMustHaves}
            />
          )}

          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
              <div className="font-serif text-[14px] text-ink">
                Claude is imagining your event…
              </div>
              <div className="font-mono text-[10.5px] text-ink-faint">
                This usually takes 15–25 seconds.
              </div>
            </div>
          )}

          {phase === "error" && (
            <div className="py-8 text-center">
              <div className="mb-3 font-serif text-[16px] text-rose">
                Something went wrong.
              </div>
              <div className="mb-4 text-[12px] text-ink-muted">{error}</div>
              <button
                onClick={() => setPhase("config")}
                className="rounded-md bg-ink px-4 py-2 text-[12px] text-ivory hover:opacity-90"
              >
                Try again
              </button>
            </div>
          )}

          {phase === "results" && (
            <ResultsView
              summary={summary}
              zones={zones}
              selected={selected}
              onToggle={(id) =>
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                })
              }
            />
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-border bg-ivory/40 px-6 py-3 backdrop-blur">
          {phase === "config" && (
            <>
              <div className="font-mono text-[10px] text-ink-faint">
                Claude will recommend experiences tailored to this event.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink/20 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  onClick={runGenerate}
                  className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-1.5 text-[12px] text-ivory hover:opacity-90"
                >
                  <Sparkles size={12} strokeWidth={1.7} />
                  Suggest experiences
                </button>
              </div>
            </>
          )}
          {phase === "results" && (
            <>
              <div className="font-mono text-[10px] text-ink-faint">
                {selected.size} of {allCount} selected · check only the ones you want
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPhase("config")}
                  className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink/20 hover:text-ink"
                >
                  Re-generate
                </button>
                <button
                  onClick={applySelected}
                  disabled={selected.size === 0}
                  className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-1.5 text-[12px] text-ivory hover:opacity-90 disabled:opacity-40"
                >
                  <Check size={12} strokeWidth={1.7} />
                  Add selected to floor plan
                </button>
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

// ── Config step ────────────────────────────────────────────────────────
function ConfigStep({
  budgetTier,
  setBudgetTier,
  venueType,
  setVenueType,
  vibes,
  toggleVibe,
  mustHaves,
  setMustHaves,
}: {
  budgetTier: BudgetTier;
  setBudgetTier: (b: BudgetTier) => void;
  venueType: VenueType;
  setVenueType: (v: VenueType) => void;
  vibes: string[];
  toggleVibe: (v: string) => void;
  mustHaves: string;
  setMustHaves: (m: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Budget */}
      <div>
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
          Budget tier
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["standard", "premium", "luxury"] as BudgetTier[]).map((b) => (
            <button
              key={b}
              onClick={() => setBudgetTier(b)}
              className={cn(
                "rounded-md border px-3 py-2 text-left transition",
                budgetTier === b
                  ? "border-ink bg-gold-pale/30 shadow-sm"
                  : "border-border bg-white hover:border-ink/25",
              )}
            >
              <div className="font-serif text-[13px] text-ink">
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </div>
              <div className="mt-0.5 font-mono text-[9.5px] text-ink-faint">
                {b === "standard"
                  ? "Practical crowd-pleasers"
                  : b === "premium"
                    ? "Elevated touches"
                    : "Luxury everything"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Venue */}
      <div>
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
          Venue type
        </div>
        <div className="grid grid-cols-3 gap-2">
          {VENUE_OPTIONS.map((v) => (
            <button
              key={v.value}
              onClick={() => setVenueType(v.value)}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-[11.5px] transition",
                venueType === v.value
                  ? "border-ink bg-gold-pale/30 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-ink/25 hover:text-ink",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vibe */}
      <div>
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
          Vibe — pick any number
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VIBE_OPTIONS.map((v) => {
            const active = vibes.includes(v);
            return (
              <button
                key={v}
                onClick={() => toggleVibe(v)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11.5px] transition",
                  active
                    ? "border-ink bg-ink text-ivory"
                    : "border-border bg-white text-ink-muted hover:border-ink/25 hover:text-ink",
                )}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>

      {/* Must-haves */}
      <div>
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
          Must-haves (free text)
        </div>
        <textarea
          rows={3}
          value={mustHaves}
          onChange={(e) => setMustHaves(e.target.value)}
          placeholder="e.g. We definitely want a paan counter, a 360 photo booth, and a kids area with supervision."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12px] text-ink outline-none focus:border-ink/30"
        />
      </div>
    </div>
  );
}

// ── Results step ──────────────────────────────────────────────────────
function ResultsView({
  summary,
  zones,
  selected,
  onToggle,
}: {
  summary: string;
  zones: NonNullable<ExperienceSuggestResponse["zones"]>;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      {summary && (
        <div className="mb-4 rounded-md border border-dashed border-gold/40 bg-gold-pale/20 px-4 py-2.5 text-[12px] leading-snug text-ink-muted">
          {summary}
        </div>
      )}
      <div className="space-y-5">
        {zones.map((zone) => (
          <div key={zone.name}>
            <div className="mb-1 font-serif text-[16px] text-ink">
              {zone.name}
            </div>
            {zone.description && (
              <div className="mb-2 text-[12px] italic text-ink-muted">
                {zone.description}
              </div>
            )}
            <div className="grid grid-cols-1 gap-2">
              {zone.experiences.map((exp) => {
                const isSelected = selected.has(exp.id);
                const def = exp.libraryId ? getElementDef(exp.libraryId) : undefined;
                return (
                  <button
                    key={exp.id}
                    onClick={() => onToggle(exp.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-md border p-3 text-left transition",
                      isSelected
                        ? "border-ink bg-white shadow-sm"
                        : "border-border bg-white/50 hover:border-ink/25",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border",
                        isSelected ? "border-ink bg-ink text-ivory" : "border-border bg-white",
                      )}
                    >
                      {isSelected && <Check size={11} strokeWidth={2.5} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-[13.5px] text-ink">
                          {exp.name}
                        </span>
                        {def && (
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: def.stroke }}
                            title={def.name}
                          />
                        )}
                      </div>
                      <div className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
                        {exp.description}
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-mono text-[9.5px] text-ink-faint">
                        {exp.suggestedWidth && exp.suggestedHeight && (
                          <span>
                            {exp.suggestedWidth}×{exp.suggestedHeight} ft
                          </span>
                        )}
                        {exp.staffing && (
                          <>
                            <span>·</span>
                            <span>{exp.staffing} staff</span>
                          </>
                        )}
                        {def && (
                          <>
                            <span>·</span>
                            <span>adds to floor plan</span>
                          </>
                        )}
                      </div>
                      {exp.reasoning && (
                        <div className="mt-1 text-[10.5px] italic text-ink-faint">
                          {exp.reasoning}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
