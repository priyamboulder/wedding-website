"use client";

// ═══════════════════════════════════════════════════════════════════════════════════
//   PUBLIC WEDDING LOOKBOOK
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Shareable digital magazine spread auto-generated from the couple's
//   analysed photo library (see /studio/content). The token matches the
//   lookbook saved in the content-studio store.
//
//   Pure reader view: no auth, no sidebar, no nav. Works when the couple
//   shares the link with family — any visitor can see it.
// ═══════════════════════════════════════════════════════════════════════════════════

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useContentStudioStore } from "@/stores/content-studio-store";
import { EVENT_LABEL } from "@/lib/content-studio-templates";

export default function LookbookPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const lookbook = useContentStudioStore((s) => s.lookbook);
  const photos = useContentStudioStore((s) => s.photos);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const photoMap = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);

  if (!hydrated) return (
    <main className="flex min-h-screen items-center justify-center bg-ivory">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-faint border-t-ink" />
    </main>
  );

  if (!lookbook || lookbook.token !== token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory px-6 py-24 text-center">
        <div className="max-w-md">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">lookbook</p>
          <h1 className="mt-2 font-serif text-[28px] text-ink">this lookbook isn't available</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
            the link may have expired, or the couple deleted it. ask them to share a fresh one from their content studio.
          </p>
        </div>
      </main>
    );
  }

  const heroId = lookbook.sections[0]?.photo_ids[0];
  const heroPhoto = heroId ? photoMap.get(heroId) : null;

  return (
    <main className="min-h-screen bg-ivory text-ink">
      {/* Hero */}
      <section className="relative">
        {heroPhoto ? (
          <div className="relative h-[70vh] w-full overflow-hidden bg-ink-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroPhoto.thumbnail_url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/70" />
          </div>
        ) : (
          <div className="h-[40vh] w-full bg-gradient-to-b from-ivory-warm to-ivory" />
        )}
        <div className="absolute inset-x-0 bottom-8 text-center text-ivory">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ivory/80">our wedding</p>
          <h1 className="mt-2 font-serif text-[44px] leading-tight sm:text-[56px]">{lookbook.title}</h1>
          <p className="mt-2 font-mono text-[11.5px] uppercase tracking-[0.16em] text-ivory/80">{lookbook.subtitle}</p>
        </div>
      </section>

      {/* Sections */}
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        {lookbook.sections.map((section, idx) => {
          const sectionPhotos = section.photo_ids
            .map((id) => photoMap.get(id))
            .filter(Boolean) as NonNullable<ReturnType<typeof photoMap.get>>[];
          if (sectionPhotos.length === 0) return null;
          const label = EVENT_LABEL[section.event] ?? section.label;
          return (
            <section key={section.event} className="mb-20">
              <div className="mb-6 flex items-baseline gap-3 border-b border-border pb-3">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-gold">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h2 className="font-serif text-[28px] lowercase text-ink">—— {label.toLowerCase()}</h2>
              </div>
              <SectionGrid photos={sectionPhotos} variant={sectionVariant(section.event)} />
            </section>
          );
        })}

        <footer className="mt-12 border-t border-border pt-10 text-center">
          <p className="font-serif text-[22px] text-ink">with love,</p>
          <p className="mt-1 font-serif text-[28px] italic text-ink">{lookbook.title}</p>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            made with ananya · wedding planning
          </p>
        </footer>
      </div>
    </main>
  );
}

type LookbookPhoto = { id: string; thumbnail_url: string };

function sectionVariant(event: string): "masonry" | "hero" | "grid" {
  if (event === "portraits") return "hero";
  if (event === "details") return "masonry";
  return "grid";
}

function SectionGrid({ photos, variant }: { photos: LookbookPhoto[]; variant: "masonry" | "hero" | "grid" }) {
  if (variant === "hero") {
    const [lead, ...rest] = photos;
    return (
      <div className="space-y-3">
        {lead && (
          <div className="aspect-[16/10] overflow-hidden rounded-md bg-ivory-warm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lead.thumbnail_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rest.map((p) => (
              <div key={p.id} className="aspect-[4/5] overflow-hidden rounded-md bg-ivory-warm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  if (variant === "masonry") {
    return (
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4">
        {photos.map((p) => (
          <div key={p.id} className="mb-3 break-inside-avoid overflow-hidden rounded-md bg-ivory-warm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbnail_url} alt="" className="w-full" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((p) => (
        <div key={p.id} className="aspect-[4/5] overflow-hidden rounded-md bg-ivory-warm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}
