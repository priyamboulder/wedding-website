"use client";

import { Eye, Film, MessageCircle, TrendingUp } from "lucide-react";
import type { VideoMeta } from "@/types/vendor-discovery";

export function VideoMetrics({ videos }: { videos: VideoMeta[] }) {
  const totalViews = videos.reduce((s, v) => s + (v.views ?? 0), 0);
  const avgPlayThrough =
    videos.length === 0
      ? 0
      : videos.reduce((s, v) => s + (v.play_through_rate ?? 0), 0) /
        videos.length;
  const inquiries = videos.reduce(
    (s, v) => s + (v.inquiries_from_video ?? 0),
    0,
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat icon={Film} label="Videos" value={videos.length.toString()} />
      <Stat
        icon={Eye}
        label="Total views"
        value={formatCount(totalViews)}
      />
      <Stat
        icon={TrendingUp}
        label="Avg play-through"
        value={`${Math.round(avgPlayThrough * 100)}%`}
      />
      <Stat
        icon={MessageCircle}
        label="Inquiries from video"
        value={inquiries.toString()}
      />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-[10px] border border-border bg-white p-3">
      <div className="flex items-center justify-between">
        <Icon size={13} strokeWidth={1.7} className="text-ink-faint" />
        <span
          className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
      </div>
      <div className="font-serif text-[22px] leading-none text-ink">{value}</div>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
