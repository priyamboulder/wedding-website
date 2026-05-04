// ──────────────────────────────────────────────────────────────────────────
// Major planetary transits — 2026-2027.
//
// These are pre-baked. The major outer-planet ingresses (Jupiter, Saturn,
// Rahu/Ketu) and the well-known retrograde windows (Mercury x3, Venus x1)
// are public knowledge published by every Panchang/ephemeris source. We
// hardcode them so the tool stays fully client-side with no ephemeris
// computation.
//
// Dates are sidereal-aligned for Vedic astrology and use the convention
// adopted by Drik Panchang. Month-of-day precision is intentional — the
// tool surfaces multi-day windows, not minute-level transits.
// ──────────────────────────────────────────────────────────────────────────

import type { TransitDef } from "@/types/wedding-stars";

// Order doesn't matter for storage — bucketing logic sorts by start date.
export const MAJOR_TRANSITS_2026_2027: TransitDef[] = [
  // ── Mercury retrogrades (3 per year — most asked about) ──
  {
    id: "mercury-rx-2026-feb",
    planet: "Mercury",
    kind: "retrograde",
    event: "Mercury retrograde in Aquarius",
    startISO: "2026-02-25",
    endISO: "2026-03-20",
    inSign: "Kumbha",
    warning: true,
  },
  {
    id: "mercury-rx-2026-jun",
    planet: "Mercury",
    kind: "retrograde",
    event: "Mercury retrograde (Cancer → Gemini)",
    startISO: "2026-06-29",
    endISO: "2026-07-23",
    inSign: "Karka",
    warning: true,
  },
  {
    id: "mercury-rx-2026-oct",
    planet: "Mercury",
    kind: "retrograde",
    event: "Mercury retrograde in Libra",
    startISO: "2026-10-24",
    endISO: "2026-11-13",
    inSign: "Tula",
    warning: true,
  },
  {
    id: "mercury-rx-2027-feb",
    planet: "Mercury",
    kind: "retrograde",
    event: "Mercury retrograde in Pisces",
    startISO: "2027-02-09",
    endISO: "2027-03-03",
    inSign: "Meena",
    warning: true,
  },

  // ── Venus retrograde (once — major for weddings) ──
  {
    id: "venus-rx-2026-oct",
    planet: "Venus",
    kind: "retrograde",
    event: "Venus retrograde (Libra → Virgo)",
    startISO: "2026-10-03",
    endISO: "2026-11-13",
    inSign: "Tula",
    warning: true,
  },

  // ── Jupiter — most benefic. The headline transit of 2026 is exaltation. ──
  {
    id: "jupiter-gemini-2026",
    planet: "Jupiter",
    kind: "ingress",
    event: "Jupiter in Gemini",
    startISO: "2026-01-01",
    endISO: "2026-06-01",
    inSign: "Mithuna",
  },
  {
    id: "jupiter-cancer-exalted-2026",
    planet: "Jupiter",
    kind: "exalted",
    event: "Jupiter enters Cancer (exalted)",
    startISO: "2026-06-02",
    endISO: "2026-10-30",
    inSign: "Karka",
    highlight: true,
  },
  {
    id: "jupiter-combust-2026",
    planet: "Jupiter",
    kind: "combust",
    event: "Jupiter combust in Cancer",
    startISO: "2026-07-14",
    endISO: "2026-08-12",
    inSign: "Karka",
    warning: true,
  },
  {
    id: "jupiter-leo-2026",
    planet: "Jupiter",
    kind: "ingress",
    event: "Jupiter enters Leo",
    startISO: "2026-10-31",
    endISO: "2027-04-15",
    inSign: "Simha",
  },
  {
    id: "jupiter-leo-rx-2026",
    planet: "Jupiter",
    kind: "retrograde",
    event: "Jupiter retrograde in Leo",
    startISO: "2026-12-13",
    endISO: "2027-03-11",
    inSign: "Simha",
  },

  // ── Saturn — discipline, structure, karma. ──
  {
    id: "saturn-pisces-2026",
    planet: "Saturn",
    kind: "ingress",
    event: "Saturn in Pisces",
    startISO: "2026-01-01",
    endISO: "2027-06-03",
    inSign: "Meena",
  },
  {
    id: "saturn-combust-2026",
    planet: "Saturn",
    kind: "combust",
    event: "Saturn combust in Pisces",
    startISO: "2026-03-08",
    endISO: "2026-03-28",
    inSign: "Meena",
    warning: true,
  },
  {
    id: "saturn-rx-2026",
    planet: "Saturn",
    kind: "retrograde",
    event: "Saturn retrograde in Pisces",
    startISO: "2026-07-26",
    endISO: "2026-12-10",
    inSign: "Meena",
  },

  // ── Rahu/Ketu — karmic axis. ──
  {
    id: "rahu-aquarius-2026",
    planet: "Rahu",
    kind: "ingress",
    event: "Rahu in Aquarius",
    startISO: "2026-01-01",
    endISO: "2026-12-07",
    inSign: "Kumbha",
  },
  {
    id: "ketu-leo-2026",
    planet: "Ketu",
    kind: "ingress",
    event: "Ketu in Leo",
    startISO: "2026-01-01",
    endISO: "2026-12-07",
    inSign: "Simha",
  },
  {
    id: "rahu-capricorn-2026",
    planet: "Rahu",
    kind: "ingress",
    event: "Rahu enters Capricorn",
    startISO: "2026-12-07",
    endISO: "2027-12-31",
    inSign: "Makara",
    highlight: true,
  },
  {
    id: "ketu-cancer-2026",
    planet: "Ketu",
    kind: "ingress",
    event: "Ketu enters Cancer",
    startISO: "2026-12-07",
    endISO: "2027-12-31",
    inSign: "Karka",
  },
];
