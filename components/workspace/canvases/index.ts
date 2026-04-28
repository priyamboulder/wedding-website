// ── Category canvas registry ────────────────────────────────────────────────
// One canvas component per vendor category. The router in app/workspace/page.tsx
// dispatches through getCanvasForCategory(slug).
//
// Photography and Videography have bespoke canvases at
// components/workspace/{photography,videography} — their planning surfaces
// diverge from the generic WorkspaceCanvas (Photography's Shot List two-pane
// layout; Videography's per-event narrative arcs + mic/coverage matrix).
// Every other category still uses the shared WorkspaceCanvas wrapper.

import type { FC } from "react";
import type { WorkspaceCategory, WorkspaceCategorySlug } from "@/types/workspace";
import { PhotographyCanvas } from "@/components/workspace/photography/PhotographyCanvas";
import { VideographyCreativeCanvas } from "@/components/workspace/videography/VideographyCreativeCanvas";
import { CateringCanvas } from "./CateringCanvas";
import { DecorCanvas } from "./DecorCanvas";
import { EntertainmentCanvas } from "./EntertainmentCanvas";
import { GuestExperiencesCanvas } from "./GuestExperiencesCanvas";
import { HmuaCanvas } from "./HmuaCanvas";
import { VenueCanvas } from "./VenueCanvas";
import { StationeryCanvas } from "./StationeryCanvas";
import { MehndiCanvas } from "./MehndiCanvas";
import { PanditCanvas } from "./PanditCanvas";
import { TransportationCanvas } from "./TransportationCanvas";
import { WardrobeCanvas } from "./WardrobeCanvas";
import { JewelryCanvas } from "./JewelryCanvas";
import { CakeSweetsCanvas } from "./CakeSweetsCanvas";
import { GiftingCanvas } from "./GiftingCanvas";
import { TravelAccommodationsCanvas } from "./TravelAccommodationsCanvas";

export type CategoryCanvasComponent = FC<{ category: WorkspaceCategory }>;

const CANVAS_BY_SLUG: Record<WorkspaceCategorySlug, CategoryCanvasComponent> = {
  photography: PhotographyCanvas,
  videography: VideographyCreativeCanvas,
  catering: CateringCanvas,
  decor_florals: DecorCanvas,
  entertainment: EntertainmentCanvas,
  guest_experiences: GuestExperiencesCanvas,
  hmua: HmuaCanvas,
  venue: VenueCanvas,
  mehndi: MehndiCanvas,
  transportation: TransportationCanvas,
  stationery: StationeryCanvas,
  pandit_ceremony: PanditCanvas,
  wardrobe: WardrobeCanvas,
  jewelry: JewelryCanvas,
  cake_sweets: CakeSweetsCanvas,
  gifting: GiftingCanvas,
  travel_accommodations: TravelAccommodationsCanvas,
};

export function getCanvasForCategory(
  slug: WorkspaceCategorySlug,
): CategoryCanvasComponent {
  return CANVAS_BY_SLUG[slug];
}
