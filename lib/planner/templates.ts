// Mock data for the Templates & Tools library.
// Organized by category; each category holds built-in templates the planner
// can clone, edit, and save to "My Templates".

export type TemplateCategoryId =
  | "timelines"
  | "vendor-intros"
  | "budgets"
  | "checklists"
  | "proposals"
  | "mine";

export type TemplateCategory = {
  id: TemplateCategoryId;
  label: string;
  glyph: string;
  description: string;
  count: number;
};

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: "timelines",
    label: "Day-Of Timeline Templates",
    glyph: "🕰",
    description: "Minute-by-minute run-of-show by ceremony type.",
    count: 6,
  },
  {
    id: "vendor-intros",
    label: "Vendor Introduction Templates",
    glyph: "✉",
    description: "Warm intros that auto-fill couple, vendor, venue, and price.",
    count: 8,
  },
  {
    id: "budgets",
    label: "Budget Allocation Templates",
    glyph: "◈",
    description: "Category breakdowns by total wedding budget.",
    count: 5,
  },
  {
    id: "checklists",
    label: "Checklist Templates",
    glyph: "✓",
    description: "12-month planning cadences tuned for South Asian weddings.",
    count: 7,
  },
  {
    id: "proposals",
    label: "Couple Proposal Templates",
    glyph: "❋",
    description: "Your own service proposals, branded and exportable.",
    count: 3,
  },
  {
    id: "mine",
    label: "My Templates",
    glyph: "★",
    description: "Customized templates you've saved from any category.",
    count: 4,
  },
];

// ─── Timelines ─────────────────────────────────────────────────────────

export type TimelineBlock = {
  time: string;
  title: string;
  detail?: string;
  tone?: "ceremony" | "meal" | "transit" | "vendor" | "party";
};

export type TimelineDay = {
  label: string; // "Day 1 — Sangeet"
  date: string; // "Oct 15, 2026"
  blocks: TimelineBlock[];
};

export type TimelineTemplate = {
  id: string;
  name: string;
  ceremony:
    | "Hindu (North)"
    | "Hindu (South)"
    | "Sikh"
    | "Muslim (Sunni)"
    | "Muslim (Ismaili)"
    | "Interfaith / Fusion";
  days: number;
  durationNote: string;
  eventsCovered: string[];
  summary: string;
  dayPlan: TimelineDay[];
};

export const TIMELINE_TEMPLATES: TimelineTemplate[] = [
  {
    id: "hindu-north-3",
    name: "Hindu Wedding — North Indian",
    ceremony: "Hindu (North)",
    days: 3,
    durationNote: "3-day weekend",
    eventsCovered: ["Sangeet", "Mehndi", "Haldi", "Ceremony", "Reception"],
    summary:
      "Sangeet opens, mehndi and haldi on the middle day, phera and reception close. Balanced to give vendors a realistic setup window between the haldi and baraat.",
    dayPlan: [
      {
        label: "Day 1 — Sangeet",
        date: "Friday",
        blocks: [
          { time: "10:00 AM", title: "Decor load-in", tone: "vendor", detail: "Stage, uplights, LED backdrop" },
          { time: "12:00 PM", title: "Photo/video team scout + shot list sync", tone: "vendor" },
          { time: "3:00 PM", title: "HMUA arrival for family performances", tone: "vendor" },
          { time: "4:30 PM", title: "Couple HMUA", tone: "vendor" },
          { time: "6:00 PM", title: "Guest arrival · cocktails", tone: "party" },
          { time: "6:45 PM", title: "Couple grand entry", tone: "party" },
          { time: "7:00 PM", title: "Family performances (choreographed)", detail: "6 performances · 4 min each", tone: "party" },
          { time: "8:15 PM", title: "Dinner service", tone: "meal" },
          { time: "9:30 PM", title: "Open dance floor", tone: "party" },
          { time: "11:30 PM", title: "Event close · photo team off", tone: "vendor" },
        ],
      },
      {
        label: "Day 2 — Mehndi + Haldi",
        date: "Saturday",
        blocks: [
          { time: "8:30 AM", title: "Mehndi setup — lawn pavilion", tone: "vendor" },
          { time: "10:00 AM", title: "Mehndi artists arrive (4 stations)", tone: "vendor" },
          { time: "10:30 AM", title: "Bride's mehndi begins", tone: "ceremony" },
          { time: "11:00 AM", title: "Guest mehndi + brunch", tone: "meal" },
          { time: "1:30 PM", title: "Haldi setup · yellow florals", tone: "vendor" },
          { time: "2:30 PM", title: "Haldi ceremony", detail: "Family applies turmeric; dhol performer", tone: "ceremony" },
          { time: "4:00 PM", title: "Haldi ends · guests rest", tone: "transit" },
          { time: "5:00 PM", title: "Pre-ceremony mehndi touch-up (bride)", tone: "vendor" },
          { time: "7:00 PM", title: "Evening open · light dinner", tone: "meal" },
          { time: "10:00 PM", title: "Early wrap · baraat prep starts tomorrow", tone: "transit" },
        ],
      },
      {
        label: "Day 3 — Ceremony + Reception",
        date: "Sunday",
        blocks: [
          { time: "5:00 AM", title: "Bride HMUA call time", tone: "vendor" },
          { time: "6:30 AM", title: "Groom HMUA", tone: "vendor" },
          { time: "7:30 AM", title: "First look (couple + families)", tone: "ceremony" },
          { time: "9:00 AM", title: "Baraat procession — horse + dhol + brass", tone: "ceremony" },
          { time: "9:30 AM", title: "Milni + swagat", tone: "ceremony" },
          { time: "10:15 AM", title: "Jaimala / varmala", tone: "ceremony" },
          { time: "10:45 AM", title: "Mandap ceremony begins", tone: "ceremony" },
          { time: "11:30 AM", title: "Pheras (seven rounds)", tone: "ceremony" },
          { time: "12:15 PM", title: "Sindoor + mangalsutra", tone: "ceremony" },
          { time: "12:45 PM", title: "Ceremony close · lunch service", tone: "meal" },
          { time: "2:30 PM", title: "Bidaai", tone: "ceremony" },
          { time: "3:30 PM", title: "Break — reception flip starts", tone: "transit" },
          { time: "5:00 PM", title: "Reception decor reveal · lighting check", tone: "vendor" },
          { time: "6:30 PM", title: "Cocktail hour", tone: "party" },
          { time: "7:30 PM", title: "Couple grand entry + first dance", tone: "party" },
          { time: "7:45 PM", title: "Welcome speech (father of bride)", tone: "party" },
          { time: "8:00 PM", title: "Dinner service (buffet, 4 stations)", tone: "meal" },
          { time: "9:00 PM", title: "Toasts + anand karaj wishes reel", tone: "party" },
          { time: "9:30 PM", title: "Cake cutting", tone: "party" },
          { time: "9:45 PM", title: "Couple dance + parents' dances", tone: "party" },
          { time: "10:15 PM", title: "Open dance floor", tone: "party" },
          { time: "11:30 PM", title: "Reception close · sparkler send-off", tone: "party" },
          { time: "12:00 AM", title: "Vendor strike · photo team delivery call", tone: "vendor" },
        ],
      },
    ],
  },
  {
    id: "hindu-south-2",
    name: "Hindu Wedding — South Indian",
    ceremony: "Hindu (South)",
    days: 2,
    durationNote: "2-day weekend",
    eventsCovered: ["Mehndi/Mylanchi", "Muhurtham Ceremony", "Reception"],
    summary: "Compressed 2-day flow anchored by a daytime muhurtham.",
    dayPlan: [],
  },
  {
    id: "sikh-2",
    name: "Sikh Wedding",
    ceremony: "Sikh",
    days: 2,
    durationNote: "2-day weekend",
    eventsCovered: ["Jaggo", "Anand Karaj", "Reception"],
    summary: "Gurdwara morning, evening reception.",
    dayPlan: [],
  },
  {
    id: "muslim-sunni-2",
    name: "Muslim Wedding — Sunni",
    ceremony: "Muslim (Sunni)",
    days: 2,
    durationNote: "2-day weekend",
    eventsCovered: ["Mehndi", "Nikah", "Walima"],
    summary: "Nikah day followed by walima reception.",
    dayPlan: [],
  },
  {
    id: "muslim-ismaili-1",
    name: "Muslim Wedding — Ismaili",
    ceremony: "Muslim (Ismaili)",
    days: 1,
    durationNote: "1-day ceremony",
    eventsCovered: ["Nikah", "Reception"],
    summary: "Single-day ceremony and reception flow.",
    dayPlan: [],
  },
  {
    id: "fusion-1",
    name: "Interfaith / Fusion",
    ceremony: "Interfaith / Fusion",
    days: 1,
    durationNote: "1-day hybrid",
    eventsCovered: ["Ceremony", "Reception"],
    summary: "Blended rituals; customizable time blocks.",
    dayPlan: [],
  },
];

// ─── Vendor Intros ─────────────────────────────────────────────────────

export type VendorIntroField =
  | "{couple}"
  | "{vendor}"
  | "{venue}"
  | "{style}"
  | "{price}"
  | "{count}"
  | "{planner}";

export type VendorIntroTemplate = {
  id: string;
  category: string;
  title: string;
  body: string;
  fields: VendorIntroField[];
};

export const VENDOR_INTRO_TEMPLATES: VendorIntroTemplate[] = [
  {
    id: "intro-photography",
    category: "Photography",
    title: "Photography Introduction",
    body: `Hi {couple},

I'd love to recommend {vendor} for your wedding photography. I've worked with them on {count} weddings and they consistently deliver stunning results.

{vendor} specializes in {style} and has experience at {venue} — they know the space well and can capture every angle beautifully.

Their typical range is {price} for a multi-event South Asian wedding.

Let me know if you'd like me to set up an intro call!

{planner}`,
    fields: ["{couple}", "{vendor}", "{count}", "{style}", "{venue}", "{price}", "{planner}"],
  },
  {
    id: "intro-decor",
    category: "Decor",
    title: "Decor Introduction",
    body: `Hi {couple},

Based on the mood board you shared, I want to introduce you to {vendor}. Their aesthetic — {style} — lines up with everything you loved at {venue}.

They typically come in around {price} for a {count}-event weekend at this scale.

Happy to set up a call this week if you want to walk through their portfolio together.

{planner}`,
    fields: ["{couple}", "{vendor}", "{style}", "{venue}", "{price}", "{count}", "{planner}"],
  },
  {
    id: "intro-hmua",
    category: "HMUA",
    title: "HMUA Introduction",
    body: `Hi {couple},

Want to introduce you to {vendor} for hair & makeup. They've worked with me on {count} brides and they're especially strong with {style} looks.

Their typical package for bride + bridal party across your events lands around {price}. Trial appointments are included.

Let me know if I should set up a trial booking.

{planner}`,
    fields: ["{couple}", "{vendor}", "{count}", "{style}", "{price}", "{planner}"],
  },
];

// ─── Budgets ───────────────────────────────────────────────────────────

export type BudgetSlice = {
  category: string;
  pct: number;
  amount: number; // precomputed for the anchor total
  note?: string;
};

export type BudgetTemplate = {
  id: string;
  name: string;
  total: number;
  days: string;
  slices: BudgetSlice[];
};

export const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    id: "budget-200",
    name: "$200K South Asian Wedding",
    total: 200000,
    days: "3-day weekend",
    slices: [
      { category: "Photography & Video", pct: 10, amount: 20000 },
      { category: "Decor & Florals", pct: 25, amount: 50000, note: "Higher than Western weddings by design" },
      { category: "Catering", pct: 20, amount: 40000, note: "Multi-event, multi-cuisine" },
      { category: "Venue & Room Blocks", pct: 15, amount: 30000 },
      { category: "Entertainment (DJ, Dhol, Live)", pct: 5, amount: 10000 },
      { category: "HMUA (Bride + Party)", pct: 3, amount: 6000 },
      { category: "Stationery & Signage", pct: 2, amount: 4000 },
      { category: "Outfits & Jewelry", pct: 8, amount: 16000 },
      { category: "Transportation & Logistics", pct: 3, amount: 6000 },
      { category: "Planner Fee", pct: 7, amount: 14000 },
      { category: "Contingency", pct: 2, amount: 4000 },
    ],
  },
  {
    id: "budget-100",
    name: "$100K Wedding",
    total: 100000,
    days: "2-day",
    slices: [
      { category: "Photography & Video", pct: 11, amount: 11000 },
      { category: "Decor & Florals", pct: 22, amount: 22000 },
      { category: "Catering", pct: 22, amount: 22000 },
      { category: "Venue", pct: 18, amount: 18000 },
      { category: "Entertainment", pct: 6, amount: 6000 },
      { category: "HMUA", pct: 4, amount: 4000 },
      { category: "Outfits", pct: 7, amount: 7000 },
      { category: "Planner Fee", pct: 7, amount: 7000 },
      { category: "Contingency", pct: 3, amount: 3000 },
    ],
  },
  {
    id: "budget-500",
    name: "$500K+ Luxury Wedding",
    total: 500000,
    days: "4-day destination",
    slices: [
      { category: "Photography & Video", pct: 8, amount: 40000 },
      { category: "Decor & Florals", pct: 30, amount: 150000, note: "Multi-venue installations" },
      { category: "Catering", pct: 18, amount: 90000 },
      { category: "Venue & Room Blocks", pct: 16, amount: 80000 },
      { category: "Entertainment", pct: 6, amount: 30000 },
      { category: "HMUA", pct: 3, amount: 15000 },
      { category: "Stationery", pct: 2, amount: 10000 },
      { category: "Outfits & Jewelry", pct: 6, amount: 30000 },
      { category: "Transportation", pct: 4, amount: 20000 },
      { category: "Planner Fee", pct: 5, amount: 25000 },
      { category: "Contingency", pct: 2, amount: 10000 },
    ],
  },
];

// ─── Checklists ────────────────────────────────────────────────────────

export type ChecklistPhase = {
  label: string; // "12 months out"
  items: string[];
};

export type ChecklistTemplate = {
  id: string;
  name: string;
  phases: ChecklistPhase[];
};

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: "checklist-12-month",
    name: "12-Month South Asian Wedding Checklist",
    phases: [
      {
        label: "12 months out",
        items: [
          "Lock wedding dates across both families",
          "Book venue(s) and secure room blocks",
          "Hire planner + get design brief signed",
          "Set master budget + draft category splits",
        ],
      },
      {
        label: "9 months out",
        items: [
          "Book pandit / officiant",
          "Book photographer + videographer",
          "Book caterer + confirm multi-event menus",
          "Begin outfit shopping (bride, groom, parents)",
        ],
      },
      {
        label: "6 months out",
        items: [
          "Book decor & floral lead",
          "Book DJ + dhol + live musicians",
          "Send save-the-dates",
          "Book HMUA for bride + wedding party",
          "Arrange baraat horse / car",
        ],
      },
      {
        label: "3 months out",
        items: [
          "Send formal invitations",
          "Order stationery suite (menus, programs, signage)",
          "Schedule mehndi artist + plan stations",
          "Finalize sangeet performances + rehearsals",
          "Order puja / ceremony items",
        ],
      },
      {
        label: "1 month out",
        items: [
          "Distribute run-of-show to all vendors",
          "Confirm final headcount with caterer",
          "Run HMUA trial",
          "Finalize seating charts + table assignments",
        ],
      },
      {
        label: "1 week out",
        items: [
          "Print day-of timelines",
          "Brief wedding party on ceremony roles",
          "Confirm arrival times with every vendor",
          "Pack emergency kit",
        ],
      },
      {
        label: "Day-of",
        items: [
          "Planner on-site 6 hrs before ceremony",
          "HMUA start times locked",
          "Baraat logistics confirmed",
          "Post-event sendoff plan executed",
        ],
      },
    ],
  },
];

// ─── Proposals ─────────────────────────────────────────────────────────

export type ProposalTemplate = {
  id: string;
  name: string;
  tier: "Full service" | "Partial" | "Day-of";
  summary: string;
  includes: string[];
  priceFrom: string;
};

export const PROPOSAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: "proposal-full",
    name: "Full-Service Planning",
    tier: "Full service",
    priceFrom: "From $28,000",
    summary:
      "End-to-end planning from engagement through sendoff. Best for couples with 9+ months of runway.",
    includes: [
      "Unlimited planning meetings + on-demand support",
      "Vendor sourcing and contract negotiation across every category",
      "Budget construction + ongoing management",
      "Design + mood board for every event",
      "Full day-of coordination team (3+ staff)",
      "Post-event vendor wrap-up",
    ],
  },
  {
    id: "proposal-partial",
    name: "Partial Planning",
    tier: "Partial",
    priceFrom: "From $14,000",
    summary:
      "Hand-off the heavy coordination lift while you keep curating the fun stuff.",
    includes: [
      "8 planning meetings",
      "Vendor management for decor, catering, photo",
      "Timeline build + run-of-show",
      "Day-of coordination team (2 staff)",
    ],
  },
  {
    id: "proposal-dayof",
    name: "Day-Of Coordination",
    tier: "Day-of",
    priceFrom: "From $5,500",
    summary:
      "Couples who've planned everything but need a pro to run the weekend.",
    includes: [
      "4 weeks lead-in + 3 strategy calls",
      "Vendor walk-through at venue",
      "Full run-of-show + vendor briefings",
      "On-site coordination across every event",
    ],
  },
];

// ─── My Templates ──────────────────────────────────────────────────────

export type MyTemplate = {
  id: string;
  name: string;
  source: string; // e.g. "Timeline · Hindu (North) 3-day"
  savedOn: string;
  note: string;
};

export const MY_TEMPLATES: MyTemplate[] = [
  {
    id: "mine-1",
    name: "Legacy Castle — 3-day ROS base",
    source: "Timeline · Hindu (North) 3-day",
    savedOn: "Mar 12, 2026",
    note: "Pre-baked load-in timings for The Legacy Castle. Re-use for NJ weddings at this venue.",
  },
  {
    id: "mine-2",
    name: "Photographer intro — Joseph Radhik",
    source: "Vendor intro · Photography",
    savedOn: "Feb 28, 2026",
    note: "Has his collaboration count + typical range prefilled.",
  },
  {
    id: "mine-3",
    name: "$250K budget split (NJ/NY)",
    source: "Budget · $200K base",
    savedOn: "Feb 14, 2026",
    note: "Tuned for NJ/NY vendor pricing — catering bumped to 22%.",
  },
  {
    id: "mine-4",
    name: "Destination add-on — Mexico",
    source: "Proposal · Full-service base",
    savedOn: "Jan 30, 2026",
    note: "Adds travel + lodging coordination line items to the full-service proposal.",
  },
];
