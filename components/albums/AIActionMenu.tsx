"use client";

// Gold ✨ sparkle button + dropdown with AI-design actions. Lives in the top
// bar of the editor. The entire pipeline runs client-side via
// `lib/album-ai-layout` — no Anthropic round trip in the prototype.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, RotateCw, Replace, Plus } from "lucide-react";
import type { AlbumProject } from "@/types/album";
import {
  EVENT_ORDER,
  addEventSpreads,
  generateAlbumLayout,
  redesignSpread,
  suggestReplacement,
} from "@/lib/album-ai-layout";
import { useAlbumStore } from "@/stores/album-store";

interface AIActionMenuProps {
  album: AlbumProject;
  activeSpreadId: string;
  selectedSlotId: string | null;
  onToast: (message: string) => void;
}

const EVENT_LABELS: Record<string, string> = {
  haldi: "Haldi",
  mehendi: "Mehendi",
  sangeet: "Sangeet",
  baraat: "Baraat",
  wedding: "Wedding",
  reception: "Reception",
};

export function AIActionMenu({ album, activeSpreadId, selectedSlotId, onToast }: AIActionMenuProps) {
  const replaceSpreads = useAlbumStore((s) => s.replaceSpreads);
  const assignPhoto = useAlbumStore((s) => s.assignPhoto);
  const updateSlot = useAlbumStore((s) => s.updateSlot);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<null | "full" | "spread" | "replace" | "event">(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [expandEventPicker, setExpandEventPicker] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeSpread = album.spreads.find((s) => s.id === activeSpreadId);
  const usedPhotoIds = new Set<string>();
  album.spreads.forEach((sp) => sp.slots.forEach((sl) => sl.photo_id && usedPhotoIds.add(sl.photo_id)));
  const unusedPhotos = album.photo_pool.filter((p) => !usedPhotoIds.has(p.id));

  const eventsWithUnused = EVENT_ORDER.filter((ev) => unusedPhotos.some((p) => p.eventTag === ev));

  async function designFullAlbum() {
    if (album.photo_pool.length === 0) {
      onToast("Add some photos to the pool first — AI needs content to design from.");
      return;
    }
    setBusy("full");
    // Fake async feel — the work is sync but let the UI show the spinner.
    await new Promise((r) => setTimeout(r, 600));
    const result = generateAlbumLayout({
      title: album.title,
      subtitle: album.spine_text,
      pool: album.photo_pool,
    });
    replaceSpreads(album.id, result.spreads);
    setBusy(null);
    setOpen(false);
    onToast(
      `AI designed ${result.spreadCount} spreads from ${result.curatedCount} photos` +
        (result.unusedCount > 0 ? ` · ${result.unusedCount} unused` : ""),
    );
  }

  async function redesignCurrentSpread() {
    if (!activeSpread) return;
    setBusy("spread");
    await new Promise((r) => setTimeout(r, 400));
    const redesigned = redesignSpread(activeSpread, album.photo_pool);
    // Replace the spread wholesale so both layout and photo placement reflect
    // the AI's rearrangement.
    const nextSpreads = album.spreads.map((sp) => (sp.id === activeSpread.id ? redesigned : sp));
    replaceSpreads(album.id, nextSpreads);
    setBusy(null);
    setOpen(false);
    onToast("Spread redesigned");
  }

  function suggestForSelectedSlot() {
    if (!activeSpread || !selectedSlotId) {
      onToast("Select a photo slot first to get a replacement suggestion.");
      return;
    }
    setBusy("replace");
    const suggestion = suggestReplacement(activeSpread, selectedSlotId, album.photo_pool, usedPhotoIds);
    setBusy(null);
    setOpen(false);
    if (!suggestion) {
      onToast("No unused photos match this slot.");
      return;
    }
    assignPhoto(album.id, activeSpread.id, selectedSlotId, suggestion.id);
    updateSlot(album.id, activeSpread.id, selectedSlotId, { crop_x: 0.5, crop_y: 0.45, crop_zoom: 1 });
    onToast(`Swapped in "${suggestion.caption ?? "photo"}"`);
  }

  function addMoreFromEvent(event: string) {
    setBusy("event");
    const nextSpreads = addEventSpreads(album.spreads, event, unusedPhotos);
    replaceSpreads(album.id, nextSpreads);
    setBusy(null);
    setOpen(false);
    setExpandEventPicker(false);
    const added = nextSpreads.length - album.spreads.length;
    onToast(added > 0 ? `Added ${added} ${EVENT_LABELS[event]} spread${added === 1 ? "" : "s"}` : "No additions available");
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={busy !== null}
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold-pale px-3 py-1.5 text-[11.5px] font-medium text-gold transition-colors hover:bg-gold/20",
          busy !== null && "opacity-60",
        )}
      >
        <Sparkles size={12} className={busy ? "animate-pulse" : ""} />
        {busy ? "Designing…" : "AI design"}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-72 overflow-hidden rounded-md border border-border bg-white shadow-xl">
          <MenuItem
            icon={<Sparkles size={13} />}
            title="Design entire album"
            detail="Re-runs the AI pipeline with your full photo pool."
            onClick={designFullAlbum}
          />
          <MenuItem
            icon={<RotateCw size={13} />}
            title="Redesign this spread"
            detail="Keep these photos, pick a new layout."
            disabled={!activeSpread || activeSpread.slots.every((s) => !s.photo_id)}
            onClick={redesignCurrentSpread}
          />
          <MenuItem
            icon={<Replace size={13} />}
            title="Suggest replacement photo"
            detail={
              selectedSlotId ? "Swap in the best-matching unused photo." : "Click a slot first, then try again."
            }
            disabled={!selectedSlotId}
            onClick={suggestForSelectedSlot}
          />
          <div className="border-t border-border">
            <button
              onClick={() => setExpandEventPicker((v) => !v)}
              className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-ivory-warm"
            >
              <Plus size={13} className="mt-0.5 text-gold" />
              <div>
                <p className="font-serif text-[13px] text-ink">Add more from event…</p>
                <p className="text-[11px] text-ink-muted">
                  {eventsWithUnused.length > 0
                    ? `Unused photos available for ${eventsWithUnused.length} event${eventsWithUnused.length === 1 ? "" : "s"}.`
                    : "No unused event photos in the pool."}
                </p>
              </div>
            </button>
            {expandEventPicker && eventsWithUnused.length > 0 && (
              <div className="border-t border-border bg-ivory/30 px-3 py-2">
                {eventsWithUnused.map((ev) => {
                  const count = unusedPhotos.filter((p) => p.eventTag === ev).length;
                  return (
                    <button
                      key={ev}
                      onClick={() => addMoreFromEvent(ev)}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12px] text-ink hover:bg-white"
                    >
                      <span className="font-serif">{EVENT_LABELS[ev]}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                        {count} photo{count === 1 ? "" : "s"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  title,
  detail,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-2 px-3 py-2.5 text-left",
        disabled ? "cursor-not-allowed opacity-50" : "hover:bg-ivory-warm",
      )}
    >
      <span className="mt-0.5 text-gold">{icon}</span>
      <div>
        <p className="font-serif text-[13px] text-ink">{title}</p>
        <p className="text-[11px] text-ink-muted">{detail}</p>
      </div>
    </button>
  );
}
