"use client";

// ── Feed ────────────────────────────────────────────────────────────────────
// Topic filter pills + sort selector + thread cards. The actual list is
// computed via the store's `listThreads` selector so filter / sort logic
// stays in one place.

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useGrapevineStore } from "@/stores/grapevine-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import type { GrapevineSortKey } from "@/types/grapevine";
import { GrapevineThreadCard } from "./GrapevineThreadCard";
import {
  GrapevineTopicPills,
  type TopicFilter,
} from "./GrapevineTopicPills";

export function GrapevineFeed({
  topic,
  sort,
  onTopicChange,
  onSortChange,
  onStart,
}: {
  topic: TopicFilter;
  sort: GrapevineSortKey;
  onTopicChange: (slug: TopicFilter) => void;
  onSortChange: (s: GrapevineSortKey) => void;
  onStart: () => void;
}) {
  const threads = useGrapevineStore((s) => s.threads);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);

  const list = useMemo(() => {
    // Re-runs when threads / topic / sort change. listThreads reads from
    // the store snapshot so we depend on `threads` to invalidate.
    return useGrapevineStore.getState().listThreads({ topic, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads, topic, sort]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — what brides are saying —
          </p>
          <h2 className="mt-1 font-serif text-[24px] font-medium leading-tight text-ink">
            {topicHeading(topic)}
          </h2>
        </div>
        <SortSelect value={sort} onChange={onSortChange} />
      </div>

      <div className="overflow-x-auto">
        <GrapevineTopicPills active={topic} onChange={onTopicChange} />
      </div>

      {list.length === 0 ? (
        <EmptyState onStart={onStart} hasAny={threads.length > 0} />
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <GrapevineThreadCard
              key={t.id}
              thread={t}
              currentUserId={myProfileId ?? undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function topicHeading(topic: TopicFilter): string {
  switch (topic) {
    case "all":
      return "every conversation, in one place.";
    case "vendor_experiences":
      return "the real story behind the review.";
    case "pricing_and_contracts":
      return "what they quote vs. what you pay.";
    case "red_flags":
      return "what to watch for before you sign.";
    case "recommendations":
      return "the vendors brides come back for.";
    case "has_anyone_worked_with":
      return "honest answers before you book.";
    case "advice_and_tips":
      return "what we wish someone had told us.";
    default:
      return "every conversation, in one place.";
  }
}

function SortSelect({
  value,
  onChange,
}: {
  value: GrapevineSortKey;
  onChange: (s: GrapevineSortKey) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Sort
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as GrapevineSortKey)}
        className={cn(
          "rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink",
          "focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15",
        )}
      >
        <option value="newest">Newest</option>
        <option value="most_discussed">Most discussed</option>
        <option value="most_helpful">Most helpful</option>
      </select>
    </div>
  );
}

function EmptyState({
  onStart,
  hasAny,
}: {
  onStart: () => void;
  hasAny: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gold/25 bg-ivory-warm/30 px-6 py-12 text-center">
      <p className="font-serif text-[20px] italic text-ink">
        {hasAny
          ? "no threads in this topic yet."
          : "no one's started talking yet — be the first."}
      </p>
      <p className="mt-2 text-[13px] text-ink-muted">
        the next bride will thank you.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
      >
        start a thread
      </button>
    </div>
  );
}
