"use client";

import { useState } from "react";
import { Download, Smartphone, PlayCircle, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoAspect, VideoMeta } from "@/types/vendor-discovery";

// One-click social export. In production this would fire off a CDN-side
// re-encode (Mux / Cloudflare Stream) returning a signed URL per aspect.
// Here we expose the presets + branded-watermark toggle, simulate the
// render, and return an object URL so the UX loop works end-to-end.

interface ExportPreset {
  id: string;
  label: string;
  subtext: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  aspect: VideoAspect;
}

const PRESETS: ExportPreset[] = [
  { id: "reels",     label: "Instagram Reels",   subtext: "9:16 · 1080x1920", icon: Smartphone, aspect: "9:16" },
  { id: "shorts",    label: "YouTube Shorts",    subtext: "9:16 · 1080x1920", icon: PlayCircle, aspect: "9:16" },
  { id: "landscape", label: "Standard Landscape", subtext: "16:9 · 1920x1080", icon: Monitor,    aspect: "16:9" },
];

export function VideoExportMenu({
  video,
  vendorName,
  onExport,
}: {
  video: VideoMeta;
  vendorName: string;
  onExport?: (presetId: string, watermark: boolean) => void;
}) {
  const [watermark, setWatermark] = useState(true);
  const [rendering, setRendering] = useState<string | null>(null);
  const [rendered, setRendered] = useState<string[]>([]);

  async function handleExport(preset: ExportPreset) {
    setRendering(preset.id);
    // Simulate re-encode.
    await new Promise((r) => setTimeout(r, 900));
    setRendered((xs) => [...xs, preset.id]);
    setRendering(null);
    onExport?.(preset.id, watermark);
    // Trigger a stub download so the UI has a real downstream effect.
    const a = document.createElement("a");
    a.href = video.src_url;
    a.download = `${vendorName.replace(/\s+/g, "_")}_${preset.id}${watermark ? "_watermarked" : ""}.mp4`;
    a.click();
  }

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-white p-4">
      <header className="flex items-center justify-between">
        <h4 className="font-serif text-[14px] text-ink">Export for social</h4>
        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-ink-muted">
          <input
            type="checkbox"
            checked={watermark}
            onChange={(e) => setWatermark(e.target.checked)}
            className="h-3 w-3 accent-gold"
          />
          Brand watermark · {vendorName}
        </label>
      </header>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {PRESETS.map((preset) => {
          const isRendering = rendering === preset.id;
          const isDone = rendered.includes(preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              disabled={isRendering}
              onClick={() => handleExport(preset)}
              className={cn(
                "group flex flex-col items-start gap-1 rounded-[8px] border border-border bg-ivory-warm p-3 text-left transition-all",
                "hover:border-gold/40 hover:bg-gold-pale/30",
                isRendering && "opacity-60",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <preset.icon size={16} strokeWidth={1.6} className="text-ink-muted" />
                {isDone ? (
                  <Check size={14} strokeWidth={2} className="text-sage" />
                ) : isRendering ? (
                  <span
                    className="font-mono text-[9.5px] text-gold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    rendering…
                  </span>
                ) : (
                  <Download
                    size={12}
                    strokeWidth={1.6}
                    className="text-ink-faint transition-colors group-hover:text-gold"
                  />
                )}
              </div>
              <div className="text-[12.5px] font-medium text-ink">{preset.label}</div>
              <div
                className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {preset.subtext}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
