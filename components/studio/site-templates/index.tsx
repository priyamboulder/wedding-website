// TemplateRenderer — dispatches to the correct renderer for each template type:
//   1. HTML iframe templates   (htmlFile set in catalog)     → HtmlIframeTemplate
//   2. Photo-art templates     (photoCategory set)           → PhotoArtTemplate
//   3. Legacy React renderers  (id in RENDERERS map)         → direct component

import type { ComponentType } from "react";
import type { TemplateRenderProps } from "@/types/wedding-site";
import { TEMPLATES } from "@/components/studio/template-catalog";
import HtmlIframeTemplate from "./HtmlIframeTemplate";
import PhotoArtTemplate from "./PhotoArtTemplate";

// Legacy hand-built React renderers (kept for backward compat)
import JodhpurTemplate from "./JodhpurTemplate";
import PondicherryTemplate from "./PondicherryTemplate";
import KolkataTemplate from "./KolkataTemplate";
import JaisalmerTemplate from "./JaisalmerTemplate";

const LEGACY_RENDERERS: Record<string, ComponentType<TemplateRenderProps>> = {
  jodhpur: JodhpurTemplate,
  pondicherry: PondicherryTemplate,
  kolkata: KolkataTemplate,
  jaisalmer: JaisalmerTemplate,
};

export interface TemplateRendererProps extends TemplateRenderProps {
  templateId: string;
  fallback?: React.ReactNode;
}

export function TemplateRenderer({ templateId, fallback, ...rest }: TemplateRendererProps) {
  const template = TEMPLATES.find((t) => t.id === templateId);

  // 1. HTML iframe template
  if (template?.htmlFile) {
    return <HtmlIframeTemplate htmlFile={template.htmlFile} {...rest} />;
  }

  // 2. Photo-art template
  if (template?.photoCategory) {
    return <PhotoArtTemplate photoCategory={template.photoCategory} {...rest} />;
  }

  // 3. Legacy React renderer
  const LegacyRenderer = LEGACY_RENDERERS[templateId];
  if (LegacyRenderer) return <LegacyRenderer {...rest} />;

  return <>{fallback ?? <ComingSoon />}</>;
}

export function hasLiveRenderer(templateId: string): boolean {
  const template = TEMPLATES.find((t) => t.id === templateId);
  return Boolean(
    template?.htmlFile || template?.photoCategory || templateId in LEGACY_RENDERERS,
  );
}

function ComingSoon() {
  return (
    <div
      style={{
        padding: "80px 24px",
        textAlign: "center",
        background: "#FAF7F2",
        color: "#6B6B6B",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          opacity: 0.6,
        }}
      >
        Live renderer coming soon
      </div>
      <div style={{ marginTop: 8, fontSize: 14 }}>
        This template&apos;s preview will render with your real content once the renderer ships.
      </div>
    </div>
  );
}
