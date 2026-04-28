"use client";

import { useMemo, useState } from "react";
import {
  MetaPill,
  SectionHeader,
  VENUE_PALETTE,
  VenueCard,
} from "@/components/venue/ui";
import { VENUE } from "@/lib/venue/seed";
import {
  ACTIVE_COUPLES_AT_VENUE,
  VENDOR_CATEGORIES,
  VENDOR_NETWORK_STATS,
  VENUE_PLANNERS,
  VENUE_VENDORS,
  type VenuePlanner,
  type VenueVendor,
  type VenueVendorCategory,
  type VenueVendorCategoryId,
} from "@/lib/venue/vendors-seed";

type CategoryFilter = "all" | VenueVendorCategoryId;
type StatusFilter = "all" | "preferred" | "others";
type SortKey = "frequency" | "rating" | "recent" | "alpha";

const INITIAL_VISIBLE = 3;

export default function VenueVendorsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("frequency");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [preferredOverrides, setPreferredOverrides] = useState<
    Record<string, boolean>
  >({});
  const [showManagePanel, setShowManagePanel] = useState(false);

  // Apply preferred overrides + filters + sort.
  const vendorsWithState = useMemo(
    () =>
      VENUE_VENDORS.map((v) => ({
        ...v,
        preferred:
          preferredOverrides[v.id] !== undefined
            ? preferredOverrides[v.id]
            : v.preferred,
      })),
    [preferredOverrides]
  );

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendorsWithState.filter((v) => {
      if (category !== "all" && v.categoryId !== category) return false;
      if (status === "preferred" && !v.preferred) return false;
      if (status === "others" && v.preferred) return false;
      if (q && !v.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [vendorsWithState, search, category, status]);

  const sortedVendors = useMemo(() => {
    const copy = [...filteredVendors];
    copy.sort((a, b) => {
      if (sort === "frequency") return b.weddingsHere - a.weddingsHere;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "recent")
        return b.lastWeddingSort.localeCompare(a.lastWeddingSort);
      return a.name.localeCompare(b.name);
    });
    return copy;
  }, [filteredVendors, sort]);

  // Group sorted vendors by category, preserving the category order above.
  const grouped = useMemo(() => {
    const map = new Map<VenueVendorCategoryId, VenueVendor[]>();
    for (const v of sortedVendors) {
      const arr = map.get(v.categoryId) ?? [];
      arr.push(v);
      map.set(v.categoryId, arr);
    }
    // When sorting within a category, still always lift preferred to top first.
    for (const [key, arr] of map) {
      arr.sort((a, b) => {
        if (a.preferred !== b.preferred) return a.preferred ? -1 : 1;
        if (sort === "frequency") return b.weddingsHere - a.weddingsHere;
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "recent")
          return b.lastWeddingSort.localeCompare(a.lastWeddingSort);
        return a.name.localeCompare(b.name);
      });
      map.set(key, arr);
    }
    return map;
  }, [sortedVendors, sort]);

  const activePreferredCount = vendorsWithState.filter((v) => v.preferred).length;

  function togglePreferred(vendor: VenueVendor) {
    setPreferredOverrides((prev) => ({
      ...prev,
      [vendor.id]: !vendor.preferred,
    }));
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="mx-auto max-w-[1320px] px-8 pt-8">
      <Header />

      <PreferredProgramCallout
        count={activePreferredCount}
        onManage={() => setShowManagePanel((p) => !p)}
      />

      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
        sort={sort}
        setSort={setSort}
      />

      {/* Vendor Categories */}
      <div className="mt-6 space-y-5">
        {VENDOR_CATEGORIES.map((cat) => {
          const vendors = grouped.get(cat.id) ?? [];
          // If category filter is active and this category doesn't match, skip
          if (category !== "all" && category !== cat.id) return null;
          // If status filter excludes everything here, skip unless "all" category
          if (vendors.length === 0 && (search || status !== "all")) return null;
          return (
            <CategorySection
              key={cat.id}
              category={cat}
              vendors={vendors}
              expanded={!!expanded[cat.id]}
              onToggleExpanded={() => toggleExpanded(cat.id)}
              onTogglePreferred={togglePreferred}
              showAll={category !== "all" || !!search || status !== "all"}
            />
          );
        })}
      </div>

      {/* Planners */}
      <div className="mt-14">
        <PlannersSection planners={VENUE_PLANNERS} />
      </div>

      {/* Invite CTA */}
      <div className="mt-14 mb-10">
        <InviteVendorCta />
      </div>

      {showManagePanel && (
        <ManagePreferredPanel
          vendors={vendorsWithState}
          onClose={() => setShowManagePanel(false)}
          onToggle={togglePreferred}
        />
      )}
    </div>
  );
}

/* --------------------------------- Header --------------------------------- */

function Header() {
  return (
    <section>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
        Venue · Vendor Network
      </p>
      <h1
        className="mt-2 text-[48px] leading-[1.02] text-[#2C2C2C]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        Vendor Network
      </h1>
      <p
        className="mt-2 text-[16px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        {VENDOR_NETWORK_STATS.totalVendors} vendors have worked at {VENUE.name}
      </p>
      <div
        className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl px-5 py-3 text-[13px] text-[#5a4a30]"
        style={{
          backgroundColor: "#FBF1DF",
          boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.25)",
        }}
      >
        <StatChip label="Preferred" value={VENDOR_NETWORK_STATS.preferredCount} />
        <Divider />
        <StatChip label="Planners" value={VENDOR_NETWORK_STATS.plannerCount} />
        <Divider />
        <StatChip
          label="Weddings"
          value={VENDOR_NETWORK_STATS.totalWeddings}
          suffix="total"
        />
      </div>
    </section>
  );
}

function StatChip({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className="font-mono text-[16px] text-[#2C2C2C]"
        style={{ fontWeight: 500 }}
      >
        {value}
      </span>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
        {label} {suffix ? <span className="text-[#b69f75]">{suffix}</span> : null}
      </span>
    </span>
  );
}

function Divider() {
  return (
    <span aria-hidden className="text-[#cdbf9c]">
      ·
    </span>
  );
}

/* ------------------------ Preferred Program Callout ----------------------- */

function PreferredProgramCallout({
  count,
  onManage,
}: {
  count: number;
  onManage: () => void;
}) {
  return (
    <section className="mt-8">
      <VenueCard tone="champagne" className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-5 p-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-8 w-8 place-items-center rounded-full text-[14px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.75)",
                  color: VENUE_PALETTE.goldDeep,
                  boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
                }}
                aria-hidden
              >
                ★
              </span>
              <h2
                className="text-[22px] leading-tight text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                Preferred Vendor Program
              </h2>
              <span className="font-mono text-[11px] text-[#5a4220]">
                {count} designated
              </span>
            </div>
            <ul className="mt-3 grid gap-1.5 text-[12.5px] text-[#5a4a30] sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-[1px] text-[#9E8245]">
                  ★
                </span>
                Preferred badge on the venue's Ananya profile
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-[1px] text-[#9E8245]">
                  ◔
                </span>
                Priority placement when couples filter vendors at this venue
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-[1px] text-[#9E8245]">
                  ✦
                </span>
                Featured in the venue's wedding showcase vendor lists
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-[1px] text-[#9E8245]">
                  ✉
                </span>
                Included in recommendations to inquiring couples
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={onManage}
            className="shrink-0 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
            style={{
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            Manage →
          </button>
        </div>
      </VenueCard>
    </section>
  );
}

/* -------------------------------- Filter Bar ------------------------------ */

function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  sort,
  setSort,
}: {
  search: string;
  setSearch: (v: string) => void;
  category: CategoryFilter;
  setCategory: (v: CategoryFilter) => void;
  status: StatusFilter;
  setStatus: (v: StatusFilter) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;
}) {
  return (
    <section className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-[1.3fr_1fr_0.9fr_1fr]">
      {/* Search */}
      <div
        className="flex items-center gap-2.5 rounded-full border px-4 py-2.5"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: VENUE_PALETTE.hairline,
        }}
      >
        <span aria-hidden className="text-[13px] text-[#9E8245]">
          ⌕
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors..."
          className="w-full bg-transparent text-[13px] text-[#2C2C2C] placeholder:text-[#8a8a8a] focus:outline-none"
        />
      </div>

      {/* Category */}
      <FilterSelect
        value={category}
        onChange={(v) => setCategory(v as CategoryFilter)}
        label="Category"
        options={[
          { value: "all", label: "All categories" },
          ...VENDOR_CATEGORIES.map((c) => ({
            value: c.id,
            label: `${c.icon} ${c.label}`,
          })),
        ]}
      />

      {/* Status */}
      <FilterSelect
        value={status}
        onChange={(v) => setStatus(v as StatusFilter)}
        label="Status"
        options={[
          { value: "all", label: "All vendors" },
          { value: "preferred", label: "★ Preferred" },
          { value: "others", label: "All others" },
        ]}
      />

      {/* Sort */}
      <FilterSelect
        value={sort}
        onChange={(v) => setSort(v as SortKey)}
        label="Sort"
        options={[
          { value: "frequency", label: "Most weddings here" },
          { value: "rating", label: "Highest rated" },
          { value: "recent", label: "Most recent" },
          { value: "alpha", label: "Alphabetical" },
        ]}
      />
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label
      className="relative flex items-center gap-2 rounded-full border px-4 py-2.5"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: VENUE_PALETTE.hairline,
      }}
    >
      <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9E8245]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none bg-transparent text-[13px] text-[#2C2C2C] focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none text-[11px] text-[#9E8245]">
        ▾
      </span>
    </label>
  );
}

/* ----------------------------- Category Section --------------------------- */

function CategorySection({
  category,
  vendors,
  expanded,
  onToggleExpanded,
  onTogglePreferred,
  showAll,
}: {
  category: VenueVendorCategory;
  vendors: VenueVendor[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onTogglePreferred: (v: VenueVendor) => void;
  showAll: boolean;
}) {
  const listedCount = vendors.length;
  // Unlisted count = how many are in the category total but not in this seeded list
  const unlistedCount = Math.max(0, category.total - listedCount);
  const visibleSlice = expanded || showAll ? vendors : vendors.slice(0, INITIAL_VISIBLE);
  const hiddenSlice = Math.max(0, vendors.length - INITIAL_VISIBLE);
  const extraCount = unlistedCount + (expanded || showAll ? 0 : hiddenSlice);

  return (
    <VenueCard className="overflow-hidden">
      <div
        className="flex items-center justify-between gap-3 px-6 py-4"
        style={{
          borderBottom: `1px solid ${VENUE_PALETTE.hairline}`,
          backgroundColor: "#FFFDF9",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="grid h-9 w-9 place-items-center rounded-full text-[16px]"
            style={{
              backgroundColor: "#F5E6D0",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.30)",
            }}
            aria-hidden
          >
            {category.icon}
          </span>
          <div>
            <h3
              className="text-[20px] leading-tight text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              {category.label}
            </h3>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
              {category.total} vendor{category.total !== 1 ? "s" : ""}
              {vendors.some((v) => v.preferred) && (
                <>
                  <span className="mx-1.5 text-[#cdbf9c]">·</span>
                  {vendors.filter((v) => v.preferred).length} preferred
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className="px-6 py-8 text-center text-[13px] text-[#8a8a8a]">
          No vendors match the current filters.
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: VENUE_PALETTE.hairline }}>
          {visibleSlice.map((v) => (
            <VendorRow
              key={v.id}
              vendor={v}
              onTogglePreferred={() => onTogglePreferred(v)}
            />
          ))}
          {extraCount > 0 && (
            <div className="flex items-center justify-between px-6 py-3">
              <p className="text-[12.5px] italic text-[#8a8a8a]">
                + {extraCount} more{" "}
                {category.label.toLowerCase().replace(" & florals", "")} vendor
                {extraCount !== 1 ? "s" : ""}…
              </p>
              <button
                type="button"
                onClick={onToggleExpanded}
                className="rounded-full px-3 py-1 text-[11.5px] font-medium text-[#9E8245] hover:bg-[#F5E6D0]"
              >
                {expanded ? "Show fewer" : "Show all"}
              </button>
            </div>
          )}
        </div>
      )}
    </VenueCard>
  );
}

/* -------------------------------- Vendor Row ------------------------------ */

function VendorRow({
  vendor,
  onTogglePreferred,
}: {
  vendor: VenueVendor;
  onTogglePreferred: () => void;
}) {
  const [couplePickerOpen, setCouplePickerOpen] = useState(false);
  return (
    <div
      className="relative grid gap-4 px-6 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
      style={{
        backgroundColor: vendor.preferred ? "#FDFAF1" : "#FFFFFF",
      }}
    >
      {vendor.preferred && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundColor: VENUE_PALETTE.gold }}
        />
      )}

      {/* Avatar */}
      <div
        className="grid h-[60px] w-[60px] place-items-center rounded-xl text-[16px] font-semibold text-[#5a4220]"
        style={{
          backgroundColor: vendor.tint,
          boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.25)",
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        {vendor.initials}
      </div>

      {/* Identity & stats */}
      <div className="min-w-0">
        {vendor.preferred && (
          <span
            className="mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] font-mono text-[9.5px] uppercase tracking-[0.22em]"
            style={{
              backgroundColor: VENUE_PALETTE.gold,
              color: "#FFFFFF",
            }}
          >
            <span aria-hidden>★</span>
            Preferred
          </span>
        )}
        <div className="flex flex-wrap items-baseline gap-2">
          <a
            href={`/vendors/${vendor.id}`}
            className="text-[17px] leading-tight text-[#2C2C2C] hover:text-[#9E8245]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            {vendor.name}
          </a>
          <div className="flex flex-wrap items-center gap-1.5">
            {vendor.ananyaSelect && (
              <MetaPill tone="gold">
                <span className="mr-1" aria-hidden>
                  ✦
                </span>
                Ananya Select
              </MetaPill>
            )}
            {vendor.verified && (
              <MetaPill>
                <span className="mr-1" aria-hidden>
                  ✓
                </span>
                Verified
              </MetaPill>
            )}
            {vendor.destination && (
              <MetaPill tone="rose">
                <span className="mr-1" aria-hidden>
                  ✈
                </span>
                Destination
              </MetaPill>
            )}
          </div>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12.5px] text-[#5a5a5a]">
          <span className="inline-flex items-baseline gap-1">
            <span aria-hidden className="text-[#C4A265]">
              ★
            </span>
            <span className="font-mono text-[12px] text-[#2C2C2C]">
              {vendor.rating.toFixed(1)}
            </span>
          </span>
          <Divider />
          <span>
            <span
              className="font-mono text-[12px] text-[#2C2C2C]"
              style={{ fontWeight: 600 }}
            >
              {vendor.weddingsHere}
            </span>{" "}
            wedding{vendor.weddingsHere !== 1 ? "s" : ""} here
          </span>
          <Divider />
          <span>Last: {vendor.lastWeddingLabel}</span>
          <Divider />
          <span className="font-mono text-[12px] text-[#2C2C2C]">
            {vendor.priceRange}
          </span>
        </div>

        {vendor.preferred && vendor.venueNote && (
          <p
            className="mt-2.5 rounded-lg px-3 py-2 text-[12px] italic leading-snug text-[#5a4220]"
            style={{
              backgroundColor: "#FBF1DF",
              fontFamily: "'EB Garamond', serif",
            }}
          >
            <span aria-hidden className="mr-1.5 not-italic text-[#9E8245]">
              ❝
            </span>
            {vendor.venueNote}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`/vendors/${vendor.id}`}
          className="rounded-full border px-3.5 py-1.5 text-[11.5px] font-medium text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
          style={{ borderColor: "rgba(196,162,101,0.45)" }}
        >
          View Profile
        </a>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCouplePickerOpen((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium transition-colors"
            style={{
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            Recommend to Couple
            <span aria-hidden className="text-[9px]">
              ▾
            </span>
          </button>
          {couplePickerOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-2 w-[260px] overflow-hidden rounded-xl border bg-white py-1 text-[12.5px] shadow-lg"
              style={{ borderColor: VENUE_PALETTE.hairline }}
            >
              <p className="px-3 pt-2 pb-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                Active couples
              </p>
              {ACTIVE_COUPLES_AT_VENUE.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCouplePickerOpen(false)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[#2C2C2C] hover:bg-[#FBF1DF]"
                >
                  <span>{c.label}</span>
                  <span aria-hidden className="text-[#9E8245]">
                    →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          className="rounded-full border px-3.5 py-1.5 text-[11.5px] font-medium text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
          style={{ borderColor: "rgba(196,162,101,0.45)" }}
        >
          Message
        </button>
        <button
          type="button"
          onClick={onTogglePreferred}
          aria-pressed={vendor.preferred}
          title={vendor.preferred ? "Remove preferred status" : "Mark as preferred"}
          className="grid h-8 w-8 place-items-center rounded-full transition-colors"
          style={{
            backgroundColor: vendor.preferred ? VENUE_PALETTE.gold : "transparent",
            color: vendor.preferred ? "#FFFFFF" : "#9E8245",
            boxShadow: vendor.preferred
              ? "inset 0 0 0 1px rgba(196,162,101,0.45)"
              : "inset 0 0 0 1px rgba(196,162,101,0.30)",
          }}
        >
          <span aria-hidden className="text-[12px]">
            ★
          </span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Planners --------------------------------- */

function PlannersSection({ planners }: { planners: VenuePlanner[] }) {
  return (
    <section>
      <SectionHeader
        title={`Planners Who Know ${VENUE.name}`}
        eyebrow="Recurring planner partners"
      />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {planners.map((p) => (
          <PlannerCard key={p.id} planner={p} />
        ))}
      </div>
    </section>
  );
}

function PlannerCard({ planner }: { planner: VenuePlanner }) {
  return (
    <VenueCard className="overflow-hidden">
      <div className="flex items-center gap-4 p-5">
        <div
          className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-xl text-[16px] font-semibold text-[#5a4220]"
          style={{
            backgroundColor: planner.tint,
            boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.25)",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          {planner.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4
              className="text-[18px] leading-tight text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              {planner.name}
              {planner.lead && (
                <span className="ml-2 text-[12.5px] italic text-[#8a7a5a]">
                  ({planner.lead.split(" ")[0]})
                </span>
              )}
            </h4>
            <span
              className="font-mono text-[12px] text-[#2C2C2C]"
              style={{ fontWeight: 600 }}
            >
              {planner.weddingsHere} here
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[#5a5a5a]">
            <span className="inline-flex items-baseline gap-1">
              <span aria-hidden className="text-[#C4A265]">
                ★
              </span>
              <span className="font-mono text-[12px] text-[#2C2C2C]">
                {planner.rating.toFixed(1)}
              </span>
            </span>
            <Divider />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E8245]">
              {planner.city}
            </span>
            <Divider />
            <span>{planner.services}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <a
              href={`/vendors/${planner.id}`}
              className="rounded-full border px-3.5 py-1.5 text-[11.5px] font-medium text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
              style={{ borderColor: "rgba(196,162,101,0.45)" }}
            >
              View Profile
            </a>
            <button
              type="button"
              className="rounded-full border px-3.5 py-1.5 text-[11.5px] font-medium text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
              style={{ borderColor: "rgba(196,162,101,0.45)" }}
            >
              Message
            </button>
          </div>
        </div>
      </div>
    </VenueCard>
  );
}

/* ------------------------------ Invite Vendor ----------------------------- */

function InviteVendorCta() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <VenueCard className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9E8245]">
            Grow your network
          </p>
          <h3
            className="mt-1 text-[22px] leading-tight text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            Invite a Vendor to Partner
          </h3>
          <p
            className="mt-1 text-[13px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Add trusted vendors you already work with to your venue's Ananya network.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors"
          style={{
            backgroundColor: VENUE_PALETTE.charcoal,
            color: "#FAF8F5",
          }}
        >
          <span aria-hidden className="text-[14px]">
            +
          </span>
          Invite a Vendor
        </button>
      </div>
      {open && (
        <div
          className="border-t px-6 py-5"
          style={{
            borderColor: VENUE_PALETTE.hairline,
            backgroundColor: "#FFFDF9",
          }}
        >
          <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
            Ananya handle, Instagram, or email
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="@vendor_handle  ·  vendor@email.com"
              className="flex-1 rounded-full border bg-white px-4 py-2.5 text-[13px] text-[#2C2C2C] placeholder:text-[#8a8a8a] focus:outline-none"
              style={{ borderColor: VENUE_PALETTE.hairline }}
            />
            <button
              type="button"
              disabled={!query.trim()}
              className="rounded-full px-4 py-2.5 text-[12.5px] font-medium transition-colors disabled:opacity-40"
              style={{
                backgroundColor: VENUE_PALETTE.gold,
                color: "#FFFFFF",
              }}
            >
              Send invitation
            </button>
          </div>
          <p className="mt-3 text-[12px] italic text-[#6a6a6a]">
            {VENUE.name} would like to add you to their venue vendor network on Ananya —
            the vendor will receive this invite in their portal inbox.
          </p>
        </div>
      )}
    </VenueCard>
  );
}

/* ---------------------- Manage Preferred Side Panel ----------------------- */

function ManagePreferredPanel({
  vendors,
  onClose,
  onToggle,
}: {
  vendors: VenueVendor[];
  onClose: () => void;
  onToggle: (v: VenueVendor) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      style={{ backgroundColor: "rgba(44,44,44,0.30)" }}
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[520px] flex-col overflow-hidden"
        style={{ backgroundColor: "#FAF8F5" }}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: VENUE_PALETTE.hairline }}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9E8245]">
              Preferred vendor program
            </p>
            <h3
              className="mt-1 text-[22px] leading-tight text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              Manage preferred vendors
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-[16px] text-[#5a5a5a] hover:bg-[#F5E6D0]"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {VENDOR_CATEGORIES.map((cat) => {
            const categoryVendors = vendors.filter((v) => v.categoryId === cat.id);
            if (categoryVendors.length === 0) return null;
            const currentPreferred = categoryVendors.filter((v) => v.preferred).length;
            return (
              <div key={cat.id} className="mb-6">
                <div className="mb-2 flex items-baseline justify-between">
                  <h4
                    className="text-[15px] text-[#2C2C2C]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                    }}
                  >
                    <span className="mr-1.5">{cat.icon}</span>
                    {cat.label}
                  </h4>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                    {currentPreferred}
                    {cat.maxPreferred ? ` / ${cat.maxPreferred} max` : ""}
                  </span>
                </div>
                <ul className="space-y-1">
                  {categoryVendors.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{
                        backgroundColor: v.preferred ? "#FDFAF1" : "#FFFFFF",
                        boxShadow: v.preferred
                          ? "inset 0 0 0 1px rgba(196,162,101,0.35)"
                          : "inset 0 0 0 1px rgba(44,44,44,0.05)",
                      }}
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] text-[#2C2C2C]">{v.name}</p>
                        <p className="font-mono text-[10.5px] text-[#8a8a8a]">
                          {v.weddingsHere} wedding{v.weddingsHere !== 1 ? "s" : ""} ·
                          ★ {v.rating.toFixed(1)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggle(v)}
                        aria-pressed={v.preferred}
                        className="inline-flex h-[26px] w-[46px] items-center rounded-full transition-colors"
                        style={{
                          backgroundColor: v.preferred
                            ? VENUE_PALETTE.gold
                            : "rgba(44,44,44,0.12)",
                          padding: 2,
                        }}
                      >
                        <span
                          aria-hidden
                          className="block h-[20px] w-[20px] rounded-full bg-white transition-transform"
                          style={{
                            transform: v.preferred
                              ? "translateX(20px)"
                              : "translateX(0)",
                          }}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
