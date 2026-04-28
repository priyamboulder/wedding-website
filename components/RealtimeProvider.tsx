"use client";

// Activates Supabase Realtime subscriptions after the user signs in.
// Subscribes to the tables most likely to change mid-session from another
// device or from vendor/admin actions. Cleans up on sign-out.

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function RealtimeProvider() {
  const user = useAuthStore((s) => s.user);
  const coupleId = user?.id ?? null;

  useEffect(() => {
    if (!coupleId) return;

    let unsub: (() => void) | null = null;

    import("@/lib/supabase/realtime").then(({ subscribeToTables }) => {
      unsub = subscribeToTables([
        {
          table: "checklist_items",
          coupleId,
          onChange: async (_event, _row) => {
            const { useChecklistStore } = await import("@/stores/checklist-store");
            useChecklistStore.getState().loadFromDB();
          },
        },
        {
          table: "guest_roster",
          coupleId,
          onChange: async (_event, _row) => {
            const { useGuestRosterStore } = await import("@/stores/guest-roster-store");
            useGuestRosterStore.getState().loadFromDB();
          },
        },
        {
          table: "rsvp_events",
          coupleId,
          onChange: async () => {
            const { hydrateAllStoresFromDB } = await import("@/lib/supabase/hydrate-stores");
            hydrateAllStoresFromDB(coupleId);
          },
        },
        {
          table: "events_state",
          coupleId,
          onChange: async () => {
            const { loadEventsFromDB } = await import("@/stores/events-store");
            loadEventsFromDB();
          },
        },
        {
          table: "venue_state",
          coupleId,
          onChange: async () => {
            const { loadVenueFromDB } = await import("@/stores/venue-store");
            loadVenueFromDB();
          },
        },
        {
          table: "couple_notifications",
          coupleId,
          onChange: async (_event, _row) => {
            // Re-fetch unread count when a new notification arrives
            if (_event === "INSERT") {
              const badge = document.querySelector("[data-notif-badge]");
              if (badge) badge.dispatchEvent(new CustomEvent("notif:refresh"));
            }
          },
        },
      ]);
    });

    return () => { unsub?.(); };
  }, [coupleId]);

  return null;
}
