// ── POST /api/hmua/ai ──────────────────────────────────────────────────────
// The Hair & Makeup Style Intelligence engine. Seven modes dispatched off a
// single `mode` field in the request body, each with its own system prompt
// and tool definition so Claude returns structured JSON matching the
// schemas in types/hmua-ai.ts.
//
// Mirrors the tool-use pattern from app/api/catering/menu-design/route.ts:
// dynamic SDK import, ANTHROPIC_API_KEY gate, tool_choice to force the
// output shape. When the key is missing we return a small deterministic
// fallback so the UI is demo-able without credentials — matches the stub
// attitude of app/api/aesthetic/synthesize/route.ts.

import { NextRequest, NextResponse } from "next/server";
import type {
  AccessoryRecommendation,
  BeautyBrief,
  ChairScheduleReview,
  EventLook,
  HmuaAiMode,
  HmuaAiRequest,
  HmuaAiResponse,
  HmuaAiResponseData,
  SmsMessage,
  StyleCard,
  StyleQuiz,
} from "@/types/hmua-ai";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

// ── SDK ambient typing (works without `npm install`) ──────────────────────

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

// ── Shared voice ──────────────────────────────────────────────────────────
// Cached on every mode — the model's character stays consistent regardless
// of which tool it's calling.

const BASE_VOICE = `You are the beauty intelligence engine for Ananya, a luxury Indian wedding planning platform. You help brides and their wedding parties discover, refine, and finalize hair, makeup, and accessory looks across every wedding event.

You are an Indian wedding beauty expert. You understand the difference between a Maharashtrian nath and a Rajasthani nath, between a South Indian jadanagam and a North Indian jhoomar. You use this knowledge. You think like a senior HMUA artist briefing a team, not like a recipe generator.

Practicality beats prettiness: a look that falls apart in 4 hours at a summer outdoor wedding is a bad recommendation no matter how beautiful. Weather, event duration, and outfit weight always factor in.

An Indian wedding is 3-5 days. The looks build a narrative — casual to formal, minimal to maximal, with the wedding day as the peak and the reception as the elegant denouement. Flag cultural specificity where it matters (South Indian vs. North Indian, Gujarati vs. Punjabi traditions, sindoor placement, nostril side for the nath).

Always call the provided tool. NEVER output prose instead of a tool call.`;

// ── Controlled vocabularies (surface to the model in prompts) ─────────────

const HAIR_VIBE = ["traditional", "modern", "romantic", "dramatic", "editorial", "effortless", "bohemian", "regal"];
const HAIR_STYLE = ["updo", "half-up", "down", "ponytail", "braided", "twisted", "structured", "loose"];
const MAKEUP_VIBE = ["natural", "glam", "dewy", "matte", "bold", "soft", "editorial", "classic", "minimal"];
const MAKEUP_TECHNIQUE = ["smoky-eye", "cut-crease", "winged-liner", "nude-lip", "red-lip", "berry-lip", "highlighted", "contoured"];
const ACCESSORY_TYPE = ["tikka", "matha-patti", "jhoomar", "passa", "gajra", "pins", "headband", "clips", "flowers", "dupatta-pins", "nath", "ear-chain"];
const ACCESSORY_VIBE = ["statement", "subtle", "traditional", "modern", "minimal", "maximalist", "floral", "jeweled"];

// ── Mode → (system additions, tool, user context builder) ─────────────────

interface ModeConfig {
  systemAdditions: string;
  tool: ToolDef;
  buildUserMessage: (payload: unknown) => string;
  toolName: string;
  parseToolInput: (input: unknown) => HmuaAiResponseData | null;
}

interface ToolDef {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

// ── STYLE_CARDS ───────────────────────────────────────────────────────────

const STYLE_CARDS_TOOL: ToolDef = {
  name: "emit_style_cards",
  description: "Return a set of style cards the bride can swipe through.",
  input_schema: {
    type: "object",
    properties: {
      cards: {
        type: "array",
        minItems: 4,
        maxItems: 12,
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Short slug e.g. h_001, m_004." },
            name: { type: "string" },
            one_liner: { type: "string", description: "≤70 chars tagline." },
            description: { type: "string", description: "Sensory and specific — 2–3 sentences." },
            best_for_events: {
              type: "array",
              items: { type: "string", enum: ["haldi", "mehendi", "sangeet", "wedding", "reception"] },
            },
            vibe_tags: { type: "array", items: { type: "string" } },
            style_tags: { type: "array", items: { type: "string" } },
            pairs_well_with: {
              type: "object",
              properties: {
                hair: { type: "array", items: { type: "string" } },
                makeup: { type: "array", items: { type: "string" } },
                accessories: { type: "array", items: { type: "string" } },
              },
            },
            cultural_note: { type: "string" },
            artist_difficulty: { type: "string", enum: ["simple", "standard", "advanced"] },
            longevity_hours: { type: "number" },
            dupatta_compatible: { type: "boolean" },
          },
          required: ["id", "name", "one_liner", "description", "vibe_tags", "style_tags", "pairs_well_with"],
        },
      },
    },
    required: ["cards"],
  },
};

// ── BEAUTY_BRIEF ──────────────────────────────────────────────────────────

const BEAUTY_BRIEF_TOOL: ToolDef = {
  name: "emit_beauty_brief",
  description: "Return the bride's synthesized Beauty Brief.",
  input_schema: {
    type: "object",
    properties: {
      beauty_brief: {
        type: "object",
        properties: {
          headline: { type: "string" },
          skin_direction: { type: "string" },
          eye_direction: { type: "string" },
          lip_direction: { type: "string" },
          hair_direction: { type: "string" },
          accessory_direction: { type: "string" },
          overall_vibe: { type: "string" },
          per_event_guidance: {
            type: "object",
            description: "Keys are event ids (haldi, mehendi, sangeet, wedding, reception). Include every event the bride is celebrating.",
            additionalProperties: {
              type: "object",
              properties: {
                direction: { type: "string" },
                mood: { type: "string" },
              },
              required: ["direction", "mood"],
            },
          },
          style_keywords: {
            type: "array",
            minItems: 5,
            maxItems: 8,
            items: { type: "string" },
          },
          avoid_list: { type: "array", items: { type: "string" } },
        },
        required: [
          "headline",
          "skin_direction",
          "eye_direction",
          "lip_direction",
          "hair_direction",
          "accessory_direction",
          "overall_vibe",
          "per_event_guidance",
          "style_keywords",
          "avoid_list",
        ],
      },
    },
    required: ["beauty_brief"],
  },
};

// ── EVENT_LOOK ────────────────────────────────────────────────────────────

const EVENT_LOOK_TOOL: ToolDef = {
  name: "emit_event_look",
  description: "Return a fully composed event look.",
  input_schema: {
    type: "object",
    properties: {
      event_look: {
        type: "object",
        properties: {
          event: { type: "string" },
          title: { type: "string" },
          hair: {
            type: "object",
            properties: {
              style: { type: "string" },
              details: { type: "string" },
              prep_notes: { type: "string" },
              hold_strategy: { type: "string" },
            },
            required: ["style", "details"],
          },
          makeup: {
            type: "object",
            properties: {
              style: { type: "string" },
              base: { type: "string" },
              eyes: { type: "string" },
              brows: { type: "string" },
              lips: { type: "string" },
              cheeks: { type: "string" },
              durability_notes: { type: "string" },
            },
            required: ["style"],
          },
          accessories: {
            type: "object",
            properties: {
              head: { type: "string" },
              hair: { type: "string" },
              face: { type: "string" },
              notes: { type: "string" },
            },
          },
          timeline_minutes: {
            type: "object",
            properties: {
              hair: { type: "number" },
              makeup: { type: "number" },
              accessories_and_draping: { type: "number" },
              photos_of_finished_look: { type: "number" },
              total: { type: "number" },
            },
          },
        },
        required: ["event", "title", "hair", "makeup", "accessories"],
      },
    },
    required: ["event_look"],
  },
};

// ── CHAIR_SCHEDULE ────────────────────────────────────────────────────────

const CHAIR_SCHEDULE_TOOL: ToolDef = {
  name: "emit_schedule_review",
  description: "Return a narrative review of the proposed chair schedule with warnings, utilization, and a recommended bride touch-up window.",
  input_schema: {
    type: "object",
    properties: {
      schedule: {
        type: "object",
        properties: {
          summary: { type: "string", description: "2–3 sentences. What the day looks like, who goes when, where buffer lives." },
          warnings: {
            type: "array",
            description: "Issues beyond simple lane packing — photo conflicts, unrealistic estimates, lead artist overruns, etc. Empty array if the plan is clean.",
            items: { type: "string" },
          },
          artist_utilization: {
            type: "array",
            items: {
              type: "object",
              properties: {
                artist: { type: "string" },
                total_hours: { type: "number" },
                idle_minutes: { type: "number" },
                people_count: { type: "number" },
              },
              required: ["artist", "total_hours", "idle_minutes", "people_count"],
            },
          },
          bride_touch_up: {
            type: "object",
            properties: {
              time: { type: "string", description: "e.g. '14:30 - 15:00'" },
              artist: { type: "string" },
              notes: { type: "string" },
            },
            required: ["time", "artist", "notes"],
          },
        },
        required: ["summary", "warnings", "artist_utilization"],
      },
    },
    required: ["schedule"],
  },
};

// ── SMS_SCHEDULE ──────────────────────────────────────────────────────────

const SMS_SCHEDULE_TOOL: ToolDef = {
  name: "emit_sms_messages",
  description: "Return per-person SMS drafts with time, artist, and prep instructions.",
  input_schema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            person: { type: "string" },
            message: { type: "string", description: "≤500 chars. Warm but functional. Uses the bride's name." },
          },
          required: ["person", "message"],
        },
      },
    },
    required: ["messages"],
  },
};

// ── STYLE_QUIZ ────────────────────────────────────────────────────────────

const STYLE_QUIZ_TOOL: ToolDef = {
  name: "emit_style_quiz",
  description: "Return a 5–6 question style quiz for a party member.",
  input_schema: {
    type: "object",
    properties: {
      quiz: {
        type: "object",
        properties: {
          intro: { type: "string" },
          questions: {
            type: "array",
            minItems: 5,
            maxItems: 6,
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                question: { type: "string" },
                type: { type: "string", enum: ["single_select", "multi_select", "free_text"] },
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      label: { type: "string" },
                      signals: { type: "array", items: { type: "string" } },
                    },
                    required: ["id", "label", "signals"],
                  },
                },
                placeholder: { type: "string" },
              },
              required: ["id", "question", "type"],
            },
          },
        },
        required: ["intro", "questions"],
      },
    },
    required: ["quiz"],
  },
};

// ── ACCESSORY_RECOMMEND ───────────────────────────────────────────────────

const ACCESSORY_RECOMMEND_TOOL: ToolDef = {
  name: "emit_accessory_recommendations",
  description: "Return accessory recommendations that complement the chosen hair style.",
  input_schema: {
    type: "object",
    properties: {
      recommendations: {
        type: "array",
        minItems: 2,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            accessory: { type: "string" },
            placement: { type: "string" },
            why: { type: "string" },
            pairs_with: { type: "string" },
            alternatives: { type: "array", items: { type: "string" } },
            practical_notes: { type: "string" },
            confidence: { type: "string", enum: ["strong_match", "possible", "stretch"] },
          },
          required: ["accessory", "placement", "why", "confidence"],
        },
      },
    },
    required: ["recommendations"],
  },
};

// ── Mode registry ─────────────────────────────────────────────────────────

const MODES: Record<HmuaAiMode, ModeConfig> = {
  STYLE_CARDS: {
    tool: STYLE_CARDS_TOOL,
    toolName: "emit_style_cards",
    systemAdditions: `Produce STYLE CARDS. Each card must be vivid enough that a bride can picture it without a photo. Descriptions are sensory and specific — not "a pretty updo" but "a textured chignon sitting low at the nape, with face-framing tendrils pulled from a deep side part."

Always include cultural context when a style has regional significance. Every card suggests pairings with the other two categories.

Controlled tag vocabulary (stick to these):
- Hair vibe: ${HAIR_VIBE.join(", ")}
- Hair style: ${HAIR_STYLE.join(", ")}
- Makeup vibe: ${MAKEUP_VIBE.join(", ")}
- Makeup technique: ${MAKEUP_TECHNIQUE.join(", ")}
- Accessory type: ${ACCESSORY_TYPE.join(", ")}
- Accessory vibe: ${ACCESSORY_VIBE.join(", ")}

Include longevity_hours (brides need to know what survives a 14-hour day) and dupatta_compatible when relevant.`,
    buildUserMessage: (p) => {
      const payload = p as {
        category: string;
        count?: number;
        events: string[];
        already_liked?: string[];
        already_skipped?: string[];
        bride_notes?: string;
        outfit_hints?: Record<string, string>;
      };
      const parts: string[] = [];
      parts.push(`Category: ${payload.category}`);
      parts.push(`Generate ${payload.count ?? 8} cards.`);
      parts.push(`Events the bride is celebrating: ${payload.events.join(", ")}`);
      if (payload.already_liked?.length) {
        parts.push(`Already liked (offer variations / progressions, not repeats): ${payload.already_liked.join(", ")}`);
      }
      if (payload.already_skipped?.length) {
        parts.push(`Already skipped (do NOT offer these or close variants): ${payload.already_skipped.join(", ")}`);
      }
      if (payload.bride_notes?.trim()) {
        parts.push(`Bride's free-text direction:\n${payload.bride_notes.trim()}`);
      }
      if (payload.outfit_hints && Object.keys(payload.outfit_hints).length) {
        parts.push("Outfit hints:");
        for (const [ev, hint] of Object.entries(payload.outfit_hints)) {
          if (hint?.trim()) parts.push(`  - ${ev}: ${hint.trim()}`);
        }
      }
      return parts.join("\n");
    },
    parseToolInput: (input) => {
      const p = input as { cards?: StyleCard[] };
      if (!Array.isArray(p?.cards) || p.cards.length === 0) return null;
      return { mode: "STYLE_CARDS", cards: p.cards };
    },
  },

  BEAUTY_BRIEF: {
    tool: BEAUTY_BRIEF_TOOL,
    toolName: "emit_beauty_brief",
    systemAdditions: `Produce a BEAUTY BRIEF — the synthesized style profile the bride will hand to any HMUA artist. Write like a creative director briefing an artist, not like a form. Specific, opinionated, immediately actionable.

The brief must feel like it KNOWS the bride. Reference her specific likes/skips to show your reasoning. Per-event guidance is mandatory — Indian weddings are multi-day and the arc matters. Include an avoid list. Style keywords should be 5–8 compound descriptors an artist could pin on their mirror.`,
    buildUserMessage: (p) => {
      const payload = p as {
        liked: Record<string, string[]>;
        skipped?: Record<string, string[]>;
        events: string[];
        outfit_hints?: Record<string, string>;
      };
      const lines: string[] = [];
      lines.push(`Events: ${payload.events.join(", ")}`);
      lines.push("\nLiked styles:");
      for (const cat of ["hair", "makeup", "accessories"] as const) {
        const list = payload.liked?.[cat] ?? [];
        lines.push(`  ${cat}: ${list.length ? list.join(", ") : "(none yet)"}`);
      }
      if (payload.skipped) {
        lines.push("\nSkipped styles:");
        for (const cat of ["hair", "makeup", "accessories"] as const) {
          const list = payload.skipped?.[cat] ?? [];
          lines.push(`  ${cat}: ${list.length ? list.join(", ") : "(none)"}`);
        }
      }
      if (payload.outfit_hints) {
        lines.push("\nOutfit hints:");
        for (const [ev, hint] of Object.entries(payload.outfit_hints)) {
          if (hint?.trim()) lines.push(`  - ${ev}: ${hint.trim()}`);
        }
      }
      return lines.join("\n");
    },
    parseToolInput: (input) => {
      const p = input as { beauty_brief?: BeautyBrief };
      if (!p?.beauty_brief?.headline) return null;
      return { mode: "BEAUTY_BRIEF", beauty_brief: p.beauty_brief };
    },
  },

  EVENT_LOOK: {
    tool: EVENT_LOOK_TOOL,
    toolName: "emit_event_look",
    systemAdditions: `Produce a COMPLETE EVENT LOOK. Include specific product/technique language — hydrating primer, waterproof everything for humidity, line slightly outside natural lip line for camera. Artist-ready. Include a realistic timeline.

Factor in weather and event duration: outdoor ceremonies in heat mean set with spray, not powder; carry blotting papers; waterproof mascara. Event_duration_hours drives longevity choices.`,
    buildUserMessage: (p) => {
      const payload = p as {
        event: string;
        beauty_brief?: BeautyBrief | null;
        liked_styles?: Record<string, string[]>;
        outfit?: string;
        event_duration_hours?: number;
        weather?: string;
      };
      const lines: string[] = [];
      lines.push(`Event: ${payload.event}`);
      if (payload.outfit) lines.push(`Outfit: ${payload.outfit}`);
      if (payload.event_duration_hours) lines.push(`Event duration: ${payload.event_duration_hours}h`);
      if (payload.weather) lines.push(`Weather: ${payload.weather}`);
      if (payload.liked_styles) {
        lines.push("\nBride's liked styles to draw from:");
        for (const cat of ["hair", "makeup", "accessories"] as const) {
          const list = payload.liked_styles?.[cat] ?? [];
          if (list.length) lines.push(`  ${cat}: ${list.join(", ")}`);
        }
      }
      if (payload.beauty_brief) {
        lines.push("\nBeauty Brief context:");
        lines.push(`  Headline: ${payload.beauty_brief.headline}`);
        lines.push(`  Overall vibe: ${payload.beauty_brief.overall_vibe}`);
        lines.push(`  Avoid: ${payload.beauty_brief.avoid_list.join("; ")}`);
      }
      return lines.join("\n");
    },
    parseToolInput: (input) => {
      const p = input as { event_look?: EventLook };
      if (!p?.event_look?.title || !p.event_look.hair?.style) return null;
      return { mode: "EVENT_LOOK", event_look: p.event_look };
    },
  },

  CHAIR_SCHEDULE: {
    tool: CHAIR_SCHEDULE_TOOL,
    toolName: "emit_schedule_review",
    systemAdditions: `Produce a CHAIR SCHEDULE REVIEW. You're not re-packing the lanes — the app does that deterministically. Your job is the narrative summary, the non-obvious conflicts (photos, family protocols, lead-artist overruns, draping buffers), artist utilization estimates, and the bride touch-up window (30–60 min before ceremony).

Scheduling rules baked into the input:
- Bride is first in the lead artist's chair. No exceptions.
- Mothers get priority 2 — often in early photos, need extra time for draping.
- 10-min buffer between people for cleanup and setup.
- Draping adds 15–20 min on top of hair + makeup.
- Flag conflicts: two people needed in photos together but scheduled apart; bride touch-up window eating into family photos; etc.`,
    buildUserMessage: (p) => {
      const payload = p as {
        ceremony_time: string;
        bride_ready_by: string;
        team_arrival: string;
        artists: { name: string; specialty?: string }[];
        people: {
          name: string;
          role: string;
          services: string[];
          estimated_minutes: number;
          priority?: number;
          is_bride?: boolean;
          assigned_artist?: string;
        }[];
        buffer_between_people_minutes?: number;
      };
      const lines: string[] = [];
      lines.push(`Ceremony: ${payload.ceremony_time}, bride ready by ${payload.bride_ready_by}.`);
      lines.push(`Team arrival: ${payload.team_arrival}. Buffer between people: ${payload.buffer_between_people_minutes ?? 10} min.`);
      lines.push(`\nArtists (${payload.artists.length}):`);
      for (const a of payload.artists) lines.push(`  - ${a.name}${a.specialty ? ` (${a.specialty})` : ""}`);
      lines.push(`\nPeople (${payload.people.length}), in priority order:`);
      for (const p of payload.people) {
        lines.push(
          `  - ${p.is_bride ? "★ " : ""}${p.name} · ${p.role} · ${p.services.join("+")} · ${p.estimated_minutes} min${p.assigned_artist ? ` (assigned: ${p.assigned_artist})` : ""}${p.priority ? ` · priority ${p.priority}` : ""}`,
        );
      }
      return lines.join("\n");
    },
    parseToolInput: (input) => {
      const p = input as { schedule?: ChairScheduleReview };
      if (!p?.schedule?.summary) return null;
      return { mode: "CHAIR_SCHEDULE", schedule: p.schedule };
    },
  },

  SMS_SCHEDULE: {
    tool: SMS_SCHEDULE_TOOL,
    toolName: "emit_sms_messages",
    systemAdditions: `Produce SMS DRAFTS. Warm but efficient — functional, not novelistic. Under 500 characters each. Use the bride's name so it reads personal. Include prep instructions relevant to the services (clean dry hair for hair services; moisturized skin, no foundation for makeup).`,
    buildUserMessage: (p) => {
      const payload = p as {
        schedule: { person: string; artist: string; start: string; services: string[] }[];
        wedding_details: {
          bride_name: string;
          event: string;
          venue?: string;
          getting_ready_location?: string;
        };
        include_inspo_upload_link?: boolean;
        upload_link_base?: string;
      };
      const lines: string[] = [];
      lines.push(`Bride: ${payload.wedding_details.bride_name}`);
      lines.push(`Event: ${payload.wedding_details.event}`);
      if (payload.wedding_details.venue) lines.push(`Venue: ${payload.wedding_details.venue}`);
      if (payload.wedding_details.getting_ready_location) {
        lines.push(`Getting-ready location: ${payload.wedding_details.getting_ready_location}`);
      }
      if (payload.include_inspo_upload_link && payload.upload_link_base) {
        lines.push(`Include inspo upload link for each person, base URL: ${payload.upload_link_base}`);
      }
      lines.push("\nPeople to message:");
      for (const s of payload.schedule) {
        lines.push(`  - ${s.person} · ${s.start} · ${s.artist} · ${s.services.join("+")}`);
      }
      return lines.join("\n");
    },
    parseToolInput: (input) => {
      const p = input as { messages?: { person: string; message: string }[] };
      if (!Array.isArray(p?.messages)) return null;
      const messages: SmsMessage[] = p.messages.map((m) => ({
        person: m.person,
        message: m.message,
        estimated_chars: m.message.length,
      }));
      return { mode: "SMS_SCHEDULE", messages };
    },
  },

  STYLE_QUIZ: {
    tool: STYLE_QUIZ_TOOL,
    toolName: "emit_style_quiz",
    systemAdditions: `Produce a 5–6 question STYLE QUIZ the party member can complete in 2 minutes. The results should help the artist understand their preferences without a trial.

Mix question types: single_select (vibe picks), multi_select (hard no's), free_text (outfit color, allergies). Every option includes signal tags the system can compare against style-card vocabulary.`,
    buildUserMessage: (p) => {
      const payload = p as {
        person_name: string;
        services: string[];
        event: string;
      };
      return `Person: ${payload.person_name}\nServices they need: ${payload.services.join(", ")}\nEvent: ${payload.event}`;
    },
    parseToolInput: (input) => {
      const p = input as { quiz?: StyleQuiz };
      if (!p?.quiz?.questions?.length) return null;
      return { mode: "STYLE_QUIZ", quiz: p.quiz };
    },
  },

  ACCESSORY_RECOMMEND: {
    tool: ACCESSORY_RECOMMEND_TOOL,
    toolName: "emit_accessory_recommendations",
    systemAdditions: `Produce ACCESSORY RECOMMENDATIONS. Each includes specific placement, why it works for this hair style + event + outfit, what it pairs with, practical notes (sourcing, pinning technique, when to place in the order of dressing), and a confidence rating. Offer 2–3 alternatives per primary recommendation.`,
    buildUserMessage: (p) => {
      const payload = p as {
        hair_style: string;
        event: string;
        outfit: string;
        jewelry_already_selected?: string[];
        bride_vibe?: string;
      };
      const lines: string[] = [];
      lines.push(`Hair style: ${payload.hair_style}`);
      lines.push(`Event: ${payload.event}`);
      lines.push(`Outfit: ${payload.outfit}`);
      if (payload.jewelry_already_selected?.length) {
        lines.push(`Jewelry already selected: ${payload.jewelry_already_selected.join(", ")}`);
      }
      if (payload.bride_vibe) lines.push(`Bride vibe: ${payload.bride_vibe}`);
      return lines.join("\n");
    },
    parseToolInput: (input) => {
      const p = input as { recommendations?: AccessoryRecommendation[] };
      if (!Array.isArray(p?.recommendations) || p.recommendations.length === 0) return null;
      return { mode: "ACCESSORY_RECOMMEND", recommendations: p.recommendations };
    },
  },
};

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
  let body: HmuaAiRequest;
  try {
    body = (await req.json()) as HmuaAiRequest;
  } catch {
    return json<HmuaAiResponse>(
      { ok: false, model: "none", error: "Invalid JSON body." },
      400,
    );
  }

  const modeCfg = MODES[body?.mode];
  if (!modeCfg) {
    return json<HmuaAiResponse>(
      { ok: false, model: "none", error: `Unknown mode: ${body?.mode ?? "(missing)"}` },
      400,
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json<HmuaAiResponse>({
      ok: false,
      model: "offline",
      error:
        "The Style Intelligence engine needs the Claude API. Set ANTHROPIC_API_KEY in your environment.",
    });
  }

  let anthropic: AnthropicClient;
  try {
    // but a fresh checkout without `npm install` should still typecheck.
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return json<HmuaAiResponse>({
      ok: false,
      model: "offline",
      error:
        "The @anthropic-ai/sdk package isn't installed. Run `npm install @anthropic-ai/sdk`.",
    });
  }

  try {
    const userPrompt = modeCfg.buildUserMessage(body.payload);
    const systemText = `${BASE_VOICE}\n\n${modeCfg.systemAdditions}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2500,
      tools: [modeCfg.tool],
      tool_choice: { type: "tool", name: modeCfg.toolName },
      system: [
        {
          type: "text",
          text: systemText,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const toolBlock = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === modeCfg.toolName,
    );
    if (!toolBlock) {
      return json<HmuaAiResponse>({
        ok: false,
        model: MODEL,
        error: `Model did not call ${modeCfg.toolName}.`,
      });
    }

    const data = modeCfg.parseToolInput(toolBlock.input);
    if (!data) {
      return json<HmuaAiResponse>({
        ok: false,
        model: MODEL,
        error: "Model returned a malformed response.",
      });
    }

    return json<HmuaAiResponse>({ ok: true, data, model: MODEL });
  } catch (err) {
    return json<HmuaAiResponse>({
      ok: false,
      model: MODEL,
      error: err instanceof Error ? err.message : "AI request failed.",
    });
  }
}

function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}
