// ── Checklist data model ────────────────────────────────────────────────────

export type ItemStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "done"
  | "not_applicable";

export type Priority = "low" | "medium" | "high" | "critical";

export type AssignedTo = "bride" | "groom" | "both" | "family" | "planner";

// ── Collaboration ──────────────────────────────────────────────────────────

export type MemberRole = "Owner" | "Planner" | "Family" | "Vendor" | "Viewer";

export type MemberStatus = "Active" | "Invited";

export type AvatarColorName =
  | "dustyRose"
  | "sage"
  | "terracotta"
  | "slate"
  | "plum"
  | "ochre";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  avatarColor: AvatarColorName;
}

export type DecisionFieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "date"
  | "currency"
  | "file_upload"
  | "vendor_picker"
  | "image_upload"
  | "url";

export type DecisionTemplateName =
  | "generic"
  | "hashtag_picker"
  | "monogram_designer"
  | "color_palette"
  | "mood_board"
  | "vendor_booking"
  | "vendor_comparison"
  | "guest_list_manager"
  | "seating_chart"
  | "budget_allocator"
  | "muhurat_picker"
  | "puja_samagri_tracker"
  | "mandap_designer"
  | "attire_style_guide"
  | "jewelry_planner"
  | "beauty_timeline"
  | "mehndi_workspace"
  | "sangeet_run_of_show"
  | "choreography_planner"
  | "baraat_planner"
  | "ceremony_program_builder"
  | "catering_menu_builder"
  | "bar_program"
  | "lighting_designer"
  | "decor_florals"
  | "photography_shot_list"
  | "transportation_grid"
  | "accommodation_blocks"
  | "stationery_suite"
  | "welcome_bag_builder"
  | "registry_manager"
  | "honeymoon_planner"
  | "vidaai_planner"
  | "reception_planner"
  | "haldi_planner"
  | "gift_tracker"
  | "speech_planner"
  | "music_library"
  | "dress_code_builder"
  | "rehearsal_planner"
  | "day_of_emergency_kit"
  | "thank_you_tracker"
  | "tradition_profile_picker"
  | "family_role_assigner"
  | "tip_envelope_planner"
  | "contract_manager";

// ── Core entities ───────────────────────────────────────────────────────────

export interface Phase {
  id: string;
  title: string;
  description: string;
  order: number;
  icon: string;
  color: string;
}

export interface DecisionField {
  id: string;
  label: string;
  type: DecisionFieldType;
  options?: string[];
  value?: string | string[] | number | null;
  required: boolean;
  helper_text?: string;
}

export type EventDayId =
  | "welcome"
  | "ganesh_puja"
  | "mehndi"
  | "haldi"
  | "sangeet"
  | "wedding"
  | "reception"
  | "post_brunch";

export interface EventDayOffset {
  eventDay: EventDayId;
  hoursBefore: number;
}

export type TaskSource = "template" | "custom";

// ── Workspace linkage (§2a of the photography workspace plan) ───────────────
// Reuses slugs/tabs declared in types/workspace.ts. We import string literals
// here (not the types directly) to avoid a circular dep: types/workspace.ts
// doesn't import from here, and vice versa. The two string-literal unions
// below MUST stay in lockstep with WorkspaceCategorySlug and WorkspaceTab.
export type WorkspaceCategoryTag =
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

// Flat union — kept in lockstep with WorkspaceTab in types/workspace.ts.
// Filtering is always scoped by category_tags first, so shared ids never
// collide across categories.
export type WorkspaceTabTag =
  // legacy / generic
  | "vision"
  | "plan"
  | "shortlist"
  | "timeline"
  | "decisions"
  | "journal"
  // shared across purpose-built categories
  | "shortlist_contract"
  | "day_of"
  | "deliverables"
  // photography / videography
  | "shot_list"
  | "vips"
  | "rituals"
  | "crew"
  | "must_capture"
  | "film_vision"
  | "audio_coverage"
  // catering
  | "tasting"
  | "dietary"
  | "bar"
  | "event_menus"
  | "staffing"
  | "rentals"
  // décor & florals
  | "mandap"
  | "reception_stage"
  | "florals"
  | "lighting"
  | "load_in"
  | "budget"
  // music & entertainment
  | "dj_band"
  | "live_performers"
  | "song_list"
  | "av_tech"
  | "soundscapes"
  | "sangeet_planner"
  | "equipment_tech"
  // guest experiences
  | "guest_discover"
  | "guest_shortlist"
  | "guest_inspiration"
  // hair & makeup
  | "trial_notes"
  | "bride_looks"
  | "bridal_party"
  | "touch_up"
  // venue
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
  | "dream_discover"
  | "venue_shortlist"
  | "spaces_flow"
  | "logistics_rules"
  | "site_visit_notes"
  | "site_visits"
  | "documents"
  // mehndi
  | "design_refs"
  | "bride_mehndi"
  | "guest_queue"
  | "guest_mehndi"
  // transportation
  | "plan_logistics"
  | "baraat"
  | "shuttle_transport"
  // stationery
  | "save_the_dates"
  | "invitation_suite"
  | "event_cards"
  | "day_of_paper"
  | "print_schedule"
  | "suite_builder"
  | "guest_print_matrix"
  | "production_timeline"
  // priest / pandit
  | "ritual_sequence"
  | "mantras"
  | "samagri"
  | "family_roles"
  | "ceremony_script"
  | "ceremony_logistics"
  // wardrobe
  | "fittings"
  | "wardrobe_looks"
  | "bridal_party_attire"
  | "delivery"
  // jewelry
  | "bridal_jewelry"
  | "groom_jewelry"
  | "family_heirlooms"
  | "fittings_coordination"
  // cake & sweets
  | "wedding_cake"
  | "mithai"
  | "dessert_tables"
  | "tasting_approval"
  | "service_plan"
  // gifting
  | "welcome_bags"
  | "trousseau_packaging"
  | "return_favors"
  | "family_exchanges"
  | "thank_you"
  // travel & accommodations
  | "hotel_strategy"
  | "room_blocks"
  | "guest_travel"
  | "welcome_experience"
  | "group_flights"
  | "shuttles"
  | "rate_negotiations"
  | "attrition_cutoffs";

export interface TaskLinkedEntities {
  // Structured vendor refs. Authoritative writes live in useVendorsStore as
  // TaskVendorLink — this field is a denormalized projection used by
  // workspace reads. Seed-time entries here are fine; runtime linking still
  // goes through linkVendorToTask().
  vendor_ids?: string[];
  // EventDayId values ("welcome" | "ganesh_puja" | ... | "post_brunch").
  // No standalone timeline module exists; EventDayId is the canonical anchor.
  event_day_ids?: EventDayId[];
  // Key into the budget_allocator decision fields (e.g. "Photo/Video").
  // Clicking opens the budget popout focused on this row.
  budget_category?: string;
  // Refs into useWorkspaceStore.decisions for cross-linking task ↔ decision.
  workspace_decision_ids?: string[];
  // Optional refs to journal articles that explain this task.
  journal_article_ids?: string[];
}

export interface ChecklistItem {
  id: string;
  phase_id: string;
  title: string;
  description: string;
  status: ItemStatus;
  priority: Priority;
  due_date: string | null;
  assigned_to: AssignedTo;
  module_link: string | null;
  decision_template: DecisionTemplateName;
  decision_fields: DecisionField[];
  dependencies: string[];
  tradition_profile_tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
  assignee_ids?: string[];
  daysBeforeWedding?: number;
  eventDayOffset?: EventDayOffset;

  // Workspace integration — all optional so existing tasks stay valid.
  // - category_tags: which vendor workspace(s) this task belongs to.
  //   A task can belong to multiple (e.g. p5-std-03 is stationery + photography).
  // - workspace_tab_tags: which tab(s) inside each workspace surface it.
  //   Same task can appear in multiple tabs (e.g. "Book photographer" in
  //   both shortlist and decisions).
  // - linked_entities: structured cross-module refs — see TaskLinkedEntities.
  category_tags?: WorkspaceCategoryTag[];
  workspace_tab_tags?: WorkspaceTabTag[];
  linked_entities?: TaskLinkedEntities;

  // Custom-task provenance. Seed items default to "template"; user-added
  // tasks are "custom". The split matters for future template updates:
  // re-running the seed must not overwrite or duplicate user customs.
  // Supabase (when wired): source text not null default 'custom',
  // created_by uuid references auth.users, plus RLS rules allowing the
  // couple + collaborators to insert/update/delete where source = 'custom'
  // and update (but not delete) where source = 'template'.
  source: TaskSource;
  created_by?: string;
  template_modified?: boolean;
  visible_to_ids?: string[];
  attachments?: string[];
  // Optional two-way link to the Journal entry that spawned this task
  // (via the workspace Journal tab's "Create task" enrichment action).
  // Named `source_ref` to avoid clashing with the existing `source` field
  // (template | custom). Renders "From Journal: <title>" on the task.
  source_ref?: import("./journal-entries").SourceRef;
}

// ── Subsection labels (shared by seed + composer) ───────────────────────────
// The section key is the second segment of an item id (e.g. "couple" in
// "p0-couple-01"). groupItemsBySection in the checklist page looks this up.
export interface SubsectionDescriptor {
  key: string;
  label: string;
  phaseId: string;
}
