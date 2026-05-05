"use client";

// Convenience hook for canvases. Returns the three pieces of UI the canvas
// needs to splice into WorkspaceCanvas: subHeader (mode pill), headerActions
// (vision ring), and bodyOverride (the journey shell when mode === "guided").
//
// Keeping this here means each category canvas only needs:
//
//   const { subHeader, headerActions, bodyOverride } = useGuidedCanvas("catering");
//
// — and pass the three through to WorkspaceCanvas. The manual mode body
// stays exactly as it was; guided mode swaps it out.

import { useMemo, type ReactNode } from "react";
import { useCategoryJourneyState } from "@/lib/guided-journey/storage";
import { CATEGORY_SCHEMAS } from "@/lib/guided-journey/schemas";
import {
  buildRuntimeSessions,
  completionPercentage,
} from "@/lib/guided-journey/runtime";
import type { CategoryKey } from "@/lib/guided-journey/types";
import { GuidedJourneyShell } from "./GuidedJourneyShell";
import { GuidedJourneyProgressIndicator } from "./GuidedJourneyProgressIndicator";
import { GuidedModeSelector } from "./GuidedModeSelector";

export function useGuidedCanvas(category: CategoryKey): {
  subHeader: ReactNode;
  headerActions: ReactNode;
  bodyOverride: ReactNode | undefined;
} {
  const schema = CATEGORY_SCHEMAS[category];
  const [state, update] = useCategoryJourneyState(category);

  const sessions = useMemo(
    () => buildRuntimeSessions(schema, state),
    [schema, state],
  );
  const completed = sessions.filter((s) => s.status === "completed").length;
  const pct = completionPercentage(sessions);

  const subHeader = (
    <GuidedModeSelector
      category={category}
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
      <GuidedJourneyShell
        category={category}
        onSwitchToManual={() => update({ mode: "manual" })}
      />
    ) : undefined;

  return { subHeader, headerActions, bodyOverride };
}
