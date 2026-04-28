"use client";

// ── RealtimeProvider ─────────────────────────────────────────────────────────
// Drop this anywhere inside the community shell to activate live Supabase
// subscriptions for all community tables. It reads the current user from the
// auth store itself so it can be placed in both the main community page and
// standalone deep-link pages (confessional/[id], grapevine/[thread_id])
// without needing props threaded down from a server layout.

import { useCommunityRealtime } from "@/lib/supabase/use-community-realtime";
import { useAuthStore } from "@/stores/auth-store";

export function RealtimeProvider() {
  const user = useAuthStore((s) => s.user);
  useCommunityRealtime({ coupleId: user?.id, enabled: !!user });
  // Nothing to render — this component exists purely for its side-effect.
  return null;
}
