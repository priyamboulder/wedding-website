"use client";

// ── Zone A — Inspiration Wall ───────────────────────────────────────────────
// Masonry grid of every image saved for this wedding. Paste a URL, it gets
// ingested + tagged (stubbed via /api/aesthetic/ingest). Click a tile to
// open the detail drawer. Filter by any tag to narrow the wall.

import {
  useCallback,
  useMemo,
  useState,
  type DragEvent,
} from "react";
import { Link2, Loader2, Search, Tag, X, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAestheticStore, paletteGradient } from "@/stores/aesthetic-store";
import type {
  InspirationImage,
  InspirationTags,
  PaletteSwatch,
} from "@/types/aesthetic";

// ── Ingestion helpers ───────────────────────────────────────────────────────

async function requestTags(
  imageId: string,
  sourceUrl: string,
): Promise<InspirationTags | null> {
  try {
    const res = await fetch("/api/aesthetic/tag", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ imageId, sourceUrl }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { tags: InspirationTags };
    return json.tags;
  } catch {
    return null;
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export function InspirationWall() {
  const images = useAestheticStore((s) => s.images);
  const directions = useAestheticStore((s) => s.directions);
  const addImagesFromUrl = useAestheticStore((s) => s.addImagesFromUrl);
  const setImageTags = useAestheticStore((s) => s.setImageTags);
  const setImageTagStatus = useAestheticStore((s) => s.setImageTagStatus);
  const assignImageToDirection = useAestheticStore(
    (s) => s.assignImageToDirection,
  );
  const deleteImage = useAestheticStore((s) => s.deleteImage);
  const updateImageNotes = useAestheticStore((s) => s.updateImageNotes);

  const [pasteUrl, setPasteUrl] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [openImageId, setOpenImageId] = useState<string | null>(null);

  // All available filter tags across the wall
  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const img of images) {
      if (!img.ai_tags) continue;
      for (const t of img.ai_tags.textures) s.add(t);
      for (const m of img.ai_tags.mood) s.add(m);
      for (const el of img.ai_tags.elements) s.add(el);
    }
    return Array.from(s).sort();
  }, [images]);

  const filtered = useMemo(() => {
    if (!filter) return images;
    return images.filter((img) => {
      if (!img.ai_tags) return false;
      const bag = [
        ...img.ai_tags.textures,
        ...img.ai_tags.mood,
        ...img.ai_tags.elements,
      ];
      return bag.includes(filter);
    });
  }, [images, filter]);

  const onPasteSubmit = useCallback(async () => {
    const url = pasteUrl.trim();
    if (!url) return;
    setIsIngesting(true);
    const created = addImagesFromUrl(url);
    setPasteUrl("");

    // Fire-and-forget tagging for each newly created image.
    await Promise.all(
      created.map(async (img) => {
        setImageTagStatus(img.id, "tagging");
        const tags = await requestTags(img.id, img.source_url);
        if (tags) setImageTags(img.id, tags);
        else setImageTagStatus(img.id, "failed");
      }),
    );
    setIsIngesting(false);
  }, [pasteUrl, addImagesFromUrl, setImageTags, setImageTagStatus]);

  const openImage = openImageId
    ? images.find((img) => img.id === openImageId) ?? null
    : null;

  return (
    <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-ivory)]">
      <div className="px-6 pt-6 pb-4 flex items-baseline justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)]">
            Zone A
          </div>
          <h2 className="font-serif text-2xl text-[color:var(--color-ink)] mt-0.5">
            Inspiration wall
          </h2>
        </div>
        <div className="font-mono text-xs text-[color:var(--color-ink-muted)]">
          {images.length} images · {images.filter((i) => !i.direction_id).length} unassigned
        </div>
      </div>

      {/* Paste bar + filter chip row */}
      <div className="px-6 pb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-xl border border-[color:var(--color-border)] bg-white px-3 py-2 rounded-sm">
          <Link2 className="w-4 h-4 text-[color:var(--color-ink-muted)]" />
          <input
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onPasteSubmit();
            }}
            placeholder="Paste a Pinterest, Instagram, or vendor URL"
            className="flex-1 bg-transparent text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-faint)] focus:outline-none"
          />
          <button
            type="button"
            onClick={onPasteSubmit}
            disabled={!pasteUrl.trim() || isIngesting}
            className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-light)] disabled:text-[color:var(--color-ink-faint)]"
          >
            {isIngesting ? "Ingesting…" : "Add"}
          </button>
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-[color:var(--color-ink-muted)]" />
            {(filter ? [filter] : allTags.slice(0, 10)).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(filter === t ? null : t)}
                className={cn(
                  "font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-sm border",
                  filter === t
                    ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-ivory)]"
                    : "border-[color:var(--color-border)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-ink)] hover:text-[color:var(--color-ink)]",
                )}
              >
                {t}
              </button>
            ))}
            {filter && (
              <button
                type="button"
                onClick={() => setFilter(null)}
                className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
                aria-label="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Masonry — CSS columns fallback, no JS layout */}
      <div className="px-6 pb-6">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-5 gap-3 [column-fill:_balance]">
            {filtered.map((img) => (
              <ImageTile
                key={img.id}
                image={img}
                onOpen={() => setOpenImageId(img.id)}
                onAssign={(directionId) =>
                  assignImageToDirection(img.id, directionId)
                }
                directions={directions.map((d) => ({ id: d.id, name: d.name }))}
              />
            ))}
          </div>
        )}
      </div>

      {openImage && (
        <ImageDetailDrawer
          image={openImage}
          directions={directions.map((d) => ({ id: d.id, name: d.name }))}
          onClose={() => setOpenImageId(null)}
          onAssign={(directionId) =>
            assignImageToDirection(openImage.id, directionId)
          }
          onDelete={() => {
            deleteImage(openImage.id);
            setOpenImageId(null);
          }}
          onNotesChange={(notes) => updateImageNotes(openImage.id, notes)}
          onFilterByTag={(tag) => {
            setFilter(tag);
            setOpenImageId(null);
          }}
        />
      )}
    </section>
  );
}

// ── Tile ────────────────────────────────────────────────────────────────────

interface ImageTileProps {
  image: InspirationImage;
  onOpen: () => void;
  onAssign: (directionId: string | null) => void;
  directions: { id: string; name: string }[];
}

function ImageTile({ image, onOpen, onAssign, directions }: ImageTileProps) {
  // Deterministic tile height from id — keeps the masonry visually interesting
  // without needing real image dimensions.
  const heights = ["h-40", "h-56", "h-48", "h-64", "h-44"];
  const idx =
    image.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    heights.length;
  const heightClass = heights[idx];

  const palette = image.ai_tags?.palette ?? [];
  const gradient = paletteGradient(palette);

  const directionName = directions.find(
    (d) => d.id === image.direction_id,
  )?.name;

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/aesthetic-image-id", image.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onOpen}
      className={cn(
        "break-inside-avoid mb-3 rounded-sm overflow-hidden border border-[color:var(--color-border)] cursor-pointer group relative",
        heightClass,
      )}
      style={
        image.storage_url
          ? undefined
          : { backgroundImage: gradient, backgroundSize: "cover" }
      }
    >
      {image.storage_url && (
        <img
          src={image.storage_url}
          alt=""
          className="w-full h-full object-cover"
        />
      )}

      {/* Tag-status overlay */}
      {image.tag_status !== "ready" && (
        <div className="absolute inset-0 bg-[color:var(--color-ink)]/40 flex items-center justify-center">
          {image.tag_status === "tagging" && (
            <Loader2 className="w-5 h-5 text-[color:var(--color-ivory)] animate-spin" />
          )}
          {image.tag_status === "pending" && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ivory)]">
              Pending
            </span>
          )}
          {image.tag_status === "failed" && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-rose-light)]">
              Failed
            </span>
          )}
        </div>
      )}

      {/* Hover overlay — direction pill, quick-assign */}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-[color:var(--color-ink)]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between gap-2">
        {directionName ? (
          <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ivory)] bg-[color:var(--color-ink)]/60 px-1.5 py-0.5 rounded-sm truncate">
            {directionName}
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ivory)]/80">
            Unassigned
          </span>
        )}
        {directions.length > 0 && (
          <select
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const v = e.target.value;
              onAssign(v === "" ? null : v);
            }}
            value={image.direction_id ?? ""}
            className="font-mono text-[10px] uppercase tracking-wider bg-[color:var(--color-ivory)] text-[color:var(--color-ink)] border border-[color:var(--color-border)] px-1 py-0.5 rounded-sm"
          >
            <option value="">Unassigned</option>
            {directions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// ── Detail drawer ───────────────────────────────────────────────────────────

interface DrawerProps {
  image: InspirationImage;
  directions: { id: string; name: string }[];
  onClose: () => void;
  onAssign: (directionId: string | null) => void;
  onDelete: () => void;
  onNotesChange: (notes: string) => void;
  onFilterByTag: (tag: string) => void;
}

function ImageDetailDrawer({
  image,
  directions,
  onClose,
  onAssign,
  onDelete,
  onNotesChange,
  onFilterByTag,
}: DrawerProps) {
  const [notes, setNotes] = useState(image.user_notes);
  const palette = image.ai_tags?.palette ?? [];
  const gradient = paletteGradient(palette);

  const tagChips = (label: string, tags: string[]) =>
    tags.length > 0 ? (
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)] mb-1">
          {label}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onFilterByTag(t)}
              className="font-mono text-[11px] text-[color:var(--color-ink)] border border-[color:var(--color-border)] px-2 py-0.5 rounded-sm hover:border-[color:var(--color-ink)]"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[color:var(--color-ink)]/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[color:var(--color-ivory)] h-full overflow-y-auto border-l border-[color:var(--color-border)]"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)]">
              Inspiration · {image.source_type.replace("_", " ")}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="w-full aspect-[4/5] rounded-sm border border-[color:var(--color-border)]"
            style={
              image.storage_url ? undefined : { backgroundImage: gradient }
            }
          >
            {image.storage_url && (
              <img
                src={image.storage_url}
                alt=""
                className="w-full h-full object-cover rounded-sm"
              />
            )}
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)]">
              Direction
            </label>
            <select
              value={image.direction_id ?? ""}
              onChange={(e) =>
                onAssign(e.target.value === "" ? null : e.target.value)
              }
              className="mt-1 w-full bg-white border border-[color:var(--color-border)] px-3 py-2 text-sm rounded-sm"
            >
              <option value="">Unassigned</option>
              {directions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {palette.length > 0 && (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)] mb-1.5">
                Palette
              </div>
              <div className="flex gap-1.5">
                {palette.map((s) => (
                  <PaletteChip key={s.hex} swatch={s} />
                ))}
              </div>
            </div>
          )}

          {image.ai_tags && (
            <div className="space-y-3">
              {tagChips("Textures", image.ai_tags.textures)}
              {tagChips("Mood", image.ai_tags.mood)}
              {tagChips("Elements", image.ai_tags.elements)}
              {tagChips("Cultural cues", image.ai_tags.cultural_cues)}
            </div>
          )}

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)]">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onNotesChange(notes)}
              placeholder="What drew you to this image?"
              className="mt-1 w-full bg-white border border-[color:var(--color-border)] px-3 py-2 text-sm rounded-sm min-h-[80px] resize-y"
            />
          </div>

          <div className="pt-4 border-t border-[color:var(--color-border)] flex items-center justify-between">
            <a
              href={image.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)] underline-offset-2 hover:underline"
            >
              Open source
            </a>
            <button
              type="button"
              onClick={onDelete}
              className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-destructive)] hover:text-[color:var(--color-rose)] flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Palette chip ────────────────────────────────────────────────────────────

function PaletteChip({ swatch }: { swatch: PaletteSwatch }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-10 h-10 rounded-sm border border-[color:var(--color-border)]"
        style={{ backgroundColor: swatch.hex }}
        title={swatch.name}
      />
      <div className="font-mono text-[9px] text-[color:var(--color-ink-muted)] uppercase">
        {swatch.hex.slice(1)}
      </div>
    </div>
  );
}

// ── Empty ───────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="border border-dashed border-[color:var(--color-border)] rounded-sm py-12 text-center">
      <Upload className="w-6 h-6 mx-auto text-[color:var(--color-ink-faint)] mb-2" />
      <div className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-ink-muted)]">
        Paste a Pinterest, Instagram, or vendor URL above
      </div>
      <div className="text-sm text-[color:var(--color-ink-muted)] mt-2">
        Images are tagged automatically for palette, texture, mood, and cultural cues.
      </div>
    </div>
  );
}
