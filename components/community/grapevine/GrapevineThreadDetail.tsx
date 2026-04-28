"use client";

// ── Thread detail view ──────────────────────────────────────────────────────
// Full thread + flat reply list + reply form. The bride's pseudonym for
// this thread is shown in the reply form so she knows what name will
// attach. Vendor tags appear as a neutral pill that filters back into the
// Grapevine — never as a link to the vendor's storefront.

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ThumbsUp } from "lucide-react";
import { useGrapevineStore } from "@/stores/grapevine-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { getGrapevineTopic, relativeTime } from "@/lib/community/grapevine";
import { GrapevinePseudonym } from "./GrapevinePseudonym";
import { GrapevineHelpfulButton } from "./GrapevineHelpfulButton";
import { GrapevineReportButton } from "./GrapevineReportButton";
import { GrapevineReplyCard } from "./GrapevineReply";
import { GrapevineReplyForm } from "./GrapevineReplyForm";

export function GrapevineThreadDetail({ threadId }: { threadId: string }) {
  const ensureSeeded = useGrapevineStore((s) => s.ensureSeeded);
  const incrementViews = useGrapevineStore((s) => s.incrementViews);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  // Bump the view counter once per mount. The store is the source of truth
  // so navigating between threads gives each its own bump.
  useEffect(() => {
    incrementViews(threadId);
  }, [incrementViews, threadId]);

  const thread = useGrapevineStore((s) =>
    s.threads.find((t) => t.id === threadId),
  );
  const repliesAll = useGrapevineStore((s) => s.replies);
  const replies = useMemo(
    () =>
      repliesAll
        .filter((r) => r.thread_id === threadId && r.status === "active")
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        ),
    [repliesAll, threadId],
  );

  if (!thread || thread.status === "removed") {
    return (
      <div className="px-6 py-20 text-center md:px-10">
        <p className="font-serif text-[22px] italic text-ink">
          this thread can't be found.
        </p>
        <p className="mt-2 text-[13px] text-ink-muted">
          it may have been removed by moderators or the author.
        </p>
        <Link
          href="/community?tab=the-grapevine"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          back to the grapevine
        </Link>
      </div>
    );
  }

  const topic = getGrapevineTopic(thread.topic_category);
  const heldForReview =
    thread.status === "auto_flagged" || thread.status === "under_review";

  return (
    <div className="px-6 pb-20 pt-8 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/community?tab=the-grapevine"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
          back to the grapevine
        </Link>

        {heldForReview && (
          <p className="mt-5 rounded-md border border-saffron/40 bg-saffron/8 px-4 py-3 text-[12.5px] text-ink">
            this thread is currently under moderation review and only visible to
            you. it'll publish once a moderator approves it.
          </p>
        )}

        <article className="mt-5 rounded-2xl border border-gold/15 bg-white p-6">
          <div className="flex flex-wrap items-center gap-2">
            {topic && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-ivory-warm/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <span aria-hidden>{topic.icon}</span>
                {topic.display_name}
              </span>
            )}
            {thread.tagged_vendor_id && thread.tagged_vendor_name && (
              <Link
                href={`/community?tab=the-grapevine&vendor=${thread.tagged_vendor_id}`}
                className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-white px-2.5 py-1 text-[11px] font-medium text-ink hover:bg-ivory-warm/60"
              >
                <span className="font-serif italic text-ink-muted">
                  tagged:
                </span>
                {thread.tagged_vendor_name}
              </Link>
            )}
          </div>

          <h1 className="mt-3 font-serif text-[28px] font-medium leading-snug text-ink">
            {thread.title}
          </h1>

          <p className="mt-4 whitespace-pre-line text-[14.5px] leading-[1.75] text-ink">
            {thread.body}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gold/10 pt-4 text-[11.5px] text-ink-faint">
            <GrapevinePseudonym
              authorId={thread.author_id}
              threadId={thread.id}
              currentUserId={myProfileId ?? undefined}
              isOP
              size={26}
            />
            <span>· posted {relativeTime(thread.created_at)}</span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={11} strokeWidth={1.8} />
              {thread.reply_count}{" "}
              {thread.reply_count === 1 ? "reply" : "replies"}
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp size={11} strokeWidth={1.8} />
              {thread.helpful_count} helpful
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <GrapevineHelpfulButton
              target="thread"
              targetId={thread.id}
              count={thread.helpful_count}
              size="md"
            />
            <GrapevineReportButton target="thread" targetId={thread.id} />
          </div>
        </article>

        <div className="mb-4 mt-10 flex items-baseline gap-3">
          <h3
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — {replies.length} {replies.length === 1 ? "reply" : "replies"} —
          </h3>
        </div>

        <div className="space-y-3">
          {replies.map((r) => (
            <GrapevineReplyCard
              key={r.id}
              reply={r}
              thread={thread}
              currentUserId={myProfileId ?? undefined}
            />
          ))}
          {replies.length === 0 && (
            <p className="rounded-xl border border-dashed border-gold/20 bg-ivory-warm/30 px-5 py-8 text-center text-[13px] text-ink-muted">
              no replies yet — be the first to chime in.
            </p>
          )}
        </div>

        <div className="mt-6">
          <GrapevineReplyForm threadId={thread.id} />
        </div>
      </div>
    </div>
  );
}
