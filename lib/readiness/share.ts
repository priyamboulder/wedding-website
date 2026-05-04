// ──────────────────────────────────────────────────────────────────────────
// Shareable-link encoder for the readiness assessment.
//
// Mirrors the visualizer's approach — the entire answer set rides in the
// URL hash so partners can open the same result without any backend.
// ──────────────────────────────────────────────────────────────────────────

import type { AssessmentAnswer } from "@/types/readiness";

const TIMELINE_VALUES: AssessmentAnswer["timeline"][] = [
  "already-happened",
  "less-than-3-months",
  "3-6-months",
  "6-12-months",
  "12-18-months",
  "18-plus-months",
  "no-date",
];
const VENUE_VALUES: AssessmentAnswer["venue"][] = [
  "signed-deposited",
  "venue-in-mind",
  "actively-touring",
  "havent-started",
  "destination-package",
];
const BUDGET_VALUES: AssessmentAnswer["budget"][] = [
  "agreed-number",
  "rough-range",
  "one-side-only",
  "havent-talked",
  "complicated",
];
const SCOPE_VALUES: AssessmentAnswer["eventScope"][] = [
  "ceremony-reception",
  "two-three",
  "four-five",
  "full-week",
  "undecided",
];
const VENDOR_VALUES: AssessmentAnswer["vendorsBooked"][number][] = [
  "venue",
  "photographer",
  "caterer",
  "dj",
  "decorator",
  "mehndi",
  "hmua",
  "planner",
  "officiant",
  "none",
];
const GUEST_VALUES: AssessmentAnswer["guestList"][] = [
  "final-sent",
  "draft-negotiating",
  "rough-number",
  "havent-started",
  "parents-handling",
];
const ATTIRE_VALUES: AssessmentAnswer["attire"][] = [
  "ordered",
  "shopping",
  "know-what",
  "havent-thought",
  "from-india",
];
const FAMILY_VALUES: AssessmentAnswer["familyAlignment"][] = [
  "fully-aligned",
  "mostly-aligned",
  "work-in-progress",
  "tension",
  "independent",
];

export function encodeAnswers(answer: AssessmentAnswer): string {
  const json = JSON.stringify(answer);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf-8").toString("base64url");
  }
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeAnswers(token: string): AssessmentAnswer | null {
  try {
    let json: string;
    if (typeof window === "undefined") {
      json = Buffer.from(token, "base64url").toString("utf-8");
    } else {
      const padded = token.replace(/-/g, "+").replace(/_/g, "/");
      const padLen = (4 - (padded.length % 4)) % 4;
      const binary = atob(padded + "=".repeat(padLen));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      json = new TextDecoder().decode(bytes);
    }
    const parsed = JSON.parse(json) as AssessmentAnswer;
    return validate(parsed);
  } catch {
    return null;
  }
}

function validate(raw: unknown): AssessmentAnswer | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.timeline !== "string" || !TIMELINE_VALUES.includes(r.timeline as never)) return null;
  if (typeof r.venue !== "string" || !VENUE_VALUES.includes(r.venue as never)) return null;
  if (typeof r.budget !== "string" || !BUDGET_VALUES.includes(r.budget as never)) return null;
  if (typeof r.eventScope !== "string" || !SCOPE_VALUES.includes(r.eventScope as never)) return null;
  if (typeof r.guestList !== "string" || !GUEST_VALUES.includes(r.guestList as never)) return null;
  if (typeof r.attire !== "string" || !ATTIRE_VALUES.includes(r.attire as never)) return null;
  if (typeof r.familyAlignment !== "string" || !FAMILY_VALUES.includes(r.familyAlignment as never)) return null;
  if (!Array.isArray(r.vendorsBooked)) return null;

  const vendors = r.vendorsBooked.filter(
    (v): v is AssessmentAnswer["vendorsBooked"][number] =>
      typeof v === "string" && VENDOR_VALUES.includes(v as never),
  );

  return {
    timeline: r.timeline as AssessmentAnswer["timeline"],
    venue: r.venue as AssessmentAnswer["venue"],
    budget: r.budget as AssessmentAnswer["budget"],
    eventScope: r.eventScope as AssessmentAnswer["eventScope"],
    vendorsBooked: vendors,
    guestList: r.guestList as AssessmentAnswer["guestList"],
    attire: r.attire as AssessmentAnswer["attire"],
    familyAlignment: r.familyAlignment as AssessmentAnswer["familyAlignment"],
  };
}
