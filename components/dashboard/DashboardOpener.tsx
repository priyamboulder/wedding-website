"use client";

import { useEventsStore } from "@/stores/events-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { PALETTE_LIBRARY } from "@/lib/events-seed";
import { useCoupleIdentity } from "@/lib/couple-identity";

// Curated hero strip — 5 best portfolio shots shown beside the couple's name.
const HERO_PHOTOS = [
  "/images/portfolio/best/best-01.jpg",
  "/images/portfolio/portrait/portrait-01.jpg",
  "/images/portfolio/best/best-05.jpg",
  "/images/portfolio/portrait/portrait-03.jpg",
  "/images/portfolio/best/best-09.jpg",
];

export function DashboardOpener() {
  const events = useEventsStore((s) => s.events);
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const completedAt = useEventsStore((s) => s.quiz.completedAt);
  const categories = useWorkspaceStore((s) => s.categories);
  const couple = useCoupleIdentity();

  return (
    <header className="mb-2">
      {/* Photo strip — 5 editorial frames across the top */}
      <div className="mb-8 grid h-[220px] grid-cols-5 gap-1.5 overflow-hidden">
        {HERO_PHOTOS.map((src, i) => (
          <div
            key={i}
            className="relative h-full w-full overflow-hidden bg-[#e8e0d8]"
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Couple names + opener line */}
      <h1
        className="font-serif text-[44px] leading-[1.05] tracking-tight text-ink"
        style={{ fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif" }}
      >
        {couple.person1}
        <span className="mx-3 font-light text-ink-faint">&</span>
        {couple.person2}
      </h1>
      <p className="mt-3 max-w-2xl font-serif text-[18px] italic leading-snug text-ink-soft">
        {composeOpener({ events, coupleContext, completedAt, categories })}
      </p>
    </header>
  );
}

interface OpenerCtx {
  events: Array<{ moodTile: unknown; type: string; paletteId: string | null; paletteCustomName: string | null; customPalette: unknown }>;
  coupleContext: { totalGuestCount: number; heroPaletteId: string | null };
  completedAt: string | null;
  categories: Array<{ slug: string; status: string }>;
}

function composeOpener(ctx: OpenerCtx): string {
  const { events, coupleContext, completedAt, categories } = ctx;

  if (!completedAt) {
    return "Foundation set. Brief next.";
  }

  const venue = categories.find((c) => c.slug === "venue");
  const venueLocked = venue?.status === "assigned";
  if (!venueLocked) {
    return "Foundation set. Venue next.";
  }

  const eventsMissingVibe = events.filter((e) => !e.moodTile).length;
  if (eventsMissingVibe > 0) {
    return `${eventsMissingVibe} ${eventsMissingVibe === 1 ? "event still needs" : "events still need"} a vibe.`;
  }

  const palette = paletteName(coupleContext.heroPaletteId);
  const guests = coupleContext.totalGuestCount;
  const eventCount = events.length;

  const fragments = [
    `${eventCount} ${eventCount === 1 ? "event" : "events"} planned`,
    palette,
    `${guests} guests`,
  ].filter(Boolean);
  return fragments.join(" · ");
}

function paletteName(heroPaletteId: string | null): string | null {
  if (!heroPaletteId) return null;
  return PALETTE_LIBRARY.find((p) => p.id === heroPaletteId)?.name ?? null;
}
