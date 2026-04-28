"use client";

// ── Auth gate ──────────────────────────────────────────────────
// Hook that wraps an action handler so logged-out users see the
// sign-in modal first. The prompt is inviting, not blocking —
// users can still close the modal and keep browsing. Once signed
// in, the action runs immediately.

import { useCallback, useEffect, useRef } from "react";
import { useAuthStore, type AuthPromptReason } from "@/stores/auth-store";

export function useAuthGatedAction(reason: AuthPromptReason) {
  const user = useAuthStore((s) => s.user);
  const openSignUp = useAuthStore((s) => s.openSignUp);

  const pending = useRef<(() => void) | null>(null);

  // Once the user signs in, fire any pending action.
  useEffect(() => {
    if (user && pending.current) {
      const run = pending.current;
      pending.current = null;
      run();
    }
  }, [user]);

  return useCallback(
    (action: () => void) => {
      if (user) {
        action();
        return;
      }
      pending.current = action;
      openSignUp(reason);
    },
    [user, openSignUp, reason],
  );
}
