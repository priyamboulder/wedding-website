"use client";

// ═══════════════════════════════════════════════════════════════════════════════════
//   STUDIO > PHOTO ALBUMS > ALBUM EDITOR
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Phase 1 MVP per spec: album setup is already captured on the My Albums
//   list; this page is the two-page spread designer. Left: photo pool sidebar.
//   Center: spread canvas (drag photos from sidebar into slots). Bottom:
//   spread filmstrip. Top: layout picker.
//
//   Phase 2+ (auto-layout AI, per-photo fine-tune, share preview link, PDF
//   proof, ordering) are scaffolded with wiring hooks but intentionally not
//   built here — this page stays focused on the core designer experience.
// ═══════════════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import { TopNav } from "@/components/shell/TopNav";
import {
  ChevronLeft,
  Download,
  Share2,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlbumStore } from "@/stores/album-store";
import { LAYOUT_BY_ID } from "@/lib/album-layouts";
import { SpreadRenderer } from "@/components/albums/SpreadRenderer";
import { PhotoPoolSidebar } from "@/components/albums/PhotoPoolSidebar";
import { SpreadFilmstrip } from "@/components/albums/SpreadFilmstrip";
import { LayoutPicker } from "@/components/albums/LayoutPicker";
import { OrderFlowModal } from "@/components/albums/OrderFlowModal";
import { AIActionMenu } from "@/components/albums/AIActionMenu";
import { GuestCoverageDrawer } from "@/components/albums/GuestCoverageDrawer";

const PAGE_WIDTH_DEFAULT = 340;
const PAGE_HEIGHT_RATIO_BY_SIZE: Record<string, number> = {
  "6x6": 1,
  "8x10": 0.8,   // landscape
  "10x10": 1,
  "12x12": 1,
};

export default function AlbumEditorPage() {
  const params = useParams<{ albumId: string }>();
  const router = useRouter();
  const album = useAlbumStore((s) => s.albums.find((a) => a.id === params.albumId));
  const addPhotos = useAlbumStore((s) => s.addPhotos);
  const removePhoto = useAlbumStore((s) => s.removePhoto);
  const setCoverPhoto = useAlbumStore((s) => s.setCoverPhoto);
  const addSpread = useAlbumStore((s) => s.addSpread);
  const deleteSpread = useAlbumStore((s) => s.deleteSpread);
  const duplicateSpread = useAlbumStore((s) => s.duplicateSpread);
  const setSpreadLayout = useAlbumStore((s) => s.setSpreadLayout);
  const reorderSpread = useAlbumStore((s) => s.reorderSpread);
  const assignPhoto = useAlbumStore((s) => s.assignPhoto);
  const updateSlot = useAlbumStore((s) => s.updateSlot);
  const updateTextBlock = useAlbumStore((s) => s.updateTextBlock);
  const updateAlbum = useAlbumStore((s) => s.updateAlbum);

  const [activeSpreadId, setActiveSpreadId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [draggingPhotoId, setDraggingPhotoId] = useState<string | null>(null);
  const [titleEditing, setTitleEditing] = useState(false);
  const [orderFlowOpen, setOrderFlowOpen] = useState(false);
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const activeSpread = useMemo(() => {
    if (!album) return null;
    return album.spreads.find((s) => s.id === activeSpreadId) ?? album.spreads[0] ?? null;
  }, [album, activeSpreadId]);

  const usedPhotoIds = useMemo(() => {
    const set = new Set<string>();
    album?.spreads.forEach((sp) => sp.slots.forEach((sl) => sl.photo_id && set.add(sl.photo_id)));
    return set;
  }, [album]);

  const selectedSlot = useMemo(() => {
    if (!activeSpread || !selectedSlotId) return null;
    return activeSpread.slots.find((sl) => sl.id === selectedSlotId) ?? null;
  }, [activeSpread, selectedSlotId]);

  if (!album) {
    return (
      <div className="flex min-h-screen flex-col bg-ivory">
        <TopNav />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="font-serif text-[20px] text-ink">Album not found</p>
            <p className="mt-1 text-[12.5px] text-ink-muted">The link may be broken or the album deleted.</p>
            <NextLink
              href="/studio/photo-albums"
              className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink hover:text-gold"
            >
              <ChevronLeft size={12} /> Back to My Albums
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  const spread = activeSpread!;
  const pageHeight = PAGE_WIDTH_DEFAULT * (PAGE_HEIGHT_RATIO_BY_SIZE[album.size] ?? 1);
  const layout = LAYOUT_BY_ID[spread.layout_template_id];
  const totalSpreadPhotos = spread.slots.filter((sl) => sl.photo_id).length;

  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav />

      {/* Editor top bar */}
      <div className="flex items-center justify-between border-b border-border bg-white px-6 py-3">
        <div className="flex items-center gap-4 min-w-0">
          <NextLink
            href="/studio/photo-albums"
            className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
          >
            <ChevronLeft size={12} /> My Albums
          </NextLink>
          <div className="h-5 w-px bg-border" />
          {titleEditing ? (
            <input
              autoFocus
              value={album.title}
              onChange={(e) => updateAlbum(album.id, { title: e.target.value })}
              onBlur={() => setTitleEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setTitleEditing(false);
              }}
              className="border-b border-gold bg-transparent font-serif text-[17px] text-ink focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setTitleEditing(true)}
              className="truncate font-serif text-[17px] text-ink hover:text-gold"
            >
              {album.title}
            </button>
          )}
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            {album.spreads.length} spreads · {album.photo_pool.length} photos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AIActionMenu
            album={album}
            activeSpreadId={spread.id}
            selectedSlotId={selectedSlotId}
            onToast={(msg) => {
              setToast(msg);
              setTimeout(() => setToast(null), 3200);
            }}
          />
          <button
            onClick={() => setCoverageOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink hover:bg-ivory-warm"
          >
            <Users size={12} /> Guest coverage
          </button>
          <button
            disabled
            title="Coming in Phase 2"
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink-faint"
          >
            <Eye size={12} /> Preview
          </button>
          <button
            disabled
            title="Coming in Phase 2"
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink-faint"
          >
            <Share2 size={12} /> Share
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink hover:bg-ivory-warm"
          >
            <Download size={12} /> PDF proof
          </button>
          <button
            onClick={() => setOrderFlowOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-[11.5px] font-medium text-ink hover:brightness-95"
          >
            Order
          </button>
        </div>
      </div>

      <LayoutPicker
        currentLayoutId={spread.layout_template_id}
        onSelect={(layoutId) => setSpreadLayout(album.id, spread.id, layoutId)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Canvas */}
        <main
          className="flex flex-1 items-center justify-center overflow-auto bg-ivory/30 p-8"
          onClick={() => setSelectedSlotId(null)}
        >
          <div className="flex flex-col items-center gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Spread {spread.position + 1} of {album.spreads.length}
              {" · "}
              {layout?.name}
            </p>
            <div
              className="rounded-sm shadow-[0_12px_32px_-12px_rgba(26,26,26,0.2),_0_6px_12px_-6px_rgba(26,26,26,0.1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <SpreadRenderer
                spread={spread}
                photos={album.photo_pool}
                pageWidth={PAGE_WIDTH_DEFAULT}
                pageHeight={pageHeight}
                interactive
                selectedSlotId={selectedSlotId}
                draggingPhotoId={draggingPhotoId}
                onSlotClick={(slotId) => setSelectedSlotId(slotId)}
                onSlotDrop={(slotId, photoId) => {
                  assignPhoto(album.id, spread.id, slotId, photoId);
                  setSelectedSlotId(slotId);
                }}
                onSlotRemove={(slotId) => {
                  assignPhoto(album.id, spread.id, slotId, null);
                  setSelectedSlotId(null);
                }}
              />
            </div>

            {/* Text block editor — only when layout has text frames */}
            {layout?.textFrames && layout.textFrames.length > 0 && (
              <div className="mt-4 w-full max-w-2xl rounded-md border border-border bg-white px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">Text</p>
                {spread.text_blocks.map((tb) => (
                  <input
                    key={tb.id}
                    value={tb.content}
                    onChange={(e) => updateTextBlock(album.id, spread.id, tb.id, { content: e.target.value })}
                    placeholder="Your title or caption"
                    className="mt-2 w-full rounded border border-border bg-white px-3 py-2 font-serif text-[14px] text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                ))}
              </div>
            )}

            {/* Per-slot fine-tune toolbar (shown when a slot is selected) */}
            {selectedSlot && selectedSlot.photo_id && (
              <div className="mt-4 flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 shadow-sm">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  Slot
                </span>
                <div className="mx-2 h-4 w-px bg-border" />
                <ToolbarButton
                  icon={<ZoomIn size={12} />}
                  label="Zoom in"
                  onClick={() =>
                    updateSlot(album.id, spread.id, selectedSlot.id, {
                      crop_zoom: Math.min(3, selectedSlot.crop_zoom + 0.1),
                    })
                  }
                />
                <ToolbarButton
                  icon={<ZoomOut size={12} />}
                  label="Zoom out"
                  onClick={() =>
                    updateSlot(album.id, spread.id, selectedSlot.id, {
                      crop_zoom: Math.max(1, selectedSlot.crop_zoom - 0.1),
                    })
                  }
                />
                <ToolbarButton
                  icon={<RotateCw size={12} />}
                  label="Rotate"
                  onClick={() => {
                    const next = (((selectedSlot.rotation + 90) % 360) as 0 | 90 | 180 | 270);
                    updateSlot(album.id, spread.id, selectedSlot.id, { rotation: next });
                  }}
                />
                <div className="mx-2 h-4 w-px bg-border" />
                <PanPad
                  onPan={(dx, dy) =>
                    updateSlot(album.id, spread.id, selectedSlot.id, {
                      crop_x: Math.max(0, Math.min(1, selectedSlot.crop_x + dx)),
                      crop_y: Math.max(0, Math.min(1, selectedSlot.crop_y + dy)),
                    })
                  }
                />
                <div className="mx-2 h-4 w-px bg-border" />
                <ToolbarButton
                  icon={<Star size={12} fill={album.cover_photo_id === selectedSlot.photo_id ? "currentColor" : "none"} />}
                  label={album.cover_photo_id === selectedSlot.photo_id ? "Cover photo" : "Set as cover"}
                  onClick={() =>
                    setCoverPhoto(
                      album.id,
                      album.cover_photo_id === selectedSlot.photo_id ? null : selectedSlot.photo_id,
                    )
                  }
                />
              </div>
            )}
          </div>
        </main>

        <PhotoPoolSidebar
          photos={album.photo_pool}
          usedPhotoIds={usedPhotoIds}
          onAddPhotos={(ps) => addPhotos(album.id, ps)}
          onRemovePhoto={(id) => removePhoto(album.id, id)}
          onDragPhoto={setDraggingPhotoId}
        />
      </div>

      <SpreadFilmstrip
        spreads={album.spreads}
        photos={album.photo_pool}
        activeSpreadId={spread.id}
        onSelect={(id) => {
          setActiveSpreadId(id);
          setSelectedSlotId(null);
        }}
        onAddSpread={(afterPosition) => addSpread(album.id, afterPosition, "full-bleed")}
        onDeleteSpread={(id) => {
          deleteSpread(album.id, id);
          setActiveSpreadId(null);
          setSelectedSlotId(null);
        }}
        onDuplicateSpread={(id) => duplicateSpread(album.id, id)}
        onReorderSpread={(id, newPosition) => reorderSpread(album.id, id, newPosition)}
      />

      {orderFlowOpen && (
        <OrderFlowModal
          album={album}
          onClose={() => setOrderFlowOpen(false)}
          onJumpToSpread={(id) => {
            setActiveSpreadId(id);
            setSelectedSlotId(null);
          }}
        />
      )}

      {coverageOpen && (
        <GuestCoverageDrawer
          album={album}
          onClose={() => setCoverageOpen(false)}
          onJumpToSpread={(id) => {
            setActiveSpreadId(id);
            setSelectedSlotId(null);
            setCoverageOpen(false);
          }}
          onToast={(msg) => {
            setToast(msg);
            setTimeout(() => setToast(null), 3200);
          }}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[12.5px] text-ivory shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded p-1.5 text-ink-muted hover:bg-ivory-warm hover:text-ink"
    >
      {icon}
    </button>
  );
}

// 4-direction pan pad for repositioning the photo inside a slot.
function PanPad({ onPan }: { onPan: (dx: number, dy: number) => void }) {
  const STEP = 0.05;
  return (
    <div className="grid grid-cols-3 gap-0.5">
      <span />
      <button onClick={() => onPan(0, -STEP)} className="rounded p-0.5 text-ink-muted hover:bg-ivory-warm" aria-label="Pan up">
        <Move size={10} className="rotate-0" />
      </button>
      <span />
      <button onClick={() => onPan(-STEP, 0)} className="rounded p-0.5 text-ink-muted hover:bg-ivory-warm" aria-label="Pan left">
        <Move size={10} className="-rotate-90" />
      </button>
      <span className="flex items-center justify-center text-[8px] text-ink-faint">pan</span>
      <button onClick={() => onPan(STEP, 0)} className="rounded p-0.5 text-ink-muted hover:bg-ivory-warm" aria-label="Pan right">
        <Move size={10} className="rotate-90" />
      </button>
      <span />
      <button onClick={() => onPan(0, STEP)} className="rounded p-0.5 text-ink-muted hover:bg-ivory-warm" aria-label="Pan down">
        <Move size={10} className="rotate-180" />
      </button>
      <span />
    </div>
  );
}
