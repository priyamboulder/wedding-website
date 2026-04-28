// Seed data for the vendor portal. The logged-in vendor (Aurora Studios) now
// lives on the unified vendor record in lib/vendor-unified-seed.ts — pages
// read it from vendors-store. This file still carries portal-only data:
// inquiries, weddings, reviews, calendar entries, messages, etc.
//
// Portal-wide display stats that used to be hardcoded on the VENDOR constant
// (profile views, inquiries-last-week) are analytics counters; keep them as
// plain constants here for the dashboard until the analytics backend is
// wired up.

export const PORTAL_ANALYTICS = {
  profileViews: 1247,
  profileViewsDelta: 18,
  inquiriesLastWeek: 3,
  responseRate: 98,
  memberSince: "March 2024",
};

export type WeddingTask = {
  id: string;
  label: string;
  dueDate: string;
  done: boolean;
  sharedWithCouple: boolean;
};

export type WeddingDocument = {
  id: string;
  name: string;
  kind: "contract" | "proposal" | "invoice" | "moodboard" | "other";
  size: string;
  uploadedAt: string;
  sharedWithCouple: boolean;
};

export type WeddingNote = {
  id: string;
  body: string;
  addedAt: string;
};

export type WeddingPayment = {
  id: string;
  label: string;
  amount: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paidOn?: string;
};

export type WeddingEvent = {
  name: string;
  date: string;
  venue: string;
  guests: number;
};

export type WeddingContact = {
  brideName: string;
  groomName: string;
  email: string;
  phone: string;
  plannerName?: string;
};

export type Wedding = {
  id: string;
  coupleName: string;
  weddingDate: string;
  city: string;
  venue: string;
  package: string;
  amount: string;
  paidPct: number;
  status: "contracted" | "in-flight" | "delivered";
  daysAway: number;
  nextMilestone: { label: string; date: string };
  openTasks: number;
  events: WeddingEvent[];
  totalGuests: number;
  contact: WeddingContact;
  threadId?: string;
  threadPreview: string;
  tasks: WeddingTask[];
  documents: WeddingDocument[];
  privateNotes: WeddingNote[];
  payments: WeddingPayment[];
  portfolioItemIds?: string[];
};

export const WEDDINGS: Wedding[] = [
  {
    id: "wed-001",
    coupleName: "Riya & Karan",
    weddingDate: "May 17–19, 2026",
    city: "Udaipur",
    venue: "Taj Lake Palace",
    package: "Editorial 3-day + album",
    amount: "₹11,50,000",
    paidPct: 50,
    status: "in-flight",
    daysAway: 28,
    nextMilestone: { label: "Pre-wedding shoot", date: "May 2" },
    openTasks: 4,
    events: [
      { name: "Mehendi", date: "May 17, 2026", venue: "Taj Lake Palace — courtyard", guests: 180 },
      { name: "Sangeet", date: "May 17, 2026", venue: "Taj Lake Palace — ballroom", guests: 320 },
      { name: "Wedding", date: "May 18, 2026", venue: "Taj Lake Palace — lakeside mandap", guests: 360 },
      { name: "Reception", date: "May 19, 2026", venue: "Jagmandir Island", guests: 280 },
    ],
    totalGuests: 360,
    contact: {
      brideName: "Riya Khanna",
      groomName: "Karan Malhotra",
      email: "riya.karan.wedding@gmail.com",
      phone: "+91 98765 12345",
      plannerName: "Devika — Coral & Dune Events",
    },
    threadId: "thr-riya-karan",
    threadPreview: "Loved the mood film. Can we push pre-wedding to May 2 — dad's flight lands May 1 late.",
    tasks: [
      { id: "t-1", label: "Send final contract countersigned", dueDate: "Apr 15, 2026", done: true, sharedWithCouple: true },
      { id: "t-2", label: "Confirm second shooter — Aarav", dueDate: "Apr 22, 2026", done: true, sharedWithCouple: false },
      { id: "t-3", label: "Pre-wedding shoot · Lake Pichola", dueDate: "May 2, 2026", done: false, sharedWithCouple: true },
      { id: "t-4", label: "Shot list review call with couple", dueDate: "May 8, 2026", done: false, sharedWithCouple: true },
      { id: "t-5", label: "Setup walkthrough with venue captain", dueDate: "May 16, 2026", done: false, sharedWithCouple: false },
      { id: "t-6", label: "Deliver sneak peeks within 48 hrs", dueDate: "May 21, 2026", done: false, sharedWithCouple: true },
    ],
    documents: [
      { id: "d-1", name: "Signed_Contract_RiyaKaran.pdf", kind: "contract", size: "420 KB", uploadedAt: "Mar 12, 2026", sharedWithCouple: true },
      { id: "d-2", name: "Proposal_Editorial3Day_v3.pdf", kind: "proposal", size: "2.1 MB", uploadedAt: "Feb 28, 2026", sharedWithCouple: true },
      { id: "d-3", name: "Retainer_Invoice_01.pdf", kind: "invoice", size: "180 KB", uploadedAt: "Mar 14, 2026", sharedWithCouple: true },
      { id: "d-4", name: "Moodboard_Lakeside.pdf", kind: "moodboard", size: "8.4 MB", uploadedAt: "Apr 3, 2026", sharedWithCouple: true },
      { id: "d-5", name: "Family_Shot_List_Riya.xlsx", kind: "other", size: "42 KB", uploadedAt: "Apr 8, 2026", sharedWithCouple: false },
    ],
    privateNotes: [
      { id: "n-1", body: "Bride's mother is hearing-impaired — always face her when speaking on the day. Sister Anika (the one with pink lehenga at the engagement) translates.", addedAt: "Mar 20, 2026" },
      { id: "n-2", body: "Karan's father passed last year. Family requested a quiet moment at the mandap before the baraat — build it into the timeline, no photos.", addedAt: "Apr 2, 2026" },
      { id: "n-3", body: "Riya is vegan (no dairy in chai either). Stock oat milk in the photo-team cooler.", addedAt: "Apr 9, 2026" },
    ],
    payments: [
      { id: "p-1", label: "Retainer (50%)", amount: "₹5,75,000", dueDate: "Mar 15, 2026", status: "paid", paidOn: "Mar 14, 2026" },
      { id: "p-2", label: "Mid-payment (25%)", amount: "₹2,87,500", dueDate: "May 10, 2026", status: "pending" },
      { id: "p-3", label: "Final (25%)", amount: "₹2,87,500", dueDate: "Jun 2, 2026", status: "pending" },
    ],
  },
  {
    id: "wed-002",
    coupleName: "Isha & Nikhil",
    weddingDate: "Jun 6–7, 2026",
    city: "Lonavala",
    venue: "Della Resorts",
    package: "2-day coverage + reels",
    amount: "₹7,80,000",
    paidPct: 35,
    status: "contracted",
    daysAway: 48,
    nextMilestone: { label: "Shot list review", date: "May 15" },
    openTasks: 6,
    events: [
      { name: "Sangeet", date: "Jun 6, 2026", venue: "Della Resorts — amphitheatre", guests: 220 },
      { name: "Wedding", date: "Jun 7, 2026", venue: "Della Resorts — valley lawn", guests: 260 },
    ],
    totalGuests: 260,
    contact: {
      brideName: "Isha Rao",
      groomName: "Nikhil Jain",
      email: "hello@ishanikhil.in",
      phone: "+91 99876 00123",
    },
    threadId: "thr-isha-nikhil",
    threadPreview: "Can we add a drone operator for the valley entry? Nikhil's surprise for Isha.",
    tasks: [
      { id: "t-1", label: "Send countersigned contract", dueDate: "Apr 2, 2026", done: true, sharedWithCouple: true },
      { id: "t-2", label: "Retainer invoice", dueDate: "Apr 5, 2026", done: true, sharedWithCouple: true },
      { id: "t-3", label: "Location recce — Della amphitheatre", dueDate: "May 3, 2026", done: false, sharedWithCouple: false },
      { id: "t-4", label: "Confirm drone operator (Pranav)", dueDate: "May 10, 2026", done: false, sharedWithCouple: false },
      { id: "t-5", label: "Shot list review with couple", dueDate: "May 15, 2026", done: false, sharedWithCouple: true },
      { id: "t-6", label: "Reels concept approval", dueDate: "May 22, 2026", done: false, sharedWithCouple: true },
      { id: "t-7", label: "Mid-payment reminder", dueDate: "May 20, 2026", done: false, sharedWithCouple: false },
      { id: "t-8", label: "Pre-event walkthrough", dueDate: "Jun 5, 2026", done: false, sharedWithCouple: false },
    ],
    documents: [
      { id: "d-1", name: "Signed_Contract_IshaNikhil.pdf", kind: "contract", size: "390 KB", uploadedAt: "Apr 3, 2026", sharedWithCouple: true },
      { id: "d-2", name: "Proposal_2Day_Reels.pdf", kind: "proposal", size: "1.8 MB", uploadedAt: "Mar 18, 2026", sharedWithCouple: true },
      { id: "d-3", name: "Retainer_Invoice.pdf", kind: "invoice", size: "160 KB", uploadedAt: "Apr 5, 2026", sharedWithCouple: true },
    ],
    privateNotes: [
      { id: "n-1", body: "Nikhil is planning a surprise musical number mid-sangeet — choreographer Tanya has rehearsal schedule. Do not mention to Isha.", addedAt: "Apr 10, 2026" },
      { id: "n-2", body: "Della in-house team is unreliable — bring our own lav mics for the ceremony.", addedAt: "Apr 12, 2026" },
    ],
    payments: [
      { id: "p-1", label: "Retainer (35%)", amount: "₹2,73,000", dueDate: "Apr 5, 2026", status: "paid", paidOn: "Apr 5, 2026" },
      { id: "p-2", label: "Mid-payment (40%)", amount: "₹3,12,000", dueDate: "May 20, 2026", status: "pending" },
      { id: "p-3", label: "Final (25%)", amount: "₹1,95,000", dueDate: "Jun 20, 2026", status: "pending" },
    ],
  },
  {
    id: "wed-003",
    coupleName: "Tara & Vikram",
    weddingDate: "Jan 24–25, 2027",
    city: "Bangalore",
    venue: "The Leela Palace",
    package: "Full coverage + film",
    amount: "₹14,20,000",
    paidPct: 25,
    status: "contracted",
    daysAway: 280,
    nextMilestone: { label: "Discovery call", date: "May 5" },
    openTasks: 2,
    events: [
      { name: "Wedding", date: "Jan 24, 2027", venue: "The Leela Palace — Royal Hall", guests: 340 },
      { name: "Reception", date: "Jan 25, 2027", venue: "The Leela Palace — Jamavar Garden", guests: 420 },
    ],
    totalGuests: 420,
    contact: {
      brideName: "Tara Menon",
      groomName: "Vikram Shetty",
      email: "tara.menon@outlook.com",
      phone: "+91 97123 45678",
      plannerName: "Kaveri — The Wedding Filer",
    },
    threadId: "thr-tara-vikram",
    threadPreview: "Contract signed. Welcome to the Aurora family — 50% retainer received.",
    tasks: [
      { id: "t-1", label: "Send countersigned contract", dueDate: "Apr 12, 2026", done: true, sharedWithCouple: true },
      { id: "t-2", label: "Discovery call — style, family, timeline", dueDate: "May 5, 2026", done: false, sharedWithCouple: true },
      { id: "t-3", label: "Kickoff workbook to couple", dueDate: "May 20, 2026", done: false, sharedWithCouple: true },
    ],
    documents: [
      { id: "d-1", name: "Signed_Contract_TaraVikram.pdf", kind: "contract", size: "410 KB", uploadedAt: "Apr 12, 2026", sharedWithCouple: true },
      { id: "d-2", name: "Proposal_FullCoverage_Film.pdf", kind: "proposal", size: "2.6 MB", uploadedAt: "Mar 30, 2026", sharedWithCouple: true },
      { id: "d-3", name: "Retainer_Invoice.pdf", kind: "invoice", size: "175 KB", uploadedAt: "Apr 14, 2026", sharedWithCouple: true },
    ],
    privateNotes: [
      { id: "n-1", body: "Both families are South Indian — Vikram is Konkani, Tara is Malayali. Two rituals back-to-back on wedding morning. Build extra buffer.", addedAt: "Apr 14, 2026" },
    ],
    payments: [
      { id: "p-1", label: "Retainer (25%)", amount: "₹3,55,000", dueDate: "Apr 15, 2026", status: "paid", paidOn: "Apr 14, 2026" },
      { id: "p-2", label: "Mid-payment (50%)", amount: "₹7,10,000", dueDate: "Oct 1, 2026", status: "pending" },
      { id: "p-3", label: "Final (25%)", amount: "₹3,55,000", dueDate: "Feb 1, 2027", status: "pending" },
    ],
  },
  {
    id: "wed-004",
    coupleName: "Anjali & Rahul",
    weddingDate: "Mar 22, 2026",
    city: "Mumbai",
    venue: "Grand Hyatt",
    package: "Editorial 2-day",
    amount: "₹6,40,000",
    paidPct: 100,
    status: "delivered",
    daysAway: -29,
    nextMilestone: { label: "Album proofing", date: "Apr 25" },
    openTasks: 1,
    events: [
      { name: "Sangeet", date: "Mar 21, 2026", venue: "Grand Hyatt — Regency Ballroom", guests: 260 },
      { name: "Wedding", date: "Mar 22, 2026", venue: "Grand Hyatt — Residency Lawns", guests: 320 },
    ],
    totalGuests: 320,
    contact: {
      brideName: "Anjali Desai",
      groomName: "Rahul Iyer",
      email: "anjali.desai@me.com",
      phone: "+91 98200 44556",
    },
    threadId: "thr-anjali-rahul",
    threadPreview: "Album sneak peek was perfect. Mom is in tears (good tears). Thank you.",
    tasks: [
      { id: "t-1", label: "Deliver edited gallery (600+)", dueDate: "Apr 12, 2026", done: true, sharedWithCouple: true },
      { id: "t-2", label: "Final album proofing", dueDate: "Apr 25, 2026", done: false, sharedWithCouple: true },
      { id: "t-3", label: "Request portfolio release", dueDate: "Apr 28, 2026", done: false, sharedWithCouple: true },
    ],
    documents: [
      { id: "d-1", name: "Signed_Contract_AnjaliRahul.pdf", kind: "contract", size: "380 KB", uploadedAt: "Jan 8, 2026", sharedWithCouple: true },
      { id: "d-2", name: "Final_Invoice_Paid.pdf", kind: "invoice", size: "190 KB", uploadedAt: "Mar 25, 2026", sharedWithCouple: true },
      { id: "d-3", name: "Album_Draft_v2.pdf", kind: "other", size: "22 MB", uploadedAt: "Apr 18, 2026", sharedWithCouple: true },
    ],
    privateNotes: [
      { id: "n-1", body: "Anjali wants a softer crop on the mandap portraits — less architecture, more her mom's face.", addedAt: "Apr 19, 2026" },
    ],
    payments: [
      { id: "p-1", label: "Retainer (50%)", amount: "₹3,20,000", dueDate: "Jan 10, 2026", status: "paid", paidOn: "Jan 9, 2026" },
      { id: "p-2", label: "Mid-payment (25%)", amount: "₹1,60,000", dueDate: "Mar 1, 2026", status: "paid", paidOn: "Mar 1, 2026" },
      { id: "p-3", label: "Final (25%)", amount: "₹1,60,000", dueDate: "Mar 25, 2026", status: "paid", paidOn: "Mar 25, 2026" },
    ],
    portfolioItemIds: ["port-anjali-rahul-mandap", "port-anjali-rahul-sangeet"],
  },
];

export type Review = {
  id: string;
  coupleName: string;
  weddingDate: string;
  eventType: string;
  rating: number;
  title: string;
  body: string;
  response?: string;
  postedAt: string;
  featured?: boolean;
};

export const REVIEWS: Review[] = [
  {
    id: "rev-001",
    coupleName: "Anjali & Rahul",
    weddingDate: "Mar 2026",
    eventType: "3-event wedding",
    rating: 5,
    title: "She captured feelings we didn't know we had",
    body: "Priya has the calm of someone who's seen a hundred weddings and the eye of someone seeing one for the first time. Creative framing, incredibly responsive over WhatsApp, and our haldi frames still make my mother cry.",
    postedAt: "2 weeks ago",
    featured: true,
  },
  {
    id: "rev-002",
    coupleName: "Devika & Sameer",
    weddingDate: "Feb 2026",
    eventType: "Wedding + Reception",
    rating: 5,
    title: "Editorial without being cold",
    body: "We wanted the Vogue cover feel without losing warmth. Aurora Studios nailed it — the candid moments land harder than the posed ones. Responsive to every late-night message. Exceeded expectations on the album.",
    response: "Devika, Sameer — thank you. The chaiwallah portrait is still my favorite from the whole season.",
    postedAt: "5 weeks ago",
    featured: true,
  },
  {
    id: "rev-003",
    coupleName: "Nisha & Arman",
    weddingDate: "Dec 2025",
    eventType: "Wedding ceremony",
    rating: 4,
    title: "Stunning work, slightly slow on delivery",
    body: "The photos are genuinely gorgeous and the team was creative with the mandap lighting. Album took about two weeks longer than promised — worth the wait but worth mentioning.",
    postedAt: "3 months ago",
  },
  {
    id: "rev-004",
    coupleName: "Ira & Kabir",
    weddingDate: "Nov 2025",
    eventType: "4-event wedding",
    rating: 5,
    title: "Calm, warm, and unbelievably creative",
    body: "Four events across three cities and not a single missed moment. The team was calm under pressure, endlessly creative, and blended into our family like they'd known us for years. Exceeded every expectation.",
    response: "Ira, Kabir — the Jaipur rooftop still feels unreal. Thank you for trusting us across all four cities.",
    postedAt: "4 months ago",
    featured: true,
  },
  {
    id: "rev-005",
    coupleName: "Tara & Vivaan",
    weddingDate: "Oct 2025",
    eventType: "Sangeet + Wedding",
    rating: 5,
    title: "Worth every rupee and then some",
    body: "Professional, warm, and responsive from the first call. The sangeet reel they delivered a week later is still the most-shared video in our family WhatsApp. Creative direction on the couple portraits was extraordinary.",
    postedAt: "5 months ago",
  },
  {
    id: "rev-006",
    coupleName: "Meera & Arjun",
    weddingDate: "Sep 2025",
    eventType: "Haldi + Wedding",
    rating: 5,
    title: "They made my nani feel like the bride",
    body: "What I loved most — they photographed my grandmother like she was the center of the day. Warm, patient, creative, and the response time on edits was unreal. Would recommend to anyone who cares about the older generation getting seen.",
    response: "Meera — your nani stole the show and we were lucky to witness it.",
    postedAt: "7 months ago",
  },
  {
    id: "rev-007",
    coupleName: "Kiara & Dev",
    weddingDate: "Aug 2025",
    eventType: "Reception",
    rating: 4,
    title: "Beautiful photos, communication could be tighter",
    body: "The final gallery is beautiful and creative. Communication in the lead-up was a little slow — a few messages took 2-3 days to get a reply. Once they were on site though, completely dialed in.",
    postedAt: "8 months ago",
  },
  {
    id: "rev-008",
    coupleName: "Saanvi & Neel",
    weddingDate: "Jul 2025",
    eventType: "3-event wedding",
    rating: 5,
    title: "Exceeded every expectation, quietly",
    body: "No ego, no fuss, just relentlessly good work. They anticipated moments before we did. Responsive to every last-minute change. The bidaai sequence is the most beautiful thing I own.",
    response: "Saanvi, Neel — grateful. You made it easy by being so present with each other.",
    postedAt: "9 months ago",
    featured: true,
  },
];

export type ReviewRequest = {
  id: string;
  coupleName: string;
  email: string;
  eventType?: string;
  weddingDate?: string;
  sentAt: string;
  status: "sent" | "opened" | "reminded";
};

export const REVIEW_REQUESTS: ReviewRequest[] = [
  {
    id: "rq-001",
    coupleName: "Rhea & Jai",
    email: "rhea.jai@gmail.com",
    eventType: "Wedding + Reception",
    weddingDate: "Jun 2025",
    sentAt: "3 days ago",
    status: "opened",
  },
  {
    id: "rq-002",
    coupleName: "Aisha & Rohan",
    email: "aisha.weds@gmail.com",
    eventType: "Sangeet + Wedding",
    weddingDate: "May 2025",
    sentAt: "9 days ago",
    status: "reminded",
  },
];

export type Service = {
  id: string;
  name: string;
  category: "coverage" | "albums" | "addons";
  price: string;
  duration: string;
  description: string;
  bookings: number;
  featured: boolean;
};

export const SERVICES: Service[] = [
  {
    id: "svc-001",
    name: "Editorial Full-Day Coverage",
    category: "coverage",
    price: "₹3,80,000",
    duration: "12 hrs · 1 photographer",
    description: "Candid + posed storytelling across a single event day. Includes 400+ edited images.",
    bookings: 14,
    featured: true,
  },
  {
    id: "svc-002",
    name: "Signature 3-Day Wedding",
    category: "coverage",
    price: "₹11,50,000",
    duration: "3 days · lead + second shooter",
    description: "Our flagship — full ceremony arc with a second shooter, behind-the-scenes film, and an editorial album.",
    bookings: 22,
    featured: true,
  },
  {
    id: "svc-003",
    name: "Pre-Wedding Story",
    category: "coverage",
    price: "₹1,20,000",
    duration: "Half-day on location",
    description: "A pre-wedding narrative shoot — not a photoshoot. We travel with you.",
    bookings: 9,
    featured: false,
  },
  {
    id: "svc-004",
    name: "Heirloom Leather Album",
    category: "albums",
    price: "₹85,000",
    duration: "60 pages · hand-bound",
    description: "Italian leather, archival print, personal monogram. Made with Bespoke Bindery, Jaipur.",
    bookings: 18,
    featured: true,
  },
  {
    id: "svc-005",
    name: "Parents' Twin Album",
    category: "albums",
    price: "₹65,000",
    duration: "Two 40-page albums",
    description: "Same layout, two copies — for the bride's and groom's families.",
    bookings: 11,
    featured: false,
  },
  {
    id: "svc-006",
    name: "Reel + Highlight Film",
    category: "addons",
    price: "₹1,40,000",
    duration: "90-sec reel + 4-min film",
    description: "Vertical reel for socials plus a longer highlight film. Shot alongside stills on the day.",
    bookings: 16,
    featured: true,
  },
];

export type Notification = {
  id: string;
  kind: "inquiry" | "booking" | "payment" | "review" | "system";
  message: string;
  timeAgo: string;
  unread: boolean;
};

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", kind: "inquiry", message: "New inquiry from Ananya & Rohan for Nov 22 in Udaipur.", timeAgo: "12m", unread: true },
  { id: "n2", kind: "inquiry", message: "Sonia & Arjun asked about a 2-day Samode Palace package.", timeAgo: "2h", unread: true },
  { id: "n3", kind: "payment", message: "₹5,75,000 retainer received from Riya & Karan.", timeAgo: "1d", unread: true },
  { id: "n4", kind: "review", message: "Anjali & Rahul left a 5-star review. 'She captured feelings…'", timeAgo: "2w", unread: false },
  { id: "n5", kind: "system", message: "Your Q1 payout summary is ready to download.", timeAgo: "3w", unread: false },
];

export type CalendarEventKind = "wedding" | "task" | "consultation" | "blocked";

export type CalendarEntry = {
  id: string;
  date: string;
  kind: CalendarEventKind;
  label: string;
  eventType?: string;
  couple?: string;
  weddingId?: string;
  city?: string;
  venue?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
};

export const CALENDAR_ENTRIES: CalendarEntry[] = [
  // ── April 2026 ──────────────────────────────
  {
    id: "c-apr-22",
    date: "2026-04-22",
    kind: "consultation",
    label: "Discovery call · Sonia & Arjun",
    eventType: "Discovery call",
    couple: "Sonia & Arjun",
    city: "Jaipur",
    startTime: "11:00",
    endTime: "11:45",
    location: "Zoom",
    notes: "First call — discussing 2-day package at Samode Palace.",
  },
  {
    id: "c-apr-25",
    date: "2026-04-25",
    kind: "task",
    label: "Album proofing · Anjali & Rahul",
    eventType: "Album proofing",
    couple: "Anjali & Rahul",
    weddingId: "wed-004",
    startTime: "14:00",
    endTime: "16:00",
    notes: "Final proof review before sending to Bespoke Bindery. 48 spreads.",
  },
  {
    id: "c-apr-28",
    date: "2026-04-28",
    kind: "task",
    label: "Shot list draft · Riya & Karan",
    eventType: "Shot list draft",
    couple: "Riya & Karan",
    weddingId: "wed-001",
    notes: "Share Google Doc shot list for their review before May 2.",
  },
  {
    id: "c-apr-30",
    date: "2026-04-30",
    kind: "blocked",
    label: "Unavailable — Equipment service",
    notes: "Annual camera body service at Canon Mumbai. No bookings.",
  },

  // ── May 2026 ────────────────────────────────
  {
    id: "c-may-02",
    date: "2026-05-02",
    kind: "wedding",
    label: "Pre-wedding · Riya & Karan",
    eventType: "Pre-wedding shoot",
    couple: "Riya & Karan",
    weddingId: "wed-001",
    city: "Udaipur",
    venue: "Taj Lake Palace",
    startTime: "15:00",
    endTime: "18:30",
    notes: "Golden hour at the ghats. Second shooter: Arjun. Bring the 85mm.",
  },
  {
    id: "c-may-05",
    date: "2026-05-05",
    kind: "consultation",
    label: "Discovery call · Tara & Vikram",
    eventType: "Discovery call",
    couple: "Tara & Vikram",
    weddingId: "wed-003",
    startTime: "10:30",
    endTime: "11:15",
    location: "Zoom",
    notes: "Post-contract kickoff — confirming scope and key family members.",
  },
  {
    id: "c-may-08",
    date: "2026-05-08",
    kind: "task",
    label: "Balance invoice · Riya & Karan",
    eventType: "Invoice due",
    couple: "Riya & Karan",
    weddingId: "wed-001",
    notes: "Send remaining 50% balance invoice 10 days before wedding.",
  },
  {
    id: "c-may-10",
    date: "2026-05-10",
    kind: "consultation",
    label: "Follow-up · Leela & Dev",
    eventType: "Follow-up call",
    couple: "Leela & Dev",
    city: "Goa",
    startTime: "16:00",
    endTime: "16:30",
    notes: "Reviewing quote for Taj Exotica 3-day. Awaiting confirmation.",
  },
  {
    id: "c-may-15",
    date: "2026-05-15",
    kind: "task",
    label: "Shot list review · Isha & Nikhil",
    eventType: "Shot list review",
    couple: "Isha & Nikhil",
    weddingId: "wed-002",
    startTime: "18:00",
    endTime: "19:00",
    notes: "Review marked-up shot list with couple on call.",
  },
  {
    id: "c-may-17",
    date: "2026-05-17",
    kind: "blocked",
    label: "Unavailable — Travel to Udaipur",
    notes: "Driving up with gear the day before the main event.",
  },
  {
    id: "c-may-18",
    date: "2026-05-18",
    kind: "wedding",
    label: "Wedding · Riya & Karan",
    eventType: "Wedding ceremony",
    couple: "Riya & Karan",
    weddingId: "wed-001",
    city: "Udaipur",
    venue: "Taj Lake Palace",
    startTime: "16:00",
    endTime: "23:30",
    notes: "Pheras at sunset. Lead + second shooter. Full editorial coverage.",
  },
  {
    id: "c-may-19",
    date: "2026-05-19",
    kind: "wedding",
    label: "Reception · Riya & Karan",
    eventType: "Reception",
    couple: "Riya & Karan",
    weddingId: "wed-001",
    city: "Udaipur",
    venue: "Taj Lake Palace",
    startTime: "19:00",
    endTime: "23:00",
    notes: "Black-tie reception with performances. Candid focus.",
  },
  {
    id: "c-may-22",
    date: "2026-05-22",
    kind: "consultation",
    label: "Portfolio call · Maya & Kabir",
    eventType: "Portfolio review",
    couple: "Maya & Kabir",
    city: "London",
    startTime: "14:00",
    endTime: "14:45",
    location: "Google Meet",
    notes: "Walking them through the Claridge's-style editorial work.",
  },
  {
    id: "c-may-28",
    date: "2026-05-28",
    kind: "task",
    label: "Sneak peek · Riya & Karan",
    eventType: "Sneak peek delivery",
    couple: "Riya & Karan",
    weddingId: "wed-001",
    notes: "Deliver 20-image sneak peek within 10 days of wedding.",
  },

  // ── June 2026 ───────────────────────────────
  {
    id: "c-jun-03",
    date: "2026-06-03",
    kind: "task",
    label: "Balance invoice · Isha & Nikhil",
    eventType: "Invoice due",
    couple: "Isha & Nikhil",
    weddingId: "wed-002",
    notes: "Remaining 65% due before Lonavala weekend.",
  },
  {
    id: "c-jun-06",
    date: "2026-06-06",
    kind: "wedding",
    label: "Sangeet · Isha & Nikhil",
    eventType: "Sangeet",
    couple: "Isha & Nikhil",
    weddingId: "wed-002",
    city: "Lonavala",
    venue: "Della Resorts",
    startTime: "19:00",
    endTime: "23:00",
    notes: "Full sangeet coverage — choreographed performances expected.",
  },
  {
    id: "c-jun-07",
    date: "2026-06-07",
    kind: "wedding",
    label: "Wedding · Isha & Nikhil",
    eventType: "Wedding ceremony",
    couple: "Isha & Nikhil",
    weddingId: "wed-002",
    city: "Lonavala",
    venue: "Della Resorts",
    startTime: "10:00",
    endTime: "18:00",
    notes: "Daytime ceremony with reels add-on. Both shooters on-site.",
  },
  {
    id: "c-jun-12",
    date: "2026-06-12",
    kind: "consultation",
    label: "Discovery call · Reena & Aman",
    eventType: "Discovery call",
    couple: "Reena & Aman",
    startTime: "12:00",
    endTime: "12:45",
    location: "Zoom",
    notes: "Referred by Tara & Vikram. December destination wedding.",
  },
  {
    id: "c-jun-18",
    date: "2026-06-18",
    kind: "blocked",
    label: "Unavailable — Family event",
    notes: "Cousin's wedding in Delhi. Out through June 20.",
  },
  {
    id: "c-jun-19",
    date: "2026-06-19",
    kind: "blocked",
    label: "Unavailable — Family event",
  },
  {
    id: "c-jun-20",
    date: "2026-06-20",
    kind: "blocked",
    label: "Unavailable — Return travel",
  },
  {
    id: "c-jun-24",
    date: "2026-06-24",
    kind: "task",
    label: "Sneak peek · Isha & Nikhil",
    eventType: "Sneak peek delivery",
    couple: "Isha & Nikhil",
    weddingId: "wed-002",
    notes: "15-image preview within 14 days of wedding.",
  },

  // ── July 2026 ───────────────────────────────
  {
    id: "c-jul-08",
    date: "2026-07-08",
    kind: "task",
    label: "Full gallery · Riya & Karan",
    eventType: "Gallery delivery",
    couple: "Riya & Karan",
    weddingId: "wed-001",
    notes: "Final 600+ image gallery due 8 weeks after wedding.",
  },
  {
    id: "c-jul-15",
    date: "2026-07-15",
    kind: "consultation",
    label: "Album review · Riya & Karan",
    eventType: "Album review",
    couple: "Riya & Karan",
    weddingId: "wed-001",
    startTime: "17:00",
    endTime: "18:00",
    location: "Studio · Bandra",
    notes: "First draft of heirloom album. Bring samples.",
  },
];

// Message threads live on Inquiry.messages in stores/inquiry-store.ts.
// Types are defined in types/inquiry.ts.

// ── Interested Couples (added vendor to selections, no inquiry yet) ──

export type InterestedCouple = {
  id: string;
  coupleName: string;
  weddingDate: string;
  city: string;
  events: string[];
  headcount: number;
  addedAt: string;
  note?: string;
};

export const INTERESTED_COUPLES: InterestedCouple[] = [
  {
    id: "int-001",
    coupleName: "Riya & Sahil",
    weddingDate: "Sep 5, 2026",
    city: "Pondicherry",
    events: ["Wedding", "Reception"],
    headcount: 160,
    addedAt: "3 days ago",
    note: "Added Aurora to their photography shortlist after viewing your Coromandel album.",
  },
  {
    id: "int-002",
    coupleName: "Neha & Aditya",
    weddingDate: "Nov 30, 2026",
    city: "Agra",
    events: ["Mehendi", "Sangeet", "Wedding"],
    headcount: 350,
    addedAt: "5 days ago",
  },
  {
    id: "int-003",
    coupleName: "Simran & Varun",
    weddingDate: "Dec 14, 2026",
    city: "Jim Corbett",
    events: ["Haldi", "Wedding"],
    headcount: 90,
    addedAt: "1 week ago",
    note: "Intimate forest wedding. Viewed your profile 4 times this week.",
  },
  {
    id: "int-004",
    coupleName: "Priya & Rohit",
    weddingDate: "Feb 6, 2027",
    city: "Hyderabad",
    events: ["Sangeet", "Wedding", "Reception"],
    headcount: 500,
    addedAt: "2 weeks ago",
  },
];

// ── Decline templates ─────────────────────────────────────────

export type DeclineTemplate = {
  id: string;
  label: string;
  body: string;
};

export const DECLINE_TEMPLATES: DeclineTemplate[] = [
  {
    id: "dates-booked",
    label: "Dates unavailable",
    body:
      "Thank you so much for thinking of Aurora Studios for your wedding. Unfortunately, we're already committed to another celebration on your dates and can't take on a second shoot that weekend. Your venue and story sound beautiful — I'd be glad to recommend two photographers in our circle whose work we trust. Wishing you a joyful planning journey.",
  },
  {
    id: "out-of-capacity",
    label: "Studio at capacity",
    body:
      "Thank you for your inquiry and for the kind words about our work. We've had to pause new bookings for the Nov–Feb window to protect the couples already on our calendar. If your timeline is flexible, I'd love to revisit this once the season opens up in March. Either way, I wish you a wonderful celebration.",
  },
  {
    id: "outside-scope",
    label: "Outside our scope",
    body:
      "Thank you for reaching out. Based on what you've described, I want to be honest that this isn't quite in our wheelhouse — and I'd rather refer you to someone whose style fits you perfectly. Happy to share a short list of photographers we admire who specialize in exactly this.",
  },
  {
    id: "budget-mismatch",
    label: "Budget mismatch (gentle)",
    body:
      "Thank you for considering us — your wedding sounds lovely. Our studio's packages start above the range you've shared, and I'd rather tell you that upfront than waste your time with a quote that won't feel right. If your budget shifts, please come back to us. Otherwise, I'd be glad to recommend two or three photographers whose pricing aligns.",
  },
];

// ── Derived counters ──────────────────────────────────────────
export const UNREAD_NOTIFICATIONS = NOTIFICATIONS.filter((n) => n.unread).length;
export const ACTIVE_WEDDINGS = WEDDINGS.filter((w) => w.status !== "delivered").length;
export const INTERESTED_COUPLES_COUNT = INTERESTED_COUPLES.length;
