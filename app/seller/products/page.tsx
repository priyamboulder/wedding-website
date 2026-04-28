"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  PRODUCTS,
  PRODUCT_STATS,
  categoryLabel,
  type Product,
  type ProductCategory,
  type ProductStatus,
} from "@/lib/seller/products-seed";

type StatusFilter = "all" | "active" | "draft" | "out-of-stock" | "archived";
type SortKey = "newest" | "best-selling" | "most-viewed" | "price-high" | "price-low";
type ViewMode = "grid" | "list";

const STATUS_META: Record<
  ProductStatus,
  { label: string; glyph: string; tone: string; bg: string; border: string }
> = {
  active: {
    label: "Active",
    glyph: "●",
    tone: "#2F7A55",
    bg: "rgba(217,232,228,0.5)",
    border: "rgba(47,122,85,0.25)",
  },
  "low-stock": {
    label: "Low stock",
    glyph: "⚠",
    tone: "#7a5a16",
    bg: "rgba(245,230,208,0.55)",
    border: "rgba(196,162,101,0.45)",
  },
  "out-of-stock": {
    label: "Out of stock",
    glyph: "●",
    tone: "#B23A2A",
    bg: "rgba(232,213,208,0.45)",
    border: "rgba(178,58,42,0.35)",
  },
  draft: {
    label: "Draft",
    glyph: "◐",
    tone: "#6B5BA8",
    bg: "rgba(232,222,245,0.45)",
    border: "rgba(107,91,168,0.25)",
  },
  archived: {
    label: "Archived",
    glyph: "▪",
    tone: "#6b6b6b",
    bg: "rgba(44,44,44,0.06)",
    border: "rgba(44,44,44,0.12)",
  },
};

function formatPrice(p: Product): string {
  const base = `$${p.price.toFixed(2)}`;
  if (p.pricingModel === "per-unit" || p.pricingModel === "tiered") {
    return `${base}/${p.unit ?? "ea"}`;
  }
  return base;
}

function stockDisplay(p: Product): string {
  if (p.productType === "digital") return "∞";
  if (!p.trackInventory) return "—";
  return String(p.stockQuantity ?? 0);
}

export default function SellerProductsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = PRODUCTS.slice();
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => {
        if (statusFilter === "active") {
          return p.status === "active" || p.status === "low-stock";
        }
        return p.status === statusFilter;
      });
    }
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }
    switch (sort) {
      case "best-selling":
        list.sort((a, b) => b.sold - a.sold);
        break;
      case "most-viewed":
        list.sort((a, b) => b.views30d - a.views30d);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "newest":
      default:
        list.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo);
    }
    return list;
  }, [search, statusFilter, categoryFilter, sort]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function clearSelection() {
    setSelected(new Set());
  }

  return (
    <div className="pb-16">
      {/* Header */}
      <section
        className="border-b px-8 py-8"
        style={{ borderColor: "rgba(44,44,44,0.08)" }}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1
              className="text-[36px] leading-tight text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                letterSpacing: "-0.015em",
              }}
            >
              Products
            </h1>
            <p className="mt-1.5 text-[13.5px] text-stone-600">
              <strong className="font-medium text-[#2C2C2C]">{PRODUCT_STATS.active}</strong> active
              <span className="mx-2 text-stone-300">·</span>
              <strong className="font-medium text-[#2C2C2C]">{PRODUCT_STATS.draft}</strong> drafts
              <span className="mx-2 text-stone-300">·</span>
              <strong className="font-medium text-[#2C2C2C]">{PRODUCT_STATS.outOfStock}</strong> out of stock
              <span className="mx-2 text-stone-300">·</span>
              <strong className="font-medium text-[#2C2C2C]">{PRODUCT_STATS.archived}</strong> archived
            </p>
          </div>

          <Link
            href="/seller/products/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[13.5px] font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#C4A265" }}
          >
            <span aria-hidden>+</span> New Product
          </Link>
        </div>
      </section>

      {/* Filter bar */}
      <section
        className="sticky top-0 z-10 border-b px-8 py-4 backdrop-blur"
        style={{
          borderColor: "rgba(44,44,44,0.08)",
          backgroundColor: "rgba(250,248,245,0.9)",
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              aria-hidden
            >
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border bg-white pl-9 pr-3 text-[13px] text-[#2C2C2C] outline-none transition-colors focus:border-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            />
          </div>

          <SelectFilter
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
            options={[
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "out-of-stock", label: "Out of Stock" },
              { value: "archived", label: "Archived" },
            ]}
          />

          <SelectFilter
            value={categoryFilter}
            onChange={(v) => setCategoryFilter(v as ProductCategory | "all")}
            options={[
              { value: "all", label: "All categories" },
              ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
            ]}
          />

          <SelectFilter
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: "newest", label: "Newest" },
              { value: "best-selling", label: "Best Selling" },
              { value: "most-viewed", label: "Most Viewed" },
              { value: "price-high", label: "Price: High to Low" },
              { value: "price-low", label: "Price: Low to High" },
            ]}
          />

          <div className="ml-auto flex items-center gap-1 rounded-md border p-0.5"
            style={{ borderColor: "rgba(44,44,44,0.12)", backgroundColor: "white" }}
          >
            <ViewToggle active={view === "grid"} onClick={() => setView("grid")} label="Grid" glyph="▦" />
            <ViewToggle active={view === "list"} onClick={() => setView("list")} label="List" glyph="☰" />
          </div>
        </div>

        {/* Bulk action bar (appears when items selected) */}
        {selected.size > 0 && (
          <div
            className="mt-3 flex flex-wrap items-center gap-2 rounded-md border px-4 py-2.5"
            style={{
              borderColor: "rgba(196,162,101,0.35)",
              backgroundColor: "#FBF3E4",
            }}
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#7a5a16]">
              {selected.size} selected
            </span>
            <span className="mx-1 text-stone-300" aria-hidden>·</span>
            <BulkButton>Activate</BulkButton>
            <BulkButton>Deactivate</BulkButton>
            <BulkButton>Duplicate</BulkButton>
            <BulkButton>Update pricing</BulkButton>
            <BulkButton>Add tags</BulkButton>
            <BulkButton>Archive</BulkButton>
            <BulkButton danger>Delete</BulkButton>
            <button
              type="button"
              onClick={clearSelection}
              className="ml-auto text-[12px] text-stone-600 hover:text-[#2C2C2C]"
            >
              Clear
            </button>
          </div>
        )}
      </section>

      {/* Grid or list */}
      <section className="px-8 py-8">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                selected={selected.has(p.id)}
                onToggle={() => toggle(p.id)}
              />
            ))}
          </div>
        ) : (
          <ProductTable
            products={filtered}
            selected={selected}
            onToggle={toggle}
            onToggleAll={() => {
              if (selected.size === filtered.length) setSelected(new Set());
              else setSelected(new Set(filtered.map((p) => p.id)));
            }}
          />
        )}
      </section>
    </div>
  );
}

// ── Filter primitives ───────────────────────────────────────

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-md border bg-white pl-3 pr-8 text-[13px] text-[#2C2C2C] outline-none transition-colors focus:border-[#C4A265]"
        style={{ borderColor: "rgba(44,44,44,0.12)" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-500"
        aria-hidden
      >
        ▾
      </span>
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  glyph,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  glyph: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="flex h-7 w-8 items-center justify-center rounded text-[13px] transition-colors"
      style={{
        backgroundColor: active ? "#F5E6D0" : "transparent",
        color: active ? "#7a5a16" : "#6b6b6b",
      }}
    >
      {glyph}
    </button>
  );
}

function BulkButton({
  children,
  danger = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-7 items-center rounded-md border bg-white px-2.5 text-[12px] transition-colors hover:bg-[#FBF3E4]"
      style={{
        borderColor: "rgba(44,44,44,0.12)",
        color: danger ? "#B23A2A" : "#2C2C2C",
      }}
    >
      {children}
    </button>
  );
}

// ── Product card (grid view) ────────────────────────────────

function ProductCard({
  product: p,
  selected,
  onToggle,
}: {
  product: Product;
  selected: boolean;
  onToggle: () => void;
}) {
  const status = STATUS_META[p.status];
  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-sm"
      style={{
        borderColor: selected ? "rgba(196,162,101,0.55)" : "rgba(196,162,101,0.22)",
        backgroundColor: "#FFFFFA",
        boxShadow: selected ? "0 0 0 2px rgba(196,162,101,0.25)" : undefined,
      }}
    >
      <label
        className="absolute left-3 top-3 z-[1] flex h-5 w-5 cursor-pointer items-center justify-center rounded border bg-white/90 text-[11px]"
        style={{ borderColor: "rgba(44,44,44,0.2)" }}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="peer sr-only"
        />
        <span
          className="pointer-events-none hidden text-[#7a5a16] peer-checked:inline"
          aria-hidden
        >
          ✓
        </span>
      </label>

      <PhotoBlock product={p} />

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-3.5">
        <div>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-stone-500">
            {categoryLabel(p.category)}
          </p>
          <h3
            className="mt-1 line-clamp-2 text-[16px] leading-snug text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {p.title}
          </h3>
        </div>

        <div className="flex items-baseline gap-2">
          <p
            className="font-mono text-[15px] text-[#2C2C2C]"
            style={{ fontWeight: 500, letterSpacing: "-0.01em" }}
          >
            {formatPrice(p)}
          </p>
          {p.compareAtPrice && (
            <p className="font-mono text-[11px] text-stone-400 line-through">
              ${p.compareAtPrice.toFixed(2)}
            </p>
          )}
        </div>

        {p.minOrder && (
          <p className="text-[11.5px] text-stone-500">Min order: {p.minOrder}</p>
        )}

        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider"
            style={{ color: status.tone, backgroundColor: status.bg, borderColor: status.border }}
          >
            <span aria-hidden>{status.glyph}</span>
            {status.label}
            {p.status === "low-stock" && p.stockQuantity != null && (
              <span className="font-normal normal-case"> · {p.stockQuantity} left</span>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-stone-500">
          {p.rating != null && p.reviewCount! > 0 ? (
            <span>
              <span style={{ color: "#C4A265" }}>★</span> {p.rating.toFixed(1)}
              <span className="text-stone-400"> ({p.reviewCount})</span>
            </span>
          ) : (
            <span className="text-stone-400">No reviews yet</span>
          )}
          <span>
            <span aria-hidden>⊙</span> {p.sold} sold
          </span>
          <span>
            <span aria-hidden>◉</span> {p.views30d}/mo
          </span>
        </div>

        <div className="mt-auto flex items-center gap-1.5 pt-2">
          <Link
            href={`/seller/products/${p.id}/edit`}
            className="inline-flex h-7 items-center rounded-md border bg-white px-2.5 text-[12px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            Edit
          </Link>
          <button
            type="button"
            className="inline-flex h-7 items-center rounded-md border bg-white px-2.5 text-[12px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            Duplicate
          </button>
          {p.status === "active" || p.status === "low-stock" ? (
            <button
              type="button"
              className="inline-flex h-7 items-center rounded-md border bg-white px-2.5 text-[12px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            >
              Deactivate
            </button>
          ) : p.status === "draft" ? (
            <button
              type="button"
              className="inline-flex h-7 items-center rounded-md border bg-white px-2.5 text-[12px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            >
              Publish
            </button>
          ) : null}
          <button
            type="button"
            aria-label="More actions"
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md border bg-white text-[13px] text-stone-600 transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            ···
          </button>
        </div>
      </div>
    </article>
  );
}

// Placeholder photo with glyph, tint, and overlay for photo count
function PhotoBlock({ product: p }: { product: Product }) {
  return (
    <div
      className="relative flex aspect-[4/3] items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${p.photoTint} 0%, #FFFFFA 100%)`,
      }}
    >
      <span
        className="text-[52px] text-[#7a5a16] opacity-80"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
        aria-hidden
      >
        {p.photoGlyph}
      </span>
      <span
        className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[9.5px] text-white"
        aria-hidden
      >
        <span>▣</span> {p.photoCount}
      </span>
      {p.productType === "digital" && (
        <span
          className="absolute left-2 top-2 rounded-md px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider"
          style={{ backgroundColor: "rgba(107,91,168,0.9)", color: "white" }}
        >
          Digital
        </span>
      )}
    </div>
  );
}

// ── Product table (list view) ───────────────────────────────

function ProductTable({
  products,
  selected,
  onToggle,
  onToggleAll,
}: {
  products: Product[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const allSelected = products.length > 0 && selected.size === products.length;
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: "rgba(196,162,101,0.22)", backgroundColor: "#FFFFFA" }}
    >
      <table className="w-full border-collapse text-left">
        <thead
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-stone-500"
          style={{ backgroundColor: "#FBF3E4" }}
        >
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all"
              />
            </th>
            <th className="w-16 px-2 py-3">Photo</th>
            <th className="px-2 py-3">Product</th>
            <th className="w-28 px-3 py-3 text-right">Price</th>
            <th className="w-20 px-3 py-3 text-right">Stock</th>
            <th className="w-16 px-3 py-3 text-right">Sold</th>
            <th className="w-20 px-3 py-3 text-right">Views</th>
            <th className="w-32 px-3 py-3">Status</th>
            <th className="w-24 px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => {
            const status = STATUS_META[p.status];
            return (
              <tr
                key={p.id}
                className="text-[13px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]/40"
                style={{
                  borderTop:
                    idx === 0 ? undefined : "1px solid rgba(44,44,44,0.06)",
                  backgroundColor: selected.has(p.id)
                    ? "rgba(245,230,208,0.4)"
                    : undefined,
                }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => onToggle(p.id)}
                    aria-label={`Select ${p.title}`}
                  />
                </td>
                <td className="px-2 py-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-md"
                    style={{
                      background: `linear-gradient(135deg, ${p.photoTint}, #FFFFFA)`,
                    }}
                  >
                    <span
                      className="text-[18px] text-[#7a5a16]"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      aria-hidden
                    >
                      {p.photoGlyph}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-3">
                  <Link
                    href={`/seller/products/${p.id}/edit`}
                    className="block"
                  >
                    <p
                      className="text-[14.5px] leading-tight text-[#2C2C2C] hover:underline"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                      }}
                    >
                      {p.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-stone-500">
                      {categoryLabel(p.category)}
                    </p>
                  </Link>
                </td>
                <td className="px-3 py-3 text-right font-mono text-[13px]">
                  {formatPrice(p)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12.5px]">
                  {p.status === "low-stock" && (
                    <span className="text-[#7a5a16]">
                      {p.stockQuantity} left
                    </span>
                  )}
                  {p.status !== "low-stock" && stockDisplay(p)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12.5px] text-stone-600">
                  {p.sold || "—"}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12.5px] text-stone-600">
                  {p.views30d || "—"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider"
                    style={{
                      color: status.tone,
                      backgroundColor: status.bg,
                      borderColor: status.border,
                    }}
                  >
                    <span aria-hidden>{status.glyph}</span>
                    {status.label}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/seller/products/${p.id}/edit`}
                    className="text-[12px] text-[#7a5a16] hover:underline"
                  >
                    Edit
                  </Link>
                  <span className="mx-2 text-stone-300">·</span>
                  <button
                    type="button"
                    aria-label="More"
                    className="text-[12px] text-stone-500 hover:text-[#2C2C2C]"
                  >
                    ···
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border px-8 py-20 text-center"
      style={{
        borderColor: "rgba(196,162,101,0.22)",
        backgroundColor: "#FFFFFA",
      }}
    >
      <span
        className="mb-3 text-[42px] text-[#C4A265]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
        aria-hidden
      >
        ∅
      </span>
      <h3
        className="text-[22px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        No products match these filters
      </h3>
      <p className="mt-1.5 text-[13px] text-stone-600">
        Try clearing a filter, or create a new listing.
      </p>
    </div>
  );
}
