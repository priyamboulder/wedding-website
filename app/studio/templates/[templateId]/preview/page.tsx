// ═══════════════════════════════════════════════════════════════════════════════════
//   /studio/templates/[templateId]/preview
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Full-page preview of a wedding-website template rendered with placeholder
//   content. Reached from the studio's TemplateGallery via card click or the
//   Details link. Sticky bar offers Back to Templates and Use This Template,
//   the latter stashes the selection in localStorage and navigates to /studio
//   so WebsiteView can pick it up and switch into customize mode.
// ═══════════════════════════════════════════════════════════════════════════════════

"use client";

import { useRouter } from "next/navigation";
import { use, useMemo } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { TEMPLATES } from "@/components/studio/template-catalog";
import { TemplateRenderer, hasLiveRenderer } from "@/components/studio/site-templates";
import { PRIYA_ARJUN_BRAND, PRIYA_ARJUN_CONTENT } from "@/lib/wedding-site-seed";
import type { RenderBrand } from "@/types/wedding-site";

const PENDING_TEMPLATE_KEY = "studio:pending-template";

export default function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const router = useRouter();
  const template = TEMPLATES.find((t) => t.id === templateId);

  // Brand cascade derived from the template's own palette so each preview
  // looks specific to the template, not a generic gold accent.
  const brand: RenderBrand = useMemo(() => {
    if (!template) return PRIYA_ARJUN_BRAND;
    const [, , accent] = template.palette;
    return {
      ...PRIYA_ARJUN_BRAND,
      accent,
      accentSoft: `${accent}33`,
      displayFont: `"${template.typography.display}", ${PRIYA_ARJUN_BRAND.displayFont}`,
      bodyFont: `"${template.typography.body}", ${PRIYA_ARJUN_BRAND.bodyFont}`,
    };
  }, [template]);

  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory text-ink">
        <div className="text-center">
          <h1 className="font-serif text-2xl">Template not found</h1>
          <button
            onClick={() => router.push("/studio")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory hover:bg-ink-soft"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  function handleUseTemplate() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PENDING_TEMPLATE_KEY, template!.id);
    }
    router.push("/studio");
  }

  function handleBack() {
    router.push("/studio");
  }

  const live = hasLiveRenderer(template.id);

  return (
    <div className="min-h-screen bg-ivory text-ink">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
          <button
            type="button"
            onClick={handleBack}
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted transition-colors hover:text-ink"
          >
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Templates
          </button>

          <div className="hidden flex-col items-center sm:flex">
            <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-ink-faint">
              Preview · {template.style}
            </div>
            <div className="font-serif text-[18px] tracking-tight text-ink">{template.name}</div>
          </div>

          <button
            type="button"
            onClick={handleUseTemplate}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-ink-soft"
          >
            <Check className="h-3.5 w-3.5" />
            Use This Template
          </button>
        </div>
      </header>

      {/* Render */}
      <main>
        {live ? (
          <TemplateRenderer
            templateId={template.id}
            content={PRIYA_ARJUN_CONTENT}
            brand={brand}
            device="desktop"
            mode="showcase"
          />
        ) : (
          <ComingSoonPanel templateName={template.name} />
        )}
      </main>

      {/* Footer rail */}
      <div className="border-t border-ink/10 bg-card/60 px-6 py-6 text-center">
        <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-ink-faint">
          Preview rendered with sample content. Apply the template to edit it as your own.
        </div>
      </div>
    </div>
  );
}

function ComingSoonPanel({ templateName }: { templateName: string }) {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-32 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-faint">
        Live preview coming soon
      </div>
      <h2 className="mt-4 font-serif text-[36px] tracking-tight text-ink">{templateName}</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        This template hasn&rsquo;t been wired to the live renderer yet. Try Jodhpur, Pondicherry,
        Kolkata, or Jaisalmer for a fully scrolling preview.
      </p>
    </div>
  );
}
