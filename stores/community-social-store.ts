// ── Community social store ──────────────────────────────────────────────────
// Connection requests, accepted connections, DMs, and reports.
//
// Connections are ordered-pair scoped: (requester, recipient). DMs are scoped
// to an accepted connection. Messages stay in the store; "realtime" is just
// Zustand's subscription model, which updates every React subscriber on set().

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  CommunityConnection,
  CommunityMessage,
  CommunityReport,
  ConnectionStatus,
} from "@/types/community";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

interface CommunitySocialState {
  connections: CommunityConnection[];
  messages: CommunityMessage[];
  reports: CommunityReport[];

  // ── Connection queries
  getConnectionBetween: (
    profileA: string,
    profileB: string,
  ) => CommunityConnection | undefined;
  getIncomingPending: (profileId: string) => CommunityConnection[];
  getOutgoingPending: (profileId: string) => CommunityConnection[];
  getAccepted: (profileId: string) => CommunityConnection[];

  // ── Connection mutations
  requestConnection: (
    requesterId: string,
    recipientId: string,
    message?: string,
  ) => CommunityConnection;
  respondConnection: (
    connectionId: string,
    response: Extract<ConnectionStatus, "accepted" | "declined">,
  ) => void;
  cancelConnection: (connectionId: string) => void;

  // ── Message queries
  getThread: (connectionId: string) => CommunityMessage[];
  getUnreadCountFor: (profileId: string) => number;

  // ── Message mutations
  sendMessage: (
    connectionId: string,
    senderId: string,
    body: string,
  ) => CommunityMessage;
  markThreadRead: (connectionId: string, readerId: string) => void;

  // ── Reports
  reportProfile: (
    reporterId: string,
    reportedProfileId: string,
    reason: string,
  ) => void;
  reportMessage: (
    reporterId: string,
    reportedMessageId: string,
    reason: string,
  ) => void;
}

export const useCommunitySocialStore = create<CommunitySocialState>()(
  persist(
    (set, get) => ({
      connections: [],
      messages: [],
      reports: [],

      getConnectionBetween: (a, b) =>
        get().connections.find(
          (c) =>
            (c.requester_id === a && c.recipient_id === b) ||
            (c.requester_id === b && c.recipient_id === a),
        ),

      getIncomingPending: (profileId) =>
        get().connections.filter(
          (c) => c.recipient_id === profileId && c.status === "pending",
        ),

      getOutgoingPending: (profileId) =>
        get().connections.filter(
          (c) => c.requester_id === profileId && c.status === "pending",
        ),

      getAccepted: (profileId) =>
        get().connections.filter(
          (c) =>
            c.status === "accepted" &&
            (c.requester_id === profileId || c.recipient_id === profileId),
        ),

      requestConnection: (requesterId, recipientId, message) => {
        const existing = get().getConnectionBetween(requesterId, recipientId);
        if (existing) return existing;
        const now = new Date().toISOString();
        const connection: CommunityConnection = {
          id: uuid(),
          requester_id: requesterId,
          recipient_id: recipientId,
          status: "pending",
          message,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ connections: [...state.connections, connection] }));
        return connection;
      },

      respondConnection: (connectionId, response) => {
        const now = new Date().toISOString();
        set((state) => ({
          connections: state.connections.map((c) =>
            c.id === connectionId
              ? { ...c, status: response, updated_at: now }
              : c,
          ),
        }));
      },

      cancelConnection: (connectionId) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== connectionId),
          messages: state.messages.filter((m) => m.connection_id !== connectionId),
        })),

      getThread: (connectionId) =>
        get()
          .messages.filter((m) => m.connection_id === connectionId)
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),

      getUnreadCountFor: (profileId) => {
        const { connections, messages } = get();
        const accepted = connections.filter(
          (c) =>
            c.status === "accepted" &&
            (c.requester_id === profileId || c.recipient_id === profileId),
        );
        const acceptedIds = new Set(accepted.map((c) => c.id));
        return messages.filter(
          (m) =>
            acceptedIds.has(m.connection_id) &&
            m.sender_id !== profileId &&
            !m.read_at,
        ).length;
      },

      sendMessage: (connectionId, senderId, body) => {
        const now = new Date().toISOString();
        const message: CommunityMessage = {
          id: uuid(),
          connection_id: connectionId,
          sender_id: senderId,
          body,
          created_at: now,
        };
        set((state) => ({ messages: [...state.messages, message] }));
        return message;
      },

      markThreadRead: (connectionId, readerId) => {
        const now = new Date().toISOString();
        set((state) => ({
          messages: state.messages.map((m) =>
            m.connection_id === connectionId &&
            m.sender_id !== readerId &&
            !m.read_at
              ? { ...m, read_at: now }
              : m,
          ),
        }));
      },

      reportProfile: (reporterId, reportedProfileId, reason) => {
        const report: CommunityReport = {
          id: uuid(),
          reporter_id: reporterId,
          reported_profile_id: reportedProfileId,
          reason,
          status: "pending",
          created_at: new Date().toISOString(),
        };
        set((state) => ({ reports: [...state.reports, report] }));
      },

      reportMessage: (reporterId, reportedMessageId, reason) => {
        const report: CommunityReport = {
          id: uuid(),
          reporter_id: reporterId,
          reported_message_id: reportedMessageId,
          reason,
          status: "pending",
          created_at: new Date().toISOString(),
        };
        set((state) => ({ reports: [...state.reports, report] }));
      },
    }),
    {
      name: "ananya-community-social",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _communitySocialSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCommunitySocialStore.subscribe((state) => {
  if (_communitySocialSyncTimer) clearTimeout(_communitySocialSyncTimer);
  _communitySocialSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("community_social_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
