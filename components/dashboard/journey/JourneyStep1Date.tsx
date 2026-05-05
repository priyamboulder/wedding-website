"use client";

// ── Journey Step 1 · Pick your date ─────────────────────────────────────
//
// Two paths:
//   (A) "I know my date"      → <input type="date">
//   (B) "Help me find a date"  → auspicious finder filtered by tradition,
//                                month range, and avoid-dates. Results
//                                render as small cards with cultural
//                                anchor + season note + favorite/select.

import { useMemo, useState } from "react";
import { Calendar, Heart, Sparkles, Star } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useDashboardJourneyStore } from "@/stores/dashboard-journey-store";
import {
  filterAuspiciousDates,
  type AuspiciousTradition,
  type AuspiciousDate,
} from "@/lib/journey/auspicious-dates";
import { cn } from "@/lib/utils";

type Mode = "idle" | "manual" | "finder";

const TRADITION_OPTIONS: { id: AuspiciousTradition; label: string }[] = [
  { id: "hindu", label: "Hindu" },
  { id: "sikh", label: "Sikh" },
  { id: "jain", label: "Jain" },
  { id: "inter_faith", label: "Inter-faith" },
  { id: "non_religious", label: "Non-religious" },
];

interface Step1Props {
  weddingDateIso: string;
  daysUntil: number | null;
  done: boolean;
  active: boolean;
}

export function JourneyStep1Date({
  weddingDateIso,
  daysUntil,
  done,
  active,
}: Step1Props) {
  const updateWedding = useAuthStore((s) => s.updateWedding);
  const setWeddingDateInChecklist = useChecklistStore((s) => s.setWeddingDate);
  const favorites = useDashboardJourneyStore((s) => s.favoriteAuspiciousIso);
  const toggleFavorite = useDashboardJourneyStore(
    (s) => s.toggleFavoriteAuspicious,
  );

  const [mode, setMode] = useState<Mode>("idle");
  const [traditions, setTraditions] = useState<AuspiciousTradition[]>([
    "hindu",
    "inter_faith",
  ]);
  const [season, setSeason] = useState<"any" | "winter" | "spring" | "post_diwali">(
    "any",
  );

  const handlePick = (iso: string) => {
    if (!iso) return;
    updateWedding({ weddingDate: iso });
    const dt = new Date(iso);
    if (!Number.isNaN(dt.getTime())) setWeddingDateInChecklist(dt);
    setMode("idle");
  };

  // Done collapsed view
  if (done && !active) {
    const date = weddingDateIso ? new Date(weddingDateIso) : null;
    const label = date
      ? date.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";
    return (
      <p className="text-[13.5px] text-[color:var(--dash-text)]">
        {label}
        {daysUntil != null && (
          <span className="ml-2 text-[color:var(--dash-blush-deep)]">
            · {daysUntil < 0 ? `${Math.abs(daysUntil)} days since` : `${daysUntil} days away`}
          </span>
        )}
      </p>
    );
  }

  // Idle (active but no date yet) — two-path prompt
  if (mode === "idle" && !done) {
    return (
      <div className="space-y-4">
        <p
          className="font-serif text-[15px] italic leading-relaxed text-[color:var(--dash-text-muted)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          When&apos;s the big day? If you already know, drop it in. If you&apos;re
          still deciding, we can help.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className="dash-btn dash-btn--sm"
          >
            <Calendar size={13} strokeWidth={1.8} />
            I know my date
          </button>
          <button
            type="button"
            onClick={() => setMode("finder")}
            className="dash-btn dash-btn--sm dash-btn--ghost"
          >
            <Sparkles size={13} strokeWidth={1.8} />
            Help me find a date
          </button>
        </div>
      </div>
    );
  }

  // Manual path
  if (mode === "manual") {
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-[color:var(--dash-text-muted)]">
          Pick the date — you can always change it.
        </p>
        <input
          type="date"
          autoFocus
          value={weddingDateIso}
          onChange={(e) => handlePick(e.target.value)}
          className="rounded-[4px] border border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-canvas)] px-3 py-2 text-[14px] focus:border-[color:var(--dash-blush)] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setMode("idle")}
          className="ml-2 text-[12px] text-[color:var(--dash-text-faint)] hover:text-[color:var(--dash-text)]"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Finder path
  return (
    <FinderUI
      traditions={traditions}
      onTraditionToggle={(t) =>
        setTraditions((prev) =>
          prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
        )
      }
      season={season}
      onSeasonChange={setSeason}
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      onPick={handlePick}
      onCancel={() => setMode("idle")}
    />
  );
}

interface FinderProps {
  traditions: AuspiciousTradition[];
  onTraditionToggle: (t: AuspiciousTradition) => void;
  season: "any" | "winter" | "spring" | "post_diwali";
  onSeasonChange: (s: "any" | "winter" | "spring" | "post_diwali") => void;
  favorites: string[];
  onToggleFavorite: (iso: string) => void;
  onPick: (iso: string) => void;
  onCancel: () => void;
}

function FinderUI({
  traditions,
  onTraditionToggle,
  season,
  onSeasonChange,
  favorites,
  onToggleFavorite,
  onPick,
  onCancel,
}: FinderProps) {
  const dates = useMemo<AuspiciousDate[]>(() => {
    const all = filterAuspiciousDates({ traditions });
    return all.filter((d) => {
      if (season === "any") return true;
      const month = new Date(d.iso).getMonth(); // 0-indexed
      if (season === "winter") return month === 10 || month === 11 || month === 0 || month === 1;
      if (season === "spring") return month === 1 || month === 2 || month === 3 || month === 4;
      if (season === "post_diwali")
        return month === 10 || month === 11 || month === 0;
      return true;
    });
  }, [traditions, season]);

  return (
    <div className="space-y-4">
      <p
        className="font-serif text-[14px] italic text-[color:var(--dash-text-muted)]"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      >
        Pick a tradition and a window — we&apos;ll surface dates that fall in
        traditionally favorable seasons.
      </p>

      <div className="space-y-2">
        <p
          className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
          style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
        >
          Traditions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TRADITION_OPTIONS.map((t) => {
            const active = traditions.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTraditionToggle(t.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] transition-colors",
                  active
                    ? "bg-[color:var(--dash-blush)] text-white"
                    : "bg-[color:var(--dash-canvas)] text-[color:var(--dash-text)] border border-[color:var(--dash-blush-soft)] hover:border-[color:var(--dash-blush)]",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p
          className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
          style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
        >
          Window
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: "any" as const, label: "Any season" },
              { id: "winter" as const, label: "Winter (Nov–Feb)" },
              { id: "post_diwali" as const, label: "Post-Diwali (Nov–Jan)" },
              { id: "spring" as const, label: "Spring (Feb–May)" },
            ]
          ).map((s) => {
            const active = season === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSeasonChange(s.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] transition-colors",
                  active
                    ? "bg-[color:var(--dash-blush)] text-white"
                    : "bg-[color:var(--dash-canvas)] text-[color:var(--dash-text)] border border-[color:var(--dash-blush-soft)] hover:border-[color:var(--dash-blush)]",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p
          className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
          style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
        >
          {dates.length} candidate date{dates.length === 1 ? "" : "s"}
        </p>
        {dates.length === 0 ? (
          <p
            className="font-serif text-[14px] italic text-[color:var(--dash-text-muted)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          >
            No dates in this window. Try widening the season or adding more
            traditions.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {dates.map((d) => (
              <DateCard
                key={d.iso}
                date={d}
                favorited={favorites.includes(d.iso)}
                onToggleFavorite={() => onToggleFavorite(d.iso)}
                onPick={() => onPick(d.iso)}
              />
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="text-[12px] text-[color:var(--dash-text-faint)] hover:text-[color:var(--dash-text)]"
      >
        Cancel
      </button>
    </div>
  );
}

function DateCard({
  date,
  favorited,
  onToggleFavorite,
  onPick,
}: {
  date: AuspiciousDate;
  favorited: boolean;
  onToggleFavorite: () => void;
  onPick: () => void;
}) {
  const dt = new Date(date.iso);
  const day = dt.getDate();
  return (
    <li className="dash-card group flex items-stretch gap-3 px-3 py-3">
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-[4px] bg-[color:var(--dash-canvas)] py-1">
        <span
          className="text-[9px] uppercase tracking-[0.16em] text-[color:var(--dash-blush-deep)]"
          style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
        >
          {date.monthLabel.split(" ")[0].slice(0, 3)}
        </span>
        <span
          className="font-serif text-[24px] leading-none text-[color:var(--dash-text)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
          }}
        >
          {day}
        </span>
        <span className="mt-0.5 text-[9.5px] text-[color:var(--dash-text-faint)]">
          {date.weekday.slice(0, 3)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="flex items-center gap-1 text-[11px] font-medium text-[color:var(--dash-blush-deep)]"
          style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
        >
          <Star size={10} strokeWidth={2} fill="currentColor" />
          {date.significance}
        </p>
        <p className="mt-1 text-[12px] leading-snug text-[color:var(--dash-text-muted)]">
          {date.seasonNote}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onPick}
            className="text-[12px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
          >
            Pick this date →
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            className={cn(
              "inline-flex items-center gap-1 text-[11px] transition-colors",
              favorited
                ? "text-[color:var(--dash-blush-deep)]"
                : "text-[color:var(--dash-text-faint)] hover:text-[color:var(--dash-blush-deep)]",
            )}
            aria-label={favorited ? "Unfavorite" : "Favorite"}
          >
            <Heart
              size={11}
              strokeWidth={1.8}
              fill={favorited ? "currentColor" : "none"}
            />
            {favorited ? "Favorited" : "Save"}
          </button>
        </div>
      </div>
    </li>
  );
}
