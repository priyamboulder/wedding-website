"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoMeta } from "@/types/vendor-discovery";

// Desktop: auto-play muted on hover. Mobile: tap the overlay to start.
// Keeps the image card layout intact — absolutely positioned <video> layer
// above the <img>.

export function VideoHoverPreview({
  video,
  posterUrl,
  className,
}: {
  video: VideoMeta | null;
  posterUrl: string | null;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.play().catch(() => setPlaying(false));
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [playing]);

  if (!video) {
    return null;
  }

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      onMouseEnter={() => setPlaying(true)}
      onMouseLeave={() => setPlaying(false)}
    >
      <video
        ref={videoRef}
        src={video.src_url}
        poster={posterUrl ?? video.poster_url}
        muted={muted}
        playsInline
        loop
        preload="none"
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          playing ? "opacity-100" : "opacity-0",
        )}
      />

      {!playing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPlaying(true);
          }}
          aria-label="Play preview"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-3 text-ivory shadow-lg backdrop-blur-sm transition-transform duration-200 hover:scale-110"
        >
          <Play size={18} strokeWidth={2} fill="currentColor" />
        </button>
      )}

      {playing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMuted(!muted);
          }}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute bottom-2 right-2 rounded-full bg-ink/70 p-1.5 text-ivory backdrop-blur-sm transition-opacity hover:bg-ink"
        >
          {muted ? (
            <VolumeX size={12} strokeWidth={2} />
          ) : (
            <Volume2 size={12} strokeWidth={2} />
          )}
        </button>
      )}
    </div>
  );
}
