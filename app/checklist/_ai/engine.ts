// AI Checklist Engine — types, foundation profile, dense rules-based generator.
// Every task is a single, completable action with a specific deliverable.

export type Faith =
  | "hindu"
  | "muslim"
  | "sikh"
  | "christian"
  | "jewish"
  | "buddhist"
  | "jain"
  | "parsi"
  | "interfaith"
  | "spiritual"
  | "secular"
  | "other";

export type Culture =
  | "north_indian"
  | "south_indian"
  | "gujarati"
  | "punjabi"
  | "bengali"
  | "maharashtrian"
  | "tamil"
  | "telugu"
  | "malayali"
  | "rajasthani"
  | "pakistani"
  | "sri_lankan"
  | "bangladeshi"
  | "indo_caribbean"
  | "fusion"
  | "western"
  | "other";

export type WeddingType =
  | "traditional"
  | "same_gender"
  | "intercultural"
  | "interfaith"
  | "destination"
  | "elopement"
  | "civil";

export type GuestCount = "lt50" | "50_150" | "150_300" | "300_500" | "gt500";

export type Priority = "critical" | "high" | "medium" | "low";

export type AssignedTo = "partner1" | "partner2" | "both" | "planner" | null;

export interface WeddingProfile {
  weddingDate: string | null;
  partner1Name: string;
  partner2Name: string;
  guestCount: GuestCount | null;
  faiths: Faith[];
  cultures: Culture[];
  weddingTypes: WeddingType[];
  locationCity: string;
  locationRegion: string;
  locationCountry: string;
  answers: Record<string, unknown>;
}

export const EMPTY_PROFILE: WeddingProfile = {
  weddingDate: null,
  partner1Name: "",
  partner2Name: "",
  guestCount: null,
  faiths: [],
  cultures: [],
  weddingTypes: [],
  locationCity: "",
  locationRegion: "",
  locationCountry: "",
  answers: {},
};

export function isFoundationComplete(p: WeddingProfile): boolean {
  return (
    !!p.weddingDate &&
    !!p.partner1Name.trim() &&
    !!p.partner2Name.trim() &&
    !!p.guestCount &&
    p.faiths.length > 0 &&
    p.cultures.length > 0 &&
    p.weddingTypes.length > 0
  );
}

// ── Category taxonomy ───────────────────────────────────────────────────────

export type CategoryId =
  | "foundation_vision"
  | "branding_identity"
  | "core_bookings"
  | "attire_styling"
  | "experience_layer"
  | "paper_stationery"
  | "guest_management"
  | "ceremony_specifics"
  | "gifts_favors"
  | "legal_admin";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  blurb: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "foundation_vision", label: "Foundation & Vision", blurb: "Budget, vision, wedding party" },
  { id: "branding_identity", label: "Branding & Identity", blurb: "Website, hashtag, monogram" },
  { id: "core_bookings", label: "Core Bookings", blurb: "Venue, caterer, photo, video, planner" },
  { id: "attire_styling", label: "Attire & Styling", blurb: "Outfits, jewelry, hair & makeup" },
  { id: "experience_layer", label: "Vendors — Experience", blurb: "DJ, florist, decor, officiant" },
  { id: "paper_stationery", label: "Paper & Stationery", blurb: "Save-the-dates, invites, signage" },
  { id: "guest_management", label: "Guest Management", blurb: "List, RSVPs, hotels, transport" },
  { id: "ceremony_specifics", label: "Ceremony Specifics", blurb: "Rituals, vows, rehearsal" },
  { id: "gifts_favors", label: "Gifts & Favors", blurb: "Registry, welcome bags, favors" },
  { id: "legal_admin", label: "Legal & Administrative", blurb: "Marriage license, name change" },
];

// ── Checklist item ──────────────────────────────────────────────────────────

export type TaskSource = "ai" | "manual";

export interface ChecklistItem {
  id: string;
  title: string;
  category: CategoryId;
  subcategory: string;
  tags: string[];
  monthsBeforeWedding: number;
  priority: Priority;
  dependsOn: string | null;
  assignedTo: AssignedTo;
  notes: string | null;
  unlockedBy: string | null;
  source: TaskSource;
  applicableWhen: {
    faiths: (Faith | "all")[];
    cultures: (Culture | "all")[];
    weddingTypes: (WeddingType | "all")[];
    guestCountMin: number | null;
    guestCountMax: number | null;
  };
  done: boolean;
}

type ItemSpec = Omit<ChecklistItem, "done">;

export interface GeneratedItem extends ChecklistItem {}

// ── Progressive questions ───────────────────────────────────────────────────

export type QuestionKind = "multiselect" | "single" | "yesno" | "text";

export interface ProgressiveQuestion {
  id: string;
  domain: "events" | "attire" | "vendors" | "food" | "ceremony" | "legal" | "guests";
  prompt: string;
  kind: QuestionKind;
  options?: { value: string; label: string }[];
  showIf?: (p: WeddingProfile) => boolean;
}

export const PROGRESSIVE_QUESTIONS: ProgressiveQuestion[] = [
  {
    id: "events",
    domain: "events",
    prompt: "Which events are you planning?",
    kind: "multiselect",
    options: [
      { value: "roka", label: "Roka / Engagement" },
      { value: "haldi", label: "Haldi" },
      { value: "mehndi", label: "Mehndi" },
      { value: "sangeet", label: "Sangeet / Jaggo" },
      { value: "ganesh_puja", label: "Ganesh Puja" },
      { value: "baraat", label: "Baraat" },
      { value: "mandap", label: "Mandap / Pheras" },
      { value: "anand_karaj", label: "Anand Karaj" },
      { value: "nikah", label: "Nikah" },
      { value: "walima", label: "Walima" },
      { value: "muhurtham", label: "Muhurtham" },
      { value: "church", label: "Church ceremony" },
      { value: "civil", label: "Civil ceremony" },
      { value: "reception", label: "Reception" },
      { value: "welcome", label: "Welcome dinner" },
      { value: "farewell", label: "Farewell brunch" },
      { value: "vidaai", label: "Vidaai / Rukhsati / Doli" },
    ],
  },
  {
    id: "planner",
    domain: "vendors",
    prompt: "Are you hiring a wedding planner?",
    kind: "yesno",
  },
  {
    id: "outfit_approach",
    domain: "attire",
    prompt: "Custom couture or ready-to-wear for main ceremony outfits?",
    kind: "single",
    options: [
      { value: "custom", label: "Custom / couture" },
      { value: "rtw", label: "Ready-to-wear" },
      { value: "mixed", label: "Mix of both" },
    ],
  },
  {
    id: "outfit_changes",
    domain: "attire",
    prompt: "How many outfit changes across all events?",
    kind: "single",
    options: [
      { value: "1_2", label: "1–2" },
      { value: "3_4", label: "3–4" },
      { value: "5_6", label: "5–6" },
      { value: "7_plus", label: "7+" },
    ],
  },
  {
    id: "media",
    domain: "vendors",
    prompt: "Photo, video, or both?",
    kind: "single",
    options: [
      { value: "photo", label: "Photo only" },
      { value: "video", label: "Video only" },
      { value: "both", label: "Both" },
    ],
  },
  {
    id: "entertainment",
    domain: "vendors",
    prompt: "Live entertainment or DJ?",
    kind: "single",
    options: [
      { value: "dj", label: "DJ" },
      { value: "live", label: "Live band" },
      { value: "both", label: "Both" },
    ],
  },
  {
    id: "decor",
    domain: "vendors",
    prompt: "DIY florals/decor or hire a decorator?",
    kind: "single",
    options: [
      { value: "hire", label: "Hire a decorator" },
      { value: "diy", label: "Mostly DIY" },
      { value: "mixed", label: "Bit of both" },
    ],
  },
  {
    id: "menu",
    domain: "food",
    prompt: "Vegetarian-only or mixed menu?",
    kind: "single",
    options: [
      { value: "veg", label: "Vegetarian only" },
      { value: "mixed", label: "Mixed menu" },
      { value: "halal", label: "Halal (mixed)" },
    ],
  },
  {
    id: "bar",
    domain: "food",
    prompt: "Bar service?",
    kind: "single",
    options: [
      { value: "open", label: "Open bar" },
      { value: "limited", label: "Limited bar" },
      { value: "dry", label: "Dry wedding" },
    ],
  },
  {
    id: "officiant",
    domain: "ceremony",
    prompt: "Have you identified your pandit / priest / imam / officiant?",
    kind: "yesno",
  },
  {
    id: "own_vows",
    domain: "ceremony",
    prompt: "Are you writing your own vows?",
    kind: "yesno",
  },
  {
    id: "kids",
    domain: "guests",
    prompt: "Kids allowed or adults-only?",
    kind: "single",
    options: [
      { value: "kids", label: "Kids welcome" },
      { value: "adults", label: "Adults-only" },
      { value: "immediate", label: "Immediate family kids only" },
    ],
  },
  {
    id: "room_blocks",
    domain: "guests",
    prompt: "Do you need hotel room blocks?",
    kind: "yesno",
  },
  {
    id: "name_change",
    domain: "legal",
    prompt: "Is either partner planning a name change?",
    kind: "single",
    options: [
      { value: "none", label: "Neither" },
      { value: "p1", label: "Partner 1" },
      { value: "p2", label: "Partner 2" },
      { value: "both", label: "Both" },
    ],
  },
];

// ── Compact task helpers ────────────────────────────────────────────────────

type ItemDraft = Omit<
  ItemSpec,
  "id" | "applicableWhen" | "dependsOn" | "notes" | "unlockedBy" | "assignedTo" | "source"
> & {
  id?: string;
  dependsOn?: string | null;
  notes?: string | null;
  unlockedBy?: string | null;
  assignedTo?: AssignedTo;
  source?: TaskSource;
  applicableWhen?: Partial<ItemSpec["applicableWhen"]>;
};

// Compact row: [title, monthsBeforeWedding, priority, notes?]
type T = [string, number, Priority, string?];

function mk(
  cat: CategoryId,
  sub: string,
  tag: string,
  list: T[],
  extras?: Partial<ItemDraft>,
): ItemDraft[] {
  return list.map((row) => ({
    title: row[0],
    monthsBeforeWedding: row[1],
    priority: row[2],
    notes: row[3] ?? null,
    category: cat,
    subcategory: sub,
    tags: [tag],
    ...extras,
  }));
}

function makeId(category: CategoryId, sub: string, idx: number): string {
  return `${category}__${sub.toLowerCase().replace(/\s+/g, "_")}__${idx}`;
}

function draftToSpec(d: ItemDraft, idx: number): ItemSpec {
  return {
    id: d.id ?? makeId(d.category, d.subcategory, idx),
    title: d.title,
    category: d.category,
    subcategory: d.subcategory,
    tags: d.tags,
    monthsBeforeWedding: d.monthsBeforeWedding,
    priority: d.priority,
    dependsOn: d.dependsOn ?? null,
    assignedTo: d.assignedTo ?? null,
    notes: d.notes ?? null,
    unlockedBy: d.unlockedBy ?? null,
    source: d.source ?? "ai",
    applicableWhen: {
      faiths: d.applicableWhen?.faiths ?? ["all"],
      cultures: d.applicableWhen?.cultures ?? ["all"],
      weddingTypes: d.applicableWhen?.weddingTypes ?? ["all"],
      guestCountMin: d.applicableWhen?.guestCountMin ?? null,
      guestCountMax: d.applicableWhen?.guestCountMax ?? null,
    },
  };
}

function hasFaith(p: WeddingProfile, f: Faith): boolean {
  return p.faiths.includes(f);
}
function hasCulture(p: WeddingProfile, c: Culture): boolean {
  return p.cultures.includes(c);
}
function hasType(p: WeddingProfile, t: WeddingType): boolean {
  return p.weddingTypes.includes(t);
}
function guestCountNumeric(p: WeddingProfile): number {
  switch (p.guestCount) {
    case "lt50":
      return 30;
    case "50_150":
      return 100;
    case "150_300":
      return 225;
    case "300_500":
      return 400;
    case "gt500":
      return 600;
    default:
      return 0;
  }
}

function isIndianCulture(p: WeddingProfile): boolean {
  return p.cultures.some((c) =>
    [
      "north_indian",
      "south_indian",
      "gujarati",
      "punjabi",
      "bengali",
      "maharashtrian",
      "tamil",
      "telugu",
      "malayali",
      "rajasthani",
      "pakistani",
      "bangladeshi",
      "sri_lankan",
      "indo_caribbean",
    ].includes(c),
  );
}

// ═══ BASE LIBRARY — universal (applies to every wedding) ════════════════════

const FOUNDATION_BUDGET: T[] = [
  ["Set overall wedding budget", 12, "critical"],
  ["Build master budget spreadsheet by category", 12, "high"],
  ["Define % allocation across venue, food, attire, vendors, extras", 12, "high"],
  ["Set 10–15% contingency buffer", 12, "medium"],
  ["Open dedicated wedding checking / savings account", 11, "medium"],
  ["Track deposit schedule across vendors", 10, "high"],
];

const FOUNDATION_VISION: T[] = [
  ["Discuss overall wedding vision as a couple", 12, "high"],
  ["Align on core values (intimate vs. grand, traditional vs. modern)", 12, "high"],
  ["Create shared Pinterest / vision board", 11, "medium"],
  ["Collect inspiration per event", 10, "medium"],
  ["Define non-negotiables list", 11, "high"],
  ["Decide how many events total", 12, "critical"],
  ["Agree on tradition lead per ceremony", 11, "high"],
  ["Identify key cultural traditions to include", 11, "high"],
  ["Identify cultural traditions to modify or skip", 11, "medium"],
];

const FOUNDATION_PARTY: T[] = [
  ["Select wedding party", 11, "high"],
  ["Ask wedding party with personalized ask", 11, "medium"],
  ["Order wedding party proposal gifts", 10, "low"],
  ["Define wedding party expectations + responsibilities", 10, "medium"],
  ["Set up wedding party group chat", 10, "low"],
];

const FOUNDATION_COORDINATION: T[] = [
  ["Formal introduction between families (if not yet met)", 11, "high"],
  ["Set up shared planning doc / timeline", 11, "high"],
  ["Agree on weekly planning cadence as a couple", 11, "medium"],
  ["Discuss family involvement expectations", 11, "high"],
  ["Map out financial contributions from each family", 12, "high"],
  ["Schedule engagement party (if doing)", 10, "low"],
  ["Schedule bridal shower / couple's shower", 7, "low"],
  ["Schedule bachelor / bachelorette events", 5, "low"],
  ["Plan honeymoon destination + budget", 8, "medium"],
];

const BRANDING_HASHTAG: T[] = [
  ["Brainstorm wedding hashtag", 10, "low"],
  ["Check hashtag availability on Instagram", 10, "low"],
  ["Finalize wedding hashtag", 9, "low"],
  ["Create hashtag signage for events", 3, "low"],
];

const BRANDING_WEBSITE: T[] = [
  ["Reserve wedding website domain", 10, "medium"],
  ["Select website platform (Zola / Joy / Squarespace)", 10, "medium"],
  ["Draft website copy (our story, events, travel)", 9, "medium"],
  ["Upload engagement photos to website", 8, "low"],
  ["Add RSVP functionality to website", 6, "medium"],
  ["Add guest FAQ + dress code page", 6, "medium"],
  ["Add events page with timing per day", 6, "medium"],
  ["Test website RSVP flow", 6, "medium"],
];

const BRANDING_IDENTITY: T[] = [
  ["Design couple monogram", 10, "medium"],
  ["Finalize monogram for stationery", 9, "medium"],
  ["Define wedding color palette", 10, "medium"],
  ["Select wedding fonts / typography system", 10, "low"],
  ["Curate motif library (florals, patterns)", 9, "low"],
];

const BRANDING_SOCIAL: T[] = [
  ["Decide on couple's Instagram handle / story highlight", 8, "low"],
  ["Share wedding hashtag with guests on website + stationery", 6, "low"],
  ["Decide on unplugged ceremony policy", 4, "low"],
  ["Design social share cards for key events", 3, "low"],
  ["Order custom stickers / thank-you labels", 3, "low"],
];

const CORE_VENUE: T[] = [
  ["Shortlist 5–10 venues", 12, "critical"],
  ["Tour top venues in person", 12, "critical"],
  ["Request detailed quotes from top 3", 12, "high"],
  ["Review venue contract with fresh eyes", 11, "high"],
  ["Negotiate venue contract terms (overtime, corkage, minimums)", 11, "high"],
  ["Place venue deposit", 11, "critical"],
  ["Book secondary venue (mehndi/sangeet) if separate", 10, "high"],
  ["Confirm venue's open-flame / fire-permit policy", 11, "critical", "Many venues prohibit open flame — blocks mandap/agni."],
  ["Confirm venue's alcohol licensing + corkage", 10, "high"],
  ["Confirm venue capacity, parking, and load-in", 10, "high"],
  ["Confirm venue noise ordinance end time", 10, "medium"],
];

const CORE_PLANNER: T[] = [
  ["Research wedding planners", 12, "high"],
  ["Interview 3 wedding planners", 11, "high"],
  ["Compare planner packages + references", 11, "high"],
];

const CORE_PHOTO: T[] = [
  ["Research photographers", 10, "high"],
  ["Review photographer portfolios for full galleries", 10, "high"],
  ["Schedule consultations with top 3 photographers", 10, "high"],
  ["Book primary photographer", 9, "critical"],
  ["Schedule engagement shoot", 8, "medium"],
  ["Brief photographer on must-have family shots", 2, "high"],
];

const CORE_VIDEO: T[] = [
  ["Research videographers", 10, "high"],
  ["Review video reels + long-form samples", 10, "high"],
  ["Interview videographers", 9, "high"],
  ["Book videographer", 9, "critical"],
];

const CORE_CATERING: T[] = [
  ["Research caterers", 10, "high"],
  ["Interview caterers for price + style fit", 9, "high"],
  ["Schedule menu tastings with top 2 caterers", 5, "high"],
  ["Book caterer (or confirm venue catering)", 8, "critical"],
  ["Finalize menu design", 4, "high"],
  ["Confirm dietary accommodations (veg/vegan/gluten-free/halal)", 4, "high"],
  ["Review catering contract + final payment schedule", 3, "high"],
  ["Plan late-night snack service", 3, "low"],
];

const CORE_CAKE: T[] = [
  ["Research cake vendors", 7, "medium"],
  ["Schedule cake tastings with top 2 vendors", 5, "medium"],
  ["Book cake vendor", 5, "high"],
  ["Finalize cake design + flavors", 3, "medium"],
];

const ATTIRE_SKINCARE: T[] = [
  ["Start skincare + fitness routine", 6, "low"],
  ["Book teeth cleaning / whitening", 3, "low"],
  ["Book facials leading up to wedding week", 2, "low"],
];

const PAPER_SAVE_THE_DATES: T[] = [
  ["Finalize guest list for save-the-dates", 10, "high"],
  ["Collect guest mailing addresses", 10, "high"],
  ["Design save-the-date", 10, "medium"],
  ["Proof save-the-date", 9, "medium"],
  ["Order save-the-date prints", 9, "medium"],
  ["Address save-the-date envelopes", 9, "medium"],
  ["Mail save-the-dates", 8, "high"],
];

const PAPER_INVITATIONS: T[] = [
  ["Finalize invitation content per event", 7, "high"],
  ["Design invitation suite (main + inserts)", 7, "high"],
  ["Design RSVP card", 7, "medium"],
  ["Design info / travel insert", 7, "medium"],
  ["Design reception card", 7, "medium"],
  ["Proof full invitation suite", 6, "high"],
  ["Order invitation prints", 6, "high"],
  ["Order envelope liners", 6, "low"],
  ["Order custom stamps", 5, "low"],
  ["Address inner envelopes", 5, "medium"],
  ["Address outer envelopes", 5, "medium"],
  ["Assemble invitation suites", 5, "medium"],
  ["Mail invitations", 4, "critical"],
  ["Track RSVPs in spreadsheet", 3, "high"],
  ["Send RSVP reminder wave 1", 3, "high"],
  ["Send RSVP reminder wave 2", 2, "high"],
];

const PAPER_DAY_OF: T[] = [
  ["Design ceremony program (with ritual explanations)", 3, "medium"],
  ["Proof + print ceremony program", 2, "medium"],
  ["Design welcome signage", 3, "medium"],
  ["Design seating chart display", 2, "medium"],
  ["Design escort cards", 2, "medium"],
  ["Design place cards", 2, "medium"],
  ["Design menu cards", 2, "medium"],
  ["Design drink / signature cocktail signs", 2, "low"],
  ["Design directional signage (mandap, reception, restrooms)", 2, "low"],
  ["Design favor tags", 2, "low"],
  ["Design dessert bar labels", 2, "low"],
];

const PAPER_THANK_YOU: T[] = [
  ["Order thank-you cards", 2, "medium"],
  ["Write thank-yous for shower / engagement gifts", 6, "low"],
  ["Write thank-yous for wedding gifts", -1, "medium"],
];

const GUESTS_LIST: T[] = [
  ["Draft initial guest list", 12, "critical"],
  ["Collect guest mailing addresses", 11, "high"],
  ["Organize guest list by side + category", 11, "medium"],
  ["Set guest list cap based on venue + budget", 11, "critical"],
  ["Decide A-list / B-list strategy", 10, "medium"],
  ["Track dietary restrictions per guest", 4, "high"],
  ["Track accessibility needs", 4, "medium"],
  ["Set plus-ones policy", 8, "medium"],
  ["Collect guest emails for comms", 8, "medium"],
];

const GUESTS_RSVP: T[] = [
  ["Create RSVP spreadsheet", 6, "high"],
  ["Input RSVPs as they arrive", 4, "high"],
  ["Track meal choices per guest", 3, "high"],
  ["Finalize headcount for caterer", 2, "critical"],
  ["Follow up outstanding RSVPs individually", 2, "high"],
];

const GUESTS_SEATING: T[] = [
  ["Draft seating chart", 2, "high"],
  ["Review seating chart with families", 2, "medium"],
  ["Finalize seating chart", 1, "high"],
  ["Print escort + place cards", 1, "medium"],
];

const GIFTS_REGISTRY: T[] = [
  ["Set up registry (Zola / Amazon / department store)", 7, "medium"],
  ["Curate registry across price tiers", 7, "medium"],
  ["Share registry on wedding website", 6, "low"],
];

const GIFTS_PARTY: T[] = [
  ["Source wedding party gifts", 4, "medium"],
  ["Wrap wedding party gifts", 1, "low"],
  ["Source parent / in-law gifts", 3, "medium"],
  ["Source ring bearer / flower girl gifts (if any)", 3, "low"],
  ["Source officiant thank-you gift", 2, "low"],
];

const GIFTS_VENDOR_TIPS: T[] = [
  ["Calculate vendor tip amounts", 1, "high"],
  ["Prepare cash tip envelopes per vendor", 0.25, "high"],
  ["Assign someone to distribute day-of tips", 0.25, "medium"],
];

const LEGAL_LICENSE: T[] = [
  ["Research marriage license requirements in your jurisdiction", 3, "critical"],
  ["Schedule marriage license appointment", 2, "critical"],
  ["Apply for marriage license", 1, "critical"],
  ["Pick up / receive marriage license", 0.25, "critical"],
];

const LEGAL_CONTRACTS: T[] = [
  ["Review all vendor contracts end-to-end", 6, "high"],
  ["Confirm final payment schedule per vendor", 2, "high"],
  ["Schedule final vendor payments", 0.5, "critical"],
];

const LEGAL_DOCS: T[] = [
  ["Check passports are valid (6+ months past honeymoon)", 8, "medium"],
  ["Discuss event / liability insurance with venue", 6, "medium"],
  ["Research prenup (if applicable)", 9, "low"],
];

// ═══ HINDU ADDITIONS ════════════════════════════════════════════════════════

const HINDU_CEREMONY: T[] = [
  ["Book pandit", 10, "critical"],
  ["Consult pandit on muhurat (auspicious timing)", 11, "critical"],
  ["Confirm pandit's honorarium", 6, "medium"],
  ["Walk through ceremony sequence with pandit", 3, "high"],
  ["Decide number of pheras (4 or 7) with pandit", 4, "medium"],
  ["Confirm kanyadaan participants + sequence", 4, "high"],
  ["Plan sindoor ceremony", 3, "medium"],
  ["Plan mangalsutra exchange", 3, "medium"],
  ["Plan jaimala / varmala exchange", 3, "medium"],
  ["Source rings", 4, "high"],
  ["Source mangalsutra", 4, "high"],
  ["Source sindoor container", 3, "low"],
  ["Source sacred thread (mauli)", 2, "low"],
  ["Arrange mandap fire permit (if indoor venue)", 6, "critical"],
  ["Brief ceremony photographer on angles + moments", 2, "medium"],
  ["Brief mandap decorator", 4, "high"],
  ["Arrange live ceremony stream for remote family", 3, "low"],
  ["Plan griha pravesh (post-wedding arrival at home)", 1, "low"],
];

const HINDU_SAMAGRI: T[] = [
  ["Request full samagri list from pandit", 3, "high"],
  ["Source kalash + coconut + mango leaves", 2, "medium"],
  ["Source rice / grains for rituals", 2, "medium"],
  ["Source ghee + oil for agni", 2, "medium"],
  ["Source betel leaves + supari", 2, "low"],
  ["Source havan samagri kit", 2, "medium"],
  ["Source red chunnis / cloth for mandap", 3, "medium"],
  ["Source flower petals for pheras", 1, "medium"],
  ["Source banana leaves (South Indian traditions)", 1, "low"],
  ["Source turmeric + kumkum", 2, "low"],
];

const HINDU_VIDAAI: T[] = [
  ["Plan vidaai logistics + timing", 1, "medium"],
  ["Arrange vidaai decorated car", 1, "medium"],
  ["Arrange rice/flower shower moment", 1, "low"],
  ["Coordinate vidaai music", 1, "low"],
  ["Brief family on emotional moment pacing", 1, "low"],
];

const HINDU_ENGAGEMENT: T[] = [
  ["Plan roka / engagement ceremony", 10, "medium"],
  ["Book venue for roka / engagement", 10, "medium"],
  ["Source engagement outfits", 9, "medium"],
  ["Arrange roka sagun / shagun exchange", 9, "low"],
];

// ═══ SIKH ADDITIONS ════════════════════════════════════════════════════════

const SIKH_CEREMONY: T[] = [
  ["Contact Gurdwara + confirm availability", 11, "critical"],
  ["Meet with Granthi for ceremony guidance", 9, "high"],
  ["Confirm Gurdwara rules (no alcohol, head coverings, shoes off)", 9, "critical"],
  ["Source rumala sahib", 3, "medium"],
  ["Arrange raagi / kirtan for ceremony", 6, "high"],
  ["Confirm laavan sequence + any customizations", 3, "high"],
  ["Communicate Gurdwara etiquette to guests", 2, "medium"],
  ["Plan langar / post-ceremony meal", 4, "high"],
  ["Source ceremonial items (kara, kirpan)", 3, "medium"],
];

// ═══ MUSLIM ADDITIONS ════════════════════════════════════════════════════════

const MUSLIM_NIKAH: T[] = [
  ["Identify + confirm imam / qazi", 10, "critical"],
  ["Discuss + agree on mahr", 6, "high"],
  ["Draft nikah-nama (marriage contract)", 3, "critical"],
  ["Finalize witness list (per tradition)", 4, "high"],
  ["Plan nikah ceremony logistics (stage, seating)", 4, "high"],
  ["Source Quran + ceremony items", 2, "medium"],
  ["Coordinate any gender-separate arrangements", 6, "high"],
  ["Plan rukhsati logistics", 1, "medium"],
];

// ═══ CHRISTIAN ADDITIONS ═══════════════════════════════════════════════════

const CHRISTIAN_CEREMONY: T[] = [
  ["Book church + confirm availability", 11, "critical"],
  ["Meet with priest / pastor", 10, "high"],
  ["Begin pre-marital counseling sessions", 9, "high"],
  ["Confirm banns of marriage posting (if required)", 6, "medium"],
  ["Plan church ceremony structure (hymns, readings, choir)", 4, "high"],
  ["Source unity candle / rings / ceremony items", 3, "medium"],
  ["Select readings + readers", 3, "medium"],
  ["Coordinate church décor within restrictions", 2, "medium"],
];

// ═══ INTERFAITH / SAME-GENDER / DESTINATION / ELOPEMENT ═══════════════════

const INTERFAITH: T[] = [
  ["Research legal requirements for interfaith marriage", 11, "critical"],
  ["Identify officiant comfortable with interfaith ceremonies", 10, "critical"],
  ["Meet with both families to discuss ceremony structure", 9, "high"],
  ["Decide ceremony approach (sequential / merged / separate)", 8, "high"],
  ["Draft custom ceremony script honoring both traditions", 6, "high"],
  ["Source ceremony items for both faiths", 4, "medium"],
  ["Print explanation cards for guests unfamiliar with traditions", 3, "medium"],
  ["Rehearse combined ceremony flow", 1, "high"],
];

const SAME_GENDER: T[] = [
  ["Confirm venue + officiant openness to same-gender ceremony", 11, "critical"],
  ["Review gendered language in rituals + programs", 4, "high"],
  ["Brief vendors on preferred pronouns + terminology", 2, "high"],
  ["Customize traditional rituals that assume hetero structure", 6, "medium"],
  ["For religious ceremonies: identify affirming officiant", 11, "critical"],
  ["Discuss destination legal considerations (if applicable)", 10, "high"],
];

const DESTINATION: T[] = [
  ["Scout destination + book travel for couple", 11, "critical"],
  ["Research destination marriage legality", 11, "critical"],
  ["Contract local on-site coordinator", 10, "high"],
  ["Send travel info packet (flights + hotels + visas)", 8, "high"],
  ["Block rooms at 2–3 hotels at price tiers", 8, "high"],
  ["Arrange airport transfers for guests", 6, "high"],
  ["Ship wedding supplies to destination", 3, "medium"],
  ["Confirm marriage recognition back home", 10, "high"],
  ["Plan welcome activity for arriving guests", 5, "medium"],
];

const ELOPEMENT: T[] = [
  ["Book intimate dinner reservation", 3, "high"],
  ["Identify witnesses for ceremony", 3, "medium"],
  ["Plan announcement cards post-wedding", 1, "low"],
  ["Source couple outfits", 4, "medium"],
  ["Book photographer (single shooter sufficient)", 6, "high"],
];

// ═══ INDIAN CULTURE — ATTIRE (bride + groom across events) ══════════════════

const INDIAN_ATTIRE_BRIDE_CORE: T[] = [
  ["Define bridal aesthetic per event", 11, "high"],
  ["Research bridal designers", 11, "high"],
  ["Set bridal attire budget", 11, "high"],
  ["Decide sourcing: India vs. local vs. online", 10, "high"],
  ["Plan India outfit shopping trip (if doing)", 10, "high"],
];

const INDIAN_ATTIRE_BRIDE_LEHENGA: T[] = [
  ["Choose wedding lehenga", 10, "critical", "Custom lehengas need 6–10 months including shipping and fittings."],
  ["Place custom lehenga order", 9, "critical"],
  ["First lehenga fitting", 5, "high"],
  ["Second lehenga fitting", 4, "high"],
  ["Final lehenga fitting", 2, "critical"],
  ["Select lehenga dupatta drape style", 4, "medium"],
  ["Source lehenga jewelry set (haar, earrings, tikka)", 6, "high"],
  ["Source chooda / bangles", 5, "medium"],
  ["Source kaleere", 5, "low"],
  ["Source wedding shoes / juttis", 4, "medium"],
  ["Source bridal clutch / bag", 3, "low"],
  ["Select hair accessory (matha patti, passa)", 4, "medium"],
  ["Select nose ring (nath)", 4, "low"],
];

const INDIAN_ATTIRE_BRIDE_BEAUTY: T[] = [
  ["Book bridal hair + makeup artist", 7, "high"],
  ["Schedule hair + makeup trial", 2, "high"],
  ["Book bride's mehndi design appointment", 2, "high"],
  ["Schedule bridal facial + skin treatment", 1, "medium"],
  ["Book bridal manicure + pedicure", 0.5, "medium"],
  ["Schedule bridal eyebrow shaping", 1, "low"],
];

const INDIAN_ATTIRE_GROOM: T[] = [
  ["Define groom's aesthetic per event", 11, "medium"],
  ["Choose wedding sherwani", 10, "critical"],
  ["Place custom sherwani order", 9, "critical"],
  ["First sherwani fitting", 5, "high"],
  ["Second sherwani fitting", 4, "high"],
  ["Final sherwani fitting", 2, "critical"],
  ["Source groom's safa / turban", 4, "medium"],
  ["Source groom's kalgi (turban jewel)", 4, "low"],
  ["Source groom's mojari shoes", 4, "medium"],
  ["Source groom's sehra (if doing)", 3, "low"],
  ["Book groom's hair + grooming", 2, "medium"],
  ["Book groom's beard trim + shave (day-of)", 0.25, "medium"],
];

const INDIAN_ATTIRE_FAMILY: T[] = [
  ["Align family on outfit color coordination per event", 8, "medium"],
  ["Source mother-of-bride outfits (per event)", 7, "medium"],
  ["Source mother-of-groom outfits (per event)", 7, "medium"],
  ["Source wedding party / bridesmaid outfits", 7, "medium"],
  ["Source groomsmen / wedding party outfits", 7, "medium"],
];

const INDIAN_ATTIRE_ACCESSORIES: T[] = [
  ["Source reception gown / outfit", 7, "high"],
  ["Source reception jewelry", 5, "medium"],
  ["Source reception shoes", 4, "low"],
];

// ═══ PROFILE-DRIVEN BASE GENERATOR ══════════════════════════════════════════

function baseDrafts(p: WeddingProfile): ItemDraft[] {
  const items: ItemDraft[] = [];

  // Universal
  items.push(
    ...mk("foundation_vision", "Budget", "BUDGET", FOUNDATION_BUDGET, { assignedTo: "both" }),
    ...mk("foundation_vision", "Couple Alignment", "VISION", FOUNDATION_VISION, { assignedTo: "both" }),
    ...mk("foundation_vision", "Wedding Party", "PEOPLE", FOUNDATION_PARTY, { assignedTo: "both" }),
    ...mk("foundation_vision", "Family Coordination", "FAMILY", FOUNDATION_COORDINATION, { assignedTo: "both" }),
  );

  items.push(
    ...mk("branding_identity", "Hashtag", "BRANDING", BRANDING_HASHTAG, { assignedTo: "both" }),
    ...mk("branding_identity", "Website", "BRANDING", BRANDING_WEBSITE, { assignedTo: "both" }),
    ...mk("branding_identity", "Identity", "BRANDING", BRANDING_IDENTITY, { assignedTo: "both" }),
    ...mk("branding_identity", "Social", "BRANDING", BRANDING_SOCIAL, { assignedTo: "both" }),
  );

  items.push(
    ...mk("core_bookings", "Venue", "VENUE", CORE_VENUE, { assignedTo: "both" }),
    ...mk("core_bookings", "Planner", "VENDOR", CORE_PLANNER, { assignedTo: "both" }),
    ...mk("core_bookings", "Photography", "VENDOR", CORE_PHOTO, { assignedTo: "both" }),
    ...mk("core_bookings", "Videography", "VENDOR", CORE_VIDEO, { assignedTo: "both" }),
    ...mk("core_bookings", "Catering", "VENDOR", CORE_CATERING, { assignedTo: "both" }),
    ...mk("core_bookings", "Cake", "VENDOR", CORE_CAKE, { assignedTo: "both" }),
  );

  items.push(
    ...mk("attire_styling", "Wellness", "WARDROBE", ATTIRE_SKINCARE, { assignedTo: "both" }),
  );

  items.push(
    ...mk("paper_stationery", "Save the Dates", "STATIONERY", PAPER_SAVE_THE_DATES, { assignedTo: "both" }),
    ...mk("paper_stationery", "Invitations", "STATIONERY", PAPER_INVITATIONS, { assignedTo: "both" }),
    ...mk("paper_stationery", "Day-of Paper", "STATIONERY", PAPER_DAY_OF, { assignedTo: "both" }),
    ...mk("paper_stationery", "Thank-yous", "STATIONERY", PAPER_THANK_YOU, { assignedTo: "both" }),
  );

  items.push(
    ...mk("guest_management", "Guest List", "GUESTS", GUESTS_LIST, { assignedTo: "both" }),
    ...mk("guest_management", "RSVPs", "GUESTS", GUESTS_RSVP, { assignedTo: "both" }),
    ...mk("guest_management", "Seating", "GUESTS", GUESTS_SEATING, { assignedTo: "both" }),
  );

  items.push(
    ...mk("gifts_favors", "Registry", "GIFTS", GIFTS_REGISTRY, { assignedTo: "both" }),
    ...mk("gifts_favors", "Wedding Party Gifts", "GIFTS", GIFTS_PARTY, { assignedTo: "both" }),
    ...mk("gifts_favors", "Vendor Tips", "GIFTS", GIFTS_VENDOR_TIPS, { assignedTo: "both" }),
  );

  items.push(
    ...mk("legal_admin", "Marriage License", "LEGAL", LEGAL_LICENSE, { assignedTo: "both" }),
    ...mk("legal_admin", "Contracts", "LEGAL", LEGAL_CONTRACTS, { assignedTo: "both" }),
    ...mk("legal_admin", "Docs + Insurance", "LEGAL", LEGAL_DOCS, { assignedTo: "both" }),
  );

  // Faith-driven
  if (hasFaith(p, "hindu")) {
    items.push(
      ...mk("ceremony_specifics", "Vivah Ceremony", "CEREMONY", HINDU_CEREMONY, { assignedTo: "both" }),
      ...mk("ceremony_specifics", "Puja Samagri", "CEREMONY", HINDU_SAMAGRI, { assignedTo: "both" }),
      ...mk("ceremony_specifics", "Vidaai", "CEREMONY", HINDU_VIDAAI, { assignedTo: "both" }),
      ...mk("ceremony_specifics", "Roka / Engagement", "CEREMONY", HINDU_ENGAGEMENT, { assignedTo: "both" }),
    );
  }
  if (hasFaith(p, "sikh")) {
    items.push(
      ...mk("ceremony_specifics", "Anand Karaj", "CEREMONY", SIKH_CEREMONY, { assignedTo: "both" }),
    );
  }
  if (hasFaith(p, "muslim")) {
    items.push(
      ...mk("ceremony_specifics", "Nikah", "CEREMONY", MUSLIM_NIKAH, { assignedTo: "both" }),
    );
  }
  if (hasFaith(p, "christian")) {
    items.push(
      ...mk("ceremony_specifics", "Church Ceremony", "CEREMONY", CHRISTIAN_CEREMONY, { assignedTo: "both" }),
    );
  }
  if (hasFaith(p, "interfaith") || hasType(p, "interfaith")) {
    items.push(
      ...mk("ceremony_specifics", "Interfaith", "CEREMONY", INTERFAITH, { assignedTo: "both" }),
    );
  }

  // Wedding-type-driven
  if (hasType(p, "same_gender")) {
    items.push(
      ...mk("ceremony_specifics", "Same-gender Considerations", "CEREMONY", SAME_GENDER, { assignedTo: "both" }),
    );
  }
  if (hasType(p, "destination")) {
    items.push(
      ...mk("core_bookings", "Destination", "TRAVEL", DESTINATION, { assignedTo: "both" }),
    );
  }
  if (hasType(p, "elopement")) {
    items.push(
      ...mk("core_bookings", "Elopement", "VENDOR", ELOPEMENT, { assignedTo: "both" }),
    );
  }

  // Indian culture attire
  if (isIndianCulture(p)) {
    items.push(
      ...mk("attire_styling", "Bride's Wardrobe", "WARDROBE", INDIAN_ATTIRE_BRIDE_CORE, { assignedTo: "partner1" }),
      ...mk("attire_styling", "Bride's Lehenga", "WARDROBE", INDIAN_ATTIRE_BRIDE_LEHENGA, { assignedTo: "partner1" }),
      ...mk("attire_styling", "Bridal Beauty", "BEAUTY", INDIAN_ATTIRE_BRIDE_BEAUTY, { assignedTo: "partner1" }),
      ...mk("attire_styling", "Groom's Wardrobe", "WARDROBE", INDIAN_ATTIRE_GROOM, { assignedTo: "partner2" }),
      ...mk("attire_styling", "Family Outfits", "WARDROBE", INDIAN_ATTIRE_FAMILY, { assignedTo: "both" }),
      ...mk("attire_styling", "Reception Attire", "WARDROBE", INDIAN_ATTIRE_ACCESSORIES, { assignedTo: "both" }),
    );
  }

  // Guest count scaling
  const gc = guestCountNumeric(p);
  if (gc >= 300) {
    const largeCount: T[] = [
      ["Hire event logistics crew (beyond planner)", 10, "high"],
      ["Plan multi-station food service for volume", 6, "high"],
      ["Book multiple bartenders / stations", 4, "high"],
      ["Arrange valet / parking management", 4, "medium"],
      ["Plan crowd flow + room transitions", 3, "medium"],
      ["Order 10–15% stationery buffer", 5, "medium"],
      ["Arrange shuttle fleet for guest transport", 4, "high"],
      ["Plan multi-hotel room block strategy", 8, "high"],
    ];
    items.push(
      ...mk("experience_layer", "Large Event Logistics", "LOGISTICS", largeCount, {
        applicableWhen: { guestCountMin: 300 },
        assignedTo: "planner",
      }),
    );
  }

  return items;
}

// ═══ PROGRESSIVE UNLOCKS — dense libraries per event ═══════════════════════

const EVENT_MEHNDI: T[] = [
  ["Research mehndi artists (portfolios + reviews)", 8, "high"],
  ["Book lead mehndi artist for bride", 7, "critical"],
  ["Confirm bride's mehndi design style (Rajasthani, Arabic, contemporary)", 6, "high"],
  ["Book additional mehndi artists for bridal party + family", 6, "high"],
  ["Schedule mehndi timeline (bride first, 3–5 hours)", 3, "high"],
  ["Confirm artist arrival time + setup needs", 2, "medium"],
  ["Plan mehndi venue setup (floor seating, stage)", 3, "high"],
  ["Order mehndi décor (rangoli, marigolds, drapes, cushions)", 3, "medium"],
  ["Order mehndi backdrop / photo moment", 3, "medium"],
  ["Book mehndi dhol player / live music", 4, "high"],
  ["Book mehndi DJ or finalize playlist", 3, "medium"],
  ["Book mehndi caterer (chaat counters, street food)", 4, "high"],
  ["Plan mehndi menu (veg + mocktails)", 3, "high"],
  ["Plan mehndi bar service", 3, "medium"],
  ["Order mehndi favors (bangles, cones, hairpieces)", 3, "low"],
  ["Plan mehndi games / activities for guests", 2, "low"],
  ["Coordinate bride's grand entrance", 1, "medium"],
  ["Source mehndi outfit for bride", 8, "high"],
  ["Source mehndi outfit for groom", 8, "medium"],
  ["Source mehndi outfits for family/party", 7, "medium"],
  ["Arrange photo + video coverage for mehndi", 4, "high"],
  ["Send mehndi event reminder to guests", 1, "low"],
];

const EVENT_SANGEET: T[] = [
  ["Book sangeet venue (if separate from main)", 9, "critical"],
  ["Hire choreographer", 6, "high"],
  ["Schedule choreography rehearsals", 5, "high"],
  ["Assign family dance groups + song assignments", 5, "high"],
  ["Finalize playlist for performances", 3, "high"],
  ["Book sangeet MC / host", 4, "high"],
  ["Book sangeet DJ", 7, "critical"],
  ["Book sangeet live musician / band (if any)", 7, "high"],
  ["Plan sangeet venue layout (stage, dance floor, guest seating)", 4, "high"],
  ["Order sangeet stage + dance floor", 4, "high"],
  ["Order sangeet décor (uplighting, backdrop, centerpieces)", 4, "high"],
  ["Book sangeet caterer", 5, "high"],
  ["Plan sangeet menu + late-night snacks", 4, "medium"],
  ["Plan sangeet bar service", 3, "medium"],
  ["Coordinate AV for dance performances", 2, "high"],
  ["Rehearse couple's first dance", 2, "medium"],
  ["Source sangeet outfit for bride", 7, "high"],
  ["Source sangeet outfit for groom", 7, "medium"],
  ["Source sangeet outfits for family / party", 7, "medium"],
  ["Order sangeet favors", 3, "low"],
];

const EVENT_HALDI: T[] = [
  ["Plan haldi venue setup (indoor vs. outdoor)", 3, "high"],
  ["Source turmeric paste ingredients", 1, "medium"],
  ["Order haldi décor (marigold backdrop, floor cushions)", 2, "medium"],
  ["Arrange haldi towels / robes / ponchos", 1, "medium"],
  ["Plan haldi snack / brunch service", 2, "medium"],
  ["Finalize haldi music playlist", 1, "low"],
  ["Assign haldi applicators (elders)", 1, "medium"],
  ["Arrange outdoor shower / cleanup logistics", 1, "medium"],
  ["Plan haldi photo coverage", 2, "medium"],
  ["Source yellow haldi outfit for bride", 4, "high"],
  ["Source yellow haldi outfit for groom", 4, "medium"],
  ["Source yellow haldi outfits for family", 4, "low"],
  ["Arrange haldi event invite / reminder", 1, "low"],
];

const EVENT_BARAAT: T[] = [
  ["Book baraat horse / vintage car", 7, "high"],
  ["Book dhol players for baraat", 6, "high"],
  ["Plan baraat route + timing", 3, "high"],
  ["Arrange baraat transportation for guests", 3, "medium"],
  ["Coordinate milni ceremony logistics", 2, "high"],
  ["Plan groom's baraat outfit", 8, "medium"],
  ["Arrange groom's sehra bandi moment", 2, "low"],
  ["Arrange baraat photo + video coverage", 4, "high"],
  ["Arrange flower shower for baraat arrival", 1, "low"],
  ["Brief family on milni customs", 1, "medium"],
  ["Source varmala (garlands for couple)", 1, "high"],
];

const EVENT_GANESH_PUJA: T[] = [
  ["Book pandit for Ganesh Puja", 3, "high"],
  ["Request samagri list for Ganesh Puja", 2, "medium"],
  ["Source Ganesh idol + prasad", 1, "medium"],
  ["Arrange Ganesh Puja venue setup", 1, "medium"],
  ["Arrange Ganesh Puja photographer coverage", 2, "low"],
  ["Brief immediate family on seating + timing", 1, "low"],
  ["Arrange prasad distribution", 1, "low"],
];

const EVENT_MANDAP: T[] = [
  ["Design mandap with decorator", 6, "high"],
  ["Confirm mandap flower palette + drapes", 5, "high"],
  ["Source kalash + kalash décor", 2, "medium"],
  ["Source mandap seating (chairs + cushions for family)", 4, "medium"],
  ["Arrange agni / fire pit (with venue permit)", 6, "critical"],
  ["Order ceremony flower petals", 1, "medium"],
  ["Arrange aisle décor + walkway petals", 2, "medium"],
  ["Coordinate ceremony AV / microphones for pandit", 2, "high"],
  ["Coordinate ceremony music (nadaswaram / flute)", 3, "medium"],
  ["Arrange family stage seating order", 1, "medium"],
  ["Brief mandap photographer on key moments", 1, "high"],
  ["Arrange live stream setup at mandap", 2, "low"],
];

const EVENT_ANAND_KARAJ: T[] = [
  ["Confirm Gurdwara ceremony slot", 11, "critical"],
  ["Arrange raagi jatha for kirtan", 6, "high"],
  ["Source rumala sahib", 3, "medium"],
  ["Confirm laavan sequence with Granthi", 3, "high"],
  ["Arrange head coverings + shoe storage for guests", 2, "medium"],
  ["Plan Gurdwara seating protocol", 2, "medium"],
  ["Coordinate langar / community meal", 4, "high"],
  ["Brief non-Sikh guests on Gurdwara etiquette", 2, "medium"],
];

const EVENT_NIKAH: T[] = [
  ["Confirm nikah venue (masjid, home, hall)", 6, "critical"],
  ["Finalize witness list + confirm attendance", 3, "high"],
  ["Draft nikah-nama with imam", 3, "critical"],
  ["Source Quran + ceremony items", 2, "medium"],
  ["Arrange nikah stage + seating layout", 3, "high"],
  ["Coordinate any gender-separate seating", 4, "high"],
  ["Plan rukhsati logistics", 1, "medium"],
  ["Arrange nikah sweets distribution", 1, "low"],
];

const EVENT_WALIMA: T[] = [
  ["Book walima reception venue", 8, "critical"],
  ["Finalize walima menu", 4, "high"],
  ["Book walima DJ / entertainment", 6, "high"],
  ["Design walima décor + stage", 4, "high"],
  ["Coordinate walima photography", 4, "medium"],
  ["Plan walima timeline + speeches", 2, "medium"],
];

const EVENT_MUHURTHAM: T[] = [
  ["Consult jothidar / astrologer for muhurtham timing", 11, "critical"],
  ["Book temple / muhurtham venue", 11, "critical"],
  ["Source koorai pudavai / pattu saree", 10, "high"],
  ["Arrange nadaswaram + thavil musicians", 7, "high"],
  ["Source thaali / mangalsutra", 6, "high"],
  ["Coordinate oonjal (swing) setup", 3, "medium"],
  ["Source coconut, banana, betel leaves", 1, "medium"],
  ["Coordinate maalai matral (garland exchange)", 2, "medium"],
  ["Plan sadhya (banana leaf feast) menu", 5, "high"],
];

const EVENT_CHURCH: T[] = [
  ["Book church + confirm timing", 11, "critical"],
  ["Schedule pre-marital counseling sessions", 9, "high"],
  ["Plan ceremony structure (hymns, readings, choir)", 4, "high"],
  ["Select readings + assign readers", 3, "medium"],
  ["Source unity candle + rings", 3, "medium"],
  ["Arrange church florals within restrictions", 2, "medium"],
  ["Coordinate choir / music for ceremony", 4, "high"],
  ["Confirm church-specific etiquette to guests", 2, "low"],
];

const EVENT_CIVIL: T[] = [
  ["Research civil ceremony requirements", 6, "high"],
  ["Book civil officiant", 4, "critical"],
  ["Book civil ceremony venue (courthouse, home, hall)", 4, "high"],
  ["Identify witnesses for civil ceremony", 3, "high"],
  ["Write or finalize civil vows", 2, "medium"],
];

const EVENT_RECEPTION: T[] = [
  ["Book reception DJ", 8, "critical"],
  ["Book reception MC", 4, "high"],
  ["Draft reception run of show", 2, "high"],
  ["Plan grand entrance moment", 2, "medium"],
  ["Arrange speeches order + toasters", 2, "high"],
  ["Choreograph couple's first dance", 2, "medium"],
  ["Book parent / family dance songs", 2, "low"],
  ["Plan cake cutting moment", 2, "medium"],
  ["Order reception dessert table / sweet bar", 3, "medium"],
  ["Plan reception bar program + signature cocktails", 3, "medium"],
  ["Arrange reception photo booth", 3, "low"],
  ["Plan reception surprise (dhol, dancers, magician)", 3, "low"],
  ["Design reception table layout + centerpieces", 3, "high"],
  ["Arrange reception lighting design", 4, "high"],
  ["Plan reception exit / sparklers moment", 1, "low"],
];

const EVENT_WELCOME: T[] = [
  ["Book welcome dinner venue", 6, "high"],
  ["Finalize welcome dinner menu", 4, "medium"],
  ["Plan welcome dinner entertainment / toasts", 3, "medium"],
  ["Arrange welcome dinner décor", 3, "medium"],
  ["Coordinate welcome bag distribution", 2, "medium"],
  ["Send welcome event details to out-of-town guests", 2, "medium"],
];

const EVENT_FAREWELL: T[] = [
  ["Book farewell brunch venue", 4, "medium"],
  ["Finalize farewell brunch menu", 3, "low"],
  ["Plan farewell brunch dress code + tone", 2, "low"],
  ["Communicate farewell timing to guests", 2, "low"],
];

const EVENT_VIDAAI: T[] = [
  ["Plan vidaai / rukhsati / doli moment + timing", 1, "medium"],
  ["Decorate vidaai car", 1, "medium"],
  ["Arrange vidaai music + emotional moment", 1, "low"],
  ["Brief family on vidaai flow", 1, "low"],
  ["Arrange rice / flower shower moment", 1, "low"],
];

const EVENT_ROKA: T[] = [
  ["Book roka / engagement venue", 10, "medium"],
  ["Plan roka ceremony sequence with family", 9, "medium"],
  ["Source engagement outfits for couple", 9, "medium"],
  ["Arrange engagement ceremony photo coverage", 9, "low"],
  ["Order engagement favors", 9, "low"],
  ["Source engagement ring(s) — if not yet", 10, "medium"],
];

function unlockedForEvent(ev: string): ItemDraft[] {
  switch (ev) {
    case "mehndi":
      return mk("experience_layer", "Mehndi", "MEHNDI", EVENT_MEHNDI, { unlockedBy: "events", assignedTo: "both" });
    case "sangeet":
      return mk("experience_layer", "Sangeet", "SANGEET", EVENT_SANGEET, { unlockedBy: "events", assignedTo: "both" });
    case "haldi":
      return mk("experience_layer", "Haldi", "HALDI", EVENT_HALDI, { unlockedBy: "events", assignedTo: "both" });
    case "baraat":
      return mk("experience_layer", "Baraat", "BARAAT", EVENT_BARAAT, { unlockedBy: "events", assignedTo: "both" });
    case "ganesh_puja":
      return mk("ceremony_specifics", "Ganesh Puja", "CEREMONY", EVENT_GANESH_PUJA, { unlockedBy: "events", assignedTo: "both" });
    case "mandap":
      return mk("ceremony_specifics", "Mandap", "CEREMONY", EVENT_MANDAP, { unlockedBy: "events", assignedTo: "both" });
    case "anand_karaj":
      return mk("ceremony_specifics", "Anand Karaj", "CEREMONY", EVENT_ANAND_KARAJ, { unlockedBy: "events", assignedTo: "both" });
    case "nikah":
      return mk("ceremony_specifics", "Nikah", "CEREMONY", EVENT_NIKAH, { unlockedBy: "events", assignedTo: "both" });
    case "walima":
      return mk("experience_layer", "Walima", "WALIMA", EVENT_WALIMA, { unlockedBy: "events", assignedTo: "both" });
    case "muhurtham":
      return mk("ceremony_specifics", "Muhurtham", "CEREMONY", EVENT_MUHURTHAM, { unlockedBy: "events", assignedTo: "both" });
    case "church":
      return mk("ceremony_specifics", "Church Ceremony", "CEREMONY", EVENT_CHURCH, { unlockedBy: "events", assignedTo: "both" });
    case "civil":
      return mk("ceremony_specifics", "Civil Ceremony", "CEREMONY", EVENT_CIVIL, { unlockedBy: "events", assignedTo: "both" });
    case "reception":
      return mk("experience_layer", "Reception", "RECEPTION", EVENT_RECEPTION, { unlockedBy: "events", assignedTo: "both" });
    case "welcome":
      return mk("experience_layer", "Welcome Dinner", "WELCOME", EVENT_WELCOME, { unlockedBy: "events", assignedTo: "both" });
    case "farewell":
      return mk("experience_layer", "Farewell Brunch", "FAREWELL", EVENT_FAREWELL, { unlockedBy: "events", assignedTo: "both" });
    case "vidaai":
      return mk("ceremony_specifics", "Vidaai", "CEREMONY", EVENT_VIDAAI, { unlockedBy: "events", assignedTo: "both" });
    case "roka":
      return mk("ceremony_specifics", "Roka / Engagement", "CEREMONY", EVENT_ROKA, { unlockedBy: "events", assignedTo: "both" });
    default:
      return [];
  }
}

// ── Other question unlocks ─────────────────────────────────────────────────

const PLANNER_YES: T[] = [
  ["Interview + hire wedding planner", 11, "critical"],
  ["Review planner contract + scope", 11, "high"],
  ["Share budget + vision deck with planner", 10, "high"],
  ["Schedule weekly planner check-ins", 10, "medium"],
  ["Grant planner access to vendor contacts", 10, "medium"],
];

const PLANNER_NO: T[] = [
  ["Build self-managed master timeline spreadsheet", 11, "high"],
  ["Draft vendor tracker + contact sheet", 11, "high"],
  ["Identify friend/family day-of coordinator", 6, "high"],
  ["Hire day-of coordinator (min. 8 weeks ahead)", 3, "critical"],
  ["Create day-of emergency runbook", 1, "high"],
  ["Review every vendor contract line by line", 6, "high"],
  ["Build vendor meal + vendor arrival plan", 2, "medium"],
  ["Prep day-of vendor tip envelopes yourself", 0.5, "high"],
];

const OUTFIT_CUSTOM: T[] = [
  ["Select bridal designer + schedule design consult", 11, "high"],
  ["Send measurements + reference images", 10, "high"],
  ["Place custom outfit orders", 9, "critical"],
  ["Schedule mid-point fitting", 5, "high"],
  ["Schedule final fitting", 2, "critical"],
  ["Schedule alterations cushion (1–2 rounds)", 2, "high"],
];

const OUTFIT_RTW: T[] = [
  ["Shop ready-to-wear for secondary events", 6, "medium"],
  ["Plan shopping trip for outfits + accessories", 6, "medium"],
];

const MEDIA_VIDEO: T[] = [
  ["Book videographer", 9, "critical"],
  ["Clarify video deliverables (highlight, full, raw)", 6, "medium"],
  ["Book additional drone / 2nd shooter if needed", 6, "medium"],
];

const MEDIA_BOTH: T[] = [
  ["Align photo + video team on shared shot list", 2, "medium"],
  ["Confirm no-conflict angles between photo + video", 1, "medium"],
];

const ENTERTAINMENT_DJ: T[] = [
  ["Book DJ + confirm setlist scope", 8, "high"],
  ["Build do-not-play list with DJ", 2, "medium"],
  ["Finalize grand entrance + dance floor openers", 2, "medium"],
];

const ENTERTAINMENT_LIVE: T[] = [
  ["Book live band + confirm song list", 9, "high"],
  ["Provide must-have + no-play list to band", 2, "medium"],
  ["Plan band breaks / DJ interstitials", 2, "medium"],
];

const DECOR_HIRE: T[] = [
  ["Book florist / decorator", 7, "high"],
  ["Review decorator mood boards per event", 5, "high"],
  ["Finalize florals + centerpieces", 3, "high"],
  ["Walk through venue setup + breakdown with decorator", 1, "high"],
];

const DECOR_DIY: T[] = [
  ["Source DIY florals + decor materials", 3, "medium"],
  ["Schedule DIY assembly party", 1, "medium"],
  ["Plan day-of setup crew + timing", 1, "medium"],
];

const MENU_TASKS: T[] = [
  ["Schedule catering menu tasting", 5, "high"],
  ["Finalize menu per event", 3, "high"],
  ["Plan signature drinks / non-alcoholic options", 3, "medium"],
];

const BAR_OPEN: T[] = [
  ["Design bar program + stock list", 4, "medium"],
  ["Order beverages + confirm delivery", 3, "medium"],
  ["Book bartenders (1 per 50–75 guests)", 4, "high"],
];

const OFFICIANT_TASKS: T[] = [
  ["Find + confirm officiant", 10, "critical"],
  ["Meet officiant to review ceremony script", 3, "high"],
  ["Confirm officiant honorarium + travel", 2, "medium"],
];

const VOWS_TASKS: T[] = [
  ["Draft personal vows", 3, "medium"],
  ["Share vows for proofing (optional)", 2, "low"],
  ["Print vow booklets for day-of", 0.5, "low"],
];

const KIDS_ADULTS_ONLY: T[] = [
  ["Communicate adults-only policy to guests clearly", 6, "medium"],
  ["Provide childcare recommendations (hotel partnerships)", 5, "low"],
];

const ROOM_BLOCKS_YES: T[] = [
  ["Research hotels near venue", 8, "high"],
  ["Negotiate room blocks at 2 price tiers", 7, "high"],
  ["Send hotel booking links to guests", 6, "high"],
  ["Track hotel block pickup rates", 4, "medium"],
  ["Release unused rooms before cutoff", 2, "high"],
];

const NAME_CHANGE_YES: T[] = [
  ["File name change paperwork (SSA)", -1, "medium"],
  ["Update driver's license", -2, "medium"],
  ["Update passport", -2, "medium"],
  ["Update bank accounts + credit cards", -2, "low"],
  ["Update insurance + employer records", -2, "low"],
];

// ── Dispatch: progressive question → item drafts ───────────────────────────

function unlockedDrafts(
  _p: WeddingProfile,
  questionId: string,
  answer: unknown,
): ItemDraft[] {
  const items: ItemDraft[] = [];

  if (questionId === "events" && Array.isArray(answer)) {
    for (const ev of answer as string[]) {
      items.push(...unlockedForEvent(ev));
    }
  }

  if (questionId === "planner") {
    if (answer === true)
      items.push(...mk("core_bookings", "Planner", "VENDOR", PLANNER_YES, { unlockedBy: "planner", assignedTo: "both" }));
    else if (answer === false)
      items.push(...mk("foundation_vision", "Self-Planning", "PLANNING", PLANNER_NO, { unlockedBy: "planner", assignedTo: "both" }));
  }

  if (questionId === "outfit_approach") {
    if (answer === "custom" || answer === "mixed")
      items.push(...mk("attire_styling", "Custom Outfits", "WARDROBE", OUTFIT_CUSTOM, { unlockedBy: "outfit_approach", assignedTo: "both" }));
    if (answer === "rtw" || answer === "mixed")
      items.push(...mk("attire_styling", "Ready-to-wear", "WARDROBE", OUTFIT_RTW, { unlockedBy: "outfit_approach", assignedTo: "both" }));
  }

  if (questionId === "outfit_changes" && typeof answer === "string") {
    const count = answer === "7_plus" ? 7 : answer === "5_6" ? 5 : answer === "3_4" ? 3 : 1;
    if (count >= 3) {
      const tasks: T[] = [
        [`Map outfit changes across events (~${count})`, 9, "medium"],
        ["Build outfit timeline with quick-change windows", 4, "medium"],
        ["Coordinate accessories + jewelry per outfit", 4, "medium"],
        ["Label outfits + garment bags for day-of", 0.5, "low"],
      ];
      items.push(
        ...mk("attire_styling", "Outfit Changes", "WARDROBE", tasks, { unlockedBy: "outfit_changes", assignedTo: "both" }),
      );
    }
  }

  if (questionId === "media" && typeof answer === "string") {
    if (answer === "video" || answer === "both")
      items.push(...mk("core_bookings", "Videography", "VENDOR", MEDIA_VIDEO, { unlockedBy: "media", assignedTo: "both" }));
    if (answer === "both")
      items.push(...mk("experience_layer", "Media", "VENDOR", MEDIA_BOTH, { unlockedBy: "media", assignedTo: "both" }));
  }

  if (questionId === "entertainment" && typeof answer === "string") {
    if (answer === "dj" || answer === "both")
      items.push(...mk("experience_layer", "DJ", "VENDOR", ENTERTAINMENT_DJ, { unlockedBy: "entertainment", assignedTo: "both" }));
    if (answer === "live" || answer === "both")
      items.push(...mk("experience_layer", "Live Band", "VENDOR", ENTERTAINMENT_LIVE, { unlockedBy: "entertainment", assignedTo: "both" }));
  }

  if (questionId === "decor" && typeof answer === "string") {
    if (answer === "hire" || answer === "mixed")
      items.push(...mk("experience_layer", "Decor", "VENDOR", DECOR_HIRE, { unlockedBy: "decor", assignedTo: "both" }));
    if (answer === "diy" || answer === "mixed")
      items.push(...mk("experience_layer", "DIY Decor", "DECOR", DECOR_DIY, { unlockedBy: "decor", assignedTo: "both" }));
  }

  if (questionId === "menu")
    items.push(...mk("core_bookings", "Menu", "VENDOR", MENU_TASKS, { unlockedBy: "menu", assignedTo: "both" }));

  if (questionId === "bar" && (answer === "open" || answer === "limited"))
    items.push(...mk("experience_layer", "Bar", "BAR", BAR_OPEN, { unlockedBy: "bar", assignedTo: "both" }));

  if (questionId === "officiant" && answer === false)
    items.push(...mk("ceremony_specifics", "Officiant", "CEREMONY", OFFICIANT_TASKS, { unlockedBy: "officiant", assignedTo: "both" }));

  if (questionId === "own_vows" && answer === true)
    items.push(...mk("ceremony_specifics", "Vows", "CEREMONY", VOWS_TASKS, { unlockedBy: "own_vows", assignedTo: "both" }));

  if (questionId === "kids" && answer === "adults")
    items.push(...mk("guest_management", "Kids Policy", "GUESTS", KIDS_ADULTS_ONLY, { unlockedBy: "kids", assignedTo: "both" }));

  if (questionId === "room_blocks" && answer === true)
    items.push(...mk("guest_management", "Hotel Blocks", "GUESTS", ROOM_BLOCKS_YES, { unlockedBy: "room_blocks", assignedTo: "both" }));

  if (questionId === "name_change" && typeof answer === "string" && answer !== "none")
    items.push(...mk("legal_admin", "Name Change", "LEGAL", NAME_CHANGE_YES, { unlockedBy: "name_change", assignedTo: "both" }));

  return items;
}

// ═══ Public API ════════════════════════════════════════════════════════════

export function generateBaseItems(p: WeddingProfile): GeneratedItem[] {
  const drafts = baseDrafts(p);
  return drafts.map((d, i) => ({ ...draftToSpec(d, i), done: false }));
}

export function generateUnlockedItems(
  p: WeddingProfile,
  questionId: string,
  answer: unknown,
  existingCount: number,
): GeneratedItem[] {
  const drafts = unlockedDrafts(p, questionId, answer);
  return drafts.map((d, i) => ({
    ...draftToSpec(d, existingCount + i),
    done: false,
  }));
}

export function makeManualItem(args: {
  title: string;
  category: CategoryId;
  subcategory: string;
  monthsBeforeWedding: number;
  priority: Priority;
  notes?: string;
  existingCount: number;
}): GeneratedItem {
  const draft: ItemDraft = {
    title: args.title,
    category: args.category,
    subcategory: args.subcategory || "Custom",
    tags: ["CUSTOM"],
    monthsBeforeWedding: args.monthsBeforeWedding,
    priority: args.priority,
    notes: args.notes ?? null,
    source: "manual",
    assignedTo: "both",
  };
  return { ...draftToSpec(draft, args.existingCount), done: false };
}

// ═══ Deadline + priority ═══════════════════════════════════════════════════

export function deadlineFor(
  weddingDate: string | null,
  monthsBefore: number,
): Date | null {
  if (!weddingDate) return null;
  const d = new Date(weddingDate);
  if (Number.isNaN(d.getTime())) return null;
  // monthsBefore can be fractional (e.g., 0.25 ≈ 1 week)
  const whole = Math.floor(monthsBefore);
  const frac = monthsBefore - whole;
  d.setMonth(d.getMonth() - whole);
  if (frac !== 0) d.setDate(d.getDate() - Math.round(frac * 30));
  return d;
}

export function formatDeadline(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export type UrgencyDot = "overdue" | "soon" | "ontrack" | "future" | "none";

export function urgencyFor(
  item: ChecklistItem,
  weddingDate: string | null,
  now: Date = new Date(),
): UrgencyDot {
  const dl = deadlineFor(weddingDate, item.monthsBeforeWedding);
  if (!dl) return "none";
  const days = (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "overdue";
  if (days <= 14) return "soon";
  if (days <= 60) return "ontrack";
  return "future";
}

export function effectivePriority(
  item: ChecklistItem,
  weddingDate: string | null,
  now: Date = new Date(),
): Priority {
  if (item.done) return item.priority;
  const u = urgencyFor(item, weddingDate, now);
  if (u === "overdue" || u === "soon") return "critical";
  return item.priority;
}

export function isThisWeek(
  item: ChecklistItem,
  weddingDate: string | null,
  now: Date = new Date(),
): boolean {
  const dl = deadlineFor(weddingDate, item.monthsBeforeWedding);
  if (!dl) return false;
  const days = (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 7;
}

export function isAtRisk(
  item: ChecklistItem,
  weddingDate: string | null,
  now: Date = new Date(),
): boolean {
  if (item.done) return false;
  const u = urgencyFor(item, weddingDate, now);
  return u === "overdue" || u === "soon";
}
