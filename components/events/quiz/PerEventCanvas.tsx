"use client";

// ── Per-event canvas (v4 Q4) ───────────────────────────────────────────────
// Consolidates v3's Q4 (vibe) + Q5 (hero palette) into a single long-scroll
// canvas per event. Three sub-sections, each tracked on the event rail:
//
//   1. Name & theme — 2×2 AI suggestion chips + Generate-more / Refine /
//      Write-my-own controls
//   2. Inspiration — favorited images grid
//   3. Palette — 6 curated palettes + Coolors-style workbench
//
// Progress bumps the rail's per-event dot from empty → partial → filled
// and drives the quiz's Next-button gating via isEventReady().

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateVibeOptions,
  paletteSwatchesFor,
  rankPalettesFromFavorites,
  regenerateUnlockedSwatches,
  type RankedPalette,
} from "@/lib/events/ai";
import { EVENT_TYPE_OPTIONS, PALETTE_LIBRARY } from "@/lib/events-seed";
import {
  getInspirationImage,
  getInspirationImagesFor,
} from "@/lib/events/inspiration-seed";
import {
  GARMENT_LABEL,
  attireMatchesChips,
  getAttireChipsFor,
  getAttireImagesFor,
  type AttireChip,
} from "@/lib/events/attire-seed";
import { useEventsStore } from "@/stores/events-store";
import type {
  AttireImage,
  EventRecord,
  InspirationImage,
  PaletteSwatch,
} from "@/types/events";
import { AiSuggestionChips } from "./AiSuggestionChips";
import { PaletteWorkbench } from "./PaletteWorkbench";

const INITIAL_IMAGES_SHOWN = 12;
const IMAGE_PAGE = 12;
const FAVORITES_HINT_THRESHOLD = 3;

// Shared helper — callers on EventsQuizFlow use this to decide whether
// Next advances from the per-event canvas.
export function isEventReady(event: EventRecord): boolean {
  const nameReady = Boolean(
    (event.selectedNameOptionIndex !== null && event.aiNameOptions?.[event.selectedNameOptionIndex!]) ||
      (event.customEventName && event.customEventName.trim()),
  );
  const paletteReady = Boolean(event.paletteId || event.customPalette);
  return nameReady && paletteReady;
}

// Returns current sub-step progress for the rail dot.
export function eventProgressState(
  event: EventRecord,
): "empty" | "partial" | "filled" {
  const name = Boolean(
    event.selectedNameOptionIndex !== null ||
      (event.customEventName && event.customEventName.trim()),
  );
  const palette = Boolean(event.paletteId || event.customPalette);
  if (name && palette) return "filled";
  if (
    name ||
    palette ||
    (event.favoritedImageIds?.length ?? 0) > 0 ||
    (event.favoritedAttireIds?.length ?? 0) > 0
  ) {
    return "partial";
  }
  return "empty";
}

// ── Per-event canvas (main) ────────────────────────────────────────────────

export function PerEventCanvas({ event }: { event: EventRecord }) {
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const setEventAiNameOptions = useEventsStore((s) => s.setEventAiNameOptions);
  const selectEventNameOption = useEventsStore((s) => s.selectEventNameOption);
  const setEventCustomNameTheme = useEventsStore((s) => s.setEventCustomNameTheme);
  const clearEventNameSelection = useEventsStore((s) => s.clearEventNameSelection);
  const toggleFavoriteImage = useEventsStore((s) => s.toggleFavoriteImage);
  const toggleFavoriteAttire = useEventsStore((s) => s.toggleFavoriteAttire);
  const setEventPalette = useEventsStore((s) => s.setEventPalette);
  const setEventCustomPalette = useEventsStore((s) => s.setEventCustomPalette);
  const toggleEventPaletteLock = useEventsStore((s) => s.toggleEventPaletteLock);
  const setEventPaletteLockedPositions = useEventsStore(
    (s) => s.setEventPaletteLockedPositions,
  );
  const setEventPaletteCustomName = useEventsStore(
    (s) => s.setEventPaletteCustomName,
  );

  const favoritedImages = useMemo<InspirationImage[]>(
    () =>
      (event.favoritedImageIds ?? [])
        .map((id) => getInspirationImage(id))
        .filter((img): img is InspirationImage => Boolean(img)),
    [event.favoritedImageIds],
  );

  // Generation tracking — rotation increments per "Generate more" click,
  // noteRotation per refinement note so rotations are distinct.
  const [rotation, setRotation] = useState(0);
  const [shownLabels, setShownLabels] = useState<string[]>([]);
  const [favoritesSnapshotAtGen, setFavoritesSnapshotAtGen] = useState(0);
  const [writeMode, setWriteMode] = useState(
    Boolean(event.customEventName || event.customTheme),
  );

  // First-load generation when aiNameOptions is null.
  useEffect(() => {
    if (event.aiNameOptions === null && !writeMode) {
      const options = generateVibeOptions({
        event,
        coupleContext,
        favoritedImages,
        rotation: 0,
      });
      setEventAiNameOptions(event.id, options);
      setShownLabels(options.map((o) => o.vibeLabel));
      setFavoritesSnapshotAtGen(favoritedImages.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id, event.aiNameOptions, writeMode]);

  function handleSelect(index: number) {
    selectEventNameOption(event.id, index);
  }
  function handleGenerateMore() {
    const nextRotation = rotation + 1;
    const options = generateVibeOptions({
      event,
      coupleContext,
      favoritedImages,
      rotation: nextRotation,
      avoidLabels: shownLabels,
    });
    setEventAiNameOptions(event.id, options);
    setRotation(nextRotation);
    setShownLabels((prev) =>
      Array.from(new Set([...prev, ...options.map((o) => o.vibeLabel)])),
    );
    setFavoritesSnapshotAtGen(favoritedImages.length);
  }
  function handleRefine(note: string) {
    const options = generateVibeOptions({
      event,
      coupleContext,
      favoritedImages,
      rotation: rotation + 1,
      refinementNote: note,
    });
    setEventAiNameOptions(event.id, options);
    setRotation((r) => r + 1);
    setShownLabels((prev) =>
      Array.from(new Set([...prev, ...options.map((o) => o.vibeLabel)])),
    );
    setFavoritesSnapshotAtGen(favoritedImages.length);
  }
  function handleEnterWriteMyOwn() {
    setWriteMode(true);
    clearEventNameSelection(event.id);
  }
  function handleExitWriteMyOwn() {
    setWriteMode(false);
    // Re-trigger AI options by clearing — the effect above will regenerate.
    setEventAiNameOptions(event.id, []);
    setEventCustomNameTheme(event.id, "", "");
    setTimeout(() => {
      const options = generateVibeOptions({
        event,
        coupleContext,
        favoritedImages,
        rotation: rotation + 1,
      });
      setEventAiNameOptions(event.id, options);
      setRotation((r) => r + 1);
    }, 0);
  }

  const showUpdatedBanner =
    !writeMode &&
    favoritedImages.length >= FAVORITES_HINT_THRESHOLD &&
    favoritedImages.length > favoritesSnapshotAtGen + 1;

  return (
    <div className="min-w-0 space-y-10">
      <EventHeader event={event} />

      <SubStepProgress event={event} />

      {/* ── AI suggestion chips ─────────────────────────────────────── */}
      <AiSuggestionChipsController
        event={event}
        writeMode={writeMode}
        onSelect={handleSelect}
        onGenerateMore={handleGenerateMore}
        onRefine={handleRefine}
        onEnterWriteMyOwn={handleEnterWriteMyOwn}
        onExitWriteMyOwn={handleExitWriteMyOwn}
        onCustomSubmit={(name, theme) => setEventCustomNameTheme(event.id, name, theme)}
      />

      {showUpdatedBanner && (
        <FavoritesUpdatedBanner
          onRegenerate={handleGenerateMore}
          count={favoritedImages.length}
        />
      )}

      {/* ── Inspiration ─────────────────────────────────────────────── */}
      <InspirationSection
        event={event}
        onToggleFavorite={(imageId) => toggleFavoriteImage(event.id, imageId)}
      />

      {/* ── Attire ──────────────────────────────────────────────────── */}
      <AttireSection
        event={event}
        onToggleFavorite={(attireId) => toggleFavoriteAttire(event.id, attireId)}
      />

      {/* ── Palette (curated + workbench) ───────────────────────────── */}
      <PaletteSection
        event={event}
        favoritedImages={favoritedImages}
        onPickCurated={(paletteId) => {
          setEventPalette(event.id, paletteId);
          setEventCustomPalette(event.id, null);
          setEventPaletteLockedPositions(event.id, []);
        }}
        onSwatchReplace={(position, entry) => {
          const current = getActiveSwatches(event);
          const next = [...current];
          next[position] = {
            hex: entry.hex,
            name: entry.name,
            role: current[position]?.role ?? "accent",
          };
          setEventCustomPalette(event.id, next);
        }}
        onToggleLock={(position) => toggleEventPaletteLock(event.id, position)}
        onRegenerate={() => {
          const current = getActiveSwatches(event);
          const next = regenerateUnlockedSwatches({
            current,
            lockedPositions: event.paletteLockedPositions,
            vibeLabel: event.vibeLabel,
            rotation: Math.floor(Math.random() * 1000),
          });
          setEventCustomPalette(event.id, next);
        }}
        onAddSwatch={() => {
          const current = getActiveSwatches(event);
          if (current.length >= 7) return;
          const added: PaletteSwatch = {
            hex: "#EDE4D3",
            name: "Oat",
            role: "accent",
          };
          setEventCustomPalette(event.id, [...current, added]);
        }}
        onRename={(name) =>
          setEventPaletteCustomName(event.id, name || null)
        }
        onBuildFromScratch={() => {
          const blank: PaletteSwatch[] = Array.from({ length: 5 }, (_, i) => ({
            hex: "#EDE4D3",
            name: "Oat",
            role: i === 0 ? "primary" : i === 4 ? "highlight" : "accent",
          }));
          setEventPalette(event.id, null);
          setEventCustomPalette(event.id, blank);
          setEventPaletteLockedPositions(event.id, []);
        }}
      />
    </div>
  );
}

// ── Event header ──────────────────────────────────────────────────────────

function EventHeader({ event }: { event: EventRecord }) {
  const opt = EVENT_TYPE_OPTIONS.find((o) => o.id === event.type);
  const displayName =
    event.customEventName?.trim() || event.vibeEventName || opt?.name || event.type;
  return (
    <header className="border-b border-border pb-4">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {opt?.name ?? event.type} · Vibe & palette
      </p>
      <h2 className="mt-1 font-serif text-[24px] leading-tight text-ink">
        {displayName}
      </h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
        {event.guestCount} guests · {opt?.blurb ?? ""}
      </p>
    </header>
  );
}

// ── Sub-step progress indicator ──────────────────────────────────────────

function SubStepProgress({ event }: { event: EventRecord }) {
  const nameDone = Boolean(
    event.selectedNameOptionIndex !== null ||
      (event.customEventName && event.customEventName.trim()),
  );
  const inspDone =
    (event.favoritedImageIds?.length ?? 0) >= FAVORITES_HINT_THRESHOLD;
  const attireDone =
    (event.favoritedAttireIds?.length ?? 0) >= FAVORITES_HINT_THRESHOLD;
  const paletteDone = Boolean(event.paletteId || event.customPalette);
  const steps = [
    { label: "Name & theme", done: nameDone },
    { label: "Inspiration", done: inspDone },
    { label: "Attire", done: attireDone },
    { label: "Palette", done: paletteDone },
  ];
  return (
    <ul
      className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "flex h-3 w-3 items-center justify-center border",
              s.done ? "border-ink bg-ink text-white" : "border-border bg-white",
            )}
          >
            {s.done && <Check size={7} strokeWidth={3} />}
          </span>
          <span className={s.done ? "text-ink" : "text-ink-muted"}>{s.label}</span>
          {i < steps.length - 1 && (
            <span aria-hidden className="block h-px w-8 bg-border" />
          )}
        </li>
      ))}
    </ul>
  );
}

// ── Controller wrapping AiSuggestionChips ────────────────────────────────

function AiSuggestionChipsController({
  event,
  writeMode,
  onSelect,
  onGenerateMore,
  onRefine,
  onEnterWriteMyOwn,
  onExitWriteMyOwn,
  onCustomSubmit,
}: {
  event: EventRecord;
  writeMode: boolean;
  onSelect: (index: number) => void;
  onGenerateMore: () => void;
  onRefine: (note: string) => void;
  onEnterWriteMyOwn: () => void;
  onExitWriteMyOwn: () => void;
  onCustomSubmit: (name: string, theme: string) => void;
}) {
  const options = event.aiNameOptions ?? [];
  return (
    <AiSuggestionChips
      options={options}
      selectedIndex={event.selectedNameOptionIndex}
      onSelect={onSelect}
      onGenerateMore={onGenerateMore}
      onRefine={onRefine}
      writeMyOwn={
        writeMode
          ? {
              name: event.customEventName ?? "",
              theme: event.customTheme ?? "",
            }
          : null
      }
      onEnterWriteMyOwn={onEnterWriteMyOwn}
      onExitWriteMyOwn={onExitWriteMyOwn}
      onCustomSubmit={onCustomSubmit}
    />
  );
}

// ── Favorites banner ─────────────────────────────────────────────────────

function FavoritesUpdatedBanner({
  onRegenerate,
  count,
}: {
  onRegenerate: () => void;
  count: number;
}) {
  return (
    <div className="flex items-start gap-2 border-l-2 border-gold bg-gold-pale/30 px-4 py-3 text-[12.5px] leading-relaxed">
      <span className="flex-1 text-ink">
        Your {count} favorites suggest a different direction.
      </span>
      <button
        type="button"
        onClick={onRegenerate}
        className="shrink-0 border border-ink bg-white px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-ink hover:text-white"
      >
        See 4 updated ideas
      </button>
    </div>
  );
}

// ── Inspiration section ──────────────────────────────────────────────────

function InspirationSection({
  event,
  onToggleFavorite,
}: {
  event: EventRecord;
  onToggleFavorite: (imageId: string) => void;
}) {
  const allImages = useMemo(
    () => getInspirationImagesFor(event.type),
    [event.type],
  );
  const [shown, setShown] = useState(INITIAL_IMAGES_SHOWN);
  const visible = allImages.slice(0, shown);
  const canLoadMore = shown < allImages.length;
  const favoriteSet = useMemo(
    () => new Set(event.favoritedImageIds ?? []),
    [event.favoritedImageIds],
  );

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Inspiration — tap to favorite
        </p>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {event.favoritedImageIds?.length ?? 0} favorited
        </span>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {visible.map((img) => {
          const on = favoriteSet.has(img.id);
          return (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => onToggleFavorite(img.id)}
                aria-pressed={on}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden border transition-all",
                  on ? "border-ink" : "border-border hover:border-ink/40",
                )}
              >
                <InspirationVisual image={img} />
                {on && (
                  <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center bg-ink text-white">
                    <Check size={9} strokeWidth={3} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShown((n) => n + IMAGE_PAGE)}
          disabled={!canLoadMore}
          className="border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {canLoadMore
            ? `Load more (${allImages.length - shown} left)`
            : "You've seen everything for this event"}
        </button>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Pinterest board paste · coming soon
        </span>
      </div>
    </section>
  );
}

function InspirationVisual({ image }: { image: InspirationImage }) {
  if (image.url) {
    return (
      <img
        src={image.url}
        alt={image.tags.slice(0, 3).join(", ")}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }
  const stops = image.paletteHex;
  const gradient =
    stops.length === 1 ? stops[0] : `linear-gradient(135deg, ${stops.join(", ")})`;
  return (
    <span
      aria-hidden
      className="block h-full w-full"
      style={{ background: gradient }}
    />
  );
}

// ── Attire section ───────────────────────────────────────────────────────
// Second inspiration band, scoped to the same selected event. Reuses the
// mood grid's tap-to-favorite visual language (square tiles, checkmark
// pill, inline counter) and adds a filter-chip row whose set varies per
// event category (see lib/events/attire-seed.ts).

function AttireSection({
  event,
  onToggleFavorite,
}: {
  event: EventRecord;
  onToggleFavorite: (attireId: string) => void;
}) {
  const allAttire = useMemo(
    () => getAttireImagesFor(event.type),
    [event.type],
  );
  const chips = useMemo(() => getAttireChipsFor(event.type), [event.type]);
  const [activeChipIds, setActiveChipIds] = useState<string[]>([]);
  const [shown, setShown] = useState(INITIAL_IMAGES_SHOWN);
  const favoriteSet = useMemo(
    () => new Set(event.favoritedAttireIds ?? []),
    [event.favoritedAttireIds],
  );

  // Reset chip selection when the event changes — chips mean different
  // things across event categories and carrying "bride" from Ceremony into
  // Reception is fine, but carrying "classic_red" isn't.
  useEffect(() => {
    setActiveChipIds([]);
    setShown(INITIAL_IMAGES_SHOWN);
  }, [event.type]);

  const filtered = useMemo(
    () => allAttire.filter((img) => attireMatchesChips(img, activeChipIds, chips)),
    [allAttire, activeChipIds, chips],
  );
  const visible = filtered.slice(0, shown);
  const canLoadMore = shown < filtered.length;

  function toggleChip(id: string) {
    setActiveChipIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
    setShown(INITIAL_IMAGES_SHOWN);
  }

  const showNudge = (event.favoritedAttireIds?.length ?? 0) === 0;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Attire — tap to favorite
        </p>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {event.favoritedAttireIds?.length ?? 0} favorited
        </span>
      </div>

      <AttireChipRow
        chips={chips}
        activeChipIds={activeChipIds}
        onToggle={toggleChip}
        onClear={() => setActiveChipIds([])}
      />

      {visible.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {visible.map((img) => {
            const on = favoriteSet.has(img.id);
            return (
              <li key={img.id}>
                <AttireTile
                  image={img}
                  favorited={on}
                  onToggle={() => onToggleFavorite(img.id)}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <AttireEmptyState filtered={activeChipIds.length > 0} />
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShown((n) => n + IMAGE_PAGE)}
          disabled={!canLoadMore}
          className="border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {canLoadMore
            ? `Load more (${filtered.length - shown} left)`
            : "You've seen every look for this event"}
        </button>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Pinterest board paste · coming soon
        </span>
      </div>

      {showNudge && (
        <p className="mt-3 flex items-start gap-2 border-l-2 border-gold bg-gold-pale/30 px-4 py-3 text-[12.5px] leading-relaxed text-ink">
          Add a few attire favorites so your stylist, HMUA, and designer
          know where to start.
        </p>
      )}
    </section>
  );
}

function AttireChipRow({
  chips,
  activeChipIds,
  onToggle,
  onClear,
}: {
  chips: AttireChip[];
  activeChipIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  const allOn = activeChipIds.length === 0;
  return (
    <ul
      className="mt-3 flex flex-wrap gap-1.5"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <li>
        <button
          type="button"
          onClick={onClear}
          aria-pressed={allOn}
          className={cn(
            "inline-flex items-center border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors",
            allOn
              ? "border-gold bg-gold text-white"
              : "border-border bg-white text-ink-muted hover:border-ink/40",
          )}
        >
          All
        </button>
      </li>
      {chips.map((chip) => {
        const on = activeChipIds.includes(chip.id);
        return (
          <li key={chip.id}>
            <button
              type="button"
              onClick={() => onToggle(chip.id)}
              aria-pressed={on}
              className={cn(
                "inline-flex items-center border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors",
                on
                  ? "border-gold bg-gold text-white"
                  : "border-border bg-white text-ink-muted hover:border-ink/40",
              )}
            >
              {chip.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function AttireTile({
  image,
  favorited,
  onToggle,
}: {
  image: AttireImage;
  favorited: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={favorited}
      className={cn(
        "group relative block aspect-square w-full overflow-hidden border transition-all",
        favorited ? "border-ink" : "border-border hover:border-ink/40",
      )}
    >
      <AttireVisual image={image} />
      {favorited && (
        <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center bg-ink text-white">
          <Check size={9} strokeWidth={3} />
        </span>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink/60 to-transparent px-2 py-1.5 text-left opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      >
        <span className="block font-serif text-[11.5px] leading-tight text-white">
          {GARMENT_LABEL[image.garmentType]}
        </span>
        <span
          className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-white/80"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {image.sourceCredit}
        </span>
      </span>
    </button>
  );
}

function AttireVisual({ image }: { image: AttireImage }) {
  if (image.url) {
    return (
      <img
        src={image.url}
        alt={`${GARMENT_LABEL[image.garmentType]} · ${image.sourceCredit}`}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }
  const stops = image.paletteHex;
  const gradient =
    stops.length === 1 ? stops[0] : `linear-gradient(135deg, ${stops.join(", ")})`;
  return (
    <span
      aria-hidden
      className="block h-full w-full"
      style={{ background: gradient }}
    />
  );
}

function AttireEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="mt-3 border border-dashed border-border bg-white px-5 py-8 text-center text-[12.5px] leading-relaxed text-ink-muted">
      {filtered
        ? "No looks match those filters yet. Clear a chip to see more."
        : "Tap looks you love — we'll use these to brief your stylist, HMUA, and designer."}
    </div>
  );
}

// ── Palette section (curated + workbench) ────────────────────────────────

function getActiveSwatches(event: EventRecord): PaletteSwatch[] {
  if (event.customPalette && event.customPalette.length > 0) {
    return event.customPalette;
  }
  if (event.paletteId) {
    const p = PALETTE_LIBRARY.find((p) => p.id === event.paletteId);
    if (p) return paletteSwatchesFor(p);
  }
  return [];
}

function PaletteSection({
  event,
  favoritedImages,
  onPickCurated,
  onSwatchReplace,
  onToggleLock,
  onRegenerate,
  onAddSwatch,
  onRename,
  onBuildFromScratch,
}: {
  event: EventRecord;
  favoritedImages: InspirationImage[];
  onPickCurated: (paletteId: string) => void;
  onSwatchReplace: (position: number, entry: { hex: string; name: string }) => void;
  onToggleLock: (position: number) => void;
  onRegenerate: () => void;
  onAddSwatch: () => void;
  onRename: (name: string) => void;
  onBuildFromScratch: () => void;
}) {
  const ranked: RankedPalette[] = useMemo(
    () =>
      rankPalettesFromFavorites({
        favoritedImages,
        vibeLabel: event.vibeLabel,
      }),
    [favoritedImages, event.vibeLabel],
  );

  const activeSwatches = getActiveSwatches(event);
  const activePalette = event.paletteId
    ? PALETTE_LIBRARY.find((p) => p.id === event.paletteId)
    : null;
  const displayedName =
    event.paletteCustomName?.trim() ||
    activePalette?.name ||
    (event.customPalette ? "Custom palette" : "Your palette");

  return (
    <section className="space-y-6 border-t border-border pt-6">
      <div>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Palette — your colors for this event
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
          AI-ranked based on your favorites. Pick one to refine, or build
          from scratch.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {ranked.map(({ palette, rationale }) => {
          const on = event.paletteId === palette.id && !event.customPalette;
          return (
            <li key={palette.id}>
              <button
                type="button"
                onClick={() => onPickCurated(palette.id)}
                aria-pressed={on}
                className={cn(
                  "w-full overflow-hidden border bg-white text-left transition-all",
                  on ? "border-ink" : "border-border hover:border-ink/40",
                )}
              >
                <div className="flex h-12 w-full">
                  {palette.colors.map((c) => (
                    <div
                      key={c.hex}
                      className="flex-1"
                      style={{ backgroundColor: c.hex }}
                      aria-label={c.name}
                    />
                  ))}
                </div>
                <div className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <div>
                    <p className="font-serif text-[15px] leading-tight text-ink">
                      {palette.name}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
                      {rationale}
                    </p>
                  </div>
                  {on && (
                    <span className="flex h-3 w-3 shrink-0 items-center justify-center bg-ink text-white">
                      <Check size={8} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {activeSwatches.length > 0 ? (
        <PaletteWorkbench
          paletteName={displayedName}
          swatches={activeSwatches}
          lockedPositions={event.paletteLockedPositions}
          onToggleLock={onToggleLock}
          onReplaceAt={onSwatchReplace}
          onRegenerate={onRegenerate}
          onAddSwatch={onAddSwatch}
          onRenamePalette={onRename}
          paletteCustomName={event.paletteCustomName}
        />
      ) : (
        <div className="border border-dashed border-border bg-white px-5 py-6 text-[12.5px] text-ink-muted">
          Pick a curated palette above to open the workbench, or{" "}
          <button
            type="button"
            onClick={onBuildFromScratch}
            className="underline-offset-2 hover:text-ink hover:underline"
          >
            build from scratch
          </button>
          .
        </div>
      )}
    </section>
  );
}
