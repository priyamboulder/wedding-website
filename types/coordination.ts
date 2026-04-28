// ── Vendor Coordination Hub — data model ────────────────────────────────────
// External-facing coordination layer that replaces the WhatsApp-group sprawl:
// each vendor gets a tokenised portal URL (no login), the planner broadcasts
// updates, assignments are confirmed, day-of check-ins surface live. Stored
// locally via Zustand + localStorage (see stores/coordination-store.ts).

export type CoordinationRole =
  | "photographer"
  | "videographer"
  | "planner"
  | "caterer"
  | "decorator"
  | "florist"
  | "makeup"
  | "hair"
  | "mehendi"
  | "dj"
  | "band"
  | "cake"
  | "officiant"
  | "pandit"
  | "transport"
  | "rentals"
  | "lighting"
  | "photo_booth"
  | "choreographer"
  | "dhol"
  | "custom";

export const COORDINATION_ROLE_LABEL: Record<CoordinationRole, string> = {
  photographer: "Photographer",
  videographer: "Videographer",
  planner: "Planner",
  caterer: "Caterer",
  decorator: "Decorator",
  florist: "Florist",
  makeup: "Makeup Artist",
  hair: "Hair Stylist",
  mehendi: "Mehendi Artist",
  dj: "DJ / Sound",
  band: "Band / Live Music",
  cake: "Cake / Sweets",
  officiant: "Officiant",
  pandit: "Pandit",
  transport: "Transport",
  rentals: "Rentals",
  lighting: "Lighting",
  photo_booth: "Photo Booth",
  choreographer: "Choreographer",
  dhol: "Dhol / Baraat Music",
  custom: "Other",
};

export const COORDINATION_ROLE_ICON: Record<CoordinationRole, string> = {
  photographer: "📸",
  videographer: "🎥",
  planner: "📋",
  caterer: "🍽️",
  decorator: "🎨",
  florist: "💐",
  makeup: "💄",
  hair: "💇",
  mehendi: "🤲",
  dj: "🎵",
  band: "🎺",
  cake: "🎂",
  officiant: "✨",
  pandit: "🪔",
  transport: "🚗",
  rentals: "🪑",
  lighting: "💡",
  photo_booth: "📷",
  choreographer: "💃",
  dhol: "🥁",
  custom: "🔧",
};

export type OverallStatus = "pending" | "viewed" | "confirmed" | "has_questions";

export interface CoordinationVendor {
  id: string;
  // Business / studio name (e.g. "Raj Photography Studio").
  name: string;
  // Person you actually talk to (e.g. "Raj Mehta"). May be empty for solo ops.
  contactName: string | null;
  role: CoordinationRole;
  // Freeform label override for the role (e.g. "Lead Photographer"). Used for
  // display when set; otherwise we fall back to COORDINATION_ROLE_LABEL[role].
  roleLabel: string | null;

  phone: string | null;
  email: string | null;
  whatsapp: string | null;

  // Link back to a platform vendor profile (from stores/vendors-store), if any.
  platformVendorId: string | null;

  // Secure random hex string used as the /coordination/[token] path segment.
  // Generated once at creation; treat like a signed link.
  portalToken: string;

  // Event names (from the Events workspace) the vendor is working on.
  events: string[];

  portalLastViewedAt: string | null;
  overallStatus: OverallStatus;

  // Internal planner-only notes.
  internalNotes: string | null;

  createdAt: string;
  updatedAt: string;
}

// ── Assignments (vendor-facing schedule items) ─────────────────────────────

export interface CoordinationAssignment {
  id: string;
  vendorId: string;

  eventName: string;
  eventDate: string; // ISO date (YYYY-MM-DD)

  // All times as "HH:MM" 24-hour clock, tied to eventDate. Any of these
  // may be null if the planner hasn't nailed them down yet.
  callTime: string | null;
  setupStart: string | null;
  setupEnd: string | null;
  serviceStart: string | null;
  serviceEnd: string | null;
  breakdownStart: string | null;

  venueName: string | null;
  venueAddress: string | null;
  specificLocation: string | null;
  parkingInstructions: string | null;
  loadInInstructions: string | null;

  description: string | null;
  specialInstructions: string | null;
  guestCount: number | null;

  // Backpointers to ScheduleItem.id rows that seeded this assignment.
  scheduleItemIds: string[];

  vendorConfirmed: boolean;
  vendorConfirmedAt: string | null;
  vendorNotes: string | null;
  vendorHasQuestions: boolean;
  vendorQuestion: string | null;
  // Planner's reply to the vendor's question (the back-and-forth is a simple
  // 1-round thread for v1; extend to full messages later).
  plannerReply: string | null;
  plannerRepliedAt: string | null;

  // Day-of check-in.
  vendorCheckedInAt: string | null;

  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ── Broadcast updates ──────────────────────────────────────────────────────

export type UpdatePriority = "normal" | "important" | "urgent";

export type UpdateTargetType = "all" | "specific" | "event" | "role";

export interface CoordinationUpdateRead {
  vendorId: string;
  readAt: string;
}

export interface CoordinationUpdateAttachment {
  name: string;
  url: string;
  type: string;
}

export interface CoordinationUpdate {
  id: string;
  senderName: string;
  subject: string;
  body: string;
  priority: UpdatePriority;

  targetType: UpdateTargetType;
  targetVendorIds: string[];
  targetEvent: string | null;
  targetRole: CoordinationRole | null;

  readBy: CoordinationUpdateRead[];
  attachments: CoordinationUpdateAttachment[];

  createdAt: string;
}

// ── Shared files ───────────────────────────────────────────────────────────

export interface CoordinationFile {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string | null;
  description: string | null;

  visibleToAll: boolean;
  visibleToVendorIds: string[];

  uploadedAt: string;
}

// ── Derived/UI types ───────────────────────────────────────────────────────

export interface VendorRosterStats {
  total: number;
  confirmed: number;
  viewed: number;
  pending: number;
  hasQuestions: number;
}
