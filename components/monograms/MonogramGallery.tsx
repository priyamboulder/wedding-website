"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MonogramProps, MonogramTemplate } from "@/types/monogram";
import { MONOGRAM_SELECTED_RING, MONOGRAM_TILE } from "@/types/monogram";
import { MONOGRAM_COMPONENTS, MONOGRAM_TEMPLATES } from "./templates";
import { MonogramDetailDrawer } from "./MonogramDetailDrawer";
import { useMonogramRenderData } from "@/lib/useMonogramRenderData";

export interface MonogramGalleryProps {
  profile: MonogramProps;
  selectedTemplateId: string | null;
  onSelect: (templateId: string) => void;
  onUnselect: () => void;
  templates?: MonogramTemplate[];
  coupleSlug?: string;
  onToast?: (message: string) => void;
}

export function MonogramGallery({
  profile,
  selectedTemplateId,
  onSelect,
  onUnselect,
  templates = MONOGRAM_TEMPLATES,
  coupleSlug,
  onToast,
}: MonogramGalleryProps) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailTemplate = templates.find((t) => t.id === detailId) ?? null;
  const rendered = useMonogramRenderData(profile);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <MonogramCard
            key={template.id}
            template={template}
            profile={rendered}
            selected={selectedTemplateId === template.id}
            onApply={() => onSelect(template.id)}
            onOpenDetails={() => setDetailId(template.id)}
          />
        ))}
      </div>

      {detailTemplate && (
        <MonogramDetailDrawer
          template={detailTemplate}
          profile={profile}
          selected={selectedTemplateId === detailTemplate.id}
          onApply={() => onSelect(detailTemplate.id)}
          onUnapply={onUnselect}
          onClose={() => setDetailId(null)}
          coupleSlug={coupleSlug}
          onToast={onToast}
        />
      )}
    </div>
  );
}

function MonogramCard({
  template,
  profile,
  selected,
  onApply,
  onOpenDetails,
}: {
  template: MonogramTemplate;
  profile: MonogramProps;
  selected: boolean;
  onApply: () => void;
  onOpenDetails: () => void;
}) {
  const Component = MONOGRAM_COMPONENTS[template.componentKey];

  return (
    <div className="group">
      <button
        type="button"
        onClick={onApply}
        aria-pressed={selected}
        aria-label={`Apply ${template.name}`}
        className={cn(
          "relative block w-full overflow-hidden rounded-xl transition-all",
          selected ? "shadow-sm" : "hover:-translate-y-0.5"
        )}
        style={{
          aspectRatio: "16 / 10",
          background: MONOGRAM_TILE,
          boxShadow: selected ? `0 0 0 2px ${MONOGRAM_SELECTED_RING}` : undefined,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <Component {...profile} />
        </div>
        {selected && (
          <div
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-ivory shadow"
            style={{ background: MONOGRAM_SELECTED_RING }}
            aria-hidden="true"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
        )}
      </button>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div>
          <div
            className="text-xs italic text-ink-muted"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Wedding Monogram
          </div>
          <div
            className="mt-0.5 text-base text-ink"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {template.name}
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenDetails}
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          style={{ fontFamily: "'JetBrains Mono', monospace", textDecoration: "underline" }}
        >
          Details
        </button>
      </div>
    </div>
  );
}

export default MonogramGallery;
