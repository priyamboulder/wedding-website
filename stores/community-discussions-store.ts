// ── Community discussions store ─────────────────────────────────────────────
// Reddit/forum-style Q&A board. Flat replies (no nesting) + a "helpful"
// reaction per-reply. Mirrors the Supabase sketch 1:1 so a migration is a
// drop-in later: each reactive op updates the denormalized reply_count /
// last_reply_at / helpful_count fields in the same set() call (standing in
// for the DB trigger).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  Discussion,
  DiscussionCategorySlug,
  DiscussionReply,
  DiscussionReplyReaction,
} from "@/types/community";
import {
  SEED_DISCUSSIONS,
  SEED_DISCUSSION_REPLIES,
} from "@/lib/community/seed";
import { withinLast24h } from "@/lib/community/anonymous";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

type DiscussionDraft = {
  author_id: string;
  title: string;
  body?: string;
  category: DiscussionCategorySlug;
  city?: string;
  state?: string;
  is_anonymous?: boolean;
};

interface CommunityDiscussionsState {
  discussions: Discussion[];
  replies: DiscussionReply[];
  reactions: DiscussionReplyReaction[];
  _hydratedSeed: boolean;

  // Queries
  getDiscussion: (id: string) => Discussion | undefined;
  getRepliesFor: (discussionId: string) => DiscussionReply[];
  hasReacted: (replyId: string, reactorId: string) => boolean;
  countRecentAnonymousDiscussions: (authorId: string) => number;
  countRecentAnonymousReplies: (authorId: string) => number;

  // Discussion mutations
  createDiscussion: (draft: DiscussionDraft) => Discussion;
  updateDiscussion: (
    id: string,
    patch: Partial<Pick<Discussion, "title" | "body" | "category" | "city" | "state">>,
  ) => void;

  // Reply mutations
  addReply: (
    discussionId: string,
    authorId: string,
    body: string,
    isAnonymous?: boolean,
  ) => DiscussionReply;
  updateReply: (id: string, body: string) => void;
  deleteReply: (id: string) => void;

  // Reactions
  toggleHelpful: (replyId: string, reactorId: string) => void;

  ensureSeeded: () => void;
}

export const useCommunityDiscussionsStore = create<CommunityDiscussionsState>()(
  persist(
    (set, get) => ({
      discussions: [],
      replies: [],
      reactions: [],
      _hydratedSeed: false,

      // ── Queries ───────────────────────────────────────────────────────────
      getDiscussion: (id) => get().discussions.find((d) => d.id === id),

      getRepliesFor: (discussionId) =>
        get()
          .replies.filter((r) => r.discussion_id === discussionId)
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),

      hasReacted: (replyId, reactorId) =>
        get().reactions.some(
          (r) => r.reply_id === replyId && r.reactor_id === reactorId,
        ),

      countRecentAnonymousDiscussions: (authorId) =>
        get().discussions.filter(
          (d) =>
            d.author_id === authorId &&
            d.is_anonymous &&
            !d.is_seed &&
            withinLast24h(d.created_at),
        ).length,

      countRecentAnonymousReplies: (authorId) =>
        get().replies.filter(
          (r) =>
            r.author_id === authorId &&
            r.is_anonymous &&
            !r.is_seed &&
            withinLast24h(r.created_at),
        ).length,

      // ── Discussion mutations ──────────────────────────────────────────────
      createDiscussion: (draft) => {
        const now = new Date().toISOString();
        const discussion: Discussion = {
          id: uuid(),
          author_id: draft.author_id,
          title: draft.title.trim(),
          body: draft.body?.trim() || undefined,
          category: draft.category,
          city: draft.city?.trim() || undefined,
          state: draft.state?.trim() || undefined,
          reply_count: 0,
          last_reply_at: undefined,
          is_pinned: false,
          is_locked: false,
          is_anonymous: draft.is_anonymous === true,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ discussions: [discussion, ...state.discussions] }));
        return discussion;
      },

      updateDiscussion: (id, patch) => {
        const now = new Date().toISOString();
        set((state) => ({
          discussions: state.discussions.map((d) =>
            d.id === id ? { ...d, ...patch, updated_at: now } : d,
          ),
        }));
      },

      // ── Reply mutations ───────────────────────────────────────────────────
      addReply: (discussionId, authorId, body, isAnonymous = false) => {
        const now = new Date().toISOString();
        const reply: DiscussionReply = {
          id: uuid(),
          discussion_id: discussionId,
          author_id: authorId,
          body: body.trim(),
          helpful_count: 0,
          is_anonymous: isAnonymous,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({
          replies: [...state.replies, reply],
          discussions: state.discussions.map((d) =>
            d.id === discussionId
              ? {
                  ...d,
                  reply_count: d.reply_count + 1,
                  last_reply_at: now,
                  updated_at: now,
                }
              : d,
          ),
        }));
        return reply;
      },

      updateReply: (id, body) => {
        const now = new Date().toISOString();
        set((state) => ({
          replies: state.replies.map((r) =>
            r.id === id ? { ...r, body: body.trim(), updated_at: now } : r,
          ),
        }));
      },

      deleteReply: (id) => {
        const target = get().replies.find((r) => r.id === id);
        if (!target) return;
        set((state) => {
          const remaining = state.replies.filter((r) => r.id !== id);
          const forDiscussion = remaining
            .filter((r) => r.discussion_id === target.discussion_id)
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            );
          const newLast = forDiscussion[0]?.created_at;
          return {
            replies: remaining,
            reactions: state.reactions.filter((r) => r.reply_id !== id),
            discussions: state.discussions.map((d) =>
              d.id === target.discussion_id
                ? {
                    ...d,
                    reply_count: Math.max(0, d.reply_count - 1),
                    last_reply_at: newLast,
                  }
                : d,
            ),
          };
        });
      },

      // ── Reactions ─────────────────────────────────────────────────────────
      toggleHelpful: (replyId, reactorId) => {
        const existing = get().reactions.find(
          (r) => r.reply_id === replyId && r.reactor_id === reactorId,
        );
        if (existing) {
          set((state) => ({
            reactions: state.reactions.filter((r) => r.id !== existing.id),
            replies: state.replies.map((r) =>
              r.id === replyId
                ? { ...r, helpful_count: Math.max(0, r.helpful_count - 1) }
                : r,
            ),
          }));
          return;
        }
        const reaction: DiscussionReplyReaction = {
          id: uuid(),
          reply_id: replyId,
          reactor_id: reactorId,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          reactions: [...state.reactions, reaction],
          replies: state.replies.map((r) =>
            r.id === replyId
              ? { ...r, helpful_count: r.helpful_count + 1 }
              : r,
          ),
        }));
      },

      ensureSeeded: () => {
        if (get()._hydratedSeed) return;
        const existingIds = new Set(get().discussions.map((d) => d.id));
        const nextDiscussions: Discussion[] = SEED_DISCUSSIONS.filter(
          (d) => !existingIds.has(d.id),
        ).map((d) => ({ ...d, is_anonymous: false }));
        const existingReplyIds = new Set(get().replies.map((r) => r.id));
        const nextReplies: DiscussionReply[] = SEED_DISCUSSION_REPLIES.filter(
          (r) => !existingReplyIds.has(r.id),
        ).map((r) => ({ ...r, is_anonymous: false }));
        set((state) => ({
          discussions: [...state.discussions, ...nextDiscussions],
          replies: [...state.replies, ...nextReplies],
          _hydratedSeed: true,
        }));
      },
    }),
    {
      name: "ananya-community-discussions",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 2,
      // v1 → v2: add is_anonymous flag to discussions and replies. All
      // pre-existing rows default to false (they were posted with real
      // identity before the toggle existed).
      migrate: (persistedState: unknown, fromVersion) => {
        if (fromVersion >= 2) return persistedState as CommunityDiscussionsState;
        const s = (persistedState ?? {}) as Partial<CommunityDiscussionsState>;
        return {
          ...s,
          discussions: (s.discussions ?? []).map((d) => ({
            ...d,
            is_anonymous: d.is_anonymous ?? false,
          })),
          replies: (s.replies ?? []).map((r) => ({
            ...r,
            is_anonymous: r.is_anonymous ?? false,
          })),
        } as CommunityDiscussionsState;
      },
    },
  ),
);

let _communityDiscussionsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCommunityDiscussionsStore.subscribe((state) => {
  if (_communityDiscussionsSyncTimer) clearTimeout(_communityDiscussionsSyncTimer);
  _communityDiscussionsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("community_discussions_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
