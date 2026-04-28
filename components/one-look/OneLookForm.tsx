"use client";

// ── One Look submission form ──────────────────────────────────────────────
// Single-screen composition: score slider → one-word chip → hot-take tabs
// (audio / video / text) → publish. Creates a draft on upsert, flips to
// published on submit. Audio/video blobs are stashed in IndexedDB before the
// store record is written.

import { useEffect, useState } from "react";
import { Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { COORDINATION_ROLE_LABEL } from "@/types/coordination";
import { useOneLookStore } from "@/stores/one-look-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { putBlob } from "@/lib/one-look/blob-store";
import { brideContextFromProfile } from "@/lib/one-look/bride-context";
import type { OneLookMediaType } from "@/types/one-look";
import { ScoreSlider } from "./ScoreSlider";
import { OneWordChips } from "./OneWordChips";
import { AudioRecorder } from "./AudioRecorder";
import { VideoRecorder } from "./VideoRecorder";
import { TextHotTake } from "./TextHotTake";
import { MediaPreview } from "./MediaPreview";

export interface OneLookFormTarget {
  coordinationVendorId: string | null;
  platformVendorId: string | null;
  vendorName: string;
  vendorRole: string;               // raw coordination role (e.g. "photographer")
}

export function OneLookForm({
  target,
  onClose,
  onPublished,
}: {
  target: OneLookFormTarget;
  onClose: () => void;
  onPublished?: () => void;
}) {
  const upsertDraft = useOneLookStore((s) => s.upsertDraft);
  const publish = useOneLookStore((s) => s.publish);
  const existing = useOneLookStore((s) =>
    target.coordinationVendorId
      ? s.forCoordinationVendor(target.coordinationVendorId)
      : target.platformVendorId
        ? s.forPlatformVendor(target.platformVendorId)
        : null,
  );
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfile = myProfileId ? profiles.find((p) => p.id === myProfileId) ?? null : null;

  const [score, setScore] = useState<number>(existing?.score ?? 7.0);
  const [oneWord, setOneWord] = useState<string | null>(existing?.oneWord ?? null);
  const [mediaType, setMediaType] = useState<OneLookMediaType>(
    existing?.mediaType ?? "audio",
  );
  const [hotTakeText, setHotTakeText] = useState<string>(existing?.hotTakeText ?? "");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoThumb, setVideoThumb] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-draft on any score/word change once both are present. Keeps the
  // review in the store even if the bride navigates away mid-flow.
  useEffect(() => {
    if (!oneWord) return;
    upsertDraft({
      coordinationVendorId: target.coordinationVendorId,
      platformVendorId: target.platformVendorId,
      vendorName: target.vendorName,
      vendorRole: target.vendorRole,
      vendorCategory: target.vendorRole,
      score,
      oneWord,
      mediaType: "text",
      hotTakeText: "",
      bride: brideContextFromProfile(myProfile),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, oneWord]);

  const hotTakeReady =
    (mediaType === "text" && hotTakeText.trim().length > 0) ||
    (mediaType === "audio" && audioBlob !== null) ||
    (mediaType === "video" && videoBlob !== null);

  const readyToPublish = oneWord !== null && hotTakeReady;

  async function handlePublish() {
    if (!oneWord || publishing) return;
    setPublishing(true);
    setErrorMsg(null);
    try {
      let audioBlobKey: string | null = null;
      let videoBlobKey: string | null = null;
      if (mediaType === "audio" && audioBlob) {
        audioBlobKey = await putBlob("audio", audioBlob);
      }
      if (mediaType === "video" && videoBlob) {
        videoBlobKey = await putBlob("video", videoBlob);
      }
      const draft = upsertDraft({
        coordinationVendorId: target.coordinationVendorId,
        platformVendorId: target.platformVendorId,
        vendorName: target.vendorName,
        vendorRole: target.vendorRole,
        vendorCategory: target.vendorRole,
        score,
        oneWord,
        mediaType,
        hotTakeText: mediaType === "text" ? hotTakeText.trim() : "",
        audioBlobKey,
        audioDurationSeconds: audioBlobKey ? audioDuration : null,
        videoBlobKey,
        videoDurationSeconds: videoBlobKey ? videoDuration : null,
        videoThumbnailDataUrl: videoBlobKey ? videoThumb : null,
        bride: brideContextFromProfile(myProfile),
      });
      publish(draft.id);
      onPublished?.();
      onClose();
    } catch (e) {
      console.error("Publish failed:", e);
      setErrorMsg("Something went wrong publishing. Try again.");
    } finally {
      setPublishing(false);
    }
  }

  const roleLabel =
    (COORDINATION_ROLE_LABEL as Record<string, string>)[target.vendorRole] ??
    target.vendorRole;

  return (
    <div className="rounded-lg border border-gold/30 bg-ivory-warm/40 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            one look
          </p>
          <h3 className="mt-1 font-serif text-[18px] leading-snug text-ink">
            your take on {target.vendorName}
          </h3>
          <p
            className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {roleLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          close
        </button>
      </div>

      <div className="space-y-5">
        <ScoreSlider value={score} onChange={setScore} />

        <div className="space-y-2">
          <SectionLabel>one word</SectionLabel>
          <OneWordChips value={oneWord} onChange={setOneWord} />
        </div>

        <div className="space-y-2">
          <SectionLabel>your hot take</SectionLabel>
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            Record a quick take (up to 45 seconds) — or type it out.
          </p>

          <MediaTypeTabs value={mediaType} onChange={setMediaType} />

          {mediaType === "audio" && (
            audioBlob ? (
              <MediaPreview
                blob={audioBlob}
                kind="audio"
                durationSeconds={audioDuration}
                onReRecord={() => {
                  setAudioBlob(null);
                  setAudioDuration(0);
                }}
                onDelete={() => {
                  setAudioBlob(null);
                  setAudioDuration(0);
                }}
              />
            ) : (
              <AudioRecorder
                onRecorded={(blob, duration) => {
                  setAudioBlob(blob);
                  setAudioDuration(duration);
                }}
              />
            )
          )}

          {mediaType === "video" && (
            videoBlob ? (
              <MediaPreview
                blob={videoBlob}
                kind="video"
                durationSeconds={videoDuration}
                thumbnailDataUrl={videoThumb}
                onReRecord={() => {
                  setVideoBlob(null);
                  setVideoDuration(0);
                  setVideoThumb(null);
                }}
                onDelete={() => {
                  setVideoBlob(null);
                  setVideoDuration(0);
                  setVideoThumb(null);
                }}
              />
            ) : (
              <VideoRecorder
                onRecorded={(blob, duration, thumb) => {
                  setVideoBlob(blob);
                  setVideoDuration(duration);
                  setVideoThumb(thumb);
                }}
              />
            )
          )}

          {mediaType === "text" && (
            <TextHotTake value={hotTakeText} onChange={setHotTakeText} />
          )}
        </div>

        {errorMsg && (
          <p className="text-[12px] text-rose">{errorMsg}</p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-white px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:border-saffron/40 hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!readyToPublish || publishing}
            className={cn(
              "rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {publishing
              ? "Publishing…"
              : existing?.status === "published"
                ? "Update your One Look →"
                : "Publish your One Look →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      — {children} —
    </p>
  );
}

function MediaTypeTabs({
  value,
  onChange,
}: {
  value: OneLookMediaType;
  onChange: (v: OneLookMediaType) => void;
}) {
  const tabs: { id: OneLookMediaType; label: string; icon: React.ReactNode }[] = [
    { id: "audio", label: "audio", icon: "🎙️" },
    { id: "video", label: "video", icon: "📹" },
    { id: "text", label: "text", icon: <Type size={11} strokeWidth={1.8} /> },
  ];
  return (
    <div className="flex gap-1.5">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors",
              active
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
