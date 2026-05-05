// ── Milestone trigger detection ────────────────────────────────────────
// Pure helpers that read snapshot platform state and return the list of
// milestones that should fire right now (independent of what's already
// been triggered). The store enforces the "only once per couple" rule
// via triggerIfNew, so this can be called liberally on relevant data
// changes without firing the same milestone twice.

import type { ChecklistItem } from "@/types/checklist";
import type { EventRecord } from "@/types/events";
import type { WorkspaceCategory } from "@/types/workspace";
import type { MilestoneType } from "@/stores/milestones-store";

export interface TriggerInputs {
  weddingDate: Date | null;
  events: EventRecord[];
  guestCount: number;
  workspaceCategories: WorkspaceCategory[];
  checklistItems: ChecklistItem[];
  totalBudgetCents: number;
  allocatedBudget: number;
  /**
   * Total budget allocations across vendor workspace categories. Used to
   * detect "every dollar has a job."
   */
  programDiscoveryComplete: boolean;
  saveTheDatesSent: boolean;
  invitationsSent: boolean;
  outfitOrdered: boolean;
}

export interface MilestoneCandidate {
  type: MilestoneType;
  message: string;
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(to);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function detectMilestones(input: TriggerInputs): MilestoneCandidate[] {
  const out: MilestoneCandidate[] = [];

  // ── Vendor bookings ────────────────────────────────────────────────
  const bookedCats = input.workspaceCategories.filter(
    (c) => c.status === "assigned",
  );
  if (bookedCats.length >= 1) {
    const first = bookedCats[0];
    out.push({
      type: "first_vendor_booked",
      message: `Your first vendor is locked in. ${first.name} is booked. It's starting to feel real.`,
    });
  }

  const venueCat = input.workspaceCategories.find((c) => c.slug === "venue");
  if (venueCat?.status === "assigned") {
    out.push({
      type: "venue_confirmed",
      message: `Venue locked. Your celebration is officially happening at ${venueCat.name}.`,
    });
  }

  // Every workspace category in the rail is "booked" — vendor team complete.
  if (
    input.workspaceCategories.length > 0 &&
    bookedCats.length === input.workspaceCategories.length
  ) {
    out.push({
      type: "all_vendors_booked",
      message: "Every vendor slot is filled. Your team is assembled.",
    });
  }

  // ── Events / program ───────────────────────────────────────────────
  if (input.programDiscoveryComplete && input.events.length > 0) {
    const totalGuests = input.events.reduce(
      (acc, e) => acc + (e.guestCount ?? 0),
      0,
    );
    out.push({
      type: "all_events_defined",
      message: `Your celebration lineup is set. ${input.events.length} events. ${totalGuests} guests across them all.`,
    });
  }

  // ── Guest list thresholds ──────────────────────────────────────────
  const g = input.guestCount;
  if (g >= 50) {
    out.push({
      type: "guests_50",
      message: "50 guests on the roster. The circle is forming.",
    });
  }
  if (g >= 100) {
    out.push({
      type: "guests_100",
      message: "100 guests on the roster. That's a party.",
    });
  }
  if (g >= 200) {
    out.push({
      type: "guests_200",
      message: "200 guests on the roster. The whole village is invited.",
    });
  }
  if (g >= 300) {
    out.push({
      type: "guests_300",
      message: "300 guests on the roster. This is the kind of wedding people talk about for years.",
    });
  }

  // ── Stationery flow ────────────────────────────────────────────────
  if (input.saveTheDatesSent) {
    out.push({
      type: "save_the_dates_sent",
      message: "Save-the-dates are out in the world. No turning back now (not that you'd want to).",
    });
  }
  if (input.invitationsSent) {
    out.push({
      type: "invitations_sent",
      message: "Invitations sent. The RSVPs are coming. Brace yourselves.",
    });
  }

  // ── Budget ─────────────────────────────────────────────────────────
  if (
    input.totalBudgetCents > 0 &&
    input.allocatedBudget * 100 >= input.totalBudgetCents * 0.95
  ) {
    out.push({
      type: "budget_fully_allocated",
      message: "Every dollar has a job. Your budget is fully mapped.",
    });
  }

  // ── Outfit ─────────────────────────────────────────────────────────
  if (input.outfitOrdered) {
    out.push({
      type: "outfit_ordered",
      message: "The outfit is ordered. The most photographed thread you'll ever wear.",
    });
  }

  // ── Checklist progress ─────────────────────────────────────────────
  const totalTasks = input.checklistItems.length;
  const doneTasks = input.checklistItems.filter(
    (i) => i.status === "done",
  ).length;
  const checkRatio = totalTasks > 0 ? doneTasks / totalTasks : 0;
  if (checkRatio >= 0.5) {
    out.push({
      type: "checklist_50",
      message: "Halfway there. More done than left to do.",
    });
  }
  if (checkRatio >= 0.9) {
    out.push({
      type: "checklist_90",
      message: "Almost there. The finish line is right there.",
    });
  }

  // ── Calendar countdown ─────────────────────────────────────────────
  if (input.weddingDate) {
    const days = daysBetween(new Date(), input.weddingDate);
    if (days <= 30 && days > 7) {
      out.push({
        type: "one_month_out",
        message: "One month. 30 days. It's almost here.",
      });
    }
    if (days <= 7 && days > 0) {
      out.push({
        type: "one_week_out",
        message: "One week. Breathe. You've built something beautiful.",
      });
    }
    if (days === 0) {
      out.push({
        type: "wedding_day",
        message: "Today's the day. Everything you've planned becomes the story you'll tell forever.",
      });
    }
  }

  return out;
}
