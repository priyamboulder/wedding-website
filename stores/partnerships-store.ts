"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  PartnershipProposal,
  PartnershipMessage,
  PartnershipPayout,
  PartnershipStatus,
  DeliverableType,
  MessageSenderType,
} from "@/types/partnership";
import { calculatePlatformFee, calculateNetPayout } from "@/types/partnership";
import {
  SEED_PARTNERSHIPS,
  SEED_PARTNERSHIP_MESSAGES,
  SEED_PARTNERSHIP_PAYOUTS,
} from "@/lib/partnerships/seed";

interface CreateProposalInput {
  vendorId: string;
  creatorId: string;
  title: string;
  description: string;
  deliverableType: DeliverableType;
  productIds: string[];
  proposedBudget: number;
  timelineDays: number;
}

interface RespondInput {
  action: "accept" | "counter" | "decline";
  counterBudget?: number;
  counterNotes?: string;
  declineReason?: string;
}

interface PartnershipsState {
  proposals: PartnershipProposal[];
  messages: PartnershipMessage[];
  payouts: PartnershipPayout[];

  // Reads
  listProposals: (
    role: "vendor" | "creator",
    actorId: string,
  ) => PartnershipProposal[];
  getProposal: (id: string) => PartnershipProposal | undefined;
  getMessages: (partnershipId: string) => PartnershipMessage[];
  getPayout: (partnershipId: string) => PartnershipPayout | undefined;

  // Stats
  statsForCreator: (creatorId: string) => {
    completed: number;
    active: number;
    pending: number;
    totalEarned: number;
  };

  // Mutations
  createProposal: (input: CreateProposalInput) => PartnershipProposal;
  respondToProposal: (id: string, input: RespondInput) => void;
  acceptCounter: (id: string) => void;
  markDelivered: (id: string) => void;
  approveDelivery: (id: string) => void;
  cancelProposal: (id: string) => void;
  sendMessage: (
    partnershipId: string,
    senderType: MessageSenderType,
    senderId: string,
    text: string,
  ) => PartnershipMessage;
}

type PersistedSlice = Pick<
  PartnershipsState,
  "proposals" | "messages" | "payouts"
>;

const nowIso = () => new Date().toISOString();

function patchProposal(
  state: PartnershipsState,
  id: string,
  patch: Partial<PartnershipProposal>,
): PartnershipProposal[] {
  return state.proposals.map((p) =>
    p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p,
  );
}

export const usePartnershipsStore = create<PartnershipsState>()(
  persist(
    (set, get) => ({
      proposals: SEED_PARTNERSHIPS,
      messages: SEED_PARTNERSHIP_MESSAGES,
      payouts: SEED_PARTNERSHIP_PAYOUTS,

      listProposals: (role, actorId) => {
        const all = get().proposals;
        const filtered =
          role === "vendor"
            ? all.filter((p) => p.vendorId === actorId)
            : all.filter((p) => p.creatorId === actorId);
        return [...filtered].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime(),
        );
      },

      getProposal: (id) => get().proposals.find((p) => p.id === id),

      getMessages: (partnershipId) =>
        get()
          .messages.filter((m) => m.partnershipId === partnershipId)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          ),

      getPayout: (partnershipId) =>
        get().payouts.find((p) => p.partnershipId === partnershipId),

      statsForCreator: (creatorId) => {
        const mine = get().proposals.filter((p) => p.creatorId === creatorId);
        const completed = mine.filter((p) => p.status === "completed").length;
        const active = mine.filter(
          (p) =>
            p.status === "accepted" ||
            p.status === "in_progress" ||
            p.status === "delivered" ||
            p.status === "approved",
        ).length;
        const pending = mine.filter(
          (p) => p.status === "pending" || p.status === "negotiating",
        ).length;
        const totalEarned = get()
          .payouts.filter((po) => po.creatorId === creatorId && po.status === "paid")
          .reduce((sum, po) => sum + po.netAmount, 0);
        return { completed, active, pending, totalEarned };
      },

      createProposal: (input) => {
        const platformFee = calculatePlatformFee(input.proposedBudget);
        const proposal: PartnershipProposal = {
          id: `ptr-${uuid().slice(0, 8)}`,
          vendorId: input.vendorId,
          creatorId: input.creatorId,
          title: input.title,
          description: input.description,
          deliverableType: input.deliverableType,
          productIds: input.productIds,
          proposedBudget: input.proposedBudget,
          platformFee,
          timelineDays: input.timelineDays,
          status: "pending",
          creatorCounterBudget: null,
          creatorCounterNotes: null,
          declineReason: null,
          acceptedAt: null,
          deliveredAt: null,
          approvedAt: null,
          completedAt: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((state) => ({ proposals: [proposal, ...state.proposals] }));
        return proposal;
      },

      respondToProposal: (id, input) => {
        set((state) => {
          const proposal = state.proposals.find((p) => p.id === id);
          if (!proposal) return state;
          let nextStatus: PartnershipStatus = proposal.status;
          const patch: Partial<PartnershipProposal> = {};
          if (input.action === "accept") {
            nextStatus = "accepted";
            patch.acceptedAt = nowIso();
          } else if (input.action === "counter") {
            nextStatus = "negotiating";
            patch.creatorCounterBudget = input.counterBudget ?? null;
            patch.creatorCounterNotes = input.counterNotes ?? null;
          } else {
            nextStatus = "declined";
            patch.declineReason = input.declineReason ?? null;
          }
          patch.status = nextStatus;
          return { proposals: patchProposal(state, id, patch) };
        });
      },

      acceptCounter: (id) => {
        set((state) => {
          const proposal = state.proposals.find((p) => p.id === id);
          if (!proposal || proposal.creatorCounterBudget == null) return state;
          const budget = proposal.creatorCounterBudget;
          return {
            proposals: patchProposal(state, id, {
              proposedBudget: budget,
              platformFee: calculatePlatformFee(budget),
              status: "accepted",
              acceptedAt: nowIso(),
            }),
          };
        });
      },

      markDelivered: (id) => {
        set((state) => ({
          proposals: patchProposal(state, id, {
            status: "delivered",
            deliveredAt: nowIso(),
          }),
        }));
      },

      approveDelivery: (id) => {
        const proposal = get().proposals.find((p) => p.id === id);
        if (!proposal) return;
        const grossAmount = proposal.proposedBudget;
        const platformFee = calculatePlatformFee(grossAmount);
        const netAmount = calculateNetPayout(grossAmount);
        const payout: PartnershipPayout = {
          id: `po-${uuid().slice(0, 8)}`,
          partnershipId: id,
          creatorId: proposal.creatorId,
          grossAmount,
          platformFee,
          netAmount,
          status: "paid",
          paidAt: nowIso(),
        };
        set((state) => ({
          proposals: patchProposal(state, id, {
            status: "completed",
            approvedAt: nowIso(),
            completedAt: nowIso(),
          }),
          payouts: [payout, ...state.payouts.filter((p) => p.partnershipId !== id)],
        }));
      },

      cancelProposal: (id) => {
        set((state) => ({
          proposals: patchProposal(state, id, { status: "cancelled" }),
        }));
      },

      sendMessage: (partnershipId, senderType, senderId, text) => {
        const message: PartnershipMessage = {
          id: `msg-${uuid().slice(0, 8)}`,
          partnershipId,
          senderType,
          senderId,
          messageText: text,
          createdAt: nowIso(),
        };
        // Negotiating proposals advance to "in_progress" automatically once
        // the creator starts work — but message exchange alone shouldn't move
        // the status. Just append.
        set((state) => ({ messages: [...state.messages, message] }));
        return message;
      },
    }),
    {
      name: "ananya-partnerships",
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
      version: 1,
      partialize: (state): PersistedSlice => ({
        proposals: state.proposals,
        messages: state.messages,
        payouts: state.payouts,
      }),
    },
  ),
);

let _partnershipsSyncTimer: ReturnType<typeof setTimeout> | null = null;
usePartnershipsStore.subscribe((state) => {
  if (_partnershipsSyncTimer) clearTimeout(_partnershipsSyncTimer);
  _partnershipsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("partnerships_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
