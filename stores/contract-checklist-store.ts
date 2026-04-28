// ── Contract checklist store ──────────────────────────────────────────────
// Per-workspace confirmations for the shared ContractChecklistBlock used on
// every vendor-finding tab. Keyed by category_id + item_id so state persists
// across reloads and mirrors the Mehendi checklist's shape.
//
// Mehendi has its own checklist in `mehndi-store` because its items pre-fill
// from the capacity calculator. Everything else (Photography, Videography,
// Catering, Pandit, etc.) uses this store via CategoryShortlistContractTab.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

export interface ContractChecklistRow {
  category_id: string;
  item_id: string;
  checked: boolean;
  notes: string;
  // ISO timestamp captured the moment the row was confirmed; undefined when
  // the row has been toggled off again or never touched. The drawer prints
  // this so the couple can see "confirmed Apr 22" without opening the file.
  confirmed_at?: string;
  // Free-text label of an uploaded attachment (signed PDF page, screenshot
  // of a vendor email, etc.). We don't store binary content — the file
  // table lives elsewhere — but the label is enough to show "✔ contract.pdf".
  attachment_name?: string;
}

interface ContractChecklistState {
  rows: ContractChecklistRow[];
  toggle: (category_id: string, item_id: string) => void;
  updateNote: (category_id: string, item_id: string, notes: string) => void;
  setAttachment: (
    category_id: string,
    item_id: string,
    name: string | undefined,
  ) => void;
  getRow: (category_id: string, item_id: string) => ContractChecklistRow | undefined;
}

function upsert(
  rows: ContractChecklistRow[],
  category_id: string,
  item_id: string,
  patch: Partial<ContractChecklistRow>,
): ContractChecklistRow[] {
  const idx = rows.findIndex(
    (r) => r.category_id === category_id && r.item_id === item_id,
  );
  if (idx === -1) {
    return [
      ...rows,
      {
        category_id,
        item_id,
        checked: false,
        notes: "",
        ...patch,
      },
    ];
  }
  const next = [...rows];
  next[idx] = { ...next[idx], ...patch };
  return next;
}

export const useContractChecklistStore = create<ContractChecklistState>()(
  persist(
    (set, get) => ({
      rows: [],

      toggle: (category_id, item_id) =>
        set((state) => {
          const existing = state.rows.find(
            (r) => r.category_id === category_id && r.item_id === item_id,
          );
          const nextChecked = !(existing?.checked ?? false);
          return {
            rows: upsert(state.rows, category_id, item_id, {
              checked: nextChecked,
              confirmed_at: nextChecked ? new Date().toISOString() : undefined,
            }),
          };
        }),

      updateNote: (category_id, item_id, notes) =>
        set((state) => ({
          rows: upsert(state.rows, category_id, item_id, { notes }),
        })),

      setAttachment: (category_id, item_id, name) =>
        set((state) => ({
          rows: upsert(state.rows, category_id, item_id, {
            attachment_name: name,
          }),
        })),

      getRow: (category_id, item_id) =>
        get().rows.find(
          (r) => r.category_id === category_id && r.item_id === item_id,
        ),
    }),
    {
      name: "ananya:contract-checklist",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
    },
  ),
);

let _contractChecklistSyncTimer: ReturnType<typeof setTimeout> | null = null;
useContractChecklistStore.subscribe((state) => {
  if (_contractChecklistSyncTimer) clearTimeout(_contractChecklistSyncTimer);
  _contractChecklistSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("contract_checklist_state", { couple_id: coupleId, rows: state.rows });
  }, 600);
});
