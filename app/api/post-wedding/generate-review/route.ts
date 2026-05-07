import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

interface GenerateReviewRequest {
  tone?: "default" | "shorter" | "detailed";
  vendor: { name: string; role: string };
  answers: {
    overall: "amazing" | "great" | "good" | "mixed" | "poor";
    highlights: string[];
    specificMoment: string;
    improvement: string;
    oneSentence: string;
  };
}

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const HIGHLIGHT_LABELS: Record<string, string> = {
  exceeded_expectations: "they exceeded every expectation we had",
  great_with_family: "how naturally they worked with our families",
  handled_chaos: "the way they handled the chaos of the day",
  amazing_detail: "their attention to detail",
  flexible: "how flexible and accommodating they were",
  captured_emotions: "the way they captured real emotions",
  above_and_beyond: "they went above and beyond every step of the way",
  on_time_prepared: "how prepared and on-time they always were",
  great_with_kids: "how they worked with the kids",
  made_us_comfortable: "the way they made us feel so comfortable",
  stunning_editing: "their stunning editing and finishing work",
  fast_delivery: "how quickly they delivered everything",
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(`ai:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }
  try {
    const body = (await request.json()) as GenerateReviewRequest;
    if (!body.vendor?.name?.trim()) {
      return NextResponse.json({ error: "Vendor is required" }, { status: 400 });
    }

    const { vendor, answers, tone = "default" } = body;

    const highlightPhrases = answers.highlights
      .map((h) => HIGHLIGHT_LABELS[h] ?? h.replace(/_/g, " "))
      .filter(Boolean);

    const highlightsText =
      highlightPhrases.length === 0 ? "none specified"
      : highlightPhrases.length === 1 ? highlightPhrases[0]
      : highlightPhrases.length === 2 ? `${highlightPhrases[0]} and ${highlightPhrases[1]}`
      : `${highlightPhrases.slice(0, -1).join(", ")}, and ${highlightPhrases[highlightPhrases.length - 1]}`;

    const toneInstruction =
      tone === "shorter"   ? "Write a short 2-sentence review only."
      : tone === "detailed" ? "Write a detailed 4-5 sentence review with rich specifics."
      : "Write a natural 3-4 sentence review.";

    if (anthropic) {
      const prompt = `You are a bride writing a genuine, personal wedding vendor review. Write it in first person as part of a couple.

Vendor: ${vendor.name} (${vendor.role})
Overall rating: ${answers.overall}
What stood out: ${highlightsText}
Specific moment: ${answers.specificMoment || "not mentioned"}
Improvement: ${answers.improvement || "nothing significant"}
One-sentence summary: ${answers.oneSentence || "not provided"}

${toneInstruction}
Do not use generic filler phrases. Be specific, warm, and authentic. Do not mention the rating explicitly — let the tone convey it. Output only the review text, nothing else.`;

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      });

      const content = message.content[0]?.type === "text" ? message.content[0].text.trim() : draftReview(body);

      return NextResponse.json({ content, generated_at: new Date().toISOString() });
    }

    // Fallback template when no API key
    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json({
      content: draftReview(body),
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Review draft error:", e);
    return NextResponse.json({ error: "Couldn't draft a review" }, { status: 500 });
  }
}

function draftReview(input: GenerateReviewRequest): string {
  const { vendor, answers } = input;
  const tone = input.tone ?? "default";
  const overallPhrase = {
    amazing: "one of the best decisions we made for our wedding",
    great: "a genuinely wonderful part of our wedding",
    good: "a solid, reliable part of our planning",
    mixed: "a mixed experience with real highlights",
    poor: "not what we'd hoped for",
  }[answers.overall];

  const highlightsLine = answers.highlights.length
    ? `What stood out most: ${formatHighlights(answers.highlights)}.`
    : "";
  const momentLine = answers.specificMoment.trim()
    ? `One moment we'll never forget — ${answers.specificMoment.trim()}.`
    : "";
  const improvementLine = answers.improvement.trim()
    ? `If we had to mention anything, ${answers.improvement.trim().toLowerCase()}, but it didn't take away from the overall experience.`
    : "";
  const closingLine = answers.oneSentence.trim()
    ? answers.oneSentence.trim().endsWith(".") ? answers.oneSentence.trim() : `${answers.oneSentence.trim()}.`
    : answers.overall === "poor" ? "We wanted to be honest about our experience." : "We'd book them again in a heartbeat.";

  const intro = `${vendor.name} was ${overallPhrase}.`;
  const full = [intro, highlightsLine, momentLine, improvementLine, closingLine].filter(Boolean).join(" ");

  if (tone === "shorter") return [intro, closingLine].filter(Boolean).join(" ");
  if (tone === "detailed") {
    const extra = answers.highlights.includes("made_us_comfortable")
      ? " From the first conversation, we felt completely at ease — and that feeling carried all the way through the day itself."
      : " From the first conversation all the way through the event, every interaction felt thoughtful and professional.";
    return full + extra;
  }
  return full;
}

function formatHighlights(highlights: string[]): string {
  const phrases = highlights.map((h) => HIGHLIGHT_LABELS[h] ?? h.replace(/_/g, " ")).filter(Boolean);
  if (phrases.length === 0) return "";
  if (phrases.length === 1) return phrases[0]!;
  if (phrases.length === 2) return `${phrases[0]} and ${phrases[1]}`;
  return `${phrases.slice(0, -1).join(", ")}, and ${phrases[phrases.length - 1]}`;
}
