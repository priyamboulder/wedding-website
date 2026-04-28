// ── Checklist seed data ─────────────────────────────────────────────────────
// Auto-generated from ananya-indian-wedding-checklist.md
// ~400 items across 13 phases (0-12) with decision fields per item.

import type {
  Phase,
  ChecklistItem,
  DecisionField,
  DecisionFieldType,
  DecisionTemplateName,
  Priority,
  AssignedTo,
  EventDayOffset,
  WorkspaceCategoryTag,
  WorkspaceTabTag,
  TaskLinkedEntities,
} from "@/types/checklist";

// ── Helpers ─────────────────────────────────────────────────────────────────

const TS = "2025-01-01T00:00:00.000Z";

function f(
  id: string,
  label: string,
  type: DecisionFieldType,
  opts?: { options?: string[]; required?: boolean; helper?: string },
): DecisionField {
  return {
    id,
    label,
    type,
    ...(opts?.options && { options: opts.options }),
    value: null,
    required: opts?.required ?? false,
    ...(opts?.helper && { helper_text: opts.helper }),
  };
}

// Phase deadline windows: [earliest, latest] in days before wedding.
// Negative values = days after wedding (post-wedding tasks).
type PhaseWindow = readonly [number, number];

const PHASE_WINDOWS: Record<string, PhaseWindow> = {
  "phase-0": [365, 270],
  "phase-1": [300, 180],
  "phase-2": [270, 150],
  "phase-3": [180, 60],
  "phase-4": [210, 90],
  "phase-5": [150, 45],
  "phase-6": [120, 30],
  "phase-7": [90, 14],
  "phase-8": [90, 30],
  "phase-9": [240, 180],
  "phase-10": [30, 7],
  "phase-12": [-1, -30],
};

const EARLY_VERBS = new Set([
  "research", "define", "decide", "discuss", "plan", "design", "set",
  "identify", "agree", "establish", "consult", "receive", "document",
  "draft", "build", "develop", "start", "create", "arrange", "order",
  "book", "secure", "hire", "sign", "select", "choose", "register",
  "open", "shop", "request", "negotiate", "reserve", "allocate",
  "brainstorm", "draw", "outline", "compile", "explore", "set up",
  "schedule", "host", "formal", "align",
]);

const LATE_VERBS = new Set([
  "confirm", "finalize", "finalise", "review", "check", "test",
  "approve", "print", "distribute", "send", "lock", "verify", "ensure",
  "collect", "pay", "tip", "follow", "reconcile", "wrap", "close",
  "preserve", "return", "complete", "track", "remind", "rehearse",
  "trial", "final", "last", "rsvp",
]);

function classifyVerb(title: string): "early" | "mid" | "late" {
  const first = title.trim().split(/\s+/)[0]?.toLowerCase().replace(/[:,]/g, "");
  if (!first) return "mid";
  if (EARLY_VERBS.has(first)) return "early";
  if (LATE_VERBS.has(first)) return "late";
  return "mid";
}

function defaultDaysBeforeWedding(
  phaseId: string,
  title: string,
  index: number,
  bucketTotal: number,
): number | undefined {
  if (phaseId === "phase-11") return undefined;
  const win = PHASE_WINDOWS[phaseId];
  if (!win) return undefined;
  const [early, late] = win;
  const span = early - late;
  const bucket = classifyVerb(title);
  let bucketStart: number, bucketEnd: number;
  if (bucket === "early") {
    bucketStart = early;
    bucketEnd = early - span / 3;
  } else if (bucket === "mid") {
    bucketStart = early - span / 3;
    bucketEnd = early - (2 * span) / 3;
  } else {
    bucketStart = early - (2 * span) / 3;
    bucketEnd = late;
  }
  const t = bucketTotal <= 1 ? 0 : index / (bucketTotal - 1);
  const value = bucketStart - t * (bucketStart - bucketEnd);
  return Math.round(value);
}

function item(
  id: string,
  phaseId: string,
  title: string,
  desc: string,
  opts: {
    template?: DecisionTemplateName;
    priority?: Priority;
    assigned?: AssignedTo;
    module?: string;
    tags?: string[];
    deps?: string[];
    fields?: DecisionField[];
    daysBeforeWedding?: number;
    eventDay?: EventDayOffset;
    // Workspace integration — see TaskLinkedEntities in types/checklist.ts
    categoryTags?: WorkspaceCategoryTag[];
    workspaceTabTags?: WorkspaceTabTag[];
    linkedEntities?: TaskLinkedEntities;
  } = {},
): ChecklistItem {
  return {
    id,
    phase_id: phaseId,
    title,
    description: desc,
    status: "not_started",
    priority: opts.priority ?? "medium",
    due_date: null,
    assigned_to: opts.assigned ?? "both",
    module_link: opts.module ?? null,
    decision_template: opts.template ?? "generic",
    decision_fields: opts.fields ?? [],
    dependencies: opts.deps ?? [],
    tradition_profile_tags: opts.tags ?? ["all"],
    notes: "",
    source: "template",
    created_at: TS,
    updated_at: TS,
    ...(typeof opts.daysBeforeWedding === "number" && {
      daysBeforeWedding: opts.daysBeforeWedding,
    }),
    ...(opts.eventDay && { eventDayOffset: opts.eventDay }),
    ...(opts.categoryTags?.length && { category_tags: opts.categoryTags }),
    ...(opts.workspaceTabTags?.length && {
      workspace_tab_tags: opts.workspaceTabTags,
    }),
    ...(opts.linkedEntities && { linked_entities: opts.linkedEntities }),
  };
}

// ── Category backfill ───────────────────────────────────────────────────────
// Maps subsection keys (the second segment of an item id, e.g. "venue" in
// "p2-venue-07") onto the canonical WorkspaceCategoryTag. Undefined mappings
// = intentionally null (tasks that don't belong to a vendor workspace —
// budget, brand, guest logistics, cross-vendor event-day prep). Applied
// idempotently: never overwrites existing category_tags.
//
// Conservative rule: only tag when the section key unambiguously maps to one
// vendor category. Multi-category items (e.g. "fire ceremony policy" spans
// venue + pandit) are tagged per-item at declaration via categoryTags above.
const SECTION_CATEGORY: Record<string, WorkspaceCategoryTag> = {
  // Phase 0
  date: "pandit_ceremony",
  // Phase 2
  venue: "venue",
  priest: "pandit_ceremony",
  photo: "photography",
  // Phase 3 (attire/jewelry/beauty)
  bwar: "wardrobe",
  gwar: "wardrobe",
  bjew: "wardrobe",
  gjew: "wardrobe",
  fam: "wardrobe",
  beau: "hmua",
  // Phase 4 (experience vendors)
  cater: "catering",
  bar: "catering",
  cake: "catering",
  decor: "decor_florals",
  light: "decor_florals",
  music: "entertainment",
  trans: "transportation",
  // Phase 5 (stationery)
  std: "stationery",
  inv: "stationery",
  dop: "stationery",
  // Phase 7 (ceremony-specific)
  cer: "pandit_ceremony",
  mehndi: "mehndi",
  sang: "entertainment",
  // Phase 11 (event days — only those clearly category-scoped)
  puja: "pandit_ceremony",
};

function backfillCategoryTags(items: ChecklistItem[]): void {
  for (const it of items) {
    if (it.category_tags && it.category_tags.length > 0) continue;
    const parts = it.id.split("-");
    const sectionKey = parts.length >= 2 ? parts[1] : "";
    const category = SECTION_CATEGORY[sectionKey];
    if (category) it.category_tags = [category];
  }
}

// Per-category tab-tag inference. Only applied when a task already has a
// category_tag but no workspace_tab_tags. Keyword rules below map a task's
// title/description onto the most relevant tab in that category's new tab
// layout. Many tasks stay untagged (they still surface on the category
// Overview via the "This week" panel — per-tab tagging is opt-in).
const TAB_RULES: {
  category: WorkspaceCategoryTag;
  tab: WorkspaceTabTag;
  // Match tokens against lowercased title + description.
  match: RegExp;
}[] = [
  // ── Catering ─────────
  { category: "catering", tab: "tasting", match: /tasting|taste|sample/ },
  { category: "catering", tab: "dietary", match: /dietary|allergen|jain|vegan|gluten/ },
  { category: "catering", tab: "bar", match: /\bbar\b|cocktail|beverage|liquor|wine|whisky|mocktail/ },
  { category: "catering", tab: "event_menus", match: /menu|courses?|thali|haldi food|sangeet food|wedding lunch|reception dinner|buffet|station/ },
  { category: "catering", tab: "staffing", match: /server|staff|cook|chef|bartender/ },
  { category: "catering", tab: "rentals", match: /rental|plate|cutlery|linen|chafing|glassware|thali/ },
  // ── Videography ──────
  { category: "videography", tab: "shot_list", match: /shot list|shots? for|drone|highlight|film|footage/ },
  { category: "videography", tab: "must_capture", match: /must capture|key moment|pheras? film|vidaai film/ },
  { category: "videography", tab: "deliverables", match: /deliver|edit|raw|final|teaser|highlight reel/ },
  { category: "videography", tab: "crew", match: /crew|second shooter|operator/ },
  // ── Décor & Florals ─
  { category: "decor_florals", tab: "mandap", match: /mandap|ceremony setup|aisle|canopy/ },
  { category: "decor_florals", tab: "reception_stage", match: /reception stage|stage|sweetheart/ },
  { category: "decor_florals", tab: "florals", match: /floral|flower|mala|bouquet|petal|garland/ },
  { category: "decor_florals", tab: "lighting", match: /light|uplight|candle|chandelier/ },
  { category: "decor_florals", tab: "load_in", match: /load[- ]?in|strike|breakdown/ },
  // ── Music / Entertainment ─
  { category: "entertainment", tab: "dj_band", match: /\bdj\b|\bband\b/ },
  { category: "entertainment", tab: "live_performers", match: /dhol|choreograph|choreo|performer|baraja|classical singer|mc\b/ },
  { category: "entertainment", tab: "song_list", match: /song|playlist|set list|do not play|dedication/ },
  { category: "entertainment", tab: "av_tech", match: /\bav\b|\bpa\b|mic\b|led wall|monitor/ },
  // ── HMUA ───────────
  { category: "hmua", tab: "trial_notes", match: /trial/ },
  { category: "hmua", tab: "bride_looks", match: /bride (look|makeup|hair)|bridal (look|makeup|hair)|bridal styling/ },
  { category: "hmua", tab: "bridal_party", match: /bridesmaid|bridal party|mother of/ },
  { category: "hmua", tab: "touch_up", match: /touch[- ]?up|blot|set spray|kit/ },
  // ── Venue ──────────
  { category: "venue", tab: "floorplans", match: /floorplan|layout|site map/ },
  { category: "venue", tab: "capacity_flow", match: /capacity|headcount|flow|bottleneck/ },
  { category: "venue", tab: "vendor_load_in", match: /load[- ]?in|vendor access|setup window/ },
  { category: "venue", tab: "catering_rules", match: /in[- ]?house cater|corkage|outside cater|bar close/ },
  { category: "venue", tab: "permits", match: /permit|license|insurance|fire marshal|marshal|airspace/ },
  { category: "venue", tab: "accommodations", match: /room block|bridal suite|guest room|accommodation|hotel/ },
  // ── Mehendi ────────
  { category: "mehndi", tab: "design_refs", match: /design|reference|motif|pattern/ },
  { category: "mehndi", tab: "bride_mehndi", match: /bride (application|mehendi|mehndi|henna)|bridal (application|mehendi)/ },
  { category: "mehndi", tab: "guest_queue", match: /guest|queue|family mehendi/ },
  // ── Transportation ─
  { category: "transportation", tab: "plan_logistics", match: /vehicle|car|fleet|sedan|rolls|vintage|plan|logistics/ },
  { category: "transportation", tab: "shuttle_transport", match: /shuttle|bus|coach|airport pickup|pickup|vip|grandparent|elder|bride pickup|family drop/ },
  { category: "transportation", tab: "baraat", match: /baraat|procession/ },
  { category: "transportation", tab: "documents", match: /contract|route map|parking diagram|driver contact sheet/ },
  // ── Stationery ─────
  { category: "stationery", tab: "save_the_dates", match: /save[- ]?the[- ]?date|save the date|std\b/ },
  { category: "stationery", tab: "invitation_suite", match: /main invit|invitation suite|rsvp|invite copy|wording/ },
  { category: "stationery", tab: "event_cards", match: /event card|haldi card|mehendi card|sangeet card|reception card/ },
  { category: "stationery", tab: "day_of_paper", match: /program|menu card|escort|place card|welcome bag|signage|paper goods/ },
  { category: "stationery", tab: "print_schedule", match: /print|ship|mail|delivery/ },
  // ── Pandit / Priest ─
  { category: "pandit_ceremony", tab: "ritual_sequence", match: /ritual|ceremony|pheras|kanyadaan|sindoor|havan|puja/ },
  { category: "pandit_ceremony", tab: "mantras", match: /mantra|shloka|vow|reading/ },
  { category: "pandit_ceremony", tab: "samagri", match: /samagri|puja item|havan samagri|kalash|mangalsutra/ },
  { category: "pandit_ceremony", tab: "family_roles", match: /family role|mamaji|mama ji|tilak|kanyadaan (who|role)/ },
  // ── Wardrobe ───────
  { category: "wardrobe", tab: "fittings", match: /fitting|alteration/ },
  { category: "wardrobe", tab: "wardrobe_looks", match: /(bride|groom) (outfit|look|lehenga|sherwani|saree|sharara|gown)/ },
  { category: "wardrobe", tab: "bridal_party_attire", match: /bridesmaid|mother of|bridal party attire|family outfit|groomsmen/ },
  { category: "wardrobe", tab: "delivery", match: /delivery|arrive|ship date/ },
];

function backfillTabTags(items: ChecklistItem[]): void {
  for (const it of items) {
    if (it.workspace_tab_tags && it.workspace_tab_tags.length > 0) continue;
    const categories = it.category_tags ?? [];
    if (categories.length === 0) continue;
    const haystack = `${it.title} ${it.description}`.toLowerCase();
    const tabs = new Set<WorkspaceTabTag>();
    for (const rule of TAB_RULES) {
      if (!categories.includes(rule.category)) continue;
      if (rule.match.test(haystack)) tabs.add(rule.tab);
    }
    if (tabs.size > 0) it.workspace_tab_tags = Array.from(tabs);
  }
}

function assignAutoDeadlines(items: ChecklistItem[]): void {
  // Pass 1: bucket totals (skip pre-pinned items and event-days phase).
  const totals = new Map<string, number>();
  for (const it of items) {
    if (it.phase_id === "phase-11") continue;
    if (it.daysBeforeWedding !== undefined) continue;
    if (it.eventDayOffset) continue;
    if (!PHASE_WINDOWS[it.phase_id]) continue;
    const k = `${it.phase_id}::${classifyVerb(it.title)}`;
    totals.set(k, (totals.get(k) ?? 0) + 1);
  }
  // Pass 2: assign offsets, spreading within each bucket.
  const counters = new Map<string, number>();
  for (const it of items) {
    if (it.phase_id === "phase-11") continue;
    if (it.daysBeforeWedding !== undefined) continue;
    if (it.eventDayOffset) continue;
    if (!PHASE_WINDOWS[it.phase_id]) continue;
    const k = `${it.phase_id}::${classifyVerb(it.title)}`;
    const idx = counters.get(k) ?? 0;
    counters.set(k, idx + 1);
    const total = totals.get(k) ?? 1;
    const offset = defaultDaysBeforeWedding(it.phase_id, it.title, idx, total);
    if (offset !== undefined) {
      it.daysBeforeWedding = offset;
    }
  }
}

// ── Phases ───────────────────────────────────────────────────────────────────

export const PHASES: Phase[] = [
  { id: "phase-0", title: "Foundation & Vision", description: "Establish your wedding vision, align families, set budget, and secure auspicious dates", order: 0, icon: "🏛️", color: "#8B5CF6" },
  { id: "phase-1", title: "Branding & Identity", description: "Create your wedding brand — hashtag, colors, monogram, and digital presence", order: 1, icon: "🎨", color: "#EC4899" },
  { id: "phase-2", title: "Core Bookings", description: "Lock in venues, accommodation, priest, and photography", order: 2, icon: "📋", color: "#F59E0B" },
  { id: "phase-3", title: "Attire & Styling", description: "Wardrobe, jewelry, and beauty planning for the couple and family", order: 3, icon: "👗", color: "#EF4444" },
  { id: "phase-4", title: "Vendors — Experience Layer", description: "Book catering, decor, entertainment, and transportation vendors", order: 4, icon: "🎪", color: "#10B981" },
  { id: "phase-5", title: "Paper & Stationery", description: "Save-the-dates, invitations, day-of paper, and welcome bags", order: 5, icon: "✉️", color: "#6366F1" },
  { id: "phase-6", title: "Guest Management", description: "Manage your guest list, RSVPs, seating, and guest communication", order: 6, icon: "👥", color: "#0EA5E9" },
  { id: "phase-7", title: "Ceremony Specifics", description: "Plan each ceremony — wedding, mehndi, sangeet, haldi, and reception", order: 7, icon: "🪔", color: "#D97706" },
  { id: "phase-8", title: "Gifts & Favors", description: "Plan gifts for the wedding party, guest favors, and registry", order: 8, icon: "🎁", color: "#A855F7" },
  { id: "phase-9", title: "Legal & Administrative", description: "Marriage license, name changes, honeymoon, and legal paperwork", order: 9, icon: "📄", color: "#64748B" },
  { id: "phase-10", title: "Final Month", description: "Week-by-week countdown — fittings, confirmations, and final preparations", order: 10, icon: "📅", color: "#EF4444" },
  { id: "phase-11", title: "Event Days", description: "Day-of execution for each event in the wedding celebration", order: 11, icon: "🎊", color: "#F59E0B" },
  { id: "phase-12", title: "Post-Wedding", description: "Wrap-up — thank yous, returns, name changes, and honeymoon", order: 12, icon: "✨", color: "#10B981" },
];

// ── Phase 0: Foundation & Vision ────────────────────────────────────────────

const p0: ChecklistItem[] = [
  // Couple Alignment
  item("p0-couple-01", "phase-0", "Discuss overall wedding vision", "Decide between traditional, modern fusion, destination, or intimate wedding styles", { priority: "critical", template: "tradition_profile_picker", fields: [f("p0c01-style", "Wedding Style", "select", { options: ["Traditional", "Modern Fusion", "Destination", "Intimate", "Grand"], required: true }), f("p0c01-scale", "Scale", "select", { options: ["Under 100 guests", "100–300", "300–500", "500–1000", "1000+"] }), f("p0c01-vision", "Vision Statement", "textarea", { helper: "Describe your dream wedding in a few sentences" }), f("p0c01-inspo", "Inspiration Board", "image_upload")] }),
  item("p0-couple-02", "phase-0", "Align on core values", "Agree on scale, formality, religious observance, and cultural fidelity", { priority: "critical", fields: [f("p0c02-formality", "Formality Level", "select", { options: ["Casual", "Semi-Formal", "Formal", "Black Tie"], required: true }), f("p0c02-religion", "Religious Observance", "select", { options: ["Full traditional", "Modified traditional", "Secular with cultural elements", "Secular"] }), f("p0c02-notes", "Alignment Notes", "textarea")] }),
  item("p0-couple-03", "phase-0", "Decide how many events total", "Choose between a 2-day, 3-day, 4-day, or 5-day celebration", { priority: "critical", fields: [f("p0c03-days", "Number of Days", "select", { options: ["2-day", "3-day", "4-day", "5-day"], required: true }), f("p0c03-events", "Event List", "multiselect", { options: ["Mehndi", "Haldi", "Sangeet", "Wedding Ceremony", "Reception", "Welcome Dinner", "Post-Wedding Brunch", "Engagement", "Roka", "Ganesh Puja"] })] }),
  item("p0-couple-04", "phase-0", "Agree on tradition lead per ceremony", "Decide which side's traditions lead for each ceremony if interfaith or inter-regional", { priority: "high", tags: ["interfaith", "inter-regional"], fields: [f("p0c04-lead", "Lead Tradition", "textarea", { helper: "For each ceremony, note which family's traditions will lead" }), f("p0c04-blend", "Blending Approach", "select", { options: ["One side leads all", "Alternate by event", "Blend each ceremony", "Separate ceremonies"] })] }),
  item("p0-couple-05", "phase-0", "Decide on tradition profile", "Select your cultural tradition: North Indian Hindu, Punjabi Sikh, Gujarati, Marwari, Tamil Brahmin, Bengali, etc.", { priority: "critical", template: "tradition_profile_picker", fields: [f("p0c05-profile", "Primary Tradition", "select", { options: ["North Indian Hindu", "Punjabi Sikh", "Gujarati", "Marwari", "Tamil Brahmin", "Telugu", "Malayali", "Bengali", "Kashmiri", "Sindhi", "Jain", "Muslim", "Christian", "Interfaith", "Other"], required: true }), f("p0c05-secondary", "Secondary Tradition", "select", { options: ["None", "North Indian Hindu", "Punjabi Sikh", "Gujarati", "Marwari", "Tamil Brahmin", "Telugu", "Malayali", "Bengali", "Kashmiri", "Sindhi", "Jain", "Muslim", "Christian", "Other"] }), f("p0c05-notes", "Cultural Notes", "textarea")] }),
  item("p0-couple-06", "phase-0", "Define non-negotiables list", "Each partner lists their must-haves and deal-breakers", { priority: "high", fields: [f("p0c06-bride", "Bride's Non-Negotiables", "textarea", { required: true }), f("p0c06-groom", "Groom's Non-Negotiables", "textarea", { required: true }), f("p0c06-shared", "Shared Priorities", "textarea")] }),
  item("p0-couple-07", "phase-0", "Decide on wedding planner", "Choose between full wedding planner, day-of coordinator, or self-manage", { priority: "high", template: "vendor_booking", fields: [f("p0c07-type", "Planning Approach", "select", { options: ["Full Wedding Planner", "Day-of Coordinator", "Month-of Coordinator", "Self-Manage"], required: true }), f("p0c07-budget", "Planner Budget", "currency"), f("p0c07-vendor", "Planner/Coordinator", "vendor_picker")] }),

  // Family Coordination
  item("p0-family-01", "phase-0", "Formal introduction between families", "Arrange the first formal meeting between both families if not already done", { priority: "high", assigned: "family", fields: [f("p0f01-date", "Meeting Date", "date"), f("p0f01-location", "Location", "text"), f("p0f01-notes", "Meeting Notes", "textarea")] }),
  item("p0-family-02", "phase-0", "Roka ceremony", "Plan and execute the roka/engagement ceremony if applicable", { priority: "high", assigned: "family", tags: ["north-indian", "punjabi"], fields: [f("p0f02-date", "Roka Date", "date"), f("p0f02-venue", "Venue", "text"), f("p0f02-gifts", "Gift List", "textarea"), f("p0f02-budget", "Budget", "currency")] }),
  item("p0-family-03", "phase-0", "Align both sets of parents on overall plan", "Hold a family meeting to discuss and agree on the overall wedding plan", { priority: "critical", assigned: "family", fields: [f("p0f03-date", "Meeting Date", "date"), f("p0f03-notes", "Decisions Made", "textarea"), f("p0f03-followup", "Follow-up Items", "textarea")] }),
  item("p0-family-04", "phase-0", "Identify key decision-makers on each side", "Document who has final say on various aspects from each family", { priority: "high", assigned: "family", template: "family_role_assigner", fields: [f("p0f04-bride-side", "Bride's Family Decision-Makers", "textarea"), f("p0f04-groom-side", "Groom's Family Decision-Makers", "textarea"), f("p0f04-domains", "Decision Domains", "textarea", { helper: "Who decides what: venue, food, guest list, etc." })] }),
  item("p0-family-05", "phase-0", "Establish communication cadence", "Set up a regular communication rhythm — WhatsApp group, weekly calls, etc.", { priority: "medium", assigned: "family", fields: [f("p0f05-channel", "Communication Channel", "select", { options: ["WhatsApp Group", "Weekly Calls", "Monthly Meetings", "Email Thread", "Shared Doc"] }), f("p0f05-frequency", "Frequency", "select", { options: ["Daily", "Weekly", "Bi-weekly", "Monthly"] }), f("p0f05-members", "Key Members", "textarea")] }),
  item("p0-family-06", "phase-0", "Assign family point people", "Designate family members for specific domains — the catering uncle, logistics cousin, etc.", { priority: "medium", assigned: "family", template: "family_role_assigner", fields: [f("p0f06-roles", "Role Assignments", "textarea", { helper: "List each role and the family member assigned", required: true }), f("p0f06-contact", "Contact Sheet", "textarea")] }),
  item("p0-family-07", "phase-0", "Discuss financial contribution structure", "Agree on how costs will be split between families and the couple", { priority: "critical", assigned: "family", template: "budget_allocator", module: "/budget", fields: [f("p0f07-structure", "Split Structure", "select", { options: ["Traditional (bride's family hosts)", "50/50", "Per-event split", "Custom"], required: true }), f("p0f07-details", "Contribution Details", "textarea"), f("p0f07-total", "Total Combined Budget", "currency")] }),
  item("p0-family-08", "phase-0", "Document family traditions to honor", "Record any specific family customs, rituals, or expectations that must be included", { priority: "high", assigned: "family", fields: [f("p0f08-bride-traditions", "Bride's Family Traditions", "textarea"), f("p0f08-groom-traditions", "Groom's Family Traditions", "textarea"), f("p0f08-must-include", "Must-Include Rituals", "multiselect", { options: ["Roka", "Sagai", "Chunni Ceremony", "Tilak", "Haldi", "Mehndi", "Sangeet", "Baraat", "Milni", "Vidaai", "Reception", "Griha Pravesh"] })] }),

  // Budget Architecture
  item("p0-budget-01", "phase-0", "Set total budget ceiling", "Agree on the absolute maximum amount to spend across all events", { priority: "critical", template: "budget_allocator", module: "/budget", fields: [f("p0b01-total", "Total Budget", "currency", { required: true }), f("p0b01-currency", "Currency", "select", { options: ["INR", "USD", "GBP", "CAD", "AUD", "SGD"] }), f("p0b01-notes", "Budget Notes", "textarea")] }),
  item("p0-budget-02", "phase-0", "Allocate budget by event", "Divide budget across events: Wedding ~40%, Reception ~20%, Sangeet ~15%, Mehndi ~10%, Haldi ~5%, Other ~10%", { priority: "critical", template: "budget_allocator", module: "/budget", deps: ["p0-budget-01"], fields: [f("p0b02-wedding", "Wedding %", "text"), f("p0b02-reception", "Reception %", "text"), f("p0b02-sangeet", "Sangeet %", "text"), f("p0b02-mehndi", "Mehndi %", "text"), f("p0b02-other", "Other Events %", "text")] }),
  item("p0-budget-03", "phase-0", "Allocate budget by category", "Split by category: venue, catering, decor, attire, jewelry, photo/video, music, transport, stationery, gifts, misc", { priority: "critical", template: "budget_allocator", module: "/budget", deps: ["p0-budget-01"], fields: [f("p0b03-breakdown", "Category Breakdown", "textarea", { required: true, helper: "List each category and its allocated percentage or amount" })] }),
  item("p0-budget-04", "phase-0", "Build 10–15% contingency buffer", "Reserve a contingency fund for unexpected expenses", { priority: "high", module: "/budget", fields: [f("p0b04-percent", "Contingency %", "select", { options: ["10%", "12%", "15%", "20%"] }), f("p0b04-amount", "Contingency Amount", "currency")] }),
  item("p0-budget-05", "phase-0", "Decide payment responsibility by line item", "Determine which family pays for each line item", { priority: "high", assigned: "family", template: "budget_allocator", module: "/budget", fields: [f("p0b05-split", "Payment Responsibility Matrix", "textarea", { required: true, helper: "For each major expense, note: bride's family, groom's family, couple, or split" })] }),
  item("p0-budget-06", "phase-0", "Set up shared budget tracker", "Create a shared spreadsheet or tool to track all wedding expenses", { priority: "high", module: "/budget", fields: [f("p0b06-tool", "Tracking Tool", "select", { options: ["Google Sheets", "Excel", "Ananya Budget Module", "Splitwise", "Custom App"] }), f("p0b06-link", "Tracker Link", "url")] }),
  item("p0-budget-07", "phase-0", "Open dedicated wedding bank account", "Set up a separate account or credit card for wedding expenses and reward points", { priority: "low", module: "/budget", fields: [f("p0b07-bank", "Bank Name", "text"), f("p0b07-type", "Account Type", "select", { options: ["Joint Savings", "Credit Card", "Both"] }), f("p0b07-number", "Account Reference", "text")] }),

  // Date & Muhurat
  item("p0-date-01", "phase-0", "Consult family priest with birth details", "Share both partners' janam kundli (birth charts) with the family panditji", { priority: "critical", template: "muhurat_picker", module: "/timeline", fields: [f("p0d01-priest", "Priest/Panditji Name", "text", { required: true }), f("p0d01-contact", "Priest Contact", "text"), f("p0d01-date", "Consultation Date", "date")] }),
  item("p0-date-02", "phase-0", "Receive list of auspicious dates", "Get the muhurat dates from the priest based on birth charts", { priority: "critical", template: "muhurat_picker", module: "/timeline", deps: ["p0-date-01"], fields: [f("p0d02-dates", "Auspicious Dates", "textarea", { required: true, helper: "List all muhurat dates provided by the priest" }), f("p0d02-preferred", "Top 3 Preferred Dates", "textarea")] }),
  item("p0-date-03", "phase-0", "Cross-check dates against venue availability", "Verify your preferred muhurat dates work for your venue shortlist", { priority: "critical", module: "/timeline", deps: ["p0-date-02"], fields: [f("p0d03-available", "Available Dates", "textarea"), f("p0d03-notes", "Venue Availability Notes", "textarea")] }),
  item("p0-date-04", "phase-0", "Cross-check against key guest availability", "Ensure grandparents, close family, and VIPs can attend on chosen dates", { priority: "high", module: "/timeline", deps: ["p0-date-02"], fields: [f("p0d04-vips", "Key Guests to Check", "textarea"), f("p0d04-conflicts", "Known Conflicts", "textarea")] }),
  item("p0-date-05", "phase-0", "Confirm final dates for every event", "Lock in the confirmed dates for all events in the wedding celebration", { priority: "critical", module: "/timeline", deps: ["p0-date-03", "p0-date-04"], fields: [f("p0d05-dates", "Final Event Dates", "textarea", { required: true, helper: "List each event and its confirmed date" })] }),
  item("p0-date-06", "phase-0", "Note religious fasting days to avoid", "Check for Shraddh, Chaturmas, Kharmas, and other inauspicious periods", { priority: "high", module: "/timeline", tags: ["hindu"], fields: [f("p0d06-avoid", "Dates/Periods to Avoid", "textarea"), f("p0d06-reason", "Reasons", "textarea")] }),
  item("p0-date-07", "phase-0", "Document exact muhurat times for ceremony", "Record the precise auspicious times for pheras, kanyadaan, and other rituals", { priority: "critical", template: "muhurat_picker", module: "/timeline", deps: ["p0-date-05"], fields: [f("p0d07-pheras", "Pheras Muhurat Time", "text"), f("p0d07-kanyadaan", "Kanyadaan Time", "text"), f("p0d07-other", "Other Ritual Times", "textarea")] }),

  // Contingency Planning
  item("p0-plan-01", "phase-0", "Create Plan B for outdoor events", "Design a rain/weather backup plan for any outdoor ceremony or event at booking time", { priority: "high", fields: [f("p0p01-events", "Outdoor Events", "multiselect", { options: ["Mehndi", "Haldi", "Sangeet", "Wedding Ceremony", "Reception", "Welcome Dinner", "Baraat"] }), f("p0p01-backup", "Backup Venue/Setup", "textarea", { required: true, helper: "Tent, indoor hall, or alternate venue" }), f("p0p01-trigger", "Decision Trigger", "textarea", { helper: "Weather threshold or deadline to activate Plan B" })] }),
];

// ── Phase 1: Branding & Identity ────────────────────────────────────────────

const p1: ChecklistItem[] = [
  // Wedding Brand Development
  item("p1-brand-01", "phase-1", "Choose wedding hashtag", "Brainstorm 10+ options and test for uniqueness on Instagram", { priority: "high", template: "hashtag_picker", fields: [f("p1b01-options", "Hashtag Options", "textarea", { required: true, helper: "List 10+ brainstormed hashtags" }), f("p1b01-final", "Final Hashtag", "text"), f("p1b01-available", "Availability Confirmed", "select", { options: ["Yes", "No", "Partially"] })] }),
  item("p1-brand-02", "phase-1", "Check hashtag availability across platforms", "Verify hashtag uniqueness on Instagram, TikTok, and Facebook", { priority: "medium", template: "hashtag_picker", deps: ["p1-brand-01"], fields: [f("p1b02-ig", "Instagram Available", "select", { options: ["Yes", "No"] }), f("p1b02-tiktok", "TikTok Available", "select", { options: ["Yes", "No"] }), f("p1b02-fb", "Facebook Available", "select", { options: ["Yes", "No"] })] }),
  item("p1-brand-03", "phase-1", "Create secondary hashtags per event", "Create event-specific hashtags like #PoojaAndRajSangeet, #PoojaAndRajMehndi", { priority: "low", template: "hashtag_picker", deps: ["p1-brand-01"], fields: [f("p1b03-sangeet", "Sangeet Hashtag", "text"), f("p1b03-mehndi", "Mehndi Hashtag", "text"), f("p1b03-wedding", "Wedding Hashtag", "text"), f("p1b03-reception", "Reception Hashtag", "text")] }),
  item("p1-brand-04", "phase-1", "Choose wedding monogram/logo", "Design a monogram or logo using initials, motifs, or mandala patterns", { priority: "high", template: "monogram_designer", fields: [f("p1b04-style", "Monogram Style", "select", { options: ["Initials", "Motif", "Mandala", "Crest", "Custom Illustration"], required: true }), f("p1b04-designer", "Designer", "vendor_picker"), f("p1b04-files", "Monogram Files", "file_upload")] }),
  item("p1-brand-05", "phase-1", "Pick primary color palette", "Select 3–5 colors that will carry across all events", { priority: "high", template: "color_palette", fields: [f("p1b05-colors", "Primary Colors (hex codes)", "textarea", { required: true }), f("p1b05-inspo", "Color Inspiration", "image_upload")] }),
  item("p1-brand-06", "phase-1", "Pick secondary/accent palette", "Choose complementary accent colors", { priority: "medium", template: "color_palette", deps: ["p1-brand-05"], fields: [f("p1b06-accents", "Accent Colors (hex codes)", "textarea"), f("p1b06-usage", "Usage Guide", "textarea")] }),
  item("p1-brand-07", "phase-1", "Choose typography system", "Select display font and body font for all wedding materials", { priority: "medium", fields: [f("p1b07-display", "Display Font", "text"), f("p1b07-body", "Body Font", "text"), f("p1b07-sample", "Typography Sample", "image_upload")] }),
  item("p1-brand-08", "phase-1", "Develop visual motif library", "Build a collection of visual motifs: peacock, lotus, elephant, paisley, florals, etc.", { priority: "medium", template: "mood_board", fields: [f("p1b08-motifs", "Selected Motifs", "multiselect", { options: ["Peacock", "Lotus", "Elephant", "Paisley", "Florals", "Mandala", "Diya", "Marigold", "Om", "Kalash", "Rangoli"] }), f("p1b08-board", "Motif Board", "image_upload")] }),
  item("p1-brand-09", "phase-1", "Create brand guidelines doc", "Compile colors, fonts, motifs, and voice into a single reference document for vendors", { priority: "medium", deps: ["p1-brand-04", "p1-brand-05", "p1-brand-07"], fields: [f("p1b09-doc", "Guidelines Document", "file_upload"), f("p1b09-link", "Shared Link", "url")] }),
  item("p1-brand-10", "phase-1", "Decide per-event color themes", "Assign specific color palettes to each event (e.g. Mehndi: mustard/coral, Sangeet: emerald/gold)", { priority: "medium", template: "color_palette", deps: ["p1-brand-05"], fields: [f("p1b10-mehndi", "Mehndi Colors", "text"), f("p1b10-sangeet", "Sangeet Colors", "text"), f("p1b10-wedding", "Wedding Colors", "text"), f("p1b10-reception", "Reception Colors", "text"), f("p1b10-haldi", "Haldi Colors", "text")] }),
  item("p1-brand-11", "phase-1", "Define wedding voice", "Set the tone for all written communication: formal, warm, or playful", { priority: "low", fields: [f("p1b11-voice", "Tone", "select", { options: ["Formal & Elegant", "Warm & Inviting", "Playful & Fun", "Modern & Minimal", "Traditional & Reverent"] }), f("p1b11-samples", "Sample Copy", "textarea")] }),

  // Digital Presence
  item("p1-digital-01", "phase-1", "Register wedding website domain", "Purchase a custom domain for the wedding website", { priority: "high", fields: [f("p1d01-domain", "Domain Name", "text", { required: true }), f("p1d01-registrar", "Registrar", "text"), f("p1d01-cost", "Cost", "currency")] }),
  item("p1-digital-02", "phase-1", "Choose wedding website platform", "Select from custom build, Zola, The Knot, Joy, WedMeGood, etc.", { priority: "high", fields: [f("p1d02-platform", "Platform", "select", { options: ["Custom Build", "Zola", "The Knot", "Joy", "WedMeGood", "WithJoy", "Squarespace", "Other"], required: true }), f("p1d02-cost", "Annual Cost", "currency")] }),
  item("p1-digital-03", "phase-1", "Draft 'Our Story' narrative", "Write the couple's love story for the website", { priority: "medium", fields: [f("p1d03-draft", "Story Draft", "textarea", { required: true }), f("p1d03-photos", "Story Photos", "image_upload")] }),
  item("p1-digital-04", "phase-1", "Write how-we-met timeline", "Create a visual timeline of the relationship milestones", { priority: "low", fields: [f("p1d04-timeline", "Timeline Events", "textarea"), f("p1d04-photos", "Milestone Photos", "image_upload")] }),
  item("p1-digital-05", "phase-1", "Plan photoshoot for website hero imagery", "Organize a couples photoshoot for the website hero section", { priority: "medium", template: "photography_shot_list", categoryTags: ["photography"], workspaceTabTags: ["vision", "plan"], linkedEntities: { budget_category: "Photo/Video" }, fields: [f("p1d05-photographer", "Photographer", "vendor_picker"), f("p1d05-date", "Shoot Date", "date"), f("p1d05-location", "Location", "text"), f("p1d05-budget", "Budget", "currency")] }),
  item("p1-digital-06", "phase-1", "Create FAQ section", "Write answers for dress code, kids policy, alcohol, parking, etc.", { priority: "medium", fields: [f("p1d06-faqs", "FAQ Content", "textarea", { required: true })] }),
  item("p1-digital-07", "phase-1", "Build event schedule page", "Create a page listing all events with dates, times, and locations", { priority: "high", module: "/timeline", fields: [f("p1d07-content", "Schedule Content", "textarea")] }),
  item("p1-digital-08", "phase-1", "Build travel & accommodation page", "Add hotel info, travel tips, and directions for guests", { priority: "high", fields: [f("p1d08-content", "Travel Info", "textarea")] }),
  item("p1-digital-09", "phase-1", "Build registry links page", "Add links to gift registries on the wedding website", { priority: "medium", template: "registry_manager", fields: [f("p1d09-links", "Registry URLs", "textarea")] }),
  item("p1-digital-10", "phase-1", "Set up RSVP system", "Configure per-event, per-guest RSVP with meal preferences", { priority: "high", module: "/guests", fields: [f("p1d10-system", "RSVP System", "select", { options: ["Website Built-in", "Google Forms", "Ananya Guests Module", "Custom"] }), f("p1d10-deadline", "RSVP Deadline", "date")] }),
  item("p1-digital-11", "phase-1", "Build password protection", "Add optional password protection to the wedding website", { priority: "low", fields: [f("p1d11-password", "Password", "text"), f("p1d11-enabled", "Enabled", "select", { options: ["Yes", "No"] })] }),
  item("p1-digital-12", "phase-1", "Plan couple's Instagram or sharing space", "Create a dedicated Instagram account or private photo-sharing space", { priority: "low", fields: [f("p1d12-handle", "Handle/Name", "text"), f("p1d12-platform", "Platform", "select", { options: ["Instagram", "Private Album", "Google Photos", "iCloud Shared Album"] })] }),
  item("p1-digital-13", "phase-1", "Set up shared planning docs", "Create a shared Google Drive or Dropbox for all planning documents", { priority: "medium", fields: [f("p1d13-platform", "Platform", "select", { options: ["Google Drive", "Dropbox", "OneDrive", "Notion"] }), f("p1d13-link", "Shared Folder Link", "url")] }),
  item("p1-digital-14", "phase-1", "Create custom Snapchat/Instagram filter", "Design a geofilter or AR filter for guests to use on the wedding day", { priority: "low", fields: [f("p1d14-platforms", "Platforms", "multiselect", { options: ["Snapchat Geofilter", "Instagram AR Filter", "TikTok Effect"] }), f("p1d14-design", "Filter Design", "image_upload"), f("p1d14-cost", "Cost", "currency"), f("p1d14-venues", "Geofilter Venue Coverage", "textarea")] }),
];

// ── Phase 2: Core Bookings ──────────────────────────────────────────────────

const p2: ChecklistItem[] = [
  // Venue Selection
  item("p2-venue-01", "phase-2", "Define venue requirements per event", "Document capacity, indoor/outdoor, catering flexibility, parking, accommodation proximity for each event", { priority: "critical", module: "/venues", fields: [f("p2v01-capacity", "Min Guest Capacity", "text"), f("p2v01-type", "Indoor/Outdoor", "select", { options: ["Indoor", "Outdoor", "Both", "Flexible"] }), f("p2v01-requirements", "Key Requirements", "textarea", { required: true })] }),
  item("p2-venue-02", "phase-2", "Research venues for wedding ceremony", "Compile a shortlist of venues suitable for the wedding ceremony", { priority: "critical", module: "/venues", template: "vendor_comparison", fields: [f("p2v02-shortlist", "Venue Shortlist", "textarea"), f("p2v02-budget", "Venue Budget", "currency"), f("p2v02-notes", "Research Notes", "textarea")] }),
  item("p2-venue-03", "phase-2", "Research venues for sangeet", "Find venues with good dance floor, AV capabilities, and atmosphere for sangeet", { priority: "high", module: "/venues", template: "vendor_comparison", fields: [f("p2v03-shortlist", "Venue Shortlist", "textarea"), f("p2v03-capacity", "Dance Floor Capacity", "text")] }),
  item("p2-venue-04", "phase-2", "Research venues for mehndi", "Find venues with comfortable seating and intimate atmosphere for mehndi", { priority: "high", module: "/venues", template: "vendor_comparison", fields: [f("p2v04-shortlist", "Venue Shortlist", "textarea"), f("p2v04-type", "Setting", "select", { options: ["Home", "Garden", "Banquet Hall", "Hotel", "Outdoor"] })] }),
  item("p2-venue-05", "phase-2", "Research venues for haldi", "Find venues — often at home or a garden space", { priority: "medium", module: "/venues", fields: [f("p2v05-shortlist", "Venue Shortlist", "textarea"), f("p2v05-outdoor", "Outdoor Space Available", "select", { options: ["Yes", "No"] })] }),
  item("p2-venue-06", "phase-2", "Research venues for reception", "Find reception venues with stage, dining, and dance floor space", { priority: "high", module: "/venues", template: "vendor_comparison", fields: [f("p2v06-shortlist", "Venue Shortlist", "textarea"), f("p2v06-capacity", "Seated Dinner Capacity", "text")] }),
  item("p2-venue-07", "phase-2", "Research venues for welcome dinner", "Find a restaurant or space for the welcome/rehearsal dinner", { priority: "medium", module: "/venues", fields: [f("p2v07-shortlist", "Venue Shortlist", "textarea"), f("p2v07-style", "Style", "select", { options: ["Restaurant", "Hotel", "Private Home", "Garden", "Rooftop"] })] }),
  item("p2-venue-08", "phase-2", "Visit top 3 venues per event in person", "Schedule site visits to finalist venues for each event", { priority: "critical", module: "/venues", fields: [f("p2v08-schedule", "Visit Schedule", "textarea"), f("p2v08-checklist", "Site Visit Checklist", "textarea"), f("p2v08-photos", "Visit Photos", "image_upload")] }),
  item("p2-venue-09", "phase-2", "Check outside catering policy", "Confirm if venues allow outside caterers — critical for authentic Indian food", { priority: "critical", module: "/venues", fields: [f("p2v09-policy", "Outside Catering Allowed", "select", { options: ["Yes", "No", "With Fee", "Preferred Vendors Only"] }), f("p2v09-fee", "Corkage/Kitchen Fee", "currency")] }),
  item("p2-venue-10", "phase-2", "Check fire ceremony policy", "Verify venues allow havan/agni fire for the wedding ceremony", { priority: "critical", module: "/venues", tags: ["hindu"], fields: [f("p2v10-allowed", "Fire Allowed", "select", { options: ["Yes", "No", "Outdoor Only", "With Permit"] }), f("p2v10-requirements", "Fire Safety Requirements", "textarea")] }),
  item("p2-venue-11", "phase-2", "Check noise ordinances and end times", "Confirm noise restrictions and latest allowed event end time", { priority: "high", module: "/venues", fields: [f("p2v11-endtime", "Latest End Time", "text"), f("p2v11-decibel", "Noise Restrictions", "textarea")] }),
  item("p2-venue-12", "phase-2", "Check bridal suite / getting-ready rooms", "Ensure venue has rooms for bridal and groom prep", { priority: "high", module: "/venues", fields: [f("p2v12-bridal", "Bridal Suite Available", "select", { options: ["Yes", "No"] }), f("p2v12-groom", "Groom's Room Available", "select", { options: ["Yes", "No"] })] }),
  item("p2-venue-13", "phase-2", "Confirm parking and valet capacity", "Verify parking spots and valet service for guest count", { priority: "medium", module: "/venues", fields: [f("p2v13-spots", "Parking Spots", "text"), f("p2v13-valet", "Valet Available", "select", { options: ["Yes", "No", "Third-Party"] })] }),
  item("p2-venue-14", "phase-2", "Confirm ADA accessibility", "Ensure venue is accessible for elderly and disabled guests", { priority: "high", module: "/venues", fields: [f("p2v14-accessible", "Wheelchair Accessible", "select", { options: ["Fully", "Partially", "No"] }), f("p2v14-notes", "Accessibility Notes", "textarea")] }),
  item("p2-venue-15", "phase-2", "Review insurance requirements", "Check venue insurance requirements and obtain event liability coverage", { priority: "medium", module: "/venues", template: "contract_manager", fields: [f("p2v15-required", "Insurance Required", "select", { options: ["Yes", "No"] }), f("p2v15-amount", "Coverage Amount", "currency"), f("p2v15-policy", "Policy Upload", "file_upload")] }),
  item("p2-venue-16", "phase-2", "Sign contracts and pay deposits", "Finalize venue contracts and pay required deposits", { priority: "critical", module: "/venues", template: "contract_manager", fields: [f("p2v16-contract", "Contract Upload", "file_upload"), f("p2v16-deposit", "Deposit Amount", "currency"), f("p2v16-due", "Payment Due Date", "date"), f("p2v16-balance", "Balance Due", "currency")] }),
  item("p2-venue-17", "phase-2", "Add all venue contacts to master vendor sheet", "Record contact info for every venue in a central vendor directory", { priority: "medium", module: "/venues", fields: [f("p2v17-contacts", "Venue Contacts", "textarea")] }),

  // Accommodation Planning
  item("p2-accom-01", "phase-2", "Identify primary host hotel", "Select the main hotel for out-of-town guests", { priority: "high", template: "accommodation_blocks", fields: [f("p2a01-hotel", "Hotel Name", "text", { required: true }), f("p2a01-location", "Location/Address", "text"), f("p2a01-rate", "Negotiated Rate", "currency"), f("p2a01-contact", "Hotel Contact", "text")] }),
  item("p2-accom-02", "phase-2", "Identify overflow hotels", "Find additional hotels at multiple price points", { priority: "medium", template: "accommodation_blocks", fields: [f("p2a02-hotels", "Overflow Hotels", "textarea"), f("p2a02-rates", "Rate Ranges", "textarea")] }),
  item("p2-accom-03", "phase-2", "Negotiate room block", "Secure a block of 10+ rooms at a group rate", { priority: "high", template: "accommodation_blocks", deps: ["p2-accom-01"], fields: [f("p2a03-rooms", "Rooms Blocked", "text"), f("p2a03-rate", "Group Rate", "currency"), f("p2a03-cutoff", "Cutoff Date", "date")] }),
  item("p2-accom-04", "phase-2", "Confirm room block cutoff date", "Note the deadline for guests to book at the group rate", { priority: "high", deps: ["p2-accom-03"], fields: [f("p2a04-date", "Cutoff Date", "date", { required: true })] }),
  item("p2-accom-05", "phase-2", "Set up booking link/code for guests", "Create an easy booking link or code guests can use", { priority: "high", deps: ["p2-accom-03"], fields: [f("p2a05-link", "Booking Link", "url"), f("p2a05-code", "Booking Code", "text")] }),
  item("p2-accom-06", "phase-2", "Reserve hospitality suite", "Book a suite for welcome gift distribution", { priority: "medium", template: "accommodation_blocks", fields: [f("p2a06-suite", "Suite Details", "text"), f("p2a06-cost", "Cost", "currency")] }),
  item("p2-accom-07", "phase-2", "Book wedding night suite", "Reserve the bridal suite for the wedding night", { priority: "high", fields: [f("p2a07-suite", "Suite Type", "text"), f("p2a07-hotel", "Hotel", "text"), f("p2a07-cost", "Cost per Night", "currency")] }),
  item("p2-accom-08", "phase-2", "Book rooms for immediate family", "Reserve rooms for parents, siblings, and grandparents", { priority: "high", assigned: "family", template: "accommodation_blocks", fields: [f("p2a08-rooms", "Room Assignments", "textarea"), f("p2a08-total", "Total Cost", "currency")] }),
  item("p2-accom-09", "phase-2", "Reserve getting-ready rooms", "Book day-use rooms for bridal and groom prep on wedding day", { priority: "high", fields: [f("p2a09-bridal", "Bridal Room", "text"), f("p2a09-groom", "Groom Room", "text")] }),
  item("p2-accom-10", "phase-2", "Arrange airport shuttle/transport from hotel", "Coordinate airport pickups and hotel-venue shuttles", { priority: "medium", template: "transportation_grid", module: "/transportation", fields: [f("p2a10-service", "Shuttle Service", "vendor_picker"), f("p2a10-schedule", "Shuttle Schedule", "textarea"), f("p2a10-cost", "Cost", "currency")] }),

  // Priest & Religious Officiant
  item("p2-priest-01", "phase-2", "Book panditji / priest / granthi / kazi", "Secure the religious officiant for the ceremony", { priority: "critical", template: "vendor_booking", fields: [f("p2p01-name", "Priest Name", "text", { required: true }), f("p2p01-contact", "Contact", "text"), f("p2p01-fee", "Fee", "currency"), f("p2p01-tradition", "Tradition", "select", { options: ["Hindu Pandit", "Sikh Granthi", "Muslim Kazi", "Jain Priest", "Multi-faith Officiant"] })] }),
  item("p2-priest-02", "phase-2", "Confirm language preference for ceremony", "Decide on Sanskrit, Hindi, English explanations, or bilingual ceremony", { priority: "high", deps: ["p2-priest-01"], fields: [f("p2p02-primary", "Primary Language", "select", { options: ["Sanskrit", "Hindi", "English", "Gujarati", "Tamil", "Telugu", "Bengali", "Punjabi"] }), f("p2p02-translation", "Translation Language", "select", { options: ["None", "English", "Hindi"] })] }),
  item("p2-priest-03", "phase-2", "Request puja samagri list", "Get the complete list of ceremony items needed from the priest", { priority: "high", template: "puja_samagri_tracker", deps: ["p2-priest-01"], fields: [f("p2p03-list", "Samagri List", "textarea", { required: true }), f("p2p03-source", "Where to Source", "textarea")] }),
  item("p2-priest-04", "phase-2", "Discuss ceremony duration and options", "Negotiate ceremony length and possible abbreviations", { priority: "medium", deps: ["p2-priest-01"], fields: [f("p2p04-duration", "Expected Duration", "select", { options: ["1 hour", "1.5 hours", "2 hours", "2.5 hours", "3+ hours"] }), f("p2p04-abbreviations", "Abbreviation Preferences", "textarea")] }),
  item("p2-priest-05", "phase-2", "Request written ritual explanations", "Get descriptions of each ritual for the ceremony program", { priority: "medium", template: "ceremony_program_builder", deps: ["p2-priest-01"], fields: [f("p2p05-explanations", "Ritual Explanations", "textarea"), f("p2p05-document", "Document Upload", "file_upload")] }),
  item("p2-priest-06", "phase-2", "Confirm priest's attire and expectations", "Discuss what the priest will wear and any requirements", { priority: "low", deps: ["p2-priest-01"], fields: [f("p2p06-attire", "Expected Attire", "textarea"), f("p2p06-requirements", "Special Requirements", "textarea")] }),
  item("p2-priest-07", "phase-2", "Discuss dakshina amount", "Agree on the priest's offering/honorarium", { priority: "medium", deps: ["p2-priest-01"], fields: [f("p2p07-amount", "Dakshina Amount", "currency", { required: true }), f("p2p07-extras", "Additional Gifts", "textarea")] }),
  item("p2-priest-08", "phase-2", "Book secondary priests if needed", "Secure additional priests for multiple ceremonies", { priority: "medium", template: "vendor_booking", fields: [f("p2p08-name", "Secondary Priest", "text"), f("p2p08-ceremony", "For Ceremony", "text"), f("p2p08-fee", "Fee", "currency")] }),

  // Photography & Videography
  item("p2-photo-01", "phase-2", "Research photographers with Indian wedding experience", "Find photographers who specialize in multi-day Indian weddings", { priority: "critical", template: "vendor_comparison", categoryTags: ["photography"], workspaceTabTags: ["shortlist"], linkedEntities: { budget_category: "Photo/Video" }, fields: [f("p2ph01-shortlist", "Photographer Shortlist", "textarea"), f("p2ph01-budget", "Photography Budget", "currency"), f("p2ph01-portfolio", "Portfolio Links", "textarea")] }),
  item("p2-photo-02", "phase-2", "Review full weddings, not just highlights", "Ask to see complete wedding galleries to assess consistency", { priority: "high", deps: ["p2-photo-01"], categoryTags: ["photography"], workspaceTabTags: ["shortlist"], fields: [f("p2ph02-reviewed", "Portfolios Reviewed", "textarea"), f("p2ph02-notes", "Review Notes", "textarea")] }),
  item("p2-photo-03", "phase-2", "Confirm number of shooters per event", "Determine how many photographers/videographers needed for each event", { priority: "high", categoryTags: ["photography", "videography"], workspaceTabTags: ["plan", "decisions"], linkedEntities: { event_day_ids: ["mehndi", "haldi", "sangeet", "wedding", "reception"] }, fields: [f("p2ph03-shooters", "Shooters Per Event", "textarea", { helper: "List each event and number of photographers/videographers" })] }),
  item("p2-photo-04", "phase-2", "Book photographer", "Sign contract with your chosen photographer", { priority: "critical", template: "vendor_booking", categoryTags: ["photography"], workspaceTabTags: ["shortlist", "decisions"], linkedEntities: { budget_category: "Photo/Video" }, fields: [f("p2ph04-vendor", "Photographer", "vendor_picker", { required: true }), f("p2ph04-package", "Package", "text"), f("p2ph04-cost", "Total Cost", "currency"), f("p2ph04-contract", "Contract", "file_upload")] }),
  item("p2-photo-05", "phase-2", "Book videographer", "Sign contract with videographer (often a separate vendor)", { priority: "high", template: "vendor_booking", categoryTags: ["photography", "videography"], workspaceTabTags: ["shortlist", "decisions"], linkedEntities: { budget_category: "Photo/Video" }, fields: [f("p2ph05-vendor", "Videographer", "vendor_picker"), f("p2ph05-package", "Package", "text"), f("p2ph05-cost", "Total Cost", "currency"), f("p2ph05-contract", "Contract", "file_upload")] }),
  item("p2-photo-06", "phase-2", "Book cinematographer for highlight reel", "Hire a cinematographer for teaser/highlight reel if desired", { priority: "medium", template: "vendor_booking", categoryTags: ["photography", "videography"], workspaceTabTags: ["shortlist", "decisions"], linkedEntities: { budget_category: "Photo/Video" }, fields: [f("p2ph06-vendor", "Cinematographer", "vendor_picker"), f("p2ph06-cost", "Cost", "currency"), f("p2ph06-deliverables", "Deliverables", "textarea")] }),
  item("p2-photo-07", "phase-2", "Discuss drone footage", "Decide whether to include aerial drone footage and confirm legality", { priority: "low", categoryTags: ["photography", "videography"], workspaceTabTags: ["plan", "decisions"], fields: [f("p2ph07-include", "Include Drone", "select", { options: ["Yes", "No", "Maybe"] }), f("p2ph07-legal", "Legal to Fly", "select", { options: ["Yes", "No", "Checking"] })] }),
  item("p2-photo-08", "phase-2", "Book same-day-edit vendor", "Hire someone to produce a same-day edit video for sangeet/reception screening", { priority: "medium", template: "vendor_booking", categoryTags: ["photography", "videography"], workspaceTabTags: ["shortlist", "decisions"], linkedEntities: { event_day_ids: ["sangeet", "reception"], budget_category: "Photo/Video" }, fields: [f("p2ph08-vendor", "SDE Vendor", "vendor_picker"), f("p2ph08-event", "Screen At Event", "select", { options: ["Sangeet", "Reception", "Both"] }), f("p2ph08-cost", "Cost", "currency")] }),
  item("p2-photo-09", "phase-2", "Plan pre-wedding photoshoot", "Organize an engagement or pre-wedding photoshoot", { priority: "medium", template: "photography_shot_list", categoryTags: ["photography"], workspaceTabTags: ["vision", "plan"], fields: [f("p2ph09-date", "Shoot Date", "date"), f("p2ph09-location", "Location", "text"), f("p2ph09-outfits", "Number of Outfits", "text"), f("p2ph09-theme", "Theme/Concept", "textarea")] }),
  item("p2-photo-10", "phase-2", "Plan save-the-date photoshoot", "Shoot photos specifically for save-the-date cards", { priority: "medium", template: "photography_shot_list", categoryTags: ["photography", "stationery"], workspaceTabTags: ["vision", "plan"], fields: [f("p2ph10-date", "Shoot Date", "date"), f("p2ph10-concept", "Concept", "textarea")] }),
  item("p2-photo-11", "phase-2", "Discuss photo delivery timeline", "Agree on when you'll receive photos, albums, USB drives, and online galleries", { priority: "medium", categoryTags: ["photography"], workspaceTabTags: ["decisions"], fields: [f("p2ph11-timeline", "Delivery Timeline", "textarea"), f("p2ph11-deliverables", "Deliverables Included", "multiselect", { options: ["Online Gallery", "USB Drive", "Physical Album", "Canvas Prints", "Raw Files"] })] }),
  item("p2-photo-12", "phase-2", "Review contract for raw files ownership", "Ensure you have rights to raw/unedited files if desired", { priority: "medium", template: "contract_manager", categoryTags: ["photography"], workspaceTabTags: ["decisions"], fields: [f("p2ph12-raw", "Raw Files Included", "select", { options: ["Yes", "No", "Extra Fee"] }), f("p2ph12-rights", "Usage Rights", "textarea")] }),
  item("p2-photo-13", "phase-2", "Book photo booth or 360 booth", "Arrange a photo booth or 360-degree booth for sangeet/reception", { priority: "low", template: "vendor_booking", categoryTags: ["photography"], workspaceTabTags: ["shortlist", "plan"], linkedEntities: { event_day_ids: ["sangeet", "reception"], budget_category: "Photo/Video" }, fields: [f("p2ph13-type", "Booth Type", "select", { options: ["Photo Booth", "360 Booth", "GIF Booth", "Mirror Booth"] }), f("p2ph13-vendor", "Vendor", "vendor_picker"), f("p2ph13-cost", "Cost", "currency")] }),
];

// ── Phase 3: Attire & Styling ───────────────────────────────────────────────

const p3: ChecklistItem[] = [
  // Bride's Wardrobe
  item("p3-bwar-01", "phase-3", "Define bridal aesthetic per event", "Set the look and feel for the bride's appearance at each event", { priority: "high", assigned: "bride", template: "mood_board", module: "/outfits", fields: [f("p3bw01-aesthetic", "Overall Aesthetic", "textarea"), f("p3bw01-board", "Mood Board", "image_upload")] }),
  item("p3-bwar-02", "phase-3", "Research bridal designers", "Explore Sabyasachi, Manish Malhotra, Anita Dongre, Tarun Tahiliani, and local designers", { priority: "high", assigned: "bride", module: "/outfits", fields: [f("p3bw02-designers", "Shortlisted Designers", "textarea"), f("p3bw02-budget", "Attire Budget", "currency"), f("p3bw02-links", "Portfolio Links", "textarea")] }),
  item("p3-bwar-03", "phase-3", "Set bridal attire budget", "Allocate budget across all bridal outfits", { priority: "high", assigned: "bride", template: "budget_allocator", module: "/outfits", fields: [f("p3bw03-total", "Total Budget", "currency", { required: true }), f("p3bw03-breakdown", "Per-Outfit Budget", "textarea")] }),
  item("p3-bwar-04", "phase-3", "Choose wedding lehenga", "Select color, fabric, embroidery style, and silhouette for the wedding lehenga", { priority: "critical", assigned: "bride", template: "attire_style_guide", module: "/outfits", fields: [f("p3bw04-color", "Color", "text", { required: true }), f("p3bw04-fabric", "Fabric", "select", { options: ["Raw Silk", "Velvet", "Organza", "Net", "Georgette", "Brocade", "Satin"] }), f("p3bw04-embroidery", "Embroidery Style", "select", { options: ["Zardozi", "Resham", "Gota Patti", "Aari", "Chikankari", "Sequin", "Mirror Work"] }), f("p3bw04-designer", "Designer", "text"), f("p3bw04-cost", "Cost", "currency")] }),
  item("p3-bwar-05", "phase-3", "Order custom lehenga", "Place the order allowing 4–6 months for creation", { priority: "critical", assigned: "bride", module: "/outfits", deps: ["p3-bwar-04"], fields: [f("p3bw05-ordered", "Order Date", "date"), f("p3bw05-expected", "Expected Delivery", "date"), f("p3bw05-deposit", "Deposit Paid", "currency")] }),
  item("p3-bwar-06", "phase-3", "Schedule fittings", "Plan 3–4 fitting sessions for the wedding lehenga", { priority: "high", assigned: "bride", module: "/outfits", deps: ["p3-bwar-05"], fields: [f("p3bw06-fitting1", "Fitting 1 Date", "date"), f("p3bw06-fitting2", "Fitting 2 Date", "date"), f("p3bw06-fitting3", "Fitting 3 Date", "date")] }),
  item("p3-bwar-07", "phase-3", "Choose reception outfit", "Select a gown, saree, or modern lehenga for the reception", { priority: "high", assigned: "bride", template: "attire_style_guide", module: "/outfits", fields: [f("p3bw07-type", "Outfit Type", "select", { options: ["Gown", "Saree", "Modern Lehenga", "Anarkali", "Sharara"] }), f("p3bw07-color", "Color", "text"), f("p3bw07-cost", "Cost", "currency")] }),
  item("p3-bwar-08", "phase-3", "Choose sangeet outfit", "Pick a playful, contemporary outfit for the sangeet", { priority: "high", assigned: "bride", template: "attire_style_guide", module: "/outfits", fields: [f("p3bw08-style", "Style", "text"), f("p3bw08-color", "Color", "text"), f("p3bw08-cost", "Cost", "currency")] }),
  item("p3-bwar-09", "phase-3", "Choose mehndi outfit", "Select a comfortable outfit in yellow/green tones for mehndi", { priority: "medium", assigned: "bride", module: "/outfits", fields: [f("p3bw09-style", "Style", "text"), f("p3bw09-color", "Color", "text"), f("p3bw09-cost", "Cost", "currency")] }),
  item("p3-bwar-10", "phase-3", "Choose haldi outfit", "Pick old or designated-to-stain yellow clothes for haldi", { priority: "medium", assigned: "bride", module: "/outfits", fields: [f("p3bw10-outfit", "Outfit Description", "text"), f("p3bw10-cost", "Cost", "currency")] }),
  item("p3-bwar-11", "phase-3", "Choose welcome dinner outfit", "Select an outfit for the welcome dinner", { priority: "medium", assigned: "bride", module: "/outfits", fields: [] }),
  item("p3-bwar-12", "phase-3", "Choose rehearsal / puja outfit", "Select an outfit for the rehearsal and pre-wedding puja", { priority: "low", assigned: "bride", module: "/outfits", fields: [f("p3bw12-style", "Style", "text"), f("p3bw12-cost", "Cost", "currency")] }),
  item("p3-bwar-13", "phase-3", "Choose post-wedding lunch outfit", "Select an outfit for the day-after brunch", { priority: "low", assigned: "bride", module: "/outfits", fields: [f("p3bw13-style", "Style", "text"), f("p3bw13-cost", "Cost", "currency")] }),
  item("p3-bwar-14", "phase-3", "Arrange backup wedding outfit", "Have a second outfit ready for after the ceremony", { priority: "medium", assigned: "bride", module: "/outfits", fields: [f("p3bw14-outfit", "Backup Outfit", "text"), f("p3bw14-cost", "Cost", "currency")] }),
  item("p3-bwar-15", "phase-3", "Arrange undergarments and shapewear", "Get appropriate undergarments and shapewear for each outfit", { priority: "high", assigned: "bride", module: "/outfits", fields: [f("p3bw15-list", "Items Needed", "textarea"), f("p3bw15-cost", "Cost", "currency")] }),
  item("p3-bwar-16", "phase-3", "Arrange petticoats and blouses", "Get petticoats and blouses tailored for each outfit", { priority: "high", assigned: "bride", module: "/outfits", fields: [f("p3bw16-count", "Number of Petticoats", "text"), f("p3bw16-blouses", "Number of Blouses", "text")] }),
  item("p3-bwar-17", "phase-3", "Coordinate dupattas and veils", "Select coordinating dupattas and veils for each outfit", { priority: "medium", assigned: "bride", module: "/outfits", fields: [f("p3bw17-list", "Dupatta/Veil List", "textarea"), f("p3bw17-cost", "Cost", "currency")] }),

  // Bride's Jewelry
  item("p3-bjew-01", "phase-3", "Decide on jewelry style", "Choose overall jewelry aesthetic: temple, kundan, polki, meenakari, diamond, or contemporary", { priority: "high", assigned: "bride", template: "jewelry_planner", module: "/outfits", fields: [f("p3bj01-style", "Primary Style", "select", { options: ["Temple", "Kundan", "Polki", "Meenakari", "Diamond", "Contemporary", "Mix"], required: true }), f("p3bj01-budget", "Jewelry Budget", "currency")] }),
  item("p3-bjew-02", "phase-3", "Select maang tikka and matha patti", "Choose headpiece jewelry for the wedding", { priority: "high", assigned: "bride", template: "jewelry_planner", module: "/outfits", fields: [f("p3bj02-style", "Style", "text"), f("p3bj02-source", "Source/Jeweler", "text"), f("p3bj02-cost", "Cost", "currency")] }),
  item("p3-bjew-03", "phase-3", "Select nath (nose ring) and chain", "Choose the bridal nose ring and supporting chain", { priority: "high", assigned: "bride", template: "jewelry_planner", module: "/outfits", tags: ["north-indian", "marathi"], fields: [f("p3bj03-style", "Style", "text"), f("p3bj03-cost", "Cost", "currency")] }),
  item("p3-bjew-04", "phase-3", "Select earrings for each event", "Choose earrings that coordinate with each outfit", { priority: "medium", assigned: "bride", template: "jewelry_planner", module: "/outfits", fields: [f("p3bj04-pairs", "Number of Pairs", "text"), f("p3bj04-details", "Earring Details per Event", "textarea"), f("p3bj04-cost", "Total Cost", "currency")] }),
  item("p3-bjew-05", "phase-3", "Select necklace sets for wedding", "Choose short necklace and rani haar (long necklace) for the wedding", { priority: "high", assigned: "bride", template: "jewelry_planner", module: "/outfits", fields: [f("p3bj05-short", "Short Necklace", "text"), f("p3bj05-long", "Rani Haar", "text"), f("p3bj05-cost", "Cost", "currency")] }),
  item("p3-bjew-06", "phase-3", "Select choker if desired", "Choose a choker necklace if part of the look", { priority: "low", assigned: "bride", template: "jewelry_planner", module: "/outfits", fields: [f("p3bj06-style", "Style", "text"), f("p3bj06-cost", "Cost", "currency")] }),
  item("p3-bjew-07", "phase-3", "Arrange bangles and chooda", "Get chooda (Punjabi), glass bangles, gold bangles, and kaleerein as per tradition", { priority: "high", assigned: "bride", template: "jewelry_planner", module: "/outfits", tags: ["punjabi", "north-indian"], fields: [f("p3bj07-type", "Bangle Types", "multiselect", { options: ["Chooda", "Glass", "Gold", "Kaleerein", "Lac", "Stone-set"] }), f("p3bj07-cost", "Cost", "currency")] }),
  item("p3-bjew-08", "phase-3", "Select haath phool / hand harness", "Choose hand jewelry for the wedding", { priority: "medium", assigned: "bride", template: "jewelry_planner", module: "/outfits", fields: [f("p3bj08-style", "Style", "text"), f("p3bj08-cost", "Cost", "currency")] }),
  item("p3-bjew-09", "phase-3", "Arrange rings", "Select engagement and wedding rings", { priority: "critical", template: "jewelry_planner", module: "/outfits", fields: [f("p3bj09-engagement", "Engagement Ring", "text"), f("p3bj09-wedding", "Wedding Band", "text"), f("p3bj09-cost", "Total Cost", "currency")] }),
  item("p3-bjew-10", "phase-3", "Select waist belt (kamarbandh)", "Choose a decorative waist belt for the wedding outfit", { priority: "medium", assigned: "bride", template: "jewelry_planner", module: "/outfits", fields: [f("p3bj10-style", "Style", "text"), f("p3bj10-cost", "Cost", "currency")] }),
  item("p3-bjew-11", "phase-3", "Select anklets and toe rings", "Choose payal (anklets) and bichhiya (toe rings)", { priority: "medium", assigned: "bride", template: "jewelry_planner", module: "/outfits", fields: [f("p3bj11-style", "Style", "text"), f("p3bj11-cost", "Cost", "currency")] }),
  item("p3-bjew-12", "phase-3", "Select armlets (baajuband)", "Choose arm jewelry for the wedding", { priority: "low", assigned: "bride", template: "jewelry_planner", module: "/outfits", fields: [f("p3bj12-style", "Style", "text"), f("p3bj12-cost", "Cost", "currency")] }),
  item("p3-bjew-13", "phase-3", "Arrange jewelry insurance", "Insure valuable jewelry pieces for the wedding events", { priority: "high", assigned: "bride", module: "/outfits", fields: [f("p3bj13-insurer", "Insurance Provider", "text"), f("p3bj13-value", "Insured Value", "currency"), f("p3bj13-policy", "Policy Document", "file_upload")] }),
  item("p3-bjew-14", "phase-3", "Plan safe storage for event days", "Arrange secure storage and transport for jewelry during events", { priority: "high", assigned: "bride", module: "/outfits", fields: [f("p3bj14-plan", "Storage Plan", "textarea"), f("p3bj14-responsible", "Person Responsible", "text")] }),

  // Bride's Beauty
  item("p3-beau-01", "phase-3", "Book makeup artist for each event", "Hire an MUA experienced with Indian bridal makeup", { priority: "critical", assigned: "bride", template: "vendor_booking", module: "/outfits", fields: [f("p3be01-mua", "MUA", "vendor_picker", { required: true }), f("p3be01-events", "Events Booked For", "multiselect", { options: ["Wedding", "Reception", "Sangeet", "Mehndi", "Haldi", "All"] }), f("p3be01-cost", "Total Cost", "currency")] }),
  item("p3-beau-02", "phase-3", "Makeup trial with MUA", "Schedule and complete a trial makeup session", { priority: "high", assigned: "bride", template: "beauty_timeline", module: "/outfits", deps: ["p3-beau-01"], categoryTags: ["hmua", "photography"], workspaceTabTags: ["vision"], fields: [f("p3be02-date", "Trial Date", "date"), f("p3be02-photos", "Trial Photos", "image_upload"), f("p3be02-notes", "Feedback Notes", "textarea")] }),
  item("p3-beau-03", "phase-3", "Book hair stylist", "Hire a hair stylist for the wedding events", { priority: "high", assigned: "bride", template: "vendor_booking", module: "/outfits", fields: [f("p3be03-stylist", "Stylist", "vendor_picker"), f("p3be03-cost", "Cost", "currency")] }),
  item("p3-beau-04", "phase-3", "Hair trial with stylist", "Test hairstyles with the actual headpieces and dupatta", { priority: "high", assigned: "bride", template: "beauty_timeline", module: "/outfits", deps: ["p3-beau-03"], categoryTags: ["hmua", "photography"], workspaceTabTags: ["vision"], fields: [f("p3be04-date", "Trial Date", "date"), f("p3be04-photos", "Trial Photos", "image_upload"), f("p3be04-notes", "Feedback", "textarea")] }),
  item("p3-beau-05", "phase-3", "Decide on hairstyles per event", "Choose hairstyle for each event: updo, braid, open, half-up", { priority: "medium", assigned: "bride", template: "beauty_timeline", module: "/outfits", fields: [f("p3be05-styles", "Hairstyle per Event", "textarea"), f("p3be05-inspo", "Inspiration Photos", "image_upload")] }),
  item("p3-beau-06", "phase-3", "Book mehndi artist for bride", "Book a specialist for the bride's intricate hands and feet mehndi", { priority: "critical", assigned: "bride", template: "mehndi_workspace", module: "/mehndi", fields: [f("p3be06-artist", "Mehndi Artist", "vendor_picker", { required: true }), f("p3be06-design", "Design Style", "select", { options: ["Rajasthani", "Arabic", "Indo-Arabic", "Modern Minimal", "Traditional Full Coverage"] }), f("p3be06-cost", "Cost", "currency")] }),
  item("p3-beau-06b", "phase-3", "Test trial with mehndi artist", "Do a small test application to check color stain quality, design skill, and allergic reaction", { priority: "high", assigned: "bride", template: "mehndi_workspace", module: "/mehndi", deps: ["p3-beau-06"], fields: [f("p3be06b-date", "Trial Date", "date"), f("p3be06b-color", "Color After 24hr", "select", { options: ["Very Dark", "Dark", "Medium", "Light"] }), f("p3be06b-reaction", "Any Skin Reaction", "select", { options: ["None", "Mild", "Significant"] }), f("p3be06b-notes", "Notes", "textarea")] }),
  item("p3-beau-07", "phase-3", "Plan skincare regimen", "Start a wedding skincare routine 6+ months out", { priority: "medium", assigned: "bride", template: "beauty_timeline", fields: [f("p3be07-routine", "Skincare Routine", "textarea"), f("p3be07-dermatologist", "Dermatologist", "text"), f("p3be07-products", "Key Products", "textarea")] }),
  item("p3-beau-08", "phase-3", "Plan facials timeline", "Schedule facials — last one 3–5 days before the wedding", { priority: "medium", assigned: "bride", template: "beauty_timeline", fields: [f("p3be08-schedule", "Facial Schedule", "textarea"), f("p3be08-provider", "Aesthetician", "text")] }),
  item("p3-beau-09", "phase-3", "Plan hair treatments", "Schedule oiling, spa treatments, keratin if desired", { priority: "low", assigned: "bride", template: "beauty_timeline", fields: [f("p3be09-treatments", "Treatment Plan", "textarea")] }),
  item("p3-beau-10", "phase-3", "Plan threading / waxing / laser schedule", "Schedule hair removal treatments leading up to the wedding", { priority: "medium", assigned: "bride", template: "beauty_timeline", fields: [f("p3be10-schedule", "Schedule", "textarea"), f("p3be10-provider", "Provider", "text")] }),
  item("p3-beau-11", "phase-3", "Schedule nail appointments", "Book mani/pedi before mehndi application", { priority: "medium", assigned: "bride", template: "beauty_timeline", fields: [f("p3be11-date", "Appointment Date", "date"), f("p3be11-style", "Nail Style", "text")] }),
  item("p3-beau-12", "phase-3", "Teeth whitening if desired", "Schedule teeth whitening treatments", { priority: "low", assigned: "bride", fields: [f("p3be12-provider", "Dentist", "text"), f("p3be12-date", "Appointment Date", "date")] }),
  item("p3-beau-13", "phase-3", "Plan gym / fitness routine", "Establish a fitness routine leading up to the wedding", { priority: "low", assigned: "bride", fields: [f("p3be13-routine", "Workout Plan", "textarea"), f("p3be13-trainer", "Trainer", "text")] }),
  item("p3-beau-14", "phase-3", "Plan meal planning for skin and energy", "Design a nutrition plan for glowing skin and sustained energy", { priority: "low", assigned: "bride", fields: [f("p3be14-plan", "Meal Plan", "textarea"), f("p3be14-nutritionist", "Nutritionist", "text")] }),
  item("p3-beau-15", "phase-3", "Plan mental wellness routine", "Incorporate therapy, meditation, or self-care practices", { priority: "medium", assigned: "bride", fields: [f("p3be15-plan", "Wellness Plan", "textarea"), f("p3be15-therapist", "Therapist/Coach", "text")] }),

  // Groom's Wardrobe
  item("p3-gwar-01", "phase-3", "Choose wedding sherwani", "Select color, embroidery, and silhouette for the wedding sherwani", { priority: "critical", assigned: "groom", template: "attire_style_guide", module: "/outfits", fields: [f("p3gw01-color", "Color", "text", { required: true }), f("p3gw01-embroidery", "Embroidery", "text"), f("p3gw01-designer", "Designer", "text"), f("p3gw01-cost", "Cost", "currency")] }),
  item("p3-gwar-02", "phase-3", "Arrange safa / pagdi with kalgi", "Get a turban with kalgi brooch to match the sherwani", { priority: "high", assigned: "groom", module: "/outfits", tags: ["north-indian", "rajasthani"], fields: [f("p3gw02-style", "Safa Style", "text"), f("p3gw02-color", "Color", "text"), f("p3gw02-cost", "Cost", "currency")] }),
  item("p3-gwar-03", "phase-3", "Arrange mojris / juttis", "Get embroidered traditional shoes", { priority: "high", assigned: "groom", module: "/outfits", fields: [f("p3gw03-style", "Style", "text"), f("p3gw03-size", "Size", "text"), f("p3gw03-cost", "Cost", "currency")] }),
  item("p3-gwar-04", "phase-3", "Arrange dupatta / stole", "Get a coordinating dupatta or stole for the sherwani", { priority: "medium", assigned: "groom", module: "/outfits", fields: [f("p3gw04-style", "Style", "text"), f("p3gw04-cost", "Cost", "currency")] }),
  item("p3-gwar-05", "phase-3", "Arrange sehra if tradition requires", "Get a face veil of flowers if tradition calls for it", { priority: "medium", assigned: "groom", module: "/outfits", tags: ["north-indian", "punjabi"], fields: [f("p3gw05-type", "Sehra Type", "select", { options: ["Floral", "Beaded", "Pearl", "Crystal"] }), f("p3gw05-cost", "Cost", "currency")] }),
  item("p3-gwar-06", "phase-3", "Arrange kirpan / sword if tradition requires", "Procure a ceremonial sword if tradition calls for it", { priority: "low", assigned: "groom", module: "/outfits", tags: ["rajput", "sikh", "marwari"], fields: [f("p3gw06-type", "Type", "text"), f("p3gw06-source", "Source", "text")] }),
  item("p3-gwar-07", "phase-3", "Choose reception suit or indo-western", "Select a suit or indo-western outfit for the reception", { priority: "high", assigned: "groom", template: "attire_style_guide", module: "/outfits", fields: [f("p3gw07-style", "Style", "select", { options: ["Suit", "Indo-Western", "Tuxedo", "Bandhgala"] }), f("p3gw07-color", "Color", "text"), f("p3gw07-cost", "Cost", "currency")] }),
  item("p3-gwar-08", "phase-3", "Choose sangeet outfit", "Select bandhgala, nehru jacket, or playful kurta for sangeet", { priority: "medium", assigned: "groom", module: "/outfits", fields: [f("p3gw08-style", "Style", "text"), f("p3gw08-cost", "Cost", "currency")] }),
  item("p3-gwar-09", "phase-3", "Choose mehndi kurta", "Select a kurta for the mehndi event", { priority: "medium", assigned: "groom", module: "/outfits", fields: [f("p3gw09-style", "Style", "text"), f("p3gw09-cost", "Cost", "currency")] }),
  item("p3-gwar-10", "phase-3", "Choose haldi kurta", "Pick old or designated-to-stain clothes for haldi", { priority: "low", assigned: "groom", module: "/outfits", fields: [f("p3gw10-outfit", "Outfit", "text")] }),
  item("p3-gwar-11", "phase-3", "Choose welcome dinner outfit", "Select an outfit for the welcome dinner", { priority: "medium", assigned: "groom", module: "/outfits", fields: [] }),
  item("p3-gwar-12", "phase-3", "Arrange accessories", "Get socks, pocket squares, cufflinks for each outfit", { priority: "low", assigned: "groom", module: "/outfits", fields: [f("p3gw12-list", "Accessories List", "textarea"), f("p3gw12-cost", "Total Cost", "currency")] }),
  item("p3-gwar-13", "phase-3", "Select wedding day watch", "Choose a special watch for the wedding day", { priority: "low", assigned: "groom", module: "/outfits", fields: [f("p3gw13-watch", "Watch", "text"), f("p3gw13-cost", "Cost", "currency")] }),
  item("p3-gwar-14", "phase-3", "Arrange grooming kit and backup", "Prepare a grooming kit for the wedding day and backups", { priority: "medium", assigned: "groom", fields: [f("p3gw14-contents", "Kit Contents", "textarea")] }),

  // Groom's Jewelry & Accessories
  item("p3-gjew-01", "phase-3", "Select kalgi and brooch for safa", "Choose decorative kalgi pin and brooch for the turban", { priority: "high", assigned: "groom", template: "jewelry_planner", module: "/outfits", fields: [f("p3gj01-style", "Style", "text"), f("p3gj01-cost", "Cost", "currency")] }),
  item("p3-gjew-02", "phase-3", "Select kada (bracelet)", "Choose a traditional bracelet/kada", { priority: "medium", assigned: "groom", module: "/outfits", tags: ["sikh", "punjabi"], fields: [f("p3gj02-material", "Material", "select", { options: ["Gold", "Silver", "Steel", "Platinum"] }), f("p3gj02-cost", "Cost", "currency")] }),
  item("p3-gjew-03", "phase-3", "Select groom's rings", "Choose engagement and wedding rings for the groom", { priority: "critical", assigned: "groom", template: "jewelry_planner", module: "/outfits", fields: [f("p3gj03-style", "Ring Style", "text"), f("p3gj03-material", "Material", "text"), f("p3gj03-cost", "Cost", "currency")] }),
  item("p3-gjew-04", "phase-3", "Select chain if desired", "Choose a neck chain for the wedding", { priority: "low", assigned: "groom", module: "/outfits", fields: [f("p3gj04-style", "Style", "text"), f("p3gj04-cost", "Cost", "currency")] }),
  item("p3-gjew-05", "phase-3", "Select cufflinks and studs", "Choose cufflinks and shirt studs for formal outfits", { priority: "low", assigned: "groom", module: "/outfits", fields: [f("p3gj05-style", "Style", "text"), f("p3gj05-cost", "Cost", "currency")] }),
  item("p3-gjew-06", "phase-3", "Arrange walking stick if tradition includes", "Procure a decorative walking stick if required by tradition", { priority: "low", assigned: "groom", module: "/outfits", tags: ["nawabi", "lucknowi"], fields: [f("p3gj06-style", "Style", "text")] }),

  // Family & Bridal Party Attire
  item("p3-fam-01", "phase-3", "Coordinate parents' outfits", "Plan outfits for both mothers and both fathers across events", { priority: "high", assigned: "family", template: "attire_style_guide", module: "/outfits", fields: [f("p3f01-plan", "Outfit Coordination Plan", "textarea"), f("p3f01-budget", "Budget per Parent", "currency")] }),
  item("p3-fam-02", "phase-3", "Coordinate siblings' outfits per event", "Plan coordinated outfits for siblings across all events", { priority: "medium", assigned: "family", module: "/outfits", fields: [f("p3f02-plan", "Coordination Plan", "textarea"), f("p3f02-budget", "Budget", "currency")] }),
  item("p3-fam-03", "phase-3", "Decide on bridesmaids' outfits", "Choose coordinated or matching outfits for bridesmaids", { priority: "medium", assigned: "bride", template: "attire_style_guide", module: "/outfits", fields: [f("p3f03-style", "Style", "select", { options: ["Matching", "Coordinated Colors", "Mix and Match", "Same Designer Different Style"] }), f("p3f03-color", "Color", "text"), f("p3f03-cost", "Cost per Bridesmaid", "currency")] }),
  item("p3-fam-04", "phase-3", "Decide on groomsmen's outfits", "Choose coordinated outfits for groomsmen", { priority: "medium", assigned: "groom", template: "attire_style_guide", module: "/outfits", fields: [f("p3f04-style", "Style", "text"), f("p3f04-color", "Color", "text"), f("p3f04-cost", "Cost per Groomsman", "currency")] }),
  item("p3-fam-05", "phase-3", "Arrange outfits for grandparents", "Ensure grandparents have comfortable and appropriate outfits", { priority: "medium", assigned: "family", module: "/outfits", fields: [f("p3f05-plan", "Outfit Plan", "textarea")] }),
  item("p3-fam-06", "phase-3", "Coordinate sangeet performance outfits", "Plan outfits for cousins and family members performing at sangeet", { priority: "medium", assigned: "family", module: "/outfits", fields: [f("p3f06-groups", "Performance Groups", "textarea"), f("p3f06-budget", "Budget", "currency")] }),
  item("p3-fam-07", "phase-3", "Order flower girl / ring bearer outfits", "Get coordinated outfits for flower girls and ring bearer", { priority: "medium", assigned: "family", module: "/outfits", fields: [f("p3f07-kids", "Kids & Sizes", "textarea"), f("p3f07-style", "Style", "text"), f("p3f07-cost", "Cost", "currency")] }),

  // Guest Attire Style Guide
  item("p3-style-01", "phase-3", "Define dress code per event", "Set clear dress codes for each wedding event", { priority: "high", template: "dress_code_builder", module: "/outfits", fields: [f("p3s01-codes", "Dress Codes per Event", "textarea", { required: true })] }),
  item("p3-style-02", "phase-3", "Create visual style guide", "Build a Pinterest board or PDF with example outfits", { priority: "medium", template: "dress_code_builder", module: "/outfits", fields: [f("p3s02-guide", "Style Guide Upload", "file_upload"), f("p3s02-link", "Pinterest Board Link", "url")] }),
  item("p3-style-03", "phase-3", "Include color recommendations per event", "Guide guests on which colors to wear for each event", { priority: "medium", template: "dress_code_builder", module: "/outfits", fields: [f("p3s03-colors", "Color Recommendations", "textarea")] }),
  item("p3-style-04", "phase-3", "Include what NOT to wear", "Warn guests about colors to avoid: red (only for bride), black, white at certain events", { priority: "high", template: "dress_code_builder", module: "/outfits", fields: [f("p3s04-avoid", "Colors/Items to Avoid", "textarea", { required: true })] }),
  item("p3-style-05", "phase-3", "Provide guidance for non-Indian guests", "Include where to shop, how to drape a saree, kurta basics", { priority: "medium", template: "dress_code_builder", module: "/outfits", fields: [f("p3s05-guide", "Non-Indian Guest Guide", "textarea"), f("p3s05-shops", "Recommended Shops", "textarea")] }),
  item("p3-style-06", "phase-3", "Include links to recommended shops", "Share online stores and local shops for guest outfits", { priority: "low", module: "/outfits", fields: [f("p3s06-links", "Shop Links", "textarea")] }),
  item("p3-style-07", "phase-3", "Include photos of appropriate looks", "Add example photos for each event's dress code", { priority: "low", module: "/outfits", categoryTags: ["wardrobe", "photography"], workspaceTabTags: ["vision"], fields: [f("p3s07-photos", "Example Photos", "image_upload")] }),
  item("p3-style-08", "phase-3", "Share style guide on wedding website", "Publish the style guide on the wedding website", { priority: "medium", module: "/outfits", deps: ["p3-style-02"], fields: [f("p3s08-published", "Published", "select", { options: ["Yes", "No"] })] }),
  item("p3-style-09", "phase-3", "Address weather and footwear", "Include guidance for outdoor venues, grass, and temple shoe removal", { priority: "medium", module: "/outfits", fields: [f("p3s09-guidance", "Weather & Footwear Notes", "textarea")] }),
  item("p3-style-10", "phase-3", "Address modesty expectations", "Note any modesty requirements for religious venues", { priority: "medium", module: "/outfits", fields: [f("p3s10-modesty", "Modesty Guidelines", "textarea")] }),
  item("p3-style-11", "phase-3", "Offer sari-draping service or tutorials", "Provide sari-draping help or video tutorials for non-Indian guests", { priority: "low", module: "/outfits", fields: [f("p3s11-service", "Draping Service", "select", { options: ["In-Person Service", "Video Tutorial", "Both", "None"] }), f("p3s11-link", "Tutorial Link", "url")] }),
];

// ── Phase 4: Vendors — Experience Layer ─────────────────────────────────────

const p4: ChecklistItem[] = [
  // Catering
  item("p4-cater-01", "phase-4", "Define cuisine style per event", "Choose cuisines: North Indian, South Indian, Indo-Chinese, Continental, fusion", { priority: "critical", template: "catering_menu_builder", fields: [f("p4c01-cuisines", "Cuisines per Event", "textarea", { required: true })] }),
  item("p4-cater-02", "phase-4", "Confirm dietary requirements", "Document vegetarian, Jain, vegan, halal requirements", { priority: "critical", template: "catering_menu_builder", fields: [f("p4c02-requirements", "Dietary Requirements", "multiselect", { options: ["Vegetarian", "Jain (no onion/garlic)", "Vegan", "Halal", "Gluten-Free", "Nut-Free"], required: true })] }),
  item("p4-cater-03", "phase-4", "Research caterers", "Find caterers with Indian wedding experience", { priority: "high", template: "vendor_comparison", fields: [f("p4c03-shortlist", "Caterer Shortlist", "textarea"), f("p4c03-budget", "Catering Budget", "currency")] }),
  item("p4-cater-04", "phase-4", "Schedule tastings", "Arrange tastings with 2–3 finalist caterers", { priority: "high", deps: ["p4-cater-03"], fields: [f("p4c04-dates", "Tasting Dates", "textarea"), f("p4c04-notes", "Tasting Notes", "textarea")] }),
  item("p4-cater-05", "phase-4", "Book caterer", "Sign contract with chosen caterer", { priority: "critical", template: "vendor_booking", deps: ["p4-cater-04"], fields: [f("p4c05-vendor", "Caterer", "vendor_picker", { required: true }), f("p4c05-cost", "Total Cost", "currency"), f("p4c05-contract", "Contract", "file_upload")] }),
  item("p4-cater-06", "phase-4", "Design welcome dinner menu", "Plan the welcome dinner menu", { priority: "medium", template: "catering_menu_builder", fields: [f("p4c06-menu", "Menu", "textarea")] }),
  item("p4-cater-07", "phase-4", "Design mehndi menu", "Plan light menu — often chaat-focused", { priority: "medium", template: "catering_menu_builder", fields: [f("p4c07-menu", "Menu", "textarea")] }),
  item("p4-cater-08", "phase-4", "Design haldi menu", "Plan traditional homestyle menu for haldi", { priority: "medium", template: "catering_menu_builder", fields: [f("p4c08-menu", "Menu", "textarea")] }),
  item("p4-cater-09", "phase-4", "Design sangeet menu", "Plan elaborate, multi-station sangeet menu", { priority: "high", template: "catering_menu_builder", fields: [f("p4c09-menu", "Menu", "textarea"), f("p4c09-stations", "Live Stations", "textarea")] }),
  item("p4-cater-10", "phase-4", "Design wedding lunch/dinner menu", "Plan the main wedding meal", { priority: "critical", template: "catering_menu_builder", fields: [f("p4c10-menu", "Menu", "textarea")] }),
  item("p4-cater-11", "phase-4", "Design reception menu", "Plan reception menu — often different cuisine for variety", { priority: "high", template: "catering_menu_builder", fields: [f("p4c11-menu", "Menu", "textarea")] }),
  item("p4-cater-12", "phase-4", "Design post-wedding brunch menu", "Plan the day-after brunch menu", { priority: "low", template: "catering_menu_builder", fields: [f("p4c12-menu", "Menu", "textarea")] }),
  item("p4-cater-13", "phase-4", "Plan live food stations", "Set up chaat, dosa, pasta, grill, paan, kulfi stations", { priority: "medium", template: "catering_menu_builder", fields: [f("p4c13-stations", "Station List", "textarea"), f("p4c13-cost", "Additional Cost", "currency")] }),
  item("p4-cater-14", "phase-4", "Plan dessert spread", "Design mithai, halwa, jalebi, and western dessert display", { priority: "medium", template: "catering_menu_builder", fields: [f("p4c14-items", "Dessert Items", "textarea"), f("p4c14-cost", "Cost", "currency")] }),
  item("p4-cater-15", "phase-4", "Plan welcome drinks and mocktails", "Design welcome drink menu", { priority: "medium", template: "bar_program", fields: [f("p4c15-drinks", "Drink Menu", "textarea")] }),
  item("p4-cater-16", "phase-4", "Plan signature cocktails", "Create signature cocktails with wedding brand names", { priority: "medium", template: "bar_program", fields: [f("p4c16-cocktails", "Cocktail Recipes", "textarea")] }),
  item("p4-cater-17", "phase-4", "Confirm head count per event", "Get final guest count for each event for the caterer", { priority: "critical", module: "/guests", fields: [f("p4c17-counts", "Head Counts per Event", "textarea")] }),
  item("p4-cater-18", "phase-4", "Discuss dietary accommodations", "Plan for allergies, gluten-free, diabetic guests", { priority: "high", fields: [f("p4c18-accommodations", "Special Accommodations", "textarea")] }),
  item("p4-cater-19", "phase-4", "Plan vendor meals", "Arrange meals for photographers, DJs, and other vendors", { priority: "medium", fields: [f("p4c19-count", "Vendor Meal Count", "text"), f("p4c19-menu", "Vendor Menu", "textarea")] }),
  item("p4-cater-20", "phase-4", "Plan kids' meal options", "Create kid-friendly meal options", { priority: "low", fields: [f("p4c20-menu", "Kids Menu", "textarea")] }),

  // Wedding Cake & Baker
  item("p4-cake-01", "phase-4", "Research bakers and schedule cake tastings", "Find bakers experienced with Indian wedding cakes; schedule tastings with 2–3 finalists", { priority: "medium", template: "vendor_comparison", fields: [f("p4ck01-shortlist", "Baker Shortlist", "textarea"), f("p4ck01-dates", "Tasting Dates", "textarea"), f("p4ck01-notes", "Tasting Notes", "textarea")] }),
  item("p4-cake-02", "phase-4", "Book baker", "Sign contract with chosen baker", { priority: "medium", template: "vendor_booking", deps: ["p4-cake-01"], fields: [f("p4ck02-vendor", "Baker", "vendor_picker", { required: true }), f("p4ck02-cost", "Total Cost", "currency"), f("p4ck02-contract", "Contract", "file_upload")] }),
  item("p4-cake-03", "phase-4", "Order wedding cake", "Place the wedding cake order with size, tiers, and delivery details", { priority: "medium", deps: ["p4-cake-02"], fields: [f("p4ck03-tiers", "Number of Tiers", "text"), f("p4ck03-servings", "Servings", "text"), f("p4ck03-delivery", "Delivery Date/Time", "text"), f("p4ck03-cost", "Cost", "currency")] }),
  item("p4-cake-04", "phase-4", "Confirm cake design and flavor", "Lock in cake design, color, motif, and flavor combinations", { priority: "medium", deps: ["p4-cake-02"], fields: [f("p4ck04-design", "Design Reference", "image_upload"), f("p4ck04-flavors", "Flavors per Tier", "textarea"), f("p4ck04-dietary", "Dietary Accommodations", "multiselect", { options: ["Eggless", "Vegan", "Gluten-Free", "Nut-Free"] })] }),
  item("p4-cake-05", "phase-4", "Order groom's cake or mithai display", "Optional second cake or traditional mithai tower for the reception", { priority: "low", fields: [f("p4ck05-type", "Type", "select", { options: ["Groom's Cake", "Mithai Tower", "Cupcake Display", "None"] }), f("p4ck05-cost", "Cost", "currency")] }),

  // Bar & Beverage
  item("p4-bar-01", "phase-4", "Decide alcohol policy", "Choose open bar, limited, or dry event policy", { priority: "high", template: "bar_program", fields: [f("p4br01-policy", "Policy", "select", { options: ["Open Bar", "Limited Bar", "Beer & Wine Only", "Dry/No Alcohol"], required: true })] }),
  item("p4-bar-02", "phase-4", "Determine alcohol provider", "Decide if venue, caterer, or couple provides alcohol", { priority: "high", template: "bar_program", fields: [f("p4br02-provider", "Provider", "select", { options: ["Venue", "Caterer", "Self-Purchased", "Hybrid"] })] }),
  item("p4-bar-03", "phase-4", "Calculate quantity per event", "Estimate alcohol quantities based on guest count and duration", { priority: "medium", template: "bar_program", fields: [f("p4br03-quantities", "Quantity Estimates", "textarea"), f("p4br03-budget", "Beverage Budget", "currency")] }),
  item("p4-bar-04", "phase-4", "Stock wine, beer, liquor, mixers", "Create a comprehensive beverage shopping list", { priority: "medium", template: "bar_program", fields: [f("p4br04-list", "Shopping List", "textarea"), f("p4br04-cost", "Total Cost", "currency")] }),
  item("p4-bar-05", "phase-4", "Design signature cocktails", "Create branded cocktails with names tied to the wedding", { priority: "medium", template: "bar_program", fields: [f("p4br05-cocktails", "Cocktail Names & Recipes", "textarea"), f("p4br05-signage", "Bar Signage Design", "image_upload")] }),
  item("p4-bar-06", "phase-4", "Plan non-alcoholic options", "Design mocktails, chai bar, coffee bar, lassi bar options", { priority: "high", template: "bar_program", fields: [f("p4br06-options", "Non-Alcoholic Menu", "textarea")] }),
  item("p4-bar-07", "phase-4", "Book bartenders", "Hire bartending staff for events", { priority: "high", template: "vendor_booking", fields: [f("p4br07-vendor", "Bartending Service", "vendor_picker"), f("p4br07-count", "Number of Bartenders", "text"), f("p4br07-cost", "Cost", "currency")] }),
  item("p4-bar-08", "phase-4", "Arrange glassware rentals", "Rent specialty glassware if not provided by venue", { priority: "low", fields: [f("p4br08-vendor", "Rental Company", "vendor_picker"), f("p4br08-cost", "Cost", "currency")] }),
  item("p4-bar-09", "phase-4", "Purchase bar liability insurance", "Get liability insurance for alcohol service if required", { priority: "medium", fields: [f("p4br09-required", "Required", "select", { options: ["Yes", "No"] }), f("p4br09-cost", "Cost", "currency")] }),

  // Decor & Florals
  item("p4-decor-01", "phase-4", "Hire decorator/florist", "Book a decorator or florist for all events", { priority: "critical", template: "vendor_booking", fields: [f("p4d01-vendor", "Decorator", "vendor_picker", { required: true }), f("p4d01-cost", "Total Cost", "currency"), f("p4d01-contract", "Contract", "file_upload")] }),
  item("p4-decor-02", "phase-4", "Share mood boards per event", "Send visual inspiration for each event's decor", { priority: "high", template: "mood_board", fields: [f("p4d02-boards", "Mood Boards", "image_upload"), f("p4d02-notes", "Decor Notes", "textarea")] }),
  item("p4-decor-03", "phase-4", "Design mandap", "Plan mandap structure, florals, fabric, and seating", { priority: "critical", template: "mandap_designer", fields: [f("p4d03-style", "Mandap Style", "select", { options: ["Traditional 4-Pillar", "Dome", "Open Air", "Floral Canopy", "Modern Minimal", "Draped Fabric"] }), f("p4d03-florals", "Floral Concept", "textarea"), f("p4d03-fabric", "Fabric/Color", "text"), f("p4d03-budget", "Budget", "currency")] }),
  item("p4-decor-04", "phase-4", "Plan baraat decor", "Design entrance decor and horse/car decoration", { priority: "high", template: "baraat_planner", fields: [f("p4d04-concept", "Baraat Decor Concept", "textarea"), f("p4d04-budget", "Budget", "currency")] }),
  item("p4-decor-05", "phase-4", "Design sangeet stage", "Plan backdrop, seating, and dance floor lighting for sangeet", { priority: "high", template: "decor_florals", fields: [f("p4d05-concept", "Stage Concept", "textarea"), f("p4d05-backdrop", "Backdrop Design", "image_upload")] }),
  item("p4-decor-06", "phase-4", "Design mehndi setup", "Plan low seating, cushions, swings, and floral installations", { priority: "high", template: "decor_florals", fields: [f("p4d06-concept", "Setup Concept", "textarea"), f("p4d06-seating", "Seating Style", "select", { options: ["Floor Cushions", "Low Tables", "Swings", "Mix"] })] }),
  item("p4-decor-07", "phase-4", "Design haldi setup", "Plan marigold, yellow drape, and flower petal decor", { priority: "medium", template: "haldi_planner", fields: [f("p4d07-concept", "Setup Concept", "textarea"), f("p4d07-flowers", "Flower Types", "multiselect", { options: ["Marigold", "Rose Petals", "Jasmine", "Sunflower"] })] }),
  item("p4-decor-08", "phase-4", "Design reception stage", "Plan backdrop and couple's seating for reception", { priority: "high", template: "decor_florals", fields: [f("p4d08-concept", "Stage Concept", "textarea"), f("p4d08-backdrop", "Backdrop Design", "image_upload")] }),
  item("p4-decor-09", "phase-4", "Plan entrance decor for each event", "Design welcoming entrance installations for every event", { priority: "medium", template: "decor_florals", fields: [f("p4d09-concepts", "Entrance Concepts per Event", "textarea")] }),
  item("p4-decor-10", "phase-4", "Plan table centerpieces per event", "Design centerpieces that match each event's theme", { priority: "medium", template: "decor_florals", fields: [f("p4d10-concepts", "Centerpiece Concepts", "textarea"), f("p4d10-budget", "Budget", "currency")] }),
  item("p4-decor-11", "phase-4", "Design welcome signage", "Create welcome signs for each venue entrance", { priority: "medium", template: "stationery_suite", fields: [f("p4d11-design", "Sign Designs", "image_upload")] }),
  item("p4-decor-12", "phase-4", "Design escort cards / seating charts", "Create decorative escort cards and seating chart display", { priority: "medium", template: "seating_chart", fields: [f("p4d12-style", "Style", "text"), f("p4d12-design", "Design", "image_upload")] }),
  item("p4-decor-13", "phase-4", "Design photo booth backdrop", "Create a branded or themed photo booth backdrop", { priority: "low", template: "decor_florals", fields: [f("p4d13-concept", "Backdrop Concept", "textarea")] }),
  item("p4-decor-14", "phase-4", "Plan ceiling installations", "Design hanging florals, diyas, pom-poms, or fabric draping", { priority: "medium", template: "decor_florals", fields: [f("p4d14-concept", "Installation Concept", "textarea"), f("p4d14-budget", "Budget", "currency")] }),
  item("p4-decor-15", "phase-4", "Plan aisle decor for ceremony", "Design the ceremony aisle with petals, lights, or floral arrangements", { priority: "high", template: "decor_florals", fields: [f("p4d15-concept", "Aisle Concept", "textarea")] }),
  item("p4-decor-16", "phase-4", "Plan pathway lighting and rangoli", "Design pathway with diyas, rangoli, and lighting", { priority: "medium", template: "decor_florals", fields: [f("p4d16-concept", "Pathway Concept", "textarea")] }),
  item("p4-decor-17", "phase-4", "Select flower varieties", "Choose flowers: marigold, rose, jasmine, orchid, lily, etc.", { priority: "high", template: "decor_florals", fields: [f("p4d17-flowers", "Flower Selection", "multiselect", { options: ["Marigold", "Rose", "Jasmine", "Orchid", "Lily", "Carnation", "Hydrangea", "Peony", "Tuberose"] }), f("p4d17-budget", "Floral Budget", "currency")] }),
  item("p4-decor-18", "phase-4", "Confirm delivery and teardown logistics", "Coordinate decor setup, event timing, and teardown schedules", { priority: "high", assigned: "planner", fields: [f("p4d18-schedule", "Setup/Teardown Schedule", "textarea"), f("p4d18-contacts", "Vendor Contacts", "textarea")] }),
  item("p4-decor-19", "phase-4", "Order personal flowers", "Finalize garlands, bouquets, corsages, boutonnieres, and haldi/pithi floral jewelry for the couple and family", { priority: "high", template: "decor_florals", fields: [f("p4d19-garlands", "Varmala/Jaimala Garlands", "textarea", { helper: "Style, flowers, quantity" }), f("p4d19-bouquets", "Bridal Bouquets", "text"), f("p4d19-corsages", "Corsages & Boutonnieres", "textarea", { helper: "Parents, bridal party" }), f("p4d19-haldi", "Haldi/Pithi Floral Jewelry", "textarea"), f("p4d19-welcome", "Welcome Garlands", "textarea"), f("p4d19-cost", "Cost", "currency")] }),

  // Lighting & Production
  item("p4-light-01", "phase-4", "Hire lighting designer", "Book a lighting designer or confirm through decorator", { priority: "high", template: "lighting_designer", fields: [f("p4l01-vendor", "Lighting Vendor", "vendor_picker"), f("p4l01-cost", "Cost", "currency")] }),
  item("p4-light-02", "phase-4", "Plan uplighting per venue", "Design ambient uplighting for each venue", { priority: "medium", template: "lighting_designer", fields: [f("p4l02-colors", "Uplight Colors per Venue", "textarea")] }),
  item("p4-light-03", "phase-4", "Plan dance floor lighting for sangeet", "Design dynamic lighting for the sangeet dance floor", { priority: "high", template: "lighting_designer", fields: [f("p4l03-concept", "Lighting Concept", "textarea"), f("p4l03-effects", "Effects", "multiselect", { options: ["Moving Heads", "LED Wash", "Strobe", "Laser", "Disco Ball", "Spotlight"] })] }),
  item("p4-light-04", "phase-4", "Plan fairy lights for outdoor events", "Arrange string lights and fairy lights for outdoor ambiance", { priority: "medium", template: "lighting_designer", fields: [f("p4l04-concept", "Fairy Light Plan", "textarea")] }),
  item("p4-light-05", "phase-4", "Plan pin-spotting for centerpieces", "Add focused lighting on table centerpieces", { priority: "low", template: "lighting_designer", fields: [f("p4l05-count", "Number of Pin Spots", "text")] }),
  item("p4-light-06", "phase-4", "Plan GOBO projection", "Project monogram or patterns on dance floor/walls", { priority: "low", template: "lighting_designer", fields: [f("p4l06-design", "GOBO Design", "image_upload"), f("p4l06-location", "Projection Location", "text")] }),
  item("p4-light-07", "phase-4", "Rent sound system and microphones", "Arrange PA system and wireless mics for ceremonies and speeches", { priority: "high", fields: [f("p4l07-vendor", "AV Vendor", "vendor_picker"), f("p4l07-cost", "Cost", "currency")] }),
  item("p4-light-08", "phase-4", "Book AV technician", "Hire a technician to manage sound and lighting during events", { priority: "high", template: "vendor_booking", fields: [f("p4l08-vendor", "AV Tech", "vendor_picker"), f("p4l08-cost", "Cost", "currency")] }),

  // Music & Entertainment
  item("p4-music-01", "phase-4", "Book DJ for sangeet and reception", "Hire a DJ experienced with Bollywood and fusion music", { priority: "critical", template: "vendor_booking", module: "/entertainment", fields: [f("p4m01-vendor", "DJ", "vendor_picker", { required: true }), f("p4m01-cost", "Cost", "currency"), f("p4m01-contract", "Contract", "file_upload")] }),
  item("p4-music-02", "phase-4", "Share music preferences and do-not-play list", "Provide the DJ with preferred songs and songs to avoid", { priority: "medium", template: "music_library", module: "/entertainment", fields: [f("p4m02-must-play", "Must-Play Songs", "textarea"), f("p4m02-dnp", "Do-Not-Play List", "textarea")] }),
  item("p4-music-03", "phase-4", "Book dhol player for baraat", "Hire dhol players for the baraat procession", { priority: "high", template: "vendor_booking", module: "/entertainment", tags: ["north-indian", "punjabi"], fields: [f("p4m03-vendor", "Dhol Player", "vendor_picker"), f("p4m03-count", "Number of Dhols", "text"), f("p4m03-cost", "Cost", "currency")] }),
  item("p4-music-04", "phase-4", "Book shehnai / nadaswaram for ceremony", "Hire traditional musicians for the ceremony", { priority: "medium", template: "vendor_booking", module: "/entertainment", fields: [f("p4m04-vendor", "Musician", "vendor_picker"), f("p4m04-instrument", "Instrument", "select", { options: ["Shehnai", "Nadaswaram", "Flute", "Sitar"] }), f("p4m04-cost", "Cost", "currency")] }),
  item("p4-music-05", "phase-4", "Book classical vocalists / instrumentalists", "Hire classical musicians for ceremony or cocktail hour", { priority: "low", template: "vendor_booking", module: "/entertainment", fields: [f("p4m05-vendor", "Musicians", "vendor_picker"), f("p4m05-cost", "Cost", "currency")] }),
  item("p4-music-06", "phase-4", "Book Bollywood band for sangeet", "Hire a live Bollywood cover band for sangeet", { priority: "medium", template: "vendor_booking", module: "/entertainment", fields: [f("p4m06-vendor", "Band", "vendor_picker"), f("p4m06-cost", "Cost", "currency")] }),
  item("p4-music-07", "phase-4", "Book ghazal / qawwali singers for mehndi", "Hire singers for the mehndi evening", { priority: "medium", template: "vendor_booking", module: "/entertainment", fields: [f("p4m07-vendor", "Singers", "vendor_picker"), f("p4m07-genre", "Genre", "select", { options: ["Ghazal", "Qawwali", "Sufi", "Folk"] }), f("p4m07-cost", "Cost", "currency")] }),
  item("p4-music-08", "phase-4", "Book dance performers", "Hire garba troupe, bhangra, or classical dance performers", { priority: "medium", template: "vendor_booking", module: "/entertainment", fields: [f("p4m08-type", "Performance Type", "multiselect", { options: ["Garba Troupe", "Bhangra", "Classical", "Bollywood", "Folk"] }), f("p4m08-vendor", "Performers", "vendor_picker"), f("p4m08-cost", "Cost", "currency")] }),
  item("p4-music-09", "phase-4", "Book emcee / MC", "Hire an emcee, ideally bilingual, for sangeet and reception", { priority: "high", template: "vendor_booking", module: "/entertainment", fields: [f("p4m09-vendor", "MC", "vendor_picker"), f("p4m09-languages", "Languages", "multiselect", { options: ["English", "Hindi", "Punjabi", "Gujarati", "Tamil", "Other"] }), f("p4m09-cost", "Cost", "currency")] }),
  item("p4-music-10", "phase-4", "Plan sangeet performances schedule", "Create a detailed run-of-show for all sangeet performances", { priority: "high", template: "sangeet_run_of_show", module: "/entertainment", fields: [f("p4m10-schedule", "Performance Schedule", "textarea", { required: true })] }),
  item("p4-music-11", "phase-4", "Book choreographer for family dances", "Hire a choreographer to teach family performances", { priority: "high", template: "choreography_planner", module: "/entertainment", fields: [f("p4m11-vendor", "Choreographer", "vendor_picker"), f("p4m11-dances", "Number of Dances", "text"), f("p4m11-cost", "Cost", "currency")] }),
  item("p4-music-12", "phase-4", "Schedule choreography sessions", "Plan rehearsal dates for all dance performances", { priority: "high", template: "choreography_planner", module: "/entertainment", deps: ["p4-music-11"], fields: [f("p4m12-schedule", "Rehearsal Schedule", "textarea")] }),
  item("p4-music-13", "phase-4", "Plan grand entrance concept", "Design the couple's grand entrance at reception", { priority: "medium", template: "reception_planner", module: "/entertainment", fields: [f("p4m13-concept", "Entrance Concept", "textarea"), f("p4m13-song", "Entrance Song", "text")] }),
  item("p4-music-14", "phase-4", "Plan first dance song", "Choose and prepare for the couple's first dance", { priority: "medium", template: "music_library", module: "/entertainment", fields: [f("p4m14-song", "Song", "text", { required: true }), f("p4m14-lessons", "Dance Lessons Needed", "select", { options: ["Yes", "No", "Maybe"] })] }),
  item("p4-music-15", "phase-4", "Plan parents' dances", "Arrange special dances with parents", { priority: "low", template: "music_library", module: "/entertainment", fields: [f("p4m15-songs", "Parent Dance Songs", "textarea")] }),
  item("p4-music-16", "phase-4", "Book cocktail hour entertainment", "Hire acoustic musicians, magician, or caricaturist", { priority: "low", template: "vendor_booking", module: "/entertainment", fields: [f("p4m16-type", "Entertainment Type", "text"), f("p4m16-vendor", "Vendor", "vendor_picker"), f("p4m16-cost", "Cost", "currency")] }),
  item("p4-music-17", "phase-4", "Book fireworks / sparklers / cold pyro", "Arrange pyrotechnics if permitted at the venue", { priority: "low", module: "/entertainment", fields: [f("p4m17-type", "Type", "multiselect", { options: ["Fireworks", "Sparklers", "Cold Pyro", "Confetti Cannons"] }), f("p4m17-permitted", "Venue Permits", "select", { options: ["Yes", "No", "Checking"] }), f("p4m17-cost", "Cost", "currency")] }),
  item("p4-music-18", "phase-4", "Book baraat extras", "Hire nachaniyas, flag bearers, fire twirlers, LED dhols", { priority: "medium", template: "baraat_planner", module: "/entertainment", tags: ["north-indian", "punjabi"], fields: [f("p4m18-extras", "Baraat Extras", "multiselect", { options: ["Nachaniyas", "Flag Bearers", "Fire Twirlers", "LED Dhols", "Band Baja", "Horse Decoration"] }), f("p4m18-cost", "Cost", "currency")] }),

  // Transportation
  item("p4-trans-01", "phase-4", "Arrange baraat vehicle", "Book horse, elephant, vintage car, or convertible for the baraat", { priority: "high", template: "baraat_planner", module: "/transportation", fields: [f("p4t01-type", "Vehicle Type", "select", { options: ["Horse", "Elephant", "Vintage Car", "Convertible", "Rolls Royce", "Custom"] }), f("p4t01-vendor", "Provider", "vendor_picker"), f("p4t01-cost", "Cost", "currency")] }),
  item("p4-trans-02", "phase-4", "Arrange bride's entrance", "Plan doli, palanquin, or phoolon ki chaadar for bride's entrance", { priority: "high", module: "/transportation", fields: [f("p4t02-type", "Entrance Style", "select", { options: ["Doli/Palki", "Palanquin", "Phoolon ki Chaadar", "Walking with Parents", "Other"] }), f("p4t02-cost", "Cost", "currency")] }),
  item("p4-trans-03", "phase-4", "Arrange guest shuttles", "Book shuttles between hotel and venue for each event", { priority: "high", template: "transportation_grid", module: "/transportation", fields: [f("p4t03-vendor", "Shuttle Company", "vendor_picker"), f("p4t03-schedule", "Shuttle Schedule", "textarea"), f("p4t03-cost", "Cost", "currency")] }),
  item("p4-trans-04", "phase-4", "Coordinate airport pickups", "Arrange airport transportation for out-of-town guests", { priority: "medium", template: "transportation_grid", module: "/transportation", fields: [f("p4t04-service", "Car Service", "vendor_picker"), f("p4t04-schedule", "Pickup Schedule", "textarea"), f("p4t04-cost", "Cost", "currency")] }),
  item("p4-trans-05", "phase-4", "Arrange VIP transport for elderly", "Provide dedicated transport for elderly and mobility-limited guests", { priority: "high", template: "transportation_grid", module: "/transportation", fields: [f("p4t05-plan", "VIP Transport Plan", "textarea"), f("p4t05-cost", "Cost", "currency")] }),
  item("p4-trans-06", "phase-4", "Book parking attendants and valet", "Arrange valet and parking management at venues", { priority: "medium", template: "vendor_booking", module: "/transportation", fields: [f("p4t06-vendor", "Valet Service", "vendor_picker"), f("p4t06-cost", "Cost", "currency")] }),
  item("p4-trans-07", "phase-4", "Arrange couple's getaway car", "Book a special car for the couple's departure after the wedding", { priority: "medium", module: "/transportation", fields: [f("p4t07-type", "Car Type", "text"), f("p4t07-vendor", "Provider", "vendor_picker"), f("p4t07-decoration", "Decoration Plan", "textarea")] }),
  item("p4-trans-08", "phase-4", "Create shuttle schedule and signage", "Design printed shuttle schedules and directional signs", { priority: "medium", template: "transportation_grid", module: "/transportation", fields: [f("p4t08-schedule", "Schedule Document", "file_upload"), f("p4t08-signage", "Signage Design", "image_upload")] }),
  item("p4-trans-09", "phase-4", "Create driver list and contact sheet", "Compile all driver names and phone numbers for event day", { priority: "high", assigned: "planner", template: "transportation_grid", module: "/transportation", fields: [f("p4t09-list", "Driver Contact Sheet", "textarea")] }),
  item("p4-trans-10", "phase-4", "Arrange backup vehicles", "Have backup transportation options on standby", { priority: "medium", template: "transportation_grid", module: "/transportation", fields: [f("p4t10-backups", "Backup Plan", "textarea")] }),

  // Guest Experiences — experiential extras (photo booths, live artists,
  // interactive stations, wow moments). Discovery happens in the workspace;
  // this layer is the booking-side work.
  item("p4-guexp-01", "phase-4", "Walk couple through the Experience Explorer", "Facilitate the Discover & Dream session — react to each category, build a loved-items list.", { priority: "medium", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_discover"] }),
  item("p4-guexp-02", "phase-4", "Draft the Guest Experience Brief", "Capture the couple's experiential vision in one narrative document.", { priority: "medium", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_shortlist"] }),
  item("p4-guexp-03", "phase-4", "Research vendors for each shortlisted experience", "For every loved item, identify 2–3 viable vendors in the host city.", { priority: "high", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_shortlist"] }),
  item("p4-guexp-04", "phase-4", "Collect quotes for shortlisted experiences", "Send the brief to shortlisted vendors; gather pricing, availability, logistics.", { priority: "high", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_shortlist"] }),
  item("p4-guexp-05", "phase-4", "Book confirmed experiences", "Sign contracts and pay deposits for the experiences that make the final cut.", { priority: "critical", template: "vendor_booking", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_shortlist"] }),
  item("p4-guexp-06", "phase-4", "Coordinate experience setup with the venue", "Share load-in windows, power needs, and footprint for each experience with the venue team.", { priority: "high", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences", "venue"], workspaceTabTags: ["guest_shortlist"] }),
  item("p4-guexp-07", "phase-4", "Brief experience vendors on the event timeline", "Confirm setup times, peak hours, and breakdown for every shortlisted experience.", { priority: "medium", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_shortlist"] }),
];

// ── Phase 5: Paper & Stationery ─────────────────────────────────────────────

const p5: ChecklistItem[] = [
  // Save-the-Dates
  item("p5-std-01", "phase-5", "Design save-the-date", "Create digital and/or print save-the-date cards", { priority: "high", template: "stationery_suite", module: "/stationery", fields: [f("p5s01-format", "Format", "select", { options: ["Digital Only", "Print Only", "Both"] }), f("p5s01-designer", "Designer", "vendor_picker"), f("p5s01-design", "Design Upload", "image_upload")] }),
  item("p5-std-02", "phase-5", "Compile mailing addresses", "Collect mailing addresses for all save-the-date recipients", { priority: "high", module: "/guests", fields: [f("p5s02-count", "Total Recipients", "text"), f("p5s02-spreadsheet", "Address Spreadsheet", "file_upload")] }),
  item("p5-std-03", "phase-5", "Print and mail save-the-dates", "Send save-the-dates 8–10 months before the wedding", { priority: "high", template: "stationery_suite", module: "/stationery", deps: ["p5-std-01", "p5-std-02", "p2-photo-10"], categoryTags: ["stationery", "photography"], workspaceTabTags: ["plan"], fields: [f("p5s03-printer", "Printer", "vendor_picker"), f("p5s03-quantity", "Quantity", "text"), f("p5s03-cost", "Cost", "currency"), f("p5s03-maildate", "Mail Date", "date")] }),
  item("p5-std-04", "phase-5", "Send digital version for international guests", "Email or WhatsApp save-the-dates to overseas guests", { priority: "medium", module: "/stationery", deps: ["p5-std-01"], fields: [f("p5s04-sent", "Sent", "select", { options: ["Yes", "No"] }), f("p5s04-method", "Delivery Method", "select", { options: ["Email", "WhatsApp", "Both"] })] }),

  // Invitations
  item("p5-inv-01", "phase-5", "Choose invitation designer", "Select a stationer or designer for the invitation suite", { priority: "high", template: "vendor_booking", module: "/stationery", fields: [f("p5i01-vendor", "Designer/Stationer", "vendor_picker", { required: true }), f("p5i01-style", "Style", "select", { options: ["Laser Cut", "Letterpress", "Foil", "Watercolor", "Digital Print", "Scroll", "Box Invitation"] }), f("p5i01-cost", "Cost", "currency")] }),
  item("p5-inv-02", "phase-5", "Decide invitation suite components", "Plan main card, event inserts, RSVP card, accommodation, travel, dress code, kids, and registry inserts", { priority: "high", template: "stationery_suite", module: "/stationery", fields: [f("p5i02-components", "Included Components", "multiselect", { options: ["Main Card", "Event Inserts", "RSVP Card", "Accommodation Insert", "Travel Insert", "Dress Code Insert", "Kids Policy", "Registry Insert"], required: true })] }),
  item("p5-inv-03", "phase-5", "Decide on languages", "Choose English, Hindi, Sanskrit, regional scripts, or bilingual", { priority: "high", module: "/stationery", fields: [f("p5i03-languages", "Languages", "multiselect", { options: ["English", "Hindi", "Sanskrit", "Gujarati", "Punjabi", "Tamil", "Telugu", "Bengali", "Urdu"] })] }),
  item("p5-inv-04", "phase-5", "Include Ganesh motif or shloka", "Add traditional Ganesh motif or auspicious verse at top", { priority: "medium", module: "/stationery", tags: ["hindu"], fields: [f("p5i04-motif", "Motif/Shloka", "select", { options: ["Ganesh", "Om", "Shloka", "Bismillah", "Ek Onkar", "Custom"] })] }),
  item("p5-inv-05", "phase-5", "Include parents' names in proper order", "List both sets of parents' names following cultural conventions", { priority: "high", module: "/stationery", fields: [f("p5i05-names", "Parent Names & Order", "textarea", { required: true })] }),
  item("p5-inv-06", "phase-5", "List invited relatives", "Add \"with best compliments from...\" or similar family listing", { priority: "medium", module: "/stationery", assigned: "family", fields: [f("p5i06-list", "Relative Listing", "textarea")] }),
  item("p5-inv-07", "phase-5", "Get calligraphy or custom addressing", "Arrange hand calligraphy or custom printed addressing for envelopes", { priority: "low", module: "/stationery", fields: [f("p5i07-calligrapher", "Calligrapher", "vendor_picker"), f("p5i07-style", "Style", "text"), f("p5i07-cost", "Cost", "currency")] }),
  item("p5-inv-08", "phase-5", "Order envelopes", "Get inner and outer envelopes for the invitation suite", { priority: "medium", module: "/stationery", fields: [f("p5i08-quantity", "Quantity", "text"), f("p5i08-color", "Color/Material", "text"), f("p5i08-cost", "Cost", "currency")] }),
  item("p5-inv-09", "phase-5", "Order wax seals / belly bands / ribbons", "Add finishing touches to the invitation packaging", { priority: "low", module: "/stationery", fields: [f("p5i09-items", "Finishing Items", "multiselect", { options: ["Wax Seal", "Belly Band", "Ribbon", "Tissue Paper", "Liner"] }), f("p5i09-cost", "Cost", "currency")] }),
  item("p5-inv-10", "phase-5", "Order special packaging", "Design boxes, mithai pairings, or trunk-style invites", { priority: "medium", module: "/stationery", fields: [f("p5i10-style", "Packaging Style", "select", { options: ["Box", "Mithai Pairing", "Trunk", "Scroll in Tube", "Standard Envelope"] }), f("p5i10-cost", "Cost", "currency")] }),
  item("p5-inv-11", "phase-5", "Proofread everything 3x", "Triple-check all names, dates, times, and locations", { priority: "critical", module: "/stationery", fields: [f("p5i11-proofed", "Proofread Rounds Completed", "select", { options: ["0", "1", "2", "3"] }), f("p5i11-errors", "Errors Found", "textarea")] }),
  item("p5-inv-12", "phase-5", "Order 15–20% extras", "Print additional invitations for mistakes and keepsakes", { priority: "medium", module: "/stationery", fields: [f("p5i12-extras", "Extra Quantity", "text")] }),
  item("p5-inv-13", "phase-5", "Weigh invitation suite for postage", "Confirm weight to calculate correct postage", { priority: "medium", module: "/stationery", fields: [f("p5i13-weight", "Suite Weight", "text"), f("p5i13-postage", "Postage per Invite", "currency")] }),
  item("p5-inv-14", "phase-5", "Mail invitations", "Send invitations: 6–8 weeks domestic, 10+ weeks international", { priority: "critical", module: "/stationery", fields: [f("p5i14-domestic-date", "Domestic Mail Date", "date"), f("p5i14-intl-date", "International Mail Date", "date"), f("p5i14-count", "Total Mailed", "text")] }),
  item("p5-inv-15", "phase-5", "Hand-deliver to elders", "Personally deliver invitations to elders as a gesture of respect", { priority: "medium", assigned: "family", module: "/stationery", fields: [f("p5i15-list", "Elders to Visit", "textarea"), f("p5i15-schedule", "Delivery Schedule", "textarea")] }),

  // Day-Of Paper
  item("p5-dop-01", "phase-5", "Create ceremony programs", "Design programs explaining each ritual for guests", { priority: "high", template: "ceremony_program_builder", module: "/stationery", fields: [f("p5dp01-design", "Program Design", "image_upload"), f("p5dp01-content", "Ritual Descriptions", "textarea"), f("p5dp01-quantity", "Quantity", "text")] }),
  item("p5-dop-02", "phase-5", "Create welcome signs at each venue", "Design welcome signage for each event venue", { priority: "medium", template: "stationery_suite", module: "/stationery", fields: [f("p5dp02-designs", "Sign Designs", "image_upload"), f("p5dp02-count", "Number of Signs", "text")] }),
  item("p5-dop-03", "phase-5", "Create directional signage", "Design signs to guide guests through venues", { priority: "medium", module: "/stationery", fields: [f("p5dp03-list", "Signs Needed", "textarea")] }),
  item("p5-dop-04", "phase-5", "Create event schedule cards", "Print itinerary cards for guests", { priority: "medium", module: "/stationery", fields: [f("p5dp04-content", "Schedule Content", "textarea"), f("p5dp04-design", "Design", "image_upload")] }),
  item("p5-dop-05", "phase-5", "Create menu cards per event", "Design printed menu cards for each event", { priority: "medium", template: "stationery_suite", module: "/stationery", fields: [f("p5dp05-menus", "Menu Content per Event", "textarea")] }),
  item("p5-dop-06", "phase-5", "Create place cards / escort cards", "Design individual place or escort cards for seated events", { priority: "medium", template: "seating_chart", module: "/stationery", fields: [f("p5dp06-style", "Card Style", "text"), f("p5dp06-quantity", "Quantity", "text")] }),
  item("p5-dop-07", "phase-5", "Create seating chart display", "Design a seating chart display board or sign", { priority: "medium", template: "seating_chart", module: "/stationery", fields: [f("p5dp07-style", "Display Style", "select", { options: ["Mirror", "Board", "Frames", "Digital Screen", "Floral Installation"] }), f("p5dp07-design", "Design", "image_upload")] }),
  item("p5-dop-08", "phase-5", "Create table numbers", "Design table number cards or signs", { priority: "medium", module: "/stationery", fields: [f("p5dp08-style", "Style", "text"), f("p5dp08-count", "Table Count", "text")] }),
  item("p5-dop-09", "phase-5", "Create bar menus and drink signs", "Design bar menu boards and drink name signs", { priority: "low", template: "bar_program", module: "/stationery", fields: [f("p5dp09-design", "Menu Design", "image_upload")] }),
  item("p5-dop-10", "phase-5", "Create photo booth signs", "Design signs for the photo booth area", { priority: "low", module: "/stationery", categoryTags: ["stationery", "photography"], workspaceTabTags: ["plan"], fields: [f("p5dp10-design", "Sign Design", "image_upload")] }),
  item("p5-dop-11", "phase-5", "Create restroom baskets signs", "Design small signs for restroom amenity baskets", { priority: "low", module: "/stationery", fields: [f("p5dp11-design", "Sign Design", "image_upload")] }),
  item("p5-dop-12", "phase-5", "Create thank you cards for place settings", "Design thank you cards to place at each guest's seat", { priority: "medium", template: "thank_you_tracker", module: "/stationery", fields: [f("p5dp12-message", "Thank You Message", "textarea"), f("p5dp12-design", "Card Design", "image_upload")] }),
  item("p5-dop-13", "phase-5", "Create favor tags / packaging", "Design tags and packaging for guest favors", { priority: "medium", module: "/stationery", fields: [f("p5dp13-design", "Tag Design", "image_upload"), f("p5dp13-quantity", "Quantity", "text")] }),
  item("p5-dop-14", "phase-5", "Create hashtag signs", "Design signs encouraging guests to use the wedding hashtag", { priority: "low", template: "hashtag_picker", module: "/stationery", fields: [f("p5dp14-design", "Sign Design", "image_upload")] }),
  item("p5-dop-15", "phase-5", "Create ceremony translation cards", "Print cards explaining rituals in English for non-Indian guests", { priority: "medium", template: "ceremony_program_builder", module: "/stationery", fields: [f("p5dp15-content", "Translation Content", "textarea"), f("p5dp15-quantity", "Quantity", "text")] }),
  item("p5-dop-16", "phase-5", "Buy thank-you note cards", "Purchase blank or printed thank-you cards for post-wedding notes", { priority: "medium", template: "thank_you_tracker", module: "/stationery", fields: [f("p5dp16-quantity", "Quantity", "text"), f("p5dp16-style", "Card Style", "text"), f("p5dp16-cost", "Cost", "currency")] }),

  // Welcome Bags
  item("p5-wb-01", "phase-5", "Design welcome bag contents", "Plan the full contents of each welcome bag", { priority: "medium", template: "welcome_bag_builder", fields: [f("p5wb01-items", "Item List", "textarea", { required: true }), f("p5wb01-budget", "Budget per Bag", "currency")] }),
  item("p5-wb-02", "phase-5", "Include event itinerary", "Print a mini itinerary card for the welcome bag", { priority: "medium", template: "welcome_bag_builder", fields: [f("p5wb02-itinerary", "Itinerary Content", "textarea")] }),
  item("p5-wb-03", "phase-5", "Include local map and recommendations", "Add a card with local restaurant and attraction suggestions", { priority: "low", template: "welcome_bag_builder", fields: [f("p5wb03-content", "Map/Recommendations", "textarea")] }),
  item("p5-wb-04", "phase-5", "Include bottled water", "Add bottled water to each welcome bag", { priority: "low", template: "welcome_bag_builder", fields: [f("p5wb04-quantity", "Bottles Needed", "text")] }),
  item("p5-wb-05", "phase-5", "Include snacks", "Add a mix of Indian and Western snacks", { priority: "medium", template: "welcome_bag_builder", fields: [f("p5wb05-snacks", "Snack Selection", "textarea")] }),
  item("p5-wb-06", "phase-5", "Include survival kit", "Add Advil, mints, lip balm, mask, etc.", { priority: "low", template: "welcome_bag_builder", fields: [f("p5wb06-items", "Kit Items", "textarea")] }),
  item("p5-wb-07", "phase-5", "Include welcome note from couple", "Write a personalized welcome message", { priority: "medium", template: "welcome_bag_builder", fields: [f("p5wb07-message", "Welcome Message", "textarea")] }),
  item("p5-wb-08", "phase-5", "Include local specialty gift", "Add a locally-sourced gift item", { priority: "low", template: "welcome_bag_builder", fields: [f("p5wb08-gift", "Gift Item", "text"), f("p5wb08-cost", "Cost per Item", "currency")] }),
  item("p5-wb-09", "phase-5", "Include hashtag/brand card", "Add a card with the wedding hashtag and brand", { priority: "low", template: "welcome_bag_builder", fields: [f("p5wb09-design", "Card Design", "image_upload")] }),
  item("p5-wb-10", "phase-5", "Customize bags with monogram", "Brand the bags with the wedding monogram", { priority: "medium", template: "welcome_bag_builder", fields: [f("p5wb10-bag-style", "Bag Style", "select", { options: ["Tote", "Gift Bag", "Box", "Basket", "Potli"] }), f("p5wb10-cost", "Cost per Bag", "currency")] }),
  item("p5-wb-11", "phase-5", "Arrange delivery to hotel rooms", "Coordinate delivery to hotel rooms or front desk distribution", { priority: "medium", template: "welcome_bag_builder", fields: [f("p5wb11-method", "Distribution Method", "select", { options: ["Room Delivery", "Front Desk", "Welcome Table", "Hand Delivery"] }), f("p5wb11-date", "Delivery Date", "date")] }),
];

// ── Phase 6: Guest Management ───────────────────────────────────────────────

const p6: ChecklistItem[] = [
  item("p6-guest-01", "phase-6", "Compile master guest list", "Create a comprehensive list of all guests across both families", { priority: "critical", template: "guest_list_manager", module: "/guests", fields: [f("p6g01-count", "Estimated Total", "text"), f("p6g01-spreadsheet", "Guest List", "file_upload")] }),
  item("p6-guest-02", "phase-6", "Categorize guests by side", "Tag each guest as bride's family, groom's family, friends, or colleagues", { priority: "high", template: "guest_list_manager", module: "/guests", fields: [f("p6g02-bride", "Bride Side Count", "text"), f("p6g02-groom", "Groom Side Count", "text")] }),
  item("p6-guest-03", "phase-6", "Categorize guests by event", "Mark which guests attend which events", { priority: "high", template: "guest_list_manager", module: "/guests", fields: [f("p6g03-mapping", "Event-Guest Mapping", "textarea")] }),
  item("p6-guest-04", "phase-6", "Set guest cap per side and negotiate", "Agree on maximum guests per family", { priority: "critical", module: "/guests", fields: [f("p6g04-bride-cap", "Bride Side Cap", "text"), f("p6g04-groom-cap", "Groom Side Cap", "text")] }),
  item("p6-guest-05", "phase-6", "Collect mailing addresses", "Gather postal addresses for invitations", { priority: "high", module: "/guests", fields: [f("p6g05-progress", "Collection Progress", "select", { options: ["Not Started", "In Progress", "Complete"] })] }),
  item("p6-guest-06", "phase-6", "Collect emails and phone numbers", "Gather digital contact info for all guests", { priority: "high", module: "/guests", fields: [f("p6g06-progress", "Collection Progress", "select", { options: ["Not Started", "In Progress", "Complete"] })] }),
  item("p6-guest-07", "phase-6", "Collect dietary restrictions", "Document allergies and dietary needs for each guest", { priority: "high", module: "/guests", fields: [f("p6g07-restrictions", "Restrictions Summary", "textarea")] }),
  item("p6-guest-08", "phase-6", "Collect accessibility needs", "Note mobility, hearing, vision, or other accessibility requirements", { priority: "high", module: "/guests", fields: [f("p6g08-needs", "Accessibility Needs", "textarea")] }),
  item("p6-guest-09", "phase-6", "Note VIP guests", "Flag grandparents, elderly, pregnant guests, and kids", { priority: "high", module: "/guests", fields: [f("p6g09-vips", "VIP List", "textarea")] }),
  item("p6-guest-10", "phase-6", "Set plus-one policies", "Define who gets a plus-one and under what conditions", { priority: "medium", module: "/guests", fields: [f("p6g10-policy", "Plus-One Policy", "textarea")] }),
  item("p6-guest-11", "phase-6", "Note out-of-town vs local", "Track which guests need travel and accommodation", { priority: "medium", module: "/guests", fields: [f("p6g11-oot-count", "Out-of-Town Count", "text")] }),

  // RSVP Tracking
  item("p6-rsvp-01", "phase-6", "Set up RSVP system", "Configure per-event toggle RSVP system", { priority: "critical", module: "/guests", fields: [f("p6r01-system", "RSVP System", "select", { options: ["Website", "Google Forms", "Ananya", "Paper"] }), f("p6r01-link", "RSVP Link", "url")] }),
  item("p6-rsvp-02", "phase-6", "Send RSVP reminders", "Send reminders at T-minus 6 weeks, 4 weeks, and 2 weeks", { priority: "high", module: "/guests", fields: [f("p6r02-r1", "6-Week Reminder Sent", "date"), f("p6r02-r2", "4-Week Reminder Sent", "date"), f("p6r02-r3", "2-Week Reminder Sent", "date")] }),
  item("p6-rsvp-03", "phase-6", "Chase non-responders", "Personally call or text guests who haven't responded", { priority: "high", module: "/guests", fields: [f("p6r03-list", "Non-Responders", "textarea"), f("p6r03-contacted", "Contacted", "text")] }),
  item("p6-rsvp-04", "phase-6", "Track attendance by event", "Maintain per-event attendance counts", { priority: "high", module: "/guests", fields: [f("p6r04-tracker", "Attendance Tracker", "textarea")] }),
  item("p6-rsvp-05", "phase-6", "Share headcount updates with vendors", "Send weekly headcount updates to vendors in the final month", { priority: "high", assigned: "planner", fields: [f("p6r05-schedule", "Update Schedule", "textarea")] }),

  // Seating
  item("p6-seat-01", "phase-6", "Build mehndi seating chart", "Plan floor seating and tables for mehndi", { priority: "medium", template: "seating_chart", module: "/guests", fields: [f("p6s01-layout", "Seating Layout", "textarea"), f("p6s01-chart", "Chart Upload", "file_upload")] }),
  item("p6-seat-02", "phase-6", "Build sangeet seating chart", "Arrange round tables with reserved front rows", { priority: "medium", template: "seating_chart", module: "/guests", fields: [f("p6s02-layout", "Seating Layout", "textarea")] }),
  item("p6-seat-03", "phase-6", "Build ceremony seating chart", "Plan wedding ceremony seating arrangement", { priority: "high", template: "seating_chart", module: "/guests", fields: [f("p6s03-layout", "Seating Layout", "textarea")] }),
  item("p6-seat-04", "phase-6", "Build reception seating chart", "Plan reception dinner seating", { priority: "high", template: "seating_chart", module: "/guests", fields: [f("p6s04-layout", "Seating Layout", "textarea"), f("p6s04-tables", "Number of Tables", "text")] }),
  item("p6-seat-05", "phase-6", "Reserve front rows for family", "Ensure immediate family has reserved seating at each event", { priority: "high", template: "seating_chart", module: "/guests", fields: [f("p6s05-plan", "Reserved Seating Plan", "textarea")] }),
  item("p6-seat-06", "phase-6", "Reserve accessible seating", "Ensure wheelchair and mobility-accessible spots are planned", { priority: "high", module: "/guests", fields: [f("p6s06-plan", "Accessible Seating Plan", "textarea")] }),
  item("p6-seat-07", "phase-6", "Seat elderly away from speakers", "Position older guests away from loud music/speakers", { priority: "medium", module: "/guests", fields: [f("p6s07-notes", "Notes", "textarea")] }),
  item("p6-seat-08", "phase-6", "Seat kids together or with parents", "Plan kid-friendly seating arrangements", { priority: "medium", module: "/guests", fields: [f("p6s08-plan", "Kids Seating Plan", "textarea")] }),
  item("p6-seat-09", "phase-6", "Plan single-friends table", "Create a fun table for single friends", { priority: "low", module: "/guests", fields: [f("p6s09-guests", "Single Friends List", "textarea")] }),
  item("p6-seat-10", "phase-6", "Plan non-Indian friends table", "Seat non-Indian guests with a cultural host", { priority: "medium", module: "/guests", fields: [f("p6s10-guests", "Non-Indian Guests", "textarea"), f("p6s10-host", "Cultural Host", "text")] }),

  // Guest Communication
  item("p6-comm-01", "phase-6", "Set up guest communication channel", "Create WhatsApp group or email list for guest updates", { priority: "high", module: "/guests", fields: [f("p6c01-channel", "Channel", "select", { options: ["WhatsApp Group", "Email List", "Both"] })] }),
  item("p6-comm-02", "phase-6", "Send pre-arrival info packet", "Share travel, accommodation, and event details before the wedding", { priority: "high", module: "/guests", fields: [f("p6c02-sent", "Sent Date", "date"), f("p6c02-content", "Packet Contents", "textarea")] }),
  item("p6-comm-03", "phase-6", "Send week-of reminder", "Send detailed schedule and logistics the week before", { priority: "high", module: "/guests", fields: [f("p6c03-sent", "Sent Date", "date")] }),
  item("p6-comm-04", "phase-6", "Send day-of updates", "Share real-time location and timing updates on event day", { priority: "medium", module: "/guests", fields: [f("p6c04-method", "Update Method", "select", { options: ["WhatsApp", "SMS", "App Push"] })] }),
  item("p6-comm-05", "phase-6", "Plan post-wedding thank you communication", "Prepare thank-you messages for after the wedding", { priority: "medium", template: "thank_you_tracker", module: "/guests", fields: [f("p6c05-plan", "Thank You Plan", "textarea")] }),
];

// ── Phase 7: Ceremony Specifics ─────────────────────────────────────────────

const p7: ChecklistItem[] = [
  // Wedding Ceremony Planning
  item("p7-cer-01", "phase-7", "Meet with priest to walk through rituals", "Detailed walkthrough of every ceremony ritual with the priest", { priority: "critical", template: "ceremony_program_builder", module: "/timeline", fields: [f("p7c01-date", "Meeting Date", "date"), f("p7c01-notes", "Meeting Notes", "textarea")] }),
  item("p7-cer-02", "phase-7", "Confirm baraat arrival plan", "Finalize the baraat procession order and timing", { priority: "high", template: "baraat_planner", module: "/timeline", fields: [f("p7c02-time", "Arrival Time", "text"), f("p7c02-route", "Route", "textarea")] }),
  item("p7-cer-03", "phase-7", "Plan milni (family greeting)", "Organize the formal greeting between families", { priority: "high", template: "ceremony_program_builder", tags: ["north-indian"], fields: [f("p7c03-pairs", "Milni Pairs", "textarea"), f("p7c03-garlands", "Garland Order", "textarea")] }),
  item("p7-cer-04", "phase-7", "Plan jaimala / varmala", "Prepare the garland exchange ceremony", { priority: "critical", template: "ceremony_program_builder", fields: [f("p7c04-garlands", "Garland Details", "textarea"), f("p7c04-setup", "Stage/Lift Setup", "textarea")] }),
  item("p7-cer-05", "phase-7", "Plan Ganesh puja", "Arrange the Ganesh puja to start the ceremony", { priority: "high", template: "puja_samagri_tracker", tags: ["hindu"], fields: [f("p7c05-items", "Puja Items", "textarea")] }),
  item("p7-cer-06", "phase-7", "Plan kanyadaan", "Organize the kanyadaan ritual and assign roles", { priority: "critical", template: "family_role_assigner", tags: ["hindu"], fields: [f("p7c06-father", "Father Role", "text"), f("p7c06-mother", "Mother Role", "text")] }),
  item("p7-cer-07", "phase-7", "Plan mangal pheras", "Determine 4 or 7 rounds and their meanings", { priority: "critical", template: "ceremony_program_builder", tags: ["hindu"], fields: [f("p7c07-rounds", "Number of Pheras", "select", { options: ["4", "7"] }), f("p7c07-meanings", "Phera Meanings", "textarea")] }),
  item("p7-cer-08", "phase-7", "Plan saptapadi (seven steps)", "Prepare the seven steps ritual", { priority: "critical", template: "ceremony_program_builder", tags: ["hindu"], fields: [f("p7c08-vows", "Seven Vows", "textarea")] }),
  item("p7-cer-09", "phase-7", "Plan sindoor / mangalsutra", "Arrange sindoor and mangalsutra for the ceremony", { priority: "critical", template: "ceremony_program_builder", tags: ["hindu"], fields: [f("p7c09-mangalsutra", "Mangalsutra Source", "text"), f("p7c09-sindoor", "Sindoor Box", "text")] }),
  item("p7-cer-10", "phase-7", "Plan ashirwad (blessings)", "Organize the blessing ceremony from elders", { priority: "high", template: "ceremony_program_builder", fields: [f("p7c10-order", "Blessing Order", "textarea")] }),
  item("p7-cer-11", "phase-7", "Plan vidaai (farewell)", "Prepare the emotional farewell ceremony", { priority: "high", template: "vidaai_planner", fields: [f("p7c11-plan", "Vidaai Plan", "textarea"), f("p7c11-car", "Departure Vehicle", "text")] }),
  item("p7-cer-12", "phase-7", "Document muhurat timing for key moments", "Record exact times for each major ritual", { priority: "critical", template: "muhurat_picker", module: "/timeline", fields: [f("p7c12-timings", "Ritual Timings", "textarea")] }),
  item("p7-cer-13", "phase-7", "Assign family roles", "Decide who does kanyadaan, holds chadar, etc.", { priority: "critical", template: "family_role_assigner", fields: [f("p7c13-roles", "Role Assignments", "textarea", { required: true })] }),
  item("p7-cer-14", "phase-7", "Procure puja samagri", "Get all ceremony items: kalash, coconut, rice, haldi, kumkum, diya, flowers, ghee, wood, fruits, mangalsutra, sindoor box, ring, silver items", { priority: "critical", template: "puja_samagri_tracker", fields: [f("p7c14-list", "Samagri Checklist", "textarea", { required: true }), f("p7c14-sourced", "Items Sourced", "textarea")] }),
  item("p7-cer-15", "phase-7", "Confirm who brings which ceremony items", "Assign responsibility: priest, couple, or decorator", { priority: "high", template: "puja_samagri_tracker", fields: [f("p7c15-assignments", "Item Assignments", "textarea")] }),
  item("p7-cer-16", "phase-7", "Plan ceremony microphone and translation", "Arrange mics and live translation for guests", { priority: "medium", fields: [f("p7c16-mics", "Mic Setup", "textarea"), f("p7c16-translation", "Translation Plan", "textarea")] }),
  item("p7-cer-17", "phase-7", "Plan family seating during ceremony", "Arrange family seating for the ceremony", { priority: "high", template: "seating_chart", fields: [f("p7c17-layout", "Seating Layout", "textarea")] }),
  item("p7-cer-18", "phase-7", "Plan photography angles during ceremony", "Brief the photographer on key ritual moments and angles", { priority: "medium", template: "photography_shot_list", categoryTags: ["photography"], workspaceTabTags: ["vision", "plan"], linkedEntities: { event_day_ids: ["wedding"] }, fields: [f("p7c18-shots", "Key Shots List", "textarea")] }),
  item("p7-cer-19", "phase-7", "Plan ceremony games", "Organize joota chupai (shoe stealing), ring in milk, etc.", { priority: "low", fields: [f("p7c19-games", "Games Planned", "multiselect", { options: ["Joota Chupai", "Ring in Milk", "Flower Shower", "Other"] }), f("p7c19-rules", "Game Rules/Tips", "textarea")] }),

  // Mehndi Ceremony Planning
  item("p7-mehndi-01", "phase-7", "Book mehndi artists for guests", "Calculate 1 artist per 15–20 guests and book accordingly", { priority: "high", template: "mehndi_workspace", module: "/mehndi", fields: [f("p7m01-artists", "Number of Artists", "text"), f("p7m01-vendor", "Mehndi Vendor", "vendor_picker"), f("p7m01-cost", "Cost", "currency")] }),
  item("p7-mehndi-02", "phase-7", "Plan bride's mehndi session", "Schedule the bride's 4–6 hour mehndi session (done first)", { priority: "critical", assigned: "bride", template: "mehndi_workspace", module: "/mehndi", fields: [f("p7m02-time", "Session Start Time", "text"), f("p7m02-duration", "Duration", "text")] }),
  item("p7-mehndi-03", "phase-7", "Plan bridal mehndi design", "Choose design style and plan hidden names/initials", { priority: "high", assigned: "bride", template: "mehndi_workspace", module: "/mehndi", fields: [f("p7m03-style", "Design Style", "select", { options: ["Rajasthani", "Arabic", "Indo-Arabic", "Modern", "Full Coverage"] }), f("p7m03-hidden", "Hidden Elements", "textarea"), f("p7m03-inspo", "Inspiration", "image_upload")] }),
  item("p7-mehndi-04", "phase-7", "Set up guest mehndi stations", "Arrange multiple stations for guest mehndi application", { priority: "medium", template: "mehndi_workspace", module: "/mehndi", fields: [f("p7m04-stations", "Number of Stations", "text"), f("p7m04-layout", "Station Layout", "textarea")] }),
  item("p7-mehndi-05", "phase-7", "Plan mehndi seating and cushions", "Arrange ghodi, low seating, cushions for comfort", { priority: "medium", module: "/mehndi", fields: [f("p7m05-setup", "Seating Setup", "textarea")] }),
  item("p7-mehndi-06", "phase-7", "Plan mehndi dhol and music", "Arrange dhol and background music for mehndi", { priority: "medium", template: "music_library", module: "/mehndi", fields: [f("p7m06-music", "Music Plan", "textarea")] }),
  item("p7-mehndi-07", "phase-7", "Plan mehndi live singers", "Book geet and tappe singers for mehndi", { priority: "medium", template: "vendor_booking", module: "/mehndi", fields: [f("p7m07-vendor", "Singers", "vendor_picker"), f("p7m07-cost", "Cost", "currency")] }),
  item("p7-mehndi-08", "phase-7", "Plan mehndi menu", "Arrange finger foods, chaat, and fresh juices", { priority: "medium", template: "catering_menu_builder", module: "/mehndi", fields: [f("p7m08-menu", "Menu", "textarea")] }),
  item("p7-mehndi-09", "phase-7", "Prepare mehndi care supplies", "Get lemon wedges, sugar water, and oil for mehndi setting", { priority: "medium", module: "/mehndi", fields: [f("p7m09-supplies", "Supplies List", "textarea")] }),
  item("p7-mehndi-10", "phase-7", "Plan mehndi favors", "Arrange small favors for mehndi guests", { priority: "low", template: "gift_tracker", module: "/mehndi", fields: [f("p7m10-favors", "Favor Ideas", "textarea"), f("p7m10-cost", "Cost per Favor", "currency")] }),

  // Sangeet Planning
  item("p7-sang-01", "phase-7", "Build sangeet run-of-show", "Create a detailed timeline with the emcee", { priority: "critical", template: "sangeet_run_of_show", module: "/entertainment", fields: [f("p7s01-timeline", "Run of Show", "textarea", { required: true })] }),
  item("p7-sang-02", "phase-7", "Schedule bride's family performance", "Plan and rehearse bride's family dance", { priority: "high", template: "choreography_planner", module: "/entertainment", fields: [f("p7s02-song", "Song", "text"), f("p7s02-performers", "Performers", "textarea"), f("p7s02-rehearsal", "Rehearsal Dates", "textarea")] }),
  item("p7-sang-03", "phase-7", "Schedule groom's family performance", "Plan and rehearse groom's family dance", { priority: "high", template: "choreography_planner", module: "/entertainment", fields: [f("p7s03-song", "Song", "text"), f("p7s03-performers", "Performers", "textarea")] }),
  item("p7-sang-04", "phase-7", "Schedule friends' performances", "Organize friend group dance numbers", { priority: "medium", template: "choreography_planner", module: "/entertainment", fields: [f("p7s04-acts", "Friend Acts", "textarea")] }),
  item("p7-sang-05", "phase-7", "Plan couple's dance", "Prepare the couple's joint performance", { priority: "high", template: "choreography_planner", module: "/entertainment", fields: [f("p7s05-song", "Song", "text"), f("p7s05-style", "Dance Style", "text")] }),
  item("p7-sang-06", "phase-7", "Schedule kids' performance", "Organize a kids' dance number", { priority: "low", template: "choreography_planner", module: "/entertainment", fields: [f("p7s06-kids", "Kids Performing", "textarea"), f("p7s06-song", "Song", "text")] }),
  item("p7-sang-07", "phase-7", "Coordinate all rehearsals", "Schedule rehearsal sessions for all sangeet performances", { priority: "high", template: "choreography_planner", module: "/entertainment", fields: [f("p7s07-schedule", "Rehearsal Calendar", "textarea")] }),
  item("p7-sang-08", "phase-7", "Prepare couple's slideshow/video", "Create a montage of the couple's journey for sangeet screening", { priority: "medium", module: "/entertainment", categoryTags: ["entertainment", "photography"], workspaceTabTags: ["plan"], linkedEntities: { event_day_ids: ["sangeet"] }, fields: [f("p7s08-vendor", "Video Editor", "vendor_picker"), f("p7s08-photos", "Photo Selection", "file_upload")] }),
  item("p7-sang-09", "phase-7", "Plan sangeet speeches", "Organize speeches from parents, siblings, best man/maid of honor", { priority: "medium", template: "speech_planner", module: "/entertainment", fields: [f("p7s09-speakers", "Speakers & Order", "textarea")] }),
  item("p7-sang-10", "phase-7", "Plan sangeet games", "Organize Mr. & Mrs., shoe game, trivia, etc.", { priority: "medium", module: "/entertainment", fields: [f("p7s10-games", "Games Planned", "multiselect", { options: ["Mr. & Mrs. Quiz", "Shoe Game", "Couple Trivia", "Dance Battle", "Karaoke"] })] }),
  item("p7-sang-11", "phase-7", "Plan open dance floor", "Design the open dance floor segment with DJ and lighting", { priority: "medium", template: "music_library", module: "/entertainment", fields: [f("p7s11-playlist", "Dance Playlist", "textarea")] }),

  // Haldi Planning
  item("p7-haldi-01", "phase-7", "Plan haldi paste preparation", "Arrange turmeric, sandalwood, rose water, and milk for haldi paste", { priority: "high", template: "haldi_planner", fields: [f("p7h01-ingredients", "Ingredients", "textarea"), f("p7h01-quantity", "Quantity", "textarea")] }),
  item("p7-haldi-02", "phase-7", "Arrange haldi clothes", "Ensure old/designated-to-stain clothes are ready for bride and groom", { priority: "medium", template: "haldi_planner", fields: [f("p7h02-bride", "Bride's Outfit", "text"), f("p7h02-groom", "Groom's Outfit", "text")] }),
  item("p7-haldi-03", "phase-7", "Arrange floor protection", "Get plastic sheets and towels for flooring protection", { priority: "medium", template: "haldi_planner", fields: [f("p7h03-supplies", "Supplies Needed", "textarea")] }),
  item("p7-haldi-04", "phase-7", "Plan rinse/shower afterward", "Arrange shower or rinse stations for after haldi", { priority: "medium", template: "haldi_planner", fields: [f("p7h04-plan", "Rinse Plan", "textarea")] }),
  item("p7-haldi-05", "phase-7", "Plan flower petal shower", "Arrange flower petals for the shower concept", { priority: "medium", template: "haldi_planner", fields: [f("p7h05-flowers", "Flower Type", "text"), f("p7h05-quantity", "Quantity", "text")] }),
  item("p7-haldi-06", "phase-7", "Plan haldi music", "Arrange traditional folk music for haldi", { priority: "low", template: "music_library", fields: [f("p7h06-playlist", "Playlist", "textarea")] }),
  item("p7-haldi-07", "phase-7", "Plan haldi menu", "Arrange traditional homestyle menu for haldi", { priority: "medium", template: "catering_menu_builder", fields: [f("p7h07-menu", "Menu", "textarea")] }),

  // Reception Planning
  item("p7-recep-01", "phase-7", "Plan reception grand entrance", "Design the couple's grand entrance at reception", { priority: "high", template: "reception_planner", fields: [f("p7r01-concept", "Entrance Concept", "textarea"), f("p7r01-song", "Entrance Song", "text")] }),
  item("p7-recep-02", "phase-7", "Plan first dance", "Choose song and prepare choreography for first dance", { priority: "medium", template: "reception_planner", fields: [f("p7r02-song", "Song", "text"), f("p7r02-lessons", "Dance Lessons", "select", { options: ["Yes", "No"] })] }),
  item("p7-recep-03", "phase-7", "Plan cake cutting", "Arrange cake and cutting ceremony", { priority: "medium", template: "reception_planner", fields: [f("p7r03-cake", "Cake Details", "textarea"), f("p7r03-baker", "Baker", "vendor_picker")] }),
  item("p7-recep-04", "phase-7", "Plan reception speeches", "Organize speech order and speakers", { priority: "medium", template: "speech_planner", fields: [f("p7r04-speakers", "Speakers & Order", "textarea")] }),
  item("p7-recep-05", "phase-7", "Plan toast / champagne pour", "Arrange champagne toast logistics", { priority: "low", template: "reception_planner", fields: [f("p7r05-plan", "Toast Plan", "textarea")] }),
  item("p7-recep-06", "phase-7", "Plan bouquet/garter toss if fusion", "Include Western traditions if desired", { priority: "low", template: "reception_planner", tags: ["fusion"], fields: [f("p7r06-include", "Include", "select", { options: ["Yes", "No"] })] }),
  item("p7-recep-07", "phase-7", "Plan reception dance floor", "Design the open dance floor segment", { priority: "medium", template: "reception_planner", fields: [f("p7r07-playlist", "Playlist Concept", "textarea")] }),
  item("p7-recep-08", "phase-7", "Plan farewell / send-off", "Design the couple's departure: sparklers, petals, confetti, etc.", { priority: "medium", template: "reception_planner", fields: [f("p7r08-concept", "Send-Off Concept", "select", { options: ["Sparkler Tunnel", "Petal Toss", "Confetti", "Car Decoration", "Fireworks"] })] }),
];

// ── Phase 8: Gifts & Favors ────────────────────────────────────────────────

const p8: ChecklistItem[] = [
  item("p8-gift-01", "phase-8", "Gifts for parents (both sides)", "Select meaningful gifts for both sets of parents", { priority: "high", template: "gift_tracker", fields: [f("p8g01-bride-parents", "Bride's Parents Gift", "textarea"), f("p8g01-groom-parents", "Groom's Parents Gift", "textarea"), f("p8g01-budget", "Budget", "currency")] }),
  item("p8-gift-02", "phase-8", "Gifts for siblings", "Choose gifts for brothers and sisters", { priority: "medium", template: "gift_tracker", fields: [f("p8g02-gifts", "Sibling Gifts", "textarea"), f("p8g02-budget", "Budget", "currency")] }),
  item("p8-gift-03", "phase-8", "Gifts for bridal party", "Select gifts for bridesmaids and groomsmen", { priority: "medium", template: "gift_tracker", fields: [f("p8g03-bridesmaids", "Bridesmaid Gifts", "textarea"), f("p8g03-groomsmen", "Groomsmen Gifts", "textarea"), f("p8g03-budget", "Budget", "currency")] }),
  item("p8-gift-04", "phase-8", "Gift for partner", "Choose a special morning-of-wedding gift for your partner", { priority: "medium", template: "gift_tracker", fields: [f("p8g04-gift", "Gift Idea", "textarea"), f("p8g04-budget", "Budget", "currency")] }),
  item("p8-gift-05", "phase-8", "Gifts for priest", "Prepare gifts and dakshina for the priest", { priority: "medium", template: "gift_tracker", fields: [f("p8g05-gift", "Gift Details", "textarea"), f("p8g05-amount", "Dakshina Amount", "currency")] }),
  item("p8-gift-06", "phase-8", "Gifts for standout vendors", "Show appreciation for vendors who went above and beyond", { priority: "low", template: "gift_tracker", fields: [f("p8g06-vendors", "Vendor Gift List", "textarea")] }),
  item("p8-gift-07", "phase-8", "Prepare shagun envelopes", "Prepare saagan / shagun envelopes with cash gifts", { priority: "high", assigned: "family", template: "gift_tracker", tags: ["north-indian", "punjabi"], fields: [f("p8g07-list", "Envelope List", "textarea"), f("p8g07-total", "Total Amount", "currency")] }),
  item("p8-gift-08", "phase-8", "Prepare vendor tips", "Pre-calculate tips for caterers, drivers, valet, and staff", { priority: "medium", template: "tip_envelope_planner", fields: [f("p8g08-tips", "Tip Breakdown", "textarea"), f("p8g08-total", "Total Tips", "currency")] }),
  item("p8-gift-09", "phase-8", "Plan bachelor and bachelorette parties", "Tell the wedding party what kind of bach parties you want — destination, low-key, themed, or none", { priority: "medium", template: "gift_tracker", fields: [f("p8g09-bachelor", "Bachelor Party Vibe", "select", { options: ["Destination Trip", "Local Weekend", "Night Out", "Low-Key", "None"] }), f("p8g09-bachelorette", "Bachelorette Party Vibe", "select", { options: ["Destination Trip", "Local Weekend", "Night Out", "Spa Day", "Low-Key", "None"] }), f("p8g09-dates", "Target Dates", "text"), f("p8g09-notes", "Notes for Wedding Party", "textarea")] }),
  item("p8-gift-10", "phase-8", "Plan parent thank-you gift (trip or experience)", "Book a special thank-you trip, experience, or heirloom gift for both sets of parents", { priority: "medium", assigned: "both", template: "gift_tracker", fields: [f("p8g10-type", "Gift Type", "select", { options: ["Trip", "Experience", "Jewelry/Heirloom", "Spa Weekend", "Other"] }), f("p8g10-brides", "Bride's Parents", "textarea"), f("p8g10-grooms", "Groom's Parents", "textarea"), f("p8g10-budget", "Budget", "currency")] }),

  // Guest Favors
  item("p8-favor-01", "phase-8", "Decide favor concept per event", "Plan the overall theme for guest favors at each event", { priority: "medium", template: "gift_tracker", fields: [f("p8f01-concepts", "Favor Concepts per Event", "textarea")] }),
  item("p8-favor-02", "phase-8", "Plan mehndi favors", "Arrange mini mehndi cones, bangles, or similar", { priority: "low", template: "gift_tracker", fields: [f("p8f02-items", "Favor Items", "textarea"), f("p8f02-cost", "Cost per Favor", "currency")] }),
  item("p8-favor-03", "phase-8", "Plan sangeet favors", "Arrange mini liquor bottles, candles, or similar", { priority: "low", template: "gift_tracker", fields: [f("p8f03-items", "Favor Items", "textarea"), f("p8f03-cost", "Cost per Favor", "currency")] }),
  item("p8-favor-04", "phase-8", "Plan wedding favors", "Arrange mithai boxes, silver coins, potli bags, etc.", { priority: "medium", template: "gift_tracker", fields: [f("p8f04-items", "Favor Items", "textarea"), f("p8f04-cost", "Cost per Favor", "currency")] }),
  item("p8-favor-05", "phase-8", "Plan reception favors", "Arrange custom chocolates, monogrammed items, etc.", { priority: "low", template: "gift_tracker", fields: [f("p8f05-items", "Favor Items", "textarea"), f("p8f05-cost", "Cost per Favor", "currency")] }),
  item("p8-favor-06", "phase-8", "Finalize welcome bag contents", "Complete the welcome bag item list", { priority: "medium", template: "welcome_bag_builder", fields: [f("p8f06-items", "Final Item List", "textarea")] }),
  item("p8-favor-07", "phase-8", "Design packaging and tags", "Create branded packaging and favor tags", { priority: "medium", fields: [f("p8f07-design", "Packaging Design", "image_upload"), f("p8f07-tags", "Tag Design", "image_upload")] }),
  item("p8-favor-08", "phase-8", "Plan favor delivery/distribution", "Organize how favors will be distributed at each event", { priority: "medium", fields: [f("p8f08-plan", "Distribution Plan", "textarea")] }),

  // Registry
  item("p8-reg-01", "phase-8", "Set up registry", "Create registry on Crate & Barrel, Amazon, Zola, or honeymoon fund", { priority: "medium", template: "registry_manager", fields: [f("p8r01-platforms", "Registry Platforms", "multiselect", { options: ["Amazon", "Crate & Barrel", "Zola", "The Knot", "Honeymoon Fund", "Charity Registry"] }), f("p8r01-links", "Registry Links", "textarea")] }),
  item("p8-reg-02", "phase-8", "Add registry link to website", "Publish registry links on the wedding website", { priority: "medium", template: "registry_manager", deps: ["p8-reg-01"], fields: [f("p8r02-published", "Published", "select", { options: ["Yes", "No"] })] }),
  item("p8-reg-03", "phase-8", "Add mix of price points", "Include items at various price points for all budgets", { priority: "medium", template: "registry_manager", deps: ["p8-reg-01"], fields: [f("p8r03-range", "Price Range", "textarea")] }),
  item("p8-reg-04", "phase-8", "Track gifts received", "Log all gifts received and their senders", { priority: "high", template: "gift_tracker", fields: [f("p8r04-tracker", "Gift Log", "textarea")] }),
  item("p8-reg-05", "phase-8", "Note who gave what for thank yous", "Record gift details for personalized thank you notes", { priority: "high", template: "thank_you_tracker", fields: [f("p8r05-log", "Gift Attribution Log", "textarea")] }),
];

// ── Phase 9: Legal & Administrative ─────────────────────────────────────────

const p9: ChecklistItem[] = [
  item("p9-legal-01", "phase-9", "Obtain marriage license", "Apply for marriage license in the correct jurisdiction", { priority: "critical", fields: [f("p9l01-jurisdiction", "Jurisdiction", "text"), f("p9l01-date", "Application Date", "date"), f("p9l01-cost", "Fee", "currency")] }),
  item("p9-legal-02", "phase-9", "Understand license validity window", "Note how long the license is valid and plan accordingly", { priority: "high", fields: [f("p9l02-validity", "Valid For", "text"), f("p9l02-expires", "Expiry Date", "date")] }),
  item("p9-legal-03", "phase-9", "Decide legal vs religious ceremony distinction", "Determine if the legal ceremony is separate from the religious one", { priority: "high", fields: [f("p9l03-approach", "Approach", "select", { options: ["Combined", "Separate Legal", "Courthouse + Religious"] })] }),
  item("p9-legal-04", "phase-9", "Plan courthouse ceremony if needed", "Schedule a courthouse ceremony if doing a separate legal wedding", { priority: "medium", fields: [f("p9l04-date", "Courthouse Date", "date"), f("p9l04-location", "Courthouse", "text")] }),
  item("p9-legal-05", "phase-9", "Prepare required documents", "Gather IDs, birth certificates, divorce decrees if applicable", { priority: "critical", fields: [f("p9l05-docs", "Documents Checklist", "multiselect", { options: ["Government ID", "Birth Certificate", "Passport", "Divorce Decree", "Death Certificate", "Witness IDs"] })] }),
  item("p9-legal-06", "phase-9", "Plan name change", "Prepare for Social Security, driver's license, passport, and bank account changes", { priority: "medium", fields: [f("p9l06-plan", "Name Change Plan", "textarea"), f("p9l06-new-name", "New Legal Name", "text")] }),
  item("p9-legal-07", "phase-9", "Update emergency contacts", "Change emergency contacts across all relevant accounts", { priority: "low", fields: [f("p9l07-updated", "Updated", "select", { options: ["Yes", "No", "In Progress"] })] }),
  item("p9-legal-08", "phase-9", "Update insurance policies", "Add spouse to health, auto, home insurance", { priority: "medium", fields: [f("p9l08-policies", "Policies to Update", "textarea")] }),
  item("p9-legal-09", "phase-9", "Review joint financial planning", "Discuss joint accounts, investments, and financial goals", { priority: "medium", fields: [f("p9l09-plan", "Financial Plan", "textarea")] }),
  item("p9-legal-10", "phase-9", "Consider prenuptial agreement", "Discuss and draft prenup if applicable", { priority: "low", fields: [f("p9l10-needed", "Prenup Needed", "select", { options: ["Yes", "No", "Discussing"] }), f("p9l10-lawyer", "Lawyer", "text")] }),
  item("p9-legal-11", "phase-9", "Update wills and beneficiaries", "Update legal documents with new spouse as beneficiary", { priority: "medium", fields: [f("p9l11-updated", "Updated", "select", { options: ["Yes", "No", "In Progress"] })] }),
  item("p9-legal-12", "phase-9", "Handle visa/immigration paperwork", "Complete any cross-border paperwork if applicable", { priority: "high", tags: ["cross-border"], fields: [f("p9l12-type", "Visa Type", "text"), f("p9l12-lawyer", "Immigration Lawyer", "text"), f("p9l12-deadline", "Filing Deadline", "date")] }),
  item("p9-honey-01", "phase-9", "Book honeymoon flights", "Purchase flights for the honeymoon", { priority: "high", template: "honeymoon_planner", fields: [f("p9h01-destination", "Destination", "text", { required: true }), f("p9h01-dates", "Travel Dates", "text"), f("p9h01-cost", "Flight Cost", "currency")] }),
  item("p9-honey-02", "phase-9", "Book honeymoon accommodation", "Reserve hotels/resorts for the honeymoon", { priority: "high", template: "honeymoon_planner", fields: [f("p9h02-hotel", "Hotel/Resort", "text"), f("p9h02-cost", "Accommodation Cost", "currency")] }),
  item("p9-honey-03", "phase-9", "Plan honeymoon activities", "Research and book activities and excursions", { priority: "medium", template: "honeymoon_planner", fields: [f("p9h03-activities", "Activities", "textarea")] }),
  item("p9-honey-04", "phase-9", "Get travel insurance", "Purchase comprehensive travel insurance for the honeymoon", { priority: "medium", template: "honeymoon_planner", fields: [f("p9h04-provider", "Provider", "text"), f("p9h04-cost", "Cost", "currency")] }),
  item("p9-honey-05", "phase-9", "Arrange international phone plan", "Set up phone service for international travel", { priority: "low", template: "honeymoon_planner", fields: [f("p9h05-plan", "Plan Details", "textarea")] }),
  item("p9-honey-06", "phase-9", "Check passport validity", "Ensure passports are valid for 6+ months past travel date", { priority: "high", template: "honeymoon_planner", fields: [f("p9h06-bride-exp", "Bride Passport Expiry", "date"), f("p9h06-groom-exp", "Groom Passport Expiry", "date")] }),
  item("p9-honey-07", "phase-9", "Book local photographer at honeymoon destination", "Hire a local photographer for a couple's session at the honeymoon destination", { priority: "low", template: "honeymoon_planner", categoryTags: ["photography"], workspaceTabTags: ["shortlist", "plan"], fields: [f("p9h07-photographer", "Photographer", "vendor_picker"), f("p9h07-date", "Session Date", "date"), f("p9h07-location", "Shoot Location", "text"), f("p9h07-cost", "Cost", "currency")] }),
];

// ── Phase 10: Final Month ───────────────────────────────────────────────────

const p10: ChecklistItem[] = [
  // Week 4
  item("p10-w4-01", "phase-10", "Final dress fittings for bride and groom", "Complete last fitting sessions for wedding outfits", { priority: "critical", module: "/outfits", fields: [f("p10w401-bride-date", "Bride Fitting Date", "date"), f("p10w401-groom-date", "Groom Fitting Date", "date")] }),
  item("p10-w4-02", "phase-10", "Final family attire fittings", "Complete fittings for parents and bridal party", { priority: "high", assigned: "family", module: "/outfits", fields: [f("p10w402-schedule", "Fitting Schedule", "textarea")] }),
  item("p10-w4-03", "phase-10", "Confirm all vendor contracts in writing", "Send written confirmations to every vendor with final timelines", { priority: "critical", assigned: "planner", template: "contract_manager", fields: [f("p10w403-confirmed", "Vendors Confirmed", "textarea")] }),
  item("p10-w4-04", "phase-10", "Share master timeline with every vendor", "Distribute the comprehensive event timeline to all vendors", { priority: "critical", assigned: "planner", module: "/timeline", fields: [f("p10w404-timeline", "Timeline Document", "file_upload")] }),
  item("p10-w4-05", "phase-10", "Confirm final headcounts to caterer", "Send final guest counts per event to the caterer", { priority: "critical", module: "/guests", fields: [f("p10w405-counts", "Final Headcounts", "textarea")] }),
  item("p10-w4-06", "phase-10", "Confirm final floral count", "Finalize flower quantities with the florist", { priority: "high", fields: [f("p10w406-count", "Final Floral Count", "textarea")] }),
  item("p10-w4-07", "phase-10", "Finalize seating chart", "Complete and print final seating arrangements", { priority: "high", template: "seating_chart", module: "/guests", fields: [f("p10w407-chart", "Final Seating Chart", "file_upload")] }),
  item("p10-w4-08", "phase-10", "Pick up marriage license", "Collect the marriage license from the clerk's office", { priority: "critical", fields: [f("p10w408-picked", "Picked Up", "select", { options: ["Yes", "No"] }), f("p10w408-date", "Pickup Date", "date")] }),
  item("p10-w4-09", "phase-10", "Confirm honeymoon bookings", "Reconfirm all honeymoon reservations", { priority: "high", template: "honeymoon_planner", fields: [f("p10w409-confirmed", "All Confirmed", "select", { options: ["Yes", "No"] })] }),
  item("p10-w4-10", "phase-10", "Start breaking in shoes", "Wear new shoes around the house to break them in", { priority: "medium", fields: [f("p10w410-started", "Started", "select", { options: ["Yes", "No"] })] }),
  item("p10-w4-11", "phase-10", "Final mehndi trial", "Do a final test of mehndi design and darkness", { priority: "medium", assigned: "bride", template: "mehndi_workspace", fields: [f("p10w411-date", "Trial Date", "date"), f("p10w411-notes", "Notes", "textarea")] }),
  item("p10-w4-12", "phase-10", "Final makeup trial", "Complete the final makeup trial with look adjustments", { priority: "high", assigned: "bride", template: "beauty_timeline", categoryTags: ["hmua", "photography"], workspaceTabTags: ["plan"], fields: [f("p10w412-date", "Trial Date", "date"), f("p10w412-photos", "Trial Photos", "image_upload")] }),
  item("p10-w4-13", "phase-10", "Schedule pedicures", "Book pedicure appointments for the wedding week", { priority: "medium", assigned: "bride", fields: [f("p10w413-date", "Appointment Date", "date")] }),

  // Week 3
  item("p10-w3-01", "phase-10", "Create day-of emergency kit", "Assemble a kit with sewing supplies, pain relievers, stain remover, snacks, etc.", { priority: "high", template: "day_of_emergency_kit", fields: [f("p10w301-items", "Kit Contents", "textarea", { required: true })] }),
  item("p10-w3-02", "phase-10", "Print all day-of stationery", "Print programs, signs, menus, place cards, and all event paper", { priority: "high", module: "/stationery", fields: [f("p10w302-items", "Items to Print", "textarea"), f("p10w302-printed", "Printed", "select", { options: ["Yes", "No", "In Progress"] })] }),
  item("p10-w3-03", "phase-10", "Assemble welcome bags", "Put together all welcome bag contents", { priority: "high", template: "welcome_bag_builder", fields: [f("p10w303-count", "Bags Assembled", "text"), f("p10w303-total", "Total Needed", "text")] }),
  item("p10-w3-04", "phase-10", "Write vows / speeches", "Finalize personal vows and any speeches", { priority: "high", template: "speech_planner", fields: [f("p10w304-vows", "Vows Draft", "textarea"), f("p10w304-speech", "Speech Draft", "textarea")] }),
  item("p10-w3-05", "phase-10", "Practice first dance", "Rehearse the first dance choreography", { priority: "medium", fields: [f("p10w305-sessions", "Practice Sessions Completed", "text")] }),
  item("p10-w3-06", "phase-10", "Confirm transportation", "Reconfirm all transportation arrangements", { priority: "high", template: "transportation_grid", module: "/transportation", fields: [f("p10w306-confirmed", "All Confirmed", "select", { options: ["Yes", "No"] })] }),
  item("p10-w3-07", "phase-10", "Confirm hotel blocks and check-ins", "Verify room blocks and early check-in arrangements", { priority: "high", template: "accommodation_blocks", fields: [f("p10w307-confirmed", "Hotel Confirmed", "select", { options: ["Yes", "No"] })] }),
  item("p10-w3-08", "phase-10", "Delegate day-of responsibilities", "Assign specific tasks to family members and wedding party", { priority: "high", template: "family_role_assigner", fields: [f("p10w308-assignments", "Task Assignments", "textarea", { required: true })] }),
  item("p10-w3-09", "phase-10", "Pack honeymoon luggage early", "Start packing for the honeymoon to avoid last-minute stress", { priority: "medium", fields: [f("p10w309-packed", "Packing Status", "select", { options: ["Not Started", "In Progress", "Done"] })] }),
  item("p10-w3-10", "phase-10", "Send detailed itinerary to immediate family", "Share the complete event schedule with close family", { priority: "high", module: "/timeline", fields: [f("p10w310-sent", "Sent", "select", { options: ["Yes", "No"] })] }),

  // Week 2
  item("p10-w2-01", "phase-10", "Pick up final attire", "Collect all outfits from designers/tailors", { priority: "critical", module: "/outfits", fields: [f("p10w201-picked", "All Picked Up", "select", { options: ["Yes", "No", "Partial"] })] }),
  item("p10-w2-02", "phase-10", "Inspect outfits for damage", "Carefully check every outfit for defects or issues", { priority: "high", module: "/outfits", fields: [f("p10w202-inspected", "Inspection Complete", "select", { options: ["Yes", "No"] }), f("p10w202-issues", "Issues Found", "textarea")] }),
  item("p10-w2-03", "phase-10", "Steam / iron outfits", "Press all outfits so they're ready to wear", { priority: "medium", module: "/outfits", fields: [f("p10w203-done", "Complete", "select", { options: ["Yes", "No"] })] }),
  item("p10-w2-04", "phase-10", "Final headcount 72 hours out", "Get the final-final guest count 3 days before", { priority: "critical", module: "/guests", fields: [f("p10w204-count", "Final Count", "text")] }),
  item("p10-w2-05", "phase-10", "Confirm all payments and final balances", "Settle any remaining vendor payments", { priority: "critical", module: "/budget", fields: [f("p10w205-paid", "All Paid", "select", { options: ["Yes", "No", "Partial"] }), f("p10w205-remaining", "Remaining Balance", "currency")] }),
  item("p10-w2-06", "phase-10", "Confirm vendor arrival times", "Reconfirm what time each vendor arrives on event day", { priority: "high", assigned: "planner", fields: [f("p10w206-schedule", "Arrival Schedule", "textarea")] }),
  item("p10-w2-07", "phase-10", "Pre-pay tips in envelopes", "Prepare labeled tip envelopes for each vendor", { priority: "medium", template: "tip_envelope_planner", fields: [f("p10w207-envelopes", "Envelope List", "textarea"), f("p10w207-total", "Total Tips", "currency")] }),
  item("p10-w2-08", "phase-10", "Pack ceremony items", "Ensure rings, sindoor, mangalsutra are safely packed", { priority: "critical", template: "puja_samagri_tracker", fields: [f("p10w208-items", "Packed Items Checklist", "textarea")] }),
  item("p10-w2-09", "phase-10", "Rehearse baraat walk", "Practice the baraat procession route and timing", { priority: "medium", assigned: "groom", template: "baraat_planner", fields: [f("p10w209-date", "Rehearsal Date", "date")] }),
  item("p10-w2-10", "phase-10", "Rehearse sangeet performances", "Final run-throughs for all sangeet numbers", { priority: "high", template: "choreography_planner", module: "/entertainment", fields: [f("p10w210-schedule", "Final Rehearsal Schedule", "textarea")] }),

  // Week 1
  item("p10-w1-01", "phase-10", "Manicure and pedicure", "Final nail appointments before the wedding", { priority: "medium", assigned: "bride", template: "beauty_timeline", fields: [f("p10w101-date", "Appointment Date", "date")] }),
  item("p10-w1-02", "phase-10", "Hair color touch-up", "Get hair color refreshed if needed", { priority: "medium", assigned: "bride", template: "beauty_timeline", fields: [f("p10w102-date", "Appointment Date", "date")] }),
  item("p10-w1-03", "phase-10", "Final wax / threading", "Complete final hair removal appointments", { priority: "medium", assigned: "bride", template: "beauty_timeline", fields: [f("p10w103-date", "Appointment Date", "date")] }),
  item("p10-w1-04", "phase-10", "Facial (5 days before)", "Get the last facial — not closer than 5 days before", { priority: "medium", assigned: "bride", template: "beauty_timeline", fields: [f("p10w104-date", "Facial Date", "date")] }),
  item("p10-w1-05", "phase-10", "Hydration and rest", "Prioritize sleep, water, and minimal stress", { priority: "high", fields: [f("p10w105-notes", "Wellness Notes", "textarea")] }),
  item("p10-w1-06", "phase-10", "Light workouts only", "Avoid intense exercise to prevent injury or exhaustion", { priority: "low", fields: [f("p10w106-plan", "Light Exercise Plan", "textarea")] }),
  item("p10-w1-07", "phase-10", "Avoid new foods", "Stick to familiar foods to prevent digestive issues", { priority: "medium", fields: [f("p10w107-noted", "Acknowledged", "select", { options: ["Yes"] })] }),
  item("p10-w1-08", "phase-10", "Confirm weather and backup plans", "Check weather forecasts and activate backup plans if needed", { priority: "high", assigned: "planner", fields: [f("p10w108-forecast", "Forecast", "textarea"), f("p10w108-backup", "Backup Plan", "textarea")] }),
  item("p10-w1-09", "phase-10", "Charge all electronics", "Charge phones, cameras, speakers, and power banks", { priority: "medium", fields: [f("p10w109-done", "Complete", "select", { options: ["Yes", "No"] })] }),
  item("p10-w1-10", "phase-10", "Download backup playlists", "Save music offline in case of internet issues", { priority: "medium", template: "music_library", fields: [f("p10w110-done", "Downloaded", "select", { options: ["Yes", "No"] })] }),
  item("p10-w1-11", "phase-10", "Review ceremony details with priest", "Final walkthrough of ceremony rituals and timing", { priority: "critical", template: "ceremony_program_builder", fields: [f("p10w111-reviewed", "Reviewed", "select", { options: ["Yes", "No"] })] }),
  item("p10-w1-12", "phase-10", "Welcome out-of-town guests", "Greet arriving guests at the hotel or airport", { priority: "high", assigned: "family", fields: [f("p10w112-arrivals", "Arrival Schedule", "textarea")] }),
  item("p10-w1-13", "phase-10", "Ganesh puja to start wedding week", "Hold a traditional Ganesh puja to mark the start of festivities", { priority: "high", template: "puja_samagri_tracker", tags: ["hindu"], fields: [f("p10w113-date", "Puja Date", "date"), f("p10w113-items", "Puja Items", "textarea")] }),
  item("p10-w1-14", "phase-10", "Pick up wedding rings", "Collect wedding bands from the jeweler (engraving, resizing complete)", { priority: "critical", fields: [f("p10w114-picked", "Picked Up", "select", { options: ["Yes", "No"] }), f("p10w114-date", "Pickup Date", "date"), f("p10w114-location", "Stored Safely At", "text")] }),
  item("p10-w1-15", "phase-10", "Tell wedding party what to wear the morning of", "Send morning-of outfit guidance to wedding party — getting-ready robes, coordinated loungewear, etc.", { priority: "medium", assigned: "bride", fields: [f("p10w115-outfit", "Morning Outfit", "text"), f("p10w115-sent", "Instructions Sent", "select", { options: ["Yes", "No"] })] }),
  item("p10-w1-16", "phase-10", "Send HMU schedule to wedding party", "Send each wedding-party member their hair and makeup arrival time and location", { priority: "high", assigned: "bride", template: "beauty_timeline", fields: [f("p10w116-schedule", "HMU Schedule", "textarea", { required: true, helper: "Name, time slot, chair, stylist" }), f("p10w116-sent", "Sent", "select", { options: ["Yes", "No"] })] }),
  item("p10-w1-17", "phase-10", "Schedule pre-wedding massage", "Book a relaxing massage for stress relief in the final week", { priority: "low", fields: [f("p10w117-date", "Appointment Date", "date"), f("p10w117-provider", "Spa/Therapist", "text")] }),
  item("p10-w1-18", "phase-10", "Check registry for remaining gifts", "Verify registry still has items at a range of price points for late gift-givers", { priority: "low", template: "registry_manager", fields: [f("p10w118-reviewed", "Reviewed", "select", { options: ["Yes", "No"] }), f("p10w118-added", "Items Added", "textarea")] }),
  item("p10-w1-19", "phase-10", "Pack bag for wedding night", "Pack overnight bag for the wedding-night suite: pyjamas, toiletries, change of clothes", { priority: "medium", fields: [f("p10w119-items", "Bag Contents", "textarea"), f("p10w119-packed", "Packed", "select", { options: ["Yes", "No"] })] }),
  item("p10-w1-20", "phase-10", "Pack bride's reception handbag", "Pack a small clutch/potli for the reception: phone, lipstick, touch-up kit, tissues, safety pins", { priority: "medium", assigned: "bride", fields: [f("p10w120-items", "Handbag Contents", "textarea"), f("p10w120-packed", "Packed", "select", { options: ["Yes", "No"] })] }),
];

// ── Phase 11: Event Days ────────────────────────────────────────────────────

const p11: ChecklistItem[] = [
  // Welcome Day
  item("p11-welcome-01", "phase-11", "Welcome desk setup at hotel", "Set up a welcome desk for guest check-in", { priority: "high", assigned: "planner", eventDay: { eventDay: "welcome", hoursBefore: 4 }, fields: [f("p11w01-location", "Desk Location", "text"), f("p11w01-staff", "Staff Assigned", "textarea")] }),
  item("p11-welcome-02", "phase-11", "Distribute welcome bags", "Hand out welcome bags to arriving guests", { priority: "high", template: "welcome_bag_builder", eventDay: { eventDay: "welcome", hoursBefore: 3 }, fields: [f("p11w02-distributed", "Distributed", "select", { options: ["Yes", "No", "In Progress"] })] }),
  item("p11-welcome-03", "phase-11", "Welcome dinner", "Host the welcome dinner for guests", { priority: "high", eventDay: { eventDay: "welcome", hoursBefore: 0 }, fields: [f("p11w03-venue", "Venue", "text"), f("p11w03-time", "Dinner Time", "text")] }),
  item("p11-welcome-04", "phase-11", "Informal mingling", "Facilitate casual socializing among guests", { priority: "low", eventDay: { eventDay: "welcome", hoursBefore: -2 }, fields: [f("p11w04-activities", "Activities Planned", "textarea")] }),

  // Ganesh Puja
  item("p11-puja-01", "phase-11", "Home ceremony — Ganesh Puja", "Conduct the Ganesh Puja / Griha Pravesh ceremony", { priority: "high", template: "puja_samagri_tracker", tags: ["hindu"], eventDay: { eventDay: "ganesh_puja", hoursBefore: 0 }, fields: [f("p11p01-time", "Ceremony Time", "text"), f("p11p01-items", "Items Ready", "select", { options: ["Yes", "No"] })] }),
  item("p11-puja-02", "phase-11", "Coordinate immediate family attendance", "Ensure only immediate family attends the intimate ceremony", { priority: "medium", assigned: "family", eventDay: { eventDay: "ganesh_puja", hoursBefore: 1 }, fields: [f("p11p02-list", "Attendee List", "textarea")] }),
  item("p11-puja-03", "phase-11", "Photographer optional for puja", "Decide if a photographer should capture the home ceremony", { priority: "low", eventDay: { eventDay: "ganesh_puja", hoursBefore: 1 }, categoryTags: ["photography"], workspaceTabTags: ["plan", "decisions"], linkedEntities: { event_day_ids: ["ganesh_puja"] }, fields: [f("p11p03-include", "Include Photographer", "select", { options: ["Yes", "No"] })] }),

  // Mehndi Day
  item("p11-mehndi-01", "phase-11", "Bride's mehndi session (morning)", "Complete the bride's 4–6 hour mehndi application", { priority: "critical", assigned: "bride", template: "mehndi_workspace", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: 3 }, fields: [f("p11m01-start", "Start Time", "text"), f("p11m01-end", "Expected End", "text")] }),
  item("p11-mehndi-02", "phase-11", "Guests arrive for mehndi", "Welcome guests for the afternoon mehndi session", { priority: "high", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: 0 }, fields: [f("p11m02-time", "Guest Arrival Time", "text")] }),
  item("p11-mehndi-03", "phase-11", "Mehndi food service", "Serve finger foods and drinks during mehndi", { priority: "high", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: -1 }, fields: [f("p11m03-time", "Service Time", "text")] }),
  item("p11-mehndi-04", "phase-11", "Mehndi music and dancing", "Ensure music and entertainment are running for mehndi", { priority: "medium", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: 0 }, fields: [f("p11m04-setup", "Music Setup Complete", "select", { options: ["Yes", "No"] })] }),
  item("p11-mehndi-05", "phase-11", "Bride rests with mehndi on hands", "Allow bride to rest while mehndi dries and darkens", { priority: "high", assigned: "bride", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: -2 }, fields: [f("p11m05-care", "Care Supplies Ready", "select", { options: ["Yes", "No"] })] }),
  item("p11-mehndi-06", "phase-11", "Bride hydration and meal delivery", "Ensure bride is fed and hydrated — she cannot use her hands", { priority: "high", assigned: "bride", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: -3 }, fields: [f("p11m06-helper", "Helper Assigned", "text")] }),

  // Haldi Day
  item("p11-haldi-01", "phase-11", "Set up haldi area", "Prepare the haldi ceremony space with decorations", { priority: "high", template: "haldi_planner", eventDay: { eventDay: "haldi", hoursBefore: 2 }, fields: [f("p11h01-setup", "Setup Complete", "select", { options: ["Yes", "No"] })] }),
  item("p11-haldi-02", "phase-11", "Old clothes ready", "Ensure bride, groom, and family have stain-ready clothes", { priority: "medium", template: "haldi_planner", eventDay: { eventDay: "haldi", hoursBefore: 1 }, fields: [f("p11h02-ready", "All Ready", "select", { options: ["Yes", "No"] })] }),
  item("p11-haldi-03", "phase-11", "Family applies haldi", "Conduct the haldi application ceremony", { priority: "critical", assigned: "family", template: "haldi_planner", eventDay: { eventDay: "haldi", hoursBefore: 0 }, fields: [f("p11h03-done", "Complete", "select", { options: ["Yes", "No"] })] }),
  item("p11-haldi-04", "phase-11", "Flower / water shower", "Shower bride and groom with flower petals and water", { priority: "medium", template: "haldi_planner", eventDay: { eventDay: "haldi", hoursBefore: -1 }, fields: [f("p11h04-flowers", "Flowers Ready", "select", { options: ["Yes", "No"] })] }),
  item("p11-haldi-05", "phase-11", "Shower and rest", "Bride and groom shower off haldi and rest", { priority: "high", eventDay: { eventDay: "haldi", hoursBefore: -2 }, fields: [f("p11h05-done", "Complete", "select", { options: ["Yes", "No"] })] }),
  item("p11-haldi-06", "phase-11", "Haldi light meal", "Serve a light traditional meal after haldi", { priority: "medium", eventDay: { eventDay: "haldi", hoursBefore: -3 }, fields: [f("p11h06-served", "Served", "select", { options: ["Yes", "No"] })] }),

  // Sangeet Night
  item("p11-sang-01", "phase-11", "Hair and makeup for sangeet", "Bride and family get ready (afternoon)", { priority: "high", assigned: "bride", template: "beauty_timeline", eventDay: { eventDay: "sangeet", hoursBefore: 5 }, fields: [f("p11s01-start", "HMU Start Time", "text")] }),
  item("p11-sang-02", "phase-11", "Getting dressed for sangeet", "Everyone changes into sangeet outfits", { priority: "high", module: "/outfits", eventDay: { eventDay: "sangeet", hoursBefore: 1 }, fields: [f("p11s02-ready", "Ready Time", "text")] }),
  item("p11-sang-03", "phase-11", "Sangeet cocktails and mingling", "Welcome guests with cocktails and socializing", { priority: "medium", eventDay: { eventDay: "sangeet", hoursBefore: 0 }, fields: [f("p11s03-time", "Cocktail Start", "text")] }),
  item("p11-sang-04", "phase-11", "Sangeet dinner service", "Serve the sangeet dinner", { priority: "high", eventDay: { eventDay: "sangeet", hoursBefore: -1 }, fields: [f("p11s04-time", "Dinner Time", "text")] }),
  item("p11-sang-05", "phase-11", "Sangeet performances", "Execute all scheduled performances", { priority: "critical", template: "sangeet_run_of_show", module: "/entertainment", eventDay: { eventDay: "sangeet", hoursBefore: -2 }, fields: [f("p11s05-started", "Started", "select", { options: ["Yes", "No"] })] }),
  item("p11-sang-06", "phase-11", "Sangeet open dance floor", "Open the dance floor for all guests", { priority: "medium", eventDay: { eventDay: "sangeet", hoursBefore: -3 }, fields: [f("p11s06-time", "Dance Floor Opens", "text")] }),
  item("p11-sang-07", "phase-11", "Sangeet late-night snacks", "Serve late-night snacks as the party winds down", { priority: "low", eventDay: { eventDay: "sangeet", hoursBefore: -5 }, fields: [f("p11s07-menu", "Snack Menu", "textarea")] }),

  // Wedding Day
  item("p11-wed-01", "phase-11", "Early wake-up", "Set alarms for early morning preparation", { priority: "critical", eventDay: { eventDay: "wedding", hoursBefore: 6 }, fields: [f("p11wd01-time", "Wake-Up Time", "text")] }),
  item("p11-wed-01a", "phase-11", "Day-of yoga or meditation session", "Do a short yoga or meditation session with close friends/family to center yourself", { priority: "low", eventDay: { eventDay: "wedding", hoursBefore: 5.5 }, fields: [f("p11wd01a-time", "Session Time", "text"), f("p11wd01a-attendees", "Attendees", "textarea")] }),
  item("p11-wed-01b", "phase-11", "Spa or relaxation time with close friends", "Take a few close friends to the spa or enjoy a quick relaxation ritual before HMU", { priority: "low", eventDay: { eventDay: "wedding", hoursBefore: 5 }, fields: [f("p11wd01b-plan", "Plan", "textarea"), f("p11wd01b-attendees", "Attendees", "textarea")] }),
  item("p11-wed-01c", "phase-11", "Quiet time to breathe and enjoy", "Carve out 15 minutes of quiet time alone or with partner before the whirlwind begins", { priority: "medium", eventDay: { eventDay: "wedding", hoursBefore: 4.5 }, fields: [f("p11wd01c-moment", "When/Where", "text")] }),
  item("p11-wed-02", "phase-11", "Light breakfast", "Eat a light, energizing breakfast", { priority: "high", eventDay: { eventDay: "wedding", hoursBefore: 5 }, fields: [f("p11wd02-menu", "Breakfast Plan", "textarea")] }),
  item("p11-wed-03", "phase-11", "Bride: hair and makeup (3–5 hours)", "Begin the bridal hair and makeup process", { priority: "critical", assigned: "bride", template: "beauty_timeline", eventDay: { eventDay: "wedding", hoursBefore: 4 }, fields: [f("p11wd03-start", "HMU Start Time", "text"), f("p11wd03-end", "Expected Finish", "text")] }),
  item("p11-wed-04", "phase-11", "Groom: getting ready", "Groom dresses and prepares for the ceremony", { priority: "critical", assigned: "groom", eventDay: { eventDay: "wedding", hoursBefore: 2 }, fields: [f("p11wd04-start", "Getting Ready Time", "text")] }),
  item("p11-wed-05", "phase-11", "Baraat assembly", "Gather the baraat party at the meeting point", { priority: "critical", assigned: "groom", template: "baraat_planner", eventDay: { eventDay: "wedding", hoursBefore: 1.5 }, fields: [f("p11wd05-time", "Assembly Time", "text"), f("p11wd05-location", "Meeting Point", "text")] }),
  item("p11-wed-06", "phase-11", "Baraat procession with dhol", "March to the venue with music and dancing", { priority: "critical", template: "baraat_planner", eventDay: { eventDay: "wedding", hoursBefore: 1 }, fields: [f("p11wd06-start", "Procession Start", "text")] }),
  item("p11-wed-07", "phase-11", "Milni at venue entrance", "Exchange garlands between families at the entrance", { priority: "high", template: "ceremony_program_builder", eventDay: { eventDay: "wedding", hoursBefore: 0.5 }, fields: [f("p11wd07-time", "Milni Time", "text")] }),
  item("p11-wed-08", "phase-11", "Jaimala / varmala ceremony", "Bride and groom exchange garlands", { priority: "critical", template: "ceremony_program_builder", eventDay: { eventDay: "wedding", hoursBefore: 0 }, fields: [f("p11wd08-time", "Jaimala Time", "text")] }),
  item("p11-wed-09", "phase-11", "Main ceremony", "Conduct the full wedding ceremony per tradition", { priority: "critical", template: "ceremony_program_builder", module: "/timeline", eventDay: { eventDay: "wedding", hoursBefore: -1 }, fields: [f("p11wd09-start", "Ceremony Start", "text"), f("p11wd09-end", "Expected End", "text")] }),
  item("p11-wed-10", "phase-11", "Post-ceremony photos", "Formal family and couple photos after the ceremony", { priority: "high", template: "photography_shot_list", eventDay: { eventDay: "wedding", hoursBefore: -3 }, categoryTags: ["photography"], workspaceTabTags: ["plan"], linkedEntities: { event_day_ids: ["wedding"] }, fields: [f("p11wd10-duration", "Photo Duration", "text")] }),
  item("p11-wed-11", "phase-11", "Wedding lunch or dinner service", "Serve the main wedding meal to all guests", { priority: "critical", eventDay: { eventDay: "wedding", hoursBefore: -4 }, fields: [f("p11wd11-time", "Meal Service Time", "text")] }),
  item("p11-wed-12", "phase-11", "Vidaai ceremony", "Conduct the emotional farewell of the bride", { priority: "critical", template: "vidaai_planner", eventDay: { eventDay: "wedding", hoursBefore: -6 }, fields: [f("p11wd12-time", "Vidaai Time", "text"), f("p11wd12-car", "Departure Ready", "select", { options: ["Yes", "No"] })] }),

  // Reception
  item("p11-recep-01", "phase-11", "Couple's outfit change", "Change into reception outfits", { priority: "high", module: "/outfits", eventDay: { eventDay: "reception", hoursBefore: 2 }, fields: [f("p11r01-time", "Change Time", "text")] }),
  item("p11-recep-02", "phase-11", "Reception grand entrance", "Execute the couple's grand entrance", { priority: "high", template: "reception_planner", eventDay: { eventDay: "reception", hoursBefore: 0 }, fields: [f("p11r02-time", "Entrance Time", "text")] }),
  item("p11-recep-03", "phase-11", "Reception first dance", "Perform the first dance as a married couple", { priority: "medium", template: "reception_planner", eventDay: { eventDay: "reception", hoursBefore: -0.5 }, fields: [f("p11r03-song", "Song", "text")] }),
  item("p11-recep-04", "phase-11", "Reception speeches", "Deliver toasts and speeches", { priority: "medium", template: "speech_planner", eventDay: { eventDay: "reception", hoursBefore: -1 }, fields: [f("p11r04-speakers", "Speaker Order", "textarea")] }),
  item("p11-recep-05", "phase-11", "Reception cake cutting", "Cut the wedding cake together", { priority: "medium", template: "reception_planner", eventDay: { eventDay: "reception", hoursBefore: -1.5 }, fields: [f("p11r05-time", "Cake Cutting Time", "text")] }),
  item("p11-recep-06", "phase-11", "Reception dinner service", "Serve dinner to reception guests", { priority: "high", eventDay: { eventDay: "reception", hoursBefore: -2 }, fields: [f("p11r06-time", "Dinner Time", "text")] }),
  item("p11-recep-07", "phase-11", "Reception open dance floor", "Open the floor for dancing", { priority: "medium", eventDay: { eventDay: "reception", hoursBefore: -3 }, fields: [f("p11r07-time", "Dance Floor Opens", "text")] }),
  item("p11-recep-08", "phase-11", "Late-night send-off", "Organize the couple's departure with sparklers/confetti", { priority: "medium", template: "reception_planner", eventDay: { eventDay: "reception", hoursBefore: -5 }, fields: [f("p11r08-concept", "Send-Off Style", "text"), f("p11r08-time", "Send-Off Time", "text")] }),
];

// ── Phase 12: Post-Wedding ──────────────────────────────────────────────────

const p12: ChecklistItem[] = [
  item("p12-post-01", "phase-12", "Post-wedding brunch with close family", "Host a relaxed brunch the day after the wedding", { priority: "medium", fields: [f("p12p01-venue", "Venue", "text"), f("p12p01-time", "Time", "text"), f("p12p01-menu", "Menu", "textarea")] }),
  item("p12-post-02", "phase-12", "Return rentals", "Return all rented items: decor, furniture, AV equipment, etc.", { priority: "high", assigned: "planner", fields: [f("p12p02-items", "Items to Return", "textarea"), f("p12p02-deadline", "Return Deadline", "date")] }),
  item("p12-post-03", "phase-12", "Dry clean and preserve wedding outfits", "Send wedding outfits for professional dry cleaning and preservation", { priority: "high", assigned: "bride", module: "/outfits", fields: [f("p12p03-cleaner", "Dry Cleaner", "text"), f("p12p03-cost", "Cost", "currency")] }),
  item("p12-post-04", "phase-12", "Store jewelry securely", "Return borrowed jewelry and safely store purchased pieces", { priority: "high", assigned: "bride", fields: [f("p12p04-storage", "Storage Plan", "textarea")] }),
  item("p12-post-05", "phase-12", "Honeymoon departure", "Depart for the honeymoon!", { priority: "high", template: "honeymoon_planner", fields: [f("p12p05-date", "Departure Date", "date"), f("p12p05-flight", "Flight Details", "text")] }),
  item("p12-post-06", "phase-12", "Send thank you notes", "Write and send personalized thank you notes within 3 months", { priority: "high", template: "thank_you_tracker", fields: [f("p12p06-total", "Total Notes to Send", "text"), f("p12p06-sent", "Notes Sent", "text"), f("p12p06-deadline", "Target Completion", "date")] }),
  item("p12-post-07", "phase-12", "Write vendor reviews and social tags", "Leave reviews for vendors and tag them on social media", { priority: "medium", fields: [f("p12p07-reviews", "Reviews Written", "textarea")] }),
  item("p12-post-08", "phase-12", "Tip any outstanding vendors", "Send tips to any vendors not yet tipped", { priority: "medium", template: "tip_envelope_planner", fields: [f("p12p08-vendors", "Vendors to Tip", "textarea"), f("p12p08-total", "Total Tips", "currency")] }),
  item("p12-post-09", "phase-12", "Receive photo and video deliverables", "Follow up with photographer and videographer for final deliverables", { priority: "high", categoryTags: ["photography", "videography"], workspaceTabTags: ["plan", "decisions"], fields: [f("p12p09-photo-eta", "Photo Delivery ETA", "date"), f("p12p09-video-eta", "Video Delivery ETA", "date")] }),
  item("p12-post-10", "phase-12", "Select images for album", "Review and select photos for the wedding album", { priority: "medium", deps: ["p12-post-09"], categoryTags: ["photography"], workspaceTabTags: ["vision", "plan"], fields: [f("p12p10-count", "Images Selected", "text"), f("p12p10-deadline", "Selection Deadline", "date")] }),
  item("p12-post-11", "phase-12", "Order album and prints", "Place the order for the wedding album and any print enlargements", { priority: "medium", deps: ["p12-post-10"], fields: [f("p12p11-vendor", "Album Vendor", "vendor_picker"), f("p12p11-cost", "Cost", "currency")] }),
  item("p12-post-12", "phase-12", "Share gallery with family", "Distribute the online photo gallery to family and friends", { priority: "medium", deps: ["p12-post-09"], categoryTags: ["photography"], workspaceTabTags: ["plan"], fields: [f("p12p12-link", "Gallery Link", "url"), f("p12p12-shared", "Shared", "select", { options: ["Yes", "No"] })] }),
  item("p12-post-13", "phase-12", "Complete name change paperwork", "Process Social Security, driver's license, passport, and bank name changes", { priority: "medium", fields: [f("p12p13-ss", "Social Security", "select", { options: ["Done", "Pending", "N/A"] }), f("p12p13-dl", "Driver's License", "select", { options: ["Done", "Pending", "N/A"] }), f("p12p13-passport", "Passport", "select", { options: ["Done", "Pending", "N/A"] }), f("p12p13-bank", "Bank Accounts", "select", { options: ["Done", "Pending", "N/A"] })] }),
  item("p12-post-14", "phase-12", "Complete legal status updates", "Update all legal documents with new marital status", { priority: "medium", fields: [f("p12p14-items", "Items to Update", "textarea")] }),
  item("p12-post-15", "phase-12", "Merge financial accounts if planned", "Combine or coordinate bank accounts as discussed", { priority: "low", fields: [f("p12p15-plan", "Merging Plan", "textarea")] }),
  item("p12-post-16", "phase-12", "Plan first anniversary trip", "Start dreaming about the first anniversary celebration", { priority: "low", template: "honeymoon_planner", fields: [f("p12p16-ideas", "Trip Ideas", "textarea")] }),
  item("p12-post-17", "phase-12", "Preserve top tier of cake", "Freeze the top tier of the wedding cake for the first anniversary", { priority: "low", tags: ["western", "fusion"], fields: [f("p12p17-stored", "Stored", "select", { options: ["Yes", "No", "N/A"] })] }),
  item("p12-post-18", "phase-12", "Close wedding bank account", "Close the dedicated wedding bank account or credit card", { priority: "medium", module: "/budget", fields: [f("p12p18-closed", "Closed", "select", { options: ["Yes", "No"] })] }),
  item("p12-post-19", "phase-12", "Final budget reconciliation", "Complete the final accounting of all wedding expenses", { priority: "high", template: "budget_allocator", module: "/budget", fields: [f("p12p19-total-spent", "Total Spent", "currency"), f("p12p19-vs-budget", "Over/Under Budget", "text"), f("p12p19-report", "Final Report", "file_upload")] }),
  item("p12-post-20", "phase-12", "Archive wedding website", "Transition the wedding website to a private archive or take it down", { priority: "low", fields: [f("p12p20-action", "Action", "select", { options: ["Archive (Private)", "Keep Public", "Take Down"] })] }),
  item("p12-post-21", "phase-12", "Preserve or donate wedding flowers", "Don't let the flowers go to waste — press/preserve bridal bouquet, donate bulk arrangements to hospitals/shelters", { priority: "medium", assigned: "planner", fields: [f("p12p21-action", "Action", "multiselect", { options: ["Preserve Bouquet (Resin/Press)", "Donate to Hospital", "Donate to Shelter", "Compost", "Gift to Guests"] }), f("p12p21-service", "Preservation Service", "text"), f("p12p21-cost", "Cost", "currency")] }),
  item("p12-post-22", "phase-12", "Send framed wedding photos as gifts", "Print and frame favorite photos for parents, grandparents, and bridal party as a thank-you gift", { priority: "low", deps: ["p12-post-09"], categoryTags: ["photography"], workspaceTabTags: ["plan"], fields: [f("p12p22-recipients", "Recipients", "textarea"), f("p12p22-printer", "Print/Frame Vendor", "vendor_picker"), f("p12p22-cost", "Cost", "currency")] }),
];

// ── Combined export ─────────────────────────────────────────────────────────

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  ...p0, ...p1, ...p2, ...p3, ...p4, ...p5,
  ...p6, ...p7, ...p8, ...p9, ...p10, ...p11, ...p12,
];

backfillCategoryTags(CHECKLIST_ITEMS);
backfillTabTags(CHECKLIST_ITEMS);
assignAutoDeadlines(CHECKLIST_ITEMS);

// Snapshot originals so a template task can be reset after edits.
// Built after deadline assignment so defaults match what the user first saw.
const ORIGINAL_TEMPLATES: Record<string, ChecklistItem> = {};
for (const it of CHECKLIST_ITEMS) {
  ORIGINAL_TEMPLATES[it.id] = {
    ...it,
    decision_fields: it.decision_fields.map((f) => ({ ...f })),
    dependencies: [...it.dependencies],
    tradition_profile_tags: [...it.tradition_profile_tags],
  };
}

export function getOriginalTemplate(id: string): ChecklistItem | undefined {
  const original = ORIGINAL_TEMPLATES[id];
  if (!original) return undefined;
  return {
    ...original,
    decision_fields: original.decision_fields.map((f) => ({ ...f })),
    dependencies: [...original.dependencies],
    tradition_profile_tags: [...original.tradition_profile_tags],
  };
}

// ── Subsection labels ───────────────────────────────────────────────────────
// Mirrors the sectionLabels map in app/checklist/page.tsx. Exported so the
// New-Task slide-over can present a "Subsection" dropdown per phase without
// duplicating the list.
export const SUBSECTION_LABELS: Record<string, string> = {
  couple: "Couple Alignment",
  family: "Family Coordination",
  budget: "Budget Architecture",
  date: "Date & Muhurat",
  plan: "Contingency Planning",
  brand: "Wedding Brand",
  digital: "Digital Presence",
  venue: "Venue Selection",
  accom: "Accommodation",
  priest: "Officiant",
  photo: "Photography & Videography",
  bwar: "Bride's Wardrobe",
  bjew: "Bride's Jewelry",
  beau: "Bride's Beauty",
  gwar: "Groom's Wardrobe",
  gjew: "Groom's Accessories",
  fam: "Family & Party Attire",
  style: "Guest Style Guide",
  cater: "Catering",
  bar: "Bar & Beverage",
  decor: "Decor & Florals",
  light: "Lighting & Production",
  music: "Music & Entertainment",
  trans: "Transportation",
  std: "Save-the-Dates",
  inv: "Invitations",
  dop: "Day-Of Paper",
  wb: "Welcome Bags",
  guest: "Guest List",
  rsvp: "RSVP Tracking",
  seat: "Seating",
  comm: "Guest Communication",
  cer: "Wedding Ceremony",
  mehndi: "Mehndi Ceremony",
  sang: "Sangeet",
  haldi: "Haldi",
  recep: "Reception",
  gift: "Gifts to Give",
  favor: "Guest Favors",
  reg: "Registry",
  legal: "Legal & Documents",
  honey: "Honeymoon",
  w4: "Week 4",
  w3: "Week 3",
  w2: "Week 2",
  w1: "Week 1",
  welcome: "Welcome Day",
  puja: "Ganesh Puja",
  wed: "Wedding Day",
  post: "Post-Wedding",
};

const PHASE_ID_SHORT: Record<string, string> = {
  "phase-0": "p0",
  "phase-1": "p1",
  "phase-2": "p2",
  "phase-3": "p3",
  "phase-4": "p4",
  "phase-5": "p5",
  "phase-6": "p6",
  "phase-7": "p7",
  "phase-8": "p8",
  "phase-9": "p9",
  "phase-10": "p10",
  "phase-11": "p11",
  "phase-12": "p12",
};

export function shortPhaseKey(phaseId: string): string {
  return PHASE_ID_SHORT[phaseId] ?? phaseId.replace(/-/g, "");
}

export function subsectionsForPhase(
  phaseId: string,
  items: ChecklistItem[],
): { key: string; label: string }[] {
  const seen: string[] = [];
  const labels: Record<string, string> = {};
  for (const it of items) {
    if (it.phase_id !== phaseId) continue;
    const parts = it.id.split("-");
    // Custom items use the pattern `{phaseShort}-{section}-custom-...`, so
    // parts[1] is still the section key. Template items follow the same shape.
    const key = parts.length >= 3 ? parts[1] : "general";
    if (!seen.includes(key)) {
      seen.push(key);
      labels[key] =
        SUBSECTION_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
    }
  }
  return seen.map((k) => ({ key: k, label: labels[k] }));
}

export function buildCustomItemId(phaseId: string, subsection: string): string {
  const phasePart = shortPhaseKey(phaseId);
  // Keep the {phase}-{section}-... shape so groupItemsBySection still works.
  const slug = subsection.trim().toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) || "general";
  const suffix = `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${phasePart}-${slug}-${suffix}`;
}
