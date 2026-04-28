"use client";

// ── Vendor-side One Look summary ─────────────────────────────────────────
// Shown in the vendor's "Your Reviews" page under a "One Looks" tab.
// Summary stats (avg, count, top words) + list of received One Looks.
// Vendors cannot respond to One Looks — the bride's score is final, which
// keeps the format pure and opinionated (per spec).
//
// Note: in the current demo the vendor portal isn't scoped to a specific
// platformVendorId, so this component shows either the explicitly-passed
// vendor's looks or — if no id is passed — all published One Looks in the
// workspace so vendors can preview the format end-to-end.

import { useMemo } from "react";
import { useOneLookStore } from "@/stores/one-look-store";
import { OneLookCard } from "./OneLookCard";

export function VendorOneLookSummary({
  platformVendorId,
  coordinationVendorId,
}: {
  platformVendorId?: string | null;
  coordinationVendorId?: string | null;
} = {}) {
  const allReviews = useOneLookStore((s) => s.reviews);
  const reviews = useMemo(
    () =>
      allReviews.filter((r) => {
        if (r.status !== "published") return false;
        if (platformVendorId && r.platformVendorId !== platformVendorId) return false;
        if (coordinationVendorId && r.coordinationVendorId !== coordinationVendorId)
          return false;
        return true;
      }),
    [allReviews, platformVendorId, coordinationVendorId],
  );

  const stats = useMemo(() => {
    if (reviews.length === 0) return null;
    const avg =
      Math.round((reviews.reduce((a, r) => a + r.score, 0) / reviews.length) * 10) / 10;
    const wordCounts = new Map<string, number>();
    reviews.forEach((r) =>
      wordCounts.set(r.oneWord, (wordCounts.get(r.oneWord) ?? 0) + 1),
    );
    const topWords = [...wordCounts.entries()]
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    return { avg, topWords };
  }, [reviews]);

  if (reviews.length === 0 || !stats) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 bg-[#F9F5EC]/40 p-8 text-center">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#8a5a20]">
          One looks
        </p>
        <h3
          className="mt-2 text-[22px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          no One Looks yet
        </h3>
        <p className="mt-2 text-[12.5px] text-stone-500">
          When a bride rates you with a One Look — a score from 0.0 to 9.9 plus
          a single-word hot take — it'll show up here. Ask your recent couples
          for one; it takes them 20 seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
          One Look summary
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <p
            className="text-[44px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            {stats.avg.toFixed(1)}
          </p>
          <span className="text-[13px] text-stone-500">
            from {reviews.length}{" "}
            {reviews.length === 1 ? "bride" : "brides"}
          </span>
        </div>

        <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-stone-500">
          Top words
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {stats.topWords.map((w) => (
            <span
              key={w.word}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11.5px] font-medium text-[#9E8245]"
              style={{
                backgroundColor: "#F5E6D0",
                boxShadow: "inset 0 0 0 1px rgba(184,134,11,0.25)",
              }}
            >
              <span className="italic">"{w.word}"</span>
              <span className="font-mono text-[10px] text-stone-500">
                ×{w.count}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Individual looks */}
      <div>
        <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
          Recent one looks
        </p>
        <ul className="space-y-3" role="list">
          {reviews.map((r) => (
            <li key={r.id}>
              <OneLookCard review={r} />
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[11.5px] italic text-stone-500">
        One Looks can't be responded to — the score is final. To address
        feedback, reach out to the bride directly.
      </p>
    </div>
  );
}
