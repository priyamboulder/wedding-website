"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useEventsStore } from "@/stores/events-store";
import { generateEventThemes, generateEventNames } from "@/lib/events/ai";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import type { EventRecord } from "@/types/events";

// Per-event-type photo — most suitable portfolio shot for each ceremony.
const EVENT_PHOTO: Record<string, string> = {
  mehndi:      "/images/portfolio/mehendi/mehendi-01.jpg",
  haldi:       "/images/portfolio/haldi/haldi-01.jpg",
  sangeet:     "/images/portfolio/sangeet/sangeet-01.jpg",
  baraat:      "/images/portfolio/baraat/baraat-01.jpg",
  wedding:     "/images/portfolio/wedding/wedding-01.jpg",
  reception:   "/images/portfolio/wedding/wedding-03.jpg",
  pre_wedding: "/images/portfolio/pre-wedding/pre-01.jpg",
  engagement:  "/images/portfolio/pre-wedding/pre-02.jpg",
  portrait:    "/images/portfolio/portrait/portrait-01.jpg",
  custom:      "/images/portfolio/best/best-01.jpg",
};

const FALLBACK_PHOTOS = [
  "/images/portfolio/best/best-02.jpg",
  "/images/portfolio/best/best-04.jpg",
  "/images/portfolio/best/best-06.jpg",
  "/images/portfolio/best/best-08.jpg",
  "/images/portfolio/best/best-10.jpg",
  "/images/portfolio/best/best-12.jpg",
  "/images/portfolio/best/best-14.jpg",
];

function photoFor(eventType: string, index: number): string {
  return EVENT_PHOTO[eventType] ?? FALLBACK_PHOTOS[index % FALLBACK_PHOTOS.length];
}

export function EventThemesStrip() {
  const events = useEventsStore((s) => s.events);
  const coupleContext = useEventsStore((s) => s.coupleContext);

  const ctx = useMemo(
    () => ({ coupleContext, events }),
    [coupleContext, events],
  );
  const names = useMemo(() => generateEventNames(ctx), [ctx]);
  const themes = useMemo(() => generateEventThemes(ctx), [ctx]);

  return (
    <section className="mt-12">
      <h2
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Your events
      </h2>
      {events.length === 0 ? (
        // Empty state: teaser photo grid + CTA
        <div className="mt-4">
          <div className="grid h-[160px] grid-cols-3 gap-1.5 overflow-hidden">
            {[
              "/images/portfolio/wedding/wedding-02.jpg",
              "/images/portfolio/sangeet/sangeet-02.jpg",
              "/images/portfolio/haldi/haldi-02.jpg",
            ].map((src, i) => (
              <div key={i} className="relative h-full overflow-hidden bg-[#e8e0d8]">
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover opacity-80"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <Link
            href="/events"
            className="mt-3 inline-flex items-center gap-2 border border-gold/40 bg-gold-pale/30 px-4 py-3 text-[13px] text-ink transition-colors hover:bg-gold-pale/50"
          >
            Generate event themes →
          </Link>
        </div>
      ) : (
        <div className="mt-4 -mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
          {events.map((e, i) => {
            const name = names.find((n) => n.eventId === e.id)?.name ?? labelFor(e);
            const themeNarrative =
              themes.find((t) => t.eventId === e.id)?.narrative ?? "Drafted from your story.";
            const photo = photoFor(e.type, i);
            return (
              <Link
                key={e.id}
                href="/events"
                className="group relative flex w-[280px] shrink-0 flex-col overflow-hidden border border-border"
              >
                {/* Photo top half */}
                <div className="relative h-[140px] w-full overflow-hidden bg-[#c8b8a8]">
                  <img
                    src={photo}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <p
                    className="absolute bottom-3 left-4 font-mono text-[9px] uppercase tracking-[0.18em] text-white/80"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {labelFor(e)}
                  </p>
                </div>

                {/* Text body */}
                <div className="flex flex-1 flex-col bg-white p-4 transition-colors group-hover:bg-ivory-warm/40">
                  <p className="font-serif text-[18px] leading-tight text-ink">
                    {name}
                  </p>
                  <p className="mt-2 line-clamp-2 text-[12.5px] leading-snug text-ink-muted">
                    {themeNarrative}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function labelFor(e: EventRecord): string {
  if (e.type === "custom" && e.customName) return e.customName;
  return EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ?? e.type;
}
