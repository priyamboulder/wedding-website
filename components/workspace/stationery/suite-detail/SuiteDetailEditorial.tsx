// ── The Story ────────────────────────────────────────────────────────────
// Editorial intro + pull-quote on why the piece matters. Intro is markdown;
// why_it_matters renders as a left-bordered pull quote with a larger serif.

import type { StationerySuiteDetail } from "@/types/stationery";
import { EditorialProse } from "./markdown";

export function SuiteDetailEditorial({
  detail,
}: {
  detail: StationerySuiteDetail;
}) {
  return (
    <section aria-labelledby="suite-story-heading" className="space-y-5">
      <div className="space-y-1">
        <p
          id="suite-story-heading"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The story
        </p>
        <h3 className="font-serif text-[18px] text-ink">
          Why this piece matters
        </h3>
      </div>

      <EditorialProse text={detail.editorial_intro} />

      <blockquote className="border-l-2 border-gold/60 pl-5 py-1">
        <p className="font-serif text-[17px] italic leading-relaxed text-ink">
          {detail.why_it_matters}
        </p>
      </blockquote>
    </section>
  );
}
