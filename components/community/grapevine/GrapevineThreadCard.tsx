"use client";

// ── Thread card ─────────────────────────────────────────────────────────────
// Single preview card in the feed. Anonymous pseudonym + topic pill + title
// + body preview + optional vendor pill + meta row (replies / helpful /
// time ago). Clicking navigates to the dedicated thread detail route so
// the URL is shareable.

import Link from "next/link";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GrapevineThread } from "@/types/grapevine";
import { getGrapevineTopic, relativeTime } from "@/lib/community/grapevine";
import { GrapevinePseudonym } from "./GrapevinePseudonym";

const PREVIEW_CHARS = 180;

export function GrapevineThreadCard({
  thread,
  currentUserId,
  highlight,
}: {
  thread: GrapevineThread;
  currentUserId?: string;
  highlight?: boolean;
}) {
  const topic = getGrapevineTopic(thread.topic_category);
  const preview =
    thread.body.length > PREVIEW_CHARS
      ? `${thread.body.slice(0, PREVIEW_CHARS).trimEnd()}…`
      : thread.body;

  return (
    <Link
      href={`/community/grapevine/${thread.id}`}
      className={cn(
        "group block rounded-2xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(28,25,23,0.07)]",
        highlight
          ? "border-saffron/40 bg-saffron/5"
          : "border-gold/15 hover:border-gold/40",
      )}
    >
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
        {thread.tagged_vendor_name && (
          <span className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-white px-2.5 py-1 text-[11px] font-medium text-ink">
            <span className="font-serif italic text-ink-muted">tagged:</span>
            {thread.tagged_vendor_name}
          </span>
        )}
      </div>

      <h3 className="mt-3 font-serif text-[20px] font-medium leading-snug text-ink group-hover:text-ink">
        {thread.title}
      </h3>

      <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-[1.6] text-ink-muted">
        {preview}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-ink-faint">
        <GrapevinePseudonym
          authorId={thread.author_id}
          threadId={thread.id}
          currentUserId={currentUserId}
          isOP
          size={22}
        />
        <span>· {relativeTime(thread.created_at)}</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare size={12} strokeWidth={1.8} />
          {thread.reply_count}{" "}
          {thread.reply_count === 1 ? "reply" : "replies"}
        </span>
        <span className="inline-flex items-center gap-1">
          <ThumbsUp size={12} strokeWidth={1.8} />
          {thread.helpful_count} helpful
        </span>
      </div>
    </Link>
  );
}
