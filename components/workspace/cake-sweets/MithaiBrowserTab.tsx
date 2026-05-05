"use client";

// ── Mithai & Dessert Spread (discovery-first browser) ─────────────────────
// Replaces the bare "Add a sweet" text field with a browsable catalog of
// Indian mithai, Western desserts, and fusion creations. Couples react
// Love / Not-for-me, and loved items become the planned dessert spread.
//
// Loved items render at the top with editable quantity + dietary flags.
// Below, the full catalog is filtered by category with the same reaction
// pattern. A manual add at the bottom handles items not in the catalog.

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Heart,
  IceCreamBowl,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCakeSweetsStore,
  type AllergenId,
} from "@/stores/cake-sweets-store";
import {
  ALLERGEN_OPTIONS,
  DESSERT_CATALOG,
  type DessertCategory,
  type DessertItem,
} from "@/lib/cake-sweets-seed";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { ReactionButtons } from "@/components/workspace/cake-sweets/shared/ReactionButtons";
import { SelectionLauncherBanner } from "@/components/guided-journeys/sweets-selection/SelectionLauncherBanner";

const CATEGORY_LABEL: Record<DessertCategory | "all", string> = {
  all: "All",
  indian: "Indian mithai",
  western: "Western",
  fusion: "Fusion",
};

const MONO_FAMILY = "var(--font-mono)";

// Combined view model: a catalog item or a custom one.
interface ResolvedItem {
  id: string;
  name: string;
  description: string;
  category: DessertCategory | "custom";
  emoji: string;
  dietary_default?: DessertItem["dietary_default"];
  isCustom: boolean;
}

function resolveItem(id: string, meta?: {
  name?: string;
  description?: string;
  custom?: boolean;
}): ResolvedItem | null {
  const seed = DESSERT_CATALOG.find((d) => d.id === id);
  if (seed) {
    return {
      id: seed.id,
      name: seed.name,
      description: seed.description,
      category: seed.category,
      emoji: seed.emoji,
      dietary_default: seed.dietary_default,
      isCustom: false,
    };
  }
  if (meta?.custom && meta.name) {
    return {
      id,
      name: meta.name,
      description: meta.description ?? "",
      category: "custom",
      emoji: "✨",
      isCustom: true,
    };
  }
  return null;
}

export function MithaiBrowserTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const reactions = useCakeSweetsStore((s) => s.dessert_catalog);
  const meta = useCakeSweetsStore((s) => s.dessert_meta);
  const sharedAllergens = useCakeSweetsStore((s) => s.allergens.flags);
  const reactDessert = useCakeSweetsStore((s) => s.reactDessert);
  const addCustomDessert = useCakeSweetsStore((s) => s.addCustomDessert);
  const removeCustomDessert = useCakeSweetsStore((s) => s.removeCustomDessert);
  const setDessertMeta = useCakeSweetsStore((s) => s.setDessertMeta);

  const [catFilter, setCatFilter] = useState<DessertCategory | "all">("all");
  const [browseFilter, setBrowseFilter] = useState<"all" | "unseen">("unseen");
  const [query, setQuery] = useState("");
  const [draftName, setDraftName] = useState("");

  const activeAllergens = useMemo(
    () => ALLERGEN_OPTIONS.filter((a) => sharedAllergens[a.id]),
    [sharedAllergens],
  );

  // Loved items (catalog + custom), sorted: custom last, then alphabetic.
  const loved = useMemo(() => {
    const lovedIds = Object.entries(reactions)
      .filter(([, r]) => r === "love")
      .map(([id]) => id);
    return lovedIds
      .map((id) => resolveItem(id, meta[id]))
      .filter((x): x is ResolvedItem => x !== null)
      .sort((a, b) => {
        if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
  }, [reactions, meta]);

  // Catalog to browse (not yet loved / not_this), filtered by tab + search.
  const browseItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DESSERT_CATALOG.filter((d) => {
      const r = reactions[d.id];
      if (browseFilter === "unseen" && r) return false;
      if (catFilter !== "all" && d.category !== catFilter) return false;
      if (q && !`${d.name} ${d.description}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [reactions, catFilter, browseFilter, query]);

  const lovedCount = loved.length;
  const progress = Object.keys(reactions).length;

  function addManual() {
    const v = draftName.trim();
    if (!v) return;
    addCustomDessert(v);
    setDraftName("");
  }

  return (
    <div className="space-y-5">
      <SelectionLauncherBanner categoryId={category.id} sessionKey="mithai_spread" />
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        Browse a full spread — Indian mithai, Western desserts, fusion bites —
        and react. Loved sweets land in your planned spread with quantity and
        dietary fields. Add anything we missed at the bottom.
      </p>

      {activeAllergens.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-400 bg-amber-50/60 px-3 py-2">
          <ShieldAlert
            size={14}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-amber-700"
          />
          <p className="text-[12.5px] leading-snug text-amber-800">
            <span className="font-semibold">Dietary filters active:</span>{" "}
            {activeAllergens.map((a) => a.label).join(", ")}. Flag any loved
            sweet that violates these with the dietary chips below — your
            vendor plans around it.
          </p>
        </div>
      )}

      {/* ── Loved panel ───────────────────────────────────────────────── */}
      <PanelCard
        icon={<Heart size={14} strokeWidth={1.8} />}
        title="Your dessert spread"
        badge={
          <span
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: MONO_FAMILY }}
          >
            <Heart size={10} strokeWidth={1.8} />
            {lovedCount} loved
          </span>
        }
      >
        {loved.length === 0 ? (
          <p className="py-3 text-[12.5px] italic text-ink-faint">
            Nothing loved yet — browse below and tap Love on the ones you'd
            want at your wedding. Everything you love shows up here with
            fields for quantity and dietary flags.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {loved.map((item) => (
              <LovedRow
                key={item.id}
                item={item}
                meta={meta[item.id]}
                activeAllergens={activeAllergens.map((a) => a.id) as AllergenId[]}
                onPatch={(p) => setDessertMeta(item.id, p)}
                onRemove={() =>
                  item.isCustom
                    ? removeCustomDessert(item.id)
                    : reactDessert(item.id, "love")
                }
              />
            ))}
          </ul>
        )}
      </PanelCard>

      {/* ── Catalog browser ───────────────────────────────────────────── */}
      <PanelCard
        icon={<IceCreamBowl size={14} strokeWidth={1.8} />}
        title="Browse the catalog"
        badge={
          <div className="flex flex-wrap items-center gap-1">
            {(["unseen", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setBrowseFilter(f)}
                className={cn(
                  "rounded-sm border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
                  browseFilter === f
                    ? "border-ink bg-ink text-ivory"
                    : "border-border bg-white text-ink-muted hover:border-ink",
                )}
                style={{ fontFamily: MONO_FAMILY }}
              >
                {f === "unseen" ? `Unseen · ${DESSERT_CATALOG.length - progress}` : "All"}
              </button>
            ))}
          </div>
        }
      >
        {/* Filter rail */}
        <div className="mb-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(["all", "indian", "western", "fusion"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCatFilter(c)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors",
                  catFilter === c
                    ? "border-saffron bg-saffron-pale/60 text-saffron"
                    : "border-border bg-white text-ink-muted hover:border-saffron",
                )}
                style={{ fontFamily: MONO_FAMILY }}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search
              size={12}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-2.5 top-2.5 text-ink-faint"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sweets…"
              className="w-full rounded-sm border border-border bg-white py-1.5 pl-7 pr-2.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </div>
        </div>

        {browseItems.length === 0 ? (
          <p className="py-4 text-center text-[12px] italic text-ink-faint">
            {browseFilter === "unseen"
              ? "You've reacted to every sweet in this filter. Try All."
              : "No sweets match your search."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {browseItems.map((d) => {
              const r = reactions[d.id];
              const conflicts = allergenConflicts(d, activeAllergens.map((a) => a.id));
              return (
                <li
                  key={d.id}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-md border bg-white p-2.5 transition-colors",
                    r === "love"
                      ? "border-rose bg-rose-pale/20"
                      : r === "not_this"
                        ? "border-border opacity-50"
                        : "border-border",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 text-xl leading-none">{d.emoji}</span>
                    <div className="min-w-0">
                      <p className="truncate font-serif text-[13.5px] text-ink">
                        {d.name}
                      </p>
                      <p className="text-[11px] leading-snug text-ink-muted">
                        {d.description}
                      </p>
                    </div>
                  </div>
                  {conflicts.length > 0 && (
                    <div
                      className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-amber-700"
                      style={{ fontFamily: MONO_FAMILY }}
                    >
                      <AlertCircle size={10} strokeWidth={1.8} />
                      conflicts: {conflicts.map((c) => c.label).join(", ")}
                    </div>
                  )}
                  <ReactionButtons
                    size="xs"
                    reaction={r}
                    onReact={(next) => reactDessert(d.id, next)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </PanelCard>

      {/* ── Manual add (for items not in catalog) ─────────────────────── */}
      <PanelCard
        icon={<Plus size={14} strokeWidth={1.8} />}
        title="Not in the list?"
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          Your grandmother's secret family recipe, a regional sweet we missed,
          or a specific vendor creation. Add it and it joins your loved list.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addManual();
            }}
            placeholder="e.g. Nani's gajar halwa, or a signature fusion dish"
            className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={addManual}
            disabled={!draftName.trim()}
            className={cn(
              "inline-flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11.5px] font-medium transition-colors",
              draftName.trim()
                ? "bg-ink text-ivory"
                : "bg-ivory-warm text-ink-faint",
            )}
          >
            <Plus size={12} strokeWidth={2} /> Add & love it
          </button>
        </div>
      </PanelCard>
    </div>
  );
}

function allergenConflicts(d: DessertItem, activeIds: string[]) {
  // A dessert "naturally" satisfies a flag if listed in dietary_default.
  // Conflict = active flag is NOT in the dessert's default list.
  const defaults = (d.dietary_default ?? []) as string[];
  return ALLERGEN_OPTIONS.filter(
    (a) => activeIds.includes(a.id) && !defaults.includes(a.id),
  );
}

// ── Loved row ─────────────────────────────────────────────────────────────

function LovedRow({
  item,
  meta,
  activeAllergens,
  onPatch,
  onRemove,
}: {
  item: ResolvedItem;
  meta?: {
    quantity?: string;
    dietary?: AllergenId[];
  };
  activeAllergens: AllergenId[];
  onPatch: (p: { quantity?: string; dietary?: AllergenId[] }) => void;
  onRemove: () => void;
}) {
  const dietary = meta?.dietary ?? [];

  function toggleDietary(id: AllergenId) {
    const next = dietary.includes(id)
      ? dietary.filter((x) => x !== id)
      : [...dietary, id];
    onPatch({ dietary: next });
  }

  return (
    <li className="group py-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-4 flex items-start gap-2">
          <span className="shrink-0 text-xl leading-none">{item.emoji}</span>
          <div className="min-w-0">
            <p className="truncate font-serif text-[14px] text-ink">
              {item.name}
            </p>
            <p className="text-[11.5px] leading-snug text-ink-muted">
              {item.isCustom ? "Your addition" : item.description}
            </p>
          </div>
        </div>
        <div className="md:col-span-3">
          <Eyebrow className="mb-1">Quantity</Eyebrow>
          <input
            type="text"
            value={meta?.quantity ?? ""}
            onChange={(e) => onPatch({ quantity: e.target.value })}
            placeholder="5 kg · 100 pc · 1 station"
            className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
        </div>
        <div className="md:col-span-4">
          <Eyebrow className="mb-1">Dietary flags</Eyebrow>
          <div className="flex flex-wrap gap-1">
            {ALLERGEN_OPTIONS.map((a) => {
              const on = dietary.includes(a.id);
              const conflicts =
                activeAllergens.includes(a.id) && !on;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleDietary(a.id)}
                  className={cn(
                    "rounded-sm border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors",
                    on
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : conflicts
                        ? "border-rose/50 bg-rose-pale/20 text-rose"
                        : "border-border bg-white text-ink-faint hover:text-ink",
                  )}
                  style={{ fontFamily: MONO_FAMILY }}
                  title={
                    conflicts
                      ? `Doesn't meet ${a.label} requirement`
                      : a.label
                  }
                >
                  {a.flag}
                </button>
              );
            })}
          </div>
        </div>
        <div className="md:col-span-1 flex items-center justify-end">
          <button
            type="button"
            onClick={onRemove}
            className="text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
            aria-label="Remove from spread"
          >
            <Trash2 size={12} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </li>
  );
}
