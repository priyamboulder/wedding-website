"use client";

// ── Table summary sidebar ───────────────────────────────────────────
// Right-side collapsible sidebar. Lists every table with its shape,
// seat count, and (for now) a placeholder for assigned guest count —
// guest drag-and-drop is the follow-on prompt. Clicking a row selects
// the table on the canvas.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Copy, Plus, Trash2 } from "lucide-react";
import { totalCapacity, useSeatingStore } from "@/stores/seating-store";
import type { SeatingTable, TableShape } from "@/types/seating";

const SHAPE_LABEL: Record<TableShape, string> = {
  round: "Round",
  rect: "Rectangular",
  banquet: "Long Banquet",
  u_shape: "U-Shape",
};

export function TableSidebar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const tables = useSeatingStore((s) => s.tables);
  const selectedTableId = useSeatingStore((s) => s.selectedTableId);
  const selectTable = useSeatingStore((s) => s.selectTable);
  const addTable = useSeatingStore((s) => s.addTable);
  const updateTable = useSeatingStore((s) => s.updateTable);
  const duplicateTable = useSeatingStore((s) => s.duplicateTable);
  const removeTable = useSeatingStore((s) => s.removeTable);

  const [addingOpen, setAddingOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState("");

  const capacity = totalCapacity(tables);

  if (!open) {
    return (
      <button
        onClick={onToggle}
        className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-[11.5px] text-ink-muted hover:border-ink/20 hover:text-ink"
        title="Open table list"
      >
        <ChevronLeft size={13} strokeWidth={1.6} />
        Tables · {tables.length}
      </button>
    );
  }

  const sorted = [...tables].sort((a, b) => a.number - b.number);

  return (
    <aside className="flex h-full w-[300px] flex-shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-white">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="font-serif text-[15px] text-ink">Tables</h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {tables.length} tables · {capacity} seats
          </p>
        </div>
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:bg-ivory hover:text-ink"
          title="Collapse"
        >
          <ChevronRight size={14} strokeWidth={1.6} />
        </button>
      </header>

      {/* Add table bar */}
      <div className="border-b border-border bg-ivory/30 px-4 py-2.5">
        {!addingOpen ? (
          <button
            onClick={() => setAddingOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:opacity-90"
          >
            <Plus size={12} strokeWidth={1.8} />
            Add table
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(SHAPE_LABEL) as TableShape[]).map((shape) => (
              <button
                key={shape}
                onClick={() => {
                  addTable(shape);
                  setAddingOpen(false);
                }}
                className="rounded border border-border bg-white px-2 py-1.5 text-left text-[11.5px] text-ink hover:border-ink/25"
              >
                <ShapeIcon shape={shape} />
                <span className="ml-1.5 align-middle">{SHAPE_LABEL[shape]}</span>
              </button>
            ))}
            <button
              onClick={() => setAddingOpen(false)}
              className="col-span-2 rounded px-2 py-1 text-[11px] text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 && (
          <div className="px-4 py-10 text-center text-[12px] italic text-ink-faint">
            No tables yet. Add one above or apply a preset.
          </div>
        )}
        {sorted.map((t) => (
          <TableRow
            key={t.id}
            table={t}
            selected={t.id === selectedTableId}
            editing={editingId === t.id}
            labelDraft={labelDraft}
            onSelect={() => selectTable(t.id)}
            onStartEdit={() => {
              setEditingId(t.id);
              setLabelDraft(t.label ?? "");
            }}
            onLabelChange={setLabelDraft}
            onCommit={() => {
              updateTable(t.id, { label: labelDraft.trim() || undefined });
              setEditingId(null);
            }}
            onCancelEdit={() => setEditingId(null)}
            onSeatChange={(seats) => updateTable(t.id, { seats })}
            onDuplicate={() => duplicateTable(t.id)}
            onRemove={() => removeTable(t.id)}
          />
        ))}
      </div>
    </aside>
  );
}

function TableRow({
  table,
  selected,
  editing,
  labelDraft,
  onSelect,
  onStartEdit,
  onLabelChange,
  onCommit,
  onCancelEdit,
  onSeatChange,
  onDuplicate,
  onRemove,
}: {
  table: SeatingTable;
  selected: boolean;
  editing: boolean;
  labelDraft: string;
  onSelect: () => void;
  onStartEdit: () => void;
  onLabelChange: (v: string) => void;
  onCommit: () => void;
  onCancelEdit: () => void;
  onSeatChange: (seats: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const label = table.label?.trim() || `T${table.number}`;
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-3 border-b border-border/50 px-4 py-2.5 hover:bg-ivory/40",
        selected && "bg-gold-pale/25",
      )}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border border-border bg-white">
        <ShapeIcon shape={table.shape} />
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={labelDraft}
            onChange={(e) => onLabelChange(e.target.value)}
            onBlur={onCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommit();
              if (e.key === "Escape") onCancelEdit();
            }}
            placeholder={`T${table.number}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded border border-ink/25 bg-white px-1.5 py-0.5 text-[12.5px] text-ink outline-none"
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            className="block w-full truncate text-left font-serif text-[13px] text-ink"
            title="Click to rename"
          >
            {label}
          </button>
        )}
        <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-ink-muted">
          <span>{SHAPE_LABEL[table.shape]}</span>
          <span>·</span>
          <label className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="number"
              min={2}
              max={30}
              value={table.seats}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n) && n >= 2 && n <= 30) onSeatChange(n);
              }}
              className="w-10 rounded border border-border bg-white px-1 py-0.5 text-right text-[10px] text-ink outline-none focus:border-ink/30"
            />
            <span>seats</span>
          </label>
        </div>
        <div className="mt-1 font-mono text-[9.5px] text-ink-faint">
          0 / {table.seats} assigned
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-ink-muted hover:bg-white hover:text-ink"
          title="Duplicate"
        >
          <Copy size={11} strokeWidth={1.7} />
        </button>
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
    </div>
  );
}

function ShapeIcon({ shape }: { shape: TableShape }) {
  const color = "#7a6a52";
  if (shape === "round") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16">
        <circle cx={8} cy={8} r={5} fill="#fffbf2" stroke={color} strokeWidth={1.1} />
      </svg>
    );
  }
  if (shape === "rect") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16">
        <rect x={2} y={5.5} width={12} height={5} rx={0.6} fill="#fffbf2" stroke={color} strokeWidth={1.1} />
      </svg>
    );
  }
  if (shape === "banquet") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16">
        <rect x={1} y={6.5} width={14} height={3} rx={0.4} fill="#fffbf2" stroke={color} strokeWidth={1.1} />
      </svg>
    );
  }
  return (
    <svg width={16} height={16} viewBox="0 0 16 16">
      <path
        d="M 2 3 L 14 3 L 14 13 L 11.5 13 L 11.5 5.5 L 4.5 5.5 L 4.5 13 L 2 13 Z"
        fill="#fffbf2"
        stroke={color}
        strokeWidth={1.1}
      />
    </svg>
  );
}
