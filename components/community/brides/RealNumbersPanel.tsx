"use client";

// ── The Real Numbers — browse panel ───────────────────────────────────────
// Lives in Community → Brides → The Real Numbers. Filterable exploration of
// anonymized cost submissions with aggregates + individual cards. Designed
// to be the "what does this actually cost?" answer planning brides Google
// for and never find.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealNumbersStore } from "@/stores/real-numbers-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import {
  categoryLabel,
  computeAggregate,
  cultureLabelList,
  distinctCities,
  emptyFilter,
  formatPct,
  formatUsd,
  formatUsdK,
  matchesFilter,
  monthLabel,
  styleLabelList,
  submissionVariancePct,
} from "@/lib/real-numbers";
import {
  CULTURAL_TRADITION_LABEL,
  EVENTS_BUCKET_DEF,
  GUEST_COUNT_BUCKET_DEF,
  MIN_SUBMISSIONS_FOR_AGGREGATE,
  WEDDING_STYLE_LABEL,
  type CostFilterState,
  type CostSubmission,
  type CulturalTradition,
  type EventsBucket,
  type GuestCountBucket,
  type WeddingStyle,
} from "@/types/real-numbers";

type SortKey = "recent" | "helpful" | "high_low" | "low_high" | "over_budget";

const ALL_STYLES: WeddingStyle[] = [
  "modern",
  "classic",
  "traditional",
  "intimate",
  "grand",
  "bohemian",
  "minimalist",
  "luxury",
];

const ALL_CULTURES: CulturalTradition[] = [
  "south_asian",
  "western",
  "east_asian",
  "middle_eastern",
  "african",
  "latin_american",
  "fusion",
  "other",
];

// ── Panel ─────────────────────────────────────────────────────────────────
export function RealNumbersPanel() {
  const ensureSeeded = useRealNumbersStore((s) => s.ensureSeeded);
  const submissions = useRealNumbersStore((s) => s.submissions);
  const items = useRealNumbersStore((s) => s.items);
  const helpfulVotes = useRealNumbersStore((s) => s.helpfulVotes);
  const toggleHelpful = useRealNumbersStore((s) => s.toggleHelpful);

  const myProfile = useCommunityProfilesStore((s) => {
    const myId = s.myProfileId;
    return myId ? s.profiles.find((p) => p.id === myId) ?? null : null;
  });

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  const published = useMemo(
    () => submissions.filter((s) => s.is_published),
    [submissions],
  );

  // Initial filter pre-populated from the bride's profile when possible.
  const [filter, setFilter] = useState<CostFilterState>(() => {
    const base = emptyFilter();
    if (myProfile?.wedding_city) base.city = myProfile.wedding_city;
    return base;
  });

  const cities = useMemo(() => distinctCities(published), [published]);

  const filtered = useMemo(
    () => published.filter((s) => matchesFilter(s, filter)),
    [published, filter],
  );

  const aggregate = useMemo(
    () => computeAggregate(filtered, items),
    [filtered, items],
  );

  const [sort, setSort] = useState<SortKey>("recent");

  const sorted = useMemo(() => sortSubmissions(filtered, sort), [filtered, sort]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl space-y-6 px-10 py-8">
        <Header count={published.length} />

        <FilterBar
          filter={filter}
          setFilter={setFilter}
          cities={cities}
          matchCount={filtered.length}
        />

        {!aggregate.meets_minimum_threshold ? (
          <MinimumDataNotice count={filtered.length} />
        ) : (
          <>
            <BigPicture aggregate={aggregate} />
            <WhereTheMoneyGoes aggregate={aggregate} />
            <WorthItRanking aggregate={aggregate} />
            <BudgetVsReality aggregate={aggregate} />
          </>
        )}

        <IndividualFeed
          submissions={sorted}
          items={items}
          sort={sort}
          onSortChange={setSort}
          helpfulVotes={helpfulVotes}
          onToggleHelpful={toggleHelpful}
        />
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────
function Header({ count }: { count: number }) {
  return (
    <div className="border-b border-gold/15 pb-5">
      <p
        className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        The Real Numbers
      </p>
      <h2 className="mt-2 font-serif text-[34px] leading-[1.1] text-ink">
        what weddings actually cost —
      </h2>
      <p className="mt-1 font-serif text-[17px] italic text-ink-muted">
        from brides who&apos;ve been there.
      </p>
      <p className="mt-4 max-w-xl text-[13px] text-ink-muted">
        <strong className="font-medium text-ink">{count}</strong> brides have
        shared their real wedding costs — filter by city, guest count, style,
        and culture to see what weddings like yours actually cost.
      </p>
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────
function FilterBar({
  filter,
  setFilter,
  cities,
  matchCount,
}: {
  filter: CostFilterState;
  setFilter: (f: CostFilterState) => void;
  cities: string[];
  matchCount: number;
}) {
  const update = <K extends keyof CostFilterState>(
    k: K,
    v: CostFilterState[K],
  ) => setFilter({ ...filter, [k]: v });

  const toggleStyle = (s: WeddingStyle) => {
    const exists = filter.styles.includes(s);
    update(
      "styles",
      exists ? filter.styles.filter((x) => x !== s) : [...filter.styles, s],
    );
  };

  const toggleCulture = (c: CulturalTradition) => {
    const exists = filter.cultures.includes(c);
    update(
      "cultures",
      exists
        ? filter.cultures.filter((x) => x !== c)
        : [...filter.cultures, c],
    );
  };

  return (
    <section className="rounded-lg border border-border bg-ivory-warm/30 p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* City */}
        <FilterField label="City">
          <input
            list="real-numbers-cities"
            value={filter.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Any city"
            className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
          />
          <datalist id="real-numbers-cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FilterField>

        {/* Guest count */}
        <FilterField label="Guest count">
          <select
            value={filter.guest_count_range}
            onChange={(e) =>
              update(
                "guest_count_range",
                e.target.value as GuestCountBucket | "any",
              )
            }
            className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink"
          >
            <option value="any">Any</option>
            {GUEST_COUNT_BUCKET_DEF.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </FilterField>

        {/* Events */}
        <FilterField label="Number of events">
          <select
            value={filter.events_range}
            onChange={(e) =>
              update("events_range", e.target.value as EventsBucket | "any")
            }
            className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink"
          >
            <option value="any">Any</option>
            {EVENTS_BUCKET_DEF.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </FilterField>

        {/* Year range */}
        <FilterField label="Year (min)">
          <input
            type="number"
            value={filter.year_min ?? ""}
            onChange={(e) =>
              update(
                "year_min",
                e.target.value ? Number.parseInt(e.target.value, 10) : null,
              )
            }
            placeholder="2025"
            className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink"
          />
        </FilterField>
        <FilterField label="Year (max)">
          <input
            type="number"
            value={filter.year_max ?? ""}
            onChange={(e) =>
              update(
                "year_max",
                e.target.value ? Number.parseInt(e.target.value, 10) : null,
              )
            }
            placeholder="2027"
            className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink"
          />
        </FilterField>
      </div>

      <div className="mt-4">
        <FilterChipLabel>Style</FilterChipLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_STYLES.map((s) => (
            <FilterChip
              key={s}
              active={filter.styles.includes(s)}
              onClick={() => toggleStyle(s)}
            >
              {WEDDING_STYLE_LABEL[s]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <FilterChipLabel>Culture</FilterChipLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_CULTURES.map((c) => (
            <FilterChip
              key={c}
              active={filter.cultures.includes(c)}
              onClick={() => toggleCulture(c)}
            >
              {CULTURAL_TRADITION_LABEL[c]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
        <p
          className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {matchCount} weddings match your filters
        </p>
        <button
          type="button"
          onClick={() => setFilter(emptyFilter())}
          className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function FilterChipLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </button>
  );
}

// ── Minimum data notice ───────────────────────────────────────────────────
function MinimumDataNotice({ count }: { count: number }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
      <Info size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-amber-600" />
      <div>
        <p className="text-[14px] font-medium text-ink">
          Not enough data yet for these filters.
        </p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Only {count} wedding{count === 1 ? "" : "s"} matched. Widen your
          search (remove some filters) or be one of the first to share for
          this combination.
        </p>
        <p className="mt-2 text-[12px] text-ink-muted">
          We need at least {MIN_SUBMISSIONS_FOR_AGGREGATE} weddings before
          showing aggregate numbers — it protects contributors&apos; anonymity.
        </p>
      </div>
    </div>
  );
}

// ── Big picture ───────────────────────────────────────────────────────────
function BigPicture({
  aggregate,
}: {
  aggregate: ReturnType<typeof computeAggregate>;
}) {
  if (!aggregate.totals) return null;
  const t = aggregate.totals;
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <SectionEyebrow>THE BIG PICTURE</SectionEyebrow>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="median total" value={formatUsd(t.median_cents)} />
        <Stat label="average total" value={formatUsd(t.average_cents)} />
        <Stat
          label="range"
          value={`${formatUsdK(t.min_cents)}–${formatUsdK(t.max_cents)}`}
        />
        <Stat
          label="median per guest"
          value={formatUsd(t.per_guest_median_cents)}
        />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SubStat
          label="Went over budget"
          value={`${t.pct_went_over.toFixed(0)}%`}
          detail="of brides spent more than they budgeted"
        />
        <SubStat
          label="Average overage"
          value={formatPct(t.pct_over_budget_avg, 1)}
          detail="of budget — that's what to pad for"
        />
      </div>

      <DistributionChart distribution={t.distribution} />
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
      <p className="mt-1 font-serif text-[22px] leading-none text-ink">
        {value}
      </p>
    </div>
  );
}

function SubStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-1 font-serif text-[20px] text-ink">{value}</p>
      <p className="text-[12px] text-ink-muted">{detail}</p>
    </div>
  );
}

function DistributionChart({
  distribution,
}: {
  distribution: { bucket: string; count: number }[];
}) {
  const max = Math.max(1, ...distribution.map((d) => d.count));
  return (
    <div className="mt-6 rounded-md border border-border/50 bg-ivory-warm/30 p-4">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Distribution of total spend
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

// ── Where the money goes ──────────────────────────────────────────────────
function WhereTheMoneyGoes({
  aggregate,
}: {
  aggregate: ReturnType<typeof computeAggregate>;
}) {
  if (aggregate.categories.length === 0) return null;
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <SectionEyebrow>WHERE THE MONEY GOES</SectionEyebrow>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Median</th>
              <th className="py-2 pr-3">Range</th>
              <th className="py-2 pr-3">% of total</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {aggregate.categories.slice(0, 12).map((cat) => (
              <tr
                key={cat.vendor_category}
                className="border-b border-border/40"
              >
                <td className="py-2 pr-3 text-ink">{cat.label}</td>
                <td className="py-2 pr-3 font-mono text-ink">
                  {formatUsd(cat.median_cents)}
                </td>
                <td className="py-2 pr-3 text-ink-muted">
                  {formatUsdK(cat.min_cents)}–{formatUsdK(cat.max_cents)}
                </td>
                <td className="py-2 pr-3 text-ink-muted">
                  {cat.pct_of_total.toFixed(1)}%
                </td>
                <td className="py-2 text-right">
                  <Link
                    href={`/community/real-numbers/${cat.vendor_category}`}
                    className="inline-flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-saffron"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Dive in <ChevronRight size={11} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Worth it ranking ──────────────────────────────────────────────────────
function WorthItRanking({
  aggregate,
}: {
  aggregate: ReturnType<typeof computeAggregate>;
}) {
  if (aggregate.worth_it_best.length === 0 && aggregate.worth_it_worst.length === 0) {
    return null;
  }
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <SectionEyebrow>WORTH IT?</SectionEyebrow>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <RankList
          title={'Most “absolutely worth it”'}
          entries={aggregate.worth_it_best}
          tone="sage"
          icon={<TrendingUp size={14} />}
        />
        <RankList
          title={'Most "overpaid"'}
          entries={aggregate.worth_it_worst}
          tone="rose"
          icon={<TrendingDown size={14} />}
        />
      </div>
    </section>
  );
}

function RankList({
  title,
  entries,
  tone,
  icon,
}: {
  title: string;
  entries: ReturnType<typeof computeAggregate>["worth_it_best"];
  tone: "sage" | "rose";
  icon: React.ReactNode;
}) {
  const color = tone === "sage" ? "text-sage" : "text-rose";
  return (
    <div>
      <p
        className={cn(
          "flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em]",
          color,
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {icon}
        <span>{title}</span>
      </p>
      <ol className="mt-3 space-y-2">
        {entries.length === 0 && (
          <li className="text-[12px] italic text-ink-muted">
            Not enough sentiment data yet.
          </li>
        )}
        {entries.map((e, idx) => (
          <li
            key={e.category}
            className="flex items-center justify-between gap-3 text-[13px] text-ink"
          >
            <span>
              <span className="mr-2 font-mono text-[11px] text-ink-muted">
                {idx + 1}.
              </span>
              {e.label}
            </span>
            <span className="font-mono text-[11.5px] text-ink-muted">
              {e.pct.toFixed(0)}%
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Budget vs reality ─────────────────────────────────────────────────────
function BudgetVsReality({
  aggregate,
}: {
  aggregate: ReturnType<typeof computeAggregate>;
}) {
  const bvr = aggregate.budget_vs_reality;
  if (!bvr) return null;
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <SectionEyebrow>BUDGET VS. REALITY</SectionEyebrow>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="text-[13px] text-ink">
            <strong className="font-semibold">
              {bvr.pct_went_over.toFixed(0)}%
            </strong>{" "}
            of brides went over budget — on average by{" "}
            <strong className="font-semibold">
              {formatPct(bvr.avg_overage_pct, 1)}
            </strong>
            .
          </p>
          <p
            className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Biggest surprises
          </p>
          <ol className="mt-2 space-y-1.5 text-[13px]">
            {bvr.biggest_overages.length === 0 && (
              <li className="italic text-ink-muted">
                No consistent overage categories.
              </li>
            )}
            {bvr.biggest_overages.map((o, idx) => (
              <li key={o.category} className="flex justify-between">
                <span>
                  <span className="mr-1.5 font-mono text-[11px] text-ink-muted">
                    {idx + 1}.
                  </span>
                  {o.label}
                </span>
                <span className="font-mono text-[11.5px] text-rose">
                  {formatPct(o.variance_pct, 0)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Biggest savings
          </p>
          <ol className="mt-2 space-y-1.5 text-[13px]">
            {bvr.biggest_savings.length === 0 && (
              <li className="italic text-ink-muted">
                Brides mostly come in at or over budget — no consistent
                under-budget categories.
              </li>
            )}
            {bvr.biggest_savings.map((o, idx) => (
              <li key={o.category} className="flex justify-between">
                <span>
                  <span className="mr-1.5 font-mono text-[11px] text-ink-muted">
                    {idx + 1}.
                  </span>
                  {o.label}
                </span>
                <span className="font-mono text-[11.5px] text-sage">
                  {formatPct(o.variance_pct, 0)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ── Individual feed ───────────────────────────────────────────────────────
function IndividualFeed({
  submissions,
  items,
  sort,
  onSortChange,
  helpfulVotes,
  onToggleHelpful,
}: {
  submissions: CostSubmission[];
  items: ReturnType<typeof useRealNumbersStore.getState>["items"];
  sort: SortKey;
  onSortChange: (k: SortKey) => void;
  helpfulVotes: Record<string, boolean>;
  onToggleHelpful: (id: string) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <SectionEyebrow>INDIVIDUAL BREAKDOWNS</SectionEyebrow>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Sort:
          </span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="rounded-md border border-border bg-white px-2.5 py-1 text-[12px]"
          >
            <option value="recent">Most recent</option>
            <option value="helpful">Most helpful</option>
            <option value="high_low">Highest spend</option>
            <option value="low_high">Lowest spend</option>
            <option value="over_budget">Most over budget</option>
          </select>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {submissions.length === 0 && (
          <p className="rounded-md border border-dashed border-border/70 bg-ivory-warm/30 p-6 text-center text-[13px] text-ink-muted">
            No submissions match these filters.
          </p>
        )}
        {submissions.map((s) => (
          <IndividualCard
            key={s.id}
            submission={s}
            items={items.filter((x) => x.submission_id === s.id)}
            helpful={Boolean(helpfulVotes[s.id])}
            onToggleHelpful={() => onToggleHelpful(s.id)}
          />
        ))}
      </div>
    </section>
  );
}

function IndividualCard({
  submission,
  items,
  helpful,
  onToggleHelpful,
}: {
  submission: CostSubmission;
  items: ReturnType<typeof useRealNumbersStore.getState>["items"];
  helpful: boolean;
  onToggleHelpful: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sortedItems = [...items].sort((a, b) => b.actual_cents - a.actual_cents);
  const visible = expanded ? sortedItems : sortedItems.slice(0, 5);
  const variance = submissionVariancePct(submission);

  return (
    <article className="rounded-md border border-border/60 bg-ivory-warm/20 p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-serif text-[15px] text-ink">
            {submission.wedding_city}
            {submission.wedding_state ? `, ${submission.wedding_state}` : ""} ·{" "}
            {submission.guest_count} guests · {monthLabel(submission.wedding_month)}{" "}
            {submission.wedding_year}
          </p>
          <p
            className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {cultureLabelList(submission.cultural_tradition)}
            {submission.wedding_style.length > 0 && " · "}
            {styleLabelList(submission.wedding_style)}
            {" · "}
            {submission.number_of_events} event
            {submission.number_of_events === 1 ? "" : "s"} over{" "}
            {submission.wedding_duration_days} day
            {submission.wedding_duration_days === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-serif text-[18px] text-ink">
            {formatUsd(submission.total_actual_cents)}
          </p>
          <p
            className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            budgeted {formatUsd(submission.total_budget_cents)} ·{" "}
            <span
              className={
                variance > 0 ? "text-rose" : variance < 0 ? "text-sage" : ""
              }
            >
              {variance >= 0 ? "+" : ""}
              {variance.toFixed(1)}%
            </span>
          </p>
        </div>
      </header>

      <ul className="mt-3 space-y-1">
        {visible.map((it) => (
          <li
            key={it.id}
            className="flex justify-between text-[13px] text-ink"
          >
            <span>
              {categoryLabel(it.vendor_category)}
              {it.worth_it && (
                <span
                  className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ({it.worth_it.replace("_", " ")})
                </span>
              )}
            </span>
            <span className="font-mono text-[12.5px]">
              {formatUsd(it.actual_cents)}
            </span>
          </li>
        ))}
      </ul>

      {sortedItems.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {expanded
            ? "show less"
            : `...${sortedItems.length - 5} more categories`}
        </button>
      )}

      {submission.advice_text && (
        <blockquote className="mt-4 border-l-2 border-gold/40 pl-3 font-serif text-[14px] italic leading-relaxed text-ink-muted">
          &ldquo;{submission.advice_text}&rdquo;
        </blockquote>
      )}

      <footer className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onToggleHelpful}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
            helpful
              ? "border-rose bg-rose/10 text-rose"
              : "border-border bg-white text-ink-muted hover:border-rose/40 hover:text-rose",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Heart
            size={11}
            strokeWidth={1.8}
            fill={helpful ? "currentColor" : "none"}
          />
          {submission.helpful_count} found this helpful
        </button>
      </footer>
    </article>
  );
}

// ── Sort logic ────────────────────────────────────────────────────────────
function sortSubmissions(list: CostSubmission[], key: SortKey): CostSubmission[] {
  const arr = [...list];
  switch (key) {
    case "recent":
      arr.sort(
        (a, b) =>
          (b.published_at ?? "").localeCompare(a.published_at ?? ""),
      );
      break;
    case "helpful":
      arr.sort((a, b) => b.helpful_count - a.helpful_count);
      break;
    case "high_low":
      arr.sort((a, b) => b.total_actual_cents - a.total_actual_cents);
      break;
    case "low_high":
      arr.sort((a, b) => a.total_actual_cents - b.total_actual_cents);
      break;
    case "over_budget":
      arr.sort(
        (a, b) => submissionVariancePct(b) - submissionVariancePct(a),
      );
      break;
  }
  return arr;
}

// ── Section eyebrow utility ───────────────────────────────────────────────
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

