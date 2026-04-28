import type {
  PartnershipProposal,
  PartnershipMessage,
  PartnershipPayout,
} from "@/types/partnership";
import { calculatePlatformFee, calculateNetPayout } from "@/types/partnership";

const iso = (d: string) => new Date(d).toISOString();

// Vendors here are stored under STORE_VENDORS in lib/store-seed (the catalog
// of artisan brands behind Ananya products). Creators ride on SEED_CREATORS
// from lib/creators/seed.

export const SEED_PARTNERSHIPS: PartnershipProposal[] = [
  {
    id: "ptr-pernia-priya-lehenga",
    vendorId: "v-sabya-atelier",
    creatorId: "cr-priya-patel",
    title: "Feature 3 new lehengas in your next collection",
    description:
      "We're launching the Spring Heirloom line — three benarasi lehengas with revival zardozi. Would love for them to live in your next bridal edit. Open to your direction on styling and write-ups.",
    deliverableType: "collection_feature",
    productIds: ["p-lehenga-anarkali", "p-dupatta-gota", "p-saree-benares-red"],
    proposedBudget: 50000,
    platformFee: calculatePlatformFee(50000),
    timelineDays: 21,
    status: "completed",
    creatorCounterBudget: null,
    creatorCounterNotes: null,
    declineReason: null,
    acceptedAt: iso("2026-03-12T14:20:00Z"),
    deliveredAt: iso("2026-03-29T10:05:00Z"),
    approvedAt: iso("2026-03-30T09:15:00Z"),
    completedAt: iso("2026-04-02T11:00:00Z"),
    createdAt: iso("2026-03-10T09:00:00Z"),
    updatedAt: iso("2026-04-02T11:00:00Z"),
  },
  {
    id: "ptr-paper-anika-guide",
    vendorId: "v-letterpress-lane",
    creatorId: "cr-anika-desai",
    title: "Write a dedicated guide reviewing our new invitation line",
    description:
      "Three new letterpress suites — Marigold, Tessellate, and Slow Sunday. We'd love a dedicated guide walking your audience through paper choices, ink combinations, and pairing logic.",
    deliverableType: "dedicated_guide",
    productIds: ["p-invite-suite-letterpress", "p-rsvp-cards"],
    proposedBudget: 30000,
    platformFee: calculatePlatformFee(30000),
    timelineDays: 14,
    status: "in_progress",
    creatorCounterBudget: null,
    creatorCounterNotes: null,
    declineReason: null,
    acceptedAt: iso("2026-04-15T11:30:00Z"),
    deliveredAt: null,
    approvedAt: null,
    completedAt: null,
    createdAt: iso("2026-04-12T08:45:00Z"),
    updatedAt: iso("2026-04-15T11:30:00Z"),
  },
  {
    id: "ptr-jaipur-meera-pending",
    vendorId: "v-jaipur-heritage",
    creatorId: "cr-meera-shah",
    title: "Feature our kundan polki set in your décor exhibition",
    description:
      "We saw your last exhibition — beautifully composed. Would love to slot two of our kundan pieces into the next one. Open to creative direction and pairing with your décor picks.",
    deliverableType: "exhibition_feature",
    productIds: ["p-kundan-choker", "p-polki-bridal"],
    proposedBudget: 40000,
    platformFee: calculatePlatformFee(40000),
    timelineDays: 30,
    status: "pending",
    creatorCounterBudget: null,
    creatorCounterNotes: null,
    declineReason: null,
    acceptedAt: null,
    deliveredAt: null,
    approvedAt: null,
    completedAt: null,
    createdAt: iso("2026-04-20T13:00:00Z"),
    updatedAt: iso("2026-04-20T13:00:00Z"),
  },
  {
    id: "ptr-marigold-meera-negotiating",
    vendorId: "v-marigold-studio",
    creatorId: "cr-meera-shah",
    title: "Mandap design feature in your next décor drop",
    description:
      "Our new rose-gold mandap and centerpieces would slot well into your next seasonal drop. Looking to feature 4 pieces with creator notes.",
    deliverableType: "social_mention",
    productIds: ["p-mandap-rose-gold", "p-centerpiece-rose", "p-marigold-garland"],
    proposedBudget: 25000,
    platformFee: calculatePlatformFee(25000),
    timelineDays: 14,
    status: "negotiating",
    creatorCounterBudget: 35000,
    creatorCounterNotes:
      "Happy to do this. Bumping the budget — three featured products plus a styled photo set is closer to my standard rate for a top-tier slot.",
    declineReason: null,
    acceptedAt: null,
    deliveredAt: null,
    approvedAt: null,
    completedAt: null,
    createdAt: iso("2026-04-18T09:30:00Z"),
    updatedAt: iso("2026-04-19T16:00:00Z"),
  },
];

export const SEED_PARTNERSHIP_MESSAGES: PartnershipMessage[] = [
  {
    id: "msg-1",
    partnershipId: "ptr-pernia-priya-lehenga",
    senderType: "vendor",
    senderId: "v-sabya-atelier",
    messageText:
      "Hi Priya — proposal sent. Let us know if the timeline works; happy to ship the lookbook over for reference.",
    createdAt: iso("2026-03-10T09:05:00Z"),
  },
  {
    id: "msg-2",
    partnershipId: "ptr-pernia-priya-lehenga",
    senderType: "creator",
    senderId: "cr-priya-patel",
    messageText:
      "Love the line. Accepting at the proposed terms. I'll have the collection live by the 30th.",
    createdAt: iso("2026-03-12T14:20:00Z"),
  },
  {
    id: "msg-3",
    partnershipId: "ptr-pernia-priya-lehenga",
    senderType: "creator",
    senderId: "cr-priya-patel",
    messageText: "Just published — go take a look. Three pieces, full styling notes.",
    createdAt: iso("2026-03-29T10:10:00Z"),
  },
  {
    id: "msg-4",
    partnershipId: "ptr-pernia-priya-lehenga",
    senderType: "vendor",
    senderId: "v-sabya-atelier",
    messageText: "Approved. Beautiful work. Releasing payment.",
    createdAt: iso("2026-03-30T09:15:00Z"),
  },
  {
    id: "msg-5",
    partnershipId: "ptr-paper-anika-guide",
    senderType: "vendor",
    senderId: "v-letterpress-lane",
    messageText:
      "Sending three sample suites by courier today. Lookbook attached in the brief.",
    createdAt: iso("2026-04-12T09:00:00Z"),
  },
  {
    id: "msg-6",
    partnershipId: "ptr-paper-anika-guide",
    senderType: "creator",
    senderId: "cr-anika-desai",
    messageText:
      "Got the samples. Drafting the guide this week — will share a preview before publishing.",
    createdAt: iso("2026-04-15T11:30:00Z"),
  },
  {
    id: "msg-7",
    partnershipId: "ptr-marigold-meera-negotiating",
    senderType: "vendor",
    senderId: "v-marigold-studio",
    messageText:
      "Brief sent. Happy to negotiate scope or budget — we want this to work for you.",
    createdAt: iso("2026-04-18T09:35:00Z"),
  },
  {
    id: "msg-8",
    partnershipId: "ptr-marigold-meera-negotiating",
    senderType: "creator",
    senderId: "cr-meera-shah",
    messageText:
      "See the counter. If $350 lands well I can start as soon as next week.",
    createdAt: iso("2026-04-19T16:00:00Z"),
  },
];

export const SEED_PARTNERSHIP_PAYOUTS: PartnershipPayout[] = [
  {
    id: "po-priya-1",
    partnershipId: "ptr-pernia-priya-lehenga",
    creatorId: "cr-priya-patel",
    grossAmount: 50000,
    platformFee: calculatePlatformFee(50000),
    netAmount: calculateNetPayout(50000),
    status: "paid",
    paidAt: iso("2026-04-02T11:00:00Z"),
  },
];

// ── Lookups ───────────────────────────────────────────────────────────────

export function getProposal(id: string): PartnershipProposal | undefined {
  return SEED_PARTNERSHIPS.find((p) => p.id === id);
}

export function getProposalsByVendor(vendorId: string): PartnershipProposal[] {
  return SEED_PARTNERSHIPS.filter((p) => p.vendorId === vendorId).sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getProposalsByCreator(creatorId: string): PartnershipProposal[] {
  return SEED_PARTNERSHIPS.filter((p) => p.creatorId === creatorId).sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getMessagesForProposal(
  partnershipId: string,
): PartnershipMessage[] {
  return SEED_PARTNERSHIP_MESSAGES.filter(
    (m) => m.partnershipId === partnershipId,
  ).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function getPayoutForProposal(
  partnershipId: string,
): PartnershipPayout | undefined {
  return SEED_PARTNERSHIP_PAYOUTS.find(
    (p) => p.partnershipId === partnershipId,
  );
}
