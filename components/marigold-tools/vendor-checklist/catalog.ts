// Vendor catalog. Each entry maps to which events it serves and gives
// quantity guidance, booking window, and 3 starter "questions to ask".
// Used by VendorChecklistTool to assemble required/recommended/optional tiers.

export type EventKey =
  | "engagement"
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "baraat"
  | "ceremony"
  | "civil"
  | "cocktail"
  | "reception"
  | "brunch";

export type Tier = "required" | "recommended" | "optional";

export type VendorDef = {
  id: string;
  category: string;
  serves: EventKey[] | "all";
  quantity: (ctx: Ctx) => string;
  bookingWindow: string;
  questions: string[];
  tier: (ctx: Ctx) => Tier | null; // null = exclude
};

export type Ctx = {
  events: EventKey[];
  separateVenues: boolean;
  planner: "full" | "day-of" | "none";
  guests: "under-100" | "100-200" | "200-300" | "300-plus";
};

const EVENT_LABELS: Record<EventKey, string> = {
  engagement: "engagement",
  haldi: "haldi",
  mehendi: "mehendi",
  sangeet: "sangeet",
  baraat: "baraat",
  ceremony: "ceremony",
  civil: "civil",
  cocktail: "cocktail",
  reception: "reception",
  brunch: "brunch",
};

export function eventLabel(k: EventKey) {
  return EVENT_LABELS[k];
}

const has = (ctx: Ctx, ...evs: EventKey[]) =>
  evs.some((e) => ctx.events.includes(e));

export const CATALOG: VendorDef[] = [
  {
    id: "venue",
    category: "Venue(s)",
    serves: "all",
    quantity: (ctx) =>
      ctx.separateVenues
        ? `${Math.max(2, Math.min(ctx.events.length, 3))} venues across the weekend`
        : `1 venue covering all ${ctx.events.length} event${ctx.events.length === 1 ? "" : "s"}`,
    bookingWindow: "Book 12–18 months out for peak season (Oct–Mar in DFW)",
    questions: [
      "What's the alcohol policy and corkage fee for self-supplied bar?",
      "Can we bring outside Indian catering, and what's the kitchen setup?",
      "What's the noise ordinance cutoff — and is there a rentable extension?",
    ],
    tier: () => "required",
  },
  {
    id: "catering",
    category: "Catering",
    serves: "all",
    quantity: (ctx) =>
      ctx.events.length >= 4
        ? "Often 2 caterers — one for haldi/mehendi, one for the reception"
        : "1 caterer who can handle every meal in your weekend",
    bookingWindow: "Book 9–12 months out, sample tastings 4–6 months out",
    questions: [
      "What's your per-head pricing for buffet vs. plated, and what's included?",
      "Do you handle dietary requests (Jain, vegan, allergies) without surcharges?",
      "What's the minimum guest count, and what happens if we go over?",
    ],
    tier: () => "required",
  },
  {
    id: "photo",
    category: "Photography",
    serves: "all",
    quantity: (ctx) =>
      ctx.events.length >= 5
        ? "2 photographers recommended for 5+ events"
        : "1 lead photographer + 1 second shooter for the ceremony day",
    bookingWindow: "Book 10–14 months out, the good ones go fast",
    questions: [
      "What's included in the package — albums, raws, edited count, turnaround?",
      "Have you shot Indian weddings before, and can we see a full gallery?",
      "What's your travel + extra-day rate for a 3-day weekend?",
    ],
    tier: () => "required",
  },
  {
    id: "video",
    category: "Videography",
    serves: "all",
    quantity: () => "1 lead videographer + 1 assist for ceremony day",
    bookingWindow: "Book 8–12 months out — often packaged with photo",
    questions: [
      "Do you deliver a highlight reel, full-length film, AND raw footage?",
      "What's your turnaround time, and do you charge for revisions?",
      "Can we see a full ceremony cut, not just a 90-second teaser?",
    ],
    tier: (ctx) => (ctx.events.length >= 3 ? "recommended" : "optional"),
  },
  {
    id: "mehendi",
    category: "Mehendi Artists",
    serves: ["mehendi"],
    quantity: (ctx) =>
      ctx.guests === "under-100"
        ? "1 lead artist + 1 assistant for the bride and close family"
        : ctx.guests === "100-200"
          ? "2 artists — one for the bride, one for guest stations"
          : "3+ artists if you want guest mehendi — it's a 4-hr line otherwise",
    bookingWindow: "Book 4–6 months out, peak season 8 months",
    questions: [
      "Is your henna 100% natural — no chemical 'black henna'?",
      "How long do you stay, and is the bride's intricate work included?",
      "Do you bring stools, lighting, and supplies, or do we set up?",
    ],
    tier: (ctx) => (has(ctx, "mehendi") ? "required" : null),
  },
  {
    id: "hmua",
    category: "Hair and Makeup",
    serves: ["engagement", "haldi", "mehendi", "sangeet", "ceremony", "reception"],
    quantity: (ctx) => {
      const eventCount = ctx.events.filter((e) =>
        ["engagement", "haldi", "mehendi", "sangeet", "ceremony", "reception"].includes(e),
      ).length;
      return eventCount >= 4
        ? "1 lead artist for the bride across all events + 1 assistant for family"
        : "1 lead + 1 assistant for the ceremony and reception minimum";
    },
    bookingWindow: "Book 6–10 months out, trial 1–2 months before",
    questions: [
      "Is the trial included, and what's the per-event vs. all-day rate?",
      "Do you do South Asian skin tones and ceremony-style braids/buns?",
      "Will you stay for touch-ups, and at what hourly rate?",
    ],
    tier: () => "required",
  },
  {
    id: "dj",
    category: "DJ",
    serves: ["sangeet", "baraat", "cocktail", "reception"],
    quantity: () => "1 DJ + emcee combo, plus a sound tech for big rooms",
    bookingWindow: "Book 6–9 months out",
    questions: [
      "Do you have a Bollywood/bhangra catalog and read a multigenerational room?",
      "Can you handle baraat dhol coordination with the live percussion?",
      "What's the overage rate, and do you bring backup gear?",
    ],
    tier: (ctx) =>
      has(ctx, "sangeet", "reception", "cocktail") ? "required" : null,
  },
  {
    id: "live-music",
    category: "Live Musicians",
    serves: ["baraat", "ceremony", "cocktail"],
    quantity: () =>
      "1–2 dhol players for baraat, optional sitar/tabla duo for ceremony",
    bookingWindow: "Book 4–6 months out",
    questions: [
      "Do you have a baraat package with dhol + speakers + amp?",
      "Can you coordinate with the DJ for handoff into the procession?",
      "What's the travel fee outside DFW metro?",
    ],
    tier: (ctx) =>
      has(ctx, "baraat") ? "recommended" : has(ctx, "ceremony") ? "optional" : null,
  },
  {
    id: "decor",
    category: "Décor and Florals",
    serves: "all",
    quantity: (ctx) =>
      ctx.events.length >= 4
        ? "1 décor lead handling all events + a separate mandap specialist"
        : "1 décor team for ceremony + reception, lighter setups for satellite events",
    bookingWindow: "Book 8–12 months out, design lock 4–6 months",
    questions: [
      "What's the per-event vs. weekend-package pricing breakdown?",
      "Do you build mandaps in-house, or contract that out?",
      "How does setup/breakdown work between back-to-back events?",
    ],
    tier: () => "required",
  },
  {
    id: "lighting",
    category: "Lighting",
    serves: ["sangeet", "ceremony", "reception"],
    quantity: () => "1 lighting designer + 1 tech for venues without house lighting",
    bookingWindow: "Book 4–6 months out",
    questions: [
      "Do you do uplighting, gobos, and stage washes — or just basic uplights?",
      "Can you sync a programmed cue list with the DJ for sangeet performances?",
      "What's included in setup vs. day-of operation?",
    ],
    tier: (ctx) =>
      has(ctx, "sangeet", "reception") ? "recommended" : "optional",
  },
  {
    id: "transport",
    category: "Transportation",
    serves: "all",
    quantity: (ctx) =>
      ctx.guests === "300-plus"
        ? "Shuttle service (2–3 buses) between hotels + venues"
        : ctx.guests === "200-300"
          ? "1–2 shuttles for guests + private cars for family"
          : "Private car service for couple and parents",
    bookingWindow: "Book 3–4 months out",
    questions: [
      "Do you have ADA-accessible vehicles, and Indian-wedding experience?",
      "What's the hourly minimum and overtime structure?",
      "Can you do baraat horse coordination, or refer a partner?",
    ],
    tier: (ctx) =>
      ctx.guests === "300-plus" || ctx.guests === "200-300"
        ? "recommended"
        : "optional",
  },
  {
    id: "stationery",
    category: "Invitations and Stationery",
    serves: "all",
    quantity: () =>
      "1 designer for save-the-dates, full invite suite, and day-of paper",
    bookingWindow: "Book 6–9 months out — invites mail 8–10 weeks before",
    questions: [
      "Do you do bilingual invites (English + Hindi/Gujarati/Tamil/Punjabi)?",
      "What's the price per suite at 100 vs. 200 vs. 300?",
      "Do you handle assembly, addressing, and mailing, or just print?",
    ],
    tier: () => "required",
  },
  {
    id: "officiant",
    category: "Officiant",
    serves: ["civil"],
    quantity: () => "1 licensed officiant",
    bookingWindow: "Book 2–4 months out",
    questions: [
      "Are you licensed in Texas, and will you handle marriage license filing?",
      "Can you do a personalized ceremony script vs. a template?",
      "How long is the rehearsal, and is it included?",
    ],
    tier: (ctx) => (has(ctx, "civil") ? "required" : null),
  },
  {
    id: "pandit",
    category: "Pandit / Priest",
    serves: ["ceremony"],
    quantity: () => "1 pandit familiar with your family's regional tradition",
    bookingWindow: "Book 3–6 months out",
    questions: [
      "Which tradition do you specialize in, and do you do bilingual narration?",
      "What's included — samagri, fire setup, English explanations?",
      "Have you worked with our specific community/temple before?",
    ],
    tier: (ctx) => (has(ctx, "ceremony") ? "required" : null),
  },
  {
    id: "photo-booth",
    category: "Photo Booth",
    serves: ["sangeet", "reception"],
    quantity: () => "1 booth with attendant + props",
    bookingWindow: "Book 2–4 months out",
    questions: [
      "Do prints come included, and what's the digital gallery option?",
      "Can you customize backdrops/props for our sangeet theme?",
      "What's the hourly rate for an extended booth window?",
    ],
    tier: (ctx) => (has(ctx, "sangeet", "reception") ? "optional" : null),
  },
  {
    id: "valet",
    category: "Valet",
    serves: ["sangeet", "ceremony", "reception"],
    quantity: (ctx) =>
      ctx.guests === "300-plus"
        ? "Full valet team (8–12 attendants) for ceremony + reception"
        : "4–6 attendants per event",
    bookingWindow: "Book 2–3 months out",
    questions: [
      "Is insurance and damage coverage included in the per-car rate?",
      "How do you handle peak arrival rushes — is there a queue plan?",
      "What's the tip structure, and do you bring podiums + signage?",
    ],
    tier: (ctx) =>
      ctx.guests === "300-plus" || ctx.guests === "200-300"
        ? "recommended"
        : "optional",
  },
  {
    id: "accommodations",
    category: "Accommodations Coordinator",
    serves: "all",
    quantity: () => "1 hotel block coordinator (often through the planner)",
    bookingWindow: "Book 9–12 months out for hotel room blocks",
    questions: [
      "What's the room block minimum, and what's the attrition penalty?",
      "Can you negotiate a welcome bag delivery and shuttle pickup?",
      "How do you handle late-arriving international guests?",
    ],
    tier: (ctx) => {
      if (ctx.planner !== "none") return "optional";
      return ctx.guests === "300-plus" || ctx.guests === "200-300"
        ? "recommended"
        : "optional";
    },
  },
  {
    id: "planner",
    category: "Wedding Planner / Coordinator",
    serves: "all",
    quantity: (ctx) =>
      ctx.planner === "full"
        ? "1 full-service planner with assistant for the weekend"
        : ctx.planner === "day-of"
          ? "1 day-of coordinator covering ceremony + reception"
          : "Skipping — but you'll be the de facto planner",
    bookingWindow:
      "Full planner: book 12–18 months out · Day-of: 4–6 months out",
    questions: [
      "What's included — vendor management, timeline, family-of-bride wrangling?",
      "How many weddings do you book per weekend, and who's our point person?",
      "What happens if you're sick on the day — who's the backup?",
    ],
    tier: (ctx) =>
      ctx.planner === "full"
        ? "required"
        : ctx.planner === "day-of"
          ? "recommended"
          : "optional",
  },
];

export function categorize(ctx: Ctx) {
  const required: VendorDef[] = [];
  const recommended: VendorDef[] = [];
  const optional: VendorDef[] = [];
  for (const v of CATALOG) {
    const t = v.tier(ctx);
    if (t === "required") required.push(v);
    else if (t === "recommended") recommended.push(v);
    else if (t === "optional") optional.push(v);
  }
  return { required, recommended, optional };
}
