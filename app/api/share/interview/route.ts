// ── /api/share/interview ────────────────────────────────────────────────────
// One turn of the conversational interview that powers the AI-assisted path
// at /share/interview. The client posts the running transcript plus the
// latest user message; we ask Claude Sonnet for the next assistant turn.
//
// The model is instructed to wrap up after 8–12 exchanges with a final
// message — we surface that as `done: true` in the response, which the client
// uses to navigate the couple to the draft preview.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type {
  EventTag,
  InterviewMessage,
} from "@/types/share-shaadi";
import { EVENT_TAG_LABEL } from "@/types/share-shaadi";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Sentinel string the model emits when it has enough material. Kept verbose
// and unmistakable so it survives small phrasing drift.
const FINAL_TOKEN = "[INTERVIEW_COMPLETE]";

interface RequestBody {
  basics: {
    brideName: string;
    groomName: string;
    weddingMonth?: string | null;
    venue?: string;
    city?: string;
    guestCount?: number | null;
    events?: EventTag[];
  };
  transcript: InterviewMessage[];
  userMessage: string;
}

function systemPrompt(basics: RequestBody["basics"]): string {
  const eventsList =
    basics.events && basics.events.length
      ? basics.events.map((e) => EVENT_TAG_LABEL[e]).join(", ")
      : "not specified yet";
  const guestStr = basics.guestCount ? `${basics.guestCount}` : "unspecified";
  return `You are an editorial interviewer for The Marigold, a luxury wedding platform for the South Asian diaspora. You're writing a Real Wedding feature.

Voice: warm, curious, culturally fluent. Like a smart friend who happens to write for Vogue Weddings. You know what a baraat is. You know the difference between a North Indian and South Indian ceremony. You don't need things explained to you.

Interview style:
- Conversational, not formal. Use their names.
- Ask one question at a time. Never list multiple questions.
- Follow the thread of what they say — don't stick to a script.
- Get specific details: "What color was the lehenga?" not "Tell me about your outfit."
- Get emotional moments: "What did your dad's face look like during the vidaai?"
- Get honest takes: "What almost went wrong?" or "What surprised you?"
- After 8–12 exchanges, wrap up naturally: "I think I have everything I need to write something beautiful. Let me put this together for you." Then add ${FINAL_TOKEN} on its own line so we know to move on. Do not emit the token before you've genuinely asked enough questions.

Context about this couple:
- Names: ${basics.brideName || "Bride"} & ${basics.groomName || "Partner"}
- Date: ${basics.weddingMonth ?? "unspecified"}
- Venue: ${basics.venue || "unspecified"}, ${basics.city || ""}
- Guests: ${guestStr}
- Events: ${eventsList}

Open with the big picture if the transcript is empty — otherwise continue the thread.`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`ai:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }
  try {
    const body = (await req.json()) as RequestBody;
    if (!body.userMessage?.trim() && body.transcript.length === 0) {
      // Allow an empty userMessage on the very first call so the assistant
      // can open the conversation. After that, require something.
    } else if (!body.userMessage?.trim()) {
      return NextResponse.json(
        { error: "userMessage is required" },
        { status: 400 },
      );
    }

    if (!anthropic) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 503 },
      );
    }

    // Build the message thread for Claude. Anthropic SDK expects alternating
    // user/assistant turns, beginning with user. We add the latest message at
    // the end if present.
    const turns: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of body.transcript) {
      turns.push({ role: m.role === "assistant" ? "assistant" : "user", content: m.content });
    }
    if (body.userMessage?.trim()) {
      turns.push({ role: "user", content: body.userMessage.trim() });
    } else if (turns.length === 0) {
      // First call with no user message — give the model a small kick so it
      // emits the opening question.
      turns.push({
        role: "user",
        content:
          "(start the interview — they just landed on the page and haven't said anything yet.)",
      });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: systemPrompt(body.basics),
      messages: turns,
    });

    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    const isFinal = raw.includes(FINAL_TOKEN);
    const visible = raw.replace(FINAL_TOKEN, "").trim();

    return NextResponse.json({
      content: visible,
      done: isFinal,
    });
  } catch (e) {
    console.error("share interview error:", e);
    return NextResponse.json(
      { error: "Interview turn failed" },
      { status: 500 },
    );
  }
}
