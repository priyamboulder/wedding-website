"use client";

// ── Logistics Session 2 · Artist contract ───────────────────────────────
// Seven contract items. Each item maps to a row in mehndi-store's
// contractChecklist slice (so it stays in sync with Tab 3). Three items
// (bride_complexity hours, travel_stay applies, cancellation is_outdoor)
// store ancillary state in logisticsJourneyMeta.

import { useMemo } from "react";
import { FileSignature, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  defaultLogisticsJourneyMeta,
  defaultSetup,
  useMehndiStore,
} from "@/stores/mehndi-store";
import { computeMehendiCapacity } from "@/lib/calculators/mehendi-capacity";
import {
  CONTRACT_CHECKLIST_ITEMS,
  type ContractChecklistTemplate,
} from "@/lib/mehndi-seed";
import {
  DESIGN_TIER_LABEL,
  type ContractChecklistItemId,
} from "@/types/mehndi";
import type { WorkspaceCategory } from "@/types/workspace";

// Friendly hint copy keyed off item_id — same defaults as the full workspace
// surface, but the Logistics journey adds "why" context for the more
// surprising items.
const ITEM_DETAIL: Record<ContractChecklistItemId, string> = {
  artists_hours:
    "Match to your capacity calculator so no one waits more than 45 min.",
  bride_complexity:
    "Detailed bridal work runs 3–5 hours. Protect the start time.",
  guest_coverage:
    "Spell out Quick / Classic / Detailed so expectations match the night of.",
  travel_stay:
    "If your wedding is more than 100 mi from the artist's home base, lock in travel and lodging in the contract.",
  natural_henna:
    "Black henna contains PPD and can burn skin. Make it contractual.",
  touch_up: "What happens if a motif smudges before the ceremony?",
  cancellation:
    "Outdoor mehendi? Spell out the rain / heat contingency and refund window.",
};

export function ArtistContractSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const checklist = useMehndiStore((s) => s.contractChecklist);
  const toggle = useMehndiStore((s) => s.toggleContractCheck);
  const updateNote = useMehndiStore((s) => s.updateContractNote);
  const storedSetup = useMehndiStore((s) =>
    s.setups.find((x) => x.category_id === category.id),
  );
  const setup = storedSetup ?? defaultSetup(category.id);
  const storedMeta = useMehndiStore((s) =>
    s.logisticsJourneyMeta.find((m) => m.category_id === category.id),
  );
  const meta = storedMeta ?? defaultLogisticsJourneyMeta(category.id);
  const updateMeta = useMehndiStore((s) => s.updateLogisticsJourneyMeta);

  const byId = useMemo(() => {
    const map = new Map<
      ContractChecklistItemId,
      { checked: boolean; notes: string }
    >();
    for (const row of checklist) {
      if (row.category_id !== category.id) continue;
      map.set(row.item_id, { checked: row.checked, notes: row.notes });
    }
    return map;
  }, [checklist, category.id]);

  const calc = useMemo(
    () =>
      computeMehendiCapacity({
        artistCount: setup.stations,
        hoursOnSite: setup.event_duration_hours,
        expectedGuests: setup.expected_guest_count,
        defaultTier: setup.avg_tier,
      }),
    [setup],
  );

  function prefillFor(id: ContractChecklistItemId): string {
    if (id === "artists_hours") {
      return `${setup.stations} artists × ${setup.event_duration_hours} hours on-site`;
    }
    if (id === "guest_coverage") {
      return `Default tier: ${DESIGN_TIER_LABEL[setup.avg_tier]}. Servable at this tier: ${calc.servableGuests} guests.`;
    }
    return "";
  }

  const checkedCount = Array.from(byId.values()).filter((v) => v.checked)
    .length;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron">
            <FileSignature size={14} strokeWidth={1.8} />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron">
            Seven things to lock down
          </span>
        </div>
        <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
          {checkedCount} / {CONTRACT_CHECKLIST_ITEMS.length} confirmed
        </span>
      </header>

      <ul className="space-y-2">
        {CONTRACT_CHECKLIST_ITEMS.map((item) => (
          <ContractRow
            key={item.id}
            item={item}
            state={byId.get(item.id)}
            prefill={prefillFor(item.id)}
            onToggle={() => toggle(category.id, item.id)}
            onNotes={(notes) => updateNote(category.id, item.id, notes)}
            extras={
              item.id === "bride_complexity" ? (
                <NumberRow
                  label="Estimated hours for bridal work"
                  value={meta.bridal_complexity_hours ?? 0}
                  min={0}
                  max={12}
                  step={0.5}
                  placeholder="e.g. 4.5"
                  onChange={(v) =>
                    updateMeta(category.id, {
                      bridal_complexity_hours: v > 0 ? v : null,
                    })
                  }
                />
              ) : item.id === "travel_stay" ? (
                <ToggleRow
                  label="Travel & accommodation applies"
                  hint="Toggle off if your artist is local."
                  checked={meta.travel_stay_applies}
                  onChange={(checked) =>
                    updateMeta(category.id, { travel_stay_applies: checked })
                  }
                />
              ) : item.id === "cancellation" ? (
                <ToggleRow
                  label="Mehendi event is outdoor"
                  hint="Outdoor venues need explicit weather terms."
                  checked={meta.cancellation_is_outdoor}
                  onChange={(checked) =>
                    updateMeta(category.id, {
                      cancellation_is_outdoor: checked,
                    })
                  }
                />
              ) : null
            }
          />
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-border bg-ivory-warm/30 p-3">
        <label className="flex flex-1 items-center gap-2 text-[12.5px] text-ink">
          <input
            type="checkbox"
            checked={meta.contract_ready_to_send}
            onChange={(e) =>
              updateMeta(category.id, {
                contract_ready_to_send: e.target.checked,
              })
            }
            className="h-3.5 w-3.5 accent-saffron"
          />
          <span>This checklist is ready to send to the artist.</span>
        </label>
        <button
          type="button"
          disabled={!meta.contract_ready_to_send}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
            meta.contract_ready_to_send
              ? "bg-ink text-ivory hover:bg-ink-soft"
              : "cursor-not-allowed border border-border bg-white text-ink-faint",
          )}
        >
          <Send size={12} strokeWidth={2} /> Send checklist to artist
        </button>
      </div>
    </div>
  );
}

// ─── Row primitives ──────────────────────────────────────────────────────

function ContractRow({
  item,
  state,
  prefill,
  onToggle,
  onNotes,
  extras,
}: {
  item: ContractChecklistTemplate;
  state: { checked: boolean; notes: string } | undefined;
  prefill: string;
  onToggle: () => void;
  onNotes: (notes: string) => void;
  extras?: React.ReactNode;
}) {
  const checked = state?.checked ?? false;
  const notes = state?.notes ?? "";
  const detail = ITEM_DETAIL[item.id] ?? item.hint;
  return (
    <li
      className={cn(
        "rounded-md border p-3 transition-colors",
        checked ? "border-sage/40 bg-sage-pale/30" : "border-border bg-white",
      )}
    >
      <label className="flex items-start gap-2.5 text-[13px] text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 accent-sage"
        />
        <span className="flex-1">
          <span className="font-medium">{item.label}</span>
          <span className="mt-0.5 block text-[11.5px] text-ink-muted">
            {detail}
          </span>
        </span>
      </label>
      <textarea
        value={notes}
        onChange={(e) => onNotes(e.target.value)}
        placeholder={prefill || "Notes (optional)"}
        className="mt-2 min-h-[44px] w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-saffron/50 focus:outline-none"
      />
      {extras}
    </li>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="mt-2 flex items-start gap-2 text-[12px] text-ink-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 accent-saffron"
      />
      <span>
        <span className="font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-[11px] text-ink-faint">{hint}</span>
      </span>
    </label>
  );
}

function NumberRow({
  label,
  value,
  min,
  max,
  step,
  placeholder,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mt-2 flex items-center gap-3 text-[12px] text-ink-muted">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-24 rounded-md border border-border bg-white px-2 py-1 text-right text-[12px] tabular-nums focus:border-saffron/50 focus:outline-none"
      />
    </label>
  );
}
