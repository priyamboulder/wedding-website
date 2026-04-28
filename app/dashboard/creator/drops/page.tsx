"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Eye, Bookmark, MousePointerClick, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { CreatorAvatar } from "@/components/creators/CreatorAvatar";
import { DropCountdown } from "@/components/drops/DropCountdown";
import { useCreatorsStore } from "@/stores/creators-store";
import { useDropsStore } from "@/stores/drops-store";
import { getDropTimingStatus } from "@/types/drop";
import type { CreatorDrop, DropStatus } from "@/types/drop";

const STATUS_TONE: Record<DropStatus, string> = {
  scheduled: "bg-saffron/15 text-saffron",
  active: "bg-sage/15 text-sage",
  expired: "bg-ink-faint/10 text-ink-muted",
  archived: "bg-ink-faint/10 text-ink-muted",
};

export default function CreatorDropsPage() {
  const creators = useCreatorsStore((s) => s.creators);
  const allDrops = useDropsStore((s) => s.drops);
  const allItems = useDropsStore((s) => s.items);

  const [activeId, setActiveId] = useState<string>(creators[0]?.id ?? "");
  const creator = creators.find((c) => c.id === activeId);

  const myDrops = useMemo(
    () =>
      allDrops
        .filter((d) => d.creatorId === activeId)
        .sort(
          (a, b) =>
            new Date(b.startsAt).getTime() -
            new Date(a.startsAt).getTime(),
        ),
    [allDrops, activeId],
  );

  const counts = useMemo(() => {
    const totalViews = myDrops.reduce((s, d) => s + d.viewCount, 0);
    const totalSaves = myDrops.reduce((s, d) => s + d.saveCount, 0);
    return {
      live: myDrops.filter((d) => getDropTimingStatus(d) === "active").length,
      upcoming: myDrops.filter((d) => getDropTimingStatus(d) === "scheduled")
        .length,
      totalViews,
      totalSaves,
    };
  }, [myDrops]);

  if (!creator) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <TopNav />
        <p className="m-auto text-[13px] text-ink-muted">No creators available.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint">
          Creator · Drops
        </div>
      </TopNav>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Creator switcher */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Viewing as
          </span>
          {creators.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1 text-[11.5px] transition-colors",
                activeId === c.id
                  ? "border-gold/40 bg-gold-pale/40 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-gold/30",
              )}
            >
              <CreatorAvatar creator={c} size="xs" withBadge={false} />
              {c.displayName}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gold/15 pb-5">
          <div className="flex items-start gap-4">
            <CreatorAvatar creator={creator} size="lg" />
            <div>
              <h1 className="font-serif text-[24px] leading-tight text-ink">
                {creator.displayName} · Drops
              </h1>
              <p className="text-[12.5px] text-ink-muted">
                Time-limited capsule collections. Launch a drop to give your
                followers a reason to come back.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled
            title="Drop creation is managed by the Ananya team. Contact support to create a drop."
            className="flex cursor-not-allowed items-center gap-1.5 rounded-md bg-ink/40 px-3 py-1.5 text-[12px] font-medium text-ivory"
          >
            <Plus size={12} strokeWidth={1.8} />
            Create new drop
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Sparkles} label="Live now" value={String(counts.live)} tone="sage" />
          <Stat
            icon={Sparkles}
            label="Upcoming"
            value={String(counts.upcoming)}
            tone="saffron"
          />
          <Stat
            icon={Eye}
            label="Total views"
            value={counts.totalViews.toLocaleString()}
            tone="teal"
          />
          <Stat
            icon={Bookmark}
            label="Total saves"
            value={counts.totalSaves.toLocaleString()}
            tone="gold"
          />
        </div>

        {/* Drops list */}
        <h2 className="mt-8 mb-3 font-serif text-[18px] text-ink">My drops</h2>
        {myDrops.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-[13px] italic text-ink-muted">
            No drops yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {myDrops.map((d) => (
              <DropRow
                key={d.id}
                drop={d}
                itemCount={allItems.filter((i) => i.dropId === d.id).length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DropRow({
  drop,
  itemCount,
}: {
  drop: CreatorDrop;
  itemCount: number;
}) {
  const timing = getDropTimingStatus(drop);
  return (
    <Link
      href={`/shopping/drops/${drop.slug}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 transition-colors hover:border-gold/30"
    >
      <div
        className="h-14 w-14 shrink-0 rounded-md bg-cover bg-center"
        style={{ backgroundImage: `url(${drop.coverImageUrl})` }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-serif text-[14px] text-ink">{drop.title}</p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em]",
              STATUS_TONE[timing],
            )}
          >
            {timing}
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          #{drop.themeTag} · {itemCount} pieces ·{" "}
          <span style={{ color: drop.accentColor }}>
            <DropCountdown
              startsAt={drop.startsAt}
              endsAt={drop.endsAt}
            />
          </span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 font-mono text-[10.5px] text-ink-muted">
        <span className="flex items-center gap-1">
          <Eye size={11} strokeWidth={1.6} /> {drop.viewCount.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Bookmark size={11} strokeWidth={1.6} /> {drop.saveCount.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}

const TONE_BG: Record<string, string> = {
  gold: "bg-gold-pale/40 text-gold",
  sage: "bg-sage/15 text-sage",
  teal: "bg-teal/15 text-teal",
  saffron: "bg-saffron/15 text-saffron",
};

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  tone: keyof typeof TONE_BG;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div
        className={cn(
          "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full",
          TONE_BG[tone],
        )}
      >
        <Icon size={14} strokeWidth={1.7} />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      <p
        className="mt-0.5 text-[20px] text-ink"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        {value}
      </p>
    </div>
  );
}
