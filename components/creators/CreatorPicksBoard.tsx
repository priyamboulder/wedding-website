"use client";

import { useMemo, useState } from "react";
import { Search, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreatorsStore } from "@/stores/creators-store";
import { getStoreProduct } from "@/lib/store-seed";
import type { Creator, CreatorCollection, CreatorPick } from "@/types/creator";
import { CreatorAvatar, formatFollowerCount } from "./CreatorAvatar";
import { CreatorPickCard } from "./CreatorPickCard";
import { CreatorProfileCard } from "./CreatorProfileCard";
import {
  PriceTierChips,
  priceInSelectedTiers,
  type PriceTierKey,
} from "@/components/shopping/PriceTierChips";

type SortKey = "popular" | "newest" | "price_asc" | "price_desc";

const SORT_LABEL: Record<SortKey, string> = {
  popular: "Most popular",
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
};

interface EnrichedPick {
  pick: CreatorPick;
  collection: CreatorCollection;
  creator: Creator;
  product: NonNullable<ReturnType<typeof getStoreProduct>>;
}

export function CreatorPicksBoard({
  weddingId,
  moduleTitles,
}: {
  weddingId: string;
  moduleTitles: Map<string, string>;
}) {
  const creators = useCreatorsStore((s) => s.listCreators());
  const collections = useCreatorsStore((s) => s.collections);
  const picks = useCreatorsStore((s) => s.picks);
  const trackReferral = useCreatorsStore((s) => s.trackReferral);

  const [query, setQuery] = useState("");
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    new Set(),
  );
  const [priceTiers, setPriceTiers] = useState<Set<PriceTierKey>>(new Set());
  const [sort, setSort] = useState<SortKey>("popular");

  const togglePriceTier = (key: PriceTierKey) => {
    setPriceTiers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const enriched: EnrichedPick[] = useMemo(() => {
    const out: EnrichedPick[] = [];
    for (const pick of picks) {
      const collection = collections.find((c) => c.id === pick.collectionId);
      if (!collection || collection.status !== "active") continue;
      const creator = creators.find((c) => c.id === collection.creatorId);
      const product = getStoreProduct(pick.productId);
      if (!creator || !product) continue;
      out.push({ pick, collection, creator, product });
    }
    return out;
  }, [picks, collections, creators]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((e) => {
      if (selectedCreatorIds.size > 0 && !selectedCreatorIds.has(e.creator.id))
        return false;
      if (selectedModules.size > 0 && !selectedModules.has(e.collection.module))
        return false;
      if (!priceInSelectedTiers(e.product.basePrice, priceTiers)) return false;
      if (q) {
        const hay = `${e.product.title} ${e.creator.displayName} ${e.pick.creatorNote ?? ""}`
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [enriched, query, selectedCreatorIds, selectedModules, priceTiers]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "popular":
        arr.sort((a, b) => b.product.popularity - a.product.popularity);
        break;
      case "newest":
        arr.sort(
          (a, b) =>
            new Date(b.pick.addedAt).getTime() -
            new Date(a.pick.addedAt).getTime(),
        );
        break;
      case "price_asc":
        arr.sort((a, b) => a.product.basePrice - b.product.basePrice);
        break;
      case "price_desc":
        arr.sort((a, b) => b.product.basePrice - a.product.basePrice);
        break;
    }
    return arr;
  }, [filtered, sort]);

  // Group by module (matches Shopping's native grouping)
  const grouped = useMemo(() => {
    const bucket = new Map<string, EnrichedPick[]>();
    for (const e of sorted) {
      const key = e.collection.module || "__unassigned__";
      const arr = bucket.get(key) ?? [];
      arr.push(e);
      bucket.set(key, arr);
    }
    return Array.from(bucket.entries()).sort(([a], [b]) =>
      (moduleTitles.get(a) ?? a).localeCompare(moduleTitles.get(b) ?? b),
    );
  }, [sorted, moduleTitles]);

  const toggleCreator = (id: string) =>
    setSelectedCreatorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleModule = (id: string) =>
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const picksCountByCreator = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of picks) {
      const col = collections.find((c) => c.id === p.collectionId);
      if (!col) continue;
      map.set(col.creatorId, (map.get(col.creatorId) ?? 0) + 1);
    }
    return map;
  }, [picks, collections]);

  const availableModules = useMemo(() => {
    const set = new Set<string>();
    for (const c of collections) if (c.status === "active") set.add(c.module);
    return Array.from(set);
  }, [collections]);

  const activeFilters =
    selectedCreatorIds.size + selectedModules.size + (query ? 1 : 0);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar — matches ShoppingBoardFilters width/tone */}
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-gold/10 bg-ivory-warm/30 px-4 py-5 lg:block">
        <div className="flex items-center justify-between">
          <h4
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Filters
          </h4>
          {activeFilters > 0 && (
            <button
              onClick={() => {
                setSelectedCreatorIds(new Set());
                setSelectedModules(new Set());
                setQuery("");
              }}
              className="flex items-center gap-1 text-[10.5px] text-gold hover:text-ink"
            >
              <X size={10} strokeWidth={1.8} />
              Clear ({activeFilters})
            </button>
          )}
        </div>

        <FilterSection title="Creator">
          {creators.map((c) => {
            const active = selectedCreatorIds.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCreator(c.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[12px] transition-colors",
                  active
                    ? "border-gold/40 bg-gold-pale/40 text-ink"
                    : "border-transparent bg-transparent text-ink-muted hover:bg-white",
                )}
              >
                <CreatorAvatar creator={c} size="sm" withBadge={false} />
                <span className="min-w-0 flex-1 truncate">{c.displayName}</span>
                <span
                  className="font-mono text-[9.5px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {picksCountByCreator.get(c.id) ?? 0}
                </span>
              </button>
            );
          })}
        </FilterSection>

        <FilterSection title="Module">
          {availableModules.map((m) => {
            const active = selectedModules.has(m);
            const count = enriched.filter((e) => e.collection.module === m)
              .length;
            return (
              <button
                key={m}
                onClick={() => toggleModule(m)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-[12px] transition-colors",
                  active
                    ? "border-gold/40 bg-gold-pale/40 text-ink"
                    : "border-transparent bg-transparent text-ink-muted hover:bg-white",
                )}
              >
                <span className="truncate">{moduleTitles.get(m) ?? m}</span>
                <span
                  className="font-mono text-[9.5px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </FilterSection>
      </aside>

      <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
        {/* Controls bar */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:w-80">
            <Search
              size={13}
              strokeWidth={1.6}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators, picks, notes…"
              className="w-full rounded-md border border-border bg-white py-1.5 pl-8 pr-8 text-[12.5px] text-ink outline-none focus:border-gold"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span
              className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {sorted.length} picks
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-border bg-white py-1 pl-2 pr-6 text-[11.5px] text-ink outline-none focus:border-gold"
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <PriceTierChips selected={priceTiers} onToggle={togglePriceTier} />
        </div>

        {/* Featured creators row */}
        {selectedCreatorIds.size === 0 && !query && (
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between border-b border-gold/10 pb-1.5">
              <h3 className="flex items-center gap-2 font-serif text-[17px] font-medium text-ink">
                <Users size={14} strokeWidth={1.6} className="text-gold" />
                Featured creators
              </h3>
              <span
                className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {creators.length} curators
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {creators.map((c) => (
                <CreatorProfileCard
                  key={c.id}
                  creator={c}
                  weddingId={weddingId}
                  picksCount={picksCountByCreator.get(c.id) ?? 0}
                  savesCount={(c.followerCount / 10) | 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* Grouped picks */}
        {grouped.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 px-6 text-center">
            <h2 className="font-serif text-[17px] text-ink">No picks match</h2>
            <p className="max-w-sm text-[12.5px] text-ink-muted">
              Try removing a filter, clearing the search, or switching creators.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {grouped.map(([module, items]) => (
              <section key={module} className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between border-b border-gold/10 pb-1.5">
                  <h3 className="font-serif text-[17px] font-medium text-ink">
                    {moduleTitles.get(module) ?? module}
                  </h3>
                  <span
                    className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {items.length} pick{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {items.map(({ pick, creator, product, collection }) => (
                    <CreatorPickCard
                      key={pick.id}
                      pick={pick}
                      product={product}
                      creator={creator}
                      weddingId={weddingId}
                      collectionId={collection.id}
                      module={collection.module}
                      referralType="tab_click"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex flex-col gap-1">
      <div
        className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {title}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
