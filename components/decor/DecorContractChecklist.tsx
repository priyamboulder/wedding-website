"use client";

// ── Décor contract checklist (workspace-styled) ─────────────────────────────
// A Décor-themed wrapper around the shared contract-checklist data source.
// Uses the same primitives as the rest of the workspace (SectionHead, Block,
// Paper, Checkbox) so the checklist feels like a natural continuation of the
// planning flow — not a bolted-on panel. Items are grouped by category and
// each category is an expandable disclosure.

import { useMemo, useState } from "react";
import {
  DECOR_COLORS,
  FONT_DISPLAY,
  FONT_UI,
  FONT_MONO,
  SectionHead,
  Block,
  Paper,
} from "./primitives";
import { useContractChecklistStore } from "@/stores/contract-checklist-store";
import { contractChecklistFor } from "@/lib/workspace/contract-checklists";
import type { WorkspaceCategory } from "@/types/workspace";

// Group the décor contract checklist items into three progressive categories.
// Items not listed in any group fall into "Other".
const DECOR_CATEGORY_GROUPS: {
  id: string;
  label: string;
  intro: string;
  item_ids: string[];
}[] = [
  {
    id: "coverage",
    label: "Coverage & setup",
    intro: "Which events they cover and when they're on site.",
    item_ids: ["events_setup_teardown", "setup_timeline"],
  },
  {
    id: "scope",
    label: "Scope & substitution",
    intro: "What's in scope, what's separate, and what happens if a flower is out.",
    item_ids: ["floral_substitution", "rentals_scope"],
  },
  {
    id: "breakdown",
    label: "Breakdown & liability",
    intro: "Who owns cleanup, and who pays if something breaks.",
    item_ids: ["cleanup_responsibility", "damage_liability"],
  },
];

export function DecorContractChecklist({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = contractChecklistFor(category.slug);
  const rows = useContractChecklistStore((s) => s.rows);
  const toggle = useContractChecklistStore((s) => s.toggle);
  const updateNote = useContractChecklistStore((s) => s.updateNote);

  const byId = useMemo(() => {
    const map = new Map<string, { checked: boolean; notes: string }>();
    for (const row of rows) {
      if (row.category_id !== category.id) continue;
      map.set(row.item_id, { checked: row.checked, notes: row.notes });
    }
    return map;
  }, [rows, category.id]);

  if (items.length === 0) return null;

  const itemsById = new Map(items.map((i) => [i.id, i]));
  const groupedIds = new Set(
    DECOR_CATEGORY_GROUPS.flatMap((g) => g.item_ids),
  );
  const otherItems = items.filter((i) => !groupedIds.has(i.id));

  const groups = [
    ...DECOR_CATEGORY_GROUPS.map((g) => ({
      ...g,
      items: g.item_ids
        .map((id) => itemsById.get(id))
        .filter((i): i is NonNullable<typeof i> => i != null),
    })),
    ...(otherItems.length
      ? [
          {
            id: "other",
            label: "Other",
            intro: "Additional items.",
            items: otherItems,
          },
        ]
      : []),
  ];

  const checkedCount = items.reduce(
    (acc, item) => (byId.get(item.id)?.checked ? acc + 1 : acc),
    0,
  );

  return (
    <Block>
      <SectionHead
        eyebrow="Before you sign"
        title="Contract checklist"
        body="Work through each item with your decorator. Notes travel with the line item — they're for you and your planner."
      >
        <span
          className="text-[10.5px]"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.16em",
            color: DECOR_COLORS.cocoaMuted,
          }}
        >
          {checkedCount} / {items.length} CONFIRMED
        </span>
      </SectionHead>

      <div className="space-y-3">
        {groups.map((g) => (
          <ChecklistGroup
            key={g.id}
            label={g.label}
            intro={g.intro}
            items={g.items}
            state={byId}
            onToggle={(item_id) => toggle(category.id, item_id)}
            onNote={(item_id, note) =>
              updateNote(category.id, item_id, note)
            }
          />
        ))}
      </div>
    </Block>
  );
}

function ChecklistGroup({
  label,
  intro,
  items,
  state,
  onToggle,
  onNote,
}: {
  label: string;
  intro: string;
  items: { id: string; label: string; hint: string }[];
  state: Map<string, { checked: boolean; notes: string }>;
  onToggle: (item_id: string) => void;
  onNote: (item_id: string, note: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const checkedCount = items.reduce(
    (acc, item) => (state.get(item.id)?.checked ? acc + 1 : acc),
    0,
  );
  const allChecked = checkedCount === items.length && items.length > 0;

  return (
    <Paper className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[rgba(61,43,31,0.02)]"
      >
        <div className="min-w-0">
          <div
            className="flex items-center gap-2"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: allChecked
                  ? DECOR_COLORS.sage
                  : DECOR_COLORS.cocoaFaint,
              }}
              aria-hidden
            />
            <span
              className="text-[15px]"
              style={{ color: DECOR_COLORS.cocoa, fontWeight: 500 }}
            >
              {label}
            </span>
          </div>
          <p
            className="mt-1 text-[12.5px] italic"
            style={{ fontFamily: FONT_DISPLAY, color: DECOR_COLORS.cocoaSoft }}
          >
            {intro}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="text-[10.5px]"
            style={{
              fontFamily: FONT_MONO,
              letterSpacing: "0.14em",
              color: DECOR_COLORS.cocoaMuted,
            }}
          >
            {checkedCount} / {items.length}
          </span>
          <span
            className="text-[14px]"
            style={{ color: DECOR_COLORS.cocoaMuted }}
          >
            {open ? "−" : "+"}
          </span>
        </div>
      </button>

      {open && (
        <ul
          className="border-t"
          style={{ borderColor: DECOR_COLORS.line }}
        >
          {items.map((item) => {
            const rowState = state.get(item.id);
            const checked = rowState?.checked ?? false;
            const notes = rowState?.notes ?? "";
            return (
              <li
                key={item.id}
                className="border-b px-5 py-3.5 last:border-b-0"
                style={{
                  borderColor: DECOR_COLORS.lineSoft,
                  backgroundColor: checked
                    ? "rgba(139, 158, 126, 0.06)"
                    : "transparent",
                }}
              >
                <label
                  className="flex cursor-pointer items-start gap-2.5"
                  style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoa }}
                >
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      onToggle(item.id);
                    }}
                    className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                    style={{
                      borderColor: checked
                        ? DECOR_COLORS.sage
                        : DECOR_COLORS.line,
                      backgroundColor: checked ? DECOR_COLORS.sage : "#FFFFFF",
                      color: "#FFFFFF",
                      fontSize: 10,
                      lineHeight: 1,
                    }}
                  >
                    {checked ? "✓" : ""}
                  </span>
                  <span className="flex-1">
                    <span
                      className="text-[13px]"
                      style={{ fontWeight: 500 }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="mt-0.5 block text-[11.5px] leading-snug"
                      style={{ color: DECOR_COLORS.cocoaMuted }}
                    >
                      {item.hint}
                    </span>
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => onNote(item.id, e.target.value)}
                  placeholder="Notes (optional)"
                  className="mt-2 min-h-[40px] w-full rounded-lg border bg-white px-2.5 py-1.5 text-[12px] outline-none"
                  style={{
                    fontFamily: FONT_UI,
                    borderColor: DECOR_COLORS.line,
                    color: DECOR_COLORS.cocoa,
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </Paper>
  );
}
