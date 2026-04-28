"use client";

// Guest Coverage drawer — slides in from the right and lists every guest tag
// found in the photo pool, grouped by included / missing with photos /
// missing with no photos. Surfaces VIPs at the top; per-guest "Add to album"
// action inserts the best candidate photo into the most appropriate spread.

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertTriangle, Plus, Star } from "lucide-react";
import { useAlbumStore } from "@/stores/album-store";
import type { AlbumProject } from "@/types/album";
import { analyzeCoverage, planAddMissingGuest } from "@/lib/album-guest-coverage";

interface GuestCoverageDrawerProps {
  album: AlbumProject;
  onClose: () => void;
  onJumpToSpread: (spreadId: string) => void;
  onToast: (message: string) => void;
}

export function GuestCoverageDrawer({ album, onClose, onJumpToSpread, onToast }: GuestCoverageDrawerProps) {
  const assignPhoto = useAlbumStore((s) => s.assignPhoto);
  const report = useMemo(() => analyzeCoverage(album), [album]);

  function handleAddMissing(guest: string) {
    const plan = planAddMissingGuest(album, guest);
    if (!plan) {
      onToast(`No photos of ${guest} in the pool yet.`);
      return;
    }
    assignPhoto(album.id, plan.spread.id, plan.slotId, plan.photoId);
    onToast(`Added ${guest} to spread ${plan.spread.position + 1}`);
  }

  function handleAddAllMissing() {
    const missing = report.entries.filter((e) => e.status === "missing_with_photos");
    let added = 0;
    let current = album;
    for (const entry of missing) {
      const plan = planAddMissingGuest(current, entry.guest);
      if (!plan) continue;
      assignPhoto(current.id, plan.spread.id, plan.slotId, plan.photoId);
      // Fetch fresh state so subsequent plans see the updated placement.
      const next = useAlbumStore.getState().albums.find((a) => a.id === album.id);
      if (next) current = next;
      added += 1;
    }
    if (added === 0) onToast("No missing guests with available pool photos.");
    else onToast(`Added ${added} missing guest${added === 1 ? "" : "s"} to the album`);
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-ink/30" />
      <aside
        className="flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron">Guest coverage</p>
            <h2 className="mt-1 font-serif text-[20px] leading-tight text-ink">
              {report.included} of {report.total} guests in album
            </h2>
            <p className="mt-1 text-[12px] text-ink-muted">
              Every tagged guest on a placed photo counts toward coverage.
            </p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-ink-muted hover:bg-ivory-warm" aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {report.total === 0 ? (
            <EmptyState />
          ) : (
            <>
              {report.missingVip.length > 0 && (
                <div className="mb-4 rounded-md border border-rose/40 bg-rose-pale/30 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-rose">
                    <AlertTriangle size={12} /> VIPs not yet in album
                  </p>
                  <p className="mt-1 text-[12px] text-ink">
                    {report.missingVip.map((v) => v.guest).join(", ")}
                  </p>
                </div>
              )}

              {report.missing > 0 && (
                <button
                  onClick={handleAddAllMissing}
                  className="mb-4 inline-flex items-center gap-1.5 rounded-md border border-gold/50 bg-gold-pale px-3 py-1.5 text-[12px] font-medium text-gold hover:bg-gold/20"
                >
                  <Plus size={12} /> Add all missing guests
                </button>
              )}

              <CoverageGroup
                title={`In album (${report.included})`}
                tone="included"
                entries={report.entries.filter((e) => e.status === "included")}
                onJump={onJumpToSpread}
                onAddMissing={handleAddMissing}
                album={album}
              />
              <CoverageGroup
                title={`Missing with photos (${report.entries.filter((e) => e.status === "missing_with_photos").length})`}
                tone="missing"
                entries={report.entries.filter((e) => e.status === "missing_with_photos")}
                onJump={onJumpToSpread}
                onAddMissing={handleAddMissing}
                album={album}
              />
              <CoverageGroup
                title={`No photos available (${report.entries.filter((e) => e.status === "missing_no_photos").length})`}
                tone="noPhotos"
                entries={report.entries.filter((e) => e.status === "missing_no_photos")}
                onJump={onJumpToSpread}
                onAddMissing={handleAddMissing}
                album={album}
              />
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function CoverageGroup({
  title,
  tone,
  entries,
  onJump,
  onAddMissing,
  album,
}: {
  title: string;
  tone: "included" | "missing" | "noPhotos";
  entries: ReturnType<typeof analyzeCoverage>["entries"];
  onJump: (spreadId: string) => void;
  onAddMissing: (guest: string) => void;
  album: AlbumProject;
}) {
  if (entries.length === 0) return null;
  const toneHeader =
    tone === "included" ? "text-sage" : tone === "missing" ? "text-saffron" : "text-ink-faint";
  return (
    <section className="mb-6">
      <h3 className={cn("flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]", toneHeader)}>
        {tone === "included" && <CheckCircle2 size={12} />}
        {tone === "missing" && <AlertTriangle size={12} />}
        {title}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {entries.map((entry) => {
          const firstSpread = entry.spreadPositions[0];
          const firstSpreadObj = album.spreads.find((sp) => sp.position === firstSpread);
          return (
            <li
              key={entry.guest}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-white px-3 py-2"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-serif text-[13px] text-ink">
                  {entry.isVip && <Star size={11} className="text-gold" fill="currentColor" strokeWidth={0} />}
                  <span className="truncate">{entry.guest}</span>
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  {tone === "included" && (
                    <>
                      {entry.photoCount} photo{entry.photoCount === 1 ? "" : "s"} · spread{" "}
                      {entry.spreadPositions.map((p) => p + 1).join(", ")}
                    </>
                  )}
                  {tone === "missing" && (
                    <>
                      {entry.poolPhotoCount} photo{entry.poolPhotoCount === 1 ? "" : "s"} in pool (not placed)
                    </>
                  )}
                  {tone === "noPhotos" && <>No photos available</>}
                </p>
              </div>
              {tone === "missing" && (
                <button
                  onClick={() => onAddMissing(entry.guest)}
                  className="shrink-0 rounded-md border border-gold/50 bg-gold-pale px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-gold hover:bg-gold/20"
                >
                  + Add
                </button>
              )}
              {tone === "included" && firstSpreadObj && (
                <button
                  onClick={() => onJump(firstSpreadObj.id)}
                  className="shrink-0 rounded-md border border-border bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:bg-ivory-warm"
                >
                  View →
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-ivory-warm p-3 text-ink-muted">
        <CheckCircle2 size={24} />
      </div>
      <p className="mt-4 font-serif text-[15px] text-ink">No guest tags yet</p>
      <p className="mx-auto mt-1 max-w-xs text-[12px] text-ink-muted">
        Tag guests in the Photography module's face-tagging to see coverage insights here.
      </p>
    </div>
  );
}
