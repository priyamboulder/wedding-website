// Photo Album types — Studio > Photo Albums feature.
//
// The data model mirrors the "album_project → spreads → slots" hierarchy from
// the Studio spec. Everything persists through `stores/album-store.ts` against
// localStorage (no backend — aligns with rest of Ananya).

export type AlbumSize = "6x6" | "8x10" | "10x10" | "12x12";
export type AlbumCoverType = "hardcover-linen" | "leather" | "photo-wrap" | "softcover";
export type AlbumPaperType = "matte" | "lustre" | "glossy";
export type AlbumStatus = "draft" | "in_review" | "ordered" | "shipped" | "delivered";

export interface AlbumPhoto {
  id: string;
  url: string;               // full-size or hosted URL
  thumbUrl?: string;         // optional smaller variant
  caption?: string;
  guestTags?: string[];      // "Mom", "Dad", etc.
  eventTag?: string;         // "haldi" | "sangeet" | ...
  hearted?: boolean;
  source: "favourites" | "upload" | "gallery";
  uploadedAt?: string;
  aspect?: "portrait" | "landscape" | "square";
}

export interface AlbumSlot {
  id: string;
  slot_index: number;
  photo_id: string | null;
  crop_x: number;            // 0..1, center of crop within photo
  crop_y: number;            // 0..1
  crop_zoom: number;         // 1..3
  rotation: 0 | 90 | 180 | 270;
  caption_text?: string;
}

export interface AlbumTextBlock {
  id: string;
  block_index: number;
  content: string;
  font: string;              // CSS font-family value
  color: string;
  alignment: "left" | "center" | "right";
  size?: number;             // CSS px override — defaults to template size
  is_ai_generated?: boolean; // user edits flip this to false so re-layout preserves
}

export interface AlbumSpread {
  id: string;
  position: number;
  layout_template_id: string;
  is_text_only: boolean;
  slots: AlbumSlot[];
  text_blocks: AlbumTextBlock[];
  // Collected on the spread for quick lookup without hitting the comments store
  comment_ids?: string[];
  // AI sequencing metadata — which wedding event this spread belongs to, and
  // whether it's a chapter/section divider between events.
  event_tag?: string;
  is_section_divider?: boolean;
}

export interface AlbumProject {
  id: string;
  wedding_id: string | null;  // null = the sole demo wedding
  title: string;
  status: AlbumStatus;
  size: AlbumSize;
  cover_type: AlbumCoverType;
  paper_type: AlbumPaperType;
  spine_text: string;
  cover_photo_id: string | null;
  photo_pool: AlbumPhoto[];
  spreads: AlbumSpread[];
  orders?: AlbumOrder[];
  // Bumped every time the AI auto-layout runs, so we can tell the user what
  // AI version they're looking at.
  ai_layout_version?: number;
  created_at: string;
  updated_at: string;
  ordered_at?: string;
}

// Template description — a layout is a grid of slot frames defined in
// normalised 0..1 coordinates that span the ENTIRE SPREAD (both pages), so a
// frame at { x: 0, w: 0.5 } covers the left page and { x: 0.5, w: 0.5 } the
// right. This is the Artifact Uprising / Milk Books model and makes gutter
// math / full-bleed layouts trivial.
export interface LayoutFrame {
  x: number;                  // 0..1 (fraction of spread width)
  y: number;                  // 0..1 (fraction of spread height)
  w: number;                  // 0..1
  h: number;                  // 0..1
}

export type LayoutCategory = "1-photo" | "2-photo" | "3-photo" | "4-photo" | "text";

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: LayoutCategory;
  frames: LayoutFrame[];      // photo slots in spread coordinates
  textFrames?: LayoutFrame[]; // optional text boxes in spread coordinates
  // Optional decoration — per-slot rotation in degrees (for polaroid collage).
  frameRotations?: number[];
  isTextOnly?: boolean;
  recommendedFor?: ("portrait" | "landscape" | "square")[];
}

// Display metadata for album size — includes visual dimensions used by the
// canvas, plus the price bump for the size tier (Phase 1: informational only).
export interface AlbumSizeMeta {
  id: AlbumSize;
  label: string;
  orientation: "square" | "portrait" | "landscape";
  widthIn: number;
  heightIn: number;
  basePrice: number;
  perTenPagesPrice: number;
}

export interface AlbumCoverMeta {
  id: AlbumCoverType;
  label: string;
  description: string;
  swatch: string;             // CSS color/gradient for the preview
  priceDelta: number;
}

export interface AlbumPaperMeta {
  id: AlbumPaperType;
  label: string;
  description: string;
  sheen: string;              // CSS hint for the zoomed-crop preview
}

// ── Order model ──────────────────────────────────────────────────────────────
// One row in `AlbumProject.orders`. Captures quantity, per-copy shipping
// addresses, a Stripe-ish payment id (localStorage prototype never hits
// Stripe), and status tracking from placement → delivery.

export type AlbumOrderStatus =
  | "pending_payment"
  | "placed"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface AlbumOrderAddress {
  recipient: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postal: string;
  country: string;
}

export interface AlbumOrder {
  id: string;
  album_project_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  shipping_addresses: AlbumOrderAddress[]; // one per copy if addresses differ
  stripe_payment_id: string;                // mock: `pi_mock_...`
  status: AlbumOrderStatus;
  tracking_number?: string;
  estimated_delivery: string;               // ISO date
  placed_at: string;
}
