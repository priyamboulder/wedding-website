"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import type { SlideConfig, TextStyle, TextAnimation } from "@/lib/social/types";

type Props = {
  slide: SlideConfig;
  index: number;
  total: number;
  imageValue: string;
  textValue: string;
  availableImages: string[];
  onImageChange: (dataUrl: string) => void;
  onTextChange: (value: string) => void;
};

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const STYLE_LABEL: Record<TextStyle, string> = {
  elegant_serif: "Elegant Serif",
  modern_sans: "Modern Sans",
  bold_impact: "Bold Impact",
  handwritten: "Handwritten",
  minimal: "Minimal",
};

const ANIMATION_LABEL: Record<TextAnimation, string> = {
  fade_up: "Fade Up",
  fade_in: "Fade In",
  slide_in_left: "Slide In Left",
  slide_in_right: "Slide In Right",
  typewriter: "Typewriter",
  none: "None",
};

function formatContentKey(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatTransition(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function SlideEditor({
  slide,
  index,
  total,
  imageValue,
  textValue,
  availableImages,
  onImageChange,
  onTextChange,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ingestFile = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) return;
    const dataUrl = await fileToDataUrl(file);
    onImageChange(dataUrl);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void ingestFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void ingestFile(file);
    e.target.value = "";
  };

  const isImageSlide = slide.type === "image";
  const durationSec = (slide.duration_ms / 1000).toFixed(1);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{slide.label}</p>
            <p className="text-[11px] text-neutral-500">
              Slide {index + 1} of {total} · {durationSec}s ·{" "}
              <span className="capitalize">{slide.type}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Image section */}
      {isImageSlide && (
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Image
          </label>
          {imageValue ? (
            <div className="relative overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageValue}
                alt={slide.label}
                className="aspect-[9/16] max-h-48 w-full object-cover"
              />
              <div className="absolute bottom-2 right-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-neutral-800 shadow hover:bg-white"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onImageChange("")}
                  className="rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-neutral-800 shadow hover:bg-white"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-5 text-center transition-colors ${
                isDragging
                  ? "border-neutral-700 bg-neutral-50"
                  : "border-neutral-300 hover:border-neutral-500"
              }`}
            >
              <p className="text-xs text-neutral-700">
                Drag &amp; drop an image, or{" "}
                <span className="underline">click to browse</span>
              </p>
              <p className="mt-1 text-[10px] text-neutral-500">JPG, PNG, WEBP</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={handleChange}
            className="hidden"
          />

          {availableImages.length > 0 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowLibrary((v) => !v)}
                className="text-[11px] text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
              >
                {showLibrary
                  ? "Hide content library"
                  : `Select from content library (${availableImages.length})`}
              </button>
              {showLibrary && (
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {availableImages.map((src, i) => (
                    <button
                      key={`${i}-${src.slice(0, 24)}`}
                      type="button"
                      onClick={() => {
                        onImageChange(src);
                        setShowLibrary(false);
                      }}
                      className={`relative aspect-square overflow-hidden rounded border transition-opacity hover:opacity-90 ${
                        imageValue === src
                          ? "border-neutral-900 ring-2 ring-neutral-900"
                          : "border-neutral-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Library option ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Text overlay */}
      {slide.text_overlay && (
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            {formatContentKey(slide.text_overlay.content_key)}
          </label>
          <input
            type="text"
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={`Enter ${formatContentKey(slide.text_overlay.content_key).toLowerCase()}`}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <p className="mt-1 text-[10px] text-neutral-500">
            {STYLE_LABEL[slide.text_overlay.style]} ·{" "}
            {ANIMATION_LABEL[slide.text_overlay.animation]}
          </p>
        </div>
      )}

      {/* Read-only info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-neutral-100 pt-3 text-[10px] text-neutral-500">
        <span>
          In: <span className="text-neutral-700">{formatTransition(slide.transition_in)}</span>
        </span>
        <span>
          Out: <span className="text-neutral-700">{formatTransition(slide.transition_out)}</span>
        </span>
        {slide.ken_burns && (
          <span>
            Ken Burns:{" "}
            <span className="text-neutral-700">
              {formatTransition(slide.ken_burns.direction)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
