"use client";

// ── Guest Print Matrix ────────────────────────────────────────────────────
// Indian wedding invitations ship to multiple audiences at once — immediate
// family get the full printed suite, extended family get most of it on
// paper, colleagues and casual guests get digital only. This tab lets the
// couple declare those choices tier-by-tier so the printer gets a real
// per-piece count instead of "print one for every household".
//
// Columns are a fixed, narrow set of pieces (save the date, main invite,
// event cards, menu, program). Rows are user-editable tiers. Each cell
// toggles through Printed → Digital → Skip. Totals column at the bottom
// rolls up the printed + digital counts and flags the delta vs. the Suite
// Builder's current per-piece quantity.

import { useMemo, useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStationeryStore } from "@/stores/stationery-store";
import {
  STATIONERY_MATRIX_MODE_LABEL,
  STATIONERY_MATRIX_PIECE_LABEL,
  STATIONERY_MATRIX_PIECES,
  matrixCellKey,
} from "@/types/stationery";
import type {
  StationeryGuestTier,
  StationeryMatrixMode,
  StationeryMatrixPiece,
  StationerySuiteKind,
} from "@/types/stationery";
import {
  Eyebrow,
  MiniStat,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";

// Default mode for any cell the couple hasn't touched yet. The Suite
// Builder's most intuitive assumption is "printed, one per household" —
// we follow the same convention so the matrix on first render matches
// what a planner would fill in by hand.
const DEFAULT_MODE: StationeryMatrixMode = "printed";

// Matrix pieces map 1:1 to suite-item kinds. The aliasing keeps the
// matrix column width stable as the suite catalogue grows.
const PIECE_TO_SUITE_KIND: Record<StationeryMatrixPiece, StationerySuiteKind> = {
  save_the_date: "save_the_date",
  main_invitation: "main_invitation",
  event_insert: "event_insert",
  menu_card: "menu_card",
  ceremony_program: "ceremony_program",
};

const MODE_CYCLE: StationeryMatrixMode[] = ["printed", "digital", "omit"];

export function GuestPrintMatrix() {
  const tiers = useStationeryStore((s) => s.tiers);
  const matrix = useStationeryStore((s) => s.matrix);
  const addTier = useStationeryStore((s) => s.addTier);
  const updateTier = useStationeryStore((s) => s.updateTier);
  const deleteTier = useStationeryStore((s) => s.deleteTier);
  const setCell = useStationeryStore((s) => s.setMatrixCell);
  const resetMatrix = useStationeryStore((s) => s.resetMatrixToSuggested);
  const suite = useStationeryStore((s) => s.suite);

  const sortedTiers = useMemo(
    () => [...tiers].sort((a, b) => a.sort_order - b.sort_order),
    [tiers],
  );

  // Column totals + suite delta comparisons.
  const columnTotals = useMemo(() => {
    const out: Record<
      StationeryMatrixPiece,
      { printed: number; digital: number; omitted: number }
    > = {} as Record<
      StationeryMatrixPiece,
      { printed: number; digital: number; omitted: number }
    >;
    for (const piece of STATIONERY_MATRIX_PIECES) {
      let printed = 0;
      let digital = 0;
      let omitted = 0;
      for (const tier of sortedTiers) {
        const mode = cellMode(matrix, tier.id, piece);
        if (mode === "printed") printed += tier.households;
        else if (mode === "digital") digital += tier.households;
        else omitted += tier.households;
      }
      out[piece] = { printed, digital, omitted };
    }
    return out;
  }, [sortedTiers, matrix]);

  // Compare printed totals against the Suite Builder quantities — helps the
  // couple notice when their matrix plan doesn't match what the printer
  // has been briefed to run.
  const suiteDeltas = useMemo(() => {
    const out: Partial<Record<StationeryMatrixPiece, number | null>> = {};
    for (const piece of STATIONERY_MATRIX_PIECES) {
      const kind = PIECE_TO_SUITE_KIND[piece];
      const items = suite.filter((s) => s.kind === kind);
      if (items.length === 0) {
        out[piece] = null;
        continue;
      }
      const suiteQty = items.reduce((sum, i) => sum + i.quantity, 0);
      out[piece] = suiteQty;
    }
    return out;
  }, [suite]);

  const totalHouseholds = sortedTiers.reduce((sum, t) => sum + t.households, 0);
  const printedSum = Object.values(columnTotals).reduce(
    (sum, c) => sum + c.printed,
    0,
  );
  const digitalSum = Object.values(columnTotals).reduce(
    (sum, c) => sum + c.digital,
    0,
  );

  const [addingTier, setAddingTier] = useState(false);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Guest Print Matrix"
        title="Who gets what, printed vs. digital"
        description="Not every guest gets every piece. Map it here so your printer knows exactly how many of each to produce — and so you don't over-print the program for people who'll only come to the reception."
        right={
          <button
            type="button"
            onClick={resetMatrix}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
            aria-label="Reset matrix to suggested defaults"
          >
            <RotateCcw size={12} strokeWidth={1.8} />
            Reset to suggested
          </button>
        }
      />

      {/* ── Summary strip ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat
          label="Tiers"
          value={sortedTiers.length}
          hint="Audience groups you've defined"
        />
        <MiniStat
          label="Total households"
          value={totalHouseholds.toLocaleString()}
          hint="Across every tier"
        />
        <MiniStat
          label="Printed sends"
          value={printedSum.toLocaleString()}
          hint="Summed across all pieces"
          tone="saffron"
        />
        <MiniStat
          label="Digital sends"
          value={digitalSum.toLocaleString()}
          hint="E-invites + QR RSVP"
          tone="sage"
        />
      </div>

      {/* ── Matrix grid ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="min-w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-border bg-ivory-warm/50 text-left">
              <th className="px-4 py-3">
                <Eyebrow>Guest tier</Eyebrow>
              </th>
              <th className="px-3 py-3 text-right">
                <Eyebrow>Households</Eyebrow>
              </th>
              {STATIONERY_MATRIX_PIECES.map((piece) => (
                <th key={piece} className="px-3 py-3 text-center">
                  <Eyebrow>{STATIONERY_MATRIX_PIECE_LABEL[piece]}</Eyebrow>
                </th>
              ))}
              <th className="w-8 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {sortedTiers.length === 0 ? (
              <tr>
                <td
                  colSpan={STATIONERY_MATRIX_PIECES.length + 3}
                  className="px-4 py-8 text-center font-serif text-[15px] italic text-ink-muted"
                >
                  No tiers yet. Add your first audience group to start mapping
                  who gets what.
                </td>
              </tr>
            ) : (
              sortedTiers.map((tier) => (
                <TierRow
                  key={tier.id}
                  tier={tier}
                  matrix={matrix}
                  onToggleCell={(piece, mode) => setCell(tier.id, piece, mode)}
                  onUpdateTier={(patch) => updateTier(tier.id, patch)}
                  onDeleteTier={() => deleteTier(tier.id)}
                />
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-ivory-warm/40">
              <td className="px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-stone-500">
                  Print quantity
                </p>
              </td>
              <td className="px-3 py-3 text-right font-mono text-[12px] tabular-nums text-ink-muted">
                {totalHouseholds.toLocaleString()}
              </td>
              {STATIONERY_MATRIX_PIECES.map((piece) => {
                const totals = columnTotals[piece];
                const suiteQty = suiteDeltas[piece];
                const delta =
                  suiteQty != null ? totals.printed - suiteQty : null;
                return (
                  <td
                    key={piece}
                    className="px-3 py-3 text-center align-top"
                  >
                    <p className="font-mono text-[13px] tabular-nums font-medium text-ink">
                      {totals.printed.toLocaleString()}
                    </p>
                    {totals.digital > 0 && (
                      <p className="mt-0.5 font-mono text-[10px] text-sage">
                        + {totals.digital.toLocaleString()} digital
                      </p>
                    )}
                    {delta != null && delta !== 0 && (
                      <p
                        className={cn(
                          "mt-1 font-mono text-[9.5px]",
                          delta > 0 ? "text-rose" : "text-saffron",
                        )}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta} vs suite
                      </p>
                    )}
                  </td>
                );
              })}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-[11.5px] italic text-ink-muted">
        P = printed · D = digital · Skip = this tier doesn't receive this piece.
        Click any cell to cycle modes.
      </p>

      {/* ── Add tier ──────────────────────────────────────────────────── */}
      {addingTier ? (
        <AddTierForm
          onDone={() => setAddingTier(false)}
          onSubmit={(label, households) => {
            addTier({ label, households });
            setAddingTier(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddingTier(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-ivory-warm/40 px-3 py-2 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={12} strokeWidth={1.8} />
          Add audience tier
        </button>
      )}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────

function TierRow({
  tier,
  matrix,
  onToggleCell,
  onUpdateTier,
  onDeleteTier,
}: {
  tier: StationeryGuestTier;
  matrix: Record<string, StationeryMatrixMode>;
  onToggleCell: (piece: StationeryMatrixPiece, mode: StationeryMatrixMode) => void;
  onUpdateTier: (patch: Partial<StationeryGuestTier>) => void;
  onDeleteTier: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState(tier.label);
  const [countDraft, setCountDraft] = useState(tier.households);

  function commit() {
    const nextLabel = labelDraft.trim() || tier.label;
    onUpdateTier({
      label: nextLabel,
      households: Math.max(0, Math.round(countDraft)),
    });
    setEditing(false);
  }

  return (
    <tr className="border-b border-border/60 hover:bg-ivory-warm/20">
      <td className="px-4 py-3 align-top">
        {editing ? (
          <input
            type="text"
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            autoFocus
            className="w-full rounded-sm border border-saffron bg-white px-2 py-1 text-[13px] text-ink focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-left"
          >
            <p className="text-[13px] font-medium text-ink">{tier.label}</p>
            {tier.description && (
              <p className="mt-0.5 text-[11.5px] italic text-ink-muted">
                {tier.description}
              </p>
            )}
          </button>
        )}
      </td>
      <td className="px-3 py-3 text-right align-top">
        {editing ? (
          <input
            type="number"
            min={0}
            value={countDraft}
            onChange={(e) => setCountDraft(Number(e.target.value) || 0)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="w-20 rounded-sm border border-saffron bg-white px-2 py-1 text-right text-[13px] tabular-nums text-ink focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setCountDraft(tier.households);
              setEditing(true);
            }}
            className="font-mono text-[12px] tabular-nums text-ink"
          >
            {tier.households.toLocaleString()}
          </button>
        )}
      </td>
      {STATIONERY_MATRIX_PIECES.map((piece) => {
        const mode = cellMode(matrix, tier.id, piece);
        return (
          <td key={piece} className="px-3 py-3 text-center align-top">
            <ModeCell
              mode={mode}
              onClick={() => onToggleCell(piece, nextMode(mode))}
            />
          </td>
        );
      })}
      <td className="px-2 py-3 text-right align-top">
        <button
          type="button"
          onClick={onDeleteTier}
          className="text-ink-faint transition-colors hover:text-rose"
          aria-label={`Remove ${tier.label}`}
        >
          <Trash2 size={12} strokeWidth={1.8} />
        </button>
      </td>
    </tr>
  );
}

function ModeCell({
  mode,
  onClick,
}: {
  mode: StationeryMatrixMode;
  onClick: () => void;
}) {
  const tone = modeTone(mode);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-w-[3.25rem] items-center justify-center rounded-sm px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
        tone,
      )}
      title={`${STATIONERY_MATRIX_MODE_LABEL[mode]} — click to cycle`}
    >
      {shortLabel(mode)}
    </button>
  );
}

function shortLabel(mode: StationeryMatrixMode): string {
  switch (mode) {
    case "printed":
      return "P";
    case "digital":
      return "D";
    case "omit":
      return "—";
  }
}

function modeTone(mode: StationeryMatrixMode): string {
  switch (mode) {
    case "printed":
      return "bg-saffron-pale/70 text-saffron hover:bg-saffron-pale";
    case "digital":
      return "bg-sage-pale/60 text-sage hover:bg-sage-pale";
    case "omit":
      return "bg-ivory-warm text-ink-faint hover:bg-stone-100";
  }
}

function nextMode(mode: StationeryMatrixMode): StationeryMatrixMode {
  const idx = MODE_CYCLE.indexOf(mode);
  return MODE_CYCLE[(idx + 1) % MODE_CYCLE.length]!;
}

function cellMode(
  matrix: Record<string, StationeryMatrixMode>,
  tierId: string,
  piece: StationeryMatrixPiece,
): StationeryMatrixMode {
  return matrix[matrixCellKey(tierId, piece)] ?? DEFAULT_MODE;
}

// ── Add tier form ─────────────────────────────────────────────────────────

function AddTierForm({
  onSubmit,
  onDone,
}: {
  onSubmit: (label: string, households: number) => void;
  onDone: () => void;
}) {
  const [label, setLabel] = useState("");
  const [households, setHouseholds] = useState(0);

  return (
    <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[3fr_1fr_auto] md:items-end">
        <label className="flex flex-col">
          <Eyebrow className="mb-1">Tier name</Eyebrow>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. International family"
            className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
          />
        </label>
        <label className="flex flex-col">
          <Eyebrow className="mb-1">Households</Eyebrow>
          <input
            type="number"
            min={0}
            value={households}
            onChange={(e) => setHouseholds(Number(e.target.value) || 0)}
            className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] tabular-nums text-ink focus:border-saffron focus:outline-none"
          />
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!label.trim()}
            onClick={() => onSubmit(label.trim(), Math.max(0, households))}
            className={cn(
              "rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors",
              label.trim()
                ? "bg-ink text-ivory"
                : "bg-ivory-warm text-ink-faint",
            )}
          >
            Add tier
          </button>
          <button
            type="button"
            onClick={onDone}
            className="text-[11.5px] text-ink-muted hover:text-saffron"
          >
            Cancel
          </button>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-ink-muted">
        New tiers default to {STATIONERY_MATRIX_MODE_LABEL[DEFAULT_MODE].toLowerCase()} for every piece — click a cell to change.
      </p>
    </div>
  );
}
