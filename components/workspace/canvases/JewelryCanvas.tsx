"use client";

// ── Jewelry workspace ───────────────────────────────────────────────────────
// Greenfield rebuild modelled after the Photography workspace. Six tabs,
// with Vision & Mood as the primary discovery surface. State lives in
// localStorage behind a single JewelryState document; the quiz modal and
// all section components are co-located in JewelryCoupleWorkspace.tsx.
//
// Two guided journeys live on this canvas:
//   • Vision (default) — the existing 3-session creative flow on Tab 1.
//   • Build           — the 4-session operational flow accessible from the
//                       top of Tabs 3/4/5/6. When launched it overrides
//                       the canvas body via bodyOverride.

import { useState, type ReactNode } from "react";
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
import { useGuidedCanvas } from "@/components/workspace/shared/guided-journey/useGuidedCanvas";
import { useJewelryBuildLauncher } from "@/stores/jewelry-build-launcher";
import { JewelryBuildShell } from "@/components/guided-journeys/jewelry-build/JewelryBuildShell";
import { JewelryBuildLauncherBanner } from "@/components/guided-journeys/jewelry-build/JewelryBuildLauncherBanner";
import type { JewelryBuildSessionKey } from "@/lib/guided-journeys/jewelry-build";

export function JewelryCanvas({ category }: { category: WorkspaceCategory }) {
  const [state, setState] = usePersistentState<JewelryState>(
    STORAGE_KEY,
    defaultState(),
  );
  const [quizOpen, setQuizOpen] = useState(false);
  const { subHeader, headerActions, bodyOverride } = useGuidedCanvas("jewelry");

  const buildActiveCategory = useJewelryBuildLauncher((s) => s.activeCategoryId);
  const buildActiveSession = useJewelryBuildLauncher((s) => s.activeSessionKey);
  const buildActive =
    buildActiveCategory === category.id && !!buildActiveSession;

  // Build journey takes precedence over Vision (default) override because
  // it's launched on demand from Tabs 3/4/5/6.
  const finalBody = buildActive ? (
    <JewelryBuildShell
      category={category}
      initialSessionKey={buildActiveSession ?? undefined}
    />
  ) : (
    bodyOverride
  );

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
        subHeader={buildActive ? null : subHeader}
        headerActions={buildActive ? null : headerActions}
        bodyOverride={finalBody}
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
            {tab === "bridal_jewelry" && (
              <TabWithBuildBanner
                categoryId={category.id}
                sessionKey="bridal_inventory"
              >
                <BridalJewelryTab />
              </TabWithBuildBanner>
            )}
            {tab === "groom_jewelry" && (
              <TabWithBuildBanner
                categoryId={category.id}
                sessionKey="groom_inventory"
              >
                <GroomJewelryTab />
              </TabWithBuildBanner>
            )}
            {tab === "family_heirlooms" && (
              <TabWithBuildBanner
                categoryId={category.id}
                sessionKey="family_heirlooms"
              >
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
              </TabWithBuildBanner>
            )}
            {tab === "fittings_coordination" && (
              <TabWithBuildBanner
                categoryId={category.id}
                sessionKey="fittings_custody"
              >
                <FittingsCoordinationTab />
              </TabWithBuildBanner>
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
              metalTone: result.metalTone,
            });
            setQuizOpen(false);
          }}
        />
      )}
    </>
  );
}

// Wraps a tab body with the dual-CTA Build launcher banner. The banner
// auto-hides when Vision is incomplete (see JewelryBuildLauncherBanner).
function TabWithBuildBanner({
  categoryId,
  sessionKey,
  children,
}: {
  categoryId: string;
  sessionKey: JewelryBuildSessionKey;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <JewelryBuildLauncherBanner
        categoryId={categoryId}
        sessionKey={sessionKey}
      />
      {children}
    </div>
  );
}
