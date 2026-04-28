"use client";

import { AlertTriangle, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Creator } from "@/types/creator";
import {
  TIER_COMMISSION_RATE,
  TIER_PERKS,
  evaluateCreatorTier,
  type CreatorStats,
} from "@/lib/creators/tier-evaluation";
import { TierBadge } from "./TierBadge";

// ── TierProgressCard ──────────────────────────────────────────────────────
// Creator dashboard view of their tier: current state, next-tier progress,
// perks comparison, and grace-period warning if applicable.

export function TierProgressCard({
  creator,
  stats,
}: {
  creator: Creator;
  stats: CreatorStats;
}) {
  const evaluation = evaluateCreatorTier(creator, stats);
  const currentPerks = TIER_PERKS[evaluation.currentTier];
  const nextPerks =
    evaluation.nextTier && evaluation.nextTier !== "partner"
      ? TIER_PERKS[evaluation.nextTier]
      : [];

  return (
    <div className="space-y-5">
      {evaluation.inGracePeriod && evaluation.gracePeriodEnds && (
        <GracePeriodBanner endsAt={evaluation.gracePeriodEnds} />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CurrentTierPanel
          creator={creator}
          perks={currentPerks}
          commissionRate={TIER_COMMISSION_RATE[evaluation.currentTier]}
        />
        <NextTierPanel evaluation={evaluation} nextPerks={nextPerks} />
      </div>
    </div>
  );
}

// ── Current tier panel ────────────────────────────────────────────────────

function CurrentTierPanel({
  creator,
  perks,
  commissionRate,
}: {
  creator: Creator;
  perks: string[];
  commissionRate: number;
}) {
  return (
    <section className="rounded-xl border border-gold/25 bg-white">
      <header
        className="flex items-center justify-between gap-3 rounded-t-xl border-b border-gold/15 px-6 py-5"
        style={{ background: creator.coverGradient }}
      >
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/90"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Current tier
          </p>
          <p className="mt-1 font-serif text-[26px] leading-tight text-ivory">
            {tierDisplayName(creator.tier)}
          </p>
        </div>
        <TierBadge tier={creator.tier} size="lg" />
      </header>
      <div className="px-6 py-5">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Commission · {(commissionRate * 100).toFixed(0)}% on referrals
        </p>
        <ul className="mt-4 space-y-2">
          {perks.map((p) => (
            <li
              key={p}
              className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted"
            >
              <Check
                size={13}
                strokeWidth={2}
                className="mt-0.5 flex-shrink-0 text-gold"
              />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Next tier panel ───────────────────────────────────────────────────────

function NextTierPanel({
  evaluation,
  nextPerks,
}: {
  evaluation: ReturnType<typeof evaluateCreatorTier>;
  nextPerks: string[];
}) {
  // Partner tier = invitation-only
  if (evaluation.nextTier === "partner" || evaluation.nextTier === null) {
    return (
      <section className="rounded-xl border border-gold/25 bg-ivory-warm/30 px-6 py-6">
        <div className="flex items-center gap-2">
          <Lock size={14} strokeWidth={1.8} className="text-gold" />
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Partner tier · by invitation
          </p>
        </div>
        <h3 className="mt-3 font-serif text-[22px] leading-tight text-ink">
          You're at the top of the public tiers.
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
          Partner tier is invitation-only. Keep creating great content — when
          your work and reach align with the program, we'll reach out.
        </p>
        <ul className="mt-4 space-y-2">
          {TIER_PERKS.partner.map((p) => (
            <li
              key={p}
              className="flex items-start gap-2 text-[12.5px] text-ink-muted"
            >
              <Lock
                size={11}
                strokeWidth={1.8}
                className="mt-0.5 flex-shrink-0 text-ink-faint"
              />
              {p}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gold/25 bg-white px-6 py-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Next tier
          </p>
          <p className="mt-1 font-serif text-[22px] leading-tight text-ink">
            {tierDisplayName(evaluation.nextTier)}
          </p>
        </div>
        <TierBadge tier={evaluation.nextTier} size="md" />
      </header>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Overall progress
          </span>
          <span
            className="font-mono text-[11.5px] text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {evaluation.percentToNext}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-gold"
            style={{ width: `${Math.min(100, evaluation.percentToNext)}%` }}
          />
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {evaluation.progress.map((c) => {
          const pct =
            c.required === 0
              ? 100
              : Math.min(100, (c.current / c.required) * 100);
          return (
            <li key={c.label}>
              <div className="flex items-center justify-between text-[12px]">
                <span className={cn(c.met ? "text-ink" : "text-ink-muted")}>
                  {c.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    c.met ? "text-gold" : "text-ink-faint",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {c.current.toLocaleString()} / {c.required.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink/10">
                <div
                  className={cn(
                    "h-full rounded-full",
                    c.met ? "bg-gold" : "bg-ink/40",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {nextPerks.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Unlocks at {tierDisplayName(evaluation.nextTier)}
          </p>
          <ul className="mt-3 space-y-1.5">
            {nextPerks.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2 text-[12.5px] text-ink-muted"
              >
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gold" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ── Grace period warning ──────────────────────────────────────────────────

function GracePeriodBanner({ endsAt }: { endsAt: string }) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86_400_000),
  );
  return (
    <div className="flex items-start gap-3 rounded-lg border border-rose/40 bg-rose/10 px-4 py-3">
      <AlertTriangle
        size={16}
        strokeWidth={1.8}
        className="mt-0.5 flex-shrink-0 text-rose"
      />
      <div className="flex-1">
        <p className="font-serif text-[14px] text-ink">
          Tier grace period · {daysLeft} days left
        </p>
        <p className="mt-0.5 text-[12px] text-ink-muted">
          Your recent stats dipped below your current tier's threshold. You'll
          keep your tier until{" "}
          <span className="font-medium">
            {new Date(endsAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          . Meet the criteria again before then to avoid a demotion.
        </p>
      </div>
    </div>
  );
}

function tierDisplayName(
  tier: "standard" | "rising" | "top_creator" | "partner",
): string {
  if (tier === "top_creator") return "Top Creator";
  if (tier === "rising") return "Rising";
  if (tier === "partner") return "Partner";
  return "Standard";
}
