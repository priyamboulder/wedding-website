"use client";

// ── Real Weddings tab ──────────────────────────────────────────────────────
// Featured showcase hero at top, filter bar (style / tradition / budget /
// city search), sort selector, and a masonry-leaning grid of ShowcaseCards.
// Reads the published catalog from the Zustand store so user-submitted
// showcases show up automatically.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, PenSquare, Search, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShowcasesStore } from "@/stores/showcases-store";
import {
  SHOWCASE_STYLE_LABEL,
  SHOWCASE_TRADITION_LABEL,
  SHOWCASE_BUDGET_LABEL,
  type RealWeddingShowcase,
  type ShowcaseStyleTag,
  type ShowcaseTraditionTag,
  type ShowcaseBudgetRange,
} from "@/types/showcase";
import { monthLabel, currentMonthKey } from "@/lib/showcases/awards";
import { ShowcaseCard } from "./ShowcaseCard";

type StyleFilter = "all" | ShowcaseStyleTag;
type TradFilter = "all" | ShowcaseTraditionTag;
type BudgetFilter = "all" | ShowcaseBudgetRange;
type Sort = "newest" | "most_saved" | "most_viewed";

const SORT_LABEL: Record<Sort, string> = {
  newest: "Newest",
  most_saved: "Most saved",
  most_viewed: "Most viewed",
};

export function ShowcasesTab() {
  const listShowcases = useShowcasesStore((s) => s.listShowcases);
  const saveCountFor = useShowcasesStore((s) => s.saveCountFor);
  const viewCountFor = useShowcasesStore((s) => s.viewCountFor);
  const monthlyWinnerId = useShowcasesStore((s) => s.getMonthlyWinnerId());

  const showcases = useMemo(() => listShowcases(), [listShowcases]);

  const [style, setStyle] = useState<StyleFilter>("all");
  const [tradition, setTradition] = useState<TradFilter>("all");
  const [budget, setBudget] = useState<BudgetFilter>("all");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  const filteredSorted = useMemo(() => {
    let base = showcases;
    if (style !== "all") base = base.filter((s) => s.styleTags.includes(style));
    if (tradition !== "all")
      base = base.filter((s) => s.traditionTags.includes(tradition));
    if (budget !== "all")
      base = base.filter((s) => s.budgetRange === budget);
    if (city.trim()) {
      const q = city.trim().toLowerCase();
      base = base.filter((s) =>
        s.locationCity.toLowerCase().includes(q),
      );
    }
    return sortShowcases(base, sort, saveCountFor, viewCountFor);
  }, [showcases, style, tradition, budget, city, sort, saveCountFor, viewCountFor]);

  const featured = useMemo(
    () => filteredSorted.find((s) => s.isFeatured) ?? filteredSorted[0],
    [filteredSorted],
  );
  const rest = useMemo(
    () => filteredSorted.filter((s) => s.id !== featured?.id),
    [filteredSorted, featured],
  );

  return (
    <div className="bg-white px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Share Your Wedding CTA */}
        <section className="mb-10 flex flex-col justify-between gap-4 rounded-2xl border border-gold/20 bg-ivory-warm/40 p-6 md:flex-row md:items-center md:p-8">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              For couples who've said "I do"
            </p>
            <h2 className="mt-2 font-serif text-[26px] font-medium text-ink md:text-[28px]">
              Share your wedding with the circle.
            </h2>
            <p className="mt-2 max-w-xl font-serif text-[15px] italic text-ink-muted">
              Post a showcase, tag every vendor and product, and help the next
              bride figure out what we all wish we had known.
            </p>
          </div>
          <Link
            href="/share"
            className="flex shrink-0 items-center gap-2 self-start rounded-full border border-ink bg-ink px-5 py-3 text-[13px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-ink/90 md:self-center"
          >
            <PenSquare size={14} strokeWidth={1.8} />
            Share your wedding
          </Link>
        </section>

        {/* Wedding of the Month spotlight (inline banner when we have a winner) */}
        {monthlyWinnerId && (
          <WeddingOfTheMonthSpotlight showcaseId={monthlyWinnerId} />
        )}

        {/* Filters */}
        <FilterBar
          style={style}
          onStyleChange={setStyle}
          tradition={tradition}
          onTraditionChange={setTradition}
          budget={budget}
          onBudgetChange={setBudget}
          city={city}
          onCityChange={setCity}
          sort={sort}
          onSortChange={setSort}
        />

        {filteredSorted.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Featured hero */}
            {featured && (
              <div className="mt-10 rounded-2xl border border-gold/20 bg-ivory-warm/30 p-6 md:p-8">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Editor's Feature
                </p>
                <div className="mt-4">
                  <ShowcaseCard
                    showcase={featured}
                    size="featured"
                    isMonthlyWinner={featured.id === monthlyWinnerId}
                  />
                </div>
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {rest.map((s) => (
                  <ShowcaseCard
                    key={s.id}
                    showcase={s}
                    isMonthlyWinner={s.id === monthlyWinnerId}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Wedding of the Month spotlight ──────────────────────────────────────────

function WeddingOfTheMonthSpotlight({ showcaseId }: { showcaseId: string }) {
  const getShowcase = useShowcasesStore((s) => s.getShowcase);
  const showcase = getShowcase(showcaseId);
  if (!showcase) return null;

  return (
    <Link
      href={`/community/real-weddings/${showcase.slug}`}
      className="group mb-10 flex items-center gap-4 overflow-hidden rounded-2xl border border-gold/30 bg-gold-pale/30 p-4 transition-colors hover:bg-gold-pale/50 md:p-5"
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/90 text-ivory"
        aria-hidden
      >
        <Trophy size={22} strokeWidth={1.6} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Wedding of the Month · {monthLabel(currentMonthKey())}
        </p>
        <h3 className="mt-1 truncate font-serif text-[20px] font-medium text-ink group-hover:text-saffron">
          {showcase.brideName} & {showcase.partnerName}
        </h3>
        <p className="truncate font-serif text-[13px] italic text-ink-muted">
          {showcase.venueName}, {showcase.locationCity}
        </p>
      </div>
      <span
        className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-gold sm:block"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Most-saved this month →
      </span>
    </Link>
  );
}

// ── Filter bar ──────────────────────────────────────────────────────────────

function FilterBar({
  style,
  onStyleChange,
  tradition,
  onTraditionChange,
  budget,
  onBudgetChange,
  city,
  onCityChange,
  sort,
  onSortChange,
}: {
  style: StyleFilter;
  onStyleChange: (s: StyleFilter) => void;
  tradition: TradFilter;
  onTraditionChange: (t: TradFilter) => void;
  budget: BudgetFilter;
  onBudgetChange: (b: BudgetFilter) => void;
  city: string;
  onCityChange: (c: string) => void;
  sort: Sort;
  onSortChange: (s: Sort) => void;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-4 md:p-5">
      {/* Style chips */}
      <div>
        <Eyebrow>Style</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip
            active={style === "all"}
            label="All"
            onClick={() => onStyleChange("all")}
          />
          {(Object.keys(SHOWCASE_STYLE_LABEL) as ShowcaseStyleTag[]).map((t) => (
            <Chip
              key={t}
              active={style === t}
              label={SHOWCASE_STYLE_LABEL[t]}
              onClick={() => onStyleChange(t)}
            />
          ))}
        </div>
      </div>

      {/* Tradition chips */}
      <div>
        <Eyebrow>Tradition</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip
            active={tradition === "all"}
            label="All"
            onClick={() => onTraditionChange("all")}
          />
          {(Object.keys(SHOWCASE_TRADITION_LABEL) as ShowcaseTraditionTag[]).map(
            (t) => (
              <Chip
                key={t}
                active={tradition === t}
                label={SHOWCASE_TRADITION_LABEL[t]}
                onClick={() => onTraditionChange(t)}
              />
            ),
          )}
        </div>
      </div>

      {/* Budget + city + sort row */}
      <div className="flex flex-wrap items-end gap-3 pt-1">
        <FilterSelect
          label="Budget"
          value={budget}
          onChange={(v) => onBudgetChange(v as BudgetFilter)}
          options={[
            { value: "all", label: "All budgets" },
            ...Object.entries(SHOWCASE_BUDGET_LABEL).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        <label className="flex flex-1 flex-col gap-1 min-w-[200px]">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Location
          </span>
          <span className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] transition-colors focus-within:border-gold/40">
            <Search size={13} strokeWidth={1.8} className="text-ink-faint" />
            <input
              type="text"
              placeholder="Search by city…"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink-faint"
            />
          </span>
        </label>
        <FilterSelect
          label="Sort"
          value={sort}
          onChange={(v) => onSortChange(v as Sort)}
          options={(Object.keys(SORT_LABEL) as Sort[]).map((s) => ({
            value: s,
            label: SORT_LABEL[s],
          }))}
        />
      </div>
    </section>
  );
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-rose/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-gold/30 focus:border-gold/40 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function EmptyState() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-rose/30 bg-rose-pale/40 text-rose">
        <Heart size={22} strokeWidth={1.5} />
      </div>
      <p className="mt-5 font-serif text-[22px] italic text-ink">
        no weddings match these filters yet.
      </p>
      <p className="mt-2 max-w-[380px] text-[14px] leading-[1.65] text-ink-muted">
        try a different combination — or share yours and be the first.
      </p>
    </div>
  );
}

// ── Sort helper ─────────────────────────────────────────────────────────────

function sortShowcases(
  list: RealWeddingShowcase[],
  sort: Sort,
  saveCountFor: (id: string) => number,
  viewCountFor: (id: string) => number,
): RealWeddingShowcase[] {
  const copy = [...list];
  if (sort === "most_saved") {
    copy.sort((a, b) => saveCountFor(b.id) - saveCountFor(a.id));
    return copy;
  }
  if (sort === "most_viewed") {
    copy.sort((a, b) => viewCountFor(b.id) - viewCountFor(a.id));
    return copy;
  }
  copy.sort((a, b) =>
    (b.publishedAt ?? b.createdAt).localeCompare(
      a.publishedAt ?? a.createdAt,
    ),
  );
  return copy;
}
