"use client";

// ── Reference gallery block ───────────────────────────────────────────────
// Suggested editorial references rendered as gradient tiles (until real
// imagery lands). Each tile supports Love / Not for us state; a final
// "Add your own reference" tile opens an inline URL input.
//
// Generic over the record shape — callers pass in items that expose `id`
// plus a 3-color gradient. Works for InspirationImage and AttireImage
// without either module knowing about the other.

import { useState } from "react";
import { Heart, HeartOff, ImagePlus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReferenceTile {
  id: string;
  paletteHex: string[];
  url?: string | null;
  label?: string | null;
  caption?: string | null;
}

interface Props {
  title?: string;
  hint?: string;
  eyebrow?: string;
  tiles: ReferenceTile[];
  favoritedIds: string[];
  onToggleLove: (id: string) => void;
  // Optional "Not for us" state — distinct from love. When omitted, only
  // love is shown.
  avoidedIds?: string[];
  onToggleAvoid?: (id: string) => void;
  onAddOwn?: (url: string) => void;
  emptyMessage?: string;
  // "card" (default) keeps the rounded-card chrome + internal header.
  // "flat" drops both so the caller can render its own SectionHead above.
  variant?: "card" | "flat";
}

export function ReferenceGalleryBlock({
  title = "Reference gallery",
  hint = "Save what pulls you in. Mark what isn't for you.",
  eyebrow = "Reference board",
  tiles,
  favoritedIds,
  onToggleLove,
  avoidedIds = [],
  onToggleAvoid,
  onAddOwn,
  emptyMessage = "No references yet — the AI will suggest some once the event is set.",
  variant = "card",
}: Props) {
  const [ownUrl, setOwnUrl] = useState("");
  // Defensive — pre-migration event records may feed undefined here.
  const safeFavorited = Array.isArray(favoritedIds) ? favoritedIds : [];
  const safeAvoided = Array.isArray(avoidedIds) ? avoidedIds : [];

  if (tiles.length === 0 && !onAddOwn) {
    return (
      <section
        className={cn(
          "border border-dashed border-border bg-ivory-warm/30 p-6 text-center",
          variant === "card" ? "rounded-lg" : "rounded-md",
        )}
      >
        <p className="text-[13px] text-ink-muted">{emptyMessage}</p>
      </section>
    );
  }

  const isFlat = variant === "flat";

  return (
    <section className={cn(!isFlat && "editorial-section")}>
      {!isFlat && (
        <header className="mb-[18px] border-b border-ink/[0.04] pb-2.5">
          {eyebrow && (
            <p
              className="m-0 text-[10px] font-medium uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {eyebrow}
            </p>
          )}
          <h3
            className="mt-1.5 text-[22px] font-bold leading-[1.15] text-ink"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.005em",
            }}
          >
            {title}
          </h3>
          <p className="mt-1.5 max-w-[52rem] text-[13.5px] leading-[1.5] text-ink-muted">
            {hint}
          </p>
        </header>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {tiles.map((tile) => {
          const loved = safeFavorited.includes(tile.id);
          const avoided = safeAvoided.includes(tile.id);
          return (
            <figure key={tile.id} className="group relative">
              <div
                className={cn(
                  "relative aspect-[4/5] w-full overflow-hidden rounded-md border transition-colors",
                  loved
                    ? "border-saffron/70"
                    : avoided
                      ? "border-border opacity-60"
                      : "border-border",
                )}
                style={{
                  background: gradientFor(tile.paletteHex),
                }}
              >
                {tile.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tile.url}
                    alt={tile.label ?? "Reference"}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/30 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => onToggleLove(tile.id)}
                    aria-pressed={loved}
                    aria-label={loved ? "Unlove" : "Love"}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border bg-white/90 transition-colors",
                      loved
                        ? "border-saffron text-saffron"
                        : "border-border text-ink-muted hover:text-saffron",
                    )}
                  >
                    <Heart
                      size={12}
                      strokeWidth={1.8}
                      fill={loved ? "currentColor" : "none"}
                    />
                  </button>
                  {onToggleAvoid && (
                    <button
                      type="button"
                      onClick={() => onToggleAvoid(tile.id)}
                      aria-pressed={avoided}
                      aria-label={avoided ? "Unmark not for us" : "Not for us"}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border bg-white/90 transition-colors",
                        avoided
                          ? "border-ink text-ink"
                          : "border-border text-ink-muted hover:text-ink",
                      )}
                    >
                      <HeartOff size={12} strokeWidth={1.8} />
                    </button>
                  )}
                </div>
                {loved && (
                  <span
                    aria-hidden
                    className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-saffron"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Heart size={9} strokeWidth={2} fill="currentColor" /> Loved
                  </span>
                )}
                {avoided && !loved && (
                  <span
                    aria-hidden
                    className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Not for us
                  </span>
                )}
              </div>
              {(tile.label || tile.caption) && (
                <figcaption className="mt-1.5 text-[11.5px] text-ink-muted">
                  {tile.label}
                  {tile.caption && (
                    <span className="block text-ink-faint">{tile.caption}</span>
                  )}
                </figcaption>
              )}
            </figure>
          );
        })}
        {onAddOwn && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = ownUrl.trim();
              if (!v) return;
              onAddOwn(v);
              setOwnUrl("");
            }}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-ivory-warm/30 p-3 text-center"
          >
            <ImagePlus
              size={18}
              strokeWidth={1.5}
              className="text-ink-faint"
              aria-hidden
            />
            <p className="text-[11.5px] leading-tight text-ink-muted">
              Add your own reference
            </p>
            <input
              value={ownUrl}
              onChange={(e) => setOwnUrl(e.target.value)}
              placeholder="Paste image URL…"
              className="w-full rounded border border-border bg-white px-2 py-1 text-[11px] text-ink outline-none focus:border-gold/60"
            />
            <button
              type="submit"
              disabled={!ownUrl.trim()}
              className="inline-flex items-center gap-1 rounded border border-border bg-white px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-gold/60 hover:text-ink disabled:opacity-40"
            >
              <Plus size={10} /> Add
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function gradientFor(hex: string[]): string {
  if (hex.length === 0) return "#EDE7DC";
  if (hex.length === 1) return hex[0]!;
  const stops = hex
    .map(
      (c, i) =>
        `${c} ${Math.round((i / (hex.length - 1)) * 100)}%`,
    )
    .join(", ");
  return `linear-gradient(135deg, ${stops})`;
}
