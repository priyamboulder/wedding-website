// ── Sealed letters store ───────────────────────────────────────────────
// One letter per couple, written early in planning, "sealed" until the
// morning of the wedding. Once sealed it disappears from the dashboard
// and only a tiny envelope indicator remains. On `deliverAt` (the
// wedding date) the letter becomes visible again and is woven into the
// Year in Review keepsake.
//
// In production this would be encrypted at rest and delivery would be
// triggered by a daily cron job that emails both partners. Here we
// persist locally — the daily delivery check happens client-side on
// dashboard mount.

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SealedLetter {
  id: string;
  content: string;
  sealedAt: string;
  /** ISO date (YYYY-MM-DD) — morning of the wedding. */
  deliverAt: string;
  delivered: boolean;
  deliveredAt: string | null;
  createdAt: string;
}

interface SealedLettersState {
  letter: SealedLetter | null;
  /** Seal a fresh letter. Replaces any existing sealed letter. */
  sealLetter: (input: { content: string; deliverAt: string }) => SealedLetter;
  /** Mark the sealed letter as delivered (fires on/after deliverAt). */
  markDelivered: () => void;
  /** Open the envelope from the dashboard once delivered (no-op otherwise). */
  unseal: () => void;
  /** Wipe the letter entirely (debug / "rewrite my letter" flow). */
  clearLetter: () => void;
  /** Run the daily delivery check — call from a useEffect on mount. */
  runDeliveryCheck: (todayIso?: string) => void;
}

const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `sl_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export const useSealedLettersStore = create<SealedLettersState>()(
  persist(
    (set, get) => ({
      letter: null,

      sealLetter: (input) => {
        const now = new Date().toISOString();
        const letter: SealedLetter = {
          id: uid(),
          content: input.content,
          sealedAt: now,
          deliverAt: input.deliverAt,
          delivered: false,
          deliveredAt: null,
          createdAt: now,
        };
        set({ letter });
        return letter;
      },

      markDelivered: () => {
        const current = get().letter;
        if (!current || current.delivered) return;
        set({
          letter: {
            ...current,
            delivered: true,
            deliveredAt: new Date().toISOString(),
          },
        });
      },

      unseal: () => {
        const current = get().letter;
        if (!current) return;
        if (!current.delivered) return;
        // Already delivered — nothing further to do, the consumer simply
        // renders `letter.content`. Hook left for symmetry / future use.
      },

      clearLetter: () => set({ letter: null }),

      runDeliveryCheck: (todayIso) => {
        const current = get().letter;
        if (!current || current.delivered) return;
        const today = todayIso ?? new Date().toISOString().slice(0, 10);
        if (current.deliverAt <= today) {
          set({
            letter: {
              ...current,
              delivered: true,
              deliveredAt: new Date().toISOString(),
            },
          });
        }
      },
    }),
    {
      name: "ananya:sealed-letters",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return window.localStorage;
      }),
      partialize: (s) => ({ letter: s.letter }),
    },
  ),
);
