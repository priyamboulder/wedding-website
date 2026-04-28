"use client";

import type { ReelTemplate, ReelTemplateCategory } from "@/lib/social/types";

type Props = {
  template: ReelTemplate;
  onSelect: (template: ReelTemplate) => void;
};

const CATEGORY_LABELS: Record<ReelTemplateCategory, string> = {
  showcase: "Showcase",
  testimonial: "Testimonial",
  behind_the_scenes: "Behind the Scenes",
  announcement: "Announcement",
  tips: "Tips",
  intro: "Intro",
};

const CATEGORY_BADGE: Record<ReelTemplateCategory, string> = {
  showcase: "bg-rose-100 text-rose-800",
  testimonial: "bg-amber-100 text-amber-800",
  behind_the_scenes: "bg-emerald-100 text-emerald-800",
  announcement: "bg-violet-100 text-violet-800",
  tips: "bg-sky-100 text-sky-800",
  intro: "bg-neutral-200 text-neutral-800",
};

// Per-category gradient used on the animated thumbnail surface.
const CATEGORY_GRADIENT: Record<ReelTemplateCategory, string> = {
  showcase: "from-rose-300 via-amber-200 to-rose-500",
  testimonial: "from-amber-300 via-orange-200 to-rose-400",
  behind_the_scenes: "from-emerald-300 via-teal-200 to-emerald-500",
  announcement: "from-violet-300 via-fuchsia-200 to-violet-500",
  tips: "from-sky-300 via-blue-200 to-sky-500",
  intro: "from-neutral-400 via-neutral-300 to-neutral-600",
};

function formatDuration(ms: number): string {
  const s = Math.round(ms / 100) / 10;
  return Number.isInteger(s) ? `${s.toFixed(0)} sec` : `${s.toFixed(1)} sec`;
}

function formatVendorType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ReelTemplateCard({ template, onSelect }: Props) {
  const imageSlideCount = template.template_config.slides.filter(
    (s) => s.type === "image",
  ).length;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md">
      {/* Animated thumbnail */}
      <div
        className={`relative aspect-[9/16] max-h-56 overflow-hidden bg-gradient-to-br ${CATEGORY_GRADIENT[template.category]}`}
      >
        {/* Ken Burns-style slow zoom */}
        <div className="absolute inset-0 animate-[reel-zoom_6s_ease-in-out_infinite_alternate] bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.35),_transparent_70%)]" />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[reel-shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        {/* Slide count */}
        <div className="absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
          {template.template_config.slides.length} slides
        </div>
        {template.is_premium && (
          <div className="absolute left-2 top-2 rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-200 backdrop-blur">
            Premium
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-neutral-900">
            {template.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${CATEGORY_BADGE[template.category]}`}
          >
            {CATEGORY_LABELS[template.category]}
          </span>
        </div>

        <p className="mb-3 line-clamp-2 text-xs text-neutral-600">
          {template.description}
        </p>

        <div className="mb-3 flex items-center gap-3 text-[11px] text-neutral-500">
          <span>{formatDuration(template.template_config.duration_ms)}</span>
          <span aria-hidden="true">·</span>
          <span>{imageSlideCount} photos needed</span>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
            Best for
          </p>
          <p className="mt-0.5 text-xs text-neutral-700">
            {template.vendor_types.length === 0
              ? "All vendors"
              : template.vendor_types.map(formatVendorType).join(", ")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelect(template)}
          className="mt-auto w-full rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
        >
          Use Template
        </button>
      </div>
    </div>
  );
}
