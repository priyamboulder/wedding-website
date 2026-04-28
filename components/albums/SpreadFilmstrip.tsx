"use client";

// Horizontal scroll of spread thumbnails at the bottom of the editor.
// Click to jump, +/- to add/delete, drag to reorder.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Copy, Trash2 } from "lucide-react";
import { SpreadRenderer } from "./SpreadRenderer";
import type { AlbumPhoto, AlbumSpread } from "@/types/album";

interface SpreadFilmstripProps {
  spreads: AlbumSpread[];
  photos: AlbumPhoto[];
  activeSpreadId: string;
  onSelect: (spreadId: string) => void;
  onAddSpread: (afterPosition: number) => void;
  onDeleteSpread: (spreadId: string) => void;
  onDuplicateSpread: (spreadId: string) => void;
  onReorderSpread: (spreadId: string, newPosition: number) => void;
}

const THUMB_PAGE_WIDTH = 48;
const THUMB_PAGE_HEIGHT = 48;

export function SpreadFilmstrip({
  spreads,
  photos,
  activeSpreadId,
  onSelect,
  onAddSpread,
  onDeleteSpread,
  onDuplicateSpread,
  onReorderSpread,
}: SpreadFilmstripProps) {
  const [draggingSpreadId, setDraggingSpreadId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-2 border-t border-border bg-white px-4 py-3">
      <div className="flex-1 overflow-x-auto">
        <div className="flex items-stretch gap-3 pb-1">
          {spreads.map((spread, i) => {
            const isActive = spread.id === activeSpreadId;
            const isDragging = draggingSpreadId === spread.id;
            const showLeftIndicator = dropIndex === i && draggingSpreadId && draggingSpreadId !== spread.id;
            const showRightIndicator =
              dropIndex === i + 1 && draggingSpreadId && draggingSpreadId !== spread.id;
            return (
              <div key={spread.id} className="relative flex items-center">
                {showLeftIndicator && <DropIndicator />}
                <div
                  className={cn(
                    "flex flex-col items-center transition-opacity",
                    isDragging && "opacity-40",
                  )}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/x-album-spread", spread.id);
                    e.dataTransfer.effectAllowed = "move";
                    setDraggingSpreadId(spread.id);
                  }}
                  onDragEnd={() => {
                    setDraggingSpreadId(null);
                    setDropIndex(null);
                  }}
                  onDragOver={(e) => {
                    if (!draggingSpreadId || draggingSpreadId === spread.id) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const isLeftHalf = e.clientX < rect.left + rect.width / 2;
                    setDropIndex(isLeftHalf ? i : i + 1);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const source = e.dataTransfer.getData("application/x-album-spread");
                    if (!source || source === spread.id) return;
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const isLeftHalf = e.clientX < rect.left + rect.width / 2;
                    const targetIndex = isLeftHalf ? i : i + 1;
                    // Adjust when dragging forward (the source's removal shifts
                    // subsequent indices down by one).
                    const sourcePos = spreads.findIndex((s) => s.id === source);
                    const effective = sourcePos < targetIndex ? targetIndex - 1 : targetIndex;
                    onReorderSpread(source, effective);
                    setDropIndex(null);
                    setDraggingSpreadId(null);
                  }}
                >
                  <button
                    onClick={() => onSelect(spread.id)}
                    className={cn(
                      "group relative overflow-hidden rounded border bg-white transition-all",
                      isActive
                        ? "border-gold ring-2 ring-gold/30"
                        : "border-border hover:border-ink-faint",
                    )}
                    aria-label={`Spread ${i + 1}`}
                  >
                    <div className="pointer-events-none">
                      <SpreadRenderer
                        spread={spread}
                        photos={photos}
                        pageWidth={THUMB_PAGE_WIDTH}
                        pageHeight={THUMB_PAGE_HEIGHT}
                      />
                    </div>
                  </button>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                      {i + 1}
                    </span>
                    {isActive && (
                      <>
                        <button
                          onClick={() => onDuplicateSpread(spread.id)}
                          className="text-ink-faint hover:text-ink"
                          aria-label="Duplicate spread"
                          title="Duplicate"
                        >
                          <Copy size={10} />
                        </button>
                        {spreads.length > 1 && (
                          <button
                            onClick={() => onDeleteSpread(spread.id)}
                            className="text-ink-faint hover:text-rose"
                            aria-label="Delete spread"
                            title="Delete"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {showRightIndicator && i === spreads.length - 1 && <DropIndicator />}
              </div>
            );
          })}
        </div>
      </div>
      <button
        onClick={() => {
          const lastPos = spreads.length > 0 ? spreads[spreads.length - 1].position : -1;
          onAddSpread(lastPos);
        }}
        className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-ink hover:bg-ivory-warm"
      >
        <Plus size={12} /> Add spread
      </button>
    </div>
  );
}

function DropIndicator() {
  return (
    <div
      aria-hidden
      className="pointer-events-none h-24 w-0.5 self-center bg-gold"
      style={{ boxShadow: "0 0 0 1px rgba(212,162,76,0.25)" }}
    />
  );
}
