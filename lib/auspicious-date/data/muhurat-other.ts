// ──────────────────────────────────────────────────────────────────────────
// Non-Hindu blocked periods — Sikh, Muslim, Jain.
//
// These traditions don't have a "shubh muhurat" system in the Vedic sense,
// but they have important blocked or sensitive periods that the calendar
// must surface. We layer these as block periods on the Hindu base layer
// (or as a standalone tradition selection).
// ──────────────────────────────────────────────────────────────────────────

import type { BlockedPeriod } from "@/types/auspicious-date";

export const MUSLIM_BLOCKED_2026: BlockedPeriod[] = [
  {
    tradition: "muslim",
    start: "2026-02-18",
    end: "2026-03-19",
    name: "Ramadan",
    shortLabel: "Ramadan",
    explanation:
      "The holy month of fasting. Many Muslim families avoid weddings during Ramadan; some hold simple nikahs but defer celebrations until after Eid.",
  },
  {
    tradition: "muslim",
    start: "2026-06-26",
    end: "2026-07-05",
    name: "Dhul-Hijjah (first 10 days)",
    shortLabel: "Hajj period",
    explanation:
      "The first 10 days of Dhul-Hijjah, including the Hajj pilgrimage period. Often avoided for celebratory ceremonies.",
  },
  {
    tradition: "muslim",
    start: "2026-07-16",
    end: "2026-07-25",
    name: "Muharram (first 10 days)",
    shortLabel: "Muharram",
    explanation:
      "The first sacred month of the Hijri year — particularly the first 10 days. Many families avoid weddings during this period of mourning and reflection.",
  },
];

export const MUSLIM_BLOCKED_2027: BlockedPeriod[] = [
  {
    tradition: "muslim",
    start: "2027-02-08",
    end: "2027-03-09",
    name: "Ramadan",
    shortLabel: "Ramadan",
    explanation:
      "The holy month of fasting. Hijri dates shift ~10–11 days earlier each Gregorian year — confirm with your family imam.",
  },
  {
    tradition: "muslim",
    start: "2027-06-15",
    end: "2027-06-24",
    name: "Dhul-Hijjah (first 10 days)",
    shortLabel: "Hajj period",
    explanation: "First 10 days of Dhul-Hijjah — Hajj period. Often avoided for celebrations.",
  },
  {
    tradition: "muslim",
    start: "2027-07-05",
    end: "2027-07-14",
    name: "Muharram (first 10 days)",
    shortLabel: "Muharram",
    explanation: "First 10 days of Muharram — period of mourning and reflection.",
  },
];

// Jain Paryushana (Shvetambara) — typically 8 days in late Aug / early Sept
export const JAIN_BLOCKED_2026: BlockedPeriod[] = [
  {
    tradition: "jain",
    start: "2026-08-26",
    end: "2026-09-02",
    name: "Paryushana",
    shortLabel: "Paryushana",
    explanation:
      "The most important Jain festival — 8 days of fasting, reflection, and forgiveness. Weddings are not performed during this period.",
  },
  {
    tradition: "jain",
    start: "2026-07-25",
    end: "2026-11-19",
    name: "Chaturmas",
    shortLabel: "Chaturmas",
    explanation:
      "Jain Chaturmas overlaps the Hindu Chaturmas window — monks remain in one place and lay devotees observe stricter practices. Weddings are paused.",
  },
];

export const JAIN_BLOCKED_2027: BlockedPeriod[] = [
  {
    tradition: "jain",
    start: "2027-08-15",
    end: "2027-08-22",
    name: "Paryushana",
    shortLabel: "Paryushana",
    explanation:
      "8 days of fasting, reflection, and forgiveness. Weddings are not performed during this period.",
  },
  {
    tradition: "jain",
    start: "2027-07-14",
    end: "2027-11-08",
    name: "Chaturmas",
    shortLabel: "Chaturmas",
    explanation: "Jain Chaturmas — weddings paused.",
  },
];

// Sikh: no strict block periods, but Gurpurab anniversaries are commonly
// noted. The tool surfaces a softer "favored / family discussion" tone
// for Sikh users rather than hard blocks.
export const SIKH_GURPURAB_2026: BlockedPeriod[] = [
  {
    tradition: "sikh",
    start: "2026-01-05",
    end: "2026-01-05",
    name: "Guru Gobind Singh Jayanti",
    shortLabel: "Gurpurab",
    explanation:
      "Birth anniversary of Guru Gobind Singh. Gurdwaras prioritize religious observance — booking for weddings on Gurpurab is uncommon.",
  },
  {
    tradition: "sikh",
    start: "2026-04-13",
    end: "2026-04-13",
    name: "Vaisakhi",
    shortLabel: "Vaisakhi",
    explanation:
      "Founding anniversary of the Khalsa. Major Sikh festival — Gurdwaras typically don't book Anand Karaj on this date.",
  },
  {
    tradition: "sikh",
    start: "2026-11-24",
    end: "2026-11-24",
    name: "Guru Nanak Jayanti",
    shortLabel: "Gurpurab",
    explanation:
      "Birth anniversary of Guru Nanak Dev Ji — the most important Gurpurab. Gurdwaras are fully occupied with religious observance.",
  },
];

export const SIKH_GURPURAB_2027: BlockedPeriod[] = [
  {
    tradition: "sikh",
    start: "2027-01-05",
    end: "2027-01-05",
    name: "Guru Gobind Singh Jayanti",
    shortLabel: "Gurpurab",
    explanation: "Birth anniversary of Guru Gobind Singh.",
  },
  {
    tradition: "sikh",
    start: "2027-04-13",
    end: "2027-04-13",
    name: "Vaisakhi",
    shortLabel: "Vaisakhi",
    explanation: "Founding anniversary of the Khalsa.",
  },
  {
    tradition: "sikh",
    start: "2027-11-14",
    end: "2027-11-14",
    name: "Guru Nanak Jayanti",
    shortLabel: "Gurpurab",
    explanation: "Birth anniversary of Guru Nanak Dev Ji.",
  },
];
