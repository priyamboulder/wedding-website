// ── Engagement Shoot store ─────────────────────────────────────────────────
// Zustand + persist for the Engagement Photo Shoot module. Single-wedding
// scoped (no weddingId key) like the other Memories & Keepsakes modules.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  EmergencyKitItem,
  EngagementShootState,
  Look,
  MoodBoard,
  MoodBoardPin,
  OutfitItem,
  RunSheetEntry,
  ShootEnergy,
  ShootLocation,
  SharedBoardSettings,
  ShotListItem,
  TripDay,
  TripDayItem,
  TripLogistic,
  VisionSession,
  WeatherContingency,
} from "@/types/engagement-shoot";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface ShootActions {
  // Phase 1 — Vision
  updateVision: (patch: Partial<VisionSession>) => void;
  toggleEnergy: (energy: ShootEnergy) => void;
  toggleCultural: (id: VisionSession["culturalAttire"][number]) => void;
  toggleReferenceHeart: (id: string) => void;
  addReference: (imageUrl: string, caption: string) => void;
  removeReference: (id: string) => void;
  completeVision: () => void;

  // Phase 2 — Mood Board
  updateMoodBoard: (patch: Partial<MoodBoard>) => void;
  addMoodPin: (patch: Partial<MoodBoardPin>) => void;
  updateMoodPin: (id: string, patch: Partial<MoodBoardPin>) => void;
  removeMoodPin: (id: string) => void;
  addShot: (patch: Partial<ShotListItem>) => void;
  updateShot: (id: string, patch: Partial<ShotListItem>) => void;
  removeShot: (id: string) => void;
  toggleShotDone: (id: string) => void;

  // Phase 3 — Outfits
  addLook: (patch?: Partial<Look>) => void;
  updateLook: (id: string, patch: Partial<Look>) => void;
  removeLook: (id: string) => void;
  addOutfitItem: (lookId: string, patch?: Partial<OutfitItem>) => void;
  updateOutfitItem: (id: string, patch: Partial<OutfitItem>) => void;
  removeOutfitItem: (id: string) => void;

  // Phase 4 — Trip & locations
  addLocation: (patch?: Partial<ShootLocation>) => void;
  updateLocation: (id: string, patch: Partial<ShootLocation>) => void;
  removeLocation: (id: string) => void;
  addTripDay: (label: string, date: string) => void;
  updateTripDay: (id: string, patch: Partial<TripDay>) => void;
  removeTripDay: (id: string) => void;
  addTripItem: (dayId: string, patch?: Partial<TripDayItem>) => void;
  updateTripItem: (id: string, patch: Partial<TripDayItem>) => void;
  removeTripItem: (id: string) => void;
  addLogistic: (patch?: Partial<TripLogistic>) => void;
  updateLogistic: (id: string, patch: Partial<TripLogistic>) => void;
  removeLogistic: (id: string) => void;

  // Phase 5 — Run sheet
  addRunEntry: (patch?: Partial<RunSheetEntry>) => void;
  updateRunEntry: (id: string, patch: Partial<RunSheetEntry>) => void;
  removeRunEntry: (id: string) => void;
  moveRunEntry: (id: string, direction: "up" | "down") => void;
  addKitItem: (label: string) => void;
  toggleKitItem: (id: string) => void;
  removeKitItem: (id: string) => void;
  addContingency: (trigger: string, plan: string) => void;
  updateContingency: (
    index: number,
    patch: Partial<WeatherContingency>,
  ) => void;
  removeContingency: (index: number) => void;

  // Phase 6 — Final board
  updateSharedBoard: (patch: Partial<SharedBoardSettings>) => void;
  addShareRecipient: (email: string) => void;
  removeShareRecipient: (email: string) => void;

  // Reset
  reset: () => Promise<void>;
  ensureSeeded: () => Promise<void>;
}

export const useEngagementShootStore = create<
  EngagementShootState & ShootActions
>()(
  persist(
    (set) => ({
      vision: {
        energies: [], outfitCount: null, culturalAttire: [], tripScope: null,
        destinationIdea: "", localCity: "", shootDate: "", monthsBeforeWedding: null,
        usedForSaveTheDates: false, photographyBudget: null, travelBudget: null,
        outfitBudget: null, hmuaBudget: null, photographerStatus: null,
        photographerName: "", photographerPortfolio: "", completedAt: null,
      } as EngagementShootState["vision"],
      references: [] as EngagementShootState["references"],
      moodBoard: {
        directionTitle: "", directionParagraph: "", paletteNote: "",
        avoidNote: "", photographerBrief: "", pins: [], shots: [],
      } as EngagementShootState["moodBoard"],
      looks: [] as EngagementShootState["looks"],
      outfitItems: [] as EngagementShootState["outfitItems"],
      locations: [] as EngagementShootState["locations"],
      tripDays: [] as EngagementShootState["tripDays"],
      tripItems: [] as EngagementShootState["tripItems"],
      logistics: [] as EngagementShootState["logistics"],
      runSheet: [] as EngagementShootState["runSheet"],
      emergencyKit: [] as EngagementShootState["emergencyKit"],
      contingencies: [] as EngagementShootState["contingencies"],
      sharedBoard: {
        shareEnabled: false, shareTitle: "", shareRecipients: [], coverImageUrl: "",
      } as EngagementShootState["sharedBoard"],

      ensureSeeded: async () => {
        const { DEFAULT_ENGAGEMENT_SHOOT } = await import("@/lib/engagement-shoot-seed");
        set((s) => {
          // Only seed if state is still at empty defaults
          if (s.looks.length > 0 || s.locations.length > 0 || s.runSheet.length > 0) return s;
          return { ...DEFAULT_ENGAGEMENT_SHOOT };
        });
      },

      // ── Vision ────────────────────────────────────────────────────────
      updateVision: (patch) =>
        set((s) => ({ vision: { ...s.vision, ...patch } })),
      toggleEnergy: (energy) =>
        set((s) => {
          const has = s.vision.energies.includes(energy);
          const next = has
            ? s.vision.energies.filter((e) => e !== energy)
            : [...s.vision.energies, energy].slice(-2); // cap at 2
          return { vision: { ...s.vision, energies: next } };
        }),
      toggleCultural: (id) =>
        set((s) => {
          const has = s.vision.culturalAttire.includes(id);
          return {
            vision: {
              ...s.vision,
              culturalAttire: has
                ? s.vision.culturalAttire.filter((x) => x !== id)
                : [...s.vision.culturalAttire, id],
            },
          };
        }),
      toggleReferenceHeart: (id) =>
        set((s) => ({
          references: s.references.map((r) =>
            r.id === id ? { ...r, hearted: !r.hearted } : r,
          ),
        })),
      addReference: (imageUrl, caption) =>
        set((s) => ({
          references: [
            ...s.references,
            {
              id: uid("ref"),
              imageUrl,
              caption,
              tags: [],
              hearted: true,
            },
          ],
        })),
      removeReference: (id) =>
        set((s) => ({
          references: s.references.filter((r) => r.id !== id),
        })),
      completeVision: () =>
        set((s) => ({ vision: { ...s.vision, completedAt: nowIso() } })),

      // ── Mood board ────────────────────────────────────────────────────
      updateMoodBoard: (patch) =>
        set((s) => ({ moodBoard: { ...s.moodBoard, ...patch } })),
      addMoodPin: (patch) =>
        set((s) => ({
          moodBoard: {
            ...s.moodBoard,
            pins: [
              ...s.moodBoard.pins,
              {
                id: uid("pin"),
                imageUrl: patch.imageUrl ?? "",
                caption: patch.caption ?? "New pin",
                section: patch.section ?? "lighting_mood",
              },
            ],
          },
        })),
      updateMoodPin: (id, patch) =>
        set((s) => ({
          moodBoard: {
            ...s.moodBoard,
            pins: s.moodBoard.pins.map((p) =>
              p.id === id ? { ...p, ...patch } : p,
            ),
          },
        })),
      removeMoodPin: (id) =>
        set((s) => ({
          moodBoard: {
            ...s.moodBoard,
            pins: s.moodBoard.pins.filter((p) => p.id !== id),
          },
        })),
      addShot: (patch) =>
        set((s) => ({
          moodBoard: {
            ...s.moodBoard,
            shots: [
              ...s.moodBoard.shots,
              {
                id: uid("shot"),
                title: patch.title ?? "New shot",
                category: patch.category ?? "must_have",
                priority: patch.priority ?? "preferred",
                done: false,
                note: patch.note,
              },
            ],
          },
        })),
      updateShot: (id, patch) =>
        set((s) => ({
          moodBoard: {
            ...s.moodBoard,
            shots: s.moodBoard.shots.map((sh) =>
              sh.id === id ? { ...sh, ...patch } : sh,
            ),
          },
        })),
      removeShot: (id) =>
        set((s) => ({
          moodBoard: {
            ...s.moodBoard,
            shots: s.moodBoard.shots.filter((sh) => sh.id !== id),
          },
        })),
      toggleShotDone: (id) =>
        set((s) => ({
          moodBoard: {
            ...s.moodBoard,
            shots: s.moodBoard.shots.map((sh) =>
              sh.id === id ? { ...sh, done: !sh.done } : sh,
            ),
          },
        })),

      // ── Looks + outfit items ──────────────────────────────────────────
      addLook: (patch) =>
        set((s) => {
          const index = s.looks.length + 1;
          return {
            looks: [
              ...s.looks,
              {
                id: uid("look"),
                index,
                name: patch?.name ?? `Look ${index}`,
                concept: patch?.concept ?? "",
                style: patch?.style ?? "western_casual",
                partner1Direction: patch?.partner1Direction ?? "",
                partner2Direction: patch?.partner2Direction ?? "",
                coordination: patch?.coordination ?? {
                  colorP1: "",
                  colorP2: "",
                  formality: "casual",
                  notes: "",
                },
                hairMakeupNote: patch?.hairMakeupNote ?? "",
                locationSlotId: patch?.locationSlotId ?? null,
                estimatedMinutes: patch?.estimatedMinutes ?? 60,
              },
            ],
          };
        }),
      updateLook: (id, patch) =>
        set((s) => ({
          looks: s.looks.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      removeLook: (id) =>
        set((s) => ({
          looks: s.looks.filter((l) => l.id !== id),
          outfitItems: s.outfitItems.filter((i) => i.lookId !== id),
        })),
      addOutfitItem: (lookId, patch) =>
        set((s) => ({
          outfitItems: [
            ...s.outfitItems,
            {
              id: uid("oi"),
              lookId,
              owner: patch?.owner ?? "p1",
              category: patch?.category ?? "other",
              title: patch?.title ?? "New item",
              sourceUrl: patch?.sourceUrl ?? "",
              imageUrl: patch?.imageUrl ?? "",
              priceCents: patch?.priceCents ?? 0,
              status: patch?.status ?? "considering",
              note: patch?.note,
            },
          ],
        })),
      updateOutfitItem: (id, patch) =>
        set((s) => ({
          outfitItems: s.outfitItems.map((i) =>
            i.id === id ? { ...i, ...patch } : i,
          ),
        })),
      removeOutfitItem: (id) =>
        set((s) => ({
          outfitItems: s.outfitItems.filter((i) => i.id !== id),
        })),

      // ── Trip & locations ──────────────────────────────────────────────
      addLocation: (patch) =>
        set((s) => ({
          locations: [
            ...s.locations,
            {
              id: uid("loc"),
              name: patch?.name ?? "New location",
              address: patch?.address ?? "",
              imageUrl: patch?.imageUrl ?? "",
              whyItWorks: patch?.whyItWorks ?? "",
              bestTime: patch?.bestTime ?? "",
              permitNote: patch?.permitNote ?? "",
              logistics: patch?.logistics ?? "",
              orderIndex: s.locations.length,
            },
          ],
        })),
      updateLocation: (id, patch) =>
        set((s) => ({
          locations: s.locations.map((l) =>
            l.id === id ? { ...l, ...patch } : l,
          ),
        })),
      removeLocation: (id) =>
        set((s) => ({
          locations: s.locations.filter((l) => l.id !== id),
          looks: s.looks.map((l) =>
            l.locationSlotId === id ? { ...l, locationSlotId: null } : l,
          ),
        })),
      addTripDay: (label, date) =>
        set((s) => ({
          tripDays: [
            ...s.tripDays,
            {
              id: uid("day"),
              label,
              date,
              summary: "",
              orderIndex: s.tripDays.length,
            },
          ],
        })),
      updateTripDay: (id, patch) =>
        set((s) => ({
          tripDays: s.tripDays.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),
      removeTripDay: (id) =>
        set((s) => ({
          tripDays: s.tripDays.filter((d) => d.id !== id),
          tripItems: s.tripItems.filter((i) => i.dayId !== id),
        })),
      addTripItem: (dayId, patch) =>
        set((s) => ({
          tripItems: [
            ...s.tripItems,
            {
              id: uid("ti"),
              dayId,
              time: patch?.time ?? "",
              title: patch?.title ?? "New item",
              detail: patch?.detail ?? "",
              kind: patch?.kind ?? "experience",
            },
          ],
        })),
      updateTripItem: (id, patch) =>
        set((s) => ({
          tripItems: s.tripItems.map((i) =>
            i.id === id ? { ...i, ...patch } : i,
          ),
        })),
      removeTripItem: (id) =>
        set((s) => ({ tripItems: s.tripItems.filter((i) => i.id !== id) })),
      addLogistic: (patch) =>
        set((s) => ({
          logistics: [
            ...s.logistics,
            {
              id: uid("lg"),
              label: patch?.label ?? "New item",
              kind: patch?.kind ?? "other",
              status: patch?.status ?? "researching",
              amountCents: patch?.amountCents ?? 0,
              note: patch?.note ?? "",
            },
          ],
        })),
      updateLogistic: (id, patch) =>
        set((s) => ({
          logistics: s.logistics.map((l) =>
            l.id === id ? { ...l, ...patch } : l,
          ),
        })),
      removeLogistic: (id) =>
        set((s) => ({ logistics: s.logistics.filter((l) => l.id !== id) })),

      // ── Run sheet ─────────────────────────────────────────────────────
      addRunEntry: (patch) =>
        set((s) => ({
          runSheet: [
            ...s.runSheet,
            {
              id: uid("rs"),
              time: patch?.time ?? "",
              durationMinutes: patch?.durationMinutes ?? 30,
              title: patch?.title ?? "New entry",
              detail: patch?.detail ?? "",
              kind: patch?.kind ?? "prep",
              lookId: patch?.lookId ?? null,
              locationId: patch?.locationId ?? null,
              orderIndex: s.runSheet.length,
            },
          ],
        })),
      updateRunEntry: (id, patch) =>
        set((s) => ({
          runSheet: s.runSheet.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        })),
      removeRunEntry: (id) =>
        set((s) => ({ runSheet: s.runSheet.filter((e) => e.id !== id) })),
      moveRunEntry: (id, direction) =>
        set((s) => {
          const sorted = [...s.runSheet].sort(
            (a, b) => a.orderIndex - b.orderIndex,
          );
          const i = sorted.findIndex((e) => e.id === id);
          if (i < 0) return s;
          const swap = direction === "up" ? i - 1 : i + 1;
          if (swap < 0 || swap >= sorted.length) return s;
          const a = sorted[i]!;
          const b = sorted[swap]!;
          const reindexed = sorted.map((e) => {
            if (e.id === a.id) return { ...e, orderIndex: b.orderIndex };
            if (e.id === b.id) return { ...e, orderIndex: a.orderIndex };
            return e;
          });
          return { runSheet: reindexed };
        }),
      addKitItem: (label) =>
        set((s) => ({
          emergencyKit: [
            ...s.emergencyKit,
            { id: uid("k"), label, packed: false },
          ],
        })),
      toggleKitItem: (id) =>
        set((s) => ({
          emergencyKit: s.emergencyKit.map((k) =>
            k.id === id ? { ...k, packed: !k.packed } : k,
          ),
        })),
      removeKitItem: (id) =>
        set((s) => ({
          emergencyKit: s.emergencyKit.filter((k) => k.id !== id),
        })),
      addContingency: (trigger, plan) =>
        set((s) => ({
          contingencies: [...s.contingencies, { trigger, plan }],
        })),
      updateContingency: (index, patch) =>
        set((s) => ({
          contingencies: s.contingencies.map((c, i) =>
            i === index ? { ...c, ...patch } : c,
          ),
        })),
      removeContingency: (index) =>
        set((s) => ({
          contingencies: s.contingencies.filter((_, i) => i !== index),
        })),

      // ── Shared board ──────────────────────────────────────────────────
      updateSharedBoard: (patch) =>
        set((s) => ({
          sharedBoard: { ...s.sharedBoard, ...patch },
        })),
      addShareRecipient: (email) =>
        set((s) => {
          const trimmed = email.trim();
          if (!trimmed || s.sharedBoard.shareRecipients.includes(trimmed))
            return s;
          return {
            sharedBoard: {
              ...s.sharedBoard,
              shareRecipients: [...s.sharedBoard.shareRecipients, trimmed],
            },
          };
        }),
      removeShareRecipient: (email) =>
        set((s) => ({
          sharedBoard: {
            ...s.sharedBoard,
            shareRecipients: s.sharedBoard.shareRecipients.filter(
              (e) => e !== email,
            ),
          },
        })),

      reset: async () => {
        const { DEFAULT_ENGAGEMENT_SHOOT } = await import("@/lib/engagement-shoot-seed");
        set(() => ({ ...DEFAULT_ENGAGEMENT_SHOOT }));
      },
    }),
    {
      name: "ananya:engagement-shoot",
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

let _engagementShootSyncTimer: ReturnType<typeof setTimeout> | null = null;
useEngagementShootStore.subscribe((state) => {
  if (_engagementShootSyncTimer) clearTimeout(_engagementShootSyncTimer);
  _engagementShootSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("engagement_shoot_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
