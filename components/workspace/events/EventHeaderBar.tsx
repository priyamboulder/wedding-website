"use client";

// ── Event logistics strip ─────────────────────────────────────────────────
// Thin strip that renders under the EventsWorkspaceShell header in the
// detail view. The event name + theme are now the shell's big serif title,
// so this strip keeps only the inline-editable logistics (date, venue,
// guest count, energy, palette) plus a hint at which palette is in play.

import { useMemo } from "react";
import { Calendar, Flame, MapPin, Users } from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import { PALETTE_LIBRARY } from "@/lib/events-seed";
import { normalizeEventRecord } from "@/lib/events/normalize";
import type { EventRecord, PaletteSwatch } from "@/types/events";
import { cn } from "@/lib/utils";

interface Props {
  event: EventRecord;
}

export function EventHeaderBar({ event: raw }: Props) {
  const event = normalizeEventRecord(raw);
  const setEventDate = useEventsStore((s) => s.setEventDate);
  const setEventVenue = useEventsStore((s) => s.setEventVenue);
  const setEventGuestCount = useEventsStore((s) => s.setEventGuestCount);
  const setEventEnergyLevel = useEventsStore((s) => s.setEventEnergyLevel);
  const coupleContext = useEventsStore((s) => s.coupleContext);

  const palette = useMemo<PaletteSwatch[] | null>(() => {
    if (event.paletteInherits) {
      const lib = PALETTE_LIBRARY.find(
        (p) => p.id === coupleContext.heroPaletteId,
      );
      return lib?.colors ?? null;
    }
    if (event.customPalette) return event.customPalette;
    const lib = PALETTE_LIBRARY.find((p) => p.id === event.paletteId);
    return lib?.colors ?? null;
  }, [
    event.customPalette,
    event.paletteId,
    event.paletteInherits,
    coupleContext.heroPaletteId,
  ]);

  return (
    <section className="border-b border-gold/15 bg-ivory-warm/40 px-10 py-2.5">
      <div className="flex flex-wrap items-center gap-3 text-[12px] text-ink-muted">
        <HeaderChip icon={<Calendar size={11} strokeWidth={1.8} />}>
          <input
            type="date"
            value={event.eventDate ?? ""}
            onChange={(e) => setEventDate(event.id, e.target.value || null)}
            aria-label="Event date"
            className="w-[118px] border-0 bg-transparent text-[12px] text-ink outline-none"
          />
        </HeaderChip>
        <HeaderChip icon={<MapPin size={11} strokeWidth={1.8} />}>
          <input
            value={event.venueName ?? ""}
            onChange={(e) => setEventVenue(event.id, e.target.value || null)}
            placeholder="Venue"
            aria-label="Venue"
            className="w-[140px] border-0 bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-faint"
          />
        </HeaderChip>
        <HeaderChip icon={<Users size={11} strokeWidth={1.8} />}>
          <input
            type="number"
            min={0}
            value={event.guestCount || ""}
            onChange={(e) =>
              setEventGuestCount(event.id, Number(e.target.value))
            }
            placeholder="0"
            aria-label="Guest count"
            className="w-[52px] border-0 bg-transparent text-right text-[12px] tabular-nums text-ink outline-none placeholder:text-ink-faint"
          />
          <span className="text-ink-faint">guests</span>
        </HeaderChip>
        <HeaderChip
          icon={
            <Flame
              size={11}
              strokeWidth={1.8}
              className={energyColor(event.energyLevel)}
            />
          }
        >
          <input
            type="range"
            min={0}
            max={100}
            value={event.energyLevel}
            onChange={(e) =>
              setEventEnergyLevel(event.id, Number(e.target.value))
            }
            aria-label="Energy level"
            className="h-1 w-[90px] cursor-pointer accent-saffron"
          />
          <span
            className="font-mono text-[10.5px] tabular-nums text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {event.energyLevel}
          </span>
        </HeaderChip>

        {palette && palette.length > 0 && (
          <div
            className="ml-auto inline-flex items-center gap-1.5"
            title={
              event.paletteInherits
                ? "Wedding palette"
                : "This event's palette"
            }
          >
            <div className="flex -space-x-1">
              {palette.slice(0, 5).map((c, i) => (
                <span
                  key={`${c.hex}-${i}`}
                  style={{ backgroundColor: c.hex }}
                  className={cn(
                    "h-4 w-4 rounded-full border border-white shadow-[0_0_0_0.5px_rgba(26,26,26,0.08)]",
                  )}
                  aria-hidden
                />
              ))}
            </div>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {event.paletteInherits ? "Wedding palette" : "Own palette"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function HeaderChip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1">
      {icon}
      {children}
    </span>
  );
}

function energyColor(energy: number): string {
  if (energy >= 75) return "text-saffron";
  if (energy >= 45) return "text-gold";
  return "text-ink-faint";
}
