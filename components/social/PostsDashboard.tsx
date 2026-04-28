"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useSocialData } from "@/lib/social/SocialDataContext";
import type {
  GeneratedPost,
  Platform,
  SocialContentItem,
  Tone,
  VendorSocialProfile,
} from "@/lib/social/types";
import PostsStatsBar from "./PostsStatsBar";
import PostsFilterBar, { type PostsFilters } from "./PostsFilterBar";
import PostCard from "./PostCard";
import BulkActionsBar from "./BulkActionsBar";

type ApiPost = {
  platform: Platform;
  caption: string;
  hashtags: string[];
  call_to_action: string;
  tone_used: Tone;
};

type ApiResponse = {
  posts?: ApiPost[];
  error?: string;
};

async function callGenerate(payload: {
  content_item: SocialContentItem;
  brand_profile: VendorSocialProfile | null;
  platforms: Platform[];
  tone: Tone;
  additional_instructions: string;
}): Promise<ApiPost[]> {
  const res = await fetch("/api/social/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as ApiResponse;
  if (!res.ok || !json.posts) {
    throw new Error(json.error ?? `Request failed (${res.status})`);
  }
  return json.posts;
}

const DEFAULT_FILTERS: PostsFilters = {
  platform: "all",
  status: "all",
  contentItemId: "all",
  sort: "newest",
  search: "",
};

export default function PostsDashboard() {
  const {
    profile,
    contentItems,
    generatedPosts,
    postStats,
    updateGeneratedPost,
    deleteGeneratedPost,
    deleteGeneratedPosts,
    createGeneratedPosts,
  } = useSocialData();

  const [filters, setFilters] = useState<PostsFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const contentItemById = useMemo(() => {
    const map = new Map<string, SocialContentItem>();
    for (const item of contentItems) map.set(item.id, item);
    return map;
  }, [contentItems]);

  const filteredPosts = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase();
    let list = generatedPosts.filter((p) => {
      if (filters.platform !== "all" && p.platform !== filters.platform)
        return false;
      if (filters.status !== "all" && p.status !== filters.status) return false;
      if (
        filters.contentItemId !== "all" &&
        p.content_item_id !== filters.contentItemId
      )
        return false;
      if (searchLower && !p.caption.toLowerCase().includes(searchLower))
        return false;
      return true;
    });

    list = [...list];
    switch (filters.sort) {
      case "oldest":
        list.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;
      case "platform_az":
        list.sort((a, b) => a.platform.localeCompare(b.platform));
        break;
      case "newest":
      default:
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }
    return list;
  }, [generatedPosts, filters]);

  const selectedPosts = useMemo(
    () => generatedPosts.filter((p) => selectedIds.has(p.id)),
    [generatedPosts, selectedIds],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleApproveAll = useCallback(async () => {
    const ids = Array.from(selectedIds);
    await Promise.all(
      ids.map((id) => updateGeneratedPost(id, { status: "approved" })),
    );
    clearSelection();
  }, [selectedIds, updateGeneratedPost, clearSelection]);

  const handleDeleteAll = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await deleteGeneratedPosts(ids);
    clearSelection();
  }, [selectedIds, deleteGeneratedPosts, clearSelection]);

  const handleRegenerate = useCallback(
    async (post: GeneratedPost) => {
      const item = contentItemById.get(post.content_item_id);
      if (!item) {
        setError("Original content item no longer exists");
        return;
      }
      setRegeneratingId(post.id);
      setError(null);
      try {
        const apiPosts = await callGenerate({
          content_item: item,
          brand_profile: profile,
          platforms: [post.platform],
          tone: post.tone,
          additional_instructions:
            (post.generation_metadata?.additional_instructions as string) ?? "",
        });
        const fresh = apiPosts[0];
        if (!fresh) throw new Error("No post returned");
        await updateGeneratedPost(post.id, {
          caption: fresh.caption,
          hashtags: fresh.hashtags,
          call_to_action: fresh.call_to_action,
          tone: fresh.tone_used ?? post.tone,
          generation_metadata: {
            ...post.generation_metadata,
            regenerated_at: new Date().toISOString(),
          },
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Regeneration failed");
      } finally {
        setRegeneratingId(null);
      }
    },
    [contentItemById, profile, updateGeneratedPost],
  );

  const hasAnyPosts = generatedPosts.length > 0;
  const hasFilteredResults = filteredPosts.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
            Vendor · Social
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-neutral-900">
            Posts Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Every post you&apos;ve generated, across every platform. Review,
            approve, schedule, and copy to publish.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/vendor/social"
            className="text-sm text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
          >
            Content library
          </Link>
          <Link
            href="/vendor/social/generate"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            + Generate Posts
          </Link>
        </div>
      </header>

      <div className="mb-6">
        <PostsStatsBar stats={postStats} />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          {error}
        </div>
      )}

      {hasAnyPosts ? (
        <>
          <div className="mb-6">
            <PostsFilterBar
              filters={filters}
              onChange={setFilters}
              contentItems={contentItems}
            />
          </div>

          {hasFilteredResults ? (
            <div className="grid gap-4 pb-24">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  contentItem={contentItemById.get(post.content_item_id) ?? null}
                  selected={selectedIds.has(post.id)}
                  onToggleSelect={() => toggleSelect(post.id)}
                  onUpdate={(updates) => updateGeneratedPost(post.id, updates)}
                  onDelete={() => deleteGeneratedPost(post.id)}
                  onRegenerate={() => handleRegenerate(post)}
                  isRegenerating={regeneratingId === post.id}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-8 py-12 text-center">
              <h3 className="text-base font-semibold text-neutral-900">
                No posts match your filters
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Try clearing or adjusting your filters to see more posts.
              </p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-4 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-500"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-8 py-16 text-center">
          <div className="text-4xl" aria-hidden>
            ✨
          </div>
          <h3 className="mt-3 text-base font-semibold text-neutral-900">
            No posts generated yet
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600">
            Head to the Post Generator to create your first batch of social
            media posts.
          </p>
          <Link
            href="/vendor/social/generate"
            className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Open Post Generator
          </Link>
        </div>
      )}

      <BulkActionsBar
        selectedPosts={selectedPosts}
        onApproveAll={handleApproveAll}
        onDeleteAll={handleDeleteAll}
        onClear={clearSelection}
      />
    </div>
  );
}
