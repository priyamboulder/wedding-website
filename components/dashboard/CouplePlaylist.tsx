"use client";

// ── CouplePlaylist ───────────────────────────────────────────────────────
// Compact running playlist card on the dashboard. Couples drop songs in
// across the planning period and tag each to an event bucket (garba,
// sangeet, ceremony, reception, baraat, haldi-mehendi, other). The card
// has two states:
//
//   • Collapsed — short summary ("14 songs across 4 events") + the most
//     recent 3 entries grouped by bucket. Always shows the quick-add
//     input so capture is one keystroke away.
//   • Expanded — full grouped list, drag-reorder within each bucket,
//     export-for-DJ + clear actions in the footer.
//
// V1 captures by manual entry (title + artist + bucket). spotifyId is
// reserved on the row so a future Spotify-search hookup can land here
// without changing the schema.

import { useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Music2,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import {
  useCouplePlaylistStore,
  PLAYLIST_BUCKET_LABEL,
  PLAYLIST_BUCKET_ORDER,
  type PlaylistEventBucket,
  type PlaylistSong,
} from "@/stores/couple-playlist-store";
import { cn } from "@/lib/utils";

interface DraftState {
  title: string;
  artist: string;
  bucket: PlaylistEventBucket;
}

const EMPTY_DRAFT: DraftState = {
  title: "",
  artist: "",
  bucket: "sangeet",
};

export function CouplePlaylist() {
  const songs = useCouplePlaylistStore((s) => s.songs);
  const addSong = useCouplePlaylistStore((s) => s.addSong);
  const removeSong = useCouplePlaylistStore((s) => s.removeSong);
  const reorderInBucket = useCouplePlaylistStore((s) => s.reorderInBucket);

  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [expanded, setExpanded] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const draggingId = useRef<string | null>(null);

  const grouped = useMemo(() => {
    const byBucket = new Map<PlaylistEventBucket, PlaylistSong[]>();
    for (const b of PLAYLIST_BUCKET_ORDER) byBucket.set(b, []);
    for (const song of songs) {
      const list = byBucket.get(song.bucket) ?? [];
      list.push(song);
      byBucket.set(song.bucket, list);
    }
    for (const list of byBucket.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return byBucket;
  }, [songs]);

  const activeBuckets = useMemo(
    () =>
      PLAYLIST_BUCKET_ORDER.filter((b) => (grouped.get(b)?.length ?? 0) > 0),
    [grouped],
  );

  const submit = () => {
    const title = draft.title.trim();
    const artist = draft.artist.trim();
    if (!title) return;
    addSong({ title, artist, bucket: draft.bucket });
    setDraft({ ...EMPTY_DRAFT, bucket: draft.bucket });
    titleRef.current?.focus();
  };

  const exportPlain = () => {
    const lines: string[] = [];
    for (const bucket of PLAYLIST_BUCKET_ORDER) {
      const list = grouped.get(bucket) ?? [];
      if (list.length === 0) continue;
      lines.push(PLAYLIST_BUCKET_LABEL[bucket].toUpperCase());
      for (const song of list) {
        lines.push(
          song.artist
            ? `  ♫ ${song.title} — ${song.artist}`
            : `  ♫ ${song.title}`,
        );
      }
      lines.push("");
    }
    const text = lines.join("\n").trim();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => undefined);
    }
  };

  const totalSongs = songs.length;

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="dash-spread-title">
            Your <em>playlist</em>
          </h2>
          <p className="dash-spread-sub">
            Catch songs as you hear them — we'll group them by event for the
            DJ later.
          </p>
        </div>
        {totalSongs > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)] transition-colors hover:text-[color:var(--dash-blush-deep)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {expanded ? (
              <>
                Collapse
                <ChevronUp size={11} />
              </>
            ) : (
              <>
                View full playlist
                <ChevronDown size={11} />
              </>
            )}
          </button>
        )}
      </div>

      <div className="dash-card px-5 py-5">
        {/* Quick-add row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={titleRef}
            value={draft.title}
            onChange={(e) =>
              setDraft((d) => ({ ...d, title: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Song title"
            className="dash-input flex-1 border border-[color:var(--dash-card-border)] bg-[color:var(--dash-canvas)] px-3 py-2 font-serif text-[14px] italic"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          />
          <input
            value={draft.artist}
            onChange={(e) =>
              setDraft((d) => ({ ...d, artist: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Artist"
            className="dash-input w-full border border-[color:var(--dash-card-border)] bg-[color:var(--dash-canvas)] px-3 py-2 text-[13px] sm:max-w-[180px]"
          />
          <select
            value={draft.bucket}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                bucket: e.target.value as PlaylistEventBucket,
              }))
            }
            aria-label="Event"
            className="rounded-[4px] border border-[color:var(--dash-card-border)] bg-[color:var(--dash-canvas)] px-2 py-2 text-[12.5px] text-[color:var(--dash-text-muted)] focus:border-[color:var(--dash-blush)] focus:outline-none"
          >
            {PLAYLIST_BUCKET_ORDER.map((b) => (
              <option key={b} value={b}>
                {PLAYLIST_BUCKET_LABEL[b]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.title.trim()}
            className={cn(
              "dash-btn dash-btn--sm shrink-0",
              !draft.title.trim() && "opacity-50 cursor-not-allowed",
            )}
          >
            <Music2 size={12} />
            Add
          </button>
        </div>

        {totalSongs === 0 ? (
          <p
            className="mt-4 px-1 font-serif text-[14px] italic text-[color:var(--dash-text-faint)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          >
            Your wedding soundtrack starts the moment you hear the first one.
          </p>
        ) : (
          <>
            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[color:var(--dash-text-faint)]">
              {totalSongs} {totalSongs === 1 ? "song" : "songs"} across{" "}
              {activeBuckets.length}{" "}
              {activeBuckets.length === 1 ? "event" : "events"}
            </p>

            <div className="mt-3 flex flex-col gap-4">
              {(expanded
                ? activeBuckets
                : activeBuckets.slice(0, 3)
              ).map((bucket) => {
                const list = grouped.get(bucket) ?? [];
                const visible = expanded ? list : list.slice(0, 3);
                return (
                  <div key={bucket}>
                    <p
                      className="mb-1 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--dash-blush-deep)]"
                      style={{
                        fontFamily:
                          "Inter, var(--font-sans), sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {PLAYLIST_BUCKET_LABEL[bucket]}
                    </p>
                    <ul className="flex flex-col">
                      {visible.map((song, idx) => (
                        <li
                          key={song.id}
                          draggable={expanded}
                          onDragStart={() => {
                            draggingId.current = song.id;
                          }}
                          onDragOver={(e) => {
                            if (!expanded) return;
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            if (!expanded) return;
                            e.preventDefault();
                            const fromId = draggingId.current;
                            draggingId.current = null;
                            if (!fromId || fromId === song.id) return;
                            reorderInBucket(fromId, idx);
                          }}
                          className="dash-row group items-center text-[13px]"
                          style={{ paddingLeft: 0, paddingRight: 0 }}
                        >
                          {expanded && (
                            <span
                              aria-hidden
                              className="cursor-grab text-[color:var(--dash-text-faint)] group-hover:text-[color:var(--dash-blush-deep)]"
                            >
                              <GripVertical size={12} />
                            </span>
                          )}
                          <span
                            aria-hidden
                            className="text-[color:var(--dash-blush)]"
                          >
                            ♫
                          </span>
                          <span
                            className="min-w-0 flex-1 truncate font-serif text-[14.5px] text-[color:var(--dash-text)]"
                            style={{
                              fontFamily:
                                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                            }}
                          >
                            {song.title}
                            {song.artist && (
                              <span className="text-[color:var(--dash-text-muted)]">
                                {" "}
                                — {song.artist}
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSong(song.id)}
                            aria-label={`Remove ${song.title}`}
                            className="opacity-0 text-[color:var(--dash-text-faint)] transition-opacity hover:text-[color:var(--color-terracotta)] group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    {!expanded && list.length > visible.length && (
                      <p className="mt-1 text-[11px] italic text-[color:var(--dash-text-faint)]">
                        + {list.length - visible.length} more in{" "}
                        {PLAYLIST_BUCKET_LABEL[bucket].toLowerCase()}
                      </p>
                    )}
                  </div>
                );
              })}
              {!expanded && activeBuckets.length > 3 && (
                <p className="text-[11px] italic text-[color:var(--dash-text-faint)]">
                  + songs in {activeBuckets.length - 3} more event
                  {activeBuckets.length - 3 === 1 ? "" : "s"}
                </p>
              )}
            </div>

            {expanded && (
              <div className="mt-4 flex items-center justify-between border-t border-[color:rgba(45,45,45,0.06)] pt-3">
                <button
                  type="button"
                  onClick={exportPlain}
                  className="inline-flex items-center gap-1.5 text-[12px] text-[color:var(--dash-blush-deep)] hover:underline"
                >
                  <Share2 size={12} />
                  Copy as text for the DJ
                </button>
                <span className="text-[11px] italic text-[color:var(--dash-text-faint)]">
                  Drag the handle to reorder within an event
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
