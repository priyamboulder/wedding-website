"use client";

// ── Guides tab ──────────────────────────────────────────────────────────────
// Featured hero (top guide) + category filter pills + sort selector + grid
// of GuideCards. Reads guides from the Zustand store, hydrates each guide's
// creator from the creators store.

import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuidesStore } from "@/stores/guides-store";
import { useCreatorsStore } from "@/stores/creators-store";
import { GUIDE_CATEGORY_LABEL, listPublishedGuides } from "@/lib/guides/seed";
import type { GuideCategory, Guide } from "@/types/guide";
import { GuideCard } from "./GuideCard";

type CategoryFilter = "all" | GuideCategory;
type Sort = "trending" | "newest" | "most_saved";

const SORT_LABEL: Record<Sort, string> = {
  trending: "Trending",
  newest: "Newest",
  most_saved: "Most saved",
};

export function GuidesTab() {
  const guides = useMemo(() => listPublishedGuides(), []);
  const creators = useCreatorsStore((s) => s.creators);
  const saveCountFor = useGuidesStore((s) => s.saveCountFor);

  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<Sort>("trending");

  const creatorById = useMemo(() => {
    const m = new Map(creators.map((c) => [c.id, c] as const));
    return m;
  }, [creators]);

  const filteredSorted = useMemo(() => {
    const base =
      filter === "all" ? guides : guides.filter((g) => g.category === filter);
    return sortGuides(base, sort, saveCountFor);
  }, [guides, filter, sort, saveCountFor]);

  // The first guide acts as the editorial hero. Falls back gracefully if
  // the filter eliminates every guide.
  const [hero, ...rest] = filteredSorted;

  const categoryChips: { id: CategoryFilter; label: string; count: number }[] =
    useMemo(() => {
      const chips: { id: CategoryFilter; label: string; count: number }[] = [
        { id: "all", label: "All guides", count: guides.length },
      ];
      for (const id of Object.keys(GUIDE_CATEGORY_LABEL) as GuideCategory[]) {
        const count = guides.filter((g) => g.category === id).length;
        if (count === 0) continue;
        chips.push({ id, label: GUIDE_CATEGORY_LABEL[id], count });
      }
      return chips;
    }, [guides]);

  return (
    <div className="bg-white px-10 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3">
          <CategoryChips
            chips={categoryChips}
            active={filter}
            onChange={setFilter}
          />
          <div className="ml-auto">
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>

        {filteredSorted.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Featured hero */}
            {hero && (
              <div className="mt-10 rounded-2xl border border-gold/20 bg-ivory-warm/30 p-6 md:p-8">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  This week's read
                </p>
                <div className="mt-4">
                  <GuideCard
                    guide={hero}
                    creator={creatorById.get(hero.creatorId)}
                    size="featured"
                  />
                </div>
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((g) => (
                  <GuideCard
                    key={g.id}
                    guide={g}
                    creator={creatorById.get(g.creatorId)}
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

// ── Filter chips ────────────────────────────────────────────────────────────

function CategoryChips({
  chips,
  active,
  onChange,
}: {
  chips: { id: CategoryFilter; label: string; count: number }[];
  active: CategoryFilter;
  onChange: (c: CategoryFilter) => void;
}) {
  return (
    <div className="flex flex-1 flex-wrap items-center gap-2 overflow-x-auto">
      {chips.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors",
              isActive
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
            )}
          >
            <span>{c.label}</span>
            <span
              className={cn(
                "font-mono text-[9.5px]",
                isActive ? "text-ivory/70" : "text-ink-faint",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {c.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Sort select ─────────────────────────────────────────────────────────────

function SortSelect({
  value,
  onChange,
}: {
  value: Sort;
  onChange: (v: Sort) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[11.5px] text-ink-muted">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Sort
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Sort)}
        className="rounded-md border border-border bg-white px-2.5 py-1 text-[12px] text-ink transition-colors hover:border-gold/30 focus:border-gold/40 focus:outline-none"
      >
        {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
          <option key={s} value={s}>
            {SORT_LABEL[s]}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-ivory-warm/40 text-gold">
        <BookOpen size={22} strokeWidth={1.5} />
      </div>
      <p className="mt-5 font-serif text-[22px] italic text-ink">
        no guides under this category yet.
      </p>
      <p className="mt-2 max-w-[380px] text-[14px] leading-[1.65] text-ink-muted">
        try another filter — or check back soon.
      </p>
    </div>
  );
}

// ── Sort helper ─────────────────────────────────────────────────────────────

function sortGuides(
  guides: Guide[],
  sort: Sort,
  saveCountFor: (id: string) => number,
): Guide[] {
  const list = [...guides];
  if (sort === "newest") {
    list.sort((a, b) =>
      (b.publishedAt ?? b.createdAt).localeCompare(
        a.publishedAt ?? a.createdAt,
      ),
    );
    return list;
  }
  if (sort === "most_saved") {
    list.sort((a, b) => saveCountFor(b.id) - saveCountFor(a.id));
    return list;
  }
  // Trending: views weighted by saves and recency.
  const score = (g: Guide) => {
    const days = g.publishedAt
      ? (Date.now() - new Date(g.publishedAt).getTime()) /
        (1000 * 60 * 60 * 24)
      : 365;
    return g.baseViewCount + saveCountFor(g.id) * 4 - days * 50;
  };
  list.sort((a, b) => score(b) - score(a));
  return list;
}
