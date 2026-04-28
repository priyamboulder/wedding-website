// ── POST /api/seating/experience-suggest ───────────────────────────────
// AI-powered experience recommender for the Floor Plan → Experience
// Zones tab. Takes event context (type, guest demographics, budget, vibe,
// venue, must-haves, elements already placed) and returns a curated set
// of experience recommendations grouped by zone.
//
// Mirrors app/api/seating/suggest/route.ts: dynamic SDK import, tool_use
// for structured output, deterministic offline fallback when no API key.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

// ── SDK typing ──────────────────────────────────────────────────────────
type MessageContentBlock =
  | { type: "tool_use"; name: string; input: unknown }
  | { type: "text"; text: string }
  | { type: string; [key: string]: unknown };

interface MessagesCreateResponse {
  content: MessageContentBlock[];
}

interface AnthropicClient {
  messages: {
    create: (args: unknown) => Promise<MessagesCreateResponse>;
  };
}

// ── Types ───────────────────────────────────────────────────────────────
export type BudgetTier = "standard" | "premium" | "luxury";
export type VenueType =
  | "indoor_banquet"
  | "outdoor_lawn"
  | "beach"
  | "farmhouse"
  | "hotel_ballroom"
  | "rooftop";

export interface ExperienceSuggestRequestBody {
  eventId: string;
  eventLabel: string;
  guestCount: number;
  guestDemographics?: string;
  budgetTier: BudgetTier;
  venueType: VenueType;
  vibes: string[];
  mustHaves?: string;
  existingElements: Array<{ id: string; name: string; category: string }>;
}

export interface SuggestedExperience {
  id: string;
  name: string;
  description: string;
  zone: string; // human-readable zone name (e.g. "Entertainment Corner")
  libraryId?: string; // optional — preferred library element to place
  suggestedWidth?: number;
  suggestedHeight?: number;
  staffing?: number;
  reasoning?: string;
}

export interface ExperienceSuggestResponse {
  ok: boolean;
  zones?: Array<{
    name: string;
    description: string;
    experiences: SuggestedExperience[];
  }>;
  summary?: string;
  model?: string;
  error?: string;
}

// ── Tool definition ────────────────────────────────────────────────────
const TOOL = {
  name: "emit_experience_plan",
  description:
    "Return a curated set of experience recommendations grouped by themed zone. Every experience should be actionable — the user will click to add it to the floor plan.",
  input_schema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "One short paragraph overview of the overall experience plan.",
      },
      zones: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: {
              type: "string",
              description: "Sensory description of what this zone feels like.",
            },
            experiences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  description: { type: "string" },
                  zone: { type: "string" },
                  libraryId: {
                    type: "string",
                    description:
                      "Pick the best matching library id from: main_stage, secondary_stage, runway, green_room, head_table, dance_floor, dj_booth, live_band_stage, speaker_left, speaker_right, mixing_desk, dhol_spot, buffet_station, live_cooking, mobile_bar, fixed_bar, dessert_display, tea_coffee, water_station, paan_station, ice_cream_cart, serving_pass, photo_booth, selfie_wall, henna_station, caricature_artist, tarot_booth, games_zone, hookah_lounge, cigar_lounge, kids_play_area, video_wall, fireworks_zone, live_art, memory_wall, guestbook, gift_table, favor_display, door, registration_desk, coat_check, restroom_sign, power_drop, av_tech_table, vendor_staging, valet_station, mandap, floral_arrangement, centerpiece_display, lighting_rig, red_carpet, entrance_arch, swing_jhoola, lounge_seating. Leave blank if no direct match.",
                  },
                  suggestedWidth: { type: "number" },
                  suggestedHeight: { type: "number" },
                  staffing: { type: "number" },
                  reasoning: { type: "string" },
                },
                required: ["id", "name", "description", "zone"],
              },
            },
          },
          required: ["name", "description", "experiences"],
        },
      },
    },
    required: ["summary", "zones"],
  },
} as const;

function buildPrompt(body: ExperienceSuggestRequestBody): string {
  const budgetLabel = {
    standard: "Standard",
    premium: "Premium",
    luxury: "Luxury",
  }[body.budgetTier];
  const venueLabel = {
    indoor_banquet: "Indoor Banquet Hall",
    outdoor_lawn: "Outdoor Lawn",
    beach: "Beach",
    farmhouse: "Farmhouse",
    hotel_ballroom: "Hotel Ballroom",
    rooftop: "Rooftop",
  }[body.venueType];

  return `You are the experience-design assistant for an Indian wedding planning app. The couple is planning their ${body.eventLabel}.

Event context:
- Event: ${body.eventLabel}
- Guest count: ${body.guestCount}${body.guestDemographics ? ` · ${body.guestDemographics}` : ""}
- Budget tier: ${budgetLabel}
- Venue: ${venueLabel}
- Vibe: ${body.vibes.join(", ") || "not specified"}
${body.mustHaves ? `- Must-haves: ${body.mustHaves}` : ""}

Elements already on the floor plan (don't duplicate):
${
  body.existingElements.length > 0
    ? body.existingElements
        .map((e) => `- ${e.name} (${e.category})`)
        .join("\n")
    : "(none yet)"
}

Recommend a rich set of experiences grouped by themed zone. Think:
- Cocktail & welcome zone (bar stations, chaat counters, welcome drinks)
- Entertainment corner (photo booths, selfie walls, live art, games)
- Dinner experience (live cooking, dietary options, dessert theater, paan)
- Dance & performance (dance floor sizing, live band, effects)
- Kids zone (supervised play, themed food, entertainment)
- Décor & ambiance (mandap, lighting, florals, swing/jhoola)

For each experience, include:
- A short name
- A one-sentence sensory description (what guests see/taste/feel)
- Which zone it belongs to
- A library id (from the catalog) if a direct match exists
- Suggested dimensions in feet
- Suggested staffing count if relevant
- A short reasoning tied to the event context (vibe, budget, guest count, venue)

Emphasize experiences that are distinctively Indian (paan, chaat counter, dhol, mehendi, mithai, jhoola), plus modern crowd-pleasers (360 photo booth, signature cocktails, live stations). Scale the recommendations to the budget tier — luxury means more premium touches, standard means practical crowd favorites.

Call the emit_experience_plan tool with your complete plan.`;
}

// ── Offline fallback ───────────────────────────────────────────────────
function offlineFallback(
  body: ExperienceSuggestRequestBody,
): ExperienceSuggestResponse {
  const { guestCount, budgetTier } = body;
  const danceSize = guestCount < 60 ? 18 : guestCount < 100 ? 22 : 28;
  const bars = budgetTier === "luxury" ? 2 : 1;
  const stations = budgetTier === "luxury" ? 5 : budgetTier === "premium" ? 4 : 3;
  const zones: ExperienceSuggestResponse["zones"] = [
    {
      name: "Cocktail & Welcome Zone",
      description:
        "Warm arrival — signature cocktails, chaat counter, and passed hors d'oeuvres set a welcoming tone.",
      experiences: [
        {
          id: "welcome_bar",
          name: "Signature Cocktail Bar",
          description:
            "Custom drinks named after the couple; mocktails for non-drinkers; water/nimbu pani.",
          zone: "Cocktail & Welcome Zone",
          libraryId: "mobile_bar",
          suggestedWidth: 10,
          suggestedHeight: 4,
          staffing: 2,
        },
        {
          id: "chaat_counter",
          name: "Live Chaat Counter",
          description:
            "Panipuri, bhel puri, sev puri — always a crowd favorite at Indian weddings.",
          zone: "Cocktail & Welcome Zone",
          libraryId: "live_cooking",
          suggestedWidth: 8,
          suggestedHeight: 6,
          staffing: 2,
        },
      ],
    },
    {
      name: "Entertainment Corner",
      description:
        "Photo opportunities and interactive activities keep the energy high between dinner courses.",
      experiences: [
        {
          id: "360_photo",
          name: "360 Slow-Mo Video Booth",
          description:
            "Guests step on a rotating platform; cameras sweep around them for shareable footage.",
          zone: "Entertainment Corner",
          libraryId: "photo_booth",
          suggestedWidth: 8,
          suggestedHeight: 8,
          staffing: 1,
        },
        {
          id: "selfie_wall",
          name: "Neon Selfie Wall",
          description:
            "LED backdrop with the couple's wedding hashtag — instant Instagram moments.",
          zone: "Entertainment Corner",
          libraryId: "selfie_wall",
          suggestedWidth: 10,
          suggestedHeight: 2,
        },
      ],
    },
    {
      name: "Dinner Experience",
      description: `${stations} live cooking stations + dessert theater + paan counter`,
      experiences: [
        {
          id: "tandoor_station",
          name: "Tandoor Live Station",
          description: "Fresh naans and kebabs pulled from a live tandoor.",
          zone: "Dinner Experience",
          libraryId: "live_cooking",
          suggestedWidth: 8,
          suggestedHeight: 6,
          staffing: 2,
        },
        {
          id: "paan_station",
          name: "Paan Counter at Exit",
          description: "8+ varieties of paan — the perfect Indian wedding farewell.",
          zone: "Dinner Experience",
          libraryId: "paan_station",
          suggestedWidth: 4,
          suggestedHeight: 4,
          staffing: 1,
        },
        {
          id: "dessert_theater",
          name: "Dessert Theater",
          description:
            "Flambéed gulab jamun, liquid nitrogen kulfi, chocolate fountain.",
          zone: "Dinner Experience",
          libraryId: "dessert_display",
          suggestedWidth: 10,
          suggestedHeight: 4,
          staffing: 2,
        },
      ],
    },
    {
      name: "Dance & Performance",
      description: `Sized for ${guestCount} guests with room for the couple's first dance.`,
      experiences: [
        {
          id: "dance_floor",
          name: `Dance Floor (${danceSize}×${danceSize} ft)`,
          description: `Sized for ~${Math.floor((danceSize * danceSize) / 7)} dancers — comfortable for this guest count.`,
          zone: "Dance & Performance",
          libraryId: "dance_floor",
          suggestedWidth: danceSize,
          suggestedHeight: danceSize,
        },
        {
          id: "dhol",
          name: "Live Dhol for Couple's Entrance",
          description:
            "Traditional dhol player welcomes the couple into the reception.",
          zone: "Dance & Performance",
          libraryId: "dhol_spot",
          suggestedWidth: 4,
          suggestedHeight: 4,
          staffing: 1,
        },
      ],
    },
  ];
  if (bars > 1) {
    zones[0].experiences.push({
      id: "second_bar",
      name: "Mocktail & Whiskey Lounge",
      description: "Dedicated lounge bar for mocktails and curated whiskey.",
      zone: "Cocktail & Welcome Zone",
      libraryId: "mobile_bar",
      suggestedWidth: 8,
      suggestedHeight: 4,
      staffing: 1,
    });
  }
  return {
    ok: true,
    model: "offline-fallback",
    zones,
    summary: `Draft experience plan for ${guestCount} guests — ${stations} food stations, ${bars} bars, ${danceSize}×${danceSize} ft dance floor. Set ANTHROPIC_API_KEY for a tailored plan.`,
  };
}

// ── Route handler ──────────────────────────────────────────────────────
export async function POST(request: Request) {
  let body: ExperienceSuggestRequestBody;
  try {
    body = (await request.json()) as ExperienceSuggestRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." } as ExperienceSuggestResponse,
      { status: 400 },
    );
  }

  if (!body?.eventId || !body?.guestCount) {
    return NextResponse.json(
      {
        ok: false,
        error: "eventId and guestCount are required.",
      } as ExperienceSuggestResponse,
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(offlineFallback(body));
  }

  let anthropic: AnthropicClient;
  try {
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return NextResponse.json(offlineFallback(body));
  }

  try {
    const prompt = buildPrompt(body);
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4500,
      tools: [TOOL],
      tool_choice: { type: "tool", name: TOOL.name },
      system: [
        {
          type: "text",
          text: "You are the experience-design assistant for an Indian wedding planning app. You call the emit_experience_plan tool with a complete, specific plan that reflects the event context. Prefer concrete details (station names, specific activities, specific dimensions) over generic suggestions. Never output prose outside the tool call.",
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const toolBlock = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === TOOL.name,
    );
    if (!toolBlock) {
      return NextResponse.json({
        ok: false,
        model: MODEL,
        error: "Model did not produce an experience plan.",
      } as ExperienceSuggestResponse);
    }

    const input = toolBlock.input as {
      summary?: string;
      zones?: ExperienceSuggestResponse["zones"];
    };

    return NextResponse.json({
      ok: true,
      model: MODEL,
      zones: input.zones ?? [],
      summary: input.summary ?? "",
    } as ExperienceSuggestResponse);
  } catch (err) {
    return NextResponse.json({
      ok: false,
      model: MODEL,
      error: err instanceof Error ? err.message : "AI request failed.",
    } as ExperienceSuggestResponse);
  }
}
