// ── Vendor ↔ Creator Partnership data model ──────────────────────────────
// Facilitated B2B partnerships: vendors propose paid deliverables to
// creators (collection feature, dedicated guide, exhibition feature, social
// mention). Platform escrows payment and takes a 15% facilitation fee.

export const PLATFORM_FEE_RATE = 0.15;

export type DeliverableType =
  | "collection_feature"
  | "dedicated_guide"
  | "exhibition_feature"
  | "social_mention";

export type PartnershipStatus =
  | "pending" // sent, awaiting creator response
  | "negotiating" // creator countered, vendor reviewing
  | "accepted" // both sides agreed; work not yet started
  | "in_progress" // creator working on deliverable
  | "delivered" // creator marked done; vendor reviewing
  | "approved" // vendor approved, payout queued
  | "completed" // payout released
  | "cancelled" // vendor cancelled before acceptance
  | "declined"; // creator declined

export type PayoutStatus = "pending" | "processing" | "paid";

export interface PartnershipProposal {
  id: string;
  vendorId: string;
  creatorId: string;
  title: string;
  description: string;
  deliverableType: DeliverableType;
  productIds: string[];
  proposedBudget: number;
  platformFee: number;
  timelineDays: number;
  status: PartnershipStatus;
  creatorCounterBudget: number | null;
  creatorCounterNotes: string | null;
  declineReason: string | null;
  acceptedAt: string | null;
  deliveredAt: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MessageSenderType = "vendor" | "creator";

export interface PartnershipMessage {
  id: string;
  partnershipId: string;
  senderType: MessageSenderType;
  senderId: string;
  messageText: string;
  createdAt: string;
}

export interface PartnershipPayout {
  id: string;
  partnershipId: string;
  creatorId: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: PayoutStatus;
  paidAt: string | null;
}

export const DELIVERABLE_LABEL: Record<DeliverableType, string> = {
  collection_feature: "Collection feature",
  dedicated_guide: "Dedicated guide",
  exhibition_feature: "Exhibition feature",
  social_mention: "Social mention",
};

export const DELIVERABLE_DESCRIPTION: Record<DeliverableType, string> = {
  collection_feature:
    "Creator adds your products to a new or existing collection.",
  dedicated_guide:
    "Creator writes a long-form guide reviewing or styling your products.",
  exhibition_feature:
    "Your products are featured in a time-bound exhibition collection.",
  social_mention:
    "Creator mentions your brand in their next collection drop or social post.",
};

export const STATUS_LABEL: Record<PartnershipStatus, string> = {
  pending: "Pending",
  negotiating: "Negotiating",
  accepted: "Accepted",
  in_progress: "In progress",
  delivered: "Delivered",
  approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
};

export function isOpenStatus(status: PartnershipStatus): boolean {
  return (
    status !== "completed" &&
    status !== "cancelled" &&
    status !== "declined"
  );
}

export function calculatePlatformFee(budget: number): number {
  return Math.round(budget * PLATFORM_FEE_RATE);
}

export function calculateNetPayout(budget: number): number {
  return budget - calculatePlatformFee(budget);
}
