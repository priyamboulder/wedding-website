// lib/email/templates.ts

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function base(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;padding:0;background:#faf9f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#c8956c,#e8b89a);padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;letter-spacing:-0.5px;">Ananya</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Your wedding planning companion</p>
</td></tr>
<tr><td style="padding:40px;">${body}</td></tr>
<tr><td style="background:#f5f4f2;padding:24px 40px;text-align:center;">
<p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Ananya · <a href="${APP_URL}" style="color:#c8956c;text-decoration:none;">ananya.wedding</a></p>
</td></tr>
</table>
</td></tr>
</table></body></html>`;
}

function btn(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#c8956c;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;margin-top:24px;">${text}</a>`;
}

export function rsvpConfirmationEmail(opts: {
  guestName: string;
  coupleName: string;
  weddingDate: string;
  venue: string;
  rsvpLink: string;
}): { subject: string; html: string } {
  return {
    subject: `You're invited to ${opts.coupleName}'s wedding 🌸`,
    html: base(
      `Invitation from ${opts.coupleName}`,
      `<h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Dear ${opts.guestName},</h2>
      <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">You are warmly invited to celebrate the wedding of <strong>${opts.coupleName}</strong>.</p>
      <table style="width:100%;background:#faf9f7;border-radius:8px;padding:20px;margin:20px 0;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">📅 Date</td><td style="padding:6px 0;color:#1a1a1a;font-weight:600;">${opts.weddingDate}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">📍 Venue</td><td style="padding:6px 0;color:#1a1a1a;font-weight:600;">${opts.venue}</td></tr>
      </table>
      <p style="color:#4b5563;line-height:1.6;">Please let us know if you can join us:</p>
      ${btn("RSVP Now", opts.rsvpLink)}`,
    ),
  };
}

export function inquiryReceivedEmail(opts: {
  vendorName: string;
  coupleName: string;
  eventDate: string;
  message: string;
  dashboardLink: string;
}): { subject: string; html: string } {
  return {
    subject: `New inquiry from ${opts.coupleName}`,
    html: base(
      "New Inquiry",
      `<h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">New Inquiry Received</h2>
      <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">Hi <strong>${opts.vendorName}</strong>, you have a new inquiry from a couple interested in your services.</p>
      <table style="width:100%;background:#faf9f7;border-radius:8px;padding:20px;margin:20px 0;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">👫 Couple</td><td style="padding:6px 0;color:#1a1a1a;font-weight:600;">${opts.coupleName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">📅 Event Date</td><td style="padding:6px 0;color:#1a1a1a;font-weight:600;">${opts.eventDate}</td></tr>
      </table>
      <p style="color:#4b5563;line-height:1.6;font-style:italic;">"${opts.message}"</p>
      ${btn("View Inquiry", opts.dashboardLink)}`,
    ),
  };
}

export function inquiryRespondedEmail(opts: {
  coupleName: string;
  vendorName: string;
  vendorCategory: string;
  message: string;
  dashboardLink: string;
}): { subject: string; html: string } {
  return {
    subject: `${opts.vendorName} responded to your inquiry`,
    html: base(
      "Inquiry Response",
      `<h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Response from ${opts.vendorName}</h2>
      <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">Hi <strong>${opts.coupleName}</strong>, <strong>${opts.vendorName}</strong> (${opts.vendorCategory}) has responded to your inquiry.</p>
      <div style="background:#faf9f7;border-left:4px solid #c8956c;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="margin:0;color:#4b5563;line-height:1.6;font-style:italic;">"${opts.message}"</p>
      </div>
      ${btn("View in Dashboard", opts.dashboardLink)}`,
    ),
  };
}

export function bookingConfirmedEmail(opts: {
  coupleName: string;
  vendorName: string;
  vendorCategory: string;
  eventDate: string;
  dashboardLink: string;
}): { subject: string; html: string } {
  return {
    subject: `Booking confirmed with ${opts.vendorName} 🎉`,
    html: base(
      "Booking Confirmed",
      `<h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Booking Confirmed!</h2>
      <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">Great news, <strong>${opts.coupleName}</strong>! Your booking with <strong>${opts.vendorName}</strong> is confirmed.</p>
      <table style="width:100%;background:#faf9f7;border-radius:8px;padding:20px;margin:20px 0;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">🎨 Service</td><td style="padding:6px 0;color:#1a1a1a;font-weight:600;">${opts.vendorCategory}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">📅 Event Date</td><td style="padding:6px 0;color:#1a1a1a;font-weight:600;">${opts.eventDate}</td></tr>
      </table>
      ${btn("View Booking", opts.dashboardLink)}`,
    ),
  };
}

export function vendorOnboardingEmail(opts: {
  vendorName: string;
  loginLink: string;
}): { subject: string; html: string } {
  return {
    subject: "Welcome to Ananya — complete your vendor profile",
    html: base(
      "Welcome to Ananya",
      `<h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Welcome, ${opts.vendorName}! 🌸</h2>
      <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">Your vendor account on Ananya has been created. Complete your profile to start receiving inquiries from couples planning their dream wedding.</p>
      <ul style="color:#4b5563;line-height:2;padding-left:20px;">
        <li>Add your portfolio photos</li>
        <li>Set your pricing and packages</li>
        <li>Write your vendor bio</li>
        <li>Enable instant booking</li>
      </ul>
      ${btn("Complete Your Profile", opts.loginLink)}`,
    ),
  };
}

export function coordinationPortalEmail(opts: {
  vendorName: string;
  coupleName: string;
  portalLink: string;
  eventDate: string;
}): { subject: string; html: string } {
  return {
    subject: `Your coordination portal for ${opts.coupleName}'s wedding`,
    html: base(
      "Coordination Portal",
      `<h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Hi ${opts.vendorName}!</h2>
      <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">Here is your coordination portal for <strong>${opts.coupleName}'s</strong> wedding. You will find your schedule, venue details, assignments, and any updates from the planning team.</p>
      <table style="width:100%;background:#faf9f7;border-radius:8px;padding:20px;margin:20px 0;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">📅 Event Date</td><td style="padding:6px 0;color:#1a1a1a;font-weight:600;">${opts.eventDate}</td></tr>
      </table>
      <p style="color:#4b5563;line-height:1.6;">Please review your assignments and confirm when you get a chance.</p>
      ${btn("Open Portal", opts.portalLink)}`,
    ),
  };
}
