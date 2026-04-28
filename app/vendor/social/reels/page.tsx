"use client";

import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { useSocialData } from "@/lib/social/SocialDataContext";
import type { ReelTemplate } from "@/lib/social/types";
import ReelTemplateGrid from "@/components/social/ReelTemplateGrid";
import ReelContentForm, {
  reelFormReducer,
  type ReelFormState,
} from "@/components/social/ReelContentForm";
import ReelPreview from "@/components/social/ReelPreview";

type Step = 1 | 2 | 3;

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Choose Template" },
  { id: 2, label: "Fill Content" },
  { id: 3, label: "Preview" },
];

function ProgressIndicator({ step }: { step: Step }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map(({ id, label }, idx) => {
        const active = id === step;
        const completed = id < step;
        return (
          <div key={id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  active
                    ? "bg-neutral-900 text-white"
                    : completed
                      ? "bg-neutral-700 text-white"
                      : "bg-neutral-200 text-neutral-500"
                }`}
              >
                {completed ? "✓" : id}
              </div>
              <span
                className={`text-xs font-medium ${
                  active
                    ? "text-neutral-900"
                    : completed
                      ? "text-neutral-600"
                      : "text-neutral-400"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-px w-6 sm:w-10 ${
                  completed ? "bg-neutral-700" : "bg-neutral-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function VendorSocialReelsPage() {
  const {
    isLoaded,
    profile,
    contentItems,
    reelTemplates,
    createGeneratedReel,
  } = useSocialData();

  const [step, setStep] = useState<Step>(1);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReelTemplate | null>(null);
  const initialFormState: ReelFormState = {
    slideImages: {},
    slideTexts: {},
    caption: "",
    hashtags: [],
    brandColors: { primary: "#1A1A1A", secondary: "#B8860B", accent: "#F5E6C8" },
    contentItemId: null,
  };
  const [formState, dispatch] = useReducer(reelFormReducer, initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // When profile loads, backfill brand colors if they're still the defaults.
  useEffect(() => {
    if (profile?.brand_colors && !selectedTemplate) {
      dispatch({
        type: "SET_BRAND_COLOR",
        key: "primary",
        value: profile.brand_colors.primary,
      });
      dispatch({
        type: "SET_BRAND_COLOR",
        key: "secondary",
        value: profile.brand_colors.secondary,
      });
      dispatch({
        type: "SET_BRAND_COLOR",
        key: "accent",
        value: profile.brand_colors.accent,
      });
    }
  }, [profile, selectedTemplate]);

  const handleSelectTemplate = (template: ReelTemplate) => {
    setSelectedTemplate(template);
    dispatch({ type: "RESET", template, profile });
    setStep(2);
  };

  const handleBackToTemplates = () => {
    setStep(1);
    setSaveMessage(null);
  };

  const handlePreview = () => setStep(3);

  const handleEditContent = () => setStep(2);

  const saveReel = async (status: "draft" | "preview_ready") => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await createGeneratedReel({
        content_item_id: formState.contentItemId,
        template_id: selectedTemplate.id,
        reel_config: {
          slides: selectedTemplate.template_config.slides.map((s) => ({
            id: s.id,
            label: s.label,
            type: s.type,
            duration_ms: s.duration_ms,
            image: s.type === "image" ? formState.slideImages[s.id] ?? "" : "",
            text: s.text_overlay ? formState.slideTexts[s.id] ?? "" : "",
          })),
          brand_colors: formState.brandColors,
          template_config: selectedTemplate.template_config,
        },
        caption: formState.caption,
        hashtags: formState.hashtags,
        status,
        preview_url: "",
        render_url: "",
      });
      setSaveMessage(
        status === "draft"
          ? "Draft saved."
          : "Reel approved and queued.",
      );
    } catch (e) {
      setSaveMessage(
        e instanceof Error ? `Save failed: ${e.message}` : "Save failed.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="mt-8 h-10 w-80 animate-pulse rounded bg-neutral-100" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-lg bg-neutral-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
            Vendor · Social · Reels
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-neutral-900">
            Reel Studio
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Pick a template, fill in your photos and text, and preview your
            Instagram Reel before it goes live.
          </p>
        </div>
        <Link
          href="/vendor/social"
          className="text-sm text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
        >
          ← Back to content library
        </Link>
      </header>

      <ProgressIndicator step={step} />

      {step === 1 && (
        <ReelTemplateGrid
          templates={reelTemplates}
          onSelect={handleSelectTemplate}
        />
      )}

      {step === 2 && selectedTemplate && (
        <ReelContentForm
          template={selectedTemplate}
          state={formState}
          dispatch={dispatch}
          contentItems={contentItems}
          profile={profile}
          onBack={handleBackToTemplates}
          onNext={handlePreview}
        />
      )}

      {step === 3 && selectedTemplate && (
        <>
          <ReelPreview
            template={selectedTemplate}
            slideImages={formState.slideImages}
            slideTexts={formState.slideTexts}
            caption={formState.caption}
            hashtags={formState.hashtags}
            brandColors={formState.brandColors}
            onCaptionChange={(value) =>
              dispatch({ type: "SET_CAPTION", value })
            }
            onHashtagsChange={(value) =>
              dispatch({ type: "SET_HASHTAGS", value })
            }
            onSaveDraft={() => void saveReel("draft")}
            onApprove={() => void saveReel("preview_ready")}
            onEditContent={handleEditContent}
            onChooseTemplate={handleBackToTemplates}
            isSaving={isSaving}
          />
          {saveMessage && (
            <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {saveMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
}

