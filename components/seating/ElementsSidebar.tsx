"use client";

// ── Elements sidebar tab ───────────────────────────────────────────────
// Third tab in CombinedSidebar. Lists all non-table fixed elements on
// the active event's floor plan, grouped by category. Click to select
// on the canvas. "+ Add Element" opens the library panel.

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { dietaryCoverage, powerDrawSummary, useSeatingStore } from "@/stores/seating-store";
import {
  CATEGORY_META,
  getElementDef,
  type ElementCategory,
} from "@/lib/floor-plan-library";
import type { FixedElement } from "@/types/seating";

interface Props {
  onAddElement: () => void;
}

export function ElementsSidebar({ onAddElement }: Props) {
  const fixed = useSeatingStore((s) => s.fixed);
  const selectedFixedId = useSeatingStore((s) => s.selectedFixedId);
  const selectFixed = useSeatingStore((s) => s.selectFixed);
  const removeFixedElement = useSeatingStore((s) => s.removeFixedElement);

  const grouped = useMemo(() => {
    const out: Record<ElementCategory, FixedElement[]> = {
      stage_performance: [],
      dance_music: [],
      food_beverage: [],
      experiences: [],
      logistics: [],
      decor_ambiance: [],
    };
    for (const f of fixed) {
      const def = getElementDef(f.kind);
      const cat: ElementCategory = def?.category ?? "logistics";
      out[cat].push(f);
    }
    return out;
  }, [fixed]);

  const total = fixed.length;
  const withVendor = fixed.filter((f) => !!f.properties?.vendorName).length;
  const power = powerDrawSummary(fixed);
  const diet = dietaryCoverage(fixed);
  const foodStations = fixed.filter((f) => {
    const d = getElementDef(f.kind);
    return d?.propertyGroups?.includes("food");
  }).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border bg-ivory/30 px-4 py-2.5">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <span>{total} elements</span>
          {withVendor < total && total > 0 && (
            <span className="text-ink-muted">{withVendor}/{total} vendor</span>
          )}
        </div>
        <button
          onClick={onAddElement}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:opacity-90"
        >
          <Plus size={12} strokeWidth={1.8} />
          Add element
        </button>
      </div>

      {/* Summary stats */}
      <div className="border-b border-border bg-white px-4 py-2.5">
        <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
          <StatBlock label="Power needed" value={`${power.count} el.`} hint={power.totalWatts ? `${power.totalWatts}W` : undefined} />
          <StatBlock label="Food stations" value={String(foodStations)} />
        </div>
        {foodStations > 0 && (
          <div className="mt-2 rounded border border-dashed border-border bg-ivory/30 px-2 py-1.5 font-mono text-[9.5px] text-ink-muted">
            Dietary:{" "}
            <DietChip label="Veg" on={diet.veg} /> <DietChip label="Non-veg" on={diet.nonVeg} />{" "}
            <DietChip label="Jain" on={diet.jain} /> <DietChip label="Halal" on={diet.halal} />
          </div>
        )}
      </div>

      {/* Grouped element list */}
      <div className="flex-1 overflow-y-auto">
        {total === 0 ? (
          <div className="px-4 py-10 text-center text-[12px] italic text-ink-faint">
            No elements yet. Click &ldquo;Add element&rdquo; to place your first one.
          </div>
        ) : (
          (Object.keys(CATEGORY_META) as ElementCategory[]).map((cat) => {
            const list = grouped[cat];
            if (list.length === 0) return null;
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 border-b border-border bg-ivory/25 px-4 py-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: meta.tone }}
                  />
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted">
                    {meta.label} · {list.length}
                  </span>
                </div>
                {list.map((f) => (
                  <ElementRow
                    key={f.id}
                    el={f}
                    selected={f.id === selectedFixedId}
                    onSelect={() => selectFixed(f.id)}
                    onRemove={() => removeFixedElement(f.id)}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ElementRow({
  el,
  selected,
  onSelect,
  onRemove,
}: {
  el: FixedElement;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const def = getElementDef(el.kind);
  const vendor = el.properties?.vendorName;
  const power = el.properties?.needsPower;
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2 border-b border-border/50 px-4 py-2 hover:bg-ivory/40",
        selected && "bg-gold-pale/25",
      )}
    >
      <span
        className="h-4 w-4 flex-shrink-0 rounded"
        style={{
          backgroundColor: el.color ?? def?.fill ?? "#e2d9c3",
          border: `1px solid ${def?.stroke ?? "#8a7a5f"}`,
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-serif text-[12.5px] text-ink">{el.label}</div>
        <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[9.5px] text-ink-muted">
          <span>
            {el.width}×{el.height} ft
          </span>
          {vendor && (
            <>
              <span>·</span>
              <span className="truncate">{vendor}</span>
            </>
          )}
          {power && (
            <>
              <span>·</span>
              <span className="text-[11px]">⚡</span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="flex h-6 w-6 items-center justify-center rounded text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
        title="Delete"
      >
        <Trash2 size={11} strokeWidth={1.7} />
      </button>
    </div>
  );
}

function StatBlock({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded border border-border bg-ivory/30 px-2 py-1.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </div>
      <div className="mt-0.5 font-serif text-[13px] text-ink">{value}</div>
      {hint && <div className="font-mono text-[9px] text-ink-faint">{hint}</div>}
    </div>
  );
}

function DietChip({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={cn(
        "rounded px-1",
        on ? "bg-sage-pale text-sage" : "bg-rose-pale/30 text-rose",
      )}
    >
      {on ? "✓" : "✗"} {label}
    </span>
  );
}
