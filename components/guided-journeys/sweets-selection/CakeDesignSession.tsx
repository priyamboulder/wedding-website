"use client";

// ── Selection Session 1 · Cake design ─────────────────────────────────────
// Has-cake gate, tier-by-tier cake spec (writes through workspace-store
// items), cutting ceremony scheduling, and the 12-card cake-style
// inspiration grid (writes through cake-sweets-store.cake_inspirations).
//
// Two-way sync: Tab 3 (CakeDesignBuilder) reads the same items, so any
// edit here surfaces there and vice versa.

import { useMemo, useState } from "react";
import {
  Cake,
  CakeSlice,
  Heart,
  Layers,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useCakeSweetsStore } from "@/stores/cake-sweets-store";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  CAKE_INSPIRATIONS,
  ALLERGEN_OPTIONS,
} from "@/lib/cake-sweets-seed";
import {
  CAKE_STYLE_CARDS,
  type CakeStyle,
} from "@/lib/guided-journeys/sweets-selection";
import { servingsFor, type TierShape } from "@/lib/calculators/wilton-servings";

type Frosting = "buttercream" | "fondant" | "ganache" | "naked";

interface TierMeta {
  kind?: "tier";
  tierIndex?: number;
  size?: number;
  shape?: TierShape;
  flavor?: string;
  frosting?: Frosting;
  allergen_flags?: string[];
  is_signature?: boolean;
  notes?: string;
}

interface CeremonyMeta {
  kind?: "ceremony";
  event?: string;
  time?: string;
  notes?: string;
  photographer_minutes?: number;
}

const FROSTING_LABEL: Record<Frosting, string> = {
  buttercream: "Buttercream",
  fondant: "Fondant",
  ganache: "Ganache",
  naked: "Naked / semi-naked",
};

const SHAPE_LABEL: Record<TierShape, string> = {
  round: "Round",
  square: "Square",
  hexagon: "Hexagon",
};

export function CakeDesignSession({
  category,
  onSkipToNext,
}: {
  category: WorkspaceCategory;
  onSkipToNext?: () => void;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);

  const [hasCakeOverride, setHasCakeOverride] = useState<boolean | null>(null);

  const { tiers, ceremony } = useMemo(() => {
    const relevant = items.filter(
      (i) => i.category_id === category.id && i.tab === "wedding_cake",
    );
    const tiers = relevant
      .filter((i) => (i.meta as TierMeta | undefined)?.kind === "tier")
      .sort(
        (a, b) =>
          ((a.meta as TierMeta).tierIndex ?? 0) -
          ((b.meta as TierMeta).tierIndex ?? 0),
      );
    const ceremony = relevant.find(
      (i) => (i.meta as CeremonyMeta | undefined)?.kind === "ceremony",
    );
    return { tiers, ceremony };
  }, [items, category.id]);

  // has_cake derived: explicit override → that value. Otherwise infer from
  // existing tiers (any tier = yes; none = unset, prompt the user).
  const hasCakeInferred = hasCakeOverride ?? (tiers.length > 0 ? true : null);

  const totalServings = useMemo(
    () =>
      tiers.reduce((acc, t) => {
        const m = t.meta as TierMeta;
        return acc + servingsFor(m.size ?? 0, m.shape ?? "round");
      }, 0),
    [tiers],
  );

  const allergenSummary = useMemo(() => {
    const set = new Set<string>();
    for (const t of tiers) {
      const m = t.meta as TierMeta;
      for (const f of m.allergen_flags ?? []) set.add(f);
    }
    return Array.from(set);
  }, [tiers]);

  const sharedAllergens = useCakeSweetsStore((s) => s.allergens.flags);
  const setAllergenNotes = useCakeSweetsStore((s) => s.setAllergenNotes);
  const allergenNotes = useCakeSweetsStore((s) => s.allergens.notes);
  const toggleAllergen = useCakeSweetsStore((s) => s.toggleAllergen);

  const addTier = () => {
    const nextIndex = tiers.length;
    addItem({
      category_id: category.id,
      tab: "wedding_cake",
      block_type: "note",
      title: `Tier ${nextIndex + 1}`,
      meta: {
        kind: "tier",
        tierIndex: nextIndex,
        size: [12, 10, 8, 6, 4][nextIndex] ?? 6,
        shape: "round" as TierShape,
        frosting: "buttercream" as Frosting,
        allergen_flags: [],
        is_signature: nextIndex === tiers.length, // newest = signature suggestion
      },
      sort_order: items.length + 1,
    });
  };

  const patchItem = (id: string, patch: Record<string, unknown>) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    updateItem(id, { meta: { ...(it.meta ?? {}), ...patch } });
  };

  const ensureCeremony = () => {
    if (ceremony) return;
    addItem({
      category_id: category.id,
      tab: "wedding_cake",
      block_type: "note",
      title: "Cutting ceremony",
      meta: {
        kind: "ceremony",
        event: "reception",
        photographer_minutes: 2,
      },
      sort_order: items.length + 100,
    });
  };

  // ── Has-cake gate ──────────────────────────────────────────────────────
  if (hasCakeInferred === false) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-rose/30 bg-rose-pale/30 px-4 py-4">
          <p className="font-serif text-[16px] italic text-ink">
            Going mithai-only — let&apos;s pick those next.
          </p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Many South Asian weddings skip the Western tiered cake entirely.
            We&apos;ll jump to the mithai catalog.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSkipToNext?.()}
              className="rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
            >
              Continue to mithai →
            </button>
            <button
              type="button"
              onClick={() => setHasCakeOverride(true)}
              className="rounded-md border border-border bg-white px-4 py-2 text-[12.5px] text-ink-muted hover:border-saffron/40"
            >
              Actually, we want a cake
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (hasCakeInferred === null) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-border bg-white px-4 py-4">
          <p className="font-serif text-[16px] italic text-ink">
            Are you having a wedding cake?
          </p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Some couples skip the cake entirely and lean fully into mithai.
            Either is great — and we tailor the rest of the journey to match.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setHasCakeOverride(true)}
              className="rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
            >
              Yes — let&apos;s design it
            </button>
            <button
              type="button"
              onClick={() => setHasCakeOverride(false)}
              className="rounded-md border border-border bg-white px-4 py-2 text-[12.5px] text-ink-muted hover:border-saffron/40"
            >
              No cake — mithai only
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Tiers" value={tiers.length} hint={tiers.length === 0 ? "Add a tier" : "planned"} />
        <Stat label="Est. servings" value={totalServings} hint="Wilton slice" />
        <Stat
          label="Cutting time"
          value={
            ceremony && (ceremony.meta as CeremonyMeta).time
              ? (ceremony.meta as CeremonyMeta).time!
              : "—"
          }
        />
        <Stat
          label="Tier allergens"
          value={
            allergenSummary.length > 0 ? `${allergenSummary.length} flag${allergenSummary.length === 1 ? "" : "s"}` : "—"
          }
        />
      </div>

      {/* Cake style cards */}
      <CakeStyleCards />

      {/* Tier list */}
      <section>
        <SectionHeader
          title="Tiers"
          eyebrow="Step 1"
          right={
            <button
              type="button"
              onClick={addTier}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
            >
              <Plus size={12} strokeWidth={1.8} />
              Add tier
            </button>
          }
        />
        {tiers.length === 0 ? (
          <p className="py-2 text-[12px] italic text-ink-faint">
            No tiers yet. Start with a 10″ or 12″ bottom.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {tiers.map((t, i) => {
              const meta = (t.meta ?? {}) as TierMeta;
              const servings = servingsFor(meta.size ?? 0, meta.shape ?? "round");
              return (
                <li key={t.id} className="grid grid-cols-12 gap-2 py-3">
                  <div className="col-span-12 flex items-center justify-between md:col-span-1">
                    <span
                      className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      T{i + 1}
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-1">
                    <Eyebrow>Size (in)</Eyebrow>
                    <input
                      type="number"
                      min={4}
                      max={24}
                      value={meta.size ?? ""}
                      onChange={(e) => patchItem(t.id, { size: Number(e.target.value) })}
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Eyebrow>Shape</Eyebrow>
                    <select
                      value={meta.shape ?? "round"}
                      onChange={(e) => patchItem(t.id, { shape: e.target.value as TierShape })}
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
                    >
                      {(Object.keys(SHAPE_LABEL) as TierShape[]).map((s) => (
                        <option key={s} value={s}>
                          {SHAPE_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <Eyebrow>Flavor</Eyebrow>
                    <input
                      value={meta.flavor ?? ""}
                      onChange={(e) => patchItem(t.id, { flavor: e.target.value })}
                      placeholder="Cardamom · pistachio cream"
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Eyebrow>Frosting</Eyebrow>
                    <select
                      value={meta.frosting ?? "buttercream"}
                      onChange={(e) => patchItem(t.id, { frosting: e.target.value as Frosting })}
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
                    >
                      {(Object.keys(FROSTING_LABEL) as Frosting[]).map((f) => (
                        <option key={f} value={f}>
                          {FROSTING_LABEL[f]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3 md:col-span-1">
                    <Eyebrow>Serves</Eyebrow>
                    <div
                      className="rounded-sm border border-dashed border-border/60 bg-ivory-warm/40 px-2 py-1 text-center font-mono text-[12px] tabular-nums text-ink"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {servings || "—"}
                    </div>
                  </div>
                  <div className="col-span-3 md:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => patchItem(t.id, { is_signature: !meta.is_signature })}
                      title={meta.is_signature ? "Marked as signature" : "Mark as signature"}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-sm border",
                        meta.is_signature
                          ? "border-rose bg-rose text-ivory"
                          : "border-border bg-white text-ink-faint hover:border-rose hover:text-rose",
                      )}
                    >
                      <Heart size={11} strokeWidth={1.8} className={meta.is_signature ? "fill-ivory" : ""} />
                    </button>
                  </div>
                  <div className="col-span-6 md:col-span-1 flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => deleteItem(t.id)}
                      className="text-ink-faint hover:text-rose"
                      aria-label="Remove tier"
                    >
                      <Trash2 size={12} strokeWidth={1.8} />
                    </button>
                  </div>
                  <div className="col-span-12">
                    <Eyebrow>Per-tier dietary flags</Eyebrow>
                    <div className="flex flex-wrap gap-1">
                      {ALLERGEN_OPTIONS.map((a) => {
                        const active = (meta.allergen_flags ?? []).includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              const cur = meta.allergen_flags ?? [];
                              const next = active
                                ? cur.filter((x) => x !== a.id)
                                : [...cur, a.id];
                              patchItem(t.id, { allergen_flags: next });
                              // Cascade up to workspace-level flags as a union
                              if (!active && !sharedAllergens[a.id]) {
                                toggleAllergen(a.id);
                              }
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
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Cutting ceremony */}
      <section>
        <SectionHeader
          title="Cutting ceremony"
          eyebrow="Step 2"
          right={
            !ceremony ? (
              <button
                type="button"
                onClick={ensureCeremony}
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
              >
                <Plus size={12} strokeWidth={1.8} /> Plan it
              </button>
            ) : null
          }
        />
        {!ceremony ? (
          <p className="py-2 text-[12px] italic text-ink-faint">
            Schedule the cutting. The photographer needs ~2 minutes of setup.
          </p>
        ) : (
          <CeremonyEditor
            ceremony={ceremony}
            onPatch={(patch) => patchItem(ceremony.id, patch)}
          />
        )}
      </section>

      {/* Inspiration grid */}
      <CakeInspirationGrid />

      {/* Allergen freeform */}
      <section>
        <SectionHeader
          title="Per-tier allergen notes"
          eyebrow="Step 3"
        />
        <textarea
          value={allergenNotes}
          onChange={(e) => setAllergenNotes(e.target.value)}
          placeholder="Bottom tier nut-free for grandmother. Top tier gluten-free for cousin Riya."
          rows={2}
          className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        {(allergenSummary.length > 0 ||
          Object.values(sharedAllergens).some(Boolean)) && (
          <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-400 bg-amber-50/60 px-3 py-2">
            <ShieldAlert size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-amber-700" />
            <p className="text-[12px] leading-snug text-amber-800">
              <span className="font-semibold">Allergen separation flagged.</span>{" "}
              The baker should plan separate batches for tiers with extra
              dietary flags.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Cake style cards ────────────────────────────────────────────────────

function CakeStyleCards() {
  const [pick, setPick] = useState<CakeStyle | null>(null);
  return (
    <section>
      <SectionHeader title="Cake style" eyebrow="Direction" />
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {CAKE_STYLE_CARDS.map((card) => {
          const active = pick === card.id;
          return (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => setPick(active ? null : card.id)}
                className={cn(
                  "flex h-full w-full flex-col items-start gap-1 rounded-md border bg-white p-3 text-left transition-colors",
                  active
                    ? "border-saffron bg-saffron-pale/40"
                    : "border-border hover:border-saffron",
                )}
              >
                <span className="font-serif text-[14px] text-ink">
                  <span className="mr-1.5">{card.emoji}</span>
                  {card.label}
                </span>
                <span className="text-[11.5px] leading-snug text-ink-muted">
                  {card.description}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Cake inspiration grid ───────────────────────────────────────────────

function CakeInspirationGrid() {
  const reactions = useCakeSweetsStore((s) => s.cake_inspirations);
  const reactCake = useCakeSweetsStore((s) => s.reactCake);

  return (
    <section>
      <SectionHeader title="Style inspiration" eyebrow="Step 4" />
      <p className="mb-3 text-[12px] text-ink-muted">
        React to styles — loved cakes feed into your moodboard.
      </p>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {CAKE_INSPIRATIONS.map((c) => {
          const r = reactions[c.id];
          return (
            <li
              key={c.id}
              className={cn(
                "overflow-hidden rounded-md ring-1 transition-opacity",
                r === "not_this"
                  ? "opacity-50 ring-border"
                  : r === "love"
                    ? "ring-rose"
                    : "ring-border",
              )}
            >
              <div className="relative aspect-[4/3] bg-ivory-warm">
                <img
                  src={c.image_url}
                  alt={c.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {r === "love" && (
                  <span
                    className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full border border-rose bg-rose px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ivory"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Heart size={9} strokeWidth={1.8} className="fill-ivory" /> Love
                  </span>
                )}
              </div>
              <div className="space-y-1 border-t border-border bg-white px-2 py-2">
                <p className="font-serif text-[13px] leading-tight text-ink">
                  {c.name}
                </p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => reactCake(c.id, "love")}
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
                    onClick={() => reactCake(c.id, "not_this")}
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
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Ceremony editor ─────────────────────────────────────────────────────

function CeremonyEditor({
  ceremony,
  onPatch,
}: {
  ceremony: { id: string; meta?: unknown };
  onPatch: (patch: Partial<CeremonyMeta>) => void;
}) {
  const meta = (ceremony.meta ?? {}) as CeremonyMeta;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field label="Event">
        <select
          value={meta.event ?? "reception"}
          onChange={(e) => onPatch({ event: e.target.value })}
          className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
        >
          <option value="reception">Reception</option>
          <option value="sangeet">Sangeet</option>
          <option value="wedding">Wedding</option>
          <option value="other">Other</option>
        </select>
      </Field>
      <Field label="Time">
        <input
          type="time"
          value={meta.time ?? ""}
          onChange={(e) => onPatch({ time: e.target.value })}
          className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 font-mono text-[12.5px] text-ink focus:border-saffron focus:outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </Field>
      <Field label="Photographer setup (min)">
        <input
          type="number"
          min={0}
          max={15}
          value={meta.photographer_minutes ?? 2}
          onChange={(e) => onPatch({ photographer_minutes: Number(e.target.value) })}
          className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 font-mono text-[12.5px] text-ink focus:border-saffron focus:outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </Field>
      <Field label="Notes">
        <input
          value={meta.notes ?? ""}
          onChange={(e) => onPatch({ notes: e.target.value })}
          placeholder="Just bride and groom · with parents · after speeches"
          className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      </Field>
    </div>
  );
}

// ─── Tiny primitives ─────────────────────────────────────────────────────

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-1 font-serif text-[18px] leading-tight text-ink">
        {value}
      </p>
      {hint && <p className="text-[11px] text-ink-muted">{hint}</p>}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}
