"use client";

import type { PostStats } from "@/lib/social/types";

type Props = {
  stats: PostStats;
};

type Card = { label: string; value: number; accent: string };

export default function PostsStatsBar({ stats }: Props) {
  const cards: Card[] = [
    { label: "Total Posts", value: stats.total, accent: "text-neutral-900" },
    { label: "Drafts", value: stats.drafts, accent: "text-neutral-600" },
    { label: "Approved", value: stats.approved, accent: "text-emerald-700" },
    { label: "Published", value: stats.published, accent: "text-amber-700" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {c.label}
          </p>
          <p className={`mt-1 text-2xl font-semibold tabular-nums ${c.accent}`}>
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
