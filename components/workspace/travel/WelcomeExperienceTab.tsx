"use client";

// ── Welcome Experience tab ────────────────────────────────────────────────
// Welcome bag contents (toggleable starter pack + user additions), cost +
// count math, and distribution plan. "Per bag × count" math updates live so
// couples can see the financial shape as they tune.

import { useMemo, useState } from "react";
import {
  ExternalLink,
  PackageOpen,
  Plus,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  defaultWelcomeBagPlan,
  useTravelStore,
} from "@/stores/travel-store";
import type { WelcomeBagItem } from "@/types/travel";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  MiniStat,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";

function formatUsd(amount: number): string {
  if (!amount) return "$0";
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function WelcomeExperienceTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const storedPlan = useTravelStore((s) =>
    s.welcomeBagPlans.find((p) => p.category_id === category.id),
  );
  const updatePlan = useTravelStore((s) => s.updateWelcomeBagPlan);
  const plan = storedPlan ?? defaultWelcomeBagPlan(category.id);

  const allItems = useTravelStore((s) => s.welcomeBagItems);
  const addItem = useTravelStore((s) => s.addWelcomeBagItem);
  const seed = useTravelStore((s) => s.seedDefaultWelcomeBagItems);
  const updateItem = useTravelStore((s) => s.updateWelcomeBagItem);
  const toggleItem = useTravelStore((s) => s.toggleWelcomeBagItem);
  const deleteItem = useTravelStore((s) => s.deleteWelcomeBagItem);

  const items = useMemo(
    () =>
      allItems
        .filter((i) => i.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allItems, category.id],
  );

  const included = items.filter((i) => i.included).length;
  const totalCost = plan.per_bag_cost * plan.bag_count;

  const [newLabel, setNewLabel] = useState("");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Welcome experience"
        title="Welcome bags & guest experience"
        description="What greets guests at the hotel front desk sets the tone for the whole weekend. Keep it warm, useful, and unmistakably yours."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Items included" value={included} hint={`of ${items.length}`} />
        <MiniStat
          label="Per bag cost"
          value={formatUsd(plan.per_bag_cost)}
          tone="saffron"
        />
        <MiniStat label="Bags" value={plan.bag_count || "—"} />
        <MiniStat
          label="Total"
          value={formatUsd(totalCost)}
          tone={totalCost > 0 ? "sage" : "ink"}
        />
      </div>

      {/* Bag contents */}
      <PanelCard
        icon={<PackageOpen size={14} strokeWidth={1.8} />}
        title="Welcome bag contents"
        badge={
          items.length === 0 ? null : (
            <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
              {included}/{items.length} included
            </span>
          )
        }
      >
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-4 py-5 text-center">
            <p className="mb-3 text-[12.5px] italic text-ink-muted">
              Empty bag. Load the starter pack — welcome letter, itinerary,
              snacks, survival kit — and edit from there.
            </p>
            <button
              type="button"
              onClick={() => seed(category.id)}
              className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
            >
              <Sparkles size={12} strokeWidth={2} /> Load starter pack
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id)}
                onUpdate={(patch) => updateItem(item.id, patch)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </ul>
        )}

        <div className="mt-4 flex items-center gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Add an item (e.g. Custom tote bag)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const label = newLabel.trim();
                if (!label) return;
                addItem({
                  category_id: category.id,
                  label,
                  detail: "",
                  linked_to: "",
                  included: true,
                });
                setNewLabel("");
              }
            }}
            className="flex-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const label = newLabel.trim();
              if (!label) return;
              addItem({
                category_id: category.id,
                label,
                detail: "",
                linked_to: "",
                included: true,
              });
              setNewLabel("");
            }}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={12} strokeWidth={2} /> Add
          </button>
        </div>
      </PanelCard>

      {/* Cost calc */}
      <PanelCard
        icon={<Sparkles size={14} strokeWidth={1.8} />}
        title="Cost calculator"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Per bag cost (USD)
            </span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={plan.per_bag_cost || ""}
              onChange={(e) =>
                updatePlan(category.id, {
                  per_bag_cost: Number(e.target.value) || 0,
                })
              }
              className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] tabular-nums focus:border-saffron/50 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Bag count
            </span>
            <input
              type="number"
              min={0}
              value={plan.bag_count || ""}
              onChange={(e) =>
                updatePlan(category.id, {
                  bag_count: Number(e.target.value) || 0,
                })
              }
              className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] tabular-nums focus:border-saffron/50 focus:outline-none"
            />
          </label>
          <div className="rounded-md border border-saffron/40 bg-saffron-pale/40 px-3 py-2.5">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron">
              Total
            </p>
            <p className="mt-1 font-serif text-[22px] leading-none text-ink">
              {formatUsd(totalCost)}
            </p>
            <p className="mt-1 text-[10.5px] text-ink-muted">
              {plan.bag_count} bags × {formatUsd(plan.per_bag_cost)}
            </p>
          </div>
        </div>
      </PanelCard>

      {/* Distribution */}
      <PanelCard
        icon={<Truck size={14} strokeWidth={1.8} />}
        title="Distribution plan"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Delivered to
            </span>
            <input
              value={plan.delivery_location}
              onChange={(e) =>
                updatePlan(category.id, { delivery_location: e.target.value })
              }
              placeholder="e.g. Marriott front desk"
              className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Delivery date
            </span>
            <input
              type="date"
              value={plan.delivery_date}
              onChange={(e) =>
                updatePlan(category.id, { delivery_date: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Assembled by
            </span>
            <input
              value={plan.assembled_by}
              onChange={(e) =>
                updatePlan(category.id, { assembled_by: e.target.value })
              }
              placeholder="e.g. Planner + bride's sister"
              className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Assembly date
            </span>
            <input
              type="date"
              value={plan.assembly_date}
              onChange={(e) =>
                updatePlan(category.id, { assembly_date: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
            />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Notes
          </span>
          <textarea
            value={plan.notes}
            onChange={(e) =>
              updatePlan(category.id, { notes: e.target.value })
            }
            placeholder="e.g. confirm with hotel that bags can be held behind front desk…"
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] focus:border-saffron/50 focus:outline-none"
          />
        </label>
      </PanelCard>
    </div>
  );
}

function ItemRow({
  item,
  onToggle,
  onUpdate,
  onDelete,
}: {
  item: WelcomeBagItem;
  onToggle: () => void;
  onUpdate: (patch: Partial<WelcomeBagItem>) => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <input
        type="checkbox"
        checked={item.included}
        onChange={onToggle}
        className="mt-1 h-3.5 w-3.5 accent-saffron"
        aria-label="Include in bag"
      />
      <div className="flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={item.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className={cn(
              "flex-1 min-w-[200px] rounded border border-transparent bg-transparent px-1 py-0.5 text-[12.5px] font-medium hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none",
              item.included ? "text-ink" : "text-ink-faint line-through",
            )}
          />
          {item.linked_to && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-ivory-warm px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted">
              <ExternalLink size={9} strokeWidth={2} /> {item.linked_to}
            </span>
          )}
        </div>
        <input
          value={item.detail}
          onChange={(e) => onUpdate({ detail: e.target.value })}
          placeholder="Detail (optional)"
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] text-ink-muted placeholder:text-ink-faint hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
        />
      </div>
      <button
        type="button"
        aria-label="Delete item"
        onClick={onDelete}
        className="mt-0.5 rounded p-1 text-ink-faint hover:bg-ivory-warm/70 hover:text-rose"
      >
        <Trash2 size={11} strokeWidth={1.8} />
      </button>
    </li>
  );
}
