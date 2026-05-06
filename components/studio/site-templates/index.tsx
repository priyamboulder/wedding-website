// ═══════════════════════════════════════════════════════════════════════════════════
//   TemplateRenderer — registry that maps templateId → renderer component
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Same component (and same content) drives:
//     - card thumbnails in the gallery (mode="preview", scaled with CSS transform)
//     - full-screen overlay preview (mode="showcase")
//     - the public /wedding/[slug] route (mode="showcase")
//
//   To add a new live template: build XxxTemplate.tsx alongside JodhpurTemplate,
//   import it here, and register it in RENDERERS. The gallery card will pick it
//   up automatically as soon as its id matches a key.
// ═══════════════════════════════════════════════════════════════════════════════════

import type { ComponentType } from "react";
import type { TemplateRenderProps } from "@/types/wedding-site";
import JodhpurTemplate from "./JodhpurTemplate";
import PondicherryTemplate from "./PondicherryTemplate";
import KolkataTemplate from "./KolkataTemplate";
import JaisalmerTemplate from "./JaisalmerTemplate";

const RENDERERS: Record<string, ComponentType<TemplateRenderProps>> = {
  jodhpur: JodhpurTemplate,
  pondicherry: PondicherryTemplate,
  kolkata: KolkataTemplate,
  jaisalmer: JaisalmerTemplate,
};

export interface TemplateRendererProps extends TemplateRenderProps {
  templateId: string;
  /** Renders a "Coming soon" stand-in if the template has no live renderer yet. */
  fallback?: React.ReactNode;
}

export function TemplateRenderer({ templateId, fallback, ...rest }: TemplateRendererProps) {
  const Renderer = RENDERERS[templateId];
  if (!Renderer) return <>{fallback ?? <ComingSoon />}</>;
  return <Renderer {...rest} />;
}

export function hasLiveRenderer(templateId: string): boolean {
  return templateId in RENDERERS;
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
        This template's preview will render with your real content once the renderer ships.
      </div>
    </div>
  );
}
