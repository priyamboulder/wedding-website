"use client";

// ── Seating canvas ──────────────────────────────────────────────────
// SVG-based floor plan. All internal coordinates are in **feet**;
// rendering uses a viewBox that matches the room size so we get automatic
// scaling to the container. Zoom applies an additional CSS transform so
// the SVG remains crisp.
//
// Interaction model:
//   - Click empty canvas: clear selection
//   - Click an element: select it
//   - Drag an element: move it (feet, snap-to-grid unless Shift held)
//   - Drag on empty space (zoomed in): pan
//   - Wheel: zoom in/out [0.5 – 2.0]
//   - Right-click / long-press on a table: context menu
//   - Rotation handle (small dot above selected table): drag to rotate

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { cn } from "@/lib/utils";
import type {
  FixedElement,
  FloorZone,
  SeatingTable,
} from "@/types/seating";
import { TABLE_ZONE_META } from "@/types/seating";
import type { SeatingGuest } from "@/types/seating-guest";
import { guestFullName, guestInitials } from "@/types/seating-guest";
import { FIXED_ELEMENT_STYLES } from "@/lib/seating-seed";
import { getElementDef } from "@/lib/floor-plan-library";
import { tooCloseIds, useSeatingStore } from "@/stores/seating-store";
import { useSeatingAssignmentsStore } from "@/stores/seating-assignments-store";
import { useSeatingDragStore } from "@/stores/seating-drag-store";

const GRID_FT = 5; // one grid square = 5 ft
const SNAP_FT = 5;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

// ── Helpers ───────────────────────────────────────────────────────────
function snap(v: number, held: boolean): number {
  if (held) return Math.round(v * 10) / 10;
  return Math.round(v / SNAP_FT) * SNAP_FT;
}

interface DragState {
  kind: "table" | "fixed" | "zone" | "rotate" | "pan";
  id?: string;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startRotation?: number;
  startPanX?: number;
  startPanY?: number;
}

interface ContextMenuState {
  tableId: string;
  guestId?: string; // set when right-clicking a seated guest
  x: number;
  y: number;
}

interface Props {
  onRequestConfigOpen?: () => void;
  guests?: SeatingGuest[];
  eventId?: string;
  onOpenTableCard?: (tableId: string) => void;
  // Guest ids to paint with a subtle "newly assigned" ring (used after an
  // auto-suggest so the user can see what changed).
  highlightGuestIds?: string[];
}

export function SeatingCanvas({
  onRequestConfigOpen,
  guests = [],
  eventId,
  onOpenTableCard,
  highlightGuestIds,
}: Props) {
  const highlightSet = useMemo(
    () => new Set(highlightGuestIds ?? []),
    [highlightGuestIds],
  );
  const room = useSeatingStore((s) => s.room);
  const fixed = useSeatingStore((s) => s.fixed);
  const tables = useSeatingStore((s) => s.tables);
  const zones = useSeatingStore((s) => s.zones);
  const selectedTableId = useSeatingStore((s) => s.selectedTableId);
  const selectedFixedId = useSeatingStore((s) => s.selectedFixedId);
  const selectedZoneId = useSeatingStore((s) => s.selectedZoneId);

  const selectTable = useSeatingStore((s) => s.selectTable);
  const selectFixed = useSeatingStore((s) => s.selectFixed);
  const selectZone = useSeatingStore((s) => s.selectZone);
  const updateTable = useSeatingStore((s) => s.updateTable);
  const updateFixedElement = useSeatingStore((s) => s.updateFixedElement);
  const updateZone = useSeatingStore((s) => s.updateZone);
  const duplicateTable = useSeatingStore((s) => s.duplicateTable);
  const removeTable = useSeatingStore((s) => s.removeTable);
  const removeFixedElement = useSeatingStore((s) => s.removeFixedElement);

  // ── Assignments + drag tracking ─────────────────────────────────
  const activeEventId = useSeatingAssignmentsStore((s) => s.activeEventId);
  const effectiveEventId = eventId ?? activeEventId;
  const assignmentForEvent = useSeatingAssignmentsStore(
    (s) => s.assignments[effectiveEventId],
  );
  const assignments = useMemo(
    () => assignmentForEvent ?? [],
    [assignmentForEvent],
  );
  const assignGuestTo = useSeatingAssignmentsStore((s) => s.assignGuest);
  const unassignGuestFrom = useSeatingAssignmentsStore((s) => s.unassignGuest);
  const draggingIds = useSeatingDragStore((s) => s.draggingGuestIds);
  const endDrag = useSeatingDragStore((s) => s.endDrag);

  const guestById = useMemo(() => {
    const m = new Map<string, SeatingGuest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  const tableGuestIds = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const a of assignments) {
      const list = m.get(a.tableId) ?? [];
      list[a.seatIndex] = a.guestId;
      m.set(a.tableId, list);
    }
    return m;
  }, [assignments]);

  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [flashTableId, setFlashTableId] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string>("");
  // Quick-peek: 500ms hover delay then show compact card near the table
  const [peek, setPeek] = useState<{ tableId: string; x: number; y: number } | null>(null);
  const peekTimer = useRef<number | null>(null);

  const beginPeek = (tableId: string, clientX: number, clientY: number) => {
    if (peekTimer.current) window.clearTimeout(peekTimer.current);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    peekTimer.current = window.setTimeout(() => {
      setPeek({ tableId, x, y });
    }, 500);
  };
  const cancelPeek = (tableId: string) => {
    if (peekTimer.current) {
      window.clearTimeout(peekTimer.current);
      peekTimer.current = null;
    }
    setPeek((p) => (p && p.tableId === tableId ? null : p));
  };

  const flashFull = (tableId: string, message: string) => {
    setFlashTableId(tableId);
    setFlashMessage(message);
    window.setTimeout(() => {
      setFlashTableId((cur) => (cur === tableId ? null : cur));
    }, 700);
  };

  const handleDropOnTable = (tableId: string, guestIds: string[]) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    const currentOcc = (tableGuestIds.get(tableId) ?? []).filter(Boolean).length;
    const free = table.seats - currentOcc;
    if (free <= 0) {
      flashFull(tableId, "Table full");
      return;
    }
    // Re-assign even if already placed elsewhere (this is a "move").
    const toAssign = guestIds.slice(0, free);
    const partial = toAssign.length < guestIds.length;
    for (const gid of toAssign) assignGuestTo(gid, tableId);
    if (partial) {
      flashFull(
        tableId,
        `Only ${toAssign.length} of ${guestIds.length} fit — ${guestIds.length - toAssign.length} skipped`,
      );
    }
    selectTable(tableId);
    endDrag();
  };

  // ── Canvas DOM + view transform ────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [shiftHeld, setShiftHeld] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState | null>(null);

  // Track shift for free placement
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(true);
      if (e.key === "Escape") {
        selectTable(null);
        selectFixed(null);
        selectZone(null);
        setCtxMenu(null);
      }
      if ((e.key === "Delete" || e.key === "Backspace")) {
        if (selectedTableId) removeTable(selectedTableId);
        else if (selectedFixedId) removeFixedElement(selectedFixedId);
        else if (selectedZoneId) {
          useSeatingStore.getState().removeZone(selectedZoneId);
        }
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [selectedTableId, selectedFixedId, removeTable, removeFixedElement, selectTable, selectFixed, selectZone]);

  // Close context menu on any click outside
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [ctxMenu]);

  // ── Convert pointer client pixels → feet (pre-zoom, pre-pan) ──────
  const clientToFt = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      const local = pt.matrixTransform(ctm.inverse());
      return { x: local.x, y: local.y };
    },
    [],
  );

  // ── Drag (move) handlers ──────────────────────────────────────────
  const startDragTable = useCallback(
    (e: ReactPointerEvent, t: SeatingTable) => {
      e.stopPropagation();
      e.preventDefault();
      selectTable(t.id);
      (e.target as Element).setPointerCapture?.(e.pointerId);
      const pt = clientToFt(e.clientX, e.clientY);
      setDragState({
        kind: "table",
        id: t.id,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: t.x - pt.x,
        startY: t.y - pt.y,
      });
    },
    [clientToFt, selectTable],
  );

  const startDragFixed = useCallback(
    (e: ReactPointerEvent, f: FixedElement) => {
      e.stopPropagation();
      e.preventDefault();
      selectFixed(f.id);
      if (f.locked) return;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      const pt = clientToFt(e.clientX, e.clientY);
      setDragState({
        kind: "fixed",
        id: f.id,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: f.x - pt.x,
        startY: f.y - pt.y,
      });
    },
    [clientToFt, selectFixed],
  );

  const startDragZone = useCallback(
    (e: ReactPointerEvent, z: FloorZone) => {
      e.stopPropagation();
      e.preventDefault();
      selectZone(z.id);
      (e.target as Element).setPointerCapture?.(e.pointerId);
      const pt = clientToFt(e.clientX, e.clientY);
      setDragState({
        kind: "zone",
        id: z.id,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: z.x - pt.x,
        startY: z.y - pt.y,
      });
    },
    [clientToFt, selectZone],
  );

  const startRotate = useCallback(
    (e: ReactPointerEvent, t: SeatingTable) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setDragState({
        kind: "rotate",
        id: t.id,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: t.x,
        startY: t.y,
        startRotation: t.rotation,
      });
    },
    [],
  );

  const startPan = useCallback(
    (e: ReactPointerEvent) => {
      if (e.button !== 0) return;
      // only pan when zoomed in and clicking background
      selectTable(null);
      selectFixed(null);
      selectZone(null);
      setDragState({
        kind: "pan",
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: 0,
        startY: 0,
        startPanX: pan.x,
        startPanY: pan.y,
      });
    },
    [pan, selectTable, selectFixed, selectZone],
  );

  // ── Pointer move / up (global) ────────────────────────────────────
  useEffect(() => {
    if (!dragState) return;
    const onMove = (e: PointerEvent) => {
      if (dragState.kind === "pan") {
        const dx = e.clientX - dragState.startClientX;
        const dy = e.clientY - dragState.startClientY;
        setPan({
          x: (dragState.startPanX ?? 0) + dx,
          y: (dragState.startPanY ?? 0) + dy,
        });
        return;
      }
      const pt = clientToFt(e.clientX, e.clientY);
      if (dragState.kind === "table" && dragState.id) {
        const nx = snap(pt.x + dragState.startX, shiftHeld);
        const ny = snap(pt.y + dragState.startY, shiftHeld);
        updateTable(dragState.id, { x: nx, y: ny });
      } else if (dragState.kind === "fixed" && dragState.id) {
        const nx = snap(pt.x + dragState.startX, shiftHeld);
        const ny = snap(pt.y + dragState.startY, shiftHeld);
        updateFixedElement(dragState.id, { x: nx, y: ny });
      } else if (dragState.kind === "zone" && dragState.id) {
        const nx = snap(pt.x + dragState.startX, shiftHeld);
        const ny = snap(pt.y + dragState.startY, shiftHeld);
        updateZone(dragState.id, { x: nx, y: ny });
      } else if (dragState.kind === "rotate" && dragState.id) {
        const dx = pt.x - dragState.startX;
        const dy = pt.y - dragState.startY;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        const rounded = shiftHeld ? Math.round(angle) : Math.round(angle / 15) * 15;
        updateTable(dragState.id, { rotation: rounded });
      }
    };
    const onUp = () => setDragState(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragState, clientToFt, shiftHeld, updateTable, updateFixedElement, updateZone]);

  // ── Wheel zoom ────────────────────────────────────────────────────
  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 8) return;
    e.preventDefault();
    const step = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +(z + step).toFixed(2))));
  };

  const setZoomDelta = (delta: number) => {
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +(z + delta).toFixed(2))));
  };
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const tooClose = useMemo(() => tooCloseIds(tables), [tables]);

  // ── Right-click / long-press menu ─────────────────────────────────
  const openCtxMenu = (
    e: ReactMouseEvent<SVGGElement>,
    tableId: string,
    guestId?: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCtxMenu({
      tableId,
      guestId,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // ── Layout geometry ───────────────────────────────────────────────
  const gridLines = useMemo(() => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let x = 0; x <= room.length; x += GRID_FT) {
      lines.push({ x1: x, y1: 0, x2: x, y2: room.width });
    }
    for (let y = 0; y <= room.width; y += GRID_FT) {
      lines.push({ x1: 0, y1: y, x2: room.length, y2: y });
    }
    return lines;
  }, [room.length, room.width]);

  return (
    <div
      ref={containerRef}
      onWheel={onWheel}
      className={cn(
        "relative h-full min-h-[560px] w-full overflow-hidden rounded-lg border border-border bg-[#faf7f1]",
        dragState?.kind === "pan" && "cursor-grabbing",
      )}
    >
      {/* Toolbar — top-left */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-md border border-border bg-white/95 p-1 shadow-sm backdrop-blur">
        <button
          onClick={() => setZoomDelta(-0.1)}
          className="flex h-7 w-7 items-center justify-center rounded text-[14px] text-ink-muted hover:bg-ivory hover:text-ink"
          title="Zoom out"
        >
          −
        </button>
        <div className="min-w-[44px] text-center font-mono text-[10.5px] text-ink-muted">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoomDelta(0.1)}
          className="flex h-7 w-7 items-center justify-center rounded text-[14px] text-ink-muted hover:bg-ivory hover:text-ink"
          title="Zoom in"
        >
          +
        </button>
        <div className="mx-1 h-5 w-px bg-border" />
        <button
          onClick={resetView}
          className="rounded px-2 py-1 text-[10.5px] text-ink-muted hover:bg-ivory hover:text-ink"
          title="Reset view"
        >
          Fit
        </button>
        {onRequestConfigOpen && (
          <>
            <div className="mx-1 h-5 w-px bg-border" />
            <button
              onClick={onRequestConfigOpen}
              className="rounded px-2 py-1 text-[10.5px] text-ink-muted hover:bg-ivory hover:text-ink"
              title="Configure room"
            >
              Configure Room
            </button>
          </>
        )}
      </div>

      {/* Scale indicator — bottom-right */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-md border border-border bg-white/95 px-2.5 py-1 font-mono text-[10px] text-ink-muted shadow-sm backdrop-blur">
        1 square = {GRID_FT} ft · {room.length} × {room.width} {room.unit}
      </div>

      {/* Zone legend — bottom-center, shown only when any zoned tables exist */}
      {tables.some((t) => t.zone) && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-md border border-border bg-white/95 px-3 py-1 font-mono text-[10px] text-ink-muted shadow-sm backdrop-blur">
          {(["vip", "family", "friends", "kids"] as const).map((z) => {
            const meta = TABLE_ZONE_META[z];
            return (
              <span key={z} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: meta.stroke }}
                />
                {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Shift hint — bottom-left */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 font-mono text-[10px] text-ink-faint">
        {shiftHeld ? "Free place" : `Snap ${SNAP_FT}ft`} · Del removes selected
      </div>

      {/* SVG canvas */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: dragState ? "none" : "transform 140ms ease",
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`-2 -2 ${room.length + 4} ${room.width + 4}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full select-none"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) startPan(e);
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              selectTable(null);
              selectFixed(null);
              selectZone(null);
            }
          }}
        >
          {/* Room floor + border */}
          <rect
            x={0}
            y={0}
            width={room.length}
            height={room.width}
            fill="#fbf8f2"
            stroke="#d9cfbb"
            strokeWidth={0.18}
            onPointerDown={(e) => startPan(e)}
          />

          {/* Grid */}
          <g style={{ pointerEvents: "none" }}>
            {gridLines.map((ln, i) => (
              <line
                key={i}
                x1={ln.x1}
                y1={ln.y1}
                x2={ln.x2}
                y2={ln.y2}
                stroke="#e7dfcd"
                strokeWidth={0.06}
              />
            ))}
          </g>

          {/* Zones (translucent background regions) */}
          {zones.map((z) => (
            <ZoneNode
              key={z.id}
              zone={z}
              selected={z.id === selectedZoneId}
              onPointerDown={(e) => startDragZone(e, z)}
            />
          ))}

          {/* Fixed elements (zone-overlay layer on top of zones but below
              furniture is approximated by sorting) */}
          {[...fixed]
            .sort((a, b) => {
              const la = a.layer === "zone_overlay" ? 0 : 1;
              const lb = b.layer === "zone_overlay" ? 0 : 1;
              return la - lb;
            })
            .map((f) => (
              <FixedElementNode
                key={f.id}
                el={f}
                selected={f.id === selectedFixedId}
                onPointerDown={(e) => startDragFixed(e, f)}
              />
            ))}

          {/* Tables */}
          {tables.map((t) => {
            const seated = tableGuestIds.get(t.id) ?? [];
            const occ = seated.filter(Boolean).length;
            const full = occ >= t.seats;
            const isDropCandidate = !!draggingIds?.length;
            const isFlashing = flashTableId === t.id;
            const zoneMeta = t.zone ? TABLE_ZONE_META[t.zone] : null;
            return (
              <TableNode
                key={t.id}
                table={t}
                selected={t.id === selectedTableId}
                warning={tooClose.has(t.id)}
                onPointerDown={(e) => startDragTable(e, t)}
                onContextMenu={(e) => openCtxMenu(e, t.id)}
                onRotateStart={(e) => startRotate(e, t)}
                seatedGuestIds={seated}
                guestById={guestById}
                occupancy={occ}
                isDropCandidate={isDropCandidate}
                isHovered={hoveredTableId === t.id}
                isFlashing={isFlashing}
                isFull={full}
                zoneStroke={zoneMeta?.stroke}
                zoneFill={zoneMeta?.fill}
                onDragOver={(e) => {
                  if (!isDropCandidate) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = full ? "none" : "move";
                  setHoveredTableId(t.id);
                }}
                onDragLeave={() => {
                  setHoveredTableId((cur) => (cur === t.id ? null : cur));
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setHoveredTableId(null);
                  let ids: string[] = [];
                  try {
                    const raw = e.dataTransfer.getData(
                      "application/x-ananya-guest-ids",
                    );
                    if (raw) ids = JSON.parse(raw) as string[];
                  } catch {
                    /* ignore */
                  }
                  if (!ids.length && draggingIds?.length) ids = draggingIds;
                  if (!ids.length) return;
                  handleDropOnTable(t.id, ids);
                }}
                onGuestContextMenu={(e, guestId) => openCtxMenu(e, t.id, guestId)}
                onLabelClick={() => {
                  selectTable(t.id);
                  if (onOpenTableCard) onOpenTableCard(t.id);
                }}
                onPointerEnter={(e) => beginPeek(t.id, e.clientX, e.clientY)}
                onPointerLeave={() => cancelPeek(t.id)}
                highlightSet={highlightSet}
              />
            );
          })}
        </svg>
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <div
          className="absolute z-20 w-48 overflow-hidden rounded-md border border-border bg-white shadow-lg"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {ctxMenu.guestId ? (
            <GuestContextMenu
              guestId={ctxMenu.guestId}
              fromTableId={ctxMenu.tableId}
              tables={tables}
              tableGuestIds={tableGuestIds}
              guestById={guestById}
              onRemove={() => {
                unassignGuestFrom(ctxMenu.guestId!);
                setCtxMenu(null);
              }}
              onMove={(toTableId) => {
                assignGuestTo(ctxMenu.guestId!, toTableId);
                setCtxMenu(null);
              }}
              onClose={() => setCtxMenu(null)}
            />
          ) : (
            <>
              {onOpenTableCard && (
                <button
                  onClick={() => {
                    onOpenTableCard(ctxMenu.tableId);
                    setCtxMenu(null);
                  }}
                  className="flex w-full items-center px-3 py-2 text-left text-[12px] text-ink hover:bg-ivory"
                >
                  Open table card
                </button>
              )}
              <button
                onClick={() => {
                  duplicateTable(ctxMenu.tableId);
                  setCtxMenu(null);
                }}
                className="flex w-full items-center border-t border-border px-3 py-2 text-left text-[12px] text-ink hover:bg-ivory"
              >
                Duplicate
              </button>
              <button
                onClick={() => {
                  removeTable(ctxMenu.tableId);
                  setCtxMenu(null);
                }}
                className="flex w-full items-center border-t border-border px-3 py-2 text-left text-[12px] text-rose hover:bg-rose-pale/30"
              >
                Delete table
              </button>
            </>
          )}
        </div>
      )}

      {/* Flash tooltip (table-full warning) */}
      {flashTableId && (
        <div
          className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-md bg-rose px-3 py-1.5 font-mono text-[11px] text-white shadow-lg"
        >
          {flashMessage}
        </div>
      )}

      {/* Quick-peek hover card */}
      {peek && !dragState && (() => {
        const t = tables.find((x) => x.id === peek.tableId);
        if (!t) return null;
        const seated = (tableGuestIds.get(t.id) ?? [])
          .filter(Boolean)
          .map((gid) => guestById.get(gid))
          .filter(Boolean) as SeatingGuest[];
        const free = t.seats - seated.length;
        const dietCounts = new Map<string, number>();
        for (const g of seated) {
          for (const d of g.dietary) dietCounts.set(d, (dietCounts.get(d) ?? 0) + 1);
        }
        const name = t.label?.trim();
        const rect = containerRef.current?.getBoundingClientRect();
        const maxX = (rect?.width ?? 600) - 240;
        const maxY = (rect?.height ?? 400) - 200;
        const left = Math.min(Math.max(peek.x + 12, 8), maxX);
        const top = Math.min(Math.max(peek.y + 12, 8), maxY);
        return (
          <div
            className="pointer-events-none absolute z-25 w-56 rounded-md border border-border bg-white px-3 py-2 text-[11px] text-ink shadow-lg"
            style={{ left, top }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-serif text-[12.5px] text-ink">T{t.number}</div>
              <div className="font-mono text-[9.5px] text-ink-faint">
                {free <= 0 ? "Full" : `${free} seat${free === 1 ? "" : "s"} open`}
              </div>
            </div>
            {name && (
              <div className="mb-1 font-serif text-[10.5px] italic text-ink-muted">
                {name}
              </div>
            )}
            {seated.length === 0 ? (
              <div className="italic text-ink-faint">No guests yet.</div>
            ) : (
              <ul className="space-y-0.5">
                {seated.slice(0, 8).map((g) => (
                  <li key={g.id} className="flex items-center gap-1.5 truncate">
                    <span
                      className={
                        "h-1.5 w-1.5 flex-shrink-0 rounded-full " +
                        (g.side === "bride"
                          ? "bg-rose-light"
                          : g.side === "groom"
                            ? "bg-sage-light"
                            : "bg-gold-light")
                      }
                    />
                    <span className="truncate">{guestFullName(g)}</span>
                  </li>
                ))}
                {seated.length > 8 && (
                  <li className="font-mono text-[9.5px] text-ink-faint">
                    +{seated.length - 8} more
                  </li>
                )}
              </ul>
            )}
            {dietCounts.size > 0 && (
              <div className="mt-1.5 border-t border-border pt-1 font-mono text-[9.5px] text-ink-muted">
                {Array.from(dietCounts.entries())
                  .map(([d, n]) => `${n} ${d}`)
                  .join(" · ")}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ── GuestContextMenu ─────────────────────────────────────────────────
function GuestContextMenu({
  guestId,
  fromTableId,
  tables,
  tableGuestIds,
  guestById,
  onRemove,
  onMove,
  onClose,
}: {
  guestId: string;
  fromTableId: string;
  tables: SeatingTable[];
  tableGuestIds: Map<string, string[]>;
  guestById: Map<string, SeatingGuest>;
  onRemove: () => void;
  onMove: (toTableId: string) => void;
  onClose: () => void;
}) {
  const guest = guestById.get(guestId);
  const [moveOpen, setMoveOpen] = useState(false);
  return (
    <div>
      <div className="border-b border-border bg-ivory/40 px-3 py-2">
        <div className="font-serif text-[12.5px] text-ink">
          {guest ? guestFullName(guest) : "Guest"}
        </div>
        {guest && (
          <div className="mt-0.5 font-mono text-[9.5px] text-ink-faint">
            {guest.side} · {guest.relationship ?? guest.vipTier}
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex w-full items-center px-3 py-2 text-left text-[12px] text-rose hover:bg-rose-pale/30"
      >
        Remove from table
      </button>
      <button
        onClick={() => setMoveOpen((v) => !v)}
        className="flex w-full items-center justify-between border-t border-border px-3 py-2 text-left text-[12px] text-ink hover:bg-ivory"
      >
        Move to…
        <span className="text-ink-faint">{moveOpen ? "▾" : "▸"}</span>
      </button>
      {moveOpen && (
        <div className="max-h-40 overflow-y-auto border-t border-border bg-ivory/20">
          {tables
            .slice()
            .sort((a, b) => a.number - b.number)
            .map((t) => {
              const occ = (tableGuestIds.get(t.id) ?? []).filter(Boolean).length;
              const free = t.seats - occ;
              const isHome = t.id === fromTableId;
              const disabled = isHome || free <= 0;
              return (
                <button
                  key={t.id}
                  disabled={disabled}
                  onClick={() => onMove(t.id)}
                  className={
                    "flex w-full items-center justify-between px-3 py-1.5 text-left text-[11.5px] text-ink hover:bg-white " +
                    (disabled ? "cursor-not-allowed opacity-40" : "")
                  }
                >
                  <span>{t.label?.trim() || `T${t.number}`}</span>
                  <span className="font-mono text-[10px] text-ink-muted">
                    {free}/{t.seats}
                  </span>
                </button>
              );
            })}
        </div>
      )}
      <button
        onClick={onClose}
        className="flex w-full items-center border-t border-border px-3 py-1.5 text-[11px] text-ink-muted hover:bg-ivory"
      >
        Cancel
      </button>
    </div>
  );
}

// ── FixedElementNode ────────────────────────────────────────────────
function FixedElementNode({
  el,
  selected,
  onPointerDown,
}: {
  el: FixedElement;
  selected: boolean;
  onPointerDown: (e: ReactPointerEvent) => void;
}) {
  // Prefer the element's own color if set, else library def, else legacy.
  const libDef = getElementDef(el.kind);
  const legacyStyle = FIXED_ELEMENT_STYLES[el.kind];
  const fill = el.color ?? libDef?.fill ?? legacyStyle?.fill ?? "rgba(168, 128, 76, 0.2)";
  const stroke = libDef?.stroke ?? legacyStyle?.stroke ?? "#7a6a52";

  const w = el.width;
  const h = el.height;
  const isOverlay = el.layer === "zone_overlay";
  const selectedStroke: CSSProperties["stroke"] = selected ? "#1a1a1a" : stroke;
  const selectedWidth = selected ? 0.22 : 0.12;
  const powerNeeded = !!el.properties?.needsPower;

  return (
    <g
      transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation})`}
      onPointerDown={onPointerDown}
      style={{ cursor: el.locked ? "not-allowed" : "move", opacity: isOverlay ? 0.6 : 1 }}
    >
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={0.4}
        fill={fill}
        stroke={selectedStroke as string}
        strokeWidth={selectedWidth}
        strokeDasharray={isOverlay ? "0.6 0.4" : undefined}
      />
      {/* Door elements get a pair of small sweep arc hints */}
      {(el.kind === "door" || libDef?.id === "door") && (
        <line
          x1={-w / 2}
          y1={0}
          x2={w / 2}
          y2={0}
          stroke={stroke}
          strokeWidth={0.08}
          strokeDasharray="0.4 0.3"
        />
      )}
      <text
        x={0}
        y={powerNeeded ? -0.5 : 0}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={Math.min(1.4, Math.max(0.8, Math.min(w, h) * 0.22))}
        fontFamily="ui-serif, Georgia, serif"
        fill="#5f5243"
        style={{ pointerEvents: "none" }}
      >
        {el.label}
      </text>
      {powerNeeded && (
        <text
          x={0}
          y={0.8}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={0.9}
          fill="#a87c3a"
          style={{ pointerEvents: "none" }}
        >
          ⚡
        </text>
      )}
      {el.locked && (
        <text
          x={w / 2 - 0.4}
          y={-h / 2 + 0.4}
          textAnchor="end"
          dominantBaseline="hanging"
          fontSize={0.55}
          fill="#6a5d48"
          style={{ pointerEvents: "none" }}
        >
          🔒
        </text>
      )}
    </g>
  );
}

// ── ZoneNode ────────────────────────────────────────────────────────
function ZoneNode({
  zone,
  selected,
  onPointerDown,
}: {
  zone: FloorZone;
  selected: boolean;
  onPointerDown: (e: ReactPointerEvent) => void;
}) {
  const w = zone.width;
  const h = zone.height;
  return (
    <g
      transform={`translate(${zone.x}, ${zone.y}) rotate(${zone.rotation})`}
      onPointerDown={onPointerDown}
      style={{ cursor: "move" }}
    >
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={0.8}
        fill={zone.color}
        stroke={selected ? "#1a1a1a" : "#8a7a5f"}
        strokeWidth={selected ? 0.18 : 0.1}
        strokeDasharray="0.9 0.5"
        opacity={0.9}
      />
      <text
        x={-w / 2 + 0.4}
        y={-h / 2 + 0.4}
        textAnchor="start"
        dominantBaseline="hanging"
        fontSize={Math.max(0.8, Math.min(w, h) * 0.11)}
        fontFamily="ui-serif, Georgia, serif"
        fontStyle="italic"
        fill="#3a332a"
        style={{ pointerEvents: "none" }}
      >
        {zone.flowOrder ? `${zone.flowOrder}. ` : ""}
        {zone.name}
      </text>
    </g>
  );
}

// ── TableNode ───────────────────────────────────────────────────────
function TableNode({
  table,
  selected,
  warning,
  onPointerDown,
  onContextMenu,
  onRotateStart,
  seatedGuestIds,
  guestById,
  occupancy,
  isDropCandidate,
  isHovered,
  isFlashing,
  isFull,
  zoneStroke,
  zoneFill,
  onDragOver,
  onDragLeave,
  onDrop,
  onGuestContextMenu,
  onLabelClick,
  onPointerEnter,
  onPointerLeave,
  highlightSet,
}: {
  table: SeatingTable;
  selected: boolean;
  warning: boolean;
  onPointerDown: (e: ReactPointerEvent) => void;
  onContextMenu: (e: ReactMouseEvent<SVGGElement>) => void;
  onRotateStart: (e: ReactPointerEvent) => void;
  seatedGuestIds: string[];
  guestById: Map<string, SeatingGuest>;
  occupancy: number;
  isDropCandidate: boolean;
  isHovered: boolean;
  isFlashing: boolean;
  isFull: boolean;
  zoneStroke?: string;
  zoneFill?: string;
  onDragOver: (e: ReactDragEvent<SVGGElement>) => void;
  onDragLeave: (e: ReactDragEvent<SVGGElement>) => void;
  onDrop: (e: ReactDragEvent<SVGGElement>) => void;
  onGuestContextMenu: (
    e: ReactMouseEvent<SVGGElement>,
    guestId: string,
  ) => void;
  onLabelClick: () => void;
  onPointerEnter: (e: ReactPointerEvent) => void;
  onPointerLeave: (e: ReactPointerEvent) => void;
  highlightSet: Set<string>;
}) {
  const isRound = table.shape === "round";
  const w = table.width;
  const h = isRound ? table.width : table.height;
  const primaryLabel = `T${table.number}`;
  const displayName = (table.label ?? "").trim();

  // Seat positions in table-local coords
  const seats = useMemo(() => {
    const pts: Array<{ x: number; y: number }> = [];
    const seatRadius = 0.4;
    if (isRound) {
      const r = w / 2 + seatRadius + 0.15;
      for (let i = 0; i < table.seats; i += 1) {
        const angle = (2 * Math.PI * i) / table.seats - Math.PI / 2;
        pts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
      }
    } else if (table.shape === "rect" || table.shape === "banquet") {
      // seats along both long sides
      const perSide = Math.ceil(table.seats / 2);
      const offset = h / 2 + seatRadius + 0.15;
      for (let i = 0; i < perSide; i += 1) {
        const x = -w / 2 + ((i + 0.5) * w) / perSide;
        pts.push({ x, y: -offset });
      }
      for (let i = 0; i < table.seats - perSide; i += 1) {
        const x = -w / 2 + ((i + 0.5) * w) / (table.seats - perSide);
        pts.push({ x, y: offset });
      }
    } else {
      // u-shape: seats along the OUTSIDE of the U
      // Top bar: outside is above
      const barThick = 1;
      const topBarW = w;
      const topBarY = -h / 2 + barThick / 2;
      const sideBarH = h - barThick;
      const leftBarX = -w / 2 + barThick / 2;
      const rightBarX = w / 2 - barThick / 2;

      const topSeats = Math.max(4, Math.floor(table.seats * 0.45));
      const sideSeats = Math.max(
        2,
        Math.floor((table.seats - topSeats) / 2),
      );

      for (let i = 0; i < topSeats; i += 1) {
        const x = -topBarW / 2 + ((i + 0.5) * topBarW) / topSeats;
        pts.push({ x, y: topBarY - barThick / 2 - seatRadius - 0.15 });
      }
      for (let i = 0; i < sideSeats; i += 1) {
        const y = topBarY + barThick / 2 + ((i + 0.5) * sideBarH) / sideSeats;
        pts.push({ x: leftBarX - barThick / 2 - seatRadius - 0.15, y });
      }
      for (let i = 0; i < sideSeats; i += 1) {
        const y = topBarY + barThick / 2 + ((i + 0.5) * sideBarH) / sideSeats;
        pts.push({ x: rightBarX + barThick / 2 + seatRadius + 0.15, y });
      }
    }
    return pts;
  }, [isRound, w, h, table.seats, table.shape]);

  // Main shape
  const mainShape = useMemo(() => {
    let fill = zoneFill ?? "#fffbf2";
    if (isFlashing) fill = "#f6d7cf"; // red-ish flash for "full"
    else if (isHovered && isDropCandidate && !isFull) fill = "#e9f0d8"; // sage drop hint
    else if (isHovered && isDropCandidate && isFull) fill = "#f6d7cf";
    const stroke = isFlashing
      ? "#b4543e"
      : selected
        ? "#1a1a1a"
        : isHovered && isDropCandidate
          ? isFull
            ? "#b4543e"
            : "#7a9548"
          : warning
            ? "#c97a3a"
            : zoneStroke ?? "#7a6a52";
    // Zone-coded tables get a thicker border so the color reads from a
    // distance — the spec's "primary visual language".
    const strokeW = selected || (isHovered && isDropCandidate)
      ? 0.28
      : zoneStroke
        ? 0.24
        : 0.16;
    if (isRound) {
      return (
        <circle
          cx={0}
          cy={0}
          r={w / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeW}
        />
      );
    }
    if (table.shape === "u_shape") {
      // Build a U path: outer rectangle minus inner rectangle (from the bottom)
      const barThick = 1;
      const outerW = w;
      const outerH = h;
      const innerW = Math.max(0.5, outerW - barThick * 2);
      const innerH = Math.max(0.5, outerH - barThick);
      const d = [
        `M ${-outerW / 2} ${-outerH / 2}`,
        `L ${outerW / 2} ${-outerH / 2}`,
        `L ${outerW / 2} ${outerH / 2}`,
        `L ${outerW / 2 - barThick} ${outerH / 2}`,
        `L ${outerW / 2 - barThick} ${-outerH / 2 + barThick}`,
        `L ${-outerW / 2 + barThick} ${-outerH / 2 + barThick}`,
        `L ${-outerW / 2 + barThick} ${outerH / 2}`,
        `L ${-outerW / 2} ${outerH / 2}`,
        "Z",
      ].join(" ");
      return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeW} />;
    }
    return (
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={0.3}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeW}
      />
    );
  }, [
    isRound,
    selected,
    warning,
    w,
    h,
    table.shape,
    isHovered,
    isDropCandidate,
    isFlashing,
    isFull,
    zoneStroke,
    zoneFill,
  ]);

  // Buffer glow ring when selected or too-close warning
  const bufferR = isRound
    ? w / 2 + 4
    : Math.max(w, h) / 2 + 4;

  // Determine seat fill by side (so glance-reading of table balance is quick)
  const seatFillFor = (guestId: string | undefined): string => {
    if (!guestId) return "#fbf8f2";
    const g = guestById.get(guestId);
    if (!g) return "#fbf8f2";
    if (g.side === "bride") return "#f2d1c9";
    if (g.side === "groom") return "#cfd9c4";
    return "#e7d5a6";
  };

  return (
    <g
      transform={`translate(${table.x}, ${table.y}) rotate(${table.rotation})`}
      onPointerDown={onPointerDown}
      onContextMenu={onContextMenu}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ cursor: "move" }}
    >
      {/* Aisle buffer — faint when selected, orange when too close */}
      {(selected || warning) && (
        <circle
          cx={0}
          cy={0}
          r={bufferR}
          fill="none"
          stroke={warning ? "#d88a42" : "#b8a780"}
          strokeWidth={0.08}
          strokeDasharray="0.5 0.5"
          opacity={warning ? 0.85 : 0.45}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Seat dots (with initials inside occupied seats) */}
      <g style={{ pointerEvents: "none" }}>
        {seats.map((s, i) => {
          const gid = seatedGuestIds[i];
          const filled = !!gid;
          const guest = gid ? guestById.get(gid) : undefined;
          const initials = guest ? guestInitials(guest) : "";
          const newly = !!(gid && highlightSet.has(gid));
          return (
            <g key={i}>
              {newly && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={0.9}
                  fill="none"
                  stroke="#c97a3a"
                  strokeWidth={0.14}
                  strokeDasharray="0.3 0.25"
                  opacity={0.85}
                />
              )}
              <circle
                cx={s.x}
                cy={s.y}
                r={filled ? 0.62 : 0.45}
                fill={seatFillFor(gid)}
                stroke={filled ? (newly ? "#c97a3a" : "#5f5243") : "#8e7e66"}
                strokeWidth={filled ? (newly ? 0.18 : 0.12) : 0.08}
                strokeDasharray={filled ? undefined : "0.25 0.2"}
              />
              {filled && initials && (
                <text
                  x={s.x}
                  y={s.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={0.42}
                  fontFamily="ui-serif, Georgia, serif"
                  fill="#2a2216"
                >
                  {initials}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {mainShape}

      {/* Seated guest name labels (only when selected or hovered to reduce clutter) */}
      {(selected || isHovered) && seatedGuestIds.length > 0 && (
        <g>
          {seats.map((s, i) => {
            const gid = seatedGuestIds[i];
            if (!gid) return null;
            const guest = guestById.get(gid);
            if (!guest) return null;
            const name = guestFullName(guest);
            const truncated = name.length > 14 ? name.slice(0, 13) + "…" : name;
            const labelOffset = 1.1;
            // Push label outward along the seat direction
            const mag = Math.hypot(s.x, s.y) || 1;
            const lx = s.x + (s.x / mag) * labelOffset;
            const ly = s.y + (s.y / mag) * labelOffset;
            return (
              <g
                key={gid + i}
                onContextMenu={(e) => onGuestContextMenu(e, gid)}
                style={{ cursor: "context-menu" }}
              >
                <title>{`${name} · ${guest.side} · ${guest.relationship ?? ""}${guest.dietary.length ? " · " + guest.dietary.join("/") : ""}${guest.categories.length ? " · " + guest.categories.join(", ") : ""}`}</title>
                <rect
                  x={lx - 1.6}
                  y={ly - 0.4}
                  width={3.2}
                  height={0.8}
                  rx={0.12}
                  fill="#fffef7"
                  stroke="#bfb298"
                  strokeWidth={0.05}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={0.46}
                  fontFamily="ui-sans-serif, system-ui"
                  fill="#1f1b14"
                  style={{ pointerEvents: "none" }}
                >
                  {truncated}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Empty-seat plus icons when selected */}
      {selected && (
        <g style={{ pointerEvents: "none" }}>
          {seats.map((s, i) => {
            if (seatedGuestIds[i]) return null;
            return (
              <text
                key={`plus-${i}`}
                x={s.x}
                y={s.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={0.55}
                fill="#8a7a5f"
                fontFamily="ui-sans-serif, system-ui"
              >
                +
              </text>
            );
          })}
        </g>
      )}

      {/* Label (click to open table card). Primary = T#. Optional display
          name shown in smaller italic just below the number. */}
      <g
        onClick={(e) => {
          e.stopPropagation();
          onLabelClick();
        }}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={-Math.max(1, Math.min(w, h) * 0.25) * 1.4}
          y={-Math.max(1, Math.min(w, h) * 0.12) - 0.2}
          width={Math.max(1, Math.min(w, h) * 0.25) * 2.8}
          height={Math.max(1, Math.min(w, h) * 0.24) + (displayName ? 1.3 : 0.25)}
          fill="transparent"
        />
        <text
          x={0}
          y={displayName ? -0.45 : 0}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.max(1, Math.min(w, h) * 0.2)}
          fontFamily="ui-serif, Georgia, serif"
          fill="#1f1b14"
          style={{ pointerEvents: "none" }}
        >
          {primaryLabel}
        </text>
        {displayName && (
          <text
            x={0}
            y={0.55}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={0.62}
            fontFamily="ui-serif, Georgia, serif"
            fontStyle="italic"
            fill="#6a5d48"
            style={{ pointerEvents: "none" }}
          >
            {displayName.length > 18 ? displayName.slice(0, 17) + "…" : displayName}
          </text>
        )}
      </g>
      <text
        x={0}
        y={Math.max(1, Math.min(w, h) * 0.2) + (displayName ? 1.2 : 0.4)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize={0.7}
        fontFamily="ui-monospace, monospace"
        fill="#6a5d48"
        style={{ pointerEvents: "none" }}
      >
        {occupancy}/{table.seats}
      </text>

      {/* Rotation handle */}
      {selected && (
        <g
          transform={`translate(0, ${-bufferR + 0.5})`}
          onPointerDown={onRotateStart}
          style={{ cursor: "grab" }}
        >
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={0.8}
            stroke="#1a1a1a"
            strokeWidth={0.1}
            style={{ pointerEvents: "none" }}
          />
          <circle cx={0} cy={0} r={0.6} fill="#1a1a1a" />
          <circle cx={0} cy={0} r={0.25} fill="#faf7f1" />
        </g>
      )}
    </g>
  );
}
