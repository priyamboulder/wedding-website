"use client";

// ── Tab 2: Spaces & Florals ─────────────────────────────────────────────────
// Guided-discovery rebuild. Top → bottom:
//   1. Discovery intro + GuidedSpaceExplorer (with photo upload + AI recs)
//   2. Floral style by event — real/faux, flower library, palette, arrangement
//   3. Lighting mood per event (standalone)
//   4. Lighting elements gallery (standalone, with real-event photos)

import { useMemo, useState } from "react";
import { useDecorStore } from "@/stores/decor-store";
import {
  DECOR_COLORS,
  FONT_DISPLAY,
  FONT_UI,
  FONT_MONO,
  SectionHead,
  Block,
  Paper,
  TextField,
  GhostButton,
  EmptyState,
} from "../primitives";
import {
  FLORAL_PALETTE_OPTIONS,
  ARRANGEMENT_KEYWORDS,
  LIGHTING_ELEMENTS,
  FLOWER_TYPES,
  EVENT_FLOWER_HINTS,
} from "../catalog";
import type { Reaction3, FloralByEvent, FlowerUsageMode } from "@/types/decor";
import { FLOWER_USAGE_LABELS } from "@/types/decor";
import type { EventDayId } from "@/types/checklist";
import { GuidedSpaceExplorer } from "../GuidedSpaceExplorer";

const EVENT_LABELS: Partial<Record<EventDayId, string>> = {
  haldi: "Haldi",
  mehndi: "Mehendi",
  sangeet: "Sangeet",
  wedding: "Wedding",
  reception: "Reception",
  welcome: "Welcome",
  ganesh_puja: "Ganesh Puja",
  post_brunch: "Post-wedding brunch",
};

const FLORAL_EVENTS: EventDayId[] = [
  "haldi",
  "mehndi",
  "sangeet",
  "wedding",
  "reception",
];

export function SpacesFloralsTab() {
  return (
    <div>
      <DiscoveryCard />
      <GuidedSpaceExplorer />
      <FloralStyleByEvent />
      <LightingMoodBlock />
      <LightingElementsGallery />
    </div>
  );
}

// ── Discovery card ──────────────────────────────────────────────────────────
function DiscoveryCard() {
  return (
    <Block>
      <div
        className="rounded-[14px] border p-6"
        style={{
          backgroundColor: DECOR_COLORS.champagne,
          borderColor: DECOR_COLORS.line,
        }}
      >
        <div
          className="mb-1.5 text-[10px] uppercase"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.22em",
            color: DECOR_COLORS.cocoaMuted,
          }}
        >
          Designing each space
        </div>
        <p
          className="max-w-2xl text-[15px] leading-relaxed"
          style={{
            fontFamily: FONT_DISPLAY,
            color: DECOR_COLORS.cocoa,
          }}
        >
          Your wedding moves through spaces — a lawn, a ballroom, a terrace.
          Each one gets its own personality. Walk through them here and tell
          your decorator what each room should feel like.
        </p>
      </div>
    </Block>
  );
}

// ── Shared reaction button (used by florals + lighting below) ───────────────
function ReactionButton({
  active,
  onClick,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone: "rose" | "gold" | "neutral";
  children: React.ReactNode;
}) {
  const toneColor =
    tone === "rose"
      ? DECOR_COLORS.rose
      : tone === "gold"
        ? DECOR_COLORS.marigold
        : DECOR_COLORS.cocoaFaint;
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-2.5 py-0.5 text-[10.5px] transition-colors"
      style={{
        fontFamily: FONT_UI,
        border: `1px solid ${active ? toneColor : DECOR_COLORS.line}`,
        backgroundColor: active ? toneColor : "transparent",
        color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
      }}
    >
      {children}
    </button>
  );
}

// ── Floral Style by Event ───────────────────────────────────────────────────
function FloralStyleByEvent() {
  const [activeEvent, setActiveEvent] = useState<EventDayId>("sangeet");
  const floral = useDecorStore((s) =>
    s.floral_by_event.find((f) => f.event_id === activeEvent),
  );

  return (
    <Block>
      <SectionHead
        eyebrow="Florals, event by event"
        title="Floral style by event"
        body="Each event gets its own palette, energy, and scale. Flowers are a massive decision — and we know couples often don't know what they want. Browse, favourite, and mix."
      />

      <RealVsFauxGlobal />

      <div className="mt-5 mb-5 flex flex-wrap gap-1.5">
        {FLORAL_EVENTS.map((e) => {
          const active = activeEvent === e;
          return (
            <button
              key={e}
              type="button"
              onClick={() => setActiveEvent(e)}
              className="rounded-full px-3.5 py-1.5 text-[12px] transition-colors"
              style={{
                fontFamily: FONT_UI,
                backgroundColor: active ? DECOR_COLORS.cocoa : "#FFFFFF",
                color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
                border: `1px solid ${active ? DECOR_COLORS.cocoa : DECOR_COLORS.line}`,
              }}
            >
              {EVENT_LABELS[e] ?? e}
            </button>
          );
        })}
      </div>

      <p
        className="mb-4 text-[14px] italic"
        style={{ fontFamily: FONT_DISPLAY, color: DECOR_COLORS.cocoaSoft }}
      >
        What florals define your {EVENT_LABELS[activeEvent] ?? activeEvent}?
      </p>

      {floral && <FloralEventBody floral={floral} />}
    </Block>
  );
}

// ── Real vs faux (global) ──────────────────────────────────────────────────
function RealVsFauxGlobal() {
  const mode = useDecorStore((s) => s.flower_usage_mode);
  const setMode = useDecorStore((s) => s.setFlowerUsageMode);

  const options: { id: FlowerUsageMode; title: string; body: string }[] = [
    {
      id: "real",
      title: "Real flowers",
      body: "Highest impact. Biggest budget line. Dies fast.",
    },
    {
      id: "faux",
      title: "Faux flowers",
      body: "Reusable, weather-proof, budget-friendly. Harder to pass close-up.",
    },
    {
      id: "mix",
      title: "Mix of real & faux",
      body: "Real for focal moments, faux where no one's looking closely.",
    },
  ];

  return (
    <Paper className="p-4">
      <div
        className="mb-2 text-[11px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.18em",
          color: DECOR_COLORS.cocoaMuted,
        }}
      >
        Real, faux, or a mix?
      </div>
      <p
        className="mb-3 text-[12.5px]"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
      >
        This affects budget and planning. You can set a global preference and
        override it per event below.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              className="rounded-lg border p-3 text-left transition-colors"
              style={{
                fontFamily: FONT_UI,
                borderColor: active ? DECOR_COLORS.cocoa : DECOR_COLORS.line,
                backgroundColor: active
                  ? "rgba(61, 43, 31, 0.04)"
                  : "#FFFFFF",
              }}
            >
              <div
                className="text-[13px]"
                style={{
                  color: DECOR_COLORS.cocoa,
                  fontWeight: active ? 600 : 500,
                }}
              >
                {active ? "● " : "○ "}
                {opt.title}
              </div>
              <div
                className="mt-0.5 text-[11.5px] leading-snug"
                style={{ color: DECOR_COLORS.cocoaMuted }}
              >
                {opt.body}
              </div>
            </button>
          );
        })}
      </div>
    </Paper>
  );
}

function RealVsFauxForEvent({ event_id }: { event_id: EventDayId }) {
  const globalMode = useDecorStore((s) => s.flower_usage_mode);
  const perEvent = useDecorStore((s) => s.flower_usage_by_event[event_id]);
  const setForEvent = useDecorStore((s) => s.setFlowerUsageForEvent);

  const effective = perEvent ?? globalMode;
  const isOverride = perEvent != null && perEvent !== globalMode;

  const options: FlowerUsageMode[] = ["real", "faux", "mix"];

  return (
    <div>
      <div
        className="mb-2 text-[11px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.18em",
          color: DECOR_COLORS.cocoaMuted,
        }}
      >
        Real vs. faux for this event
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((opt) => {
          const active = effective === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setForEvent(event_id, opt)}
              className="rounded-full px-3 py-1 text-[11.5px] transition-colors"
              style={{
                fontFamily: FONT_UI,
                border: `1px solid ${active ? DECOR_COLORS.cocoa : DECOR_COLORS.line}`,
                backgroundColor: active ? DECOR_COLORS.cocoa : "#FFFFFF",
                color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
              }}
            >
              {FLOWER_USAGE_LABELS[opt]}
            </button>
          );
        })}
        {isOverride && (
          <button
            type="button"
            onClick={() => setForEvent(event_id, null)}
            className="text-[10.5px] opacity-60 hover:opacity-100"
            style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
          >
            Reset to global ({FLOWER_USAGE_LABELS[globalMode]})
          </button>
        )}
      </div>
    </div>
  );
}

// ── Flower library (per event) ──────────────────────────────────────────────
function FlowerLibrary({ event_id }: { event_id: EventDayId }) {
  const favorites = useDecorStore((s) => s.favorite_flowers);
  const toggle = useDecorStore((s) => s.toggleFavoriteFlower);
  const [filter, setFilter] = useState<"all" | "recommended" | "favorites">(
    "all",
  );

  const hinted = EVENT_FLOWER_HINTS[event_id] ?? [];

  const shown = useMemo(() => {
    if (filter === "favorites")
      return FLOWER_TYPES.filter((f) => favorites.includes(f.id));
    if (filter === "recommended")
      return FLOWER_TYPES.filter((f) => hinted.includes(f.id));
    return FLOWER_TYPES;
  }, [filter, favorites, hinted]);

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div
          className="text-[11px] uppercase"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.18em",
            color: DECOR_COLORS.cocoaMuted,
          }}
        >
          Flower library
        </div>
        <div className="flex items-center gap-1">
          {(["all", "recommended", "favorites"] as const).map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="rounded-full px-2.5 py-0.5 text-[10.5px] transition-colors"
                style={{
                  fontFamily: FONT_UI,
                  border: `1px solid ${active ? DECOR_COLORS.cocoa : DECOR_COLORS.line}`,
                  backgroundColor: active ? DECOR_COLORS.cocoa : "transparent",
                  color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
                }}
              >
                {f === "all"
                  ? "All"
                  : f === "recommended"
                    ? `Great for ${EVENT_LABELS[event_id] ?? event_id}`
                    : `★ Favourites (${favorites.length})`}
              </button>
            );
          })}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState>
          {filter === "favorites"
            ? "You haven't favourited any flowers yet."
            : "No flowers match this filter."}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((f) => {
            const starred = favorites.includes(f.id);
            const recommended = hinted.includes(f.id);
            const isOpen = expanded === f.id;
            return (
              <div
                key={f.id}
                className="group overflow-hidden rounded-lg border transition-colors"
                style={{
                  borderColor: starred ? DECOR_COLORS.rose : DECOR_COLORS.line,
                  backgroundColor: starred
                    ? "rgba(196, 118, 110, 0.06)"
                    : "#FFFFFF",
                }}
              >
                <div className="relative">
                  <img
                    src={f.photo_url}
                    alt={f.name}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => toggle(f.id)}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[13px] transition-colors"
                    style={{
                      color: starred ? DECOR_COLORS.rose : DECOR_COLORS.cocoa,
                    }}
                    aria-label={starred ? "Unfavourite" : "Favourite"}
                    title={starred ? "Unfavourite" : "Favourite"}
                  >
                    {starred ? "★" : "☆"}
                  </button>
                  {recommended && (
                    <div
                      className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] uppercase"
                      style={{
                        fontFamily: FONT_MONO,
                        letterSpacing: "0.16em",
                        color: DECOR_COLORS.marigold,
                      }}
                    >
                      ✦ Great
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : f.id)}
                  className="block w-full p-2 text-left"
                >
                  <div
                    className="text-[12.5px]"
                    style={{
                      fontFamily: FONT_UI,
                      color: DECOR_COLORS.cocoa,
                      fontWeight: 500,
                    }}
                  >
                    {f.name}
                  </div>
                  <div
                    className="mt-0.5 text-[10.5px]"
                    style={{
                      fontFamily: FONT_MONO,
                      color: DECOR_COLORS.cocoaFaint,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {f.season.toUpperCase()}
                  </div>
                  {isOpen && (
                    <div className="mt-2">
                      <p
                        className="text-[11.5px] italic leading-snug"
                        style={{
                          fontFamily: FONT_DISPLAY,
                          color: DECOR_COLORS.cocoaSoft,
                        }}
                      >
                        {f.note}
                      </p>
                      <p
                        className="mt-1.5 text-[11px] leading-snug"
                        style={{
                          fontFamily: FONT_UI,
                          color: DECOR_COLORS.cocoaMuted,
                        }}
                      >
                        <span
                          style={{
                            color: DECOR_COLORS.cocoaFaint,
                            fontFamily: FONT_MONO,
                            letterSpacing: "0.08em",
                          }}
                        >
                          PAIRS WITH ·{" "}
                        </span>
                        {f.pairs_well_with.join(", ")}
                      </p>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FloralEventBody({ floral }: { floral: FloralByEvent }) {
  const setPaletteReaction = useDecorStore((s) => s.setFloralPaletteReaction);
  const toggleKeyword = useDecorStore((s) => s.toggleFloralKeyword);
  const addKeyword = useDecorStore((s) => s.addFloralKeyword);
  const setScale = useDecorStore((s) => s.setFloralScale);
  const addRef = useDecorStore((s) => s.addFloralReference);
  const removeRef = useDecorStore((s) => s.removeFloralReference);
  const [customKeyword, setCustomKeyword] = useState("");
  const [url, setUrl] = useState("");

  const allKeywords = Array.from(
    new Set([...ARRANGEMENT_KEYWORDS, ...floral.arrangement_keywords]),
  );

  return (
    <div className="space-y-6">
      {/* Real vs. faux for this event */}
      <RealVsFauxForEvent event_id={floral.event_id} />

      {/* Flower library */}
      <FlowerLibrary event_id={floral.event_id} />

      {/* Flower palette */}
      <div>
        <div
          className="mb-2 text-[11px] uppercase"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.18em",
            color: DECOR_COLORS.cocoaMuted,
          }}
        >
          Flower palette
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FLORAL_PALETTE_OPTIONS.map((p) => {
            const reaction = floral.palette_reactions[p.id] ?? null;
            return (
              <Paper key={p.id} className="overflow-hidden">
                <div className="flex h-20">
                  {p.hexes.map((hex, i) => (
                    <div
                      key={`${p.id}-${i}`}
                      className="flex-1"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                <div className="p-3">
                  <div
                    className="text-[13px]"
                    style={{
                      fontFamily: FONT_UI,
                      color: DECOR_COLORS.cocoa,
                      fontWeight: 500,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    className="mt-0.5 text-[11.5px] leading-snug"
                    style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
                  >
                    {p.description}
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <ReactionButton
                      active={reaction === "love"}
                      onClick={() =>
                        setPaletteReaction(
                          floral.event_id,
                          p.id,
                          reaction === "love" ? null : "love",
                        )
                      }
                      tone="rose"
                    >
                      ♡ Love
                    </ReactionButton>
                    <ReactionButton
                      active={reaction === "not_for_us"}
                      onClick={() =>
                        setPaletteReaction(
                          floral.event_id,
                          p.id,
                          reaction === "not_for_us" ? null : "not_for_us",
                        )
                      }
                      tone="neutral"
                    >
                      ✕ Not for us
                    </ReactionButton>
                  </div>
                </div>
              </Paper>
            );
          })}
        </div>
      </div>

      {/* Arrangement keywords */}
      <div>
        <div
          className="mb-2 text-[11px] uppercase"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.18em",
            color: DECOR_COLORS.cocoaMuted,
          }}
        >
          Arrangement style
        </div>
        <div className="flex flex-wrap gap-2">
          {allKeywords.map((k) => {
            const active = floral.arrangement_keywords.includes(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleKeyword(floral.event_id, k)}
                className="rounded-full border px-3 py-1.5 text-[12px] transition-colors"
                style={{
                  fontFamily: FONT_UI,
                  borderColor: active ? DECOR_COLORS.cocoa : DECOR_COLORS.line,
                  backgroundColor: active ? DECOR_COLORS.cocoa : "#FFFFFF",
                  color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
                }}
              >
                {active ? "− " : "+ "}
                {k}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <TextField
            value={customKeyword}
            onChange={setCustomKeyword}
            placeholder="Add your own keyword…"
            className="max-w-xs"
          />
          <GhostButton
            onClick={() => {
              addKeyword(floral.event_id, customKeyword);
              setCustomKeyword("");
            }}
          >
            Add
          </GhostButton>
        </div>
      </div>

      {/* Scale slider */}
      <div>
        <div
          className="mb-2 text-[11px] uppercase"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.18em",
            color: DECOR_COLORS.cocoaMuted,
          }}
        >
          Scale preference
        </div>
        <div
          className="flex items-center gap-3 text-[12px]"
          style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
        >
          <span>Intimate & detailed</span>
          <input
            type="range"
            min={0}
            max={100}
            value={floral.scale}
            onChange={(e) => setScale(floral.event_id, Number(e.target.value))}
            className="flex-1"
          />
          <span>Grand & statement</span>
        </div>
      </div>

      {/* References */}
      <div>
        <div
          className="mb-2 text-[11px] uppercase"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.18em",
            color: DECOR_COLORS.cocoaMuted,
          }}
        >
          Floral references
        </div>
        {floral.reference_urls.length === 0 ? (
          <EmptyState>No references yet — add some below.</EmptyState>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
            {floral.reference_urls.map((u) => (
              <div
                key={u}
                className="group relative overflow-hidden rounded-md border"
                style={{ borderColor: DECOR_COLORS.line }}
              >
                <img
                  src={u}
                  alt="Floral reference"
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removeRef(floral.event_id, u)}
                  className="absolute right-1 top-1 h-5 w-5 rounded-full bg-white/90 text-[11px] opacity-0 group-hover:opacity-100"
                  style={{ color: DECOR_COLORS.cocoa }}
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <TextField
            value={url}
            onChange={setUrl}
            placeholder="Paste a floral reference URL…"
          />
          <GhostButton
            onClick={() => {
              addRef(floral.event_id, url);
              setUrl("");
            }}
          >
            Add
          </GhostButton>
        </div>
      </div>
    </div>
  );
}

// ── Lighting Mood (per-event sliders, standalone) ───────────────────────────
function LightingMoodBlock() {
  const moods = useDecorStore((s) => s.lighting_moods);
  const setMood = useDecorStore((s) => s.setLightingMood);

  return (
    <Block>
      <SectionHead
        eyebrow="How each event should feel"
        title="Lighting mood"
        body="Lighting changes how a space reads more than any other single element. Start with a mood per event — fixture choices follow below."
      />
      <Paper className="p-5">
        <div className="space-y-4">
          {FLORAL_EVENTS.map((e) => {
            const v = moods[e] ?? 50;
            return (
              <div key={e}>
                <div
                  className="mb-1 flex items-center justify-between text-[12px]"
                  style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
                >
                  <span>{EVENT_LABELS[e] ?? e}</span>
                  <span
                    className="text-[10.5px]"
                    style={{
                      fontFamily: FONT_MONO,
                      color: DECOR_COLORS.cocoaMuted,
                    }}
                  >
                    {v < 34 ? "Soft & intimate" : v < 67 ? "Balanced" : "Dramatic & vibrant"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px]"
                    style={{
                      fontFamily: FONT_MONO,
                      color: DECOR_COLORS.cocoaFaint,
                    }}
                  >
                    Soft
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={v}
                    onChange={(ev) => setMood(e, Number(ev.target.value))}
                    className="flex-1"
                  />
                  <span
                    className="text-[10px]"
                    style={{
                      fontFamily: FONT_MONO,
                      color: DECOR_COLORS.cocoaFaint,
                    }}
                  >
                    Dramatic
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Paper>
    </Block>
  );
}

// ── Lighting elements gallery (standalone, with real-event photos) ─────────
function LightingElementsGallery() {
  const reactions = useDecorStore((s) => s.lighting_element_reactions);
  const setReaction = useDecorStore((s) => s.setLightingElementReaction);

  return (
    <Block>
      <SectionHead
        eyebrow="What each lighting element looks like in a real venue"
        title="Lighting elements"
        body="Many couples have never seen pin spotting, gobos, or bistro lights in context — here they are, photographed at real events. Heart what sparks, ✕ what doesn't."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LIGHTING_ELEMENTS.map((el) => {
          const r: Reaction3 = reactions[el.id] ?? null;
          return (
            <Paper
              key={el.id}
              className="overflow-hidden"
              style={{
                borderColor:
                  r === "love"
                    ? DECOR_COLORS.rose
                    : r === "maybe"
                      ? DECOR_COLORS.marigold
                      : r === "not_for_us"
                        ? DECOR_COLORS.cocoaFaint
                        : undefined,
              }}
            >
              {el.photo_url ? (
                <img
                  src={el.photo_url}
                  alt={el.name}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="aspect-[4/3] w-full"
                  style={{ backgroundColor: DECOR_COLORS.ivoryWarm }}
                />
              )}
              <div className="p-3">
                <div
                  className="text-[13.5px]"
                  style={{
                    fontFamily: FONT_UI,
                    color: DECOR_COLORS.cocoa,
                    fontWeight: 500,
                  }}
                >
                  {el.name}
                </div>
                <div
                  className="mt-0.5 text-[12px] leading-snug"
                  style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
                >
                  {el.description}
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <ReactionButton
                    active={r === "love"}
                    onClick={() =>
                      setReaction(el.id, r === "love" ? null : "love")
                    }
                    tone="rose"
                  >
                    ♡ Love
                  </ReactionButton>
                  <ReactionButton
                    active={r === "maybe"}
                    onClick={() =>
                      setReaction(el.id, r === "maybe" ? null : "maybe")
                    }
                    tone="gold"
                  >
                    ✧ Maybe
                  </ReactionButton>
                  <ReactionButton
                    active={r === "not_for_us"}
                    onClick={() =>
                      setReaction(
                        el.id,
                        r === "not_for_us" ? null : "not_for_us",
                      )
                    }
                    tone="neutral"
                  >
                    ✕
                  </ReactionButton>
                </div>
              </div>
            </Paper>
          );
        })}
      </div>
    </Block>
  );
}
