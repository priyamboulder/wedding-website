"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Search,
  ShoppingCart,
  ChevronDown,
  Clock,
  Check,
  Sparkles,
  Store,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  StockStatus,
  StoreCategory,
  StoreProduct,
  StoreVariant,
} from "@/lib/link-preview/types";
import type { ChecklistItem, Phase } from "@/types/checklist";
import {
  STOCK_LABEL,
  STORE_CATEGORY_LABEL,
  STORE_PRODUCTS,
  STORE_VENDORS,
  getStoreVendor,
  leadTimeWithVariant,
  priceWithVariant,
  stockWithVariant,
} from "@/lib/store-seed";
import { useShoppingLinks } from "@/contexts/ShoppingLinksContext";
import {
  PriceTierChips,
  priceInSelectedTiers,
  type PriceTierKey,
} from "./PriceTierChips";
import Link from "next/link";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import {
  findCrossTabMatches,
  unifiedFromStore,
} from "@/lib/shopping/cross-tab-matches";
import { formatPrice as formatMarketplacePrice } from "@/lib/marketplace/utils";
import type { MarketplaceListing } from "@/types/marketplace";
import { ExhibitionFeaturedBadge } from "@/components/exhibitions/ExhibitionFeaturedBadge";

type SortKey = "featured" | "new" | "price_asc" | "price_desc" | "popularity" | "lead_time";

const STOCK_PILL: Record<StockStatus, string> = {
  in_stock: "bg-sage/90 text-ink",
  low_stock: "bg-saffron text-ink",
  made_to_order: "bg-ink/90 text-ivory",
  sold_out: "bg-rose/80 text-ivory",
};

const PANEL_EASE = [0.32, 0.72, 0, 1] as const;

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

interface CatalogFilters {
  query: string;
  categories: StoreCategory[];
  vendors: string[];
  availability: StockStatus[];
  minPrice: number | null;
  maxPrice: number | null;
  regions: string[];
  colors: string[];
  materials: string[];
}

const EMPTY_CATALOG_FILTERS: CatalogFilters = {
  query: "",
  categories: [],
  vendors: [],
  availability: [],
  minPrice: null,
  maxPrice: null,
  regions: [],
  colors: [],
  materials: [],
};

export function CatalogBrowser({
  phases,
  items,
  onVendorClick,
  onClose,
  weddingId,
}: {
  phases: Phase[];
  items: ChecklistItem[];
  onVendorClick: (vendorId: string) => void;
  onClose?: () => void;
  weddingId?: string;
}) {
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_CATALOG_FILTERS);
  const [priceTiers, setPriceTiers] = useState<Set<PriceTierKey>>(new Set());
  const [sort, setSort] = useState<SortKey>("featured");
  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  const togglePriceTier = (key: PriceTierKey) => {
    setPriceTiers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (detailProductId) setDetailProductId(null);
      else if (onClose) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detailProductId, onClose]);

  const filtered = useMemo(
    () =>
      filterCatalog(STORE_PRODUCTS, filters).filter((p) =>
        priceInSelectedTiers(p.basePrice, priceTiers),
      ),
    [filters, priceTiers],
  );
  const sorted = useMemo(() => sortCatalog(filtered, sort), [filtered, sort]);

  const regions = useMemo(
    () => Array.from(new Set(STORE_PRODUCTS.map((p) => p.region))).sort(),
    [],
  );
  const colors = useMemo(
    () => Array.from(new Set(STORE_PRODUCTS.map((p) => p.color))).sort(),
    [],
  );
  const materials = useMemo(
    () => Array.from(new Set(STORE_PRODUCTS.map((p) => p.material))).sort(),
    [],
  );

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <CatalogFilterRail
        filters={filters}
        onChange={setFilters}
        regions={regions}
        colors={colors}
        materials={materials}
      />

      <div className="flex flex-1 flex-col overflow-hidden bg-ivory">
        <CatalogHeader
          query={filters.query}
          onQuery={(q) => setFilters({ ...filters, query: q })}
          sort={sort}
          onSort={setSort}
          resultCount={sorted.length}
          onClose={onClose}
        />

        <div className="border-b border-gold/10 bg-white px-6 py-2.5">
          <PriceTierChips selected={priceTiers} onToggle={togglePriceTier} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {sorted.length === 0 ? (
            <CatalogEmptyState
              onClear={() => setFilters(EMPTY_CATALOG_FILTERS)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sorted.map((p) => (
                <CatalogProductCard
                  key={p.id}
                  product={p}
                  onOpen={() => setDetailProductId(p.id)}
                  onVendorClick={() => onVendorClick(p.vendorId)}
                  phases={phases}
                  items={items}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductDetailDrawer
        productId={detailProductId}
        onClose={() => setDetailProductId(null)}
        phases={phases}
        items={items}
        onVendorClick={onVendorClick}
        weddingId={weddingId}
      />
    </div>
  );
}

export function CatalogModal({
  open,
  onClose,
  phases,
  items,
  onVendorClick,
}: {
  open: boolean;
  onClose: () => void;
  phases: Phase[];
  items: ChecklistItem[];
  onVendorClick: (vendorId: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="catalog-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
          onClick={onClose}
        >
          <motion.div
            key="catalog-frame"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: PANEL_EASE }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-4 flex overflow-hidden rounded-2xl border border-gold/20 bg-ivory-warm/95 shadow-[0_24px_80px_rgba(26,26,26,0.25)]"
          >
            <CatalogBrowser
              phases={phases}
              items={items}
              onVendorClick={onVendorClick}
              onClose={onClose}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Filter rail (inside catalog) ──────────────────────────────────────────

function CatalogFilterRail({
  filters,
  onChange,
  regions,
  colors,
  materials,
}: {
  filters: CatalogFilters;
  onChange: (f: CatalogFilters) => void;
  regions: string[];
  colors: string[];
  materials: string[];
}) {
  function toggle<K extends keyof CatalogFilters>(key: K, value: string) {
    const current = filters[key] as unknown as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next } as CatalogFilters);
  }

  return (
    <aside className="sidebar-scroll hidden w-72 shrink-0 overflow-y-auto border-r border-gold/15 bg-ivory-warm/60 px-5 py-5 lg:block">
      <div className="pb-4">
        <h2 className="font-serif text-[18px] text-ink">Ananya Catalog</h2>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Curated native marketplace
        </p>
      </div>

      <Section title="Category" defaultOpen>
        {(Object.keys(STORE_CATEGORY_LABEL) as StoreCategory[]).map((c) => (
          <Row
            key={c}
            label={STORE_CATEGORY_LABEL[c]}
            checked={filters.categories.includes(c)}
            onToggle={() => toggle("categories", c)}
          />
        ))}
      </Section>

      <Section title="Availability" defaultOpen>
        {(Object.keys(STOCK_LABEL) as StockStatus[]).map((s) => (
          <Row
            key={s}
            label={STOCK_LABEL[s]}
            checked={filters.availability.includes(s)}
            onToggle={() => toggle("availability", s)}
          />
        ))}
      </Section>

      <Section title="Vendor / Artisan" defaultOpen>
        {STORE_VENDORS.map((v) => (
          <Row
            key={v.id}
            label={v.name}
            checked={filters.vendors.includes(v.id)}
            onToggle={() => toggle("vendors", v.id)}
          />
        ))}
      </Section>

      <Section title="Price (USD)">
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                minPrice: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full rounded-md border border-border bg-white px-2 py-1 font-mono text-[11px] outline-none focus:border-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <span className="text-ink-faint">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full rounded-md border border-border bg-white px-2 py-1 font-mono text-[11px] outline-none focus:border-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>
      </Section>

      <Section title="Region / Origin">
        {regions.map((r) => (
          <Row
            key={r}
            label={r}
            checked={filters.regions.includes(r)}
            onToggle={() => toggle("regions", r)}
          />
        ))}
      </Section>

      <Section title="Color">
        {colors.map((c) => (
          <Row
            key={c}
            label={c}
            checked={filters.colors.includes(c)}
            onToggle={() => toggle("colors", c)}
          />
        ))}
      </Section>

      <Section title="Material">
        {materials.map((m) => (
          <Row
            key={m}
            label={m}
            checked={filters.materials.includes(m)}
            onToggle={() => toggle("materials", m)}
          />
        ))}
      </Section>
    </aside>
  );
}

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border-b border-gold/10 py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-1 text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {title}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={1.8}
          className={cn(
            "text-ink-faint transition-transform",
            !open && "-rotate-90",
          )}
        />
      </button>
      {open && <div className="mt-2 flex flex-col gap-1">{children}</div>}
    </div>
  );
}

function Row({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[12px] transition-colors",
        checked ? "bg-gold-pale/30" : "hover:bg-white/70",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-3 w-3 shrink-0 accent-saffron"
      />
      <span className="truncate text-ink-soft">{label}</span>
    </label>
  );
}

// ── Header bar ────────────────────────────────────────────────────────────

function CatalogHeader({
  query,
  onQuery,
  sort,
  onSort,
  resultCount,
  onClose,
}: {
  query: string;
  onQuery: (q: string) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  resultCount: number;
  onClose?: () => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-gold/15 bg-white px-6 py-3">
      <div className="relative flex-1 max-w-md">
        <Search
          size={13}
          strokeWidth={1.6}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search titles, vendors, tags, materials…"
          className="w-full rounded-md border border-border bg-white py-1.5 pl-8 pr-3 text-[12.5px] text-ink outline-none focus:border-gold"
        />
      </div>
      <span
        className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {resultCount} {resultCount === 1 ? "product" : "products"}
      </span>

      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-ink-faint">
          Sort
        </span>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className="rounded-md border border-border bg-white py-1 pl-2 pr-6 text-[11.5px] text-ink outline-none focus:border-gold"
        >
          <option value="featured">Featured</option>
          <option value="new">New Arrivals</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="popularity">Popularity</option>
          <option value="lead_time">Lead Time</option>
        </select>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close catalog"
          className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink"
        >
          <X size={16} strokeWidth={1.6} />
        </button>
      )}
    </div>
  );
}

// ── Product card (catalog grid) ───────────────────────────────────────────

function CatalogProductCard({
  product,
  onOpen,
  onVendorClick,
  phases,
  items,
}: {
  product: StoreProduct;
  onOpen: () => void;
  onVendorClick: () => void;
  phases: Phase[];
  items: ChecklistItem[];
}) {
  const { addStoreItem } = useShoppingLinks();
  const vendor = getStoreVendor(product.vendorId);
  const [variantId, setVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );
  const [added, setAdded] = useState(false);
  const price = priceWithVariant(product, variantId);
  const stock = stockWithVariant(product, variantId);
  const leadDays = leadTimeWithVariant(product, variantId);

  function quickAdd() {
    const firstPhase = phases[0]?.id ?? null;
    addStoreItem({
      productId: product.id,
      variantId,
      quantity: 1,
      module: firstPhase,
      taskId: null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  const leadWeeks = Math.round(leadDays / 7);

  return (
    <div
      onClick={onOpen}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[14px] border border-border bg-white transition-all hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-[0_6px_18px_rgba(26,26,26,0.08)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-warm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.heroImage}
          alt={product.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider",
            STOCK_PILL[stock],
          )}
        >
          {stockBadgeLabel(stock, product.stockCount, leadDays)}
        </span>
        {product.isNewArrival && (
          <span className="absolute right-2 top-2 rounded-full bg-saffron px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-ink">
            New
          </span>
        )}
        <div
          className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onOpen}
            className="rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-medium text-ink shadow-sm ring-1 ring-border hover:bg-gold-pale/60"
          >
            View Details
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 font-serif text-[14px] leading-snug text-ink">
          {product.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVendorClick();
          }}
          className="flex items-center gap-1.5 text-left"
        >
          <Sparkles size={10} strokeWidth={1.8} className="shrink-0 text-saffron" />
          <span className="truncate font-mono text-[10px] text-ink-muted hover:text-gold">
            {vendor?.name ?? "Ananya"}
          </span>
        </button>

        <div className="flex items-baseline justify-between gap-2">
          <span
            className="font-mono text-[13px] font-semibold text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {money(price, product.currency)}
          </span>
          {stock === "made_to_order" && (
            <span
              className="inline-flex items-center gap-0.5 rounded-sm bg-ivory-warm px-1 py-[1px] font-mono text-[9px] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Clock size={8} strokeWidth={1.8} />
              {leadWeeks}w lead
            </span>
          )}
        </div>

        {product.variants.length > 0 && (
          <select
            value={variantId ?? ""}
            onChange={(e) => setVariantId(e.target.value || null)}
            onClick={(e) => e.stopPropagation()}
            className="rounded-md border border-border bg-ivory-warm/40 px-2 py-1 font-mono text-[10.5px] text-ink outline-none focus:border-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.attribute}: {v.label}
              </option>
            ))}
          </select>
        )}

        <ExhibitionFeaturedBadge productId={product.id} variant="compact" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            quickAdd();
          }}
          disabled={stock === "sold_out"}
          className={cn(
            "mt-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            added
              ? "bg-sage text-ink"
              : "bg-ink text-ivory hover:bg-ink/90",
          )}
        >
          {added ? (
            <>
              <Check size={11} strokeWidth={2} />
              Added
            </>
          ) : (
            <>
              <ShoppingCart size={11} strokeWidth={1.8} />
              Quick Add
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function stockBadgeLabel(
  stock: StockStatus,
  stockCount: number | null,
  leadDays: number,
): string {
  if (stock === "low_stock" && stockCount != null) {
    return `LOW · ${stockCount} LEFT`;
  }
  if (stock === "made_to_order") {
    const weeks = Math.round(leadDays / 7);
    return `MADE TO ORDER · ${weeks}W`;
  }
  if (stock === "sold_out") return "SOLD OUT";
  return "IN STOCK";
}

// ── Product detail drawer (slides in within the modal) ────────────────────

function ProductDetailDrawer({
  productId,
  onClose,
  phases,
  items,
  onVendorClick,
  weddingId,
}: {
  productId: string | null;
  onClose: () => void;
  phases: Phase[];
  items: ChecklistItem[];
  onVendorClick: (vendorId: string) => void;
  weddingId?: string;
}) {
  const { addStoreItem } = useShoppingLinks();
  const marketplaceListings = useMarketplaceStore((s) => s.listings);
  const product = productId
    ? STORE_PRODUCTS.find((p) => p.id === productId) ?? null
    : null;

  const crossTab = useMemo(() => {
    if (!product) return null;
    const unified = unifiedFromStore(product.category);
    if (unified === "other") return null;
    return findCrossTabMatches({
      unified,
      excludeStoreIds: [product.id],
      storeProducts: STORE_PRODUCTS,
      marketplaceListings,
      limitPerTab: 3,
    });
  }, [product, marketplaceListings]);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    setVariantId(product.variants[0]?.id ?? null);
    setQuantity(1);
    setModuleId(phases[0]?.id ?? null);
    setTaskId(null);
    setHeroIdx(0);
    setAdded(false);
  }, [product, phases]);

  if (!product) return null;

  const vendor = getStoreVendor(product.vendorId);
  const price = priceWithVariant(product, variantId);
  const stock = stockWithVariant(product, variantId);
  const leadDays = leadTimeWithVariant(product, variantId);
  const moduleTasks = items.filter(
    (i) => moduleId != null && i.phase_id === moduleId,
  );

  function addToShoppingList() {
    addStoreItem({
      productId: product!.id,
      variantId,
      quantity,
      module: moduleId,
      taskId,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const variantsByAttribute = new Map<string, StoreVariant[]>();
  for (const v of product.variants) {
    if (!variantsByAttribute.has(v.attribute)) {
      variantsByAttribute.set(v.attribute, []);
    }
    variantsByAttribute.get(v.attribute)!.push(v);
  }

  return (
    <AnimatePresence>
      {productId && (
        <>
          <motion.div
            key="detail-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-ink/30"
          />
          <motion.aside
            key="detail-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: PANEL_EASE }}
            className="absolute right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col border-l border-gold/20 bg-white shadow-[-12px_0_32px_rgba(26,26,26,0.15)]"
          >
            <div className="flex items-center justify-between border-b border-gold/15 px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Product Details
              </span>
              <button
                onClick={onClose}
                aria-label="Close details"
                className="rounded-md p-1 text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink"
              >
                <X size={16} strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Gallery */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-ivory-warm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.gallery[heroIdx] ?? product.heroImage}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
                <span
                  className={cn(
                    "absolute left-3 top-3 rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider",
                    STOCK_PILL[stock],
                  )}
                >
                  {stockBadgeLabel(stock, product.stockCount, leadDays)}
                </span>
              </div>
              {product.gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-b border-gold/10 bg-ivory-warm/40 px-4 py-2">
                  {product.gallery.map((g, i) => (
                    <button
                      key={g + i}
                      onClick={() => setHeroIdx(i)}
                      className={cn(
                        "h-12 w-16 shrink-0 overflow-hidden rounded border",
                        heroIdx === i ? "border-saffron" : "border-border",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-5 px-5 py-5">
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-serif text-[22px] leading-tight text-ink">
                    {product.title}
                  </h2>
                  <button
                    onClick={() => onVendorClick(product.vendorId)}
                    className="flex items-center gap-1.5 text-left"
                  >
                    <Sparkles
                      size={11}
                      strokeWidth={1.8}
                      className="text-saffron"
                    />
                    <span className="font-mono text-[11px] text-ink-muted hover:text-gold">
                      {vendor?.name}
                    </span>
                    <ArrowRight size={10} strokeWidth={1.8} className="text-ink-faint" />
                  </button>
                </div>

                <div
                  className="flex items-baseline gap-4 border-y border-gold/10 py-3"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span className="text-[22px] font-semibold text-saffron">
                    {money(price, product.currency)}
                  </span>
                  {stock === "made_to_order" && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted">
                      <Clock size={10} strokeWidth={1.8} />
                      {Math.round(leadDays / 7)} week lead time
                    </span>
                  )}
                </div>

                <p className="text-[12.5px] leading-relaxed text-ink-soft">
                  {product.description}
                </p>

                {vendor && (
                  <div className="flex items-start gap-3 rounded-md bg-ivory-warm/50 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-saffron/20">
                      <Store size={14} strokeWidth={1.6} className="text-saffron" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-serif text-[13px] text-ink">
                        About {vendor.name}
                      </span>
                      <span className="text-[11.5px] italic text-ink-muted">
                        {vendor.bio}
                      </span>
                      <button
                        onClick={() => onVendorClick(product.vendorId)}
                        className="mt-1 self-start text-[10.5px] uppercase tracking-wider text-gold hover:underline"
                      >
                        View artisan profile →
                      </button>
                    </div>
                  </div>
                )}

                {/* Variants */}
                {variantsByAttribute.size > 0 && (
                  <div className="flex flex-col gap-3">
                    {Array.from(variantsByAttribute.entries()).map(
                      ([attribute, variants]) => (
                        <div key={attribute} className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                            {attribute}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {variants.map((v) => {
                              const isSelected = variantId === v.id;
                              const disabled = v.stockStatus === "sold_out";
                              return (
                                <button
                                  key={v.id}
                                  onClick={() => !disabled && setVariantId(v.id)}
                                  disabled={disabled}
                                  className={cn(
                                    "rounded-full border px-3 py-1 text-[11.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                                    isSelected
                                      ? "border-saffron bg-saffron/15 text-ink"
                                      : "border-border text-ink-muted hover:border-gold/30 hover:text-ink",
                                  )}
                                >
                                  {v.label}
                                  {v.priceDelta !== 0 && (
                                    <span className="ml-1 font-mono text-[10px] text-ink-faint">
                                      {v.priceDelta > 0 ? "+" : ""}
                                      {money(v.priceDelta, product.currency)}
                                    </span>
                                  )}
                                  {v.leadTimeDeltaDays > 0 && (
                                    <span className="ml-1 font-mono text-[10px] text-ink-faint">
                                      +{Math.round(v.leadTimeDeltaDays / 7)}w
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Qty
                  </span>
                  <div className="flex items-center gap-1 rounded-md border border-border bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2 py-1 text-ink-muted hover:text-ink"
                    >
                      −
                    </button>
                    <span
                      className="min-w-[28px] px-1 text-center font-mono text-[12px]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-2 py-1 text-ink-muted hover:text-ink"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Module + task linkage */}
                <div className="flex flex-col gap-2 rounded-md border border-gold/15 bg-ivory-warm/40 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Assign to
                  </span>
                  <div className="flex flex-col gap-2">
                    <select
                      value={moduleId ?? ""}
                      onChange={(e) =>
                        setModuleId(e.target.value === "" ? null : e.target.value)
                      }
                      className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] outline-none focus:border-gold"
                    >
                      <option value="">No module</option>
                      {phases.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    <select
                      value={taskId ?? ""}
                      onChange={(e) =>
                        setTaskId(e.target.value === "" ? null : e.target.value)
                      }
                      disabled={!moduleId}
                      className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] outline-none focus:border-gold disabled:opacity-50"
                    >
                      <option value="">No specific task</option>
                      {moduleTasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={addToShoppingList}
                  disabled={stock === "sold_out"}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-medium uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    added
                      ? "bg-sage text-ink"
                      : "bg-ink text-ivory hover:bg-ink/90",
                  )}
                >
                  {added ? (
                    <>
                      <Check size={14} strokeWidth={2} />
                      Added to Shopping List
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={13} strokeWidth={1.8} />
                      Add to Shopping List
                    </>
                  )}
                </button>

                {/* Meta */}
                <div
                  className="grid grid-cols-2 gap-3 border-t border-gold/10 pt-3 text-[11px] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Meta label="Origin" value={product.region} />
                  <Meta label="Material" value={product.material} />
                  <Meta label="Color" value={product.color} />
                  <Meta
                    label="Category"
                    value={STORE_CATEGORY_LABEL[product.category]}
                  />
                </div>

                {crossTab &&
                  crossTab.marketplace.length > 0 &&
                  weddingId && (
                    <div className="flex flex-col gap-3 border-t border-gold/10 pt-4">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                        Similar in Marketplace — from{" "}
                        {cheapestMarketplacePrice(crossTab.marketplace)}
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {crossTab.marketplace.map((l) => (
                          <MarketplaceCrossTabMini
                            key={l.id}
                            listing={l}
                            weddingId={weddingId}
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <span className="text-ink-soft">{value}</span>
    </div>
  );
}

function cheapestMarketplacePrice(listings: MarketplaceListing[]): string {
  let cheapest: MarketplaceListing | null = null;
  for (const l of listings) {
    if (l.price_cents == null) continue;
    if (cheapest == null || l.price_cents < (cheapest.price_cents ?? Infinity)) {
      cheapest = l;
    }
  }
  if (!cheapest || cheapest.price_cents == null) return "";
  return formatMarketplacePrice(
    cheapest.price_cents,
    cheapest.seller_location_country,
    { truncate: true },
  );
}

function MarketplaceCrossTabMini({
  listing,
  weddingId,
}: {
  listing: MarketplaceListing;
  weddingId: string;
}) {
  const gradient = listing.image_gradients?.[0];
  const price =
    listing.price_cents != null
      ? formatMarketplacePrice(
          listing.price_cents,
          listing.seller_location_country,
          { truncate: true },
        )
      : "Free";
  return (
    <Link
      href={`/${weddingId}/shopping/marketplace/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gold/15 bg-white transition-all hover:border-gold/35"
    >
      <div
        className="relative aspect-[4/5] w-full"
        style={{
          background:
            gradient ??
            "linear-gradient(135deg, #F0E4C8 0%, #D4A843 50%, #B8860B 100%)",
        }}
      >
        <span
          className="absolute left-1.5 top-1.5 rounded-full bg-rose px-1.5 py-0 font-mono text-[8.5px] uppercase tracking-[0.18em] text-ivory"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Pre-loved
        </span>
      </div>
      <div className="flex flex-col gap-0.5 p-2">
        <span className="line-clamp-1 font-serif text-[11.5px] text-ink">
          {listing.title}
        </span>
        <span
          className="font-mono text-[11px] font-semibold text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {price}
        </span>
      </div>
    </Link>
  );
}

function CatalogEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h2 className="font-serif text-[18px] text-ink">No products match these filters</h2>
      <p className="max-w-sm text-[12.5px] text-ink-muted">
        Try removing a filter or clearing your search.
      </p>
      <button
        onClick={onClear}
        className="mt-1 rounded-md border border-gold/30 bg-gold-pale/30 px-4 py-1.5 text-[11.5px] font-medium text-gold hover:bg-gold-pale/50"
      >
        Clear filters
      </button>
    </div>
  );
}

// ── Filter / sort helpers ─────────────────────────────────────────────────

function filterCatalog(products: StoreProduct[], f: CatalogFilters): StoreProduct[] {
  const needle = f.query.trim().toLowerCase();
  return products.filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.vendors.length && !f.vendors.includes(p.vendorId)) return false;
    if (f.availability.length && !f.availability.includes(p.stockStatus))
      return false;
    if (f.minPrice != null && p.basePrice < f.minPrice) return false;
    if (f.maxPrice != null && p.basePrice > f.maxPrice) return false;
    if (f.regions.length && !f.regions.includes(p.region)) return false;
    if (f.colors.length && !f.colors.includes(p.color)) return false;
    if (f.materials.length && !f.materials.includes(p.material)) return false;
    if (needle) {
      const vendor = getStoreVendor(p.vendorId);
      const hay = [
        p.title,
        p.description,
        vendor?.name ?? "",
        p.material,
        p.color,
        p.region,
        ...p.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

function sortCatalog(products: StoreProduct[], key: SortKey): StoreProduct[] {
  const copy = [...products];
  switch (key) {
    case "featured":
      return copy.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          b.popularity - a.popularity,
      );
    case "new":
      return copy.sort(
        (a, b) => Number(b.isNewArrival) - Number(a.isNewArrival),
      );
    case "price_asc":
      return copy.sort((a, b) => a.basePrice - b.basePrice);
    case "price_desc":
      return copy.sort((a, b) => b.basePrice - a.basePrice);
    case "popularity":
      return copy.sort((a, b) => b.popularity - a.popularity);
    case "lead_time":
      return copy.sort((a, b) => a.baseLeadTimeDays - b.baseLeadTimeDays);
  }
  return copy;
}
