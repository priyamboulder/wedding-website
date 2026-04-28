// ── Seating seeds, presets, and element defaults ───────────────────────
// All dimensions in **feet**. (x, y) are the center of the element.

import type {
  FixedElement,
  FixedElementKind,
  LayoutPreset,
  RoomConfig,
  SeatingLayout,
  SeatingTable,
  TableShape,
} from "@/types/seating";
import { getElementDef, resolveLegacyKind } from "@/lib/floor-plan-library";

// ── IDs ────────────────────────────────────────────────────────────────
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `st_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

// ── Default room ───────────────────────────────────────────────────────
export const DEFAULT_ROOM: RoomConfig = {
  name: "Reception Hall",
  length: 80,
  width: 60,
  unit: "ft",
};

// ── Element visual defaults ────────────────────────────────────────────
// Warm, floor-plan palette. Fills are tuned for semi-transparent rendering
// against the ivory canvas; strokes pick up the corresponding deeper tone.
export const FIXED_ELEMENT_STYLES: Record<
  FixedElementKind,
  { fill: string; stroke: string; label: string; defaultW: number; defaultH: number }
> = {
  stage: {
    label: "Stage",
    fill: "rgba(201, 162, 66, 0.22)",
    stroke: "#a98032",
    defaultW: 20,
    defaultH: 8,
  },
  head_table: {
    label: "Head Table",
    fill: "rgba(201, 162, 66, 0.14)",
    stroke: "#a98032",
    defaultW: 18,
    defaultH: 4,
  },
  dance_floor: {
    label: "Dance Floor",
    fill: "rgba(141, 170, 196, 0.2)",
    stroke: "#6c8ea8",
    defaultW: 20,
    defaultH: 16,
  },
  bar: {
    label: "Bar Station",
    fill: "rgba(125, 110, 100, 0.22)",
    stroke: "#6b5d53",
    defaultW: 10,
    defaultH: 3,
  },
  buffet: {
    label: "Buffet",
    fill: "rgba(162, 140, 112, 0.22)",
    stroke: "#7d6a52",
    defaultW: 12,
    defaultH: 3,
  },
  dj: {
    label: "DJ Booth",
    fill: "rgba(94, 100, 125, 0.22)",
    stroke: "#505a7a",
    defaultW: 6,
    defaultH: 4,
  },
  photo_booth: {
    label: "Photo Booth",
    fill: "rgba(168, 108, 128, 0.22)",
    stroke: "#8a5a72",
    defaultW: 6,
    defaultH: 6,
  },
  door: {
    label: "Door",
    fill: "rgba(60, 60, 60, 0.18)",
    stroke: "#3c3c3c",
    defaultW: 4,
    defaultH: 1,
  },
};

// ── Table shape defaults ───────────────────────────────────────────────
// Round tables — diameter in feet, seat count standard for that diameter.
export const TABLE_SHAPE_DEFAULTS: Record<
  TableShape,
  { width: number; height: number; seats: number }
> = {
  round: { width: 6, height: 6, seats: 10 }, // 72" round
  rect: { width: 8, height: 3.5, seats: 8 }, // 8ft rectangle
  banquet: { width: 16, height: 3.5, seats: 16 }, // long banquet
  u_shape: { width: 18, height: 10, seats: 18 }, // U table
};

// ── Helpers to build elements ──────────────────────────────────────────
// Accepts either a legacy kind ("stage", "head_table", …) or a library
// id ("main_stage", "live_cooking", …). Falls back to the legacy style
// map when the kind isn't in the richer catalog.
export function createFixedElement(
  kind: FixedElementKind,
  x: number,
  y: number,
  overrides: Partial<FixedElement> = {},
): FixedElement {
  const resolvedId = resolveLegacyKind(kind);
  const def = getElementDef(resolvedId);
  const style = (FIXED_ELEMENT_STYLES as Record<string, {
    label: string; defaultW: number; defaultH: number;
  }>)[kind];

  const label = overrides.label ?? def?.name ?? style?.label ?? kind;
  const width = overrides.width ?? def?.defaultWidth ?? style?.defaultW ?? 6;
  const height = overrides.height ?? def?.defaultHeight ?? style?.defaultH ?? 4;

  return {
    id: uid(),
    kind: resolvedId,
    label,
    x,
    y,
    width,
    height,
    rotation: overrides.rotation ?? 0,
    locked: overrides.locked ?? false,
    notes: overrides.notes,
    layer: overrides.layer ?? def?.defaultLayer ?? "furniture",
    zoneId: overrides.zoneId ?? null,
    properties: overrides.properties ?? {},
    color: overrides.color,
  };
}

export function createTable(
  shape: TableShape,
  x: number,
  y: number,
  number: number,
  overrides: Partial<SeatingTable> = {},
): SeatingTable {
  const d = TABLE_SHAPE_DEFAULTS[shape];
  return {
    id: uid(),
    number,
    shape,
    seats: overrides.seats ?? d.seats,
    x,
    y,
    width: overrides.width ?? d.width,
    height: overrides.height ?? d.height,
    rotation: overrides.rotation ?? 0,
    label: overrides.label,
    notes: overrides.notes,
  };
}

// ── Layout presets ─────────────────────────────────────────────────────
// Each preset receives the current room and emits a fresh set of fixed
// elements + tables laid out to scale. The intent is to give the couple a
// working starting point they can refine, not a locked template.

function banquetClassic(room: RoomConfig): {
  fixed: FixedElement[];
  tables: SeatingTable[];
} {
  const { length: L, width: W } = room;
  const fixed: FixedElement[] = [
    createFixedElement("stage", L / 2, 5, { width: 22, height: 6 }),
    createFixedElement("head_table", L / 2, 12, { width: 20, height: 4 }),
    createFixedElement("dance_floor", L / 2, W / 2 + 4, {
      width: Math.min(22, L * 0.3),
      height: Math.min(18, W * 0.3),
    }),
    createFixedElement("dj", L / 2 - 14, W / 2 + 4, { width: 6, height: 4 }),
    createFixedElement("bar", 10, W - 4, { width: 10, height: 3 }),
    createFixedElement("bar", L - 10, W - 4, { width: 10, height: 3 }),
  ];

  const tables: SeatingTable[] = [];
  const cols = 6;
  const rows = 3;
  const topMargin = 22; // leave room for stage + head table
  const bottomMargin = 6;
  const sideMargin = 10;
  const availH = W - topMargin - bottomMargin;
  const availW = L - sideMargin * 2;
  const xStep = availW / (cols - 1);
  const yStep = availH / (rows - 1);
  let n = 1;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      // Skip centre tables that would collide with the dance floor (row 1, cols 2-3)
      if (r === 1 && (c === 2 || c === 3)) continue;
      const x = sideMargin + c * xStep;
      const y = topMargin + r * yStep;
      tables.push(createTable("round", x, y, n));
      n += 1;
    }
  }
  return { fixed, tables };
}

function uShapeFormal(room: RoomConfig): {
  fixed: FixedElement[];
  tables: SeatingTable[];
} {
  const { length: L, width: W } = room;
  const fixed: FixedElement[] = [
    createFixedElement("stage", L / 2, 5, { width: 24, height: 6 }),
    createFixedElement("dance_floor", L / 2, W / 2 + 2, {
      width: 20,
      height: 16,
    }),
    createFixedElement("dj", L / 2 + 16, W / 2 + 2, { width: 6, height: 4 }),
    createFixedElement("bar", 8, W - 4, { width: 10, height: 3 }),
    createFixedElement("buffet", L - 12, W - 4, { width: 12, height: 3 }),
  ];

  const tables: SeatingTable[] = [];
  // Head banquet across the top
  tables.push(
    createTable("banquet", L / 2, 14, 1, { width: 22, height: 4, seats: 18 }),
  );
  // Two vertical banquets forming the sides of the U
  tables.push(
    createTable("banquet", 18, W / 2 + 2, 2, {
      width: 4,
      height: 22,
      seats: 14,
      rotation: 0,
    }),
  );
  tables.push(
    createTable("banquet", L - 18, W / 2 + 2, 3, {
      width: 4,
      height: 22,
      seats: 14,
      rotation: 0,
    }),
  );
  // Extra rounds behind the U for overflow
  let n = 4;
  for (let c = 0; c < 4; c += 1) {
    const x = 12 + c * ((L - 24) / 3);
    tables.push(createTable("round", x, W - 12, n));
    n += 1;
  }
  return { fixed, tables };
}

function mixed(room: RoomConfig): {
  fixed: FixedElement[];
  tables: SeatingTable[];
} {
  const { length: L, width: W } = room;
  const fixed: FixedElement[] = [
    createFixedElement("stage", L / 2, 5, { width: 22, height: 6 }),
    createFixedElement("head_table", L / 2, 12, { width: 18, height: 4 }),
    createFixedElement("dance_floor", L / 2, W / 2, { width: 20, height: 16 }),
    createFixedElement("dj", L / 2 - 14, W / 2, { width: 6, height: 4 }),
    createFixedElement("bar", 9, W - 4, { width: 10, height: 3 }),
    createFixedElement("buffet", L - 12, W - 4, { width: 12, height: 3 }),
    createFixedElement("photo_booth", L - 7, 8, { width: 6, height: 6 }),
  ];
  const tables: SeatingTable[] = [];
  let n = 1;
  // Front: round tables flanking dance floor
  const frontY = 22;
  for (let c = 0; c < 6; c += 1) {
    if (c === 2 || c === 3) continue;
    const x = 10 + c * ((L - 20) / 5);
    tables.push(createTable("round", x, frontY, n));
    n += 1;
  }
  // Back: banquet rows
  const backY1 = W - 14;
  const backY2 = W - 22;
  for (let c = 0; c < 3; c += 1) {
    const x = L / 6 + c * (L / 3);
    tables.push(createTable("banquet", x, backY2, n, { width: 14, height: 3.5, seats: 12 }));
    n += 1;
  }
  for (let c = 0; c < 3; c += 1) {
    const x = L / 6 + c * (L / 3);
    tables.push(createTable("banquet", x, backY1, n, { width: 14, height: 3.5, seats: 12 }));
    n += 1;
  }
  return { fixed, tables };
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "banquet_classic",
    name: "Banquet Classic",
    description:
      "3 rows of round tables, stage at the top, dance floor centered with a small aisle.",
    build: banquetClassic,
  },
  {
    id: "u_shape_formal",
    name: "U-Shape Formal",
    description:
      "Banquet tables arranged in a U around a central dance floor — great for family-forward receptions.",
    build: uShapeFormal,
  },
  {
    id: "mixed",
    name: "Mixed",
    description:
      "Head table + round tables near the dance floor, long banquets in the back for larger parties.",
    build: mixed,
  },
];

// ── Default layout used on first visit ────────────────────────────────
export function defaultLayout(): SeatingLayout {
  const room = { ...DEFAULT_ROOM };
  const built = banquetClassic(room);
  return {
    room,
    fixed: built.fixed,
    tables: built.tables,
    zones: [],
    presetId: "banquet_classic",
    lastSavedAt: null,
  };
}
