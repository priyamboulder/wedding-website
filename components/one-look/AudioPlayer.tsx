"use client";

// ── Inline audio player ──────────────────────────────────────────────────
// Tap-to-play slim inline player. Resolves the IndexedDB blob on first click
// so initial card render doesn't pay the cost. Auto-pauses other instances
// via a lightweight pub/sub so only one card plays at a time.

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveBlobUrl } from "@/lib/one-look/blob-store";

// Broadcast when a player starts — others listen and pause.
type PlayerId = string;
const playingListeners = new Set<(activeId: PlayerId) => void>();

function broadcastPlay(id: PlayerId) {
  playingListeners.forEach((fn) => fn(id));
}

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  blobKey,
  durationSeconds,
}: {
  blobKey: string;
  durationSeconds: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const idRef = useRef<PlayerId>(blobKey + "_" + Math.random());
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fn = (activeId: PlayerId) => {
      if (activeId !== idRef.current && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setPlaying(false);
      }
    };
    playingListeners.add(fn);
    return () => {
      playingListeners.delete(fn);
    };
  }, []);

  async function ensureLoaded(): Promise<string | null> {
    if (url) return url;
    setLoading(true);
    const u = await resolveBlobUrl(blobKey);
    setLoading(false);
    if (u) setUrl(u);
    return u;
  }

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) {
      const u = await ensureLoaded();
      if (!u) return;
      // Wait one tick for the audio element to mount
      requestAnimationFrame(() => toggle());
      return;
    }
    if (audio.paused) {
      broadcastPlay(idRef.current);
      audio.play().catch(() => {});
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  const pct = durationSeconds > 0 ? Math.min(100, (current / durationSeconds) * 100) : 0;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-2.5 py-1">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
          playing ? "bg-ink text-ivory" : "bg-ivory-warm text-ink hover:bg-gold-pale/60",
        )}
      >
        {playing ? <Pause size={11} strokeWidth={2} /> : <Play size={11} strokeWidth={2} />}
      </button>
      <div className="h-1 w-20 overflow-hidden rounded-full bg-ivory-deep">
        <div
          className="h-full bg-ink transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted tabular-nums"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {loading ? "…" : formatDuration(playing ? current : durationSeconds)}
      </span>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onEnded={() => {
            setPlaying(false);
            setCurrent(0);
          }}
          onPause={() => setPlaying(false)}
        />
      )}
    </div>
  );
}
