"use client";

// ── Vendor Roulette shell ───────────────────────────────────────────────────
// Top-level controller for the /vendors?tab=roulette experience. Manages
// transitions between the three phases: setup → swipe → summary. Reuses the
// existing Vendors tab bar so the shell stays consistent with "My Vendors"
// and "Coordination."

import { useState } from "react";
import { TopNav } from "@/components/shell/TopNav";
import { VendorsTabBar } from "@/components/vendors/VendorsTabBar";
import { RouletteSetup } from "./RouletteSetup";
import { RouletteSwipe } from "./RouletteSwipe";
import { RouletteSummary } from "./RouletteSummary";

type Phase =
  | { kind: "setup" }
  | { kind: "swipe"; sessionId: string }
  | { kind: "summary"; sessionId: string };

export function RouletteView({
  coordinationBadge,
  favoritesBadge,
}: {
  coordinationBadge?: string | null;
  favoritesBadge?: string | null;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "setup" });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav />
      <VendorsTabBar
        activeTab="roulette"
        coordinationBadge={coordinationBadge}
        favoritesBadge={favoritesBadge}
      />

      {phase.kind === "setup" && (
        <RouletteSetup
          onStart={(sessionId) => setPhase({ kind: "swipe", sessionId })}
        />
      )}

      {phase.kind === "swipe" && (
        <RouletteSwipe
          sessionId={phase.sessionId}
          onEnd={() =>
            setPhase({ kind: "summary", sessionId: phase.sessionId })
          }
          onRestart={() => setPhase({ kind: "setup" })}
        />
      )}

      {phase.kind === "summary" && (
        <RouletteSummary
          sessionId={phase.sessionId}
          onRestart={() => setPhase({ kind: "setup" })}
        />
      )}
    </div>
  );
}
