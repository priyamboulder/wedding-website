"use client";

// ── Community Discover — One Look section ────────────────────────────────
// Renders recent One Looks in the Brides Discover feed. Batches 3+ One Looks
// from the same bride within a 2-hour window into a single grouped card.
// Links to the Trails discovery grid.

import NextLink from "next/link";
import { useMemo } from "react";
import { Compass } from "lucide-react";
import { useOneLookStore } from "@/stores/one-look-store";
import type { OneLookReview } from "@/types/one-look";
import {
  OneLookStoryCard,
  OneLookGroupedStoryCard,
} from "./OneLookStoryCard";

const BATCH_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours
const MIN_GROUP_SIZE = 3;

// Returns an interleaved list of individual + grouped cards, most-recent first.
function batchByBride(reviews: OneLookReview[]): Array<
  | { type: "single"; review: OneLookReview; key: string }
  | { type: "group"; reviews: OneLookReview[]; key: string }
> {
  // Sort by publishedAt desc.
  const sorted = [...reviews]
    .filter((r) => r.status === "published" && r.publishedAt)
    .sort(
      (a, b) =>
        new Date(b.publishedAt as string).getTime() -
        new Date(a.publishedAt as string).getTime(),
    );

  // Group by (brideFirstName + brideCity + weddingMonthYear) within 2h windows
  const out: ReturnType<typeof batchByBride> = [];
  const used = new Set<string>();
  for (const r of sorted) {
    if (used.has(r.id)) continue;
    const identity = `${r.brideFirstName}|${r.brideCity}|${r.weddingMonthYear}`;
    const anchor = new Date(r.publishedAt as string).getTime();
    const cluster = sorted.filter((o) => {
      if (used.has(o.id)) return false;
      const oIdentity = `${o.brideFirstName}|${o.brideCity}|${o.weddingMonthYear}`;
      if (oIdentity !== identity) return false;
      const ot = new Date(o.publishedAt as string).getTime();
      return Math.abs(anchor - ot) <= BATCH_WINDOW_MS;
    });
    if (cluster.length >= MIN_GROUP_SIZE) {
      cluster.forEach((c) => used.add(c.id));
      out.push({
        type: "group",
        reviews: cluster,
        key: `group_${r.id}`,
      });
    } else {
      used.add(r.id);
      out.push({ type: "single", review: r, key: `single_${r.id}` });
    }
  }
  return out;
}

export function CommunityOneLookSection() {
  const reviews = useOneLookStore((s) => s.reviews);
  const cards = useMemo(() => batchByBride(reviews), [reviews]);
  if (cards.length === 0) return null;

  const visible = cards.slice(0, 6);

  return (
    <section className="mt-14">
      <div className="flex items-baseline justify-between border-b border-gold/20 py-4">
        <div className="flex items-baseline gap-3">
          <h3 className="font-serif text-[20px] font-medium text-ink">
            <span className="text-ink-muted">— </span>
            one looks from the circle
            <span className="text-ink-muted"> —</span>
          </h3>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            gut reactions · fresh from the honeymoon
          </span>
        </div>
        <NextLink
          href="/community/discover/trails"
          className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Compass size={12} strokeWidth={1.8} />
          see trails →
        </NextLink>
      </div>

      <p className="mt-3 max-w-[560px] font-serif text-[14px] italic text-ink-muted">
        a score, one word, and a 20-second hot take — brides rating vendors
        while the memory is still warm.
      </p>

      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {visible.map((c) =>
          c.type === "single" ? (
            <li key={c.key}>
              <OneLookStoryCard review={c.review} />
            </li>
          ) : (
            <li key={c.key} className="sm:col-span-2">
              <OneLookGroupedStoryCard reviews={c.reviews} />
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
