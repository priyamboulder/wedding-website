"use client";

// Guest Experiences variant of useGuidedCanvas. Reuses the shared mode pill
// and progress indicator, but swaps in the bespoke GuestExperiencesGuidedJourney
// shell because Sessions 2–4 are catalog-driven, not schema-driven.
//
// Mirrors the API of `useGuidedCanvas("...")` so the canvas wiring stays
// uniform across categories.

import { useMemo, type ReactNode } from "react";
import { useCategoryJourneyState } from "@/lib/guided-journey/storage";
import { CATEGORY_SCHEMAS } from "@/lib/guided-journey/schemas";
import {
  buildRuntimeSessions,
  completionPercentage,
} from "@/lib/guided-journey/runtime";
import { GuidedJourneyProgressIndicator } from "@/components/workspace/shared/guided-journey/GuidedJourneyProgressIndicator";
import { GuidedModeSelector } from "@/components/workspace/shared/guided-journey/GuidedModeSelector";
import { useGuestExperiencesStore } from "@/stores/guest-experiences-store";
import { GuestExperiencesGuidedJourney } from "./GuestExperiencesGuidedJourney";

const CATEGORY = "guest_experiences" as const;

export function useGuestExperiencesGuidedCanvas(): {
  subHeader: ReactNode;
  headerActions: ReactNode;
  bodyOverride: ReactNode | undefined;
} {
  const schema = CATEGORY_SCHEMAS[CATEGORY];
  const [state, update] = useCategoryJourneyState(CATEGORY);

  // Pull store-derived data so progress reflects activity in Sessions 2–4
  // even though the schema's fields for those sessions are empty.
  const cards = useGuestExperiencesStore((s) => s.cards);
  const briefText = useGuestExperiencesStore((s) => s.brief);
  const inspiration = useGuestExperiencesStore((s) => s.inspirationEntries);

  const reactionCount = useMemo(
    () => Object.values(cards).filter((c) => c.reaction !== null).length,
    [cards],
  );
  const assignmentCount = useMemo(
    () => Object.values(cards).filter((c) => c.event_assignments.length > 0).length,
    [cards],
  );

  const sessions = useMemo(() => {
    const base = buildRuntimeSessions(schema, state);
    return base.map((s) => {
      if (s.status === "completed") return s;
      if (s.key === "experience_browse" && reactionCount > 0)
        return { ...s, status: "in_progress" as const, hasData: true };
      if (s.key === "experience_map" && assignmentCount > 0)
        return { ...s, status: "in_progress" as const, hasData: true };
      if (
        s.key === "experience_brief" &&
        (briefText.trim().length > 0 || inspiration.length > 0)
      )
        return { ...s, status: "in_progress" as const, hasData: true };
      return s;
    });
  }, [schema, state, reactionCount, assignmentCount, briefText, inspiration.length]);

  const completed = sessions.filter((s) => s.status === "completed").length;
  const pct = completionPercentage(sessions);

  const subHeader = (
    <GuidedModeSelector
      category={CATEGORY}
      mode={state.mode}
      onChange={(mode) => update({ mode })}
    />
  );

  const headerActions =
    sessions.length > 0 ? (
      <GuidedJourneyProgressIndicator
        pct={pct}
        completed={completed}
        total={sessions.length}
      />
    ) : null;

  const bodyOverride =
    state.mode === "guided" ? (
      <GuestExperiencesGuidedJourney
        onSwitchToManual={() => update({ mode: "manual" })}
      />
    ) : undefined;

  return { subHeader, headerActions, bodyOverride };
}
