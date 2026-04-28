import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Platform, Tone } from "@/lib/social/types";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are a social media content strategist specializing in the wedding and events industry in India and South Asia. You write compelling, authentic social media posts that feel personal and editorial — never generic or template-like.

You understand the nuances of Indian weddings: multi-day celebrations, diverse traditions (Hindu, Muslim, Sikh, Christian, interfaith), regional variations, the emotional weight of family, and the visual richness of events like mehendi, sangeet, haldi, and baraat.

Your posts should:
- Feel like they were written by the vendor themselves, in their authentic voice
- Tell a micro-story or evoke a specific emotion — never just describe what's in the photo
- Use line breaks strategically for readability on mobile
- Balance professionalism with warmth
- Include relevant, non-spammy hashtags (mix of broad and niche)
- Have a natural, non-pushy call to action when appropriate
- Be platform-appropriate in length, tone, and format`;

const PLATFORM_GUIDELINES: Record<Platform, string> = {
  instagram_post:
    "Instagram Post — 150-300 words. Lead with a hook line. Use line breaks every 1-2 sentences. 20-30 hashtags (placed in the hashtags array, not in the caption). Soft CTA. Emoji: minimal and intentional.",
  instagram_reel:
    "Instagram Reel caption — 50-100 words. Punchy, hook-driven. 15-20 hashtags. Curiosity/emotion focus.",
  instagram_story:
    "Instagram Story — 20-40 words. Very short, punchy, CTA-driven. 3-5 hashtags. Designed for image overlay.",
  facebook:
    "Facebook — 100-200 words. Conversational, community-oriented. 3-5 hashtags max. Can ask engagement questions.",
  linkedin:
    "LinkedIn — 150-250 words. Professional but personal. Industry/craft insights angle. 3-5 hashtags. No emojis.",
  pinterest:
    "Pinterest — 50-100 words. SEO-focused, descriptive. Keywords for searchability. Include style, colors, venue type, location, season.",
  twitter:
    "Twitter/X — Under 280 characters total. Punchy, visual-first. 2-3 hashtags max.",
};

type GenerateBody = {
  content_item: {
    title?: string;
    description?: string;
    content_type?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  };
  brand_profile?: {
    brand_voice?: string;
    target_audience?: string;
    default_hashtags?: string[];
    instagram_handle?: string;
  } | null;
  platforms: Platform[];
  tone: Tone;
  additional_instructions?: string;
};

type GeneratedPostPayload = {
  platform: Platform;
  caption: string;
  hashtags: string[];
  call_to_action: string;
  tone_used: Tone;
};

function buildUserMessage(body: GenerateBody): string {
  const { content_item, brand_profile, platforms, tone, additional_instructions } =
    body;

  const guidelines = platforms
    .map((p) => `- ${PLATFORM_GUIDELINES[p]}`)
    .join("\n");

  const metadataBlock = content_item.metadata
    ? Object.entries(content_item.metadata)
        .filter(([, v]) => v != null && v !== "")
        .map(([k, v]) => `  - ${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
        .join("\n")
    : "";

  const brandBlock = brand_profile
    ? [
        brand_profile.brand_voice
          ? `Brand voice: ${brand_profile.brand_voice}`
          : "",
        brand_profile.target_audience
          ? `Target audience: ${brand_profile.target_audience}`
          : "",
        brand_profile.instagram_handle
          ? `Instagram handle: ${brand_profile.instagram_handle}`
          : "",
        brand_profile.default_hashtags?.length
          ? `Signature hashtags to weave in where natural: ${brand_profile.default_hashtags
              .map((h) => `#${h}`)
              .join(" ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "No brand profile on file — infer a warm, editorial wedding-industry voice.";

  return `Generate social media posts for the following content item.

CONTENT
Title: ${content_item.title ?? "(untitled)"}
Type: ${content_item.content_type ?? "unspecified"}
Description: ${content_item.description ?? "(no description)"}
${content_item.tags?.length ? `Tags: ${content_item.tags.join(", ")}` : ""}
${metadataBlock ? `Metadata:\n${metadataBlock}` : ""}

BRAND
${brandBlock}

TONE
${tone}

PLATFORMS (generate one post per platform, in this exact order)
${guidelines}

${
  additional_instructions?.trim()
    ? `ADDITIONAL INSTRUCTIONS FROM THE VENDOR\n${additional_instructions.trim()}`
    : ""
}

Respond with ONLY valid JSON matching this exact schema — no prose, no markdown code fences:
{
  "posts": [
    {
      "platform": "<one of: ${platforms.join(" | ")}>",
      "caption": "<post body — line breaks as \\n, no hashtags inside>",
      "hashtags": ["hashtag1", "hashtag2"],
      "call_to_action": "<short CTA line>",
      "tone_used": "${tone}"
    }
  ]
}

Hashtags must not include the leading "#". Produce exactly one object per requested platform, in the order listed above.`;
}

function stripFences(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fence ? fence[1].trim() : trimmed;
}

function normalizePost(
  p: Partial<GeneratedPostPayload>,
  fallbackTone: Tone,
): GeneratedPostPayload | null {
  if (!p.platform || !p.caption) return null;
  const hashtags = Array.isArray(p.hashtags)
    ? p.hashtags.map((h) => String(h).replace(/^#+/, "").trim()).filter(Boolean)
    : [];
  return {
    platform: p.platform as Platform,
    caption: String(p.caption),
    hashtags,
    call_to_action: p.call_to_action ? String(p.call_to_action) : "",
    tone_used: (p.tone_used as Tone) ?? fallbackTone,
  };
}

export async function POST(request: Request) {
  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body?.content_item || typeof body.content_item !== "object") {
    return NextResponse.json(
      { error: "content_item is required" },
      { status: 400 },
    );
  }
  if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
    return NextResponse.json(
      { error: "At least one platform is required" },
      { status: 400 },
    );
  }
  if (!body.tone) {
    return NextResponse.json({ error: "tone is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server" },
      { status: 500 },
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(body) }],
    });

    const textBlock = message.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (!textBlock) {
      return NextResponse.json(
        { error: "Model returned no text content" },
        { status: 502 },
      );
    }

    const cleaned = stripFences(textBlock.text);
    let parsed: { posts?: Partial<GeneratedPostPayload>[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Model response was not valid JSON", raw: cleaned },
        { status: 502 },
      );
    }

    const rawPosts = Array.isArray(parsed.posts) ? parsed.posts : [];
    const posts = rawPosts
      .map((p) => normalizePost(p, body.tone))
      .filter((p): p is GeneratedPostPayload => p !== null);

    if (posts.length === 0) {
      return NextResponse.json(
        { error: "Model response contained no usable posts" },
        { status: 502 },
      );
    }

    return NextResponse.json({ posts });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Social generate error:", err);
    return NextResponse.json(
      { error: `Generation failed: ${msg}` },
      { status: 500 },
    );
  }
}
