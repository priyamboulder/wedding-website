// ── User designs store ──────────────────────────────────────────────────
// Backs Studio's canvas editor. When a user picks a template or starts from
// scratch, a `user_design` row is created here. Persists to localStorage
// under `ananya:user-designs` (matches the other Ananya stores — localStorage
// only, no backend yet; swap to Supabase `user_designs` when wired).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SurfaceType } from "@/components/studio/canvas-editor/CanvasEditor";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

export type UserDesignStatus = "draft" | "in_review" | "finalized" | "ordered";

export interface UserDesign {
  id: string;
  user_id: string | null;                    // resolved from auth-store at creation time
  wedding_id: string | null;
  template_id: string | null;                // null if from scratch or AI-generated
  surface_type: SurfaceType;
  name: string;
  canvas_data: object;
  canvas_width: number;
  canvas_height: number;
  status: UserDesignStatus;
  version: number;
  is_shared: boolean;
  thumbnail_url: string | null;              // data: URL until Supabase Storage is wired
  exported_pdf_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateDesignInput {
  surface_type: SurfaceType;
  name: string;
  canvas_data: object;
  canvas_width: number;
  canvas_height: number;
  template_id?: string | null;
  metadata?: Record<string, unknown>;
}

interface UserDesignsState {
  designs: UserDesign[];

  getById: (id: string) => UserDesign | undefined;
  listBySurface: (surface: SurfaceType) => UserDesign[];
  createDesign: (input: CreateDesignInput, userId?: string | null, weddingId?: string | null) => UserDesign;
  updateCanvas: (id: string, canvasData: object, thumbnail?: string | null) => void;
  rename: (id: string, name: string) => void;
  setStatus: (id: string, status: UserDesignStatus) => void;
  deleteDesign: (id: string) => void;
}

function rid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

export const useUserDesignsStore = create<UserDesignsState>()(
  persist(
    (set, get) => ({
      designs: [],

      getById: (id) => get().designs.find((d) => d.id === id),

      listBySurface: (surface) =>
        get()
          .designs.filter((d) => d.surface_type === surface)
          .sort((a, b) => (b.updated_at > a.updated_at ? 1 : -1)),

      createDesign: (input, userId = null, weddingId = null) => {
        const design: UserDesign = {
          id: rid("dsn"),
          user_id: userId,
          wedding_id: weddingId,
          template_id: input.template_id ?? null,
          surface_type: input.surface_type,
          name: input.name,
          canvas_data: input.canvas_data,
          canvas_width: input.canvas_width,
          canvas_height: input.canvas_height,
          status: "draft",
          version: 1,
          is_shared: false,
          thumbnail_url: null,
          exported_pdf_url: null,
          metadata: input.metadata ?? {},
          created_at: nowISO(),
          updated_at: nowISO(),
        };
        set((s) => ({ designs: [design, ...s.designs] }));
        return design;
      },

      updateCanvas: (id, canvasData, thumbnail) =>
        set((s) => ({
          designs: s.designs.map((d) =>
            d.id === id
              ? {
                  ...d,
                  canvas_data: canvasData,
                  thumbnail_url: thumbnail !== undefined ? thumbnail : d.thumbnail_url,
                  version: d.version + 1,
                  updated_at: nowISO(),
                }
              : d,
          ),
        })),

      rename: (id, name) =>
        set((s) => ({
          designs: s.designs.map((d) => (d.id === id ? { ...d, name, updated_at: nowISO() } : d)),
        })),

      setStatus: (id, status) =>
        set((s) => ({
          designs: s.designs.map((d) => (d.id === id ? { ...d, status, updated_at: nowISO() } : d)),
        })),

      deleteDesign: (id) => set((s) => ({ designs: s.designs.filter((d) => d.id !== id) })),
    }),
    {
      name: "ananya:user-designs",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _userDesignsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useUserDesignsStore.subscribe((state) => {
  if (_userDesignsSyncTimer) clearTimeout(_userDesignsSyncTimer);
  _userDesignsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("user_designs_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
