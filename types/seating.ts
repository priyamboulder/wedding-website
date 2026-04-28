// ── Seating / Floor Plan types ──────────────────────────────────────────
// Canonical model for the spatial reception floor plan.
//
// All positional units are in **feet** relative to the room's top-left corner,
// never pixels. The canvas converts feet → pixels using a scale factor derived
// from viewport width and the room's physical dimensions. Rotations are in
// degrees (clockwise).

export type Unit = "ft" | "m";

export type TableShape = "round" | "rect" | "banquet" | "u_shape";

// Social/visual zone for a table. Drives the ring-layout and border color.
// Set by the AI auto-assign-all flow and used as a filter in the Table Detail
// panel. `null`/absent = unclassified (defaults to friends tinting).
export type TableZone = "vip" | "family" | "friends" | "kids";

export const TABLE_ZONE_META: Record<
  TableZone,
  { label: string; stroke: string; fill: string; ring: number; description: string }
> = {
  vip: {
    label: "VIP",
    stroke: "#c9a242",
    fill: "rgba(201, 162, 66, 0.10)",
    ring: 1,
    description: "Head table area",
  },
  family: {
    label: "Family",
    stroke: "#c97a84",
    fill: "rgba(201, 122, 132, 0.10)",
    ring: 2,
    description: "Extended family ring",
  },
  friends: {
    label: "Friends",
    stroke: "#7a9548",
    fill: "rgba(122, 149, 72, 0.10)",
    ring: 3,
    description: "Near dance floor",
  },
  kids: {
    label: "Kids",
    stroke: "#d8a948",
    fill: "rgba(216, 169, 72, 0.10)",
    ring: 4,
    description: "Near food, near parents",
  },
};

// Legacy narrow kind — preserved for backward compatibility. The richer
// element catalog in `lib/floor-plan-library.ts` uses string ids; legacy
// ids are aliased via `legacyKind` on catalog entries.
export type FixedElementKind = string;

export type ElementLayer = "furniture" | "zone_overlay";

// Flexible per-element properties bag (vendor info, AV, food, etc.).
// Shape is constrained only by the floor-plan-library property groups.
export interface ElementProperties {
  // Vendor
  vendorName?: string;
  vendorContact?: string;
  vendorPhone?: string;
  vendorEmail?: string;
  cost?: number;
  setupTime?: string;
  teardownTime?: string;
  // Staffing
  staffingCount?: number;
  // AV/Power
  needsPower?: boolean;
  powerWatts?: number;
  needsOutlet?: boolean;
  needsEthernet?: boolean;
  needsHdmi?: boolean;
  needsWirelessMic?: boolean;
  needsSpotlight?: boolean;
  // Food/Beverage
  cuisineType?: string;
  menuItems?: string;
  dietaryVeg?: boolean;
  dietaryNonVeg?: boolean;
  dietaryJain?: boolean;
  dietaryHalal?: boolean;
  needsVentilation?: boolean;
  // Variant / description
  variant?: string;
  // Games
  gamesList?: string;
  // Lounge
  seatCount?: number;
  loungeStyle?: string;
  // Misc catch-all (free-form key/value pairs the user adds)
  extras?: Record<string, string>;
}

// A table placed in the room. Round tables only use `width` (as diameter);
// rectangular / banquet / u-shape tables use width × height.
export interface SeatingTable {
  id: string;
  number: number; // 1-indexed auto number, can be renamed via `label`
  label?: string; // optional override, e.g. "Sweetheart"
  shape: TableShape;
  seats: number;
  x: number; // center x, in feet
  y: number; // center y, in feet
  width: number; // ft (diameter for round)
  height: number; // ft (ignored for round)
  rotation: number; // degrees
  notes?: string;
  // AI-assigned social zone (VIP / Family / Friends / Kids). Drives the
  // border color on the canvas and filters in the Table Detail panel.
  zone?: TableZone;
}

export interface FixedElement {
  id: string;
  kind: FixedElementKind;
  label: string;
  x: number; // center x, in feet
  y: number; // center y, in feet
  width: number; // ft
  height: number; // ft
  rotation: number; // degrees
  // NEW — optional richer fields (all optional for back-compat)
  color?: string; // override fill color (library default used if unset)
  locked?: boolean;
  notes?: string;
  layer?: ElementLayer;
  zoneId?: string | null;
  properties?: ElementProperties;
}

export interface RoomConfig {
  name: string;
  length: number; // in feet (x-axis)
  width: number; // in feet (y-axis)
  unit: Unit; // display unit only; storage is always ft
}

// A themed zone — a translucent colored region on the canvas used to
// group elements into a guest-experience area (cocktail lounge, food
// court, kids zone, etc.).
export interface FloorZone {
  id: string;
  name: string;
  description?: string;
  color: string; // rgba string for the translucent fill
  x: number; // center x, feet
  y: number; // center y, feet
  width: number; // feet
  height: number; // feet
  rotation: number; // degrees
  flowOrder?: number; // 1-indexed position in guest-experience flow
}

// One event's floor plan. Room, elements, tables, and zones are all
// keyed per-event — the Sangeet and Reception layouts can differ.
export interface EventFloorPlan {
  room: RoomConfig;
  fixed: FixedElement[];
  tables: SeatingTable[];
  zones: FloorZone[];
}

export interface SeatingLayout {
  room: RoomConfig;
  fixed: FixedElement[];
  tables: SeatingTable[];
  zones: FloorZone[];
  presetId: string | null; // last applied preset, null after modification
  lastSavedAt: string | null; // ISO
}

export type LayoutPresetId = "banquet_classic" | "u_shape_formal" | "mixed";

export interface LayoutPreset {
  id: LayoutPresetId;
  name: string;
  description: string;
  build: (room: RoomConfig) => {
    fixed: FixedElement[];
    tables: SeatingTable[];
  };
}

// ── Floor-plan tab strip ────────────────────────────────────────────────
export type FloorPlanTab = "layout" | "seating" | "zones";
