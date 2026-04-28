"use client";

// Filmstrip sidebar shown alongside the spread editor. Lists every photo in
// the album's pool with a thumbnail, filter controls, and drag-to-slot
// behaviour. Keeps chrome minimal — the photos are the content.

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, Filter, Heart, Image as ImageIcon, X } from "lucide-react";
import type { AlbumPhoto } from "@/types/album";

interface PhotoPoolSidebarProps {
  photos: AlbumPhoto[];
  usedPhotoIds: Set<string>;
  onAddPhotos: (photos: AlbumPhoto[]) => void;
  onRemovePhoto: (photoId: string) => void;
  onDragPhoto: (photoId: string | null) => void;
}

type SortMode = "chrono" | "hearted" | "unused";

export function PhotoPoolSidebar({
  photos,
  usedPhotoIds,
  onAddPhotos,
  onRemovePhoto,
  onDragPhoto,
}: PhotoPoolSidebarProps) {
  const [sort, setSort] = useState<SortMode>("chrono");
  const [eventFilter, setEventFilter] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const events = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => p.eventTag && set.add(p.eventTag));
    return Array.from(set);
  }, [photos]);

  const shown = useMemo(() => {
    const filtered = eventFilter ? photos.filter((p) => p.eventTag === eventFilter) : photos;
    const copy = [...filtered];
    if (sort === "hearted") copy.sort((a, b) => Number(b.hearted ?? 0) - Number(a.hearted ?? 0));
    if (sort === "unused") return copy.filter((p) => !usedPhotoIds.has(p.id));
    return copy;
  }, [photos, sort, eventFilter, usedPhotoIds]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos: AlbumPhoto[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `ph_${Math.random().toString(36).slice(2, 10)}`,
        url: URL.createObjectURL(f),
        source: "upload" as const,
        uploadedAt: new Date().toISOString(),
        caption: f.name.replace(/\.[^.]+$/, ""),
      }));
    if (newPhotos.length) onAddPhotos(newPhotos);
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-border bg-ivory/40">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">Photo pool</p>
          <p className="mt-0.5 font-serif text-[15px] text-ink">{photos.length} photo{photos.length === 1 ? "" : "s"}</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-ink hover:bg-ivory-warm"
        >
          <Upload size={12} /> Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </header>

      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Filter size={11} className="text-ink-faint" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="rounded border border-border bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
        >
          <option value="chrono">Chronological</option>
          <option value="hearted">Most hearted</option>
          <option value="unused">Unused only</option>
        </select>
        {events.length > 0 && (
          <select
            value={eventFilter ?? ""}
            onChange={(e) => setEventFilter(e.target.value || null)}
            className="rounded border border-border bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
          >
            <option value="">All events</option>
            {events.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const photoId = e.dataTransfer.getData("application/x-album-photo");
          if (photoId && usedPhotoIds.has(photoId)) {
            // drag-back-to-sidebar = remove assignment from slot (handled by editor through drop on slot)
            // Here we no-op; slot removal is via ✕ in the canvas
          }
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
      >
        {shown.length === 0 ? (
          <EmptyPool onUploadClick={() => fileInputRef.current?.click()} />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {shown.map((photo) => {
              const used = usedPhotoIds.has(photo.id);
              return (
                <PhotoTile
                  key={photo.id}
                  photo={photo}
                  used={used}
                  onDragStart={() => onDragPhoto(photo.id)}
                  onDragEnd={() => onDragPhoto(null)}
                  onRemove={() => onRemovePhoto(photo.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

function PhotoTile({
  photo,
  used,
  onDragStart,
  onDragEnd,
  onRemove,
}: {
  photo: AlbumPhoto;
  used: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onRemove: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-album-photo", photo.id);
        e.dataTransfer.effectAllowed = "copyMove";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        "group relative aspect-square cursor-grab overflow-hidden rounded-md border border-border bg-white shadow-sm transition-all hover:shadow-md active:cursor-grabbing",
        used && "opacity-60",
      )}
    >
      <img
        src={photo.thumbUrl ?? photo.url}
        alt={photo.caption ?? ""}
        className="pointer-events-none h-full w-full object-cover"
        draggable={false}
      />
      {photo.hearted && (
        <span className="absolute left-1 top-1 rounded-full bg-white/90 p-1 text-rose">
          <Heart size={10} fill="currentColor" strokeWidth={0} />
        </span>
      )}
      {used && (
        <span className="absolute bottom-1 left-1 rounded-sm bg-ink/80 px-1 py-0.5 font-mono text-[8px] uppercase tracking-wider text-ivory">
          in album
        </span>
      )}
      {showActions && (
        <button
          className="absolute right-1 top-1 rounded-full bg-ink/80 p-1 text-ivory opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove from pool"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}

function EmptyPool({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <ImageIcon size={28} className="text-ink-faint" />
      <p className="mt-3 font-serif text-[15px] text-ink">No photos yet</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
        Upload photos to start laying out your album. You can always add more later.
      </p>
      <button
        onClick={onUploadClick}
        className="mt-4 rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
      >
        Upload photos
      </button>
    </div>
  );
}
