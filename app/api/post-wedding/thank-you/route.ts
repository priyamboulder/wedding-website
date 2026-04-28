import { NextResponse } from "next/server";

// ── Thank-you note drafter (stub) ─────────────────────────────────────────
// Future state: replace with an Anthropic SDK call using claude-sonnet-4-6.
// For now, return a contextual placeholder so the UI can be exercised
// end-to-end. Mirrors the pattern in app/api/ai-assist/route.ts.

interface ThankYouRequest {
  guestName: string;
  relationship: string;
  giftType: string;
  giftDescription: string;
  amountRupees: number | null;
  eventName: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ThankYouRequest;
    if (!body.guestName?.trim()) {
      return NextResponse.json(
        { error: "Guest name is required" },
        { status: 400 },
      );
    }

    // Light typing delay keeps the "drafting…" state visible.
    await new Promise((r) => setTimeout(r, 600));

    return NextResponse.json({
      content: draftThankYou(body),
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Thank-you draft error:", e);
    return NextResponse.json(
      { error: "Couldn't draft a thank-you note" },
      { status: 500 },
    );
  }
}

function draftThankYou(input: ThankYouRequest): string {
  const isCash =
    input.giftType === "cash" ||
    input.giftType === "check" ||
    input.giftType === "bank_transfer" ||
    input.giftType === "gift_card";

  const giftPhrase = isCash
    ? "your incredibly generous gift"
    : input.giftDescription
      ? `the ${input.giftDescription.toLowerCase()}`
      : "your thoughtful gift";

  const eventPhrase = input.eventName
    ? ` at the ${input.eventName.toLowerCase()}`
    : "";

  const closing = isCash
    ? "It means so much — we've tucked it away toward building our first home together, and every time we look around that home we'll think of you."
    : "It's already found a place in our home, and every time we see it we'll think of you and smile.";

  const relationshipTone = /uncle|aunt|nani|nana|dadi|dada|grandparent/i.test(
    input.relationship,
  )
    ? "Your blessings have meant everything to us, and we feel so lucky to have you in our lives."
    : /parent|mother|father|mom|dad/i.test(input.relationship)
      ? "We don't have enough words for how much your love and support has shaped us — thank you for everything."
      : /friend|cousin/i.test(input.relationship)
        ? "Having you there to celebrate with us made the whole thing feel so much sweeter."
        : "Thank you for being part of our day and for making it even more special.";

  return [
    `Thank you so much for ${giftPhrase}${eventPhrase}.`,
    relationshipTone,
    closing,
    `With love,`,
  ].join(" ");
}
