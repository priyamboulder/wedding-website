// Seller messaging seed — conversations split between order threads and
// pre-order inquiries. One active thread (Anika & Sam) includes a custom
// quote sent back to the buyer.

export type ConversationKind = "order" | "inquiry";

export type MessageAuthor = "seller" | "buyer";

export type QuoteCard = {
  kind: "quote";
  description: string;
  quantity: number;
  unitPrice: number;
  rushFee?: number;
  shipping: number;
  total: number;
  deliveryEstimate: string;
  validForDays: number;
  note?: string;
  status: "sent" | "accepted" | "expired";
};

export type Attachment =
  | { kind: "image"; label: string; tone?: "proof" | "reference" }
  | { kind: "file"; label: string; size: string }
  | { kind: "link"; label: string; url: string };

export type Message = {
  id: string;
  author: MessageAuthor;
  authorName: string;
  timestamp: string; // display string, e.g. "Oct 10 · 9:42 AM"
  body?: string;
  attachments?: Attachment[];
  quote?: QuoteCard;
};

export type Conversation = {
  id: string;
  kind: ConversationKind;
  coupleName: string;
  subject: string;
  orderNumber?: string;
  productName?: string;
  preview: string;
  timeAgo: string;
  unread: boolean;
  avatarColors: [string, string]; // bg, fg
  messages: Message[];
};

export const QUICK_REPLIES: { id: string; label: string; body: string }[] = [
  {
    id: "qr-proof-timing",
    label: "Proof timeline",
    body: "Thank you for your order! I'll have your proof ready within 5 business days.",
  },
  {
    id: "qr-proof-ready",
    label: "Proof ready",
    body: "Your proof is ready for review! Please take a look and let me know if you'd like any changes.",
  },
  {
    id: "qr-shipped",
    label: "Shipped",
    body: "Great news — your order has shipped! Tracking number: ________",
  },
  {
    id: "qr-custom-intake",
    label: "Custom order intake",
    body: "I'd love to help with a custom order! Here's what I'll need from you: (1) final guest count, (2) event date, (3) color palette, (4) any script/language preferences, (5) a reference image if you have one.",
  },
  {
    id: "qr-rush",
    label: "Rush quote",
    body: "Rush orders are available for an additional 15%. Would you like me to put together a full quote?",
  },
];

// Avatar palettes pulled from the design system (soft terracotta, sage,
// lavender, champagne, dusty rose). Kept as pairs of [bg, fg].
const PALETTES: Record<string, [string, string]> = {
  terracotta: ["#E8D5D0", "#8B4A3B"],
  sage: ["#D9E8E4", "#2C6E6A"],
  lavender: ["#E8DEF5", "#6B5BA8"],
  champagne: ["#F5E6D0", "#7a5a16"],
  rose: ["#F2DADA", "#A65A5A"],
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: "conv-meera-karan",
    kind: "order",
    coupleName: "Meera & Karan",
    subject: "Re: Velvet Invitation Box Set",
    orderNumber: "#1249",
    productName: "Velvet Invitation Box Set (×80)",
    preview: "Can you do a custom monogram on the box lid before we approve the proof?",
    timeAgo: "4 hours ago",
    unread: true,
    avatarColors: PALETTES.terracotta,
    messages: [
      {
        id: "m-mk-1",
        author: "buyer",
        authorName: "Meera",
        timestamp: "Oct 6 · 2:14 PM",
        body: "Hi Priya! We got the order confirmation for the velvet boxes — they look beautiful. Quick question before you finalize the proof: can you do a custom monogram on the box lid? We'd love \"M + K\" in gold foil, same typography as the invitation text.",
      },
      {
        id: "m-mk-2",
        author: "seller",
        authorName: "Priya",
        timestamp: "Oct 6 · 3:02 PM",
        body: "Hi Meera! Absolutely — a foil monogram on the lid is a beautiful touch. It adds $2.50 per box (so $200 for your 80 boxes). I'll mock up two layout options and send them over tomorrow morning.",
      },
      {
        id: "m-mk-3",
        author: "buyer",
        authorName: "Meera",
        timestamp: "Today · 10:47 AM",
        body: "Can you do a custom monogram on the box lid before we approve the proof? Also — does the monogram cost include the die cost or is that separate?",
      },
    ],
  },
  {
    id: "conv-simran-dev",
    kind: "order",
    coupleName: "Simran & Dev",
    subject: "Re: Order #1253 Proof",
    orderNumber: "#1253",
    productName: "Custom Ganesh Invitation Suite (×120)",
    preview: "Proof looks great but can we change the Sanskrit line to Hindi instead?",
    timeAgo: "1 day ago",
    unread: false,
    avatarColors: PALETTES.lavender,
    messages: [
      {
        id: "m-sd-1",
        author: "seller",
        authorName: "Priya",
        timestamp: "Oct 7 · 11:20 AM",
        body: "Hi Simran & Dev — your invitation proof is ready for review! I've attached the full suite (invitation, RSVP, details card) and a close-up of the foil finish. Let me know if you'd like any revisions.",
        attachments: [
          { kind: "image", label: "Invitation Suite — Proof v1", tone: "proof" },
          { kind: "image", label: "Gold Foil Detail", tone: "proof" },
        ],
      },
      {
        id: "m-sd-2",
        author: "buyer",
        authorName: "Dev",
        timestamp: "Yesterday · 4:52 PM",
        body: "Proof looks great but can we change the Sanskrit line to Hindi instead? My mom wants guests to be able to read it. Everything else is perfect — the Ganesh illustration is stunning.",
      },
    ],
  },
  {
    id: "conv-tara-neil",
    kind: "order",
    coupleName: "Tara & Neil",
    subject: "Re: New order #1254",
    orderNumber: "#1254",
    productName: "Laser-Cut Peacock Invitation Set (×180)",
    preview: "Hi! Just placed my order, excited to work with you. A few details about the event...",
    timeAgo: "2 days ago",
    unread: false,
    avatarColors: PALETTES.sage,
    messages: [
      {
        id: "m-tn-1",
        author: "buyer",
        authorName: "Tara",
        timestamp: "Oct 5 · 9:10 AM",
        body: "Hi! Just placed my order, excited to work with you. A few details about the event: wedding is March 14, 2027 in Napa. Our colors are deep teal, gold, and ivory. Neil's family is Punjabi and mine is Tamil, so we'd like the invitation to have both scripts (Gurmukhi and Tamil) along with English.",
      },
      {
        id: "m-tn-2",
        author: "seller",
        authorName: "Priya",
        timestamp: "Oct 5 · 1:33 PM",
        body: "Hi Tara! Thrilled to be part of your wedding. Tri-script invitations are one of my favorite things to design. I'll send over the intake form with a few questions about the Gurmukhi and Tamil text (family names, blessings, etc.) and start on a first draft next week.",
      },
    ],
  },
  {
    id: "conv-anika-sam",
    kind: "inquiry",
    coupleName: "Anika & Sam",
    subject: "Rush order — 300 Sikh wedding invitations",
    preview: "Do you offer rush orders? We need 300 invitations in about 3 weeks.",
    timeAgo: "3 days ago",
    unread: false,
    avatarColors: PALETTES.champagne,
    messages: [
      {
        id: "m-as-1",
        author: "buyer",
        authorName: "Anika",
        timestamp: "Oct 4 · 6:18 PM",
        body: "Hi Priya! We're getting married in five weeks and just realized we need invitations out ASAP. Do you offer rush orders? We need 300 invitations in about 3 weeks — Sikh wedding, Gurmukhi and English text, gold foil on ivory card stock, with matching RSVP cards. Would love your help!",
      },
      {
        id: "m-as-2",
        author: "seller",
        authorName: "Priya",
        timestamp: "Oct 5 · 8:40 AM",
        body: "Hi Anika & Sam — yes, I can absolutely help with a rush timeline. For a bilingual Gurmukhi/English suite with foil, three weeks is tight but doable if we can lock proofs within 48 hours. I've put together a quote below — let me know if the numbers work and I'll send over the intake form.",
        quote: {
          kind: "quote",
          description:
            "Rush order — 300 Sikh wedding invitations with Gurmukhi and English text, gold foil on ivory card stock, matching RSVP cards.",
          quantity: 300,
          unitPrice: 9.5,
          rushFee: 450,
          shipping: 85,
          total: 3385,
          deliveryEstimate: "14 business days from proof approval",
          validForDays: 7,
          note: "Rush fee covers expedited production in Jaipur. We can have proofs to you within 48 hours of order.",
          status: "sent",
        },
      },
    ],
  },
  {
    id: "conv-pooja-amit",
    kind: "inquiry",
    coupleName: "Pooja & Amit",
    subject: "Gurmukhi script invitations",
    preview: "Can you do Sikh wedding invitations with Gurmukhi script? We've loved your portfolio.",
    timeAgo: "5 days ago",
    unread: false,
    avatarColors: PALETTES.rose,
    messages: [
      {
        id: "m-pa-1",
        author: "buyer",
        authorName: "Pooja",
        timestamp: "Oct 2 · 11:05 AM",
        body: "Can you do Sikh wedding invitations with Gurmukhi script? We've loved your portfolio, especially the Ganesh foil-pressed suite, but we'd want something that works for an Anand Karaj. Also curious whether you do a matching Ardaas program booklet.",
      },
      {
        id: "m-pa-2",
        author: "seller",
        authorName: "Priya",
        timestamp: "Oct 2 · 2:12 PM",
        body: "Hi Pooja! Yes — Gurmukhi invitations are a regular part of what we do, and I work with a typesetter in Amritsar who specializes in the calligraphy. A matching Ardaas booklet is also something we offer (usually 6–12 pages, saddle-stitched or ribbon-bound). Want me to put together a few portfolio examples for you to review?",
      },
    ],
  },
];

export const MESSAGE_STATS = {
  unreadOrder: CONVERSATIONS.filter((c) => c.kind === "order" && c.unread).length,
  unreadInquiry: CONVERSATIONS.filter((c) => c.kind === "inquiry" && c.unread).length,
  totalInquiries: CONVERSATIONS.filter((c) => c.kind === "inquiry").length,
};
