"use client";

// ── Confessional story card ─────────────────────────────────────────────────
// Editorial column layout: anonymous avatar + display name, category badge,
// title, body preview, and a footer with the social counters. Tapping the
// card routes to the detail page. Was-I-Wrong posts get a percentage bar
// instead of plain vote counts.

import Link from "next/link";
import { Bookmark, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  CONFESSIONAL_CATEGORIES,
  type ConfessionalPostPublic,
} from "@/types/confessional";
import { useConfessionalStore } from "@/stores/confessional-store";
import { avatarToneFor, initialsFor } from "@/lib/community/confessional-names";

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

export function ConfessionalStoryCard({
  post,
}: {
  post: ConfessionalPostPublic;
}) {
  const cat = CONFESSIONAL_CATEGORIES.find((c) => c.slug === post.category);
  const tone = avatarToneFor(post.id);
  const initials = initialsFor(post.display_name);

  // Reply count + the was-I-wrong split.
  const replyCount = useConfessionalStore(
    (s) =>
      s.replies.filter(
        (r) => r.post_id === post.id && r.status === "published",
      ).length,
  );

  const isWasIWrong = post.category === "was-i-wrong";
  const totalVotes = post.vote_up_count + post.vote_down_count;
  const upPct = totalVotes > 0
    ? Math.round((post.vote_up_count / totalVotes) * 100)
    : 0;

  const preview =
    post.body.length > 220 ? `${post.body.slice(0, 220).trim()}…` : post.body;

  return (
    <Link
      href={`/community/confessional/${post.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold/15 bg-white px-6 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-saffron/40 hover:shadow-[0_14px_40px_rgba(28,25,23,0.08)]"
    >
      {/* ── Author + category ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.05em]"
            style={{
              backgroundColor: tone.bg,
              color: tone.fg,
              fontFamily: "var(--font-mono)",
            }}
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-serif text-[14px] italic text-ink">
              {post.display_name}
            </p>
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {timeAgo(post.created_at)}
            </p>
          </div>
        </div>
        {cat && (
          <span
            className="shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]"
            style={{
              backgroundColor: cat.tone.bg,
              color: cat.tone.fg,
              borderColor: cat.tone.border,
            }}
          >
            {cat.shortLabel}
          </span>
        )}
      </div>

      {/* ── Title + body ── */}
      <h3 className="mt-3 font-serif text-[19px] font-semibold leading-[1.22] tracking-[-0.005em] text-ink group-hover:text-saffron">
        {post.title}
      </h3>
      <p className="mt-2.5 line-clamp-4 text-[13.5px] leading-[1.65] text-ink-muted">
        {preview}
      </p>

      {/* ── Was-I-Wrong split bar ── */}
      {isWasIWrong && totalVotes > 0 && (
        <div className="mt-4 rounded-md border border-gold/15 bg-ivory-warm/30 px-3 py-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="text-sage-light" style={{ color: "#5E7548" }}>
              You were right · {upPct}%
            </span>
            <span style={{ color: "#A85C45" }}>
              You were wrong · {100 - upPct}%
            </span>
          </div>
          <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-ivory-deep">
            <div
              className="h-full"
              style={{ width: `${upPct}%`, backgroundColor: "#9CAF88" }}
            />
            <div
              className="h-full"
              style={{ width: `${100 - upPct}%`, backgroundColor: "#C97B63" }}
            />
          </div>
          <p className="mt-1.5 text-[10.5px] text-ink-faint">
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </p>
        </div>
      )}

      {/* ── Footer counters ── */}
      <div className="mt-auto flex items-center justify-between border-t border-gold/10 pt-3 text-[11px] text-ink-muted">
        <span className="inline-flex items-center gap-3">
          <CounterBadge icon={Bookmark} value={post.save_count} />
          {!isWasIWrong && (
            <>
              <CounterBadge icon={ThumbsUp} value={post.vote_up_count} />
              <CounterBadge icon={ThumbsDown} value={post.vote_down_count} />
            </>
          )}
          <CounterBadge icon={MessageCircle} value={replyCount} />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint group-hover:text-saffron" style={{ fontFamily: "var(--font-mono)" }}>
          read on →
        </span>
      </div>
    </Link>
  );
}

function CounterBadge({
  icon: Icon,
  value,
}: {
  icon: typeof Bookmark;
  value: number;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon size={12} strokeWidth={1.7} />
      <span className="tabular-nums">{value}</span>
    </span>
  );
}
