"use client";

// ── Audio recorder (MediaRecorder API) ────────────────────────────────────
// Hold-to-record pattern. Caps at MAX_SECONDS. On release (or max hit) hands
// a Blob back to the parent. No external libs — browser-native.

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SECONDS = 45;

function pickAudioMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
  ];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m));
}

export function AudioRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (blob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
  }

  async function start() {
    if (disabled || recording) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickAudioMime();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mime ?? "audio/webm",
        });
        const duration = Math.min(
          MAX_SECONDS,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );
        onRecorded(blob, duration);
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
      console.error("AudioRecorder start failed:", e);
      setError(
        "We couldn't access your microphone. Check your browser permissions."
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
        aria-label={recording ? "Release to stop recording" : "Hold to record audio"}
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
            <Mic size={13} strokeWidth={1.8} />
            hold to record audio (up to {MAX_SECONDS}s)
          </>
        )}
      </button>
      {error && (
        <p className="text-[11.5px] text-rose">{error}</p>
      )}
    </div>
  );
}
