// ── Notes from your planner ──────────────────────────────────────────────
// Pro tips rendered as a numbered list with gold serif numerals — reads
// like a small editorial sidebar, not a feature list.

import type { StationerySuiteDetail } from "@/types/stationery";

export function SuiteDetailTips({
  detail,
}: {
  detail: StationerySuiteDetail;
}) {
  if (detail.pro_tips.length === 0) return null;

  return (
    <section aria-labelledby="suite-tips-heading" className="space-y-4">
      <div className="space-y-1">
        <p
          id="suite-tips-heading"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Notes from your planner
        </p>
        <h3 className="font-serif text-[18px] text-ink">
          Worth knowing ahead of time
        </h3>
      </div>

      <ol className="space-y-3.5">
        {detail.pro_tips.map((tip, i) => (
          <li key={i} className="flex gap-4">
            <span
              className="shrink-0 font-serif text-[17px] italic leading-none text-gold"
              aria-hidden
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-[14.5px] leading-[1.65] text-ink-muted">
              {tip}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
