"use client";

// ── Roulette setup screen ───────────────────────────────────────────────────
// Before swiping begins, the bride configures category, city, budget, and
// vibe. A live match count updates as she adjusts filters so she knows how
// many vendors she'll see before she commits.

import { useMemo, useState } from "react";
import { Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { styleTagsForCategory } from "@/lib/vendors/roulette-style-tags";
import {
  countMatches,
  rankVendors,
} from "@/lib/vendors/roulette-ranking";
import { useRouletteStore } from "@/stores/roulette-store";
import { useVendorsStore } from "@/stores/vendors-store";
import { useVenueStore } from "@/stores/venue-store";
import type { VendorCategory } from "@/types/vendor";
import type { RouletteFilters } from "@/types/roulette";

const CATEGORIES: VendorCategory[] = [
  "photography",
  "hmua",
  "decor_florals",
  "catering",
  "entertainment",
  "wardrobe",
  "stationery",
  "pandit_ceremony",
];

const CATEGORY_ICON: Record<VendorCategory, string> = {
  photography: "📸",
  hmua: "💄",
  decor_florals: "💐",
  catering: "🍽",
  entertainment: "🎵",
  wardrobe: "👗",
  stationery: "✉",
  pandit_ceremony: "🕉",
};

export function RouletteSetup({
  onStart,
}: {
  onStart: (sessionId: string) => void;
}) {
  const vendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);

  const lastFilters = useRouletteStore((s) => s.lastFilters);
  const startSession = useRouletteStore((s) => s.startSession);
  const getSeenVendorIds = useRouletteStore((s) => s.getSeenVendorIds);

  const venueLocation = useVenueStore((s) => s.profile.location);

  // Pre-fill from last session, then venue profile, then empty.
  const [category, setCategory] = useState<VendorCategory>(
    lastFilters?.category ?? "photography",
  );
  const [city, setCity] = useState<string>(
    lastFilters?.city ?? venueLocation ?? "",
  );
  const [includeTravel, setIncludeTravel] = useState<boolean>(
    lastFilters?.include_travel ?? true,
  );
  const [budgetMin, setBudgetMin] = useState<string>(
    lastFilters?.budget_min != null ? String(lastFilters.budget_min) : "",
  );
  const [budgetMax, setBudgetMax] = useState<string>(
    lastFilters?.budget_max != null ? String(lastFilters.budget_max) : "",
  );
  const [budgetFlexible, setBudgetFlexible] = useState<boolean>(
    lastFilters?.budget_flexible ?? false,
  );
  const [styleTags, setStyleTags] = useState<string[]>(
    lastFilters?.category === category ? (lastFilters?.style_tags ?? []) : [],
  );

  const availableTags = useMemo(
    () => styleTagsForCategory(category),
    [category],
  );

  // Changing category wipes style tags (they're category-specific).
  const selectCategory = (next: VendorCategory) => {
    setCategory(next);
    setStyleTags([]);
  };

  const filters: RouletteFilters = useMemo(
    () => ({
      category,
      city: city.trim(),
      include_travel: includeTravel,
      budget_min: budgetMin ? Number(budgetMin) : null,
      budget_max: budgetMax ? Number(budgetMax) : null,
      budget_flexible: budgetFlexible,
      style_tags: styleTags,
    }),
    [category, city, includeTravel, budgetMin, budgetMax, budgetFlexible, styleTags],
  );

  const matchCount = useMemo(
    () =>
      countMatches(filters, {
        vendors,
        shortlist,
        seenVendorIds: getSeenVendorIds(),
      }),
    [filters, vendors, shortlist, getSeenVendorIds],
  );

  const toggleTag = (tag: string) => {
    setStyleTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 3) return prev; // cap at 3 per spec
      return [...prev, tag];
    });
  };

  const canStart = matchCount > 0 && city.trim().length > 0;

  const handleStart = () => {
    const ranked = rankVendors(filters, {
      vendors,
      shortlist,
      seenVendorIds: getSeenVendorIds(),
    });
    if (ranked.length === 0) return;
    const session = startSession(filters, ranked.map((v) => v.id));
    onStart(session.id);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-ivory">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-10 text-center">
          <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-ink-muted">
            — vendor roulette —
          </div>
          <h1 className="font-display text-4xl text-ink">
            let&rsquo;s find your perfect match
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            one vendor at a time · swipe to decide · takes about 3 minutes
          </p>
        </div>

        {/* ── Category ─────────────────────────────────────────────── */}
        <Section label="what are you looking for?">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const active = cat === category;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => selectCategory(cat)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border px-3 py-4 text-xs font-medium transition-colors",
                    active
                      ? "border-gold bg-gold-pale/50 text-ink"
                      : "border-gold/15 bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
                  )}
                >
                  <span className="text-xl">{CATEGORY_ICON[cat]}</span>
                  <span>{CATEGORY_LABELS[cat]}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── City ─────────────────────────────────────────────────── */}
        <Section label="your city">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai, Udaipur, Dallas"
            className="w-full rounded-md border border-gold/20 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={includeTravel}
              onChange={(e) => setIncludeTravel(e.target.checked)}
              className="h-3.5 w-3.5 accent-gold"
            />
            include vendors willing to travel here
          </label>
        </Section>

        {/* ── Budget ───────────────────────────────────────────────── */}
        <Section label="your budget (optional)">
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="min"
              className="w-full rounded-md border border-gold/20 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
            <span className="text-xs text-ink-muted">to</span>
            <input
              type="number"
              inputMode="numeric"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="max"
              className="w-full rounded-md border border-gold/20 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={budgetFlexible}
              onChange={(e) => setBudgetFlexible(e.target.checked)}
              className="h-3.5 w-3.5 accent-gold"
            />
            flexible — show me vendors slightly above my range too
          </label>
        </Section>

        {/* ── Vibe ─────────────────────────────────────────────────── */}
        <Section label={`your vibe — pick up to 3 (${styleTags.length}/3)`}>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const active = styleTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    active
                      ? "border-gold bg-gold text-white"
                      : "border-gold/25 bg-white text-ink-muted hover:border-gold/50 hover:text-ink",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Start ────────────────────────────────────────────────── */}
        <div className="mt-10 text-center">
          <button
            type="button"
            disabled={!canStart}
            onClick={handleStart}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium transition-colors",
              canStart
                ? "bg-ink text-ivory hover:opacity-90"
                : "cursor-not-allowed bg-ink-faint/30 text-ink-muted",
            )}
          >
            <Dices size={16} strokeWidth={1.6} />
            start roulette
          </button>
          <p className="mt-3 text-xs text-ink-muted">
            {matchCount === 0
              ? "no vendors match — try widening your budget or city"
              : matchCount < 5
                ? `only ${matchCount} vendor${matchCount === 1 ? "" : "s"} match — consider widening your filters`
                : `${matchCount} vendors match your criteria`}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 text-[10px] uppercase tracking-[0.25em] text-ink-muted">
        — {label} —
      </div>
      {children}
    </section>
  );
}
