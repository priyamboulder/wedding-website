// ── Confessional store ──────────────────────────────────────────────────────
// Anonymous storytelling layer. Schema mirrors the spec'd Supabase tables
// 1:1 — author_id is stored on every row but stripped before reads. Public
// selectors return ConfessionalPostPublic / ConfessionalReplyPublic; admin
// selectors keep author_id.
//
// Status lifecycle: 'pending' → 'published' (admin approves) or 'rejected'.
// 'featured' is a published post promoted to "Story of the Month".
// Auto-hide: posts/replies with report_count >= AUTO_HIDE_REPORTS get
// flipped back to 'pending' (posts) / 'removed' (replies) for admin review.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import {
  CONFESSIONAL_AUTO_HIDE_REPORTS,
  CONFESSIONAL_LIMITS,
  type ConfessionalCategorySlug,
  type ConfessionalPost,
  type ConfessionalPostPublic,
  type ConfessionalReply,
  type ConfessionalReplyPublic,
  type ConfessionalReport,
  type ConfessionalReportReason,
  type ConfessionalReportTarget,
  type ConfessionalSave,
  type ConfessionalSort,
  type ConfessionalStatus,
  type ConfessionalVote,
  type ConfessionalVoteType,
} from "@/types/confessional";
import {
  SEED_CONFESSIONAL_POSTS,
  SEED_CONFESSIONAL_REPLIES,
} from "@/lib/community/confessional-seed";
import { generateAnonymousName } from "@/lib/community/confessional-names";

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;

// Strip author_id from any row before it leaves the store.
function stripPost(row: ConfessionalPost): ConfessionalPostPublic {
  const { author_id: _, ...rest } = row;
  void _;
  return rest;
}
function stripReply(row: ConfessionalReply): ConfessionalReplyPublic {
  const { author_id: _, ...rest } = row;
  void _;
  return rest;
}

export interface ConfessionalSubmissionDraft {
  author_id: string;
  display_name?: string;
  title: string;
  body: string;
  category: ConfessionalCategorySlug;
  tags?: string[];
}

export interface ConfessionalReplyDraft {
  post_id: string;
  author_id: string;
  display_name?: string;
  body: string;
}

export interface ConfessionalFeedFilters {
  category?: ConfessionalCategorySlug | "all";
  sort?: ConfessionalSort;
}

interface ConfessionalState {
  posts: ConfessionalPost[];
  replies: ConfessionalReply[];
  votes: ConfessionalVote[];
  saves: ConfessionalSave[];
  reports: ConfessionalReport[];
  _hydratedSeed: boolean;

  // ── Public read selectors (author_id stripped) ──
  listPublishedPosts: (filters?: ConfessionalFeedFilters) => ConfessionalPostPublic[];
  getPublicPost: (id: string) => ConfessionalPostPublic | undefined;
  listPublicReplies: (postId: string) => ConfessionalReplyPublic[];
  getFeaturedPost: () => ConfessionalPostPublic | undefined;

  // ── User state ──
  hasVoted: (postId: string, userId: string) => ConfessionalVoteType | null;
  hasSaved: (postId: string, userId: string) => boolean;
  hasReported: (
    target: ConfessionalReportTarget,
    targetId: string,
    userId: string,
  ) => boolean;

  // ── Mutations ──
  submitPost: (draft: ConfessionalSubmissionDraft) => ConfessionalPost;
  submitReply: (draft: ConfessionalReplyDraft) => ConfessionalReply;
  toggleVote: (postId: string, userId: string, voteType: ConfessionalVoteType) => void;
  toggleSave: (postId: string, userId: string) => void;
  incrementView: (postId: string) => void;
  reportContent: (
    target: ConfessionalReportTarget,
    targetId: string,
    reporterId: string,
    reason: ConfessionalReportReason,
    details?: string,
  ) => void;

  // ── Admin (full row, includes author_id) ──
  adminListPosts: (statusFilter?: ConfessionalStatus | "all") => ConfessionalPost[];
  adminListReportedPosts: () => ConfessionalPost[];
  adminListReportedReplies: () => ConfessionalReply[];
  adminListReports: () => ConfessionalReport[];
  adminUpdatePostStatus: (postId: string, status: ConfessionalStatus) => void;
  adminToggleFeatured: (postId: string) => void;
  adminRemoveReply: (replyId: string) => void;

  ensureSeeded: () => void;
}

function sortPosts(
  rows: ConfessionalPost[],
  sort: ConfessionalSort,
): ConfessionalPost[] {
  const copy = [...rows];
  switch (sort) {
    case "most-saved":
      return copy.sort((a, b) => b.save_count - a.save_count);
    case "most-voted":
      return copy.sort(
        (a, b) =>
          b.vote_up_count + b.vote_down_count - (a.vote_up_count + a.vote_down_count),
      );
    case "editors-pick":
      return copy.sort((a, b) => {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        return b.save_count - a.save_count;
      });
    case "newest":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
}

export const useConfessionalStore = create<ConfessionalState>()(
  persist(
    (set, get) => ({
      posts: [],
      replies: [],
      votes: [],
      saves: [],
      reports: [],
      _hydratedSeed: false,

      // ── Public read selectors ───────────────────────────────────────────
      listPublishedPosts: (filters) => {
        const { posts } = get();
        const visible = posts.filter(
          (p) => p.status === "published" || p.status === "featured",
        );
        const filtered =
          !filters?.category || filters.category === "all"
            ? visible
            : visible.filter((p) => p.category === filters.category);
        return sortPosts(filtered, filters?.sort ?? "newest").map(stripPost);
      },

      getPublicPost: (id) => {
        const row = get().posts.find((p) => p.id === id);
        if (!row) return undefined;
        if (row.status !== "published" && row.status !== "featured")
          return undefined;
        return stripPost(row);
      },

      listPublicReplies: (postId) =>
        get()
          .replies.filter(
            (r) => r.post_id === postId && r.status === "published",
          )
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          )
          .map(stripReply),

      getFeaturedPost: () => {
        const featured = get().posts.find(
          (p) => p.is_featured && p.status === "featured",
        );
        return featured ? stripPost(featured) : undefined;
      },

      // ── User state ──────────────────────────────────────────────────────
      hasVoted: (postId, userId) => {
        const v = get().votes.find(
          (x) => x.post_id === postId && x.user_id === userId,
        );
        return v?.vote_type ?? null;
      },

      hasSaved: (postId, userId) =>
        get().saves.some((s) => s.post_id === postId && s.user_id === userId),

      hasReported: (target, targetId, userId) =>
        get().reports.some(
          (r) =>
            r.target_type === target &&
            r.target_id === targetId &&
            r.reporter_id === userId,
        ),

      // ── Mutations ───────────────────────────────────────────────────────
      submitPost: (draft) => {
        const now = new Date().toISOString();
        const title = draft.title.trim().slice(0, CONFESSIONAL_LIMITS.TITLE_MAX);
        const body = draft.body.trim().slice(0, CONFESSIONAL_LIMITS.BODY_MAX);
        const display_name =
          draft.display_name?.trim() || generateAnonymousName();
        const tags = (draft.tags ?? [])
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, CONFESSIONAL_LIMITS.TAGS_MAX);
        const post: ConfessionalPost = {
          id: genId(),
          created_at: now,
          updated_at: now,
          author_id: draft.author_id,
          display_name,
          title,
          body,
          category: draft.category,
          tags,
          status: "pending",
          is_featured: false,
          save_count: 0,
          vote_up_count: 0,
          vote_down_count: 0,
          view_count: 0,
          report_count: 0,
        };
        set((state) => ({ posts: [post, ...state.posts] }));
        return post;
      },

      submitReply: (draft) => {
        const now = new Date().toISOString();
        const reply: ConfessionalReply = {
          id: genId(),
          post_id: draft.post_id,
          author_id: draft.author_id,
          display_name:
            draft.display_name?.trim() || generateAnonymousName(),
          body: draft.body.trim().slice(0, CONFESSIONAL_LIMITS.REPLY_MAX),
          created_at: now,
          status: "published",
          report_count: 0,
        };
        set((state) => ({ replies: [...state.replies, reply] }));
        return reply;
      },

      toggleVote: (postId, userId, voteType) => {
        const existing = get().votes.find(
          (v) => v.post_id === postId && v.user_id === userId,
        );

        // No prior vote — insert.
        if (!existing) {
          const vote: ConfessionalVote = {
            id: genId(),
            post_id: postId,
            user_id: userId,
            vote_type: voteType,
            created_at: new Date().toISOString(),
          };
          set((state) => ({
            votes: [...state.votes, vote],
            posts: state.posts.map((p) =>
              p.id === postId
                ? voteType === "up"
                  ? { ...p, vote_up_count: p.vote_up_count + 1 }
                  : { ...p, vote_down_count: p.vote_down_count + 1 }
                : p,
            ),
          }));
          return;
        }

        // Same vote — remove (toggle off).
        if (existing.vote_type === voteType) {
          set((state) => ({
            votes: state.votes.filter((v) => v.id !== existing.id),
            posts: state.posts.map((p) =>
              p.id === postId
                ? voteType === "up"
                  ? { ...p, vote_up_count: Math.max(0, p.vote_up_count - 1) }
                  : { ...p, vote_down_count: Math.max(0, p.vote_down_count - 1) }
                : p,
            ),
          }));
          return;
        }

        // Switching vote direction — flip the counters.
        set((state) => ({
          votes: state.votes.map((v) =>
            v.id === existing.id
              ? { ...v, vote_type: voteType, created_at: new Date().toISOString() }
              : v,
          ),
          posts: state.posts.map((p) => {
            if (p.id !== postId) return p;
            if (voteType === "up") {
              return {
                ...p,
                vote_up_count: p.vote_up_count + 1,
                vote_down_count: Math.max(0, p.vote_down_count - 1),
              };
            }
            return {
              ...p,
              vote_down_count: p.vote_down_count + 1,
              vote_up_count: Math.max(0, p.vote_up_count - 1),
            };
          }),
        }));
      },

      toggleSave: (postId, userId) => {
        const existing = get().saves.find(
          (s) => s.post_id === postId && s.user_id === userId,
        );
        if (existing) {
          set((state) => ({
            saves: state.saves.filter((s) => s.id !== existing.id),
            posts: state.posts.map((p) =>
              p.id === postId
                ? { ...p, save_count: Math.max(0, p.save_count - 1) }
                : p,
            ),
          }));
          return;
        }
        const save: ConfessionalSave = {
          id: genId(),
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          saves: [...state.saves, save],
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, save_count: p.save_count + 1 } : p,
          ),
        }));
      },

      incrementView: (postId) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, view_count: p.view_count + 1 } : p,
          ),
        }));
      },

      reportContent: (target, targetId, reporterId, reason, details) => {
        // Idempotent — one report per (target, reporter).
        if (get().hasReported(target, targetId, reporterId)) return;
        const report: ConfessionalReport = {
          id: genId(),
          target_type: target,
          target_id: targetId,
          reporter_id: reporterId,
          reason,
          details: details?.trim() || undefined,
          created_at: new Date().toISOString(),
        };
        set((state) => {
          const reports = [...state.reports, report];
          if (target === "post") {
            const posts = state.posts.map((p) => {
              if (p.id !== targetId) return p;
              const next = { ...p, report_count: p.report_count + 1 };
              // Auto-hide once threshold is crossed (only for currently
              // visible posts; pending posts stay pending).
              if (
                next.report_count >= CONFESSIONAL_AUTO_HIDE_REPORTS &&
                (next.status === "published" || next.status === "featured")
              ) {
                return {
                  ...next,
                  status: "pending" as ConfessionalStatus,
                  is_featured: false,
                };
              }
              return next;
            });
            return { reports, posts };
          }
          const replies = state.replies.map((r) => {
            if (r.id !== targetId) return r;
            const next = { ...r, report_count: r.report_count + 1 };
            if (
              next.report_count >= CONFESSIONAL_AUTO_HIDE_REPORTS &&
              next.status === "published"
            ) {
              return { ...next, status: "removed" as const };
            }
            return next;
          });
          return { reports, replies };
        });
      },

      // ── Admin selectors / mutations (full rows) ─────────────────────────
      adminListPosts: (statusFilter = "all") => {
        const all = [...get().posts].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        if (statusFilter === "all") return all;
        return all.filter((p) => p.status === statusFilter);
      },

      adminListReportedPosts: () =>
        get()
          .posts.filter((p) => p.report_count > 0)
          .sort((a, b) => b.report_count - a.report_count),

      adminListReportedReplies: () =>
        get()
          .replies.filter((r) => r.report_count > 0)
          .sort((a, b) => b.report_count - a.report_count),

      adminListReports: () =>
        [...get().reports].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),

      adminUpdatePostStatus: (postId, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  status,
                  is_featured: status === "featured" ? true : p.is_featured,
                  featured_month:
                    status === "featured"
                      ? p.featured_month ??
                        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
                      : p.featured_month,
                  updated_at: now,
                }
              : p,
          ),
        }));
      },

      adminToggleFeatured: (postId) => {
        const now = new Date().toISOString();
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== postId) return p;
            const nextFeatured = !p.is_featured;
            return {
              ...p,
              is_featured: nextFeatured,
              status: nextFeatured ? "featured" : "published",
              featured_month: nextFeatured
                ? p.featured_month ??
                  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
                : p.featured_month,
              updated_at: now,
            };
          }),
        }));
      },

      adminRemoveReply: (replyId) => {
        set((state) => ({
          replies: state.replies.map((r) =>
            r.id === replyId ? { ...r, status: "removed" as const } : r,
          ),
        }));
      },

      ensureSeeded: () => {
        if (get()._hydratedSeed) return;
        const existingPostIds = new Set(get().posts.map((p) => p.id));
        const existingReplyIds = new Set(get().replies.map((r) => r.id));
        const seedPosts = SEED_CONFESSIONAL_POSTS.filter(
          (p) => !existingPostIds.has(p.id),
        );
        const seedReplies = SEED_CONFESSIONAL_REPLIES.filter(
          (r) => !existingReplyIds.has(r.id),
        );
        set((state) => ({
          posts: [...seedPosts, ...state.posts],
          replies: [...state.replies, ...seedReplies],
          _hydratedSeed: true,
        }));
      },
    }),
    {
      name: "ananya-confessional",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _confessionalSyncTimer: ReturnType<typeof setTimeout> | null = null;
useConfessionalStore.subscribe((state) => {
  if (_confessionalSyncTimer) clearTimeout(_confessionalSyncTimer);
  _confessionalSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { posts, replies, votes, saves, reports } = state;
    dbUpsert("confessional_posts", { couple_id: coupleId, posts, replies, votes, saves, reports });
  }, 600);
});
