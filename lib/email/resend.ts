// lib/email/resend.ts
// Thin fetch-based Resend client — no SDK dependency required.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@ananya.wedding";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ id: string } | null> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return null;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[email] Resend error:", err);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("[email] Failed to send email:", err);
    return null;
  }
}

export { APP_URL, FROM_EMAIL };

// ── Email template helpers ────────────────────────────────────────────────

interface BookingConfirmedEmailParams {
  coupleName: string;
  vendorName: string;
  vendorCategory: string;
  eventDate: string;
  dashboardLink: string;
}

/** Returns subject + html for a booking-confirmed notification. */
export function bookingConfirmedEmail(params: BookingConfirmedEmailParams): {
  subject: string;
  html: string;
} {
  const { coupleName, vendorName, vendorCategory, eventDate, dashboardLink } = params;
  return {
    subject: `Your booking with ${vendorName} is confirmed!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#8B2E2A">Booking Confirmed</h2>
        <p>Hi ${coupleName},</p>
        <p>Great news — your booking with <strong>${vendorName}</strong> (${vendorCategory}) has been confirmed.</p>
        <p><strong>Event Date:</strong> ${eventDate}</p>
        <p>
          <a href="${dashboardLink}" style="display:inline-block;padding:10px 20px;background:#8B2E2A;color:#fff;text-decoration:none;border-radius:4px">
            View in Dashboard
          </a>
        </p>
        <p style="color:#666;font-size:12px">You're receiving this because you made a booking on Ananya.</p>
      </div>
    `,
  };
}

interface InquiryReceivedEmailParams {
  coupleName: string;
  vendorName: string;
  vendorCategory: string;
  eventDate: string;
  dashboardLink: string;
}

/** Returns subject + html for an inquiry-received notification sent to the vendor. */
export function inquiryReceivedEmail(params: InquiryReceivedEmailParams): {
  subject: string;
  html: string;
} {
  const { coupleName, vendorName, vendorCategory, eventDate, dashboardLink } = params;
  return {
    subject: `New booking inquiry from ${coupleName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#8B2E2A">New Inquiry Received</h2>
        <p>Hi ${vendorName},</p>
        <p><strong>${coupleName}</strong> has requested a consultation with you for <strong>${vendorCategory}</strong>.</p>
        <p><strong>Event Date:</strong> ${eventDate}</p>
        <p>
          <a href="${dashboardLink}" style="display:inline-block;padding:10px 20px;background:#8B2E2A;color:#fff;text-decoration:none;border-radius:4px">
            Review in Dashboard
          </a>
        </p>
        <p style="color:#666;font-size:12px">You're receiving this because you are a creator on Ananya.</p>
      </div>
    `,
  };
}
