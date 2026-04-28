"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogoTemplate } from "@/types/logo";
import { LOGO_SELECTED_RING, LOGO_TILE } from "@/types/logo";
import { LOGO_COMPONENTS, LOGO_TEMPLATES } from "./templates";
import { LogoDetailDrawer } from "./LogoDetailDrawer";
import {
  useBrandRenderData,
  type BrandProfile,
} from "@/lib/useBrandRenderData";

export interface LogoGalleryProps {
  profile: BrandProfile;
  selectedTemplateId: string | null;
  onSelect: (templateId: string) => void;
  onUnselect: () => void;
  templates?: LogoTemplate[];
  coupleSlug?: string;
  onToast?: (message: string) => void;
}

export function LogoGallery({
  profile,
  selectedTemplateId,
  onSelect,
  onUnselect,
  templates = LOGO_TEMPLATES,
  coupleSlug,
  onToast,
}: LogoGalleryProps) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailTemplate = templates.find((t) => t.id === detailId) ?? null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <LogoCard
            key={template.id}
            template={template}
            profile={profile}
            selected={selectedTemplateId === template.id}
            onApply={() => onSelect(template.id)}
            onOpenDetails={() => setDetailId(template.id)}
          />
        ))}
      </div>

      {detailTemplate && (
        <LogoDetailDrawer
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

function LogoCard({
  template,
  profile,
  selected,
  onApply,
  onOpenDetails,
}: {
  template: LogoTemplate;
  profile: BrandProfile;
  selected: boolean;
  onApply: () => void;
  onOpenDetails: () => void;
}) {
  const Component = LOGO_COMPONENTS[template.componentKey];
  const { logo } = useBrandRenderData(profile, {
    logoTemplateDefaultConnector: template.defaultConnector,
  });
  const effectiveConnector = template.compatibleConnectors.includes(logo.connector)
    ? logo.connector
    : template.defaultConnector;

  return (
    <div className="group">
      <button
        type="button"
        onClick={onApply}
        aria-pressed={selected}
        aria-label={`Apply ${template.name}`}
        className={cn(
          "relative block w-full overflow-hidden rounded-xl transition-all",
          selected ? "shadow-sm" : "hover:-translate-y-0.5",
        )}
        style={{
          aspectRatio: "16 / 10",
          background: LOGO_TILE,
          boxShadow: selected ? `0 0 0 2px ${LOGO_SELECTED_RING}` : undefined,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <Component
            names={logo.names}
            connector={effectiveConnector}
            color={logo.color}
          />
        </div>
        {selected && (
          <div
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-ivory shadow"
            style={{ background: LOGO_SELECTED_RING }}
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
            Wedding Logo
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

export default LogoGallery;
