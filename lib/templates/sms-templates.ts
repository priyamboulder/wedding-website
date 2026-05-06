// ── SMS templates ──────────────────────────────────────────────────────────
// Outbound text messages couples send via planner-side automation. Two
// Build journeys reference this directly — Hair & Makeup (chair-list
// "your slot is at HH:MM" pings) and Music (performer-arrival pings) —
// and Stationery's RSVP nudges share the same plumbing.
//
// Templates are literal strings with `{{placeholder}}` slots. Rendering is
// strictly substitution: no logic in the template, no helper expressions,
// no localisation hooks. SMS character count matters more than expressive
// power, and every template here aims at < 160 chars after substitution.
//
// Pure module — no I/O, no side effects. The Build sessions hand a fully
// rendered message to whatever messaging gateway the planner has wired up.

// ── Catalog of templates ──────────────────────────────────────────────────

export type SmsTemplateKey =
  // HMUA chair-list invitations and reminders.
  | "hmua_chair_invitation"
  | "hmua_slot_reminder_24h"
  | "hmua_slot_reminder_morning_of"
  | "hmua_slot_changed"
  // Music — performer arrival window pings.
  | "music_performer_arrival_window"
  | "music_performer_call_time"
  | "music_set_change_reminder"
  // Stationery — RSVP nudges (used by the address-the-envelopes session
  // when the couple opts to send digital follow-ups for non-responders).
  | "rsvp_nudge_first"
  | "rsvp_nudge_final"
  // Generic — used by any Build session that needs a one-off ping.
  | "generic_planner_note";

export interface SmsTemplate {
  key: SmsTemplateKey;
  // Short label for the planner-side picker UI.
  label: string;
  // The template body. `{{name}}` style placeholders only.
  body: string;
  // The placeholders this template expects. Order doesn't matter; render()
  // walks the input map.
  placeholders: ReadonlyArray<string>;
  // Rough character budget for the rendered version. The renderer doesn't
  // enforce this, but the pickers can warn the planner if their per-slot
  // names + times push past it.
  approx_max_chars?: number;
}

export const SMS_TEMPLATES: Record<SmsTemplateKey, SmsTemplate> = {
  hmua_chair_invitation: {
    key: "hmua_chair_invitation",
    label: "Chair invitation",
    body:
      "Hi {{name}} — {{couple}} would love to have you in the {{event}} hair & makeup chair. " +
      "Reply YES and we'll lock your slot. Details to follow.",
    placeholders: ["name", "couple", "event"],
    approx_max_chars: 160,
  },
  hmua_slot_reminder_24h: {
    key: "hmua_slot_reminder_24h",
    label: "Reminder (24h before)",
    body:
      "{{name}} — your hair & makeup slot tomorrow is {{time}} at {{location}}. " +
      "Come with a clean face and damp hair. Text {{planner_phone}} if anything shifts.",
    placeholders: ["name", "time", "location", "planner_phone"],
    approx_max_chars: 200,
  },
  hmua_slot_reminder_morning_of: {
    key: "hmua_slot_reminder_morning_of",
    label: "Reminder (morning-of)",
    body: "Good morning {{name}} — chair time {{time}}. We can't wait. Room: {{location}}.",
    placeholders: ["name", "time", "location"],
    approx_max_chars: 140,
  },
  hmua_slot_changed: {
    key: "hmua_slot_changed",
    label: "Slot changed",
    body:
      "{{name}} — quick update: your hair & makeup slot moved from {{old_time}} to {{new_time}}. " +
      "Same location ({{location}}). Sorry for the shuffle!",
    placeholders: ["name", "old_time", "new_time", "location"],
    approx_max_chars: 200,
  },
  music_performer_arrival_window: {
    key: "music_performer_arrival_window",
    label: "Performer arrival window",
    body:
      "Hi {{performer_name}} — {{couple}}'s {{event}} is on {{date}}. " +
      "Please arrive between {{arrival_start}}–{{arrival_end}} for setup. Load-in at {{load_in_door}}.",
    placeholders: [
      "performer_name",
      "couple",
      "event",
      "date",
      "arrival_start",
      "arrival_end",
      "load_in_door",
    ],
    approx_max_chars: 220,
  },
  music_performer_call_time: {
    key: "music_performer_call_time",
    label: "Call time confirmed",
    body:
      "{{performer_name}} — call time {{call_time}} on {{date}}. " +
      "Door: {{load_in_door}}. Contact on-site: {{contact_name}} {{contact_phone}}.",
    placeholders: [
      "performer_name",
      "call_time",
      "date",
      "load_in_door",
      "contact_name",
      "contact_phone",
    ],
    approx_max_chars: 200,
  },
  music_set_change_reminder: {
    key: "music_set_change_reminder",
    label: "Set change reminder",
    body:
      "{{performer_name}} — heads up, set change at {{change_time}}. " +
      "Energy pivot: {{pivot_note}}. {{couple}} is ready.",
    placeholders: ["performer_name", "change_time", "pivot_note", "couple"],
    approx_max_chars: 180,
  },
  rsvp_nudge_first: {
    key: "rsvp_nudge_first",
    label: "RSVP nudge (first)",
    body:
      "Hi {{name}} — {{couple}} is finalising headcount for {{event_label}} on {{date}}. " +
      "If you haven't already, would you RSVP at {{rsvp_url}}? Thank you!",
    placeholders: ["name", "couple", "event_label", "date", "rsvp_url"],
    approx_max_chars: 220,
  },
  rsvp_nudge_final: {
    key: "rsvp_nudge_final",
    label: "RSVP nudge (final)",
    body:
      "{{name}} — last call for {{event_label}} RSVPs (closing {{rsvp_close_date}}). " +
      "{{rsvp_url}}. Whatever you choose, {{couple}} appreciates a reply.",
    placeholders: ["name", "event_label", "rsvp_close_date", "rsvp_url", "couple"],
    approx_max_chars: 220,
  },
  generic_planner_note: {
    key: "generic_planner_note",
    label: "Generic note",
    body: "{{message}}",
    placeholders: ["message"],
    approx_max_chars: 320,
  },
};

// ── Render ─────────────────────────────────────────────────────────────────

export interface RenderResult {
  text: string;
  // Placeholders the template expected but the input didn't provide. Empty
  // when the template was fully resolved. Surfaced in the planner UI so a
  // half-rendered message never goes out by accident.
  missing_placeholders: ReadonlyArray<string>;
  // Rendered character count. The composer UI shows this against the
  // template's approx_max_chars; pickers warn when over budget.
  char_count: number;
}

export function renderSmsTemplate(
  key: SmsTemplateKey,
  values: Readonly<Record<string, string | number | undefined>>,
): RenderResult {
  const template = SMS_TEMPLATES[key];
  const missing: string[] = [];
  let text = template.body;

  for (const name of template.placeholders) {
    const raw = values[name];
    if (raw == null || raw === "") {
      missing.push(name);
      continue;
    }
    // Replace every occurrence of `{{name}}` (the same placeholder may
    // appear twice in some templates; render to the same value).
    text = text.replaceAll(`{{${name}}}`, String(raw));
  }

  return {
    text,
    missing_placeholders: missing,
    char_count: text.length,
  };
}

// ── Listing helper ─────────────────────────────────────────────────────────
// Stationery / HMUA / Music pickers ask the user to pick a template; this
// helper returns the listing in a stable, human-friendly order.

export function listTemplatesByDomain(): Record<
  "hmua" | "music" | "stationery" | "generic",
  ReadonlyArray<SmsTemplate>
> {
  return {
    hmua: [
      SMS_TEMPLATES.hmua_chair_invitation,
      SMS_TEMPLATES.hmua_slot_reminder_24h,
      SMS_TEMPLATES.hmua_slot_reminder_morning_of,
      SMS_TEMPLATES.hmua_slot_changed,
    ],
    music: [
      SMS_TEMPLATES.music_performer_arrival_window,
      SMS_TEMPLATES.music_performer_call_time,
      SMS_TEMPLATES.music_set_change_reminder,
    ],
    stationery: [
      SMS_TEMPLATES.rsvp_nudge_first,
      SMS_TEMPLATES.rsvp_nudge_final,
    ],
    generic: [SMS_TEMPLATES.generic_planner_note],
  };
}
