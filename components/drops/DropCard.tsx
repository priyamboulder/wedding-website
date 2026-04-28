"use client";

import Link from "next/link";
import { Bell, Layers } from "lucide-react";
import { CreatorAvatar } from "@/components/creators/CreatorAvatar";
import { DropCountdown } from "@/components/drops/DropCountdown";
import { useDropsStore } from "@/stores/drops-store";
import { useCreatorsStore } from "@/stores/creators-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import type { CreatorDrop } from "@/types/drop";
import { getDropTimingStatus } from "@/types/drop";

export function DropCard({
  drop,
  itemCount,
  weddingId,
  className,
}: {
  drop: CreatorDrop;
  itemCount: number;
  weddingId?: string | null;
  className?: string;
}) {
  const creator = useCreatorsStore((s) =>
    s.creators.find((c) => c.id === drop.creatorId),
  );
  const isSaved = useDropsStore((s) => s.isSaved(drop.id));
  const toggleSave = useDropsStore((s) => s.toggleSave);
  const addNotification = useNotificationsStore((s) => s.addNotification);

  const timing = getDropTimingStatus(drop);
  const upcoming = timing === "scheduled";
  const expired = timing === "expired";

  const dropHref = weddingId
    ? `/${weddingId}/shopping/drops/${drop.slug}`
    : `/shopping/drops/${drop.slug}`;

  const handleNotifyMe = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSaved) return;
    toggleSave(drop.id);
    addNotification({
      type: "drop_launch",
      recipient: "couple",
      title: `We'll let you know when "${drop.title}" goes live`,
      body: `Launching ${new Date(drop.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`,
      link: dropHref,
      actor_name: creator?.displayName ?? "Creator",
    });
  };

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-[0_8px_28px_-18px_rgba(26,26,26,0.25)] ${className ?? ""}`}
    >
      <div className="relative h-[120px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ backgroundImage: `url(${drop.coverImageUrl})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${drop.accentColor}00 0%, ${drop.accentColor}80 60%, ${drop.accentColor}E6 100%)`,
          }}
        />
        {/* Status pill */}
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white"
          style={{ backgroundColor: `${drop.accentColor}E6` }}
        >
          {expired ? "Archived" : upcoming ? "Coming soon" : "Live now"}
        </span>
        {/* Title overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p
            className="text-[20px] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {drop.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-white/90">
            {creator && (
              <>
                <CreatorAvatar creator={creator} size="xs" withBadge={false} />
                <span className="text-[11.5px]">{creator.displayName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 py-3">
        <div className="flex items-center justify-between text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Layers size={11} strokeWidth={1.6} />
            {itemCount} pieces
          </span>
          <span style={{ color: drop.accentColor }}>
            <DropCountdown startsAt={drop.startsAt} endsAt={drop.endsAt} />
          </span>
        </div>
        <p className="line-clamp-1 text-[12.5px] leading-snug text-ink-muted">
          {drop.description}
        </p>
        {upcoming ? (
          <button
            type="button"
            onClick={handleNotifyMe}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={{
              borderColor: `${drop.accentColor}66`,
              color: drop.accentColor,
              backgroundColor: isSaved ? `${drop.accentColor}1A` : "white",
            }}
          >
            <Bell size={12} strokeWidth={1.8} />
            {isSaved ? "We'll notify you" : "Notify me"}
          </button>
        ) : (
          <Link
            href={dropHref}
            className="mt-1 flex items-center justify-center rounded-md px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: drop.accentColor }}
          >
            {expired ? "Browse archive" : "Browse drop"}
          </Link>
        )}
      </div>
    </article>
  );
}
