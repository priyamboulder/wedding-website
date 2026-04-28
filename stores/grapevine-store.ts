// ── Grapevine store ─────────────────────────────────────────────────────────
// The Grapevine is a brides-only, anonymous vendor discussion forum that
// lives in the Community shell. Threads + replies are flat (no nesting),
// votes are "helpful" only (no downvotes), and authorship is concealed at
// the display layer — author_id is still stored so moderation, edit/delete,
// and the per-user "this is you" indicator continue to work.
//
// Persistence is localStorage-backed Zustand, mirroring the rest of the
// community surface. The Supabase schema in the spec is aspirational; the
// shape here matches it 1:1 so a later migration is a drop-in.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  GrapevineHelpfulVote,
  GrapevineReply,
  GrapevineReport,
  GrapevineSortKey,
  GrapevineThread,
  GrapevineTopicSlug,
  GrapevineVendorAlertSummary,
} from "@/types/grapevine";
import {
  GRAPEVINE_TOPICS,
  shouldAutoFlag,
  withinLast24h,
} from "@/lib/community/grapevine";

// ── Seed data ───────────────────────────────────────────────────────────────
// Hand-written threads + replies so a brand-new install isn't a ghost town.
// References real seed bride ids and the unified vendor catalog so vendor
// alerts and the "trending" sidebar render with content out of the box.

const SEED_AT = (daysAgo: number, hour = 10): string =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000)
    .toISOString();

const SEED_THREADS: GrapevineThread[] = [
  {
    id: "grape-thread-aurora-pricing",
    author_id: "seed-priya",
    title: "Aurora Studios — what they quote vs. what you actually pay",
    body: "Booked Aurora for our December wedding and the contract came in 28% higher than the initial verbal quote. Travel + second-shooter day rate + an editing tier I didn't know was a tier all stacked on. Photos are gorgeous, no regrets, but I wish I'd asked for the all-in number on day one. Anyone else find their bill grew between inquiry and signing?",
    topic_category: "pricing_and_contracts",
    tagged_vendor_id: "vendor-aurora-studios",
    tagged_vendor_name: "Aurora Studios",
    status: "active",
    reply_count: 2,
    helpful_count: 14,
    view_count: 312,
    is_seed: true,
    created_at: SEED_AT(5),
    updated_at: SEED_AT(1, 14),
    last_reply_at: SEED_AT(1, 14),
  },
  {
    id: "grape-thread-sabya-experience",
    author_id: "seed-meera",
    title: "Has anyone done a Sabyasachi appointment in NYC?",
    body: "Considering flying out for a fitting next month. The Mumbai team was responsive but the NYC inbox has been radio-silent for three weeks. Curious whether anyone got a real appointment locked in or if everyone ends up routing back to India for the actual fittings. Trying to decide whether to just book the flight.",
    topic_category: "has_anyone_worked_with",
    tagged_vendor_id: "vendor-sabyasachi",
    tagged_vendor_name: "Sabyasachi",
    status: "active",
    reply_count: 1,
    helpful_count: 9,
    view_count: 184,
    is_seed: true,
    created_at: SEED_AT(3),
    updated_at: SEED_AT(2, 8),
    last_reply_at: SEED_AT(2, 8),
  },
  {
    id: "grape-thread-foodlink-positive",
    author_id: "seed-tara",
    title: "Foodlink saved our sangeet — proper rave",
    body: "Our original caterer ghosted us 11 days out. Foodlink picked up, scaled to 380 people, ran a custom Andhra menu we'd been told 'wasn't possible at this guest count,' and the lead coordinator stayed past 1am to walk our family through the breakdown. Worth every rupee and then some — they're who I'd call first if I were starting over.",
    topic_category: "recommendations",
    tagged_vendor_id: "vendor-foodlink",
    tagged_vendor_name: "Foodlink",
    status: "active",
    reply_count: 1,
    helpful_count: 22,
    view_count: 401,
    is_seed: true,
    created_at: SEED_AT(8),
    updated_at: SEED_AT(6, 11),
    last_reply_at: SEED_AT(6, 11),
  },
  {
    id: "grape-thread-aurora-followup",
    author_id: "seed-aisha",
    title: "Aurora's editing turnaround stretched to 14 weeks for us",
    body: "Loved the team during the wedding — actually adored them. But the contract said 8 weeks for the gallery and we landed at 14. Album proof took another 9. They were apologetic and the work is beautiful. Still, if your timeline matters (visa stuff, family abroad waiting on prints), build in a buffer or ask them to put a delivery penalty in writing.",
    topic_category: "vendor_experiences",
    tagged_vendor_id: "vendor-aurora-studios",
    tagged_vendor_name: "Aurora Studios",
    status: "active",
    reply_count: 1,
    helpful_count: 8,
    view_count: 156,
    is_seed: true,
    created_at: SEED_AT(2),
    updated_at: SEED_AT(1, 6),
    last_reply_at: SEED_AT(1, 6),
  },
  {
    id: "grape-thread-aurora-redflag",
    author_id: "seed-sneha",
    title: "Heads up — Aurora's contract has an exclusivity clause buried on page 7",
    body: "Reading through the Aurora contract before signing and there's a clause that says no other photographer (including phone-only) can shoot during the events they're contracted for. I get the rationale — but it includes pre-events I'd assumed they weren't covering. Worth flagging to your planner before you sign so you don't accidentally lock out a friend's iPhone candids during haldi.",
    topic_category: "red_flags",
    tagged_vendor_id: "vendor-aurora-studios",
    tagged_vendor_name: "Aurora Studios",
    status: "active",
    reply_count: 0,
    helpful_count: 17,
    view_count: 248,
    is_seed: true,
    created_at: SEED_AT(1),
    updated_at: SEED_AT(1),
    last_reply_at: undefined,
  },
  {
    id: "grape-thread-namrata-praise",
    author_id: "seed-isha",
    title: "Namrata Soni for sangeet — worth the wait",
    body: "Trial took three months to schedule but the day-of look was the single best decision in our budget. Brought her own steamer for the lehenga, fixed a broken zip on the cocktail dress in two minutes, and didn't touch up between events without asking. If you're flexible on date, she's the one.",
    topic_category: "recommendations",
    tagged_vendor_id: "vendor-namrata-soni",
    tagged_vendor_name: "Namrata Soni",
    status: "active",
    reply_count: 0,
    helpful_count: 11,
    view_count: 198,
    is_seed: true,
    created_at: SEED_AT(6),
    updated_at: SEED_AT(6),
    last_reply_at: undefined,
  },
  {
    id: "grape-thread-vendor-comm-tip",
    author_id: "seed-nisha",
    title: "Tip — get every quote in a single PDF before you sign anything",
    body: "Our planner pushed for this and it saved us twice. Vendors had verbally agreed to inclusions that quietly disappeared from the formal contract. Asking for a single PDF that lists every line item, every add-on, and the exact deliverable made it impossible to slip changes past us. Took an extra week, was worth a month of stress later.",
    topic_category: "advice_and_tips",
    status: "active",
    reply_count: 0,
    helpful_count: 19,
    view_count: 287,
    is_seed: true,
    created_at: SEED_AT(11),
    updated_at: SEED_AT(11),
    last_reply_at: undefined,
  },
];

const SEED_REPLIES: GrapevineReply[] = [
  {
    id: "grape-reply-aurora-pricing-1",
    thread_id: "grape-thread-aurora-pricing",
    author_id: "seed-meera",
    body: "Same here. The 'travel' line was the surprise for us — they classed our venue as out-of-region even though it was 90 mins from their studio. Get the bracket map in writing.",
    status: "active",
    helpful_count: 6,
    is_seed: true,
    created_at: SEED_AT(3, 9),
    updated_at: SEED_AT(3, 9),
  },
  {
    id: "grape-reply-aurora-pricing-2",
    thread_id: "grape-thread-aurora-pricing",
    author_id: "seed-tara",
    body: "Negotiating tip — we asked them to lock the editing tier at the entry level for our package and they did. They expect the ask, but they don't lead with the option.",
    status: "active",
    helpful_count: 4,
    is_seed: true,
    created_at: SEED_AT(1, 14),
    updated_at: SEED_AT(1, 14),
  },
  {
    id: "grape-reply-sabya-1",
    thread_id: "grape-thread-sabya-experience",
    author_id: "seed-divya",
    body: "We did the NYC appointment in February. They responded after we cc'd the Mumbai concierge — that unblocked it within 48 hours. The fitting itself was great, but the lehenga still shipped from India.",
    status: "active",
    helpful_count: 5,
    is_seed: true,
    created_at: SEED_AT(2, 8),
    updated_at: SEED_AT(2, 8),
  },
  {
    id: "grape-reply-foodlink-1",
    thread_id: "grape-thread-foodlink-positive",
    author_id: "seed-laila",
    body: "Endorse this entire post. Their kitchen lead also handled a last-minute Jain modification for 40 guests without batting an eye. Proper professionals.",
    status: "active",
    helpful_count: 3,
    is_seed: true,
    created_at: SEED_AT(6, 11),
    updated_at: SEED_AT(6, 11),
  },
  {
    id: "grape-reply-aurora-followup-1",
    thread_id: "grape-thread-aurora-followup",
    author_id: "seed-kavita",
    body: "Ours was 11 weeks. They communicated proactively, which softened it, but yeah — if you're sending an album to in-laws abroad, plan around 12+.",
    status: "active",
    helpful_count: 2,
    is_seed: true,
    created_at: SEED_AT(1, 6),
    updated_at: SEED_AT(1, 6),
  },
];

// ── Store ───────────────────────────────────────────────────────────────────

interface GrapevineState {
  threads: GrapevineThread[];
  replies: GrapevineReply[];
  helpful_votes: GrapevineHelpfulVote[];
  reports: GrapevineReport[];
  // Per-user dismissals for the Grapevine sidebar vendor-alert card. Stored
  // by vendor_id (the user is implicit — local-user only).
  dismissed_vendor_alerts: string[];
  _hydratedSeed: boolean;

  // ── Queries ──
  listThreads: (opts?: {
    topic?: GrapevineTopicSlug | "all";
    sort?: GrapevineSortKey;
    vendorId?: string;
  }) => GrapevineThread[];
  getThread: (id: string) => GrapevineThread | undefined;
  getReplies: (threadId: string) => GrapevineReply[];
  hasVoted: (
    userId: string,
    target: "thread" | "reply",
    targetId: string,
  ) => boolean;
  countRecentThreads: (authorId: string) => number;
  countRecentReplies: (authorId: string) => number;
  getTrending: (limit?: number) => GrapevineThread[];
  getMostHelpful: (limit?: number) => GrapevineThread[];
  getVendorAlertSummary: (
    vendorId: string,
  ) => GrapevineVendorAlertSummary | null;
  getVendorAlertSummaries: (
    vendorIds: string[],
  ) => Record<string, GrapevineVendorAlertSummary | null>;
  isVendorAlertDismissed: (vendorId: string) => boolean;

  // ── Mutations: threads ──
  createThread: (input: {
    author_id: string;
    title: string;
    body: string;
    topic_category: GrapevineTopicSlug;
    tagged_vendor_id?: string;
    tagged_vendor_name?: string;
  }) => GrapevineThread;
  updateThread: (
    id: string,
    patch: Partial<
      Pick<
        GrapevineThread,
        "title" | "body" | "topic_category" | "tagged_vendor_id" | "tagged_vendor_name"
      >
    >,
  ) => void;
  softDeleteThread: (id: string) => void;
  incrementViews: (id: string) => void;

  // ── Mutations: replies ──
  addReply: (input: {
    thread_id: string;
    author_id: string;
    body: string;
  }) => GrapevineReply;
  updateReply: (id: string, body: string) => void;
  softDeleteReply: (id: string) => void;

  // ── Mutations: votes / reports ──
  toggleHelpful: (
    userId: string,
    target: "thread" | "reply",
    targetId: string,
  ) => void;
  reportItem: (input: {
    reporter_id: string;
    target: "thread" | "reply";
    targetId: string;
    reason?: string;
  }) => void;

  // ── Vendor-alert dismissals ──
  dismissVendorAlert: (vendorId: string) => void;
  resetDismissedAlerts: () => void;

  ensureSeeded: () => void;
}

const ALERT_CATEGORIES = new Set<GrapevineTopicSlug>(
  GRAPEVINE_TOPICS.filter((t) => t.counts_toward_alerts).map((t) => t.slug),
);

export const useGrapevineStore = create<GrapevineState>()(
  persist(
    (set, get) => ({
      threads: [],
      replies: [],
      helpful_votes: [],
      reports: [],
      dismissed_vendor_alerts: [],
      _hydratedSeed: false,

      // ── Queries ────────────────────────────────────────────────────────
      listThreads: (opts) => {
        const { topic = "all", sort = "newest", vendorId } = opts ?? {};
        let list = get().threads.filter((t) => t.status === "active");
        if (topic !== "all") list = list.filter((t) => t.topic_category === topic);
        if (vendorId) list = list.filter((t) => t.tagged_vendor_id === vendorId);
        list = list.slice();
        if (sort === "most_discussed") {
          list.sort((a, b) => b.reply_count - a.reply_count);
        } else if (sort === "most_helpful") {
          list.sort((a, b) => b.helpful_count - a.helpful_count);
        } else {
          list.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
        }
        return list;
      },

      getThread: (id) => get().threads.find((t) => t.id === id),

      getReplies: (threadId) =>
        get()
          .replies.filter(
            (r) => r.thread_id === threadId && r.status === "active",
          )
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),

      hasVoted: (userId, target, targetId) =>
        get().helpful_votes.some(
          (v) =>
            v.user_id === userId &&
            v.target === target &&
            (target === "thread"
              ? v.thread_id === targetId
              : v.reply_id === targetId),
        ),

      countRecentThreads: (authorId) =>
        get().threads.filter(
          (t) =>
            t.author_id === authorId &&
            !t.is_seed &&
            withinLast24h(t.created_at),
        ).length,

      countRecentReplies: (authorId) =>
        get().replies.filter(
          (r) =>
            r.author_id === authorId &&
            !r.is_seed &&
            withinLast24h(r.created_at),
        ).length,

      getTrending: (limit = 3) => {
        const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return get()
          .threads.filter(
            (t) =>
              t.status === "active" &&
              new Date(t.created_at).getTime() >= since,
          )
          .slice()
          .sort((a, b) => {
            // Combined recency-weighted reply + helpful score.
            const score = (t: GrapevineThread) =>
              t.reply_count * 2 + t.helpful_count;
            return score(b) - score(a);
          })
          .slice(0, limit);
      },

      getMostHelpful: (limit = 3) => {
        const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return get()
          .threads.filter(
            (t) =>
              t.status === "active" &&
              new Date(t.created_at).getTime() >= since,
          )
          .slice()
          .sort((a, b) => b.helpful_count - a.helpful_count)
          .slice(0, limit);
      },

      getVendorAlertSummary: (vendorId) => {
        const threads = get().threads.filter(
          (t) =>
            t.status === "active" &&
            t.tagged_vendor_id === vendorId &&
            ALERT_CATEGORIES.has(t.topic_category),
        );
        if (threads.length === 0) return null;
        const categories = Array.from(
          new Set(threads.map((t) => t.topic_category)),
        );
        const last_thread_at = threads
          .map((t) => t.created_at)
          .sort()
          .at(-1);
        return {
          vendor_id: vendorId,
          thread_count: threads.length,
          categories,
          last_thread_at,
        };
      },

      getVendorAlertSummaries: (vendorIds) => {
        const result: Record<string, GrapevineVendorAlertSummary | null> = {};
        const set = new Set(vendorIds);
        const buckets = new Map<string, GrapevineThread[]>();
        for (const t of get().threads) {
          if (
            t.status !== "active" ||
            !t.tagged_vendor_id ||
            !set.has(t.tagged_vendor_id) ||
            !ALERT_CATEGORIES.has(t.topic_category)
          )
            continue;
          const bucket = buckets.get(t.tagged_vendor_id) ?? [];
          bucket.push(t);
          buckets.set(t.tagged_vendor_id, bucket);
        }
        for (const id of vendorIds) {
          const bucket = buckets.get(id);
          if (!bucket || bucket.length === 0) {
            result[id] = null;
            continue;
          }
          const categories = Array.from(
            new Set(bucket.map((t) => t.topic_category)),
          );
          const last_thread_at = bucket
            .map((t) => t.created_at)
            .sort()
            .at(-1);
          result[id] = {
            vendor_id: id,
            thread_count: bucket.length,
            categories,
            last_thread_at,
          };
        }
        return result;
      },

      isVendorAlertDismissed: (vendorId) =>
        get().dismissed_vendor_alerts.includes(vendorId),

      // ── Mutations: threads ─────────────────────────────────────────────
      createThread: (input) => {
        const now = new Date().toISOString();
        const auto = shouldAutoFlag(`${input.title}\n\n${input.body}`);
        const thread: GrapevineThread = {
          id: uuid(),
          author_id: input.author_id,
          title: input.title.trim(),
          body: input.body.trim(),
          topic_category: input.topic_category,
          tagged_vendor_id: input.tagged_vendor_id,
          tagged_vendor_name: input.tagged_vendor_name,
          status: auto ? "auto_flagged" : "active",
          moderation_notes: auto
            ? "Auto-flagged for review (matched keyword or shouting heuristic)."
            : undefined,
          reply_count: 0,
          helpful_count: 0,
          view_count: 0,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ threads: [thread, ...state.threads] }));
        return thread;
      },

      updateThread: (id, patch) => {
        const now = new Date().toISOString();
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === id ? { ...t, ...patch, updated_at: now } : t,
          ),
        }));
      },

      softDeleteThread: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === id ? { ...t, status: "removed", updated_at: now } : t,
          ),
        }));
      },

      incrementViews: (id) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === id ? { ...t, view_count: t.view_count + 1 } : t,
          ),
        }));
      },

      // ── Mutations: replies ─────────────────────────────────────────────
      addReply: (input) => {
        const now = new Date().toISOString();
        const auto = shouldAutoFlag(input.body);
        const reply: GrapevineReply = {
          id: uuid(),
          thread_id: input.thread_id,
          author_id: input.author_id,
          body: input.body.trim(),
          status: auto ? "under_review" : "active",
          helpful_count: 0,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({
          replies: [...state.replies, reply],
          // Bump reply_count + last_reply_at on the parent thread, only when
          // the reply enters the active feed. Auto-held replies don't bump.
          threads: state.threads.map((t) =>
            t.id === input.thread_id && reply.status === "active"
              ? {
                  ...t,
                  reply_count: t.reply_count + 1,
                  last_reply_at: now,
                  updated_at: now,
                }
              : t,
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

      softDeleteReply: (id) => {
        const target = get().replies.find((r) => r.id === id);
        if (!target) return;
        const now = new Date().toISOString();
        set((state) => ({
          replies: state.replies.map((r) =>
            r.id === id ? { ...r, status: "removed", updated_at: now } : r,
          ),
          threads: state.threads.map((t) =>
            t.id === target.thread_id
              ? { ...t, reply_count: Math.max(0, t.reply_count - 1) }
              : t,
          ),
          helpful_votes: state.helpful_votes.filter(
            (v) => v.reply_id !== id,
          ),
        }));
      },

      // ── Votes / reports ────────────────────────────────────────────────
      toggleHelpful: (userId, target, targetId) => {
        const existing = get().helpful_votes.find(
          (v) =>
            v.user_id === userId &&
            v.target === target &&
            (target === "thread"
              ? v.thread_id === targetId
              : v.reply_id === targetId),
        );
        if (existing) {
          set((state) => ({
            helpful_votes: state.helpful_votes.filter(
              (v) => v.id !== existing.id,
            ),
            threads:
              target === "thread"
                ? state.threads.map((t) =>
                    t.id === targetId
                      ? {
                          ...t,
                          helpful_count: Math.max(0, t.helpful_count - 1),
                        }
                      : t,
                  )
                : state.threads,
            replies:
              target === "reply"
                ? state.replies.map((r) =>
                    r.id === targetId
                      ? {
                          ...r,
                          helpful_count: Math.max(0, r.helpful_count - 1),
                        }
                      : r,
                  )
                : state.replies,
          }));
          return;
        }
        const vote: GrapevineHelpfulVote = {
          id: uuid(),
          user_id: userId,
          target,
          thread_id: target === "thread" ? targetId : undefined,
          reply_id: target === "reply" ? targetId : undefined,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          helpful_votes: [...state.helpful_votes, vote],
          threads:
            target === "thread"
              ? state.threads.map((t) =>
                  t.id === targetId
                    ? { ...t, helpful_count: t.helpful_count + 1 }
                    : t,
                )
              : state.threads,
          replies:
            target === "reply"
              ? state.replies.map((r) =>
                  r.id === targetId
                    ? { ...r, helpful_count: r.helpful_count + 1 }
                    : r,
                )
              : state.replies,
        }));
      },

      reportItem: (input) => {
        const report: GrapevineReport = {
          id: uuid(),
          reporter_id: input.reporter_id,
          target: input.target,
          thread_id: input.target === "thread" ? input.targetId : undefined,
          reply_id: input.target === "reply" ? input.targetId : undefined,
          reason: input.reason,
          created_at: new Date().toISOString(),
        };
        // Spec rule: 3 unique reporters auto-hides the item pending review.
        const sameTarget = get().reports.filter(
          (r) =>
            r.target === input.target &&
            (input.target === "thread"
              ? r.thread_id === input.targetId
              : r.reply_id === input.targetId),
        );
        const uniqueReporters = new Set(
          [...sameTarget, report].map((r) => r.reporter_id),
        );
        const shouldHide = uniqueReporters.size >= 3;
        set((state) => ({
          reports: [...state.reports, report],
          threads:
            shouldHide && input.target === "thread"
              ? state.threads.map((t) =>
                  t.id === input.targetId
                    ? { ...t, status: "under_review" }
                    : t,
                )
              : state.threads,
          replies:
            shouldHide && input.target === "reply"
              ? state.replies.map((r) =>
                  r.id === input.targetId
                    ? { ...r, status: "under_review" }
                    : r,
                )
              : state.replies,
        }));
      },

      // ── Vendor-alert dismissals ────────────────────────────────────────
      dismissVendorAlert: (vendorId) => {
        set((state) =>
          state.dismissed_vendor_alerts.includes(vendorId)
            ? state
            : {
                dismissed_vendor_alerts: [
                  ...state.dismissed_vendor_alerts,
                  vendorId,
                ],
              },
        );
      },

      resetDismissedAlerts: () => set({ dismissed_vendor_alerts: [] }),

      ensureSeeded: () => {
        if (get()._hydratedSeed) return;
        const existingThreadIds = new Set(get().threads.map((t) => t.id));
        const newThreads = SEED_THREADS.filter(
          (t) => !existingThreadIds.has(t.id),
        );
        const existingReplyIds = new Set(get().replies.map((r) => r.id));
        const newReplies = SEED_REPLIES.filter(
          (r) => !existingReplyIds.has(r.id),
        );
        set((state) => ({
          threads: [...state.threads, ...newThreads],
          replies: [...state.replies, ...newReplies],
          _hydratedSeed: true,
        }));
      },
    }),
    {
      name: "ananya-grapevine",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _grapevineSyncTimer: ReturnType<typeof setTimeout> | null = null;
useGrapevineStore.subscribe((state) => {
  if (_grapevineSyncTimer) clearTimeout(_grapevineSyncTimer);
  _grapevineSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("grapevine_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
