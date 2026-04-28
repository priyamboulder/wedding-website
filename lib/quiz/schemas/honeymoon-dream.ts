// ── Honeymoon → Dream Session quiz ────────────────────────────────────────
// Eight questions, ~3 minutes. The Phase 1 "Dream Session" discovery flow.
// Captures vibe, duration, couple-total budget, flight tolerance, timing,
// priority interests, dealbreakers, and prior international experience.
// Output writes into the honeymoon store's `vibeProfile` — Phase 2
// destination matching reads from there. Also seeds one moodboard pin per
// chosen vibe tile so the moodboard isn't empty on first open.

import type {
  QuizAnswerMap,
  QuizPreviewItem,
  QuizSchema,
} from "@/types/quiz";
import type { WorkspaceCategorySlug } from "@/types/workspace";
import type {
  HoneymoonBudgetTier,
  HoneymoonDealbreaker,
  HoneymoonFlightTolerance,
  HoneymoonPriorityInterest,
  HoneymoonTimingV2,
  HoneymoonTravelExperience,
  HoneymoonTripDuration,
  HoneymoonVibeTile,
} from "@/types/honeymoon";
import {
  BUDGET_TIER_OPTIONS,
  DEALBREAKER_OPTIONS,
  FLIGHT_TOLERANCE_OPTIONS,
  PRIORITY_INTEREST_OPTIONS,
  TIMING_V2_OPTIONS,
  TRAVEL_EXPERIENCE_OPTIONS,
  TRIP_DURATION_OPTIONS,
  VIBE_TILE_OPTIONS,
} from "@/lib/honeymoon-seed";
import { useHoneymoonStore } from "@/stores/honeymoon-store";

function labelFor<T extends { value: string; label: string }>(
  opts: T[],
  value: string | null,
): string | null {
  if (!value) return null;
  return opts.find((o) => o.value === value)?.label ?? value;
}

export const honeymoonDreamQuiz: QuizSchema = {
  id: "honeymoon:dream:v1",
  version: "1",
  category: "honeymoon" as WorkspaceCategorySlug,
  subsection: "dream",
  title: "The dream session — let's find your honeymoon",
  intro:
    "Eight quick questions. No dates or destinations yet — just the feeling you're after. We'll use your answers to match trip concepts that actually fit you two, not a generic top-ten list.",
  estimated_minutes: 3,
  questions: [
    {
      id: "vibes",
      prompt: "What does your dream honeymoon feel like?",
      helper: "Pick up to two — most couples want a blend.",
      input: {
        type: "image_grid",
        min: 1,
        max: 2,
        options: VIBE_TILE_OPTIONS.map((v) => ({
          value: v.value,
          label: `${v.emoji} ${v.label} — ${v.blurb}`,
          image_url: v.image_url,
        })),
      },
    },
    {
      id: "duration",
      prompt: "How long are you thinking?",
      helper: "Duration shapes everything — a 5-night trip is one place done well; 14 nights opens up multi-stop.",
      input: {
        type: "single_select",
        options: TRIP_DURATION_OPTIONS.map((o) => ({
          value: o.value,
          label: `${o.label} — ${o.hint}`,
        })),
      },
    },
    {
      id: "budget",
      prompt: "What's your total budget for the trip?",
      helper:
        "Total for the couple — including flights, stay, food, and activities. Single biggest filter we have.",
      input: {
        type: "single_select",
        options: BUDGET_TIER_OPTIONS.map((o) => ({
          value: o.value,
          label: `${o.label} — ${o.blurb}`,
        })),
      },
    },
    {
      id: "flight",
      prompt: "How do you feel about flying?",
      helper:
        "Sets the destination pool. Drive-to and long-haul are very different conversations.",
      input: {
        type: "single_select",
        options: FLIGHT_TOLERANCE_OPTIONS,
      },
    },
    {
      id: "timing",
      prompt: "When are you going?",
      helper: "Affects weather, crowds, and pricing.",
      input: {
        type: "single_select",
        options: TIMING_V2_OPTIONS,
      },
    },
    {
      id: "priorities",
      prompt: "What matters most to you two?",
      helper: "Pick up to four — we'll weight recommendations by these.",
      input: {
        type: "multi_select",
        min: 1,
        max: 4,
        options: PRIORITY_INTEREST_OPTIONS,
      },
    },
    {
      id: "dealbreakers",
      prompt: "Any dealbreakers?",
      helper: "Optional — lets us eliminate destinations that won't work.",
      optional: true,
      input: {
        type: "multi_select",
        min: 0,
        max: DEALBREAKER_OPTIONS.length,
        options: DEALBREAKER_OPTIONS,
      },
    },
    {
      id: "experience",
      prompt: "Have you traveled internationally before?",
      helper:
        "Shapes how adventurous we go — a first big trip and a seasoned-traveler trip look different.",
      input: {
        type: "single_select",
        options: TRAVEL_EXPERIENCE_OPTIONS,
      },
    },
  ],

  preview: (answers) => {
    const items: QuizPreviewItem[] = [];

    const vibesA = answers.vibes;
    if (vibesA && vibesA.kind === "images" && vibesA.values.length > 0) {
      const labels = vibesA.values
        .map((v) => VIBE_TILE_OPTIONS.find((o) => o.value === v)?.label ?? v)
        .filter(Boolean);
      items.push({
        fieldKey: "vibes",
        label: "Vibe",
        value: labels,
        editable: false,
      });
    }

    const durationA = answers.duration;
    if (durationA && durationA.kind === "single") {
      const base = TRIP_DURATION_OPTIONS.find(
        (o) => o.value === durationA.value,
      );
      items.push({
        fieldKey: "duration",
        label: "Duration",
        value: base ? base.label : durationA.value,
        editable: false,
      });
    }

    const budgetA = answers.budget;
    if (budgetA && budgetA.kind === "single") {
      const base = BUDGET_TIER_OPTIONS.find((o) => o.value === budgetA.value);
      items.push({
        fieldKey: "budget",
        label: "Total trip budget",
        value: base ? base.label : budgetA.value,
        editable: false,
      });
    }

    const flightA = answers.flight;
    if (flightA && flightA.kind === "single") {
      items.push({
        fieldKey: "flight",
        label: "Flight tolerance",
        value: labelFor(FLIGHT_TOLERANCE_OPTIONS, flightA.value) ?? flightA.value,
        editable: false,
      });
    }

    const timingA = answers.timing;
    if (timingA && timingA.kind === "single") {
      items.push({
        fieldKey: "timing",
        label: "Timing",
        value: labelFor(TIMING_V2_OPTIONS, timingA.value) ?? timingA.value,
        editable: false,
      });
    }

    const prioritiesA = answers.priorities;
    if (prioritiesA && prioritiesA.kind === "multi" && prioritiesA.values.length > 0) {
      const labels = prioritiesA.values
        .map(
          (v) =>
            PRIORITY_INTEREST_OPTIONS.find((o) => o.value === v)?.label ?? v,
        )
        .filter(Boolean);
      items.push({
        fieldKey: "priorities",
        label: "What matters most",
        value: labels,
        editable: false,
      });
    }

    const dealA = answers.dealbreakers;
    if (dealA && dealA.kind === "multi" && dealA.values.length > 0) {
      const labels = dealA.values
        .map((v) => DEALBREAKER_OPTIONS.find((o) => o.value === v)?.label ?? v)
        .filter(Boolean);
      items.push({
        fieldKey: "dealbreakers",
        label: "Dealbreakers",
        value: labels,
        editable: false,
      });
    }

    const expA = answers.experience;
    if (expA && expA.kind === "single") {
      items.push({
        fieldKey: "experience",
        label: "International experience",
        value:
          labelFor(TRAVEL_EXPERIENCE_OPTIONS, expA.value) ?? expA.value,
        editable: false,
      });
    }

    return items;
  },

  apply: (answers) => {
    const store = useHoneymoonStore.getState();

    const vibesA = answers.vibes;
    const durationA = answers.duration;
    const budgetA = answers.budget;
    const flightA = answers.flight;
    const timingA = answers.timing;
    const prioritiesA = answers.priorities;
    const dealA = answers.dealbreakers;
    const expA = answers.experience;

    const vibes: HoneymoonVibeTile[] =
      vibesA && vibesA.kind === "images"
        ? (vibesA.values as HoneymoonVibeTile[])
        : [];

    store.setVibeProfile({
      vibes,
      duration:
        durationA && durationA.kind === "single"
          ? (durationA.value as HoneymoonTripDuration)
          : null,
      budgetTier:
        budgetA && budgetA.kind === "single"
          ? (budgetA.value as HoneymoonBudgetTier)
          : null,
      flightTolerance:
        flightA && flightA.kind === "single"
          ? (flightA.value as HoneymoonFlightTolerance)
          : null,
      timing:
        timingA && timingA.kind === "single"
          ? (timingA.value as HoneymoonTimingV2)
          : null,
      travelMonth: "",
      priorityInterests:
        prioritiesA && prioritiesA.kind === "multi"
          ? (prioritiesA.values as HoneymoonPriorityInterest[])
          : [],
      dealbreakers:
        dealA && dealA.kind === "multi"
          ? (dealA.values as HoneymoonDealbreaker[])
          : [],
      travelExperience:
        expA && expA.kind === "single"
          ? (expA.value as HoneymoonTravelExperience)
          : null,
    });

    // Seed the moodboard with one pin per chosen vibe tile so the Pin the
    // feeling section isn't empty after the quiz. Uses the tile image as
    // the pin image and maps each tile to a moodboard category so the
    // filter pills still work.
    const tileToCategory: Record<HoneymoonVibeTile, "beaches" | "scenery" | "adventure" | "romance" | "hotels" | "food"> = {
      barefoot_unplugged: "beaches",
      wander_discover: "scenery",
      adventure_for_two: "adventure",
      wine_dine_romance: "food",
      full_luxury: "hotels",
      variety_mix: "scenery",
    };
    for (const tileValue of vibes) {
      const tile = VIBE_TILE_OPTIONS.find((o) => o.value === tileValue);
      if (!tile) continue;
      store.addMoodboardPin(
        tile.image_url,
        tileToCategory[tileValue],
        tile.label,
      );
    }
  },
};
