// app/api/email/send/route.ts
// Internal API endpoint called by server actions or other API routes to send emails.

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { sendEmail } from "@/lib/email/resend";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import {
  rsvpConfirmationEmail,
  inquiryReceivedEmail,
  inquiryRespondedEmail,
  bookingConfirmedEmail,
  vendorOnboardingEmail,
  coordinationPortalEmail,
} from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  // Require authentication to prevent open email relay abuse
  const { response: authError } = await requireAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { type, to, data } = body as {
      type: string;
      to: string | string[];
      data: Record<string, string>;
    };

    if (!type || !to) {
      return NextResponse.json({ error: "Missing type or to" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(to) ? to : [to];
    const invalidAddr = recipients.find((addr) => !emailRegex.test(addr));
    if (invalidAddr) {
      return NextResponse.json({ error: `Invalid email address: ${invalidAddr}` }, { status: 400 });
    }

    let template: { subject: string; html: string } | null = null;

    switch (type) {
      case "rsvp_confirmation":
        template = rsvpConfirmationEmail(data as Parameters<typeof rsvpConfirmationEmail>[0]);
        break;
      case "inquiry_received":
        template = inquiryReceivedEmail(data as Parameters<typeof inquiryReceivedEmail>[0]);
        break;
      case "inquiry_responded":
        template = inquiryRespondedEmail(data as Parameters<typeof inquiryRespondedEmail>[0]);
        break;
      case "booking_confirmed":
        template = bookingConfirmedEmail(data as Parameters<typeof bookingConfirmedEmail>[0]);
        break;
      case "vendor_onboarding":
        template = vendorOnboardingEmail(data as Parameters<typeof vendorOnboardingEmail>[0]);
        break;
      case "coordination_portal":
        template = coordinationPortalEmail(data as Parameters<typeof coordinationPortalEmail>[0]);
        break;
      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    const result = await sendEmail({ to, ...template });
    return NextResponse.json({ ok: true, id: result?.id ?? null });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
