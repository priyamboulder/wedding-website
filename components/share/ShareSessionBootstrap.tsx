"use client";

// ── ShareSessionBootstrap ───────────────────────────────────────────────────
// One-time setup the /share landing fires on mount:
//   1. Generates the per-browser upload session UUID if it's missing, so
//      photo uploads from anonymous couples can be namespaced under a stable
//      Supabase Storage prefix until the submission row is written.
//   2. Pre-fills the draft's couple names + contact email from the auth
//      store when a user is signed in. The /share flow is fully public; this
//      is a convenience, not a gate. Existing draft values (anything the
//      couple has already typed) win over the pre-fill.

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useShareShaadiStore } from "@/stores/share-shaadi-store";

export function ShareSessionBootstrap() {
  const getUploadSessionId = useShareShaadiStore((s) => s.getUploadSessionId);
  const patch = useShareShaadiStore((s) => s.patch);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Touch the session id so it materializes if it was never read.
    getUploadSessionId();

    if (!user) return;

    const draft = useShareShaadiStore.getState().draft;
    const partnerName = user.wedding?.partnerName ?? "";

    // Defensive: an old persisted draft from before a field was added can
    // arrive missing that field. Treat anything non-string as empty.
    const brideName = typeof draft.brideName === "string" ? draft.brideName : "";
    const groomName = typeof draft.groomName === "string" ? draft.groomName : "";
    const contactEmail =
      typeof draft.contactEmail === "string" ? draft.contactEmail : "";

    const updates: Partial<{
      brideName: string;
      groomName: string;
      contactEmail: string;
    }> = {};
    if (!brideName.trim() && user.name) {
      updates.brideName = user.name.split(/\s+/)[0] ?? "";
    }
    if (!groomName.trim() && partnerName) {
      updates.groomName = partnerName.split(/\s+/)[0] ?? "";
    }
    if (!contactEmail.trim() && user.email) {
      updates.contactEmail = user.email;
    }
    if (Object.keys(updates).length > 0) {
      patch(updates);
    }
    // Bootstrapping is intentionally a once-on-mount effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
