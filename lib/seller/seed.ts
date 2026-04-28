// Seller portal seed data for Divya Creations — the demo account for
// seller.ananya.com. All values are static; the dashboard is build-time only.

export type OrderUrgency = "overdue" | "ready-to-ship" | "proof-pending" | "unread-message" | "new";

export type SellerOrder = {
  id: string;
  number: string;
  coupleName: string;
  productName: string;
  quantity: number;
  paidAmount: number;
  paidDate: string;
  shipBy?: string;
  urgency: OrderUrgency;
  note?: string;
  daysLate?: number;
  daysUntilDue?: number;
  proofSentDate?: string;
  proofWaitingDays?: number;
  messagePreview?: string;
  messageReceivedAgo?: string;
};

export type ActivityItem = {
  id: string;
  day: "today" | "yesterday";
  kind:
    | "new-order"
    | "review"
    | "proof-approved"
    | "favorited"
    | "shipped"
    | "message"
    | "listing-views";
  text: string;
  detail?: string;
  amount?: string;
};

export const SELLER = {
  id: "divya-creations",
  shopName: "Divya Creations",
  ownerName: "Priya Sharma",
  ownerFirstName: "Priya",
  avatar: "PS",
  tagline: "Handcrafted South Asian Wedding Stationery",
  city: "Edison, NJ",
  bio: "Custom South Asian wedding invitations designed in partnership with artisans in India.",
  publicShopUrl: "/marketplace/divya-creations",

  // month-scoped metrics
  monthLabel: "October 2026",
  monthShort: "October",

  revenueThisMonth: 8420,
  revenueDeltaPct: 24,
  revenueSparkline: [4100, 4850, 5320, 6100, 6780, 8420], // last 6 months

  ordersThisMonth: 47,
  ordersPendingFulfillment: 12,
  ordersOverdue: 2,

  activeListings: 34,
  draftListings: 3,
  outOfStockListings: 2,

  shopViews: 2184,
  conversionRatePct: 6.2,

  rating: 4.9,
  reviewCount: 89,

  // badge counts for top bar
  unreadNotifications: 4,
};

export const ORDERS_NEEDING_ACTION: SellerOrder[] = [
  {
    id: "ord-1247",
    number: "#1247",
    coupleName: "Priya & Arjun",
    productName: "Custom Foil-Pressed Wedding Invitation Suite",
    quantity: 200,
    paidAmount: 1840,
    paidDate: "Oct 3",
    shipBy: "Oct 8",
    urgency: "overdue",
    daysLate: 2,
  },
  {
    id: "ord-1251",
    number: "#1251",
    coupleName: "Neha & Vikram",
    productName: "Laser-Cut Mehndi Night Invitation Set",
    quantity: 150,
    paidAmount: 975,
    paidDate: "Oct 5",
    shipBy: "Oct 12",
    urgency: "ready-to-ship",
    daysUntilDue: 2,
  },
  {
    id: "ord-1253",
    number: "#1253",
    coupleName: "Simran & Dev",
    productName: "Custom Ganesh Invitation Suite",
    quantity: 120,
    paidAmount: 1420,
    paidDate: "Sep 28",
    urgency: "proof-pending",
    proofSentDate: "Oct 7",
    proofWaitingDays: 3,
  },
  {
    id: "ord-1249",
    number: "#1249",
    coupleName: "Meera & Karan",
    productName: "Velvet Invitation Box Set",
    quantity: 80,
    paidAmount: 420,
    paidDate: "Oct 6",
    urgency: "unread-message",
    messagePreview: "Question about customization options",
    messageReceivedAgo: "4 hours ago",
  },
];

export const ACTIVITY_FEED: ActivityItem[] = [
  {
    id: "act-1",
    day: "today",
    kind: "new-order",
    text: "Meera & Karan ordered Velvet Invitation Box Set",
    amount: "$420",
  },
  {
    id: "act-2",
    day: "today",
    kind: "review",
    text: "★★★★★ from Isha & Rohan",
    detail: "\"Absolutely stunning work\"",
  },
  {
    id: "act-3",
    day: "today",
    kind: "proof-approved",
    text: "Simran & Dev approved their invitation design",
  },
  {
    id: "act-4",
    day: "today",
    kind: "favorited",
    text: "\"Gold Foil Ganesh Card\" saved by 12 couples this week",
  },
  {
    id: "act-5",
    day: "yesterday",
    kind: "shipped",
    text: "Order #1245 shipped to Riya & Jay",
    detail: "tracking uploaded",
  },
  {
    id: "act-6",
    day: "yesterday",
    kind: "message",
    text: "Anika & Sam asking about rush order pricing",
  },
  {
    id: "act-7",
    day: "yesterday",
    kind: "listing-views",
    text: "\"Sikh Wedding Invitation Suite\" got 89 views",
    detail: "featured in AI recommendations",
  },
];

export const SELLER_NAV = [
  { label: "Dashboard", href: "/seller" },
  { label: "Products", href: "/seller/products" },
  { label: "Orders", href: "/seller/orders" },
  { label: "Messages", href: "/seller/messages" },
  { label: "Shop Profile", href: "/seller/profile" },
  { label: "Analytics", href: "/seller/analytics" },
  { label: "Payouts", href: "/seller/payouts" },
  { label: "Settings", href: "/seller/settings" },
];

// ── Analytics ────────────────────────────────────────────────────────────────

export type MonthDatum = { label: string; shortLabel: string; value: number };

export type TopProductRow = {
  rank: number;
  name: string;
  units: number;
  revenue: number;
  views: number;
  conversionRatePct: number;
};

export type ProductInsight = {
  tag: "best-converter" | "top-revenue" | "trending-up" | "needs-attention";
  headline: string;
  detail: string;
};

export type TrafficSource = {
  key: string;
  label: string;
  share: number; // 0-100
  description: string;
  tone: string; // hex
};

export type DemographicSlice = { label: string; share: number };

export type SeasonalMonth = { label: string; shortLabel: string; intensity: number };

export const SELLER_ANALYTICS = {
  rangeLabel: "Year to date · 2026",
  revenueYTD: 42800,
  ordersYTD: 234,
  averageOrderValue: 183,
  conversionRatePct: 6.2,
  shopViewsYTD: 37420,
  revenueDeltaPct: 18, // vs prior year

  revenueByMonth: [
    { label: "January", shortLabel: "Jan", value: 2940 },
    { label: "February", shortLabel: "Feb", value: 3620 },
    { label: "March", shortLabel: "Mar", value: 4180 },
    { label: "April", shortLabel: "Apr", value: 3450 },
    { label: "May", shortLabel: "May", value: 2810 },
    { label: "June", shortLabel: "Jun", value: 2630 },
    { label: "July", shortLabel: "Jul", value: 4210 },
    { label: "August", shortLabel: "Aug", value: 4890 },
    { label: "September", shortLabel: "Sep", value: 5310 },
    { label: "October", shortLabel: "Oct", value: 8420 },
    { label: "November", shortLabel: "Nov", value: 0 },
    { label: "December", shortLabel: "Dec", value: 0 },
  ] as MonthDatum[],

  ordersByMonth: [
    { label: "January", shortLabel: "Jan", value: 18 },
    { label: "February", shortLabel: "Feb", value: 21 },
    { label: "March", shortLabel: "Mar", value: 24 },
    { label: "April", shortLabel: "Apr", value: 19 },
    { label: "May", shortLabel: "May", value: 15 },
    { label: "June", shortLabel: "Jun", value: 14 },
    { label: "July", shortLabel: "Jul", value: 23 },
    { label: "August", shortLabel: "Aug", value: 27 },
    { label: "September", shortLabel: "Sep", value: 26 },
    { label: "October", shortLabel: "Oct", value: 47 },
    { label: "November", shortLabel: "Nov", value: 0 },
    { label: "December", shortLabel: "Dec", value: 0 },
  ] as MonthDatum[],

  aovByMonth: [
    { label: "January", shortLabel: "Jan", value: 163 },
    { label: "February", shortLabel: "Feb", value: 172 },
    { label: "March", shortLabel: "Mar", value: 174 },
    { label: "April", shortLabel: "Apr", value: 181 },
    { label: "May", shortLabel: "May", value: 187 },
    { label: "June", shortLabel: "Jun", value: 188 },
    { label: "July", shortLabel: "Jul", value: 183 },
    { label: "August", shortLabel: "Aug", value: 181 },
    { label: "September", shortLabel: "Sep", value: 204 },
    { label: "October", shortLabel: "Oct", value: 179 },
    { label: "November", shortLabel: "Nov", value: 0 },
    { label: "December", shortLabel: "Dec", value: 0 },
  ] as MonthDatum[],

  topProducts: [
    {
      rank: 1,
      name: "Sangeet Night E-Invite",
      units: 234,
      revenue: 10530,
      views: 890,
      conversionRatePct: 26.3,
    },
    {
      rank: 2,
      name: "Gold Foil Ganesh Suite",
      units: 142,
      revenue: 9230,
      views: 340,
      conversionRatePct: 8.4,
    },
    {
      rank: 3,
      name: "Laser-Cut Mehndi Set",
      units: 98,
      revenue: 5460,
      views: 220,
      conversionRatePct: 7.3,
    },
    {
      rank: 4,
      name: "Velvet Box Invitation",
      units: 67,
      revenue: 3820,
      views: 180,
      conversionRatePct: 6.1,
    },
    {
      rank: 5,
      name: "Custom Seating Chart",
      units: 45,
      revenue: 5625,
      views: 150,
      conversionRatePct: 5.0,
    },
  ] as TopProductRow[],

  productInsights: [
    {
      tag: "best-converter",
      headline: "Sangeet E-Invite · 26% convert",
      detail: "Digital products convert far higher than print — consider adding more e-invite variants.",
    },
    {
      tag: "top-revenue",
      headline: "Custom Seating Chart · $125 avg",
      detail: "Highest revenue per sale. Lower volume, premium price.",
    },
    {
      tag: "trending-up",
      headline: "Velvet Box Set · +45% views",
      detail: "Views jumped this month — feature it in your shop header while interest is hot.",
    },
    {
      tag: "needs-attention",
      headline: "Haldi Ceremony Kit · 12 left",
      detail: "Low stock. Reorder or pause listing before the next demand wave.",
    },
  ] as ProductInsight[],

  trafficSources: [
    {
      key: "ai-recs",
      label: "Ananya AI Recommendations",
      share: 38,
      description:
        "Couples see your products recommended by the AI based on their wedding details.",
      tone: "#C4A265",
    },
    {
      key: "search",
      label: "Ananya Search/Browse",
      share: 28,
      description: "Couples searching the marketplace.",
      tone: "#7a5a16",
    },
    {
      key: "couple-shopping",
      label: "Couple Portal Shopping tab",
      share: 18,
      description: "Couples browsing while in their planning workspace.",
      tone: "#C97B63",
    },
    {
      key: "direct",
      label: "Direct to shop",
      share: 10,
      description: "Couples who navigated to your shop profile directly.",
      tone: "#6B5BA8",
    },
    {
      key: "external",
      label: "External (Instagram, etc.)",
      share: 6,
      description: "Traffic from links you shared externally.",
      tone: "#2C6E6A",
    },
  ] as TrafficSource[],

  demographics: {
    weddingType: [
      { label: "Hindu", share: 62 },
      { label: "Sikh", share: 15 },
      { label: "Fusion", share: 12 },
      { label: "Muslim", share: 8 },
      { label: "Other", share: 3 },
    ] as DemographicSlice[],
    guestCount: [
      { label: "Under 200", share: 18 },
      { label: "200–300", share: 35 },
      { label: "300–400", share: 28 },
      { label: "400+", share: 19 },
    ] as DemographicSlice[],
    location: [
      { label: "NJ", share: 34 },
      { label: "NY", share: 22 },
      { label: "CA", share: 12 },
      { label: "TX", share: 8 },
      { label: "IL", share: 6 },
      { label: "Other", share: 18 },
    ] as DemographicSlice[],
    timeline: [
      { label: "6+ months before", share: 42 },
      { label: "3–6 months", share: 38 },
      { label: "Under 3 months", share: 20 },
    ] as DemographicSlice[],
    repeatBuyersPct: 12,
    repeatBuyersNote:
      "Ordered multiple products — invitations paired with programs and menus is the most common bundle.",
  },

  seasonalTrend: [
    { label: "January", shortLabel: "Jan", intensity: 0.82 },
    { label: "February", shortLabel: "Feb", intensity: 0.88 },
    { label: "March", shortLabel: "Mar", intensity: 0.95 },
    { label: "April", shortLabel: "Apr", intensity: 0.52 },
    { label: "May", shortLabel: "May", intensity: 0.34 },
    { label: "June", shortLabel: "Jun", intensity: 0.28 },
    { label: "July", shortLabel: "Jul", intensity: 0.74 },
    { label: "August", shortLabel: "Aug", intensity: 0.86 },
    { label: "September", shortLabel: "Sep", intensity: 0.92 },
    { label: "October", shortLabel: "Oct", intensity: 1.0 },
    { label: "November", shortLabel: "Nov", intensity: 0.38 },
    { label: "December", shortLabel: "Dec", intensity: 0.22 },
  ] as SeasonalMonth[],

  leadTimeInsight:
    "Most couples order 4–6 months before their wedding. Consider promoting to couples with spring/summer dates between January and March.",
};

// ── Payouts ──────────────────────────────────────────────────────────────────

export type PayoutStatus = "paid" | "pending" | "failed";

export type PayoutRow = {
  id: string;
  date: string;
  amount: number;
  method: "Bank transfer" | "PayPal" | "Stripe Connect";
  status: PayoutStatus;
  reference: string;
};

export type FeeLine = {
  label: string;
  detail?: string;
  amount: number; // positive = credit, negative = debit
};

export const SELLER_PAYOUTS = {
  availableNow: 3240,
  thisMonth: 8420,
  yearToDate: 42800,
  pendingClearance: 1860,

  monthLabel: "October",
  monthEarningsBreakdown: {
    gross: 8420,
    shipping: 485,
    marketplaceFeePct: 12,
    marketplaceFee: -1010.4,
    processingFee: -258.18,
    processingFeeDetail: "2.9% + $0.30 per txn",
    shippingLabels: -312.5,
    pendingHold: -1860.0,
  },

  history: [
    {
      id: "pay-1",
      date: "Oct 1, 2026",
      amount: 5840.22,
      method: "Bank transfer",
      status: "paid",
      reference: "PAY-2026-1001",
    },
    {
      id: "pay-2",
      date: "Sep 15, 2026",
      amount: 4210.5,
      method: "Bank transfer",
      status: "paid",
      reference: "PAY-2026-0915",
    },
    {
      id: "pay-3",
      date: "Sep 1, 2026",
      amount: 6120.0,
      method: "Bank transfer",
      status: "paid",
      reference: "PAY-2026-0901",
    },
    {
      id: "pay-4",
      date: "Aug 15, 2026",
      amount: 3890.75,
      method: "Bank transfer",
      status: "paid",
      reference: "PAY-2026-0815",
    },
    {
      id: "pay-5",
      date: "Aug 1, 2026",
      amount: 4550.4,
      method: "Bank transfer",
      status: "paid",
      reference: "PAY-2026-0801",
    },
    {
      id: "pay-6",
      date: "Jul 15, 2026",
      amount: 3120.68,
      method: "Bank transfer",
      status: "paid",
      reference: "PAY-2026-0715",
    },
    {
      id: "pay-7",
      date: "Jul 1, 2026",
      amount: 2980.1,
      method: "Bank transfer",
      status: "paid",
      reference: "PAY-2026-0701",
    },
    {
      id: "pay-8",
      date: "Jun 15, 2026",
      amount: 1845.3,
      method: "Bank transfer",
      status: "paid",
      reference: "PAY-2026-0615",
    },
  ] as PayoutRow[],

  settings: {
    method: "Bank account (ACH)",
    methodDetail: "Chase •••• 4821",
    schedule: "Bi-weekly (1st and 15th)",
    scheduleOptions: ["Weekly", "Bi-weekly (1st and 15th)", "Monthly"],
    minimumThreshold: 25,
    w9OnFile: true,
    form1099KThreshold: 600,
    form1099KWillReceive: true,
  },

  tax: {
    grossSalesYTD: 42800,
    totalFeesYTD: 6420,
    netIncomeYTD: 36380,
  },
};

export const NOTIFICATIONS = [
  {
    id: "n1",
    message: "Order #1247 is 2 days overdue — Priya & Arjun",
    kind: "Overdue",
    timeAgo: "now",
    unread: true,
  },
  {
    id: "n2",
    message: "New message from Meera & Karan about customization",
    kind: "Message",
    timeAgo: "4h",
    unread: true,
  },
  {
    id: "n3",
    message: "Simran & Dev approved their invitation proof",
    kind: "Proof",
    timeAgo: "6h",
    unread: true,
  },
  {
    id: "n4",
    message: "New 5-star review from Isha & Rohan",
    kind: "Review",
    timeAgo: "1d",
    unread: true,
  },
  {
    id: "n5",
    message: "Weekly sales summary is ready to download",
    kind: "Report",
    timeAgo: "2d",
    unread: false,
  },
];
