// ── Vision store ────────────────────────────────────────────────────────────
// Photography (and later: every vendor workspace) Vision tab state that
// doesn't fit neatly into workspace-store's existing primitives.
//
// Holds: style keywords (per category), couple-alignment entries, moodboard
// sections, shot list by event. Kept separate so we can iterate on the
// Vision tab without touching the broader workspace store.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  EventDayId,
  WorkspaceCategoryTag,
} from "@/types/checklist";

// ── Types ──────────────────────────────────────────────────────────────────

export type AlignmentStatus = "open" | "agreed" | "escalate";
export type VetoHolder = "bride" | "groom" | "both" | null;

export interface AlignmentEntry {
  id: string;
  category: WorkspaceCategoryTag;
  prompt: string;                     // e.g. "Do we want black-and-white coverage?"
  status: AlignmentStatus;
  veto: VetoHolder;                   // null = no veto claimed
  bride_position?: string;
  groom_position?: string;
  resolution?: string;                // filled in when status becomes "agreed"
  created_at: string;
  updated_at: string;
}

export interface MoodboardSection {
  id: string;
  category: WorkspaceCategoryTag;
  name: string;
  sort_order: number;
}

// Shot list rows live here (tab-specific enough not to pollute workspace_items).
export interface ShotListEntry {
  id: string;
  category: WorkspaceCategoryTag;
  event: EventDayId | "general";      // "general" for non-event-scoped shots
  description: string;
  priority: "must" | "preferred" | "bonus";
  sort_order: number;
  notes?: string;
}

// ── Store ──────────────────────────────────────────────────────────────────

interface VisionState {
  style_keywords: Record<string, string[]>;      // key = category slug
  alignment: AlignmentEntry[];
  sections: MoodboardSection[];
  // Moodboard-item membership by section. When unset, item is "unsectioned".
  moodboard_section_map: Record<string, string>; // moodboard_item_id → section_id
  shot_list: ShotListEntry[];

  // ── Keywords ──────────────────────────────────────────────────────────
  setKeywords: (category: WorkspaceCategoryTag, keywords: string[]) => void;

  // ── Alignment ─────────────────────────────────────────────────────────
  addAlignment: (
    category: WorkspaceCategoryTag,
    prompt: string,
  ) => AlignmentEntry;
  updateAlignment: (id: string, patch: Partial<AlignmentEntry>) => void;
  deleteAlignment: (id: string) => void;

  // ── Moodboard sections ────────────────────────────────────────────────
  addSection: (category: WorkspaceCategoryTag, name: string) => MoodboardSection;
  renameSection: (id: string, name: string) => void;
  deleteSection: (id: string) => void;
  assignItemToSection: (itemId: string, sectionId: string | null) => void;
  reorderSections: (category: WorkspaceCategoryTag, orderedIds: string[]) => void;

  // ── Shot list ─────────────────────────────────────────────────────────
  addShot: (
    category: WorkspaceCategoryTag,
    event: ShotListEntry["event"],
    description: string,
  ) => ShotListEntry;
  updateShot: (id: string, patch: Partial<ShotListEntry>) => void;
  deleteShot: (id: string) => void;
  moveShot: (id: string, event: ShotListEntry["event"]) => void;
  reorderShots: (
    category: WorkspaceCategoryTag,
    event: ShotListEntry["event"],
    orderedIds: string[],
  ) => void;

  // ── Selectors ─────────────────────────────────────────────────────────
  keywordsFor: (category: WorkspaceCategoryTag) => string[];
  alignmentFor: (category: WorkspaceCategoryTag) => AlignmentEntry[];
  sectionsFor: (category: WorkspaceCategoryTag) => MoodboardSection[];
  shotsFor: (
    category: WorkspaceCategoryTag,
    event?: ShotListEntry["event"],
  ) => ShotListEntry[];
}

const now = () => new Date().toISOString();
const rid = (p: string) =>
  `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const useVisionStore = create<VisionState>()(
  persist(
    (set, get) => ({
      style_keywords: {},
      alignment: [],
      sections: [],
      moodboard_section_map: {},
      shot_list: [],

      setKeywords: (category, keywords) =>
        set((state) => ({
          style_keywords: { ...state.style_keywords, [category]: keywords },
        })),

      addAlignment: (category, prompt) => {
        const entry: AlignmentEntry = {
          id: rid("align"),
          category,
          prompt: prompt.trim(),
          status: "open",
          veto: null,
          created_at: now(),
          updated_at: now(),
        };
        set((state) => ({ alignment: [...state.alignment, entry] }));
        return entry;
      },
      updateAlignment: (id, patch) =>
        set((state) => ({
          alignment: state.alignment.map((a) =>
            a.id === id ? { ...a, ...patch, updated_at: now() } : a,
          ),
        })),
      deleteAlignment: (id) =>
        set((state) => ({
          alignment: state.alignment.filter((a) => a.id !== id),
        })),

      addSection: (category, name) => {
        const existing = get().sections.filter((s) => s.category === category);
        const section: MoodboardSection = {
          id: rid("sec"),
          category,
          name: name.trim() || "Untitled",
          sort_order: existing.length,
        };
        set((state) => ({ sections: [...state.sections, section] }));
        return section;
      },
      renameSection: (id, name) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === id ? { ...s, name: name.trim() || s.name } : s,
          ),
        })),
      deleteSection: (id) =>
        set((state) => {
          const rest = { ...state.moodboard_section_map };
          for (const k of Object.keys(rest)) if (rest[k] === id) delete rest[k];
          return {
            sections: state.sections.filter((s) => s.id !== id),
            moodboard_section_map: rest,
          };
        }),
      assignItemToSection: (itemId, sectionId) =>
        set((state) => {
          const next = { ...state.moodboard_section_map };
          if (sectionId) next[itemId] = sectionId;
          else delete next[itemId];
          return { moodboard_section_map: next };
        }),
      reorderSections: (category, orderedIds) =>
        set((state) => ({
          sections: state.sections.map((s) => {
            if (s.category !== category) return s;
            const i = orderedIds.indexOf(s.id);
            return i >= 0 ? { ...s, sort_order: i } : s;
          }),
        })),

      addShot: (category, event, description) => {
        const existing = get().shot_list.filter(
          (s) => s.category === category && s.event === event,
        );
        const shot: ShotListEntry = {
          id: rid("shot"),
          category,
          event,
          description: description.trim(),
          priority: "preferred",
          sort_order: existing.length,
        };
        set((state) => ({ shot_list: [...state.shot_list, shot] }));
        return shot;
      },
      updateShot: (id, patch) =>
        set((state) => ({
          shot_list: state.shot_list.map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        })),
      deleteShot: (id) =>
        set((state) => ({
          shot_list: state.shot_list.filter((s) => s.id !== id),
        })),
      moveShot: (id, event) =>
        set((state) => ({
          shot_list: state.shot_list.map((s) =>
            s.id === id ? { ...s, event, sort_order: 999 } : s,
          ),
        })),
      reorderShots: (category, event, orderedIds) =>
        set((state) => ({
          shot_list: state.shot_list.map((s) => {
            if (s.category !== category || s.event !== event) return s;
            const i = orderedIds.indexOf(s.id);
            return i >= 0 ? { ...s, sort_order: i } : s;
          }),
        })),

      keywordsFor: (category) => get().style_keywords[category] ?? [],
      alignmentFor: (category) =>
        get()
          .alignment.filter((a) => a.category === category)
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          ),
      sectionsFor: (category) =>
        get()
          .sections.filter((s) => s.category === category)
          .sort((a, b) => a.sort_order - b.sort_order),
      shotsFor: (category, event) =>
        get()
          .shot_list.filter(
            (s) => s.category === category && (event ? s.event === event : true),
          )
          .sort((a, b) => a.sort_order - b.sort_order),
    }),
    {
      name: "ananya:workspace-vision",
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
    },
  ),
);

let _visionSyncTimer: ReturnType<typeof setTimeout> | null = null;
useVisionStore.subscribe((state) => {
  if (_visionSyncTimer) clearTimeout(_visionSyncTimer);
  _visionSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { style_keywords, alignment, sections, moodboard_section_map, shot_list } = state;
    dbUpsert("vision_state", { couple_id: coupleId, style_keywords, alignment, sections, moodboard_section_map, shot_list });
  }, 600);
});
