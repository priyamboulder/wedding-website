"use client";

import { useMemo } from "react";
import type {
  ContentType,
  Platform,
  SocialContentItem,
  Tone,
} from "@/lib/social/types";
import PlatformSelector from "./PlatformSelector";
import ToneSelector from "./ToneSelector";

type Props = {
  contentItems: SocialContentItem[];
  selectedContentId: string;
  onSelectContentId: (id: string) => void;
  platforms: Platform[];
  onPlatformsChange: (next: Platform[]) => void;
  tone: Tone;
  onToneChange: (next: Tone) => void;
  additionalInstructions: string;
  onAdditionalInstructionsChange: (next: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
};

const TYPE_LABEL: Record<ContentType, string> = {
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

export default function GenerationControls({
  contentItems,
  selectedContentId,
  onSelectContentId,
  platforms,
  onPlatformsChange,
  tone,
  onToneChange,
  additionalInstructions,
  onAdditionalInstructionsChange,
  onGenerate,
  isGenerating,
  error,
}: Props) {
  const selected = useMemo(
    () => contentItems.find((i) => i.id === selectedContentId) ?? null,
    [contentItems, selectedContentId],
  );

  const disabled = !selectedContentId || platforms.length === 0 || isGenerating;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          Content item
        </label>
        {contentItems.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-600">
            No content yet. Add a wedding, shoot, or project from the{" "}
            <a href="/vendor/social" className="underline">
              content library
            </a>
            .
          </p>
        ) : (
          <>
            <select
              value={selectedContentId}
              onChange={(e) => onSelectContentId(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            >
              <option value="">Choose a content item…</option>
              {contentItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} · {TYPE_LABEL[item.content_type]}
                </option>
              ))}
            </select>
            {selected && (
              <div className="mt-3 flex items-center gap-3 rounded-md border border-neutral-200 bg-white p-2.5">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                  {selected.media_urls[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.media_urls[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {selected.title}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700">
                    {TYPE_LABEL[selected.content_type]}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          Platforms
        </label>
        <PlatformSelector value={platforms} onChange={onPlatformsChange} />
      </section>

      <section>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          Tone
        </label>
        <ToneSelector value={tone} onChange={onToneChange} />
      </section>

      <section>
        <label
          htmlFor="addl-instructions"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-700"
        >
          Additional instructions{" "}
          <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="addl-instructions"
          rows={3}
          value={additionalInstructions}
          onChange={(e) => onAdditionalInstructionsChange(e.target.value)}
          placeholder="Any special instructions? e.g., 'Emphasize the floral decor' or 'Don't mention the client's family name'"
          className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </section>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {isGenerating ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden
            />
            Generating…
          </>
        ) : (
          <>Generate Posts</>
        )}
      </button>
    </div>
  );
}
