// ── Bridal Shower → Bride Brief quiz ───────────────────────────────────────
// Eight conversational questions. The planner (usually not the bride) uses
// this to articulate the kind of shower that would make the bride happiest.
// Output writes into the bridal-shower store's `brief` field; later the
// Concepts tab filters its library of 4–6 shower concepts against the brief.
//
// Like the bachelorette vibe-check this is registered under a non-workspace
// category slug — "bridal_shower" — and the category field is cast.

import type {
  QuizAnswerMap,
  QuizPreviewItem,
  QuizSchema,
} from "@/types/quiz";
import type { WorkspaceCategorySlug } from "@/types/workspace";
import type {
  BridePersonality,
  BudgetTier,
  ContributionModel,
  GuestCompositionTag,
  GuestCountBracket,
  PlannerRole,
  ShowerFormat,
  VenueType,
} from "@/types/bridal-shower";
import {
  BUDGET_TIER_OPTIONS,
  CONTRIBUTION_OPTIONS,
  FORMAT_OPTIONS,
  GUEST_COMPOSITION_OPTIONS,
  GUEST_COUNT_OPTIONS,
  PERSONALITY_OPTIONS,
  PLANNER_ROLE_OPTIONS,
  VENUE_OPTIONS,
} from "@/lib/bridal-shower-seed";
import { useBridalShowerStore } from "@/stores/bridal-shower-store";

function labelFor<T extends { value: string; label: string }>(
  opts: T[],
  value: string | null,
): string | null {
  if (!value) return null;
  return opts.find((o) => o.value === value)?.label ?? value;
}

export const bridalShowerBriefQuiz: QuizSchema = {
  id: "bridal_shower:brief:v1",
  version: "1",
  category: "bridal_shower" as WorkspaceCategorySlug,
  subsection: "brief",
  title: "The bride brief",
  intro:
    "Eight quick questions so we can generate concepts that actually feel like her — not a generic Pinterest shower.",
  estimated_minutes: 3,
  questions: [
    {
      id: "planner_role",
      prompt: "Who are you in this story?",
      helper: "Shapes tone, budget dynamics, and decision-making authority.",
      input: {
        type: "single_select",
        options: PLANNER_ROLE_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
    },
    {
      id: "personality",
      prompt: "What's she like?",
      helper: "Pick 1–2 — this is the single most important filter.",
      input: {
        type: "multi_select",
        min: 1,
        max: 2,
        options: PERSONALITY_OPTIONS.map((o) => ({
          value: o.value,
          label: `${o.emoji} ${o.label} — ${o.blurb}`,
        })),
      },
    },
    {
      id: "guest_count",
      prompt: "Who's coming — roughly how many?",
      helper: "Shapes venue, activities, food, and party-vs-celebration energy.",
      input: {
        type: "single_select",
        options: GUEST_COUNT_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
    },
    {
      id: "guest_composition",
      prompt: "What's the guest mix?",
      helper: "Select everything that applies — multi-gen showers need different activities than all-friends showers.",
      input: {
        type: "multi_select",
        min: 1,
        max: GUEST_COMPOSITION_OPTIONS.length,
        options: GUEST_COMPOSITION_OPTIONS,
      },
    },
    {
      id: "format",
      prompt: "What's the vibe?",
      input: {
        type: "single_select",
        options: FORMAT_OPTIONS.map((o) => ({
          value: o.value,
          label: `${o.emoji} ${o.label} — ${o.blurb}`,
        })),
      },
    },
    {
      id: "budget",
      prompt: "What's the total budget (not per person)?",
      input: {
        type: "single_select",
        options: BUDGET_TIER_OPTIONS.map((o) => ({
          value: o.value,
          label: `${o.label} — "${o.voice}"`,
        })),
      },
    },
    {
      id: "venue",
      prompt: "Where are you thinking?",
      input: {
        type: "single_select",
        options: VENUE_OPTIONS.map((o) => ({
          value: o.value,
          label: `${o.emoji} ${o.label}`,
        })),
      },
    },
    {
      id: "contribution",
      prompt: "Who's covering the food & drinks?",
      helper: "Keeps cost expectations aligned with your planning.",
      input: {
        type: "single_select",
        options: CONTRIBUTION_OPTIONS,
      },
    },
  ],

  preview: (answers) => {
    const items: QuizPreviewItem[] = [];

    const plannerA = answers.planner_role;
    if (plannerA && plannerA.kind === "single") {
      items.push({
        fieldKey: "planner_role",
        label: "Your role",
        value: labelFor(PLANNER_ROLE_OPTIONS, plannerA.value) ?? plannerA.value,
        editable: false,
      });
    }

    const personalityA = answers.personality;
    if (personalityA && personalityA.kind === "multi" && personalityA.values.length > 0) {
      const labels = personalityA.values
        .map((v) => PERSONALITY_OPTIONS.find((o) => o.value === v)?.label ?? v)
        .filter(Boolean);
      items.push({
        fieldKey: "personality",
        label: "What she's like",
        value: labels,
        editable: false,
      });
    }

    const countA = answers.guest_count;
    if (countA && countA.kind === "single") {
      items.push({
        fieldKey: "guest_count",
        label: "Guest count",
        value: labelFor(GUEST_COUNT_OPTIONS, countA.value) ?? countA.value,
        editable: false,
      });
    }

    const compA = answers.guest_composition;
    if (compA && compA.kind === "multi" && compA.values.length > 0) {
      const labels = compA.values
        .map((v) => GUEST_COMPOSITION_OPTIONS.find((o) => o.value === v)?.label ?? v)
        .filter(Boolean);
      items.push({
        fieldKey: "guest_composition",
        label: "Guest mix",
        value: labels,
        editable: false,
      });
    }

    const formatA = answers.format;
    if (formatA && formatA.kind === "single") {
      const opt = FORMAT_OPTIONS.find((o) => o.value === formatA.value);
      items.push({
        fieldKey: "format",
        label: "Format",
        value: opt ? `${opt.emoji} ${opt.label}` : formatA.value,
        editable: false,
      });
    }

    const budgetA = answers.budget;
    if (budgetA && budgetA.kind === "single") {
      items.push({
        fieldKey: "budget",
        label: "Total budget",
        value: labelFor(BUDGET_TIER_OPTIONS, budgetA.value) ?? budgetA.value,
        editable: false,
      });
    }

    const venueA = answers.venue;
    if (venueA && venueA.kind === "single") {
      items.push({
        fieldKey: "venue",
        label: "Venue",
        value: labelFor(VENUE_OPTIONS, venueA.value) ?? venueA.value,
        editable: false,
      });
    }

    const contribA = answers.contribution;
    if (contribA && contribA.kind === "single") {
      items.push({
        fieldKey: "contribution",
        label: "Contribution model",
        value: labelFor(CONTRIBUTION_OPTIONS, contribA.value) ?? contribA.value,
        editable: false,
      });
    }

    return items;
  },

  apply: (answers) => {
    const store = useBridalShowerStore.getState();

    const plannerA = answers.planner_role;
    const personalityA = answers.personality;
    const countA = answers.guest_count;
    const compA = answers.guest_composition;
    const formatA = answers.format;
    const budgetA = answers.budget;
    const venueA = answers.venue;
    const contribA = answers.contribution;

    store.updateBrief({
      plannerRole:
        plannerA && plannerA.kind === "single"
          ? (plannerA.value as PlannerRole)
          : null,
      bridePersonality:
        personalityA && personalityA.kind === "multi"
          ? (personalityA.values as BridePersonality[])
          : [],
      guestCount:
        countA && countA.kind === "single"
          ? (countA.value as GuestCountBracket)
          : null,
      guestComposition:
        compA && compA.kind === "multi"
          ? (compA.values as GuestCompositionTag[])
          : [],
      format:
        formatA && formatA.kind === "single"
          ? (formatA.value as ShowerFormat)
          : null,
      budgetTier:
        budgetA && budgetA.kind === "single"
          ? (budgetA.value as BudgetTier)
          : null,
      venueType:
        venueA && venueA.kind === "single"
          ? (venueA.value as VenueType)
          : null,
      contribution:
        contribA && contribA.kind === "single"
          ? (contribA.value as ContributionModel)
          : null,
    });
  },
};
