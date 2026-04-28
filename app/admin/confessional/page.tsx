"use client";

// ── /admin/confessional ─────────────────────────────────────────────────────
// Moderation queue for The Confessional. Three sections:
//   1. Pending posts — awaiting initial approval
//   2. Reported posts — published posts with reports
//   3. Reported replies — replies with reports
// Admin sees the raw rows including author_id (the only place it's exposed).

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  EyeOff,
  Flag,
  Sparkles,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  CONFESSIONAL_CATEGORIES,
  type ConfessionalPost,
  type ConfessionalReply,
  type ConfessionalStatus,
} from "@/types/confessional";
import { useConfessionalStore } from "@/stores/confessional-store";
import { cn } from "@/lib/utils";

type TabId = "pending" | "reported-posts" | "reported-replies";

const DISPLAY = "'Playfair Display', Georgia, serif";

export default function AdminConfessionalPage() {
  const ensureSeeded = useConfessionalStore((s) => s.ensureSeeded);
  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  const [tab, setTab] = useState<TabId>("pending");

  const adminListPosts = useConfessionalStore((s) => s.adminListPosts);
  const reportedPosts = useConfessionalStore((s) => s.adminListReportedPosts)();
  const reportedReplies = useConfessionalStore((s) => s.adminListReportedReplies)();
  const posts = useConfessionalStore((s) => s.posts);
  const replies = useConfessionalStore((s) => s.replies);

  const pendingPosts = adminListPosts("pending");

  const TABS: { id: TabId; label: string; count: number }[] = [
    { id: "pending", label: "Pending", count: pendingPosts.length },
    {
      id: "reported-posts",
      label: "Reported Posts",
      count: reportedPosts.length,
    },
    {
      id: "reported-replies",
      label: "Reported Replies",
      count: reportedReplies.length,
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#B8755D]">
          Moderation
        </p>
        <h1
          className="mt-2 text-[#1C1917]"
          style={{ fontFamily: DISPLAY, fontSize: 36, letterSpacing: "-0.015em" }}
        >
          The Confessional
        </h1>
        <p className="mt-2 max-w-[640px] text-[14px] leading-[1.65] text-[#6B6157]">
          Approve pending stories, review reports, and feature the best ones.
          Author IDs are visible to you only.
        </p>
      </header>

      {/* ── Tab nav ── */}
      <nav className="mt-8 flex items-center gap-1 border-b border-[#E6DFD3]">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 py-3 text-[12.5px] font-medium transition-colors",
                active ? "text-[#1C1917]" : "text-[#8B7E6F] hover:text-[#1C1917]",
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10.5px] font-medium",
                    active
                      ? "bg-[#1C1917] text-white"
                      : "bg-[#F0E9DC] text-[#1C1917]",
                  )}
                >
                  {t.count}
                </span>
              )}
              {active && (
                <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[#1C1917]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Tab content ── */}
      <div className="mt-8">
        {tab === "pending" && <PendingPostsList posts={pendingPosts} />}
        {tab === "reported-posts" && (
          <ReportedPostsList posts={reportedPosts} />
        )}
        {tab === "reported-replies" && (
          <ReportedRepliesList
            replies={reportedReplies}
            posts={posts}
          />
        )}
      </div>
    </div>
  );
}

// ── Pending posts ──────────────────────────────────────────────────────────

function PendingPostsList({ posts }: { posts: ConfessionalPost[] }) {
  const updateStatus = useConfessionalStore((s) => s.adminUpdatePostStatus);
  const toggleFeatured = useConfessionalStore((s) => s.adminToggleFeatured);

  if (posts.length === 0) {
    return <EmptyState label="Inbox zero — no pending stories." />;
  }
  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li
          key={post.id}
          className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-sm"
        >
          <PostRow post={post} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ActionButton
              icon={CheckCircle2}
              label="Approve"
              tone="primary"
              onClick={() => updateStatus(post.id, "published")}
            />
            <ActionButton
              icon={Sparkles}
              label="Approve & Feature"
              tone="accent"
              onClick={() => {
                updateStatus(post.id, "published");
                toggleFeatured(post.id);
              }}
            />
            <ActionButton
              icon={XCircle}
              label="Reject"
              tone="danger"
              onClick={() => updateStatus(post.id, "rejected")}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Reported posts ─────────────────────────────────────────────────────────

function ReportedPostsList({ posts }: { posts: ConfessionalPost[] }) {
  const updateStatus = useConfessionalStore((s) => s.adminUpdatePostStatus);
  const toggleFeatured = useConfessionalStore((s) => s.adminToggleFeatured);

  if (posts.length === 0) {
    return <EmptyState label="No reported posts. The community's behaving." />;
  }
  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li
          key={post.id}
          className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-sm"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F0E9DC] px-3 py-1 text-[11px] font-medium text-[#B8755D]">
            <Flag size={11} strokeWidth={1.8} />
            {post.report_count} {post.report_count === 1 ? "report" : "reports"}
          </div>
          <PostRow post={post} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ActionButton
              icon={CheckCircle2}
              label={post.status === "pending" ? "Restore (publish)" : "Keep published"}
              tone="primary"
              onClick={() => updateStatus(post.id, "published")}
            />
            <ActionButton
              icon={Star}
              label={post.is_featured ? "Unfeature" : "Feature"}
              tone="accent"
              onClick={() => toggleFeatured(post.id)}
            />
            <ActionButton
              icon={EyeOff}
              label="Hide (set pending)"
              tone="muted"
              onClick={() => updateStatus(post.id, "pending")}
            />
            <ActionButton
              icon={XCircle}
              label="Reject"
              tone="danger"
              onClick={() => updateStatus(post.id, "rejected")}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Reported replies ────────────────────────────────────────────────────────

function ReportedRepliesList({
  replies,
  posts,
}: {
  replies: ConfessionalReply[];
  posts: ConfessionalPost[];
}) {
  const removeReply = useConfessionalStore((s) => s.adminRemoveReply);
  if (replies.length === 0) {
    return <EmptyState label="No reported replies right now." />;
  }
  return (
    <ul className="space-y-4">
      {replies.map((reply) => {
        const parent = posts.find((p) => p.id === reply.post_id);
        return (
          <li
            key={reply.id}
            className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#F0E9DC] px-3 py-1 text-[11px] font-medium text-[#B8755D]">
                <Flag size={11} strokeWidth={1.8} />
                {reply.report_count} {reply.report_count === 1 ? "report" : "reports"}
              </span>
              {reply.status === "removed" && (
                <span className="rounded-full bg-[#E2DACA] px-3 py-1 text-[11px] font-medium text-[#5C4F3E]">
                  Removed
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#8B7E6F]">
              Reply on:{" "}
              <span className="text-[#1C1917]">
                {parent?.title ?? "(unknown post)"}
              </span>
            </p>
            <p className="mt-3 rounded-md bg-[#FBF9F4] p-3 text-[13.5px] leading-[1.65] text-[#1C1917]">
              {reply.body}
            </p>
            <p className="mt-2 font-mono text-[10.5px] text-[#8B7E6F]" style={{ fontFamily: "var(--font-mono)" }}>
              author_id: {reply.author_id} · alias: {reply.display_name}
            </p>
            {reply.status === "published" && (
              <div className="mt-3">
                <ActionButton
                  icon={Trash2}
                  label="Remove reply"
                  tone="danger"
                  onClick={() => removeReply(reply.id)}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ── Shared bits ─────────────────────────────────────────────────────────────

function PostRow({ post }: { post: ConfessionalPost }) {
  const cat = CONFESSIONAL_CATEGORIES.find((c) => c.slug === post.category);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {cat && (
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.12em]"
            style={{
              backgroundColor: cat.tone.bg,
              color: cat.tone.fg,
              borderColor: cat.tone.border,
            }}
          >
            {cat.shortLabel}
          </span>
        )}
        <StatusBadge status={post.status} />
        {post.is_featured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F0E9DC] px-2.5 py-0.5 text-[10.5px] font-medium text-[#B8755D]">
            <Star size={10} strokeWidth={1.8} />
            Featured
          </span>
        )}
      </div>
      <h3
        className="mt-2 text-[#1C1917]"
        style={{
          fontFamily: DISPLAY,
          fontSize: 22,
          letterSpacing: "-0.005em",
          lineHeight: 1.2,
        }}
      >
        {post.title}
      </h3>
      <p className="mt-1 text-[12px] italic text-[#8B7E6F]">
        — {post.display_name}
      </p>
      <p className="mt-3 text-[13.5px] leading-[1.65] text-[#1C1917]">
        {post.body.length > 480 ? `${post.body.slice(0, 480).trim()}…` : post.body}
      </p>
      <p
        className="mt-3 font-mono text-[10.5px] text-[#8B7E6F]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        author_id: {post.author_id} · saves {post.save_count} · ↑{post.vote_up_count} ↓{post.vote_down_count} · views {post.view_count} · {new Date(post.created_at).toLocaleString()}
      </p>
      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-[#E6DFD3] bg-[#FBF9F4] px-2 py-0.5 text-[10.5px] text-[#6B6157]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ConfessionalStatus }) {
  const map: Record<ConfessionalStatus, { label: string; bg: string; fg: string }> = {
    pending: { label: "Pending", bg: "#FBE9D6", fg: "#8B6508" },
    published: { label: "Published", bg: "#E8F0E0", fg: "#5E7548" },
    featured: { label: "Featured", bg: "#F0E9DC", fg: "#B8755D" },
    rejected: { label: "Rejected", bg: "#E2DACA", fg: "#5C4F3E" },
  };
  const tone = map[status];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.12em]"
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      {tone.label}
    </span>
  );
}

function ActionButton({
  icon: Icon,
  label,
  tone,
  onClick,
}: {
  icon: typeof CheckCircle2;
  label: string;
  tone: "primary" | "accent" | "muted" | "danger";
  onClick: () => void;
}) {
  const styles: Record<typeof tone, string> = {
    primary:
      "bg-[#1C1917] text-white hover:bg-[#2E2E2E]",
    accent:
      "bg-[#B8755D] text-white hover:bg-[#A0664F]",
    muted:
      "border border-[#E6DFD3] bg-white text-[#1C1917] hover:border-[#B8755D]",
    danger:
      "border border-[#C97B63] bg-white text-[#C97B63] hover:bg-[#F5E0D6]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors",
        styles[tone],
      )}
    >
      <Icon size={12} strokeWidth={1.9} />
      {label}
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E6DFD3] bg-white px-6 py-16 text-center">
      <p
        className="text-[#1C1917]"
        style={{ fontFamily: DISPLAY, fontSize: 22, fontStyle: "italic" }}
      >
        {label}
      </p>
    </div>
  );
}
