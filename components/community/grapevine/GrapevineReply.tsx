"use client";

// ── Single reply ────────────────────────────────────────────────────────────
// Pseudonym header (with OP / "this is you") + body + helpful + report.

import type { GrapevineReply, GrapevineThread } from "@/types/grapevine";
import { relativeTime } from "@/lib/community/grapevine";
import { GrapevinePseudonym } from "./GrapevinePseudonym";
import { GrapevineHelpfulButton } from "./GrapevineHelpfulButton";
import { GrapevineReportButton } from "./GrapevineReportButton";

export function GrapevineReplyCard({
  reply,
  thread,
  currentUserId,
}: {
  reply: GrapevineReply;
  thread: GrapevineThread;
  currentUserId?: string;
}) {
  const isOP = reply.author_id === thread.author_id;
  return (
    <article className="rounded-xl border border-gold/15 bg-white p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <GrapevinePseudonym
          authorId={reply.author_id}
          threadId={thread.id}
          currentUserId={currentUserId}
          isOP={isOP}
          size={24}
        />
        <span className="text-[11px] text-ink-faint">
          · {relativeTime(reply.created_at)}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-line text-[13.5px] leading-[1.7] text-ink">
        {reply.body}
      </p>
      <div className="mt-3.5 flex items-center gap-2">
        <GrapevineHelpfulButton
          target="reply"
          targetId={reply.id}
          count={reply.helpful_count}
        />
        <GrapevineReportButton target="reply" targetId={reply.id} />
      </div>
    </article>
  );
}
