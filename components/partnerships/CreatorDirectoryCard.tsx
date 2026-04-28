"use client";

import { Sparkles, Users, Layers, TrendingUp } from "lucide-react";
import {
  CreatorAvatar,
  formatFollowerCount,
} from "@/components/creators/CreatorAvatar";
import type { Creator } from "@/types/creator";

export type DirectoryCreator = Creator & {
  collectionCount: number;
  pickCount: number;
  avgPicksPerCollection: number;
  engagementRate: number;
};

const TIER_LABEL: Record<Creator["tier"], string> = {
  standard: "Standard",
  rising: "Rising",
  top_creator: "Top creator",
  partner: "Partner",
};

const TIER_TONE: Record<Creator["tier"], string> = {
  standard: "bg-ink-faint/10 text-ink-muted",
  rising: "bg-sage/15 text-sage",
  top_creator: "bg-gold-pale/40 text-gold",
  partner: "bg-gradient-to-r from-ink to-gold text-ivory",
};

export function CreatorDirectoryCard({
  creator,
  onPropose,
}: {
  creator: DirectoryCreator;
  onPropose: () => void;
}) {
  return (
    <article
      className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 transition-shadow hover:shadow-[0_4px_18px_-12px_rgba(26,26,26,0.18)]"
    >
      <header className="flex items-start gap-3">
        <CreatorAvatar creator={creator} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-[16px] leading-tight text-ink">
            {creator.displayName}
          </h3>
          <p className="truncate font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
            {creator.handle}
          </p>
          <span
            className={`mt-1 inline-flex rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em] ${TIER_TONE[creator.tier]}`}
          >
            {TIER_LABEL[creator.tier]}
          </span>
        </div>
      </header>

      <p className="line-clamp-2 text-[12.5px] leading-snug text-ink-muted">
        {creator.bio}
      </p>

      <dl className="grid grid-cols-2 gap-2 text-[11.5px]">
        <Stat
          icon={Users}
          label="Followers"
          value={formatFollowerCount(creator.followerCount)}
        />
        <Stat
          icon={Layers}
          label="Collections"
          value={String(creator.collectionCount)}
        />
        <Stat
          icon={Sparkles}
          label="Avg picks"
          value={String(creator.avgPicksPerCollection)}
        />
        <Stat
          icon={TrendingUp}
          label="Engagement"
          value={`${(creator.engagementRate * 100).toFixed(1)}%`}
        />
      </dl>

      {creator.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {creator.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-ivory-warm/60 px-2 py-0.5 text-[10.5px] text-ink-muted"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onPropose}
        className="mt-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink/90"
      >
        Propose partnership
      </button>
    </article>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} strokeWidth={1.6} className="text-gold" />
      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      <span className="ml-auto font-medium text-ink">{value}</span>
    </div>
  );
}
