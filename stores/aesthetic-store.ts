// ── Aesthetic Studio store ──────────────────────────────────────────────────
// Holds the inspiration wall, competing directions, the locked DNA (if any),
// and the amendment audit. Persisted to localStorage like every other Ananya
// surface until the Supabase swap (see lib/supabase/aesthetic.ts sketch).
//
// Design note: the store owns the *state*. The Zone B synthesize flow and
// Zone C lock flow are driven through stubbed API routes, and the store
// reconciles the streamed chunks via `applySynthesisChunk`.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, dbLoadBlob, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  InspirationImage,
  InspirationSource,
  InspirationTags,
  AestheticDirection,
  AestheticDNA,
  AestheticAmendment,
  AestheticField,
  DirectionSynthesis,
  SynthesisChunk,
  PaletteSwatch,
} from "@/types/aesthetic";
import {
  SEED_INSPIRATION_IMAGES,
  SEED_DIRECTIONS,
} from "@/lib/aesthetic-seed";

// ── IDs ─────────────────────────────────────────────────────────────────────

const makeId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// Deterministic hash for content_hash / image_set_hash. Not crypto — just
// stable dedup within localStorage.
function quickHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function computeImageSetHash(images: InspirationImage[]): string {
  const ids = images
    .map((img) => img.id)
    .sort()
    .join(",");
  return quickHash(ids);
}

// ── Source detection ────────────────────────────────────────────────────────

function detectSource(url: string): InspirationSource {
  const u = url.toLowerCase();
  if (u.includes("pinterest.") && u.includes("/pin/")) return "pinterest_pin";
  if (u.includes("pinterest.")) return "pinterest_board";
  if (u.includes("instagram.") && u.includes("/reel/")) return "instagram_reel";
  if (u.includes("instagram.")) return "instagram_post";
  return "unknown";
}

// ── Store shape ─────────────────────────────────────────────────────────────

interface AestheticState {
  images: InspirationImage[];
  directions: AestheticDirection[];
  dna: AestheticDNA | null;
  amendments: AestheticAmendment[];

  // Inspiration wall ───────────────────────────────────────────────────────
  addImagesFromUrl: (url: string) => InspirationImage[]; // may return multiple for boards
  setImageTags: (imageId: string, tags: InspirationTags) => void;
  setImageTagStatus: (
    imageId: string,
    status: InspirationImage["tag_status"],
  ) => void;
  setImageStorageUrl: (imageId: string, storageUrl: string) => void;
  assignImageToDirection: (imageId: string, directionId: string | null) => void;
  updateImageNotes: (imageId: string, notes: string) => void;
  deleteImage: (imageId: string) => void;
  getImagesForDirection: (directionId: string | null) => InspirationImage[];

  // Directions ─────────────────────────────────────────────────────────────
  createDirection: (input: {
    name: string;
    description?: string;
    seedImageIds?: string[];
  }) => AestheticDirection;
  updateDirection: (
    id: string,
    patch: Partial<Pick<AestheticDirection, "name" | "description">>,
  ) => void;
  deleteDirection: (id: string) => void;
  applySynthesisChunk: (directionId: string, chunk: SynthesisChunk) => void;
  markSynthesisStarted: (directionId: string) => void;

  // Lock / amend ───────────────────────────────────────────────────────────
  lockDirection: (
    directionId: string,
    input: {
      forbidden: string[];
      cultural_notes: string;
      locked_by: string;
    },
  ) => void;
  amendDNA: (input: {
    field: AestheticField;
    new_value: unknown;
    reason: string;
    amended_by: string;
  }) => void;
  unlockDNA: () => void;
  getAmendmentsForField: (field: AestheticField) => AestheticAmendment[];
}

// ── Initial state ───────────────────────────────────────────────────────────

const initialState = {
  images: SEED_INSPIRATION_IMAGES,
  directions: SEED_DIRECTIONS,
  dna: null as AestheticDNA | null,
  amendments: [] as AestheticAmendment[],
};

// ── Store ───────────────────────────────────────────────────────────────────

export const useAestheticStore = create<AestheticState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Inspiration wall ────────────────────────────────────────────────

      addImagesFromUrl: (url) => {
        const trimmed = url.trim();
        if (!trimmed) return [];

        const source = detectSource(trimmed);
        const isBoard = source === "pinterest_board";
        // Boards fan out; in the stub we create a single "board cover"
        // image and let the ingestion route add siblings. In the real
        // impl the board scrape returns N pins.
        const count = isBoard ? 1 : 1;

        const created: InspirationImage[] = [];
        const now = new Date().toISOString();
        const existingHashes = new Set(
          get().images.map((img) => img.content_hash),
        );
        for (let i = 0; i < count; i++) {
          const hashInput = `${trimmed}#${i}`;
          const contentHash = quickHash(hashInput);
          if (existingHashes.has(contentHash)) continue;
          existingHashes.add(contentHash);
          created.push({
            id: makeId("img"),
            source_url: trimmed,
            source_type: source,
            storage_url: null,
            content_hash: contentHash,
            tag_status: "pending",
            ai_tags: null,
            user_notes: "",
            direction_id: null,
            position: get().images.length + i,
            created_at: now,
          });
        }
        if (created.length === 0) return [];
        set((state) => ({ images: [...state.images, ...created] }));
        return created;
      },

      setImageTags: (imageId, tags) =>
        set((state) => ({
          images: state.images.map((img) =>
            img.id === imageId
              ? { ...img, ai_tags: tags, tag_status: "ready" }
              : img,
          ),
        })),

      setImageTagStatus: (imageId, status) =>
        set((state) => ({
          images: state.images.map((img) =>
            img.id === imageId ? { ...img, tag_status: status } : img,
          ),
        })),

      setImageStorageUrl: (imageId, storageUrl) =>
        set((state) => ({
          images: state.images.map((img) =>
            img.id === imageId ? { ...img, storage_url: storageUrl } : img,
          ),
        })),

      assignImageToDirection: (imageId, directionId) =>
        set((state) => {
          const assigned = state.images.find((img) => img.id === imageId);
          if (!assigned) return state;

          // Position within the new bucket
          const bucket = state.images.filter(
            (img) => img.direction_id === directionId && img.id !== imageId,
          );
          const position = bucket.length;

          return {
            images: state.images.map((img) =>
              img.id === imageId
                ? { ...img, direction_id: directionId, position }
                : img,
            ),
            directions: state.directions.map((d) =>
              d.id === directionId || d.id === assigned.direction_id
                ? { ...d, updated_at: new Date().toISOString() }
                : d,
            ),
          };
        }),

      updateImageNotes: (imageId, notes) =>
        set((state) => ({
          images: state.images.map((img) =>
            img.id === imageId ? { ...img, user_notes: notes } : img,
          ),
        })),

      deleteImage: (imageId) =>
        set((state) => ({
          images: state.images.filter((img) => img.id !== imageId),
        })),

      getImagesForDirection: (directionId) =>
        get()
          .images.filter((img) => img.direction_id === directionId)
          .sort((a, b) => a.position - b.position),

      // ── Directions ───────────────────────────────────────────────────────

      createDirection: ({ name, description, seedImageIds }) => {
        const now = new Date().toISOString();
        const direction: AestheticDirection = {
          id: makeId("dir"),
          name: name.trim() || "Untitled direction",
          description,
          synthesis: null,
          is_locked: false,
          locked_at: null,
          locked_by: null,
          created_at: now,
          updated_at: now,
        };

        set((state) => {
          let images = state.images;
          if (seedImageIds && seedImageIds.length > 0) {
            const idSet = new Set(seedImageIds);
            let pos = 0;
            images = state.images.map((img) =>
              idSet.has(img.id)
                ? { ...img, direction_id: direction.id, position: pos++ }
                : img,
            );
          }
          return {
            directions: [...state.directions, direction],
            images,
          };
        });
        return direction;
      },

      updateDirection: (id, patch) =>
        set((state) => ({
          directions: state.directions.map((d) =>
            d.id === id
              ? { ...d, ...patch, updated_at: new Date().toISOString() }
              : d,
          ),
        })),

      deleteDirection: (id) =>
        set((state) => ({
          directions: state.directions.filter((d) => d.id !== id),
          // Un-assign any images that were in the deleted direction
          images: state.images.map((img) =>
            img.direction_id === id ? { ...img, direction_id: null } : img,
          ),
        })),

      markSynthesisStarted: (directionId) => {
        const now = new Date().toISOString();
        set((state) => ({
          directions: state.directions.map((d) => {
            if (d.id !== directionId) return d;
            const images = state.images.filter(
              (img) => img.direction_id === directionId,
            );
            const imageSetHash = computeImageSetHash(images);
            const emptySynth: DirectionSynthesis = {
              manifesto: "",
              palette_primary: [],
              palette_secondary: [],
              textures: [],
              mood_tags: [],
              implied_moves: [],
              synthesized_at: now,
              image_set_hash: imageSetHash,
            };
            return {
              ...d,
              synthesis: emptySynth,
              updated_at: now,
            };
          }),
        }));
      },

      applySynthesisChunk: (directionId, chunk) =>
        set((state) => ({
          directions: state.directions.map((d) => {
            if (d.id !== directionId || !d.synthesis) return d;
            const s = d.synthesis;
            let next: DirectionSynthesis = s;
            switch (chunk.kind) {
              case "manifesto":
                next = { ...s, manifesto: s.manifesto + chunk.value };
                break;
              case "palette_primary":
                next = { ...s, palette_primary: chunk.value };
                break;
              case "palette_secondary":
                next = { ...s, palette_secondary: chunk.value };
                break;
              case "textures":
                next = { ...s, textures: chunk.value };
                break;
              case "mood_tags":
                next = { ...s, mood_tags: chunk.value };
                break;
              case "implied_moves":
                next = { ...s, implied_moves: chunk.value };
                break;
              case "done":
                next = { ...s, synthesized_at: new Date().toISOString() };
                break;
            }
            return { ...d, synthesis: next, updated_at: new Date().toISOString() };
          }),
        })),

      // ── Lock / amend ─────────────────────────────────────────────────────

      lockDirection: (directionId, input) => {
        const direction = get().directions.find((d) => d.id === directionId);
        if (!direction || !direction.synthesis) return;

        const now = new Date().toISOString();
        const s = direction.synthesis;
        const dna: AestheticDNA = {
          direction_id: direction.id,
          palette_primary: s.palette_primary,
          palette_secondary: s.palette_secondary,
          textures: s.textures,
          forbidden: input.forbidden,
          mood_tags: s.mood_tags,
          cultural_notes: input.cultural_notes,
          implied_moves: s.implied_moves,
          locked_at: now,
          locked_by: input.locked_by,
          amended_at: null,
        };

        set((state) => ({
          dna,
          directions: state.directions.map((d) =>
            d.id === directionId
              ? { ...d, is_locked: true, locked_at: now, locked_by: input.locked_by }
              : { ...d, is_locked: false },
          ),
        }));
      },

      amendDNA: ({ field, new_value, reason, amended_by }) => {
        const dna = get().dna;
        if (!dna) return;
        const now = new Date().toISOString();

        const old_value = (dna as unknown as Record<string, unknown>)[field];
        const amendment: AestheticAmendment = {
          id: makeId("amend"),
          amended_at: now,
          amended_by,
          field_changed: field,
          old_value,
          new_value,
          reason,
        };

        set((state) => ({
          dna: state.dna
            ? ({
                ...state.dna,
                [field]: new_value,
                amended_at: now,
              } as AestheticDNA)
            : state.dna,
          amendments: [amendment, ...state.amendments],
        }));
      },

      unlockDNA: () =>
        set((state) => ({
          dna: null,
          directions: state.directions.map((d) => ({
            ...d,
            is_locked: false,
            locked_at: null,
            locked_by: null,
          })),
        })),

      getAmendmentsForField: (field) =>
        get().amendments.filter((a) => a.field_changed === field),
    }),
    {
      name: "ananya.aesthetic",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

// ── Supabase sync ─────────────────────────────────────────────────────────
export async function loadAestheticFromDB() {
  const coupleId = getCurrentCoupleId();
  if (!coupleId) return;
  const blob = await dbLoadBlob<{ images: unknown; directions: unknown; dna: unknown; amendments: unknown }>(
    "aesthetic_state", coupleId,
  );
  if (!blob) return;
  useAestheticStore.setState({
    ...(blob.images !== undefined && { images: blob.images as never }),
    ...(blob.directions !== undefined && { directions: blob.directions as never }),
    ...(blob.dna !== undefined && { dna: blob.dna as never }),
    ...(blob.amendments !== undefined && { amendments: blob.amendments as never }),
  });
}

let _aestheticSyncTimer: ReturnType<typeof setTimeout> | null = null;
useAestheticStore.subscribe((state) => {
  if (_aestheticSyncTimer) clearTimeout(_aestheticSyncTimer);
  _aestheticSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { images, directions, dna, amendments } = state;
    dbUpsert("aesthetic_state", { couple_id: coupleId, images, directions, dna, amendments });
  }, 600);
});

// ── Utility exports for consumers ───────────────────────────────────────────

export { computeImageSetHash, quickHash, detectSource };

// Render helper: build a gradient background from a palette. Used when an
// image has no storage_url (seed data, ingestion pending). Export here so
// both the inspiration wall and the direction cards use the same function.
export function paletteGradient(palette: PaletteSwatch[]): string {
  if (palette.length === 0) {
    return "linear-gradient(135deg, #E8D9C3 0%, #8A9A7B 100%)";
  }
  if (palette.length === 1) {
    return palette[0].hex;
  }
  const stops = palette
    .map((s, i) => `${s.hex} ${Math.round((i / (palette.length - 1)) * 100)}%`)
    .join(", ");
  return `linear-gradient(135deg, ${stops})`;
}
