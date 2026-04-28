"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type {
  BrandColors,
  KenBurns,
  ReelTemplate,
  SlideConfig,
  SlideTransition,
  TextAnimation,
  TextOverlay,
  TextPosition,
  TextStyle,
} from "@/lib/social/types";
import PhoneMockup from "./PhoneMockup";
import ReelTimeline from "./ReelTimeline";
import TagInput from "./TagInput";

type Props = {
  template: ReelTemplate;
  slideImages: Record<string, string>;
  slideTexts: Record<string, string>;
  caption: string;
  hashtags: string[];
  brandColors: BrandColors;
  onCaptionChange: (value: string) => void;
  onHashtagsChange: (value: string[]) => void;
  onSaveDraft: () => void;
  onApprove: () => void;
  onEditContent: () => void;
  onChooseTemplate: () => void;
  isSaving?: boolean;
};

// ── Helpers ────────────────────────────────────────────────────────────────

const TRANSITION_MS: Record<SlideTransition, number> = {
  fade: 500,
  slide_left: 500,
  slide_right: 500,
  zoom: 500,
  dissolve: 800,
  none: 0,
};

const STYLE_CLASS: Record<TextStyle, string> = {
  elegant_serif: "font-serif text-[22px] font-medium leading-tight",
  modern_sans: "font-sans text-[20px] font-medium leading-tight",
  bold_impact: "font-sans text-[26px] font-extrabold uppercase leading-none tracking-tight",
  handwritten: "text-[24px] leading-tight italic",
  minimal: "font-sans text-[14px] font-light leading-snug",
};

const POSITION_CLASS: Record<TextPosition, string> = {
  top_center: "top-8 left-1/2 -translate-x-1/2 text-center",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center",
  bottom_center: "bottom-10 left-1/2 -translate-x-1/2 text-center",
  bottom_left: "bottom-10 left-6 text-left",
  bottom_right: "bottom-10 right-6 text-right",
};

function cumulativeStarts(slides: SlideConfig[]): number[] {
  const out: number[] = [];
  let t = 0;
  for (const s of slides) {
    out.push(t);
    t += s.duration_ms;
  }
  return out;
}

function kenBurnsTransform(kb: KenBurns | undefined, progress: number): string {
  if (!kb) return "";
  const intensity = Math.max(0, Math.min(1, kb.intensity ?? 0.15));
  const p = Math.max(0, Math.min(1, progress));
  switch (kb.direction) {
    case "zoom_in":
      return `scale(${1 + intensity * p})`;
    case "zoom_out":
      return `scale(${1 + intensity * (1 - p)})`;
    case "pan_left":
      // start at 0, pan toward -intensity*100px as progress advances
      return `scale(${1 + intensity * 0.5}) translateX(${-intensity * 100 * p}px)`;
    case "pan_right":
      return `scale(${1 + intensity * 0.5}) translateX(${-intensity * 100 * (1 - p)}px)`;
    default:
      return "";
  }
}

function textAnimationStyle(
  anim: TextAnimation,
  msSinceSlideStart: number,
  text: string,
): CSSProperties & { __typedText?: string } {
  const delay = 300;
  const duration = 500;
  const t = Math.max(0, msSinceSlideStart - delay);
  const p = Math.max(0, Math.min(1, t / duration));

  if (anim === "typewriter") {
    const revealMs = 40;
    const chars = Math.max(0, Math.min(text.length, Math.floor(t / revealMs)));
    return { opacity: 1, __typedText: text.slice(0, chars) };
  }

  const base: CSSProperties = { opacity: p };
  if (anim === "fade_up") {
    base.transform = `translateY(${(1 - p) * 20}px)`;
  } else if (anim === "slide_in_left") {
    base.transform = `translateX(${(1 - p) * -30}px)`;
  } else if (anim === "slide_in_right") {
    base.transform = `translateX(${(1 - p) * 30}px)`;
  } else if (anim === "none") {
    base.opacity = 1;
  }
  return base;
}

/**
 * Style for a slide layer given how far past its start/end we are.
 * `state` is either "entering" (during transition_in) or "leaving" (during transition_out)
 * or "active" (fully visible).
 */
function layerTransitionStyle(
  state: "entering" | "leaving" | "active",
  transition: SlideTransition,
  progress: number, // 0..1
): CSSProperties {
  if (state === "active") return { opacity: 1 };
  const p = Math.max(0, Math.min(1, progress));
  if (transition === "none") {
    return { opacity: state === "entering" ? 1 : 0 };
  }
  if (transition === "fade" || transition === "dissolve") {
    return { opacity: state === "entering" ? p : 1 - p };
  }
  if (transition === "slide_left") {
    return {
      opacity: 1,
      transform:
        state === "entering"
          ? `translateX(${(1 - p) * 100}%)`
          : `translateX(${-p * 100}%)`,
    };
  }
  if (transition === "slide_right") {
    return {
      opacity: 1,
      transform:
        state === "entering"
          ? `translateX(${(1 - p) * -100}%)`
          : `translateX(${p * 100}%)`,
    };
  }
  if (transition === "zoom") {
    return state === "entering"
      ? { opacity: p, transform: `scale(${0.9 + 0.1 * p})` }
      : { opacity: 1 - p, transform: `scale(${1 + 0.1 * p})` };
  }
  return {};
}

// ── Slide renderer ─────────────────────────────────────────────────────────

type SlideLayerProps = {
  slide: SlideConfig;
  imageSrc: string;
  text: string;
  brandColors: BrandColors;
  kbProgress: number; // 0..1 for Ken Burns
  msSinceSlideStart: number; // for text animation
  layerStyle: CSSProperties;
};

function SlideLayer({
  slide,
  imageSrc,
  text,
  brandColors,
  kbProgress,
  msSinceSlideStart,
  layerStyle,
}: SlideLayerProps) {
  const overlay = slide.text_overlay;
  const textStyle = overlay
    ? textAnimationStyle(overlay.animation, msSinceSlideStart, text)
    : null;
  const displayedText =
    overlay && textStyle && "__typedText" in textStyle
      ? (textStyle as { __typedText?: string }).__typedText ?? ""
      : text;

  const kbTransform = kenBurnsTransform(slide.ken_burns, kbProgress);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={layerStyle}
    >
      {/* Image layer */}
      {slide.type === "image" && imageSrc ? (
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: kbTransform || "none",
            transformOrigin: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={slide.label}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      ) : (
        // Text-only slide or missing image: solid brand background
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`,
          }}
        />
      )}

      {/* Vignette for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

      {/* Text overlay */}
      {overlay && displayedText && (
        <TextLabel
          overlay={overlay}
          text={displayedText}
          brandColors={brandColors}
          style={{
            opacity: textStyle?.opacity,
            transform: textStyle?.transform,
          }}
        />
      )}
    </div>
  );
}

function TextLabel({
  overlay,
  text,
  brandColors,
  style,
}: {
  overlay: TextOverlay;
  text: string;
  brandColors: BrandColors;
  style: CSSProperties;
}) {
  const positionClass = POSITION_CLASS[overlay.position];
  const styleClass = STYLE_CLASS[overlay.style];
  // Use accent color for elegant/handwritten, otherwise white with shadow.
  const useBrand =
    overlay.style === "elegant_serif" || overlay.style === "handwritten";
  const colorStyle: CSSProperties = useBrand
    ? { color: brandColors.accent, textShadow: "0 1px 2px rgba(0,0,0,0.6)" }
    : { color: "#ffffff", textShadow: "0 2px 4px rgba(0,0,0,0.7)" };

  return (
    <div
      className={`absolute max-w-[85%] px-3 ${positionClass} ${styleClass}`}
      style={{ ...colorStyle, ...style }}
    >
      {text}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function ReelPreview({
  template,
  slideImages,
  slideTexts,
  caption,
  hashtags,
  brandColors,
  onCaptionChange,
  onHashtagsChange,
  onSaveDraft,
  onApprove,
  onEditContent,
  onChooseTemplate,
  isSaving = false,
}: Props) {
  const slides = template.template_config.slides;
  const totalMs = template.template_config.duration_ms;
  const starts = useMemo(() => cumulativeStarts(slides), [slides]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  // Keep ref in sync for the raf loop (avoids stale closure)
  useEffect(() => {
    elapsedRef.current = elapsedMs;
  }, [elapsedMs]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = null;
      return;
    }

    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      const next = elapsedRef.current + dt;
      if (next >= totalMs) {
        elapsedRef.current = totalMs;
        setElapsedMs(totalMs);
        setIsPlaying(false);
        return;
      }
      elapsedRef.current = next;
      setElapsedMs(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [isPlaying, totalMs]);

  const handlePlayPause = () => {
    if (!isPlaying && elapsedMs >= totalMs) {
      elapsedRef.current = 0;
      setElapsedMs(0);
    }
    setIsPlaying((v) => !v);
  };

  const handleRestart = () => {
    elapsedRef.current = 0;
    setElapsedMs(0);
    setIsPlaying(true);
  };

  const handleJump = (slideIndex: number) => {
    const t = starts[slideIndex] ?? 0;
    elapsedRef.current = t;
    setElapsedMs(t);
  };

  // Determine which slide is current and render active + adjacent layers.
  const currentIndex = useMemo(() => {
    for (let i = slides.length - 1; i >= 0; i--) {
      if (elapsedMs >= starts[i]) return i;
    }
    return 0;
  }, [elapsedMs, starts, slides.length]);

  const currentSlide = slides[currentIndex];
  const currentStart = starts[currentIndex];
  const msIn = elapsedMs - currentStart;
  const slideProgress = Math.max(0, Math.min(1, msIn / currentSlide.duration_ms));

  // Transition window: last TRANSITION_MS of current slide overlaps first TRANSITION_MS of next slide.
  const isLast = currentIndex === slides.length - 1;
  const nextSlide = isLast ? null : slides[currentIndex + 1];
  const outTransition = currentSlide.transition_out;
  const outMs = TRANSITION_MS[outTransition];
  const remaining = currentSlide.duration_ms - msIn;
  const inTransition = nextSlide?.transition_in ?? "none";

  // We render the next slide only during the overlap window.
  const showNext = !!nextSlide && remaining <= outMs;
  const transitionProgress = showNext ? 1 - remaining / outMs : 0;

  const currentLayerStyle = showNext
    ? layerTransitionStyle("leaving", outTransition, transitionProgress)
    : layerTransitionStyle("active", outTransition, 0);
  const nextLayerStyle = showNext
    ? layerTransitionStyle("entering", inTransition, transitionProgress)
    : { opacity: 0 };

  const currentText = currentSlide.text_overlay
    ? slideTexts[currentSlide.id] ?? ""
    : "";
  const nextText = nextSlide?.text_overlay
    ? slideTexts[nextSlide.id] ?? ""
    : "";

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
            Step 3 · Preview
          </p>
          <h2 className="mt-1 text-xl font-semibold text-neutral-900">
            {template.name}
          </h2>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
        {/* Phone + controls */}
        <div className="flex flex-col items-center">
          <div className="rounded-2xl bg-neutral-950 p-6">
            <PhoneMockup>
              <div className="absolute inset-0 bg-black">
                <SlideLayer
                  slide={currentSlide}
                  imageSrc={slideImages[currentSlide.id] ?? ""}
                  text={currentText}
                  brandColors={brandColors}
                  kbProgress={slideProgress}
                  msSinceSlideStart={msIn}
                  layerStyle={currentLayerStyle}
                />
                {showNext && nextSlide && (
                  <SlideLayer
                    slide={nextSlide}
                    imageSrc={slideImages[nextSlide.id] ?? ""}
                    text={nextText}
                    brandColors={brandColors}
                    kbProgress={0}
                    msSinceSlideStart={0}
                    layerStyle={nextLayerStyle}
                  />
                )}
              </div>
            </PhoneMockup>
          </div>

          {/* Controls */}
          <div className="mt-4 flex w-[270px] flex-col gap-2">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handlePlayPause}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="2" y="1" width="4" height="12" rx="1" />
                    <rect x="8" y="1" width="4" height="12" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M2 1 L12 7 L2 13 Z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                aria-label="Restart"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 7a4 4 0 1 0 1.2-2.8" strokeLinecap="round" />
                  <path d="M3 2v3h3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-neutral-900 transition-[width] duration-100"
                style={{ width: `${(elapsedMs / totalMs) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>{(elapsedMs / 1000).toFixed(1)}s</span>
              <span>{(totalMs / 1000).toFixed(1)}s</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-4 w-full max-w-md">
            <ReelTimeline
              slides={slides}
              currentIndex={currentIndex}
              elapsedMs={elapsedMs}
              totalMs={totalMs}
              onJump={handleJump}
            />
          </div>
        </div>

        {/* Right column: caption + hashtags + actions */}
        <div className="space-y-5">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              rows={6}
              placeholder="Write a caption for your Reel."
              className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />

            <label className="mb-1 mt-4 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Hashtags
            </label>
            <TagInput
              value={hashtags}
              onChange={onHashtagsChange}
              prefix="#"
            />
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSaving}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-500 disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={onApprove}
                disabled={isSaving}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
              >
                Approve &amp; Queue
              </button>
              <button
                type="button"
                onClick={onEditContent}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-500"
              >
                Edit Content
              </button>
              <button
                type="button"
                onClick={onChooseTemplate}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-500"
              >
                Choose Different Template
              </button>
            </div>
            <p className="mt-3 text-[11px] text-neutral-500">
              Full video rendering coming soon — use this preview as a storyboard for your Reel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
