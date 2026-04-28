// ── Bachelorette → Vibe check quiz ────────────────────────────────────────
// Seven questions, ~3 minutes. Discovery-first input for the Bachelorette
// module — captures the energy, crew size, duration, budget, travel mode,
// hard-no list, and travel month. Output writes into the bachelorette
// store's `vibeProfile` field (used by destination discovery in later
// slices) and also nudges a couple of existing basics (guestCount,
// dateRange hint) so the rest of the module reflects the answers.
//
// The quiz is registered under the "bachelorette" category even though
// it is not part of the standard WorkspaceCategorySlug union — the
// category field is cast where needed. Quiz-store keys are strings at
// runtime, so the completion bookkeeping still works cleanly.

import type {
  QuizAnswerMap,
  QuizPreviewItem,
  QuizSchema,
} from "@/types/quiz";
import type { WorkspaceCategorySlug } from "@/types/workspace";
import type {
  BacheloretteEnergy,
  BudgetTier,
  CrewBracket,
  DurationPref,
  TravelMode,
} from "@/types/bachelorette";
import {
  AVOID_TAG_OPTIONS,
  BUDGET_TIER_OPTIONS,
  CREW_OPTIONS,
  DURATION_OPTIONS,
  ENERGY_OPTIONS,
  MONTH_OPTIONS,
  TRAVEL_MODE_OPTIONS,
} from "@/lib/bachelorette-seed";
import { useBacheloretteStore } from "@/stores/bachelorette-store";

function labelFor<T extends { value: string; label: string }>(
  opts: T[],
  value: string | null,
): string | null {
  if (!value) return null;
  return opts.find((o) => o.value === value)?.label ?? value;
}

export const bacheloretteVibeQuiz: QuizSchema = {
  id: "bachelorette:vibe:v1",
  version: "1",
  // Cast — "bachelorette" isn't in WorkspaceCategorySlug, but the quiz
  // store keys on strings. See file header.
  category: "bachelorette" as WorkspaceCategorySlug,
  subsection: "vibe",
  title: "The vibe check — let's find your trip",
  intro:
    "Seven quick questions on the energy, crew, budget, and timing. We'll use these to match you to destinations that actually fit — not a generic top-10 list.",
  estimated_minutes: 3,
  questions: [
    {
      id: "energy",
      prompt: "What's the energy you're going for?",
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
      prompt: "How big is your crew?",
      helper:
        "Matters for restaurant reservations, activity group sizes, and the kind of place you can book.",
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
      prompt: "How long are you thinking?",
      input: {
        type: "single_select",
        options: DURATION_OPTIONS,
      },
    },
    {
      id: "budget",
      prompt: "What's the per-person budget (not including flights)?",
      helper:
        "Shapes everything — the accommodation tier, dinner picks, and activity cost range.",
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
      prompt: "Open to flying, or keeping it drive-to?",
      input: {
        type: "single_select",
        options: TRAVEL_MODE_OPTIONS,
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
      helper: "Pick a month or leave it flexible — it changes weather & pricing.",
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

  apply: (answers) => {
    const store = useBacheloretteStore.getState();

    const energyA = answers.energy;
    const crewA = answers.crew;
    const durationA = answers.duration;
    const budgetA = answers.budget;
    const travelA = answers.travel;
    const avoidA = answers.avoid;
    const monthA = answers.month;

    store.setVibeProfile({
      energy:
        energyA && energyA.kind === "single"
          ? (energyA.value as BacheloretteEnergy)
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
      avoidTags:
        avoidA && avoidA.kind === "multi" ? avoidA.values : [],
      month: monthA && monthA.kind === "single" ? monthA.value : null,
    });

    // Nudge guestCount from the crew bracket if the store still has the
    // pre-seeded value — don't overwrite if the user has already tuned it.
    if (crewA && crewA.kind === "single") {
      const midpoint =
        CREW_OPTIONS.find((o) => o.value === crewA.value)?.midpoint ?? null;
      if (midpoint != null) {
        const current = useBacheloretteStore.getState().basics.guestCount;
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
