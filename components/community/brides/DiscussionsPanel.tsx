"use client";

// ── Discussions panel ───────────────────────────────────────────────────────
// Reddit/forum-style Q&A board for brides — flat replies, warm tone, a
// "helpful" reaction instead of up/downvotes. Lives inside the Brides tab
// and uses the `discussion` URL param to deep-link into a thread.
//
// Shape:
//   - List view: filter chips (All + 14 categories) + sort selector +
//     "ask the community" button, followed by a stream of thread cards.
//   - Thread detail: the original post, replies in chronological order,
//     a reply composer at the bottom. Lives in the same panel — selecting
//     a thread replaces the list; "back to discussions" returns to it.
//   - Ask modal: compact inline modal with category picker, title, body,
//     optional city.

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Pin,
  Plus,
  Send,
  VenetianMask,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DISCUSSION_CATEGORIES,
  getDiscussionCategory,
} from "@/lib/community/seed";
import {
  DAILY_ANON_DISCUSSION_LIMIT,
  DAILY_ANON_REPLY_LIMIT,
  getAnonymousIdentity,
} from "@/lib/community/anonymous";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityDiscussionsStore } from "@/stores/community-discussions-store";
import { useMentoringStore } from "@/stores/mentoring-store";
import type {
  CommunityProfile,
  Discussion,
  DiscussionCategorySlug,
  DiscussionReply,
} from "@/types/community";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import { AnonymousAvatar } from "@/components/community/AnonymousAvatar";

type SortKey = "recent" | "active" | "replies";
type CategoryFilter = "all" | DiscussionCategorySlug;

export function DiscussionsPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ensureSeeded = useCommunityDiscussionsStore((s) => s.ensureSeeded);
  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  const discussionId = searchParams?.get("discussion") ?? "";

  const openThread = (id: string) => {
    const p = new URLSearchParams(searchParams?.toString() ?? "");
    p.set("tab", "brides");
    p.set("view", "discussions");
    p.set("discussion", id);
    router.replace(`/community?${p.toString()}`, { scroll: false });
  };

  const closeThread = () => {
    const p = new URLSearchParams(searchParams?.toString() ?? "");
    p.set("tab", "brides");
    p.set("view", "discussions");
    p.delete("discussion");
    router.replace(`/community?${p.toString()}`, { scroll: false });
  };

  if (discussionId) {
    return (
      <ThreadDetail discussionId={discussionId} onBack={closeThread} />
    );
  }
  return <DiscussionsList onOpen={openThread} />;
}

// ── List view ──────────────────────────────────────────────────────────────

function DiscussionsList({ onOpen }: { onOpen: (id: string) => void }) {
  const discussions = useCommunityDiscussionsStore((s) => s.discussions);
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [creating, setCreating] = useState(false);

  const sorted = useMemo(() => {
    let list = discussions.slice();
    if (category !== "all") list = list.filter((d) => d.category === category);
    list.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      if (sort === "active") {
        const aT = a.last_reply_at ?? a.created_at;
        const bT = b.last_reply_at ?? b.created_at;
        return new Date(bT).getTime() - new Date(aT).getTime();
      }
      if (sort === "replies") {
        if (b.reply_count !== a.reply_count) return b.reply_count - a.reply_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [discussions, category, sort]);

  return (
    <div className="px-6 pb-16 pt-6 md:px-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — discussions —
          </p>
          <h2 className="mt-2 font-serif text-[28px] font-medium leading-tight text-ink">
            questions, recs, and real talk.
          </h2>
          <p className="mt-1.5 max-w-[520px] text-[13.5px] leading-[1.55] text-ink-muted">
            a low-key board for the planning circle — ask anything, share
            what's worked, swap vendor finds.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft"
          >
            <Plus size={13} strokeWidth={2} />
            ask the community
          </button>
          <div className="flex items-center gap-2">
            <label
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Sort
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15"
            >
              <option value="recent">Recent</option>
              <option value="active">Most active</option>
              <option value="replies">Most replies</option>
            </select>
          </div>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          <CategoryChip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="All"
          />
          {DISCUSSION_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.slug}
              active={category === cat.slug}
              onClick={() => setCategory(cat.slug)}
              label={cat.label}
              emoji={cat.emoji}
            />
          ))}
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            hasAny={discussions.length > 0}
            onAsk={() => setCreating(true)}
          />
        ) : (
          <div className="space-y-3">
            {sorted.map((d) => (
              <ThreadCard
                key={d.id}
                discussion={d}
                author={profiles.find((p) => p.id === d.author_id)}
                currentUserId={myProfileId ?? undefined}
                onOpen={() => onOpen(d.id)}
              />
            ))}
          </div>
        )}
      </div>

      {creating && (
        <AskModal
          onClose={() => setCreating(false)}
          canPost={!!myProfileId}
        />
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
      )}
    >
      {emoji && <span aria-hidden>{emoji}</span>}
      {label}
    </button>
  );
}

function ThreadCard({
  discussion,
  author,
  currentUserId,
  onOpen,
}: {
  discussion: Discussion;
  author?: CommunityProfile;
  currentUserId?: string;
  onOpen: () => void;
}) {
  const cat = getDiscussionCategory(discussion.category);
  const cityTag = [discussion.city, discussion.state].filter(Boolean).join(", ");
  const anon = discussion.is_anonymous
    ? getAnonymousIdentity(discussion.author_id, discussion.id)
    : null;
  const authorName = anon?.name ?? author?.display_name ?? "a bride";
  const isOwn = !!currentUserId && discussion.author_id === currentUserId;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-full rounded-xl border border-gold/15 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_10px_28px_rgba(28,25,23,0.07)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {cat && (
            <>
              <span aria-hidden>{cat.emoji}</span>
              <span>{cat.label}</span>
            </>
          )}
          {cityTag && (
            <>
              <span className="text-ink-faint">·</span>
              <span>{cityTag}</span>
            </>
          )}
        </div>
        {discussion.is_pinned && (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-saffron/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Pin size={10} strokeWidth={2} />
            pinned
          </span>
        )}
      </div>

      <h3 className="mt-2 font-serif text-[18px] font-medium leading-snug text-ink">
        {discussion.title}
      </h3>

      {discussion.body && (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.55] text-ink-muted">
          {discussion.body}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          {anon ? (
            <AnonymousAvatar color={anon.color} size={20} />
          ) : (
            <BrideAvatar
              name={authorName}
              src={author?.avatar_data_url}
              size={20}
            />
          )}
          <span>{authorName}</span>
          {!anon && author && <MentorInlineBadge profileId={author.id} />}
          {anon && (
            <span className="text-[11px] text-ink-faint/80">
              (anonymous{isOwn ? " · this is you" : ""})
            </span>
          )}
        </span>
        <span>·</span>
        <span>{formatRelative(discussion.created_at)}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare size={12} strokeWidth={1.8} />
          {discussion.reply_count}{" "}
          {discussion.reply_count === 1 ? "reply" : "replies"}
        </span>
      </div>
    </button>
  );
}

function EmptyState({
  hasAny,
  onAsk,
}: {
  hasAny: boolean;
  onAsk: () => void;
}) {
  return (
    <div className="mt-8 rounded-xl border border-dashed border-gold/25 bg-ivory-warm/30 px-6 py-10 text-center">
      <p className="font-serif text-[18px] italic text-ink">
        {hasAny
          ? "no threads in this category yet."
          : "be the first to start a thread."}
      </p>
      <p className="mt-2 text-[13px] text-ink-muted">
        drop a question — someone here's probably been through it.
      </p>
      <button
        type="button"
        onClick={onAsk}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
      >
        <Plus size={13} strokeWidth={2} />
        ask the community
      </button>
    </div>
  );
}

// ── Thread detail ──────────────────────────────────────────────────────────

function ThreadDetail({
  discussionId,
  onBack,
}: {
  discussionId: string;
  onBack: () => void;
}) {
  const discussion = useCommunityDiscussionsStore((s) =>
    s.discussions.find((d) => d.id === discussionId),
  );
  const allReplies = useCommunityDiscussionsStore((s) => s.replies);
  const replies = useMemo(
    () =>
      allReplies
        .filter((r) => r.discussion_id === discussionId)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
    [allReplies, discussionId],
  );
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const addReply = useCommunityDiscussionsStore((s) => s.addReply);
  const countRecentAnonReplies = useCommunityDiscussionsStore(
    (s) => s.countRecentAnonymousReplies,
  );

  const [draft, setDraft] = useState("");
  const [replyAnon, setReplyAnon] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  if (!discussion) {
    return (
      <div className="px-6 py-16 text-center md:px-10">
        <p className="font-serif text-[20px] italic text-ink">
          this thread can't be found.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          back to discussions
        </button>
      </div>
    );
  }

  const cat = getDiscussionCategory(discussion.category);
  const author = profiles.find((p) => p.id === discussion.author_id);
  const cityTag = [discussion.city, discussion.state].filter(Boolean).join(", ");
  const postAnon = discussion.is_anonymous
    ? getAnonymousIdentity(discussion.author_id, discussion.id)
    : null;
  const isOwnPost = !!myProfileId && discussion.author_id === myProfileId;

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    setReplyError(null);
    const text = draft.trim();
    if (!text || !myProfileId || discussion.is_locked) return;
    if (replyAnon) {
      const count = countRecentAnonReplies(myProfileId);
      if (count >= DAILY_ANON_REPLY_LIMIT) {
        setReplyError(
          `you've reached the daily limit for anonymous replies (${DAILY_ANON_REPLY_LIMIT}). try again tomorrow, or reply with your name.`,
        );
        return;
      }
    }
    addReply(discussion.id, myProfileId, text, replyAnon);
    setDraft("");
    setReplyAnon(false);
  };

  return (
    <div className="px-6 pb-16 pt-6 md:px-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
          back to discussions
        </button>

        <article className="mt-5 rounded-2xl border border-gold/15 bg-white p-6">
          <div
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {cat && (
              <>
                <span aria-hidden>{cat.emoji}</span>
                <span>{cat.label}</span>
              </>
            )}
            {cityTag && (
              <>
                <span className="text-ink-faint">·</span>
                <span>{cityTag}</span>
              </>
            )}
          </div>
          <h1 className="mt-2 font-serif text-[26px] font-medium leading-snug text-ink">
            {discussion.title}
          </h1>
          {discussion.body && (
            <p className="mt-4 whitespace-pre-line text-[14.5px] leading-[1.7] text-ink">
              {discussion.body}
            </p>
          )}

          <div className="mt-5 flex items-center gap-3 border-t border-gold/10 pt-4 text-[12.5px] text-ink-muted">
            {postAnon ? (
              <AnonymousAvatar color={postAnon.color} size={32} />
            ) : (
              <BrideAvatar
                name={author?.display_name ?? "bride"}
                src={author?.avatar_data_url}
                size={32}
              />
            )}
            <div>
              <p className="flex flex-wrap items-center gap-1.5 font-medium text-ink">
                <span>
                  {postAnon ? postAnon.name : (author?.display_name ?? "a bride")}
                </span>
                {!postAnon && author && (
                  <MentorInlineBadge profileId={author.id} />
                )}
                {postAnon && (
                  <span className="text-[11.5px] font-normal text-ink-faint">
                    (anonymous{isOwnPost ? " · this is you" : ""})
                  </span>
                )}
              </p>
              <p className="text-[11.5px] text-ink-faint">
                {postAnon
                  ? `posted ${formatRelative(discussion.created_at)}`
                  : (() => {
                      const route =
                        author?.hometown && author?.wedding_city
                          ? `${shortCity(author.hometown)} → ${shortCity(author.wedding_city)}`
                          : author?.hometown
                            ? shortCity(author.hometown)
                            : "";
                      return `${route}${route ? " · " : ""}posted ${formatRelative(discussion.created_at)}`;
                    })()}
              </p>
            </div>
          </div>
        </article>

        <div className="mb-4 mt-8 flex items-baseline gap-3">
          <h3
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — {replies.length} {replies.length === 1 ? "reply" : "replies"} —
          </h3>
        </div>

        <div className="space-y-3">
          {replies.map((r) => (
            <ReplyCard
              key={r.id}
              reply={r}
              author={profiles.find((p) => p.id === r.author_id)}
              currentUserId={myProfileId ?? undefined}
            />
          ))}
          {replies.length === 0 && (
            <p className="rounded-xl border border-dashed border-gold/20 bg-ivory-warm/30 px-5 py-8 text-center text-[13px] text-ink-muted">
              no replies yet — be the first to chime in.
            </p>
          )}
        </div>

        <form
          onSubmit={handleReply}
          className="mt-6 rounded-2xl border border-gold/15 bg-white p-4"
        >
          <label
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            your reply
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              discussion.is_locked
                ? "this thread is locked."
                : myProfileId
                  ? "share what worked, ask a follow-up, or just say hi…"
                  : "set up your profile to reply."
            }
            disabled={!myProfileId || discussion.is_locked}
            rows={3}
            className="mt-2 w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13.5px] leading-[1.55] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15 disabled:bg-ivory-warm/50 disabled:text-ink-faint"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11.5px] transition-colors",
                replyAnon
                  ? "border-saffron/40 bg-saffron/10 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-saffron/30 hover:text-ink",
                (!myProfileId || discussion.is_locked) &&
                  "pointer-events-none opacity-50",
              )}
            >
              <VenetianMask size={13} strokeWidth={1.8} />
              reply anonymously
              <input
                type="checkbox"
                checked={replyAnon}
                onChange={(e) => setReplyAnon(e.target.checked)}
                disabled={!myProfileId || discussion.is_locked}
                className="h-3.5 w-3.5 cursor-pointer accent-saffron"
              />
            </label>
            <button
              type="submit"
              disabled={!draft.trim() || !myProfileId || discussion.is_locked}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              reply
              <Send size={12} strokeWidth={1.8} />
            </button>
          </div>
          {replyError && (
            <p className="mt-2 rounded-md border border-henna/30 bg-henna/5 px-3 py-2 text-[12px] text-ink">
              {replyError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function ReplyCard({
  reply,
  author,
  currentUserId,
}: {
  reply: DiscussionReply;
  author?: CommunityProfile;
  currentUserId?: string;
}) {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const reacted = useCommunityDiscussionsStore((s) =>
    myProfileId
      ? s.reactions.some(
          (r) => r.reply_id === reply.id && r.reactor_id === myProfileId,
        )
      : false,
  );
  const toggle = useCommunityDiscussionsStore((s) => s.toggleHelpful);

  const anon = reply.is_anonymous
    ? getAnonymousIdentity(reply.author_id, reply.discussion_id)
    : null;
  const isOwn = !!currentUserId && reply.author_id === currentUserId;

  return (
    <div className="rounded-xl border border-gold/15 bg-white p-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {anon ? (
          <AnonymousAvatar color={anon.color} size={28} />
        ) : (
          <BrideAvatar
            name={author?.display_name ?? "bride"}
            src={author?.avatar_data_url}
            size={28}
          />
        )}
        <p className="text-[12.5px] font-medium text-ink">
          {anon ? anon.name : (author?.display_name ?? "a bride")}
        </p>
        {!anon && author && <MentorInlineBadge profileId={author.id} />}
        {anon && (
          <span className="text-[11px] text-ink-faint">
            (anonymous{isOwn ? " · this is you" : ""})
          </span>
        )}
        <span className="text-[11.5px] text-ink-faint">
          · {formatRelative(reply.created_at)}
        </span>
      </div>
      <p className="mt-2.5 whitespace-pre-line text-[13.5px] leading-[1.65] text-ink">
        {renderLightMarkdown(reply.body)}
      </p>
      <div className="mt-3">
        <button
          type="button"
          onClick={() => myProfileId && toggle(reply.id, myProfileId)}
          disabled={!myProfileId}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
            reacted
              ? "border-saffron/40 bg-saffron/10 text-saffron"
              : "border-border bg-white text-ink-muted hover:border-saffron/30 hover:text-ink",
            !myProfileId && "cursor-not-allowed opacity-60",
          )}
        >
          <Heart
            size={12}
            strokeWidth={1.8}
            className={cn(reacted && "fill-saffron/60")}
          />
          {reply.helpful_count > 0 ? (
            <>
              {reply.helpful_count}{" "}
              {reply.helpful_count === 1
                ? "found this helpful"
                : "found this helpful"}
            </>
          ) : (
            <>helpful</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Ask modal ──────────────────────────────────────────────────────────────

function AskModal({
  onClose,
  canPost,
}: {
  onClose: () => void;
  canPost: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const create = useCommunityDiscussionsStore((s) => s.createDiscussion);
  const countRecentAnon = useCommunityDiscussionsStore(
    (s) => s.countRecentAnonymousDiscussions,
  );

  const [category, setCategory] = useState<DiscussionCategorySlug>("advice");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [city, setCity] = useState("");
  const [anon, setAnon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!myProfileId || !title.trim()) return;
    if (anon) {
      const used = countRecentAnon(myProfileId);
      if (used >= DAILY_ANON_DISCUSSION_LIMIT) {
        setError(
          `you've reached the daily limit for anonymous posts (${DAILY_ANON_DISCUSSION_LIMIT}). try again tomorrow, or post with your name.`,
        );
        return;
      }
    }
    const discussion = create({
      author_id: myProfileId,
      title,
      body: body || undefined,
      category,
      city: city || undefined,
      is_anonymous: anon,
    });
    onClose();
    const p = new URLSearchParams(searchParams?.toString() ?? "");
    p.set("tab", "brides");
    p.set("view", "discussions");
    p.set("discussion", discussion.id);
    router.replace(`/community?${p.toString()}`, { scroll: false });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/35 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-gold/15 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              — ask the community —
            </p>
            <h3 className="mt-2 font-serif text-[22px] font-medium text-ink">
              what's on your mind?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted hover:bg-ivory-warm hover:text-ink"
            aria-label="close"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {!canPost && (
          <p className="mt-4 rounded-md border border-saffron/30 bg-saffron/5 px-3 py-2 text-[12.5px] text-ink">
            set up your profile first so replies know who's asking.
          </p>
        )}

        <div className="mt-5 space-y-5">
          <div>
            <label
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Category
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DISCUSSION_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setCategory(cat.slug)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
                    category === cat.slug
                      ? "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                  )}
                >
                  <span aria-hidden>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="disc-title"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Your question
            </label>
            <input
              id="disc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Does anyone have a great florist in Houston?"
              maxLength={200}
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15"
            />
          </div>

          <div>
            <label
              htmlFor="disc-body"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Add more detail <span className="normal-case">(optional)</span>
            </label>
            <textarea
              id="disc-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="budget, timeline, what you've tried so far…"
              rows={4}
              className="mt-2 w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13.5px] leading-[1.55] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15"
            />
          </div>

          <div>
            <label
              htmlFor="disc-city"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              City <span className="normal-case">(optional)</span>
            </label>
            <input
              id="disc-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="helpful for vendor recs"
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15"
            />
          </div>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors",
              anon
                ? "border-saffron/40 bg-saffron/5"
                : "border-border bg-white hover:border-saffron/30",
            )}
          >
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ivory-warm text-ink-muted">
              <VenetianMask size={13} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-ink">
                  post anonymously
                </span>
                <input
                  type="checkbox"
                  checked={anon}
                  onChange={(e) => setAnon(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-saffron"
                />
              </span>
              <span className="mt-1 block text-[12px] leading-[1.55] text-ink-muted">
                your name won't be shown — you'll appear as a random pseudonym.
                only you and admins can see it's you.
              </span>
            </span>
          </label>

          {error && (
            <p className="rounded-md border border-henna/30 bg-henna/5 px-3 py-2 text-[12.5px] text-ink">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-white px-4 py-2 text-[12.5px] font-medium text-ink-muted hover:border-saffron/40 hover:text-ink"
          >
            cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || !canPost}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            post
            <Send size={12} strokeWidth={1.8} />
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 8) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function shortCity(city?: string): string {
  if (!city) return "";
  return city.split(",")[0]?.trim() || city;
}

// Minimal markdown: **bold** and *italic* inline, line breaks preserved by
// whitespace-pre-line. Keeps v1 replies expressive without pulling a full MD
// renderer.
function renderLightMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={i++} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <em key={i++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// ── Mentor inline badge ────────────────────────────────────────────────────
// Small 💛 mentor pill rendered next to an author's name when that author
// has an active, unpaused mentor record. Renders nothing otherwise — so it
// can be dropped next to any author display without a conditional wrapper.

function MentorInlineBadge({ profileId }: { profileId: string }) {
  const isMentor = useMentoringStore((s) => {
    const m = s.mentors.find((r) => r.profile_id === profileId);
    return !!(m && m.is_active && !m.is_paused);
  });
  if (!isMentor) return null;
  return (
    <span
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-saffron/35 bg-saffron/10 px-1.5 py-[1px] font-mono text-[8.5px] uppercase tracking-[0.16em] text-saffron"
      style={{ fontFamily: "var(--font-mono)" }}
      aria-label="Mentor"
    >
      💛 mentor
    </span>
  );
}
