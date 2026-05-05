// ── Auspicious dates (V1 static dataset) ──────────────────────────────
//
// A curated list of dates that fall within traditionally favorable
// Hindu wedding windows for 2026–2028. The dataset deliberately avoids
// claiming exact muhurat (which depends on the couple's birth charts)
// and instead describes each date's seasonal and cultural anchor —
// the auspicious window the date sits in, plus practical season notes.
//
// V2 should swap this for a panchang-driven service that returns true
// muhurat times tied to the couple's traditions.

export type AuspiciousTradition =
  | "hindu"
  | "sikh"
  | "jain"
  | "inter_faith"
  | "non_religious";

export interface AuspiciousDate {
  iso: string;            // "YYYY-MM-DD"
  weekday: string;        // pre-computed for display
  monthLabel: string;     // "January 2027"
  significance: string;   // cultural / seasonal anchor
  seasonNote: string;     // practical season commentary
  traditions: AuspiciousTradition[];
}

// Hand-curated. Dates are Saturdays/Sundays/major-festival weekdays in
// the post-Devuthani-Ekadashi → pre-Holi window (the classical North
// Indian wedding season), plus a small set of post-Akshaya-Tritiya
// dates in late spring.
export const AUSPICIOUS_DATES: AuspiciousDate[] = [
  // ── 2026 winter season (Nov–Dec) ───────────────────────────────────
  {
    iso: "2026-11-21",
    weekday: "Saturday",
    monthLabel: "November 2026",
    significance: "Post-Devuthani Ekadashi · season opens",
    seasonNote: "Peak shaadi season — premier venues book 9–12 months out.",
    traditions: ["hindu", "sikh", "jain", "inter_faith"],
  },
  {
    iso: "2026-12-05",
    weekday: "Saturday",
    monthLabel: "December 2026",
    significance: "Margashirsha Shukla — favorable for vivah",
    seasonNote: "Mild winter weather across most of India. Long daylight in the south.",
    traditions: ["hindu", "inter_faith"],
  },
  {
    iso: "2026-12-12",
    weekday: "Saturday",
    monthLabel: "December 2026",
    significance: "Margashirsha Shukla — vivah-favorable window",
    seasonNote: "Sweater weather in the north. Holiday travel surge — book flights early.",
    traditions: ["hindu", "sikh", "inter_faith"],
  },
  {
    iso: "2026-12-23",
    weekday: "Wednesday",
    monthLabel: "December 2026",
    significance: "Year-end auspicious window",
    seasonNote: "Holiday-week wedding — guests are off work but travel is expensive.",
    traditions: ["hindu", "inter_faith", "non_religious"],
  },

  // ── 2027 winter / spring ───────────────────────────────────────────
  {
    iso: "2027-01-30",
    weekday: "Saturday",
    monthLabel: "January 2027",
    significance: "Magh Shukla — auspicious for new beginnings",
    seasonNote: "Crisp winter. Lehenga and sherwani season — outerwear becomes part of the look.",
    traditions: ["hindu", "sikh", "jain", "inter_faith"],
  },
  {
    iso: "2027-02-13",
    weekday: "Saturday",
    monthLabel: "February 2027",
    significance: "Around Vasant Panchami · spring of weddings begins",
    seasonNote: "Saraswati Puja season. Yellow accents traditional.",
    traditions: ["hindu", "sikh", "inter_faith"],
  },
  {
    iso: "2027-02-27",
    weekday: "Saturday",
    monthLabel: "February 2027",
    significance: "Magh Purnima window",
    seasonNote: "Last cool weekends before pre-summer heat sets in across the north.",
    traditions: ["hindu", "inter_faith"],
  },
  {
    iso: "2027-05-08",
    weekday: "Saturday",
    monthLabel: "May 2027",
    significance: "Akshaya Tritiya season · highly auspicious",
    seasonNote: "Late spring. Hot in Delhi/Rajasthan; lovely in the hills.",
    traditions: ["hindu", "jain", "inter_faith"],
  },

  // ── 2027 winter season ─────────────────────────────────────────────
  {
    iso: "2027-11-13",
    weekday: "Saturday",
    monthLabel: "November 2027",
    significance: "Post-Devuthani Ekadashi · season opens",
    seasonNote: "Premier venues for this date are typically booked 12+ months out.",
    traditions: ["hindu", "sikh", "jain", "inter_faith"],
  },
  {
    iso: "2027-11-27",
    weekday: "Saturday",
    monthLabel: "November 2027",
    significance: "Margashirsha — vivah-favorable window",
    seasonNote: "Best weather across most of India. Peak photographer demand.",
    traditions: ["hindu", "sikh", "inter_faith"],
  },
  {
    iso: "2027-12-04",
    weekday: "Saturday",
    monthLabel: "December 2027",
    significance: "Margashirsha Shukla — favorable for vivah",
    seasonNote: "Mild winter. Travel from abroad lines up well with US/UK holidays.",
    traditions: ["hindu", "inter_faith"],
  },
  {
    iso: "2027-12-18",
    weekday: "Saturday",
    monthLabel: "December 2027",
    significance: "Vivah-favorable Margashirsha window",
    seasonNote: "Pre-Christmas — destination weddings popular this week.",
    traditions: ["hindu", "sikh", "inter_faith", "non_religious"],
  },

  // ── 2028 winter / spring ───────────────────────────────────────────
  {
    iso: "2028-01-22",
    weekday: "Saturday",
    monthLabel: "January 2028",
    significance: "Magh Shukla — new-beginnings window",
    seasonNote: "Crisp and dry — favorite for outdoor mandap setups.",
    traditions: ["hindu", "sikh", "jain", "inter_faith"],
  },
  {
    iso: "2028-02-05",
    weekday: "Saturday",
    monthLabel: "February 2028",
    significance: "Vasant Panchami window",
    seasonNote: "Yellow-and-marigold traditional palette season.",
    traditions: ["hindu", "inter_faith"],
  },
  {
    iso: "2028-02-19",
    weekday: "Saturday",
    monthLabel: "February 2028",
    significance: "Magh Purnima — auspicious full moon window",
    seasonNote: "Last cool weekends before summer.",
    traditions: ["hindu", "sikh", "inter_faith"],
  },
  {
    iso: "2028-04-29",
    weekday: "Saturday",
    monthLabel: "April 2028",
    significance: "Around Akshaya Tritiya · highly auspicious",
    seasonNote: "Late spring. Heat in plains; cooler in hill stations.",
    traditions: ["hindu", "jain", "inter_faith"],
  },
];

// Filter helpers used by the date finder UI.

export function filterAuspiciousDates(opts: {
  traditions: AuspiciousTradition[];
  monthsAhead?: { from: Date; to: Date };
  avoidIso?: string[];
}): AuspiciousDate[] {
  const { traditions, monthsAhead, avoidIso = [] } = opts;
  const avoidSet = new Set(avoidIso);
  return AUSPICIOUS_DATES.filter((d) => {
    if (avoidSet.has(d.iso)) return false;
    if (traditions.length > 0) {
      const overlap = d.traditions.some((t) => traditions.includes(t));
      if (!overlap) return false;
    }
    if (monthsAhead) {
      const dt = new Date(d.iso);
      if (dt < monthsAhead.from || dt > monthsAhead.to) return false;
    }
    return true;
  });
}
