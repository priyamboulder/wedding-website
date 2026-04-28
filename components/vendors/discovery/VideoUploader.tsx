"use client";

// Vendor-dashboard-side uploader. No real backend — this persists via
// parent state and simulates upload progress in-memory. The spec's max
// (3 min / 500MB / MP4/MOV/WebM) is enforced client-side before the file
// would be passed to a CDN (Mux / Cloudflare Stream) in production.

import { useRef, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Film, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoKind, VideoMeta } from "@/types/vendor-discovery";

const MAX_BYTES = 500 * 1024 * 1024; // 500MB
const MAX_SECONDS = 180;              // 3 min
const ACCEPT = "video/mp4,video/quicktime,video/webm";

const KIND_OPTIONS: Array<{ value: VideoKind; label: string; prompt: string }> = [
  {
    value: "intro",
    label: "Intro video (60–90s)",
    prompt:
      "In 60 seconds: who you are, your signature style, and your favorite wedding moment.",
  },
  {
    value: "portfolio",
    label: "Portfolio reel (30–60s)",
    prompt: "Tag the venue, planner, and wedding style for contextual surfacing.",
  },
  {
    value: "testimonial",
    label: "Couple testimonial (30–60s)",
    prompt: "Ask a past couple to record a direct message about working with you.",
  },
  {
    value: "behind_scenes",
    label: "Behind the scenes",
    prompt: "Process, setup, editing, coordination — show how you work.",
  },
];

export function VideoUploader({
  onUploaded,
}: {
  onUploaded: (video: VideoMeta) => void;
}) {
  const [kind, setKind] = useState<VideoKind>("intro");
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const prompt = KIND_OPTIONS.find((o) => o.value === kind)!.prompt;

  function reset() {
    setFileName(null);
    setProgress(null);
    setError(null);
    setDone(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleFile(file: File) {
    reset();
    setFileName(file.name);

    if (file.size > MAX_BYTES) {
      setError(`File is ${(file.size / 1024 / 1024).toFixed(0)}MB — max 500MB.`);
      return;
    }
    if (!ACCEPT.split(",").includes(file.type) && file.type.startsWith("video/") === false) {
      setError("Accepted formats: MP4, MOV, WebM.");
      return;
    }

    const duration = await probeDuration(file);
    if (duration && duration > MAX_SECONDS) {
      setError(`Duration ${Math.round(duration)}s — max is 3 minutes.`);
      return;
    }

    // Simulate transcoding / upload progress.
    setProgress(0);
    for (let p = 10; p <= 100; p += 10) {
      await new Promise((r) => setTimeout(r, 80));
      setProgress(p);
    }
    setDone(true);

    const objectUrl = URL.createObjectURL(file);
    onUploaded({
      id: `video_${Date.now()}`,
      kind,
      src_url: objectUrl,
      poster_url: objectUrl,
      duration_seconds: Math.round(duration ?? 45),
      aspect: "16:9",
      title: file.name.replace(/\.[^.]+$/, ""),
      uploaded_at: new Date().toISOString(),
      play_through_rate: 0,
      views: 0,
      inquiries_from_video: 0,
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-white p-5">
      <header className="flex items-center gap-2">
        <Film size={16} strokeWidth={1.8} className="text-gold" />
        <h3 className="font-serif text-[16px] text-ink">Upload a video</h3>
      </header>

      {/* Kind picker */}
      <div className="flex flex-col gap-2">
        <label
          className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Video type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {KIND_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setKind(opt.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11.5px] transition-colors",
                kind === opt.value
                  ? "bg-ink text-ivory"
                  : "bg-ivory-warm text-ink-soft hover:bg-ivory-deep",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt / script template */}
      <div className="rounded-[10px] bg-gold-pale/40 p-3">
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Script prompt
        </p>
        <p className="mt-1 font-serif text-[13px] italic leading-snug text-ink-soft">
          &ldquo;{prompt}&rdquo;
        </p>
      </div>

      {/* File drop */}
      <div
        className={cn(
          "group relative flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed p-6 text-center transition-colors",
          error
            ? "border-rose bg-rose-pale/30"
            : done
              ? "border-sage bg-sage-pale/30"
              : "border-border bg-ivory-warm hover:border-gold/50 hover:bg-gold-pale/20",
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {done ? (
          <>
            <CheckCircle2 size={20} strokeWidth={1.6} className="text-sage" />
            <p className="text-[12.5px] text-ink">Uploaded — ready to publish</p>
            <p
              className="font-mono text-[10px] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {fileName}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-1 text-[11px] text-ink-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Upload another
            </button>
          </>
        ) : progress !== null ? (
          <>
            <div className="flex items-center gap-2">
              <div className="h-1 w-40 overflow-hidden rounded-full bg-ivory-deep">
                <div
                  className="h-full bg-gold transition-[width] duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span
                className="font-mono text-[10px] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {progress}%
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">
              Transcoding to web-optimized MP4…
            </p>
          </>
        ) : error ? (
          <>
            <AlertCircle size={18} strokeWidth={1.6} className="text-rose" />
            <p className="text-[12px] text-rose">{error}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted hover:text-ink"
            >
              <X size={10} /> Reset
            </button>
          </>
        ) : (
          <>
            <Upload size={20} strokeWidth={1.6} className="text-ink-muted" />
            <p className="text-[13px] text-ink">
              Drop a video or click to browse
            </p>
            <p
              className="font-mono text-[10px] uppercase tracking-wider text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              MP4 · MOV · WebM · max 3 min · max 500MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function probeDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => resolve(null);
      video.src = URL.createObjectURL(file);
    } catch {
      resolve(null);
    }
  });
}
