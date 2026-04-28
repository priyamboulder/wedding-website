"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSocialData } from "@/lib/social/SocialDataContext";
import type {
  GeneratedPost,
  Platform,
  SocialContentItem,
  Tone,
  VendorSocialProfile,
} from "@/lib/social/types";
import GenerationControls from "@/components/social/GenerationControls";
import GeneratedPostsPanel from "@/components/social/GeneratedPostsPanel";

const DEFAULT_PLATFORMS: Platform[] = [
  "instagram_post",
  "linkedin",
  "facebook",
];

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

function GeneratePageBody() {
  const searchParams = useSearchParams();
  const {
    isLoaded,
    profile,
    contentItems,
    createGeneratedPosts,
    updateGeneratedPost,
    deleteGeneratedPost,
  } = useSocialData();

  const [selectedContentId, setSelectedContentId] = useState<string>("");
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [tone, setTone] = useState<Tone>("romantic");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Local list of posts shown in this session — only those freshly generated here.
  const [sessionPosts, setSessionPosts] = useState<GeneratedPost[]>([]);

  // Pre-select ?content=<id>
  useEffect(() => {
    const fromUrl = searchParams.get("content");
    if (fromUrl && contentItems.some((i) => i.id === fromUrl)) {
      setSelectedContentId(fromUrl);
    }
  }, [searchParams, contentItems]);

  // Apply preferred platforms from profile once loaded (only if user hasn't changed them yet).
  const [appliedPrefs, setAppliedPrefs] = useState(false);
  useEffect(() => {
    if (!appliedPrefs && profile?.preferred_platforms?.length) {
      setPlatforms(profile.preferred_platforms);
      setAppliedPrefs(true);
    }
  }, [profile, appliedPrefs]);

  const selectedItem = useMemo(
    () => contentItems.find((i) => i.id === selectedContentId) ?? null,
    [contentItems, selectedContentId],
  );

  const handleGenerate = useCallback(async () => {
    if (!selectedItem || platforms.length === 0) return;
    setError(null);
    setIsGenerating(true);
    try {
      const apiPosts = await callGenerate({
        content_item: selectedItem,
        brand_profile: profile,
        platforms,
        tone,
        additional_instructions: additionalInstructions,
      });
      const saved = await createGeneratedPosts(
        apiPosts.map((p) => ({
          content_item_id: selectedItem.id,
          platform: p.platform,
          caption: p.caption,
          hashtags: p.hashtags,
          call_to_action: p.call_to_action,
          tone: p.tone_used ?? tone,
          status: "draft" as const,
          scheduled_for: null,
          generation_metadata: {
            tone,
            additional_instructions: additionalInstructions,
          },
        })),
      );
      setSessionPosts(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [
    selectedItem,
    platforms,
    profile,
    tone,
    additionalInstructions,
    createGeneratedPosts,
  ]);

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<GeneratedPost>) => {
      await updateGeneratedPost(id, updates);
      setSessionPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...updates, updated_at: new Date().toISOString() }
            : p,
        ),
      );
    },
    [updateGeneratedPost],
  );

  const handleApprove = useCallback(
    async (id: string) => {
      await handleUpdate(id, { status: "approved" });
    },
    [handleUpdate],
  );

  const handleRegenerate = useCallback(
    async (post: GeneratedPost) => {
      if (!selectedItem) return;
      setRegeneratingId(post.id);
      setError(null);
      try {
        const apiPosts = await callGenerate({
          content_item: selectedItem,
          brand_profile: profile,
          platforms: [post.platform],
          tone,
          additional_instructions: additionalInstructions,
        });
        const fresh = apiPosts[0];
        if (!fresh) throw new Error("No post returned");
        const [saved] = await createGeneratedPosts([
          {
            content_item_id: selectedItem.id,
            platform: fresh.platform,
            caption: fresh.caption,
            hashtags: fresh.hashtags,
            call_to_action: fresh.call_to_action,
            tone: fresh.tone_used ?? tone,
            status: "draft" as const,
            scheduled_for: null,
            generation_metadata: {
              tone,
              additional_instructions: additionalInstructions,
              regenerated_from: post.id,
            },
          },
        ]);
        await deleteGeneratedPost(post.id);
        setSessionPosts((prev) =>
          prev.map((p) => (p.id === post.id ? saved : p)),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Regeneration failed");
      } finally {
        setRegeneratingId(null);
      }
    },
    [
      selectedItem,
      profile,
      tone,
      additionalInstructions,
      createGeneratedPosts,
      deleteGeneratedPost,
    ],
  );

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[2fr_3fr]">
          <div className="h-96 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-96 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
            Vendor · Social
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-neutral-900">
            Post Generator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Turn a wedding, shoot, or project into on-brand posts for every
            platform.
          </p>
        </div>
        <Link
          href="/vendor/social"
          className="text-sm text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
        >
          ← Back to content library
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <GenerationControls
              contentItems={contentItems}
              selectedContentId={selectedContentId}
              onSelectContentId={setSelectedContentId}
              platforms={platforms}
              onPlatformsChange={setPlatforms}
              tone={tone}
              onToneChange={setTone}
              additionalInstructions={additionalInstructions}
              onAdditionalInstructionsChange={setAdditionalInstructions}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              error={error}
            />
          </div>
        </aside>

        <section>
          <GeneratedPostsPanel
            posts={sessionPosts}
            isGenerating={isGenerating}
            regeneratingId={regeneratingId}
            onUpdate={handleUpdate}
            onApprove={handleApprove}
            onRegenerate={handleRegenerate}
          />
        </section>
      </div>
    </div>
  );
}

export default function VendorSocialGeneratePage() {
  return (
    <Suspense fallback={null}>
      <GeneratePageBody />
    </Suspense>
  );
}
