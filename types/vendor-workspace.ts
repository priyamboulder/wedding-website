// ── Vendor workspace data model ─────────────────────────────────────────────
// The couple (or planner) pre-configures each vendor's scoped workspace before
// inviting the vendor to log in. This is Ananya's multi-tenant partner layer:
// once invited, the vendor claims their workspace and operates in a scoped
// view of the wedding that the couple has curated for them.
//
// A vendor_workspace mirrors a Vendor 1:1 but belongs to couple+vendor+wedding.
// Discipline content lives in `VendorWorkspaceContent` as a discriminated
// union keyed on the vendor's category.

import type { VendorCategory } from "./vendor";

export type WorkspaceInviteStatus =
  | "not_invited"
  | "invited"
  | "active"
  | "revoked";

export type WorkspaceDiscipline =
  | "catering"
  | "hmua"
  | "mehndi"
  | "photography"
  | "florals"
  | "entertainment"
  | "wardrobe"
  | "stationery"
  | "pandit_ceremony";

// ── Discipline-specific content ─────────────────────────────────────────────

export interface CateringCourse {
  id: string;
  name: string;
  dishes: string[];
  dietary_tags: string[]; // "veg", "vegan", "jain", "halal", "gluten-free"
  notes?: string;
}

export interface CateringContent {
  kind: "catering";
  courses: CateringCourse[];
  guest_counts: {
    total: number;
    veg: number;
    non_veg: number;
    jain: number;
    vegan: number;
    kids: number;
  };
  service_timing: Array<{ event: string; start: string; end: string }>;
  staffing: Array<{ role: string; count: number; notes?: string }>;
  kitchen_logistics: string[];
  tastings: Array<{ date: string; status: "scheduled" | "completed" | "pending" }>;
  deliverables: string[];
}

export interface HMUALook {
  person: string; // "Bride", "Mother of Bride", "Sister (Ria)"
  event: string;  // "Sangeet", "Haldi", "Wedding ceremony"
  style: string;  // "Classic red lip, soft eyes"
  references: string[]; // pinterest/mood board references
  notes?: string;
}

export interface HMUAContent {
  kind: "hmua";
  timeline: Array<{
    person: string;
    event: string;
    call_time: string;
    duration_mins: number;
  }>;
  looks: HMUALook[];
  product_preferences: string[];
  trials: Array<{
    person: string;
    date: string;
    status: "scheduled" | "completed" | "pending";
  }>;
}

export interface MehndiContent {
  kind: "mehndi";
  design_references: string[];
  bridal: {
    intricacy: "minimal" | "intermediate" | "elaborate" | "regal";
    application_hours: number;
    motifs: string[];
    coverage: string; // "Hands + forearms, feet to mid-calf"
  };
  guest_session: {
    guest_count: number;
    duration_hours: number;
    location: string;
    event: string;
  };
  timeline: Array<{
    person_or_group: string;
    event: string;
    start_time: string;
    duration: string;
  }>;
}

export interface PhotographyShot {
  id: string;
  description: string;
  event: string;
  priority: "must" | "preferred" | "bonus";
}

export interface PhotographyContent {
  kind: "photography";
  shot_list: PhotographyShot[];
  must_capture: string[];
  family_portraits: Array<{ grouping: string; members: string }>;
  coverage_hours: Array<{ event: string; hours: number }>;
  deliverable_timeline: Array<{
    item: string;
    due_date: string;
  }>;
}

export interface FloralsContent {
  kind: "florals";
  design_direction: string;
  mood_board: string[];
  coverage: Array<{ area: string; event: string; arrangement: string }>;
  color_palette: string[]; // hex codes
  arrangements: Array<{
    type: string;
    count: number;
    notes?: string;
  }>;
  delivery_setup: Array<{ event: string; setup_time: string; teardown: string }>;
}

export interface GenericContent {
  kind: "generic";
  notes: string;
  scope_items: string[];
}

export type VendorWorkspaceContent =
  | CateringContent
  | HMUAContent
  | MehndiContent
  | PhotographyContent
  | FloralsContent
  | GenericContent;

// ── Permissions ─────────────────────────────────────────────────────────────

export type GuestVisibility =
  | "full_contact"
  | "names_and_dietary"
  | "counts_only"
  | "none";

export type VendorListVisibility =
  | "all_vendors"
  | "schedule_only"
  | "none";

export type BudgetVisibility =
  | "their_line_item"
  | "full_budget"
  | "none";

export type RunOfShowVisibility =
  | "their_entries"
  | "their_plus_adjacent"
  | "full_schedule";

export type CommunicationsAccess =
  | "direct_with_couple"
  | "couple_and_planner"
  | "planner_only";

export interface VendorWorkspacePermissions {
  guests: GuestVisibility;
  other_vendors: VendorListVisibility;
  budget: BudgetVisibility;
  run_of_show: RunOfShowVisibility;
  communications: CommunicationsAccess;
}

// ── Invitation ──────────────────────────────────────────────────────────────

export interface VendorWorkspaceInvitation {
  id: string;
  workspace_id: string;
  invited_email: string;
  personal_note: string;
  sent_at: string | null;
  claimed_at: string | null;
  revoked_at: string | null;
  status: WorkspaceInviteStatus;
}

// ── Activity log ────────────────────────────────────────────────────────────

export type ActivityKind =
  | "logged_in"
  | "viewed"
  | "updated"
  | "message_sent"
  | "file_uploaded"
  | "confirmed_item";

export interface VendorWorkspaceActivity {
  id: string;
  workspace_id: string;
  at: string; // ISO
  actor: "vendor" | "couple" | "planner";
  kind: ActivityKind;
  summary: string; // human-readable one-liner
  detail?: string;
}

// ── Main workspace record ───────────────────────────────────────────────────

export interface VendorWorkspace {
  id: string;
  vendor_id: string;
  wedding_id: string;
  discipline: WorkspaceDiscipline;
  created_at: string;
  updated_at: string;
  last_vendor_activity_at: string | null;

  invite_status: WorkspaceInviteStatus;
  content: VendorWorkspaceContent;
  permissions: VendorWorkspacePermissions;
  invitation: VendorWorkspaceInvitation | null;
  activity: VendorWorkspaceActivity[];
}

// ── Discipline templates ────────────────────────────────────────────────────

export interface DisciplineTemplate {
  discipline: WorkspaceDiscipline;
  label: string;
  description: string;
  default_permissions: VendorWorkspacePermissions;
  default_content: VendorWorkspaceContent;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export const DISCIPLINE_LABEL: Record<WorkspaceDiscipline, string> = {
  catering: "Catering",
  hmua: "HMUA",
  mehndi: "Mehndi",
  photography: "Photography",
  florals: "Florals",
  entertainment: "Entertainment",
  wardrobe: "Wardrobe",
  stationery: "Stationery",
  pandit_ceremony: "Officiant & Ceremony",
};

export const INVITE_STATUS_LABEL: Record<WorkspaceInviteStatus, string> = {
  not_invited: "Not yet invited",
  invited: "Invited, not claimed",
  active: "Active",
  revoked: "Revoked",
};

// Mapping from a vendor's category (directory-level) to its workspace
// discipline. One-to-one for now; kept as a function so a future expansion
// (e.g. hmua splitting into bridal_hmua vs guest_hmua) is localised.
export function disciplineFromCategory(
  category: VendorCategory,
): WorkspaceDiscipline {
  switch (category) {
    case "photography":
      return "photography";
    case "hmua":
      return "hmua";
    case "decor_florals":
      return "florals";
    case "catering":
      return "catering";
    case "entertainment":
      return "entertainment";
    case "wardrobe":
      return "wardrobe";
    case "stationery":
      return "stationery";
    case "pandit_ceremony":
      return "pandit_ceremony";
  }
}

export const DEFAULT_PERMISSIONS: VendorWorkspacePermissions = {
  guests: "counts_only",
  other_vendors: "schedule_only",
  budget: "their_line_item",
  run_of_show: "their_plus_adjacent",
  communications: "couple_and_planner",
};
