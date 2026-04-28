// Mock data for the venue inquiry pipeline (kanban board of leads).
// Today pinned to 2026-10-03 so deltas read consistently across the demo.

import type { CeremonyType, InquirySource } from "@/lib/venue/seed";

export type LeadStage = "new" | "tour" | "proposal" | "booked" | "lost";

export type BrowsedShowcase = {
  id: string;
  coupleNames: string;
  ceremonyType: CeremonyType;
  guestCount: number;
  timeSpentLabel: string; // e.g. "4 min 12 sec"
  timeSpentSeconds: number;
  spacesViewed: string[];
};

export type ConversationMessage = {
  from: "couple" | "venue";
  author: string;
  timestamp: string; // e.g. "Oct 3, 11:47 AM"
  body: string;
};

export type Lead = {
  id: string;
  stage: LeadStage;
  coupleNames: string;

  // Basics
  estimatedDate: string; // "Mar 2027"
  datesFlexible?: boolean;
  guestCount: number;
  ceremonyType: CeremonyType;
  duration: string; // "3-day"
  events?: string[];

  // Money / planner
  budget?: string;
  budgetVenueEst?: string;
  plannerName?: string | null;
  plannerLead?: string;

  // Source
  source: InquirySource;
  sourceDetail?: string;
  sourceReason?: string; // "Ananya recommended … because …"

  // Contact
  email?: string;
  phone?: string;

  // Message from couple
  message?: string;

  // Browsing intelligence
  browsed?: BrowsedShowcase[];
  browsedInsight?: string;
  spacesViewedSummary?: string[]; // "Grand Ballroom (all 5)"

  // New-inquiry meta
  receivedLabel?: string; // "2 hours ago"
  urgent?: boolean; // red dot / fresh lead

  // Tour-specific
  tourDate?: string; // "Oct 12, 2pm"
  tourDaysAway?: number;
  tourNotes?: string;
  spacesToShow?: { name: string; checked: boolean }[];

  // Proposal-specific
  proposalDate?: string; // "Oct 1"
  proposalAmount?: string; // "$85,000"
  proposalPackage?: string; // "Full Weekend"
  proposalFollowUpDays?: number; // days with no response

  // Booked-specific
  bookedDates?: string; // "Oct 15-17, 2026"
  bookedAmount?: string;
  contractSigned?: boolean;
  depositPaid?: boolean;
  weddingId?: string;
  vendorsBooked?: number;
  vendorsTotal?: number;

  // Lost-specific
  lostReason?: string;

  // Thread
  conversation?: ConversationMessage[];
};

export const LEADS: Lead[] = [
  // ────────────────────────── NEW INQUIRIES (5) ──────────────────────────
  {
    id: "simran-dev",
    stage: "new",
    coupleNames: "Simran & Dev",
    estimatedDate: "March 2027",
    datesFlexible: true,
    guestCount: 400,
    ceremonyType: "Hindu",
    duration: "3-day",
    events: ["Sangeet", "Mehndi", "Haldi", "Ceremony", "Reception"],
    budget: "$300K+",
    budgetVenueEst: "$80–100K for venue",
    plannerName: null,
    source: "Ananya AI Recommendation",
    sourceReason:
      "Ananya recommended The Legacy Castle because it has hosted 8 Hindu weddings with 400+ guests in the past year.",
    email: "simran@email.com",
    phone: "(201) 555-0123",
    receivedLabel: "2 hours ago",
    urgent: true,
    message:
      "We're planning a traditional Hindu wedding for 400 guests and loved seeing the photos from Priya & Arjun's wedding. We'd love to schedule a tour. Are weekends in October available?",
    browsed: [
      {
        id: "priya-arjun",
        coupleNames: "Priya & Arjun",
        ceremonyType: "Hindu",
        guestCount: 425,
        timeSpentLabel: "4 min 12 sec",
        timeSpentSeconds: 252,
        spacesViewed: ["Grand Ballroom", "Garden Terrace", "Courtyard"],
      },
      {
        id: "deepa-kunal",
        coupleNames: "Deepa & Kunal",
        ceremonyType: "Hindu",
        guestCount: 500,
        timeSpentLabel: "3 min 45 sec",
        timeSpentSeconds: 225,
        spacesViewed: ["Grand Ballroom", "Garden Terrace"],
      },
      {
        id: "jasleen-harpreet",
        coupleNames: "Jasleen & Harpreet",
        ceremonyType: "Sikh",
        guestCount: 280,
        timeSpentLabel: "1 min 30 sec",
        timeSpentSeconds: 90,
        spacesViewed: ["Grand Ballroom"],
      },
      {
        id: "neha-vikram",
        coupleNames: "Neha & Vikram",
        ceremonyType: "Hindu",
        guestCount: 350,
        timeSpentLabel: "2 min 20 sec",
        timeSpentSeconds: 140,
        spacesViewed: ["Grand Ballroom", "Courtyard"],
      },
      {
        id: "fatima-ali",
        coupleNames: "Fatima & Ali",
        ceremonyType: "Muslim",
        guestCount: 250,
        timeSpentLabel: "0 min 45 sec",
        timeSpentSeconds: 45,
        spacesViewed: ["Grand Ballroom"],
      },
    ],
    browsedInsight: "Large Hindu weddings (400+)",
    spacesViewedSummary: [
      "Grand Ballroom (all 5)",
      "Garden Terrace (3 of 5)",
      "Courtyard (2 of 5)",
    ],
    conversation: [
      {
        from: "couple",
        author: "Simran Kaur",
        timestamp: "Oct 3, 11:47 AM",
        body:
          "Hi! Dev and I are planning our wedding for March 2027 and The Legacy Castle caught our eye after seeing Priya & Arjun's weekend there. Could we book a tour?",
      },
    ],
  },
  {
    id: "anika-sam",
    stage: "new",
    coupleNames: "Anika & Sam",
    estimatedDate: "Aug 2027",
    guestCount: 300,
    ceremonyType: "Sikh",
    duration: "2-day",
    budget: "$250K",
    plannerName: "CG & Co Events",
    source: "Ananya Search",
    receivedLabel: "8 hours ago",
    urgent: true,
    browsed: [
      {
        id: "jasleen-harpreet",
        coupleNames: "Jasleen & Harpreet",
        ceremonyType: "Sikh",
        guestCount: 280,
        timeSpentLabel: "5 min 20 sec",
        timeSpentSeconds: 320,
        spacesViewed: ["Grand Ballroom", "Courtyard"],
      },
      {
        id: "kiran-jaspreet",
        coupleNames: "Kiran & Jaspreet",
        ceremonyType: "Sikh",
        guestCount: 320,
        timeSpentLabel: "3 min 10 sec",
        timeSpentSeconds: 190,
        spacesViewed: ["Courtyard", "Garden Terrace"],
      },
    ],
    browsedInsight: "Sikh ceremonies with outdoor courtyard",
  },
  {
    id: "riya-sahil",
    stage: "new",
    coupleNames: "Riya & Sahil",
    estimatedDate: "Oct 2027",
    guestCount: 220,
    ceremonyType: "Fusion",
    duration: "2-day",
    budget: "$220K",
    plannerName: null,
    source: "Direct",
    sourceDetail: "Instagram",
    receivedLabel: "1 day ago",
    browsed: [
      {
        id: "tara-omar",
        coupleNames: "Tara & Omar",
        ceremonyType: "Fusion",
        guestCount: 210,
        timeSpentLabel: "6 min 05 sec",
        timeSpentSeconds: 365,
        spacesViewed: ["Garden Terrace", "Indoor Pavilion"],
      },
    ],
    browsedInsight: "Intimate fusion with garden ceremony",
  },
  {
    id: "ananya-rohit",
    stage: "new",
    coupleNames: "Ananya & Rohit",
    estimatedDate: "May 2027",
    guestCount: 450,
    ceremonyType: "Hindu",
    duration: "3-day",
    budget: "$400K",
    plannerName: "Radz Events",
    source: "Planner Referral",
    sourceDetail: "Radz Events",
    receivedLabel: "2 days ago",
    browsed: [
      {
        id: "priya-arjun",
        coupleNames: "Priya & Arjun",
        ceremonyType: "Hindu",
        guestCount: 425,
        timeSpentLabel: "7 min 30 sec",
        timeSpentSeconds: 450,
        spacesViewed: ["Grand Ballroom", "Garden Terrace", "Courtyard"],
      },
      {
        id: "rhea-anand",
        coupleNames: "Rhea & Anand",
        ceremonyType: "Hindu",
        guestCount: 400,
        timeSpentLabel: "4 min 12 sec",
        timeSpentSeconds: 252,
        spacesViewed: ["Grand Ballroom", "Garden Terrace"],
      },
    ],
    browsedInsight: "Full-weekend Hindu weddings (400+)",
  },
  {
    id: "zoya-amir",
    stage: "new",
    coupleNames: "Zoya & Amir",
    estimatedDate: "Sep 2027",
    guestCount: 260,
    ceremonyType: "Muslim",
    duration: "2-day",
    budget: "$275K",
    plannerName: null,
    source: "Ananya AI Recommendation",
    receivedLabel: "3 days ago",
    browsed: [
      {
        id: "fatima-ali",
        coupleNames: "Fatima & Ali",
        ceremonyType: "Muslim",
        guestCount: 250,
        timeSpentLabel: "2 min 40 sec",
        timeSpentSeconds: 160,
        spacesViewed: ["Grand Ballroom", "Indoor Pavilion"],
      },
    ],
    browsedInsight: "Mid-size Muslim weddings",
  },

  // ────────────────────────── TOUR SCHEDULED (3) ──────────────────────────
  {
    id: "meera-karan",
    stage: "tour",
    coupleNames: "Meera & Karan",
    estimatedDate: "June 2027",
    guestCount: 200,
    ceremonyType: "Fusion",
    duration: "2-day",
    budget: "$350K",
    plannerName: "Radz Events",
    plannerLead: "Urvashi Menon",
    source: "Planner Referral",
    sourceDetail: "Radz Events",
    tourDate: "Oct 12, 2pm",
    tourDaysAway: 9,
    tourNotes:
      "Interested in outdoor ceremony. Coming with both mothers.",
    spacesToShow: [
      { name: "Garden Terrace", checked: true },
      { name: "Grand Ballroom", checked: true },
      { name: "Courtyard", checked: false },
      { name: "Indoor Pavilion", checked: false },
    ],
    browsed: [
      {
        id: "tara-omar",
        coupleNames: "Tara & Omar",
        ceremonyType: "Fusion",
        guestCount: 210,
        timeSpentLabel: "5 min 10 sec",
        timeSpentSeconds: 310,
        spacesViewed: ["Garden Terrace"],
      },
    ],
    browsedInsight: "Outdoor ceremony fusion",
  },
  {
    id: "tasha-leo",
    stage: "tour",
    coupleNames: "Tasha & Leo",
    estimatedDate: "Aug 2027",
    guestCount: 275,
    ceremonyType: "Interfaith",
    duration: "2-day",
    budget: "$290K",
    plannerName: null,
    source: "Ananya Search",
    tourDate: "Oct 18, 11am",
    tourDaysAway: 15,
    tourNotes: "Wants to see ballroom flow for reception dinner.",
    spacesToShow: [
      { name: "Grand Ballroom", checked: true },
      { name: "Garden Terrace", checked: false },
      { name: "Indoor Pavilion", checked: true },
    ],
  },
  {
    id: "pallavi-jay",
    stage: "tour",
    coupleNames: "Pallavi & Jay",
    estimatedDate: "May 2027",
    guestCount: 320,
    ceremonyType: "Hindu",
    duration: "3-day",
    budget: "$340K",
    plannerName: "CG & Co Events",
    plannerLead: "Chirag Gupta",
    source: "Planner Referral",
    sourceDetail: "CG & Co Events",
    tourDate: "Oct 24, 3pm",
    tourDaysAway: 21,
    tourNotes: "Bringing videographer for walk-through.",
    spacesToShow: [
      { name: "Grand Ballroom", checked: true },
      { name: "Garden Terrace", checked: true },
      { name: "Courtyard", checked: true },
      { name: "Indoor Pavilion", checked: false },
    ],
  },

  // ────────────────────────── PROPOSAL SENT (2) ──────────────────────────
  {
    id: "pooja-amit",
    stage: "proposal",
    coupleNames: "Pooja & Amit",
    estimatedDate: "Feb 2027",
    guestCount: 350,
    ceremonyType: "Hindu",
    duration: "2-day",
    plannerName: "Radz Events",
    source: "Planner Referral",
    sourceDetail: "Radz Events",
    proposalDate: "Oct 1",
    proposalAmount: "$85,000",
    proposalPackage: "Full Weekend",
    proposalFollowUpDays: 4,
  },
  {
    id: "naina-varun",
    stage: "proposal",
    coupleNames: "Naina & Varun",
    estimatedDate: "Apr 2027",
    guestCount: 275,
    ceremonyType: "Hindu",
    duration: "2-day",
    plannerName: null,
    source: "Ananya Search",
    proposalDate: "Sep 30",
    proposalAmount: "$68,500",
    proposalPackage: "Two-Day Ceremony + Reception",
    proposalFollowUpDays: 1,
  },

  // ────────────────────────── BOOKED (8) ──────────────────────────
  {
    id: "priya-arjun",
    stage: "booked",
    coupleNames: "Priya & Arjun",
    estimatedDate: "Oct 15-17, 2026",
    bookedDates: "Oct 15-17, 2026",
    guestCount: 425,
    ceremonyType: "Hindu",
    duration: "3-day",
    plannerName: "Radz Events",
    plannerLead: "Urvashi Menon",
    source: "Planner Referral",
    contractSigned: true,
    depositPaid: true,
    bookedAmount: "$95,000",
    weddingId: "priya-arjun",
    vendorsBooked: 18,
    vendorsTotal: 22,
  },
  {
    id: "neha-vikram",
    stage: "booked",
    coupleNames: "Neha & Vikram",
    estimatedDate: "Nov 8-10, 2026",
    bookedDates: "Nov 8-10, 2026",
    guestCount: 350,
    ceremonyType: "Hindu",
    duration: "3-day",
    plannerName: "CG & Co Events",
    plannerLead: "Chirag Gupta",
    source: "Planner Referral",
    contractSigned: true,
    depositPaid: true,
    bookedAmount: "$82,000",
    weddingId: "neha-vikram",
    vendorsBooked: 15,
    vendorsTotal: 19,
  },
  {
    id: "sarah-mike",
    stage: "booked",
    coupleNames: "Sarah & Mike",
    estimatedDate: "Oct 22, 2026",
    bookedDates: "Oct 22, 2026",
    guestCount: 180,
    ceremonyType: "Interfaith",
    duration: "1-day",
    plannerName: null,
    source: "Direct",
    contractSigned: true,
    depositPaid: true,
    bookedAmount: "$42,500",
    weddingId: "sarah-mike",
    vendorsBooked: 12,
    vendorsTotal: 14,
  },
  {
    id: "reema-kabir",
    stage: "booked",
    coupleNames: "Reema & Kabir",
    estimatedDate: "Dec 5, 2026",
    bookedDates: "Dec 5, 2026",
    guestCount: 240,
    ceremonyType: "Hindu",
    duration: "2-day",
    plannerName: "Radz Events",
    source: "Planner Referral",
    contractSigned: true,
    depositPaid: true,
    bookedAmount: "$61,000",
    vendorsBooked: 11,
    vendorsTotal: 16,
  },
  {
    id: "farah-nadir",
    stage: "booked",
    coupleNames: "Farah & Nadir",
    estimatedDate: "Jan 16, 2027",
    bookedDates: "Jan 16, 2027",
    guestCount: 310,
    ceremonyType: "Muslim",
    duration: "2-day",
    plannerName: null,
    source: "Ananya AI Recommendation",
    contractSigned: true,
    depositPaid: false,
    bookedAmount: "$72,000",
    vendorsBooked: 6,
    vendorsTotal: 14,
  },
  {
    id: "amrit-jaya",
    stage: "booked",
    coupleNames: "Amrit & Jaya",
    estimatedDate: "Feb 13, 2027",
    bookedDates: "Feb 13, 2027",
    guestCount: 265,
    ceremonyType: "Sikh",
    duration: "2-day",
    plannerName: "CG & Co Events",
    source: "Planner Referral",
    contractSigned: true,
    depositPaid: true,
    bookedAmount: "$64,500",
    vendorsBooked: 9,
    vendorsTotal: 15,
  },
  {
    id: "isha-dhruv",
    stage: "booked",
    coupleNames: "Isha & Dhruv",
    estimatedDate: "Mar 20, 2027",
    bookedDates: "Mar 20, 2027",
    guestCount: 400,
    ceremonyType: "Hindu",
    duration: "3-day",
    plannerName: "Radz Events",
    plannerLead: "Urvashi Menon",
    source: "Ananya Search",
    contractSigned: true,
    depositPaid: true,
    bookedAmount: "$91,000",
    vendorsBooked: 4,
    vendorsTotal: 20,
  },
  {
    id: "divya-sameer",
    stage: "booked",
    coupleNames: "Divya & Sameer",
    estimatedDate: "Apr 10, 2027",
    bookedDates: "Apr 10, 2027",
    guestCount: 290,
    ceremonyType: "Hindu",
    duration: "2-day",
    plannerName: null,
    source: "Direct",
    contractSigned: false,
    depositPaid: false,
    bookedAmount: "$67,500",
    vendorsBooked: 2,
    vendorsTotal: 16,
  },

  // ────────────────────────── LOST (2) ──────────────────────────
  {
    id: "kavya-rahul",
    stage: "lost",
    coupleNames: "Kavya & Rahul",
    estimatedDate: "Apr 2027",
    guestCount: 300,
    ceremonyType: "Hindu",
    duration: "2-day",
    source: "Ananya Search",
    lostReason: "Chose Oheka Castle — preferred outdoor ceremony space",
  },
  {
    id: "aarti-devan",
    stage: "lost",
    coupleNames: "Aarti & Devan",
    estimatedDate: "Jul 2027",
    guestCount: 240,
    ceremonyType: "Fusion",
    duration: "2-day",
    source: "Planner Referral",
    lostReason: "Budget fit — moved to a smaller estate venue in NJ",
  },
];

export const LEAD_PIPELINE: { stage: LeadStage; title: string; eyebrow?: string }[] = [
  { stage: "new", title: "New Inquiries" },
  { stage: "tour", title: "Tour Scheduled" },
  { stage: "proposal", title: "Proposal Sent" },
  { stage: "booked", title: "Booked", eyebrow: "This year" },
  { stage: "lost", title: "Lost" },
];

export function leadsByStage(stage: LeadStage): Lead[] {
  return LEADS.filter((l) => l.stage === stage);
}

export function findLead(id: string): Lead | undefined {
  return LEADS.find((l) => l.id === id);
}
