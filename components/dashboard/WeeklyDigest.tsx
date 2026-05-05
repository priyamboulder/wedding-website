"use client";

// ── WeeklyDigest ───────────────────────────────────────────────────────
// "This week in your wedding" — a warm, narrative summary of last week's
// activity and what's coming up. Generated once per ISO week (Mon-anchored)
// via /api/dashboard/weekly-digest, then cached in the digests store.
//
// Generation runs on first dashboard load of the week. The result is
// reused on every subsequent visit until the next Monday. Couple can
// dismiss the card after reading; "View past digests →" surfaces the
// archive.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useDailyCheckInsStore } from "@/stores/daily-checkins-store";
import { useDashboardNotepadStore } from "@/stores/dashboard-notepad-store";
import { useDecisionsStore } from "@/stores/decisions-store";
import { useGuestRosterStore } from "@/stores/guest-roster-store";
import { useMilestonesStore } from "@/stores/milestones-store";
import {
  useWeeklyDigestsStore,
  weekStartIso,
} from "@/stores/weekly-digests-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useCoupleIdentity } from "@/lib/couple-identity";
import type {
  WeeklyDigestRequest,
  WeeklyDigestResponse,
} from "@/app/api/dashboard/weekly-digest/route";

function parseDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(from: Date, to: Date): number {
  const ms =
    new Date(to).setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

function isWithinLastWeek(iso: string, now: Date): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const diffDays = (now.getTime() - d.getTime()) / 86_400_000;
  return diffDays >= 0 && diffDays <= 7;
}

// Cheap topic extraction — looks for the most common nouns from a small
// list of recurring planning subjects. Powers the "mostly about table
// settings" voice in the digest narrative.
const NOTE_TOPICS: { label: string; keys: string[] }[] = [
  { label: "table settings", keys: ["table", "tablescape", "linens", "place setting"] },
  { label: "catering", keys: ["catering", "menu", "food", "dish", "tasting"] },
  { label: "florals", keys: ["floral", "flowers", "bouquet", "centerpiece"] },
  { label: "music", keys: ["dj", "music", "song", "playlist", "band"] },
  { label: "outfits", keys: ["outfit", "lehenga", "saree", "sherwani", "dress"] },
  { label: "venue", keys: ["venue", "site visit", "walk-through"] },
  { label: "photography", keys: ["photo", "shot list", "camera", "shoot"] },
  { label: "guest list", keys: ["guest", "rsvp", "invite"] },
  { label: "transportation", keys: ["travel", "transport", "shuttle", "flight"] },
];

function topNoteTopics(notes: { content: string }[]): string[] {
  if (notes.length === 0) return [];
  const counts = new Map<string, number>();
  for (const n of notes) {
    const lower = n.content.toLowerCase();
    for (const t of NOTE_TOPICS) {
      if (t.keys.some((k) => lower.includes(k))) {
        counts.set(t.label, (counts.get(t.label) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k);
}

export function WeeklyDigest() {
  const couple = useCoupleIdentity();
  const user = useAuthStore((s) => s.user);
  const checklistDate = useChecklistStore((s) => s.weddingDate);
  const checklistItems = useChecklistStore((s) => s.items);
  const checkIns = useDailyCheckInsStore((s) => s.entries);
  const notes = useDashboardNotepadStore((s) => s.notes);
  const decisions = useDecisionsStore((s) => s.decisions);
  const roster = useGuestRosterStore((s) => s.entries);
  const milestones = useMilestonesStore((s) => s.milestones);
  const categories = useWorkspaceStore((s) => s.categories);

  const digests = useWeeklyDigestsStore((s) => s.digests);
  const saveDigest = useWeeklyDigestsStore((s) => s.saveDigest);
  const dismiss = useWeeklyDigestsStore((s) => s.dismiss);

  const [thisWeekStart, setThisWeekStart] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [generating, setGenerating] = useState(false);

  // Defer "now" to client mount to avoid hydration mismatches.
  useEffect(() => {
    const d = new Date();
    setNow(d);
    setThisWeekStart(weekStartIso(d));
  }, []);

  const existing = useMemo(() => {
    if (!thisWeekStart) return null;
    return digests.find((d) => d.weekStart === thisWeekStart) ?? null;
  }, [digests, thisWeekStart]);

  const weddingDate = useMemo(
    () => parseDate(user?.wedding?.weddingDate) ?? checklistDate ?? null,
    [user?.wedding?.weddingDate, checklistDate],
  );
  const daysUntilWedding = useMemo(() => {
    if (!weddingDate || !now) return null;
    return daysBetween(now, weddingDate);
  }, [weddingDate, now]);

  // Build the request body from current store state. Memoized but only
  // used inside the effect — not rendered, so deps stay stable.
  const buildRequest = useMemo(() => {
    return (): WeeklyDigestRequest | null => {
      if (!thisWeekStart || !now) return null;

      const recentNotes = notes.filter((n) => isWithinLastWeek(n.createdAt, now));
      const recentDecisions = decisions.filter((d) =>
        isWithinLastWeek(d.createdAt, now),
      );
      const recentMilestones = milestones.filter((m) =>
        isWithinLastWeek(m.triggeredAt, now),
      );
      const recentCheckIns = checkIns.filter((c) =>
        isWithinLastWeek(c.createdAt, now),
      );

      // Vendor bookings within the last 7 days. Categories don't carry
      // booking timestamps, so we approximate "booked this week" by
      // looking for matching milestones that fired within the window.
      const hasRecentBookingMilestone = recentMilestones.some(
        (m) =>
          m.type === "first_vendor_booked" || m.type === "all_vendors_booked",
      );
      const bookedThisWeek = hasRecentBookingMilestone
        ? categories
            .filter((c) => c.status === "assigned")
            .slice(0, 5)
            .map((c) => ({ name: c.name, category: c.name }))
        : [];

      // Guest roster doesn't carry per-entry timestamps, so we under-
      // count guestsAdded rather than make one up.
      const guestsAdded = 0;
      void roster;

      // Upcoming deadlines from checklist
      const todayMs = new Date(now).setHours(0, 0, 0, 0);
      const upcomingDeadlines = checklistItems
        .filter((i) => i.status !== "done" && i.due_date)
        .map((i) => {
          const dueIso = i.due_date as string;
          const due = new Date(dueIso);
          const diff = Math.round(
            (due.setHours(0, 0, 0, 0) - todayMs) / 86_400_000,
          );
          return { label: i.title, days: diff, dueIso };
        })
        .filter((d) => d.days >= 0 && d.days <= 30)
        .sort((a, b) => a.days - b.days);

      const nearest = upcomingDeadlines[0] ?? null;

      const openDecisions: string[] = [];
      // Note: workspace decisions are separate from the dashboard
      // Decision Tracker — we surface them here as "open questions".
      // Keep this list short.

      return {
        weekStart: thisWeekStart,
        daysUntilWedding,
        lastWeek: {
          vendorsBooked: bookedThisWeek,
          guestsAdded,
          notesAdded: recentNotes.length,
          notesSubjectsTopHits: topNoteTopics(recentNotes),
          checklistCompleted: 0, // we don't track per-week completion
          decisionsMade: recentDecisions.length,
          milestonesHit: recentMilestones.map((m) => m.message),
          checkInsAnswered: recentCheckIns.length,
        },
        upcoming: {
          nearestDeadlineLabel: nearest?.label ?? null,
          nearestDeadlineDays: nearest?.days ?? null,
          upcomingDeadlines: upcomingDeadlines
            .slice(0, 5)
            .map(({ label, days }) => ({ label, days })),
          openDecisions,
        },
        couple: {
          person1: couple.person1,
          person2: couple.person2,
        },
      };
    };
  }, [
    thisWeekStart,
    now,
    notes,
    decisions,
    milestones,
    checkIns,
    roster,
    categories,
    checklistItems,
    daysUntilWedding,
    couple.person1,
    couple.person2,
  ]);

  // Auto-generate this week's digest on first dashboard visit of the week.
  useEffect(() => {
    if (!thisWeekStart || existing || generating || !now) return;
    const req = buildRequest();
    if (!req) return;

    let cancelled = false;
    setGenerating(true);
    (async () => {
      try {
        const res = await fetch("/api/dashboard/weekly-digest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });
        const json = (await res.json()) as WeeklyDigestResponse;
        if (cancelled) return;
        if (json.ok && json.content) {
          saveDigest({
            weekStart: thisWeekStart,
            content: json.content,
            activityData: req as unknown as Record<string, unknown>,
          });
        }
      } catch {
        // Failure is silent — the next page load retries.
      } finally {
        if (!cancelled) setGenerating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [thisWeekStart, existing, generating, now, buildRequest, saveDigest]);

  if (!existing || existing.dismissed) return null;

  return (
    <section
      aria-label="This week in your wedding"
      className="dash-card text-left"
      style={{
        padding: "20px 22px",
        borderLeft: "3px solid var(--dash-blush)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
            style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
          >
            This week in your wedding
          </p>
          <h3
            className="mt-1 font-serif text-[20px] italic leading-snug text-[color:var(--dash-text)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
            }}
          >
            A quick lay of the land.
          </h3>
        </div>
        <button
          type="button"
          onClick={() => dismiss(existing.id)}
          aria-label="Dismiss digest"
          className="shrink-0 rounded-full p-1 text-[color:var(--dash-text-faint)] transition-colors hover:bg-[color:var(--dash-blush-soft)] hover:text-[color:var(--dash-text)]"
        >
          <X size={13} strokeWidth={1.8} />
        </button>
      </div>
      <p
        className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-[color:var(--dash-text)]"
        style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
      >
        {existing.content}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <Link
          href="/dashboard/digests"
          className="text-[11px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
        >
          View past digests →
        </Link>
      </div>
    </section>
  );
}
