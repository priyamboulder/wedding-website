"use client";

// ── Wedding context bar ────────────────────────────────────────────────────
// Sits at the top of the AI Recommendation section. Shows the couple exactly
// which wedding details the AI is reasoning over. Trust-building, not decorative
// — every chip here corresponds to a scoring weight in ai-recommendations.ts.

import { Calendar, MapPin, Users, Wallet, Sparkles, Plane } from "lucide-react";
import type { WeddingContext } from "@/lib/vendors/ai-recommendations";
import { formatBudgetHeadline } from "@/lib/vendors/ai-recommendations";

interface AIWeddingContextBarProps {
  ctx: WeddingContext;
  weddingDate: Date | null;
  plannerName: string | null;
  plannerCompany: string | null;
  onEditDetails?: () => void;
}

export function AIWeddingContextBar({
  ctx,
  weddingDate,
  plannerName,
  plannerCompany,
  onEditDetails,
}: AIWeddingContextBarProps) {
  const dateLabel = weddingDate
    ? weddingDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBD";

  const budgetLabel = formatBudgetHeadline(
    ctx.budgetMinCents,
    ctx.budgetMaxCents,
  );

  const travelLabel = ctx.isDestination
    ? ctx.destinationCountry
      ? `Destination wedding (${ctx.destinationCountry})`
      : "Destination wedding"
    : ctx.venueCity
      ? `Local wedding (${ctx.venueCity})`
      : "Local wedding";

  return (
    <section className="rounded-[14px] border border-gold/20 bg-gradient-to-br from-gold-pale/30 via-white to-ivory-warm/60 px-5 py-4 shadow-[0_2px_10px_rgba(196,162,101,0.06)]">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <Sparkles
            size={16}
            strokeWidth={1.6}
            className="translate-y-[2px] text-gold"
          />
          <h2 className="font-serif text-[20px] leading-tight text-ink">
            Your Vendor Team
          </h2>
        </div>
        {onEditDetails && (
          <button
            type="button"
            onClick={onEditDetails}
            className="rounded-md border border-border bg-white px-2.5 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
          >
            Edit wedding details
          </button>
        )}
      </header>

      <p className="mb-3 max-w-2xl text-[12.5px] italic leading-snug text-ink-muted">
        Curated for your wedding based on these details. Change any of them to
        refresh the recommendations.
      </p>

      <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-ink">
        <ContextChip icon={Calendar} label={dateLabel} />
        {ctx.venueName && (
          <ContextChip
            icon={MapPin}
            label={
              ctx.venueState
                ? `${ctx.venueName}, ${ctx.venueState}`
                : ctx.venueName
            }
          />
        )}
        {ctx.guestCount > 0 && (
          <ContextChip
            icon={Users}
            label={`${ctx.guestCount} guest${ctx.guestCount === 1 ? "" : "s"}`}
          />
        )}
        {budgetLabel && (
          <ContextChip icon={Wallet} label={`${budgetLabel} budget`} />
        )}
        <ContextChip icon={Plane} label={travelLabel} />
      </dl>

      {ctx.eventNames.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Events
          </span>
          {ctx.eventNames.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] text-ink ring-1 ring-border"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {(plannerCompany || plannerName) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Planner
          </span>
          <span className="text-ink">
            {plannerCompany || plannerName}
            {plannerCompany && plannerName && (
              <span className="text-ink-muted"> · {plannerName}</span>
            )}
          </span>
        </div>
      )}
    </section>
  );
}

function ContextChip({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={13} strokeWidth={1.6} className="text-gold" />
      <span className="text-ink">{label}</span>
    </span>
  );
}
