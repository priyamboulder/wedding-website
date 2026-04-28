// Mock data for the planner communication hub.
// Conversations are grouped per wedding (couple thread + per-vendor thread + optional group),
// plus a "General" bucket for unsolicited inquiries and cold vendor outreach.

export type MessageSender = "planner" | "couple" | "vendor" | "group";

export type Attachment =
  | { kind: "image"; name: string; meta: string }
  | { kind: "doc"; name: string; meta: string }
  | { kind: "link"; name: string; url: string };

export type ThreadMessage = {
  id: string;
  from: string; // display name
  initials: string;
  role: MessageSender;
  time: string; // display time
  body: string;
  attachments?: Attachment[];
  seen?: boolean;
};

export type ThreadKind = "couple" | "vendor" | "group" | "inquiry" | "outreach";

export type ConversationThread = {
  id: string;
  title: string;
  kind: ThreadKind;
  subtitle?: string;
  glyph: string;
  unread: number;
  urgent?: boolean;
  preview: string;
  updatedAt: string;
  messages: ThreadMessage[];
  // Quick context ribbon shown above the thread
  context?: {
    couple?: string;
    dates?: string;
    venue?: string;
    guests?: number;
    events?: string[];
  };
};

export type ConversationGroup = {
  id: string;
  label: string; // either couple names or "General"
  weddingId?: string;
  dates?: string;
  threads: ConversationThread[];
};

export const MESSAGE_GROUPS: ConversationGroup[] = [
  {
    id: "priya-arjun",
    label: "Priya & Arjun",
    weddingId: "priya-arjun",
    dates: "Oct 15–17, 2026",
    threads: [
      {
        id: "pa-couple",
        title: "Priya & Arjun",
        kind: "couple",
        subtitle: "Couple thread",
        glyph: "💬",
        unread: 0,
        preview:
          "Thanks for looping us in on the DJ options — we'll listen to the reels tonight.",
        updatedAt: "9:42 AM",
        context: {
          couple: "Priya & Arjun",
          dates: "Oct 15–17, 2026",
          venue: "The Legacy Castle",
          guests: 425,
          events: ["Sangeet", "Mehndi", "Haldi", "Ceremony", "Reception"],
        },
        messages: [
          {
            id: "m1",
            from: "You",
            initials: "UM",
            role: "planner",
            time: "Yesterday 4:20 PM",
            body:
              "Shortlisted three DJs who've worked Legacy Castle before. I'll send reels tonight — all within your entertainment budget.",
            seen: true,
          },
          {
            id: "m2",
            from: "Priya",
            initials: "PR",
            role: "couple",
            time: "Yesterday 6:01 PM",
            body:
              "Amazing! Arjun's mom is very particular about the baraat track selection — can we make sure whoever we pick is flexible on the playlist?",
            seen: true,
          },
          {
            id: "m3",
            from: "You",
            initials: "UM",
            role: "planner",
            time: "Today 9:38 AM",
            body:
              "All three do custom setlists. Here's the reel pack + price sheet.",
            attachments: [
              { kind: "doc", name: "DJ_Shortlist_Priya+Arjun.pdf", meta: "4 pages · 1.2 MB" },
              { kind: "link", name: "DJ Riz Instagram reel", url: "instagram.com/djriz" },
            ],
            seen: true,
          },
          {
            id: "m4",
            from: "Arjun",
            initials: "AR",
            role: "couple",
            time: "Today 9:42 AM",
            body:
              "Thanks for looping us in on the DJ options — we'll listen to the reels tonight.",
            seen: true,
          },
        ],
      },
      {
        id: "pa-joseph",
        title: "Stories by Joseph Radhik",
        kind: "vendor",
        subtitle: "Photography",
        glyph: "📷",
        unread: 0,
        preview: "Confirmed — flying in Oct 14, first look at 8 AM on the 15th works.",
        updatedAt: "Today 8:15 AM",
        context: {
          couple: "Priya & Arjun",
          dates: "Oct 15–17, 2026",
          venue: "The Legacy Castle",
        },
        messages: [
          {
            id: "m1",
            from: "You",
            initials: "UM",
            role: "planner",
            time: "Mon 2:10 PM",
            body:
              "Joseph — locking in the first-look call time for Priya & Arjun. Can you do 8 AM on the 15th before the haldi?",
            seen: true,
          },
          {
            id: "m2",
            from: "Joseph Radhik",
            initials: "JR",
            role: "vendor",
            time: "Today 8:15 AM",
            body:
              "Confirmed — flying in Oct 14, first look at 8 AM on the 15th works. Second shooter will be Anvita; she covered Meera's Sangeet last year.",
            seen: true,
          },
        ],
      },
      {
        id: "pa-elegant",
        title: "Elegant Affairs",
        kind: "vendor",
        subtitle: "Decor & Florals",
        glyph: "🎨",
        unread: 1,
        urgent: true,
        preview: "Awaiting contract signature — sent 5 days ago. Can you nudge?",
        updatedAt: "Today 7:58 AM",
        context: {
          couple: "Priya & Arjun",
          dates: "Oct 15–17, 2026",
          venue: "The Legacy Castle",
        },
        messages: [
          {
            id: "m1",
            from: "You",
            initials: "UM",
            role: "planner",
            time: "Last Thu 11:02 AM",
            body:
              "Attaching countersigned proposal for Priya & Arjun — please confirm receipt.",
            attachments: [
              { kind: "doc", name: "Decor_Proposal_v4_PA.pdf", meta: "12 pages · 3.8 MB" },
            ],
            seen: true,
          },
          {
            id: "m2",
            from: "Reena Mehta",
            initials: "RM",
            role: "vendor",
            time: "Fri 5:30 PM",
            body:
              "Got it — will route for signature Monday.",
            seen: true,
          },
          {
            id: "m3",
            from: "Reena Mehta",
            initials: "RM",
            role: "vendor",
            time: "Today 7:58 AM",
            body:
              "Awaiting contract signature — sent 5 days ago. Can you nudge? Our install crew needs a locked scope by Oct 6 to hold the team.",
            seen: false,
          },
        ],
      },
      {
        id: "pa-group",
        title: "All parties — Priya & Arjun",
        kind: "group",
        subtitle: "Couple + Planner + Lead vendors",
        glyph: "👥",
        unread: 2,
        preview: "Joseph: Reception end time pushed to 11:30, confirmed with Legacy.",
        updatedAt: "Today 10:11 AM",
        context: {
          couple: "Priya & Arjun",
          dates: "Oct 15–17, 2026",
          venue: "The Legacy Castle",
          events: ["Sangeet", "Mehndi", "Haldi", "Ceremony", "Reception"],
        },
        messages: [
          {
            id: "m1",
            from: "You",
            initials: "UM",
            role: "planner",
            time: "Today 10:05 AM",
            body:
              "Group thread for the Oct 15–17 weekend. Sharing the updated run-of-show — please raise anything blocking by Friday.",
            attachments: [
              { kind: "doc", name: "ROS_Priya+Arjun_v3.pdf", meta: "3 days · 2.1 MB" },
            ],
            seen: false,
          },
          {
            id: "m2",
            from: "Joseph Radhik",
            initials: "JR",
            role: "vendor",
            time: "Today 10:09 AM",
            body: "Reception end time pushed to 11:30, confirmed with Legacy.",
            seen: false,
          },
          {
            id: "m3",
            from: "Priya",
            initials: "PR",
            role: "couple",
            time: "Today 10:11 AM",
            body: "Works for us!",
            seen: false,
          },
        ],
      },
    ],
  },
  {
    id: "neha-vikram",
    label: "Neha & Vikram",
    weddingId: "neha-vikram",
    dates: "Nov 8–10, 2026",
    threads: [
      {
        id: "nv-couple",
        title: "Neha & Vikram",
        kind: "couple",
        subtitle: "Couple thread",
        glyph: "💬",
        unread: 1,
        preview: "Can we add our cousin's family of 8 to the ceremony count?",
        updatedAt: "Yesterday 9:12 PM",
        context: {
          couple: "Neha & Vikram",
          dates: "Nov 8–10, 2026",
          venue: "Oheka Castle",
          guests: 350,
        },
        messages: [
          {
            id: "m1",
            from: "Neha",
            initials: "NE",
            role: "couple",
            time: "Yesterday 9:12 PM",
            body: "Can we add our cousin's family of 8 to the ceremony count?",
            seen: false,
          },
        ],
      },
      {
        id: "nv-djriz",
        title: "DJ Riz Entertainment",
        kind: "vendor",
        subtitle: "DJ · Shortlisted by couple",
        glyph: "🎵",
        unread: 0,
        preview: "Quote inbound by tomorrow — 3-event package for Nov weekend.",
        updatedAt: "Mon 4:18 PM",
        context: {
          couple: "Neha & Vikram",
          dates: "Nov 8–10, 2026",
          venue: "Oheka Castle",
        },
        messages: [
          {
            id: "m1",
            from: "You",
            initials: "UM",
            role: "planner",
            time: "Mon 2:04 PM",
            body:
              "Hi Riz — reaching out on behalf of Neha & Vikram (Oheka Castle, Nov 8–10). They've shortlisted you. Can you send a 3-event quote (Mehndi, Ceremony, Reception)?",
            seen: true,
          },
          {
            id: "m2",
            from: "DJ Riz",
            initials: "DR",
            role: "vendor",
            time: "Mon 4:18 PM",
            body: "Quote inbound by tomorrow — 3-event package for Nov weekend.",
            seen: true,
          },
        ],
      },
    ],
  },
  {
    id: "anita-raj",
    label: "Anita & Raj",
    weddingId: "anita-raj",
    dates: "Dec 12–14, 2026",
    threads: [
      {
        id: "ar-couple",
        title: "Anita & Raj",
        kind: "couple",
        subtitle: "Couple thread",
        glyph: "💬",
        unread: 1,
        urgent: true,
        preview: "Urgent: we need to lock the photographer this week — any updates?",
        updatedAt: "Today 7:02 AM",
        context: {
          couple: "Anita & Raj",
          dates: "Dec 12–14, 2026",
          venue: "Dreams Riviera Cancún",
          guests: 200,
        },
        messages: [
          {
            id: "m1",
            from: "Anita",
            initials: "AN",
            role: "couple",
            time: "Today 7:02 AM",
            body: "Urgent: we need to lock the photographer this week — any updates?",
            seen: false,
          },
        ],
      },
    ],
  },
  {
    id: "general",
    label: "General",
    threads: [
      {
        id: "gen-simran",
        title: "Simran & Dev",
        kind: "inquiry",
        subtitle: "New inquiry · March 2027, NJ",
        glyph: "✉",
        unread: 0,
        preview: "Hi! We found you via the South Asian Bride directory…",
        updatedAt: "Yesterday",
        messages: [
          {
            id: "m1",
            from: "Simran Kaur",
            initials: "SK",
            role: "couple",
            time: "Yesterday 11:40 AM",
            body:
              "Hi! We found you via the South Asian Bride directory — planning a 300-guest March 2027 weekend in NJ. Do you have availability for a discovery call next week?",
            seen: true,
          },
        ],
      },
      {
        id: "gen-henna",
        title: "Henna by Priya",
        kind: "outreach",
        subtitle: "Cold outreach · Mehndi vendor",
        glyph: "🌿",
        unread: 0,
        preview: "Portfolio looks gorgeous — are you taking bookings for Oct '26?",
        updatedAt: "2 days ago",
        messages: [
          {
            id: "m1",
            from: "You",
            initials: "UM",
            role: "planner",
            time: "Mon 3:11 PM",
            body:
              "Portfolio looks gorgeous — are you taking bookings for Oct '26? Would love to add you to our preferred Mehndi artist list.",
            seen: true,
          },
        ],
      },
    ],
  },
];

// Quick reply templates the planner can drop into any thread.
export type QuickReply = {
  id: string;
  label: string;
  body: string; // can contain {couple}, {venue}, {date}, {guests}, {vendor}
};

export const QUICK_REPLIES: QuickReply[] = [
  {
    id: "outreach",
    label: "Initial vendor outreach",
    body:
      "Hi {vendor}, I'm reaching out on behalf of my clients {couple} who are getting married at {venue} on {date}. They're interested in your services. Their wedding includes Sangeet, Mehndi, Ceremony, and Reception with {guests} guests. Are you available?",
  },
  {
    id: "follow-up",
    label: "Follow up on proposal",
    body:
      "Hi {vendor}, circling back on the proposal sent for {couple}. They're excited but would love a timeline for next steps. Can you confirm receipt and let me know when we might hear back?",
  },
  {
    id: "timeline",
    label: "Timeline share",
    body:
      "Hi — sharing the most recent run-of-show for {couple} ({date} at {venue}). Please flag any timing conflicts by EOD Friday so we can lock the schedule.",
  },
  {
    id: "thanks",
    label: "Thank you post-wedding",
    body:
      "Thank you so much for everything you brought to {couple}'s wedding at {venue}. The family can't stop raving. I'd love to feature you in our next preferred-vendor refresh.",
  },
];
