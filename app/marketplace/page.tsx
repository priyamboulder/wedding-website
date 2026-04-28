"use client";

// ── Marketplace landing ────────────────────────────────────────
// Public discovery surface. Couples search, filter, and browse a
// curated grid of vendors read from the unified vendors-store.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/marketing/SiteLayout";
import { CATEGORIES } from "@/lib/marketing/data";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import {
  formatPriceShort,
  priceDisplayHighEnd,
} from "@/lib/vendors/price-display";
import { useVendorsStore } from "@/stores/vendors-store";
import type { Vendor, VendorTravelLevel } from "@/types/vendor";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

// Map marketing category slug → unified VendorCategory id.
const MARKETING_SLUG_TO_CATEGORY: Record<string, string> = {
  "decor-design": "decor_florals",
  "catering-dining": "catering",
  photography: "photography",
  "hair-makeup": "hmua",
  entertainment: "entertainment",
  stationery: "stationery",
  "priests-pandits": "pandit_ceremony",
};

const CATEGORY_PILL_LABEL: Record<string, string> = {
  "decor-design": "Decor",
  "catering-dining": "Catering",
  photography: "Photography",
  "mehndi-henna": "Mehndi",
  "priests-pandits": "Officiants",
  "hair-makeup": "HMUA",
  entertainment: "Entertainment",
  stationery: "Stationery",
  transportation: "Transportation",
};

type PriceBand = "mid" | "premium" | "luxe";

const PRICE_BAND_LABEL: Record<PriceBand, string> = {
  mid: "$$",
  premium: "$$$",
  luxe: "$$$$",
};

const PRICE_BAND_CEILING: Record<PriceBand, number> = {
  mid: 15_00_000,
  premium: 40_00_000,
  luxe: Number.POSITIVE_INFINITY,
};

const TRAVEL_LABEL: Record<VendorTravelLevel, string> = {
  local: "Local",
  regional: "Regional",
  nationwide: "Nationwide",
  destination: "Destination",
  worldwide: "Worldwide",
};

const TRAVEL_OPTIONS: VendorTravelLevel[] = [
  "local",
  "regional",
  "nationwide",
  "destination",
  "worldwide",
];

const PAGE_SIZE = 9;

function priceBandFor(v: Vendor): PriceBand {
  const high = v.price_display ? (priceDisplayHighEnd(v.price_display) ?? 0) : 0;
  if (high <= PRICE_BAND_CEILING.mid) return "mid";
  if (high <= PRICE_BAND_CEILING.premium) return "premium";
  return "luxe";
}

export default function MarketplacePage() {
  return (
    <SiteLayout>
      <Suspense fallback={null}>
        <MarketplaceInner />
      </Suspense>
    </SiteLayout>
  );
}

function MarketplaceInner() {
  const params = useSearchParams();
  const initialCategory = params.get("category") ?? "all";
  const vendors = useVendorsStore((s) => s.vendors);
  const initFromAPI = useVendorsStore((s) => s.initFromAPI);

  const [category, setCategory] = useState<string>(initialCategory);
  const [query, setQuery] = useState("");
  const [priceBands, setPriceBands] = useState<Set<PriceBand>>(new Set());
  const [travel, setTravel] = useState<VendorTravelLevel | "any">("any");

  const [visible, setVisible] = useState(PAGE_SIZE);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Load vendors for all visitors (including unauthenticated).
  useEffect(() => {
    if (vendors.length === 0) initFromAPI();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [category, query, priceBands, travel]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors.filter((v) => {
      if (category !== "all") {
        const mapped = MARKETING_SLUG_TO_CATEGORY[category];
        if (mapped && v.category !== mapped) return false;
        if (!mapped) return false;
      }
      if (priceBands.size > 0 && !priceBands.has(priceBandFor(v))) return false;
      if (travel !== "any" && v.travel_level !== travel) return false;
      if (!q) return true;
      const hay = [
        v.name,
        v.bio,
        v.tagline,
        v.style_tags.join(" "),
        v.location,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [vendors, category, query, priceBands, travel]);

  const visibleVendors = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  const togglePrice = (p: PriceBand) => {
    setPriceBands((cur) => {
      const next = new Set(cur);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const anyFilterActive =
    category !== "all" ||
    query.trim().length > 0 ||
    priceBands.size > 0 ||
    travel !== "any";

  const activeFilterCount =
    priceBands.size + (travel !== "any" ? 1 : 0);

  const resetAll = () => {
    setCategory("all");
    setQuery("");
    setPriceBands(new Set());
    setTravel("any");
  };

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-6 pb-10 pt-6 md:px-12 md:pb-14 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-[11px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
          >
            The Marketplace
          </span>
          <h1
            className="mt-5 max-w-[900px] text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(36px, 5.5vw, 80px)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            The vendors
            <br />
            <span style={{ fontStyle: "italic" }}>we&apos;d choose ourselves.</span>
          </h1>
          <p
            className="mt-8 max-w-[560px] text-[#5E544B]"
            style={{ fontFamily: BODY, fontSize: 16.5, lineHeight: 1.7 }}
          >
            Every vendor on Ananya is personally vetted. Browse freely, save
            favorites, send an inquiry when you&apos;re ready.
          </p>
        </motion.div>

        <div className="mt-10 max-w-[640px]">
          <SearchInput value={query} onChange={setQuery} />
        </div>
      </section>

      <section className="sticky top-[64px] z-30 border-y border-[#1C1917]/10 bg-[#F7F5F0]/90 backdrop-blur md:top-[72px]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-6 md:px-12">
          <div className="workspace-event-chip-scroll flex flex-1 items-center gap-2 overflow-x-auto py-4 md:py-5">
            <FilterChip
              label="All"
              slug="all"
              active={category === "all"}
              onClick={setCategory}
              count={vendors.length}
            />
            {CATEGORIES.map((cat) => {
              const mapped = MARKETING_SLUG_TO_CATEGORY[cat.slug];
              const count = mapped
                ? vendors.filter((v) => v.category === mapped).length
                : 0;
              return (
                <FilterChip
                  key={cat.slug}
                  label={CATEGORY_PILL_LABEL[cat.slug] ?? cat.name}
                  slug={cat.slug}
                  active={category === cat.slug}
                  onClick={setCategory}
                  count={count}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="shrink-0 rounded-full border border-[#1C1917]/20 bg-white px-4 py-2 text-[12px] tracking-[0.04em] text-[#1C1917] transition-colors hover:border-[#1C1917]/40 lg:hidden"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-10 md:px-12 md:pb-32 md:pt-14">
        <div
          className={
            sidebarCollapsed
              ? "grid grid-cols-1 gap-8 lg:grid-cols-[56px_1fr] lg:gap-10"
              : "grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:gap-12"
          }
        >
          <aside className="hidden lg:block">
            <div className="sticky top-[160px]">
              {sidebarCollapsed ? (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  aria-label="Show filters"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1C1917]/15 bg-white text-[#1C1917] transition-colors hover:border-[#1C1917]/35"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 6h18M6 12h12M9 18h6" />
                  </svg>
                </button>
              ) : (
                <FilterPanel
                  priceBands={priceBands}
                  onPrice={togglePrice}
                  travel={travel}
                  onTravel={setTravel}
                  onCollapse={() => setSidebarCollapsed(true)}
                  onReset={resetAll}
                  anyActive={anyFilterActive}
                />
              )}
            </div>
          </aside>

          <div>
            <ResultHeader count={filtered.length} category={category} />
            {filtered.length === 0 ? (
              <EmptyState onReset={resetAll} />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleVendors.map((v, i) => (
                    <motion.div
                      key={v.slug ?? v.id ?? i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: (i % PAGE_SIZE) * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <MarketplaceCard vendor={v} />
                    </motion.div>
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-16 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="inline-flex items-center gap-3 border border-[#1C1917]/25 bg-transparent px-8 py-3.5 text-[12.5px] tracking-[0.08em] text-[#1C1917] transition-colors hover:border-[#1C1917] hover:bg-[#1C1917] hover:text-[#F7F5F0]"
                      style={{ fontFamily: BODY, fontWeight: 500 }}
                    >
                      Load more vendors
                      <span className="text-[11px] text-[#A8998A]">
                        {filtered.length - visible} remaining
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {sheetOpen && (
          <MobileFilterSheet onClose={() => setSheetOpen(false)}>
            <FilterPanel
              priceBands={priceBands}
              onPrice={togglePrice}
              travel={travel}
              onTravel={setTravel}
              onReset={resetAll}
              anyActive={anyFilterActive}
              compact
            />
          </MobileFilterSheet>
        )}
      </AnimatePresence>
    </>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex items-center">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="pointer-events-none absolute left-5 text-[#A8998A]"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search vendors, categories, or styles..."
        className="w-full border border-[#1C1917]/15 bg-white py-4 pl-12 pr-5 text-[14.5px] text-[#1C1917] placeholder:text-[#A8998A] transition-colors focus:border-[#1C1917]/60 focus:outline-none"
        style={{ fontFamily: BODY, letterSpacing: "0.01em" }}
        aria-label="Search vendors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-5 text-[11px] uppercase tracking-[0.14em] text-[#A8998A] transition-colors hover:text-[#B8755D]"
          style={{ fontFamily: BODY }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

function FilterChip({
  label,
  slug,
  active,
  onClick,
  count,
}: {
  label: string;
  slug: string;
  active: boolean;
  onClick: (s: string) => void;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(slug)}
      className="group shrink-0 rounded-full border px-4 py-2 transition-colors"
      style={{
        fontFamily: BODY,
        fontSize: 13,
        letterSpacing: "0.04em",
        borderColor: active ? "#1C1917" : "rgba(28,25,23,0.15)",
        backgroundColor: active ? "#1C1917" : "transparent",
        color: active ? "#F7F5F0" : "#1C1917",
      }}
      aria-pressed={active}
    >
      {label}
      <span
        className="ml-2 text-[11px]"
        style={{ opacity: active ? 0.65 : 0.45 }}
      >
        {count}
      </span>
    </button>
  );
}

function FilterPanel({
  priceBands,
  onPrice,
  travel,
  onTravel,
  onCollapse,
  onReset,
  anyActive,
  compact = false,
}: {
  priceBands: Set<PriceBand>;
  onPrice: (p: PriceBand) => void;
  travel: VendorTravelLevel | "any";
  onTravel: (v: VendorTravelLevel | "any") => void;
  onCollapse?: () => void;
  onReset: () => void;
  anyActive: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-col gap-7"
          : "flex flex-col gap-8 border border-[#1C1917]/10 bg-white/50 p-6"
      }
    >
      {!compact && (
        <div className="flex items-baseline justify-between">
          <span
            className="text-[10px] uppercase text-[#1C1917]"
            style={{ fontFamily: BODY, letterSpacing: "0.28em", fontWeight: 500 }}
          >
            Refine
          </span>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="text-[10.5px] uppercase tracking-[0.18em] text-[#A8998A] transition-colors hover:text-[#1C1917]"
              style={{ fontFamily: BODY }}
            >
              Hide
            </button>
          )}
        </div>
      )}

      <FilterGroup label="Price Range">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRICE_BAND_LABEL) as PriceBand[]).map((p) => {
            const active = priceBands.has(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPrice(p)}
                className="rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors"
                style={{
                  fontFamily: BODY,
                  letterSpacing: "0.04em",
                  borderColor: active ? "#1C1917" : "rgba(28,25,23,0.15)",
                  backgroundColor: active ? "#1C1917" : "transparent",
                  color: active ? "#F7F5F0" : "#1C1917",
                }}
                aria-pressed={active}
              >
                {PRICE_BAND_LABEL[p]}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label="Travel">
        <select
          value={travel}
          onChange={(e) => onTravel(e.target.value as VendorTravelLevel | "any")}
          className="w-full border border-[#1C1917]/15 bg-white px-3 py-2.5 text-[13px] text-[#1C1917] transition-colors focus:border-[#1C1917]/60 focus:outline-none"
          style={{ fontFamily: BODY }}
        >
          <option value="any">Any</option>
          {TRAVEL_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {TRAVEL_LABEL[t]}
            </option>
          ))}
        </select>
      </FilterGroup>

      {anyActive && (
        <button
          type="button"
          onClick={onReset}
          className="self-start text-[11px] uppercase tracking-[0.18em] text-[#B8755D] transition-colors hover:text-[#1C1917]"
          style={{ fontFamily: BODY, fontWeight: 500 }}
        >
          Reset filters
        </button>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span
        className="mb-3 block text-[10.5px] uppercase text-[#1C1917]"
        style={{ fontFamily: BODY, letterSpacing: "0.22em", fontWeight: 500 }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function ResultHeader({
  count,
  category,
}: {
  count: number;
  category: string;
}) {
  const categoryLabel =
    category === "all"
      ? null
      : CATEGORY_PILL_LABEL[category] ??
        CATEGORIES.find((c) => c.slug === category)?.name ??
        null;

  return (
    <header className="mb-10 flex flex-wrap items-baseline justify-between gap-3 border-b border-[#1C1917]/10 pb-4">
      <p
        className="text-[14px] text-[#1C1917]"
        style={{ fontFamily: BODY, letterSpacing: "0.01em" }}
      >
        Showing{" "}
        <span style={{ fontFamily: DISPLAY, fontSize: 20, fontStyle: "italic" }}>
          {count}
        </span>{" "}
        curated {count === 1 ? "vendor" : "vendors"}
        {categoryLabel ? ` in ${categoryLabel}` : ""}.
      </p>
      <p
        className="text-[10.5px] uppercase text-[#A8998A]"
        style={{ fontFamily: BODY, letterSpacing: "0.22em" }}
      >
        Ananya Curated
      </p>
    </header>
  );
}

function MarketplaceCard({ vendor }: { vendor: Vendor }) {
  const priceLabel = vendor.price_display ? formatPriceShort(vendor.price_display) : "";
  return (
    <Link href={`/marketplace/${vendor.slug}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#9C6F5D]">
        {vendor.cover_image && (
          <img
            src={vendor.cover_image}
            alt={vendor.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            loading="lazy"
          />
        )}
        <div className="absolute left-4 top-4">
          <span
            className="inline-flex items-center gap-2 bg-[#F7F5F0]/90 px-3 py-1.5 text-[9px] uppercase text-[#1C1917]"
            style={{ fontFamily: BODY, letterSpacing: "0.22em", fontWeight: 500 }}
          >
            <span className="h-[3px] w-[3px] rotate-45 bg-[#B8755D]" />
            {CATEGORY_LABELS[vendor.category]}
          </span>
        </div>
        <div
          className="absolute bottom-4 left-4 text-[11px] uppercase text-white/90"
          style={{ fontFamily: BODY, letterSpacing: "0.26em", opacity: 0.85 }}
        >
          {priceLabel}
        </div>
      </div>
      <div className="mt-5">
        <div className="flex items-start justify-between gap-3">
          <h4
            className="text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: 22,
              lineHeight: 1.15,
              letterSpacing: "-0.005em",
              fontWeight: 500,
            }}
          >
            {vendor.name}
          </h4>
          {vendor.rating != null && (
            <div
              className="flex shrink-0 items-center gap-1.5 text-[#1C1917]"
              style={{ fontFamily: BODY }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#B8755D" aria-hidden>
                <path d="M12 2l2.76 6.36L22 9.3l-5.4 4.86L18.12 22 12 18.3 5.88 22l1.52-7.84L2 9.3l7.24-.94L12 2z" />
              </svg>
              <span className="text-[12.5px] font-medium">
                {vendor.rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-[#A8998A]">
                ({vendor.review_count})
              </span>
            </div>
          )}
        </div>
        <p
          className="mt-1.5 text-[#A8998A]"
          style={{ fontFamily: BODY, fontSize: 12.5, letterSpacing: "0.04em" }}
        >
          {CATEGORY_LABELS[vendor.category]} · {vendor.location}
        </p>
        {vendor.tagline && (
          <p
            className="mt-3 text-[#1C1917]/75"
            style={{
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.4,
            }}
          >
            {vendor.tagline}
          </p>
        )}
      </div>
      <span
        className="mt-4 inline-block text-[12px] tracking-[0.04em] text-[#1C1917] transition-colors group-hover:text-[#B8755D]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        View Profile →
      </span>
    </Link>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto max-w-[520px] py-24 text-center">
      <p
        className="text-[#A8998A]"
        style={{
          fontFamily: DISPLAY,
          fontStyle: "italic",
          fontSize: 22,
          lineHeight: 1.5,
        }}
      >
        No vendors match this combination of filters. Widen the search —
        we&apos;re always vetting new studios.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 border border-[#1C1917]/25 px-6 py-3 text-[12px] tracking-[0.08em] text-[#1C1917] transition-colors hover:border-[#1C1917] hover:bg-[#1C1917] hover:text-[#F7F5F0]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        Reset filters
      </button>
    </div>
  );
}

function MobileFilterSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#1C1917]/40"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto border-t border-[#1C1917]/10 bg-[#F7F5F0] p-6 pb-10"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#1C1917]/20" />
        <div className="mb-6 flex items-center justify-between">
          <span
            className="text-[11px] uppercase text-[#1C1917]"
            style={{
              fontFamily: BODY,
              letterSpacing: "0.28em",
              fontWeight: 500,
            }}
          >
            Refine
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="text-[11px] uppercase tracking-[0.18em] text-[#A8998A] transition-colors hover:text-[#1C1917]"
            style={{ fontFamily: BODY }}
          >
            Done
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
