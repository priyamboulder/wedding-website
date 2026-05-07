import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { createAnonClient } from "@/lib/supabase/server-client";
import { joinToolWaitlist } from "@/lib/tools";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { tool_slug, email, source } = (body as Record<string, unknown>) ?? {};
  if (typeof tool_slug !== "string" || tool_slug.length === 0) {
    return NextResponse.json({ error: "tool_slug is required." }, { status: 400 });
  }
  if (typeof email !== "string" || email.length === 0) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }

  try {
    const result = await joinToolWaitlist(createAnonClient(), {
      toolSlug: tool_slug,
      email,
      source: typeof source === "string" ? source : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Could not join the waitlist." }, { status: 400 });
  }
}
