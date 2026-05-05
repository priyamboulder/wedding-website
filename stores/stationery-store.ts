// â”€â”€ Stationery workspace store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Zustand-backed, localStorage-persisted state for the Stationery &
// Invitations workspace. Organized around the spec's six tabs: identity,
// suite, print matrix, shortlist/contract (shared), production timeline,
// and documents.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  StationeryDocument,
  StationeryDocumentKind,
  StationeryFoilOption,
  StationeryGuestTier,
  StationeryInspirationEntry,
  StationeryItemStatus,
  StationeryMatrixCells,
  StationeryMatrixMode,
  StationeryMatrixPiece,
  StationeryMotifDirection,
  StationeryPaletteSource,
  StationeryPaperTexture,
  StationeryPieceContent,
  StationeryPrintMethod,
  StationeryRefReaction,
  StationeryRefReactions,
  StationerySampleReaction,
  StationerySampleRequest,
  StationerySampleRequestStatus,
  StationerySuiteAddon,
  StationerySuiteDetail,
  StationerySuiteInspiration,
  StationerySuiteItem,
  StationerySuitePreference,
  StationerySwatch,
  StationeryTimelineMilestone,
  StationeryTypographyDirection,
  StationeryTypographyVibe,
  StationeryVisualIdentity,
} from "@/types/stationery";
import { matrixCellKey } from "@/types/stationery";
import {
  SEED_STATIONERY_DOCUMENTS,
  SEED_STATIONERY_MATRIX_CELLS,
  SEED_STATIONERY_PIECE_CONTENT,
  SEED_STATIONERY_SUITE,
  SEED_STATIONERY_TIERS,
  SEED_STATIONERY_TIMELINE_MILESTONES,
  SEED_STATIONERY_VISUAL_IDENTITY,
} from "@/lib/stationery-seed";
import {
  SEED_STATIONERY_SUITE_ADDONS,
  SEED_STATIONERY_SUITE_DETAILS,
  SEED_STATIONERY_SUITE_INSPIRATIONS,
} from "@/lib/stationery-detail-seed";

// â”€â”€ Inputs that seed the smart quantity calculator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface StationeryGuestMetrics {
  guestCount: number;
  householdCount: number;
}

interface StationeryState {
  suite: StationerySuiteItem[];
  pieceContent: StationeryPieceContent[];
  documents: StationeryDocument[];
  // Guest-tier ladder + per-cell print mode for the Print Matrix tab.
  tiers: StationeryGuestTier[];
  matrix: StationeryMatrixCells;
  // Canonical timeline milestones + which have been checked off.
  timelineMilestones: StationeryTimelineMilestone[];
  milestoneDone: Record<string, boolean>;

  // High-level direction â€” wired from the Vision quiz + identity panel.
  visualIdentity: StationeryVisualIdentity;
  primaryPrintMethod: StationeryPrintMethod;
  paletteSource: StationeryPaletteSource;
  // Snapshot of the guest-module metrics used by the quantity calculator.
  guestMetrics: StationeryGuestMetrics;

  // â”€â”€ Discovery-first state (Vision & Mood + Suite Builder + Samples) â”€â”€â”€â”€â”€
  // Paper-texture preference for the Paper & Texture Palette.
  paperTexture: StationeryPaperTexture;
  // Per-piece "Want this" / "Maybe" / "Skip" â€” keyed by suite item id.
  piecePreferences: Record<string, StationerySuitePreference>;
  // Ordered suite-item ids the couple has starred as top priorities so the
  // designer knows where to spend creative energy.
  piecePriority: string[];
  // Sample requests from shortlisted stationers.
  sampleRequests: StationerySampleRequest[];
  // "I keep coming back toâ€¦" free-text entries on the Inspiration tab.
  inspirationEntries: StationeryInspirationEntry[];
  // Love / Not-for-us reactions on reference images, scoped by piece or
  // inspiration theme â€” key format "<scope>:<url>".
  refReactions: StationeryRefReactions;

  // â”€â”€ Suite detail panel catalogue (seed-backed, read-only for now) â”€â”€â”€â”€â”€â”€â”€
  // Editorial copy that powers the Suite Builder slide-over. Held in state
  // so Prompt 5's planner edit mode can mutate it; kept out of the persist
  // partialize until that lands so catalogue updates flow through on reload.
  suiteDetails: StationerySuiteDetail[];
  suiteInspirations: StationerySuiteInspiration[];
  suiteAddons: StationerySuiteAddon[];

  // â”€â”€ Visual identity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  setIdentityPalette: (palette: StationerySwatch[]) => void;
  setIdentityTypography: (t: StationeryTypographyDirection) => void;
  setIdentityMotif: (m: StationeryMotifDirection) => void;
  toggleIdentityFinishing: (f: StationeryFoilOption) => void;
  setIdentityBrief: (brief: string) => void;
  setTypographyVibe: (v: StationeryTypographyVibe) => void;
  setBilingual: (on: boolean) => void;
  setScriptLanguages: (langs: string[]) => void;
  toggleScriptLanguage: (lang: string) => void;
  setMotifTags: (tags: string[]) => void;
  toggleMotifTag: (tag: string) => void;
  setPrimaryPrintMethod: (m: StationeryPrintMethod) => void;
  setPaletteSource: (s: StationeryPaletteSource) => void;
  setGuestMetrics: (m: Partial<StationeryGuestMetrics>) => void;

  // â”€â”€ Guest tiers + print matrix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  addTier: (tier: Omit<StationeryGuestTier, "id" | "sort_order">) => string;
  updateTier: (id: string, patch: Partial<StationeryGuestTier>) => void;
  deleteTier: (id: string) => void;
  setMatrixCell: (
    tierId: string,
    piece: StationeryMatrixPiece,
    mode: StationeryMatrixMode,
  ) => void;
  resetMatrixToSuggested: () => void;

  // â”€â”€ Suite items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  addSuiteItem: (
    item: Omit<StationerySuiteItem, "id"> & { id?: string },
  ) => string;
  updateSuiteItem: (id: string, patch: Partial<StationerySuiteItem>) => void;
  deleteSuiteItem: (id: string) => void;
  setSuiteItemEnabled: (id: string, enabled: boolean) => void;
  setSuiteItemStatus: (id: string, status: StationeryItemStatus) => void;
  resyncSuiteItemQuantity: (id: string) => void;
  resyncAllSuiteQuantities: () => void;

  // â”€â”€ Per-piece content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  getPieceContent: (itemId: string) => StationeryPieceContent;
  updatePieceContent: (
    itemId: string,
    patch: Partial<StationeryPieceContent>,
  ) => void;

  // â”€â”€ Production timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  toggleMilestone: (id: string) => void;
  setMilestoneDone: (id: string, done: boolean) => void;
  resetMilestones: () => void;

  // â”€â”€ Documents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  addDocument: (
    doc: Omit<StationeryDocument, "id" | "created_at"> & {
      created_at?: string;
    },
  ) => string;
  updateDocument: (id: string, patch: Partial<StationeryDocument>) => void;
  deleteDocument: (id: string) => void;

  // â”€â”€ Discovery-first actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  setPaperTexture: (t: StationeryPaperTexture) => void;
  setPiecePreference: (
    itemId: string,
    preference: StationerySuitePreference,
  ) => void;
  togglePiecePriority: (itemId: string) => void;

  addSampleRequest: (
    r: Omit<StationerySampleRequest, "id" | "requested_at">,
  ) => string;
  updateSampleRequest: (
    id: string,
    patch: Partial<StationerySampleRequest>,
  ) => void;
  deleteSampleRequest: (id: string) => void;
  setSampleRequestStatus: (
    id: string,
    status: StationerySampleRequestStatus,
  ) => void;
  setSampleRequestReaction: (
    id: string,
    reaction: StationerySampleReaction,
  ) => void;

  addInspirationEntry: (text: string) => string;
  updateInspirationEntry: (id: string, text: string) => void;
  deleteInspirationEntry: (id: string) => void;

  setRefReaction: (
    key: string,
    reaction: StationeryRefReaction | null,
  ) => void;
}

const nowIso = () => new Date().toISOString();
const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

// Quantity rule per suite kind: invitations ship to households; programs/
// menus/favors ship to each guest; signage is a fixed small count.
type QuantityRule = {
  scope: "per_household" | "per_guest" | "per_table" | "fixed";
  factor: number;
  default_buffer: number;
};

const TABLE_SIZE = 10;

export const STATIONERY_QUANTITY_RULES: Record<string, QuantityRule> = {
  save_the_date: { scope: "per_household", factor: 1, default_buffer: 10 },
  main_invitation: { scope: "per_household", factor: 1, default_buffer: 10 },
  rsvp_card: { scope: "per_household", factor: 1, default_buffer: 10 },
  details_card: { scope: "per_household", factor: 1, default_buffer: 10 },
  event_insert: { scope: "per_household", factor: 1, default_buffer: 10 },
  map_card: { scope: "per_household", factor: 1, default_buffer: 10 },
  accommodation_card: { scope: "per_household", factor: 1, default_buffer: 10 },
  envelope_outer: { scope: "per_household", factor: 1, default_buffer: 10 },
  envelope_inner: { scope: "per_household", factor: 1, default_buffer: 10 },
  enclosure: { scope: "per_household", factor: 1, default_buffer: 10 },
  ceremony_program: { scope: "per_guest", factor: 1, default_buffer: 5 },
  menu_card: { scope: "per_guest", factor: 1, default_buffer: 5 },
  place_card: { scope: "per_guest", factor: 1, default_buffer: 5 },
  table_number: { scope: "per_table", factor: 1, default_buffer: 10 },
  signage: { scope: "fixed", factor: 8, default_buffer: 0 },
  favor_tag: { scope: "per_guest", factor: 1, default_buffer: 5 },
  welcome_bag_insert: { scope: "per_guest", factor: 0.5, default_buffer: 5 },
  seating_chart: { scope: "fixed", factor: 1, default_buffer: 0 },
  thank_you_card: { scope: "per_household", factor: 1, default_buffer: 10 },
  at_home_card: { scope: "per_household", factor: 1, default_buffer: 10 },
  custom: { scope: "fixed", factor: 1, default_buffer: 0 },
};

export function suggestedQuantity(
  kind: string,
  metrics: StationeryGuestMetrics,
): number {
  const rule = STATIONERY_QUANTITY_RULES[kind];
  if (!rule) return metrics.householdCount;
  switch (rule.scope) {
    case "per_household":
      return Math.max(1, Math.round(metrics.householdCount * rule.factor));
    case "per_guest":
      return Math.max(1, Math.round(metrics.guestCount * rule.factor));
    case "per_table":
      return Math.max(
        1,
        Math.round((metrics.guestCount / TABLE_SIZE) * rule.factor),
      );
    case "fixed":
      return rule.factor;
  }
}

export function withBuffer(qty: number, bufferPct: number): number {
  return Math.ceil(qty * (1 + bufferPct / 100));
}

function emptyContent(itemId: string): StationeryPieceContent {
  return { item_id: itemId };
}

export const useStationeryStore = create<StationeryState>()(
  persist(
    (set, get) => ({
      suite: SEED_STATIONERY_SUITE,
      pieceContent: SEED_STATIONERY_PIECE_CONTENT,
      documents: SEED_STATIONERY_DOCUMENTS,
      tiers: SEED_STATIONERY_TIERS,
      matrix: SEED_STATIONERY_MATRIX_CELLS,
      timelineMilestones: SEED_STATIONERY_TIMELINE_MILESTONES,
      milestoneDone: {},

      visualIdentity: SEED_STATIONERY_VISUAL_IDENTITY,
      primaryPrintMethod: "letterpress",
      paletteSource: "wedding",
      guestMetrics: { guestCount: 400, householdCount: 180 },

      paperTexture: "cotton",
      piecePreferences: {},
      piecePriority: [],
      sampleRequests: [],
      inspirationEntries: [],
      refReactions: {},

      suiteDetails: SEED_STATIONERY_SUITE_DETAILS,
      suiteInspirations: SEED_STATIONERY_SUITE_INSPIRATIONS,
      suiteAddons: SEED_STATIONERY_SUITE_ADDONS,

      // â”€â”€ Visual identity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      setIdentityPalette: (palette) =>
        set((s) => ({
          visualIdentity: { ...s.visualIdentity, palette },
        })),
      setIdentityTypography: (typography) =>
        set((s) => ({
          visualIdentity: { ...s.visualIdentity, typography },
        })),
      setIdentityMotif: (motif) =>
        set((s) => ({
          visualIdentity: { ...s.visualIdentity, motif },
        })),
      toggleIdentityFinishing: (f) =>
        set((s) => {
          const current = s.visualIdentity.finishing;
          const next = current.includes(f)
            ? current.filter((x) => x !== f)
            : [...current, f];
          return {
            visualIdentity: { ...s.visualIdentity, finishing: next },
          };
        }),
      setIdentityBrief: (brief) =>
        set((s) => ({
          visualIdentity: { ...s.visualIdentity, brief },
        })),
      setTypographyVibe: (typographyVibe) =>
        set((s) => ({
          visualIdentity: { ...s.visualIdentity, typographyVibe },
        })),
      setBilingual: (bilingual) =>
        set((s) => ({
          visualIdentity: { ...s.visualIdentity, bilingual },
        })),
      setScriptLanguages: (scriptLanguages) =>
        set((s) => ({
          visualIdentity: { ...s.visualIdentity, scriptLanguages },
        })),
      toggleScriptLanguage: (lang) =>
        set((s) => {
          const cur = s.visualIdentity.scriptLanguages ?? [];
          const next = cur.includes(lang)
            ? cur.filter((x) => x !== lang)
            : [...cur, lang];
          return {
            visualIdentity: { ...s.visualIdentity, scriptLanguages: next },
          };
        }),
      setMotifTags: (motifTags) =>
        set((s) => ({
          visualIdentity: { ...s.visualIdentity, motifTags },
        })),
      toggleMotifTag: (tag) =>
        set((s) => {
          const cur = s.visualIdentity.motifTags ?? [];
          const next = cur.includes(tag)
            ? cur.filter((x) => x !== tag)
            : [...cur, tag];
          return {
            visualIdentity: { ...s.visualIdentity, motifTags: next },
          };
        }),
      setPrimaryPrintMethod: (m) => set({ primaryPrintMethod: m }),
      setPaletteSource: (s) => set({ paletteSource: s }),
      setGuestMetrics: (m) =>
        set((s) => ({ guestMetrics: { ...s.guestMetrics, ...m } })),

      // â”€â”€ Tiers + matrix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      addTier: (input) => {
        const id = rid("tier");
        set((s) => ({
          tiers: [
            ...s.tiers,
            {
              ...input,
              id,
              sort_order: s.tiers.length,
            },
          ],
        }));
        return id;
      },
      updateTier: (id, patch) =>
        set((s) => ({
          tiers: s.tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTier: (id) =>
        set((s) => {
          const nextMatrix: StationeryMatrixCells = {};
          for (const [key, mode] of Object.entries(s.matrix)) {
            if (!key.startsWith(`${id}:`)) nextMatrix[key] = mode;
          }
          return {
            tiers: s.tiers.filter((t) => t.id !== id),
            matrix: nextMatrix,
          };
        }),
      setMatrixCell: (tierId, piece, mode) =>
        set((s) => ({
          matrix: {
            ...s.matrix,
            [matrixCellKey(tierId, piece)]: mode,
          },
        })),
      resetMatrixToSuggested: () =>
        set({ matrix: { ...SEED_STATIONERY_MATRIX_CELLS } }),

      // â”€â”€ Suite items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      addSuiteItem: (input) => {
        const id = input.id ?? rid("sui");
        set((s) => ({
          suite: [
            ...s.suite,
            {
              ...input,
              id,
            },
          ],
        }));
        return id;
      },
      updateSuiteItem: (id, patch) =>
        set((s) => ({
          suite: s.suite.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      deleteSuiteItem: (id) =>
        set((s) => ({
          suite: s.suite.filter((i) => i.id !== id),
          pieceContent: s.pieceContent.filter((c) => c.item_id !== id),
          documents: s.documents.map((d) =>
            d.item_id === id ? { ...d, item_id: null } : d,
          ),
        })),
      setSuiteItemEnabled: (id, enabled) =>
        set((s) => ({
          suite: s.suite.map((i) => (i.id === id ? { ...i, enabled } : i)),
        })),
      setSuiteItemStatus: (id, status) =>
        set((s) => ({
          suite: s.suite.map((i) => (i.id === id ? { ...i, status } : i)),
        })),
      resyncSuiteItemQuantity: (id) => {
        const item = get().suite.find((i) => i.id === id);
        if (!item) return;
        const qty = suggestedQuantity(item.kind, get().guestMetrics);
        set((s) => ({
          suite: s.suite.map((i) =>
            i.id === id ? { ...i, quantity: qty } : i,
          ),
        }));
      },
      resyncAllSuiteQuantities: () => {
        const metrics = get().guestMetrics;
        set((s) => ({
          suite: s.suite.map((i) => ({
            ...i,
            quantity: suggestedQuantity(i.kind, metrics),
          })),
        }));
      },

      // â”€â”€ Per-piece content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      getPieceContent: (itemId) => {
        const existing = get().pieceContent.find((c) => c.item_id === itemId);
        return existing ?? emptyContent(itemId);
      },
      updatePieceContent: (itemId, patch) =>
        set((s) => {
          const existing = s.pieceContent.find((c) => c.item_id === itemId);
          if (existing) {
            return {
              pieceContent: s.pieceContent.map((c) =>
                c.item_id === itemId ? { ...c, ...patch } : c,
              ),
            };
          }
          return {
            pieceContent: [
              ...s.pieceContent,
              { ...emptyContent(itemId), ...patch },
            ],
          };
        }),

      // â”€â”€ Timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      toggleMilestone: (id) =>
        set((s) => ({
          milestoneDone: {
            ...s.milestoneDone,
            [id]: !s.milestoneDone[id],
          },
        })),
      setMilestoneDone: (id, done) =>
        set((s) => ({
          milestoneDone: { ...s.milestoneDone, [id]: done },
        })),
      resetMilestones: () => set({ milestoneDone: {} }),

      // â”€â”€ Documents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      addDocument: (input) => {
        const id = rid("sdoc");
        set((s) => ({
          documents: [
            ...s.documents,
            {
              ...input,
              id,
              created_at: input.created_at ?? nowIso(),
            },
          ],
        }));
        return id;
      },
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),
      deleteDocument: (id) =>
        set((s) => ({
          documents: s.documents.filter((d) => d.id !== id),
        })),

      // â”€â”€ Discovery-first actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      setPaperTexture: (t) => set({ paperTexture: t }),
      setPiecePreference: (itemId, preference) =>
        set((s) => {
          const nextPrefs: Record<string, StationerySuitePreference> = {
            ...s.piecePreferences,
            [itemId]: preference,
          };
          // Skipping a piece also drops it from the priority list.
          const nextPriority =
            preference === "skip"
              ? s.piecePriority.filter((id) => id !== itemId)
              : s.piecePriority;
          return { piecePreferences: nextPrefs, piecePriority: nextPriority };
        }),
      togglePiecePriority: (itemId) =>
        set((s) => {
          const has = s.piecePriority.includes(itemId);
          return {
            piecePriority: has
              ? s.piecePriority.filter((id) => id !== itemId)
              : [...s.piecePriority, itemId],
          };
        }),

      addSampleRequest: (input) => {
        const id = rid("sr");
        set((s) => ({
          sampleRequests: [
            ...s.sampleRequests,
            { ...input, id, requested_at: nowIso() },
          ],
        }));
        return id;
      },
      updateSampleRequest: (id, patch) =>
        set((s) => ({
          sampleRequests: s.sampleRequests.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        })),
      deleteSampleRequest: (id) =>
        set((s) => ({
          sampleRequests: s.sampleRequests.filter((r) => r.id !== id),
        })),
      setSampleRequestStatus: (id, status) =>
        set((s) => ({
          sampleRequests: s.sampleRequests.map((r) =>
            r.id === id ? { ...r, status } : r,
          ),
        })),
      setSampleRequestReaction: (id, reaction) =>
        set((s) => ({
          sampleRequests: s.sampleRequests.map((r) =>
            r.id === id ? { ...r, reaction } : r,
          ),
        })),

      addInspirationEntry: (text) => {
        const id = rid("ins");
        set((s) => ({
          inspirationEntries: [
            ...s.inspirationEntries,
            { id, text, created_at: nowIso() },
          ],
        }));
        return id;
      },
      updateInspirationEntry: (id, text) =>
        set((s) => ({
          inspirationEntries: s.inspirationEntries.map((e) =>
            e.id === id ? { ...e, text } : e,
          ),
        })),
      deleteInspirationEntry: (id) =>
        set((s) => ({
          inspirationEntries: s.inspirationEntries.filter((e) => e.id !== id),
        })),

      setRefReaction: (key, reaction) =>
        set((s) => {
          const next = { ...s.refReactions };
          if (reaction === null) {
            delete next[key];
          } else {
            next[key] = reaction;
          }
          return { refReactions: next };
        }),
    }),
    {
      name: "ananya:stationery",
      version: 4,
      storage: createJSONStorage(() => { if (typeof window === "undefined") { return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }; } return window.localStorage; }),
      migrate: (persistedState, version) => {
        if (version < 2) return {} as Partial<StationeryState>;
        const state = persistedState as Partial<StationeryState>;
        if (version < 4 && state.suite) {
          // v4 ships at_home_card + favor_tag items. Append any seed items
          // the couple is missing so new catalogue entries reach existing
          // users without wiping their production edits.
          const existingIds = new Set(state.suite.map((i) => i.id));
          const additions = SEED_STATIONERY_SUITE.filter(
            (i) => !existingIds.has(i.id),
          );
          if (additions.length > 0) {
            state.suite = [...state.suite, ...additions];
          }
        }
        return state;
      },
      partialize: (state) => ({
        suite: state.suite,
        pieceContent: state.pieceContent,
        documents: state.documents,
        tiers: state.tiers,
        matrix: state.matrix,
        timelineMilestones: state.timelineMilestones,
        milestoneDone: state.milestoneDone,
        visualIdentity: state.visualIdentity,
        primaryPrintMethod: state.primaryPrintMethod,
        paletteSource: state.paletteSource,
        guestMetrics: state.guestMetrics,
        paperTexture: state.paperTexture,
        piecePreferences: state.piecePreferences,
        piecePriority: state.piecePriority,
        sampleRequests: state.sampleRequests,
        inspirationEntries: state.inspirationEntries,
        refReactions: state.refReactions,
      }),
    },
  ),
);

let _stationerySyncTimer: ReturnType<typeof setTimeout> | null = null;
useStationeryStore.subscribe((state) => {
  if (_stationerySyncTimer) clearTimeout(_stationerySyncTimer);
  _stationerySyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("stationery_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});

// Convenience selectors ---------------------------------------------------

export function sortedSuite(suite: StationerySuiteItem[]): StationerySuiteItem[] {
  const order = { pre_wedding: 0, day_of: 1, post_wedding: 2 } as const;
  return [...suite].sort((a, b) => order[a.section] - order[b.section]);
}

export function pieceContentFor(
  pieceContent: StationeryPieceContent[],
  itemId: string,
): StationeryPieceContent {
  return pieceContent.find((c) => c.item_id === itemId) ?? { item_id: itemId };
}

export function documentsForItem(
  docs: StationeryDocument[],
  itemId: string,
): StationeryDocument[] {
  return docs.filter((d) => d.item_id === itemId);
}

export function isDocumentKind(v: string): v is StationeryDocumentKind {
  return (
    v === "proof" ||
    v === "quote" ||
    v === "content_draft" ||
    v === "print_spec" ||
    v === "shipping" ||
    v === "other"
  );
}

// â”€â”€ Detail panel selectors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Convenience lookups for the Suite Builder slide-over. Kept as pure
// helpers so callers can memoize with the raw arrays from the store.

export function suiteDetailFor(
  details: StationerySuiteDetail[],
  itemId: string,
): StationerySuiteDetail | undefined {
  return details.find((d) => d.item_id === itemId);
}

export function suiteDetailBySlug(
  details: StationerySuiteDetail[],
  slug: string,
): StationerySuiteDetail | undefined {
  return details.find((d) => d.slug === slug);
}

export function inspirationsForItem(
  inspirations: StationerySuiteInspiration[],
  itemId: string,
): StationerySuiteInspiration[] {
  return inspirations
    .filter((i) => i.item_id === itemId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function addonsForItem(
  addons: StationerySuiteAddon[],
  itemId: string,
): StationerySuiteAddon[] {
  return addons
    .filter((a) => a.item_id === itemId)
    .sort((a, b) => a.sort_order - b.sort_order);
}
