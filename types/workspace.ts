// ── Couple-side Workspace data model ───────────────────────────────────────
// The /workspace surface is one canvas per vendor *category* (not per booked
// vendor). It lets the couple plan everything about a category — vision,
// shortlist, schedule, decisions — before a vendor is even assigned.
//
// Persists to localStorage via Zustand (see stores/workspace-store.ts). The
// schema here mirrors supabase/migrations/0006_workspace.sql for swap-over.

export type WorkspaceCategorySlug =
  | "photography"
  | "videography"
  | "catering"
  | "decor_florals"
  | "entertainment"
  | "guest_experiences"
  | "hmua"
  | "venue"
  | "mehndi"
  | "transportation"
  | "stationery"
  | "pandit_ceremony"
  | "wardrobe"
  | "jewelry"
  | "cake_sweets"
  | "gifting"
  | "travel_accommodations";

export type WorkspaceCategoryStatus = "assigned" | "shortlisted" | "open";

// ── Tab IDs ────────────────────────────────────────────────────────────────
// Flat union of every tab id used anywhere in the workspace. Filtering is
// always scoped by category first, so shared ids never collide across
// categories.
//
// Kept in lockstep with WorkspaceTabTag in types/checklist.ts. When you add
// a new tab id here, add the same string to that union.
export type WorkspaceTab =
  // ── Legacy / generic (catch-all for categories that still use the old
  //    6-tab shell, and for cross-category concerns like Journal) ──
  | "vision"
  | "plan"
  | "shortlist"
  | "timeline"
  | "decisions"
  | "journal"
  // ── Shared across purpose-built categories ──
  | "shortlist_contract"
  | "day_of"
  | "deliverables"
  // ── Photography / Videography ──
  | "shot_list"
  | "vips"
  | "rituals"
  | "crew"
  | "must_capture"
  | "film_vision"
  | "audio_coverage"
  // ── Catering ──
  | "tasting"
  | "dietary"
  | "bar"
  | "event_menus"
  | "staffing"
  | "rentals"
  // ── Décor & Florals ──
  | "mandap"
  | "reception_stage"
  | "florals"
  | "lighting"
  | "load_in"
  | "budget"
  // ── Music & Entertainment ──
  | "dj_band"
  | "live_performers"
  | "song_list"
  | "av_tech"
  | "soundscapes"
  | "sangeet_planner"
  | "equipment_tech"
  // ── Guest Experiences ──
  | "guest_discover"
  | "guest_shortlist"
  | "guest_inspiration"
  // ── Hair & Makeup ──
  | "trial_notes"
  | "bride_looks"
  | "bridal_party"
  | "touch_up"
  // ── Venue ──
  | "floorplans"
  | "capacity_flow"
  | "vendor_load_in"
  | "catering_rules"
  | "permits"
  | "accommodations"
  | "venue_profile"
  | "spaces_layout"
  | "logistics_hub"
  | "rules_restrictions"
  | "contacts_emergency"
  | "discovery_feel"
  | "venue_comparison"
  | "logistics_rules"
  | "site_visit_notes"
  | "documents"
  // ── Mehndi ──
  | "design_refs"
  | "bride_mehndi"
  | "guest_queue"
  | "guest_mehndi"
  // ── Transportation ──
  | "plan_logistics"
  | "baraat"
  | "shuttle_transport"
  // ── Stationery ──
  | "save_the_dates"
  | "invitation_suite"
  | "event_cards"
  | "day_of_paper"
  | "print_schedule"
  | "suite_builder"
  | "guest_print_matrix"
  | "production_timeline"
  // ── Priest / Pandit ──
  | "ritual_sequence"
  | "mantras"
  | "samagri"
  | "family_roles"
  | "ceremony_script"
  | "ceremony_logistics"
  // ── Wardrobe ──
  | "fittings"
  | "wardrobe_looks"
  | "bridal_party_attire"
  | "delivery"
  // ── Jewelry ──
  | "bridal_jewelry"
  | "groom_jewelry"
  | "family_heirlooms"
  | "fittings_coordination"
  // ── Cake & Sweets ──
  | "wedding_cake"
  | "mithai"
  | "dessert_tables"
  | "tasting_approval"
  | "service_plan"
  // ── Gifting ──
  | "welcome_bags"
  | "trousseau_packaging"
  | "return_favors"
  | "family_exchanges"
  | "thank_you"
  // ── Travel & Accommodations ──
  | "hotel_strategy"
  | "room_blocks"
  | "guest_travel"
  | "welcome_experience"
  | "group_flights"
  | "shuttles"
  | "rate_negotiations"
  | "attrition_cutoffs";

export interface WorkspaceCategory {
  id: string;
  slug: WorkspaceCategorySlug;
  name: string;
  status: WorkspaceCategoryStatus;
  assigned_vendor_id: string | null;
  sort_order: number;
  // Planner-set budget in paise-free rupees, INR. Other currencies not yet
  // supported — add a currency field here when we internationalise.
  budget_allocated?: number | null;
}

// Polymorphic line item — used for shot list rows, menu dishes, songs,
// outfits, rituals, etc. `block_type` discriminates the meta payload.
export type WorkspaceBlockType =
  // Photography / Videography
  | "shot_list"
  | "people_list"
  | "kit_notes"
  | "coverage_hours"
  | "deliverable"
  | "must_capture_moment"
  | "crew_member"
  // Catering
  | "menu_course"
  | "dietary_count"
  | "service_window"
  | "tasting_visit"
  | "bar_item"
  | "staff_slot"
  | "rental_item"
  // Decor & Florals
  | "floral"
  | "setup_plan"
  | "stage_design"
  | "lighting_plan"
  | "load_in_slot"
  // Music & Entertainment
  | "set_list"
  | "song_request"
  | "performer"
  | "av_spec"
  // HMUA
  | "look"
  | "trial"
  | "bridal_party_look"
  | "touch_up_kit"
  // Venue
  | "room_assignment"
  | "floor_note"
  | "floorplan"
  | "capacity_slot"
  | "catering_rule"
  | "permit"
  // Mehendi
  | "design_inspo"
  | "application_slot"
  // Transportation
  | "fleet_vehicle"
  | "pickup"
  | "shuttle"
  | "vip_move"
  | "baraat_slot"
  // Stationery
  | "suite_piece"
  | "wording"
  | "paper_piece"
  | "print_job"
  // Priest / Pandit
  | "ritual"
  | "samagri"
  | "mantra"
  | "family_role"
  // Wardrobe
  | "outfit"
  | "fitting"
  | "accessory"
  | "delivery_slot"
  // Generic
  | "note"
  | "schedule_slot";

export interface WorkspaceItem {
  id: string;
  category_id: string;
  tab: WorkspaceTab;
  block_type: WorkspaceBlockType;
  title: string;
  // Flexible side data. Stable keys used by block renderers:
  //   priority: "must" | "preferred" | "nice"
  //   event: string              (ceremony name)
  //   people: string             (comma list)
  //   duration: string
  //   time: string               (HH:mm)
  //   count: number
  //   tags: string[]
  //   notes: string
  //   image_url: string
  //   person: string
  meta: Record<string, unknown>;
  sort_order: number;
}

export interface WorkspaceDecision {
  id: string;
  category_id: string;
  question: string;
  status: "open" | "resolved";
  resolved_at: string | null;
  created_at: string;
  // ── Attribution ──────────────────────────────────────────────────────────
  // Role ids ("planner" | "priya" | "arjun"). Vendor role cannot own
  // decisions. Optional so pre-existing seed data still validates.
  created_by?: WorkspaceAuthorRole;
  resolved_by?: WorkspaceAuthorRole | null;
  // ── Richer decision shape (optional — plain questions keep working) ──────
  description?: string;
  options?: string[];
  resolution?: string;
  // Role ids of partners who have vetoed. Max one flag per role; used on
  // the Vision alignment items and here for decisions.
  veto_flags?: WorkspaceAuthorRole[];
  // Optional contextual links — filter decisions by vendor or event in UI.
  linked_vendor_id?: string | null;
  linked_event?: WeddingEvent | null;
}

export interface WorkspaceNote {
  id: string;
  category_id: string;
  body: string;
  author_id: string; // couple-side authors: "priya" | "arjun" | "planner"
  created_at: string;
}

export type MoodboardReaction = "love" | "note" | "not_this";
export type MoodboardTag =
  | "eyes"
  | "composition"
  | "mood"
  | "detail"
  // Beauty (HMUA) tags — used on the HMUA Vision & Mood moodboard.
  | "hair"
  | "makeup"
  | "accessories"
  | "nails"
  // Wardrobe tags — used on the Wardrobe Style & Vision moodboard.
  | "bride"
  | "groom"
  | "bridesmaids"
  | "family"
  // Stationery tags — used on the Stationery Vision & Mood moodboard so
  // the couple can tell the designer what caught their eye about each pin.
  | "typography"
  | "texture"
  | "layout"
  | "colour"
  // Cake & Sweets tags — used on the Cake & Sweets Vision & Mood moodboard.
  | "cake"
  | "mithai"
  | "table_styling"
  | "plating";

export interface WorkspaceMoodboardItem {
  id: string;
  category_id: string;
  image_url: string;
  caption: string;
  sort_order: number;
  // Optional two-way link — populated when this image came from a
  // Journal entry via the workspace Journal tab's "Add to moodboard"
  // action. Renders as "From Journal: <title>" under the image.
  source?: import("./journal-entries").SourceRef;
  // Couple's reaction on this pin. Shared with planner + photographer.
  reaction?: MoodboardReaction;
  // What the couple is drawn to about this image.
  tag?: MoodboardTag;
}

// ── Non-vendor sidebar entries ──────────────────────────────────────────────
// The workspace rail now carries three groups: vendor categories, celebration
// & trip planners (bachelorette, bachelor, welcome events, honeymoon), and
// keepsakes (photos & videos, notes & ideas). These are not `WorkspaceCategory`
// rows — they don't have a vendor or a contract — so they live in a parallel
// union selected by the page component.

export type CelebrationPageId =
  | "bachelorette"
  | "bachelor"
  | "bridal_shower"
  | "baby_shower"
  | "first_birthday"
  | "welcome_events"
  | "honeymoon";

export type KeepsakePageId =
  | "photos_videos"
  | "notes_ideas"
  | "engagement_shoot";

// "After the wedding" entries — only surfaced in the sidebar once the wedding
// date has passed (or the couple manually unlocks early via the toggle in the
// Post-Wedding module). Lives in the ExtraPageId union so the same { type:
// "extra" } selection plumbing works.
//
// `first_anniversary` is the first of the "Next Chapter" milestone modules
// (baby shower, baby's first birthday will follow the same pattern).
export type AfterTheWeddingPageId = "post_wedding" | "first_anniversary";

export type ExtraPageId =
  | CelebrationPageId
  | KeepsakePageId
  | AfterTheWeddingPageId;

export type WorkspaceSelection =
  | { type: "vendor"; slug: WorkspaceCategorySlug }
  | { type: "extra"; id: ExtraPageId }
  | { type: "finance" }
  | { type: "documents" }
  | { type: "events" }
  | { type: "schedule" };

// ── Category display data ───────────────────────────────────────────────────

export interface CategoryDisplay {
  slug: WorkspaceCategorySlug;
  name: string;
  shortName: string;
}

export const WORKSPACE_CATEGORIES: CategoryDisplay[] = [
  { slug: "photography", name: "Photography", shortName: "Photo" },
  { slug: "videography", name: "Videography", shortName: "Video" },
  { slug: "catering", name: "Catering", shortName: "Catering" },
  { slug: "decor_florals", name: "Décor & Florals", shortName: "Décor" },
  { slug: "entertainment", name: "Music & Entertainment", shortName: "Music" },
  { slug: "guest_experiences", name: "Guest Experiences", shortName: "Experiences" },
  { slug: "hmua", name: "Hair & Makeup", shortName: "HMUA" },
  { slug: "venue", name: "Venue", shortName: "Venue" },
  { slug: "mehndi", name: "Mehendi Artist", shortName: "Mehendi" },
  { slug: "transportation", name: "Transportation", shortName: "Transport" },
  { slug: "stationery", name: "Stationery & Invitations", shortName: "Stationery" },
  { slug: "pandit_ceremony", name: "Officiant", shortName: "Officiant" },
  { slug: "wardrobe", name: "Wardrobe & Styling", shortName: "Wardrobe" },
  { slug: "jewelry", name: "Jewelry", shortName: "Jewelry" },
  { slug: "cake_sweets", name: "Cake & Sweets", shortName: "Cake" },
  { slug: "gifting", name: "Gifting", shortName: "Gifts" },
  {
    slug: "travel_accommodations",
    name: "Travel & Accommodations",
    shortName: "Travel",
  },
];

export const STATUS_DOT: Record<WorkspaceCategoryStatus, string> = {
  assigned: "bg-sage",
  shortlisted: "bg-gold-light",
  open: "bg-ink-faint",
};

export const STATUS_LABEL: Record<WorkspaceCategoryStatus, string> = {
  assigned: "Assigned",
  shortlisted: "Shortlisted",
  open: "Not started",
};

// ── Roles & identity (local-first simulation) ──────────────────────────────
// The "real" system would have Supabase auth + RLS. Here we just carry a
// currentRole in the workspace-store and attribute edits on write. Vendor
// is a read-only role used by the "View as vendor" toggle.

export type WorkspaceRole = "planner" | "priya" | "arjun" | "vendor";
export type WorkspaceAuthorRole = Exclude<WorkspaceRole, "vendor">;

export interface WorkspaceRoleProfile {
  id: WorkspaceRole;
  name: string;
  subtitle: string;
  initials: string;
  // Tailwind class for avatar chip background.
  tint: string;
}

// Couple-slot role profiles (priya/arjun) render the logged-in couple's
// names. Planner/vendor remain static fixtures until those entities have
// their own auth identities. Consumers should prefer `useWorkspaceRoles()`
// and `useRoleLabel()` (in lib/couple-identity.ts) over the default export
// below, which is only kept for non-client callers and seed fallbacks.
export function buildWorkspaceRoles(
  person1: string,
  person2: string,
): WorkspaceRoleProfile[] {
  const i1 = ((person1[0] ?? "").toUpperCase() + (person1[1] ?? "").toUpperCase()) || "P1";
  const i2 = ((person2[0] ?? "").toUpperCase() + (person2[1] ?? "").toUpperCase()) || "P2";
  return [
    { id: "planner", name: "Urvashi", subtitle: "Planner · Radz Events", initials: "UR", tint: "bg-ink text-ivory" },
    { id: "priya", name: person1, subtitle: "Couple", initials: i1, tint: "bg-saffron/20 text-saffron" },
    { id: "arjun", name: person2, subtitle: "Couple", initials: i2, tint: "bg-sage/25 text-sage" },
    { id: "vendor", name: "Vendor view", subtitle: "Read-only share link", initials: "VN", tint: "bg-gold-light/40 text-ink" },
  ];
}

export function buildRoleLabel(
  person1: string,
  person2: string,
): Record<WorkspaceAuthorRole, string> {
  return {
    planner: "Urvashi",
    priya: person1,
    arjun: person2,
  };
}

// Seed fallback — consumers in client components should use the hooks.
export const WORKSPACE_ROLES: WorkspaceRoleProfile[] = buildWorkspaceRoles(
  "Priya",
  "Arjun",
);

export const ROLE_LABEL: Record<WorkspaceAuthorRole, string> = buildRoleLabel(
  "Priya",
  "Arjun",
);

// ── Wedding events & coverage matrix ───────────────────────────────────────
// Events are the horizontal spine of a multi-day Indian wedding. Coverage
// assignments sit per-category (photography or videography) and let the
// Overview coverage matrix answer "is every event covered?" at a glance.

export type WeddingEvent =
  | "pre_wedding"
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "wedding"
  | "reception";

export const WEDDING_EVENTS: { id: WeddingEvent; label: string }[] = [
  { id: "haldi", label: "Haldi" },
  { id: "mehendi", label: "Mehendi" },
  { id: "sangeet", label: "Sangeet" },
  { id: "wedding", label: "Wedding" },
  { id: "reception", label: "Reception" },
];

export type CoverageService = "photo" | "video" | "cinema";

export const COVERAGE_SERVICES: { id: CoverageService; label: string }[] = [
  { id: "photo", label: "Photo" },
  { id: "video", label: "Video" },
  { id: "cinema", label: "Cinematography" },
];

export type CoverageState = "assigned" | "shortlisted" | "open" | "na";

export interface CoverageAssignment {
  id: string;
  category_id: string;
  event: WeddingEvent;
  service: CoverageService;
  state: CoverageState;
  vendor_id: string | null;
}

// ── Contracts ──────────────────────────────────────────────────────────────

export type ContractStatus =
  | "draft"
  | "sent"
  | "signed_by_vendor"
  | "countersigned"
  | "disputed";

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  draft: "Drafting",
  sent: "Sent to vendor",
  signed_by_vendor: "Awaiting countersignature",
  countersigned: "Fully executed",
  disputed: "In dispute",
};

export interface PaymentMilestone {
  id: string;
  label: string;
  // Amount in rupees. Currency tracked at contract level.
  amount: number;
  due_date: string | null;
  paid_at: string | null;
}

export interface WorkspaceContract {
  id: string;
  category_id: string;
  vendor_id: string;
  status: ContractStatus;
  total_amount: number;
  travel_amount: number;
  currency: "INR";
  payment_schedule: PaymentMilestone[];
  scope_includes: string[];
  scope_excludes: string[];
  file_refs: { label: string; href?: string }[];
  countersigned_by_priya_at: string | null;
  countersigned_by_arjun_at: string | null;
  created_at: string;
  updated_at: string;
}
