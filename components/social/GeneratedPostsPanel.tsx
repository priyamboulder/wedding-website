"use client";

import type { GeneratedPost } from "@/lib/social/types";
import PostPreviewCard from "./PostPreviewCard";

type Props = {
  posts: GeneratedPost[];
  isGenerating: boolean;
  regeneratingId: string | null;
  onUpdate: (id: string, updates: Partial<GeneratedPost>) => Promise<void> | void;
  onApprove: (id: string) => Promise<void> | void;
  onRegenerate: (post: GeneratedPost) => Promise<void> | void;
};

export default function GeneratedPostsPanel({
  posts,
  isGenerating,
  regeneratingId,
  onUpdate,
  onApprove,
  onRegenerate,
}: Props) {
  if (isGenerating && posts.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800"
            aria-hidden
          />
          Crafting your posts…
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-lg border border-neutral-200 bg-neutral-100"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-8 py-12 text-center">
        <div className="text-4xl" aria-hidden>
          ✨
        </div>
        <h3 className="mt-3 text-base font-semibold text-neutral-900">
          Ready when you are
        </h3>
        <p className="mt-2 max-w-sm text-sm text-neutral-600">
          Select a content item and choose your platforms, then hit Generate to
          create your posts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostPreviewCard
          key={post.id}
          post={post}
          onSave={(updates) => onUpdate(post.id, updates)}
          onApprove={() => onApprove(post.id)}
          onRegenerate={() => onRegenerate(post)}
          isRegenerating={regeneratingId === post.id}
        />
      ))}
    </div>
  );
}
