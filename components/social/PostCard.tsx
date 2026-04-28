"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  GeneratedPost,
  Platform,
  SocialContentItem,
  Tone,
} from "@/lib/social/types";
import { PLATFORM_OPTIONS } from "./PlatformSelector";
import PostInlineEditor from "./PostInlineEditor";

type Props = {
  post: GeneratedPost;
  contentItem: SocialContentItem | null;
  selected: boolean;
  onToggleSelect: () => void;
  onUpdate: (updates: Partial<GeneratedPost>) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  onRegenerate: () => Promise<void> | void;
  isRegenerating: boolean;
};

const CAPTION_PREVIEW_LEN = 150;

function platformMeta(p: Platform) {
  return (
    PLATFORM_OPTIONS.find((o) => o.id === p) ?? {
      id: p,
      label: p,
      icon: "•",
    }
  );
}

function toneLabel(t: Tone) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  const diffMo = Math.round(diffDay / 30);
  if (diffMo < 12) return `${diffMo} month${diffMo === 1 ? "" : "s"} ago`;
  const diffYr = Math.round(diffMo / 12);
  return `${diffYr} year${diffYr === 1 ? "" : "s"} ago`;
}

function formatScheduled(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusStyles(status: GeneratedPost["status"]): string {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "scheduled":
      return "bg-sky-100 text-sky-800";
    case "published":
      return "bg-amber-100 text-amber-800";
    case "draft":
    default:
      return "bg-neutral-200 text-neutral-700";
  }
}

function formatCopyText(
  caption: string,
  hashtags: string[],
  cta: string,
): string {
  const tagLine = hashtags.length ? hashtags.map((h) => `#${h}`).join(" ") : "";
  return [caption, tagLine, cta].filter(Boolean).join("\n\n");
}

function toDatetimeLocalValue(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PostCard({
  post,
  contentItem,
  selected,
  onToggleSelect,
  onUpdate,
  onDelete,
  onRegenerate,
  isRegenerating,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [hashtagsExpanded, setHashtagsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleValue, setScheduleValue] = useState(() =>
    toDatetimeLocalValue(post.scheduled_for),
  );

  const meta = platformMeta(post.platform);
  const captionTooLong = post.caption.length > CAPTION_PREVIEW_LEN;
  const captionToShow = useMemo(() => {
    if (!captionTooLong || captionExpanded) return post.caption;
    return post.caption.slice(0, CAPTION_PREVIEW_LEN).trimEnd() + "…";
  }, [post.caption, captionTooLong, captionExpanded]);

  const visibleHashtags = hashtagsExpanded
    ? post.hashtags
    : post.hashtags.slice(0, 5);
  const extraHashtagCount = post.hashtags.length - visibleHashtags.length;

  const handleCopy = async () => {
    const text = formatCopyText(
      post.caption,
      post.hashtags,
      post.call_to_action,
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard unavailable
    }
  };

  const handleApproveToggle = async () => {
    const next = post.status === "approved" ? "draft" : "approved";
    await onUpdate({ status: next });
  };

  const handleMarkPublished = async () => {
    await onUpdate({ status: "published" });
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleValue) return;
    const iso = new Date(scheduleValue).toISOString();
    await onUpdate({ scheduled_for: iso, status: "scheduled" });
    setShowScheduler(false);
  };

  const handleDelete = async () => {
    await onDelete();
    setConfirmingDelete(false);
  };

  return (
    <article
      className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow ${
        selected
          ? "border-neutral-900 ring-1 ring-neutral-900"
          : "border-neutral-200"
      }`}
    >
      {/* Header */}
      <header className="flex items-start gap-3 border-b border-neutral-200 px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select post for ${meta.label}`}
          className="mt-0.5 h-4 w-4 cursor-pointer"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800">
              <span aria-hidden>{meta.icon}</span>
              {meta.label}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusStyles(
                post.status,
              )}`}
            >
              {post.status}
              {post.status === "scheduled" && post.scheduled_for
                ? ` · ${formatScheduled(post.scheduled_for)}`
                : ""}
            </span>
            <span className="text-[11px] text-neutral-500">
              Tone: {toneLabel(post.tone)}
            </span>
          </div>
          {contentItem && (
            <div className="mt-1 truncate text-xs text-neutral-500">
              From:{" "}
              <Link
                href={`/vendor/social?highlight=${contentItem.id}`}
                className="text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
              >
                {contentItem.title}
              </Link>
            </div>
          )}
        </div>
        <span className="whitespace-nowrap text-[11px] text-neutral-500">
          {relativeTime(post.created_at)}
        </span>
      </header>

      {/* Body */}
      <div className="space-y-3 px-4 py-4">
        {editing ? (
          <PostInlineEditor
            platform={post.platform}
            initialCaption={post.caption}
            initialHashtags={post.hashtags}
            initialCta={post.call_to_action}
            onSave={async (next) => {
              await onUpdate(next);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-800">
              {captionToShow}
            </p>
            {captionTooLong && (
              <button
                type="button"
                onClick={() => setCaptionExpanded((v) => !v)}
                className="text-xs font-medium text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
              >
                {captionExpanded ? "Show less" : "Show more"}
              </button>
            )}

            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-neutral-100 pt-3">
                {visibleHashtags.map((h) => (
                  <span
                    key={h}
                    className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-800"
                  >
                    #{h}
                  </span>
                ))}
                {extraHashtagCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setHashtagsExpanded(true)}
                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                  >
                    +{extraHashtagCount} more
                  </button>
                )}
              </div>
            )}

            {post.call_to_action && (
              <p className="border-t border-neutral-100 pt-3 pl-3 text-sm italic text-neutral-700">
                → {post.call_to_action}
              </p>
            )}
          </>
        )}
      </div>

      {/* Scheduler panel */}
      {showScheduler && !editing && (
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 bg-sky-50/50 px-4 py-2.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
            Schedule for
          </label>
          <input
            type="datetime-local"
            value={scheduleValue}
            onChange={(e) => setScheduleValue(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs focus:border-neutral-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleScheduleSubmit}
            disabled={!scheduleValue}
            className="rounded-md bg-sky-600 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-700 disabled:bg-sky-300"
          >
            Set Schedule
          </button>
          <button
            type="button"
            onClick={() => setShowScheduler(false)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:border-neutral-500"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmingDelete && !editing && (
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 bg-rose-50/60 px-4 py-2.5">
          <p className="text-xs text-rose-900">
            Are you sure? This cannot be undone.
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:border-neutral-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer actions */}
      {!editing && (
        <footer className="flex flex-wrap items-center gap-2 border-t border-neutral-200 bg-neutral-50 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:border-neutral-500"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:border-neutral-500"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            onClick={handleApproveToggle}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              post.status === "approved"
                ? "border border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {post.status === "approved" ? "Unapprove" : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => setShowScheduler((v) => !v)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:border-neutral-500"
          >
            Schedule
          </button>
          <button
            type="button"
            onClick={handleMarkPublished}
            disabled={post.status === "published"}
            className="rounded-md border border-amber-500 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {post.status === "published" ? "Published" : "Mark Published"}
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRegenerating ? "Regenerating…" : "Regenerate"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="ml-auto rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:border-rose-500 hover:bg-rose-50"
          >
            Delete
          </button>
        </footer>
      )}
    </article>
  );
}
