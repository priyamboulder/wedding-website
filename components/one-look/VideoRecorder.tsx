"use client";

// ── Video recorder (MediaRecorder API) ────────────────────────────────────
// Front-facing camera by default. Live preview in a rounded frame while
// recording. Caps at MAX_SECONDS. Generates a thumbnail data URL from the
// first frame after recording and hands blob + duration + thumbnail to parent.

import { useEffect, useRef, useState } from "react";
import { Video, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SECONDS = 45;

function pickVideoMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m));
}

async function extractThumbnailDataUrl(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.remove();
    };

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.1, video.duration || 0);
      } catch {
        cleanup();
        resolve(null);
      }
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(video.videoWidth, 480);
        canvas.height = Math.min(video.videoHeight, 480);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          resolve(null);
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        cleanup();
        resolve(dataUrl);
      } catch {
        cleanup();
        resolve(null);
      }
    };
    video.onerror = () => {
      cleanup();
      resolve(null);
    };
  });
}

export function VideoRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (
    blob: Blob,
    durationSeconds: number,
    thumbnailDataUrl: string | null,
  ) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopTimer();
      stopStream();
    };
  }, []);

  function stopTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
    setPreviewing(false);
  }

  async function start() {
    if (disabled || recording) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      setPreviewing(true);
      // Let the preview <video> mount before assigning srcObject.
      requestAnimationFrame(() => {
        if (previewRef.current) {
          previewRef.current.srcObject = stream;
          previewRef.current.play().catch(() => {});
        }
      });

      const mime = pickVideoMime();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: mime ?? "video/webm",
        });
        const duration = Math.min(
          MAX_SECONDS,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );
        const thumb = await extractThumbnailDataUrl(blob).catch(() => null);
        onRecorded(blob, duration, thumb);
        stopStream();
      };
      recorder.start();
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.round((Date.now() - startedAtRef.current) / 1000);
        setSeconds(elapsed);
        if (elapsed >= MAX_SECONDS) stop();
      }, 250);
    } catch (e) {
      console.error("VideoRecorder start failed:", e);
      setError(
        "We couldn't access your camera. Check your browser permissions.",
      );
      stopStream();
    }
  }

  function stop() {
    const recorder = recorderRef.current;
    stopTimer();
    setRecording(false);
    if (recorder && recorder.state !== "inactive") recorder.stop();
    recorderRef.current = null;
  }

  return (
    <div className="space-y-2">
      {previewing && (
        <div className="overflow-hidden rounded-xl border border-rose/40 bg-black">
          <video
            ref={previewRef}
            muted
            playsInline
            autoPlay
            className="aspect-square w-full object-cover"
          />
        </div>
      )}
      <button
        type="button"
        onMouseDown={start}
        onMouseUp={stop}
        onMouseLeave={recording ? stop : undefined}
        onTouchStart={(e) => {
          e.preventDefault();
          start();
        }}
        onTouchEnd={stop}
        disabled={disabled}
        aria-label={recording ? "Release to stop recording" : "Hold to record video"}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
          recording
            ? "border-rose bg-rose/10 text-rose"
            : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {recording ? (
          <>
            <Square size={13} strokeWidth={2} className="animate-pulse" />
            recording — {seconds}s / {MAX_SECONDS}s (release to stop)
          </>
        ) : (
          <>
            <Video size={13} strokeWidth={1.8} />
            hold to record video (up to {MAX_SECONDS}s)
          </>
        )}
      </button>
      {error && (
        <p className="text-[11.5px] text-rose">{error}</p>
      )}
    </div>
  );
}
