// ── Photography-specific domain types ─────────────────────────────────────
// Photography has purpose-built tabs (Shot List, VIPs & Family, Ritual
// Moments, Day-of Schedule, Crew, Deliverables) that don't generalize to
// other vendor categories. These types back those tabs.

export type PhotoEventId =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "baraat"
  | "wedding"
  | "reception"
  | "general";

export const PHOTO_EVENTS: { id: PhotoEventId; label: string; date?: string }[] = [
  { id: "haldi", label: "Haldi", date: "Nov 12" },
  { id: "mehendi", label: "Mehendi", date: "Nov 13" },
  { id: "sangeet", label: "Sangeet", date: "Nov 13" },
  { id: "baraat", label: "Baraat", date: "Nov 14" },
  { id: "wedding", label: "Wedding", date: "Nov 14" },
  { id: "reception", label: "Reception", date: "Nov 15" },
  { id: "general", label: "General" },
];

// ── Event metadata ─────────────────────────────────────────────────────────
// Used by the Shot List tab for the right-pane header (one-line photographic
// intent) and for grouping shots into sub-moments. General covers shots not
// tied to any single event — detail/B-roll/family-combo portraits.
export const PHOTO_EVENT_META: Record<
  PhotoEventId,
  { description: string; moments: string[] }
> = {
  haldi: {
    description:
      "Intimate morning ritual — warm natural light, close-up detail, family candids.",
    moments: ["Pre-ceremony setup", "Paste application", "Family moments", "Candids"],
  },
  mehendi: {
    description:
      "Henna in close-up — steady hands, saturated color, slow afternoon energy.",
    moments: ["Artists arriving", "Bridal mehendi", "Guest applications", "Details & reveal"],
  },
  sangeet: {
    description:
      "High-energy performance night — stage light, reaction shots, dance-floor wides.",
    moments: ["Arrivals & decor", "Performances", "Speeches", "Dance floor"],
  },
  baraat: {
    description:
      "Groom's procession — movement, dhol rhythm, aerial wides, family at peak.",
    moments: ["Groom prep", "Procession", "Welcome at venue", "Family reactions"],
  },
  wedding: {
    description:
      "The ceremony itself — rituals in order, elders front of frame, hands and faces.",
    moments: [
      "First look",
      "Var mala",
      "Kanyadaan & pheras",
      "Sindoor & mangalsutra",
      "Family portraits",
      "Vidaai",
    ],
  },
  reception: {
    description:
      "Formal evening — portraits, toasts, cake, first dance, late-night candids.",
    moments: ["Entrance", "Toasts & cake", "First dance", "Party"],
  },
  general: {
    description:
      "Cross-event coverage — getting-ready, detail still-lifes, B-roll, combo portraits.",
    moments: [
      "Getting ready",
      "Detail still-lifes",
      "Family combinations",
      "B-roll & transitions",
      "Golden hour portraits",
    ],
  },
};

export type ShotPriority = "must" | "preferred";

// User-defined events that live alongside PHOTO_EVENTS in the shot list.
// They have no canonical description or moments, so the Shot List tab
// falls back to a generic header and a free-form moment list.
export interface PhotoCustomEvent {
  id: string;
  label: string;
}

export interface PhotoShot {
  id: string;
  category_id: string;
  // Either a canonical PhotoEventId or a custom event id. Kept as a wider
  // string so users can attach shots to events they've added themselves.
  event: PhotoEventId | string;
  priority: ShotPriority;
  title: string;
  description?: string;
  vip_ids: string[];
  sort_order: number;
  // Added for the checklist-style Shot List: sub-moment grouping, a
  // persistent "got it" check state during live shooting, and expanded
  // drawer fields that stay hidden on the collapsed row.
  moment?: string;
  checked?: boolean;
  reference_image_url?: string;
  assigned_photographer?: string;
  assigned_angle?: string;
}

// ── VIPs & Family ──────────────────────────────────────────────────────────

export type VIPSide = "bride" | "groom" | "both";
export type VIPTier = "immediate" | "extended" | "close";

export const VIP_TIER_LABEL: Record<VIPTier, string> = {
  immediate: "Immediate family",
  extended: "Extended family",
  close: "Close friends",
};

export const VIP_SIDE_LABEL: Record<VIPSide, string> = {
  bride: "Bride's side",
  groom: "Groom's side",
  both: "Both sides",
};

export interface PhotoVIP {
  id: string;
  category_id: string;
  photo_url?: string | null;
  name: string;
  relationship: string;
  side: VIPSide;
  tier: VIPTier;
  must_capture: boolean;
  note?: string;
  sort_order: number;
}

// ── Group shots (family/friend combinations) ──────────────────────────────

export interface PhotoGroupShot {
  id: string;
  category_id: string;
  name: string;
  vip_ids: string[];
  event: PhotoEventId;
  // Minutes — spec defaults to ~3 per group of 6–8.
  estimated_minutes?: number;
  notes?: string;
  sort_order: number;
}

// ── Ritual Moments ─────────────────────────────────────────────────────────

export interface PhotoRitual {
  id: string;
  category_id: string;
  name: string;
  // Sanskrit/Hindi name (e.g. "Kanyadaan"). Displayed next to the
  // English `name` as in "Kanyadaan — Giving Away of the Bride".
  alt_name?: string;
  description: string;
  key_moment: string;
  duration?: string;
  position?: string;
  // Emotional note — e.g. "Mom cries here. Stay on her face."
  emotional_note?: string;
  // Reference photo URL — couple-uploaded example of how they want the
  // moment captured. Displayed alongside the moment in the tab.
  reference_image_url?: string;
  applies: boolean;
  sort_order: number;
}

// ── Day-of Schedule ────────────────────────────────────────────────────────

export type LightingCondition = "indoor" | "outdoor" | "mixed";

export const LIGHTING_LABEL: Record<LightingCondition, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  mixed: "Mixed",
};

export interface PhotoDayOfSlot {
  id: string;
  category_id: string;
  event: PhotoEventId;
  arrival_time: string;
  location: string;
  lighting: LightingCondition;
  golden_hour?: string;
  coverage_gap?: string;
  travel_time?: string;
  sort_order: number;
}

// ── Crew ───────────────────────────────────────────────────────────────────

export type CrewRole =
  | "second_shooter"
  | "videographer"
  | "drone"
  | "assistant"
  | "other";

export const CREW_ROLE_LABEL: Record<CrewRole, string> = {
  second_shooter: "Second shooter",
  videographer: "Videographer",
  drone: "Drone operator",
  assistant: "Photo assistant",
  other: "Other",
};

export interface PhotoCrewMember {
  id: string;
  category_id: string;
  role: CrewRole;
  name?: string;
  arrival_time?: string;
  handoff_note?: string;
  sort_order: number;
}

// ── Deliverables ───────────────────────────────────────────────────────────

export type DeliverableKind =
  | "same_day"
  | "sneak_peek"
  | "full_gallery"
  | "raw"
  | "album"
  | "print"
  | "usage_rights";

export const DELIVERABLE_KIND_LABEL: Record<DeliverableKind, string> = {
  same_day: "Same-day edit / teaser",
  sneak_peek: "Sneak peek gallery",
  full_gallery: "Full gallery",
  raw: "Raw files policy",
  album: "Album",
  print: "Print specs",
  usage_rights: "Usage rights",
};

export type DeliverableStatus =
  | "not_started"
  | "in_progress"
  | "delivered"
  | "approved"
  | "needs_revision";

export const DELIVERABLE_STATUS_LABEL: Record<DeliverableStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  delivered: "Delivered",
  approved: "Approved",
  needs_revision: "Needs revision",
};

export interface PhotoDeliverable {
  id: string;
  category_id: string;
  kind: DeliverableKind;
  name: string;
  due_label: string;
  // ISO date for the contracted delivery date — powers the progress bar
  // (days elapsed / days until deadline).
  due_date?: string;
  // ISO date the deliverable actually landed.
  delivered_at?: string;
  status?: DeliverableStatus;
  preview_url?: string;
  download_url?: string;
  notes?: string;
  sort_order: number;
}
