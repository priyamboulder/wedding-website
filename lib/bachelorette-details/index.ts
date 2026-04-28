// ── Bachelorette destination detail registry ──────────────────────────────
// Central index for the rich editorial destination guides. Not every
// destination in the pool has a guide — the resolver returns undefined for
// ones still being written, and the UI surfaces a "Guide coming soon"
// affordance for those.

import type { DestinationDetail } from "@/types/bachelorette";
import { nashvilleDetail } from "./nashville";
import { scottsdaleDetail } from "./scottsdale";
import { austinDetail } from "./austin";

const DETAILS: DestinationDetail[] = [
  nashvilleDetail,
  scottsdaleDetail,
  austinDetail,
];

export function getDestinationDetail(
  destinationId: string,
): DestinationDetail | undefined {
  return DETAILS.find((d) => d.destinationId === destinationId);
}

export function hasDestinationDetail(destinationId: string): boolean {
  return DETAILS.some((d) => d.destinationId === destinationId);
}

export function listDestinationDetails(): DestinationDetail[] {
  return DETAILS;
}
