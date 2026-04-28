// ──────────────────────────────────────────────────────────────────────────
// Canvas editor — shared types
//
// Surface ids match design_templates.surface_type in supabase migrations.
// ──────────────────────────────────────────────────────────────────────────

export type SurfaceType =
  | "monogram"
  | "wedding_logo"
  | "invitation"
  | "save_the_date"
  | "menu"
  | "welcome_sign"
  | "seating_chart"
  | "ceremony_program"
  | "thank_you"
  | "table_number"
  | "ig_story"
  | "ig_post"
  | "whatsapp_invite"
  | "video_invite"
  | "rsvp_card"
  | "outfit_guide";

export type LeftPanel =
  | "elements"
  | "text"
  | "motifs"
  | "colors"
  | "fonts"
  | "upload"
  | "ai";

// Physical surfaces allow a "Order Print" flow; digital surfaces
// surface a "Download" button instead.
export const PHYSICAL_SURFACES: SurfaceType[] = [
  "invitation",
  "save_the_date",
  "menu",
  "welcome_sign",
  "seating_chart",
  "ceremony_program",
  "thank_you",
  "table_number",
  "rsvp_card",
];

export interface CanvasSize {
  id: string;
  label: string;
  width: number;
  height: number;
  orientation?: "portrait" | "landscape" | "square";
}

export interface TrendingPalette {
  id: string;
  name: string;
  mood: string;
  background: string;
  swatches: [string, string, string, string];
}

export interface FontEntry {
  family: string;
  category:
    | "luxury"
    | "elegant"
    | "royal"
    | "whimsical"
    | "classic"
    | "refined"
    | "script_hindi"
    | "script_urdu"
    | "script_gujarati"
    | "script_punjabi"
    | "script_bengali"
    | "script_tamil";
  stack: string;
  weight?: number | string;
  googleFont?: boolean;
}

export interface UploadedAsset {
  id: string;
  name: string;
  url: string;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface MotifRow {
  id: string;
  name: string;
  svg_data: string;
  cultural_style: string | null;
  regional_style: string | null;
  category: string;
  tags: string[];
  is_premium: boolean;
  color_configurable: boolean;
}

export interface AISuggestion {
  id: string;
  kind: "palette" | "font" | "layout" | "tip";
  title: string;
  description: string;
  apply?: () => void;
}

export interface CanvasEditorProps {
  canvasData: object | null;
  canvasWidth: number;
  canvasHeight: number;
  surfaceType: SurfaceType;
  onSave: (canvasJSON: object, thumbnailBlob: Blob) => void;
  readOnly?: boolean;
  // Internal prop used by the CanvasEditor wrapper to bridge the imperative
  // handle through next/dynamic (which does not forward refs natively).
  handleRef?: React.MutableRefObject<CanvasEditorHandle | null>;
}

// Imperative API exposed via the useCanvasEditor hook / ref.
export interface CanvasEditorHandle {
  addText: (text: string, options?: Record<string, unknown>) => void;
  addShape: (kind: "rect" | "circle" | "line" | "divider") => void;
  addSVG: (svg: string) => void;
  addImage: (url: string) => void;
  setBackground: (color: string) => void;
  applyPalette: (palette: TrendingPalette) => void;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (z: number) => void;
  exportJSON: () => object | null;
  exportPNG: () => Promise<Blob | null>;
  save: () => void;
}
