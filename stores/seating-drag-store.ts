// ── Seating drag store ────────────────────────────────────────────
// Tracks what's currently being dragged from the guest sidebar so the
// canvas can light up valid drop targets and accept drops on tables.
// Also tracks "tap-to-assign" mode: click a guest, then click a table.

import { create } from "zustand";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

interface SeatingDragState {
  draggingGuestIds: string[] | null; // multi-select support
  pickedGuestIds: string[] | null; // tap-to-assign buffer
  keepHousehold: boolean; // when dragging a household

  startDrag: (ids: string[], keepHousehold?: boolean) => void;
  endDrag: () => void;
  pickGuest: (id: string) => void;
  clearPick: () => void;
}

export const useSeatingDragStore = create<SeatingDragState>((set, get) => ({
  draggingGuestIds: null,
  pickedGuestIds: null,
  keepHousehold: false,

  startDrag: (ids, keepHousehold = false) =>
    set({ draggingGuestIds: ids.slice(), keepHousehold }),
  endDrag: () => set({ draggingGuestIds: null, keepHousehold: false }),
  pickGuest: (id) => {
    const current = get().pickedGuestIds ?? [];
    if (current.includes(id)) {
      const next = current.filter((g) => g !== id);
      set({ pickedGuestIds: next.length ? next : null });
    } else {
      set({ pickedGuestIds: [...current, id] });
    }
  },
  clearPick: () => set({ pickedGuestIds: null }),
}));

let _seatingDragSyncTimer: ReturnType<typeof setTimeout> | null = null;
useSeatingDragStore.subscribe((state) => {
  if (_seatingDragSyncTimer) clearTimeout(_seatingDragSyncTimer);
  _seatingDragSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("seating_drag_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
