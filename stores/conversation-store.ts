"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Conversation,
  ConversationMessage,
  Participant,
  ParticipantRole,
} from "@/types/conversation";
import type { MessageAttachment } from "@/types/inquiry";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

export type CreateConversationInput = {
  title: string;
  created_by: string;
  participants: Participant[];
  initial_message?: {
    sender_id: string;
    sender_name: string;
    sender_role: ParticipantRole;
    body: string;
  };
};

export type PostToConversationInput = {
  sender_id: string;
  sender_name: string;
  sender_role: ParticipantRole;
  body: string;
  attachments?: MessageAttachment[];
};

type ConversationState = {
  conversations: Conversation[];
  createConversation: (input: CreateConversationInput) => string;
  postMessage: (id: string, input: PostToConversationInput) => void;
  addParticipant: (id: string, p: Participant) => void;
  removeParticipant: (id: string, participantId: string) => void;
  getConversationsForParticipant: (participantId: string) => Conversation[];
  getConversationById: (id: string) => Conversation | undefined;
};

const genId = () =>
  `conv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const genMsgId = () =>
  `cmsg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// Two demo groups for the Priya & Arjun wedding so the couple UI has something
// to render on first load. IDs use the `couple-priya-arjun` and vendor seeds
// from UNIFIED_VENDORS.
const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-mandap-team",
    title: "Mandap team · Priya & Arjun",
    created_by: "couple-priya-arjun",
    participants: [
      { id: "couple-priya-arjun", role: "couple", name: "Priya & Arjun" },
      {
        id: "vendor-aurora-studios",
        role: "vendor",
        name: "Aurora Studios",
        vendor_category: "photography",
      },
      {
        id: "vendor-meera-decor",
        role: "vendor",
        name: "Meera Decor",
        vendor_category: "decor_florals",
      },
      {
        id: "planner-radz-events",
        role: "planner",
        name: "Radhika Desai",
      },
    ],
    messages: [
      {
        id: "cm-mandap-1",
        sender_id: "couple-priya-arjun",
        sender_name: "Priya",
        sender_role: "couple",
        body: "Hi all — putting everyone in one thread so we can line up the mandap install. Arjun and I would love ivory/gold tones with Marigold garlands framing the pillars.",
        attachments: [],
        created_at: "2026-04-15T09:20:00.000Z",
      },
      {
        id: "cm-mandap-2",
        sender_id: "vendor-meera-decor",
        sender_name: "Meera Decor",
        sender_role: "vendor",
        body: "Love the palette. We'll draft two mandap options and share renders by Friday. Aurora — can you confirm if you want the mandap lit for editorial shots before the ceremony?",
        attachments: [],
        created_at: "2026-04-15T11:05:00.000Z",
      },
      {
        id: "cm-mandap-3",
        sender_id: "vendor-aurora-studios",
        sender_name: "Priya Malhotra",
        sender_role: "vendor",
        body: "Yes — 45 min before pheras. Warm tungsten up-lights at the pillars would be perfect.",
        attachments: [],
        created_at: "2026-04-15T13:40:00.000Z",
      },
      {
        id: "cm-mandap-4",
        sender_id: "planner-radz-events",
        sender_name: "Radhika — Radz Events",
        sender_role: "planner",
        body: "Adding to the timeline: decor lock by Apr 28, install on May 17 from 9am. Priya, confirm family puja timing so we don't overlap.",
        attachments: [],
        created_at: "2026-04-15T18:12:00.000Z",
      },
    ],
    created_at: "2026-04-15T09:20:00.000Z",
    updated_at: "2026-04-15T18:12:00.000Z",
  },
  {
    id: "conv-day-of-coord",
    title: "Day-of coordination",
    created_by: "planner-radz-events",
    participants: [
      { id: "couple-priya-arjun", role: "couple", name: "Priya & Arjun" },
      { id: "planner-radz-events", role: "planner", name: "Radhika Desai" },
      {
        id: "vendor-aurora-studios",
        role: "vendor",
        name: "Aurora Studios",
        vendor_category: "photography",
      },
    ],
    messages: [
      {
        id: "cm-doc-1",
        sender_id: "planner-radz-events",
        sender_name: "Radhika — Radz Events",
        sender_role: "planner",
        body: "Day-of run sheet is attached. Priya, please review the 05:30–07:00 block for getting-ready coverage and let me know if anything moves.",
        attachments: [
          { id: "doc-a-1", name: "RunSheet-PriyaArjun-v2.pdf", kind: "pdf", size: "240 KB" },
        ],
        created_at: "2026-04-18T10:00:00.000Z",
      },
      {
        id: "cm-doc-2",
        sender_id: "couple-priya-arjun",
        sender_name: "Priya",
        sender_role: "couple",
        body: "Looks good — only change: my nani arrives at 06:15, can we photograph her entry specifically? She gets shy on camera otherwise.",
        attachments: [],
        created_at: "2026-04-18T14:35:00.000Z",
      },
    ],
    created_at: "2026-04-18T10:00:00.000Z",
    updated_at: "2026-04-18T14:35:00.000Z",
  },
];

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: SEED_CONVERSATIONS,

      createConversation: (input) => {
        const id = genId();
        const now = new Date().toISOString();
        const messages: ConversationMessage[] = input.initial_message
          ? [
              {
                id: genMsgId(),
                sender_id: input.initial_message.sender_id,
                sender_name: input.initial_message.sender_name,
                sender_role: input.initial_message.sender_role,
                body: input.initial_message.body,
                attachments: [],
                created_at: now,
              },
            ]
          : [];
        const conversation: Conversation = {
          id,
          title: input.title,
          participants: input.participants,
          messages,
          created_by: input.created_by,
          created_at: now,
          updated_at: now,
        };
        set((s) => ({ conversations: [conversation, ...s.conversations] }));
        return id;
      },

      postMessage: (id, input) => {
        const now = new Date().toISOString();
        const message: ConversationMessage = {
          id: genMsgId(),
          sender_id: input.sender_id,
          sender_name: input.sender_name,
          sender_role: input.sender_role,
          body: input.body,
          attachments: input.attachments ?? [],
          created_at: now,
        };
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? { ...c, messages: [...c.messages, message], updated_at: now }
              : c,
          ),
        }));
      },

      addParticipant: (id, p) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id && !c.participants.some((x) => x.id === p.id)
              ? { ...c, participants: [...c.participants, p] }
              : c,
          ),
        }));
      },

      removeParticipant: (id, participantId) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? {
                  ...c,
                  participants: c.participants.filter(
                    (p) => p.id !== participantId,
                  ),
                }
              : c,
          ),
        }));
      },

      getConversationsForParticipant: (participantId) =>
        get().conversations.filter((c) =>
          c.participants.some((p) => p.id === participantId),
        ),

      getConversationById: (id) => get().conversations.find((c) => c.id === id),
    }),
    {
      name: "ananya-conversations",
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

let _conversationSyncTimer: ReturnType<typeof setTimeout> | null = null;
useConversationStore.subscribe((state) => {
  if (_conversationSyncTimer) clearTimeout(_conversationSyncTimer);
  _conversationSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("conversation_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
