import type {
  CoverageAssignment,
  WorkspaceCategory,
  WorkspaceCategorySlug,
  WorkspaceContract,
  WorkspaceDecision,
  WorkspaceItem,
  WorkspaceMoodboardItem,
  WorkspaceNote,
} from "@/types/workspace";
import { WORKSPACE_CATEGORIES } from "@/types/workspace";

const id = (p: string, n: number) => `${p}-${n.toString().padStart(3, "0")}`;

// ── Categories ──────────────────────────────────────────────────────────────
// Photography is "assigned" (booked vendor), Catering + Décor "shortlisted",
// rest "open". This mirrors a realistic mid-planning state.

export const SEED_CATEGORIES: WorkspaceCategory[] = WORKSPACE_CATEGORIES.map(
  (c, i) => {
    const slug = c.slug as WorkspaceCategorySlug;
    let status: WorkspaceCategory["status"] = "open";
    let assigned_vendor_id: string | null = null;
    if (slug === "photography") {
      status = "assigned";
      assigned_vendor_id = "ven-ph-01";
    } else if (slug === "catering" || slug === "decor_florals") {
      status = "shortlisted";
    } else if (slug === "hmua" || slug === "venue") {
      status = "shortlisted";
    }
    // ₹25L allocated for the photography workspace — feeds the Overview
    // Budget bar, which compares this against shortlist quotes and signed
    // contracts. Other categories pick up budgets later.
    const budget_allocated =
      slug === "photography"
        ? 2_500_000
        : slug === "videography"
          ? 1_200_000
          : null;
    return {
      id: `cat-${slug}`,
      slug,
      name: c.name,
      status,
      assigned_vendor_id,
      sort_order: i,
      budget_allocated,
    };
  },
);

// ── Photography — fully populated across all five tabs ──────────────────────

const photographyId = "cat-photography";

const photographyItems: WorkspaceItem[] = [
  // ── Plan tab — shot list ──
  {
    id: id("wi-photo-shot", 1),
    category_id: photographyId,
    tab: "plan",
    block_type: "shot_list",
    title: "Baraat entrance — groom arrival on horseback",
    meta: { priority: "must", event: "Wedding" },
    sort_order: 1,
  },
  {
    id: id("wi-photo-shot", 2),
    category_id: photographyId,
    tab: "plan",
    block_type: "shot_list",
    title: "Var mala exchange — both families clapping",
    meta: { priority: "must", event: "Wedding" },
    sort_order: 2,
  },
  {
    id: id("wi-photo-shot", 3),
    category_id: photographyId,
    tab: "plan",
    block_type: "shot_list",
    title: "Haldi application — close-up on hands",
    meta: { priority: "must", event: "Haldi" },
    sort_order: 3,
  },
  {
    id: id("wi-photo-shot", 4),
    category_id: photographyId,
    tab: "plan",
    block_type: "shot_list",
    title: "Bride's solo portraits in bridal suite",
    meta: { priority: "must", event: "Wedding" },
    sort_order: 4,
  },
  {
    id: id("wi-photo-shot", 5),
    category_id: photographyId,
    tab: "plan",
    block_type: "shot_list",
    title: "Pheras — all seven rounds with detail of knot",
    meta: { priority: "must", event: "Wedding" },
    sort_order: 5,
  },
  {
    id: id("wi-photo-shot", 6),
    category_id: photographyId,
    tab: "plan",
    block_type: "shot_list",
    title: "Sangeet choreo — dad's solo dance",
    meta: { priority: "preferred", event: "Sangeet" },
    sort_order: 6,
  },
  {
    id: id("wi-photo-shot", 7),
    category_id: photographyId,
    tab: "plan",
    block_type: "shot_list",
    title: "Mehendi — grandmother's hands being painted",
    meta: { priority: "preferred", event: "Mehendi" },
    sort_order: 7,
  },
  {
    id: id("wi-photo-shot", 8),
    category_id: photographyId,
    tab: "plan",
    block_type: "shot_list",
    title: "Candid — cousins pulling groom's shoes (joota churai)",
    meta: { priority: "preferred", event: "Wedding" },
    sort_order: 8,
  },
  {
    id: id("wi-photo-shot", 9),
    category_id: photographyId,
    tab: "plan",
    block_type: "shot_list",
    title: "Reception — first dance wide + tight",
    meta: { priority: "must", event: "Reception" },
    sort_order: 9,
  },
  {
    id: id("wi-photo-shot", 10),
    category_id: photographyId,
    tab: "plan",
    block_type: "shot_list",
    title: "Vidaai — rice-throwing, final hug with father",
    meta: { priority: "must", event: "Wedding" },
    sort_order: 10,
  },

  // ── Plan tab — people list ──
  {
    id: id("wi-photo-people", 1),
    category_id: photographyId,
    tab: "plan",
    block_type: "people_list",
    title: "Bride + Groom + both sets of parents",
    meta: { grouping: "Core family portrait" },
    sort_order: 20,
  },
  {
    id: id("wi-photo-people", 2),
    category_id: photographyId,
    tab: "plan",
    block_type: "people_list",
    title: "Bride's extended maternal side",
    meta: {
      grouping: "Nani, mamas, mamis, cousins",
      people: "~18 people",
    },
    sort_order: 21,
  },
  {
    id: id("wi-photo-people", 3),
    category_id: photographyId,
    tab: "plan",
    block_type: "people_list",
    title: "Groom's paternal side",
    meta: {
      grouping: "Dadi, chachas, chachis, cousins",
      people: "~14 people",
    },
    sort_order: 22,
  },
  {
    id: id("wi-photo-people", 4),
    category_id: photographyId,
    tab: "plan",
    block_type: "people_list",
    title: "College friends group (bride)",
    meta: { grouping: "Bridesmaids + 2 close friends" },
    sort_order: 23,
  },

  // ── Plan tab — kit & notes ──
  {
    id: id("wi-photo-kit", 1),
    category_id: photographyId,
    tab: "plan",
    block_type: "kit_notes",
    title: "Two primary shooters + one assistant",
    meta: {
      notes:
        "Confirmed with Joseph: lead + second shooter for full coverage, assistant for lighting on evening events.",
    },
    sort_order: 30,
  },
  {
    id: id("wi-photo-kit", 2),
    category_id: photographyId,
    tab: "plan",
    block_type: "kit_notes",
    title: "Drone permissions — confirm with venue",
    meta: {
      notes:
        "Leela Palace allows drones with 48h written notice. Send form by Dec 5.",
    },
    sort_order: 31,
  },
  {
    id: id("wi-photo-kit", 3),
    category_id: photographyId,
    tab: "plan",
    block_type: "kit_notes",
    title: "Backup storage — dual-card redundancy",
    meta: {
      notes:
        "All cameras shooting to dual SD. Daily offload to two separate drives by 10pm.",
    },
    sort_order: 32,
  },

  // ── Plan tab — coverage hours ──
  {
    id: id("wi-photo-cov", 1),
    category_id: photographyId,
    tab: "plan",
    block_type: "coverage_hours",
    title: "Haldi",
    meta: { hours: 4, time: "10:00 AM – 2:00 PM" },
    sort_order: 40,
  },
  {
    id: id("wi-photo-cov", 2),
    category_id: photographyId,
    tab: "plan",
    block_type: "coverage_hours",
    title: "Mehendi",
    meta: { hours: 5, time: "3:00 PM – 8:00 PM" },
    sort_order: 41,
  },
  {
    id: id("wi-photo-cov", 3),
    category_id: photographyId,
    tab: "plan",
    block_type: "coverage_hours",
    title: "Sangeet",
    meta: { hours: 6, time: "6:00 PM – midnight" },
    sort_order: 42,
  },
  {
    id: id("wi-photo-cov", 4),
    category_id: photographyId,
    tab: "plan",
    block_type: "coverage_hours",
    title: "Wedding day",
    meta: { hours: 12, time: "4:00 AM – 4:00 PM" },
    sort_order: 43,
  },
  {
    id: id("wi-photo-cov", 5),
    category_id: photographyId,
    tab: "plan",
    block_type: "coverage_hours",
    title: "Reception",
    meta: { hours: 6, time: "7:00 PM – 1:00 AM" },
    sort_order: 44,
  },

  // ── Plan tab — deliverables ──
  {
    id: id("wi-photo-del", 1),
    category_id: photographyId,
    tab: "plan",
    block_type: "deliverable",
    title: "Sneak-peek gallery (30 edited images)",
    meta: { due_date: "Dec 16, 2026" },
    sort_order: 50,
  },
  {
    id: id("wi-photo-del", 2),
    category_id: photographyId,
    tab: "plan",
    block_type: "deliverable",
    title: "Full edited gallery (1200+ images)",
    meta: { due_date: "Feb 15, 2027" },
    sort_order: 51,
  },
  {
    id: id("wi-photo-del", 3),
    category_id: photographyId,
    tab: "plan",
    block_type: "deliverable",
    title: "Heirloom album — 40 spreads, linen cover",
    meta: { due_date: "Apr 1, 2027" },
    sort_order: 52,
  },

  // ── Timeline tab — day-of schedule slots ──
  {
    id: id("wi-photo-sched", 1),
    category_id: photographyId,
    tab: "timeline",
    block_type: "schedule_slot",
    title: "Bride getting-ready coverage begins",
    meta: { time: "5:30 AM", event: "Wedding day", duration: "2h" },
    sort_order: 1,
  },
  {
    id: id("wi-photo-sched", 2),
    category_id: photographyId,
    tab: "timeline",
    block_type: "schedule_slot",
    title: "First look — orchard behind Residency Lawn",
    meta: { time: "7:30 AM", event: "Wedding day", duration: "30m" },
    sort_order: 2,
  },
  {
    id: id("wi-photo-sched", 3),
    category_id: photographyId,
    tab: "timeline",
    block_type: "schedule_slot",
    title: "Family portraits — before mandap",
    meta: { time: "8:30 AM", event: "Wedding day", duration: "1h" },
    sort_order: 3,
  },
  {
    id: id("wi-photo-sched", 4),
    category_id: photographyId,
    tab: "timeline",
    block_type: "schedule_slot",
    title: "Pheras coverage — lead + second at mandap",
    meta: { time: "11:00 AM", event: "Wedding day", duration: "1.5h" },
    sort_order: 4,
  },
  {
    id: id("wi-photo-sched", 5),
    category_id: photographyId,
    tab: "timeline",
    block_type: "schedule_slot",
    title: "Vidaai + rice throw",
    meta: { time: "3:00 PM", event: "Wedding day", duration: "45m" },
    sort_order: 5,
  },
];

// ── Moodboard (Vision tab) for Photography ──
const photographyMoodboard: WorkspaceMoodboardItem[] = [
  {
    id: "wmb-photo-001",
    category_id: photographyId,
    image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    caption: "Golden-hour baraat entry",
    sort_order: 1,
  },
  {
    id: "wmb-photo-002",
    category_id: photographyId,
    image_url: "https://images.unsplash.com/photo-1525772764200-be829a350797?w=600&q=80",
    caption: "Candid grandmother — haldi morning",
    sort_order: 2,
  },
  {
    id: "wmb-photo-003",
    category_id: photographyId,
    image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
    caption: "Tight on hands — var mala moment",
    sort_order: 3,
  },
  {
    id: "wmb-photo-004",
    category_id: photographyId,
    image_url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80",
    caption: "Pheras from directly overhead",
    sort_order: 4,
  },
  {
    id: "wmb-photo-005",
    category_id: photographyId,
    image_url: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80",
    caption: "Bride + bridesmaids — window light",
    sort_order: 5,
  },
  {
    id: "wmb-photo-006",
    category_id: photographyId,
    image_url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
    caption: "Vidaai — no flash, natural only",
    sort_order: 6,
  },
];

// ── Notes for Photography (Vision + Decisions) ──
const photographyNotes: WorkspaceNote[] = [
  {
    id: "wn-photo-001",
    category_id: photographyId,
    body:
      "Warm, golden, documentary-first. We do NOT want anything that looks directed or over-posed. Joseph's work on the Kapoor wedding (Aug 2025) is the benchmark.",
    author_id: "priya",
    created_at: "2026-03-14T10:00:00Z",
  },
  {
    id: "wn-photo-002",
    category_id: photographyId,
    body:
      "Arjun wants a few tight portraits in the orchard at golden hour on wedding day — we blocked 30m at 7:30am for this, floral team to be clear of the area.",
    author_id: "arjun",
    created_at: "2026-04-02T09:15:00Z",
  },
];

// ── Decisions for Photography ──
const photographyDecisions: WorkspaceDecision[] = [
  {
    id: "wd-photo-001",
    category_id: photographyId,
    question: "Drone coverage for baraat vs. groundside only?",
    status: "resolved",
    resolved_at: "2026-03-28T00:00:00Z",
    created_at: "2026-03-15T00:00:00Z",
    created_by: "planner",
    resolved_by: "priya",
    resolution: "Drone for baraat + mandap overhead. Groundside primary.",
    options: ["Drone + groundside", "Groundside only"],
    linked_event: "wedding",
    veto_flags: [],
  },
  {
    id: "wd-photo-002",
    category_id: photographyId,
    question: "Engagement shoot location — Udaipur or Jaipur?",
    status: "open",
    resolved_at: null,
    created_at: "2026-04-10T00:00:00Z",
    created_by: "priya",
    options: ["Udaipur — lake palace", "Jaipur — Amer Fort"],
    linked_event: "pre_wedding",
    veto_flags: [],
  },
  {
    id: "wd-photo-003",
    category_id: photographyId,
    question: "Album cover fabric — raw silk or linen?",
    status: "open",
    resolved_at: null,
    created_at: "2026-04-15T00:00:00Z",
    created_by: "planner",
    description: "Heirloom album cover material. Linen ages softer; raw silk has more sheen.",
    options: ["Raw silk (ivory)", "Linen (oat)"],
    veto_flags: [],
  },
];

// ── Stubs for other 11 categories — minimal but category-correct ───────────

const stubNote = (catSlug: string, body: string): WorkspaceNote => ({
  id: `wn-${catSlug}-001`,
  category_id: `cat-${catSlug}`,
  body,
  author_id: "planner",
  created_at: "2026-04-01T00:00:00Z",
});

const stubItem = (
  catSlug: string,
  n: number,
  tab: WorkspaceItem["tab"],
  block_type: WorkspaceItem["block_type"],
  title: string,
  meta: Record<string, unknown> = {},
): WorkspaceItem => ({
  id: `wi-${catSlug}-${n.toString().padStart(3, "0")}`,
  category_id: `cat-${catSlug}`,
  tab,
  block_type,
  title,
  meta,
  sort_order: n,
});

const otherItems: WorkspaceItem[] = [
  // ── Videography ────────────────────────────────────────────────────────
  stubItem("videography", 1, "shot_list", "shot_list", "Cinematic highlight reel — all three events", { priority: "must", event: "All" }),
  stubItem("videography", 2, "shot_list", "shot_list", "Drone establishing shots of venue at dusk", { priority: "preferred", event: "Wedding" }),
  stubItem("videography", 3, "shot_list", "shot_list", "Slow-mo baraat dhol moment", { priority: "must", event: "Wedding" }),
  stubItem("videography", 4, "must_capture", "must_capture_moment", "Father-daughter moment before mandap entrance", { priority: "must", event: "Wedding" }),
  stubItem("videography", 5, "must_capture", "must_capture_moment", "Couple's first look", { priority: "must", event: "Wedding" }),
  stubItem("videography", 6, "must_capture", "must_capture_moment", "Grandparents' reactions at pheras", { priority: "must", event: "Wedding" }),
  stubItem("videography", 7, "crew", "crew_member", "Lead cinematographer", { person: "TBC", notes: "Confirm after tasting" }),
  stubItem("videography", 8, "crew", "crew_member", "Second shooter", { person: "TBC" }),
  stubItem("videography", 9, "crew", "crew_member", "Drone operator", { person: "TBC", notes: "Check permits for Udaipur airspace" }),
  stubItem("videography", 10, "day_of", "schedule_slot", "Haldi golden-hour establishing shots", { time: "6:30 AM", event: "Haldi", duration: "45m" }),
  stubItem("videography", 11, "day_of", "schedule_slot", "Sangeet — arrive early for interview clips", { time: "4:00 PM", event: "Sangeet", duration: "1h" }),
  stubItem("videography", 12, "day_of", "schedule_slot", "Pheras — full coverage, 3 cameras", { time: "7:30 PM", event: "Wedding", duration: "1.5h" }),
  stubItem("videography", 13, "deliverables", "deliverable", "4-minute highlight film", { due_date: "Feb 1, 2027" }),
  stubItem("videography", 14, "deliverables", "deliverable", "Full ceremony edit (unedited)", { due_date: "Jan 15, 2027" }),
  stubItem("videography", 15, "deliverables", "deliverable", "Social cuts (30s + 60s)", { due_date: "Jan 20, 2027" }),
  stubItem("videography", 16, "deliverables", "deliverable", "Raw footage drive (USB)", { due_date: "Mar 1, 2027" }),

  // ── Catering ───────────────────────────────────────────────────────────
  stubItem("catering", 1, "tasting", "tasting_visit", "Mehendi Singhal — first tasting", { date: "May 18, 2026", notes: "Excellent dal, over-salted gravies" }),
  stubItem("catering", 2, "tasting", "tasting_visit", "Foodlink — shortlist tasting", { date: "May 24, 2026", notes: "Strong north Indian, weak south" }),
  stubItem("catering", 3, "tasting", "tasting_visit", "Khansama Tandoor — live-station trial", { date: "May 30, 2026", priority: "preferred" }),
  stubItem("catering", 4, "dietary", "dietary_count", "Veg guests", { count: 180 }),
  stubItem("catering", 5, "dietary", "dietary_count", "Non-veg guests", { count: 70 }),
  stubItem("catering", 6, "dietary", "dietary_count", "Jain (no root veg)", { count: 12 }),
  stubItem("catering", 7, "dietary", "dietary_count", "Gluten-free", { count: 8 }),
  stubItem("catering", 8, "dietary", "dietary_count", "Nut allergy", { count: 4, notes: "Kitchen must flag all nut-free plates" }),
  stubItem("catering", 9, "bar", "bar_item", "Signature cocktail — Saffron-gin sour", { event: "Sangeet", priority: "must" }),
  stubItem("catering", 10, "bar", "bar_item", "Mocktail — mango-kala-namak cooler", { priority: "must" }),
  stubItem("catering", 11, "bar", "bar_item", "Single malt selection (3 labels)", { event: "Reception" }),
  stubItem("catering", 12, "bar", "bar_item", "Wine — Sula reserve + Pinot Noir", {}),
  stubItem("catering", 13, "event_menus", "menu_course", "Chaat station — aloo tikki, pani puri, dahi bhalla", { event: "Sangeet" }),
  stubItem("catering", 14, "event_menus", "menu_course", "Live tandoor — paneer tikka, malai broccoli, kebabs", { event: "Wedding" }),
  stubItem("catering", 15, "event_menus", "menu_course", "South-Indian counter — idli, sambar, medu vada", { event: "Haldi" }),
  stubItem("catering", 16, "event_menus", "menu_course", "Plated three-course — mushroom galouti, dum biryani, gulab-jamun", { event: "Reception" }),
  stubItem("catering", 17, "event_menus", "service_window", "Mehendi — mini chaat thali", { time: "4:00 PM", event: "Mehendi", duration: "2h" }),
  stubItem("catering", 18, "event_menus", "service_window", "Wedding lunch", { time: "1:00 PM", event: "Wedding", duration: "2.5h" }),
  stubItem("catering", 19, "staffing", "staff_slot", "Lead chef — full wedding weekend", { count: 1 }),
  stubItem("catering", 20, "staffing", "staff_slot", "Servers — 1 per 15 guests", { count: 18 }),
  stubItem("catering", 21, "staffing", "staff_slot", "Bar staff", { count: 4 }),
  stubItem("catering", 22, "staffing", "staff_slot", "Live-station cooks", { count: 3 }),
  stubItem("catering", 23, "rentals", "rental_item", "Brass thalis (gold-trim)", { count: 280 }),
  stubItem("catering", 24, "rentals", "rental_item", "Copper water tumblers", { count: 280 }),
  stubItem("catering", 25, "rentals", "rental_item", "Linen runners — ivory & saffron", { count: 24 }),
  stubItem("catering", 26, "rentals", "rental_item", "Chafing dishes (hammered copper)", { count: 16 }),

  // ── Décor & Florals ────────────────────────────────────────────────────
  stubItem("decor_florals", 1, "mandap", "stage_design", "Mandap — marigold + rose canopy, 12ft wide", { event: "Wedding", priority: "must" }),
  stubItem("decor_florals", 2, "mandap", "stage_design", "Aisle pathway — petal scatter + lanterns", { event: "Wedding" }),
  stubItem("decor_florals", 3, "mandap", "stage_design", "Mandap backdrop — layered drapery in ivory + saffron", { event: "Wedding" }),
  stubItem("decor_florals", 4, "reception_stage", "stage_design", "Stage — crescent floral arch + moongate", { event: "Reception", priority: "must" }),
  stubItem("decor_florals", 5, "reception_stage", "stage_design", "Sweetheart table — rose + jasmine runner", { event: "Reception" }),
  stubItem("decor_florals", 6, "reception_stage", "setup_plan", "Lounge vignettes — 4 across ballroom", { event: "Reception" }),
  stubItem("decor_florals", 7, "florals", "floral", "Bridal bouquet — white orchid + rose", { event: "Wedding", priority: "must" }),
  stubItem("decor_florals", 8, "florals", "floral", "Groom's mala — sandal + rose", { event: "Wedding" }),
  stubItem("decor_florals", 9, "florals", "floral", "Haldi petal showers", { event: "Haldi", count: 20 }),
  stubItem("decor_florals", 10, "florals", "floral", "Centerpieces — 24 round + 6 long", { event: "Reception", count: 30 }),
  stubItem("decor_florals", 11, "lighting", "lighting_plan", "Mandap — warm uplights, 2700K", { event: "Wedding" }),
  stubItem("decor_florals", 12, "lighting", "lighting_plan", "Sangeet — dance-floor wash + moving heads", { event: "Sangeet" }),
  stubItem("decor_florals", 13, "lighting", "lighting_plan", "Reception — chandelier over stage + candle stations", { event: "Reception" }),
  stubItem("decor_florals", 14, "load_in", "load_in_slot", "Venue load-in window", { time: "Dec 9, 4:00 AM", duration: "6h" }),
  stubItem("decor_florals", 15, "load_in", "load_in_slot", "Strike + restore", { time: "Dec 11, 11:00 PM", duration: "4h" }),

  // ── Music & Entertainment ──────────────────────────────────────────────
  stubItem("entertainment", 1, "dj_band", "performer", "DJ Khanna — sangeet + reception", { priority: "must", notes: "Confirmed, deposit paid" }),
  stubItem("entertainment", 2, "dj_band", "performer", "Live band — cocktail hour", { priority: "preferred" }),
  stubItem("entertainment", 3, "live_performers", "performer", "Dhol players (4)", { event: "Wedding", notes: "Baraat procession" }),
  stubItem("entertainment", 4, "live_performers", "performer", "Sangeet choreographer", { event: "Sangeet" }),
  stubItem("entertainment", 5, "live_performers", "performer", "Classical singer for mehendi", { event: "Mehendi" }),
  stubItem("entertainment", 6, "song_list", "song_request", "Kabira — bride's side dance", { priority: "must" }),
  stubItem("entertainment", 7, "song_list", "song_request", "Tum Hi Ho — parents' slow dance", { priority: "preferred" }),
  stubItem("entertainment", 8, "song_list", "song_request", "Kala Chashma — opening DJ drop", { priority: "must" }),
  stubItem("entertainment", 9, "song_list", "song_request", "Do Not Play — Mahi Ve", { priority: "must", notes: "Family request" }),
  stubItem("entertainment", 10, "song_list", "set_list", "Sangeet — 90min dance set", { event: "Sangeet", duration: "1.5h" }),
  stubItem("entertainment", 11, "day_of", "schedule_slot", "Dhol arrival at baraat hall", { time: "6:00 PM", event: "Wedding" }),
  stubItem("entertainment", 12, "day_of", "schedule_slot", "Sangeet MC opening", { time: "7:30 PM", event: "Sangeet" }),
  stubItem("entertainment", 13, "av_tech", "av_spec", "Main stage PA — 2x L'Acoustics arrays", { event: "Sangeet" }),
  stubItem("entertainment", 14, "av_tech", "av_spec", "Wireless lapel mics × 4", { notes: "MCs + priest" }),
  stubItem("entertainment", 15, "av_tech", "av_spec", "LED wall — 10ft × 6ft", { event: "Sangeet" }),

  // ── HMUA ───────────────────────────────────────────────────────────────
  stubItem("hmua", 1, "trial_notes", "trial", "Trial #1 — direction discovery", {
    date: "2026-10-12",
    decision: "close",
    event_target: "Wedding",
    rating: 3,
    loved: "The way the kajal warmed my eyes; soft, glowy base.",
    changed: "Lip a half-shade lighter; less highlighter on the cheekbone.",
    longevity: "Held 5 hrs. Lip faded center by hr 3. Eye held all night.",
    hair_notes: "Side French braid into low bun. Gajra at nape.",
    pin_count: 24,
    products: [
      { id: "p1", category: "Foundation", brand: "Charlotte Tilbury", shade: "Hollywood Flawless Filter 4", notes: "mixed 1:1 with foundation, brush" },
      { id: "p2", category: "Lips", brand: "MAC", shade: "Russian Red", notes: "lined with Cherry, blotted once" },
      { id: "p3", category: "Eyes", brand: "Charlotte Tilbury", shade: "Pillow Talk quad", notes: "smoked with Bronze Charm liner" },
    ],
    photos: [],
  }),
  stubItem("hmua", 2, "trial_notes", "trial", "Trial #2 — lip + base tweaks", {
    date: "2026-10-26",
    decision: "approved",
    event_target: "Wedding",
    rating: 5,
    loved: "Lip is exactly right. Skin glows but doesn't shine.",
    changed: "Nothing — locked.",
    longevity: "Held 7 hrs through dinner + dancing. Touch-up only at hr 5.",
    hair_notes: "Same braid + bun. 28 pins this time, dupatta secured at crown.",
    pin_count: 28,
    products: [
      { id: "p1", category: "Foundation", brand: "Charlotte Tilbury", shade: "Airbrush Flawless 4 Cool", notes: "airbrushed, set with Laura Mercier translucent" },
      { id: "p2", category: "Lips", brand: "MAC", shade: "Diva", notes: "deeper than Russian Red, suits the lehenga" },
      { id: "p3", category: "Eyes", brand: "Pat McGrath", shade: "Mothership Bronze Seduction", notes: "wet-applied for intensity" },
    ],
    photos: [],
  }),
  stubItem("hmua", 3, "trial_notes", "trial", "Sangeet trial — shimmer eye", {
    date: "2026-11-08",
    decision: "pending",
    event_target: "Sangeet",
    rating: 0,
    products: [],
    photos: [],
  }),
  stubItem("hmua", 4, "bride_looks", "look", "Wedding — soft glam, sindoor red lip", {
    person: "Bride",
    event: "Wedding",
    foundation: "Airbrush, satin finish, NC42",
    eye_look: "Bronze smokey with kajal, false lashes wispy",
    lip_color: "MAC Diva — deep berry-red",
    bindi_tikka: "Maang tikka centered at parting, small red bindi",
    intensity: "full",
    hair_style: "Side French braid into low bun, hidden U-pins",
    hair_accessories: "Maang tikka at parting, gajra at base of bun",
    dupatta_drape: "Pinned at crown over braid, falls long over right shoulder",
    outfit_ref: "Red raw silk lehenga (Sabyasachi)",
    jewelry_ref: "Polki choker + maang tikka + jhumkas",
    coordination_notes: "Outdoor 4 PM ceremony — matte/satin to avoid shine in photos.",
  }),
  stubItem("hmua", 5, "bride_looks", "look", "Sangeet — shimmer smokey eye", {
    person: "Bride",
    event: "Sangeet",
    foundation: "Dewy, full coverage",
    eye_look: "Plum-bronze shimmer, graphic liner, longer lashes",
    lip_color: "Glossy nude-pink",
    bindi_tikka: "No bindi — modern lean",
    intensity: "full",
    hair_style: "Loose romantic waves, deep side part",
    hair_accessories: "Decorative hair pin on parting",
    dupatta_drape: "Loose draped, no pin",
    outfit_ref: "Lavender embroidered lehenga (Anita Dongre)",
    jewelry_ref: "Statement chandbalis + arm cuff",
    coordination_notes: "Evening + colored stage lighting → shimmer catches the light.",
  }),
  stubItem("hmua", 6, "bride_looks", "look", "Haldi — yellow-tone, no base", {
    person: "Bride",
    event: "Haldi",
    foundation: "Skip — turmeric will get on everything",
    eye_look: "Just kajal + a curl",
    lip_color: "Tinted balm",
    bindi_tikka: "Small yellow flower bindi",
    intensity: "light",
    hair_style: "Loose braid with marigold",
    hair_accessories: "Fresh marigold strand",
    dupatta_drape: "Yellow dupatta, draped low",
    outfit_ref: "Yellow cotton suit",
    jewelry_ref: "Floral jewelry — gajra set",
    coordination_notes: "Pre-wash skin only. Touch-up between Haldi and Mehendi.",
  }),
  stubItem("hmua", 7, "bride_looks", "look", "Reception — modern plum lip", {
    person: "Bride",
    event: "Reception",
    foundation: "Glow, full coverage",
    eye_look: "Soft cat-eye, neutral shadow, lash extensions",
    lip_color: "Plum matte (Charlotte Tilbury Glastonbury)",
    bindi_tikka: "Skip — modern look",
    intensity: "full",
    hair_style: "Sleek low ponytail, deep side part",
    hair_accessories: "Diamond hair clip",
    dupatta_drape: "—",
    outfit_ref: "Champagne sequin gown",
    jewelry_ref: "Diamond drops + tennis bracelet",
    coordination_notes: "Distinct from Wedding — different lip color, no traditional drape.",
  }),
  stubItem("hmua", 8, "bridal_party", "bridal_party_look", "Priya", {
    person: "Priya",
    role: "Bride",
    is_bride: true,
    events: ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"],
    service_level: "full",
    assigned_artist: "artist-1",
    chair_minutes: 150,
  }),
  stubItem("hmua", 9, "bridal_party", "bridal_party_look", "Anjali (Mom)", {
    person: "Anjali",
    role: "Mother of Bride",
    events: ["Sangeet", "Wedding", "Reception"],
    service_level: "full",
    assigned_artist: "artist-2",
    chair_minutes: 75,
  }),
  stubItem("hmua", 10, "bridal_party", "bridal_party_look", "Meera (MIL)", {
    person: "Meera",
    role: "Mother-in-law",
    events: ["Wedding", "Reception"],
    service_level: "full",
    assigned_artist: "artist-3",
    chair_minutes: 75,
  }),
  stubItem("hmua", 11, "bridal_party", "bridal_party_look", "Rhea", {
    person: "Rhea",
    role: "Sister",
    events: ["Sangeet", "Wedding"],
    service_level: "full",
    chair_minutes: 60,
  }),
  stubItem("hmua", 12, "bridal_party", "bridal_party_look", "Aanya (MoH)", {
    person: "Aanya",
    role: "Bridesmaid",
    events: ["Sangeet", "Wedding", "Reception"],
    service_level: "full",
    chair_minutes: 60,
  }),
  stubItem("hmua", 13, "bridal_party", "bridal_party_look", "Tara", {
    person: "Tara",
    role: "Bridesmaid",
    events: ["Wedding"],
    service_level: "hair_only",
    chair_minutes: 45,
  }),
  stubItem("hmua", 14, "touch_up", "touch_up_kit", "Bridal lipstick — MAC Diva (exact wedding shade)", { checked: false, source: "trial" }),
  stubItem("hmua", 15, "touch_up", "touch_up_kit", "Setting spray", { checked: false, source: "default" }),
  stubItem("hmua", 16, "touch_up", "touch_up_kit", "Blotting papers", { checked: false, source: "default" }),
  stubItem("hmua", 17, "touch_up", "touch_up_kit", "Bobby pins (matching hair color)", { checked: false, source: "default" }),
  stubItem("hmua", 18, "touch_up", "touch_up_kit", "Safety pins + fashion tape", { checked: false, source: "default" }),
  stubItem("hmua", 19, "touch_up", "schedule_slot", "Between ceremony and reception", { duration: "15 min", actions: "Lip reapplication, powder pass, hair pin check", window_type: "intra-event" }),
  stubItem("hmua", 20, "touch_up", "schedule_slot", "Before cake cutting", { duration: "5 min", actions: "Quick blot and lip refresh", window_type: "intra-event" }),
  stubItem("hmua", 21, "touch_up", "schedule_slot", "Wedding → Reception (full changeover)", { duration: "90 min", actions: "Remove ceremony look, fresh Reception application", window_type: "between-event", from_event: "Wedding", to_event: "Reception" }),

  // ── Venue ──────────────────────────────────────────────────────────────
  stubItem("venue", 1, "floorplans", "floorplan", "Residency Lawn — wedding ceremony layout (280 pax)", { event: "Wedding" }),
  stubItem("venue", 2, "floorplans", "floorplan", "Ballroom — sangeet stage + dance floor (320 pax)", { event: "Sangeet" }),
  stubItem("venue", 3, "floorplans", "floorplan", "Courtyard — mehendi + lunch (150 pax)", { event: "Mehendi" }),
  stubItem("venue", 4, "capacity_flow", "capacity_slot", "Peak capacity — wedding night", { count: 320 }),
  stubItem("venue", 5, "capacity_flow", "capacity_slot", "Ceremony seated — mandap viewing", { count: 280 }),
  stubItem("venue", 6, "capacity_flow", "capacity_slot", "Cocktail reception flow — 3 bars", { notes: "Dispersed to avoid bottlenecks" }),
  stubItem("venue", 7, "vendor_load_in", "load_in_slot", "Décor load-in window", { time: "Dec 9, 4:00 AM" }),
  stubItem("venue", 8, "vendor_load_in", "load_in_slot", "Catering pre-stage", { time: "Dec 9, 8:00 AM" }),
  stubItem("venue", 9, "catering_rules", "catering_rule", "Approved caterers list (in-house preferred)", { notes: "Outside catering needs waiver" }),
  stubItem("venue", 10, "catering_rules", "catering_rule", "No open flame inside ballroom", {}),
  stubItem("venue", 11, "catering_rules", "catering_rule", "Bar closes 1:00 AM", {}),
  stubItem("venue", 12, "permits", "permit", "Fire marshal clearance — mandap candles", { priority: "must" }),
  stubItem("venue", 13, "permits", "permit", "Music license — DJ + live band", { priority: "must" }),
  stubItem("venue", 14, "permits", "permit", "Drone airspace clearance", { notes: "Per videography" }),
  stubItem("venue", 15, "accommodations", "room_assignment", "Bridal suite — Villa 4, Residency wing", { person: "Priya" }),
  stubItem("venue", 16, "accommodations", "room_assignment", "Groom + groomsmen — Villa 6", { person: "Arjun" }),
  stubItem("venue", 17, "accommodations", "room_assignment", "Family block — 24 rooms", { count: 24 }),

  // ── Mehendi ────────────────────────────────────────────────────────────
  stubItem("mehndi", 1, "design_refs", "design_inspo", "Bridal — full forearm Rajasthani with faces", { priority: "must" }),
  stubItem("mehndi", 2, "design_refs", "design_inspo", "Groom initials motif hidden in design", { priority: "must" }),
  stubItem("mehndi", 3, "design_refs", "design_inspo", "Foot design — symmetrical peacock motif", {}),
  stubItem("mehndi", 4, "bride_mehndi", "application_slot", "Bride — hands + feet application", { person: "Priya", time: "9:00 AM", duration: "5h" }),
  stubItem("mehndi", 5, "bride_mehndi", "application_slot", "Bride — touch-up and drying", { person: "Priya", time: "2:00 PM", duration: "2h" }),
  stubItem("mehndi", 6, "guest_queue", "application_slot", "Immediate family (8 women)", { count: 8, time: "12:00 PM", duration: "2h" }),
  stubItem("mehndi", 7, "guest_queue", "application_slot", "Bridesmaids (4)", { count: 4, time: "1:30 PM", duration: "1.5h" }),
  stubItem("mehndi", 8, "guest_queue", "application_slot", "Guest stations (3 artists)", { count: 3, time: "2:00 PM", duration: "4h", notes: "First-come basis" }),
  stubItem("mehndi", 9, "day_of", "schedule_slot", "Venue ready + artist setup", { time: "8:30 AM", event: "Mehendi" }),
  stubItem("mehndi", 10, "day_of", "schedule_slot", "Food service begins", { time: "12:30 PM", event: "Mehendi" }),

  // ── Transportation ─────────────────────────────────────────────────────
  // Plan & Logistics — one assessment item + family fleet rows
  stubItem("transportation", 1, "plan_logistics", "note", "Transportation assessment", {
    kind: "assessment",
    bride_arrival: "bridal_car",
    groom_arrival: "horse_and_car",
    between_events: "shuttle",
    send_off: "vintage_car",
    hotel_shuttle: true,
    hotel_shuttle_count: 60,
    airport_pickup: true,
    airport_pickup_count: 14,
    mobility_transport: true,
    mobility_transport_count: 4,
    post_event_shuttle: true,
    dhol_transport: true,
    vendor_parking: true,
    vendor_parking_list: "Florist van · DJ truck · Mehendi artist",
    baraat_happening: true,
    baraat_vehicle: "horse",
    baraat_route: "Hotel lobby → right on Main St → venue gate",
  }),
  stubItem("transportation", 2, "plan_logistics", "fleet_vehicle", "Vintage Rolls Royce", { count: 1, priority: "must", role: "Groom baraat" }),
  stubItem("transportation", 3, "plan_logistics", "fleet_vehicle", "Luxury sedans", { count: 8, priority: "preferred", role: "Family fleet" }),
  stubItem("transportation", 4, "plan_logistics", "fleet_vehicle", "Decorated open car", { count: 1, priority: "must", role: "Reception exit" }),
  // Shuttle & Guest Transport — shuttles + airport pickups + VIP moves
  stubItem("transportation", 5, "shuttle_transport", "shuttle", "Marriott → venue", { kind: "shuttle", event: "Sangeet", depart: "18:30", arrive: "18:45", count: 45 }),
  stubItem("transportation", 6, "shuttle_transport", "shuttle", "Marriott → venue", { kind: "shuttle", event: "Wedding", depart: "10:00", arrive: "10:15", count: 60 }),
  stubItem("transportation", 7, "shuttle_transport", "shuttle", "Venue → Marriott", { kind: "shuttle", event: "Reception", depart: "00:00", arrive: "00:15", count: 60 }),
  stubItem("transportation", 8, "shuttle_transport", "shuttle", "Nani + Nana", { kind: "airport_pickup", flight: "AI 101 · DEL→DFW", time: "Apr 9, 2:30 PM", notes: "Private car (paid)" }),
  stubItem("transportation", 9, "shuttle_transport", "shuttle", "Uncle Raj family (4)", { kind: "airport_pickup", flight: "UA 455 · BOM→DFW", time: "Apr 9, 6:00 PM", notes: "Shared shuttle" }),
  stubItem("transportation", 10, "shuttle_transport", "vip_move", "Bride + parents → venue", { kind: "vip_move", person: "Priya + parents", event: "Wedding", time: "16:30" }),
  stubItem("transportation", 11, "shuttle_transport", "vip_move", "Grandparents → venue", { kind: "vip_move", person: "Dadi + Nana-Nani", event: "Wedding", time: "16:00" }),
  // Baraat — one plan item + participants checklist
  stubItem("transportation", 12, "baraat", "baraat_slot", "Baraat procession plan", {
    kind: "plan",
    start_point: "Hotel lobby → parking lot",
    end_point: "Venue entrance — mandap walkway",
    route_description: "Hotel exit → right on Main St (100 yards) → venue gate",
    duration: "30 minutes",
    start_time: "10:00",
    end_time: "10:30",
    vehicle_type: "horse",
    horse_vendor: "Royal Stables",
    horse_arrival_time: "09:30",
    handler_stays: true,
    groom_outfit: "Sherwani + safa + sword",
    practice_noted: true,
    venue_allows: "yes",
    road_closure: "no",
    police_escort: "no",
    noise_permit: "no",
    venue_coord_note: "On venue grounds — covered by event permit",
    dhol_start: "10:00",
    dhol_end: "10:30",
    bluetooth_backup: "Bhangra — 'Baraat 2026' playlist",
    dj_handoff_point: "Venue entrance — Milni",
    bride_ready_by: "09:30",
    photog_at_start: "09:50",
    videog_at_entrance: "10:15",
    milni_time: "10:30",
    ceremony_begins: "11:00",
  }),
  stubItem("transportation", 13, "baraat", "baraat_slot", "Groom (on horse / in car / walking)", { kind: "participant", label: "Groom (on horse / in car / walking)", done: true }),
  stubItem("transportation", 14, "baraat", "baraat_slot", "Groom's family (dancing, 30–40 people)", { kind: "participant", label: "Groom's family (dancing, 30–40 people)", done: true }),
  stubItem("transportation", 15, "baraat", "baraat_slot", "Dhol players (2)", { kind: "participant", label: "Dhol players (2) — linked to Music workspace", done: true }),
  stubItem("transportation", 16, "baraat", "baraat_slot", "Photographer + videographer", { kind: "participant", label: "Photographer + videographer walking ahead", done: true }),
  stubItem("transportation", 17, "baraat", "baraat_slot", "Flower shower at entrance", { kind: "participant", label: "Flower shower at entrance — who throws?", done: false }),
  stubItem("transportation", 18, "baraat", "baraat_slot", "Fireworks", { kind: "participant", label: "Fireworks — venue doesn't allow", done: false }),
  // Day-of route plan — master schedule
  stubItem("transportation", 19, "day_of", "schedule_slot", "Florist → Venue", { event: "Wedding", time: "06:00", vehicle: "Florist van", driver: "—" }),
  stubItem("transportation", 20, "day_of", "schedule_slot", "Bride + family → Venue", { event: "Wedding", time: "08:00", vehicle: "Private car", driver: "Uncle Raj" }),
  stubItem("transportation", 21, "day_of", "schedule_slot", "Horse → Hotel parking lot", { event: "Wedding", time: "09:30", vehicle: "Horse trailer", driver: "Handler" }),
  stubItem("transportation", 22, "day_of", "schedule_slot", "BARAAT — Hotel → Venue", { event: "Wedding", time: "10:00", vehicle: "Horse + walking", driver: "—" }),
  stubItem("transportation", 23, "day_of", "schedule_slot", "Shuttle #1: Hotel → Venue", { event: "Wedding", time: "10:15", vehicle: "Coach", driver: "Driver A" }),
  stubItem("transportation", 24, "day_of", "schedule_slot", "Shuttle #1: Venue → Hotel", { event: "Reception", time: "00:00", vehicle: "Coach", driver: "Driver A" }),
  stubItem("transportation", 25, "day_of", "schedule_slot", "Couple → Hotel", { event: "Reception", time: "00:15", vehicle: "Decorated car", driver: "Driver B" }),
  stubItem("transportation", 26, "day_of", "schedule_slot", "Shuttle #2: Venue → Hotel", { event: "Reception", time: "00:30", vehicle: "Coach", driver: "Driver A" }),

  // ── Stationery ─────────────────────────────────────────────────────────
  stubItem("stationery", 1, "save_the_dates", "paper_piece", "Save-the-date card — foil-pressed", { count: 260, priority: "must" }),
  stubItem("stationery", 2, "save_the_dates", "paper_piece", "Digital save-the-date (animated GIF)", { count: 400 }),
  stubItem("stationery", 3, "invitation_suite", "suite_piece", "Main invitation — handmade paper box", { count: 260, priority: "must" }),
  stubItem("stationery", 4, "invitation_suite", "suite_piece", "RSVP card + envelope", { count: 260 }),
  stubItem("stationery", 5, "invitation_suite", "suite_piece", "Venue map + logistics card", { count: 260 }),
  stubItem("stationery", 6, "invitation_suite", "wording", "Main invite copy — English + Devanagari", {}),
  stubItem("stationery", 7, "event_cards", "paper_piece", "Haldi card — marigold letterpress", { count: 160 }),
  stubItem("stationery", 8, "event_cards", "paper_piece", "Mehendi card — peacock motif", { count: 160 }),
  stubItem("stationery", 9, "event_cards", "paper_piece", "Sangeet card — gold foil", { count: 220 }),
  stubItem("stationery", 10, "event_cards", "paper_piece", "Reception card — minimalist black on ivory", { count: 320 }),
  stubItem("stationery", 11, "day_of_paper", "paper_piece", "Wedding programs — bilingual ritual guide", { count: 280 }),
  stubItem("stationery", 12, "day_of_paper", "paper_piece", "Menu cards — 3 per table", { count: 90 }),
  stubItem("stationery", 13, "day_of_paper", "paper_piece", "Escort cards + place cards", { count: 320 }),
  stubItem("stationery", 14, "day_of_paper", "paper_piece", "Welcome-bag note + itinerary", { count: 160 }),
  stubItem("stationery", 15, "print_schedule", "print_job", "Save-the-dates print + ship", { date: "Jun 15, 2026", priority: "must" }),
  stubItem("stationery", 16, "print_schedule", "print_job", "Main invitation suite print", { date: "Aug 20, 2026", priority: "must" }),
  stubItem("stationery", 17, "print_schedule", "print_job", "Event cards bundled mail", { date: "Sep 20, 2026" }),
  stubItem("stationery", 18, "print_schedule", "print_job", "Day-of paper goods final print", { date: "Nov 10, 2026" }),

  // ── Priest / Pandit ────────────────────────────────────────────────────
  stubItem("pandit_ceremony", 1, "ritual_sequence", "ritual", "Ganesh Puja — opening", { event: "Wedding", time: "6:00 AM" }),
  stubItem("pandit_ceremony", 2, "ritual_sequence", "ritual", "Baraat milni — family greeting", { event: "Wedding", time: "6:30 PM" }),
  stubItem("pandit_ceremony", 3, "ritual_sequence", "ritual", "Jaimala — var mala exchange", { event: "Wedding", time: "7:00 PM" }),
  stubItem("pandit_ceremony", 4, "ritual_sequence", "ritual", "Kanyadaan", { event: "Wedding", time: "7:30 PM" }),
  stubItem("pandit_ceremony", 5, "ritual_sequence", "ritual", "Saat phere", { event: "Wedding", time: "8:00 PM", priority: "must" }),
  stubItem("pandit_ceremony", 6, "ritual_sequence", "ritual", "Sindoor + mangalsutra", { event: "Wedding", time: "8:45 PM" }),
  stubItem("pandit_ceremony", 7, "ritual_sequence", "ritual", "Haldi milap ceremony", { event: "Haldi", time: "7:30 AM" }),
  stubItem("pandit_ceremony", 8, "mantras", "mantra", "Ganesh shloka (opening)", { notes: "Couple to recite together" }),
  stubItem("pandit_ceremony", 9, "mantras", "mantra", "Gotra uchcharan — lineage", {}),
  stubItem("pandit_ceremony", 10, "mantras", "mantra", "Saat pheras mantras (7 vows)", { priority: "must", notes: "Bilingual recitation available" }),
  stubItem("pandit_ceremony", 11, "mantras", "mantra", "Vidaai ashirvad", {}),
  stubItem("pandit_ceremony", 12, "samagri", "samagri", "Kalash, mango leaves, coconut, supari", { priority: "must" }),
  stubItem("pandit_ceremony", 13, "samagri", "samagri", "Havan samagri + ghee", { priority: "must" }),
  stubItem("pandit_ceremony", 14, "samagri", "samagri", "Mangalsutra + sindoor", { priority: "must" }),
  stubItem("pandit_ceremony", 15, "samagri", "samagri", "Roli, chawal, haldi", {}),
  stubItem("pandit_ceremony", 16, "family_roles", "family_role", "Bride's father — kanyadaan", { person: "Mr. Sharma", priority: "must" }),
  stubItem("pandit_ceremony", 17, "family_roles", "family_role", "Bride's maternal uncle — mamaji", { person: "Mama" }),
  stubItem("pandit_ceremony", 18, "family_roles", "family_role", "Groom's parents — tilak + aarti", {}),
  stubItem("pandit_ceremony", 19, "day_of", "schedule_slot", "Officiant arrives for setup", { time: "5:00 AM", event: "Wedding" }),
  stubItem("pandit_ceremony", 20, "day_of", "schedule_slot", "Havan lit + mantra begins", { time: "6:00 AM", event: "Wedding" }),

  // ── Wardrobe ───────────────────────────────────────────────────────────
  stubItem("wardrobe", 1, "wardrobe_looks", "outfit", "Bride — Sabyasachi red lehenga", { person: "Priya", event: "Wedding", priority: "must" }),
  stubItem("wardrobe", 2, "wardrobe_looks", "outfit", "Bride — mint-green sharara", { person: "Priya", event: "Mehendi" }),
  stubItem("wardrobe", 3, "wardrobe_looks", "outfit", "Bride — yellow bandhani, Haldi", { person: "Priya", event: "Haldi" }),
  stubItem("wardrobe", 4, "wardrobe_looks", "outfit", "Bride — ivory sangeet gown, Manish Malhotra", { person: "Priya", event: "Sangeet" }),
  stubItem("wardrobe", 5, "wardrobe_looks", "outfit", "Bride — pearl-grey reception saree", { person: "Priya", event: "Reception" }),
  stubItem("wardrobe", 6, "wardrobe_looks", "outfit", "Groom — ivory sherwani with gold embroidery", { person: "Arjun", event: "Wedding", priority: "must" }),
  stubItem("wardrobe", 7, "wardrobe_looks", "outfit", "Groom — velvet bandhgala, Reception", { person: "Arjun", event: "Reception" }),
  stubItem("wardrobe", 8, "fittings", "fitting", "Bride — first fitting", { person: "Priya", date: "Aug 12, 2026" }),
  stubItem("wardrobe", 9, "fittings", "fitting", "Bride — final fitting", { person: "Priya", date: "Nov 20, 2026" }),
  stubItem("wardrobe", 10, "fittings", "fitting", "Groom — final fitting", { person: "Arjun", date: "Nov 22, 2026" }),
  stubItem("wardrobe", 11, "bridal_party_attire", "outfit", "Bridesmaids — dusty-rose gowns", { count: 4, event: "Wedding" }),
  stubItem("wardrobe", 12, "bridal_party_attire", "outfit", "Mother of bride — saree (mauve silk)", { person: "Anjali", event: "Wedding" }),
  stubItem("wardrobe", 13, "bridal_party_attire", "accessory", "Bridal jewelry — kundan set from Nani", { person: "Priya", priority: "must" }),
  stubItem("wardrobe", 14, "bridal_party_attire", "accessory", "Groom's sehra + kalgi", { person: "Arjun", event: "Wedding", priority: "must" }),
  stubItem("wardrobe", 15, "delivery", "delivery_slot", "Bride's wedding lehenga delivery", { date: "Nov 25, 2026", priority: "must" }),
  stubItem("wardrobe", 16, "delivery", "delivery_slot", "Groom's sherwani delivery", { date: "Nov 25, 2026" }),
  stubItem("wardrobe", 17, "delivery", "delivery_slot", "Bridesmaids gowns bulk delivery", { date: "Nov 18, 2026" }),
];

const otherNotes: WorkspaceNote[] = [
  stubNote("videography", "Cinematic feel, not documentary — think slow-mo key moments with original score."),
  stubNote("catering", "Three shortlists in — Mehendi Singhal, Foodlink, Khansama Tandoor. Tastings end of May."),
  stubNote("decor_florals", "Heavy on marigold for day, candlelight for sangeet. Avoid typical hotel-ballroom look."),
  stubNote("hmua", "[Beauty Brief] You're drawn to soft, romantic beauty with a satin skin finish. You want traditional Indian elements — the maang tikka, the kajal — but want them to feel modern and fresh, not heavy. Planning 5 distinct looks across the wedding, with the Wedding look as the centerpiece and Sangeet as your moment to be bold."),
  stubNote("hmua", "[Skin finish] 60/100 — Balanced, soft-focus satin finish"),
  stubNote("hmua", "[Hair accessories] Maang tikka, gajra, decorative pins"),
  stubNote("hmua", "Bride wants skin-first look — no heavy foundation. Natural brows."),
  stubNote("venue", "Leela Palace Udaipur confirmed for wedding day. Sangeet at Jagmandir still being scoped."),
];

// ── Final exports ──────────────────────────────────────────────────────────

export const SEED_ITEMS: WorkspaceItem[] = [
  ...photographyItems,
  ...otherItems,
];

export const SEED_MOODBOARD: WorkspaceMoodboardItem[] = [
  ...photographyMoodboard,
];

export const SEED_NOTES: WorkspaceNote[] = [
  ...photographyNotes,
  ...otherNotes,
];

export const SEED_DECISIONS: WorkspaceDecision[] = [...photographyDecisions];

// ── Coverage matrix — photography: 5 events × 3 services ────────────────────
// Demo state: photo assigned across all five events (Stories by Joseph
// Radhik); video shortlisted for the big three; cinema only for Wedding and
// Reception. This gives the Overview coverage grid a mix of states.

const cov = (
  event: CoverageAssignment["event"],
  service: CoverageAssignment["service"],
  state: CoverageAssignment["state"],
  vendor_id: string | null = null,
): CoverageAssignment => ({
  id: `cov-photo-${event}-${service}`,
  category_id: photographyId,
  event,
  service,
  state,
  vendor_id,
});

export const SEED_COVERAGE: CoverageAssignment[] = [
  cov("haldi", "photo", "assigned", "ven-ph-01"),
  cov("haldi", "video", "shortlisted"),
  cov("haldi", "cinema", "na"),
  cov("mehendi", "photo", "assigned", "ven-ph-01"),
  cov("mehendi", "video", "shortlisted"),
  cov("mehendi", "cinema", "na"),
  cov("sangeet", "photo", "assigned", "ven-ph-01"),
  cov("sangeet", "video", "shortlisted"),
  cov("sangeet", "cinema", "open"),
  cov("wedding", "photo", "assigned", "ven-ph-01"),
  cov("wedding", "video", "shortlisted"),
  cov("wedding", "cinema", "shortlisted"),
  cov("reception", "photo", "assigned", "ven-ph-01"),
  cov("reception", "video", "open"),
  cov("reception", "cinema", "shortlisted"),
];

// ── Contracts — one sample, photography only ────────────────────────────────
// Matches the booked Stories by Joseph Radhik vendor; payment schedule sits
// against 2026-2027 dates so the Overview commits to a realistic schedule.

export const SEED_CONTRACTS: WorkspaceContract[] = [
  {
    id: "ctr-photo-001",
    category_id: photographyId,
    vendor_id: "ven-ph-01",
    status: "signed_by_vendor",
    total_amount: 1_850_000,
    travel_amount: 210_000,
    currency: "INR",
    payment_schedule: [
      {
        id: "pm-001",
        label: "Booking deposit (25%)",
        amount: 462_500,
        due_date: "2026-04-30",
        paid_at: null,
      },
      {
        id: "pm-002",
        label: "Pre-wedding balance (50%)",
        amount: 925_000,
        due_date: "2027-03-12",
        paid_at: null,
      },
      {
        id: "pm-003",
        label: "Final on delivery (25%)",
        amount: 462_500,
        due_date: null,
        paid_at: null,
      },
    ],
    scope_includes: [
      "Photo coverage — all 5 events",
      "Cinematic film — 6-minute edit",
      "Sneak-peek gallery (30 images, 72h)",
    ],
    scope_excludes: [
      "Same-day edit",
      "Heirloom albums (quoted separately)",
      "Pre-wedding shoot travel outside Rajasthan",
    ],
    file_refs: [
      { label: "contract-v3.pdf" },
      { label: "quote-breakdown.xlsx" },
    ],
    countersigned_by_priya_at: null,
    countersigned_by_arjun_at: null,
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-12T00:00:00Z",
  },
];

// ── Palette swatches per category (Vision tab) ─────────────────────────────

export const SEED_PALETTES: Record<WorkspaceCategorySlug, string[]> = {
  photography: ["#E6A756", "#C97B63", "#2E2E2E", "#F5E6C8", "#9CAF88"],
  videography: ["#B8860B", "#1A1A1A", "#F0E4C8"],
  catering: ["#D4A24C", "#9CAF88", "#C97B63"],
  decor_florals: ["#E6A756", "#C97B63", "#9CAF88", "#F5E0D6"],
  entertainment: ["#1A1A1A", "#B8860B", "#DDA08A"],
  guest_experiences: ["#E6A756", "#C97B63", "#F5E0D6", "#9CAF88"],
  hmua: ["#C97B63", "#F5E0D6", "#B8860B"],
  venue: ["#F5E6C8", "#B8860B", "#9CAF88"],
  mehndi: ["#8B5A2B", "#D4A24C", "#F5E6C8"],
  transportation: ["#1A1A1A", "#6B6B6B"],
  stationery: ["#F5E6C8", "#B8860B", "#1A1A1A"],
  pandit_ceremony: ["#D4A24C", "#C97B63", "#FBF9F4"],
  wardrobe: ["#C97B63", "#D4A843", "#F5E0D6", "#9CAF88"],
  jewelry: ["#D4A24C", "#B8860B", "#F5E6C8", "#8B5A2B"],
  cake_sweets: ["#F5E0D6", "#DDA08A", "#FBF9F4", "#D4A24C"],
  gifting: ["#C97B63", "#F5E6C8", "#9CAF88"],
  travel_accommodations: ["#1A1A1A", "#B8860B", "#F0E4C8"],
};
