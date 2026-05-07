// ── POST /api/catering/event-menu-suggest ─────────────────────────────────
// Generates a complete AI-drafted menu for a single wedding event (haldi,
// mehendi, sangeet, wedding, reception, late-night) given the couple's
// quiz answers and the event metadata. Returns dishes by course
// (starters / mains / desserts / beverages), each with BOTH a standard
// culinary name and a creative/personalised name, plus a one-paragraph
// rationale and a per-course presentation note tied to the service style.
//
// This is the simpler couple-facing endpoint that backs the "Generate AI
// menu draft" button on the Menu Builder tab. It is distinct from
// /api/catering/menu-design which handles incremental edits to an
// existing MenuStudio (different data model). Keep both — the studio
// route is for surgical edits, this route is for the cold-start "give
// me a complete menu I can edit from."
//
// Uses Claude Sonnet 4.6 with tool use for structured output, ephemeral
// prompt cache on the system prompt, and a deterministic stub fallback
// so the UI still renders something useful when ANTHROPIC_API_KEY is
// missing or the SDK isn't installed.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

// ── Minimal ambient typing for the SDK (so this file compiles even if
// @anthropic-ai/sdk hasn't been installed yet). Same pattern as the
// other catering routes.

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

// ── Request / response shapes ─────────────────────────────────────────────

export interface EventMenuSuggestRequest {
  event_label: string; // "Haldi" | "Mehendi" | "Sangeet" | "Wedding" | "Reception" | "Late Night"
  guest_count: number;
  service_style: string; // free-text — "Grand buffet + live stations"
  dietary_split: string; // "60% veg · 30% non-veg · 10% vegan/Jain"
  cuisine_keywords: string[]; // from the Taste & Vision tab
  must_haves: string[]; // dishes that MUST be on the menu
  dont_serve: string[]; // dishes / categories to avoid
  vibe: string; // optional overall vibe sentence
}

export interface AIDishSuggestion {
  section: "starters" | "mains" | "desserts" | "beverages";
  name_standard: string;
  name_creative: string;
  description: string;
  diet: "Veg" | "Non" | "Vegan" | "Jain" | "GF" | "Halal" | "Nut-free";
  service: "Buffet" | "Live station" | "Passed" | "Plated" | "Family-style";
  why_note: string;
}

export interface EventMenuSuggestResponse {
  ok: boolean;
  rationale: string; // 2-3 sentence "why this menu fits"
  presentation_notes: string; // service-style-specific staging guidance
  dishes: AIDishSuggestion[];
  model: string;
  error?: string;
}

// ── System prompt (cacheable) ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior Indian-wedding caterer and menu designer for a luxury wedding-planning platform called Ananya. A couple has shared their cuisine direction, must-haves, please-don'ts, and the service style for a single event. Your job is to draft a COMPLETE menu for that event that they can edit from.

Hard rules:
1. Call the propose_event_menu tool. NEVER output prose instead of a tool call.
2. Give 4–8 starters, 4–8 mains, 2–4 desserts, 2–4 beverages — scaled to event type and guest count. A late-night menu doesn't need 8 starters; a wedding reception probably does.
3. Every dish needs BOTH a standard culinary name (e.g. "Paneer Tikka") AND a creative/personal name (e.g. "Nani's Garden Grill" or "The Golden Char"). The creative name should evoke memory, place, or sensation — never twee or cringe. If you can't find a strong creative name, give a poetic but restrained one.
4. dietary tag MUST be one of: "Veg" | "Non" | "Vegan" | "Jain" | "GF" | "Halal" | "Nut-free". Pick the MOST restrictive accurate one.
5. service MUST be one of: "Buffet" | "Live station" | "Passed" | "Plated" | "Family-style". Match the event's service_style — if the event is "Grand buffet + live stations", most dishes are Buffet, the showpieces are Live station, the appetisers may be Passed.
6. EVERY must-have dish from the couple's list MUST appear in the dishes array — verbatim or with their wording in name_standard.
7. NEVER include a please-don't dish or anything that obviously violates it.
8. rationale = 2–3 sentences in a caterer's voice: why this set fits the event. No marketing fluff, no emojis.
9. presentation_notes = 2–3 sentences on staging the menu for the given service_style: which dishes go on the buffet vs. which need a live station vs. which should be passed; garnish, plating, station theme cues. Concrete, not abstract.
10. why_note per dish = ≤24 words on why this specific dish belongs at this specific event. Couples read this; make it specific.

Caterer's instincts:
- Pacing: arrival → starters → mains → desserts → late-night. Each course has its own job.
- Balance: fried vs fresh, veg vs non-veg, heavy vs light, spice gradient.
- Cultural anchoring: be specific — "Hyderabadi biryani" is stronger than "biryani". "Bengali rasgulla" is stronger than "rasgulla".
- Dietary coverage: if the dietary_split says 10% Jain/vegan, the menu must have real Jain/vegan options at every course, not token gestures.`;

const TOOL_DEFINITION = {
  name: "propose_event_menu",
  description:
    "Return a complete drafted menu for one event, with rationale and presentation notes.",
  input_schema: {
    type: "object" as const,
    properties: {
      rationale: {
        type: "string",
        description: "2–3 sentences. Why this set fits this event.",
      },
      presentation_notes: {
        type: "string",
        description:
          "2–3 sentences on staging given the event's service_style: which dishes go on the buffet vs. live stations vs. passed, plus garnish/plating direction.",
      },
      dishes: {
        type: "array",
        minItems: 8,
        maxItems: 24,
        items: {
          type: "object",
          properties: {
            section: {
              type: "string",
              enum: ["starters", "mains", "desserts", "beverages"],
            },
            name_standard: { type: "string" },
            name_creative: { type: "string" },
            description: { type: "string", description: "≤140 chars." },
            diet: {
              type: "string",
              enum: ["Veg", "Non", "Vegan", "Jain", "GF", "Halal", "Nut-free"],
            },
            service: {
              type: "string",
              enum: ["Buffet", "Live station", "Passed", "Plated", "Family-style"],
            },
            why_note: {
              type: "string",
              description: "≤24 words. Why this dish belongs at this event.",
            },
          },
          required: [
            "section",
            "name_standard",
            "name_creative",
            "description",
            "diet",
            "service",
            "why_note",
          ],
        },
      },
    },
    required: ["rationale", "presentation_notes", "dishes"],
  },
};

// ── Context projection ────────────────────────────────────────────────────

function projectContext(body: EventMenuSuggestRequest): string {
  const lines: string[] = [];
  lines.push(`## Event: ${body.event_label}`);
  lines.push(`Guests: ${body.guest_count}`);
  lines.push(`Service style: ${body.service_style}`);
  lines.push(`Dietary split: ${body.dietary_split}`);
  if (body.cuisine_keywords.length > 0) {
    lines.push(`Cuisine keywords: ${body.cuisine_keywords.join(", ")}`);
  }
  if (body.vibe) lines.push(`Vibe: ${body.vibe}`);

  lines.push("\n## Must-have dishes (MUST appear)");
  if (body.must_haves.length === 0) {
    lines.push("(none)");
  } else {
    for (const m of body.must_haves) lines.push(`- ${m}`);
  }

  lines.push("\n## Please don't serve");
  if (body.dont_serve.length === 0) {
    lines.push("(none)");
  } else {
    for (const d of body.dont_serve) lines.push(`- ${d}`);
  }

  lines.push(
    "\nDraft a complete menu for this event. Call propose_event_menu with the structured output.",
  );
  return lines.join("\n");
}

// ── Stub fallback ─────────────────────────────────────────────────────────
// Returned when ANTHROPIC_API_KEY is missing. Picks a sensible base menu
// keyed by event type so the UI still renders dishes the couple can edit.

function stubMenu(body: EventMenuSuggestRequest): EventMenuSuggestResponse {
  const baseByEvent: Record<string, AIDishSuggestion[]> = {
    Haldi: [
      mk("starters", "Mini Samosa Chaat", "The Sunshine Bite", "Crisp samosa cubes, tangy tamarind, mint, beaten yogurt.", "Veg", "Passed", "Light, hand-held; sets a daytime tone."),
      mk("starters", "Seasonal Fruit Chaat", "Mango-Day Mood", "Ripe mango, pomegranate, chaat masala, lime.", "Vegan", "Passed", "Cools the kitchen-warm haldi space."),
      mk("mains", "Pav Bhaji Station", "The Bombay Bench", "Buttered bhaji, soft pav, raw onion, lemon.", "Veg", "Live station", "Comfort food the family already loves."),
      mk("mains", "Litti Chokha", "Nani's Earth Plate", "Roasted wheat balls, smoked aubergine mash, ghee.", "Veg", "Buffet", "Earthy, rooted — fits the haldi's pre-wedding feel."),
      mk("desserts", "Jalebi with Rabri", "The Golden Spiral", "Hot jalebi soaked in saffron rabri, served fresh.", "Veg", "Live station", "Theatrical, warm — best made in front of guests."),
      mk("beverages", "Aam Panna", "The Green Mango Cool", "Raw-mango cooler with cumin and black salt.", "Vegan", "Buffet", "Bright, savoury, age-old — refreshes the room."),
      mk("beverages", "Kesar Lassi", "Saffron in a Cup", "Yogurt churned with saffron, cardamom, sugar.", "Veg", "Buffet", "Classic, indulgent, a haldi staple."),
    ],
    Mehendi: [
      mk("starters", "Tandoori Paneer Tikka", "The Garden Char", "Yoghurt-marinated paneer, tandoor-blistered, mint chutney.", "Veg", "Passed", "Easy hand-held bite while henna dries."),
      mk("starters", "Galouti Kebab", "Lucknow's Whisper", "Slow-pounded lamb kebab, saffron, on a mini sheermal.", "Halal", "Passed", "Soft enough to eat one-handed; family lore."),
      mk("mains", "Pani Puri Bar", "The Burst", "Six waters, three fillings, infinite combinations.", "Veg", "Live station", "Interactive — guests stand, laugh, get sticky."),
      mk("mains", "Awadhi Biryani", "The Long-Cooked Rice", "Sealed dum biryani, kewra, fried onions.", "Halal", "Buffet", "Centrepiece dish the elders will judge you on."),
      mk("desserts", "Phirni in Earthen Pots", "The Cool Clay", "Set rice pudding, rose, pistachio, in mitti ke kasore.", "Veg", "Buffet", "Visual, traditional, eats well in heat."),
      mk("beverages", "Rose Falooda", "The Pink Rope", "Rose syrup, sweet basil, vermicelli, milk, ice cream.", "Veg", "Live station", "Theatrical glasses, cooling, photogenic."),
    ],
    Sangeet: [
      mk("starters", "Live Chaat Counter", "Six-Way Chaat", "Aloo tikki, papdi, dahi bhalla, sev puri, ragda, pani puri.", "Veg", "Live station", "Sangeet centrepiece — guests graze, dance, return."),
      mk("starters", "Chicken Malai Tikka", "The Cream-Char", "Cream-yoghurt marinated chicken, mild, tandoor-finished.", "Non", "Passed", "Rich, mild, easy bite between dance numbers."),
      mk("mains", "Paneer Pasanda", "The Stuffed Diamond", "Paneer triangles, nut filling, tomato-cashew gravy.", "Veg", "Buffet", "Satisfying veg main without the basics."),
      mk("mains", "Lamb Rogan Josh", "Kashmir's Crimson", "Slow-braised lamb, deggi mirch, fennel, ratan jot.", "Halal", "Buffet", "Deep, warming, evening-appropriate."),
      mk("desserts", "Gulab Jamun", "Soft Sweet Sun", "Khoya dumplings in cardamom-rose syrup, served warm.", "Veg", "Buffet", "The crowd-pleaser. Less sweet on request."),
      mk("desserts", "Kulfi Falooda Sticks", "The Frozen Stick", "Mango or pistachio kulfi, falooda noodle, rose drizzle.", "Veg", "Passed", "Hand-held, photogenic, cools the dance floor."),
      mk("beverages", "Saffron-Gin Sour", "The Yellow Pour", "Gin, saffron syrup, lemon, egg white, cardamom dust.", "Halal", "Live station", "Signature cocktail moment behind the bar."),
      mk("beverages", "Kala-Khatta Cooler", "The Plum Black", "Jamun pulp, black salt, lemon — soda finish.", "Vegan", "Buffet", "Childhood-flavour mocktail, no alcohol."),
    ],
    Wedding: [
      mk("starters", "Hara Bhara Kebab", "The Green Earth", "Spinach, peas, paneer, mint, light cumin crust.", "Veg", "Passed", "Vegetarian opener that doesn't apologise."),
      mk("starters", "Murgh Malai Tikka", "Nawab's Cream", "Cream cheese-marinated chicken, white pepper, kasuri methi.", "Non", "Passed", "Rich, mild, photographs beautifully."),
      mk("starters", "Pani Puri Live Counter", "Six Waters", "Crisp shells, pudina, imli, jaljeera, hing waters.", "Veg", "Live station", "Interactive moment for the cocktail hour."),
      mk("starters", "Dahi Kebab", "The Yogurt Set", "Hung curd, saffron, gram flour, pistachio crust.", "Veg", "Passed", "Cooling, regional — a quiet showpiece."),
      mk("mains", "Dal Makhani", "Mom's Slow Pot", "Black dal, butter, cream, slow-simmered overnight.", "Veg", "Buffet", "Family non-negotiable — served exactly as Mom makes it."),
      mk("mains", "Hyderabadi Dum Biryani", "The Sealed Pot", "Long-grain basmati, lamb, kewra, fried onion, mint.", "Halal", "Buffet", "Wedding centrepiece — opened tableside."),
      mk("mains", "Jain Paneer Lababdar", "The No-Root Royal", "Tomato-cashew, ginger-free, onion-free, paneer cubes.", "Jain", "Buffet", "Real Jain main — not a vegetable side."),
      mk("mains", "Methi Malai Mushroom", "The Creamed Field", "Fenugreek-cream gravy, button mushroom, garam masala.", "Veg", "Buffet", "Vegan-on-request; rich without dairy load."),
      mk("desserts", "Gulab Jamun (less sweet)", "Mom's Restraint", "Khoya, cardamom syrup, dialed back 20% on sugar.", "Veg", "Buffet", "Family request — exact recipe, lower sweetness."),
      mk("desserts", "Rasmalai", "The Soft Cloud", "Saffron-cardamom milk, soft chenna patties.", "Veg", "Buffet", "Cool counterpoint to the gulab jamun's warmth."),
      mk("beverages", "Masala Chai Counter", "The Roadside Pour", "Strong chai, ginger, cardamom, served in kulhads.", "Veg", "Live station", "Late-evening warm pour."),
      mk("beverages", "Mango-Kala-Namak Cooler", "The Pickle Pull", "Aam panna riff, salted, cumin-rim.", "Vegan", "Buffet", "Mocktail with grown-up depth."),
    ],
    Reception: [
      mk("starters", "Goat Cheese Phulka Roll", "The Soft Map", "Mini phulka, beetroot hummus, goat cheese, micro herbs.", "Veg", "Passed", "Cocktail-hour bridge between East and West."),
      mk("starters", "Fish Tikka Amritsari", "Punjab on a Skewer", "Carom-marinated fish, tandoor, lemon, raw onion.", "Halal", "Passed", "Reception needs a strong non-veg passed bite."),
      mk("mains", "Chicken Chettinad", "Pepper from the South", "Black pepper, curry leaf, coconut, chicken on bone.", "Halal", "Buffet", "Adds southern depth to a north-leaning menu."),
      mk("mains", "Bharwa Baingan", "The Stuffed Eggplant", "Baby aubergine, peanut-coconut masala, slow-cooked.", "Vegan", "Buffet", "Vegan main with real character."),
      mk("desserts", "Kulfi Trio", "Three Sticks", "Pistachio, malai, mango — sticks, not bowls.", "Veg", "Passed", "Late-evening hand-held finish."),
      mk("beverages", "Saffron Champagne", "The Toast", "Champagne with a saffron-honey float, kept simple.", "Halal", "Live station", "Toast moment — kept understated."),
    ],
    "Late Night": [
      mk("starters", "Mini Vada Pav", "The Bombay Two-Bite", "Spicy potato pakora, soft pav, garlic-chilli chutney.", "Veg", "Passed", "Drunk-food classic; eats well at 1am."),
      mk("mains", "Cheese Maggi Counter", "The College Bowl", "Quick Maggi, melted cheese, choice of toppings.", "Veg", "Live station", "Universal post-midnight comfort."),
      mk("mains", "Chicken Tikka Slider", "The Tandoor Bun", "Tandoor chicken, mint mayo, soft pav.", "Non", "Passed", "Hand-held protein for the dance floor."),
      mk("desserts", "Hot Chocolate Shots", "The Last Pour", "Dark chocolate, chilli edge, served warm.", "Veg", "Passed", "Soft landing as the dance ends."),
    ],
  };

  const dishes =
    baseByEvent[body.event_label] ?? baseByEvent["Wedding"]!;

  return {
    ok: true,
    rationale: `This is a stub menu — set ANTHROPIC_API_KEY to get a draft tuned to your specific quiz answers, must-haves, and dietary split. The dishes below are sensible defaults for a ${body.event_label.toLowerCase()} of ${body.guest_count} guests.`,
    presentation_notes: `Built for "${body.service_style}". Buffet items go on the long counter — labelled with creative names, lit warm. Live stations need their own moment (chef visible, ingredients on display). Passed items move on bamboo trays through the cocktail hour.`,
    dishes,
    model: "stub",
  };
}

function mk(
  section: AIDishSuggestion["section"],
  name_standard: string,
  name_creative: string,
  description: string,
  diet: AIDishSuggestion["diet"],
  service: AIDishSuggestion["service"],
  why_note: string,
): AIDishSuggestion {
  return {
    section,
    name_standard,
    name_creative,
    description,
    diet,
    service,
    why_note,
  };
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`ai:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }
  let body: EventMenuSuggestRequest;
  try {
    body = (await req.json()) as EventMenuSuggestRequest;
  } catch {
    return NextResponse.json<EventMenuSuggestResponse>(
      {
        ok: false,
        rationale: "",
        presentation_notes: "",
        dishes: [],
        model: "none",
        error: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  if (!body?.event_label || !body.guest_count) {
    return NextResponse.json<EventMenuSuggestResponse>(
      {
        ok: false,
        rationale: "",
        presentation_notes: "",
        dishes: [],
        model: "none",
        error: "event_label and guest_count are required.",
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<EventMenuSuggestResponse>(stubMenu(body));
  }

  let anthropic: AnthropicClient;
  try {
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return NextResponse.json<EventMenuSuggestResponse>(stubMenu(body));
  }

  try {
    const userPrompt = projectContext(body);
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3500,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "propose_event_menu" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const toolBlock = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === "propose_event_menu",
    );
    if (!toolBlock) {
      return NextResponse.json<EventMenuSuggestResponse>({
        ok: false,
        rationale: "",
        presentation_notes: "",
        dishes: [],
        model: MODEL,
        error: "Model did not call propose_event_menu.",
      });
    }

    const input = toolBlock.input as {
      rationale?: string;
      presentation_notes?: string;
      dishes?: AIDishSuggestion[];
    };

    return NextResponse.json<EventMenuSuggestResponse>({
      ok: true,
      rationale: input.rationale?.trim() ?? "",
      presentation_notes: input.presentation_notes?.trim() ?? "",
      dishes: input.dishes ?? [],
      model: MODEL,
    });
  } catch (err) {
    return NextResponse.json<EventMenuSuggestResponse>({
      ok: false,
      rationale: "",
      presentation_notes: "",
      dishes: [],
      model: MODEL,
      error:
        err instanceof Error ? err.message : "Menu suggestion request failed.",
    });
  }
}
