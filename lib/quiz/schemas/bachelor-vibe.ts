// ── Bachelor → Vibe check quiz ────────────────────────────────────────────
// Eight questions, ~3 minutes. Discovery-first input for the Bachelor
// module — captures the energy, crew size, duration, budget, travel mode,
// groom's interests, hard-no list, and travel month. Writes into the
// bachelor store's `vibeProfile` field (used by destination discovery)
// and nudges guestCount from the crew bracket.
//
// Registered under the "bachelor" category even though it is not part of
// the standard WorkspaceCategorySlug union — the category field is cast
// where needed.

import type {
  QuizAnswerMap,
  QuizPreviewItem,
  QuizSchema,
} from "@/types/quiz";
import type { WorkspaceCategorySlug } from "@/types/workspace";
import type {
  BachelorEnergy,
  BudgetTier,
  CrewBracket,
  DurationPref,
  GroomInterest,
  TravelMode,
} from "@/types/bachelor";
import {
  AVOID_TAG_OPTIONS,
  BUDGET_TIER_OPTIONS,
  CREW_OPTIONS,
  DURATION_OPTIONS,
  ENERGY_OPTIONS,
  GROOM_INTEREST_OPTIONS,
  MONTH_OPTIONS,
  TRAVEL_MODE_OPTIONS,
} from "@/lib/bachelor-seed";
import { useBachelorStore } from "@/stores/bachelor-store";

function labelFor<T extends { value: string; label: string }>(
  opts: T[],
  value: string | null,
): string | null {
  if (!value) return null;
  return opts.find((o) => o.value === value)?.label ?? value;
}

export const bachelorVibeQuiz: QuizSchema = {
  id: "bachelor:vibe:v1",
  version: "1",
  category: "bachelor" as WorkspaceCategorySlug,
  subsection: "vibe",
  title: "The crew check — let's find your trip",
  intro:
    "Eight quick questions on the vibe, crew, budget, and what the groom actually loves. We'll match you to destinations that fit your crew — not a generic top-10 list.",
  estimated_minutes: 3,
  questions: [
    {
      id: "energy",
      prompt: "What's the move?",
      helper: "Pick the one that feels closest — you can layer more later.",
      input: {
        type: "single_select",
        options: ENERGY_OPTIONS.map((o) => ({
          value: o.value,
          label: `${o.label} — ${o.blurb}`,
        })),
      },
    },
    {
      id: "crew",
      prompt: "How many guys?",
      helper:
        "Matters for house-vs-hotel, activity minimums, restaurant capacity, and how you split.",
      input: {
        type: "single_select",
        options: CREW_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
    },
    {
      id: "duration",
      prompt: "How many nights?",
      input: {
        type: "single_select",
        options: DURATION_OPTIONS,
      },
    },
    {
      id: "budget",
      prompt: "Per-person budget (not including flights)?",
      helper:
        "Shapes everything — accommodation tier, activity cost, dinner picks, nightlife spend.",
      input: {
        type: "single_select",
        options: BUDGET_TIER_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
    },
    {
      id: "travel",
      prompt: "Flying or driving?",
      input: {
        type: "single_select",
        options: TRAVEL_MODE_OPTIONS,
      },
    },
    {
      id: "interests",
      prompt: "Anything the groom is really into?",
      helper:
        "Optional but powerful — lets us anchor the trip around something he actually loves.",
      optional: true,
      input: {
        type: "multi_select",
        min: 0,
        max: GROOM_INTEREST_OPTIONS.length,
        options: GROOM_INTEREST_OPTIONS,
      },
    },
    {
      id: "avoid",
      prompt: "Any hard no's?",
      helper: "Optional — lets us eliminate destinations that won't work.",
      optional: true,
      input: {
        type: "multi_select",
        min: 0,
        max: AVOID_TAG_OPTIONS.length,
        options: AVOID_TAG_OPTIONS,
      },
    },
    {
      id: "month",
      prompt: "When are you thinking?",
      helper:
        "Pick a month or leave it flexible — it changes weather, events in town, and pricing.",
      input: {
        type: "single_select",
        options: MONTH_OPTIONS,
      },
    },
  ],

  preview: (answers) => {
    const items: QuizPreviewItem[] = [];

    const energyA = answers.energy;
    if (energyA && energyA.kind === "single") {
      const base = ENERGY_OPTIONS.find((o) => o.value === energyA.value);
      items.push({
        fieldKey: "energy",
        label: "Energy",
        value: base ? `${base.label} — ${base.blurb}` : energyA.value,
        editable: false,
      });
    }

    const crewA = answers.crew;
    if (crewA && crewA.kind === "single") {
      items.push({
        fieldKey: "crew",
        label: "Crew size",
        value: labelFor(CREW_OPTIONS, crewA.value) ?? crewA.value,
        editable: false,
      });
    }

    const durationA = answers.duration;
    if (durationA && durationA.kind === "single") {
      items.push({
        fieldKey: "duration",
        label: "Duration",
        value: labelFor(DURATION_OPTIONS, durationA.value) ?? durationA.value,
        editable: false,
      });
    }

    const budgetA = answers.budget;
    if (budgetA && budgetA.kind === "single") {
      items.push({
        fieldKey: "budget",
        label: "Per-person budget",
        value: labelFor(BUDGET_TIER_OPTIONS, budgetA.value) ?? budgetA.value,
        editable: false,
      });
    }

    const travelA = answers.travel;
    if (travelA && travelA.kind === "single") {
      items.push({
        fieldKey: "travel",
        label: "Travel mode",
        value: labelFor(TRAVEL_MODE_OPTIONS, travelA.value) ?? travelA.value,
        editable: false,
      });
    }

    const interestsA = answers.interests;
    if (
      interestsA &&
      interestsA.kind === "multi" &&
      interestsA.values.length > 0
    ) {
      const labels = interestsA.values
        .map(
          (v) => GROOM_INTEREST_OPTIONS.find((o) => o.value === v)?.label ?? v,
        )
        .filter(Boolean);
      items.push({
        fieldKey: "interests",
        label: "Groom's interests",
        value: labels,
        editable: false,
      });
    }

    const avoidA = answers.avoid;
    if (avoidA && avoidA.kind === "multi" && avoidA.values.length > 0) {
      const labels = avoidA.values
        .map((v) => AVOID_TAG_OPTIONS.find((o) => o.value === v)?.label ?? v)
        .filter(Boolean);
      items.push({
        fieldKey: "avoid",
        label: "Hard no's",
        value: labels,
        editable: false,
      });
    }

    const monthA = answers.month;
    if (monthA && monthA.kind === "single") {
      items.push({
        fieldKey: "month",
        label: "Travel month",
        value: labelFor(MONTH_OPTIONS, monthA.value) ?? monthA.value,
        editable: false,
      });
    }

    return items;
  },

  apply: (answers: QuizAnswerMap) => {
    const store = useBachelorStore.getState();

    const energyA = answers.energy;
    const crewA = answers.crew;
    const durationA = answers.duration;
    const budgetA = answers.budget;
    const travelA = answers.travel;
    const interestsA = answers.interests;
    const avoidA = answers.avoid;
    const monthA = answers.month;

    store.setVibeProfile({
      energy:
        energyA && energyA.kind === "single"
          ? (energyA.value as BachelorEnergy)
          : null,
      crew:
        crewA && crewA.kind === "single"
          ? (crewA.value as CrewBracket)
          : null,
      duration:
        durationA && durationA.kind === "single"
          ? (durationA.value as DurationPref)
          : null,
      budgetTier:
        budgetA && budgetA.kind === "single"
          ? (budgetA.value as BudgetTier)
          : null,
      travelMode:
        travelA && travelA.kind === "single"
          ? (travelA.value as TravelMode)
          : null,
      groomInterests:
        interestsA && interestsA.kind === "multi"
          ? (interestsA.values as GroomInterest[])
          : [],
      avoidTags: avoidA && avoidA.kind === "multi" ? avoidA.values : [],
      month: monthA && monthA.kind === "single" ? monthA.value : null,
    });

    // Nudge guestCount from the crew bracket if store still has the
    // pre-seeded value.
    if (crewA && crewA.kind === "single") {
      const midpoint =
        CREW_OPTIONS.find((o) => o.value === crewA.value)?.midpoint ?? null;
      if (midpoint != null) {
        const current = useBachelorStore.getState().basics.guestCount;
        const matchedAnyBracket = CREW_OPTIONS.some(
          (o) => o.midpoint === current,
        );
        if (matchedAnyBracket || current === 0) {
          store.updateBasics({ guestCount: midpoint });
        }
      }
    }
  },
};
