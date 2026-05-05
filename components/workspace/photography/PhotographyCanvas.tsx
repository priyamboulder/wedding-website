"use client";

// ── Photography workspace shell ────────────────────────────────────────────
// Delegates header/tabs/body chrome to the shared WorkspaceCanvas so
// Photography aligns with the other per-category canvases (cake, stationery,
// videography, etc.). Tab content components live in PhotographyCoupleWorkspace.tsx
// and are imported here; this file owns the persistent state + quiz modal.
//
// Photography also offers a "Guided Journey" mode — a card-based progressive
// flow that walks first-time couples through five micro-sessions. The mode
// pill renders in the canvas sub-header; both modes write to the same fields
// so switching between them never loses data.

import { useCallback, useMemo, useState, type ElementType } from "react";
import { Album, Camera, Palette, Sparkles, Users } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import {
  AlbumTab,
  defaultState,
  GroupsTab,
  InspirationTab,
  QuizModal,
  STORAGE_KEY,
  usePersistentState,
  VisionTab,
  type PhotoMode,
  type PhotoState,
  type PhotoTabId,
} from "./PhotographyCoupleWorkspace";
import {
  GuidedJourney,
  PhotographyModeSelector,
  PhotographyNudgeBanner,
  PhotographyProgressIndicator,
  completionPercentage,
  computeSessions,
  nextIncompleteSession,
} from "./GuidedJourney";

const PHOTO_TABS: { id: PhotoTabId; label: string; icon: ElementType }[] = [
  { id: "vision", label: "Vision & Mood", icon: Palette },
  { id: "groups", label: "Group Photos", icon: Users },
  { id: "album", label: "Album & Gallery", icon: Album },
  { id: "inspiration", label: "Inspiration", icon: Sparkles },
];

export function PhotographyCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const [state, setState] = usePersistentState<PhotoState>(
    STORAGE_KEY,
    defaultState(),
  );
  const [quizOpen, setQuizOpen] = useState(false);

  const update = useCallback(
    (
      patch:
        | Partial<PhotoState>
        | ((s: PhotoState) => Partial<PhotoState>),
    ) => {
      setState((prev) => ({
        ...prev,
        ...(typeof patch === "function" ? patch(prev) : patch),
      }));
    },
    [setState],
  );

  const setMode = useCallback(
    (mode: PhotoMode) => update({ mode }),
    [update],
  );

  const sessions = useMemo(() => computeSessions(state), [state]);
  const completed = sessions.filter((s) => s.status === "completed").length;
  const pct = completionPercentage(sessions);
  const next = nextIncompleteSession(sessions);

  // Show the gentle nudge only when the couple is in guided mode, has at
  // least one completed session (i.e., they've come back), and haven't
  // already dismissed this session's nudge.
  const showNudge =
    state.mode === "guided" &&
    next !== null &&
    completed > 0 &&
    !state.dismissedNudgeSessions.includes(next.id);

  const subHeader = (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <PhotographyModeSelector mode={state.mode} onChange={setMode} />
      {showNudge && next && (
        <PhotographyNudgeBanner
          session={next}
          onTakeMeThere={() => {
            // Make sure we're in guided mode and let the journey deep-link.
            // GuidedJourney auto-opens the next incomplete session, so just
            // dismiss this nudge and trust the body to scroll into place.
            update((s) => ({
              mode: "guided",
              dismissedNudgeSessions: [...s.dismissedNudgeSessions, next.id],
            }));
          }}
          onDismiss={() =>
            update((s) => ({
              dismissedNudgeSessions: [
                ...s.dismissedNudgeSessions,
                next.id,
              ],
            }))
          }
        />
      )}
    </div>
  );

  const headerActions = (
    <PhotographyProgressIndicator
      pct={pct}
      completed={completed}
      total={sessions.length}
    />
  );

  const bodyOverride =
    state.mode === "guided" ? (
      <GuidedJourney
        state={state}
        update={update}
        onSwitchToManual={() => setMode("manual")}
      />
    ) : undefined;

  return (
    <>
      <WorkspaceCanvas<PhotoTabId>
        category={category}
        categoryIcon={Camera}
        eyebrowSuffix="Photography"
        tabs={PHOTO_TABS}
        headerActions={headerActions}
        subHeader={subHeader}
        bodyOverride={bodyOverride}
        renderTab={(tab) => (
          <>
            {tab === "vision" && (
              <VisionTab
                state={state}
                update={update}
                onOpenQuiz={() => setQuizOpen(true)}
              />
            )}
            {tab === "groups" && (
              <GroupsTab state={state} update={update} />
            )}
            {tab === "album" && (
              <AlbumTab state={state} update={update} />
            )}
            {tab === "inspiration" && (
              <InspirationTab state={state} update={update} />
            )}
          </>
        )}
      />

      {quizOpen && (
        <QuizModal
          onClose={() => setQuizOpen(false)}
          onComplete={(result) => {
            update({
              quizDone: true,
              brief: result.brief,
              styleKeywords: result.keywords,
              toneScore: result.tone,
            });
            setQuizOpen(false);
          }}
        />
      )}
    </>
  );
}
