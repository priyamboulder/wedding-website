"use client";

import { useMemo, useState } from "react";
import { PlannerCard, PLANNER_PALETTE } from "@/components/planner/ui";
import {
  PHOTOGRAPHY_FEATURED,
  ROSTER_ANALYTICS,
  ROSTER_CATEGORIES,
  ROSTER_TOTAL,
  SORT_OPTIONS,
  collapsedCountFor,
  type RosterCategory,
  type RosterCategoryKey,
  type RosterVendor,
  type SortOptionKey,
  type WeddingOpening,
} from "@/lib/planner/vendor-roster-seed";

// Categories that start expanded on first render. Only Photography is shown
// fully in the spec; everything else is collapsed with a count + chevron.
const DEFAULT_EXPANDED: RosterCategoryKey[] = ["photography"];

export default function PlannerVendorRosterPage() {
  const [expanded, setExpanded] = useState<Set<RosterCategoryKey>>(
    new Set(DEFAULT_EXPANDED),
  );
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | RosterCategoryKey>(
    "all",
  );
  const [sort, setSort] = useState<SortOptionKey>("collaborations");
  const [openRecommendFor, setOpenRecommendFor] = useState<string | null>(null);

  const visibleCategories = useMemo(() => {
    if (categoryFilter === "all") return ROSTER_CATEGORIES;
    return ROSTER_CATEGORIES.filter((c) => c.key === categoryFilter);
  }, [categoryFilter]);

  const photographyVendors = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? PHOTOGRAPHY_FEATURED.filter((v) =>
          [v.name, v.location, v.tags.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : PHOTOGRAPHY_FEATURED;
    return sortVendors(filtered, sort);
  }, [query, sort]);

  function toggleCategory(key: RosterCategoryKey) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-[1280px] px-8 py-10">
      {/* Eyebrow + title + meta */}
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Private directory
          </p>
          <h1
            className="mt-2 text-[44px] leading-[1.05] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            My Vendor Roster
          </h1>
          <p
            className="mt-1.5 text-[15.5px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {ROSTER_TOTAL} vendors you&apos;ve worked with, ranked and annotated —
            not visible to couples or to the vendors themselves.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12.5px] font-medium"
          style={{
            backgroundColor: PLANNER_PALETTE.charcoal,
            color: "#FAF8F5",
          }}
        >
          <span aria-hidden className="text-[#C4A265]">⊕</span>
          Add Vendor
        </button>
      </section>

      {/* Controls strip: search + category filter + sort */}
      <section className="mt-8">
        <PlannerCard className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <label className="relative flex-1 min-w-[240px]">
              <span
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8a8a8a]"
              >
                ⌕
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search by vendor name..."
                className="h-10 w-full rounded-full border bg-white pl-9 pr-4 text-[13px] outline-none transition-colors focus:border-[#C4A265]"
                style={{ borderColor: PLANNER_PALETTE.hairline }}
              />
            </label>

            {/* Category filter */}
            <SelectField
              label="Category"
              value={categoryFilter}
              onChange={(v) => setCategoryFilter(v as "all" | RosterCategoryKey)}
              options={[
                { value: "all", label: "All Categories" },
                ...ROSTER_CATEGORIES.map((c) => ({
                  value: c.key,
                  label: `${c.label} (${c.count})`,
                })),
              ]}
            />

            {/* Sort */}
            <SelectField
              label="Sort"
              value={sort}
              onChange={(v) => setSort(v as SortOptionKey)}
              options={SORT_OPTIONS.map((o) => ({
                value: o.key,
                label: o.label,
              }))}
            />
          </div>
        </PlannerCard>
      </section>

      {/* Two-column: list + analytics sidebar */}
      <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {visibleCategories.map((cat) => (
            <CategorySection
              key={cat.key}
              category={cat}
              expanded={expanded.has(cat.key)}
              onToggle={() => toggleCategory(cat.key)}
              vendors={
                cat.key === "photography" ? photographyVendors : []
              }
              openRecommendFor={openRecommendFor}
              setOpenRecommendFor={setOpenRecommendFor}
            />
          ))}
        </div>

        <aside>
          <AnalyticsPanel />
        </aside>
      </section>
    </div>
  );
}

// ── Category section ──────────────────────────────────────────────────────

function CategorySection({
  category,
  expanded,
  onToggle,
  vendors,
  openRecommendFor,
  setOpenRecommendFor,
}: {
  category: RosterCategory;
  expanded: boolean;
  onToggle: () => void;
  vendors: RosterVendor[];
  openRecommendFor: string | null;
  setOpenRecommendFor: (id: string | null) => void;
}) {
  return (
    <PlannerCard className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-[#FBF4E6]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[22px]" aria-hidden>
            {category.emoji}
          </span>
          <h2
            className="text-[22px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.005em",
            }}
          >
            {category.label}
          </h2>
          <span
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#9E8245]"
          >
            ({category.count})
          </span>
        </div>
        <span
          className="grid h-7 w-7 place-items-center rounded-full text-[12px] text-[#8a8a8a] transition-transform"
          style={{
            backgroundColor: expanded ? "#F5E6D0" : "transparent",
            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
          }}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div
          className="border-t"
          style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}
        >
          {category.key === "photography" ? (
            <div className="space-y-4 p-5">
              {vendors.map((v) => (
                <VendorRow
                  key={v.id}
                  vendor={v}
                  recommendOpen={openRecommendFor === v.id}
                  onToggleRecommend={() =>
                    setOpenRecommendFor(
                      openRecommendFor === v.id ? null : v.id,
                    )
                  }
                />
              ))}
              <MoreLine
                label={`+ ${collapsedCountFor(category.key)} more photographers`}
              />
            </div>
          ) : (
            <EmptyCategoryHint category={category} />
          )}
        </div>
      )}
    </PlannerCard>
  );
}

function EmptyCategoryHint({ category }: { category: RosterCategory }) {
  return (
    <div
      className="px-6 py-5 text-[12.5px] italic text-[#8a8a8a]"
      style={{ fontFamily: "'EB Garamond', serif" }}
    >
      {category.count} vendors in this category — expand the Photography
      section above for a fully-annotated view. Detailed cards for{" "}
      {category.label.toLowerCase()} are stored in the same format.
    </div>
  );
}

function MoreLine({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border border-dashed px-4 py-3 text-[12.5px] text-[#6a6a6a]"
      style={{ borderColor: "rgba(196, 162, 101, 0.45)" }}
    >
      <span
        className="italic"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        {label}
      </span>
      <button
        type="button"
        className="text-[11.5px] font-medium text-[#9E8245] hover:text-[#7a5a1a]"
      >
        Show all →
      </button>
    </div>
  );
}

// ── Vendor row ────────────────────────────────────────────────────────────

function VendorRow({
  vendor,
  recommendOpen,
  onToggleRecommend,
}: {
  vendor: RosterVendor;
  recommendOpen: boolean;
  onToggleRecommend: () => void;
}) {
  return (
    <div
      className="rounded-xl border bg-white p-5"
      style={{ borderColor: PLANNER_PALETTE.hairline }}
    >
      <div className="flex flex-wrap items-start gap-4">
        {/* Avatar monogram */}
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-[15px] font-medium text-[#7a5a1a]"
          style={{
            backgroundColor: "#F5E6D0",
            boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
            fontFamily: "'Cormorant Garamond', serif",
          }}
          aria-hidden
        >
          {vendor.avatarMonogram}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className="text-[20px] leading-tight text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                }}
              >
                {vendor.name}
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-[#5a5a5a]">
                <span
                  className="inline-flex items-center gap-1 text-[#9E8245]"
                >
                  <span aria-hidden>★</span>
                  <span className="font-mono tracking-wider text-[#2C2C2C]">
                    {vendor.rating.toFixed(1)}
                  </span>
                </span>
                <span className="text-[#b5a68e]">·</span>
                <span>Photography</span>
                <span className="text-[#b5a68e]">·</span>
                <span>{vendor.location}</span>
              </p>

              <p className="mt-2 text-[12.5px] text-[#5a5a5a]">
                <span
                  className="font-mono text-[11.5px] tracking-wider text-[#2C2C2C]"
                >
                  {vendor.collaborations}
                </span>{" "}
                weddings together
                <span className="mx-1.5 text-[#b5a68e]">·</span>
                Last: {vendor.lastWorked}
              </p>

              <p className="mt-1.5 font-mono text-[11.5px] text-[#2C2C2C]">
                {vendor.priceRange}{" "}
                <span className="text-[#8a8a8a]">typical range</span>
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span
              aria-hidden
              className="text-[11px] text-[#9E8245]"
              title="Planner tags"
            >
              🏷
            </span>
            {vendor.tags.map((t) => (
              <span
                key={t}
                className="rounded-full px-2.5 py-[3px] text-[10.5px] font-medium tracking-wide"
                style={{
                  backgroundColor: "#FBF1DF",
                  color: "#7a5a1a",
                  boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.28)",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Private note */}
          <div
            className="mt-4 rounded-lg px-3.5 py-3"
            style={{
              backgroundColor: "#FBF4E6",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.22)",
            }}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-[11px] text-[#9E8245]">
                📝
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-[#9E8245]">
                Private note — never shown to vendor or couples
              </span>
            </div>
            <p
              className="mt-1.5 text-[13px] leading-[1.5] text-[#3a3a3a]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {vendor.privateNote}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={onToggleRecommend}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor: PLANNER_PALETTE.charcoal,
                  color: "#FAF8F5",
                }}
              >
                Recommend
                <span aria-hidden className="text-[#C4A265]">▾</span>
              </button>
              {recommendOpen && (
                <RecommendPopover openings={vendor.openings} />
              )}
            </div>

            <SecondaryButton>Message</SecondaryButton>
            <SecondaryButton>View Profile</SecondaryButton>
            <SecondaryButton>Edit Note</SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5 text-[12px] text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]/60"
      style={{ borderColor: PLANNER_PALETTE.hairline }}
    >
      {children}
    </button>
  );
}

function RecommendPopover({ openings }: { openings: WeddingOpening[] }) {
  return (
    <div
      className="absolute left-0 top-[calc(100%+6px)] z-20 w-[300px] overflow-hidden rounded-xl border bg-white shadow-lg"
      style={{
        borderColor: PLANNER_PALETTE.hairline,
        boxShadow: "0 20px 40px -18px rgba(44,44,44,0.25)",
      }}
    >
      <div
        className="px-4 py-2.5"
        style={{
          backgroundColor: "#FBF4E6",
          borderBottom: `1px solid ${PLANNER_PALETTE.hairlineSoft}`,
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9E8245]">
          Recommend to:
        </p>
      </div>
      <ul>
        {openings.map((o) => {
          const isBooked = o.status === "booked";
          return (
            <li
              key={o.weddingId}
              className="border-t"
              style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}
            >
              <button
                type="button"
                disabled={isBooked}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[12.5px] ${
                  isBooked
                    ? "cursor-not-allowed text-[#9a9a9a]"
                    : "text-[#2C2C2C] hover:bg-[#FBF4E6]"
                }`}
              >
                <span className="truncate">
                  <span aria-hidden className="mr-1 text-[#9E8245]">→</span>
                  {o.couple}
                  <span className="text-[#8a8a8a]">
                    {" "}
                    — {o.categoryLabel}
                  </span>
                </span>
                {isBooked ? (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-[10px] text-[#27AE60]">
                    Booked <span aria-hidden>✓</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-[10px] text-[#E67E22]">
                    Open <span aria-hidden>⚠</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Analytics panel ───────────────────────────────────────────────────────

function AnalyticsPanel() {
  return (
    <PlannerCard className="sticky top-[80px] p-5" tone="champagne">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#9E8245]">
        Roster analytics
      </p>

      <div className="mt-4 space-y-4">
        <StatRow
          label="Total vendors in roster"
          value={ROSTER_ANALYTICS.totalVendors.toString()}
        />
        <StatRow
          label="Most-used vendor"
          value={ROSTER_ANALYTICS.mostUsedVendor.name}
          sub={`${ROSTER_ANALYTICS.mostUsedVendor.count} weddings · ${ROSTER_ANALYTICS.mostUsedVendor.category}`}
        />
        <StatRow
          label="Most options"
          value={ROSTER_ANALYTICS.mostCategory.name}
          sub={`${ROSTER_ANALYTICS.mostCategory.count} vendors`}
        />
        <StatRow
          label="Fewest options"
          value={ROSTER_ANALYTICS.fewestCategory.name}
          sub={`${ROSTER_ANALYTICS.fewestCategory.count} vendors`}
          hint={ROSTER_ANALYTICS.fewestCategory.hint}
          hintTone="warning"
        />
        <StatRow
          label="Added this quarter"
          value={`+${ROSTER_ANALYTICS.addedThisQuarter}`}
        />
        <StatRow
          label="Stale entries"
          value={`${ROSTER_ANALYTICS.staleVendors.count}`}
          hint={ROSTER_ANALYTICS.staleVendors.hint}
          hintTone="warning"
        />
      </div>
    </PlannerCard>
  );
}

function StatRow({
  label,
  value,
  sub,
  hint,
  hintTone,
}: {
  label: string;
  value: string;
  sub?: string;
  hint?: string;
  hintTone?: "warning";
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8a8a]">
        {label}
      </p>
      <p
        className="mt-1 text-[18px] leading-tight text-[#2C2C2C]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[11.5px] text-[#6a6a6a]">{sub}</p>
      )}
      {hint && (
        <p
          className="mt-1 text-[11.5px] italic"
          style={{
            color: hintTone === "warning" ? "#8a5a20" : "#6a6a6a",
            fontFamily: "'EB Garamond', serif",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Select field ──────────────────────────────────────────────────────────

function SelectField({
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
    <label className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8a8a8a]">
        {label}
      </span>
      <div
        className="relative flex items-center rounded-full border bg-white"
        style={{ borderColor: PLANNER_PALETTE.hairline }}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent py-2 pl-3.5 pr-8 text-[12.5px] text-[#2C2C2C] outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 text-[10px] text-[#8a8a8a]"
        >
          ▾
        </span>
      </div>
    </label>
  );
}

// ── Sorting ───────────────────────────────────────────────────────────────

function sortVendors(
  vendors: RosterVendor[],
  sort: SortOptionKey,
): RosterVendor[] {
  const copy = [...vendors];
  switch (sort) {
    case "collaborations":
      return copy.sort((a, b) => b.collaborations - a.collaborations);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "recent":
      // "Oct 2025" style — newer months first by parsing Date.
      return copy.sort(
        (a, b) =>
          new Date(b.lastWorked).getTime() -
          new Date(a.lastWorked).getTime(),
      );
    case "alpha":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}
