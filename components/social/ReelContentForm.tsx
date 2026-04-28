"use client";

import { useMemo, useState } from "react";
import type {
  BrandColors,
  ReelTemplate,
  SocialContentItem,
  VendorSocialProfile,
} from "@/lib/social/types";
import TagInput from "./TagInput";
import SlideEditor from "./SlideEditor";

export type ReelFormState = {
  slideImages: Record<string, string>;
  slideTexts: Record<string, string>;
  caption: string;
  hashtags: string[];
  brandColors: BrandColors;
  contentItemId: string | null;
};

export type ReelFormAction =
  | { type: "SET_IMAGE"; slideId: string; value: string }
  | { type: "SET_TEXT"; slideId: string; value: string }
  | { type: "SET_CAPTION"; value: string }
  | { type: "SET_HASHTAGS"; value: string[] }
  | { type: "SET_BRAND_COLOR"; key: keyof BrandColors; value: string }
  | {
      type: "AUTO_FILL";
      contentItemId: string | null;
      slideTexts: Record<string, string>;
    }
  | { type: "RESET"; template: ReelTemplate; profile: VendorSocialProfile | null };

export function initReelFormState(
  template: ReelTemplate,
  profile: VendorSocialProfile | null,
): ReelFormState {
  const slideImages: Record<string, string> = {};
  const slideTexts: Record<string, string> = {};
  for (const slide of template.template_config.slides) {
    if (slide.type === "image") slideImages[slide.id] = "";
    if (slide.text_overlay) slideTexts[slide.id] = "";
  }
  return {
    slideImages,
    slideTexts,
    caption: "",
    hashtags: profile?.default_hashtags ?? [],
    brandColors: profile?.brand_colors ?? {
      primary: "#1A1A1A",
      secondary: "#B8860B",
      accent: "#F5E6C8",
    },
    contentItemId: null,
  };
}

export function reelFormReducer(
  state: ReelFormState,
  action: ReelFormAction,
): ReelFormState {
  switch (action.type) {
    case "SET_IMAGE":
      return {
        ...state,
        slideImages: { ...state.slideImages, [action.slideId]: action.value },
      };
    case "SET_TEXT":
      return {
        ...state,
        slideTexts: { ...state.slideTexts, [action.slideId]: action.value },
      };
    case "SET_CAPTION":
      return { ...state, caption: action.value };
    case "SET_HASHTAGS":
      return { ...state, hashtags: action.value };
    case "SET_BRAND_COLOR":
      return {
        ...state,
        brandColors: { ...state.brandColors, [action.key]: action.value },
      };
    case "AUTO_FILL":
      return {
        ...state,
        contentItemId: action.contentItemId,
        slideTexts: { ...state.slideTexts, ...action.slideTexts },
      };
    case "RESET":
      return initReelFormState(action.template, action.profile);
    default:
      return state;
  }
}

/** Map a template slide's content_key to a field on the content item metadata. */
export function resolveContentKey(
  contentKey: string,
  item: SocialContentItem,
): string {
  const meta = item.metadata ?? {};
  if (contentKey in meta && typeof meta[contentKey] === "string") {
    return meta[contentKey] as string;
  }
  // Common aliases
  switch (contentKey) {
    case "project_title":
      return item.title ?? "";
    case "before_label":
      return "Before";
    case "after_label":
      return "After";
    case "tagline":
      return item.description ?? "";
    default:
      return "";
  }
}

type Props = {
  template: ReelTemplate;
  state: ReelFormState;
  dispatch: (action: ReelFormAction) => void;
  contentItems: SocialContentItem[];
  profile: VendorSocialProfile | null;
  onBack: () => void;
  onNext: () => void;
};

export default function ReelContentForm({
  template,
  state,
  dispatch,
  contentItems,
  profile,
  onBack,
  onNext,
}: Props) {
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => contentItems.find((i) => i.id === state.contentItemId) ?? null,
    [contentItems, state.contentItemId],
  );

  const availableImages = useMemo(
    () => selectedItem?.media_urls ?? [],
    [selectedItem],
  );

  const imageSlides = template.template_config.slides.filter(
    (s) => s.type === "image",
  );
  const imagesFilled = imageSlides.every(
    (s) => !!state.slideImages[s.id],
  );

  const handleAutoFill = (itemId: string) => {
    if (!itemId) {
      dispatch({ type: "AUTO_FILL", contentItemId: null, slideTexts: {} });
      return;
    }
    const item = contentItems.find((i) => i.id === itemId);
    if (!item) return;
    const texts: Record<string, string> = {};
    for (const slide of template.template_config.slides) {
      if (slide.text_overlay) {
        const resolved = resolveContentKey(slide.text_overlay.content_key, item);
        if (resolved) texts[slide.id] = resolved;
      }
    }
    dispatch({ type: "AUTO_FILL", contentItemId: itemId, slideTexts: texts });
  };

  const handleGenerateCaption = async () => {
    setCaptionError(null);
    setIsGeneratingCaption(true);
    try {
      const fallbackItem = {
        title: template.name,
        description: template.description,
        content_type: "portfolio_highlight",
        tags: [],
        metadata: {},
      };
      const res = await fetch("/api/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_item: selectedItem ?? fallbackItem,
          brand_profile: profile,
          platforms: ["instagram_reel"],
          tone: "cinematic",
          additional_instructions: `Caption for a Reel using the "${template.name}" template.`,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? `Request failed (${res.status})`);
      }
      const post = json.posts?.[0];
      if (!post) throw new Error("No caption returned");
      dispatch({ type: "SET_CAPTION", value: post.caption ?? "" });
      if (Array.isArray(post.hashtags) && post.hashtags.length > 0) {
        dispatch({ type: "SET_HASHTAGS", value: post.hashtags });
      }
    } catch (e) {
      setCaptionError(e instanceof Error ? e.message : "Caption generation failed");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
            Step 2 · Fill content
          </p>
          <h2 className="mt-1 text-xl font-semibold text-neutral-900">
            {template.name}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">{template.description}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-500"
        >
          ← Back to templates
        </button>
      </header>

      {/* Auto-fill */}
      {contentItems.length > 0 && (
        <div className="mb-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Auto-fill from content
          </label>
          <select
            value={state.contentItemId ?? ""}
            onChange={(e) => handleAutoFill(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
          >
            <option value="">— None —</option>
            {contentItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          {selectedItem && (
            <p className="mt-1.5 text-[11px] text-neutral-500">
              {selectedItem.media_urls.length} images available · text fields pre-filled from metadata
            </p>
          )}
        </div>
      )}

      {/* Per-slide editors */}
      <div className="space-y-3">
        {template.template_config.slides.map((slide, index) => (
          <SlideEditor
            key={slide.id}
            slide={slide}
            index={index}
            total={template.template_config.slides.length}
            imageValue={state.slideImages[slide.id] ?? ""}
            textValue={state.slideTexts[slide.id] ?? ""}
            availableImages={availableImages}
            onImageChange={(value) =>
              dispatch({ type: "SET_IMAGE", slideId: slide.id, value })
            }
            onTextChange={(value) =>
              dispatch({ type: "SET_TEXT", slideId: slide.id, value })
            }
          />
        ))}
      </div>

      {/* Global settings */}
      <div className="mt-6 space-y-5 rounded-lg border border-neutral-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-neutral-900">Post settings</h3>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Caption
            </label>
            <button
              type="button"
              onClick={handleGenerateCaption}
              disabled={isGeneratingCaption}
              className="text-[11px] font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900 disabled:opacity-50"
            >
              {isGeneratingCaption ? "Generating…" : "Generate Caption"}
            </button>
          </div>
          <textarea
            value={state.caption}
            onChange={(e) =>
              dispatch({ type: "SET_CAPTION", value: e.target.value })
            }
            rows={4}
            placeholder="Write a caption or click Generate."
            className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          {captionError && (
            <p className="mt-1 text-[11px] text-amber-700">{captionError}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Hashtags
          </label>
          <TagInput
            value={state.hashtags}
            onChange={(value) => dispatch({ type: "SET_HASHTAGS", value })}
            prefix="#"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Brand colors
          </label>
          <div className="flex flex-wrap gap-3">
            {(["primary", "secondary", "accent"] as const).map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5"
              >
                <input
                  type="color"
                  value={state.brandColors[key]}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_BRAND_COLOR",
                      key,
                      value: e.target.value,
                    })
                  }
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-xs capitalize text-neutral-700">{key}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-500"
        >
          Back to Templates
        </button>
        <div className="flex items-center gap-3">
          {!imagesFilled && (
            <span className="text-[11px] text-neutral-500">
              Add an image for every slide to preview
            </span>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={!imagesFilled}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Preview Reel →
          </button>
        </div>
      </div>
    </div>
  );
}
