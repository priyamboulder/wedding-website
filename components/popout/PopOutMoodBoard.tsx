"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoodBoardImage {
  id: string;
  url: string;
  alt?: string;
}

interface PopOutMoodBoardProps {
  images: MoodBoardImage[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onReorder?: (images: MoodBoardImage[]) => void;
  maxImages?: number;
  className?: string;
}

export function PopOutMoodBoard({
  images,
  onAdd,
  onRemove,
  onReorder,
  maxImages = 20,
  className,
}: PopOutMoodBoardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOverZone, setDragOverZone] = useState(false);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  // ── File selection ─────────────────────────────────────────────────────
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      const remaining = maxImages - images.length;
      if (remaining <= 0) return;
      onAdd(imageFiles.slice(0, remaining));
    },
    [images.length, maxImages, onAdd],
  );

  // ── Drop zone handlers ────────────────────────────────────────────────
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only show upload zone if dragging from outside (files)
      if (!dragItem) setDragOverZone(true);
    },
    [dragItem],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverZone(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverZone(false);

      // External file drop
      if (!dragItem && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
        return;
      }

      // Internal reorder
      if (dragItem && dragOverItem && onReorder && dragItem !== dragOverItem) {
        const reordered = [...images];
        const fromIdx = reordered.findIndex((img) => img.id === dragItem);
        const toIdx = reordered.findIndex((img) => img.id === dragOverItem);
        if (fromIdx !== -1 && toIdx !== -1) {
          const [moved] = reordered.splice(fromIdx, 1);
          reordered.splice(toIdx, 0, moved);
          onReorder(reordered);
        }
      }

      setDragItem(null);
      setDragOverItem(null);
    },
    [dragItem, dragOverItem, images, handleFiles, onReorder],
  );

  // ── Masonry span assignment ────────────────────────────────────────────
  // Alternate between 1-span and 2-span for visual interest
  const getSpanClass = (index: number) => {
    // Every 5th image gets a 2-col span for masonry effect
    if (index % 5 === 0 && images.length > 2) return "col-span-2 row-span-2";
    return "col-span-1";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Image grid (masonry-like) */}
      <div
        className={cn(
          "grid grid-cols-3 auto-rows-[120px] gap-2 rounded-lg transition-colors",
          dragOverZone && !dragItem && "ring-2 ring-gold/40 bg-gold-pale/20",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {images.map((img, i) => (
          <div
            key={img.id}
            draggable={!!onReorder}
            onDragStart={() => setDragItem(img.id)}
            onDragEnd={() => {
              setDragItem(null);
              setDragOverItem(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragItem) setDragOverItem(img.id);
            }}
            className={cn(
              "group relative rounded-lg overflow-hidden border border-border bg-ivory-warm",
              "transition-all duration-150",
              getSpanClass(i),
              onReorder && "cursor-grab active:cursor-grabbing",
              dragItem === img.id && "opacity-40 scale-95",
              dragOverItem === img.id &&
                dragItem !== img.id &&
                "ring-2 ring-gold/50",
            )}
          >
            <img
              src={img.url}
              alt={img.alt ?? "Mood board image"}
              className="h-full w-full object-cover"
              draggable={false}
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors flex items-start justify-end p-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(img.id);
                }}
                className={cn(
                  "rounded-full bg-ivory/90 p-1 shadow-sm",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  "hover:bg-rose-pale",
                )}
                aria-label="Remove image"
              >
                <Trash2 className="h-3 w-3 text-ink-soft" />
              </button>
            </div>
          </div>
        ))}

        {/* Add image tile */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "col-span-1 flex flex-col items-center justify-center gap-1.5",
              "rounded-lg border-2 border-dashed border-gold/25",
              "bg-ivory-warm/40 transition-all duration-150",
              "hover:border-gold/50 hover:bg-ivory-warm",
              "text-ink-faint hover:text-ink-muted",
            )}
          >
            <ImagePlus size={20} strokeWidth={1.5} />
            <span className="text-[11px] font-medium">Add</span>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Image count */}
      <p className="text-[11px] text-ink-faint">
        {images.length} of {maxImages} images
      </p>
    </div>
  );
}
