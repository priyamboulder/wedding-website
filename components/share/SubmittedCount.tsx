"use client";

// ── SubmittedCount ──────────────────────────────────────────────────────────
// Social proof line for the /share landing. Currently sums a friendly seeded
// baseline with locally-submitted stories from the Zustand store, since the
// `wedding_submissions` Supabase write path isn't wired yet. Swap to a
// server-fetched count of `where status = 'published'` once the API is up.

import { useShareShaadiStore } from "@/stores/share-shaadi-store";

const BASELINE = 47;

export function SubmittedCount() {
  const localSubmitted = useShareShaadiStore((s) => s.submitted.length);
  const total = BASELINE + localSubmitted;
  return (
    <p className="text-center text-[13px] uppercase tracking-[0.2em] text-ink-muted md:text-[13.5px]">
      <span className="font-semibold text-gold">{total}</span> couples have
      shared their story on The Marigold
    </p>
  );
}
