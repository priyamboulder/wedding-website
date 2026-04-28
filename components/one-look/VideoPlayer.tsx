"use client";

// ── Inline video player ──────────────────────────────────────────────────
// Shows the thumbnail first; on first play click, resolves the IndexedDB
// blob and swaps in the video element. Tapping again toggles play/pause.

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveBlobUrl } from "@/lib/one-look/blob-store";

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  blobKey,
  durationSeconds,
  thumbnailDataUrl,
  size = "compact",
}: {
  blobKey: string;
  durationSeconds: number;
  thumbnailDataUrl: string | null;
  size?: "compact" | "wide";
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  async function handleClick() {
    if (!url) {
      const u = await resolveBlobUrl(blobKey);
      if (!u) return;
      setUrl(u);
      setExpanded(true);
      requestAnimationFrame(() => {
        videoRef.current?.play().catch(() => {});
        setPlaying(true);
      });
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-ink/90",
        size === "wide" ? "aspect-video w-full" : "aspect-square w-32",
        expanded && "aspect-square w-full max-w-sm",
      )}
    >
      {url ? (
        <video
          ref={videoRef}
          src={url}
          poster={thumbnailDataUrl ?? undefined}
          playsInline
          controls={expanded}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          className="h-full w-full object-cover"
        />
      ) : thumbnailDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailDataUrl}
          alt=""
          className="h-full w-full object-cover opacity-85"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-ink to-ink-soft" />
      )}

      {!playing && (
        <button
          type="button"
          onClick={handleClick}
          aria-label="Play video"
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/20 text-ivory backdrop-blur-[1px] transition-colors hover:bg-black/30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-ink">
            <Play size={16} strokeWidth={2} />
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatDuration(durationSeconds)}
          </span>
        </button>
      )}
    </div>
  );
}
