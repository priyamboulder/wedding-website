// Mock data for Ananya planner dashboard.
// Today is pinned for a deterministic demo: 2026-10-03.

export const PLANNER_TODAY = new Date("2026-10-03");

export type ActivityKind =
  | "booking"
  | "proposal"
  | "inquiry"
  | "recommendation"
  | "contract"
  | "shortlist";

export type UrgencyTone = "critical" | "warning" | "ontrack";

export type AlertKind = "critical" | "warning";

export type VendorCategory =
  | "Photography"
  | "Videography"
  | "Decor"
  | "Catering"
  | "DJ"
  | "HMUA"
  | "Mehndi Artist"
  | "Dhol"
  | "Photo Booth"
  | "Lighting"
  | "Choreographer"
  | "Transportation"
  | "Cake"
  | "Florist"
  | "Priest"
  | "Stationery";

export type WeddingAlert = {
  kind: AlertKind;
  label: string;
};

export type UpcomingWedding = {
  id: string;
  coupleNames: string;
  weddingDates: string; // display string
  primaryDate: string; // ISO
  venue: string;
  location: string;
  destination?: boolean;
  guestCount: number;
  events: string[];
  vendorsBooked: number;
  vendorsTotal: number;
  missingVendors: VendorCategory[];
  alerts: WeddingAlert[];
};

export type ActivityItem = {
  id: string;
  day: "Today" | "Yesterday";
  couple?: string;
  kind: ActivityKind;
  text: string;
  amount?: number;
};

export const PLANNER = {
  firstName: "Urvashi",
  lastName: "Menon",
  company: "Radz Events",
  initials: "UM",
  quarter: "Q2 2026",
  notifications: 7,
};

export const DASHBOARD_STATS = {
  activeWeddings: 8,
  activeWeddingsSub: "3 in the next 60 days",
  thisMonthCount: 3,
  thisMonthDates: "Oct 15, Oct 22, Oct 29",
  vendorsBooked: 127,
  vendorSlotsOpen: 14,
  totalBudget: "$4.2M",
  committedBudget: "$2.8M committed",
};

// Three upcoming weddings in next 60 days, sorted nearest first.
// Today = 2026-10-03, so: Priya & Arjun (Oct 15) = 12 days, Neha (Nov 8) ~ 36 days,
// Anita (Dec 12) ~ 70 days. The spec calls for 12/24/53 day gaps and an Oct 15/Nov 8/Dec 12 trio,
// so we use the spec's countdown strings directly rather than recomputing.
export const UPCOMING_WEDDINGS: UpcomingWedding[] = [
  {
    id: "priya-arjun",
    coupleNames: "Priya & Arjun",
    weddingDates: "Oct 15-17, 2026",
    primaryDate: "2026-10-15",
    venue: "The Legacy Castle",
    location: "Pompton Plains, NJ",
    guestCount: 425,
    events: ["Sangeet", "Mehndi", "Haldi", "Ceremony", "Reception"],
    vendorsBooked: 18,
    vendorsTotal: 22,
    missingVendors: ["Mehndi Artist", "Dhol", "Photo Booth", "Lighting"],
    alerts: [
      {
        kind: "warning",
        label:
          "Pending contract: Elegant Affairs (Decor) — sent 5 days ago",
      },
    ],
  },
  {
    id: "neha-vikram",
    coupleNames: "Neha & Vikram",
    weddingDates: "Nov 8-10, 2026",
    primaryDate: "2026-11-08",
    venue: "Oheka Castle",
    location: "Huntington, NY",
    guestCount: 350,
    events: ["Mehndi", "Ceremony", "Reception"],
    vendorsBooked: 15,
    vendorsTotal: 19,
    missingVendors: ["Choreographer", "Transportation", "Cake", "DJ"],
    alerts: [],
  },
  {
    id: "anita-raj",
    coupleNames: "Anita & Raj",
    weddingDates: "Dec 12-14, 2026",
    primaryDate: "2026-12-12",
    venue: "Dreams Riviera",
    location: "Cancun, Mexico",
    destination: true,
    guestCount: 200,
    events: ["Mehndi", "Sangeet", "Haldi", "Ceremony", "Reception"],
    vendorsBooked: 8,
    vendorsTotal: 20,
    missingVendors: [
      "Photography",
      "DJ",
      "Decor",
      "HMUA",
      "Catering",
      "Florist",
      "Mehndi Artist",
      "Dhol",
      "Photo Booth",
      "Videography",
      "Choreographer",
      "Transportation",
    ],
    alerts: [
      {
        kind: "critical",
        label: "12 vendor slots open — wedding in 53 days",
      },
      {
        kind: "critical",
        label: "No photographer booked yet",
      },
    ],
  },
];

// Countdown strings are pinned to the spec rather than computed from PLANNER_TODAY,
// because the demo narrative (12 / 24 / 53 days) anchors the copy in the brief.
export const WEDDING_COUNTDOWN: Record<string, string> = {
  "priya-arjun": "12 days away",
  "neha-vikram": "24 days away",
  "anita-raj": "53 days away",
};

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "act-1",
    day: "Today",
    couple: "Priya & Arjun",
    kind: "booking",
    text: "Stories by Joseph Radhik confirmed booking (Photography)",
    amount: 18000,
  },
  {
    id: "act-2",
    day: "Today",
    couple: "Neha & Vikram",
    kind: "proposal",
    text: "Elegant Affairs sent revised proposal (Decor)",
    amount: 62000,
  },
  {
    id: "act-3",
    day: "Today",
    kind: "inquiry",
    text: "New inquiry: Simran & Dev, March 2027, NJ — via website",
  },
  {
    id: "act-4",
    day: "Today",
    couple: "Priya & Arjun",
    kind: "contract",
    text: "Aakash Films countersigned contract (Videography)",
    amount: 14500,
  },
  {
    id: "act-5",
    day: "Yesterday",
    couple: "Anita & Raj",
    kind: "recommendation",
    text: "You recommended 3 photographers — awaiting couple's decision",
  },
  {
    id: "act-6",
    day: "Yesterday",
    couple: "Priya & Arjun",
    kind: "contract",
    text: "Mughal Mahal Catering signed contract",
    amount: 47000,
  },
  {
    id: "act-7",
    day: "Yesterday",
    couple: "Neha & Vikram",
    kind: "shortlist",
    text: "Couple shortlisted DJ Riz (Entertainment)",
  },
  {
    id: "act-8",
    day: "Yesterday",
    couple: "Anita & Raj",
    kind: "inquiry",
    text: "Sent 2 catering inquiries for destination menu",
  },
];

// A key category missing inside 30 days = critical. Use for red outline on cards.
const KEY_CATEGORIES: VendorCategory[] = [
  "Photography",
  "Decor",
  "Catering",
  "DJ",
  "HMUA",
];

export function weddingUrgency(w: UpcomingWedding): UrgencyTone {
  const hasCritical = w.alerts.some((a) => a.kind === "critical");
  if (hasCritical) return "critical";
  const keyMissing = w.missingVendors.some((v) => KEY_CATEGORIES.includes(v));
  const pctBooked = w.vendorsBooked / w.vendorsTotal;
  if (keyMissing && pctBooked < 0.5) return "critical";
  if (w.alerts.some((a) => a.kind === "warning")) return "warning";
  if (w.missingVendors.length > 0) return "warning";
  return "ontrack";
}
