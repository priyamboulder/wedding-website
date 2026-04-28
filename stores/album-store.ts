// ── Album store ─────────────────────────────────────────────────────────────
// Backs Studio > Photo Albums. Stores album projects, spreads, slots, and the
// in-memory photo pool per project. Everything persists to localStorage under
// `ananya:albums` (matches the other Ananya stores — localStorage only, no
// backend).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AlbumCoverType,
  AlbumOrder,
  AlbumOrderAddress,
  AlbumOrderStatus,
  AlbumPaperType,
  AlbumPhoto,
  AlbumProject,
  AlbumSize,
  AlbumSlot,
  AlbumSpread,
  AlbumStatus,
  AlbumTextBlock,
} from "@/types/album";
import { DEFAULT_PAGE_COUNT, LAYOUT_BY_ID, suggestLayout } from "@/lib/album-layouts";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

function rid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

// Builds a fresh spread from a layout template id. Slots get empty photo_id
// so dragging a photo in is a simple assign, not a create.
function makeSpread(layoutId: string, position: number): AlbumSpread {
  const layout = LAYOUT_BY_ID[layoutId] ?? LAYOUT_BY_ID["full-bleed"];
  const slots: AlbumSlot[] = layout.frames.map((_, i) => ({
    id: rid("slot"),
    slot_index: i,
    photo_id: null,
    crop_x: 0.5,
    crop_y: 0.5,
    crop_zoom: 1,
    rotation: 0,
  }));
  const text_blocks: AlbumTextBlock[] = (layout.textFrames ?? []).map((_, i) => ({
    id: rid("txt"),
    block_index: i,
    content: layout.isTextOnly ? "Our story" : "",
    font: "var(--font-serif)",
    color: "#1A1A1A",
    alignment: "center",
  }));
  return {
    id: rid("spread"),
    position,
    layout_template_id: layout.id,
    is_text_only: !!layout.isTextOnly,
    slots,
    text_blocks,
  };
}

function makeInitialSpreads(pageCount: number): AlbumSpread[] {
  // Pages are grouped in spreads of 2. Start with one title page + filler
  // full-bleed spreads; the user replaces them as they design.
  const spreadCount = Math.max(1, Math.ceil(pageCount / 2));
  const spreads: AlbumSpread[] = [makeSpread("title-page", 0)];
  for (let i = 1; i < spreadCount; i++) {
    spreads.push(makeSpread("full-bleed", i));
  }
  return spreads;
}

interface CreateAlbumInput {
  title: string;
  size: AlbumSize;
  cover_type: AlbumCoverType;
  paper_type: AlbumPaperType;
  spine_text?: string;
  page_count?: number;
  photo_pool?: AlbumPhoto[];
}

interface AlbumState {
  albums: AlbumProject[];

  // Projects
  createAlbum: (input: CreateAlbumInput) => AlbumProject;
  updateAlbum: (id: string, patch: Partial<AlbumProject>) => void;
  deleteAlbum: (id: string) => void;
  duplicateAlbum: (id: string) => AlbumProject | null;
  setStatus: (id: string, status: AlbumStatus) => void;

  // Photo pool
  addPhotos: (albumId: string, photos: AlbumPhoto[]) => void;
  removePhoto: (albumId: string, photoId: string) => void;
  setCoverPhoto: (albumId: string, photoId: string | null) => void;

  // Spreads
  addSpread: (albumId: string, afterPosition: number, layoutId?: string) => void;
  deleteSpread: (albumId: string, spreadId: string) => void;
  duplicateSpread: (albumId: string, spreadId: string) => void;
  reorderSpread: (albumId: string, spreadId: string, newPosition: number) => void;
  setSpreadLayout: (albumId: string, spreadId: string, layoutId: string) => void;

  // Slots
  assignPhoto: (albumId: string, spreadId: string, slotId: string, photoId: string | null) => void;
  updateSlot: (albumId: string, spreadId: string, slotId: string, patch: Partial<AlbumSlot>) => void;
  swapSlotPhotos: (albumId: string, fromSpreadId: string, fromSlotId: string, toSpreadId: string, toSlotId: string) => void;

  // Text
  updateTextBlock: (albumId: string, spreadId: string, blockId: string, patch: Partial<AlbumTextBlock>) => void;

  // AI auto-layout replaces the spreads wholesale with a freshly-designed set.
  replaceSpreads: (albumId: string, spreads: AlbumSpread[]) => void;

  // Orders
  placeOrder: (
    albumId: string,
    input: {
      quantity: number;
      unit_price: number;
      total_price: number;
      shipping_addresses: AlbumOrderAddress[];
    },
  ) => AlbumOrder;
  updateOrderStatus: (albumId: string, orderId: string, status: AlbumOrderStatus, tracking?: string) => void;
}

function writeAlbum(
  state: AlbumState,
  albumId: string,
  mutator: (a: AlbumProject) => AlbumProject,
): AlbumProject[] {
  return state.albums.map((a) => (a.id === albumId ? { ...mutator(a), updated_at: now() } : a));
}

function writeSpread(
  album: AlbumProject,
  spreadId: string,
  mutator: (s: AlbumSpread) => AlbumSpread,
): AlbumProject {
  return {
    ...album,
    spreads: album.spreads.map((s) => (s.id === spreadId ? mutator(s) : s)),
  };
}

export const useAlbumStore = create<AlbumState>()(
  persist(
    (set, get) => ({
      albums: [],

      createAlbum: (input) => {
        const pageCount = input.page_count ?? DEFAULT_PAGE_COUNT;
        const project: AlbumProject = {
          id: rid("album"),
          wedding_id: null,
          title: input.title,
          status: "draft",
          size: input.size,
          cover_type: input.cover_type,
          paper_type: input.paper_type,
          spine_text: input.spine_text ?? input.title,
          cover_photo_id: null,
          photo_pool: input.photo_pool ?? [],
          spreads: makeInitialSpreads(pageCount),
          created_at: now(),
          updated_at: now(),
        };
        set((s) => ({ albums: [project, ...s.albums] }));
        return project;
      },

      updateAlbum: (id, patch) =>
        set((s) => ({ albums: writeAlbum(s, id, (a) => ({ ...a, ...patch })) })),

      deleteAlbum: (id) =>
        set((s) => ({ albums: s.albums.filter((a) => a.id !== id) })),

      duplicateAlbum: (id) => {
        const source = get().albums.find((a) => a.id === id);
        if (!source) return null;
        const copy: AlbumProject = {
          ...source,
          id: rid("album"),
          title: `${source.title} (copy)`,
          status: "draft",
          created_at: now(),
          updated_at: now(),
          ordered_at: undefined,
          spreads: source.spreads.map((sp) => ({
            ...sp,
            id: rid("spread"),
            slots: sp.slots.map((sl) => ({ ...sl, id: rid("slot") })),
            text_blocks: sp.text_blocks.map((tb) => ({ ...tb, id: rid("txt") })),
          })),
        };
        set((s) => ({ albums: [copy, ...s.albums] }));
        return copy;
      },

      setStatus: (id, status) =>
        set((s) => ({
          albums: writeAlbum(s, id, (a) => ({
            ...a,
            status,
            ordered_at: status === "ordered" ? now() : a.ordered_at,
          })),
        })),

      addPhotos: (albumId, photos) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => {
            const seen = new Set(a.photo_pool.map((p) => p.id));
            const fresh = photos.filter((p) => !seen.has(p.id));
            return { ...a, photo_pool: [...a.photo_pool, ...fresh] };
          }),
        })),

      removePhoto: (albumId, photoId) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => {
            const pool = a.photo_pool.filter((p) => p.id !== photoId);
            const spreads = a.spreads.map((sp) => ({
              ...sp,
              slots: sp.slots.map((sl) => (sl.photo_id === photoId ? { ...sl, photo_id: null } : sl)),
            }));
            const cover_photo_id = a.cover_photo_id === photoId ? null : a.cover_photo_id;
            return { ...a, photo_pool: pool, spreads, cover_photo_id };
          }),
        })),

      setCoverPhoto: (albumId, photoId) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => ({ ...a, cover_photo_id: photoId })),
        })),

      addSpread: (albumId, afterPosition, layoutId) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => {
            const newSpread = makeSpread(layoutId ?? "full-bleed", afterPosition + 1);
            const shifted = a.spreads.map((sp) =>
              sp.position > afterPosition ? { ...sp, position: sp.position + 1 } : sp,
            );
            return {
              ...a,
              spreads: [...shifted, newSpread].sort((x, y) => x.position - y.position),
            };
          }),
        })),

      deleteSpread: (albumId, spreadId) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => {
            const remaining = a.spreads
              .filter((sp) => sp.id !== spreadId)
              .sort((x, y) => x.position - y.position)
              .map((sp, i) => ({ ...sp, position: i }));
            // Never leave an album with zero spreads
            if (remaining.length === 0) return { ...a, spreads: [makeSpread("full-bleed", 0)] };
            return { ...a, spreads: remaining };
          }),
        })),

      duplicateSpread: (albumId, spreadId) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => {
            const source = a.spreads.find((sp) => sp.id === spreadId);
            if (!source) return a;
            const copy: AlbumSpread = {
              ...source,
              id: rid("spread"),
              position: source.position + 1,
              slots: source.slots.map((sl) => ({ ...sl, id: rid("slot") })),
              text_blocks: source.text_blocks.map((tb) => ({ ...tb, id: rid("txt") })),
            };
            const shifted = a.spreads.map((sp) =>
              sp.position > source.position ? { ...sp, position: sp.position + 1 } : sp,
            );
            return {
              ...a,
              spreads: [...shifted, copy].sort((x, y) => x.position - y.position),
            };
          }),
        })),

      reorderSpread: (albumId, spreadId, newPosition) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => {
            const source = a.spreads.find((sp) => sp.id === spreadId);
            if (!source) return a;
            const without = a.spreads.filter((sp) => sp.id !== spreadId);
            const clamped = Math.max(0, Math.min(newPosition, without.length));
            const rebuilt: AlbumSpread[] = [];
            let cursor = 0;
            for (let i = 0; i <= without.length; i++) {
              if (i === clamped) {
                rebuilt.push({ ...source, position: cursor++ });
              }
              const next = without[i];
              if (next) rebuilt.push({ ...next, position: cursor++ });
            }
            return { ...a, spreads: rebuilt };
          }),
        })),

      setSpreadLayout: (albumId, spreadId, layoutId) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) =>
            writeSpread(a, spreadId, (sp) => {
              const layout = LAYOUT_BY_ID[layoutId];
              if (!layout) return sp;
              // Preserve as many photo assignments as possible when the new
              // layout has fewer slots than the old one.
              const carryPhotos = sp.slots.map((sl) => sl.photo_id).filter(Boolean) as string[];
              const slots: AlbumSlot[] = layout.frames.map((_, i) => ({
                id: rid("slot"),
                slot_index: i,
                photo_id: carryPhotos[i] ?? null,
                crop_x: 0.5,
                crop_y: 0.5,
                crop_zoom: 1,
                rotation: 0,
              }));
              const text_blocks: AlbumTextBlock[] = (layout.textFrames ?? []).map((_, i) => {
                const existing = sp.text_blocks[i];
                return (
                  existing ?? {
                    id: rid("txt"),
                    block_index: i,
                    content: layout.isTextOnly ? "Our story" : "",
                    font: "var(--font-serif)",
                    color: "#1A1A1A",
                    alignment: "center",
                  }
                );
              });
              return { ...sp, layout_template_id: layout.id, is_text_only: !!layout.isTextOnly, slots, text_blocks };
            }),
          ),
        })),

      assignPhoto: (albumId, spreadId, slotId, photoId) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) =>
            writeSpread(a, spreadId, (sp) => ({
              ...sp,
              slots: sp.slots.map((sl) =>
                sl.id === slotId ? { ...sl, photo_id: photoId, crop_x: 0.5, crop_y: 0.5, crop_zoom: 1 } : sl,
              ),
            })),
          ),
        })),

      updateSlot: (albumId, spreadId, slotId, patch) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) =>
            writeSpread(a, spreadId, (sp) => ({
              ...sp,
              slots: sp.slots.map((sl) => (sl.id === slotId ? { ...sl, ...patch } : sl)),
            })),
          ),
        })),

      swapSlotPhotos: (albumId, fromSpreadId, fromSlotId, toSpreadId, toSlotId) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => {
            const fromSpread = a.spreads.find((sp) => sp.id === fromSpreadId);
            const toSpread = a.spreads.find((sp) => sp.id === toSpreadId);
            if (!fromSpread || !toSpread) return a;
            const fromSlot = fromSpread.slots.find((sl) => sl.id === fromSlotId);
            const toSlot = toSpread.slots.find((sl) => sl.id === toSlotId);
            if (!fromSlot || !toSlot) return a;
            const fromPhoto = fromSlot.photo_id;
            const toPhoto = toSlot.photo_id;
            return {
              ...a,
              spreads: a.spreads.map((sp) => {
                if (sp.id === fromSpreadId) {
                  return {
                    ...sp,
                    slots: sp.slots.map((sl) => (sl.id === fromSlotId ? { ...sl, photo_id: toPhoto } : sl)),
                  };
                }
                if (sp.id === toSpreadId) {
                  return {
                    ...sp,
                    slots: sp.slots.map((sl) => (sl.id === toSlotId ? { ...sl, photo_id: fromPhoto } : sl)),
                  };
                }
                return sp;
              }),
            };
          }),
        })),

      updateTextBlock: (albumId, spreadId, blockId, patch) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) =>
            writeSpread(a, spreadId, (sp) => ({
              ...sp,
              text_blocks: sp.text_blocks.map((tb) => (tb.id === blockId ? { ...tb, ...patch, is_ai_generated: false } : tb)),
            })),
          ),
        })),

      replaceSpreads: (albumId, spreads) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => ({
            ...a,
            spreads: spreads.map((sp, i) => ({ ...sp, position: i })),
            ai_layout_version: (a.ai_layout_version ?? 0) + 1,
          })),
        })),

      placeOrder: (albumId, input) => {
        const order: AlbumOrder = {
          id: rid("order"),
          album_project_id: albumId,
          quantity: input.quantity,
          unit_price: input.unit_price,
          total_price: input.total_price,
          shipping_addresses: input.shipping_addresses,
          stripe_payment_id: `pi_mock_${Math.random().toString(36).slice(2, 12)}`,
          status: "placed",
          estimated_delivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
          placed_at: now(),
        };
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => ({
            ...a,
            orders: [...(a.orders ?? []), order],
            status: "ordered" as AlbumStatus,
            ordered_at: now(),
          })),
        }));
        return order;
      },

      updateOrderStatus: (albumId, orderId, status, tracking) =>
        set((s) => ({
          albums: writeAlbum(s, albumId, (a) => ({
            ...a,
            orders: (a.orders ?? []).map((o) =>
              o.id === orderId ? { ...o, status, tracking_number: tracking ?? o.tracking_number } : o,
            ),
          })),
        })),
    }),
    {
      name: "ananya:albums",
      version: 1,
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

let _albumSyncTimer: ReturnType<typeof setTimeout> | null = null;
useAlbumStore.subscribe((state) => {
  if (_albumSyncTimer) clearTimeout(_albumSyncTimer);
  _albumSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("album_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});

// Exposed helper used by callers that don't need the full store.
export { suggestLayout };
