"use client";

// ── JourneyBanner ──────────────────────────────────────────────────────
// The compact summary that replaces the expanded journey once all 5
// foundation steps are complete. ~40-50px tall — sits quietly above
// the events section. The couple can tap "Edit foundation →" to
// re-expand the journey at any time.

import { Check } from "lucide-react";
import { moodById } from "@/lib/journey/mood-palettes";
import { useDashboardJourneyStore } from "@/stores/dashboard-journey-store";

interface JourneyBannerProps {
  weddingDate: Date | null;
  eventCount: number;
  totalGuestCount: number;
  onReopen: () => void;
}

export function JourneyBanner({
  weddingDate,
  eventCount,
  totalGuestCount,
  onReopen,
}: JourneyBannerProps) {
  const selectedMoodId = useDashboardJourneyStore((s) => s.selectedMoodId);
  const customPalette = useDashboardJourneyStore((s) => s.customPalette);
  const mood = moodById(selectedMoodId);

  const dateLabel = weddingDate
    ? weddingDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const paletteSwatches =
    mood?.colors.slice(0, 5).map((c) => c.hex) ?? customPalette?.slice(0, 5) ?? [];
  const paletteLabel = mood?.name ?? (customPalette ? "Custom palette" : null);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[6px] border border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-blush-light)] px-4 py-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--dash-blush)] text-white">
        <Check size={13} strokeWidth={2.4} />
      </span>
      <p
        className="font-serif text-[14.5px] leading-snug text-[color:var(--dash-text)]"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
        }}
      >
        Foundation set
      </p>
      <span className="hidden h-3 w-px bg-[color:var(--dash-blush-soft)] sm:inline-block" />

      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[color:var(--dash-text-muted)]">
        {dateLabel && <li>{dateLabel}</li>}
        {eventCount > 0 && (
          <li>
            {eventCount} event{eventCount === 1 ? "" : "s"}
          </li>
        )}
        {totalGuestCount > 0 && (
          <li>{totalGuestCount.toLocaleString()} guests</li>
        )}
        {paletteSwatches.length > 0 && (
          <li className="flex items-center gap-1.5">
            <span className="flex">
              {paletteSwatches.map((hex) => (
                <span
                  key={hex}
                  aria-hidden
                  style={{ backgroundColor: hex }}
                  className="-ml-1 h-3.5 w-3.5 rounded-full border-[1.5px] border-[color:var(--dash-blush-light)] first:ml-0"
                />
              ))}
            </span>
            <span>{paletteLabel}</span>
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={onReopen}
        className="ml-auto text-[12px] font-medium text-[color:var(--dash-blush-deep)] transition-colors hover:text-[color:var(--dash-text)]"
      >
        Edit foundation →
      </button>
    </div>
  );
}
