// ── Post-Wedding activation ────────────────────────────────────────────────
// Decides whether the "After the wedding" sidebar section should appear.
// Auto-activates once today >= wedding date + 1 day. Manual toggle lives in
// the post-wedding store's `manualUnlock` flag for early access.

import { useEventsStore } from "@/stores/events-store";
import { usePostWeddingStore } from "@/stores/post-wedding-store";

/** The wedding's anchor date — uses the ceremony event's eventDate if set,
 *  falling back to the latest dated event. Returns null if nothing is set. */
export function getWeddingAnchorDate(
  events: ReturnType<typeof useEventsStore.getState>["events"],
): string | null {
  const ceremony = events.find((e) => e.type === "ceremony" && e.eventDate);
  if (ceremony?.eventDate) return ceremony.eventDate;
  const dated = events
    .filter((e) => e.eventDate)
    .sort((a, b) => (a.eventDate! < b.eventDate! ? 1 : -1));
  return dated[0]?.eventDate ?? null;
}

/** Whether the wedding has passed (today >= weddingDate + 1). */
export function weddingHasPassed(weddingDate: string | null): boolean {
  if (!weddingDate) return false;
  const wed = new Date(weddingDate).getTime();
  if (Number.isNaN(wed)) return false;
  const day = 24 * 60 * 60 * 1000;
  return Date.now() >= wed + day;
}

/** Reactive hook — returns whether the Post-Wedding section is visible. */
export function usePostWeddingVisible(): boolean {
  const events = useEventsStore((s) => s.events);
  const manualUnlock = usePostWeddingStore((s) => s.manualUnlock);
  if (manualUnlock) return true;
  return weddingHasPassed(getWeddingAnchorDate(events));
}

/** Whether the "congratulations" banner should appear — post-wedding is
 *  visible, the banner hasn't been dismissed, and we reached it via the
 *  auto path (not the manual toggle). */
export function usePostWeddingBannerVisible(): boolean {
  const events = useEventsStore((s) => s.events);
  const manualUnlock = usePostWeddingStore((s) => s.manualUnlock);
  const dismissed = usePostWeddingStore((s) => s.bannerDismissed);
  if (dismissed) return false;
  if (manualUnlock && !weddingHasPassed(getWeddingAnchorDate(events))) {
    return false;
  }
  return weddingHasPassed(getWeddingAnchorDate(events));
}
