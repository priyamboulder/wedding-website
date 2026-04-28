// ── Music & Entertainment store ───────────────────────────────────────────
// State for the Music workspace — candidates, leans, reactions, comments,
// contracts, presence. Persisted to localStorage via zustand/persist like
// every other Ananya store. No backend.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, dbDelete, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  MusicCandidate,
  MusicCandidateLean,
  MusicCandidateStatus,
  MusicComment,
  MusicContract,
  MusicContractStatus,
  MusicEventId,
  MusicPartyId,
  MusicPaymentMilestone,
  MusicPendingAction,
  MusicPresenceSignal,
  MusicReaction,
  MusicReactionKind,
  MusicVendorType,
} from "@/types/music";
import {
  MUSIC_VENDOR_NAMES,
  SEED_MUSIC_CANDIDATES,
  SEED_MUSIC_COMMENTS,
  SEED_MUSIC_CONTRACTS,
  SEED_MUSIC_LEANS,
  SEED_MUSIC_PRESENCE,
  SEED_MUSIC_REACTIONS,
} from "@/lib/music-seed";

// ── Ids ──────────────────────────────────────────────────────────────────

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

// ── State ────────────────────────────────────────────────────────────────

interface MusicState {
  vendor_names: Record<string, string>;   // id → display name (non-internal parties)
  candidates: MusicCandidate[];
  leans: MusicCandidateLean[];
  reactions: MusicReaction[];
  comments: MusicComment[];
  contracts: MusicContract[];
  presence: MusicPresenceSignal[];

  // ── Current party ("who am I right now") ───────────────────────────────
  current_party_id: MusicPartyId;
  setCurrentParty: (id: MusicPartyId) => void;

  // ── Candidates ─────────────────────────────────────────────────────────
  addCandidate: (
    input: Omit<MusicCandidate, "id" | "created_at" | "updated_at">,
  ) => MusicCandidate;
  updateCandidate: (id: string, patch: Partial<MusicCandidate>) => void;
  deleteCandidate: (id: string) => void;
  setCandidateStatus: (id: string, status: MusicCandidateStatus) => void;
  setPassedReason: (id: string, reason: string) => void;
  setPendingAction: (
    id: string,
    action: MusicPendingAction | undefined,
  ) => void;

  // ── Leans ──────────────────────────────────────────────────────────────
  setLean: (
    candidate_id: string,
    party_id: MusicPartyId,
    lean: MusicReactionKind,
    note?: string,
  ) => MusicCandidateLean;

  // ── Reactions (on comments or sample links) ────────────────────────────
  toggleReaction: (
    entity_kind: string,
    entity_id: string,
    party_id: MusicPartyId,
    kind: MusicReactionKind,
  ) => void;

  // ── Comments ───────────────────────────────────────────────────────────
  addComment: (
    entity_kind: string,
    entity_id: string,
    party_id: MusicPartyId,
    body: string,
    opts?: { parent_id?: string; reference_url?: string },
  ) => MusicComment;
  resolveComment: (id: string) => void;

  // ── Contracts ──────────────────────────────────────────────────────────
  addContract: (
    input: Omit<MusicContract, "id" | "created_at" | "updated_at">,
  ) => MusicContract;
  updateContract: (id: string, patch: Partial<MusicContract>) => void;
  setContractStatus: (id: string, status: MusicContractStatus) => void;
  markMilestonePaid: (contract_id: string, milestone_id: string) => void;
  addMilestone: (
    contract_id: string,
    milestone: Omit<MusicPaymentMilestone, "id">,
  ) => void;

  // ── Presence ───────────────────────────────────────────────────────────
  recordPresence: (signal: MusicPresenceSignal) => void;

  // ── Selectors ──────────────────────────────────────────────────────────
  candidatesByStatus: (status: MusicCandidateStatus) => MusicCandidate[];
  candidatesByType: (type: MusicVendorType) => MusicCandidate[];
  leansFor: (candidate_id: string) => MusicCandidateLean[];
  commentsFor: (entity_id: string) => MusicComment[];
  contractFor: (candidate_id: string) => MusicContract | undefined;
  // Which candidates have parties leaning in at-least-one love/yes AND
  // at-least-one no/unsure → "in debate" for the auto-populated section.
  inDebateCandidates: () => MusicCandidate[];
}

// ── Create ───────────────────────────────────────────────────────────────

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      vendor_names: MUSIC_VENDOR_NAMES,
      candidates: SEED_MUSIC_CANDIDATES,
      leans: SEED_MUSIC_LEANS,
      reactions: SEED_MUSIC_REACTIONS,
      comments: SEED_MUSIC_COMMENTS,
      contracts: SEED_MUSIC_CONTRACTS,
      presence: SEED_MUSIC_PRESENCE,

      current_party_id: "urvashi",
      setCurrentParty: (id) => set({ current_party_id: id }),

      // ── Candidates ───────────────────────────────────────────────────────
      addCandidate: (input) => {
        const now = new Date().toISOString();
        const record: MusicCandidate = {
          ...input,
          id: rid("cand"),
          created_at: now,
          updated_at: now,
        };
        set((s) => ({ candidates: [...s.candidates, record] }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("music_candidates", { id: record.id, couple_id: coupleId, name: record.name, type: record.vendor_type ?? null, status: record.status, contact: null });
        return record;
      },
      updateCandidate: (id, patch) => {
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id
              ? { ...c, ...patch, updated_at: new Date().toISOString() }
              : c,
          ),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("music_candidates", { id, couple_id: coupleId, ...patch, updated_at: new Date().toISOString() });
      },
      deleteCandidate: (id) => {
        set((s) => ({
          candidates: s.candidates.filter((c) => c.id !== id),
          leans: s.leans.filter((l) => l.candidate_id !== id),
          comments: s.comments.filter((c) => c.entity_id !== id),
          contracts: s.contracts.filter((c) => c.candidate_id !== id),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbDelete("music_candidates", { id, couple_id: coupleId });
      },
      setCandidateStatus: (id, status) =>
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id
              ? { ...c, status, updated_at: new Date().toISOString() }
              : c,
          ),
        })),
      setPassedReason: (id, reason) =>
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id
              ? {
                  ...c,
                  passed_reason: reason,
                  updated_at: new Date().toISOString(),
                }
              : c,
          ),
        })),
      setPendingAction: (id, action) =>
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id
              ? {
                  ...c,
                  pending_action: action,
                  updated_at: new Date().toISOString(),
                }
              : c,
          ),
        })),

      // ── Leans ────────────────────────────────────────────────────────────
      setLean: (candidate_id, party_id, lean, note) => {
        const existing = get().leans.find(
          (l) => l.candidate_id === candidate_id && l.party_id === party_id,
        );
        const updated_at = new Date().toISOString();
        if (existing) {
          const record: MusicCandidateLean = {
            ...existing,
            lean,
            note,
            updated_at,
          };
          set((s) => ({
            leans: s.leans.map((l) => (l.id === existing.id ? record : l)),
          }));
          return record;
        }
        const record: MusicCandidateLean = {
          id: rid("ml"),
          wedding_id: get().candidates[0]?.wedding_id ?? "",
          candidate_id,
          party_id,
          lean,
          note,
          updated_at,
        };
        set((s) => ({ leans: [...s.leans, record] }));
        return record;
      },

      // ── Reactions ────────────────────────────────────────────────────────
      toggleReaction: (entity_kind, entity_id, party_id, kind) =>
        set((s) => {
          const existing = s.reactions.find(
            (r) =>
              r.entity_kind === entity_kind &&
              r.entity_id === entity_id &&
              r.party_id === party_id,
          );
          if (existing && existing.kind === kind) {
            return { reactions: s.reactions.filter((r) => r.id !== existing.id) };
          }
          if (existing) {
            return {
              reactions: s.reactions.map((r) =>
                r.id === existing.id
                  ? { ...r, kind, updated_at: new Date().toISOString() }
                  : r,
              ),
            };
          }
          const record: MusicReaction = {
            id: rid("rx"),
            entity_id,
            entity_kind,
            party_id,
            kind,
            updated_at: new Date().toISOString(),
          };
          return { reactions: [...s.reactions, record] };
        }),

      // ── Comments ─────────────────────────────────────────────────────────
      addComment: (entity_kind, entity_id, party_id, body, opts) => {
        const record: MusicComment = {
          id: rid("cm"),
          entity_kind,
          entity_id,
          party_id,
          body,
          parent_id: opts?.parent_id,
          reference_url: opts?.reference_url,
          created_at: new Date().toISOString(),
        };
        set((s) => ({ comments: [...s.comments, record] }));
        return record;
      },
      resolveComment: (id) =>
        set((s) => ({
          comments: s.comments.map((c) =>
            c.id === id
              ? { ...c, resolved_at: new Date().toISOString() }
              : c,
          ),
        })),

      // ── Contracts ────────────────────────────────────────────────────────
      addContract: (input) => {
        const now = new Date().toISOString();
        const record: MusicContract = {
          ...input,
          id: rid("mctr"),
          created_at: now,
          updated_at: now,
        };
        set((s) => ({ contracts: [...s.contracts, record] }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("music_contracts", { id: record.id, couple_id: coupleId, candidate_id: record.candidate_id, status: record.status, amount: record.total_amount ?? 0, milestones: record.milestones ?? [] });
        return record;
      },
      updateContract: (id, patch) => {
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.id === id
              ? { ...c, ...patch, updated_at: new Date().toISOString() }
              : c,
          ),
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("music_contracts", { id, couple_id: coupleId, ...patch, updated_at: new Date().toISOString() });
      },
      setContractStatus: (id, status) =>
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.id === id
              ? { ...c, status, updated_at: new Date().toISOString() }
              : c,
          ),
        })),
      markMilestonePaid: (contract_id, milestone_id) =>
        set((s) => ({
          contracts: s.contracts.map((c) => {
            if (c.id !== contract_id) return c;
            const paid_at = new Date().toISOString();
            const milestones = c.milestones.map((m) =>
              m.id === milestone_id ? { ...m, paid_at } : m,
            );
            // If this was the deposit milestone, bump deposit_paid.
            const paidMilestone = c.milestones.find((m) => m.id === milestone_id);
            const isDeposit = paidMilestone?.label
              .toLowerCase()
              .includes("deposit");
            return {
              ...c,
              milestones,
              deposit_paid: isDeposit
                ? (c.deposit_paid ?? 0) + (paidMilestone?.amount ?? 0)
                : c.deposit_paid,
              updated_at: paid_at,
            };
          }),
        })),
      addMilestone: (contract_id, milestone) =>
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.id === contract_id
              ? {
                  ...c,
                  milestones: [...c.milestones, { ...milestone, id: rid("ms") }],
                  updated_at: new Date().toISOString(),
                }
              : c,
          ),
        })),

      // ── Presence ─────────────────────────────────────────────────────────
      recordPresence: (signal) =>
        set((s) => {
          const rest = s.presence.filter((p) => p.party_id !== signal.party_id);
          return { presence: [...rest, signal] };
        }),

      // ── Selectors ────────────────────────────────────────────────────────
      candidatesByStatus: (status) =>
        get().candidates.filter((c) => c.status === status),
      candidatesByType: (type) =>
        get().candidates.filter((c) => c.vendor_type === type),
      leansFor: (candidate_id) =>
        get().leans.filter((l) => l.candidate_id === candidate_id),
      commentsFor: (entity_id) =>
        get().comments.filter((c) => c.entity_id === entity_id),
      contractFor: (candidate_id) =>
        get().contracts.find((c) => c.candidate_id === candidate_id),
      // "In debate" = candidates with at-least-one positive lean
      // (love | yes) AND at-least-one negative / unsure (no | unsure)
      // across the three internal parties. Excludes booked / signed /
      // passed / parked since those are resolved states.
      inDebateCandidates: () => {
        const { candidates, leans } = get();
        const active = new Set<MusicCandidateStatus>([
          "draft",
          "waiting_vendor",
          "proposal_received",
          "in_debate",
        ]);
        return candidates.filter((c) => {
          if (!active.has(c.status)) return false;
          const rows = leans.filter((l) => l.candidate_id === c.id);
          const hasPositive = rows.some(
            (l) => l.lean === "love" || l.lean === "yes",
          );
          const hasNegative = rows.some(
            (l) => l.lean === "no" || l.lean === "unsure",
          );
          return hasPositive && hasNegative;
        });
      },
    }),
    {
      name: "ananya-music-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

// ── Derived helper: map candidate status → WIP pill state ────────────────
// MusicEntityState is the vocabulary the shared StatePill + WIP strip
// primitives understand. This function keeps that coupling in one place.
export function candidateEntityState(status: MusicCandidateStatus) {
  switch (status) {
    case "draft":
      return "draft";
    case "waiting_vendor":
    case "contract_sent":
      return "waiting";
    case "in_debate":
      return "in_debate";
    case "proposal_received":
      return "draft";
    case "booked":
    case "signed":
      return "resolved";
    case "passed":
      return "blocked";
    case "parked":
      return "parked";
  }
}

export function candidateStatusLabel(status: MusicCandidateStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "waiting_vendor":
      return "Waiting on vendor";
    case "proposal_received":
      return "Proposal received";
    case "in_debate":
      return "In debate";
    case "booked":
      return "Booked";
    case "contract_sent":
      return "Contract sent";
    case "signed":
      return "Signed";
    case "passed":
      return "Passed on";
    case "parked":
      return "Parked";
  }
}

export function contractStatusLabel(status: MusicContractStatus): string {
  switch (status) {
    case "draft":
      return "Drafting";
    case "sent":
      return "Sent to vendor";
    case "signed_by_vendor":
      return "Awaiting countersign";
    case "countersigned":
      return "Fully executed";
  }
}
