"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSocialData } from "@/lib/social/SocialDataContext";
import type { ContentType, SocialContentItem } from "@/lib/social/types";

type Props = {
  item: SocialContentItem;
  onEdit: (item: SocialContentItem) => void;
};

const TYPE_LABELS: Record<ContentType, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  behind_the_scenes: "BTS",
  testimonial: "Testimonial",
  portfolio_highlight: "Portfolio",
  tip_or_advice: "Tip",
  promotion: "Promotion",
  announcement: "Announcement",
  festival_or_seasonal: "Seasonal",
};

const TYPE_COLORS: Record<ContentType, string> = {
  wedding: "bg-rose-100 text-rose-800",
  engagement: "bg-pink-100 text-pink-800",
  behind_the_scenes: "bg-neutral-100 text-neutral-800",
  testimonial: "bg-emerald-100 text-emerald-800",
  portfolio_highlight: "bg-violet-100 text-violet-800",
  tip_or_advice: "bg-sky-100 text-sky-800",
  promotion: "bg-amber-100 text-amber-800",
  announcement: "bg-indigo-100 text-indigo-800",
  festival_or_seasonal: "bg-orange-100 text-orange-800",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + "…";
}

export default function ContentCard({ item, onEdit }: Props) {
  const router = useRouter();
  const { generatedPosts, deleteContentItem } = useSocialData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const postCount = generatedPosts.filter((p) => p.content_item_id === item.id).length;
  const thumb = item.media_urls[0];

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteContentItem(item.id);
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${TYPE_COLORS[item.content_type]}`}
        >
          {TYPE_LABELS[item.content_type]}
        </span>
        {item.media_urls.length > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
            +{item.media_urls.length - 1}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
        {item.description && (
          <p className="mt-1 text-xs text-neutral-600">{truncate(item.description, 100)}</p>
        )}

        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-700"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 4 && (
              <span className="text-[10px] text-neutral-500">+{item.tags.length - 4}</span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
          <span>
            {postCount} {postCount === 1 ? "post" : "posts"} generated
          </span>
          <span>{relativeTime(item.created_at)}</span>
        </div>

        <div className="mt-4 flex gap-2 border-t border-neutral-100 pt-3">
          <button
            type="button"
            onClick={() => router.push(`/vendor/social/generate?content=${item.id}`)}
            className="flex-1 rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Generate
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-neutral-900">Delete this content?</h3>
            <p className="mt-2 text-sm text-neutral-600">
              &quot;{item.title}&quot; and {postCount} generated{" "}
              {postCount === 1 ? "post" : "posts"} will be permanently removed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
