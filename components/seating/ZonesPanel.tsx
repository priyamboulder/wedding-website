"use client";

// ── Experience Zones panel ─────────────────────────────────────────────
// Sidebar shown on the "Experience Zones" tab. Manages zone creation,
// editing, and guest-flow ordering. Also surfaces the zone-template
// library (drop a pre-built bundle onto the canvas).

import { useMemo, useState } from "react";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSeatingStore } from "@/stores/seating-store";
import {
  ZONE_TEMPLATES,
  getElementDef,
  type ZoneTemplate,
} from "@/lib/floor-plan-library";
import type { FloorZone } from "@/types/seating";

const ZONE_COLORS: string[] = [
  "rgba(201, 162, 66, 0.16)",
  "rgba(168, 108, 128, 0.16)",
  "rgba(141, 170, 196, 0.18)",
  "rgba(126, 164, 104, 0.18)",
  "rgba(184, 122, 74, 0.14)",
  "rgba(130, 100, 130, 0.16)",
  "rgba(224, 172, 60, 0.14)",
  "rgba(100, 110, 130, 0.16)",
];

export function ZonesPanel() {
  const room = useSeatingStore((s) => s.room);
  const zones = useSeatingStore((s) => s.zones);
  const fixed = useSeatingStore((s) => s.fixed);
  const selectedZoneId = useSeatingStore((s) => s.selectedZoneId);
  const selectZone = useSeatingStore((s) => s.selectZone);
  const addZone = useSeatingStore((s) => s.addZone);
  const updateZone = useSeatingStore((s) => s.updateZone);
  const removeZone = useSeatingStore((s) => s.removeZone);
  const addFixedElement = useSeatingStore((s) => s.addFixedElement);

  const [templateOpen, setTemplateOpen] = useState(false);

  const sortedZones = useMemo(
    () =>
      [...zones].sort(
        (a, b) => (a.flowOrder ?? 999) - (b.flowOrder ?? 999),
      ),
    [zones],
  );

  const containedElements = (zone: FloorZone) => {
    const x1 = zone.x - zone.width / 2;
    const x2 = zone.x + zone.width / 2;
    const y1 = zone.y - zone.height / 2;
    const y2 = zone.y + zone.height / 2;
    return fixed.filter(
      (f) => f.x >= x1 && f.x <= x2 && f.y >= y1 && f.y <= y2,
    );
  };

  const dropTemplate = (tpl: ZoneTemplate) => {
    // Pick a top-left anchor that fits the template footprint.
    const anchorX = Math.max(tpl.width / 2, Math.min(room.length - tpl.width / 2, room.length / 2));
    const anchorY = Math.max(tpl.height / 2, Math.min(room.width - tpl.height / 2, room.width / 2));
    const zoneId = addZone({
      name: tpl.name,
      description: tpl.description,
      color: tpl.color,
      x: anchorX,
      y: anchorY,
      width: tpl.width,
      height: tpl.height,
    });
    // Now drop each element at its offset (anchor = top-left of zone)
    const zoneLeft = anchorX - tpl.width / 2;
    const zoneTop = anchorY - tpl.height / 2;
    for (const e of tpl.elements) {
      const def = getElementDef(e.libraryId);
      if (!def) continue;
      const x = Math.min(
        room.length - def.defaultWidth / 2,
        Math.max(def.defaultWidth / 2, zoneLeft + e.offsetX + def.defaultWidth / 2),
      );
      const y = Math.min(
        room.width - def.defaultHeight / 2,
        Math.max(def.defaultHeight / 2, zoneTop + e.offsetY + def.defaultHeight / 2),
      );
      addFixedElement(e.libraryId, {
        label: e.label ?? def.name,
        x,
        y,
      });
    }
    selectZone(zoneId);
    setTemplateOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border bg-ivory/30 px-4 py-2.5">
        <div>
          <div className="font-serif text-[14px] text-ink">Experience Zones</div>
          <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
            {zones.length} zones · plan the guest journey
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTemplateOpen(true)}
            className="rounded-md border border-border bg-white px-2.5 py-1 text-[11px] text-ink-muted hover:border-ink/25 hover:text-ink"
          >
            Zone templates
          </button>
          <button
            onClick={() =>
              addZone({
                name: `Zone ${zones.length + 1}`,
                color: ZONE_COLORS[zones.length % ZONE_COLORS.length],
              })
            }
            className="flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-[11px] text-ivory hover:opacity-90"
          >
            <Plus size={11} strokeWidth={1.8} /> New zone
          </button>
        </div>
      </div>

      {/* Template drop-down */}
      {templateOpen && (
        <div className="border-b border-border bg-ivory/20 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Pre-built zone bundles
            </div>
            <button
              onClick={() => setTemplateOpen(false)}
              className="text-ink-faint hover:text-ink"
            >
              <X size={12} strokeWidth={1.7} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ZONE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => dropTemplate(tpl)}
                className="flex flex-col items-start gap-1 rounded-md border border-border bg-white px-3 py-2 text-left transition hover:border-ink/25 hover:shadow-sm"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded border"
                    style={{ backgroundColor: tpl.color, borderColor: "#8a7a5f" }}
                  />
                  <span className="font-serif text-[12.5px] text-ink">{tpl.name}</span>
                </div>
                <div className="text-[10.5px] leading-snug text-ink-muted">
                  {tpl.description}
                </div>
                <div className="mt-1 font-mono text-[9.5px] text-ink-faint">
                  {tpl.elements.length} elements · {tpl.width}×{tpl.height} ft
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {zones.length === 0 && !templateOpen && (
          <div className="px-6 py-12 text-center">
            <div className="font-serif text-[14px] text-ink">No zones yet</div>
            <div className="mx-auto mt-1 max-w-sm text-[11.5px] text-ink-muted">
              Zones are translucent areas that group elements into themed
              experiences — cocktail lounge, food court, kids zone. Start from
              a template or create a fresh zone.
            </div>
          </div>
        )}
        {sortedZones.map((zone, idx) => {
          const contained = containedElements(zone);
          const isSelected = selectedZoneId === zone.id;
          return (
            <div
              key={zone.id}
              onClick={() => selectZone(zone.id)}
              className={cn(
                "cursor-pointer border-b border-border/50 px-4 py-3 hover:bg-ivory/40",
                isSelected && "bg-gold-pale/25",
              )}
            >
              <div className="flex items-start gap-2">
                <GripVertical
                  size={13}
                  className="mt-1 flex-shrink-0 text-ink-faint"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <input
                      value={zone.name}
                      onChange={(e) =>
                        updateZone(zone.id, { name: e.target.value })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 rounded border-none bg-transparent font-serif text-[13px] text-ink outline-none"
                    />
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={zone.flowOrder ?? idx + 1}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          flowOrder: Number(e.target.value),
                        })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-12 rounded border border-border bg-ivory/30 px-1 py-0.5 text-right text-[10.5px] text-ink outline-none"
                      title="Flow order"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={zone.description ?? ""}
                    onChange={(e) =>
                      updateZone(zone.id, { description: e.target.value })
                    }
                    onClick={(e) => e.stopPropagation()}
                    placeholder="What's the vibe? (e.g. 'Upscale lounge with signature cocktails, live jazz…')"
                    className="mt-1 w-full rounded border border-border bg-ivory/20 px-2 py-1 text-[11px] text-ink outline-none focus:border-ink/25 focus:bg-white"
                  />

                  <div className="mt-2 flex items-center gap-1.5">
                    {ZONE_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateZone(zone.id, { color: c });
                        }}
                        className={cn(
                          "h-4 w-4 rounded border",
                          zone.color === c ? "border-ink" : "border-border",
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <div className="ml-auto font-mono text-[9.5px] text-ink-faint">
                      {zone.width}×{zone.height} ft · {contained.length} items
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete zone "${zone.name}"?`)) {
                      removeZone(zone.id);
                    }
                  }}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
                  title="Delete zone"
                >
                  <Trash2 size={11} strokeWidth={1.7} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
