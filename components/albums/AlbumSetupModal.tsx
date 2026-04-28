"use client";

// Setup modal for a new album. Collects title, size, cover type, paper type,
// page count, and spine text in a single step. Falls on top of the "My Albums"
// list view. Keeps chrome minimal and mirrors the design language used in the
// rest of Studio (cream background, serif titles, gold CTAs).

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ALBUM_COVERS, ALBUM_PAPERS, ALBUM_SIZES, DEFAULT_PAGE_COUNT, MAX_PAGES, MIN_PAGES } from "@/lib/album-layouts";
import type { AlbumCoverType, AlbumPaperType, AlbumSize } from "@/types/album";

interface AlbumSetupModalProps {
  onClose: () => void;
  onCreate: (input: {
    title: string;
    size: AlbumSize;
    cover_type: AlbumCoverType;
    paper_type: AlbumPaperType;
    spine_text: string;
    page_count: number;
  }) => void;
}

export function AlbumSetupModal({ onClose, onCreate }: AlbumSetupModalProps) {
  const [title, setTitle] = useState("Our Wedding Album");
  const [size, setSize] = useState<AlbumSize>("10x10");
  const [coverType, setCoverType] = useState<AlbumCoverType>("hardcover-linen");
  const [paperType, setPaperType] = useState<AlbumPaperType>("lustre");
  const [pageCount, setPageCount] = useState<number>(DEFAULT_PAGE_COUNT);
  const [spineText, setSpineText] = useState("");

  const sizeMeta = ALBUM_SIZES.find((s) => s.id === size)!;
  const coverMeta = ALBUM_COVERS.find((c) => c.id === coverType)!;
  const pricePreview = sizeMeta.basePrice + coverMeta.priceDelta + Math.ceil(pageCount / 10) * sizeMeta.perTenPagesPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8" onClick={onClose}>
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron">Create album</p>
            <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">Set up your photo album</h2>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              You can change anything later — nothing here is locked in.
            </p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-ink-muted hover:bg-ivory-warm" aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            <Field label="Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 font-serif text-[15px] text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
              />
            </Field>

            <Field label="Album size" hint="Square formats flatter mixed portrait/landscape photos. Landscape suits travel-heavy weddings.">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {ALBUM_SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-md border bg-white px-3 py-4 text-center transition-all",
                      size === s.id ? "border-gold ring-1 ring-gold/30" : "border-border hover:border-ink-faint",
                    )}
                  >
                    <div
                      className="bg-ivory-warm border border-border"
                      style={{
                        width: 16 + s.widthIn * 2.5,
                        height: 16 + s.heightIn * 2.5,
                      }}
                    />
                    <span className="font-serif text-[13px] text-ink">{s.label}</span>
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-ink-muted">${s.basePrice}+</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Cover type">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {ALBUM_COVERS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCoverType(c.id)}
                    className={cn(
                      "flex flex-col items-stretch gap-0 overflow-hidden rounded-md border bg-white text-left transition-all",
                      coverType === c.id ? "border-gold ring-1 ring-gold/30" : "border-border hover:border-ink-faint",
                    )}
                  >
                    <div className="h-14 w-full" style={{ background: c.swatch }} />
                    <div className="px-3 py-2">
                      <p className="font-serif text-[12.5px] text-ink">{c.label}</p>
                      <p className="mt-0.5 text-[10.5px] leading-snug text-ink-muted">{c.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Paper type">
              <div className="grid grid-cols-3 gap-2">
                {ALBUM_PAPERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaperType(p.id)}
                    className={cn(
                      "relative overflow-hidden rounded-md border bg-white p-3 text-left transition-all",
                      paperType === p.id ? "border-gold ring-1 ring-gold/30" : "border-border hover:border-ink-faint",
                    )}
                  >
                    <div className="relative h-12 w-full overflow-hidden rounded">
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, #D4A24C 0%, #F5E6C8 50%, #C97B63 100%)",
                        }}
                      />
                      <div className="absolute inset-0" style={{ background: p.sheen }} />
                    </div>
                    <p className="mt-2 font-serif text-[12.5px] text-ink">{p.label}</p>
                    <p className="text-[10.5px] text-ink-muted">{p.description}</p>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Page count" hint={`Starts at ${pageCount} pages. Adding 10 pages adds $${sizeMeta.perTenPagesPrice}.`}>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={MIN_PAGES}
                  max={MAX_PAGES}
                  step={2}
                  value={pageCount}
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="flex-1 accent-[var(--color-gold)]"
                />
                <span className="min-w-[80px] rounded border border-border bg-white px-3 py-1.5 text-center font-mono text-[12px] tabular-nums text-ink">
                  {pageCount} pages
                </span>
              </div>
            </Field>

            <Field label="Spine text" hint="Short title that shows on the edge of the album.">
              <input
                value={spineText}
                onChange={(e) => setSpineText(e.target.value)}
                placeholder="e.g., Priya & Arjun · 2026"
                maxLength={40}
                className="w-full rounded-md border border-border bg-white px-3 py-2 font-serif text-[14px] text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
              />
            </Field>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-border bg-white px-6 py-4">
          <div>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">Estimated</p>
            <p className="font-serif text-[20px] text-ink">${pricePreview}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-border bg-white px-4 py-2 text-[12.5px] font-medium text-ink-muted hover:bg-ivory-warm"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onCreate({
                  title: title.trim() || "Untitled album",
                  size,
                  cover_type: coverType,
                  paper_type: paperType,
                  spine_text: spineText.trim() || title.trim(),
                  page_count: pageCount,
                })
              }
              className="rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
            >
              Create album
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      {hint && <p className="mt-0.5 mb-2 text-[11px] leading-snug text-ink-faint">{hint}</p>}
      {!hint && <div className="mb-2" />}
      {children}
    </div>
  );
}
