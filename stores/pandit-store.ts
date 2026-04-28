// ── Pandit / Ceremony workspace store ─────────────────────────────────────
// Single source of truth for everything on the Priest/Pandit canvas — the
// ceremony brief, the ritual script, family role assignments, samagri
// procurement list, and ceremony logistics. Persisted to localStorage via
// Zustand, matching every other Ananya workspace (no backend).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  CeremonyBrief,
  CeremonyFamilyRole,
  CeremonyLogistics,
  CeremonyPersonalAddition,
  CeremonyRitual,
  CeremonySnapshot,
  RitualInclusion,
  SamagriItem,
  SaptapadiVow,
} from "@/types/pandit";
import {
  LANGUAGE_BALANCE_LABEL,
  CEREMONY_TRADITION_LABEL,
  SAPTAPADI_DEFAULTS,
} from "@/types/pandit";
import {
  SEED_CEREMONY_BRIEF,
  SEED_CEREMONY_LOGISTICS,
  SEED_CEREMONY_RITUALS,
  SEED_FAMILY_ROLES,
  SEED_PERSONAL_ADDITIONS,
  SEED_SAMAGRI_ITEMS,
} from "@/lib/pandit-seed";
import {
  generateRitualsForTradition,
  generateSamagriForTradition,
} from "@/lib/pandit-traditions";
import type { CeremonyTradition } from "@/types/pandit";

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

const nowIso = () => new Date().toISOString();

export function computeCeremonySnapshot(
  rituals: CeremonyRitual[],
  brief: CeremonyBrief,
  additions: CeremonyPersonalAddition[],
): CeremonySnapshot {
  const included = rituals.filter((r) => r.inclusion === "yes");
  const discussed = rituals.filter((r) => r.inclusion === "discuss");
  const ritualMinutes = included.reduce(
    (acc, r) =>
      acc +
      (r.abbreviated
        ? Math.round(r.included_duration_min / 2)
        : r.included_duration_min),
    0,
  );
  const additionMinutes = additions.length * 3;
  return {
    tradition_label: CEREMONY_TRADITION_LABEL[brief.tradition],
    total_rituals: rituals.length,
    included_rituals: included.length,
    discussed_rituals: discussed.length,
    estimated_duration_min: ritualMinutes + additionMinutes,
    language_label: LANGUAGE_BALANCE_LABEL[brief.language_balance],
  };
}

interface PanditState {
  brief: CeremonyBrief;
  rituals: CeremonyRitual[];
  additions: CeremonyPersonalAddition[];
  roles: CeremonyFamilyRole[];
  samagri: SamagriItem[];
  logistics: CeremonyLogistics;
  saptapadi_vows: SaptapadiVow[];

  // ── Brief ──────────────────────────────────────────────────────────────
  updateBrief: (patch: Partial<CeremonyBrief>) => void;
  updateProgramContent: (
    patch: Partial<CeremonyBrief["program_content"]>,
  ) => void;
  // Replace the ritual + samagri lists with tradition-specific defaults.
  // `preserveCoupleNotes` preserves any couple_notes + personal customizations
  // that carry over between traditions (best-effort match by id).
  applyTraditionLibrary: (
    tradition: CeremonyTradition,
    opts?: { preserveCoupleNotes?: boolean; resetSamagri?: boolean },
  ) => void;

  // ── Rituals ────────────────────────────────────────────────────────────
  setRitualInclusion: (id: string, inclusion: RitualInclusion) => void;
  updateRitual: (id: string, patch: Partial<CeremonyRitual>) => void;
  moveRitual: (id: string, direction: "up" | "down") => void;
  addRitual: (name_english: string) => CeremonyRitual;
  deleteRitual: (id: string) => void;

  // ── Personal additions ─────────────────────────────────────────────────
  addAddition: (body: string) => CeremonyPersonalAddition;
  updateAddition: (id: string, body: string) => void;
  deleteAddition: (id: string) => void;

  // ── Family roles ───────────────────────────────────────────────────────
  updateRole: (id: string, patch: Partial<CeremonyFamilyRole>) => void;
  addRole: (role_name: string, side: CeremonyFamilyRole["side"]) => CeremonyFamilyRole;
  deleteRole: (id: string) => void;

  // ── Samagri ────────────────────────────────────────────────────────────
  updateSamagri: (id: string, patch: Partial<SamagriItem>) => void;
  addSamagri: (name_english: string, category: SamagriItem["category"]) => SamagriItem;
  deleteSamagri: (id: string) => void;

  // ── Logistics ──────────────────────────────────────────────────────────
  updateLogistics: (patch: Partial<CeremonyLogistics>) => void;

  // ── Saptapadi vows ─────────────────────────────────────────────────────
  updateSaptapadiVow: (round: number, personal_text: string) => void;
  resetSaptapadiVows: () => void;

  // ── Selectors ──────────────────────────────────────────────────────────
  snapshot: () => CeremonySnapshot;
  includedRituals: () => CeremonyRitual[];
  samagriByCategory: (category: SamagriItem["category"]) => SamagriItem[];
  samagriOpenCount: () => number;
  rolesBySide: (side: CeremonyFamilyRole["side"]) => CeremonyFamilyRole[];
  unassignedRolesCount: () => number;
}

export const usePanditStore = create<PanditState>()(
  persist(
    (set, get) => ({
      brief: SEED_CEREMONY_BRIEF,
      rituals: SEED_CEREMONY_RITUALS,
      additions: SEED_PERSONAL_ADDITIONS,
      roles: SEED_FAMILY_ROLES,
      samagri: SEED_SAMAGRI_ITEMS,
      logistics: SEED_CEREMONY_LOGISTICS,
      saptapadi_vows: SAPTAPADI_DEFAULTS.map((v) => ({ ...v })),

      // ── Brief ──
      updateBrief: (patch) =>
        set((s) => ({
          brief: { ...s.brief, ...patch, updated_at: nowIso() },
        })),
      updateProgramContent: (patch) =>
        set((s) => ({
          brief: {
            ...s.brief,
            program_content: { ...s.brief.program_content, ...patch },
            updated_at: nowIso(),
          },
        })),

      applyTraditionLibrary: (tradition, opts) =>
        set((s) => {
          const freshRituals = generateRitualsForTradition(tradition);
          // Carry over couple_notes, included/discuss toggles, and abbreviated
          // state when a ritual template id happens to match (rare across
          // traditions, but possible for shared templates like Ganesh Puja).
          const merged = opts?.preserveCoupleNotes
            ? freshRituals.map((r) => {
                const prior = s.rituals.find((p) => p.id === r.id);
                return prior
                  ? {
                      ...r,
                      inclusion: prior.inclusion,
                      included_duration_min: prior.included_duration_min,
                      abbreviated: prior.abbreviated,
                      couple_notes: prior.couple_notes,
                      what_happens: prior.what_happens || r.what_happens,
                      music_note: prior.music_note || r.music_note,
                      photography_note:
                        prior.photography_note || r.photography_note,
                      guest_instruction:
                        prior.guest_instruction || r.guest_instruction,
                    }
                  : r;
              })
            : freshRituals;
          const nextSamagri =
            opts?.resetSamagri === false
              ? s.samagri
              : generateSamagriForTradition(tradition);
          return {
            brief: { ...s.brief, tradition, updated_at: nowIso() },
            rituals: merged,
            samagri: nextSamagri,
          };
        }),

      // ── Rituals ──
      setRitualInclusion: (id, inclusion) =>
        set((s) => ({
          rituals: s.rituals.map((r) =>
            r.id === id ? { ...r, inclusion, updated_at: nowIso() } : r,
          ),
        })),
      updateRitual: (id, patch) =>
        set((s) => ({
          rituals: s.rituals.map((r) =>
            r.id === id ? { ...r, ...patch, updated_at: nowIso() } : r,
          ),
        })),
      moveRitual: (id, direction) =>
        set((s) => {
          const ordered = [...s.rituals].sort((a, b) => a.sort_order - b.sort_order);
          const idx = ordered.findIndex((r) => r.id === id);
          if (idx === -1) return {};
          const swapIdx = direction === "up" ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= ordered.length) return {};
          const a = ordered[idx]!;
          const b = ordered[swapIdx]!;
          const aOrder = a.sort_order;
          const bOrder = b.sort_order;
          return {
            rituals: s.rituals.map((r) => {
              if (r.id === a.id) return { ...r, sort_order: bOrder };
              if (r.id === b.id) return { ...r, sort_order: aOrder };
              return r;
            }),
          };
        }),
      addRitual: (name_english) => {
        const maxOrder = Math.max(
          0,
          ...get().rituals.map((r) => r.sort_order),
        );
        const record: CeremonyRitual = {
          id: rid("rit"),
          name_sanskrit: "",
          name_english,
          short_description: "",
          meaning: "",
          default_duration_min: 5,
          default_inclusion: "yes",
          traditional_participants: "",
          inclusion: "yes",
          included_duration_min: 5,
          abbreviated: false,
          couple_notes: "",
          sort_order: maxOrder + 1,
          what_happens: "",
          music_note: "",
          photography_note: "",
          guest_instruction: "",
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        set((s) => ({ rituals: [...s.rituals, record] }));
        return record;
      },
      deleteRitual: (id) =>
        set((s) => ({ rituals: s.rituals.filter((r) => r.id !== id) })),

      // ── Personal additions ──
      addAddition: (body) => {
        const maxOrder = Math.max(
          0,
          ...get().additions.map((a) => a.sort_order),
        );
        const record: CeremonyPersonalAddition = {
          id: rid("add"),
          body,
          sort_order: maxOrder + 1,
          created_at: nowIso(),
        };
        set((s) => ({ additions: [...s.additions, record] }));
        return record;
      },
      updateAddition: (id, body) =>
        set((s) => ({
          additions: s.additions.map((a) => (a.id === id ? { ...a, body } : a)),
        })),
      deleteAddition: (id) =>
        set((s) => ({ additions: s.additions.filter((a) => a.id !== id) })),

      // ── Family roles ──
      updateRole: (id, patch) =>
        set((s) => ({
          roles: s.roles.map((r) =>
            r.id === id ? { ...r, ...patch, updated_at: nowIso() } : r,
          ),
        })),
      addRole: (role_name, side) => {
        const record: CeremonyFamilyRole = {
          id: rid("role"),
          role_name,
          tradition_text: "",
          side,
          linked_ritual_id: undefined,
          primary_name: "",
          primary_relationship: "",
          backup_name: "",
          physical_requirements: "",
          accommodation_notes: "",
          practice_needed: false,
          practice_note: "",
          planner_private_note: "",
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        set((s) => ({ roles: [...s.roles, record] }));
        return record;
      },
      deleteRole: (id) =>
        set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),

      // ── Samagri ──
      updateSamagri: (id, patch) =>
        set((s) => ({
          samagri: s.samagri.map((i) =>
            i.id === id ? { ...i, ...patch, updated_at: nowIso() } : i,
          ),
        })),
      addSamagri: (name_english, category) => {
        const record: SamagriItem = {
          id: rid("sam"),
          name_local: "",
          name_english,
          category,
          quantity: "",
          source: "indian_grocery",
          responsibility: "brides_family",
          status: "needed",
          added_by_pandit: false,
          notes: "",
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        set((s) => ({ samagri: [...s.samagri, record] }));
        return record;
      },
      deleteSamagri: (id) =>
        set((s) => ({ samagri: s.samagri.filter((i) => i.id !== id) })),

      // ── Logistics ──
      updateLogistics: (patch) =>
        set((s) => ({
          logistics: { ...s.logistics, ...patch, updated_at: nowIso() },
        })),

      // ── Saptapadi vows ──
      updateSaptapadiVow: (round, personal_text) =>
        set((s) => ({
          saptapadi_vows: s.saptapadi_vows.map((v) =>
            v.round === round ? { ...v, personal_text } : v,
          ),
        })),
      resetSaptapadiVows: () =>
        set(() => ({
          saptapadi_vows: SAPTAPADI_DEFAULTS.map((v) => ({ ...v })),
        })),

      // ── Selectors ──
      snapshot: () => {
        const { rituals, brief, additions } = get();
        return computeCeremonySnapshot(rituals, brief, additions);
      },
      includedRituals: () =>
        [...get().rituals]
          .filter((r) => r.inclusion === "yes")
          .sort((a, b) => a.sort_order - b.sort_order),
      samagriByCategory: (category) =>
        get()
          .samagri.filter((i) => i.category === category)
          .sort((a, b) => a.name_english.localeCompare(b.name_english)),
      samagriOpenCount: () =>
        get().samagri.filter(
          (i) => i.status === "needed" || i.status === "sourced",
        ).length,
      rolesBySide: (side) => get().roles.filter((r) => r.side === side),
      unassignedRolesCount: () =>
        get().roles.filter((r) => !r.primary_name.trim()).length,
    }),
    {
      name: "ananya-pandit-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 3,
      migrate: (persisted, version) => {
        const state = (persisted as Partial<PanditState>) ?? {};
        if (version < 2 && !state.saptapadi_vows) {
          state.saptapadi_vows = SAPTAPADI_DEFAULTS.map((v) => ({ ...v }));
        }
        if (version < 3 && state.brief) {
          // v3: "interfaith_other" was renamed to "interfaith_custom".
          const legacy = (state.brief.tradition as unknown) as string;
          if (legacy === "interfaith_other") {
            state.brief = {
              ...state.brief,
              tradition: "interfaith_custom",
            };
          }
        }
        return state as PanditState;
      },
    },
  ),
);

let _panditSyncTimer: ReturnType<typeof setTimeout> | null = null;
usePanditStore.subscribe((state) => {
  if (_panditSyncTimer) clearTimeout(_panditSyncTimer);
  _panditSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { brief, rituals, additions, roles, samagri, logistics, saptapadi_vows } = state;
    dbUpsert("pandit_state", { couple_id: coupleId, brief, rituals, additions, roles, samagri, logistics, saptapadi_vows });
  }, 600);
});
