// ── Checklist seed data ─────────────────────────────────────────────────────
// Auto-generated from ananya-indian-wedding-checklist.md
// ~400 items across 13 phases (0-12). All tasks render via the universal
// generic panel — header, description, linked module, notes, attachments,
// activity (journal + correspondence). No per-task decision fields.

import type {
  Phase,
  ChecklistItem,
  Priority,
  AssignedTo,
  EventDayOffset,
  WorkspaceCategoryTag,
  WorkspaceTabTag,
  TaskLinkedEntities,
} from "@/types/checklist";

// ── Helpers ─────────────────────────────────────────────────────────────────

const TS = "2025-01-01T00:00:00.000Z";

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
    priority?: Priority;
    assigned?: AssignedTo;
    module?: string;
    tags?: string[];
    deps?: string[];
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
    decision_template: "generic",
    decision_fields: [],
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
  item("p0-couple-01", "phase-0", "Discuss overall wedding vision", "Decide between traditional, modern fusion, destination, or intimate wedding styles. Capture: Scale, Vision Statement (Describe your dream wedding in a few sentences), Inspiration Board.", { priority: "critical" }),
  item("p0-couple-02", "phase-0", "Align on core values", "Agree on scale, formality, religious observance, and cultural fidelity. Capture: Formality Level, Alignment Notes.", { priority: "critical" }),
  item("p0-couple-03", "phase-0", "Decide how many events total", "Choose between a 2-day, 3-day, 4-day, or 5-day celebration. Capture: Number of Days, Event List.", { priority: "critical" }),
  item("p0-couple-04", "phase-0", "Agree on tradition lead per ceremony", "Decide which side's traditions lead for each ceremony if interfaith or inter-regional. Capture: Lead Tradition (For each ceremony, note which family's traditions will lead), Blending Approach.", { priority: "high", tags: ["interfaith", "inter-regional"] }),
  item("p0-couple-05", "phase-0", "Decide on tradition profile", "Select your cultural tradition: North Indian Hindu, Punjabi Sikh, Gujarati, Marwari, Tamil Brahmin, Bengali, etc. Capture: Primary Tradition, Secondary Tradition, Cultural Notes.", { priority: "critical" }),
  item("p0-couple-06", "phase-0", "Define non-negotiables list", "Each partner lists their must-haves and deal-breakers. Capture: Bride's Non-Negotiables, Groom's Non-Negotiables, Shared Priorities.", { priority: "high" }),
  item("p0-couple-07", "phase-0", "Decide on wedding planner", "Choose between full wedding planner, day-of coordinator, or self-manage. Capture: Planning Approach, Planner Budget, Planner/Coordinator.", { priority: "high" }),

  // Family Coordination
  item("p0-family-01", "phase-0", "Formal introduction between families", "Arrange the first formal meeting between both families if not already done. Capture: Meeting Date, Meeting Notes.", { priority: "high", assigned: "family" }),
  item("p0-family-02", "phase-0", "Roka ceremony", "Plan and execute the roka/engagement ceremony if applicable. Capture: Roka Date, Gift List.", { priority: "high", assigned: "family", tags: ["north-indian", "punjabi"] }),
  item("p0-family-03", "phase-0", "Align both sets of parents on overall plan", "Hold a family meeting to discuss and agree on the overall wedding plan. Capture: Meeting Date, Decisions Made, Follow-up Items.", { priority: "critical", assigned: "family" }),
  item("p0-family-04", "phase-0", "Identify key decision-makers on each side", "Document who has final say on various aspects from each family. Capture: Bride's Family Decision-Makers, Groom's Family Decision-Makers, Decision Domains (Who decides what: venue, food, guest list, etc.).", { priority: "high", assigned: "family" }),
  item("p0-family-05", "phase-0", "Establish communication cadence", "Set up a regular communication rhythm — WhatsApp group, weekly calls, etc. Capture: Communication Channel, Frequency, Key Members.", { priority: "medium", assigned: "family" }),
  item("p0-family-06", "phase-0", "Assign family point people", "Designate family members for specific domains — the catering uncle, logistics cousin, etc. Capture: Role Assignments (List each role and the family member assigned), Contact Sheet.", { priority: "medium", assigned: "family" }),
  item("p0-family-07", "phase-0", "Discuss financial contribution structure", "Agree on how costs will be split between families and the couple. Capture: Split Structure, Contribution Details, Total Combined Budget.", { priority: "critical", assigned: "family", module: "/budget" }),
  item("p0-family-08", "phase-0", "Document family traditions to honor", "Record any specific family customs, rituals, or expectations that must be included. Capture: Bride's Family Traditions, Groom's Family Traditions, Must-Include Rituals.", { priority: "high", assigned: "family" }),

  // Budget Architecture
  item("p0-budget-01", "phase-0", "Set total budget ceiling", "Agree on the absolute maximum amount to spend across all events. Capture: Total Budget, Currency, Budget Notes.", { priority: "critical", module: "/budget" }),
  item("p0-budget-02", "phase-0", "Allocate budget by event", "Divide budget across events: Wedding ~40%, Reception ~20%, Sangeet ~15%, Mehndi ~10%, Haldi ~5%, Other ~10%. Capture: Other Events %.", { priority: "critical", module: "/budget", deps: ["p0-budget-01"] }),
  item("p0-budget-03", "phase-0", "Allocate budget by category", "Split by category: venue, catering, decor, attire, jewelry, photo/video, music, transport, stationery, gifts, misc. Capture: Category Breakdown (List each category and its allocated percentage or amount).", { priority: "critical", module: "/budget", deps: ["p0-budget-01"] }),
  item("p0-budget-04", "phase-0", "Build 10–15% contingency buffer", "Reserve a contingency fund for unexpected expenses. Capture: Contingency Amount.", { priority: "high", module: "/budget" }),
  item("p0-budget-05", "phase-0", "Decide payment responsibility by line item", "Determine which family pays for each line item. Capture: Payment Responsibility Matrix (For each major expense, note: bride's family, groom's family, couple, or split).", { priority: "high", assigned: "family", module: "/budget" }),
  item("p0-budget-06", "phase-0", "Set up shared budget tracker", "Create a shared spreadsheet or tool to track all wedding expenses. Capture: Tracking Tool, Tracker Link.", { priority: "high", module: "/budget" }),
  item("p0-budget-07", "phase-0", "Open dedicated wedding bank account", "Set up a separate account or credit card for wedding expenses and reward points. Capture: Bank Name, Account Type, Account Reference.", { priority: "low", module: "/budget" }),

  // Date & Muhurat
  item("p0-date-01", "phase-0", "Consult family priest with birth details", "Share both partners' janam kundli (birth charts) with the family panditji. Capture: Priest/Panditji Name, Priest Contact, Consultation Date.", { priority: "critical", module: "/timeline" }),
  item("p0-date-02", "phase-0", "Receive list of auspicious dates", "Get the muhurat dates from the priest based on birth charts. Capture: Auspicious Dates (List all muhurat dates provided by the priest), Top 3 Preferred Dates.", { priority: "critical", module: "/timeline", deps: ["p0-date-01"] }),
  item("p0-date-03", "phase-0", "Cross-check dates against venue availability", "Verify your preferred muhurat dates work for your venue shortlist. Capture: Available Dates, Venue Availability Notes.", { priority: "critical", module: "/timeline", deps: ["p0-date-02"] }),
  item("p0-date-04", "phase-0", "Cross-check against key guest availability", "Ensure grandparents, close family, and VIPs can attend on chosen dates. Capture: Key Guests to Check, Known Conflicts.", { priority: "high", module: "/timeline", deps: ["p0-date-02"] }),
  item("p0-date-05", "phase-0", "Confirm final dates for every event", "Lock in the confirmed dates for all events in the wedding celebration. Capture: Final Event Dates (List each event and its confirmed date).", { priority: "critical", module: "/timeline", deps: ["p0-date-03", "p0-date-04"] }),
  item("p0-date-06", "phase-0", "Note religious fasting days to avoid", "Check for Shraddh, Chaturmas, Kharmas, and other inauspicious periods. Capture: Dates/Periods to Avoid, Reasons.", { priority: "high", module: "/timeline", tags: ["hindu"] }),
  item("p0-date-07", "phase-0", "Document exact muhurat times for ceremony", "Record the precise auspicious times for pheras, kanyadaan, and other rituals. Capture: Pheras Muhurat Time, Kanyadaan Time, Other Ritual Times.", { priority: "critical", module: "/timeline", deps: ["p0-date-05"] }),

  // Contingency Planning
  item("p0-plan-01", "phase-0", "Create Plan B for outdoor events", "Design a rain/weather backup plan for any outdoor ceremony or event at booking time. Capture: Outdoor Events, Backup Venue/Setup (Tent, indoor hall, or alternate venue), Decision Trigger (Weather threshold or deadline to activate Plan B).", { priority: "high" }),
];

// ── Phase 1: Branding & Identity ────────────────────────────────────────────

const p1: ChecklistItem[] = [
  // Wedding Brand Development
  item("p1-brand-01", "phase-1", "Choose wedding hashtag", "Brainstorm 10+ options and test for uniqueness on Instagram. Capture: Hashtag Options (List 10+ brainstormed hashtags), Final Hashtag, Availability Confirmed.", { priority: "high" }),
  item("p1-brand-02", "phase-1", "Check hashtag availability across platforms", "Verify hashtag uniqueness on Instagram, TikTok, and Facebook. Capture: Instagram Available, TikTok Available, Facebook Available.", { priority: "medium", deps: ["p1-brand-01"] }),
  item("p1-brand-03", "phase-1", "Create secondary hashtags per event", "Create event-specific hashtags like #PoojaAndRajSangeet, #PoojaAndRajMehndi. Capture: Sangeet Hashtag, Mehndi Hashtag, Wedding Hashtag, Reception Hashtag.", { priority: "low", deps: ["p1-brand-01"] }),
  item("p1-brand-04", "phase-1", "Choose wedding monogram/logo", "Design a monogram or logo using initials, motifs, or mandala patterns. Capture: Monogram Style, Designer, Monogram Files.", { priority: "high" }),
  item("p1-brand-05", "phase-1", "Pick primary color palette", "Select 3–5 colors that will carry across all events. Capture: Primary Colors (hex codes), Color Inspiration.", { priority: "high" }),
  item("p1-brand-06", "phase-1", "Pick secondary/accent palette", "Choose complementary accent colors. Capture: Accent Colors (hex codes), Usage Guide.", { priority: "medium", deps: ["p1-brand-05"] }),
  item("p1-brand-07", "phase-1", "Choose typography system", "Select display font and body font for all wedding materials. Capture: Typography Sample.", { priority: "medium" }),
  item("p1-brand-08", "phase-1", "Develop visual motif library", "Build a collection of visual motifs: peacock, lotus, elephant, paisley, florals, etc. Capture: Selected Motifs, Motif Board.", { priority: "medium" }),
  item("p1-brand-09", "phase-1", "Create brand guidelines doc", "Compile colors, fonts, motifs, and voice into a single reference document for vendors. Capture: Guidelines Document, Shared Link.", { priority: "medium", deps: ["p1-brand-04", "p1-brand-05", "p1-brand-07"] }),
  item("p1-brand-10", "phase-1", "Decide per-event color themes", "Assign specific color palettes to each event (e.g. Mehndi: mustard/coral, Sangeet: emerald/gold). Capture: Mehndi Colors, Sangeet Colors, Wedding Colors, Reception Colors, Haldi Colors.", { priority: "medium", deps: ["p1-brand-05"] }),
  item("p1-brand-11", "phase-1", "Define wedding voice", "Set the tone for all written communication: formal, warm, or playful. Capture: Sample Copy.", { priority: "low" }),

  // Digital Presence
  item("p1-digital-01", "phase-1", "Register wedding website domain", "Purchase a custom domain for the wedding website. Capture: Domain Name, Registrar.", { priority: "high" }),
  item("p1-digital-02", "phase-1", "Choose wedding website platform", "Select from custom build, Zola, The Knot, Joy, WedMeGood, etc. Capture: Platform, Annual Cost.", { priority: "high" }),
  item("p1-digital-03", "phase-1", "Draft 'Our Story' narrative", "Write the couple's love story for the website. Capture: Story Draft, Story Photos.", { priority: "medium" }),
  item("p1-digital-04", "phase-1", "Write how-we-met timeline", "Create a visual timeline of the relationship milestones. Capture: Timeline Events, Milestone Photos.", { priority: "low" }),
  item("p1-digital-05", "phase-1", "Plan photoshoot for website hero imagery", "Organize a couples photoshoot for the website hero section. Capture: Photographer, Shoot Date.", { priority: "medium", categoryTags: ["photography"], workspaceTabTags: ["vision", "plan"], linkedEntities: { budget_category: "Photo/Video" } }),
  item("p1-digital-06", "phase-1", "Create FAQ section", "Write answers for dress code, kids policy, alcohol, parking, etc. Capture: FAQ Content.", { priority: "medium" }),
  item("p1-digital-07", "phase-1", "Build event schedule page", "Create a page listing all events with dates, times, and locations. Capture: Schedule Content.", { priority: "high", module: "/timeline" }),
  item("p1-digital-08", "phase-1", "Build travel & accommodation page", "Add hotel info, travel tips, and directions for guests. Capture: Travel Info.", { priority: "high" }),
  item("p1-digital-09", "phase-1", "Build registry links page", "Add links to gift registries on the wedding website. Capture: Registry URLs.", { priority: "medium" }),
  item("p1-digital-10", "phase-1", "Set up RSVP system", "Configure per-event, per-guest RSVP with meal preferences. Capture: RSVP System, RSVP Deadline.", { priority: "high", module: "/guests" }),
  item("p1-digital-11", "phase-1", "Build password protection", "Add optional password protection to the wedding website. Capture: Enabled.", { priority: "low" }),
  item("p1-digital-12", "phase-1", "Plan couple's Instagram or sharing space", "Create a dedicated Instagram account or private photo-sharing space. Capture: Handle/Name, Platform.", { priority: "low" }),
  item("p1-digital-13", "phase-1", "Set up shared planning docs", "Create a shared Google Drive or Dropbox for all planning documents. Capture: Platform, Shared Folder Link.", { priority: "medium" }),
  item("p1-digital-14", "phase-1", "Create custom Snapchat/Instagram filter", "Design a geofilter or AR filter for guests to use on the wedding day. Capture: Platforms, Filter Design, Geofilter Venue Coverage.", { priority: "low" }),
];

// ── Phase 2: Core Bookings ──────────────────────────────────────────────────

const p2: ChecklistItem[] = [
  // Venue Selection
  item("p2-venue-01", "phase-2", "Define venue requirements per event", "Document capacity, indoor/outdoor, catering flexibility, parking, accommodation proximity for each event. Capture: Min Guest Capacity, Indoor/Outdoor, Key Requirements.", { priority: "critical", module: "/venues" }),
  item("p2-venue-02", "phase-2", "Research venues for wedding ceremony", "Compile a shortlist of venues suitable for the wedding ceremony. Capture: Venue Shortlist, Venue Budget.", { priority: "critical", module: "/venues" }),
  item("p2-venue-03", "phase-2", "Research venues for sangeet", "Find venues with good dance floor, AV capabilities, and atmosphere for sangeet. Capture: Venue Shortlist, Dance Floor Capacity.", { priority: "high", module: "/venues" }),
  item("p2-venue-04", "phase-2", "Research venues for mehndi", "Find venues with comfortable seating and intimate atmosphere for mehndi. Capture: Venue Shortlist, Setting.", { priority: "high", module: "/venues" }),
  item("p2-venue-05", "phase-2", "Research venues for haldi", "Find venues — often at home or a garden space. Capture: Venue Shortlist, Outdoor Space Available.", { priority: "medium", module: "/venues" }),
  item("p2-venue-06", "phase-2", "Research venues for reception", "Find reception venues with stage, dining, and dance floor space. Capture: Venue Shortlist, Seated Dinner Capacity.", { priority: "high", module: "/venues" }),
  item("p2-venue-07", "phase-2", "Research venues for welcome dinner", "Find a restaurant or space for the welcome/rehearsal dinner. Capture: Venue Shortlist, Style.", { priority: "medium", module: "/venues" }),
  item("p2-venue-08", "phase-2", "Visit top 3 venues per event in person", "Schedule site visits to finalist venues for each event. Capture: Visit Schedule, Site Visit Checklist, Visit Photos.", { priority: "critical", module: "/venues" }),
  item("p2-venue-09", "phase-2", "Check outside catering policy", "Confirm if venues allow outside caterers — critical for authentic Indian food. Capture: Outside Catering Allowed, Corkage/Kitchen Fee.", { priority: "critical", module: "/venues" }),
  item("p2-venue-10", "phase-2", "Check fire ceremony policy", "Verify venues allow havan/agni fire for the wedding ceremony. Capture: Fire Allowed, Fire Safety Requirements.", { priority: "critical", module: "/venues", tags: ["hindu"] }),
  item("p2-venue-11", "phase-2", "Check noise ordinances and end times", "Confirm noise restrictions and latest allowed event end time. Capture: Latest End Time.", { priority: "high", module: "/venues" }),
  item("p2-venue-12", "phase-2", "Check bridal suite / getting-ready rooms", "Ensure venue has rooms for bridal and groom prep. Capture: Bridal Suite Available, Groom's Room Available.", { priority: "high", module: "/venues" }),
  item("p2-venue-13", "phase-2", "Confirm parking and valet capacity", "Verify parking spots and valet service for guest count. Capture: Valet Available.", { priority: "medium", module: "/venues" }),
  item("p2-venue-14", "phase-2", "Confirm ADA accessibility", "Ensure venue is accessible for elderly and disabled guests. Capture: Wheelchair Accessible, Accessibility Notes.", { priority: "high", module: "/venues" }),
  item("p2-venue-15", "phase-2", "Review insurance requirements", "Check venue insurance requirements and obtain event liability coverage. Capture: Insurance Required, Coverage Amount, Policy Upload.", { priority: "medium", module: "/venues" }),
  item("p2-venue-16", "phase-2", "Sign contracts and pay deposits", "Finalize venue contracts and pay required deposits. Capture: Contract Upload, Deposit Amount, Payment Due Date, Balance Due.", { priority: "critical", module: "/venues" }),
  item("p2-venue-17", "phase-2", "Add all venue contacts to master vendor sheet", "Record contact info for every venue in a central vendor directory. Capture: Venue Contacts.", { priority: "medium", module: "/venues" }),

  // Accommodation Planning
  item("p2-accom-01", "phase-2", "Identify primary host hotel", "Select the main hotel for out-of-town guests. Capture: Hotel Name, Location/Address, Negotiated Rate, Hotel Contact.", { priority: "high" }),
  item("p2-accom-02", "phase-2", "Identify overflow hotels", "Find additional hotels at multiple price points. Capture: Overflow Hotels, Rate Ranges.", { priority: "medium" }),
  item("p2-accom-03", "phase-2", "Negotiate room block", "Secure a block of 10+ rooms at a group rate. Capture: Rooms Blocked, Cutoff Date.", { priority: "high", deps: ["p2-accom-01"] }),
  item("p2-accom-04", "phase-2", "Confirm room block cutoff date", "Note the deadline for guests to book at the group rate. Capture: Cutoff Date.", { priority: "high", deps: ["p2-accom-03"] }),
  item("p2-accom-05", "phase-2", "Set up booking link/code for guests", "Create an easy booking link or code guests can use. Capture: Booking Code.", { priority: "high", deps: ["p2-accom-03"] }),
  item("p2-accom-06", "phase-2", "Reserve hospitality suite", "Book a suite for welcome gift distribution. Capture: Suite Details.", { priority: "medium" }),
  item("p2-accom-07", "phase-2", "Book wedding night suite", "Reserve the bridal suite for the wedding night. Capture: Suite Type, Hotel, Cost per Night.", { priority: "high" }),
  item("p2-accom-08", "phase-2", "Book rooms for immediate family", "Reserve rooms for parents, siblings, and grandparents. Capture: Room Assignments, Total Cost.", { priority: "high", assigned: "family" }),
  item("p2-accom-09", "phase-2", "Reserve getting-ready rooms", "Book day-use rooms for bridal and groom prep on wedding day. Capture: Bridal Room, Groom Room.", { priority: "high" }),
  item("p2-accom-10", "phase-2", "Arrange airport shuttle/transport from hotel", "Coordinate airport pickups and hotel-venue shuttles. Capture: Shuttle Service, Shuttle Schedule.", { priority: "medium", module: "/transportation" }),

  // Priest & Religious Officiant
  item("p2-priest-01", "phase-2", "Book panditji / priest / granthi / kazi", "Secure the religious officiant for the ceremony. Capture: Priest Name, Tradition.", { priority: "critical" }),
  item("p2-priest-02", "phase-2", "Confirm language preference for ceremony", "Decide on Sanskrit, Hindi, English explanations, or bilingual ceremony. Capture: Primary Language, Translation Language.", { priority: "high", deps: ["p2-priest-01"] }),
  item("p2-priest-03", "phase-2", "Request puja samagri list", "Get the complete list of ceremony items needed from the priest. Capture: Samagri List, Where to Source.", { priority: "high", deps: ["p2-priest-01"] }),
  item("p2-priest-04", "phase-2", "Discuss ceremony duration and options", "Negotiate ceremony length and possible abbreviations. Capture: Expected Duration, Abbreviation Preferences.", { priority: "medium", deps: ["p2-priest-01"] }),
  item("p2-priest-05", "phase-2", "Request written ritual explanations", "Get descriptions of each ritual for the ceremony program. Capture: Ritual Explanations, Document Upload.", { priority: "medium", deps: ["p2-priest-01"] }),
  item("p2-priest-06", "phase-2", "Confirm priest's attire and expectations", "Discuss what the priest will wear and any requirements. Capture: Expected Attire, Special Requirements.", { priority: "low", deps: ["p2-priest-01"] }),
  item("p2-priest-07", "phase-2", "Discuss dakshina amount", "Agree on the priest's offering/honorarium. Capture: Dakshina Amount, Additional Gifts.", { priority: "medium", deps: ["p2-priest-01"] }),
  item("p2-priest-08", "phase-2", "Book secondary priests if needed", "Secure additional priests for multiple ceremonies. Capture: Secondary Priest, For Ceremony.", { priority: "medium" }),

  // Photography & Videography
  item("p2-photo-01", "phase-2", "Research photographers with Indian wedding experience", "Find photographers who specialize in multi-day Indian weddings. Capture: Photographer Shortlist, Photography Budget, Portfolio Links.", { priority: "critical", categoryTags: ["photography"], workspaceTabTags: ["shortlist"], linkedEntities: { budget_category: "Photo/Video" } }),
  item("p2-photo-02", "phase-2", "Review full weddings, not just highlights", "Ask to see complete wedding galleries to assess consistency. Capture: Portfolios Reviewed.", { priority: "high", deps: ["p2-photo-01"], categoryTags: ["photography"], workspaceTabTags: ["shortlist"] }),
  item("p2-photo-03", "phase-2", "Confirm number of shooters per event", "Determine how many photographers/videographers needed for each event. Capture: Shooters Per Event (List each event and number of photographers/videographers).", { priority: "high", categoryTags: ["photography", "videography"], workspaceTabTags: ["plan", "decisions"], linkedEntities: { event_day_ids: ["mehndi", "haldi", "sangeet", "wedding", "reception"] } }),
  item("p2-photo-04", "phase-2", "Book photographer", "Sign contract with your chosen photographer. Capture: Package, Total Cost.", { priority: "critical", categoryTags: ["photography"], workspaceTabTags: ["shortlist", "decisions"], linkedEntities: { budget_category: "Photo/Video" } }),
  item("p2-photo-05", "phase-2", "Book videographer", "Sign contract with videographer (often a separate vendor). Capture: Package, Total Cost.", { priority: "high", categoryTags: ["photography", "videography"], workspaceTabTags: ["shortlist", "decisions"], linkedEntities: { budget_category: "Photo/Video" } }),
  item("p2-photo-06", "phase-2", "Book cinematographer for highlight reel", "Hire a cinematographer for teaser/highlight reel if desired. Capture: Deliverables.", { priority: "medium", categoryTags: ["photography", "videography"], workspaceTabTags: ["shortlist", "decisions"], linkedEntities: { budget_category: "Photo/Video" } }),
  item("p2-photo-07", "phase-2", "Discuss drone footage", "Decide whether to include aerial drone footage and confirm legality. Capture: Include Drone, Legal to Fly.", { priority: "low", categoryTags: ["photography", "videography"], workspaceTabTags: ["plan", "decisions"] }),
  item("p2-photo-08", "phase-2", "Book same-day-edit vendor", "Hire someone to produce a same-day edit video for sangeet/reception screening. Capture: SDE Vendor, Screen At Event.", { priority: "medium", categoryTags: ["photography", "videography"], workspaceTabTags: ["shortlist", "decisions"], linkedEntities: { event_day_ids: ["sangeet", "reception"], budget_category: "Photo/Video" } }),
  item("p2-photo-09", "phase-2", "Plan pre-wedding photoshoot", "Organize an engagement or pre-wedding photoshoot. Capture: Shoot Date, Number of Outfits, Theme/Concept.", { priority: "medium", categoryTags: ["photography"], workspaceTabTags: ["vision", "plan"] }),
  item("p2-photo-10", "phase-2", "Plan save-the-date photoshoot", "Shoot photos specifically for save-the-date cards. Capture: Shoot Date, Concept.", { priority: "medium", categoryTags: ["photography", "stationery"], workspaceTabTags: ["vision", "plan"] }),
  item("p2-photo-11", "phase-2", "Discuss photo delivery timeline", "Agree on when you'll receive photos, albums, USB drives, and online galleries. Capture: Delivery Timeline, Deliverables Included.", { priority: "medium", categoryTags: ["photography"], workspaceTabTags: ["decisions"] }),
  item("p2-photo-12", "phase-2", "Review contract for raw files ownership", "Ensure you have rights to raw/unedited files if desired. Capture: Raw Files Included, Usage Rights.", { priority: "medium", categoryTags: ["photography"], workspaceTabTags: ["decisions"] }),
  item("p2-photo-13", "phase-2", "Book photo booth or 360 booth", "Arrange a photo booth or 360-degree booth for sangeet/reception. Capture: Booth Type, Vendor.", { priority: "low", categoryTags: ["photography"], workspaceTabTags: ["shortlist", "plan"], linkedEntities: { event_day_ids: ["sangeet", "reception"], budget_category: "Photo/Video" } }),
];

// ── Phase 3: Attire & Styling ───────────────────────────────────────────────

const p3: ChecklistItem[] = [
  // Bride's Wardrobe
  item("p3-bwar-01", "phase-3", "Define bridal aesthetic per event", "Set the look and feel for the bride's appearance at each event. Capture: Overall Aesthetic, Mood Board.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-02", "phase-3", "Research bridal designers", "Explore Sabyasachi, Manish Malhotra, Anita Dongre, Tarun Tahiliani, and local designers. Capture: Shortlisted Designers, Attire Budget, Portfolio Links.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-03", "phase-3", "Set bridal attire budget", "Allocate budget across all bridal outfits. Capture: Total Budget, Per-Outfit Budget.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-04", "phase-3", "Choose wedding lehenga", "Select color, fabric, embroidery style, and silhouette for the wedding lehenga. Capture: Designer.", { priority: "critical", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-05", "phase-3", "Order custom lehenga", "Place the order allowing 4–6 months for creation. Capture: Order Date, Expected Delivery, Deposit Paid.", { priority: "critical", assigned: "bride", module: "/outfits", deps: ["p3-bwar-04"] }),
  item("p3-bwar-06", "phase-3", "Schedule fittings", "Plan 3–4 fitting sessions for the wedding lehenga. Capture: Fitting 1 Date, Fitting 2 Date, Fitting 3 Date.", { priority: "high", assigned: "bride", module: "/outfits", deps: ["p3-bwar-05"] }),
  item("p3-bwar-07", "phase-3", "Choose reception outfit", "Select a gown, saree, or modern lehenga for the reception. Capture: Outfit Type, Color.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-08", "phase-3", "Choose sangeet outfit", "Pick a playful, contemporary outfit for the sangeet. Capture: Style, Color.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-09", "phase-3", "Choose mehndi outfit", "Select a comfortable outfit in yellow/green tones for mehndi. Capture: Style, Color.", { priority: "medium", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-10", "phase-3", "Choose haldi outfit", "Pick old or designated-to-stain yellow clothes for haldi. Capture: Outfit Description.", { priority: "medium", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-11", "phase-3", "Choose welcome dinner outfit", "Select an outfit for the welcome dinner", { priority: "medium", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-12", "phase-3", "Choose rehearsal / puja outfit", "Select an outfit for the rehearsal and pre-wedding puja. Capture: Style.", { priority: "low", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-13", "phase-3", "Choose post-wedding lunch outfit", "Select an outfit for the day-after brunch. Capture: Style.", { priority: "low", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-14", "phase-3", "Arrange backup wedding outfit", "Have a second outfit ready for after the ceremony. Capture: Backup Outfit.", { priority: "medium", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-15", "phase-3", "Arrange undergarments and shapewear", "Get appropriate undergarments and shapewear for each outfit. Capture: Items Needed.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-16", "phase-3", "Arrange petticoats and blouses", "Get petticoats and blouses tailored for each outfit. Capture: Number of Petticoats, Number of Blouses.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bwar-17", "phase-3", "Coordinate dupattas and veils", "Select coordinating dupattas and veils for each outfit. Capture: Dupatta/Veil List.", { priority: "medium", assigned: "bride", module: "/outfits" }),

  // Bride's Jewelry
  item("p3-bjew-01", "phase-3", "Decide on jewelry style", "Choose overall jewelry aesthetic: temple, kundan, polki, meenakari, diamond, or contemporary. Capture: Primary Style, Jewelry Budget.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bjew-02", "phase-3", "Select maang tikka and matha patti", "Choose headpiece jewelry for the wedding. Capture: Style, Source/Jeweler.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bjew-03", "phase-3", "Select nath (nose ring) and chain", "Choose the bridal nose ring and supporting chain. Capture: Style.", { priority: "high", assigned: "bride", module: "/outfits", tags: ["north-indian", "marathi"] }),
  item("p3-bjew-04", "phase-3", "Select earrings for each event", "Choose earrings that coordinate with each outfit. Capture: Number of Pairs, Earring Details per Event, Total Cost.", { priority: "medium", assigned: "bride", module: "/outfits" }),
  item("p3-bjew-05", "phase-3", "Select necklace sets for wedding", "Choose short necklace and rani haar (long necklace) for the wedding", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bjew-06", "phase-3", "Select choker if desired", "Choose a choker necklace if part of the look. Capture: Style.", { priority: "low", assigned: "bride", module: "/outfits" }),
  item("p3-bjew-07", "phase-3", "Arrange bangles and chooda", "Get chooda (Punjabi), glass bangles, gold bangles, and kaleerein as per tradition. Capture: Bangle Types.", { priority: "high", assigned: "bride", module: "/outfits", tags: ["punjabi", "north-indian"] }),
  item("p3-bjew-08", "phase-3", "Select haath phool / hand harness", "Choose hand jewelry for the wedding. Capture: Style.", { priority: "medium", assigned: "bride", module: "/outfits" }),
  item("p3-bjew-09", "phase-3", "Arrange rings", "Select engagement and wedding rings. Capture: Engagement Ring, Wedding Band, Total Cost.", { priority: "critical", module: "/outfits" }),
  item("p3-bjew-10", "phase-3", "Select waist belt (kamarbandh)", "Choose a decorative waist belt for the wedding outfit. Capture: Style.", { priority: "medium", assigned: "bride", module: "/outfits" }),
  item("p3-bjew-11", "phase-3", "Select anklets and toe rings", "Choose payal (anklets) and bichhiya (toe rings). Capture: Style.", { priority: "medium", assigned: "bride", module: "/outfits" }),
  item("p3-bjew-12", "phase-3", "Select armlets (baajuband)", "Choose arm jewelry for the wedding. Capture: Style.", { priority: "low", assigned: "bride", module: "/outfits" }),
  item("p3-bjew-13", "phase-3", "Arrange jewelry insurance", "Insure valuable jewelry pieces for the wedding events. Capture: Insurance Provider, Insured Value, Policy Document.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-bjew-14", "phase-3", "Plan safe storage for event days", "Arrange secure storage and transport for jewelry during events. Capture: Storage Plan, Person Responsible.", { priority: "high", assigned: "bride", module: "/outfits" }),

  // Bride's Beauty
  item("p3-beau-01", "phase-3", "Book makeup artist for each event", "Hire an MUA experienced with Indian bridal makeup. Capture: Events Booked For, Total Cost.", { priority: "critical", assigned: "bride", module: "/outfits" }),
  item("p3-beau-02", "phase-3", "Makeup trial with MUA", "Schedule and complete a trial makeup session. Capture: Trial Date, Trial Photos, Feedback Notes.", { priority: "high", assigned: "bride", module: "/outfits", deps: ["p3-beau-01"], categoryTags: ["hmua", "photography"], workspaceTabTags: ["vision"] }),
  item("p3-beau-03", "phase-3", "Book hair stylist", "Hire a hair stylist for the wedding events", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p3-beau-04", "phase-3", "Hair trial with stylist", "Test hairstyles with the actual headpieces and dupatta. Capture: Trial Date, Trial Photos, Feedback.", { priority: "high", assigned: "bride", module: "/outfits", deps: ["p3-beau-03"], categoryTags: ["hmua", "photography"], workspaceTabTags: ["vision"] }),
  item("p3-beau-05", "phase-3", "Decide on hairstyles per event", "Choose hairstyle for each event: updo, braid, open, half-up. Capture: Hairstyle per Event, Inspiration Photos.", { priority: "medium", assigned: "bride", module: "/outfits" }),
  item("p3-beau-06", "phase-3", "Book mehndi artist for bride", "Book a specialist for the bride's intricate hands and feet mehndi. Capture: Mehndi Artist, Design Style.", { priority: "critical", assigned: "bride", module: "/mehndi" }),
  item("p3-beau-06b", "phase-3", "Test trial with mehndi artist", "Do a small test application to check color stain quality, design skill, and allergic reaction. Capture: Trial Date, Color After 24hr, Any Skin Reaction.", { priority: "high", assigned: "bride", module: "/mehndi", deps: ["p3-beau-06"] }),
  item("p3-beau-07", "phase-3", "Plan skincare regimen", "Start a wedding skincare routine 6+ months out. Capture: Dermatologist, Key Products.", { priority: "medium", assigned: "bride" }),
  item("p3-beau-08", "phase-3", "Plan facials timeline", "Schedule facials — last one 3–5 days before the wedding. Capture: Facial Schedule, Aesthetician.", { priority: "medium", assigned: "bride" }),
  item("p3-beau-09", "phase-3", "Plan hair treatments", "Schedule oiling, spa treatments, keratin if desired. Capture: Treatment Plan.", { priority: "low", assigned: "bride" }),
  item("p3-beau-10", "phase-3", "Plan threading / waxing / laser schedule", "Schedule hair removal treatments leading up to the wedding. Capture: Provider.", { priority: "medium", assigned: "bride" }),
  item("p3-beau-11", "phase-3", "Schedule nail appointments", "Book mani/pedi before mehndi application. Capture: Appointment Date, Nail Style.", { priority: "medium", assigned: "bride" }),
  item("p3-beau-12", "phase-3", "Teeth whitening if desired", "Schedule teeth whitening treatments. Capture: Dentist, Appointment Date.", { priority: "low", assigned: "bride" }),
  item("p3-beau-13", "phase-3", "Plan gym / fitness routine", "Establish a fitness routine leading up to the wedding. Capture: Workout Plan, Trainer.", { priority: "low", assigned: "bride" }),
  item("p3-beau-14", "phase-3", "Plan meal planning for skin and energy", "Design a nutrition plan for glowing skin and sustained energy. Capture: Meal Plan, Nutritionist.", { priority: "low", assigned: "bride" }),
  item("p3-beau-15", "phase-3", "Plan mental wellness routine", "Incorporate therapy, meditation, or self-care practices. Capture: Wellness Plan, Therapist/Coach.", { priority: "medium", assigned: "bride" }),

  // Groom's Wardrobe
  item("p3-gwar-01", "phase-3", "Choose wedding sherwani", "Select color, embroidery, and silhouette for the wedding sherwani. Capture: Designer.", { priority: "critical", assigned: "groom", module: "/outfits" }),
  item("p3-gwar-02", "phase-3", "Arrange safa / pagdi with kalgi", "Get a turban with kalgi brooch to match the sherwani. Capture: Safa Style, Color.", { priority: "high", assigned: "groom", module: "/outfits", tags: ["north-indian", "rajasthani"] }),
  item("p3-gwar-03", "phase-3", "Arrange mojris / juttis", "Get embroidered traditional shoes. Capture: Style, Size.", { priority: "high", assigned: "groom", module: "/outfits" }),
  item("p3-gwar-04", "phase-3", "Arrange dupatta / stole", "Get a coordinating dupatta or stole for the sherwani. Capture: Style.", { priority: "medium", assigned: "groom", module: "/outfits" }),
  item("p3-gwar-05", "phase-3", "Arrange sehra if tradition requires", "Get a face veil of flowers if tradition calls for it. Capture: Sehra Type.", { priority: "medium", assigned: "groom", module: "/outfits", tags: ["north-indian", "punjabi"] }),
  item("p3-gwar-06", "phase-3", "Arrange kirpan / sword if tradition requires", "Procure a ceremonial sword if tradition calls for it. Capture: Source.", { priority: "low", assigned: "groom", module: "/outfits", tags: ["rajput", "sikh", "marwari"] }),
  item("p3-gwar-07", "phase-3", "Choose reception suit or indo-western", "Select a suit or indo-western outfit for the reception. Capture: Style, Color.", { priority: "high", assigned: "groom", module: "/outfits" }),
  item("p3-gwar-08", "phase-3", "Choose sangeet outfit", "Select bandhgala, nehru jacket, or playful kurta for sangeet. Capture: Style.", { priority: "medium", assigned: "groom", module: "/outfits" }),
  item("p3-gwar-09", "phase-3", "Choose mehndi kurta", "Select a kurta for the mehndi event. Capture: Style.", { priority: "medium", assigned: "groom", module: "/outfits" }),
  item("p3-gwar-10", "phase-3", "Choose haldi kurta", "Pick old or designated-to-stain clothes for haldi. Capture: Outfit.", { priority: "low", assigned: "groom", module: "/outfits" }),
  item("p3-gwar-11", "phase-3", "Choose welcome dinner outfit", "Select an outfit for the welcome dinner", { priority: "medium", assigned: "groom", module: "/outfits" }),
  item("p3-gwar-12", "phase-3", "Arrange accessories", "Get socks, pocket squares, cufflinks for each outfit. Capture: Accessories List, Total Cost.", { priority: "low", assigned: "groom", module: "/outfits" }),
  item("p3-gwar-13", "phase-3", "Select wedding day watch", "Choose a special watch for the wedding day", { priority: "low", assigned: "groom", module: "/outfits" }),
  item("p3-gwar-14", "phase-3", "Arrange grooming kit and backup", "Prepare a grooming kit for the wedding day and backups. Capture: Kit Contents.", { priority: "medium", assigned: "groom" }),

  // Groom's Jewelry & Accessories
  item("p3-gjew-01", "phase-3", "Select kalgi and brooch for safa", "Choose decorative kalgi pin and brooch for the turban. Capture: Style.", { priority: "high", assigned: "groom", module: "/outfits" }),
  item("p3-gjew-02", "phase-3", "Select kada (bracelet)", "Choose a traditional bracelet/kada. Capture: Material.", { priority: "medium", assigned: "groom", module: "/outfits", tags: ["sikh", "punjabi"] }),
  item("p3-gjew-03", "phase-3", "Select groom's rings", "Choose engagement and wedding rings for the groom. Capture: Ring Style, Material.", { priority: "critical", assigned: "groom", module: "/outfits" }),
  item("p3-gjew-04", "phase-3", "Select chain if desired", "Choose a neck chain for the wedding. Capture: Style.", { priority: "low", assigned: "groom", module: "/outfits" }),
  item("p3-gjew-05", "phase-3", "Select cufflinks and studs", "Choose cufflinks and shirt studs for formal outfits. Capture: Style.", { priority: "low", assigned: "groom", module: "/outfits" }),
  item("p3-gjew-06", "phase-3", "Arrange walking stick if tradition includes", "Procure a decorative walking stick if required by tradition. Capture: Style.", { priority: "low", assigned: "groom", module: "/outfits", tags: ["nawabi", "lucknowi"] }),

  // Family & Bridal Party Attire
  item("p3-fam-01", "phase-3", "Coordinate parents' outfits", "Plan outfits for both mothers and both fathers across events. Capture: Outfit Coordination Plan, Budget per Parent.", { priority: "high", assigned: "family", module: "/outfits" }),
  item("p3-fam-02", "phase-3", "Coordinate siblings' outfits per event", "Plan coordinated outfits for siblings across all events. Capture: Coordination Plan.", { priority: "medium", assigned: "family", module: "/outfits" }),
  item("p3-fam-03", "phase-3", "Decide on bridesmaids' outfits", "Choose coordinated or matching outfits for bridesmaids. Capture: Style, Color, Cost per Bridesmaid.", { priority: "medium", assigned: "bride", module: "/outfits" }),
  item("p3-fam-04", "phase-3", "Decide on groomsmen's outfits", "Choose coordinated outfits for groomsmen. Capture: Style, Color, Cost per Groomsman.", { priority: "medium", assigned: "groom", module: "/outfits" }),
  item("p3-fam-05", "phase-3", "Arrange outfits for grandparents", "Ensure grandparents have comfortable and appropriate outfits. Capture: Outfit Plan.", { priority: "medium", assigned: "family", module: "/outfits" }),
  item("p3-fam-06", "phase-3", "Coordinate sangeet performance outfits", "Plan outfits for cousins and family members performing at sangeet. Capture: Performance Groups.", { priority: "medium", assigned: "family", module: "/outfits" }),
  item("p3-fam-07", "phase-3", "Order flower girl / ring bearer outfits", "Get coordinated outfits for flower girls and ring bearer. Capture: Kids & Sizes, Style.", { priority: "medium", assigned: "family", module: "/outfits" }),

  // Guest Attire Style Guide
  item("p3-style-01", "phase-3", "Define dress code per event", "Set clear dress codes for each wedding event. Capture: Dress Codes per Event.", { priority: "high", module: "/outfits" }),
  item("p3-style-02", "phase-3", "Create visual style guide", "Build a Pinterest board or PDF with example outfits. Capture: Style Guide Upload, Pinterest Board Link.", { priority: "medium", module: "/outfits" }),
  item("p3-style-03", "phase-3", "Include color recommendations per event", "Guide guests on which colors to wear for each event. Capture: Color Recommendations.", { priority: "medium", module: "/outfits" }),
  item("p3-style-04", "phase-3", "Include what NOT to wear", "Warn guests about colors to avoid: red (only for bride), black, white at certain events. Capture: Colors/Items to Avoid.", { priority: "high", module: "/outfits" }),
  item("p3-style-05", "phase-3", "Provide guidance for non-Indian guests", "Include where to shop, how to drape a saree, kurta basics. Capture: Non-Indian Guest Guide, Recommended Shops.", { priority: "medium", module: "/outfits" }),
  item("p3-style-06", "phase-3", "Include links to recommended shops", "Share online stores and local shops for guest outfits. Capture: Shop Links.", { priority: "low", module: "/outfits" }),
  item("p3-style-07", "phase-3", "Include photos of appropriate looks", "Add example photos for each event's dress code", { priority: "low", module: "/outfits", categoryTags: ["wardrobe", "photography"], workspaceTabTags: ["vision"] }),
  item("p3-style-08", "phase-3", "Share style guide on wedding website", "Publish the style guide on the wedding website. Capture: Published.", { priority: "medium", module: "/outfits", deps: ["p3-style-02"] }),
  item("p3-style-09", "phase-3", "Address weather and footwear", "Include guidance for outdoor venues, grass, and temple shoe removal. Capture: Weather & Footwear Notes.", { priority: "medium", module: "/outfits" }),
  item("p3-style-10", "phase-3", "Address modesty expectations", "Note any modesty requirements for religious venues. Capture: Modesty Guidelines.", { priority: "medium", module: "/outfits" }),
  item("p3-style-11", "phase-3", "Offer sari-draping service or tutorials", "Provide sari-draping help or video tutorials for non-Indian guests. Capture: Draping Service, Tutorial Link.", { priority: "low", module: "/outfits" }),
];

// ── Phase 4: Vendors — Experience Layer ─────────────────────────────────────

const p4: ChecklistItem[] = [
  // Catering
  item("p4-cater-01", "phase-4", "Define cuisine style per event", "Choose cuisines: North Indian, South Indian, Indo-Chinese, Continental, fusion. Capture: Cuisines per Event.", { priority: "critical" }),
  item("p4-cater-02", "phase-4", "Confirm dietary requirements", "Document vegetarian, Jain, vegan, halal requirements. Capture: Dietary Requirements.", { priority: "critical" }),
  item("p4-cater-03", "phase-4", "Research caterers", "Find caterers with Indian wedding experience. Capture: Caterer Shortlist, Catering Budget.", { priority: "high" }),
  item("p4-cater-04", "phase-4", "Schedule tastings", "Arrange tastings with 2–3 finalist caterers. Capture: Tasting Dates, Tasting Notes.", { priority: "high", deps: ["p4-cater-03"] }),
  item("p4-cater-05", "phase-4", "Book caterer", "Sign contract with chosen caterer. Capture: Total Cost.", { priority: "critical", deps: ["p4-cater-04"] }),
  item("p4-cater-06", "phase-4", "Design welcome dinner menu", "Plan the welcome dinner menu", { priority: "medium" }),
  item("p4-cater-07", "phase-4", "Design mehndi menu", "Plan light menu — often chaat-focused", { priority: "medium" }),
  item("p4-cater-08", "phase-4", "Design haldi menu", "Plan traditional homestyle menu for haldi", { priority: "medium" }),
  item("p4-cater-09", "phase-4", "Design sangeet menu", "Plan elaborate, multi-station sangeet menu. Capture: Live Stations.", { priority: "high" }),
  item("p4-cater-10", "phase-4", "Design wedding lunch/dinner menu", "Plan the main wedding meal. Capture: Menu.", { priority: "critical" }),
  item("p4-cater-11", "phase-4", "Design reception menu", "Plan reception menu — often different cuisine for variety", { priority: "high" }),
  item("p4-cater-12", "phase-4", "Design post-wedding brunch menu", "Plan the day-after brunch menu", { priority: "low" }),
  item("p4-cater-13", "phase-4", "Plan live food stations", "Set up chaat, dosa, pasta, grill, paan, kulfi stations. Capture: Station List, Additional Cost.", { priority: "medium" }),
  item("p4-cater-14", "phase-4", "Plan dessert spread", "Design mithai, halwa, jalebi, and western dessert display. Capture: Dessert Items.", { priority: "medium" }),
  item("p4-cater-15", "phase-4", "Plan welcome drinks and mocktails", "Design welcome drink menu", { priority: "medium" }),
  item("p4-cater-16", "phase-4", "Plan signature cocktails", "Create signature cocktails with wedding brand names. Capture: Cocktail Recipes.", { priority: "medium" }),
  item("p4-cater-17", "phase-4", "Confirm head count per event", "Get final guest count for each event for the caterer. Capture: Head Counts per Event.", { priority: "critical", module: "/guests" }),
  item("p4-cater-18", "phase-4", "Discuss dietary accommodations", "Plan for allergies, gluten-free, diabetic guests. Capture: Special Accommodations.", { priority: "high" }),
  item("p4-cater-19", "phase-4", "Plan vendor meals", "Arrange meals for photographers, DJs, and other vendors. Capture: Vendor Meal Count, Vendor Menu.", { priority: "medium" }),
  item("p4-cater-20", "phase-4", "Plan kids' meal options", "Create kid-friendly meal options. Capture: Kids Menu.", { priority: "low" }),

  // Wedding Cake & Baker
  item("p4-cake-01", "phase-4", "Research bakers and schedule cake tastings", "Find bakers experienced with Indian wedding cakes; schedule tastings with 2–3 finalists. Capture: Baker Shortlist, Tasting Dates, Tasting Notes.", { priority: "medium" }),
  item("p4-cake-02", "phase-4", "Book baker", "Sign contract with chosen baker. Capture: Total Cost.", { priority: "medium", deps: ["p4-cake-01"] }),
  item("p4-cake-03", "phase-4", "Order wedding cake", "Place the wedding cake order with size, tiers, and delivery details. Capture: Number of Tiers, Servings, Delivery Date/Time.", { priority: "medium", deps: ["p4-cake-02"] }),
  item("p4-cake-04", "phase-4", "Confirm cake design and flavor", "Lock in cake design, color, motif, and flavor combinations. Capture: Design Reference, Flavors per Tier, Dietary Accommodations.", { priority: "medium", deps: ["p4-cake-02"] }),
  item("p4-cake-05", "phase-4", "Order groom's cake or mithai display", "Optional second cake or traditional mithai tower for the reception", { priority: "low" }),

  // Bar & Beverage
  item("p4-bar-01", "phase-4", "Decide alcohol policy", "Choose open bar, limited, or dry event policy", { priority: "high" }),
  item("p4-bar-02", "phase-4", "Determine alcohol provider", "Decide if venue, caterer, or couple provides alcohol. Capture: Provider.", { priority: "high" }),
  item("p4-bar-03", "phase-4", "Calculate quantity per event", "Estimate alcohol quantities based on guest count and duration. Capture: Quantity Estimates, Beverage Budget.", { priority: "medium" }),
  item("p4-bar-04", "phase-4", "Stock wine, beer, liquor, mixers", "Create a comprehensive beverage shopping list. Capture: Total Cost.", { priority: "medium" }),
  item("p4-bar-05", "phase-4", "Design signature cocktails", "Create branded cocktails with names tied to the wedding. Capture: Cocktail Names & Recipes, Bar Signage Design.", { priority: "medium" }),
  item("p4-bar-06", "phase-4", "Plan non-alcoholic options", "Design mocktails, chai bar, coffee bar, lassi bar options. Capture: Non-Alcoholic Menu.", { priority: "high" }),
  item("p4-bar-07", "phase-4", "Book bartenders", "Hire bartending staff for events. Capture: Bartending Service, Number of Bartenders.", { priority: "high" }),
  item("p4-bar-08", "phase-4", "Arrange glassware rentals", "Rent specialty glassware if not provided by venue. Capture: Rental Company.", { priority: "low" }),
  item("p4-bar-09", "phase-4", "Purchase bar liability insurance", "Get liability insurance for alcohol service if required", { priority: "medium" }),

  // Decor & Florals
  item("p4-decor-01", "phase-4", "Hire decorator/florist", "Book a decorator or florist for all events. Capture: Total Cost, Contract.", { priority: "critical" }),
  item("p4-decor-02", "phase-4", "Share mood boards per event", "Send visual inspiration for each event's decor. Capture: Mood Boards, Decor Notes.", { priority: "high" }),
  item("p4-decor-03", "phase-4", "Design mandap", "Plan mandap structure, florals, fabric, and seating. Capture: Mandap Style, Floral Concept, Fabric/Color.", { priority: "critical" }),
  item("p4-decor-04", "phase-4", "Plan baraat decor", "Design entrance decor and horse/car decoration. Capture: Baraat Decor Concept.", { priority: "high" }),
  item("p4-decor-05", "phase-4", "Design sangeet stage", "Plan backdrop, seating, and dance floor lighting for sangeet. Capture: Stage Concept, Backdrop Design.", { priority: "high" }),
  item("p4-decor-06", "phase-4", "Design mehndi setup", "Plan low seating, cushions, swings, and floral installations. Capture: Setup Concept, Seating Style.", { priority: "high" }),
  item("p4-decor-07", "phase-4", "Design haldi setup", "Plan marigold, yellow drape, and flower petal decor. Capture: Setup Concept, Flower Types.", { priority: "medium" }),
  item("p4-decor-08", "phase-4", "Design reception stage", "Plan backdrop and couple's seating for reception. Capture: Stage Concept, Backdrop Design.", { priority: "high" }),
  item("p4-decor-09", "phase-4", "Plan entrance decor for each event", "Design welcoming entrance installations for every event. Capture: Entrance Concepts per Event.", { priority: "medium" }),
  item("p4-decor-10", "phase-4", "Plan table centerpieces per event", "Design centerpieces that match each event's theme. Capture: Centerpiece Concepts.", { priority: "medium" }),
  item("p4-decor-11", "phase-4", "Design welcome signage", "Create welcome signs for each venue entrance. Capture: Sign Designs.", { priority: "medium" }),
  item("p4-decor-12", "phase-4", "Design escort cards / seating charts", "Create decorative escort cards and seating chart display. Capture: Style, Design.", { priority: "medium" }),
  item("p4-decor-13", "phase-4", "Design photo booth backdrop", "Create a branded or themed photo booth backdrop. Capture: Backdrop Concept.", { priority: "low" }),
  item("p4-decor-14", "phase-4", "Plan ceiling installations", "Design hanging florals, diyas, pom-poms, or fabric draping. Capture: Installation Concept.", { priority: "medium" }),
  item("p4-decor-15", "phase-4", "Plan aisle decor for ceremony", "Design the ceremony aisle with petals, lights, or floral arrangements. Capture: Aisle Concept.", { priority: "high" }),
  item("p4-decor-16", "phase-4", "Plan pathway lighting and rangoli", "Design pathway with diyas, rangoli, and lighting. Capture: Pathway Concept.", { priority: "medium" }),
  item("p4-decor-17", "phase-4", "Select flower varieties", "Choose flowers: marigold, rose, jasmine, orchid, lily, etc. Capture: Flower Selection, Floral Budget.", { priority: "high" }),
  item("p4-decor-18", "phase-4", "Confirm delivery and teardown logistics", "Coordinate decor setup, event timing, and teardown schedules. Capture: Setup/Teardown Schedule, Vendor Contacts.", { priority: "high", assigned: "planner" }),
  item("p4-decor-19", "phase-4", "Order personal flowers", "Finalize garlands, bouquets, corsages, boutonnieres, and haldi/pithi floral jewelry for the couple and family. Capture: Varmala/Jaimala Garlands (Style, flowers, quantity), Bridal Bouquets, Corsages & Boutonnieres (Parents, bridal party), Haldi/Pithi Floral Jewelry, Welcome Garlands.", { priority: "high" }),

  // Lighting & Production
  item("p4-light-01", "phase-4", "Hire lighting designer", "Book a lighting designer or confirm through decorator. Capture: Lighting Vendor.", { priority: "high" }),
  item("p4-light-02", "phase-4", "Plan uplighting per venue", "Design ambient uplighting for each venue. Capture: Uplight Colors per Venue.", { priority: "medium" }),
  item("p4-light-03", "phase-4", "Plan dance floor lighting for sangeet", "Design dynamic lighting for the sangeet dance floor. Capture: Lighting Concept, Effects.", { priority: "high" }),
  item("p4-light-04", "phase-4", "Plan fairy lights for outdoor events", "Arrange string lights and fairy lights for outdoor ambiance. Capture: Fairy Light Plan.", { priority: "medium" }),
  item("p4-light-05", "phase-4", "Plan pin-spotting for centerpieces", "Add focused lighting on table centerpieces. Capture: Number of Pin Spots.", { priority: "low" }),
  item("p4-light-06", "phase-4", "Plan GOBO projection", "Project monogram or patterns on dance floor/walls. Capture: GOBO Design, Projection Location.", { priority: "low" }),
  item("p4-light-07", "phase-4", "Rent sound system and microphones", "Arrange PA system and wireless mics for ceremonies and speeches. Capture: AV Vendor.", { priority: "high" }),
  item("p4-light-08", "phase-4", "Book AV technician", "Hire a technician to manage sound and lighting during events. Capture: AV Tech.", { priority: "high" }),

  // Music & Entertainment
  item("p4-music-01", "phase-4", "Book DJ for sangeet and reception", "Hire a DJ experienced with Bollywood and fusion music. Capture: Contract.", { priority: "critical", module: "/entertainment" }),
  item("p4-music-02", "phase-4", "Share music preferences and do-not-play list", "Provide the DJ with preferred songs and songs to avoid. Capture: Must-Play Songs, Do-Not-Play List.", { priority: "medium", module: "/entertainment" }),
  item("p4-music-03", "phase-4", "Book dhol player for baraat", "Hire dhol players for the baraat procession. Capture: Number of Dhols.", { priority: "high", module: "/entertainment", tags: ["north-indian", "punjabi"] }),
  item("p4-music-04", "phase-4", "Book shehnai / nadaswaram for ceremony", "Hire traditional musicians for the ceremony. Capture: Instrument.", { priority: "medium", module: "/entertainment" }),
  item("p4-music-05", "phase-4", "Book classical vocalists / instrumentalists", "Hire classical musicians for ceremony or cocktail hour", { priority: "low", module: "/entertainment" }),
  item("p4-music-06", "phase-4", "Book Bollywood band for sangeet", "Hire a live Bollywood cover band for sangeet", { priority: "medium", module: "/entertainment" }),
  item("p4-music-07", "phase-4", "Book ghazal / qawwali singers for mehndi", "Hire singers for the mehndi evening. Capture: Genre.", { priority: "medium", module: "/entertainment" }),
  item("p4-music-08", "phase-4", "Book dance performers", "Hire garba troupe, bhangra, or classical dance performers. Capture: Performance Type.", { priority: "medium", module: "/entertainment" }),
  item("p4-music-09", "phase-4", "Book emcee / MC", "Hire an emcee, ideally bilingual, for sangeet and reception. Capture: Languages.", { priority: "high", module: "/entertainment" }),
  item("p4-music-10", "phase-4", "Plan sangeet performances schedule", "Create a detailed run-of-show for all sangeet performances. Capture: Performance Schedule.", { priority: "high", module: "/entertainment" }),
  item("p4-music-11", "phase-4", "Book choreographer for family dances", "Hire a choreographer to teach family performances. Capture: Number of Dances.", { priority: "high", module: "/entertainment" }),
  item("p4-music-12", "phase-4", "Schedule choreography sessions", "Plan rehearsal dates for all dance performances. Capture: Rehearsal Schedule.", { priority: "high", module: "/entertainment", deps: ["p4-music-11"] }),
  item("p4-music-13", "phase-4", "Plan grand entrance concept", "Design the couple's grand entrance at reception. Capture: Entrance Concept, Entrance Song.", { priority: "medium", module: "/entertainment" }),
  item("p4-music-14", "phase-4", "Plan first dance song", "Choose and prepare for the couple's first dance. Capture: Song, Dance Lessons Needed.", { priority: "medium", module: "/entertainment" }),
  item("p4-music-15", "phase-4", "Plan parents' dances", "Arrange special dances with parents. Capture: Parent Dance Songs.", { priority: "low", module: "/entertainment" }),
  item("p4-music-16", "phase-4", "Book cocktail hour entertainment", "Hire acoustic musicians, magician, or caricaturist. Capture: Entertainment Type, Vendor.", { priority: "low", module: "/entertainment" }),
  item("p4-music-17", "phase-4", "Book fireworks / sparklers / cold pyro", "Arrange pyrotechnics if permitted at the venue. Capture: Venue Permits.", { priority: "low", module: "/entertainment" }),
  item("p4-music-18", "phase-4", "Book baraat extras", "Hire nachaniyas, flag bearers, fire twirlers, LED dhols. Capture: Baraat Extras.", { priority: "medium", module: "/entertainment", tags: ["north-indian", "punjabi"] }),

  // Transportation
  item("p4-trans-01", "phase-4", "Arrange baraat vehicle", "Book horse, elephant, vintage car, or convertible for the baraat. Capture: Vehicle Type, Provider.", { priority: "high", module: "/transportation" }),
  item("p4-trans-02", "phase-4", "Arrange bride's entrance", "Plan doli, palanquin, or phoolon ki chaadar for bride's entrance. Capture: Entrance Style.", { priority: "high", module: "/transportation" }),
  item("p4-trans-03", "phase-4", "Arrange guest shuttles", "Book shuttles between hotel and venue for each event. Capture: Shuttle Company, Shuttle Schedule.", { priority: "high", module: "/transportation" }),
  item("p4-trans-04", "phase-4", "Coordinate airport pickups", "Arrange airport transportation for out-of-town guests. Capture: Car Service, Pickup Schedule.", { priority: "medium", module: "/transportation" }),
  item("p4-trans-05", "phase-4", "Arrange VIP transport for elderly", "Provide dedicated transport for elderly and mobility-limited guests. Capture: VIP Transport Plan.", { priority: "high", module: "/transportation" }),
  item("p4-trans-06", "phase-4", "Book parking attendants and valet", "Arrange valet and parking management at venues. Capture: Valet Service.", { priority: "medium", module: "/transportation" }),
  item("p4-trans-07", "phase-4", "Arrange couple's getaway car", "Book a special car for the couple's departure after the wedding. Capture: Car Type, Provider, Decoration Plan.", { priority: "medium", module: "/transportation" }),
  item("p4-trans-08", "phase-4", "Create shuttle schedule and signage", "Design printed shuttle schedules and directional signs. Capture: Schedule Document, Signage Design.", { priority: "medium", module: "/transportation" }),
  item("p4-trans-09", "phase-4", "Create driver list and contact sheet", "Compile all driver names and phone numbers for event day. Capture: Driver Contact Sheet.", { priority: "high", assigned: "planner", module: "/transportation" }),
  item("p4-trans-10", "phase-4", "Arrange backup vehicles", "Have backup transportation options on standby. Capture: Backup Plan.", { priority: "medium", module: "/transportation" }),

  // Guest Experiences — experiential extras (photo booths, live artists,
  // interactive stations, wow moments). Discovery happens in the workspace;
  // this layer is the booking-side work.
  item("p4-guexp-01", "phase-4", "Walk couple through the Experience Explorer", "Facilitate the Discover & Dream session — react to each category, build a loved-items list.", { priority: "medium", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_discover"] }),
  item("p4-guexp-02", "phase-4", "Draft the Guest Experience Brief", "Capture the couple's experiential vision in one narrative document.", { priority: "medium", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_shortlist"] }),
  item("p4-guexp-03", "phase-4", "Research vendors for each shortlisted experience", "For every loved item, identify 2–3 viable vendors in the host city.", { priority: "high", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_shortlist"] }),
  item("p4-guexp-04", "phase-4", "Collect quotes for shortlisted experiences", "Send the brief to shortlisted vendors; gather pricing, availability, logistics.", { priority: "high", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_shortlist"] }),
  item("p4-guexp-05", "phase-4", "Book confirmed experiences", "Sign contracts and pay deposits for the experiences that make the final cut.", { priority: "critical", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_shortlist"] }),
  item("p4-guexp-06", "phase-4", "Coordinate experience setup with the venue", "Share load-in windows, power needs, and footprint for each experience with the venue team.", { priority: "high", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences", "venue"], workspaceTabTags: ["guest_shortlist"] }),
  item("p4-guexp-07", "phase-4", "Brief experience vendors on the event timeline", "Confirm setup times, peak hours, and breakdown for every shortlisted experience.", { priority: "medium", assigned: "planner", module: "/workspace/guest-experiences", categoryTags: ["guest_experiences"], workspaceTabTags: ["guest_shortlist"] }),
];

// ── Phase 5: Paper & Stationery ─────────────────────────────────────────────

const p5: ChecklistItem[] = [
  // Save-the-Dates
  item("p5-std-01", "phase-5", "Design save-the-date", "Create digital and/or print save-the-date cards. Capture: Format, Designer, Design Upload.", { priority: "high", module: "/stationery" }),
  item("p5-std-02", "phase-5", "Compile mailing addresses", "Collect mailing addresses for all save-the-date recipients. Capture: Total Recipients, Address Spreadsheet.", { priority: "high", module: "/guests" }),
  item("p5-std-03", "phase-5", "Print and mail save-the-dates", "Send save-the-dates 8–10 months before the wedding. Capture: Printer, Quantity, Mail Date.", { priority: "high", module: "/stationery", deps: ["p5-std-01", "p5-std-02", "p2-photo-10"], categoryTags: ["stationery", "photography"], workspaceTabTags: ["plan"] }),
  item("p5-std-04", "phase-5", "Send digital version for international guests", "Email or WhatsApp save-the-dates to overseas guests. Capture: Sent, Delivery Method.", { priority: "medium", module: "/stationery", deps: ["p5-std-01"] }),

  // Invitations
  item("p5-inv-01", "phase-5", "Choose invitation designer", "Select a stationer or designer for the invitation suite. Capture: Designer/Stationer, Style.", { priority: "high", module: "/stationery" }),
  item("p5-inv-02", "phase-5", "Decide invitation suite components", "Plan main card, event inserts, RSVP card, accommodation, travel, dress code, kids, and registry inserts. Capture: Included Components.", { priority: "high", module: "/stationery" }),
  item("p5-inv-03", "phase-5", "Decide on languages", "Choose English, Hindi, Sanskrit, regional scripts, or bilingual. Capture: Languages.", { priority: "high", module: "/stationery" }),
  item("p5-inv-04", "phase-5", "Include Ganesh motif or shloka", "Add traditional Ganesh motif or auspicious verse at top. Capture: Motif/Shloka.", { priority: "medium", module: "/stationery", tags: ["hindu"] }),
  item("p5-inv-05", "phase-5", "Include parents' names in proper order", "List both sets of parents' names following cultural conventions. Capture: Parent Names & Order.", { priority: "high", module: "/stationery" }),
  item("p5-inv-06", "phase-5", "List invited relatives", "Add \"with best compliments from...\" or similar family listing. Capture: Relative Listing.", { priority: "medium", module: "/stationery", assigned: "family" }),
  item("p5-inv-07", "phase-5", "Get calligraphy or custom addressing", "Arrange hand calligraphy or custom printed addressing for envelopes. Capture: Calligrapher, Style.", { priority: "low", module: "/stationery" }),
  item("p5-inv-08", "phase-5", "Order envelopes", "Get inner and outer envelopes for the invitation suite. Capture: Quantity, Color/Material.", { priority: "medium", module: "/stationery" }),
  item("p5-inv-09", "phase-5", "Order wax seals / belly bands / ribbons", "Add finishing touches to the invitation packaging. Capture: Finishing Items.", { priority: "low", module: "/stationery" }),
  item("p5-inv-10", "phase-5", "Order special packaging", "Design boxes, mithai pairings, or trunk-style invites. Capture: Packaging Style.", { priority: "medium", module: "/stationery" }),
  item("p5-inv-11", "phase-5", "Proofread everything 3x", "Triple-check all names, dates, times, and locations. Capture: Proofread Rounds Completed, Errors Found.", { priority: "critical", module: "/stationery" }),
  item("p5-inv-12", "phase-5", "Order 15–20% extras", "Print additional invitations for mistakes and keepsakes. Capture: Extra Quantity.", { priority: "medium", module: "/stationery" }),
  item("p5-inv-13", "phase-5", "Weigh invitation suite for postage", "Confirm weight to calculate correct postage. Capture: Suite Weight, Postage per Invite.", { priority: "medium", module: "/stationery" }),
  item("p5-inv-14", "phase-5", "Mail invitations", "Send invitations: 6–8 weeks domestic, 10+ weeks international. Capture: Domestic Mail Date, International Mail Date, Total Mailed.", { priority: "critical", module: "/stationery" }),
  item("p5-inv-15", "phase-5", "Hand-deliver to elders", "Personally deliver invitations to elders as a gesture of respect. Capture: Elders to Visit, Delivery Schedule.", { priority: "medium", assigned: "family", module: "/stationery" }),

  // Day-Of Paper
  item("p5-dop-01", "phase-5", "Create ceremony programs", "Design programs explaining each ritual for guests. Capture: Program Design, Ritual Descriptions, Quantity.", { priority: "high", module: "/stationery" }),
  item("p5-dop-02", "phase-5", "Create welcome signs at each venue", "Design welcome signage for each event venue. Capture: Sign Designs, Number of Signs.", { priority: "medium", module: "/stationery" }),
  item("p5-dop-03", "phase-5", "Create directional signage", "Design signs to guide guests through venues. Capture: Signs Needed.", { priority: "medium", module: "/stationery" }),
  item("p5-dop-04", "phase-5", "Create event schedule cards", "Print itinerary cards for guests. Capture: Schedule Content, Design.", { priority: "medium", module: "/stationery" }),
  item("p5-dop-05", "phase-5", "Create menu cards per event", "Design printed menu cards for each event. Capture: Menu Content per Event.", { priority: "medium", module: "/stationery" }),
  item("p5-dop-06", "phase-5", "Create place cards / escort cards", "Design individual place or escort cards for seated events. Capture: Card Style, Quantity.", { priority: "medium", module: "/stationery" }),
  item("p5-dop-07", "phase-5", "Create seating chart display", "Design a seating chart display board or sign. Capture: Display Style.", { priority: "medium", module: "/stationery" }),
  item("p5-dop-08", "phase-5", "Create table numbers", "Design table number cards or signs. Capture: Style, Table Count.", { priority: "medium", module: "/stationery" }),
  item("p5-dop-09", "phase-5", "Create bar menus and drink signs", "Design bar menu boards and drink name signs. Capture: Menu Design.", { priority: "low", module: "/stationery" }),
  item("p5-dop-10", "phase-5", "Create photo booth signs", "Design signs for the photo booth area. Capture: Sign Design.", { priority: "low", module: "/stationery", categoryTags: ["stationery", "photography"], workspaceTabTags: ["plan"] }),
  item("p5-dop-11", "phase-5", "Create restroom baskets signs", "Design small signs for restroom amenity baskets. Capture: Sign Design.", { priority: "low", module: "/stationery" }),
  item("p5-dop-12", "phase-5", "Create thank you cards for place settings", "Design thank you cards to place at each guest's seat. Capture: Thank You Message, Card Design.", { priority: "medium", module: "/stationery" }),
  item("p5-dop-13", "phase-5", "Create favor tags / packaging", "Design tags and packaging for guest favors. Capture: Tag Design, Quantity.", { priority: "medium", module: "/stationery" }),
  item("p5-dop-14", "phase-5", "Create hashtag signs", "Design signs encouraging guests to use the wedding hashtag. Capture: Sign Design.", { priority: "low", module: "/stationery" }),
  item("p5-dop-15", "phase-5", "Create ceremony translation cards", "Print cards explaining rituals in English for non-Indian guests. Capture: Translation Content, Quantity.", { priority: "medium", module: "/stationery" }),
  item("p5-dop-16", "phase-5", "Buy thank-you note cards", "Purchase blank or printed thank-you cards for post-wedding notes. Capture: Quantity, Card Style.", { priority: "medium", module: "/stationery" }),

  // Welcome Bags
  item("p5-wb-01", "phase-5", "Design welcome bag contents", "Plan the full contents of each welcome bag. Capture: Item List, Budget per Bag.", { priority: "medium" }),
  item("p5-wb-02", "phase-5", "Include event itinerary", "Print a mini itinerary card for the welcome bag. Capture: Itinerary Content.", { priority: "medium" }),
  item("p5-wb-03", "phase-5", "Include local map and recommendations", "Add a card with local restaurant and attraction suggestions. Capture: Map/Recommendations.", { priority: "low" }),
  item("p5-wb-04", "phase-5", "Include bottled water", "Add bottled water to each welcome bag. Capture: Bottles Needed.", { priority: "low" }),
  item("p5-wb-05", "phase-5", "Include snacks", "Add a mix of Indian and Western snacks. Capture: Snack Selection.", { priority: "medium" }),
  item("p5-wb-06", "phase-5", "Include survival kit", "Add Advil, mints, lip balm, mask, etc. Capture: Kit Items.", { priority: "low" }),
  item("p5-wb-07", "phase-5", "Include welcome note from couple", "Write a personalized welcome message", { priority: "medium" }),
  item("p5-wb-08", "phase-5", "Include local specialty gift", "Add a locally-sourced gift item. Capture: Cost per Item.", { priority: "low" }),
  item("p5-wb-09", "phase-5", "Include hashtag/brand card", "Add a card with the wedding hashtag and brand. Capture: Card Design.", { priority: "low" }),
  item("p5-wb-10", "phase-5", "Customize bags with monogram", "Brand the bags with the wedding monogram. Capture: Bag Style, Cost per Bag.", { priority: "medium" }),
  item("p5-wb-11", "phase-5", "Arrange delivery to hotel rooms", "Coordinate delivery to hotel rooms or front desk distribution. Capture: Distribution Method, Delivery Date.", { priority: "medium" }),
];

// ── Phase 6: Guest Management ───────────────────────────────────────────────

const p6: ChecklistItem[] = [
  item("p6-guest-01", "phase-6", "Compile master guest list", "Create a comprehensive list of all guests across both families. Capture: Estimated Total, Guest List.", { priority: "critical", module: "/guests" }),
  item("p6-guest-02", "phase-6", "Categorize guests by side", "Tag each guest as bride's family, groom's family, friends, or colleagues. Capture: Bride Side Count, Groom Side Count.", { priority: "high", module: "/guests" }),
  item("p6-guest-03", "phase-6", "Categorize guests by event", "Mark which guests attend which events. Capture: Event-Guest Mapping.", { priority: "high", module: "/guests" }),
  item("p6-guest-04", "phase-6", "Set guest cap per side and negotiate", "Agree on maximum guests per family. Capture: Bride Side Cap, Groom Side Cap.", { priority: "critical", module: "/guests" }),
  item("p6-guest-05", "phase-6", "Collect mailing addresses", "Gather postal addresses for invitations. Capture: Collection Progress.", { priority: "high", module: "/guests" }),
  item("p6-guest-06", "phase-6", "Collect emails and phone numbers", "Gather digital contact info for all guests. Capture: Collection Progress.", { priority: "high", module: "/guests" }),
  item("p6-guest-07", "phase-6", "Collect dietary restrictions", "Document allergies and dietary needs for each guest. Capture: Restrictions Summary.", { priority: "high", module: "/guests" }),
  item("p6-guest-08", "phase-6", "Collect accessibility needs", "Note mobility, hearing, vision, or other accessibility requirements. Capture: Accessibility Needs.", { priority: "high", module: "/guests" }),
  item("p6-guest-09", "phase-6", "Note VIP guests", "Flag grandparents, elderly, pregnant guests, and kids. Capture: VIP List.", { priority: "high", module: "/guests" }),
  item("p6-guest-10", "phase-6", "Set plus-one policies", "Define who gets a plus-one and under what conditions. Capture: Plus-One Policy.", { priority: "medium", module: "/guests" }),
  item("p6-guest-11", "phase-6", "Note out-of-town vs local", "Track which guests need travel and accommodation. Capture: Out-of-Town Count.", { priority: "medium", module: "/guests" }),

  // RSVP Tracking
  item("p6-rsvp-01", "phase-6", "Set up RSVP system", "Configure per-event toggle RSVP system. Capture: RSVP Link.", { priority: "critical", module: "/guests" }),
  item("p6-rsvp-02", "phase-6", "Send RSVP reminders", "Send reminders at T-minus 6 weeks, 4 weeks, and 2 weeks. Capture: 6-Week Reminder Sent, 4-Week Reminder Sent, 2-Week Reminder Sent.", { priority: "high", module: "/guests" }),
  item("p6-rsvp-03", "phase-6", "Chase non-responders", "Personally call or text guests who haven't responded. Capture: Non-Responders, Contacted.", { priority: "high", module: "/guests" }),
  item("p6-rsvp-04", "phase-6", "Track attendance by event", "Maintain per-event attendance counts. Capture: Attendance Tracker.", { priority: "high", module: "/guests" }),
  item("p6-rsvp-05", "phase-6", "Share headcount updates with vendors", "Send weekly headcount updates to vendors in the final month. Capture: Update Schedule.", { priority: "high", assigned: "planner" }),

  // Seating
  item("p6-seat-01", "phase-6", "Build mehndi seating chart", "Plan floor seating and tables for mehndi. Capture: Seating Layout, Chart Upload.", { priority: "medium", module: "/guests" }),
  item("p6-seat-02", "phase-6", "Build sangeet seating chart", "Arrange round tables with reserved front rows. Capture: Seating Layout.", { priority: "medium", module: "/guests" }),
  item("p6-seat-03", "phase-6", "Build ceremony seating chart", "Plan wedding ceremony seating arrangement. Capture: Seating Layout.", { priority: "high", module: "/guests" }),
  item("p6-seat-04", "phase-6", "Build reception seating chart", "Plan reception dinner seating. Capture: Seating Layout, Number of Tables.", { priority: "high", module: "/guests" }),
  item("p6-seat-05", "phase-6", "Reserve front rows for family", "Ensure immediate family has reserved seating at each event. Capture: Reserved Seating Plan.", { priority: "high", module: "/guests" }),
  item("p6-seat-06", "phase-6", "Reserve accessible seating", "Ensure wheelchair and mobility-accessible spots are planned. Capture: Accessible Seating Plan.", { priority: "high", module: "/guests" }),
  item("p6-seat-07", "phase-6", "Seat elderly away from speakers", "Position older guests away from loud music/speakers", { priority: "medium", module: "/guests" }),
  item("p6-seat-08", "phase-6", "Seat kids together or with parents", "Plan kid-friendly seating arrangements. Capture: Kids Seating Plan.", { priority: "medium", module: "/guests" }),
  item("p6-seat-09", "phase-6", "Plan single-friends table", "Create a fun table for single friends. Capture: Single Friends List.", { priority: "low", module: "/guests" }),
  item("p6-seat-10", "phase-6", "Plan non-Indian friends table", "Seat non-Indian guests with a cultural host. Capture: Non-Indian Guests.", { priority: "medium", module: "/guests" }),

  // Guest Communication
  item("p6-comm-01", "phase-6", "Set up guest communication channel", "Create WhatsApp group or email list for guest updates. Capture: Channel.", { priority: "high", module: "/guests" }),
  item("p6-comm-02", "phase-6", "Send pre-arrival info packet", "Share travel, accommodation, and event details before the wedding. Capture: Sent Date, Packet Contents.", { priority: "high", module: "/guests" }),
  item("p6-comm-03", "phase-6", "Send week-of reminder", "Send detailed schedule and logistics the week before. Capture: Sent Date.", { priority: "high", module: "/guests" }),
  item("p6-comm-04", "phase-6", "Send day-of updates", "Share real-time location and timing updates on event day. Capture: Update Method.", { priority: "medium", module: "/guests" }),
  item("p6-comm-05", "phase-6", "Plan post-wedding thank you communication", "Prepare thank-you messages for after the wedding. Capture: Thank You Plan.", { priority: "medium", module: "/guests" }),
];

// ── Phase 7: Ceremony Specifics ─────────────────────────────────────────────

const p7: ChecklistItem[] = [
  // Wedding Ceremony Planning
  item("p7-cer-01", "phase-7", "Meet with priest to walk through rituals", "Detailed walkthrough of every ceremony ritual with the priest. Capture: Meeting Date, Meeting Notes.", { priority: "critical", module: "/timeline" }),
  item("p7-cer-02", "phase-7", "Confirm baraat arrival plan", "Finalize the baraat procession order and timing. Capture: Arrival Time, Route.", { priority: "high", module: "/timeline" }),
  item("p7-cer-03", "phase-7", "Plan milni (family greeting)", "Organize the formal greeting between families. Capture: Milni Pairs, Garland Order.", { priority: "high", tags: ["north-indian"] }),
  item("p7-cer-04", "phase-7", "Plan jaimala / varmala", "Prepare the garland exchange ceremony. Capture: Garland Details, Stage/Lift Setup.", { priority: "critical" }),
  item("p7-cer-05", "phase-7", "Plan Ganesh puja", "Arrange the Ganesh puja to start the ceremony. Capture: Puja Items.", { priority: "high", tags: ["hindu"] }),
  item("p7-cer-06", "phase-7", "Plan kanyadaan", "Organize the kanyadaan ritual and assign roles. Capture: Father Role, Mother Role.", { priority: "critical", tags: ["hindu"] }),
  item("p7-cer-07", "phase-7", "Plan mangal pheras", "Determine 4 or 7 rounds and their meanings. Capture: Number of Pheras, Phera Meanings.", { priority: "critical", tags: ["hindu"] }),
  item("p7-cer-08", "phase-7", "Plan saptapadi (seven steps)", "Prepare the seven steps ritual. Capture: Seven Vows.", { priority: "critical", tags: ["hindu"] }),
  item("p7-cer-09", "phase-7", "Plan sindoor / mangalsutra", "Arrange sindoor and mangalsutra for the ceremony. Capture: Mangalsutra Source, Sindoor Box.", { priority: "critical", tags: ["hindu"] }),
  item("p7-cer-10", "phase-7", "Plan ashirwad (blessings)", "Organize the blessing ceremony from elders. Capture: Blessing Order.", { priority: "high" }),
  item("p7-cer-11", "phase-7", "Plan vidaai (farewell)", "Prepare the emotional farewell ceremony. Capture: Vidaai Plan, Departure Vehicle.", { priority: "high" }),
  item("p7-cer-12", "phase-7", "Document muhurat timing for key moments", "Record exact times for each major ritual. Capture: Ritual Timings.", { priority: "critical", module: "/timeline" }),
  item("p7-cer-13", "phase-7", "Assign family roles", "Decide who does kanyadaan, holds chadar, etc. Capture: Role Assignments.", { priority: "critical" }),
  item("p7-cer-14", "phase-7", "Procure puja samagri", "Get all ceremony items: kalash, coconut, rice, haldi, kumkum, diya, flowers, ghee, wood, fruits, mangalsutra, sindoor box, ring, silver items. Capture: Samagri Checklist, Items Sourced.", { priority: "critical" }),
  item("p7-cer-15", "phase-7", "Confirm who brings which ceremony items", "Assign responsibility: priest, couple, or decorator. Capture: Item Assignments.", { priority: "high" }),
  item("p7-cer-16", "phase-7", "Plan ceremony microphone and translation", "Arrange mics and live translation for guests. Capture: Mic Setup, Translation Plan.", { priority: "medium" }),
  item("p7-cer-17", "phase-7", "Plan family seating during ceremony", "Arrange family seating for the ceremony. Capture: Seating Layout.", { priority: "high" }),
  item("p7-cer-18", "phase-7", "Plan photography angles during ceremony", "Brief the photographer on key ritual moments and angles. Capture: Key Shots List.", { priority: "medium", categoryTags: ["photography"], workspaceTabTags: ["vision", "plan"], linkedEntities: { event_day_ids: ["wedding"] } }),
  item("p7-cer-19", "phase-7", "Plan ceremony games", "Organize joota chupai (shoe stealing), ring in milk, etc. Capture: Games Planned, Game Rules/Tips.", { priority: "low" }),

  // Mehndi Ceremony Planning
  item("p7-mehndi-01", "phase-7", "Book mehndi artists for guests", "Calculate 1 artist per 15–20 guests and book accordingly. Capture: Number of Artists, Mehndi Vendor.", { priority: "high", module: "/mehndi" }),
  item("p7-mehndi-02", "phase-7", "Plan bride's mehndi session", "Schedule the bride's 4–6 hour mehndi session (done first). Capture: Session Start Time, Duration.", { priority: "critical", assigned: "bride", module: "/mehndi" }),
  item("p7-mehndi-03", "phase-7", "Plan bridal mehndi design", "Choose design style and plan hidden names/initials. Capture: Hidden Elements, Inspiration.", { priority: "high", assigned: "bride", module: "/mehndi" }),
  item("p7-mehndi-04", "phase-7", "Set up guest mehndi stations", "Arrange multiple stations for guest mehndi application. Capture: Number of Stations, Station Layout.", { priority: "medium", module: "/mehndi" }),
  item("p7-mehndi-05", "phase-7", "Plan mehndi seating and cushions", "Arrange ghodi, low seating, cushions for comfort. Capture: Seating Setup.", { priority: "medium", module: "/mehndi" }),
  item("p7-mehndi-06", "phase-7", "Plan mehndi dhol and music", "Arrange dhol and background music for mehndi. Capture: Music Plan.", { priority: "medium", module: "/mehndi" }),
  item("p7-mehndi-07", "phase-7", "Plan mehndi live singers", "Book geet and tappe singers for mehndi", { priority: "medium", module: "/mehndi" }),
  item("p7-mehndi-08", "phase-7", "Plan mehndi menu", "Arrange finger foods, chaat, and fresh juices. Capture: Menu.", { priority: "medium", module: "/mehndi" }),
  item("p7-mehndi-09", "phase-7", "Prepare mehndi care supplies", "Get lemon wedges, sugar water, and oil for mehndi setting. Capture: Supplies List.", { priority: "medium", module: "/mehndi" }),
  item("p7-mehndi-10", "phase-7", "Plan mehndi favors", "Arrange small favors for mehndi guests. Capture: Favor Ideas, Cost per Favor.", { priority: "low", module: "/mehndi" }),

  // Sangeet Planning
  item("p7-sang-01", "phase-7", "Build sangeet run-of-show", "Create a detailed timeline with the emcee. Capture: Run of Show.", { priority: "critical", module: "/entertainment" }),
  item("p7-sang-02", "phase-7", "Schedule bride's family performance", "Plan and rehearse bride's family dance. Capture: Song, Performers, Rehearsal Dates.", { priority: "high", module: "/entertainment" }),
  item("p7-sang-03", "phase-7", "Schedule groom's family performance", "Plan and rehearse groom's family dance. Capture: Song, Performers.", { priority: "high", module: "/entertainment" }),
  item("p7-sang-04", "phase-7", "Schedule friends' performances", "Organize friend group dance numbers. Capture: Friend Acts.", { priority: "medium", module: "/entertainment" }),
  item("p7-sang-05", "phase-7", "Plan couple's dance", "Prepare the couple's joint performance. Capture: Song, Dance Style.", { priority: "high", module: "/entertainment" }),
  item("p7-sang-06", "phase-7", "Schedule kids' performance", "Organize a kids' dance number. Capture: Kids Performing, Song.", { priority: "low", module: "/entertainment" }),
  item("p7-sang-07", "phase-7", "Coordinate all rehearsals", "Schedule rehearsal sessions for all sangeet performances. Capture: Rehearsal Calendar.", { priority: "high", module: "/entertainment" }),
  item("p7-sang-08", "phase-7", "Prepare couple's slideshow/video", "Create a montage of the couple's journey for sangeet screening. Capture: Video Editor, Photo Selection.", { priority: "medium", module: "/entertainment", categoryTags: ["entertainment", "photography"], workspaceTabTags: ["plan"], linkedEntities: { event_day_ids: ["sangeet"] } }),
  item("p7-sang-09", "phase-7", "Plan sangeet speeches", "Organize speeches from parents, siblings, best man/maid of honor. Capture: Speakers & Order.", { priority: "medium", module: "/entertainment" }),
  item("p7-sang-10", "phase-7", "Plan sangeet games", "Organize Mr. & Mrs., shoe game, trivia, etc. Capture: Games Planned.", { priority: "medium", module: "/entertainment" }),
  item("p7-sang-11", "phase-7", "Plan open dance floor", "Design the open dance floor segment with DJ and lighting. Capture: Dance Playlist.", { priority: "medium", module: "/entertainment" }),

  // Haldi Planning
  item("p7-haldi-01", "phase-7", "Plan haldi paste preparation", "Arrange turmeric, sandalwood, rose water, and milk for haldi paste. Capture: Ingredients, Quantity.", { priority: "high" }),
  item("p7-haldi-02", "phase-7", "Arrange haldi clothes", "Ensure old/designated-to-stain clothes are ready for bride and groom. Capture: Bride's Outfit, Groom's Outfit.", { priority: "medium" }),
  item("p7-haldi-03", "phase-7", "Arrange floor protection", "Get plastic sheets and towels for flooring protection. Capture: Supplies Needed.", { priority: "medium" }),
  item("p7-haldi-04", "phase-7", "Plan rinse/shower afterward", "Arrange shower or rinse stations for after haldi. Capture: Rinse Plan.", { priority: "medium" }),
  item("p7-haldi-05", "phase-7", "Plan flower petal shower", "Arrange flower petals for the shower concept. Capture: Flower Type, Quantity.", { priority: "medium" }),
  item("p7-haldi-06", "phase-7", "Plan haldi music", "Arrange traditional folk music for haldi. Capture: Playlist.", { priority: "low" }),
  item("p7-haldi-07", "phase-7", "Plan haldi menu", "Arrange traditional homestyle menu for haldi", { priority: "medium" }),

  // Reception Planning
  item("p7-recep-01", "phase-7", "Plan reception grand entrance", "Design the couple's grand entrance at reception. Capture: Entrance Concept, Entrance Song.", { priority: "high" }),
  item("p7-recep-02", "phase-7", "Plan first dance", "Choose song and prepare choreography for first dance. Capture: Dance Lessons.", { priority: "medium" }),
  item("p7-recep-03", "phase-7", "Plan cake cutting", "Arrange cake and cutting ceremony. Capture: Cake Details, Baker.", { priority: "medium" }),
  item("p7-recep-04", "phase-7", "Plan reception speeches", "Organize speech order and speakers. Capture: Speakers & Order.", { priority: "medium" }),
  item("p7-recep-05", "phase-7", "Plan toast / champagne pour", "Arrange champagne toast logistics. Capture: Toast Plan.", { priority: "low" }),
  item("p7-recep-06", "phase-7", "Plan bouquet/garter toss if fusion", "Include Western traditions if desired", { priority: "low", tags: ["fusion"] }),
  item("p7-recep-07", "phase-7", "Plan reception dance floor", "Design the open dance floor segment. Capture: Playlist Concept.", { priority: "medium" }),
  item("p7-recep-08", "phase-7", "Plan farewell / send-off", "Design the couple's departure: sparklers, petals, confetti, etc. Capture: Send-Off Concept.", { priority: "medium" }),
];

// ── Phase 8: Gifts & Favors ────────────────────────────────────────────────

const p8: ChecklistItem[] = [
  item("p8-gift-01", "phase-8", "Gifts for parents (both sides)", "Select meaningful gifts for both sets of parents. Capture: Bride's Parents Gift, Groom's Parents Gift.", { priority: "high" }),
  item("p8-gift-02", "phase-8", "Gifts for siblings", "Choose gifts for brothers and sisters. Capture: Sibling Gifts.", { priority: "medium" }),
  item("p8-gift-03", "phase-8", "Gifts for bridal party", "Select gifts for bridesmaids and groomsmen. Capture: Bridesmaid Gifts, Groomsmen Gifts.", { priority: "medium" }),
  item("p8-gift-04", "phase-8", "Gift for partner", "Choose a special morning-of-wedding gift for your partner. Capture: Gift Idea.", { priority: "medium" }),
  item("p8-gift-05", "phase-8", "Gifts for priest", "Prepare gifts and dakshina for the priest. Capture: Gift Details, Dakshina Amount.", { priority: "medium" }),
  item("p8-gift-06", "phase-8", "Gifts for standout vendors", "Show appreciation for vendors who went above and beyond. Capture: Vendor Gift List.", { priority: "low" }),
  item("p8-gift-07", "phase-8", "Prepare shagun envelopes", "Prepare saagan / shagun envelopes with cash gifts. Capture: Envelope List, Total Amount.", { priority: "high", assigned: "family", tags: ["north-indian", "punjabi"] }),
  item("p8-gift-08", "phase-8", "Prepare vendor tips", "Pre-calculate tips for caterers, drivers, valet, and staff. Capture: Tip Breakdown, Total Tips.", { priority: "medium" }),
  item("p8-gift-09", "phase-8", "Plan bachelor and bachelorette parties", "Tell the wedding party what kind of bach parties you want — destination, low-key, themed, or none. Capture: Bachelor Party Vibe, Bachelorette Party Vibe, Target Dates, Notes for Wedding Party.", { priority: "medium" }),
  item("p8-gift-10", "phase-8", "Plan parent thank-you gift (trip or experience)", "Book a special thank-you trip, experience, or heirloom gift for both sets of parents. Capture: Gift Type, Bride's Parents, Groom's Parents.", { priority: "medium", assigned: "both" }),

  // Guest Favors
  item("p8-favor-01", "phase-8", "Decide favor concept per event", "Plan the overall theme for guest favors at each event. Capture: Favor Concepts per Event.", { priority: "medium" }),
  item("p8-favor-02", "phase-8", "Plan mehndi favors", "Arrange mini mehndi cones, bangles, or similar. Capture: Favor Items, Cost per Favor.", { priority: "low" }),
  item("p8-favor-03", "phase-8", "Plan sangeet favors", "Arrange mini liquor bottles, candles, or similar. Capture: Favor Items, Cost per Favor.", { priority: "low" }),
  item("p8-favor-04", "phase-8", "Plan wedding favors", "Arrange mithai boxes, silver coins, potli bags, etc. Capture: Favor Items, Cost per Favor.", { priority: "medium" }),
  item("p8-favor-05", "phase-8", "Plan reception favors", "Arrange custom chocolates, monogrammed items, etc. Capture: Favor Items, Cost per Favor.", { priority: "low" }),
  item("p8-favor-06", "phase-8", "Finalize welcome bag contents", "Complete the welcome bag item list. Capture: Final Item List.", { priority: "medium" }),
  item("p8-favor-07", "phase-8", "Design packaging and tags", "Create branded packaging and favor tags. Capture: Packaging Design, Tag Design.", { priority: "medium" }),
  item("p8-favor-08", "phase-8", "Plan favor delivery/distribution", "Organize how favors will be distributed at each event. Capture: Distribution Plan.", { priority: "medium" }),

  // Registry
  item("p8-reg-01", "phase-8", "Set up registry", "Create registry on Crate & Barrel, Amazon, Zola, or honeymoon fund. Capture: Registry Platforms, Registry Links.", { priority: "medium" }),
  item("p8-reg-02", "phase-8", "Add registry link to website", "Publish registry links on the wedding website. Capture: Published.", { priority: "medium", deps: ["p8-reg-01"] }),
  item("p8-reg-03", "phase-8", "Add mix of price points", "Include items at various price points for all budgets. Capture: Price Range.", { priority: "medium", deps: ["p8-reg-01"] }),
  item("p8-reg-04", "phase-8", "Track gifts received", "Log all gifts received and their senders. Capture: Gift Log.", { priority: "high" }),
  item("p8-reg-05", "phase-8", "Note who gave what for thank yous", "Record gift details for personalized thank you notes. Capture: Gift Attribution Log.", { priority: "high" }),
];

// ── Phase 9: Legal & Administrative ─────────────────────────────────────────

const p9: ChecklistItem[] = [
  item("p9-legal-01", "phase-9", "Obtain marriage license", "Apply for marriage license in the correct jurisdiction. Capture: Application Date.", { priority: "critical" }),
  item("p9-legal-02", "phase-9", "Understand license validity window", "Note how long the license is valid and plan accordingly. Capture: Expiry Date.", { priority: "high" }),
  item("p9-legal-03", "phase-9", "Decide legal vs religious ceremony distinction", "Determine if the legal ceremony is separate from the religious one. Capture: Approach.", { priority: "high" }),
  item("p9-legal-04", "phase-9", "Plan courthouse ceremony if needed", "Schedule a courthouse ceremony if doing a separate legal wedding. Capture: Courthouse Date.", { priority: "medium" }),
  item("p9-legal-05", "phase-9", "Prepare required documents", "Gather IDs, birth certificates, divorce decrees if applicable. Capture: Documents Checklist.", { priority: "critical" }),
  item("p9-legal-06", "phase-9", "Plan name change", "Prepare for Social Security, driver's license, passport, and bank account changes. Capture: Name Change Plan, New Legal Name.", { priority: "medium" }),
  item("p9-legal-07", "phase-9", "Update emergency contacts", "Change emergency contacts across all relevant accounts. Capture: Updated.", { priority: "low" }),
  item("p9-legal-08", "phase-9", "Update insurance policies", "Add spouse to health, auto, home insurance. Capture: Policies to Update.", { priority: "medium" }),
  item("p9-legal-09", "phase-9", "Review joint financial planning", "Discuss joint accounts, investments, and financial goals. Capture: Financial Plan.", { priority: "medium" }),
  item("p9-legal-10", "phase-9", "Consider prenuptial agreement", "Discuss and draft prenup if applicable. Capture: Prenup Needed, Lawyer.", { priority: "low" }),
  item("p9-legal-11", "phase-9", "Update wills and beneficiaries", "Update legal documents with new spouse as beneficiary. Capture: Updated.", { priority: "medium" }),
  item("p9-legal-12", "phase-9", "Handle visa/immigration paperwork", "Complete any cross-border paperwork if applicable. Capture: Visa Type, Immigration Lawyer, Filing Deadline.", { priority: "high", tags: ["cross-border"] }),
  item("p9-honey-01", "phase-9", "Book honeymoon flights", "Purchase flights for the honeymoon. Capture: Destination, Travel Dates, Flight Cost.", { priority: "high" }),
  item("p9-honey-02", "phase-9", "Book honeymoon accommodation", "Reserve hotels/resorts for the honeymoon. Capture: Hotel/Resort, Accommodation Cost.", { priority: "high" }),
  item("p9-honey-03", "phase-9", "Plan honeymoon activities", "Research and book activities and excursions", { priority: "medium" }),
  item("p9-honey-04", "phase-9", "Get travel insurance", "Purchase comprehensive travel insurance for the honeymoon. Capture: Provider.", { priority: "medium" }),
  item("p9-honey-05", "phase-9", "Arrange international phone plan", "Set up phone service for international travel. Capture: Plan Details.", { priority: "low" }),
  item("p9-honey-06", "phase-9", "Check passport validity", "Ensure passports are valid for 6+ months past travel date. Capture: Bride Passport Expiry, Groom Passport Expiry.", { priority: "high" }),
  item("p9-honey-07", "phase-9", "Book local photographer at honeymoon destination", "Hire a local photographer for a couple's session at the honeymoon destination. Capture: Session Date, Shoot Location.", { priority: "low", categoryTags: ["photography"], workspaceTabTags: ["shortlist", "plan"] }),
];

// ── Phase 10: Final Month ───────────────────────────────────────────────────

const p10: ChecklistItem[] = [
  // Week 4
  item("p10-w4-01", "phase-10", "Final dress fittings for bride and groom", "Complete last fitting sessions for wedding outfits. Capture: Bride Fitting Date, Groom Fitting Date.", { priority: "critical", module: "/outfits" }),
  item("p10-w4-02", "phase-10", "Final family attire fittings", "Complete fittings for parents and bridal party. Capture: Fitting Schedule.", { priority: "high", assigned: "family", module: "/outfits" }),
  item("p10-w4-03", "phase-10", "Confirm all vendor contracts in writing", "Send written confirmations to every vendor with final timelines. Capture: Vendors Confirmed.", { priority: "critical", assigned: "planner" }),
  item("p10-w4-04", "phase-10", "Share master timeline with every vendor", "Distribute the comprehensive event timeline to all vendors. Capture: Timeline Document.", { priority: "critical", assigned: "planner", module: "/timeline" }),
  item("p10-w4-05", "phase-10", "Confirm final headcounts to caterer", "Send final guest counts per event to the caterer. Capture: Final Headcounts.", { priority: "critical", module: "/guests" }),
  item("p10-w4-06", "phase-10", "Confirm final floral count", "Finalize flower quantities with the florist. Capture: Final Floral Count.", { priority: "high" }),
  item("p10-w4-07", "phase-10", "Finalize seating chart", "Complete and print final seating arrangements. Capture: Final Seating Chart.", { priority: "high", module: "/guests" }),
  item("p10-w4-08", "phase-10", "Pick up marriage license", "Collect the marriage license from the clerk's office. Capture: Picked Up, Pickup Date.", { priority: "critical" }),
  item("p10-w4-09", "phase-10", "Confirm honeymoon bookings", "Reconfirm all honeymoon reservations. Capture: All Confirmed.", { priority: "high" }),
  item("p10-w4-10", "phase-10", "Start breaking in shoes", "Wear new shoes around the house to break them in. Capture: Started.", { priority: "medium" }),
  item("p10-w4-11", "phase-10", "Final mehndi trial", "Do a final test of mehndi design and darkness. Capture: Trial Date.", { priority: "medium", assigned: "bride" }),
  item("p10-w4-12", "phase-10", "Final makeup trial", "Complete the final makeup trial with look adjustments. Capture: Trial Date, Trial Photos.", { priority: "high", assigned: "bride", categoryTags: ["hmua", "photography"], workspaceTabTags: ["plan"] }),
  item("p10-w4-13", "phase-10", "Schedule pedicures", "Book pedicure appointments for the wedding week. Capture: Appointment Date.", { priority: "medium", assigned: "bride" }),

  // Week 3
  item("p10-w3-01", "phase-10", "Create day-of emergency kit", "Assemble a kit with sewing supplies, pain relievers, stain remover, snacks, etc. Capture: Kit Contents.", { priority: "high" }),
  item("p10-w3-02", "phase-10", "Print all day-of stationery", "Print programs, signs, menus, place cards, and all event paper. Capture: Items to Print, Printed.", { priority: "high", module: "/stationery" }),
  item("p10-w3-03", "phase-10", "Assemble welcome bags", "Put together all welcome bag contents. Capture: Bags Assembled, Total Needed.", { priority: "high" }),
  item("p10-w3-04", "phase-10", "Write vows / speeches", "Finalize personal vows and any speeches. Capture: Vows Draft, Speech Draft.", { priority: "high" }),
  item("p10-w3-05", "phase-10", "Practice first dance", "Rehearse the first dance choreography. Capture: Practice Sessions Completed.", { priority: "medium" }),
  item("p10-w3-06", "phase-10", "Confirm transportation", "Reconfirm all transportation arrangements. Capture: All Confirmed.", { priority: "high", module: "/transportation" }),
  item("p10-w3-07", "phase-10", "Confirm hotel blocks and check-ins", "Verify room blocks and early check-in arrangements. Capture: Hotel Confirmed.", { priority: "high" }),
  item("p10-w3-08", "phase-10", "Delegate day-of responsibilities", "Assign specific tasks to family members and wedding party. Capture: Task Assignments.", { priority: "high" }),
  item("p10-w3-09", "phase-10", "Pack honeymoon luggage early", "Start packing for the honeymoon to avoid last-minute stress. Capture: Packing Status.", { priority: "medium" }),
  item("p10-w3-10", "phase-10", "Send detailed itinerary to immediate family", "Share the complete event schedule with close family. Capture: Sent.", { priority: "high", module: "/timeline" }),

  // Week 2
  item("p10-w2-01", "phase-10", "Pick up final attire", "Collect all outfits from designers/tailors. Capture: All Picked Up.", { priority: "critical", module: "/outfits" }),
  item("p10-w2-02", "phase-10", "Inspect outfits for damage", "Carefully check every outfit for defects or issues. Capture: Inspection Complete, Issues Found.", { priority: "high", module: "/outfits" }),
  item("p10-w2-03", "phase-10", "Steam / iron outfits", "Press all outfits so they're ready to wear. Capture: Complete.", { priority: "medium", module: "/outfits" }),
  item("p10-w2-04", "phase-10", "Final headcount 72 hours out", "Get the final-final guest count 3 days before. Capture: Final Count.", { priority: "critical", module: "/guests" }),
  item("p10-w2-05", "phase-10", "Confirm all payments and final balances", "Settle any remaining vendor payments. Capture: All Paid, Remaining Balance.", { priority: "critical", module: "/budget" }),
  item("p10-w2-06", "phase-10", "Confirm vendor arrival times", "Reconfirm what time each vendor arrives on event day. Capture: Arrival Schedule.", { priority: "high", assigned: "planner" }),
  item("p10-w2-07", "phase-10", "Pre-pay tips in envelopes", "Prepare labeled tip envelopes for each vendor. Capture: Envelope List, Total Tips.", { priority: "medium" }),
  item("p10-w2-08", "phase-10", "Pack ceremony items", "Ensure rings, sindoor, mangalsutra are safely packed. Capture: Packed Items Checklist.", { priority: "critical" }),
  item("p10-w2-09", "phase-10", "Rehearse baraat walk", "Practice the baraat procession route and timing. Capture: Rehearsal Date.", { priority: "medium", assigned: "groom" }),
  item("p10-w2-10", "phase-10", "Rehearse sangeet performances", "Final run-throughs for all sangeet numbers. Capture: Final Rehearsal Schedule.", { priority: "high", module: "/entertainment" }),

  // Week 1
  item("p10-w1-01", "phase-10", "Manicure and pedicure", "Final nail appointments before the wedding. Capture: Appointment Date.", { priority: "medium", assigned: "bride" }),
  item("p10-w1-02", "phase-10", "Hair color touch-up", "Get hair color refreshed if needed. Capture: Appointment Date.", { priority: "medium", assigned: "bride" }),
  item("p10-w1-03", "phase-10", "Final wax / threading", "Complete final hair removal appointments. Capture: Appointment Date.", { priority: "medium", assigned: "bride" }),
  item("p10-w1-04", "phase-10", "Facial (5 days before)", "Get the last facial — not closer than 5 days before. Capture: Facial Date.", { priority: "medium", assigned: "bride" }),
  item("p10-w1-05", "phase-10", "Hydration and rest", "Prioritize sleep, water, and minimal stress. Capture: Wellness Notes.", { priority: "high" }),
  item("p10-w1-06", "phase-10", "Light workouts only", "Avoid intense exercise to prevent injury or exhaustion. Capture: Light Exercise Plan.", { priority: "low" }),
  item("p10-w1-07", "phase-10", "Avoid new foods", "Stick to familiar foods to prevent digestive issues. Capture: Acknowledged.", { priority: "medium" }),
  item("p10-w1-08", "phase-10", "Confirm weather and backup plans", "Check weather forecasts and activate backup plans if needed", { priority: "high", assigned: "planner" }),
  item("p10-w1-09", "phase-10", "Charge all electronics", "Charge phones, cameras, speakers, and power banks. Capture: Complete.", { priority: "medium" }),
  item("p10-w1-10", "phase-10", "Download backup playlists", "Save music offline in case of internet issues. Capture: Downloaded.", { priority: "medium" }),
  item("p10-w1-11", "phase-10", "Review ceremony details with priest", "Final walkthrough of ceremony rituals and timing. Capture: Reviewed.", { priority: "critical" }),
  item("p10-w1-12", "phase-10", "Welcome out-of-town guests", "Greet arriving guests at the hotel or airport. Capture: Arrival Schedule.", { priority: "high", assigned: "family" }),
  item("p10-w1-13", "phase-10", "Ganesh puja to start wedding week", "Hold a traditional Ganesh puja to mark the start of festivities. Capture: Puja Date, Puja Items.", { priority: "high", tags: ["hindu"] }),
  item("p10-w1-14", "phase-10", "Pick up wedding rings", "Collect wedding bands from the jeweler (engraving, resizing complete). Capture: Picked Up, Pickup Date, Stored Safely At.", { priority: "critical" }),
  item("p10-w1-15", "phase-10", "Tell wedding party what to wear the morning of", "Send morning-of outfit guidance to wedding party — getting-ready robes, coordinated loungewear, etc. Capture: Morning Outfit, Instructions Sent.", { priority: "medium", assigned: "bride" }),
  item("p10-w1-16", "phase-10", "Send HMU schedule to wedding party", "Send each wedding-party member their hair and makeup arrival time and location. Capture: HMU Schedule (Name, time slot, chair, stylist), Sent.", { priority: "high", assigned: "bride" }),
  item("p10-w1-17", "phase-10", "Schedule pre-wedding massage", "Book a relaxing massage for stress relief in the final week. Capture: Appointment Date, Spa/Therapist.", { priority: "low" }),
  item("p10-w1-18", "phase-10", "Check registry for remaining gifts", "Verify registry still has items at a range of price points for late gift-givers. Capture: Reviewed, Items Added.", { priority: "low" }),
  item("p10-w1-19", "phase-10", "Pack bag for wedding night", "Pack overnight bag for the wedding-night suite: pyjamas, toiletries, change of clothes. Capture: Bag Contents, Packed.", { priority: "medium" }),
  item("p10-w1-20", "phase-10", "Pack bride's reception handbag", "Pack a small clutch/potli for the reception: phone, lipstick, touch-up kit, tissues, safety pins. Capture: Handbag Contents, Packed.", { priority: "medium", assigned: "bride" }),
];

// ── Phase 11: Event Days ────────────────────────────────────────────────────

const p11: ChecklistItem[] = [
  // Welcome Day
  item("p11-welcome-01", "phase-11", "Welcome desk setup at hotel", "Set up a welcome desk for guest check-in. Capture: Desk Location, Staff Assigned.", { priority: "high", assigned: "planner", eventDay: { eventDay: "welcome", hoursBefore: 4 } }),
  item("p11-welcome-02", "phase-11", "Distribute welcome bags", "Hand out welcome bags to arriving guests. Capture: Distributed.", { priority: "high", eventDay: { eventDay: "welcome", hoursBefore: 3 } }),
  item("p11-welcome-03", "phase-11", "Welcome dinner", "Host the welcome dinner for guests. Capture: Dinner Time.", { priority: "high", eventDay: { eventDay: "welcome", hoursBefore: 0 } }),
  item("p11-welcome-04", "phase-11", "Informal mingling", "Facilitate casual socializing among guests. Capture: Activities Planned.", { priority: "low", eventDay: { eventDay: "welcome", hoursBefore: -2 } }),

  // Ganesh Puja
  item("p11-puja-01", "phase-11", "Home ceremony — Ganesh Puja", "Conduct the Ganesh Puja / Griha Pravesh ceremony. Capture: Ceremony Time, Items Ready.", { priority: "high", tags: ["hindu"], eventDay: { eventDay: "ganesh_puja", hoursBefore: 0 } }),
  item("p11-puja-02", "phase-11", "Coordinate immediate family attendance", "Ensure only immediate family attends the intimate ceremony. Capture: Attendee List.", { priority: "medium", assigned: "family", eventDay: { eventDay: "ganesh_puja", hoursBefore: 1 } }),
  item("p11-puja-03", "phase-11", "Photographer optional for puja", "Decide if a photographer should capture the home ceremony. Capture: Include Photographer.", { priority: "low", eventDay: { eventDay: "ganesh_puja", hoursBefore: 1 }, categoryTags: ["photography"], workspaceTabTags: ["plan", "decisions"], linkedEntities: { event_day_ids: ["ganesh_puja"] } }),

  // Mehndi Day
  item("p11-mehndi-01", "phase-11", "Bride's mehndi session (morning)", "Complete the bride's 4–6 hour mehndi application. Capture: Start Time, Expected End.", { priority: "critical", assigned: "bride", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: 3 } }),
  item("p11-mehndi-02", "phase-11", "Guests arrive for mehndi", "Welcome guests for the afternoon mehndi session. Capture: Guest Arrival Time.", { priority: "high", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: 0 } }),
  item("p11-mehndi-03", "phase-11", "Mehndi food service", "Serve finger foods and drinks during mehndi. Capture: Service Time.", { priority: "high", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: -1 } }),
  item("p11-mehndi-04", "phase-11", "Mehndi music and dancing", "Ensure music and entertainment are running for mehndi. Capture: Music Setup Complete.", { priority: "medium", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: 0 } }),
  item("p11-mehndi-05", "phase-11", "Bride rests with mehndi on hands", "Allow bride to rest while mehndi dries and darkens. Capture: Care Supplies Ready.", { priority: "high", assigned: "bride", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: -2 } }),
  item("p11-mehndi-06", "phase-11", "Bride hydration and meal delivery", "Ensure bride is fed and hydrated — she cannot use her hands. Capture: Helper Assigned.", { priority: "high", assigned: "bride", module: "/mehndi", eventDay: { eventDay: "mehndi", hoursBefore: -3 } }),

  // Haldi Day
  item("p11-haldi-01", "phase-11", "Set up haldi area", "Prepare the haldi ceremony space with decorations. Capture: Setup Complete.", { priority: "high", eventDay: { eventDay: "haldi", hoursBefore: 2 } }),
  item("p11-haldi-02", "phase-11", "Old clothes ready", "Ensure bride, groom, and family have stain-ready clothes. Capture: All Ready.", { priority: "medium", eventDay: { eventDay: "haldi", hoursBefore: 1 } }),
  item("p11-haldi-03", "phase-11", "Family applies haldi", "Conduct the haldi application ceremony. Capture: Complete.", { priority: "critical", assigned: "family", eventDay: { eventDay: "haldi", hoursBefore: 0 } }),
  item("p11-haldi-04", "phase-11", "Flower / water shower", "Shower bride and groom with flower petals and water. Capture: Flowers Ready.", { priority: "medium", eventDay: { eventDay: "haldi", hoursBefore: -1 } }),
  item("p11-haldi-05", "phase-11", "Shower and rest", "Bride and groom shower off haldi and rest. Capture: Complete.", { priority: "high", eventDay: { eventDay: "haldi", hoursBefore: -2 } }),
  item("p11-haldi-06", "phase-11", "Haldi light meal", "Serve a light traditional meal after haldi. Capture: Served.", { priority: "medium", eventDay: { eventDay: "haldi", hoursBefore: -3 } }),

  // Sangeet Night
  item("p11-sang-01", "phase-11", "Hair and makeup for sangeet", "Bride and family get ready (afternoon). Capture: HMU Start Time.", { priority: "high", assigned: "bride", eventDay: { eventDay: "sangeet", hoursBefore: 5 } }),
  item("p11-sang-02", "phase-11", "Getting dressed for sangeet", "Everyone changes into sangeet outfits. Capture: Ready Time.", { priority: "high", module: "/outfits", eventDay: { eventDay: "sangeet", hoursBefore: 1 } }),
  item("p11-sang-03", "phase-11", "Sangeet cocktails and mingling", "Welcome guests with cocktails and socializing. Capture: Cocktail Start.", { priority: "medium", eventDay: { eventDay: "sangeet", hoursBefore: 0 } }),
  item("p11-sang-04", "phase-11", "Sangeet dinner service", "Serve the sangeet dinner. Capture: Dinner Time.", { priority: "high", eventDay: { eventDay: "sangeet", hoursBefore: -1 } }),
  item("p11-sang-05", "phase-11", "Sangeet performances", "Execute all scheduled performances. Capture: Started.", { priority: "critical", module: "/entertainment", eventDay: { eventDay: "sangeet", hoursBefore: -2 } }),
  item("p11-sang-06", "phase-11", "Sangeet open dance floor", "Open the dance floor for all guests. Capture: Dance Floor Opens.", { priority: "medium", eventDay: { eventDay: "sangeet", hoursBefore: -3 } }),
  item("p11-sang-07", "phase-11", "Sangeet late-night snacks", "Serve late-night snacks as the party winds down. Capture: Snack Menu.", { priority: "low", eventDay: { eventDay: "sangeet", hoursBefore: -5 } }),

  // Wedding Day
  item("p11-wed-01", "phase-11", "Early wake-up", "Set alarms for early morning preparation. Capture: Wake-Up Time.", { priority: "critical", eventDay: { eventDay: "wedding", hoursBefore: 6 } }),
  item("p11-wed-01a", "phase-11", "Day-of yoga or meditation session", "Do a short yoga or meditation session with close friends/family to center yourself. Capture: Session Time, Attendees.", { priority: "low", eventDay: { eventDay: "wedding", hoursBefore: 5.5 } }),
  item("p11-wed-01b", "phase-11", "Spa or relaxation time with close friends", "Take a few close friends to the spa or enjoy a quick relaxation ritual before HMU. Capture: Plan, Attendees.", { priority: "low", eventDay: { eventDay: "wedding", hoursBefore: 5 } }),
  item("p11-wed-01c", "phase-11", "Quiet time to breathe and enjoy", "Carve out 15 minutes of quiet time alone or with partner before the whirlwind begins. Capture: When/Where.", { priority: "medium", eventDay: { eventDay: "wedding", hoursBefore: 4.5 } }),
  item("p11-wed-02", "phase-11", "Light breakfast", "Eat a light, energizing breakfast. Capture: Breakfast Plan.", { priority: "high", eventDay: { eventDay: "wedding", hoursBefore: 5 } }),
  item("p11-wed-03", "phase-11", "Bride: hair and makeup (3–5 hours)", "Begin the bridal hair and makeup process. Capture: HMU Start Time, Expected Finish.", { priority: "critical", assigned: "bride", eventDay: { eventDay: "wedding", hoursBefore: 4 } }),
  item("p11-wed-04", "phase-11", "Groom: getting ready", "Groom dresses and prepares for the ceremony. Capture: Getting Ready Time.", { priority: "critical", assigned: "groom", eventDay: { eventDay: "wedding", hoursBefore: 2 } }),
  item("p11-wed-05", "phase-11", "Baraat assembly", "Gather the baraat party at the meeting point. Capture: Assembly Time.", { priority: "critical", assigned: "groom", eventDay: { eventDay: "wedding", hoursBefore: 1.5 } }),
  item("p11-wed-06", "phase-11", "Baraat procession with dhol", "March to the venue with music and dancing. Capture: Procession Start.", { priority: "critical", eventDay: { eventDay: "wedding", hoursBefore: 1 } }),
  item("p11-wed-07", "phase-11", "Milni at venue entrance", "Exchange garlands between families at the entrance. Capture: Milni Time.", { priority: "high", eventDay: { eventDay: "wedding", hoursBefore: 0.5 } }),
  item("p11-wed-08", "phase-11", "Jaimala / varmala ceremony", "Bride and groom exchange garlands. Capture: Jaimala Time.", { priority: "critical", eventDay: { eventDay: "wedding", hoursBefore: 0 } }),
  item("p11-wed-09", "phase-11", "Main ceremony", "Conduct the full wedding ceremony per tradition. Capture: Ceremony Start, Expected End.", { priority: "critical", module: "/timeline", eventDay: { eventDay: "wedding", hoursBefore: -1 } }),
  item("p11-wed-10", "phase-11", "Post-ceremony photos", "Formal family and couple photos after the ceremony. Capture: Photo Duration.", { priority: "high", eventDay: { eventDay: "wedding", hoursBefore: -3 }, categoryTags: ["photography"], workspaceTabTags: ["plan"], linkedEntities: { event_day_ids: ["wedding"] } }),
  item("p11-wed-11", "phase-11", "Wedding lunch or dinner service", "Serve the main wedding meal to all guests. Capture: Meal Service Time.", { priority: "critical", eventDay: { eventDay: "wedding", hoursBefore: -4 } }),
  item("p11-wed-12", "phase-11", "Vidaai ceremony", "Conduct the emotional farewell of the bride. Capture: Vidaai Time, Departure Ready.", { priority: "critical", eventDay: { eventDay: "wedding", hoursBefore: -6 } }),

  // Reception
  item("p11-recep-01", "phase-11", "Couple's outfit change", "Change into reception outfits. Capture: Change Time.", { priority: "high", module: "/outfits", eventDay: { eventDay: "reception", hoursBefore: 2 } }),
  item("p11-recep-02", "phase-11", "Reception grand entrance", "Execute the couple's grand entrance. Capture: Entrance Time.", { priority: "high", eventDay: { eventDay: "reception", hoursBefore: 0 } }),
  item("p11-recep-03", "phase-11", "Reception first dance", "Perform the first dance as a married couple. Capture: Song.", { priority: "medium", eventDay: { eventDay: "reception", hoursBefore: -0.5 } }),
  item("p11-recep-04", "phase-11", "Reception speeches", "Deliver toasts and speeches. Capture: Speaker Order.", { priority: "medium", eventDay: { eventDay: "reception", hoursBefore: -1 } }),
  item("p11-recep-05", "phase-11", "Reception cake cutting", "Cut the wedding cake together. Capture: Cake Cutting Time.", { priority: "medium", eventDay: { eventDay: "reception", hoursBefore: -1.5 } }),
  item("p11-recep-06", "phase-11", "Reception dinner service", "Serve dinner to reception guests. Capture: Dinner Time.", { priority: "high", eventDay: { eventDay: "reception", hoursBefore: -2 } }),
  item("p11-recep-07", "phase-11", "Reception open dance floor", "Open the floor for dancing. Capture: Dance Floor Opens.", { priority: "medium", eventDay: { eventDay: "reception", hoursBefore: -3 } }),
  item("p11-recep-08", "phase-11", "Late-night send-off", "Organize the couple's departure with sparklers/confetti. Capture: Send-Off Style, Send-Off Time.", { priority: "medium", eventDay: { eventDay: "reception", hoursBefore: -5 } }),
];

// ── Phase 12: Post-Wedding ──────────────────────────────────────────────────

const p12: ChecklistItem[] = [
  item("p12-post-01", "phase-12", "Post-wedding brunch with close family", "Host a relaxed brunch the day after the wedding. Capture: Time, Menu.", { priority: "medium" }),
  item("p12-post-02", "phase-12", "Return rentals", "Return all rented items: decor, furniture, AV equipment, etc. Capture: Items to Return, Return Deadline.", { priority: "high", assigned: "planner" }),
  item("p12-post-03", "phase-12", "Dry clean and preserve wedding outfits", "Send wedding outfits for professional dry cleaning and preservation. Capture: Dry Cleaner.", { priority: "high", assigned: "bride", module: "/outfits" }),
  item("p12-post-04", "phase-12", "Store jewelry securely", "Return borrowed jewelry and safely store purchased pieces. Capture: Storage Plan.", { priority: "high", assigned: "bride" }),
  item("p12-post-05", "phase-12", "Honeymoon departure", "Depart for the honeymoon!Capture: Departure Date, Flight Details.", { priority: "high" }),
  item("p12-post-06", "phase-12", "Send thank you notes", "Write and send personalized thank you notes within 3 months. Capture: Total Notes to Send, Notes Sent, Target Completion.", { priority: "high" }),
  item("p12-post-07", "phase-12", "Write vendor reviews and social tags", "Leave reviews for vendors and tag them on social media. Capture: Reviews Written.", { priority: "medium" }),
  item("p12-post-08", "phase-12", "Tip any outstanding vendors", "Send tips to any vendors not yet tipped. Capture: Vendors to Tip, Total Tips.", { priority: "medium" }),
  item("p12-post-09", "phase-12", "Receive photo and video deliverables", "Follow up with photographer and videographer for final deliverables. Capture: Photo Delivery ETA, Video Delivery ETA.", { priority: "high", categoryTags: ["photography", "videography"], workspaceTabTags: ["plan", "decisions"] }),
  item("p12-post-10", "phase-12", "Select images for album", "Review and select photos for the wedding album. Capture: Images Selected, Selection Deadline.", { priority: "medium", deps: ["p12-post-09"], categoryTags: ["photography"], workspaceTabTags: ["vision", "plan"] }),
  item("p12-post-11", "phase-12", "Order album and prints", "Place the order for the wedding album and any print enlargements. Capture: Album Vendor.", { priority: "medium", deps: ["p12-post-10"] }),
  item("p12-post-12", "phase-12", "Share gallery with family", "Distribute the online photo gallery to family and friends. Capture: Gallery Link, Shared.", { priority: "medium", deps: ["p12-post-09"], categoryTags: ["photography"], workspaceTabTags: ["plan"] }),
  item("p12-post-13", "phase-12", "Complete name change paperwork", "Process Social Security, driver's license, passport, and bank name changes. Capture: Driver's License, Bank Accounts.", { priority: "medium" }),
  item("p12-post-14", "phase-12", "Complete legal status updates", "Update all legal documents with new marital status. Capture: Items to Update.", { priority: "medium" }),
  item("p12-post-15", "phase-12", "Merge financial accounts if planned", "Combine or coordinate bank accounts as discussed. Capture: Merging Plan.", { priority: "low" }),
  item("p12-post-16", "phase-12", "Plan first anniversary trip", "Start dreaming about the first anniversary celebration. Capture: Trip Ideas.", { priority: "low" }),
  item("p12-post-17", "phase-12", "Preserve top tier of cake", "Freeze the top tier of the wedding cake for the first anniversary. Capture: Stored.", { priority: "low", tags: ["western", "fusion"] }),
  item("p12-post-18", "phase-12", "Close wedding bank account", "Close the dedicated wedding bank account or credit card. Capture: Closed.", { priority: "medium", module: "/budget" }),
  item("p12-post-19", "phase-12", "Final budget reconciliation", "Complete the final accounting of all wedding expenses. Capture: Total Spent, Over/Under Budget, Final Report.", { priority: "high", module: "/budget" }),
  item("p12-post-20", "phase-12", "Archive wedding website", "Transition the wedding website to a private archive or take it down. Capture: Action.", { priority: "low" }),
  item("p12-post-21", "phase-12", "Preserve or donate wedding flowers", "Don't let the flowers go to waste — press/preserve bridal bouquet, donate bulk arrangements to hospitals/shelters. Capture: Action, Preservation Service.", { priority: "medium", assigned: "planner" }),
  item("p12-post-22", "phase-12", "Send framed wedding photos as gifts", "Print and frame favorite photos for parents, grandparents, and bridal party as a thank-you gift. Capture: Recipients, Print/Frame Vendor.", { priority: "low", deps: ["p12-post-09"], categoryTags: ["photography"], workspaceTabTags: ["plan"] }),
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
