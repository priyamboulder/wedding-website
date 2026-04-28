"use client";

// ── Photography workspace shell ────────────────────────────────────────────
// Delegates header/tabs/body chrome to the shared WorkspaceCanvas so
// Photography aligns with the other per-category canvases (cake, stationery,
// videography, etc.). Tab content components live in PhotographyCoupleWorkspace.tsx
// and are imported here; this file owns the persistent state + quiz modal.

import { useCallback, useState, type ElementType } from "react";
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
  type PhotoState,
  type PhotoTabId,
} from "./PhotographyCoupleWorkspace";

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

  return (
    <>
      <WorkspaceCanvas<PhotoTabId>
        category={category}
        categoryIcon={Camera}
        eyebrowSuffix="Photography"
        tabs={PHOTO_TABS}
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
