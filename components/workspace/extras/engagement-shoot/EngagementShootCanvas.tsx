"use client";

// ── Engagement Photo Shoot workspace ───────────────────────────────────────
// Six-phase planning module: Vision, Mood Board, Outfit Board, Trip & Location,
// Run Sheet, Final Board. State in stores/engagement-shoot-store.ts.

import {
  Camera,
  Compass,
  ListChecks,
  MapPinned,
  Send,
  Share2,
  Shirt,
  Sparkles,
} from "lucide-react";
import {
  ExtraActionButton,
  ExtraCanvasShell,
  type ExtraTabDef,
} from "../ExtraCanvasShell";
import { VisionSessionTab } from "./tabs/VisionSessionTab";
import { MoodBoardTab } from "./tabs/MoodBoardTab";
import { OutfitBoardTab } from "./tabs/OutfitBoardTab";
import { TripLocationTab } from "./tabs/TripLocationTab";
import { RunSheetTab } from "./tabs/RunSheetTab";
import { FinalBoardTab } from "./tabs/FinalBoardTab";
import { useEffect } from "react";
import { useEngagementShootStore } from "@/stores/engagement-shoot-store";

type ShootTabId =
  | "vision"
  | "mood_board"
  | "outfits"
  | "trip_location"
  | "run_sheet"
  | "final_board";

const TABS: ExtraTabDef<ShootTabId>[] = [
  { id: "vision", label: "Vision Session", icon: Sparkles },
  { id: "mood_board", label: "Mood Board", icon: Camera },
  { id: "outfits", label: "Outfit Board", icon: Shirt },
  { id: "trip_location", label: "Trip & Location", icon: MapPinned },
  { id: "run_sheet", label: "Run Sheet", icon: ListChecks },
  { id: "final_board", label: "Final Board", icon: Share2 },
];

export function EngagementShootCanvas() {
  const ensureSeeded = useEngagementShootStore((s) => s.ensureSeeded);
  useEffect(() => { ensureSeeded(); }, [ensureSeeded]);
  const vision = useEngagementShootStore((s) => s.vision);
  const looks = useEngagementShootStore((s) => s.looks);

  const subtitle = buildSubtitle(vision.destinationIdea, looks.length);

  return (
    <ExtraCanvasShell<ShootTabId>
      eyebrow="WORKSPACE · ENGAGEMENT SHOOT"
      icon={Compass}
      title="Engagement Shoot"
      subtitle={subtitle}
      actions={
        <>
          <ExtraActionButton
            icon={<Share2 size={13} strokeWidth={1.8} />}
            label="Share with photographer"
          />
          <ExtraActionButton
            icon={<Send size={13} strokeWidth={1.8} />}
            label="Export run sheet"
            primary
          />
        </>
      }
      tabs={TABS}
      renderTab={(tab, setTab) => <ShootTab tab={tab} setTab={setTab} />}
    />
  );
}

function ShootTab({
  tab,
  setTab,
}: {
  tab: ShootTabId;
  setTab: (t: ShootTabId) => void;
}) {
  switch (tab) {
    case "vision":
      return <VisionSessionTab onAdvance={() => setTab("mood_board")} />;
    case "mood_board":
      return <MoodBoardTab />;
    case "outfits":
      return <OutfitBoardTab />;
    case "trip_location":
      return <TripLocationTab />;
    case "run_sheet":
      return <RunSheetTab />;
    case "final_board":
      return <FinalBoardTab />;
  }
}

function buildSubtitle(destination: string, lookCount: number): string {
  const looks = lookCount === 1 ? "1 look" : `${lookCount} looks`;
  if (destination.trim()) {
    return `Planning — ${destination} · ${looks}`;
  }
  return `Planning — ${looks}`;
}
