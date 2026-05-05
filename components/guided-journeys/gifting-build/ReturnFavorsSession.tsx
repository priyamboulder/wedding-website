"use client";

// ── Build Session 3 · Return favors ───────────────────────────────────────
// Mirrors Tab 5 of the Gifting workspace. Walks the couple through the
// favor plan (RSVP-driven quantity with 10% buffer, distribution scheme),
// the per-item inventory, and an optional charitable-donation alternative.

import { useEffect, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  FAVOR_SOURCING_STATUS_LABEL,
  GIFTING_BUILD_CATEGORY,
  GIFTING_BUILD_JOURNEY_ID,
  type CharitableDonation,
  type FavorItem,
  type FavorItemCategory,
  type FavorPlan,
  type FavorSourcingStatus,
  type ReturnFavorsComputed,
  type ReturnFavorsFormData,
  type GiftEvent,
} from "@/lib/guided-journeys/gifting-build";
import {
  bandLabel,
  bandTone,
  compareAgainstAnchor,
} from "@/lib/calculators/budget-anchor-comparison";
import {
  liftLovedIdeas,
  type LovedIdeaReaction,
} from "@/lib/guided-journeys/lift-loved-ideas";
import { cn } from "@/lib/utils";
import type { WorkspaceCategory } from "@/types/workspace";

const SOURCING_OPTIONS: FavorSourcingStatus[] = [
  "wishlist",
  "sourcing",
  "ordered",
  "received",
  "distributed",
];

const CATEGORY_OPTIONS: FavorItemCategory[] = [
  "edible",
  "keepsake",
  "cultural",
  "practical",
  "charitable_donation",
];

const QTY_BASIS_OPTIONS: Array<{
  value: FavorPlan["quantity_basis"];
  label: string;
}> = [
  { value: "one_per_guest", label: "One per guest" },
  { value: "one_per_family", label: "One per family unit" },
  { value: "one_per_couple", label: "One per couple" },
  { value: "one_per_event", label: "One per event" },
  { value: "custom", label: "Custom" },
];

const DISTRIBUTION_OPTIONS: Array<{
  value: FavorPlan["distribution_plan"];
  label: string;
}> = [
  { value: "reception_table_setting", label: "Reception table setting" },
  { value: "door_handout_at_exit", label: "Door handout at exit" },
  { value: "send_off_basket", label: "Send-off basket" },
  { value: "multiple_events", label: "Multiple events (per-event drop)" },
  { value: "tbd", label: "TBD" },
];

const EVENT_OPTIONS: GiftEvent[] = [
  "mehendi",
  "haldi",
  "sangeet",
  "wedding",
  "reception",
  "all_events",
];

function emptyPlan(): FavorPlan {
  return {
    quantity_basis: "one_per_guest",
    expected_guest_count: 0,
    favor_count_total: 0,
    buffer_count: 0,
    distribution_plan: "tbd",
  };
}

export function ReturnFavorsSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const [state, update] = useCategoryJourneyState(
    GIFTING_BUILD_CATEGORY,
    GIFTING_BUILD_JOURNEY_ID,
  );
  const fallbackGuestCount =
    useAuthStore((s) => s.user?.wedding?.guestCount ?? null) ?? 0;
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);

  const visionData = state.formData["gifting_inspiration"] as
    | { idea_reactions?: LovedIdeaReaction[] }
    | undefined;
  const visionPhilosophy = state.formData["gifting_philosophy"] as
    | { budget_anchors?: { return_favors_per_guest?: string } }
    | undefined;

  const sessionData =
    (state.formData["return_favors"] as unknown as
      | ReturnFavorsFormData
      | undefined) ?? {
      favor_plan: emptyPlan(),
      favor_items: [],
    };

  // Pre-seed expected_guest_count from auth store once.
  useEffect(() => {
    if (sessionData.favor_plan.expected_guest_count > 0) return;
    if (fallbackGuestCount > 0) {
      const buffer = Math.ceil(fallbackGuestCount * 0.1);
      update((s) =>
        setSessionFormPath(s, "return_favors", "favor_plan", {
          ...sessionData.favor_plan,
          expected_guest_count: fallbackGuestCount,
          favor_count_total: fallbackGuestCount + buffer,
          buffer_count: buffer,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallbackGuestCount]);

  // Favor items live as WorkspaceItems on tab=return_favors.
  const favorItems = useMemo(
    () =>
      items
        .filter((i) => i.category_id === category.id && i.tab === "return_favors")
        .filter((i) => (i.meta as { reaction?: string }).reaction !== "not_this")
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, category.id],
  );

  // Lift loved ideas from Vision once.
  useEffect(() => {
    const reactions = visionData?.idea_reactions ?? [];
    const existingIds = new Set(
      favorItems
        .map((it) => (it.meta as { ideaId?: string }).ideaId)
        .filter((x): x is string => Boolean(x)),
    );
    const lifted = liftLovedIdeas(reactions, "return_favors", existingIds);
    if (lifted.length === 0) return;
    for (const draft of lifted) {
      addItem({
        category_id: category.id,
        tab: "return_favors",
        block_type: "note",
        title: draft.item_label,
        meta: {
          ideaId: draft.source_idea_id,
          reaction: "love",
          qty: sessionData.favor_plan.favor_count_total || 1,
          unitCost: draft.cost_per_unit ?? 0,
          status: "planned",
          sourcing_status: "wishlist" as FavorSourcingStatus,
          item_category: "keepsake" as FavorItemCategory,
          used_at_event: "reception" as GiftEvent,
          source_idea_id: draft.source_idea_id,
          reuses_loved_idea: true,
          custom_note: draft.custom_note,
        },
        sort_order: favorItems.length + 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visionData?.idea_reactions]);

  const plan = sessionData.favor_plan;
  const charitable = sessionData.charitable_donation;

  const computed: ReturnFavorsComputed = useMemo(() => {
    let totalCount = 0;
    let totalCost = 0;
    for (const it of favorItems) {
      const m = it.meta as { qty?: number; unitCost?: number };
      const qty = m.qty ?? 0;
      const unit = m.unitCost ?? 0;
      totalCount += qty;
      totalCost += qty * unit;
    }
    const guestCount = plan.expected_guest_count || fallbackGuestCount || 1;
    const perGuest = totalCost / Math.max(1, guestCount);
    const cmp = compareAgainstAnchor(
      perGuest,
      visionPhilosophy?.budget_anchors?.return_favors_per_guest,
    );
    const band: ReturnFavorsComputed["cost_vs_budget_anchor"] =
      cmp.band === "no_anchor" ? "on_target" : cmp.band;
    return {
      total_favors_count: totalCount,
      total_estimated_cost: totalCost,
      cost_per_guest: perGuest,
      cost_vs_budget_anchor: band,
      items_with_lead_time_warnings: 0,
    };
  }, [favorItems, plan.expected_guest_count, fallbackGuestCount, visionPhilosophy?.budget_anchors?.return_favors_per_guest]);

  useEffect(() => {
    update((s) => setSessionFormPath(s, "return_favors", "computed", computed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed.total_estimated_cost, computed.cost_per_guest]);

  const updatePlan = (patch: Partial<FavorPlan>) => {
    const merged = { ...plan, ...patch };
    // Keep favor_count_total = expected_guest_count + buffer_count consistent
    // unless user explicitly overrode favor_count_total.
    if ("expected_guest_count" in patch || "buffer_count" in patch) {
      merged.favor_count_total =
        merged.expected_guest_count + merged.buffer_count;
    }
    update((s) => setSessionFormPath(s, "return_favors", "favor_plan", merged));
  };

  const setBufferDefault = () => {
    const buffer = Math.ceil(plan.expected_guest_count * 0.1);
    updatePlan({ buffer_count: buffer });
  };

  const addFavorItem = () => {
    addItem({
      category_id: category.id,
      tab: "return_favors",
      block_type: "note",
      title: "New favor",
      meta: {
        qty: plan.favor_count_total || 0,
        unitCost: 0,
        status: "planned",
        sourcing_status: "wishlist" as FavorSourcingStatus,
        item_category: "keepsake" as FavorItemCategory,
        used_at_event: "reception" as GiftEvent,
        reuses_loved_idea: false,
      },
      sort_order: favorItems.length + 1,
    });
  };

  const patchFavor = (id: string, patch: Record<string, unknown>) => {
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

  const hasCharitable = favorItems.some(
    (it) =>
      (it.meta as { item_category?: FavorItemCategory }).item_category ===
      "charitable_donation",
  );

  const updateCharitable = (
    patch: Partial<CharitableDonation> | null,
  ) => {
    if (patch === null) {
      update((s) =>
        setSessionFormPath(s, "return_favors", "charitable_donation", undefined),
      );
      return;
    }
    const next = { ...(charitable ?? { organization: "", donation_per_guest: 0, cause: "" }), ...patch };
    update((s) =>
      setSessionFormPath(s, "return_favors", "charitable_donation", next),
    );
  };

  return (
    <div className="space-y-6">
      <FavorPlanBlock
        plan={plan}
        fallbackGuestCount={fallbackGuestCount}
        onChange={updatePlan}
        onResetBuffer={setBufferDefault}
      />

      <FavorItemsBlock
        items={favorItems}
        onAdd={addFavorItem}
        onPatch={patchFavor}
        onRemove={deleteItem}
      />

      {hasCharitable && (
        <CharitableBlock
          donation={charitable}
          onChange={updateCharitable}
        />
      )}

      <SummaryBlock
        computed={computed}
        plan={plan}
        anchorChip={visionPhilosophy?.budget_anchors?.return_favors_per_guest}
      />
    </div>
  );
}

// ─── Plan ────────────────────────────────────────────────────────────────

function FavorPlanBlock({
  plan,
  fallbackGuestCount,
  onChange,
  onResetBuffer,
}: {
  plan: FavorPlan;
  fallbackGuestCount: number;
  onChange: (p: Partial<FavorPlan>) => void;
  onResetBuffer: () => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Favor plan
        </p>
        <h3 className="mt-1 font-serif text-xl text-ink">
          How many favors and how do guests get them?
        </h3>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Quantity basis">
          <select
            value={plan.quantity_basis}
            onChange={(e) =>
              onChange({
                quantity_basis: e.target.value as FavorPlan["quantity_basis"],
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
        <Field label={`Expected guest count (auth: ${fallbackGuestCount || "—"})`}>
          <input
            type="number"
            min={0}
            value={plan.expected_guest_count}
            onChange={(e) =>
              onChange({ expected_guest_count: Number(e.target.value) || 0 })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Buffer (10% recommended)">
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={plan.buffer_count}
              onChange={(e) =>
                onChange({ buffer_count: Number(e.target.value) || 0 })
              }
              className="flex-1 rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
            />
            <button
              type="button"
              onClick={onResetBuffer}
              className="rounded-md border border-ink/15 px-3 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40"
            >
              10%
            </button>
          </div>
        </Field>
        <Field label="Total favor count">
          <input
            type="number"
            min={0}
            value={plan.favor_count_total}
            onChange={(e) =>
              onChange({ favor_count_total: Number(e.target.value) || 0 })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Distribution plan">
          <select
            value={plan.distribution_plan}
            onChange={(e) =>
              onChange({
                distribution_plan: e.target.value as FavorPlan["distribution_plan"],
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {DISTRIBUTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </section>
  );
}

// ─── Items ───────────────────────────────────────────────────────────────

function FavorItemsBlock({
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
            Favor items
          </p>
          <h3 className="mt-1 font-serif text-xl text-ink">
            What you're handing out
          </h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} />
          Add favor
        </button>
      </header>
      {items.length === 0 ? (
        <p className="py-2 text-[12.5px] italic text-ink-muted">
          No favors yet — loved ideas from Vision will surface here.
        </p>
      ) : (
        <ul className="divide-y divide-ink/10">
          {items.map((it) => {
            const m = it.meta as {
              qty?: number;
              unitCost?: number;
              vendor?: string;
              sourcing_status?: FavorSourcingStatus;
              item_category?: FavorItemCategory;
              used_at_event?: GiftEvent;
              reuses_loved_idea?: boolean;
            };
            return (
              <li key={it.id} className="py-3">
                <div className="grid gap-2 md:grid-cols-12">
                  <div className="md:col-span-3">
                    <input
                      value={it.title}
                      onChange={(e) => onPatch(it.id, { title: e.target.value })}
                      placeholder="Favor name"
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
                      min={0}
                      value={m.qty ?? 0}
                      onChange={(e) =>
                        onPatch(it.id, { qty: Number(e.target.value) || 0 })
                      }
                      placeholder="Qty"
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
                      value={m.item_category ?? "keepsake"}
                      onChange={(e) =>
                        onPatch(it.id, {
                          item_category: e.target.value as FavorItemCategory,
                        })
                      }
                      className="w-full rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12px]"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <select
                      value={m.used_at_event ?? "reception"}
                      onChange={(e) =>
                        onPatch(it.id, {
                          used_at_event: e.target.value as GiftEvent,
                        })
                      }
                      className="w-full rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12px]"
                    >
                      {EVENT_OPTIONS.map((ev) => (
                        <option key={ev} value={ev}>
                          {ev}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1 flex items-center gap-1">
                    <select
                      value={m.sourcing_status ?? "wishlist"}
                      onChange={(e) =>
                        onPatch(it.id, {
                          sourcing_status: e.target.value as FavorSourcingStatus,
                        })
                      }
                      className="flex-1 rounded-md border border-ink/15 bg-paper px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink"
                    >
                      {SOURCING_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {FAVOR_SOURCING_STATUS_LABEL[s]}
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

// ─── Charitable ──────────────────────────────────────────────────────────

function CharitableBlock({
  donation,
  onChange,
}: {
  donation: CharitableDonation | undefined;
  onChange: (p: Partial<CharitableDonation> | null) => void;
}) {
  return (
    <section className="rounded-md border border-sage/30 bg-sage/10 p-5">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sage">
            Charitable alternative
          </p>
          <h3 className="mt-1 font-serif text-xl text-ink">
            Donate in your guests' honor
          </h3>
          <p className="text-[12.5px] italic text-ink-muted">
            Triggered by any favor with category = charitable_donation.
          </p>
        </div>
        {donation && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11.5px] text-ink-faint hover:text-rose"
          >
            Remove
          </button>
        )}
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Organization">
          <input
            type="text"
            value={donation?.organization ?? ""}
            onChange={(e) => onChange({ organization: e.target.value })}
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Donation per guest (USD)">
          <input
            type="number"
            min={0}
            value={donation?.donation_per_guest ?? 0}
            onChange={(e) =>
              onChange({ donation_per_guest: Number(e.target.value) || 0 })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Cause">
          <input
            type="text"
            value={donation?.cause ?? ""}
            onChange={(e) => onChange({ cause: e.target.value })}
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Card text">
          <input
            type="text"
            value={donation?.card_text ?? ""}
            onChange={(e) => onChange({ card_text: e.target.value })}
            placeholder="In honor of your presence, we've donated to…"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
      </div>
    </section>
  );
}

// ─── Summary ─────────────────────────────────────────────────────────────

function SummaryBlock({
  computed,
  plan,
  anchorChip,
}: {
  computed: ReturnFavorsComputed;
  plan: FavorPlan;
  anchorChip?: string;
}) {
  const overshoot = plan.favor_count_total - computed.total_favors_count;
  return (
    <section className="rounded-md border border-ink/10 bg-ivory-soft p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Stat label="Total favors" value={String(computed.total_favors_count)} />
        <Stat
          label="Total cost"
          value={`$${computed.total_estimated_cost.toFixed(0)}`}
        />
        <Stat
          label="Per guest"
          value={`$${computed.cost_per_guest.toFixed(2)}`}
        />
        <Stat
          label={`Anchor (${anchorChip ?? "—"})`}
          value={bandLabel(computed.cost_vs_budget_anchor)}
          tone={bandTone(computed.cost_vs_budget_anchor)}
        />
      </div>
      {overshoot !== 0 && plan.favor_count_total > 0 && (
        <p className="mt-3 text-[12px] italic text-ink-muted">
          Plan calls for {plan.favor_count_total} units (incl. buffer of {plan.buffer_count}); items add up to {computed.total_favors_count}.{" "}
          {overshoot > 0
            ? `Add ${overshoot} more unit${overshoot === 1 ? "" : "s"} across items to match the buffer.`
            : `You're ${-overshoot} over the planned total.`}
        </p>
      )}
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
