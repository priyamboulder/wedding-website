// ── Extras canvas registry ──────────────────────────────────────────────────
// Parallel to components/workspace/canvases for non-vendor pages — celebrations
// (bachelorette, bachelor, welcome events, honeymoon) and keepsakes (photos &
// videos, notes & ideas). The workspace page dispatches through
// getExtraCanvas(id) when the sidebar selection is { type: "extra", id }.

import type { FC } from "react";
import type { ExtraPageId } from "@/types/workspace";
import { CelebrationCanvas } from "./CelebrationCanvas";
import { WELCOME_EVENTS_CONFIG } from "./celebration-presets";
import { BacheloretteCanvas } from "./bachelorette/BacheloretteCanvas";
import { BachelorCanvas } from "./bachelor/BachelorCanvas";
import { BridalShowerCanvas } from "./bridal-shower/BridalShowerCanvas";
import { BabyShowerCanvas } from "./baby-shower/BabyShowerCanvas";
import { HoneymoonCanvas } from "./HoneymoonCanvas";
import { EngagementShootCanvas } from "./engagement-shoot/EngagementShootCanvas";
import { PhotosKeepsakeCanvas } from "./PhotosKeepsakeCanvas";
import { NotesIdeasCanvas } from "./notes-ideas/NotesIdeasCanvas";
import { PostWeddingCanvas } from "./post-wedding/PostWeddingCanvas";
import { FirstAnniversaryCanvas } from "./first-anniversary/FirstAnniversaryCanvas";
import { FirstBirthdayCanvas } from "./first-birthday/FirstBirthdayCanvas";

const WelcomeEventsCanvas: FC = () => (
  <CelebrationCanvas config={WELCOME_EVENTS_CONFIG} />
);

// `Partial` because a handful of ExtraPageId union members
// (first_birthday etc.) may be reserved in the type but not yet have a
// canvas module registered. Callers fall back to a placeholder.
const EXTRA_CANVAS_BY_ID: Partial<Record<ExtraPageId, FC>> = {
  bachelorette: BacheloretteCanvas,
  bachelor: BachelorCanvas,
  bridal_shower: BridalShowerCanvas,
  baby_shower: BabyShowerCanvas,
  welcome_events: WelcomeEventsCanvas,
  honeymoon: HoneymoonCanvas,
  engagement_shoot: EngagementShootCanvas,
  photos_videos: PhotosKeepsakeCanvas,
  notes_ideas: NotesIdeasCanvas,
  post_wedding: PostWeddingCanvas,
  first_anniversary: FirstAnniversaryCanvas,
  first_birthday: FirstBirthdayCanvas,
};

const PlaceholderCanvas: FC = () => (
  <CelebrationCanvas config={WELCOME_EVENTS_CONFIG} />
);

export function getExtraCanvas(id: ExtraPageId): FC {
  return EXTRA_CANVAS_BY_ID[id] ?? PlaceholderCanvas;
}
