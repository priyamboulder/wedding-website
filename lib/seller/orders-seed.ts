// Seed data for seller order management. All orders belong to Divya Creations
// (the demo seller). Dates are October/September 2026 and static.

export type OrderStatus =
  | "new"
  | "proof-sent"
  | "revision-requested"
  | "proof-approved"
  | "in-production"
  | "ready-to-ship"
  | "shipped"
  | "delivered"
  | "on-hold"
  | "cancelled"
  | "refunded";

export type ProofRound = {
  round: number;
  sentDate: string;
  status: "awaiting" | "approved" | "revision-requested";
  approvedDate?: string;
  revisionDate?: string;
  waitingDays?: number;
  buyerFeedback?: string;
  previewLabel: string; // short caption for the mockup
  notes?: string;
};

export type TimelineEntry = {
  date: string; // "Oct 6" or "Oct ?" for future/unknown
  label: string;
  status: "done" | "current" | "future";
};

export type OrderMessage = {
  id: string;
  from: "buyer" | "seller";
  name: string;
  timeAgo: string;
  body: string;
};

export type SellerOrderRow = {
  id: string;
  number: string; // e.g. "1254"
  coupleName: string;
  productName: string;
  quantity: number;
  total: number;
  orderedDate: string; // "Oct 8"
  status: OrderStatus;
  overdue?: boolean;
  productThumb?: string; // short tag for pretend thumbnail
};

export type OrderDetail = SellerOrderRow & {
  // Buyer / wedding info
  buyerEmail: string;
  buyerPhone?: string;
  weddingDate: string;
  orderedFullDate: string;
  paid: boolean;
  paymentMethod: string;

  // Product
  pricePerUnit: number;
  productSubtitle?: string;

  // Customization
  customization: {
    coupleNames: string;
    weddingDate: string;
    venue: string;
    wording: string[];
    colorPreference: string;
    rsvp: string;
    buyerNotes?: string;
    bilingualScript?: string;
  };

  // Proof workflow
  proofs: ProofRound[];

  // Production / shipping
  production: {
    status: string;
    estimatedDays: string;
    shipByDate?: string;
    shippingAddress: string[];
    shippingMethod: string;
    tracking?: string;
    carrier?: string;
  };

  // Timeline
  timeline: TimelineEntry[];

  // In-order messages
  messages: OrderMessage[];
};

// ─── Status metadata ───────────────────────────────────────────

export const STATUS_META: Record<
  OrderStatus,
  { label: string; glyph: string; tone: string; bg: string; border: string; short: string }
> = {
  new: {
    label: "New",
    short: "New",
    glyph: "🆕",
    tone: "#2C2C2C",
    bg: "rgba(245,230,208,0.55)",
    border: "rgba(196,162,101,0.35)",
  },
  "proof-sent": {
    label: "Proof Sent",
    short: "Proof",
    glyph: "🎨",
    tone: "#6B5BA8",
    bg: "rgba(232,222,245,0.55)",
    border: "rgba(107,91,168,0.28)",
  },
  "revision-requested": {
    label: "Revision Requested",
    short: "Revision",
    glyph: "↻",
    tone: "#A8612F",
    bg: "rgba(245,223,200,0.55)",
    border: "rgba(168,97,47,0.30)",
  },
  "proof-approved": {
    label: "Proof Approved",
    short: "Approved",
    glyph: "✓",
    tone: "#2C6E6A",
    bg: "rgba(217,232,228,0.55)",
    border: "rgba(44,110,106,0.28)",
  },
  "in-production": {
    label: "In Production",
    short: "Production",
    glyph: "🔧",
    tone: "#7a5a16",
    bg: "rgba(251,243,228,0.85)",
    border: "rgba(196,162,101,0.4)",
  },
  "ready-to-ship": {
    label: "Ready to Ship",
    short: "Ready",
    glyph: "📦",
    tone: "#7a5a16",
    bg: "rgba(245,230,208,0.6)",
    border: "rgba(196,162,101,0.45)",
  },
  shipped: {
    label: "Shipped",
    short: "Shipped",
    glyph: "🚚",
    tone: "#4A6FA5",
    bg: "rgba(220,230,245,0.55)",
    border: "rgba(74,111,165,0.28)",
  },
  delivered: {
    label: "Delivered",
    short: "Delivered",
    glyph: "✓",
    tone: "#2C6E6A",
    bg: "rgba(217,232,228,0.45)",
    border: "rgba(44,110,106,0.22)",
  },
  "on-hold": {
    label: "On Hold",
    short: "Hold",
    glyph: "⏸",
    tone: "#6B5B4B",
    bg: "rgba(232,226,216,0.55)",
    border: "rgba(107,91,75,0.25)",
  },
  cancelled: {
    label: "Cancelled",
    short: "Cancelled",
    glyph: "✕",
    tone: "#7A5A5A",
    bg: "rgba(232,220,220,0.5)",
    border: "rgba(122,90,90,0.25)",
  },
  refunded: {
    label: "Refunded",
    short: "Refunded",
    glyph: "↩",
    tone: "#7A5A5A",
    bg: "rgba(232,220,220,0.45)",
    border: "rgba(122,90,90,0.22)",
  },
};

export const STATUS_FILTER_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "proof-sent", label: "Proof Sent" },
  { value: "in-production", label: "In Production" },
  { value: "ready-to-ship", label: "Ready to Ship" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

// ─── Header stats ──────────────────────────────────────────────

export const ORDER_STATS = {
  pending: 12,
  inProduction: 8,
  shipped: 5,
  completed: 234,
};

// ─── Order list (20 rows) ──────────────────────────────────────

export const SELLER_ORDERS: SellerOrderRow[] = [
  {
    id: "ord-1254",
    number: "1254",
    coupleName: "Tara & Neil",
    productName: "Gold Foil Ganesh Invitation",
    quantity: 250,
    total: 1625,
    orderedDate: "Oct 8",
    status: "new",
  },
  {
    id: "ord-1253",
    number: "1253",
    coupleName: "Simran & Dev",
    productName: "Custom Ganesh Invitation Suite",
    quantity: 200,
    total: 1700,
    orderedDate: "Oct 6",
    status: "proof-sent",
  },
  {
    id: "ord-1252",
    number: "1252",
    coupleName: "Aarushi & Rohit",
    productName: "Hand-Bound Welcome Booklet",
    quantity: 180,
    total: 2340,
    orderedDate: "Oct 5",
    status: "revision-requested",
  },
  {
    id: "ord-1251",
    number: "1251",
    coupleName: "Neha & Vikram",
    productName: "Laser-Cut Mehndi Invitation",
    quantity: 150,
    total: 975,
    orderedDate: "Oct 5",
    status: "ready-to-ship",
  },
  {
    id: "ord-1250",
    number: "1250",
    coupleName: "Divya & Anand",
    productName: "Sangeet Night Invitation Set",
    quantity: 120,
    total: 780,
    orderedDate: "Oct 4",
    status: "proof-approved",
  },
  {
    id: "ord-1249",
    number: "1249",
    coupleName: "Meera & Karan",
    productName: "Velvet Invitation Box Set",
    quantity: 100,
    total: 1800,
    orderedDate: "Oct 4",
    status: "in-production",
  },
  {
    id: "ord-1248",
    number: "1248",
    coupleName: "Anika & Sam",
    productName: "Peacock Motif Suite",
    quantity: 175,
    total: 1575,
    orderedDate: "Oct 3",
    status: "in-production",
  },
  {
    id: "ord-1247",
    number: "1247",
    coupleName: "Priya & Arjun",
    productName: "Foil-Pressed Invitation Suite",
    quantity: 200,
    total: 1840,
    orderedDate: "Oct 3",
    status: "in-production",
    overdue: true,
  },
  {
    id: "ord-1246",
    number: "1246",
    coupleName: "Kavya & Sahil",
    productName: "Rose Gold Save-the-Date",
    quantity: 220,
    total: 935,
    orderedDate: "Oct 2",
    status: "ready-to-ship",
  },
  {
    id: "ord-1245",
    number: "1245",
    coupleName: "Riya & Jay",
    productName: "Sangeet E-Invite (Digital)",
    quantity: 1,
    total: 45,
    orderedDate: "Oct 2",
    status: "shipped",
  },
  {
    id: "ord-1244",
    number: "1244",
    coupleName: "Pooja & Arnav",
    productName: "Mehndi Night Custom Invite",
    quantity: 140,
    total: 1120,
    orderedDate: "Oct 1",
    status: "shipped",
  },
  {
    id: "ord-1243",
    number: "1243",
    coupleName: "Shreya & Ishaan",
    productName: "Sikh Wedding Invitation Suite",
    quantity: 160,
    total: 1920,
    orderedDate: "Sep 30",
    status: "shipped",
  },
  {
    id: "ord-1242",
    number: "1242",
    coupleName: "Isha & Rohan",
    productName: "Welcome Sign + Table Numbers",
    quantity: 1,
    total: 340,
    orderedDate: "Sep 30",
    status: "delivered",
  },
  {
    id: "ord-1241",
    number: "1241",
    coupleName: "Sanjana & Dhruv",
    productName: "Custom Monogram Stationery Set",
    quantity: 80,
    total: 620,
    orderedDate: "Sep 29",
    status: "delivered",
  },
  {
    id: "ord-1240",
    number: "1240",
    coupleName: "Nisha & Vivaan",
    productName: "Ceremony Program Booklet",
    quantity: 175,
    total: 1225,
    orderedDate: "Sep 28",
    status: "delivered",
  },
  {
    id: "ord-1239",
    number: "1239",
    coupleName: "Ria & Aditya",
    productName: "Thank You Card Set",
    quantity: 250,
    total: 500,
    orderedDate: "Sep 27",
    status: "delivered",
  },
  {
    id: "ord-1238",
    number: "1238",
    coupleName: "Ayesha & Imran",
    productName: "Nikah Invitation Suite",
    quantity: 200,
    total: 1700,
    orderedDate: "Sep 26",
    status: "on-hold",
  },
  {
    id: "ord-1237",
    number: "1237",
    coupleName: "Tanvi & Yash",
    productName: "Haldi Night Invitation",
    quantity: 110,
    total: 715,
    orderedDate: "Sep 25",
    status: "cancelled",
  },
  {
    id: "ord-1236",
    number: "1236",
    coupleName: "Bhavna & Kabir",
    productName: "Destination Wedding Welcome Kit",
    quantity: 90,
    total: 2160,
    orderedDate: "Sep 22",
    status: "refunded",
  },
  {
    id: "ord-1235",
    number: "1235",
    coupleName: "Lakshmi & Arvind",
    productName: "Traditional Ganesh Invitation",
    quantity: 300,
    total: 2100,
    orderedDate: "Sep 20",
    status: "delivered",
  },
];

// ─── Order #1253: full detail (proof sent, awaiting approval) ──

export const ORDER_1253_DETAIL: OrderDetail = {
  id: "ord-1253",
  number: "1253",
  coupleName: "Simran & Dev",
  productName: "Custom Ganesh Wedding Invitation Suite",
  productSubtitle: "Gold foil on ivory cotton cardstock — matching RSVP + envelope",
  quantity: 200,
  total: 1700,
  pricePerUnit: 8.5,
  orderedDate: "Oct 6",
  orderedFullDate: "October 6, 2026",
  status: "proof-sent",

  buyerEmail: "simran@email.com",
  buyerPhone: "(201) 555-0142",
  weddingDate: "March 15, 2027",
  paid: true,
  paymentMethod: "Visa ending in 4821",

  customization: {
    coupleNames: "Simran Kaur & Dev Patel",
    weddingDate: "March 15, 2027",
    venue: "The Pierre, New York",
    wording: [
      "Shri & Smt Harbhajan Singh Kaur",
      "request the honour of your presence",
      "at the marriage of their daughter",
      "Simran",
      "to",
      "Dev",
      "son of Shri & Smt Rajesh Patel",
    ],
    colorPreference: "Gold & Ivory",
    rsvp: "RSVP by February 15 to simrananddev@gmail.com",
    bilingualScript: "सिमरन & देव (Devanagari script)",
    buyerNotes:
      "Please use the Devanagari script for our names as well — सिमरन & देव. Also need matching RSVP cards and ceremony programs (same design). Can you quote?",
  },

  proofs: [
    {
      round: 1,
      sentDate: "Oct 7",
      status: "awaiting",
      waitingDays: 3,
      previewLabel:
        "Gold foil Ganesh motif · Cormorant + Devanagari names · ivory base",
      notes: "Round 1 — initial mockup with bilingual names and venue detail.",
    },
  ],

  production: {
    status: "Not started (awaiting proof approval)",
    estimatedDays: "7–10 business days after approval",
    shipByDate: "Calculated after approval",
    shippingAddress: [
      "Simran Kaur",
      "123 Main Street, Apt 4B",
      "Jersey City, NJ 07302",
    ],
    shippingMethod: "Standard (5–7 days)",
  },

  timeline: [
    { date: "Oct 6", label: "Order placed", status: "done" },
    { date: "Oct 7", label: "Proof sent", status: "done" },
    { date: "Oct ?", label: "Proof approved", status: "current" },
    { date: "Oct ?", label: "Production begins", status: "future" },
    { date: "Oct ?", label: "Production complete", status: "future" },
    { date: "Oct ?", label: "Shipped", status: "future" },
    { date: "Oct ?", label: "Delivered", status: "future" },
  ],

  messages: [
    {
      id: "m1",
      from: "buyer",
      name: "Simran",
      timeAgo: "4 days ago",
      body:
        "Hi! So excited to work with you. Please see the wording sheet — and if possible, can we also get matching RSVP cards and ceremony programs in the same design?",
    },
    {
      id: "m2",
      from: "seller",
      name: "Priya (Divya Creations)",
      timeAgo: "4 days ago",
      body:
        "Thank you so much for your order! Matching RSVPs + ceremony programs are absolutely possible. I'll include bilingual Devanagari in the first proof. Quote for the add-ons will be sent separately.",
    },
    {
      id: "m3",
      from: "seller",
      name: "Priya (Divya Creations)",
      timeAgo: "3 days ago",
      body:
        "First proof is ready — please review at your leisure. Let me know any edits to the script or layout.",
    },
  ],
};

// ─── Example with 2 proof rounds (revision → approved) ─────────

export const ORDER_1248_DETAIL: OrderDetail = {
  id: "ord-1248",
  number: "1248",
  coupleName: "Anika & Sam",
  productName: "Peacock Motif Wedding Suite",
  productSubtitle: "Laser-cut peacock overlay · emerald + gold · vellum wrap",
  quantity: 175,
  total: 1575,
  pricePerUnit: 9.0,
  orderedDate: "Oct 3",
  orderedFullDate: "October 3, 2026",
  status: "in-production",

  buyerEmail: "anika.sam@email.com",
  weddingDate: "April 28, 2027",
  paid: true,
  paymentMethod: "Mastercard ending in 0219",

  customization: {
    coupleNames: "Anika Mehta & Sam Desai",
    weddingDate: "April 28, 2027",
    venue: "Four Seasons, Toronto",
    wording: [
      "Mr. & Mrs. Rajiv Mehta",
      "joyfully invite you to celebrate the wedding of their daughter",
      "Anika",
      "to",
      "Samir",
      "son of Mr. & Mrs. Dinesh Desai",
    ],
    colorPreference: "Emerald green + rose gold",
    rsvp: "RSVP by March 1 via anikaandsam.com",
    buyerNotes:
      "We love the peacock motif but want a slightly darker emerald than the sample photo. Small gold accents please, no maroon.",
  },

  proofs: [
    {
      round: 1,
      sentDate: "Oct 5",
      status: "revision-requested",
      revisionDate: "Oct 6",
      previewLabel: "Peacock laser-cut · emerald + maroon + gold accents",
      buyerFeedback:
        "Love the motif! Two edits: (1) please remove the maroon accents entirely — we want emerald + rose gold only, and (2) couple names feel a bit small relative to the motif. Can we bump up by ~15%?",
      notes: "Round 1 — revision requested on color palette and name sizing.",
    },
    {
      round: 2,
      sentDate: "Oct 7",
      status: "approved",
      approvedDate: "Oct 8",
      previewLabel: "Peacock laser-cut · emerald + rose gold · enlarged names",
      buyerFeedback: "Perfect! This is exactly what we imagined. Approved to print.",
      notes: "Round 2 — color palette corrected, names resized. Approved.",
    },
  ],

  production: {
    status: "In production — printing cardstock (day 2 of 8)",
    estimatedDays: "7–10 business days after approval",
    shipByDate: "Oct 18",
    shippingAddress: [
      "Anika Mehta",
      "44 Yorkville Avenue, Suite 1802",
      "Toronto, ON M4W 0A3, Canada",
    ],
    shippingMethod: "DHL Express International (3–5 days)",
  },

  timeline: [
    { date: "Oct 3", label: "Order placed", status: "done" },
    { date: "Oct 5", label: "Proof Round 1 sent", status: "done" },
    { date: "Oct 6", label: "Revision requested", status: "done" },
    { date: "Oct 7", label: "Proof Round 2 sent", status: "done" },
    { date: "Oct 8", label: "Proof approved", status: "done" },
    { date: "Oct 9", label: "Production begins", status: "done" },
    { date: "Oct 18", label: "Ship by", status: "current" },
    { date: "Oct ?", label: "Delivered", status: "future" },
  ],

  messages: [
    {
      id: "m1",
      from: "buyer",
      name: "Anika",
      timeAgo: "6 days ago",
      body: "Order placed! Wording doc attached, hope everything is clear.",
    },
    {
      id: "m2",
      from: "seller",
      name: "Priya (Divya Creations)",
      timeAgo: "5 days ago",
      body: "Got it all — first proof going up shortly.",
    },
    {
      id: "m3",
      from: "buyer",
      name: "Anika",
      timeAgo: "4 days ago",
      body:
        "First proof notes attached — just two small edits on color and name size.",
    },
    {
      id: "m4",
      from: "seller",
      name: "Priya (Divya Creations)",
      timeAgo: "3 days ago",
      body: "Round 2 is up — removed the maroon and enlarged names by 15%.",
    },
    {
      id: "m5",
      from: "buyer",
      name: "Anika",
      timeAgo: "2 days ago",
      body: "Approved! Thank you so much, can't wait to see them.",
    },
  ],
};

export const ORDER_DETAILS: Record<string, OrderDetail> = {
  "ord-1253": ORDER_1253_DETAIL,
  "ord-1248": ORDER_1248_DETAIL,
};
