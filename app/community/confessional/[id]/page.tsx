"use client";

// ── /community/confessional/[id] ────────────────────────────────────────────
// Full anonymous story view. Vote bar (or "you-were-right/wrong" picker for
// was-i-wrong posts), save button, replies thread, share-another CTA, and
// an overflow menu with the report flow. Increments view_count once on
// mount.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { RealtimeProvider } from "@/app/community/_components/RealtimeProvider";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Flag,
  MoreHorizontal,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { cn } from "@/lib/utils";
import {
  CONFESSIONAL_CATEGORIES,
  CONFESSIONAL_LIMITS,
  CONFESSIONAL_REPORT_REASONS,
  type ConfessionalReportReason,
  type ConfessionalReportTarget,
} from "@/types/confessional";
import { useAuthStore } from "@/stores/auth-store";
import { useConfessionalStore } from "@/stores/confessional-store";
import {
  avatarToneFor,
  initialsFor,
} from "@/lib/community/confessional-names";
import { ConfessionalSubmissionModal } from "@/components/community/confessional/ConfessionalSubmissionModal";

const TIME_UNITS: { unit: string; ms: number }[] = [
  { unit: "y", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "mo", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "w", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "d", ms: 24 * 60 * 60 * 1000 },
  { unit: "h", ms: 60 * 60 * 1000 },
  { unit: "m", ms: 60 * 1000 },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60 * 1000) return "just now";
  for (const { unit, ms } of TIME_UNITS) {
    const value = Math.floor(diff / ms);
    if (value >= 1) return `${value}${unit} ago`;
  }
  return "just now";
}

export default function ConfessionalDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const ensureSeeded = useConfessionalStore((s) => s.ensureSeeded);
  const incrementView = useConfessionalStore((s) => s.incrementView);
  // Subscribe to the underlying array (stable reference until mutated) and
  // derive existence — the selector pattern `s => s.getPublicPost` returns
  // a function whose reference is stable and would skip re-renders.
  const exists = useConfessionalStore((s) =>
    s.posts.some(
      (p) => p.id === id && (p.status === "published" || p.status === "featured"),
    ),
  );

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  // One-time view increment per page mount.
  useEffect(() => {
    if (id && exists) incrementView(id);
    // Only fire once per navigation, not on every store update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id) return notFound();
  if (!exists) {
    return <NotFoundView />;
  }

  return (
    <>
      <RealtimeProvider />
      <ConfessionalDetail postId={id} />
    </>
  );
}

// ── Detail body ─────────────────────────────────────────────────────────────

function ConfessionalDetail({ postId }: { postId: string }) {
  const user = useAuthStore((s) => s.user);
  const openSignUp = useAuthStore((s) => s.openSignUp);

  // Subscribe to the raw arrays (stable references across renders unless
  // mutated) and derive everything in useMemo. Selectors that return
  // .filter(...) / .map(...) directly produce a new array each render and
  // trip React's "getSnapshot should be cached" warning.
  const allPosts = useConfessionalStore((s) => s.posts);
  const allReplies = useConfessionalStore((s) => s.replies);

  const post = useMemo(() => {
    const row = allPosts.find((p) => p.id === postId);
    if (!row) return undefined;
    if (row.status !== "published" && row.status !== "featured") return undefined;
    const { author_id: _omit, ...rest } = row;
    void _omit;
    return rest;
  }, [allPosts, postId]);

  const replies = useMemo(
    () =>
      allReplies
        .filter((r) => r.post_id === postId && r.status === "published")
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        )
        .map(({ author_id: _, ...rest }) => {
          void _;
          return rest;
        }),
    [allReplies, postId],
  );

  const hasVoted = useConfessionalStore((s) => s.hasVoted);
  const hasSaved = useConfessionalStore((s) => s.hasSaved);
  const toggleVote = useConfessionalStore((s) => s.toggleVote);
  const toggleSave = useConfessionalStore((s) => s.toggleSave);
  const submitReply = useConfessionalStore((s) => s.submitReply);

  const [replyBody, setReplyBody] = useState("");
  const [replyName, setReplyName] = useState("");
  const [reportOpen, setReportOpen] = useState<{
    target: ConfessionalReportTarget;
    targetId: string;
  } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  if (!post) return <NotFoundView />;

  const cat = CONFESSIONAL_CATEGORIES.find((c) => c.slug === post.category);
  const tone = avatarToneFor(post.id);
  const isWasIWrong = post.category === "was-i-wrong";
  const myVote = user ? hasVoted(post.id, user.id) : null;
  const isSaved = user ? hasSaved(post.id, user.id) : false;
  const totalVotes = post.vote_up_count + post.vote_down_count;
  const upPct =
    totalVotes > 0 ? Math.round((post.vote_up_count / totalVotes) * 100) : 0;

  const requireAuth = (): boolean => {
    if (user) return true;
    openSignUp("planning-tool");
    return false;
  };

  const handleVote = (voteType: "up" | "down") => {
    if (!requireAuth() || !user) return;
    toggleVote(post.id, user.id, voteType);
  };

  const handleSave = () => {
    if (!requireAuth() || !user) return;
    toggleSave(post.id, user.id);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !user) return;
    if (replyBody.trim().length < 4) return;
    submitReply({
      post_id: post.id,
      author_id: user.id,
      display_name: replyName.trim() || undefined,
      body: replyBody,
    });
    setReplyBody("");
    setReplyName("");
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/community?tab=the-confessional"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
          Back to The Confessional
        </Link>

        {/* ── Header ── */}
        <header className="mt-6 border-b border-gold/15 pb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-12 w-12 items-center justify-center rounded-full font-mono text-[12px] font-semibold uppercase"
                style={{
                  backgroundColor: tone.bg,
                  color: tone.fg,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {initialsFor(post.display_name)}
              </span>
              <div>
                <p className="font-serif text-[16px] italic text-ink">
                  {post.display_name}
                </p>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {timeAgo(post.created_at)} · {post.view_count.toLocaleString()} reads
                </p>
              </div>
            </div>
            <OverflowMenu
              onReport={() =>
                setReportOpen({ target: "post", targetId: post.id })
              }
            />
          </div>

          {cat && (
            <div className="mt-4">
              <span
                className="rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.12em]"
                style={{
                  backgroundColor: cat.tone.bg,
                  color: cat.tone.fg,
                  borderColor: cat.tone.border,
                }}
              >
                {cat.label}
              </span>
            </div>
          )}

          <h1 className="mt-4 font-serif text-[34px] font-semibold leading-[1.12] tracking-[-0.005em] text-ink">
            {post.title}
          </h1>
        </header>

        {/* ── Body ── */}
        <article className="prose prose-stone mt-8 max-w-none">
          {post.body.split(/\n\n+/).map((para, i) => (
            <p
              key={i}
              className="mb-5 font-serif text-[16px] leading-[1.75] text-ink"
            >
              {para}
            </p>
          ))}
        </article>

        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-gold/25 bg-ivory-warm/40 px-2.5 py-1 text-[11px] text-ink"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* ── Vote / save bar ── */}
        <div className="mt-10 rounded-2xl border border-gold/20 bg-ivory-warm/30 px-5 py-4">
          {isWasIWrong ? (
            <WasIWrongVoter
              upPct={upPct}
              totalVotes={totalVotes}
              upCount={post.vote_up_count}
              downCount={post.vote_down_count}
              myVote={myVote}
              onVote={handleVote}
            />
          ) : (
            <RegularVoter
              upCount={post.vote_up_count}
              downCount={post.vote_down_count}
              myVote={myVote}
              onVote={handleVote}
            />
          )}

          <div className="mt-4 flex items-center justify-between border-t border-gold/15 pt-3">
            <button
              type="button"
              onClick={handleSave}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors",
                isSaved
                  ? "border-saffron bg-saffron text-white"
                  : "border-ink/15 bg-white text-ink hover:border-saffron/50",
              )}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck size={13} strokeWidth={1.8} />
                  Saved · {post.save_count}
                </>
              ) : (
                <>
                  <Bookmark size={13} strokeWidth={1.8} />
                  Save · {post.save_count}
                </>
              )}
            </button>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </p>
          </div>
        </div>

        {/* ── Replies ── */}
        <section className="mt-10">
          <h2 className="font-serif text-[22px] font-semibold text-ink">
            Anonymous replies
          </h2>
          <p className="mt-1 text-[12.5px] italic text-ink-muted">
            no names here either — keep it kind, keep it real.
          </p>

          <form
            onSubmit={handleReplySubmit}
            className="mt-5 rounded-xl border border-gold/15 bg-white p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                placeholder="Alias (optional)"
                maxLength={48}
                className="rounded-md border border-ink/10 bg-ivory-warm/30 px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none sm:w-52"
              />
              <textarea
                value={replyBody}
                onChange={(e) =>
                  setReplyBody(
                    e.target.value.slice(0, CONFESSIONAL_LIMITS.REPLY_MAX),
                  )
                }
                placeholder="add to the story…"
                rows={3}
                className="flex-1 resize-y rounded-md border border-ink/10 bg-white px-3 py-2 text-[13.5px] leading-[1.6] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[10.5px] text-ink-faint">
                {CONFESSIONAL_LIMITS.REPLY_MAX - replyBody.length} characters left
              </p>
              <button
                type="submit"
                disabled={replyBody.trim().length < 4}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:opacity-40"
              >
                <Send size={12} strokeWidth={1.8} />
                Reply anonymously
              </button>
            </div>
          </form>

          <ul className="mt-6 space-y-4">
            {replies.length === 0 ? (
              <li className="rounded-lg border border-dashed border-gold/25 bg-ivory-warm/20 px-4 py-6 text-center text-[13px] italic text-ink-muted">
                no replies yet — be the first.
              </li>
            ) : (
              replies.map((reply) => {
                const rTone = avatarToneFor(reply.id);
                return (
                  <li
                    key={reply.id}
                    className="rounded-xl border border-gold/15 bg-white px-4 py-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          aria-hidden
                          className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-[10px] font-semibold uppercase"
                          style={{
                            backgroundColor: rTone.bg,
                            color: rTone.fg,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {initialsFor(reply.display_name)}
                        </span>
                        <div>
                          <p className="font-serif text-[13.5px] italic text-ink">
                            {reply.display_name}
                          </p>
                          <p
                            className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {timeAgo(reply.created_at)}
                          </p>
                        </div>
                      </div>
                      <OverflowMenu
                        small
                        onReport={() =>
                          setReportOpen({ target: "reply", targetId: reply.id })
                        }
                      />
                    </div>
                    <p className="mt-2.5 text-[14px] leading-[1.65] text-ink">
                      {reply.body}
                    </p>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        {/* ── Share another CTA ── */}
        <div className="mt-12 rounded-2xl border border-gold/20 bg-ivory-warm/40 px-7 py-7 text-center">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Got one of your own?
          </p>
          <h3 className="mt-2 font-serif text-[24px] font-semibold text-ink">
            Share another story.
          </h3>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-ink-soft"
          >
            Spill it
          </button>
        </div>
      </div>

      <ConfessionalSubmissionModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      {reportOpen && (
        <ReportModal
          target={reportOpen.target}
          targetId={reportOpen.targetId}
          onClose={() => setReportOpen(null)}
        />
      )}
    </div>
  );
}

// ── Voters ──────────────────────────────────────────────────────────────────

function RegularVoter({
  upCount,
  downCount,
  myVote,
  onVote,
}: {
  upCount: number;
  downCount: number;
  myVote: "up" | "down" | null;
  onVote: (v: "up" | "down") => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onVote("up")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors",
          myVote === "up"
            ? "border-sage bg-sage-pale text-ink"
            : "border-ink/15 bg-white text-ink-muted hover:border-sage hover:text-ink",
        )}
      >
        <ThumbsUp size={13} strokeWidth={1.8} />
        Up · {upCount}
      </button>
      <button
        type="button"
        onClick={() => onVote("down")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors",
          myVote === "down"
            ? "border-rose bg-rose-pale text-ink"
            : "border-ink/15 bg-white text-ink-muted hover:border-rose hover:text-ink",
        )}
      >
        <ThumbsDown size={13} strokeWidth={1.8} />
        Down · {downCount}
      </button>
    </div>
  );
}

function WasIWrongVoter({
  upPct,
  totalVotes,
  upCount,
  downCount,
  myVote,
  onVote,
}: {
  upPct: number;
  totalVotes: number;
  upCount: number;
  downCount: number;
  myVote: "up" | "down" | null;
  onVote: (v: "up" | "down") => void;
}) {
  return (
    <div>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        The jury
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => onVote("up")}
          className={cn(
            "flex-1 rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors",
            myVote === "up"
              ? "border-sage bg-sage-pale text-ink"
              : "border-ink/15 bg-white text-ink hover:border-sage",
          )}
        >
          You were right · {upCount}
        </button>
        <button
          type="button"
          onClick={() => onVote("down")}
          className={cn(
            "flex-1 rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors",
            myVote === "down"
              ? "border-rose bg-rose-pale text-ink"
              : "border-ink/15 bg-white text-ink hover:border-rose",
          )}
        >
          You were wrong · {downCount}
        </button>
      </div>
      {totalVotes > 0 && (
        <div className="mt-3">
          <div className="flex h-2 overflow-hidden rounded-full bg-ivory-deep">
            <div
              className="h-full"
              style={{ width: `${upPct}%`, backgroundColor: "#9CAF88" }}
            />
            <div
              className="h-full"
              style={{ width: `${100 - upPct}%`, backgroundColor: "#C97B63" }}
            />
          </div>
          <p
            className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {upPct}% right · {100 - upPct}% wrong · {totalVotes} votes
          </p>
        </div>
      )}
    </div>
  );
}

// ── Overflow menu (report) ─────────────────────────────────────────────────

function OverflowMenu({
  onReport,
  small = false,
}: {
  onReport: () => void;
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "rounded-full text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink",
          small ? "p-1" : "p-1.5",
        )}
        aria-label="More"
      >
        <MoreHorizontal size={small ? 14 : 16} strokeWidth={1.8} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-ink/10 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onReport();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-ink hover:bg-ivory-warm"
            >
              <Flag size={12} strokeWidth={1.8} />
              Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Report modal ────────────────────────────────────────────────────────────

function ReportModal({
  target,
  targetId,
  onClose,
}: {
  target: ConfessionalReportTarget;
  targetId: string;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const openSignUp = useAuthStore((s) => s.openSignUp);
  const reportContent = useConfessionalStore((s) => s.reportContent);
  const hasReported = useConfessionalStore((s) => s.hasReported);

  const [reason, setReason] = useState<ConfessionalReportReason>("identifying-info");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const already = user ? hasReported(target, targetId, user.id) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openSignUp("planning-tool");
      onClose();
      return;
    }
    reportContent(target, targetId, user.id, reason, details);
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-ink-muted hover:bg-ivory-warm"
          aria-label="Close"
        >
          <X size={18} strokeWidth={1.8} />
        </button>

        {submitted || already ? (
          <div className="py-2 text-center">
            <h3 className="font-serif text-[20px] font-semibold text-ink">
              {already ? "You've already reported this." : "Thanks for the heads-up."}
            </h3>
            <p className="mt-2 text-[13px] text-ink-muted">
              We review reports daily. Repeat reports auto-hide content for review.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full bg-ink px-5 py-2 text-[12px] font-medium text-ivory hover:bg-ink-soft"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Report this {target}
            </p>
            <h3 className="mt-2 font-serif text-[22px] font-semibold text-ink">
              What's wrong?
            </h3>

            <div className="mt-4 space-y-2">
              {CONFESSIONAL_REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] transition-colors",
                    reason === r.id
                      ? "border-ink bg-ivory-warm/50"
                      : "border-ink/10 hover:border-ink/30",
                  )}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="accent-ink"
                  />
                  {r.label}
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 500))}
              placeholder="Optional — anything else we should know?"
              rows={3}
              className="mt-3 w-full resize-y rounded-md border border-ink/15 px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-[12px] font-medium text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-ivory hover:bg-ink-soft"
              >
                Send report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Not found ──────────────────────────────────────────────────────────────

function NotFoundView() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The Confessional
        </p>
        <h1 className="mt-3 font-serif text-[28px] font-semibold text-ink">
          this story isn't here.
        </h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          It may still be in review, or it may have been removed.
        </p>
        <Link
          href="/community?tab=the-confessional"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-ivory hover:bg-ink-soft"
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
          Back to the feed
        </Link>
      </div>
    </div>
  );
}
