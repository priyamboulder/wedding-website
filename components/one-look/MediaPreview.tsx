"use client";

// ── Media preview after recording ─────────────────────────────────────────
// Shows playback of the just-recorded audio or video plus "re-record" and
// "delete" buttons. Takes a raw Blob so no IndexedDB round-trip is needed
// before publish.

import { useEffect, useMemo } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MediaPreview({
  blob,
  kind,
  durationSeconds,
  thumbnailDataUrl,
  onReRecord,
  onDelete,
}: {
  blob: Blob;
  kind: "audio" | "video";
  durationSeconds: number;
  thumbnailDataUrl?: string | null;
  onReRecord: () => void;
  onDelete: () => void;
}) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="space-y-2 rounded-md border border-gold/30 bg-gold-pale/20 p-3">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {kind === "audio" ? "audio recorded" : "video recorded"} · {durationSeconds}s
      </p>
      {kind === "audio" ? (
        <audio controls src={url} className="w-full" />
      ) : (
        <video
          controls
          src={url}
          poster={thumbnailDataUrl ?? undefined}
          playsInline
          className="aspect-square w-full rounded-lg bg-black object-cover"
        />
      )}
      <div className="flex gap-2">
        <PreviewButton icon={<RotateCcw size={12} strokeWidth={1.8} />} onClick={onReRecord}>
          Re-record
        </PreviewButton>
        <PreviewButton icon={<Trash2 size={12} strokeWidth={1.8} />} onClick={onDelete} tone="danger">
          Delete
        </PreviewButton>
      </div>
    </div>
  );
}

function PreviewButton({
  onClick,
  icon,
  children,
  tone = "default",
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors",
        tone === "danger"
          ? "text-rose hover:border-rose/40"
          : "text-ink-muted hover:border-saffron/40 hover:text-saffron",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {icon}
      {children}
    </button>
  );
}
