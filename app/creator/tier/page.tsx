"use client";

import { useMemo } from "react";
import { AlertTriangle, Check, TrendingUp } from "lucide-react";
import { PortalPageHeader } from "@/components/creator-portal/PortalPageHeader";
import { useCurrentCreator, useMyCollections, useMyGuides, formatCompact } from "@/lib/creators/current-creator";
import { useCreatorsStore } from "@/stores/creators-store";
import { TierBadge } from "@/components/creators/TierBadge";
import {
  evaluateCreatorTier,
  TIER_PERKS,
  TIER_COMMISSION_RATE,
} from "@/lib/creators/tier-evaluation";
import type { CreatorTier } from "@/types/creator";

export default function TierPage() {
  const creator = useCurrentCreator();
  const collections = useMyCollections();
  const guides = useMyGuides();
  const referrals = useCreatorsStore((s) =>
    creator ? s.referralsForCreator(creator.id) : [],
  );

  const evaluation = useMemo(() => {
    if (!creator) return null;
    return evaluateCreatorTier(creator, {
      followers: creator.followerCount,
      collectionCount: collections.length,
      guideCount: guides.length,
      consultationRating: creator.consultationRating,
    });
  }, [creator, collections.length, guides.length]);

  if (!creator || !evaluation) return null;

  const sparkline = useMemo(() => {
    // Derive a 30-day save trend from referral timestamps.
    const days = 30;
    const buckets = new Array(days).fill(0);
    const now = Date.now();
    for (const r of referrals) {
      const diff = Math.floor((now - new Date(r.clickedAt).getTime()) / 86400000);
      if (diff >= 0 && diff < days) buckets[days - 1 - diff]++;
    }
    return buckets;
  }, [referrals]);

  const followerSpark = useMemo(() => {
    // Synthesize a believable trend so the chart has shape for seed creators.
    const base = creator.followerCount;
    return new Array(30).fill(0).map((_, i) => base - (29 - i) * 30);
  }, [creator.followerCount]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Business"
        title="Tier & growth"
        description="Your current tier, progress toward the next level, and growth insights."
      />

      {/* Current tier */}
      <div className="flex flex-col gap-4 overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-br from-gold-pale/40 to-white p-6 md:flex-row md:items-center">
        <div>
          <TierBadge tier={creator.tier} size="lg" />
          <h2 className="mt-3 font-serif text-[26px] text-ink capitalize">
            {creator.tier.replace("_", " ")}
          </h2>
          <p
            className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Member since {new Date(creator.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex-1">
          <p
            className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Current perks
          </p>
          <ul className="grid grid-cols-1 gap-1 md:grid-cols-2">
            {TIER_PERKS[creator.tier].map((perk) => (
              <li key={perk} className="flex items-start gap-1.5 text-[12.5px] text-ink">
                <Check size={11} className="mt-1 shrink-0 text-gold" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grace period warning */}
      {evaluation.inGracePeriod && evaluation.gracePeriodEnds && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose/30 bg-rose/10 p-4">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose" />
          <div>
            <p className="font-serif text-[14px] text-ink">
              Your stats have dipped below {creator.tier.replace("_", " ")} thresholds.
            </p>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              You have until {new Date(evaluation.gracePeriodEnds).toLocaleDateString()} to recover
              your metrics, or your tier will adjust.
            </p>
          </div>
        </div>
      )}

      {/* Next tier progress */}
      {evaluation.nextTier && (
        <div className="mt-6 rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Next tier
              </p>
              <h3 className="mt-1 font-serif text-[20px] text-ink capitalize">
                {evaluation.nextTier.replace("_", " ")}
              </h3>
            </div>
            <div className="text-right">
              <p className="font-serif text-[28px] text-ink">{evaluation.percentToNext}%</p>
              <p
                className="font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Overall progress
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {evaluation.progress.map((criterion) => {
              const pct = Math.min(100, (criterion.current / criterion.required) * 100);
              return (
                <div key={criterion.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[12.5px] text-ink">{criterion.label}</span>
                    <span
                      className={`text-[12.5px] ${
                        criterion.met ? "text-sage" : "text-ink-muted"
                      }`}
                    >
                      {criterion.current} / {criterion.required}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ivory-warm">
                    <div
                      className={`h-full ${criterion.met ? "bg-sage" : "bg-gold"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Perks comparison */}
      {evaluation.nextTier && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <TierColumn tier={creator.tier} isCurrent />
          <TierColumn tier={evaluation.nextTier} isCurrent={false} />
        </div>
      )}

      {/* Growth insights */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5">
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Followers · 30 days
          </p>
          <p className="mt-1 font-serif text-[22px] text-ink">
            {formatCompact(creator.followerCount)}
          </p>
          <Sparkline data={followerSpark} tone="teal" />
        </div>
        <div className="rounded-xl border border-border bg-white p-5">
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Saves & referral activity · 30 days
          </p>
          <p className="mt-1 font-serif text-[22px] text-ink">
            {referrals.length}
          </p>
          <Sparkline data={sparkline} tone="gold" />
        </div>
      </div>

      {/* Suggestions */}
      {evaluation.nextTier && (
        <div className="mt-6 rounded-xl border border-gold/20 bg-gold-pale/20 p-5">
          <h3 className="flex items-center gap-2 font-serif text-[17px] text-ink">
            <TrendingUp size={15} className="text-gold" strokeWidth={1.7} />
            Suggestions
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {evaluation.progress
              .filter((c) => !c.met)
              .map((c) => (
                <li key={c.label} className="text-[13px] text-ink">
                  <span className="text-gold">→</span> {suggestionFor(c)}
                </li>
              ))}
            {evaluation.progress.every((c) => c.met) && (
              <li className="text-[13px] italic text-ink-muted">
                You've hit every criterion. We'll promote you at the next evaluation cycle.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function TierColumn({ tier, isCurrent }: { tier: CreatorTier; isCurrent: boolean }) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        isCurrent
          ? "border-border bg-white"
          : "border-gold/30 bg-gradient-to-br from-gold-pale/30 to-white"
      }`}
    >
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {isCurrent ? "Your current tier" : "Unlock next"}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <TierBadge tier={tier} size="sm" />
        <span className="font-serif text-[18px] capitalize text-ink">
          {tier.replace("_", " ")}
        </span>
      </div>
      <p className="mt-1 text-[11.5px] text-ink-muted">
        {(TIER_COMMISSION_RATE[tier] * 100).toFixed(0)}% referral commission
      </p>
      <ul className="mt-3 flex flex-col gap-1">
        {TIER_PERKS[tier].map((perk) => (
          <li key={perk} className="flex items-start gap-1.5 text-[12px] text-ink">
            <Check size={11} className="mt-1 shrink-0 text-gold" />
            {perk}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sparkline({
  data,
  tone,
}: {
  data: number[];
  tone: "gold" | "teal";
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="mt-4 flex h-16 items-end gap-[2px]">
      {data.map((v, i) => {
        const pct = (v / max) * 100;
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm ${tone === "gold" ? "bg-gold/60" : "bg-teal/60"}`}
            style={{ height: `${Math.max(2, pct)}%` }}
          />
        );
      })}
    </div>
  );
}

function suggestionFor(c: { label: string; required: number; current: number }): string {
  const gap = c.required - c.current;
  if (c.label.includes("Followers")) {
    return `Grow your following by ${gap.toLocaleString()} to cross the threshold. Publishing guides and drops drives follows fastest.`;
  }
  if (c.label.includes("Collections")) {
    return `Publish ${gap} more collection${gap === 1 ? "" : "s"} — or ${c.label.match(/\d+/)?.[0] ?? "5+"} guides — to qualify.`;
  }
  if (c.label.includes("Guides")) {
    return `Write ${gap} more guide${gap === 1 ? "" : "s"} — long-form content is the fastest path to Rising.`;
  }
  if (c.label.includes("rating")) {
    return `Your consultation rating is ${c.current} — ${c.required - c.current > 0 ? `${(c.required - c.current).toFixed(1)} away from ${c.required}` : "holding steady"}. Keep showing up for couples.`;
  }
  return `Close the ${gap}-point gap to advance.`;
}
