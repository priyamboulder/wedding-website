"use client";

// ── /community/real-numbers/[category] ────────────────────────────────────
// Deep-dive page for one vendor category. Honors the filter bar's city so
// "photographers in Dallas" lands here with the city pre-applied via ?city=.
// If fewer than MIN_SUBMISSIONS_FOR_DEEP_DIVE match, renders the data with
// a disclaimer so small samples can't masquerade as definitive.

import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { useRealNumbersStore } from "@/stores/real-numbers-store";
import {
  categoryLabel,
  computeCategoryDeepDive,
  emptyFilter,
  formatUsd,
  formatUsdK,
  matchesFilter,
} from "@/lib/real-numbers";
import {
  MIN_SUBMISSIONS_FOR_DEEP_DIVE,
  type CostFilterState,
  type WorthIt,
} from "@/types/real-numbers";

export default function CategoryPage() {
  return (
    <Suspense fallback={null}>
      <CategoryPageInner />
    </Suspense>
  );
}

function CategoryPageInner() {
  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  const categorySlug = params?.category ?? "";
  const city = searchParams?.get("city") ?? "";

  const ensureSeeded = useRealNumbersStore((s) => s.ensureSeeded);
  const submissions = useRealNumbersStore((s) => s.submissions);
  const items = useRealNumbersStore((s) => s.items);

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  const filter: CostFilterState = useMemo(() => {
    const f = emptyFilter();
    f.city = city;
    return f;
  }, [city]);

  const scopedSubs = useMemo(
    () =>
      submissions
        .filter((s) => s.is_published)
        .filter((s) => matchesFilter(s, filter)),
    [submissions, filter],
  );

  const deepDive = useMemo(
    () => computeCategoryDeepDive(categorySlug, scopedSubs, items),
    [categorySlug, scopedSubs, items],
  );

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="mx-auto max-w-5xl space-y-6 px-10 py-10">
        <BackLink />
        <Header
          label={deepDive.label}
          city={city}
          submissionCount={deepDive.submission_count}
        />

        {deepDive.submission_count === 0 ? (
          <NoData label={deepDive.label} />
        ) : (
          <>
            {!deepDive.meets_threshold && (
              <LimitedDataNotice count={deepDive.submission_count} />
            )}
            <SpendStats deepDive={deepDive} />
            <WorthItBreakdown deepDive={deepDive} />
            <SpendByGuest deepDive={deepDive} />
            <BudgetAccuracy deepDive={deepDive} />
            <CrossLinks categorySlug={categorySlug} city={city} />
          </>
        )}
      </div>
    </div>
  );
}

// ── Header + back link ────────────────────────────────────────────────────
function BackLink() {
  return (
    <Link
      href="/community?tab=connect&sub=brides&view=real_numbers"
      className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:text-saffron"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <ArrowLeft size={12} strokeWidth={1.8} /> Back to The Real Numbers
    </Link>
  );
}

function Header({
  label,
  city,
  submissionCount,
}: {
  label: string;
  city: string;
  submissionCount: number;
}) {
  return (
    <header className="border-b border-gold/15 pb-5">
      <p
        className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Real Numbers · {label}
      </p>
      <h1 className="mt-2 font-serif text-[36px] leading-[1.1] text-ink">
        {label.toLowerCase()} {city ? `in ${city.toLowerCase()}` : "— all cities"}
      </h1>
      <p className="mt-2 font-serif text-[17px] italic text-ink-muted">
        what {submissionCount} {submissionCount === 1 ? "bride" : "brides"}{" "}
        actually paid.
      </p>
    </header>
  );
}

// ── Stats section ─────────────────────────────────────────────────────────
function SpendStats({
  deepDive,
}: {
  deepDive: ReturnType<typeof computeCategoryDeepDive>;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <p
        className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        SPEND
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="median spend" value={formatUsd(deepDive.median_cents)} />
        <Stat label="average spend" value={formatUsd(deepDive.average_cents)} />
        <Stat
          label="range"
          value={`${formatUsdK(deepDive.min_cents)}–${formatUsdK(
            deepDive.max_cents,
          )}`}
        />
        <Stat
          label="submissions"
          value={deepDive.submission_count.toString()}
        />
      </div>

      <Distribution distribution={deepDive.distribution} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-ivory-warm/30 p-4">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-1 font-serif text-[22px] leading-none text-ink">{value}</p>
    </div>
  );
}

function Distribution({
  distribution,
}: {
  distribution: ReturnType<typeof computeCategoryDeepDive>["distribution"];
}) {
  if (distribution.length === 0) return null;
  const max = Math.max(1, ...distribution.map((d) => d.count));
  return (
    <div className="mt-6 rounded-md border border-border/50 bg-ivory-warm/30 p-4">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Distribution
      </p>
      <div className="mt-4 flex items-end gap-2">
        {distribution.map((bucket) => (
          <div
            key={bucket.bucket}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <div
              className="w-full rounded-t bg-saffron/70"
              style={{ height: `${(bucket.count / max) * 80}px` }}
              title={`${bucket.count} weddings`}
            />
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {bucket.bucket}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Worth it breakdown ────────────────────────────────────────────────────
function WorthItBreakdown({
  deepDive,
}: {
  deepDive: ReturnType<typeof computeCategoryDeepDive>;
}) {
  const entries: Array<{ key: WorthIt; label: string; tone: string }> = [
    { key: "absolutely", label: "Absolutely worth it", tone: "bg-sage" },
    { key: "fair", label: "Fair", tone: "bg-gold" },
    { key: "overpaid", label: "Overpaid", tone: "bg-rose" },
    { key: "skip_next_time", label: "Skip next time", tone: "bg-stone-400" },
  ];
  const total =
    deepDive.worth_it.absolutely +
    deepDive.worth_it.fair +
    deepDive.worth_it.overpaid +
    deepDive.worth_it.skip_next_time;
  if (total === 0) return null;
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <p
        className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        WORTH IT?
      </p>
      <div className="mt-4 space-y-2">
        {entries.map((e) => {
          const pct = deepDive.worth_it[e.key];
          return (
            <div key={e.key}>
              <div className="flex justify-between text-[12.5px] text-ink">
                <span>{e.label}</span>
                <span className="font-mono text-[11.5px] text-ink-muted">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ivory-warm">
                <div
                  className={`h-full ${e.tone}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Spend by guest count ──────────────────────────────────────────────────
function SpendByGuest({
  deepDive,
}: {
  deepDive: ReturnType<typeof computeCategoryDeepDive>;
}) {
  if (deepDive.by_guest_count.length === 0) return null;
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <p
        className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        HOW SPEND VARIES BY GUEST COUNT
      </p>
      <table className="mt-4 w-full text-[13px]">
        <tbody>
          {deepDive.by_guest_count.map((row) => (
            <tr key={row.bucket} className="border-b border-border/40">
              <td className="py-2 text-ink">{row.range}</td>
              <td className="py-2 pl-3 text-right font-mono text-ink">
                median {formatUsd(row.median_cents)}
              </td>
              <td className="py-2 pl-3 text-right font-mono text-[11.5px] text-ink-muted">
                n={row.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// ── Budget accuracy ───────────────────────────────────────────────────────
function BudgetAccuracy({
  deepDive,
}: {
  deepDive: ReturnType<typeof computeCategoryDeepDive>;
}) {
  if (!Number.isFinite(deepDive.avg_budget_variance_pct) && !deepDive.insight) {
    return null;
  }
  const variance = deepDive.avg_budget_variance_pct;
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <p
        className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        BUDGET ACCURACY
      </p>
      <p className="mt-3 text-[13px] text-ink">
        Average overage for {deepDive.label.toLowerCase()}:{" "}
        <strong
          className={
            variance > 0
              ? "text-rose"
              : variance < 0
                ? "text-sage"
                : "text-ink"
          }
        >
          {variance >= 0 ? "+" : ""}
          {variance.toFixed(1)}%
        </strong>
      </p>
      {deepDive.insight && (
        <blockquote className="mt-3 border-l-2 border-gold/40 pl-3 font-serif text-[14px] italic leading-relaxed text-ink-muted">
          {deepDive.insight}
        </blockquote>
      )}
    </section>
  );
}

// ── Cross links ───────────────────────────────────────────────────────────
function CrossLinks({
  categorySlug,
  city,
}: {
  categorySlug: string;
  city: string;
}) {
  return (
    <section className="rounded-lg border border-gold/30 bg-ivory-warm/40 p-6">
      <p
        className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        WHEN YOU&apos;RE READY
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          href={`/vendors?category=${categorySlug}${city ? `&city=${encodeURIComponent(city)}` : ""}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink-soft"
        >
          Find {categoryLabel(categorySlug).toLowerCase()}
          {city ? ` in ${city}` : ""}
        </Link>
        <Link
          href="/community?tab=connect&sub=brides&view=real_numbers"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-1.5 text-[12px] font-medium text-ink-muted hover:text-ink"
        >
          Browse all categories
        </Link>
      </div>
    </section>
  );
}

// ── Edge-case states ──────────────────────────────────────────────────────
function NoData({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-ivory-warm/30 p-8 text-center">
      <p className="font-serif text-[18px] text-ink">
        No submissions for {label.toLowerCase()} yet.
      </p>
      <p className="mt-2 text-[13px] text-ink-muted">
        Be the first bride to share your numbers for this category from the
        Post-Wedding workspace.
      </p>
    </div>
  );
}

function LimitedDataNotice({ count }: { count: number }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
      <Info size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-amber-600" />
      <p className="text-[13px] text-ink">
        Based on limited data ({count} wedding{count === 1 ? "" : "s"}). The
        numbers will sharpen as more brides share. We&apos;d recommend at
        least {MIN_SUBMISSIONS_FOR_DEEP_DIVE} submissions before treating
        category averages as representative.
      </p>
    </div>
  );
}
