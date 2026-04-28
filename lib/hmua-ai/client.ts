// ── HMUA AI client ──────────────────────────────────────────────────────────
// Typed fetch wrapper over POST /api/hmua/ai. Every UI surface that calls
// the Style Intelligence engine goes through these helpers so the mode →
// response-shape mapping stays honest.

import type {
  AccessoryRecommendRequest,
  AccessoryRecommendation,
  BeautyBrief,
  BeautyBriefRequest,
  ChairScheduleRequest,
  ChairScheduleReview,
  EventLook,
  EventLookRequest,
  HmuaAiMode,
  HmuaAiResponse,
  SmsMessage,
  SmsScheduleRequest,
  StyleCard,
  StyleCardsRequest,
  StyleQuiz,
  StyleQuizRequest,
} from "@/types/hmua-ai";

class AiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiError";
  }
}

async function call<TPayload, TResponseKey extends string, TResponseValue>(
  mode: HmuaAiMode,
  payload: TPayload,
  expectedKey: TResponseKey,
): Promise<TResponseValue> {
  let res: Response;
  try {
    res = await fetch("/api/hmua/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, payload }),
    });
  } catch (err) {
    throw new AiError(err instanceof Error ? err.message : "Network error");
  }

  const body = (await res.json()) as HmuaAiResponse;
  if (!body.ok || !body.data) {
    throw new AiError(body.error ?? "AI request failed");
  }
  if (body.data.mode !== mode) {
    throw new AiError(`Mode mismatch: asked for ${mode}, got ${body.data.mode}`);
  }
  const value = (body.data as unknown as Record<string, unknown>)[expectedKey];
  if (value === undefined) {
    throw new AiError(`Missing ${expectedKey} in response.`);
  }
  return value as TResponseValue;
}

export function generateStyleCards(payload: StyleCardsRequest): Promise<StyleCard[]> {
  return call<StyleCardsRequest, "cards", StyleCard[]>(
    "STYLE_CARDS",
    payload,
    "cards",
  );
}

export function synthesizeBeautyBrief(payload: BeautyBriefRequest): Promise<BeautyBrief> {
  return call<BeautyBriefRequest, "beauty_brief", BeautyBrief>(
    "BEAUTY_BRIEF",
    payload,
    "beauty_brief",
  );
}

export function composeEventLook(payload: EventLookRequest): Promise<EventLook> {
  return call<EventLookRequest, "event_look", EventLook>(
    "EVENT_LOOK",
    payload,
    "event_look",
  );
}

export function reviewChairSchedule(payload: ChairScheduleRequest): Promise<ChairScheduleReview> {
  return call<ChairScheduleRequest, "schedule", ChairScheduleReview>(
    "CHAIR_SCHEDULE",
    payload,
    "schedule",
  );
}

export function draftSmsMessages(payload: SmsScheduleRequest): Promise<SmsMessage[]> {
  return call<SmsScheduleRequest, "messages", SmsMessage[]>(
    "SMS_SCHEDULE",
    payload,
    "messages",
  );
}

export function generateStyleQuiz(payload: StyleQuizRequest): Promise<StyleQuiz> {
  return call<StyleQuizRequest, "quiz", StyleQuiz>(
    "STYLE_QUIZ",
    payload,
    "quiz",
  );
}

export function recommendAccessories(
  payload: AccessoryRecommendRequest,
): Promise<AccessoryRecommendation[]> {
  return call<AccessoryRecommendRequest, "recommendations", AccessoryRecommendation[]>(
    "ACCESSORY_RECOMMEND",
    payload,
    "recommendations",
  );
}

export { AiError };
