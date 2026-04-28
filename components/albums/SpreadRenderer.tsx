"use client";

// Renders a two-page spread using a layout template. Used both in the editor
// canvas (interactive) and the filmstrip (static thumbnails).
//
// Layouts are defined in SPREAD coordinates (0..1 spanning both pages), so
// rendering is just a single absolute container positioned over the full
// spread — no per-page mirroring. The page fold is a visual shadow overlay,
// not a slot divider.

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ALBUM_FONTS, LAYOUT_BY_ID } from "@/lib/album-layouts";
import type { AlbumPhoto, AlbumSlot, AlbumSpread, AlbumTextBlock, LayoutTemplate } from "@/types/album";

interface SpreadRendererProps {
  spread: AlbumSpread;
  photos: AlbumPhoto[];
  pageWidth: number;            // CSS px — one page
  pageHeight: number;
  interactive?: boolean;
  selectedSlotId?: string | null;
  draggingPhotoId?: string | null;
  onSlotClick?: (slotId: string) => void;
  onSlotDrop?: (slotId: string, photoId: string) => void;
  onSlotRemove?: (slotId: string) => void;
}

export function SpreadRenderer({
  spread,
  photos,
  pageWidth,
  pageHeight,
  interactive = false,
  selectedSlotId = null,
  draggingPhotoId = null,
  onSlotClick,
  onSlotDrop,
  onSlotRemove,
}: SpreadRendererProps) {
  const layout: LayoutTemplate = LAYOUT_BY_ID[spread.layout_template_id] ?? LAYOUT_BY_ID["full-bleed"];
  const photoById = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);

  const spreadWidth = pageWidth * 2;
  const spreadHeight = pageHeight;

  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{ width: spreadWidth, height: spreadHeight }}
    >
      {/* Photo slots */}
      {layout.frames.map((frame, i) => {
        const slot = spread.slots[i];
        if (!slot) return null;
        const photo = slot.photo_id ? photoById.get(slot.photo_id) : null;
        return (
          <SlotRenderer
            key={slot.id}
            slot={slot}
            frame={{
              x: frame.x * spreadWidth,
              y: frame.y * spreadHeight,
              w: frame.w * spreadWidth,
              h: frame.h * spreadHeight,
            }}
            rotation={layout.frameRotations?.[i] ?? 0}
            photo={photo ?? null}
            interactive={interactive}
            selected={selectedSlotId === slot.id}
            draggingPhotoId={draggingPhotoId}
            onClick={() => onSlotClick?.(slot.id)}
            onDrop={(photoId) => onSlotDrop?.(slot.id, photoId)}
            onRemove={() => onSlotRemove?.(slot.id)}
          />
        );
      })}

      {/* Text blocks */}
      {(layout.textFrames ?? []).map((frame, i) => {
        const tb = spread.text_blocks[i];
        if (!tb) return null;
        return (
          <TextBlockRenderer
            key={tb.id}
            textBlock={tb}
            frame={{
              x: frame.x * spreadWidth,
              y: frame.y * spreadHeight,
              w: frame.w * spreadWidth,
              h: frame.h * spreadHeight,
            }}
            isHero={!!layout.isTextOnly && i === 0}
            pageWidth={pageWidth}
          />
        );
      })}

      {/* Center spine — subtle shadow mimicking a physical book binding */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 h-full"
        style={{
          left: pageWidth - 1,
          width: 2,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.08) 100%)",
        }}
      />
    </div>
  );
}

interface SlotRendererProps {
  slot: AlbumSlot;
  frame: { x: number; y: number; w: number; h: number };
  rotation: number;
  photo: AlbumPhoto | null;
  interactive: boolean;
  selected: boolean;
  draggingPhotoId: string | null;
  onClick: () => void;
  onDrop: (photoId: string) => void;
  onRemove: () => void;
}

function SlotRenderer({
  slot,
  frame,
  rotation,
  photo,
  interactive,
  selected,
  draggingPhotoId,
  onClick,
  onDrop,
  onRemove,
}: SlotRendererProps) {
  const isPolaroid = rotation !== 0;
  return (
    <div
      className={cn(
        "absolute overflow-hidden bg-ivory-warm/30 transition-all",
        interactive && "cursor-pointer",
        selected && "ring-2 ring-gold ring-offset-1",
        !photo && draggingPhotoId && "ring-2 ring-saffron ring-dashed",
        isPolaroid && "shadow-[0_2px_6px_rgba(26,26,26,0.18)] bg-white",
      )}
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.w,
        height: frame.h,
        transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
        padding: isPolaroid ? `${Math.min(frame.w, frame.h) * 0.05}px` : 0,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDragOver={(e) => {
        if (!interactive) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (!interactive) return;
        e.preventDefault();
        const photoId = e.dataTransfer.getData("application/x-album-photo");
        if (photoId) onDrop(photoId);
      }}
    >
      {photo ? (
        <>
          <img
            src={photo.url}
            alt={photo.caption ?? ""}
            draggable={false}
            className="pointer-events-none h-full w-full select-none"
            style={{
              objectFit: "cover",
              objectPosition: `${slot.crop_x * 100}% ${slot.crop_y * 100}%`,
              transform: `scale(${slot.crop_zoom}) rotate(${slot.rotation}deg)`,
              transformOrigin: "center center",
            }}
          />
          {interactive && selected && (
            <button
              className="absolute right-1.5 top-1.5 z-10 rounded-full bg-ink/80 p-1 text-ivory hover:bg-ink"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Remove photo"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-ink/15 text-[10px] uppercase tracking-widest text-ink-faint">
          {interactive && frame.w > 60 ? "drag photo" : ""}
        </div>
      )}
    </div>
  );
}

interface TextBlockRendererProps {
  textBlock: AlbumTextBlock;
  frame: { x: number; y: number; w: number; h: number };
  isHero: boolean;
  pageWidth: number;
}

function TextBlockRenderer({ textBlock, frame, isHero, pageWidth }: TextBlockRendererProps) {
  // Map stored font id → CSS family. Falls back to the raw string so legacy
  // data using `var(--font-serif)` still renders.
  const fontMatch = ALBUM_FONTS.find((f) => f.id === textBlock.font);
  const fontFamily = fontMatch?.css ?? textBlock.font;
  const baseSize = isHero ? pageWidth * 0.1 : pageWidth * 0.05;
  return (
    <div
      className="pointer-events-none absolute flex items-center justify-center px-2"
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.w,
        height: frame.h,
        textAlign: textBlock.alignment,
        color: textBlock.color,
        fontFamily,
      }}
    >
      <span
        className="leading-tight"
        style={{ fontSize: textBlock.size ?? baseSize, width: "100%" }}
      >
        {textBlock.content || (isHero ? "Your title" : "")}
      </span>
    </div>
  );
}
