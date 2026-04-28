// ── Worth avoiding ───────────────────────────────────────────────────────
// Common mistakes framed positively. Rose accent to read as "caution, not
// alarm" — distinct from the gold of the pro tips without reading as an
// error state.

import type { StationerySuiteDetail } from "@/types/stationery";

export function SuiteDetailMistakes({
  detail,
}: {
  detail: StationerySuiteDetail;
}) {
  if (detail.common_mistakes.length === 0) return null;

  return (
    <section aria-labelledby="suite-mistakes-heading" className="space-y-4">
      <div className="space-y-1">
        <p
          id="suite-mistakes-heading"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Worth avoiding
        </p>
        <h3 className="font-serif text-[18px] text-ink">
          Quiet traps to sidestep
        </h3>
      </div>

      <ul className="space-y-3">
        {detail.common_mistakes.map((mistake, i) => (
          <li
            key={i}
            className="border-l-2 border-rose/50 pl-4 text-[14.5px] leading-[1.65] text-ink-muted"
          >
            {mistake}
          </li>
        ))}
      </ul>
    </section>
  );
}
