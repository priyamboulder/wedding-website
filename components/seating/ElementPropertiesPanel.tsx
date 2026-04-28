"use client";

// ── Element Properties Panel ────────────────────────────────────────────
// Floating panel that appears when a fixed element is selected on the
// canvas. Edits common fields + type-specific property groups (vendor,
// AV/power, food, staffing, games, lounge).

import { useMemo, useState } from "react";
import { Lock, Trash2, Unlock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSeatingStore } from "@/stores/seating-store";
import {
  getElementDef,
  type PropertyGroup,
} from "@/lib/floor-plan-library";
import type { ElementProperties, FixedElement } from "@/types/seating";

const COLOR_PALETTE: string[] = [
  "rgba(201, 162, 66, 0.22)", // gold
  "rgba(168, 108, 128, 0.22)", // rose
  "rgba(141, 170, 196, 0.22)", // blue
  "rgba(126, 164, 104, 0.22)", // sage
  "rgba(162, 140, 112, 0.22)", // warm taupe
  "rgba(94, 100, 125, 0.22)", // slate
  "rgba(232, 188, 148, 0.30)", // peach
  "rgba(130, 130, 130, 0.22)", // gray
];

export function ElementPropertiesPanel() {
  const selectedId = useSeatingStore((s) => s.selectedFixedId);
  const element = useSeatingStore((s) =>
    selectedId ? s.fixed.find((f) => f.id === selectedId) : undefined,
  );
  const updateFixedElement = useSeatingStore((s) => s.updateFixedElement);
  const updateProps = useSeatingStore((s) => s.updateFixedElementProperties);
  const removeFixedElement = useSeatingStore((s) => s.removeFixedElement);
  const selectFixed = useSeatingStore((s) => s.selectFixed);

  const [openGroup, setOpenGroup] = useState<PropertyGroup | "common" | null>(
    "common",
  );

  const def = useMemo(
    () => (element ? getElementDef(element.kind) : undefined),
    [element],
  );

  if (!element) return null;

  const groups = def?.propertyGroups ?? [];
  const sizePresets = def?.sizePresets;
  const area = +(element.width * element.height).toFixed(1);

  return (
    <aside className="absolute right-3 top-16 z-20 flex h-[540px] w-[300px] flex-col overflow-hidden rounded-lg border border-border bg-white shadow-xl">
      <header className="flex items-start justify-between border-b border-border bg-ivory/40 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
            {def?.name ?? element.kind}
          </div>
          <input
            value={element.label}
            onChange={(e) =>
              updateFixedElement(element.id, { label: e.target.value })
            }
            className="mt-0.5 w-full border-none bg-transparent font-serif text-[14.5px] text-ink outline-none"
          />
        </div>
        <button
          onClick={() => selectFixed(null)}
          className="flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:bg-white hover:text-ink"
        >
          <X size={13} strokeWidth={1.6} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Common — always open */}
        <Section
          title="Dimensions & position"
          open={openGroup === "common"}
          onToggle={() => setOpenGroup(openGroup === "common" ? null : "common")}
        >
          {sizePresets && (
            <div className="mb-2 flex flex-wrap gap-1">
              {sizePresets.map((p) => {
                const active =
                  element.width === p.width && element.height === p.height;
                return (
                  <button
                    key={p.label}
                    onClick={() =>
                      updateFixedElement(element.id, {
                        width: p.width,
                        height: p.height,
                      })
                    }
                    className={cn(
                      "rounded border px-2 py-0.5 text-[10.5px]",
                      active
                        ? "border-ink bg-ink text-ivory"
                        : "border-border bg-white text-ink-muted hover:border-ink/25 hover:text-ink",
                    )}
                    title={p.note}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Width (ft)"
              value={element.width}
              min={1}
              max={80}
              onChange={(v) => updateFixedElement(element.id, { width: v })}
            />
            <NumberField
              label="Depth (ft)"
              value={element.height}
              min={1}
              max={60}
              onChange={(v) => updateFixedElement(element.id, { height: v })}
            />
            <NumberField
              label="X (ft)"
              value={+element.x.toFixed(1)}
              min={0}
              max={120}
              onChange={(v) => updateFixedElement(element.id, { x: v })}
            />
            <NumberField
              label="Y (ft)"
              value={+element.y.toFixed(1)}
              min={0}
              max={120}
              onChange={(v) => updateFixedElement(element.id, { y: v })}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-1 text-[11px] text-ink-muted">
              <span>Rotation</span>
              <select
                value={element.rotation}
                onChange={(e) =>
                  updateFixedElement(element.id, {
                    rotation: Number(e.target.value),
                  })
                }
                className="rounded border border-border bg-white px-1.5 py-0.5 text-[11px] text-ink"
              >
                <option value={0}>0°</option>
                <option value={90}>90°</option>
                <option value={180}>180°</option>
                <option value={270}>270°</option>
              </select>
            </label>
            <div className="font-mono text-[10px] text-ink-faint">
              area: {area} ft²
            </div>
          </div>

          {/* Dance floor helper */}
          {element.kind === "dance_floor" && (
            <div className="mt-2 rounded border border-dashed border-gold/40 bg-gold-pale/15 px-2.5 py-1.5 text-[10.5px] leading-snug text-ink-muted">
              {area} sq ft — comfortable for ~{Math.floor(area / 7)} dancers
              (rule of thumb: 6–8 sq ft per dancer).
            </div>
          )}

          {/* Color palette */}
          <div className="mt-3">
            <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
              Color
            </div>
            <div className="flex flex-wrap gap-1">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => updateFixedElement(element.id, { color: c })}
                  className={cn(
                    "h-5 w-5 rounded border",
                    element.color === c ? "border-ink" : "border-border",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
              {element.color && (
                <button
                  onClick={() => updateFixedElement(element.id, { color: undefined })}
                  className="rounded border border-border bg-white px-1.5 text-[9.5px] text-ink-muted hover:border-ink/25 hover:text-ink"
                >
                  reset
                </button>
              )}
            </div>
          </div>

          {/* Layer + lock */}
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <span>Layer</span>
              <select
                value={element.layer ?? "furniture"}
                onChange={(e) =>
                  updateFixedElement(element.id, {
                    layer: e.target.value as "furniture" | "zone_overlay",
                  })
                }
                className="rounded border border-border bg-white px-1.5 py-0.5 text-[11px] text-ink"
              >
                <option value="furniture">Furniture</option>
                <option value="zone_overlay">Zone overlay</option>
              </select>
            </label>
            <button
              onClick={() =>
                updateFixedElement(element.id, { locked: !element.locked })
              }
              className={cn(
                "flex items-center gap-1 rounded border px-2 py-0.5 text-[10.5px]",
                element.locked
                  ? "border-ink/25 bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-ink/25 hover:text-ink",
              )}
            >
              {element.locked ? (
                <Lock size={10} strokeWidth={1.7} />
              ) : (
                <Unlock size={10} strokeWidth={1.7} />
              )}
              {element.locked ? "Locked" : "Lock"}
            </button>
          </div>

          {/* Notes */}
          <div className="mt-3">
            <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
              Notes
            </div>
            <textarea
              rows={2}
              value={element.notes ?? ""}
              onChange={(e) =>
                updateFixedElement(element.id, { notes: e.target.value })
              }
              placeholder="Setup notes, special requests…"
              className="w-full rounded border border-border bg-ivory/30 px-2 py-1.5 text-[11.5px] text-ink outline-none focus:border-ink/30 focus:bg-white"
            />
          </div>
        </Section>

        {groups.includes("vendor") && (
          <Section
            title="Vendor"
            open={openGroup === "vendor"}
            onToggle={() =>
              setOpenGroup(openGroup === "vendor" ? null : "vendor")
            }
          >
            <PropField
              label="Vendor name"
              value={element.properties?.vendorName}
              onChange={(v) => updateProps(element.id, { vendorName: v })}
            />
            <PropField
              label="Contact (phone / email)"
              value={element.properties?.vendorContact}
              onChange={(v) => updateProps(element.id, { vendorContact: v })}
            />
            <PropField
              label="Setup time"
              value={element.properties?.setupTime}
              placeholder="e.g. 2 hours before"
              onChange={(v) => updateProps(element.id, { setupTime: v })}
            />
            <PropField
              label="Teardown time"
              value={element.properties?.teardownTime}
              placeholder="e.g. 30 min after"
              onChange={(v) => updateProps(element.id, { teardownTime: v })}
            />
            <PropNumberField
              label="Cost (₹)"
              value={element.properties?.cost}
              onChange={(v) => updateProps(element.id, { cost: v })}
            />
          </Section>
        )}

        {groups.includes("staffing") && (
          <Section
            title="Staffing"
            open={openGroup === "staffing"}
            onToggle={() =>
              setOpenGroup(openGroup === "staffing" ? null : "staffing")
            }
          >
            <PropNumberField
              label="Staff count"
              value={element.properties?.staffingCount}
              onChange={(v) => updateProps(element.id, { staffingCount: v })}
            />
          </Section>
        )}

        {groups.includes("av_power") && (
          <Section
            title="Power & AV"
            open={openGroup === "av_power"}
            onToggle={() =>
              setOpenGroup(openGroup === "av_power" ? null : "av_power")
            }
          >
            <Toggle
              label="Needs power"
              value={element.properties?.needsPower}
              onChange={(v) => updateProps(element.id, { needsPower: v })}
            />
            {element.properties?.needsPower && (
              <PropNumberField
                label="Watts (estimate)"
                value={element.properties?.powerWatts}
                onChange={(v) => updateProps(element.id, { powerWatts: v })}
              />
            )}
            <Toggle
              label="Power outlet"
              value={element.properties?.needsOutlet}
              onChange={(v) => updateProps(element.id, { needsOutlet: v })}
            />
            <Toggle
              label="Ethernet"
              value={element.properties?.needsEthernet}
              onChange={(v) => updateProps(element.id, { needsEthernet: v })}
            />
            <Toggle
              label="HDMI input"
              value={element.properties?.needsHdmi}
              onChange={(v) => updateProps(element.id, { needsHdmi: v })}
            />
            <Toggle
              label="Wireless mic"
              value={element.properties?.needsWirelessMic}
              onChange={(v) => updateProps(element.id, { needsWirelessMic: v })}
            />
            <Toggle
              label="Spotlight"
              value={element.properties?.needsSpotlight}
              onChange={(v) => updateProps(element.id, { needsSpotlight: v })}
            />
          </Section>
        )}

        {groups.includes("food") && (
          <Section
            title="Food / Beverage"
            open={openGroup === "food"}
            onToggle={() => setOpenGroup(openGroup === "food" ? null : "food")}
          >
            <PropField
              label="Cuisine / type"
              value={element.properties?.cuisineType}
              placeholder="e.g. North Indian, Chaat, Mocktails"
              onChange={(v) => updateProps(element.id, { cuisineType: v })}
            />
            <div className="mb-2">
              <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                Menu items
              </div>
              <textarea
                rows={2}
                value={element.properties?.menuItems ?? ""}
                onChange={(e) =>
                  updateProps(element.id, { menuItems: e.target.value })
                }
                placeholder="Paneer tikka, Dal makhani, Naan, Biryani…"
                className="w-full rounded border border-border bg-ivory/30 px-2 py-1.5 text-[11.5px] text-ink outline-none focus:border-ink/30 focus:bg-white"
              />
            </div>
            <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
              Dietary coverage
            </div>
            <div className="grid grid-cols-2 gap-1">
              <Toggle
                label="Veg"
                value={element.properties?.dietaryVeg}
                onChange={(v) => updateProps(element.id, { dietaryVeg: v })}
              />
              <Toggle
                label="Non-veg"
                value={element.properties?.dietaryNonVeg}
                onChange={(v) => updateProps(element.id, { dietaryNonVeg: v })}
              />
              <Toggle
                label="Jain"
                value={element.properties?.dietaryJain}
                onChange={(v) => updateProps(element.id, { dietaryJain: v })}
              />
              <Toggle
                label="Halal"
                value={element.properties?.dietaryHalal}
                onChange={(v) => updateProps(element.id, { dietaryHalal: v })}
              />
            </div>
            <div className="mt-2">
              <Toggle
                label="Ventilation needed"
                value={element.properties?.needsVentilation}
                onChange={(v) => updateProps(element.id, { needsVentilation: v })}
              />
            </div>
          </Section>
        )}

        {groups.includes("games") && (
          <Section
            title="Games"
            open={openGroup === "games"}
            onToggle={() =>
              setOpenGroup(openGroup === "games" ? null : "games")
            }
          >
            <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
              Games list
            </div>
            <textarea
              rows={3}
              value={element.properties?.gamesList ?? ""}
              onChange={(e) =>
                updateProps(element.id, { gamesList: e.target.value })
              }
              placeholder="Giant Jenga, Cornhole, Ring Toss…"
              className="w-full rounded border border-border bg-ivory/30 px-2 py-1.5 text-[11.5px] text-ink outline-none focus:border-ink/30 focus:bg-white"
            />
          </Section>
        )}

        {groups.includes("lounge") && (
          <Section
            title="Lounge"
            open={openGroup === "lounge"}
            onToggle={() =>
              setOpenGroup(openGroup === "lounge" ? null : "lounge")
            }
          >
            <PropNumberField
              label="Seat count"
              value={element.properties?.seatCount}
              onChange={(v) => updateProps(element.id, { seatCount: v })}
            />
            <PropField
              label="Style"
              value={element.properties?.loungeStyle}
              placeholder="Moroccan cushions, velvet sofas…"
              onChange={(v) => updateProps(element.id, { loungeStyle: v })}
            />
          </Section>
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-border bg-ivory/30 px-4 py-2.5">
        <button
          onClick={() => {
            if (window.confirm(`Delete ${element.label}?`)) {
              removeFixedElement(element.id);
            }
          }}
          className="flex items-center gap-1 rounded border border-border bg-white px-2 py-1 text-[11px] text-rose hover:border-rose/30"
        >
          <Trash2 size={11} strokeWidth={1.7} />
          Delete
        </button>
        <div className="font-mono text-[9.5px] text-ink-faint">
          id: {element.id.slice(0, 6)}
        </div>
      </footer>
    </aside>
  );
}

// ── Section ────────────────────────────────────────────────────────────
function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 rounded-md border border-border bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink"
      >
        {title}
        <span className="text-ink-faint">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="border-t border-border px-3 py-2.5">{children}</div>}
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={0.5}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="mt-0.5 w-full rounded border border-border bg-ivory/30 px-1.5 py-1 text-[11.5px] text-ink outline-none focus:border-ink/30 focus:bg-white"
      />
    </label>
  );
}

function PropField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="mb-2 block">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-0.5 w-full rounded border border-border bg-ivory/30 px-2 py-1 text-[11.5px] text-ink outline-none focus:border-ink/30 focus:bg-white"
      />
    </label>
  );
}

function PropNumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <label className="mb-2 block">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const s = e.target.value;
          if (s === "") return onChange(undefined);
          const n = Number(s);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="mt-0.5 w-full rounded border border-border bg-ivory/30 px-2 py-1 text-[11.5px] text-ink outline-none focus:border-ink/30 focus:bg-white"
      />
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: boolean;
  onChange: (v: boolean) => void;
}) {
  const active = !!value;
  return (
    <label className="mb-1 flex cursor-pointer items-center justify-between gap-2 rounded border border-border bg-ivory/20 px-2 py-1 text-[11px] text-ink">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!active)}
        className={cn(
          "relative h-4 w-7 flex-shrink-0 rounded-full transition",
          active ? "bg-ink" : "bg-ink/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3 w-3 rounded-full bg-white transition",
            active ? "left-3.5" : "left-0.5",
          )}
        />
      </button>
    </label>
  );
}

// Keep ElementProperties import alive for downstream consumers.
export type { ElementProperties };
// Keep FixedElement import alive for downstream consumers.
export type { FixedElement };
