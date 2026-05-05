"use client";

// ── Selection Session 2 · Mithai spread ───────────────────────────────────
// 54-item catalog reactions (love / not_for_me / no_reaction). Loved items
// expand inline to capture quantity, events, dietary flags, signature flag.
// Custom additions for items not in the catalog. Pre-filtered by the
// couple's tradition direction from Vision when present.
//
// Two-way sync: Tab 4 (MithaiBrowserTab) reads the same store, so reactions
// here surface there and vice versa. Autosaves on every reaction (zustand
// store writes are synchronous).

import { useMemo, useState } from "react";
import {
  Heart,
  IceCreamBowl,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
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
import {
  defaultPerGuestQuantity,
} from "@/lib/libraries/sweets-catalog";
import type { WorkspaceCategory } from "@/types/workspace";
import { WEDDING_EVENTS } from "@/types/workspace";

const CATEGORY_LABEL: Record<DessertCategory | "all", string> = {
  all: "All",
  indian: "Indian mithai",
  western: "Western",
  fusion: "Fusion",
};

const CATEGORY_ORDER: Array<DessertCategory | "all"> = [
  "all",
  "indian",
  "western",
  "fusion",
];

export function MithaiSpreadSession({
  category: _category,
}: {
  category: WorkspaceCategory;
  onSkipToNext?: () => void;
}) {
  const reactions = useCakeSweetsStore((s) => s.dessert_catalog);
  const reactDessert = useCakeSweetsStore((s) => s.reactDessert);
  const setMeta = useCakeSweetsStore((s) => s.setDessertMeta);
  const meta = useCakeSweetsStore((s) => s.dessert_meta);
  const addCustom = useCakeSweetsStore((s) => s.addCustomDessert);
  const removeCustom = useCakeSweetsStore((s) => s.removeCustomDessert);

  // Pre-filter from Vision tradition direction. Surface tradition-aligned
  // categories first by default.
  const tradition = useCakeSweetsStore((s) => s.flavor.tradition);
  const defaultCategory: DessertCategory | "all" =
    tradition === "mithai" ? "indian"
      : tradition === "western" ? "western"
      : tradition === "fusion" ? "fusion"
      : "all";

  const [activeCategory, setActiveCategory] = useState<DessertCategory | "all">(
    defaultCategory,
  );
  const [search, setSearch] = useState("");
  const [unseenOnly, setUnseenOnly] = useState(false);
  const [customDraft, setCustomDraft] = useState({ name: "", description: "" });

  const customItems = useMemo(
    () =>
      Object.entries(meta)
        .filter(([, m]) => m.custom)
        .map(([id, m]) => ({
          id,
          name: m.name ?? "(custom)",
          description: m.description ?? "",
          category: "custom" as const,
          dietary_default: undefined,
        })),
    [meta],
  );

  const filtered = useMemo(() => {
    const base: Array<DessertItem | (typeof customItems)[number]> = [
      ...DESSERT_CATALOG.filter(
        (d) => activeCategory === "all" || d.category === activeCategory,
      ),
      ...(activeCategory === "all" ? customItems : []),
    ];
    const term = search.trim().toLowerCase();
    let result = base;
    if (term) {
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          ("description" in d && d.description.toLowerCase().includes(term)),
      );
    }
    if (unseenOnly) {
      result = result.filter((d) => !reactions[d.id]);
    }
    return result;
  }, [activeCategory, search, unseenOnly, reactions, customItems]);

  const lovedCount = useMemo(
    () => Object.values(reactions).filter((r) => r === "love").length,
    [reactions],
  );
  const unseenCount = useMemo(() => {
    const total = DESSERT_CATALOG.length + customItems.length;
    const reacted = Object.keys(reactions).length;
    return total - reacted;
  }, [reactions, customItems]);

  // Loved-items hydration
  const lovedItems = useMemo(() => {
    return Object.entries(reactions)
      .filter(([, r]) => r === "love")
      .map(([id]) => {
        const catalog = DESSERT_CATALOG.find((d) => d.id === id);
        const m = meta[id] ?? {};
        return {
          id,
          name: catalog?.name ?? m.name ?? "(custom)",
          emoji: catalog?.emoji ?? "✨",
          category: catalog?.category ?? "custom",
          isCustom: !!m.custom,
          quantity: m.quantity ?? "",
          dietary: m.dietary ?? [],
        };
      });
  }, [reactions, meta]);

  const indianLoved = lovedItems.filter((x) => x.category === "indian").length;
  const westernLoved = lovedItems.filter((x) => x.category === "western").length;
  const fusionLoved = lovedItems.filter((x) => x.category === "fusion").length;

  function onAddCustom() {
    const name = customDraft.name.trim();
    if (!name) return;
    addCustom(name, customDraft.description.trim() || undefined);
    setCustomDraft({ name: "", description: "" });
  }

  return (
    <div className="space-y-6">
      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Loved" value={lovedCount} />
        <Stat label="Indian" value={indianLoved} />
        <Stat label="Western" value={westernLoved} />
        <Stat label="Fusion" value={fusionLoved} />
      </div>

      {/* Loved items hydration */}
      {lovedItems.length > 0 && (
        <section>
          <SectionHeader title={`Your loved items · ${lovedItems.length}`} eyebrow="Hydrate" />
          <p className="mb-3 text-[12px] text-ink-muted">
            For each loved item, set a per-guest quantity and tag the events
            it'll appear at. These flow into Sessions 3 and 4.
          </p>
          <ul className="space-y-2">
            {lovedItems.map((item) => (
              <LovedItemEditor
                key={item.id}
                item={item}
                onPatch={(patch) => setMeta(item.id, patch)}
                onUnlove={() => {
                  if (item.isCustom) removeCustom(item.id);
                  else reactDessert(item.id, "love"); // toggle off
                }}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Catalog browser */}
      <section>
        <SectionHeader
          title="Catalog"
          eyebrow="Browse"
          right={
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              UNSEEN · {unseenCount}
            </span>
          }
        />

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors",
                activeCategory === c
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-ink",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUnseenOnly((v) => !v)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors",
              unseenOnly
                ? "border-saffron bg-saffron-pale/60 text-saffron"
                : "border-border bg-white text-ink-muted hover:border-saffron",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Unseen only
          </button>
          <div className="ml-auto flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1">
            <Search size={11} className="text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="bg-transparent text-[12px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-4 text-center text-[12px] italic text-ink-faint">
            No items match. Try clearing search or switching categories.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((d) => {
              const r = reactions[d.id];
              return (
                <li
                  key={d.id}
                  className={cn(
                    "rounded-md border bg-white p-3 transition-colors",
                    r === "love"
                      ? "border-rose bg-rose-pale/30"
                      : r === "not_this"
                        ? "border-ink bg-ivory-warm/40 opacity-60"
                        : "border-border",
                  )}
                >
                  <div className="mb-2 flex items-start gap-2">
                    <span className="text-[18px]">{"emoji" in d ? d.emoji : "✨"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-[13.5px] text-ink">
                        {d.name}
                      </p>
                      <p className="line-clamp-2 text-[11px] leading-snug text-ink-muted">
                        {"description" in d ? d.description : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => reactDessert(d.id, "love")}
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] transition-colors",
                        r === "love"
                          ? "border-rose bg-rose text-ivory"
                          : "border-border bg-white text-ink-muted hover:border-rose hover:text-rose",
                      )}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <Heart size={9} strokeWidth={1.8} className={r === "love" ? "fill-ivory" : ""} /> Love
                    </button>
                    <button
                      type="button"
                      onClick={() => reactDessert(d.id, "not_this")}
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] transition-colors",
                        r === "not_this"
                          ? "border-ink bg-ink text-ivory"
                          : "border-border bg-white text-ink-muted hover:border-ink",
                      )}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <X size={9} strokeWidth={1.8} /> Not for me
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Custom additions */}
      <section>
        <SectionHeader title="Not in the list?" eyebrow="Custom additions" />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <input
            value={customDraft.name}
            onChange={(e) => setCustomDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="e.g. Mom's special motichoor"
            className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <input
            value={customDraft.description}
            onChange={(e) =>
              setCustomDraft((d) => ({ ...d, description: e.target.value }))
            }
            placeholder="Short description"
            className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={onAddCustom}
            className="rounded-md bg-ink px-3 py-1.5 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={12} strokeWidth={1.8} className="mr-1 inline" /> Add as loved
          </button>
        </div>
      </section>
    </div>
  );
}

// ─── Loved item editor ───────────────────────────────────────────────────

function LovedItemEditor({
  item,
  onPatch,
  onUnlove,
}: {
  item: {
    id: string;
    name: string;
    emoji: string;
    category: string;
    isCustom: boolean;
    quantity: string;
    dietary: AllergenId[];
  };
  onPatch: (patch: { quantity?: string; dietary?: AllergenId[] }) => void;
  onUnlove: () => void;
}) {
  const defaultQty = `${defaultPerGuestQuantity(item.id)} per guest`;

  return (
    <li className="rounded-md border border-rose/30 bg-rose-pale/15 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[18px]">{item.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[14px] text-ink">{item.name}</p>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {item.category} · {item.isCustom ? "custom" : "catalog"}
          </p>
        </div>
        <input
          value={item.quantity}
          onChange={(e) => onPatch({ quantity: e.target.value })}
          placeholder={defaultQty}
          className="w-[160px] rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <button
          type="button"
          onClick={onUnlove}
          className="text-ink-faint hover:text-rose"
          aria-label="Remove from loved"
        >
          <Trash2 size={12} strokeWidth={1.8} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {ALLERGEN_OPTIONS.map((a) => {
          const active = item.dietary.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                const next = active
                  ? item.dietary.filter((x) => x !== a.id)
                  : [...item.dietary, a.id];
                onPatch({ dietary: next });
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                active
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-border bg-white text-ink-muted hover:border-amber-400",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {a.flag}
            </button>
          );
        })}
      </div>
    </li>
  );
}

// ─── Tiny primitives (mirrored across sessions) ──────────────────────────

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-1 font-serif text-[18px] leading-tight text-ink">{value}</p>
    </div>
  );
}

function SectionHeader({
  title,
  eyebrow,
  right,
}: {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {eyebrow}
          </p>
        )}
        <h4 className="font-serif text-[18px] leading-tight text-ink">
          {title}
        </h4>
      </div>
      {right}
    </header>
  );
}
