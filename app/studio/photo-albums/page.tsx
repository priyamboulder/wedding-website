"use client";

// ═══════════════════════════════════════════════════════════════════════════════════
//   STUDIO > PHOTO ALBUMS — project list ("My Albums")
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Couples land here from the Studio sidebar. Shows all of their in-progress
//   and completed album projects with thumbnail cover, title, page count, and
//   status. "+ Create new album" opens the setup modal; clicking a card opens
//   the editor at /studio/photo-albums/[albumId].
//
//   No couple has ever made an album before they come here for the first time,
//   so the empty state does double duty: it explains the feature and nudges
//   them to start.
// ═══════════════════════════════════════════════════════════════════════════════════

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopNav } from "@/components/shell/TopNav";
import { ChevronLeft, Plus, BookOpen, MoreVertical, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import NextLink from "next/link";
import { useAlbumStore } from "@/stores/album-store";
import { ALBUM_COVERS, ALBUM_SIZES } from "@/lib/album-layouts";
import { AlbumSetupModal } from "@/components/albums/AlbumSetupModal";
import type { AlbumProject, AlbumStatus } from "@/types/album";

const STATUS_TONE: Record<AlbumStatus, { label: string; bg: string; fg: string }> = {
  draft:     { label: "Draft",       bg: "bg-ivory-warm",      fg: "text-ink-muted" },
  in_review: { label: "In Review",   bg: "bg-saffron-pale/60", fg: "text-saffron"   },
  ordered:   { label: "Ordered",     bg: "bg-gold-pale",       fg: "text-gold"      },
  shipped:   { label: "Shipped",     bg: "bg-sage-pale/60",    fg: "text-sage"      },
  delivered: { label: "Delivered",   bg: "bg-sage-pale/60",    fg: "text-sage"      },
};

export default function PhotoAlbumsListPage() {
  const router = useRouter();
  const albums = useAlbumStore((s) => s.albums);
  const createAlbum = useAlbumStore((s) => s.createAlbum);
  const duplicateAlbum = useAlbumStore((s) => s.duplicateAlbum);
  const deleteAlbum = useAlbumStore((s) => s.deleteAlbum);

  const [setupOpen, setSetupOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-8 py-8">
        <NextLink
          href="/studio"
          className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={12} /> Back to Studio
        </NextLink>

        <header className="flex items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-saffron">Studio · Photo Albums</p>
            <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">My Albums</h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
              Design, preview, and order a physical keepsake of your wedding. Pick a size, drag photos in,
              and we'll lay everything out — or do it yourself, spread by spread.
            </p>
          </div>
          <button
            onClick={() => setSetupOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={14} /> Create new album
          </button>
        </header>

        <section className="mt-8">
          {albums.length === 0 ? (
            <EmptyState onStart={() => setSetupOpen(true)} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onOpen={() => router.push(`/studio/photo-albums/${album.id}`)}
                  onDuplicate={() => duplicateAlbum(album.id)}
                  onDelete={() => {
                    if (confirm(`Delete "${album.title}"? This can't be undone.`)) {
                      deleteAlbum(album.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {setupOpen && (
        <AlbumSetupModal
          onClose={() => setSetupOpen(false)}
          onCreate={(input) => {
            const project = createAlbum(input);
            setSetupOpen(false);
            router.push(`/studio/photo-albums/${project.id}`);
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white px-8 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-saffron-pale/60 text-saffron">
        <BookOpen size={22} />
      </div>
      <h2 className="mt-5 font-serif text-[20px] text-ink">Your first album starts here</h2>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
        Photo albums are how your wedding lives on a coffee table, not just in the cloud.
        Upload your favourite photos, pick a layout, and we'll make it beautiful.
      </p>
      <button
        onClick={onStart}
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
      >
        <Plus size={14} /> Create your first album
      </button>
    </div>
  );
}

function AlbumCard({
  album,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  album: AlbumProject;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const size = ALBUM_SIZES.find((s) => s.id === album.size);
  const cover = ALBUM_COVERS.find((c) => c.id === album.cover_type);
  const tone = STATUS_TONE[album.status];
  const spreadCount = album.spreads.length;
  const pageCount = spreadCount * 2;
  const firstPhoto = album.photo_pool.find((p) => p.id === album.cover_photo_id) ?? album.photo_pool[0];

  return (
    <article className="group relative overflow-hidden rounded-lg border border-border bg-white shadow-[0_1px_3px_rgba(26,26,26,0.04)] transition-shadow hover:shadow-md">
      <button onClick={onOpen} className="block w-full text-left">
        <div
          className="relative flex h-48 items-end justify-start overflow-hidden"
          style={{ background: cover?.swatch }}
        >
          {firstPhoto && album.cover_type === "photo-wrap" && (
            <img src={firstPhoto.url} className="absolute inset-0 h-full w-full object-cover" alt="" />
          )}
          <div className="relative z-10 p-4">
            {album.spine_text && (
              <p
                className={cn(
                  "font-serif text-[11px] uppercase tracking-[0.18em]",
                  album.cover_type === "leather" ? "text-gold-light" : "text-ink/80",
                )}
              >
                {album.spine_text}
              </p>
            )}
          </div>
        </div>
        <div className="px-4 py-4">
          <h3 className="font-serif text-[17px] leading-tight text-ink">{album.title}</h3>
          <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            <span>{size?.label}</span>
            <span>·</span>
            <span>{pageCount} pages</span>
            <span>·</span>
            <span>{album.photo_pool.length} photos</span>
          </div>
          <div className="mt-3">
            <span className={cn("inline-flex rounded-sm px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]", tone.bg, tone.fg)}>
              {tone.label}
            </span>
          </div>
        </div>
      </button>
      <div className="absolute right-2 top-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="rounded-full bg-ink/40 p-1.5 text-ivory opacity-0 transition-opacity hover:bg-ink/60 group-hover:opacity-100"
          aria-label="Album options"
        >
          <MoreVertical size={14} />
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 mt-1 w-40 overflow-hidden rounded-md border border-border bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onDuplicate();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-ink hover:bg-ivory-warm"
            >
              <Copy size={12} /> Duplicate
            </button>
            <button
              onClick={() => {
                onDelete();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-rose hover:bg-rose-pale/40"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
