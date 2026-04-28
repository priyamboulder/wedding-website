"use client";

import { useMemo, useState } from "react";
import { Film, Play, MapPin, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoKind, VideoMeta } from "@/types/vendor-discovery";

const KIND_LABEL: Record<VideoKind, string> = {
  intro: "Meet them",
  portfolio: "Portfolio Reels",
  testimonial: "Couple Testimonials",
  behind_scenes: "Behind the Scenes",
};

const KIND_ORDER: VideoKind[] = ["intro", "portfolio", "testimonial", "behind_scenes"];

export function VideoGallery({
  videos,
  highlightedIds = [],
}: {
  videos: VideoMeta[];
  // When the couple's venue/style matches these reels, highlight them.
  highlightedIds?: string[];
}) {
  const byKind = useMemo(() => {
    const map = new Map<VideoKind, VideoMeta[]>();
    for (const v of videos) {
      const list = map.get(v.kind) ?? [];
      list.push(v);
      map.set(v.kind, list);
    }
    return map;
  }, [videos]);

  const [active, setActive] = useState<VideoMeta | null>(null);

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-border py-12 text-center">
        <Film size={20} strokeWidth={1.4} className="text-ink-faint" />
        <p className="font-serif text-[14px] text-ink-muted">
          No video yet.
        </p>
        <p className="max-w-sm text-[12px] text-ink-faint">
          Couples book faster from vendors with a 60-second intro and a few
          portfolio reels. Ask them.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {KIND_ORDER.map((kind) => {
          const list = byKind.get(kind);
          if (!list || list.length === 0) return null;
          return (
            <section key={kind} className="flex flex-col gap-3">
              <header className="flex items-center justify-between">
                <h3
                  className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {KIND_LABEL[kind]}
                </h3>
                <span
                  className="font-mono text-[10px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {list.length}
                </span>
              </header>
              <div
                className={cn(
                  "grid gap-3",
                  kind === "intro"
                    ? "grid-cols-1"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
                )}
              >
                {list.map((v) => (
                  <VideoTile
                    key={v.id}
                    video={v}
                    prominent={kind === "intro"}
                    highlighted={highlightedIds.includes(v.id)}
                    onClick={() => setActive(v)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {active && <VideoLightbox video={active} onClose={() => setActive(null)} />}
    </>
  );
}

function VideoTile({
  video,
  prominent,
  highlighted,
  onClick,
}: {
  video: VideoMeta;
  prominent?: boolean;
  highlighted?: boolean;
  onClick: () => void;
}) {
  const ratio =
    video.aspect === "9:16" ? "aspect-[9/16]" :
    video.aspect === "1:1"  ? "aspect-square" :
                               "aspect-video";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[10px] bg-ivory-warm text-left transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(26,26,26,0.15)]",
        highlighted && "ring-2 ring-gold ring-offset-2 ring-offset-ivory",
        prominent && "aspect-video w-full max-w-2xl",
        !prominent && ratio,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={video.poster_url}
        alt={video.title}
        loading="lazy"
        className="h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.03] group-hover:saturate-[1.08]"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory/95 p-3 shadow-lg transition-transform duration-200 group-hover:scale-110">
        <Play size={16} strokeWidth={2} fill="currentColor" className="text-ink" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-2.5 text-ivory">
        <p className="line-clamp-1 text-[12px] font-medium">{video.title}</p>
        <div className="mt-1 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-wider text-ivory/70">
          <span>{formatDuration(video.duration_seconds)}</span>
          {video.venue_name && (
            <>
              <span className="opacity-40">·</span>
              <span className="line-clamp-1 normal-case">
                {video.venue_name}
              </span>
            </>
          )}
        </div>
      </div>

      {highlighted && (
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ivory",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Your venue
        </span>
      )}
    </button>
  );
}

function VideoLightbox({ video, onClose }: { video: VideoMeta; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-0 top-0 -mt-10 rounded-full bg-ivory/10 p-2 text-ivory transition-colors hover:bg-ivory/20"
        >
          <X size={18} strokeWidth={1.8} />
        </button>

        <video
          key={video.src_url}
          src={video.src_url}
          poster={video.poster_url}
          controls
          autoPlay
          className={cn(
            "w-full rounded-[12px] bg-black",
            video.aspect === "9:16" && "mx-auto max-w-sm",
          )}
        />

        <div className="flex flex-col gap-2 text-ivory">
          <h4 className="font-serif text-[18px] leading-tight">{video.title}</h4>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ivory/70">
            {video.venue_name && (
              <span className="flex items-center gap-1">
                <MapPin size={11} strokeWidth={1.8} />
                {video.venue_name}
              </span>
            )}
            {video.wedding_date && (
              <span className="flex items-center gap-1">
                <Calendar size={11} strokeWidth={1.8} />
                {new Date(video.wedding_date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
            {video.couple_names && <span>{video.couple_names}</span>}
          </div>
          {(video.wedding_style ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {video.wedding_style!.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-ivory/10 px-2 py-0.5 text-[10.5px] text-ivory/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
