// Mock data for Ananya planner client pipeline (Clients page).
// Today is pinned: 2026-10-05 (two days after planner dashboard's today for freshness).

export type PipelineStage =
  | "inquiry"
  | "consultation"
  | "proposal"
  | "active"
  | "completed";

export type InquirySource =
  | "Website"
  | "Instagram"
  | "Referral"
  | "Ananya"
  | "Word of mouth";

export type WeddingType =
  | "Hindu"
  | "Sikh"
  | "Muslim"
  | "Fusion"
  | "Christian"
  | "Jain";

export type CoupleCard = {
  id: string;
  stage: PipelineStage;
  partnerOne: string;
  partnerTwo: string;
  email?: string;
  phone?: string;
  weddingDateDisplay: string; // e.g. "Mar 2027" or "Oct 15-17, 2026"
  weddingDateISO: string;
  location: string; // e.g. "NJ"
  venue?: string;
  destination?: boolean;
  guestCount: number;
  weddingType: WeddingType;
  eventDays: number; // 2-day, 3-day, etc.
  events: string[];
  budget: string; // e.g. "$300K+"
  budgetValue: number; // numeric for analytics
  source: InquirySource;
  sourceNote?: string; // e.g. "from Priya"
  // stage-specific
  receivedDaysAgo?: number; // inquiry
  consultDate?: string; // consultation — display string
  consultDaysAway?: number; // negative = past, positive = upcoming, 0 = today
  consultDone?: boolean;
  proposalSentDaysAgo?: number;
  proposalNoResponse?: boolean;
  vendorsBooked?: number;
  vendorsTotal?: number;
  percentComplete?: number;
  completedDateDisplay?: string;
  notes?: string;
  // on-platform status — drives "Invite to Ananya" quick action in detail panel
  onAnanyaPlatform?: boolean;
};

export const PIPELINE_STAGES: {
  id: PipelineStage;
  label: string;
  subtitle: string;
}[] = [
  {
    id: "inquiry",
    label: "Inquiry",
    subtitle: "Reached out, no consult yet",
  },
  {
    id: "consultation",
    label: "Consultation",
    subtitle: "Scheduled or completed",
  },
  {
    id: "proposal",
    label: "Proposal Sent",
    subtitle: "Service proposal out",
  },
  {
    id: "active",
    label: "Active",
    subtitle: "Booked & in planning",
  },
  {
    id: "completed",
    label: "Completed",
    subtitle: "Past weddings",
  },
];

export const CLIENT_CARDS: CoupleCard[] = [
  // ─────────── INQUIRY (3) ───────────
  {
    id: "simran-dev",
    stage: "inquiry",
    partnerOne: "Simran Kapoor",
    partnerTwo: "Dev Malhotra",
    email: "simran.kapoor@gmail.com",
    phone: "(201) 555-0142",
    weddingDateDisplay: "Mar 2027",
    weddingDateISO: "2027-03-15",
    location: "NJ",
    guestCount: 400,
    weddingType: "Hindu",
    eventDays: 3,
    events: ["Sangeet", "Mehndi", "Haldi", "Ceremony", "Reception"],
    budget: "$300K+",
    budgetValue: 325000,
    source: "Website",
    receivedDaysAgo: 2,
    notes: "Found us via the venue showcase page. Parents based in Edison.",
    onAnanyaPlatform: false,
  },
  {
    id: "riya-jay",
    stage: "inquiry",
    partnerOne: "Riya Shah",
    partnerTwo: "Jay Patel",
    email: "riya.shah88@outlook.com",
    phone: "(267) 555-0198",
    weddingDateDisplay: "Apr 2027",
    weddingDateISO: "2027-04-10",
    location: "Philadelphia",
    guestCount: 250,
    weddingType: "Fusion",
    eventDays: 2,
    events: ["Sangeet", "Ceremony", "Reception"],
    budget: "~$150K",
    budgetValue: 150000,
    source: "Referral",
    sourceNote: "from Priya",
    receivedDaysAgo: 5,
    notes:
      "Gujarati + Jewish fusion. Priya & Arjun passed along our info after their sangeet.",
    onAnanyaPlatform: false,
  },
  {
    id: "tara-neil",
    stage: "inquiry",
    partnerOne: "Tara Iyer",
    partnerTwo: "Neil Reddy",
    email: "tara.iyer@gmail.com",
    phone: "(202) 555-0173",
    weddingDateDisplay: "May 2027",
    weddingDateISO: "2027-05-20",
    location: "DC",
    guestCount: 500,
    weddingType: "Hindu",
    eventDays: 3,
    events: ["Sangeet", "Mehndi", "Haldi", "Ceremony", "Reception"],
    budget: "$400K+",
    budgetValue: 425000,
    source: "Instagram",
    sourceNote: "IG DM",
    receivedDaysAgo: 1,
    notes:
      "DMed us after seeing the Legacy Castle reel. Both families in DC-metro.",
    onAnanyaPlatform: false,
  },

  // ─────────── CONSULTATION (2) ───────────
  {
    id: "meera-karan",
    stage: "consultation",
    partnerOne: "Meera Joshi",
    partnerTwo: "Karan Verma",
    email: "meera.joshi@gmail.com",
    phone: "(917) 555-0134",
    weddingDateDisplay: "Jun 2027",
    weddingDateISO: "2027-06-12",
    location: "Cancun, Mexico",
    destination: true,
    guestCount: 200,
    weddingType: "Fusion",
    eventDays: 3,
    events: ["Mehndi", "Sangeet", "Ceremony", "Reception"],
    budget: "$350K",
    budgetValue: 350000,
    source: "Ananya",
    consultDate: "Oct 8",
    consultDaysAway: 3,
    consultDone: false,
    notes:
      "Destination wedding. Karan's family is flying in from London. Budget includes guest travel subsidy.",
    onAnanyaPlatform: true,
  },
  {
    id: "anika-sam",
    stage: "consultation",
    partnerOne: "Anika Grewal",
    partnerTwo: "Sam Singh",
    email: "anika.grewal@gmail.com",
    phone: "(732) 555-0189",
    weddingDateDisplay: "Aug 2027",
    weddingDateISO: "2027-08-22",
    location: "NJ",
    guestCount: 300,
    weddingType: "Sikh",
    eventDays: 2,
    events: ["Anand Karaj", "Reception"],
    budget: "$250K",
    budgetValue: 250000,
    source: "Referral",
    consultDate: "Sep 28",
    consultDaysAway: -7,
    consultDone: true,
    notes:
      "Consult went well. Parents want gurudwara in Carteret; reception at Royal Albert's Palace.",
    onAnanyaPlatform: false,
  },

  // ─────────── PROPOSAL SENT (1) ───────────
  {
    id: "pooja-amit",
    stage: "proposal",
    partnerOne: "Pooja Nair",
    partnerTwo: "Amit Chandra",
    email: "pooja.nair@gmail.com",
    phone: "(646) 555-0121",
    weddingDateDisplay: "Feb 2027",
    weddingDateISO: "2027-02-14",
    location: "NYC",
    venue: "Pier Sixty",
    guestCount: 350,
    weddingType: "Hindu",
    eventDays: 2,
    events: ["Sangeet", "Ceremony", "Reception"],
    budget: "$280K",
    budgetValue: 280000,
    source: "Website",
    proposalSentDaysAgo: 4,
    proposalNoResponse: true,
    notes:
      "Sent the full-service proposal Oct 1. Haven't heard back — Pooja was traveling last week.",
    onAnanyaPlatform: false,
  },

  // ─────────── ACTIVE (8) ───────────
  {
    id: "priya-arjun",
    stage: "active",
    partnerOne: "Priya Sharma",
    partnerTwo: "Arjun Kapoor",
    email: "priya.sharma@gmail.com",
    phone: "(201) 555-0112",
    weddingDateDisplay: "Oct 15-17, 2026",
    weddingDateISO: "2026-10-15",
    location: "Pompton Plains, NJ",
    venue: "The Legacy Castle",
    guestCount: 425,
    weddingType: "Hindu",
    eventDays: 3,
    events: ["Sangeet", "Mehndi", "Haldi", "Ceremony", "Reception"],
    budget: "$450K",
    budgetValue: 450000,
    source: "Referral",
    vendorsBooked: 18,
    vendorsTotal: 22,
    percentComplete: 82,
    onAnanyaPlatform: true,
  },
  {
    id: "neha-vikram",
    stage: "active",
    partnerOne: "Neha Gupta",
    partnerTwo: "Vikram Malhotra",
    email: "neha.gupta@gmail.com",
    phone: "(516) 555-0156",
    weddingDateDisplay: "Nov 8-10, 2026",
    weddingDateISO: "2026-11-08",
    location: "Huntington, NY",
    venue: "Oheka Castle",
    guestCount: 350,
    weddingType: "Hindu",
    eventDays: 3,
    events: ["Mehndi", "Ceremony", "Reception"],
    budget: "$380K",
    budgetValue: 380000,
    source: "Website",
    vendorsBooked: 15,
    vendorsTotal: 19,
    percentComplete: 79,
    onAnanyaPlatform: true,
  },
  {
    id: "anita-raj",
    stage: "active",
    partnerOne: "Anita Desai",
    partnerTwo: "Raj Bhatt",
    email: "anita.desai@gmail.com",
    phone: "(212) 555-0167",
    weddingDateDisplay: "Dec 12-14, 2026",
    weddingDateISO: "2026-12-12",
    location: "Cancun, Mexico",
    venue: "Dreams Riviera",
    destination: true,
    guestCount: 200,
    weddingType: "Hindu",
    eventDays: 3,
    events: ["Mehndi", "Sangeet", "Haldi", "Ceremony", "Reception"],
    budget: "$420K",
    budgetValue: 420000,
    source: "Ananya",
    vendorsBooked: 8,
    vendorsTotal: 20,
    percentComplete: 40,
    onAnanyaPlatform: true,
  },
  {
    id: "divya-rohan",
    stage: "active",
    partnerOne: "Divya Menon",
    partnerTwo: "Rohan Kapoor",
    email: "divya.menon@gmail.com",
    phone: "(732) 555-0144",
    weddingDateDisplay: "Jan 17-18, 2027",
    weddingDateISO: "2027-01-17",
    location: "Edison, NJ",
    venue: "Royal Albert's Palace",
    guestCount: 475,
    weddingType: "Hindu",
    eventDays: 2,
    events: ["Sangeet", "Ceremony", "Reception"],
    budget: "$360K",
    budgetValue: 360000,
    source: "Instagram",
    vendorsBooked: 13,
    vendorsTotal: 18,
    percentComplete: 72,
    onAnanyaPlatform: true,
  },
  {
    id: "kavya-shaan",
    stage: "active",
    partnerOne: "Kavya Reddy",
    partnerTwo: "Shaan Khurana",
    email: "kavya.reddy@gmail.com",
    phone: "(917) 555-0188",
    weddingDateDisplay: "Feb 20-22, 2027",
    weddingDateISO: "2027-02-20",
    location: "Miami, FL",
    venue: "Fontainebleau",
    guestCount: 280,
    weddingType: "Fusion",
    eventDays: 3,
    events: ["Haldi", "Sangeet", "Ceremony", "Reception"],
    budget: "$320K",
    budgetValue: 320000,
    source: "Referral",
    vendorsBooked: 9,
    vendorsTotal: 18,
    percentComplete: 50,
    onAnanyaPlatform: true,
  },
  {
    id: "shreya-dhruv",
    stage: "active",
    partnerOne: "Shreya Iyengar",
    partnerTwo: "Dhruv Shenoy",
    email: "shreya.iyengar@gmail.com",
    phone: "(408) 555-0177",
    weddingDateDisplay: "Mar 7-9, 2027",
    weddingDateISO: "2027-03-07",
    location: "San Jose, CA",
    venue: "The Fairmont",
    guestCount: 325,
    weddingType: "Hindu",
    eventDays: 3,
    events: ["Mehndi", "Sangeet", "Ceremony", "Reception"],
    budget: "$390K",
    budgetValue: 390000,
    source: "Website",
    vendorsBooked: 11,
    vendorsTotal: 20,
    percentComplete: 55,
    onAnanyaPlatform: true,
  },
  {
    id: "zara-imran",
    stage: "active",
    partnerOne: "Zara Ahmed",
    partnerTwo: "Imran Sayeed",
    email: "zara.ahmed@gmail.com",
    phone: "(718) 555-0199",
    weddingDateDisplay: "Apr 3-5, 2027",
    weddingDateISO: "2027-04-03",
    location: "Brooklyn, NY",
    venue: "Weylin",
    guestCount: 250,
    weddingType: "Muslim",
    eventDays: 3,
    events: ["Mehndi", "Nikah", "Walima", "Reception"],
    budget: "$300K",
    budgetValue: 300000,
    source: "Instagram",
    vendorsBooked: 7,
    vendorsTotal: 16,
    percentComplete: 44,
    onAnanyaPlatform: true,
  },
  {
    id: "aanya-karthik",
    stage: "active",
    partnerOne: "Aanya Iyer",
    partnerTwo: "Karthik Rao",
    email: "aanya.iyer@gmail.com",
    phone: "(510) 555-0165",
    weddingDateDisplay: "May 15-17, 2027",
    weddingDateISO: "2027-05-15",
    location: "Napa, CA",
    venue: "Meritage Resort",
    guestCount: 180,
    weddingType: "Hindu",
    eventDays: 3,
    events: ["Haldi", "Sangeet", "Ceremony", "Reception"],
    budget: "$340K",
    budgetValue: 340000,
    source: "Ananya",
    vendorsBooked: 5,
    vendorsTotal: 18,
    percentComplete: 28,
    onAnanyaPlatform: true,
  },

  // ─────────── COMPLETED (2 shown, "22 this year" in header) ───────────
  {
    id: "isha-rohan-completed",
    stage: "completed",
    partnerOne: "Isha Agarwal",
    partnerTwo: "Rohan Mehta",
    email: "isha.agarwal@gmail.com",
    weddingDateDisplay: "Sep 20, 2026",
    weddingDateISO: "2026-09-20",
    location: "NYC",
    venue: "The Pierre",
    guestCount: 320,
    weddingType: "Hindu",
    eventDays: 2,
    events: ["Sangeet", "Ceremony", "Reception"],
    budget: "$395K",
    budgetValue: 395000,
    source: "Website",
    completedDateDisplay: "Sep 20, 2026",
    onAnanyaPlatform: true,
  },
  {
    id: "leela-harish-completed",
    stage: "completed",
    partnerOne: "Leela Krishnan",
    partnerTwo: "Harish Varma",
    email: "leela.krishnan@gmail.com",
    weddingDateDisplay: "Aug 30, 2026",
    weddingDateISO: "2026-08-30",
    location: "Austin, TX",
    venue: "Barr Mansion",
    guestCount: 210,
    weddingType: "Hindu",
    eventDays: 3,
    events: ["Haldi", "Mehndi", "Ceremony", "Reception"],
    budget: "$270K",
    budgetValue: 270000,
    source: "Referral",
    completedDateDisplay: "Aug 30, 2026",
    onAnanyaPlatform: true,
  },
];

// Header/stats for the page.
export const PIPELINE_STATS = {
  inquiry: 3,
  consultation: 2,
  proposal: 1,
  active: 8,
  completedThisYear: 22,
};

// Pipeline analytics — conversion funnel (trailing-12-month figures).
export type FunnelStep = {
  label: string;
  count: number;
  conversionFromPrior?: string; // e.g. "67%"
};

export const CONVERSION_FUNNEL: FunnelStep[] = [
  { label: "Inquiries", count: 48 },
  { label: "Consultations", count: 32, conversionFromPrior: "67%" },
  { label: "Proposals", count: 24, conversionFromPrior: "75%" },
  { label: "Booked", count: 18, conversionFromPrior: "75%" },
];

export const AVG_TIME_IN_STAGE: Record<
  Exclude<PipelineStage, "active" | "completed">,
  string
> = {
  inquiry: "4 days",
  consultation: "9 days",
  proposal: "6 days",
};

export const TOP_SOURCES: { label: InquirySource | "Ananya"; pct: number }[] = [
  { label: "Ananya", pct: 38 },
  { label: "Referral", pct: 27 },
  { label: "Instagram", pct: 19 },
  { label: "Website", pct: 16 },
];

export const WIN_RATE = {
  thisQuarter: 75,
  lastQuarter: 68,
  delta: "+7 pts",
};

export function daysUntilWedding(iso: string, todayISO = "2026-10-05"): number {
  const today = new Date(todayISO);
  const wedding = new Date(iso);
  return Math.round(
    (wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function fullName(card: CoupleCard): string {
  const first = (s: string) => s.split(" ")[0];
  return `${first(card.partnerOne)} & ${first(card.partnerTwo)}`;
}
