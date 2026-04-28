"use client";

// ── Jewelry workspace ───────────────────────────────────────────────────────
// Greenfield rebuild modelled after the Photography workspace. Six tabs,
// with Vision & Mood as the primary discovery surface. State lives in
// localStorage behind a single JewelryState document; the quiz modal and
// all section components are co-located in JewelryCoupleWorkspace.tsx.

import { useState } from "react";
import { Gem } from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  JEWELRY_TABS,
  type JewelryTabId,
} from "@/lib/workspace/category-tabs";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import {
  BridalJewelryTab,
  FamilyHeirloomsTab,
  FittingsCoordinationTab,
  GroomJewelryTab,
  QuizModal,
  ShortlistContractTab,
  STORAGE_KEY,
  VisionTab,
  defaultState,
  usePersistentState,
  type JewelryState,
} from "@/components/workspace/jewelry/JewelryCoupleWorkspace";

export function JewelryCanvas({ category }: { category: WorkspaceCategory }) {
  const [state, setState] = usePersistentState<JewelryState>(
    STORAGE_KEY,
    defaultState(),
  );
  const [quizOpen, setQuizOpen] = useState(false);

  const update = (
    patch: Partial<JewelryState> | ((s: JewelryState) => Partial<JewelryState>),
  ) => {
    setState((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch),
    }));
  };

  return (
    <>
      <WorkspaceCanvas<JewelryTabId>
        category={category}
        categoryIcon={Gem}
        eyebrowSuffix="Jewelry"
        tabs={JEWELRY_TABS}
        renderTab={(tab, setTab) => (
          <>
            {tab === "vision" && (
              <VisionTab
                state={state}
                update={update}
                onOpenQuiz={() => setQuizOpen(true)}
                onJumpToTab={setTab}
              />
            )}
            {tab === "shortlist_contract" && (
              <ShortlistContractTab category={category} />
            )}
            {tab === "bridal_jewelry" && <BridalJewelryTab />}
            {tab === "groom_jewelry" && <GroomJewelryTab />}
            {tab === "family_heirlooms" && (
              <FamilyHeirloomsTab
                heirlooms={state.heirlooms}
                onAdd={(h) => update((s) => ({ heirlooms: [...s.heirlooms, h] }))}
                onUpdate={(id, patch) =>
                  update((s) => ({
                    heirlooms: s.heirlooms.map((x) =>
                      x.id === id ? { ...x, ...patch } : x,
                    ),
                  }))
                }
                onRemove={(id) =>
                  update((s) => ({
                    heirlooms: s.heirlooms.filter((x) => x.id !== id),
                  }))
                }
              />
            )}
            {tab === "fittings_coordination" && <FittingsCoordinationTab />}
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
              metalTone: result.metalTone,
            });
            setQuizOpen(false);
          }}
        />
      )}
    </>
  );
}
