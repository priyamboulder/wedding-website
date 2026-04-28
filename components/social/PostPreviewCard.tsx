"use client";

import { useMemo, useState } from "react";
import type { GeneratedPost, Platform } from "@/lib/social/types";
import TagInput from "./TagInput";
import { PLATFORM_OPTIONS } from "./PlatformSelector";

type Props = {
  post: GeneratedPost;
  onSave: (updates: Partial<GeneratedPost>) => Promise<void> | void;
  onApprove: () => Promise<void> | void;
  onRegenerate: () => Promise<void> | void;
  isRegenerating: boolean;
};

const CHAR_LIMITS: Record<Platform, number> = {
  twitter: 280,
  instagram_post: 2200,
  instagram_reel: 2200,
  instagram_story: 2200,
  facebook: 63206,
  linkedin: 3000,
  pinterest: 500,
};

function platformMeta(p: Platform) {
  const opt = PLATFORM_OPTIONS.find((o) => o.id === p);
  return opt ?? { id: p, label: p, icon: "•" };
}

function formatForCopy(
  caption: string,
  hashtags: string[],
  cta: string,
): string {
  const tagLine = hashtags.length ? hashtags.map((h) => `#${h}`).join(" ") : "";
  return [caption, tagLine, cta].filter(Boolean).join("\n\n");
}

function countColor(count: number, limit: number): string {
  const ratio = count / limit;
  if (count > limit) return "text-rose-600";
  if (ratio > 0.85) return "text-amber-600";
  return "text-emerald-600";
}

export default function PostPreviewCard({
  post,
  onSave,
  onApprove,
  onRegenerate,
  isRegenerating,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags);
  const [cta, setCta] = useState(post.call_to_action);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  const meta = platformMeta(post.platform);
  const limit = CHAR_LIMITS[post.platform] ?? 2200;

  const charCount = useMemo(() => {
    const tagLine = post.hashtags.length
      ? "\n\n" + post.hashtags.map((h) => `#${h}`).join(" ")
      : "";
    const ctaLine = post.call_to_action ? "\n\n" + post.call_to_action : "";
    return post.caption.length + tagLine.length + ctaLine.length;
  }, [post]);

  const handleCopy = async () => {
    const text = formatForCopy(post.caption, post.hashtags, post.call_to_action);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard may be unavailable
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ caption, hashtags, call_to_action: cta });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCaption(post.caption);
    setHashtags(post.hashtags);
    setCta(post.call_to_action);
    setEditing(false);
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove();
    } finally {
      setApproving(false);
    }
  };

  const isApproved = post.status === "approved";

  return (
    <article className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-lg">
            {meta.icon}
          </span>
          <h3 className="text-sm font-semibold text-neutral-900">{meta.label}</h3>
          {isApproved && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-800">
              Approved
            </span>
          )}
        </div>
        <span
          className={`text-xs font-mono ${countColor(charCount, limit)}`}
          title={`${charCount} / ${limit} characters`}
        >
          {charCount} / {limit}
        </span>
      </header>

      <div className="space-y-3 px-4 py-4">
        {editing ? (
          <>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={8}
                className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                Hashtags
              </label>
              <TagInput
                value={hashtags}
                onChange={setHashtags}
                prefix="#"
                placeholder="Add hashtag and press Enter"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                Call to action
              </label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
              />
            </div>
          </>
        ) : (
          <>
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-800">
              {post.caption}
            </p>
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-neutral-100 pt-3">
                {post.hashtags.map((h) => (
                  <span
                    key={h}
                    className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-800"
                  >
                    #{h}
                  </span>
                ))}
              </div>
            )}
            {post.call_to_action && (
              <p className="border-t border-neutral-100 pt-3 text-sm italic text-neutral-700">
                → {post.call_to_action}
              </p>
            )}
          </>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-neutral-200 bg-neutral-50 px-4 py-2.5">
        {editing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:bg-neutral-400"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-500"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:border-neutral-500"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:border-neutral-500"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRegenerating ? "Regenerating…" : "Regenerate"}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving || isApproved}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isApproved
                    ? "cursor-default bg-emerald-100 text-emerald-800"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                }`}
              >
                {isApproved ? "Approved" : approving ? "Approving…" : "Approve"}
              </button>
              <span className="text-[11px] text-neutral-500">Saved as draft</span>
            </div>
          </>
        )}
      </footer>
    </article>
  );
}
