"use client";

// ── Cake Design Builder ────────────────────────────────────────────────────
// The wedding cake as a spec, not a list item: tier count + per-tier
// dimensions/flavor/frosting, a live serving calculator, cutting-ceremony
// plan, and allergen flags.
//
// Each tier maps to one WorkspaceItem with block_type: "note",
// tab: "wedding_cake". Meta shape:
//   kind:       "tier" | "ceremony" | "allergen"
//   tierIndex:  0..4   (for tier rows)
//   size:       inches (number)
//   shape:      "round" | "square" | "hexagon"
//   flavor:     string
//   frosting:   "buttercream" | "fondant" | "ganache" | "naked"
//   notes:      string
//
// The ceremony row carries event/time/song/notes. Allergen rows carry
// flags for nut/egg/dairy-free needs.

import { useMemo, useState } from "react";
import {
  Cake,
  CakeSlice,
  Heart,
  Layers,
  Leaf,
  Music,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useCakeSweetsStore } from "@/stores/cake-sweets-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import {
  ALLERGEN_OPTIONS,
  CAKE_INSPIRATIONS,
  SUGGESTED_CUTTING_SONGS,
  type SuggestedSong,
} from "@/lib/cake-sweets-seed";
import { PanelCard, Eyebrow, MiniStat, Tag } from "@/components/workspace/blocks/primitives";
import { ReactionButtons } from "@/components/workspace/cake-sweets/shared/ReactionButtons";
import { cn } from "@/lib/utils";

type TierShape = "round" | "square" | "hexagon";
type Frosting = "buttercream" | "fondant" | "ganache" | "naked";

interface TierMeta {
  kind?: "tier";
  tierIndex?: number;
  size?: number;
  shape?: TierShape;
  flavor?: string;
  frosting?: Frosting;
  notes?: string;
}

interface CeremonyMeta {
  kind?: "ceremony";
  event?: string;
  time?: string;
  song?: string;
  notes?: string;
}

interface AllergenMeta {
  kind?: "allergen";
  nutFree?: boolean;
  eggFree?: boolean;
  dairyFree?: boolean;
  notes?: string;
}

// Wilton-style party-serving estimate (1×2×4 in slices). Close enough
// for planning — cakes are oversized by about 20% in real life to allow
// for wedding-style thin slices.
function servingsFor(size: number, shape: TierShape) {
  if (!size || size <= 0) return 0;
  const sq = size * size;
  // Approximations: round uses area π r², square size², hexagon ~.866·s².
  if (shape === "round") return Math.round((Math.PI * (size / 2) * (size / 2)) / 4);
  if (shape === "hexagon") return Math.round((0.866 * sq) / 4);
  return Math.round(sq / 4);
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

export function CakeDesignBuilder({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  // Shared allergen flags from Vision & Mood carry forward here as warnings.
  const sharedAllergens = useCakeSweetsStore((s) => s.allergens.flags);
  const sharedActiveAllergens = useMemo(
    () =>
      ALLERGEN_OPTIONS.filter((a) => sharedAllergens[a.id]),
    [sharedAllergens],
  );

  const { tiers, ceremony, allergen } = useMemo(() => {
    const relevant = items.filter(
      (i) => i.category_id === category.id && i.tab === "wedding_cake",
    );
    const tiers = relevant
      .filter((i) => (i.meta as TierMeta | undefined)?.kind === "tier")
      .sort((a, b) => {
        const ai = (a.meta as TierMeta).tierIndex ?? 0;
        const bi = (b.meta as TierMeta).tierIndex ?? 0;
        return ai - bi;
      });
    const ceremony = relevant.find(
      (i) => (i.meta as CeremonyMeta | undefined)?.kind === "ceremony",
    );
    const allergen = relevant.find(
      (i) => (i.meta as AllergenMeta | undefined)?.kind === "allergen",
    );
    return { tiers, ceremony, allergen };
  }, [items, category.id]);

  const totalServings = useMemo(
    () =>
      tiers.reduce((acc, t) => {
        const m = t.meta as TierMeta;
        return acc + servingsFor(m.size ?? 0, m.shape ?? "round");
      }, 0),
    [tiers],
  );

  const addTier = () => {
    if (!canEdit) return;
    const nextIndex = tiers.length;
    addItem({
      category_id: category.id,
      tab: "wedding_cake",
      block_type: "note",
      title: `Tier ${nextIndex + 1}`,
      meta: {
        kind: "tier",
        tierIndex: nextIndex,
        size: [6, 8, 10, 12, 14][nextIndex] ?? 6,
        shape: "round" as TierShape,
        frosting: "buttercream" as Frosting,
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
    if (ceremony || !canEdit) return;
    addItem({
      category_id: category.id,
      tab: "wedding_cake",
      block_type: "note",
      title: "Cutting ceremony",
      meta: { kind: "ceremony" },
      sort_order: items.length + 100,
    });
  };

  const ensureAllergen = () => {
    if (allergen || !canEdit) return;
    addItem({
      category_id: category.id,
      tab: "wedding_cake",
      block_type: "note",
      title: "Allergen & dietary notes",
      meta: { kind: "allergen" },
      sort_order: items.length + 200,
    });
  };

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        Spec the cake with the baker — tier sizes, flavor per tier, frosting,
        cutting ceremony, and allergen callouts. The serving estimate is a
        Wilton-style approximation; confirm with the baker before ordering.
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat
          label="Tiers"
          value={tiers.length}
          hint={tiers.length === 0 ? "Add a tier to start" : "planned"}
        />
        <MiniStat
          label="Est. servings"
          value={totalServings}
          hint="Wilton slice"
          tone="saffron"
        />
        <MiniStat
          label="Cutting scheduled"
          value={ceremony?.meta && (ceremony.meta as CeremonyMeta).time ? "Yes" : "—"}
          tone={ceremony?.meta && (ceremony.meta as CeremonyMeta).time ? "sage" : "ink"}
        />
        <MiniStat
          label="Allergen flags"
          value={
            sharedActiveAllergens.length > 0
              ? sharedActiveAllergens.map((a) => a.flag).join(" · ")
              : allergen
                ? [
                    (allergen.meta as AllergenMeta).nutFree && "NF",
                    (allergen.meta as AllergenMeta).eggFree && "EF",
                    (allergen.meta as AllergenMeta).dairyFree && "DF",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "none"
                : "—"
          }
          tone="rose"
          hint={
            sharedActiveAllergens.length > 0
              ? "from Vision & Mood"
              : undefined
          }
        />
      </div>

      {sharedActiveAllergens.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-400 bg-amber-50/60 px-3 py-2">
          <ShieldAlert
            size={14}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-amber-700"
          />
          <p className="text-[12.5px] leading-snug text-amber-800">
            <span className="font-semibold">Allergens active from Vision:</span>{" "}
            {sharedActiveAllergens.map((a) => a.label).join(", ")}. Plan a
            separate tier / batch for affected guests.
          </p>
        </div>
      )}

      <PanelCard
        icon={<Layers size={14} strokeWidth={1.8} />}
        title="Cake tiers"
        badge={
          canEdit && (
            <button
              type="button"
              onClick={addTier}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
            >
              <Plus size={12} strokeWidth={1.8} />
              Add tier
            </button>
          )
        }
      >
        {tiers.length === 0 ? (
          <p className="py-2 text-[12px] italic text-ink-faint">
            No tiers yet. Start with a bottom tier — often 10″ or 12″.
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
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => deleteItem(t.id)}
                        className="text-ink-faint hover:text-rose md:hidden"
                        aria-label="Remove tier"
                      >
                        <Trash2 size={12} strokeWidth={1.8} />
                      </button>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Eyebrow className="mb-1">Size (in)</Eyebrow>
                    <input
                      type="number"
                      min={4}
                      max={24}
                      value={meta.size ?? ""}
                      onChange={(e) =>
                        patchItem(t.id, { size: Number(e.target.value) })
                      }
                      disabled={!canEdit}
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Eyebrow className="mb-1">Shape</Eyebrow>
                    <select
                      value={meta.shape ?? "round"}
                      onChange={(e) =>
                        patchItem(t.id, { shape: e.target.value as TierShape })
                      }
                      disabled={!canEdit}
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                    >
                      {(Object.keys(SHAPE_LABEL) as TierShape[]).map((s) => (
                        <option key={s} value={s}>
                          {SHAPE_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <Eyebrow className="mb-1">Flavor</Eyebrow>
                    <input
                      value={meta.flavor ?? ""}
                      onChange={(e) => patchItem(t.id, { flavor: e.target.value })}
                      placeholder="Cardamom · pistachio cream"
                      disabled={!canEdit}
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Eyebrow className="mb-1">Frosting</Eyebrow>
                    <select
                      value={meta.frosting ?? "buttercream"}
                      onChange={(e) =>
                        patchItem(t.id, { frosting: e.target.value as Frosting })
                      }
                      disabled={!canEdit}
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                    >
                      {(Object.keys(FROSTING_LABEL) as Frosting[]).map((f) => (
                        <option key={f} value={f}>
                          {FROSTING_LABEL[f]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-4 md:col-span-1">
                    <Eyebrow className="mb-1">Serves</Eyebrow>
                    <div
                      className="rounded-sm border border-dashed border-border/60 bg-ivory-warm/40 px-2 py-1 text-center font-mono text-[12px] tabular-nums text-ink"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {servings || "—"}
                    </div>
                  </div>
                  <div className="col-span-8 md:col-span-1 flex items-end justify-end">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => deleteItem(t.id)}
                        className="hidden items-center text-ink-faint hover:text-rose md:inline-flex"
                        aria-label="Remove tier"
                      >
                        <Trash2 size={13} strokeWidth={1.8} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PanelCard>

      <CakeInspirationGallery />

      <CuttingCeremonyCard
        item={ceremony}
        canEdit={canEdit}
        onCreate={ensureCeremony}
        onPatch={(patch) => ceremony && patchItem(ceremony.id, patch)}
      />

      <AllergenCard
        item={allergen}
        canEdit={canEdit}
        onCreate={ensureAllergen}
        onPatch={(patch) => allergen && patchItem(allergen.id, patch)}
      />
    </div>
  );
}

function CuttingCeremonyCard({
  item,
  canEdit,
  onCreate,
  onPatch,
}: {
  item?: WorkspaceItem;
  canEdit: boolean;
  onCreate: () => void;
  onPatch: (patch: Partial<CeremonyMeta>) => void;
}) {
  const meta = (item?.meta ?? {}) as CeremonyMeta;

  return (
    <PanelCard
      icon={<CakeSlice size={14} strokeWidth={1.8} />}
      title="Cutting ceremony"
      badge={
        !item && canEdit ? (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
          >
            <Plus size={12} strokeWidth={1.8} />
            Plan it
          </button>
        ) : undefined
      }
    >
      {!item ? (
        <p className="py-2 text-[12px] italic text-ink-faint">
          Schedule the cutting. The photographer needs two minutes of setup —
          don't surprise them.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Event">
              <input
                value={meta.event ?? ""}
                onChange={(e) => onPatch({ event: e.target.value })}
                placeholder="Reception"
                disabled={!canEdit}
                className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
              />
            </Field>
            <Field label="Time">
              <input
                type="time"
                value={meta.time ?? ""}
                onChange={(e) => onPatch({ time: e.target.value })}
                disabled={!canEdit}
                className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 font-mono text-[12.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </Field>
            <Field label="Photo / lighting note">
              <input
                value={meta.notes ?? ""}
                onChange={(e) => onPatch({ notes: e.target.value })}
                placeholder="Spotlight on cake · photographer 2 min ahead"
                disabled={!canEdit}
                className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
              />
            </Field>
          </div>

          <CuttingSongPicker canEdit={canEdit} />
        </div>
      )}
    </PanelCard>
  );
}

// ── AI music suggestions for the cake-cutting moment ──────────────────────

function CuttingSongPicker({ canEdit }: { canEdit: boolean }) {
  const pick = useCakeSweetsStore((s) => s.cutting_song);
  const pickSong = useCakeSweetsStore((s) => s.pickCuttingSong);
  const clearSong = useCakeSweetsStore((s) => s.clearCuttingSong);
  const tradition = useCakeSweetsStore((s) => s.flavor.tradition);
  const flavorReactions = useCakeSweetsStore((s) => s.flavor.flavor_reactions);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedSong[]>([]);

  const selected = useMemo(
    () => SUGGESTED_CUTTING_SONGS.find((s) => s.id === pick.song_id),
    [pick.song_id],
  );

  // Weight suggestions toward the couple's tradition + flavor vibe.
  function suggest() {
    setLoading(true);
    const lovedFlavors = Object.entries(flavorReactions)
      .filter(([, r]) => r === "love")
      .map(([id]) => id);
    const preferGenre: SuggestedSong["genre"] | null =
      tradition === "mithai"
        ? "bollywood"
        : tradition === "western"
          ? "western"
          : tradition === "fusion"
            ? "fusion"
            : null;
    const isTender =
      lovedFlavors.includes("floral") ||
      lovedFlavors.includes("creamy") ||
      lovedFlavors.includes("spiced");

    setTimeout(() => {
      const pool = [...SUGGESTED_CUTTING_SONGS];
      const scored = pool
        .map((s) => {
          let score = Math.random();
          if (preferGenre && s.genre === preferGenre) score += 1.2;
          if (preferGenre === "fusion" && s.genre !== "bollywood") score += 0.3;
          if (isTender && /tender|soft|intimate|warm|slow/i.test(s.vibe))
            score += 0.6;
          return { s, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((x) => x.s);
      setSuggestions(scored);
      setLoading(false);
    }, 500);
  }

  return (
    <div className="rounded-md border border-gold/25 bg-ivory-warm/40 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <Eyebrow className="mb-0.5 flex items-center gap-1.5">
            <Music size={10} strokeWidth={1.8} /> Cake-cutting song
          </Eyebrow>
          <p className="font-serif text-[14px] italic text-ink">
            What should play when you cut the cake?
          </p>
        </div>
        <button
          type="button"
          onClick={suggest}
          disabled={loading || !canEdit}
          className="inline-flex items-center gap-1 rounded-sm border border-gold/30 bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron transition-colors hover:border-saffron hover:bg-saffron-pale/40 disabled:opacity-40"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Sparkles size={10} strokeWidth={1.8} />
          {loading ? "Tuning…" : suggestions.length ? "Re-suggest" : "Suggest with AI"}
        </button>
      </div>

      {/* Selected / current pick */}
      {(selected || pick.custom_title) && (
        <div className="mb-3 flex items-start justify-between gap-2 rounded-sm border border-rose/40 bg-rose-pale/30 px-2.5 py-2">
          <div className="min-w-0">
            <Eyebrow className="mb-0.5">Your pick</Eyebrow>
            <p className="truncate font-serif text-[14px] text-ink">
              {selected?.title ?? pick.custom_title}
            </p>
            <p className="truncate text-[11.5px] text-ink-muted">
              {selected?.artist ?? pick.custom_artist ?? ""}
              {selected ? ` · ${selected.vibe}` : ""}
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={clearSong}
              className="shrink-0 text-ink-faint hover:text-rose"
              aria-label="Clear pick"
            >
              <Trash2 size={12} strokeWidth={1.8} />
            </button>
          )}
        </div>
      )}

      {suggestions.length > 0 && (
        <ul className="mb-2 space-y-1">
          {suggestions.map((s) => {
            const active = pick.song_id === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() =>
                    pickSong({
                      song_id: active ? undefined : s.id,
                      custom_title: undefined,
                      custom_artist: undefined,
                    })
                  }
                  disabled={!canEdit}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-sm border bg-white px-2.5 py-1.5 text-left transition-colors disabled:opacity-60",
                    active
                      ? "border-rose bg-rose-pale/20"
                      : "border-border hover:border-saffron",
                  )}
                >
                  <Heart
                    size={11}
                    strokeWidth={1.8}
                    className={cn(
                      "mt-1 shrink-0",
                      active ? "fill-rose text-rose" : "text-ink-faint",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[13.5px] text-ink">
                      {s.title}
                    </p>
                    <p className="truncate text-[11px] text-ink-muted">
                      {s.artist} · {s.vibe}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full border border-border bg-white px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {s.genre}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Custom entry */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          type="text"
          value={pick.custom_title ?? ""}
          onChange={(e) =>
            pickSong({ custom_title: e.target.value, song_id: undefined })
          }
          placeholder="Or type your own song title"
          disabled={!canEdit}
          className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
        />
        <input
          type="text"
          value={pick.custom_artist ?? ""}
          onChange={(e) => pickSong({ custom_artist: e.target.value })}
          placeholder="Artist"
          disabled={!canEdit}
          className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
        />
      </div>
      <p
        className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Saves to Music & Entertainment workspace
      </p>
    </div>
  );
}

// ── Cake inspiration gallery ──────────────────────────────────────────────

function CakeInspirationGallery() {
  const cakeReactions = useCakeSweetsStore((s) => s.cake_inspirations);
  const reactCake = useCakeSweetsStore((s) => s.reactCake);
  const [filter, setFilter] = useState<"all" | "loved" | "new">("all");

  const items = useMemo(() => {
    if (filter === "loved")
      return CAKE_INSPIRATIONS.filter((c) => cakeReactions[c.id] === "love");
    if (filter === "new")
      return CAKE_INSPIRATIONS.filter((c) => !cakeReactions[c.id]);
    return CAKE_INSPIRATIONS;
  }, [cakeReactions, filter]);

  const lovedCount = Object.values(cakeReactions).filter(
    (r) => r === "love",
  ).length;

  return (
    <PanelCard
      icon={<Cake size={14} strokeWidth={1.8} />}
      title="Cake inspiration"
      badge={
        <div className="flex flex-wrap items-center gap-1">
          {(["all", "loved", "new"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-sm border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
                filter === f
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-ink",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {f === "loved" ? `Loved · ${lovedCount}` : f === "new" ? "Unseen" : "All"}
            </button>
          ))}
        </div>
      }
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Don't know what you want yet? React to styles — loved cakes feed into
        your moodboard and the baker brief.
      </p>

      {items.length === 0 ? (
        <p className="py-4 text-center text-[12px] italic text-ink-faint">
          {filter === "loved"
            ? "Nothing loved yet — switch to All and react to a few."
            : "You've reacted to every style. Try All or Loved."}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((c) => {
            const r = cakeReactions[c.id];
            return (
              <li
                key={c.id}
                className={cn(
                  "group overflow-hidden rounded-md ring-1 transition-opacity",
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
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
                <div className="space-y-1.5 border-t border-border bg-white px-2 py-2">
                  <p className="font-serif text-[13.5px] leading-tight text-ink">
                    {c.name}
                  </p>
                  <p className="text-[11px] leading-snug text-ink-muted">
                    {c.description}
                  </p>
                  <ReactionButtons
                    size="xs"
                    reaction={r}
                    onReact={(next) => reactCake(c.id, next)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}

function AllergenCard({
  item,
  canEdit,
  onCreate,
  onPatch,
}: {
  item?: WorkspaceItem;
  canEdit: boolean;
  onCreate: () => void;
  onPatch: (patch: Partial<AllergenMeta>) => void;
}) {
  const meta = (item?.meta ?? {}) as AllergenMeta;

  return (
    <PanelCard
      icon={<ShieldAlert size={14} strokeWidth={1.8} />}
      title="Allergen & dietary"
      badge={
        !item && canEdit ? (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
          >
            <Plus size={12} strokeWidth={1.8} />
            Add notes
          </button>
        ) : undefined
      }
    >
      {!item ? (
        <p className="py-2 text-[12px] italic text-ink-faint">
          Flag nut, egg, or dairy-free needs so the baker plans a separate
          tier or gluten-safe setup.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <AllergenToggle
              label="Nut-free tier"
              icon={<Leaf size={11} strokeWidth={1.8} />}
              active={!!meta.nutFree}
              onToggle={() => onPatch({ nutFree: !meta.nutFree })}
              canEdit={canEdit}
            />
            <AllergenToggle
              label="Egg-free"
              active={!!meta.eggFree}
              onToggle={() => onPatch({ eggFree: !meta.eggFree })}
              canEdit={canEdit}
            />
            <AllergenToggle
              label="Dairy-free"
              active={!!meta.dairyFree}
              onToggle={() => onPatch({ dairyFree: !meta.dairyFree })}
              canEdit={canEdit}
            />
          </div>
          <div>
            <Eyebrow className="mb-1">Notes</Eyebrow>
            <textarea
              value={meta.notes ?? ""}
              onChange={(e) => onPatch({ notes: e.target.value })}
              placeholder="Nut-allergy count from Catering dietary atlas: 4. Keep nut tier on separate stand."
              disabled={!canEdit}
              rows={2}
              className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>
      )}
    </PanelCard>
  );
}

function AllergenToggle({
  label,
  icon,
  active,
  onToggle,
  canEdit,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onToggle: () => void;
  canEdit: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!canEdit}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? "border border-amber-400 bg-amber-50 text-amber-700"
          : "border border-border bg-white text-ink-faint hover:text-ink",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {icon}
      {label}
    </button>
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
    <div className="space-y-1.5">
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}
