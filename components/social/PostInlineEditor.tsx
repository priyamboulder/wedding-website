"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Platform } from "@/lib/social/types";
import TagInput from "./TagInput";

export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  twitter: 280,
  instagram_post: 2200,
  instagram_reel: 2200,
  instagram_story: 2200,
  facebook: 63206,
  linkedin: 3000,
  pinterest: 500,
};

type Props = {
  platform: Platform;
  initialCaption: string;
  initialHashtags: string[];
  initialCta: string;
  onSave: (next: {
    caption: string;
    hashtags: string[];
    call_to_action: string;
  }) => Promise<void> | void;
  onCancel: () => void;
};

function countColor(count: number, limit: number): string {
  if (count > limit) return "text-rose-600";
  const ratio = count / limit;
  if (ratio > 0.9) return "text-rose-600";
  if (ratio >= 0.5) return "text-amber-600";
  return "text-emerald-600";
}

export default function PostInlineEditor({
  platform,
  initialCaption,
  initialHashtags,
  initialCta,
  onSave,
  onCancel,
}: Props) {
  const [caption, setCaption] = useState(initialCaption);
  const [hashtags, setHashtags] = useState<string[]>(initialHashtags);
  const [cta, setCta] = useState(initialCta);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const limit = PLATFORM_CHAR_LIMITS[platform] ?? 2200;

  const totalCount = useMemo(() => {
    const tagLine = hashtags.length
      ? "\n\n" + hashtags.map((h) => `#${h}`).join(" ")
      : "";
    const ctaLine = cta ? "\n\n" + cta : "";
    return caption.length + tagLine.length + ctaLine.length;
  }, [caption, hashtags, cta]);

  // Auto-resize textarea to content height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [caption]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        caption,
        hashtags,
        call_to_action: cta,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
            Caption
          </label>
          <span
            className={`font-mono text-[11px] ${countColor(totalCount, limit)}`}
            title={`${totalCount} / ${limit} characters`}
          >
            {totalCount} / {limit}
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={6}
          className="w-full resize-none overflow-hidden rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm leading-relaxed focus:border-neutral-500 focus:outline-none"
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

      <div className="flex items-center gap-2">
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
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
