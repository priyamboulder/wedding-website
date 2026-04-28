"use client";

// ── Standalone Seating Chart (AI-first) ───────────────────────────────
// Dedicated route that replaces the old manual layout tool with the
// spec's three-panel, AI-first UX. One-click "✦ Auto-assign all"
// produces a complete zone-colored arrangement; the user refines via
// drag-drop on the canvas or the right-side Table Inspector's smart
// actions. State persists through the same Zustand stores used by the
// in-page Floor Plan view, so the two share a single working layout.

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Tags } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { AISeatingChart } from "@/components/seating/AISeatingChart";
import { useGuestRosterStore } from "@/stores/guest-roster-store";
import type { SeatingEventOption, SeatingGuest } from "@/types/seating-guest";

// Reception is the canonical event for seating; we expose the common Indian
// wedding-day lineup so the event switcher feels real even when the couple
// hasn't wired a dedicated schedule.
const DEFAULT_EVENTS: SeatingEventOption[] = [
  { id: "reception", label: "Reception" },
  { id: "sangeet", label: "Sangeet" },
  { id: "mehndi", label: "Mehndi" },
  { id: "ceremony", label: "Ceremony" },
];

export default function SeatingChartPage() {
  const rosterEntries = useGuestRosterStore((s) => s.entries);

  // Adapt the shared roster (Pandit/Family-Roles-facing) into the
  // SeatingBuilder's SeatingGuest shape. The builder reads
  // assignments from its own persistent store, so no guest data is required
  // to design the floor plan itself — but having the roster visible in the
  // sidebar lets users drag them onto tables.
  const seatingGuests: SeatingGuest[] = useMemo(
    () =>
      rosterEntries.map((e) => ({
        id: e.id,
        firstName: e.first_name,
        lastName: e.last_name,
        householdId: e.side === "brides" ? "h-brides" : e.side === "grooms" ? "h-grooms" : "h-shared",
        side: e.side === "brides" ? "bride" : e.side === "grooms" ? "groom" : "mutual",
        ageCategory: "adult",
        vipTier: "standard",
        categories: [],
        dietary: [],
        relationship: e.relationship,
        rsvp: {
          reception: "confirmed",
          sangeet: "confirmed",
          mehndi: "confirmed",
          ceremony: "confirmed",
        },
      })),
    [rosterEntries],
  );

  return (
    <div className="min-h-screen bg-ivory">
      <TopNav />
      <div className="mx-auto max-w-[1680px] px-6 py-6 lg:px-8">
        <nav className="mb-4 flex items-center gap-3 text-[12px] text-ink-muted">
          <Link
            href="/guests"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 transition-colors hover:border-ink/25 hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={1.7} />
            Back to Guests
          </Link>
          <Link
            href="/guests?view=categories"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 transition-colors hover:border-ink/25 hover:text-ink"
          >
            <Tags size={12} strokeWidth={1.7} />
            Edit Circles
          </Link>
        </nav>

        <header className="mb-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                AI-driven seating chart
              </p>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">
                Where should everyone sit?
              </h1>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
                Click <strong className="text-ink">✦ Auto-assign all</strong> to get a complete
                zone-colored draft in seconds, then refine with drag-and-drop or the
                per-table smart actions.
              </p>
            </div>
            <span className="whitespace-nowrap rounded-md border border-border bg-white px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">
              {seatingGuests.length} guests on roster
            </span>
          </div>
        </header>

        <AISeatingChart guests={seatingGuests} events={DEFAULT_EVENTS} />
      </div>
    </div>
  );
}
