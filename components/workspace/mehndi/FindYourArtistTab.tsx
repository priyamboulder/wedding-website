"use client";

// ── Find Your Artist tab ──────────────────────────────────────────────────
// Replaces the generic Shortlist & Contract tab for Mehendi so the couple
// gets guidance tailored to their style direction, a standard vendor
// comparison grid, and a guided contract checklist populated by the
// capacity calculator.
//
// Sections:
//   1. What to look for — AI-style guidance keyed to the top loved direction.
//   2. Your shortlist — standard vendor comparison grid.
//   3. Contract checklist — guided items with checkboxes and notes, pulling
//      prefilled hints from the setup + capacity math on Tab 2.

import { useMemo } from "react";
import {
  FileSignature,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeCapacity,
  defaultSetup,
  defaultStylePrefs,
  useMehndiStore,
} from "@/stores/mehndi-store";
import type { ContractChecklistItemId } from "@/types/mehndi";
import { DESIGN_TIER_LABEL } from "@/types/mehndi";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  ARTIST_GUIDANCE,
  CONTRACT_CHECKLIST_ITEMS,
  DEFAULT_GUIDANCE,
  STYLE_DIRECTIONS,
} from "@/lib/mehndi-seed";
import {
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import { ShortlistGridBlock } from "@/components/workspace/blocks/generic-blocks";

export function FindYourArtistTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Find Your Artist"
        title="the artist matters more than the portfolio"
        description="Your mehendi artist reads your story, then makes it permanent for a night. Look for someone who listens in the consultation — and who'll stay steady through hour four."
      />

      <GuidanceBlock category={category} />
      <ShortlistBlock category={category} />
      <ContractChecklistBlock category={category} />
    </div>
  );
}

// ── Guidance ──────────────────────────────────────────────────────────────

function GuidanceBlock({ category }: { category: WorkspaceCategory }) {
  const prefs = useMehndiStore(
    (s) => s.stylePrefs.find((p) => p.category_id === category.id),
  );
  const base = prefs ?? defaultStylePrefs(category.id);
  const topDirection = base.loved_directions[0];
  const guidance = topDirection
    ? (ARTIST_GUIDANCE[topDirection] ?? DEFAULT_GUIDANCE)
    : DEFAULT_GUIDANCE;
  const direction = topDirection
    ? STYLE_DIRECTIONS.find((d) => d.id === topDirection)
    : null;

  return (
    <PanelCard
      icon={<Lightbulb size={14} strokeWidth={1.8} />}
      title="what to look for in a mehendi artist"
      badge={
        direction ? (
          <span className="rounded-full bg-saffron-pale/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
            Tuned for {direction.title.toLowerCase()}
          </span>
        ) : null
      }
    >
      {!direction && (
        <p className="mb-3 text-[11.5px] italic text-ink-muted">
          Love a direction on the Story tab to tune this guidance to your
          style.
        </p>
      )}
      <p className="text-[13.5px] leading-relaxed text-ink">{guidance}</p>
    </PanelCard>
  );
}

// ── Shortlist ─────────────────────────────────────────────────────────────

function ShortlistBlock({ category }: { category: WorkspaceCategory }) {
  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="your shortlist"
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Shortlist artists whose portfolio speaks to your direction. We&apos;ll
        match style indicators against your loved directions once AI matching
        ships.
      </p>
      <ShortlistGridBlock categorySlug={category.slug} />
    </PanelCard>
  );
}

// ── Contract checklist ────────────────────────────────────────────────────

function ContractChecklistBlock({
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

  const byId = useMemo(() => {
    const map = new Map<ContractChecklistItemId, { checked: boolean; notes: string }>();
    for (const row of checklist) {
      if (row.category_id !== category.id) continue;
      map.set(row.item_id, { checked: row.checked, notes: row.notes });
    }
    return map;
  }, [checklist, category.id]);

  const calc = useMemo(() => computeCapacity(setup), [setup]);

  function prefillFor(id: ContractChecklistItemId): string {
    if (id === "artists_hours") {
      return `${setup.stations} artists × ${setup.event_duration_hours} hours on-site`;
    }
    if (id === "bride_complexity") {
      return "";
    }
    if (id === "guest_coverage") {
      const tier = DESIGN_TIER_LABEL[setup.avg_tier];
      return `Default tier: ${tier}. Servable at this tier: ${calc.servableGuests} guests.`;
    }
    return "";
  }

  const checkedCount = Array.from(byId.values()).filter((v) => v.checked).length;

  return (
    <PanelCard
      icon={<FileSignature size={14} strokeWidth={1.8} />}
      title="contract checklist"
      badge={
        <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
          {checkedCount} / {CONTRACT_CHECKLIST_ITEMS.length} confirmed
        </span>
      }
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Before you sign — check each item with your artist. Notes are for you
        and the planner, not the artist. Capacity math from the previous tab
        is already reflected where useful.
      </p>

      <ul className="space-y-2">
        {CONTRACT_CHECKLIST_ITEMS.map((item) => {
          const state = byId.get(item.id);
          const checked = state?.checked ?? false;
          const notes = state?.notes ?? "";
          const prefill = prefillFor(item.id);
          return (
            <li
              key={item.id}
              className={cn(
                "rounded-md border p-3 transition-colors",
                checked
                  ? "border-sage/40 bg-sage-pale/30"
                  : "border-border bg-white",
              )}
            >
              <label className="flex items-start gap-2.5 text-[13px] text-ink">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(category.id, item.id)}
                  className="mt-0.5 h-4 w-4 accent-sage"
                />
                <span className="flex-1">
                  <span className="font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-[11.5px] text-ink-muted">
                    {item.hint}
                  </span>
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) =>
                  updateNote(category.id, item.id, e.target.value)
                }
                placeholder={prefill || "Notes (optional)"}
                className="mt-2 min-h-[44px] w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-saffron/50 focus:outline-none"
              />
            </li>
          );
        })}
      </ul>
    </PanelCard>
  );
}
