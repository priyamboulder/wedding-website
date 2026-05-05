"use client";

// ── PlanningJournal ─────────────────────────────────────────────────────
// Keepsake layer at the bottom of the main column. Empty state is a
// single italic line + an "Add photos" button — no oversized empty
// state box. With photos, renders as a soft CSS-columns masonry of
// varied sizes with pink-tinted shadows.
//
// Exposes an imperative `openUploader` so the sidebar's Quick Actions
// can trigger the file picker without prop-drilling.

import { forwardRef, useImperativeHandle, useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useDashboardJournalStore } from "@/stores/dashboard-journal-store";
import { InlineEdit } from "./InlineEdit";

function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface PlanningJournalHandle {
  openUploader: () => void;
}

export const PlanningJournal = forwardRef<PlanningJournalHandle>(
  function PlanningJournal(_props, ref) {
  const photos = useDashboardJournalStore((s) => s.photos);
  const addPhoto = useDashboardJournalStore((s) => s.addPhoto);
  const updatePhoto = useDashboardJournalStore((s) => s.updatePhoto);
  const deletePhoto = useDashboardJournalStore((s) => s.deletePhoto);
  const fileRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      openUploader: () => fileRef.current?.click(),
    }),
    [],
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          addPhoto({ imageUrl: result });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <section id="journal">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="dash-spread-title">
            Planning <em>journal</em>
          </h2>
          <p className="dash-spread-sub">
            {photos.length === 0
              ? "A keepsake page for the planning days."
              : "The keepsake layer — for the moments along the way."}
          </p>
        </div>
        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="dash-btn dash-btn--sm shrink-0"
          >
            <ImagePlus size={13} strokeWidth={1.8} />
            Add photos
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {photos.length === 0 && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="flex flex-col items-center gap-4 rounded-[8px] border border-dashed border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-blush-light)] px-6 py-12 text-center"
        >
          <ImagePlus
            size={28}
            strokeWidth={1.4}
            className="text-[color:var(--dash-blush-deep)]"
            aria-hidden
          />
          <p
            className="max-w-md font-serif text-[17px] italic leading-relaxed text-[color:var(--dash-text-muted)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          >
            Drop photos from your planning journey — tastings, venue visits,
            outfit trials. The little moments you&rsquo;ll want to look back on.
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="dash-btn dash-btn--sm"
          >
            <ImagePlus size={13} strokeWidth={1.8} />
            Add photos
          </button>
          <p className="text-[11px] italic text-[color:var(--dash-text-faint)]">
            Or drag-and-drop them here.
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div
          className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          {photos.map((p, i) => {
            const heightClass =
              i % 4 === 0
                ? "h-56"
                : i % 4 === 1
                  ? "h-44"
                  : i % 4 === 2
                    ? "h-64"
                    : "h-48";
            return (
              <figure
                key={p.id}
                className="group relative mb-3 inline-block w-full break-inside-avoid overflow-hidden rounded-[4px] bg-[color:var(--dash-canvas)] shadow-[0_4px_20px_rgba(212,165,165,0.12)]"
              >
                <img
                  src={p.imageUrl}
                  alt={p.caption || ""}
                  className={`block w-full ${heightClass} object-cover`}
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => deletePhoto(p.id)}
                  aria-label="Delete photo"
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-[color:var(--dash-text-faint)] opacity-0 shadow transition-opacity hover:text-[color:var(--color-terracotta)] group-hover:opacity-100"
                >
                  <Trash2 size={11} />
                </button>
                <figcaption className="px-2 py-1.5">
                  <InlineEdit
                    value={p.caption}
                    onSave={(v) => updatePhoto(p.id, { caption: v })}
                    placeholder="Add a caption…"
                    ariaLabel="Caption"
                    inputClassName="text-[12px] italic font-serif"
                    className="block font-serif text-[12px] italic text-[color:var(--dash-text-muted)]"
                  />
                  <span
                    className="mt-0.5 block text-[9px] uppercase tracking-[0.16em] text-[color:var(--dash-text-faint)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {dateLabel(p.takenAt)}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
});
