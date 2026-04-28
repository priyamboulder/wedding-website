// ── Upsell / shopping CTA ────────────────────────────────────────────────
// The editorial culmination — a warm ivory panel with a serif headline,
// one-line body, price range, and a single gold CTA. Tone is an invitation
// to design, not a sales pitch.

import { ArrowRight } from "lucide-react";
import type { StationerySuiteDetail } from "@/types/stationery";

export function SuiteDetailUpsell({
  detail,
  onCtaClick,
}: {
  detail: StationerySuiteDetail;
  onCtaClick?: () => void;
}) {
  const ctaLabel = detail.upsell_cta_label ?? "Explore options";

  return (
    <section
      aria-labelledby="suite-upsell-heading"
      className="relative overflow-hidden rounded-xl border border-gold/20 bg-gradient-to-br from-ivory-warm via-ivory to-gold-pale/40 px-6 py-7"
    >
      <div className="space-y-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Ready when you are
        </p>
        <h3
          id="suite-upsell-heading"
          className="font-serif text-[22px] leading-tight text-ink"
        >
          {detail.upsell_headline}
        </h3>
        <p className="max-w-prose text-[14px] leading-relaxed text-ink-muted">
          {detail.upsell_body}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={onCtaClick}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[13px] font-medium text-ivory transition-colors hover:bg-ink-soft"
        >
          {ctaLabel}
          <ArrowRight size={13} strokeWidth={2} />
        </button>
        {detail.price_range_label && (
          <span className="text-[12.5px] text-ink-muted">
            {detail.price_range_label}
          </span>
        )}
      </div>

      <p className="mt-4 text-[11.5px] leading-relaxed text-ink-faint">
        This will be added to your stationery estimate.
      </p>
    </section>
  );
}
