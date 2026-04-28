"use client";

// ── Zone B — Directions ─────────────────────────────────────────────────────
// Competing aesthetic theses. Create, rename, assign images, synthesize (with
// streamed manifesto), compare up to 3 side-by-side, and lock one. The lock
// flow opens a modal that fetches forbidden + cultural notes from the API
// stub, lets the couple edit, and commits the Aesthetic DNA.

import { useState, useCallback, type DragEvent } from "react";
import {
  Plus,
  Sparkles,
  Lock,
  Pencil,
  Trash2,
  GitCompare,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAestheticStore, paletteGradient } from "@/stores/aesthetic-store";
import type {
  AestheticDirection,
  InspirationImage,
  SynthesisChunk,
  DirectionSynthesis,
  PaletteSwatch,
} from "@/types/aesthetic";

// ── Synthesis stream ────────────────────────────────────────────────────────

async function streamSynthesis(
  direction: AestheticDirection,
  images: InspirationImage[],
  onChunk: (chunk: SynthesisChunk) => void,
): Promise<void> {
  const res = await fetch("/api/aesthetic/synthesize", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      directionId: direction.id,
      directionName: direction.name,
      userDescription: direction.description,
      imageTags: images
        .map((img) => img.ai_tags)
        .filter((t): t is NonNullable<typeof t> => t !== null),
    }),
  });

  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const chunk = JSON.parse(trimmed) as SynthesisChunk;
        onChunk(chunk);
      } catch {
        // tolerate partial lines
      }
    }
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export function Directions({
  onLockRequested,
}: {
  onLockRequested: (directionId: string) => void;
}) {
  const directions = useAestheticStore((s) => s.directions);
  const images = useAestheticStore((s) => s.images);
  const createDirection = useAestheticStore((s) => s.createDirection);
  const updateDirection = useAestheticStore((s) => s.updateDirection);
  const deleteDirection = useAestheticStore((s) => s.deleteDirection);
  const assignImageToDirection = useAestheticStore(
    (s) => s.assignImageToDirection,
  );
  const markSynthesisStarted = useAestheticStore((s) => s.markSynthesisStarted);
  const applySynthesisChunk = useAestheticStore((s) => s.applySynthesisChunk);

  const [newName, setNewName] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [synthingId, setSynthingId] = useState<string | null>(null);

  const dnaDirectionId = useAestheticStore((s) => s.dna?.direction_id ?? null);

  const handleSynthesize = useCallback(
    async (direction: AestheticDirection) => {
      const dirImages = images.filter(
        (img) => img.direction_id === direction.id && img.ai_tags,
      );
      if (dirImages.length === 0) return;
      setSynthingId(direction.id);
      markSynthesisStarted(direction.id);
      try {
        await streamSynthesis(direction, dirImages, (chunk) => {
          applySynthesisChunk(direction.id, chunk);
        });
      } finally {
        setSynthingId(null);
      }
    },
    [images, applySynthesisChunk, markSynthesisStarted],
  );

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return;
    createDirection({ name: newName });
    setNewName("");
  }, [newName, createDirection]);

  const toggleCompare = useCallback((id: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  return (
    <section className="border-b border-[color:var(--color-border)] bg-white">
      <div className="px-6 pt-6 pb-3 flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)]">
            Zone B
          </div>
          <h2 className="font-serif text-2xl text-[color:var(--color-ink)] mt-0.5">
            Directions
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Name a new direction…"
            className="bg-[color:var(--color-ivory)] border border-[color:var(--color-border)] px-3 py-2 text-sm rounded-sm w-64"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-light)] disabled:text-[color:var(--color-ink-faint)]"
          >
            <Plus className="w-3.5 h-3.5" /> Add direction
          </button>
          {compareSelection.length >= 2 && (
            <button
              type="button"
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)]"
            >
              <GitCompare className="w-3.5 h-3.5" /> Compare {compareSelection.length}
            </button>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {directions.length === 0 && (
          <div className="col-span-full border border-dashed border-[color:var(--color-border)] rounded-sm py-8 text-center">
            <Sparkles className="w-5 h-5 mx-auto text-[color:var(--color-ink-faint)] mb-2" />
            <div className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-ink-muted)]">
              Add 2–4 competing directions and synthesize each
            </div>
          </div>
        )}
        {directions.map((d) => (
          <DirectionCard
            key={d.id}
            direction={d}
            images={images.filter((img) => img.direction_id === d.id)}
            isLocked={dnaDirectionId === d.id}
            onRename={(name) => updateDirection(d.id, { name })}
            onDelete={() => deleteDirection(d.id)}
            onSynthesize={() => handleSynthesize(d)}
            onLock={() => onLockRequested(d.id)}
            onToggleCompare={() => toggleCompare(d.id)}
            compareSelected={compareSelection.includes(d.id)}
            compareDisabled={
              !compareSelection.includes(d.id) && compareSelection.length >= 3
            }
            isSynthing={synthingId === d.id}
            onDropImage={(imageId) => assignImageToDirection(imageId, d.id)}
          />
        ))}
      </div>

      {showCompare && (
        <CompareModal
          directions={directions.filter((d) =>
            compareSelection.includes(d.id),
          )}
          imagesByDirection={(id) =>
            images.filter((img) => img.direction_id === id)
          }
          onClose={() => setShowCompare(false)}
        />
      )}
    </section>
  );
}

// ── Direction card ──────────────────────────────────────────────────────────

interface CardProps {
  direction: AestheticDirection;
  images: InspirationImage[];
  isLocked: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
  onSynthesize: () => void;
  onLock: () => void;
  onToggleCompare: () => void;
  compareSelected: boolean;
  compareDisabled: boolean;
  isSynthing: boolean;
  onDropImage: (imageId: string) => void;
}

function DirectionCard({
  direction,
  images,
  isLocked,
  onRename,
  onDelete,
  onSynthesize,
  onLock,
  onToggleCompare,
  compareSelected,
  compareDisabled,
  isSynthing,
  onDropImage,
}: CardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(direction.name);
  const [dragOver, setDragOver] = useState(false);

  const synthesis = direction.synthesis;
  const canLock = !!synthesis && synthesis.manifesto.length > 0 && !isLocked;

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const imgId = e.dataTransfer.getData("text/aesthetic-image-id");
    if (imgId) onDropImage(imgId);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "border rounded-sm transition-colors bg-white",
        dragOver
          ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold-pale)]/30"
          : "border-[color:var(--color-border)]",
        isLocked && "ring-1 ring-[color:var(--color-gold)]",
      )}
    >
      <div className="p-4 flex items-start justify-between gap-3 border-b border-[color:var(--color-border)]">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                onRename(name.trim() || direction.name);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRename(name.trim() || direction.name);
                  setEditing(false);
                }
              }}
              autoFocus
              className="font-serif text-lg w-full bg-transparent border-b border-[color:var(--color-gold)] focus:outline-none"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-[color:var(--color-ink)]">
                {direction.name}
              </h3>
              {isLocked && (
                <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-gold)] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
          )}
          <div className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ink-muted)] mt-1">
            {images.length} images
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleCompare}
            disabled={compareDisabled}
            title={compareSelected ? "Remove from compare" : "Add to compare"}
            className={cn(
              "p-1 rounded-sm transition-colors",
              compareSelected
                ? "text-[color:var(--color-gold)]"
                : "text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink)]",
              compareDisabled && "opacity-30 cursor-not-allowed",
            )}
          >
            <GitCompare className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-1 text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink)]"
            title="Rename"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {!isLocked && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-destructive)]"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Image preview grid */}
      <div className="p-4 border-b border-[color:var(--color-border)]">
        {images.length === 0 ? (
          <div className="text-sm text-[color:var(--color-ink-muted)] italic">
            Drag images from the wall, or use the menu on each tile.
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1.5">
            {images.slice(0, 12).map((img) => (
              <div
                key={img.id}
                className="aspect-square rounded-sm border border-[color:var(--color-border)]"
                style={
                  img.storage_url
                    ? undefined
                    : {
                        backgroundImage: paletteGradient(
                          img.ai_tags?.palette ?? [],
                        ),
                      }
                }
              >
                {img.storage_url && (
                  <img
                    src={img.storage_url}
                    alt=""
                    className="w-full h-full object-cover rounded-sm"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Synthesis body */}
      <div className="p-4 space-y-3">
        {!synthesis ? (
          <div className="text-sm text-[color:var(--color-ink-muted)] italic">
            Not yet synthesized.
          </div>
        ) : (
          <SynthesisView synthesis={synthesis} />
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-[color:var(--color-border)] flex items-center justify-between">
        <button
          type="button"
          onClick={onSynthesize}
          disabled={images.length === 0 || isSynthing}
          className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[color:var(--color-ink)] hover:text-[color:var(--color-gold)] disabled:text-[color:var(--color-ink-faint)]"
        >
          {isSynthing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {synthesis ? "Re-synthesize" : "Synthesize"}
        </button>
        <button
          type="button"
          onClick={onLock}
          disabled={!canLock}
          className={cn(
            "flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider px-3 py-1 rounded-sm",
            canLock
              ? "bg-[color:var(--color-ink)] text-[color:var(--color-ivory)] hover:bg-[color:var(--color-gold)]"
              : "bg-[color:var(--color-ivory-deep)] text-[color:var(--color-ink-faint)] cursor-not-allowed",
          )}
        >
          <Lock className="w-3.5 h-3.5" />
          {isLocked ? "Locked" : "Lock this direction"}
        </button>
      </div>
    </div>
  );
}

// ── Synthesis view (shared between card + compare) ──────────────────────────

function SynthesisView({ synthesis }: { synthesis: DirectionSynthesis }) {
  return (
    <>
      {synthesis.palette_primary.length > 0 && (
        <PaletteStrip
          primary={synthesis.palette_primary}
          secondary={synthesis.palette_secondary}
        />
      )}

      {synthesis.manifesto && (
        <p className="text-sm leading-relaxed text-[color:var(--color-ink-soft)] font-serif">
          {synthesis.manifesto}
        </p>
      )}

      {synthesis.mood_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {synthesis.mood_tags.map((m) => (
            <span
              key={m}
              className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-[color:var(--color-ivory)] border border-[color:var(--color-border)] rounded-sm"
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {synthesis.implied_moves.length > 0 && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)] mb-1.5">
            Implied moves
          </div>
          <ul className="space-y-1 text-sm text-[color:var(--color-ink-soft)]">
            {synthesis.implied_moves.map((m, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[color:var(--color-gold)] mt-0.5 shrink-0" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function PaletteStrip({
  primary,
  secondary,
}: {
  primary: PaletteSwatch[];
  secondary: PaletteSwatch[];
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex h-8 rounded-sm overflow-hidden border border-[color:var(--color-border)]">
        {primary.map((s) => (
          <div
            key={s.hex}
            style={{ backgroundColor: s.hex }}
            title={`${s.name} · ${s.hex}`}
            className="flex-1"
          />
        ))}
      </div>
      {secondary.length > 0 && (
        <div className="flex h-4 rounded-sm overflow-hidden border border-[color:var(--color-border)]">
          {secondary.map((s) => (
            <div
              key={s.hex}
              style={{ backgroundColor: s.hex }}
              title={`${s.name} · ${s.hex}`}
              className="flex-1"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Compare modal ───────────────────────────────────────────────────────────

function CompareModal({
  directions,
  imagesByDirection,
  onClose,
}: {
  directions: AestheticDirection[];
  imagesByDirection: (id: string) => InspirationImage[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-[color:var(--color-ink)]/50 flex items-start justify-center overflow-y-auto p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[color:var(--color-ivory)] rounded-sm max-w-[1400px] w-full border border-[color:var(--color-border)]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--color-border)]">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)]">
              Compare
            </div>
            <h3 className="font-serif text-xl">
              {directions.map((d) => d.name).join(" · ")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div
          className={cn(
            "grid gap-4 p-6",
            directions.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3",
          )}
        >
          {directions.map((d) => {
            const imgs = imagesByDirection(d.id);
            return (
              <div
                key={d.id}
                className="bg-white border border-[color:var(--color-border)] rounded-sm p-4 space-y-3"
              >
                <h4 className="font-serif text-lg">{d.name}</h4>
                {imgs.length > 0 && (
                  <div className="grid grid-cols-4 gap-1">
                    {imgs.slice(0, 8).map((img) => (
                      <div
                        key={img.id}
                        className="aspect-square rounded-sm"
                        style={{
                          backgroundImage: paletteGradient(
                            img.ai_tags?.palette ?? [],
                          ),
                        }}
                      />
                    ))}
                  </div>
                )}
                {d.synthesis ? (
                  <SynthesisView synthesis={d.synthesis} />
                ) : (
                  <div className="text-sm italic text-[color:var(--color-ink-muted)]">
                    Not yet synthesized.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
