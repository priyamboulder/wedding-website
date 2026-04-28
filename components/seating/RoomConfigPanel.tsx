"use client";

// ── Room configuration panel ────────────────────────────────────────
// Collapsible left sidebar. Covers:
//   · Room name + dimensions (ft / m toggle — storage is always ft)
//   · Add fixed elements (stage, head table, dance floor, bar, buffet, DJ,
//     photo booth, door)
//   · Layout presets
//   · Reset

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Layout as LayoutIcon,
} from "lucide-react";
import { useSeatingStore } from "@/stores/seating-store";
import { LAYOUT_PRESETS, FIXED_ELEMENT_STYLES } from "@/lib/seating-seed";
import type { FixedElementKind, LayoutPresetId } from "@/types/seating";

const FT_PER_M = 3.28084;

const ELEMENT_PALETTE: Array<{
  kind: FixedElementKind;
  description: string;
}> = [
  { kind: "stage", description: "Raised platform for speeches, performances" },
  { kind: "head_table", description: "Couple + wedding party" },
  { kind: "dance_floor", description: "Central clear area for dancing" },
  { kind: "bar", description: "Service bar (place multiple)" },
  { kind: "buffet", description: "Food station (place multiple)" },
  { kind: "dj", description: "DJ / sound booth" },
  { kind: "photo_booth", description: "Photo opportunity setup" },
  { kind: "door", description: "Entry or exit — place along a wall" },
];

export function RoomConfigPanel({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const room = useSeatingStore((s) => s.room);
  const setRoom = useSeatingStore((s) => s.setRoom);
  const addFixedElement = useSeatingStore((s) => s.addFixedElement);
  const applyPreset = useSeatingStore((s) => s.applyPreset);
  const resetLayout = useSeatingStore((s) => s.resetLayout);
  const presetId = useSeatingStore((s) => s.presetId);

  // Local edit state for dimensions so typing a new number doesn't
  // immediately resize the room mid-keystroke.
  const [len, setLen] = useState<string>(() =>
    formatForUnit(room.length, room.unit),
  );
  const [wid, setWid] = useState<string>(() =>
    formatForUnit(room.width, room.unit),
  );

  function formatForUnit(feet: number, unit: "ft" | "m") {
    return unit === "ft"
      ? String(Math.round(feet))
      : String(+(feet / FT_PER_M).toFixed(1));
  }

  function commitDimensions() {
    const l = Number(len);
    const w = Number(wid);
    if (!Number.isFinite(l) || !Number.isFinite(w) || l < 10 || w < 10) return;
    setRoom({
      length: room.unit === "ft" ? l : +(l * FT_PER_M).toFixed(1),
      width: room.unit === "ft" ? w : +(w * FT_PER_M).toFixed(1),
    });
  }

  function toggleUnit() {
    const next = room.unit === "ft" ? "m" : "ft";
    setRoom({ unit: next });
    setLen(formatForUnit(room.length, next));
    setWid(formatForUnit(room.width, next));
  }

  if (!open) {
    return (
      <button
        onClick={onToggle}
        className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-[11.5px] text-ink-muted hover:border-ink/20 hover:text-ink"
        title="Open room configuration"
      >
        <ChevronRight size={13} strokeWidth={1.6} />
        Configure Room
      </button>
    );
  }

  return (
    <aside className="flex h-full w-[320px] flex-shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-white">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="font-serif text-[15px] text-ink">Room Configuration</h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Dimensions & fixed elements
          </p>
        </div>
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:bg-ivory hover:text-ink"
          title="Collapse"
        >
          <ChevronLeft size={14} strokeWidth={1.6} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Room name */}
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Room name
          </span>
          <input
            type="text"
            value={room.name}
            onChange={(e) => setRoom({ name: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-ivory/30 px-2.5 py-1.5 text-[12.5px] text-ink outline-none focus:border-ink/30 focus:bg-white"
          />
        </label>

        {/* Dimensions */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Dimensions
            </span>
            <button
              onClick={toggleUnit}
              className="rounded border border-border bg-ivory/30 px-2 py-0.5 font-mono text-[10px] text-ink-muted hover:border-ink/20 hover:text-ink"
            >
              {room.unit}
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[11px] text-ink-muted">Length</span>
              <input
                type="number"
                value={len}
                onChange={(e) => setLen(e.target.value)}
                onBlur={commitDimensions}
                className="mt-0.5 w-full rounded-md border border-border bg-ivory/30 px-2 py-1.5 text-[12.5px] text-ink outline-none focus:border-ink/30 focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-ink-muted">Width</span>
              <input
                type="number"
                value={wid}
                onChange={(e) => setWid(e.target.value)}
                onBlur={commitDimensions}
                className="mt-0.5 w-full rounded-md border border-border bg-ivory/30 px-2 py-1.5 text-[12.5px] text-ink outline-none focus:border-ink/30 focus:bg-white"
              />
            </label>
          </div>
        </div>

        {/* Layout presets */}
        <section className="mt-6">
          <div className="flex items-center gap-1.5">
            <LayoutIcon size={12} strokeWidth={1.6} className="text-ink-muted" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Layout presets
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {LAYOUT_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id as LayoutPresetId)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left transition-colors",
                  presetId === p.id
                    ? "border-gold/40 bg-gold-pale/25"
                    : "border-border bg-ivory/30 hover:border-ink/20 hover:bg-ivory",
                )}
              >
                <div className="font-serif text-[13px] text-ink">{p.name}</div>
                <div className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                  {p.description}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={resetLayout}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-transparent px-3 py-1.5 text-[11.5px] text-ink-muted hover:border-ink/25 hover:text-ink"
            title="Reset to default layout"
          >
            <RotateCcw size={11} strokeWidth={1.6} />
            Reset layout
          </button>
        </section>

        {/* Fixed elements */}
        <section className="mt-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Add fixed element
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ELEMENT_PALETTE.map((el) => {
              const style = FIXED_ELEMENT_STYLES[el.kind];
              return (
                <button
                  key={el.kind}
                  onClick={() => addFixedElement(el.kind)}
                  className="group flex flex-col items-start gap-1 rounded-md border border-border bg-ivory/30 px-2.5 py-2 text-left hover:border-ink/25 hover:bg-white"
                  title={el.description}
                >
                  <span
                    className="h-3 w-full rounded-sm"
                    style={{
                      background: style.fill,
                      border: `1px solid ${style.stroke}`,
                    }}
                  />
                  <span className="text-[11.5px] text-ink">{style.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tips */}
        <div className="mt-6 rounded-md border border-dashed border-gold/30 bg-gold-pale/10 px-3 py-2.5 text-[11px] leading-snug text-ink-muted">
          <strong className="text-ink">Tips:</strong> Drag elements to move.
          Scroll to zoom. Shift-drag to free-place (off grid). Right-click a
          table for duplicate / delete. Layouts auto-save.
        </div>
      </div>
    </aside>
  );
}
