"use client";

// ── Build Session 1 · Welcome bags inventory ─────────────────────────────
// Mirrors Tab 3 of the Gifting workspace. Walks the couple through the
// welcome-bag plan (quantity tied to room block, theme, delivery), the
// per-item inventory (with sourcing lifecycle), and an assembly plan.
//
// Storage strategy:
//   • bag_items[] live as WorkspaceItems (category=gifting, tab=
//     welcome_bags) — same source as Tab 3, so edits round-trip without
//     copy-and-paste.
//   • bag_plan + assembly + computed live in journey form_data.

import { useEffect, useMemo } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  GIFTING_BUILD_CATEGORY,
  GIFTING_BUILD_JOURNEY_ID,
  SOURCING_STATUS_LABEL,
  type SourcingStatus,
  type WelcomeBagItem,
  type WelcomeBagItemCategory,
  type WelcomeBagPlan,
  type WelcomeBagAssembly,
  type WelcomeBagsComputed,
  type WelcomeBagsFormData,
} from "@/lib/guided-journeys/gifting-build";
import {
  compareAgainstAnchor,
  bandLabel,
  bandTone,
} from "@/lib/calculators/budget-anchor-comparison";
import {
  liftLovedIdeas,
  type LovedIdeaReaction,
} from "@/lib/guided-journeys/lift-loved-ideas";
import { cn } from "@/lib/utils";
import type { WorkspaceCategory } from "@/types/workspace";

const SOURCING_OPTIONS: SourcingStatus[] = [
  "wishlist",
  "sourcing",
  "ordered",
  "received",
  "packed",
];

const ITEM_CATEGORY_OPTIONS: WelcomeBagItemCategory[] = [
  "practical",
  "reusable",
  "edible",
  "cultural",
  "local",
  "informational",
  "fun",
];

const QTY_BASIS_OPTIONS: Array<{
  value: WelcomeBagPlan["quantity_basis"];
  label: string;
}> = [
  { value: "one_per_room", label: "One per room (recommended)" },
  { value: "one_per_guest", label: "One per guest" },
  { value: "one_per_family", label: "One per family unit" },
  { value: "custom", label: "Custom" },
];

const DELIVERY_OPTIONS: Array<{
  value: WelcomeBagPlan["delivery_plan"];
  label: string;
}> = [
  { value: "hotel_drop_off", label: "Drop at hotel front desk" },
  { value: "in_room_placement", label: "In-room placement (concierge)" },
  { value: "check_in_handoff", label: "Hand off at check-in" },
  { value: "tbd", label: "TBD" },
];

function emptyPlan(): WelcomeBagPlan {
  return {
    quantity_basis: "one_per_room",
    quantity_total: 0,
    delivery_plan: "tbd",
  };
}

function emptyAssembly(): WelcomeBagAssembly {
  return {
    helpers_needed: 2,
    helpers_assigned: [],
  };
}

export function WelcomeBagsSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const [state, update] = useCategoryJourneyState(
    GIFTING_BUILD_CATEGORY,
    GIFTING_BUILD_JOURNEY_ID,
  );
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);

  const visionData = state.formData["gifting_inspiration"] as
    | { idea_reactions?: LovedIdeaReaction[] }
    | undefined;
  const visionPhilosophy = state.formData["gifting_philosophy"] as
    | { budget_anchors?: { welcome_bags_per_bag?: string } }
    | undefined;
  const sessionData =
    (state.formData["welcome_bags"] as unknown as
      | WelcomeBagsFormData
      | undefined) ?? {
      bag_plan: emptyPlan(),
      bag_items: [],
      assembly: emptyAssembly(),
    };

  // Pull the rooms-blocked total from Travel & Accommodations Build.
  const travelRooms = useWorkspaceStore((s) => {
    let total = 0;
    for (const it of s.items) {
      if (it.tab !== "accommodations") continue;
      const meta = it.meta as { rooms_blocked?: number; kind?: string };
      if (meta.kind === "hotel_block" && typeof meta.rooms_blocked === "number") {
        total += meta.rooms_blocked;
      }
    }
    return total;
  });
  const fallbackGuestCount =
    useAuthStore((s) => s.user?.wedding?.guestCount ?? null) ?? 0;

  // Pre-seed quantity_total from travel data on first hydration.
  useEffect(() => {
    if (sessionData.bag_plan.quantity_total > 0) return;
    const seed = travelRooms > 0 ? travelRooms : fallbackGuestCount;
    if (seed > 0) {
      update((s) =>
        setSessionFormPath(
          s,
          "welcome_bags",
          "bag_plan.quantity_total",
          seed,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelRooms, fallbackGuestCount]);

  // The bag_items below come from WorkspaceItems (category, tab=welcome_bags).
  // Items with reaction === "not_this" are hidden (couple dismissed them).
  const bagItems = useMemo(
    () =>
      items
        .filter((i) => i.category_id === category.id && i.tab === "welcome_bags")
        .filter((i) => (i.meta as { reaction?: string }).reaction !== "not_this")
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, category.id],
  );

  // Pre-seed loved ideas from Vision once. We dedupe by source_idea_id stored
  // on each WorkspaceItem's meta.ideaId.
  useEffect(() => {
    const reactions = visionData?.idea_reactions ?? [];
    const existingIds = new Set(
      bagItems
        .map((it) => (it.meta as { ideaId?: string }).ideaId)
        .filter((x): x is string => Boolean(x)),
    );
    const lifted = liftLovedIdeas(reactions, "welcome_bags", existingIds);
    if (lifted.length === 0) return;
    for (const draft of lifted) {
      addItem({
        category_id: category.id,
        tab: "welcome_bags",
        block_type: "note",
        title: draft.item_label,
        meta: {
          ideaId: draft.source_idea_id,
          reaction: "love",
          qty: 1,
          unitCost: draft.cost_per_unit ?? 0,
          status: "planned",
          vendor: "",
          sourcing_status: "wishlist" as SourcingStatus,
          item_category: "practical" as WelcomeBagItemCategory,
          source_idea_id: draft.source_idea_id,
          reuses_loved_idea: true,
          custom_note: draft.custom_note,
        },
        sort_order: bagItems.length + 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visionData?.idea_reactions]);

  const bagPlan = sessionData.bag_plan;
  const effectiveTotal = bagPlan.quantity_override ?? bagPlan.quantity_total;
  const assembly = sessionData.assembly;

  // Compute live totals.
  const computed: WelcomeBagsComputed = useMemo(() => {
    const breakdown = {
      wishlist: 0,
      sourcing: 0,
      ordered: 0,
      received: 0,
      packed: 0,
    };
    let totalItems = 0;
    let totalCost = 0;
    for (const it of bagItems) {
      const m = it.meta as {
        sourcing_status?: SourcingStatus;
        qty?: number;
        unitCost?: number;
      };
      const qty = m.qty ?? 1;
      const unit = m.unitCost ?? 0;
      const status = m.sourcing_status ?? "wishlist";
      breakdown[status] += 1;
      totalItems += qty;
      totalCost += qty * unit * effectiveTotal;
    }
    const costPerBag = effectiveTotal > 0 ? totalCost / effectiveTotal : 0;
    const cmp = compareAgainstAnchor(
      costPerBag,
      visionPhilosophy?.budget_anchors?.welcome_bags_per_bag,
    );
    const band: WelcomeBagsComputed["cost_vs_budget_anchor"] =
      cmp.band === "no_anchor" ? "on_target" : cmp.band;
    return {
      total_items_across_bags: totalItems * effectiveTotal,
      total_estimated_cost: totalCost,
      cost_per_bag: costPerBag,
      cost_vs_budget_anchor: band,
      sourcing_status_breakdown: breakdown,
    };
  }, [bagItems, effectiveTotal, visionPhilosophy?.budget_anchors?.welcome_bags_per_bag]);

  // Persist computed back to form_data so the completion banner / sync can
  // read it without recomputing from scratch.
  useEffect(() => {
    update((s) => setSessionFormPath(s, "welcome_bags", "computed", computed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed.total_estimated_cost, computed.cost_per_bag]);

  const updatePlan = (patch: Partial<WelcomeBagPlan>) => {
    update((s) =>
      setSessionFormPath(s, "welcome_bags", "bag_plan", {
        ...bagPlan,
        ...patch,
      }),
    );
  };

  const updateAssembly = (patch: Partial<WelcomeBagAssembly>) => {
    update((s) =>
      setSessionFormPath(s, "welcome_bags", "assembly", {
        ...assembly,
        ...patch,
      }),
    );
  };

  const addBagItem = () => {
    addItem({
      category_id: category.id,
      tab: "welcome_bags",
      block_type: "note",
      title: "New item",
      meta: {
        qty: 1,
        unitCost: 0,
        status: "planned",
        sourcing_status: "wishlist" as SourcingStatus,
        item_category: "practical" as WelcomeBagItemCategory,
        reuses_loved_idea: false,
      },
      sort_order: bagItems.length + 1,
    });
  };

  const patchBagItem = (id: string, patch: Record<string, unknown>) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    if ("title" in patch) {
      const { title, ...metaPatch } = patch;
      updateItem(id, {
        title: typeof title === "string" ? title : it.title,
        meta: { ...(it.meta ?? {}), ...metaPatch },
      });
    } else {
      updateItem(id, { meta: { ...(it.meta ?? {}), ...patch } });
    }
  };

  return (
    <div className="space-y-6">
      <BagPlanBlock
        plan={bagPlan}
        roomsFromTravel={travelRooms}
        fallbackGuestCount={fallbackGuestCount}
        onChange={updatePlan}
      />

      <BagItemsBlock
        items={bagItems}
        onAdd={addBagItem}
        onPatch={patchBagItem}
        onRemove={deleteItem}
      />

      <AssemblyBlock assembly={assembly} onChange={updateAssembly} />

      <SummaryBlock
        computed={computed}
        anchorChip={visionPhilosophy?.budget_anchors?.welcome_bags_per_bag}
      />
    </div>
  );
}

// ─── Plan block ──────────────────────────────────────────────────────────

function BagPlanBlock({
  plan,
  roomsFromTravel,
  fallbackGuestCount,
  onChange,
}: {
  plan: WelcomeBagPlan;
  roomsFromTravel: number;
  fallbackGuestCount: number;
  onChange: (p: Partial<WelcomeBagPlan>) => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Bag plan
        </p>
        <h3 className="mt-1 font-serif text-xl text-ink">
          How many bags, what's the theme, how do they get to the guest?
        </h3>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Quantity basis">
          <select
            value={plan.quantity_basis}
            onChange={(e) =>
              onChange({
                quantity_basis: e.target.value as WelcomeBagPlan["quantity_basis"],
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {QTY_BASIS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Total bags (rooms in block: ${roomsFromTravel || "—"} · guests: ${fallbackGuestCount || "—"})`}>
          <input
            type="number"
            min={0}
            value={plan.quantity_override ?? plan.quantity_total}
            onChange={(e) => {
              const n = e.target.value === "" ? 0 : Number(e.target.value);
              if (Number.isNaN(n)) return;
              onChange({ quantity_override: n });
            }}
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Bag theme">
          <input
            type="text"
            value={plan.bag_theme ?? ""}
            onChange={(e) => onChange({ bag_theme: e.target.value })}
            placeholder="DFW with love · South Asian welcome · Heritage homecoming"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Delivery plan">
          <select
            value={plan.delivery_plan}
            onChange={(e) =>
              onChange({
                delivery_plan: e.target.value as WelcomeBagPlan["delivery_plan"],
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {DELIVERY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Delivery coordinator">
          <input
            type="text"
            value={plan.delivery_coordinator ?? ""}
            onChange={(e) => onChange({ delivery_coordinator: e.target.value })}
            placeholder="Sister-in-law · Hotel concierge"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
      </div>
    </section>
  );
}

// ─── Items block ─────────────────────────────────────────────────────────

function BagItemsBlock({
  items,
  onAdd,
  onPatch,
  onRemove,
}: {
  items: ReturnType<typeof useWorkspaceStore.getState>["items"];
  onAdd: () => void;
  onPatch: (id: string, patch: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Bag items
          </p>
          <h3 className="mt-1 font-serif text-xl text-ink">
            What's inside each bag?
          </h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} />
          Add item
        </button>
      </header>
      {items.length === 0 ? (
        <p className="py-2 text-[12.5px] italic text-ink-muted">
          No items yet — loved ideas from Vision will surface here, or add one
          manually with the button above.
        </p>
      ) : (
        <ul className="divide-y divide-ink/10">
          {items.map((it) => {
            const m = it.meta as {
              qty?: number;
              unitCost?: number;
              vendor?: string;
              sourcing_status?: SourcingStatus;
              item_category?: WelcomeBagItemCategory;
              custom_note?: string;
              reuses_loved_idea?: boolean;
            };
            return (
              <li key={it.id} className="py-3">
                <div className="grid gap-2 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <input
                      value={it.title}
                      onChange={(e) => onPatch(it.id, { title: e.target.value })}
                      placeholder="Item name"
                      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] font-medium text-ink"
                    />
                    {m.reuses_loved_idea && (
                      <span className="mt-1 inline-block rounded-full bg-rose-pale/60 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-rose">
                        Lifted from Vision
                      </span>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      min={1}
                      value={m.qty ?? 1}
                      onChange={(e) =>
                        onPatch(it.id, { qty: Number(e.target.value) || 1 })
                      }
                      placeholder="Qty / bag"
                      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      min={0}
                      value={m.unitCost ?? 0}
                      onChange={(e) =>
                        onPatch(it.id, {
                          unitCost: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="$ / unit"
                      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <select
                      value={m.item_category ?? "practical"}
                      onChange={(e) =>
                        onPatch(it.id, {
                          item_category: e.target.value as WelcomeBagItemCategory,
                        })
                      }
                      className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1 text-[12px]"
                    >
                      {ITEM_CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-1">
                    <select
                      value={m.sourcing_status ?? "wishlist"}
                      onChange={(e) =>
                        onPatch(it.id, {
                          sourcing_status: e.target.value as SourcingStatus,
                        })
                      }
                      className="flex-1 rounded-md border border-ink/15 bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink"
                    >
                      {SOURCING_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {SOURCING_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onRemove(it.id)}
                      aria-label="Remove"
                      className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ─── Assembly block ──────────────────────────────────────────────────────

function AssemblyBlock({
  assembly,
  onChange,
}: {
  assembly: WelcomeBagAssembly;
  onChange: (p: Partial<WelcomeBagAssembly>) => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Assembly plan
        </p>
        <h3 className="mt-1 font-serif text-xl text-ink">
          Where, when, and who's stuffing the bags?
        </h3>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Assembly location">
          <input
            type="text"
            value={assembly.assembly_location ?? ""}
            onChange={(e) => onChange({ assembly_location: e.target.value })}
            placeholder="Bride's parents' house"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Assembly date">
          <input
            type="date"
            value={assembly.assembly_date ?? ""}
            onChange={(e) =>
              onChange({ assembly_date: e.target.value || undefined })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Helpers needed">
          <input
            type="number"
            min={0}
            value={assembly.helpers_needed}
            onChange={(e) =>
              onChange({ helpers_needed: Number(e.target.value) || 0 })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Estimated assembly hours">
          <input
            type="number"
            min={0}
            step={0.5}
            value={assembly.estimated_assembly_hours ?? ""}
            onChange={(e) =>
              onChange({
                estimated_assembly_hours: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
      </div>
    </section>
  );
}

// ─── Summary ─────────────────────────────────────────────────────────────

function SummaryBlock({
  computed,
  anchorChip,
}: {
  computed: WelcomeBagsComputed;
  anchorChip?: string;
}) {
  const overBudget = computed.cost_vs_budget_anchor === "over";
  return (
    <section
      className={cn(
        "rounded-md border p-4",
        overBudget
          ? "border-rose/40 bg-rose-pale/30"
          : "border-ink/10 bg-ivory-soft",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Stat label="Total cost" value={`$${computed.total_estimated_cost.toFixed(0)}`} />
        <Stat label="Per bag" value={`$${computed.cost_per_bag.toFixed(0)}`} />
        <Stat
          label={`Anchor (${anchorChip ?? "—"})`}
          value={bandLabel(computed.cost_vs_budget_anchor)}
          tone={bandTone(computed.cost_vs_budget_anchor)}
        />
        {overBudget && (
          <span className="inline-flex items-center gap-1 text-[12px] text-rose">
            <AlertTriangle size={12} strokeWidth={1.8} />
            Above your stated welcome-bag anchor.
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        <span>Wishlist: {computed.sourcing_status_breakdown.wishlist}</span>
        <span>·</span>
        <span>Sourcing: {computed.sourcing_status_breakdown.sourcing}</span>
        <span>·</span>
        <span>Ordered: {computed.sourcing_status_breakdown.ordered}</span>
        <span>·</span>
        <span>Received: {computed.sourcing_status_breakdown.received}</span>
        <span>·</span>
        <span>Packed: {computed.sourcing_status_breakdown.packed}</span>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const color =
    tone === "good"
      ? "text-sage"
      : tone === "warn"
        ? "text-saffron"
        : tone === "bad"
          ? "text-rose"
          : "text-ink";
  return (
    <div>
      <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      <span className={cn("mt-0.5 block font-serif text-[16px]", color)}>
        {value}
      </span>
    </div>
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
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
