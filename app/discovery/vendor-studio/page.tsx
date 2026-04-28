"use client";

// Vendor-dashboard-side studio page for managing video profiles. Exercises
// the uploader, per-video export menu, and engagement metrics panel. Seeded
// with a single demo vendor (Lumière & Co. Photography) so the page works
// standalone.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Film, User, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoBadge } from "@/components/vendors/discovery/VideoBadge";
import { VideoGallery } from "@/components/vendors/discovery/VideoGallery";
import { VideoMetrics } from "@/components/vendors/discovery/VideoMetrics";
import { VideoUploader } from "@/components/vendors/discovery/VideoUploader";
import { VideoExportMenu } from "@/components/vendors/discovery/VideoExportMenu";
import { DISCOVERY_VENDORS } from "@/lib/vendors/discovery-seed";
import type { VideoMeta } from "@/types/vendor-discovery";
import { summarizeVideoProfile } from "@/lib/vendors/video-scoring";

export default function VendorStudioPage() {
  const seed = DISCOVERY_VENDORS.find((v) => v.id === "photo_lumiere")!;
  const [videos, setVideos] = useState<VideoMeta[]>(seed.videos ?? []);

  const profile = useMemo(() => summarizeVideoProfile(videos), [videos]);

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <Link
              href="/discovery"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted hover:text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ← Discovery
            </Link>
            <h1 className="mt-1 font-serif text-[24px] leading-tight text-ink">
              Video studio
            </h1>
            <p className="mt-0.5 flex items-center gap-2 text-[12.5px] text-ink-muted">
              <User size={12} strokeWidth={1.8} />
              {seed.name}
              <VideoBadge state={profile.badge} size="xs" />
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Video score
            </span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ivory-deep">
                <div
                  className="h-full bg-gold"
                  style={{ width: `${Math.round(profile.video_score * 100)}%` }}
                />
              </div>
              <span
                className="font-mono text-[11px] text-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {Math.round(profile.video_score * 100)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-8">
        {/* Engagement */}
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 font-serif text-[16px] text-ink">
            <Clapperboard size={14} strokeWidth={1.8} className="text-gold" />
            Engagement
          </h2>
          <VideoMetrics videos={videos} />
        </section>

        {/* Badge status */}
        <section
          className={cn(
            "flex items-start gap-3 rounded-[12px] border p-4",
            profile.badge === "earned"
              ? "border-sage/40 bg-sage-pale/30"
              : "border-gold/30 bg-gold-pale/20",
          )}
        >
          <Film
            size={18}
            strokeWidth={1.8}
            className={profile.badge === "earned" ? "text-sage" : "text-gold"}
          />
          <div className="flex-1">
            <p className="font-serif text-[14px] text-ink">
              {profile.badge === "earned"
                ? "You've earned the Video Profile badge."
                : `Upload ${
                    profile.intro_video
                      ? `${Math.max(0, 2 - profile.portfolio_count)} more portfolio reel${
                          2 - profile.portfolio_count === 1 ? "" : "s"
                        }`
                      : "an intro video and 2 portfolio reels"
                  } to earn the Video Profile badge.`}
            </p>
            <p className="mt-1 text-[12px] text-ink-muted">
              Couples who land on a profile with video inquire at a higher rate.
              The badge shows up on your card in the marketplace, and your
              profile gets ranked higher in AI recommendations.
            </p>
          </div>
        </section>

        {/* Uploader + Gallery */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <section className="flex flex-col gap-4">
            <h2 className="font-serif text-[16px] text-ink">Upload</h2>
            <VideoUploader
              onUploaded={(v) =>
                setVideos((prev) => [
                  { ...v, title: v.title || `New ${v.kind}` },
                  ...prev,
                ])
              }
            />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-serif text-[16px] text-ink">
              Share an existing video
            </h2>
            {videos[0] ? (
              <VideoExportMenu video={videos[0]} vendorName={seed.name} />
            ) : (
              <p className="rounded-[10px] border border-dashed border-border bg-white p-6 text-[12px] text-ink-muted">
                Upload a video first to enable social exports.
              </p>
            )}
          </section>
        </div>

        {/* Library */}
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-[16px] text-ink">Library</h2>
          <VideoGallery videos={videos} />
        </section>
      </div>
    </div>
  );
}
