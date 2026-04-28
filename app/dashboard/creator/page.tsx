"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  TrendingUp,
  MousePointerClick,
  DollarSign,
  ShoppingBag,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { useCreatorsStore } from "@/stores/creators-store";
import {
  CreatorAvatar,
  formatFollowerCount,
} from "@/components/creators/CreatorAvatar";
import type { ReferralEvent, ReferralType } from "@/types/creator";

const REFERRAL_LABEL: Record<ReferralType, string> = {
  tab_click: "Creator Picks tab",
  exhibition: "Exhibition",
  styled_by: "Styled by row",
  direct_link: "Direct link",
  profile_click: "Profile click",
  guide: "Creator Guide",
};

function formatCents(v: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `$${v}`;
  }
}

export default function CreatorDashboardPage() {
  const creators = useCreatorsStore((s) => s.creators);
  const allCollections = useCreatorsStore((s) => s.collections);
  const allPicks = useCreatorsStore((s) => s.picks);
  const allReferrals = useCreatorsStore((s) => s.referrals);

  const [activeId, setActiveId] = useState<string>(creators[0]?.id ?? "");
  const creator = creators.find((c) => c.id === activeId);

  const collections = useMemo(
    () =>
      allCollections
        .filter((c) => c.creatorId === activeId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allCollections, activeId],
  );
  const referrals = useMemo(
    () => allReferrals.filter((r) => r.creatorId === activeId),
    [allReferrals, activeId],
  );
  const picks = useMemo(
    () =>
      allPicks.filter((p) => collections.some((c) => c.id === p.collectionId)),
    [allPicks, collections],
  );
  const earnings = useMemo(() => {
    if (!creator) {
      return {
        totalClicks: 0,
        totalConversions: 0,
        conversionRate: 0,
        pendingPayout: 0,
        totalEarnings: 0,
      };
    }
    const conversions = referrals.filter((r) => r.convertedAt != null);
    const runtimeCommission = conversions.reduce(
      (sum, r) => sum + r.commissionAmount,
      0,
    );
    return {
      totalClicks: referrals.length,
      totalConversions: conversions.length,
      conversionRate:
        referrals.length === 0 ? 0 : conversions.length / referrals.length,
      pendingPayout: creator.pendingPayout + runtimeCommission,
      totalEarnings: creator.totalEarnings + runtimeCommission,
    };
  }, [creator, referrals]);

  const byType = useMemo(() => {
    const map = new Map<ReferralType, number>();
    for (const r of referrals) {
      map.set(r.referralType, (map.get(r.referralType) ?? 0) + 1);
    }
    return map;
  }, [referrals]);

  const conversionPct = (earnings.conversionRate * 100).toFixed(1);

  if (!creator) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <TopNav />
        <div className="m-auto text-[13px] text-ink-muted">
          No creators available.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav>
        <div
          className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Creator Dashboard
        </div>
      </TopNav>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Creator switcher (internal admin UX) */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Viewing as
          </span>
          {creators.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1 text-[11.5px] transition-colors",
                activeId === c.id
                  ? "border-gold/40 bg-gold-pale/40 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-gold/30",
              )}
            >
              <CreatorAvatar creator={c} size="xs" withBadge={false} />
              {c.displayName}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 border-b border-gold/15 pb-5">
          <CreatorAvatar creator={creator} size="lg" />
          <div className="flex-1">
            <h1 className="font-serif text-[24px] leading-tight text-ink">
              {creator.displayName}
            </h1>
            <p className="text-[12.5px] text-ink-muted">{creator.bio}</p>
            <div
              className="mt-1 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span>{formatFollowerCount(creator.followerCount)} followers</span>
              <span aria-hidden>·</span>
              <span>
                {(creator.commissionRate * 100).toFixed(0)}% commission
              </span>
              <span aria-hidden>·</span>
              <span>Tier: {creator.tier.replace("_", " ")}</span>
            </div>
          </div>
          <div className="hidden flex-col items-end gap-1.5 sm:flex">
            <Link
              href={`/dashboard`}
              className="rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
            >
              ← Dashboard
            </Link>
            <div className="flex gap-1.5">
              <Link
                href="/creator"
                className="rounded-md bg-ink px-3 py-1.5 text-[11.5px] text-ivory hover:bg-gold"
              >
                Open Creator Portal →
              </Link>
              <Link
                href="/dashboard/creator/partnerships"
                className="rounded-md border border-gold/40 bg-white px-3 py-1.5 text-[11.5px] text-gold hover:bg-gold-pale/30"
              >
                Partnerships
              </Link>
              <Link
                href="/dashboard/creator/drops"
                className="rounded-md border border-gold/40 bg-white px-3 py-1.5 text-[11.5px] text-gold hover:bg-gold-pale/30"
              >
                Drops
              </Link>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            icon={DollarSign}
            label="Total earnings"
            value={formatCents(earnings.totalEarnings)}
            tone="gold"
          />
          <KpiCard
            icon={TrendingUp}
            label="Pending payout"
            value={formatCents(earnings.pendingPayout)}
            tone="saffron"
          />
          <KpiCard
            icon={MousePointerClick}
            label="Referral clicks"
            value={earnings.totalClicks.toLocaleString()}
            tone="ink"
          />
          <KpiCard
            icon={ShoppingBag}
            label="Conversions"
            value={`${earnings.totalConversions} · ${conversionPct}%`}
            tone="sage"
          />
          <KpiCard
            icon={Users}
            label="Followers"
            value={formatFollowerCount(creator.followerCount)}
            tone="teal"
          />
        </div>

        {/* Two-column body */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Collections list */}
          <section className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between border-b border-gold/10 pb-2">
              <h2 className="flex items-center gap-2 font-serif text-[17px] text-ink">
                <Layers size={14} strokeWidth={1.6} className="text-gold" />
                Collections
              </h2>
              <span
                className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {collections.length}
              </span>
            </div>

            {collections.length === 0 ? (
              <p className="text-[12.5px] italic text-ink-muted">
                No collections yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {collections.map((col) => {
                  const count = picks.filter(
                    (p) => p.collectionId === col.id,
                  ).length;
                  const status = col.isExhibition ? "Exhibition" : col.status;
                  return (
                    <div
                      key={col.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-serif text-[14px] text-ink">
                          {col.title}
                        </div>
                        <div
                          className="font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {count} picks · {status}
                        </div>
                      </div>
                      {col.isExhibition && col.exhibitionEnd && (
                        <span
                          className="font-mono text-[10px] text-rose"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Ends{" "}
                          {new Date(col.exhibitionEnd).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Referral breakdown */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between border-b border-gold/10 pb-2">
                <h2 className="flex items-center gap-2 font-serif text-[17px] text-ink">
                  <Sparkles
                    size={14}
                    strokeWidth={1.6}
                    className="text-gold"
                  />
                  Referral breakdown
                </h2>
                <span
                  className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  by source
                </span>
              </div>

              {referrals.length === 0 ? (
                <p className="text-[12.5px] italic text-ink-muted">
                  No referral events tracked in this session yet. Interact with
                  the Creator Picks tab, exhibition banner, or Styled By rows
                  to see data populate here.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {(
                    Object.keys(REFERRAL_LABEL) as ReferralType[]
                  ).map((type) => {
                    const count = byType.get(type) ?? 0;
                    const pct =
                      referrals.length === 0
                        ? 0
                        : (count / referrals.length) * 100;
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <div className="w-32 shrink-0 text-[11.5px] text-ink-muted">
                          {REFERRAL_LABEL[type]}
                        </div>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory-warm">
                          <div
                            className="h-full bg-gold"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div
                          className="w-12 text-right font-mono text-[10.5px] text-ink"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Recent activity */}
          <section>
            <div className="mb-3 flex items-center justify-between border-b border-gold/10 pb-2">
              <h2 className="font-serif text-[17px] text-ink">
                Recent activity
              </h2>
              <span
                className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                last {Math.min(referrals.length, 10)}
              </span>
            </div>
            {referrals.length === 0 ? (
              <p className="text-[12.5px] italic text-ink-muted">
                No activity yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {referrals.slice(0, 10).map((ev) => (
                  <ReferralRow key={ev.id} ev={ev} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "gold" | "saffron" | "ink" | "sage" | "teal";
}) {
  const TONES: Record<typeof tone, string> = {
    gold: "border-gold/30 bg-gold-pale/30 text-gold",
    saffron: "border-saffron/30 bg-saffron/10 text-saffron",
    ink: "border-ink/15 bg-ivory-warm text-ink",
    sage: "border-sage/30 bg-sage-pale/40 text-sage",
    teal: "border-teal/30 bg-teal-pale/40 text-teal",
  };
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-white p-4">
      <div
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full border",
          TONES[tone],
        )}
      >
        <Icon size={13} strokeWidth={1.6} />
      </div>
      <div className="font-serif text-[20px] leading-none text-ink">{value}</div>
      <div
        className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
    </div>
  );
}

function ReferralRow({ ev }: { ev: ReferralEvent }) {
  const when = new Date(ev.clickedAt);
  const formatted = when.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const converted = ev.convertedAt != null;
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-[11.5px] text-ink">
          {REFERRAL_LABEL[ev.referralType]}
        </div>
        <div
          className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatted}
        </div>
      </div>
      {converted ? (
        <span
          className="rounded-full bg-sage/20 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-sage"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ${ev.commissionAmount}
        </span>
      ) : (
        <span
          className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          click
        </span>
      )}
    </li>
  );
}
