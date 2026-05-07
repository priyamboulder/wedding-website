"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as Sentry from "@sentry/nextjs";
import type {
  Inquiry,
  InquiryMessage,
  InquirySource,
  MessageAttachment,
} from "@/types/inquiry";
import { useNotificationsStore } from "@/stores/notifications-store";

// ── Supabase sync helpers (fire-and-forget, never block UI) ──────────────────
async function getSupabase() {
  if (typeof window === "undefined") return null;
  try {
    const { supabaseBrowser } = await import("@/lib/supabase/browser-client");
    return supabaseBrowser;
  } catch {
    return null;
  }
}

async function dbUpsertInquiry(inquiry: Inquiry) {
  const sb = await getSupabase();
  if (!sb) return;
  await sb.from("inquiries").upsert({
    id: inquiry.id,
    status: inquiry.status,
    couple_id: inquiry.couple_id,
    couple_name: inquiry.couple_name,
    vendor_id: inquiry.vendor_id,
    vendor_name: inquiry.vendor_name,
    vendor_category: inquiry.vendor_category,
    planner_id: inquiry.planner_id,
    source: inquiry.source,
    package_ids: inquiry.package_ids,
    wedding_date: inquiry.wedding_date,
    guest_count: inquiry.guest_count,
    venue_name: inquiry.venue_name,
    events: inquiry.events,
    budget_min: inquiry.budget_min,
    budget_max: inquiry.budget_max,
    messages: inquiry.messages,
    viewed_at: inquiry.viewed_at,
    created_at: inquiry.created_at,
    updated_at: inquiry.updated_at,
  });
}

async function dbPatchInquiry(id: string, patch: Partial<Inquiry>) {
  const sb = await getSupabase();
  if (!sb) return;
  await sb.from("inquiries").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
}

export async function loadInquiriesFromDB(userId: string, role: "couple" | "vendor"): Promise<Inquiry[]> {
  const sb = await getSupabase();
  if (!sb) return [];
  const col = role === "couple" ? "couple_id" : "vendor_id";
  const { data } = await sb.from("inquiries").select("*").eq(col, userId).order("created_at", { ascending: false });
  return (data ?? []) as Inquiry[];
}

export type SubmitInquiryInput = {
  couple_id: string;
  couple_name: string;
  vendor_id: string;
  vendor_name: string;
  vendor_category: Inquiry["vendor_category"];
  planner_id?: string | null;
  source: InquirySource;
  message: string;
  package_ids?: string[];
  wedding_date: string;
  guest_count: number;
  venue_name?: string | null;
  events?: string[];
  budget_min?: number | null;
  budget_max?: number | null;
};

export type SendMessageInput = {
  sender: "couple" | "vendor";
  sender_name: string;
  body: string;
  attachments?: MessageAttachment[];
};

type InquiryState = {
  inquiries: Inquiry[];
  submitInquiry: (input: SubmitInquiryInput) => string;
  viewInquiry: (id: string) => void;
  sendMessage: (id: string, input: SendMessageInput) => void;
  declineInquiry: (id: string) => void;
  bookFromInquiry: (id: string) => void;
  getInquiriesByCouple: (coupleId: string) => Inquiry[];
  getInquiriesByVendor: (vendorId: string) => Inquiry[];
  getInquiryById: (id: string) => Inquiry | undefined;
  loadFromDB: (userId: string, role: "couple" | "vendor") => Promise<void>;
};

const genId = () =>
  `inq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const genMsgId = () =>
  `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

function msg(
  id: string,
  sender: "couple" | "vendor",
  sender_name: string,
  body: string,
  created_at: string,
  attachments: MessageAttachment[] = [],
): InquiryMessage {
  return { id, sender, sender_name, body, attachments, created_at };
}

// Seed inquiries — rewritten from the old lib/vendor-portal/seed INQUIRIES
// and MESSAGE_THREADS, merged into the unified Inquiry shape. Messages live
// inline on the inquiry itself so both sides share the same thread.
const SEED_INQUIRIES: Inquiry[] = [
  {
    id: "inq-priya-arjun",
    status: "responded",
    couple_id: "couple-priya-arjun",
    couple_name: "Priya & Arjun",
    vendor_id: "vendor-aurora-studios",
    vendor_name: "Aurora Studios",
    vendor_category: "photography",
    planner_id: "planner-radz-events",
    source: "recommendation",
    package_ids: ["pkg-signature-3day"],
    wedding_date: "2026-05-12",
    guest_count: 320,
    venue_name: "The Leela Palace, Udaipur",
    events: ["Mehendi", "Sangeet", "Wedding", "Reception"],
    budget_min: 1000000,
    budget_max: 1400000,
    messages: [
      {
        id: "m-pa-1",
        sender: "couple",
        sender_name: "Priya Menon",
        body: "Hi Priya (love the name overlap!) — Radhika at Radz Events pointed us your way. We're planning a 4-event wedding at The Leela Palace, Udaipur on May 12. Would love to see your 3-day packages.",
        attachments: [],
        created_at: "2026-04-02T11:20:00.000Z",
      },
      {
        id: "m-pa-2",
        sender: "vendor",
        sender_name: "Priya Malhotra",
        body: "Priya & Arjun — Udaipur is our home turf, and May is peak golden-hour season. Sending over our Signature 3-Day package with Radz's preferred-planner discount applied. Attaching a recent Leela editorial from last November.",
        attachments: [
          { id: "a-pa-1", name: "Aurora-Signature-3Day-PriyaArjun.pdf", kind: "pdf", size: "1.8 MB" },
          { id: "a-pa-2", name: "Leela-November-2025-Highlights.pdf", kind: "pdf", size: "6.4 MB" },
        ],
        created_at: "2026-04-03T09:15:00.000Z",
      },
      {
        id: "m-pa-3",
        sender: "couple",
        sender_name: "Priya Menon",
        body: "This is beautiful. We'd love to move forward — can we set up a 30-min call next week to walk through the family list and discuss the mandap coverage specifically?",
        attachments: [],
        created_at: "2026-04-05T16:40:00.000Z",
      },
    ],
    created_at: "2026-04-02T11:20:00.000Z",
    updated_at: "2026-04-05T16:40:00.000Z",
    viewed_at: "2026-04-02T14:10:00.000Z",
  },
  {
    id: "inq-001",
    status: "submitted",
    couple_id: "couple-ananya-rohan",
    couple_name: "Ananya & Rohan",
    vendor_id: "vendor-aurora-studios",
    vendor_name: "Aurora Studios",
    vendor_category: "photography",
    planner_id: null,
    source: "marketplace",
    package_ids: ["pkg-signature-3day"],
    wedding_date: "2026-11-22",
    guest_count: 420,
    venue_name: "Oberoi Udaivilas, Udaipur",
    events: ["Mehendi", "Sangeet", "Wedding", "Reception"],
    budget_min: 800000,
    budget_max: 1200000,
    messages: [
      msg(
        "m-001-1",
        "couple",
        "Ananya Krishnan",
        "Hi Priya — we loved the Oberoi Amarvilas story on your feed. Would you be open to a destination shoot in November? We're planning a 4-day celebration at Oberoi Udaivilas, Udaipur, around 420 guests. Mehendi + Sangeet on Nov 20, Wedding Nov 22, Reception Nov 23.",
        "2026-04-20T10:42:00.000Z",
      ),
      msg(
        "m-001-2",
        "couple",
        "Ananya Krishnan",
        "Both families are South Indian but we grew up in Delhi, so the ceremony will be fairly traditional and we'd love editorial candids alongside the ritual coverage. Our mood board is tonal — ivory, gold, old-rose. Happy to share more on a call!",
        "2026-04-20T10:44:00.000Z",
      ),
    ],
    created_at: "2026-04-20T10:42:00.000Z",
    updated_at: "2026-04-20T10:44:00.000Z",
    viewed_at: null,
  },
  {
    id: "inq-002",
    status: "submitted",
    couple_id: "couple-sonia-arjun",
    couple_name: "Sonia & Arjun",
    vendor_id: "vendor-aurora-studios",
    vendor_name: "Aurora Studios",
    vendor_category: "photography",
    planner_id: "planner-meera-decor",
    source: "planner_referral",
    package_ids: ["pkg-editorial-full-day"],
    wedding_date: "2027-02-14",
    guest_count: 120,
    venue_name: "Samode Palace, Jaipur",
    events: ["Haldi", "Wedding"],
    budget_min: 500000,
    budget_max: 800000,
    messages: [
      msg(
        "m-002-1",
        "couple",
        "Sonia Mehta",
        "Hi Aurora — Meera from Meera Decor recommended you highly. We're planning an intimate wedding at Samode Palace, around 120 guests. Haldi on Feb 13, Wedding Feb 14.",
        "2026-04-20T08:15:00.000Z",
      ),
      msg(
        "m-002-2",
        "couple",
        "Sonia Mehta",
        "Would you consider a focused 2-day package with one photographer? We care more about slow, intentional frames than volume of coverage. Budget is around ₹6-8 L for photography + light video if possible.",
        "2026-04-20T08:17:00.000Z",
      ),
    ],
    created_at: "2026-04-20T08:15:00.000Z",
    updated_at: "2026-04-20T08:17:00.000Z",
    viewed_at: null,
  },
  {
    id: "inq-003",
    status: "responded",
    couple_id: "couple-leela-dev",
    couple_name: "Leela & Dev",
    vendor_id: "vendor-aurora-studios",
    vendor_name: "Aurora Studios",
    vendor_category: "photography",
    planner_id: null,
    source: "marketplace",
    package_ids: ["pkg-signature-3day"],
    wedding_date: "2026-12-09",
    guest_count: 280,
    venue_name: "Taj Exotica, Goa",
    events: ["Mehendi", "Wedding", "Reception"],
    budget_min: 1000000,
    budget_max: 1500000,
    messages: [
      msg(
        "m-003-1",
        "couple",
        "Leela Narang",
        "Hi Priya — we booked Taj Exotica for our wedding on Dec 9, 2026. Mehendi on Dec 7, Wedding Dec 9, Reception Dec 10. Around 280 guests. Loved your Jaipur 2024 album.",
        "2026-04-10T14:30:00.000Z",
      ),
      msg(
        "m-003-2",
        "vendor",
        "Priya Malhotra",
        "Leela, thank you for the kind note. Dec 9 is available for us. Taj Exotica is one of our favorite venues — the light at the beach mandap is stunning in late afternoon. I'd love to send a detailed proposal for 3-day coverage with a second shooter and our editorial leather album.",
        "2026-04-11T11:00:00.000Z",
      ),
      msg(
        "m-003-3",
        "vendor",
        "Priya Malhotra",
        "Attaching our full proposal. The package covers all three days, a second shooter on the wedding day, a 90-second highlight reel, and the 60-page heirloom album. Quote is ₹12,80,000 all-inclusive. Valid for 14 days.",
        "2026-04-19T16:20:00.000Z",
        [
          { id: "a-003-1", name: "Aurora-Proposal-LeelaDev-Dec2026.pdf", kind: "pdf", size: "1.4 MB" },
          { id: "a-003-2", name: "Sample-Album-Editorial.pdf", kind: "pdf", size: "8.2 MB" },
        ],
      ),
    ],
    created_at: "2026-04-10T14:30:00.000Z",
    updated_at: "2026-04-19T16:20:00.000Z",
    viewed_at: "2026-04-10T15:45:00.000Z",
  },
  {
    id: "inq-004",
    status: "responded",
    couple_id: "couple-maya-kabir",
    couple_name: "Maya & Kabir",
    vendor_id: "vendor-aurora-studios",
    vendor_name: "Aurora Studios",
    vendor_category: "photography",
    planner_id: null,
    source: "profile_panel",
    package_ids: [],
    wedding_date: "2027-03-08",
    guest_count: 180,
    venue_name: "Claridge's, London",
    events: ["Wedding", "Reception"],
    budget_min: 1200000,
    budget_max: 1800000,
    messages: [
      msg(
        "m-004-1",
        "couple",
        "Maya Iyer",
        "Hi Aurora — we're a UK-based couple planning a London wedding at Claridge's on March 8, 2027. Traditional South Indian ceremony + Western reception. ~180 guests. Would you travel?",
        "2026-04-13T09:10:00.000Z",
      ),
      msg(
        "m-004-2",
        "vendor",
        "Priya Malhotra",
        "Maya, hello! Yes — we travel for weddings and have shot a few in London (happy to share those). March 8 is currently open. I'll hold the date informally for 72 hours so you have breathing room.",
        "2026-04-13T15:45:00.000Z",
      ),
      msg(
        "m-004-3",
        "vendor",
        "Priya Malhotra",
        "Do you have the Claridge's contract confirmed? Once that's locked in, I can send you a detailed travel-inclusive proposal (includes my flights + 2 nights lodging, one second shooter, full editorial coverage).",
        "2026-04-17T10:00:00.000Z",
      ),
    ],
    created_at: "2026-04-13T09:10:00.000Z",
    updated_at: "2026-04-17T10:00:00.000Z",
    viewed_at: "2026-04-13T11:30:00.000Z",
  },
  {
    id: "inq-005",
    status: "booked",
    couple_id: "couple-tara-vikram",
    couple_name: "Tara & Vikram",
    vendor_id: "vendor-aurora-studios",
    vendor_name: "Aurora Studios",
    vendor_category: "photography",
    planner_id: "planner-wedding-filer",
    source: "recommendation",
    package_ids: ["pkg-full-coverage-film"],
    wedding_date: "2027-01-25",
    guest_count: 340,
    venue_name: "The Leela Palace, Bangalore",
    events: ["Wedding", "Reception"],
    budget_min: null,
    budget_max: null,
    messages: [
      msg(
        "m-005-1",
        "couple",
        "Tara Shenoy",
        "Hi Priya — signed contract attached. 50% retainer has been sent via UPI. Looking forward to working with you!",
        "2026-04-12T16:00:00.000Z",
        [
          { id: "a-005-1", name: "Aurora-Contract-TaraVikram-Signed.pdf", kind: "pdf", size: "2.2 MB" },
        ],
      ),
      msg(
        "m-005-2",
        "vendor",
        "Priya Malhotra",
        "Tara, Vikram — welcome to the Aurora family. Retainer received (thank you!). I'll be in touch in a few weeks to set up a pre-shoot planning call. Meanwhile, feel free to share anything on the mood board.",
        "2026-04-13T10:30:00.000Z",
      ),
    ],
    created_at: "2026-04-12T16:00:00.000Z",
    updated_at: "2026-04-13T10:30:00.000Z",
    viewed_at: "2026-04-12T16:30:00.000Z",
  },
  {
    id: "inq-006",
    status: "responded",
    couple_id: "couple-kiran-aanya",
    couple_name: "Kiran & Aanya",
    vendor_id: "vendor-aurora-studios",
    vendor_name: "Aurora Studios",
    vendor_category: "photography",
    planner_id: null,
    source: "marketplace",
    package_ids: ["pkg-pre-wedding-story"],
    wedding_date: "2026-10-18",
    guest_count: 220,
    venue_name: "Mehrangarh Fort, Jodhpur",
    events: ["Mehendi", "Sangeet", "Wedding"],
    budget_min: 600000,
    budget_max: 900000,
    messages: [
      msg(
        "m-006-1",
        "couple",
        "Kiran Bhatia",
        "Hello! We're getting married at Mehrangarh Fort on October 18, 2026. Mehendi, Sangeet, and Wedding across Oct 16-18. About 220 guests.",
        "2026-04-16T11:20:00.000Z",
      ),
      msg(
        "m-006-2",
        "vendor",
        "Priya Malhotra",
        "Kiran, Aanya — Mehrangarh is one of the most breathtaking venues in India. Oct 18 is open for us. I'd love to set up a 30-min discovery call to understand your story before I send a proposal.",
        "2026-04-16T14:10:00.000Z",
        [
          { id: "a-006-1", name: "Mehrangarh-2023-Highlights.pdf", kind: "pdf", size: "6.1 MB" },
        ],
      ),
      msg(
        "m-006-3",
        "vendor",
        "Priya Malhotra",
        "Sharing a few frames from the Mehrangarh wedding we shot last October — the ramparts at blue hour are something else. What afternoon next week works for a call?",
        "2026-04-16T14:12:00.000Z",
      ),
    ],
    created_at: "2026-04-16T11:20:00.000Z",
    updated_at: "2026-04-16T14:12:00.000Z",
    viewed_at: "2026-04-16T13:05:00.000Z",
  },
];

export const useInquiryStore = create<InquiryState>()(
  persist(
    (set, get) => ({
      inquiries: SEED_INQUIRIES,

      submitInquiry: (input) => {
        const id = genId();
        const now = new Date().toISOString();
        const firstMessage: InquiryMessage = {
          id: genMsgId(),
          sender: "couple",
          sender_name: input.couple_name,
          body: input.message,
          attachments: [],
          created_at: now,
        };
        const inquiry: Inquiry = {
          id,
          status: "submitted",
          couple_id: input.couple_id,
          couple_name: input.couple_name,
          vendor_id: input.vendor_id,
          vendor_name: input.vendor_name,
          vendor_category: input.vendor_category,
          planner_id: input.planner_id ?? null,
          source: input.source,
          package_ids: input.package_ids ?? [],
          wedding_date: input.wedding_date,
          guest_count: input.guest_count,
          venue_name: input.venue_name ?? null,
          events: input.events ?? [],
          budget_min: input.budget_min ?? null,
          budget_max: input.budget_max ?? null,
          messages: [firstMessage],
          created_at: now,
          updated_at: now,
          viewed_at: null,
        };
        set((s) => ({ inquiries: [inquiry, ...s.inquiries] }));
        // Persist to Supabase in the background
        dbUpsertInquiry(inquiry).catch((err) => Sentry.captureException(err));
        useNotificationsStore.getState().addNotification({
          recipient: "vendor",
          type: "inquiry_received",
          title: "New inquiry",
          body: `New inquiry from ${input.couple_name}`,
          link: "/vendor/inquiries",
          actor_name: input.couple_name,
        });
        return id;
      },

      viewInquiry: (id) => {
        const now = new Date().toISOString();
        const before = get().inquiries.find((i) => i.id === id);
        set((s) => ({
          inquiries: s.inquiries.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: i.status === "submitted" ? "viewed" : i.status,
                  viewed_at: i.viewed_at ?? now,
                  updated_at: now,
                }
              : i,
          ),
        }));
        dbPatchInquiry(id, { status: "viewed", viewed_at: now }).catch((err) => Sentry.captureException(err));
        if (before && before.viewed_at == null) {
          useNotificationsStore.getState().addNotification({
            recipient: "couple",
            type: "inquiry_viewed",
            title: "Inquiry viewed",
            body: `${before.vendor_name} viewed your inquiry`,
            link: "/app/inquiries",
            actor_name: before.vendor_name,
          });
        }
      },

      sendMessage: (id, input) => {
        const now = new Date().toISOString();
        const message: InquiryMessage = {
          id: genMsgId(),
          sender: input.sender,
          sender_name: input.sender_name,
          body: input.body,
          attachments: input.attachments ?? [],
          created_at: now,
        };
        const before = get().inquiries.find((i) => i.id === id);
        set((s) => ({
          inquiries: s.inquiries.map((i) => {
            if (i.id !== id) return i;
            // Vendor replying to a submitted/viewed inquiry promotes status
            // to "responded". Couple replies and replies after booked/declined
            // don't change status.
            const nextStatus: Inquiry["status"] =
              input.sender === "vendor" &&
              (i.status === "submitted" || i.status === "viewed")
                ? "responded"
                : i.status;
            return {
              ...i,
              messages: [...i.messages, message],
              status: nextStatus,
              viewed_at:
                input.sender === "vendor" && i.viewed_at == null
                  ? now
                  : i.viewed_at,
              updated_at: now,
            };
          }),
        }));
        // Sync updated inquiry (with new message) to Supabase
        const updated = get().inquiries.find((i) => i.id === id);
        if (updated) dbPatchInquiry(id, { messages: updated.messages, status: updated.status, viewed_at: updated.viewed_at }).catch((err) => Sentry.captureException(err));

        if (before) {
          const promoted =
            input.sender === "vendor" &&
            (before.status === "submitted" || before.status === "viewed");
          if (promoted) {
            useNotificationsStore.getState().addNotification({
              recipient: "couple",
              type: "inquiry_responded",
              title: "Vendor responded",
              body: `${before.vendor_name} responded to your inquiry`,
              link: "/app/inquiries",
              actor_name: before.vendor_name,
            });
          } else {
            const recipient = input.sender === "vendor" ? "couple" : "vendor";
            const counterparty =
              input.sender === "vendor" ? before.vendor_name : before.couple_name;
            useNotificationsStore.getState().addNotification({
              recipient,
              type: "message_received",
              title: "New message",
              body: `${input.sender_name} sent a message`,
              link: recipient === "vendor" ? "/vendor/inquiries" : "/app/inquiries",
              actor_name: input.sender_name || counterparty,
            });
          }
        }
      },

      declineInquiry: (id) => {
        const now = new Date().toISOString();
        const before = get().inquiries.find((i) => i.id === id);
        set((s) => ({
          inquiries: s.inquiries.map((i) =>
            i.id === id ? { ...i, status: "declined", updated_at: now } : i,
          ),
        }));
        dbPatchInquiry(id, { status: "declined" }).catch((err) => Sentry.captureException(err));
        if (before) {
          useNotificationsStore.getState().addNotification({
            recipient: "couple",
            type: "inquiry_declined",
            title: "Inquiry declined",
            body: `${before.vendor_name} declined your inquiry`,
            link: "/app/inquiries",
            actor_name: before.vendor_name,
          });
        }
      },

      bookFromInquiry: (id) => {
        const now = new Date().toISOString();
        const before = get().inquiries.find((i) => i.id === id);
        set((s) => ({
          inquiries: s.inquiries.map((i) =>
            i.id === id ? { ...i, status: "booked", updated_at: now } : i,
          ),
        }));
        dbPatchInquiry(id, { status: "booked" }).catch((err) => Sentry.captureException(err));
        if (before) {
          useNotificationsStore.getState().addNotification({
            recipient: "vendor",
            type: "inquiry_booked",
            title: "Inquiry booked",
            body: `${before.couple_name} booked from inquiry`,
            link: "/vendor/inquiries",
            actor_name: before.couple_name,
          });
        }
      },

      getInquiriesByCouple: (coupleId) =>
        get().inquiries.filter((i) => i.couple_id === coupleId),

      getInquiriesByVendor: (vendorId) =>
        get().inquiries.filter((i) => i.vendor_id === vendorId),

      getInquiryById: (id) => get().inquiries.find((i) => i.id === id),

      loadFromDB: async (userId, role) => {
        const dbInquiries = await loadInquiriesFromDB(userId, role);
        if (dbInquiries.length === 0) return;
        // Merge: DB rows win over seed data; locally-created rows are kept if not in DB
        set((s) => {
          const dbIds = new Set(dbInquiries.map((i) => i.id));
          const localOnly = s.inquiries.filter((i) => !dbIds.has(i.id) && !i.id.startsWith("inq-"));
          return { inquiries: [...dbInquiries, ...localOnly] };
        });
      },
    }),
    {
      name: "ananya-inquiries",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
    },
  ),
);
