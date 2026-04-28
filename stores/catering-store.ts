// ── Catering Menu Studio store ─────────────────────────────────────────────
// Events, moments, dishes, and AI pending edits for the Menu Studio canvas.
// Persisted to localStorage via zustand/persist, following the same shape
// as stores/photography-store.ts.
//
// AI edits never mutate the menu directly — they enter as PendingEdit rows
// which the couple accepts or rejects from the Intelligence panel.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, dbDelete, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  AttendeeRating,
  CatererAssessment,
  CatererProposal,
  Comment,
  CommandBrief,
  Dish,
  EntityState,
  EventDietaryTotals,
  MenuEvent,
  MenuMoment,
  OpenQuestion,
  PartyId,
  PartyLean,
  PendingEdit,
  PendingEditPayload,
  PresenceSignal,
  Reaction,
  ReactionEntityKind,
  ReactionKind,
  RentalItem,
  SignatureCocktail,
  StaffSlot,
  TastingDish,
  TastingSynthesis,
  TastingVisit,
  UpcomingTasting,
} from "@/types/catering";
// Catering seed loaded lazily — only when the store needs fallback data.
async function getCateringSeed() {
  return import("@/lib/catering-seed");
}

interface CateringState {
  events: MenuEvent[];
  moments: MenuMoment[];
  dishes: Dish[];
  dietary_totals: EventDietaryTotals[];
  pending_edits: PendingEdit[];
  selected_event_id: string | null;
  proposals: CatererProposal[];
  assessments: CatererAssessment[];
  tasting_visits: TastingVisit[];
  tasting_dishes: TastingDish[];
  staff_slots: StaffSlot[];
  rental_items: RentalItem[];
  signature_cocktails: SignatureCocktail[];
  command_brief: CommandBrief | null;

  // ── Collaboration layer ────────────────────────────────────────────────
  reactions: Reaction[];
  comments: Comment[];
  open_questions: OpenQuestion[];
  party_leans: PartyLean[];
  attendee_ratings: AttendeeRating[];
  upcoming_tastings: UpcomingTasting[];
  presence: PresenceSignal[];

  // ── Selectors ──────────────────────────────────────────────────────────
  eventsFor: (wedding_id: string) => MenuEvent[];
  momentsFor: (event_id: string) => MenuMoment[];
  dishesForMoment: (moment_id: string) => Dish[];
  dishesForEvent: (event_id: string) => Dish[];
  dietaryFor: (event_id: string) => EventDietaryTotals | undefined;
  pendingFor: (event_id: string) => PendingEdit[];

  setSelectedEvent: (event_id: string) => void;

  // ── Event CRUD ─────────────────────────────────────────────────────────
  addEvent: (e: Omit<MenuEvent, "id" | "sort_order">) => MenuEvent;
  updateEvent: (id: string, patch: Partial<MenuEvent>) => void;
  deleteEvent: (id: string) => void;

  // ── Moment CRUD ────────────────────────────────────────────────────────
  addMoment: (m: Omit<MenuMoment, "id" | "order">) => MenuMoment;
  updateMoment: (id: string, patch: Partial<MenuMoment>) => void;
  deleteMoment: (id: string) => void;

  // ── Dish CRUD ──────────────────────────────────────────────────────────
  addDish: (d: Omit<Dish, "id" | "sort_order">) => Dish;
  updateDish: (id: string, patch: Partial<Dish>) => void;
  deleteDish: (id: string) => void;

  // ── Pending edits (AI diff review) ─────────────────────────────────────
  queuePendingEdits: (
    edits: Array<Omit<PendingEdit, "id" | "created_at" | "status">>,
  ) => PendingEdit[];
  acceptEdit: (id: string) => void;
  rejectEdit: (id: string) => void;
  clearResolvedEdits: (event_id: string) => void;

  // ── Caterer proposals ──────────────────────────────────────────────────
  proposalsFor: (caterer_id: string) => CatererProposal[];
  addProposal: (p: Omit<CatererProposal, "id">) => CatererProposal;
  updateProposal: (id: string, patch: Partial<CatererProposal>) => void;
  deleteProposal: (id: string) => void;

  // ── Caterer assessments (AI fit score + tradeoffs) ─────────────────────
  assessmentFor: (caterer_id: string) => CatererAssessment | undefined;
  upsertAssessment: (a: Omit<CatererAssessment, "id">) => CatererAssessment;
  deleteAssessment: (caterer_id: string) => void;

  // ── Tasting visits ─────────────────────────────────────────────────────
  tastingVisitsFor: (wedding_id: string) => TastingVisit[];
  tastingDishesFor: (visit_id: string) => TastingDish[];
  addTastingVisit: (v: Omit<TastingVisit, "id">) => TastingVisit;
  updateTastingVisit: (id: string, patch: Partial<TastingVisit>) => void;
  deleteTastingVisit: (id: string) => void;
  addTastingDish: (d: Omit<TastingDish, "id" | "sort_order">) => TastingDish;
  updateTastingDish: (id: string, patch: Partial<TastingDish>) => void;
  deleteTastingDish: (id: string) => void;
  setTastingSynthesis: (
    visit_id: string,
    synthesis: TastingSynthesis,
  ) => void;

  // ── Service & Flow ─────────────────────────────────────────────────────
  staffFor: (event_id: string) => StaffSlot[];
  rentalsFor: (event_id: string) => RentalItem[];
  cocktailsFor: (event_id: string) => SignatureCocktail[];
  addStaffSlot: (s: Omit<StaffSlot, "id" | "sort_order">) => StaffSlot;
  updateStaffSlot: (id: string, patch: Partial<StaffSlot>) => void;
  deleteStaffSlot: (id: string) => void;
  addRentalItem: (r: Omit<RentalItem, "id" | "sort_order">) => RentalItem;
  updateRentalItem: (id: string, patch: Partial<RentalItem>) => void;
  deleteRentalItem: (id: string) => void;
  addCocktail: (c: Omit<SignatureCocktail, "id" | "sort_order">) => SignatureCocktail;
  addCocktails: (cs: Array<Omit<SignatureCocktail, "id" | "sort_order">>) => SignatureCocktail[];
  deleteCocktail: (id: string) => void;

  // ── Command brief ──────────────────────────────────────────────────────
  setCommandBrief: (b: CommandBrief | null) => void;

  // ── Collaboration actions ──────────────────────────────────────────────
  reactionsFor: (kind: ReactionEntityKind, entity_id: string) => Reaction[];
  commentsFor: (kind: ReactionEntityKind, entity_id: string) => Comment[];
  addReaction: (
    kind: ReactionEntityKind,
    entity_id: string,
    party_id: PartyId,
    reaction_kind: ReactionKind,
    comment?: string,
  ) => Reaction;
  // Toggle semantics: if the same party already has the same kind, remove it.
  toggleReaction: (
    kind: ReactionEntityKind,
    entity_id: string,
    party_id: PartyId,
    reaction_kind: ReactionKind,
  ) => void;
  removeReaction: (id: string) => void;

  addComment: (
    kind: ReactionEntityKind,
    entity_id: string,
    party_id: PartyId,
    body: string,
  ) => Comment;
  resolveComment: (id: string) => void;

  addOpenQuestion: (
    q: Omit<OpenQuestion, "id" | "created_at">,
  ) => OpenQuestion;
  answerQuestion: (
    id: string,
    answer: string,
    answered_by: PartyId,
  ) => void;

  setDishState: (dish_id: string, state: EntityState) => void;
  setProposalState: (proposal_id: string, status: CatererProposal["status"]) => void;

  setLean: (
    party_id: PartyId,
    caterer_id: string,
    lean: PartyLean["lean"],
    note?: string,
    event_id?: string,
  ) => PartyLean;

  addAttendeeRating: (
    r: Omit<AttendeeRating, "id">,
  ) => AttendeeRating;
  updateAttendeeRating: (id: string, patch: Partial<AttendeeRating>) => void;

  addUpcomingTasting: (
    t: Omit<UpcomingTasting, "id" | "created_at">,
  ) => UpcomingTasting;

  recordPresence: (signal: PresenceSignal) => void;
  // Load couple's catering data from Supabase (replaces seed on first load)
  initFromDB: () => Promise<void>;
}

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

function nextOrder<T extends { sort_order: number }>(list: T[]): number {
  return list.length > 0 ? Math.max(...list.map((x) => x.sort_order)) + 1 : 1;
}

function nextMomentOrder(list: MenuMoment[], event_id: string): number {
  const scoped = list.filter((m) => m.event_id === event_id);
  return scoped.length > 0 ? Math.max(...scoped.map((x) => x.order)) + 1 : 1;
}

function nextDishOrder(list: Dish[], moment_id: string): number {
  const scoped = list.filter((d) => d.moment_id === moment_id);
  return scoped.length > 0 ? Math.max(...scoped.map((x) => x.sort_order)) + 1 : 1;
}

export const useCateringStore = create<CateringState>()(
  persist(
    (set, get) => ({
      events: [],
      moments: [],
      dishes: [],
      dietary_totals: [],
      pending_edits: [],
      selected_event_id: null,
      proposals: [],
      assessments: [],
      tasting_visits: [],
      tasting_dishes: [],
      staff_slots: [],
      rental_items: [],
      signature_cocktails: [],
      command_brief: null,
      reactions: [],
      comments: [],
      open_questions: [],
      party_leans: [],
      attendee_ratings: [],
      upcoming_tastings: [],
      presence: [],

      // ── Selectors ────────────────────────────────────────────────────────
      eventsFor: (wedding_id) =>
        get()
          .events.filter((e) => e.wedding_id === wedding_id)
          .sort((a, b) => a.sort_order - b.sort_order),

      momentsFor: (event_id) =>
        get()
          .moments.filter((m) => m.event_id === event_id)
          .sort((a, b) => a.order - b.order),

      dishesForMoment: (moment_id) =>
        get()
          .dishes.filter((d) => d.moment_id === moment_id)
          .sort((a, b) => a.sort_order - b.sort_order),

      dishesForEvent: (event_id) => {
        const momentIds = new Set(
          get()
            .moments.filter((m) => m.event_id === event_id)
            .map((m) => m.id),
        );
        return get().dishes.filter((d) => momentIds.has(d.moment_id));
      },

      dietaryFor: (event_id) =>
        get().dietary_totals.find((t) => t.event_id === event_id),

      pendingFor: (event_id) =>
        get().pending_edits.filter(
          (p) => p.event_id === event_id && p.status === "pending",
        ),

      setSelectedEvent: (event_id) => set({ selected_event_id: event_id }),

      // ── Event CRUD ───────────────────────────────────────────────────────
      addEvent: (input) => {
        const record: MenuEvent = {
          ...input,
          id: rid("evt"),
          sort_order: nextOrder(get().events),
        };
        set((s) => ({ events: [...s.events, record] }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("catering_menu_events", { id: record.id, couple_id: coupleId, name: record.label ?? record.slug, date: record.date ?? null, sort_order: record.sort_order });
        return record;
      },
      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      deleteEvent: (id) =>
        set((s) => {
          const momentIds = new Set(
            s.moments.filter((m) => m.event_id === id).map((m) => m.id),
          );
          return {
            events: s.events.filter((e) => e.id !== id),
            moments: s.moments.filter((m) => m.event_id !== id),
            dishes: s.dishes.filter((d) => !momentIds.has(d.moment_id)),
            pending_edits: s.pending_edits.filter((p) => p.event_id !== id),
            selected_event_id:
              s.selected_event_id === id
                ? (s.events.find((e) => e.id !== id)?.id ?? null)
                : s.selected_event_id,
          };
        }),

      // ── Moment CRUD ──────────────────────────────────────────────────────
      addMoment: (input) => {
        const record: MenuMoment = {
          ...input,
          id: rid("m"),
          order: nextMomentOrder(get().moments, input.event_id),
        };
        set((s) => ({ moments: [...s.moments, record] }));
        return record;
      },
      updateMoment: (id, patch) =>
        set((s) => ({
          moments: s.moments.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      deleteMoment: (id) =>
        set((s) => ({
          moments: s.moments.filter((m) => m.id !== id),
          dishes: s.dishes.filter((d) => d.moment_id !== id),
        })),

      // ── Dish CRUD ────────────────────────────────────────────────────────
      addDish: (input) => {
        const record: Dish = {
          ...input,
          id: rid("d"),
          sort_order: nextDishOrder(get().dishes, input.moment_id),
        };
        set((s) => ({ dishes: [...s.dishes, record] }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("catering_dishes", { id: record.id, couple_id: coupleId, name: record.name, category: null, dietary: record.dietary_flags ?? [] });
        return record;
      },
      updateDish: (id, patch) =>
        set((s) => ({
          dishes: s.dishes.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      deleteDish: (id) =>
        set((s) => ({
          dishes: s.dishes.filter((d) => d.id !== id),
        })),

      // ── Pending edits ────────────────────────────────────────────────────
      queuePendingEdits: (edits) => {
        const now = new Date().toISOString();
        const records: PendingEdit[] = edits.map((e) => ({
          ...e,
          id: rid("pe"),
          status: "pending",
          created_at: now,
        }));
        set((s) => ({ pending_edits: [...s.pending_edits, ...records] }));
        return records;
      },

      acceptEdit: (id) =>
        set((s) => {
          const edit = s.pending_edits.find((p) => p.id === id);
          if (!edit) return s;
          const applied = applyEdit(s, edit.payload, edit.event_id);
          return {
            ...applied,
            pending_edits: s.pending_edits.map((p) =>
              p.id === id
                ? { ...p, status: "accepted", applied_id: applied.applied_id }
                : p,
            ),
          };
        }),

      rejectEdit: (id) =>
        set((s) => ({
          pending_edits: s.pending_edits.map((p) =>
            p.id === id ? { ...p, status: "rejected" } : p,
          ),
        })),

      clearResolvedEdits: (event_id) =>
        set((s) => ({
          pending_edits: s.pending_edits.filter(
            (p) => p.event_id !== event_id || p.status === "pending",
          ),
        })),

      // ── Proposals ────────────────────────────────────────────────────────
      proposalsFor: (caterer_id) =>
        get().proposals.filter((p) => p.caterer_id === caterer_id),

      addProposal: (input) => {
        const record: CatererProposal = { ...input, id: rid("prop") };
        set((s) => ({ proposals: [...s.proposals, record] }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("catering_proposals", { id: record.id, couple_id: coupleId, caterer_name: record.caterer_id, status: record.status ?? "requested", amount: 0, contact: null });
        return record;
      },
      updateProposal: (id, patch) =>
        set((s) => ({
          proposals: s.proposals.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      deleteProposal: (id) =>
        set((s) => ({ proposals: s.proposals.filter((p) => p.id !== id) })),

      // ── Assessments ──────────────────────────────────────────────────────
      assessmentFor: (caterer_id) =>
        get().assessments.find((a) => a.caterer_id === caterer_id),

      upsertAssessment: (input) => {
        const existing = get().assessments.find(
          (a) => a.caterer_id === input.caterer_id,
        );
        if (existing) {
          const updated: CatererAssessment = { ...input, id: existing.id };
          set((s) => ({
            assessments: s.assessments.map((a) =>
              a.id === existing.id ? updated : a,
            ),
          }));
          return updated;
        }
        const record: CatererAssessment = { ...input, id: rid("fit") };
        set((s) => ({ assessments: [...s.assessments, record] }));
        return record;
      },

      deleteAssessment: (caterer_id) =>
        set((s) => ({
          assessments: s.assessments.filter((a) => a.caterer_id !== caterer_id),
        })),

      // ── Tasting visits ───────────────────────────────────────────────────
      tastingVisitsFor: (wedding_id) =>
        get()
          .tasting_visits.filter((v) => v.wedding_id === wedding_id)
          .sort((a, b) => b.date.localeCompare(a.date)),

      tastingDishesFor: (visit_id) =>
        get()
          .tasting_dishes.filter((d) => d.visit_id === visit_id)
          .sort((a, b) => a.sort_order - b.sort_order),

      addTastingVisit: (input) => {
        const record: TastingVisit = { ...input, id: rid("tv") };
        set((s) => ({ tasting_visits: [...s.tasting_visits, record] }));
        return record;
      },
      updateTastingVisit: (id, patch) =>
        set((s) => ({
          tasting_visits: s.tasting_visits.map((v) =>
            v.id === id ? { ...v, ...patch } : v,
          ),
        })),
      deleteTastingVisit: (id) =>
        set((s) => ({
          tasting_visits: s.tasting_visits.filter((v) => v.id !== id),
          tasting_dishes: s.tasting_dishes.filter((d) => d.visit_id !== id),
        })),

      addTastingDish: (input) => {
        const scoped = get().tasting_dishes.filter(
          (d) => d.visit_id === input.visit_id,
        );
        const sort_order =
          scoped.length > 0
            ? Math.max(...scoped.map((x) => x.sort_order)) + 1
            : 1;
        const record: TastingDish = { ...input, id: rid("td"), sort_order };
        set((s) => ({ tasting_dishes: [...s.tasting_dishes, record] }));
        return record;
      },
      updateTastingDish: (id, patch) =>
        set((s) => ({
          tasting_dishes: s.tasting_dishes.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),
      deleteTastingDish: (id) =>
        set((s) => ({
          tasting_dishes: s.tasting_dishes.filter((d) => d.id !== id),
        })),

      setTastingSynthesis: (visit_id, synthesis) =>
        set((s) => ({
          tasting_visits: s.tasting_visits.map((v) =>
            v.id === visit_id ? { ...v, synthesis } : v,
          ),
        })),

      // ── Service & Flow ───────────────────────────────────────────────────
      staffFor: (event_id) =>
        get()
          .staff_slots.filter((x) => x.event_id === event_id)
          .sort((a, b) => a.sort_order - b.sort_order),
      rentalsFor: (event_id) =>
        get()
          .rental_items.filter((x) => x.event_id === event_id)
          .sort((a, b) => a.sort_order - b.sort_order),
      cocktailsFor: (event_id) =>
        get()
          .signature_cocktails.filter((x) => x.event_id === event_id)
          .sort((a, b) => a.sort_order - b.sort_order),

      addStaffSlot: (input) => {
        const scoped = get().staff_slots.filter((s) => s.event_id === input.event_id);
        const sort_order =
          scoped.length > 0 ? Math.max(...scoped.map((x) => x.sort_order)) + 1 : 1;
        const record: StaffSlot = { ...input, id: rid("ss"), sort_order };
        set((s) => ({ staff_slots: [...s.staff_slots, record] }));
        return record;
      },
      updateStaffSlot: (id, patch) =>
        set((s) => ({
          staff_slots: s.staff_slots.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteStaffSlot: (id) =>
        set((s) => ({ staff_slots: s.staff_slots.filter((x) => x.id !== id) })),

      addRentalItem: (input) => {
        const scoped = get().rental_items.filter((r) => r.event_id === input.event_id);
        const sort_order =
          scoped.length > 0 ? Math.max(...scoped.map((x) => x.sort_order)) + 1 : 1;
        const record: RentalItem = { ...input, id: rid("ri"), sort_order };
        set((s) => ({ rental_items: [...s.rental_items, record] }));
        return record;
      },
      updateRentalItem: (id, patch) =>
        set((s) => ({
          rental_items: s.rental_items.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteRentalItem: (id) =>
        set((s) => ({ rental_items: s.rental_items.filter((x) => x.id !== id) })),

      addCocktail: (input) => {
        const scoped = get().signature_cocktails.filter(
          (c) => c.event_id === input.event_id,
        );
        const sort_order =
          scoped.length > 0 ? Math.max(...scoped.map((x) => x.sort_order)) + 1 : 1;
        const record: SignatureCocktail = { ...input, id: rid("sc"), sort_order };
        set((s) => ({ signature_cocktails: [...s.signature_cocktails, record] }));
        return record;
      },
      addCocktails: (inputs) => {
        if (inputs.length === 0) return [];
        const existing = get().signature_cocktails;
        const created: SignatureCocktail[] = [];
        let next = new Map<string, number>();
        for (const c of existing) {
          next.set(c.event_id, Math.max(next.get(c.event_id) ?? 0, c.sort_order));
        }
        for (const input of inputs) {
          const order = (next.get(input.event_id) ?? 0) + 1;
          next.set(input.event_id, order);
          created.push({ ...input, id: rid("sc"), sort_order: order });
        }
        set((s) => ({
          signature_cocktails: [...s.signature_cocktails, ...created],
        }));
        return created;
      },
      deleteCocktail: (id) =>
        set((s) => ({
          signature_cocktails: s.signature_cocktails.filter((x) => x.id !== id),
        })),

      setCommandBrief: (b) => set({ command_brief: b }),

      // ── Collaboration actions ───────────────────────────────────────────
      reactionsFor: (kind, entity_id) =>
        get().reactions.filter(
          (r) => r.entity_kind === kind && r.entity_id === entity_id,
        ),
      commentsFor: (kind, entity_id) =>
        get()
          .comments.filter(
            (c) => c.entity_kind === kind && c.entity_id === entity_id,
          )
          .sort((a, b) => a.created_at.localeCompare(b.created_at)),

      addReaction: (kind, entity_id, party_id, reaction_kind, comment) => {
        const record: Reaction = {
          id: rid("rx"),
          entity_id,
          entity_kind: kind,
          party_id,
          kind: reaction_kind,
          comment,
          created_at: new Date().toISOString(),
        };
        set((s) => ({ reactions: [...s.reactions, record] }));
        return record;
      },
      toggleReaction: (kind, entity_id, party_id, reaction_kind) =>
        set((s) => {
          const existing = s.reactions.find(
            (r) =>
              r.entity_kind === kind &&
              r.entity_id === entity_id &&
              r.party_id === party_id &&
              r.kind === reaction_kind,
          );
          if (existing) {
            return {
              reactions: s.reactions.filter((r) => r.id !== existing.id),
            };
          }
          const record: Reaction = {
            id: rid("rx"),
            entity_id,
            entity_kind: kind,
            party_id,
            kind: reaction_kind,
            created_at: new Date().toISOString(),
          };
          return { reactions: [...s.reactions, record] };
        }),
      removeReaction: (id) =>
        set((s) => ({ reactions: s.reactions.filter((r) => r.id !== id) })),

      addComment: (kind, entity_id, party_id, body) => {
        const record: Comment = {
          id: rid("cm"),
          entity_id,
          entity_kind: kind,
          party_id,
          body,
          created_at: new Date().toISOString(),
        };
        set((s) => ({ comments: [...s.comments, record] }));
        return record;
      },
      resolveComment: (id) =>
        set((s) => ({
          comments: s.comments.map((c) =>
            c.id === id ? { ...c, resolved_at: new Date().toISOString() } : c,
          ),
        })),

      addOpenQuestion: (q) => {
        const record: OpenQuestion = {
          ...q,
          id: rid("q"),
          created_at: new Date().toISOString(),
        };
        set((s) => ({ open_questions: [...s.open_questions, record] }));
        return record;
      },
      answerQuestion: (id, answer, answered_by) =>
        set((s) => ({
          open_questions: s.open_questions.map((q) =>
            q.id === id
              ? {
                  ...q,
                  answer,
                  answered_by,
                  answered_at: new Date().toISOString(),
                }
              : q,
          ),
        })),

      setDishState: (dish_id, state) =>
        set((s) => ({
          dishes: s.dishes.map((d) =>
            d.id === dish_id ? { ...d, state } : d,
          ),
        })),
      setProposalState: (proposal_id, status) =>
        set((s) => ({
          proposals: s.proposals.map((p) =>
            p.id === proposal_id ? { ...p, status } : p,
          ),
        })),

      setLean: (party_id, caterer_id, lean, note, event_id) => {
        const existing = get().party_leans.find(
          (l) =>
            l.party_id === party_id &&
            l.caterer_id === caterer_id &&
            l.event_id === event_id,
        );
        const updated_at = new Date().toISOString();
        if (existing) {
          const record: PartyLean = { ...existing, lean, note, updated_at };
          set((s) => ({
            party_leans: s.party_leans.map((l) =>
              l.id === existing.id ? record : l,
            ),
          }));
          return record;
        }
        const record: PartyLean = {
          id: rid("pl"),
          wedding_id: get().events[0]?.wedding_id ?? "",
          party_id,
          caterer_id,
          event_id,
          lean,
          note,
          updated_at,
        };
        set((s) => ({ party_leans: [...s.party_leans, record] }));
        return record;
      },

      addAttendeeRating: (input) => {
        const record: AttendeeRating = { ...input, id: rid("ar") };
        set((s) => ({ attendee_ratings: [...s.attendee_ratings, record] }));
        return record;
      },
      updateAttendeeRating: (id, patch) =>
        set((s) => ({
          attendee_ratings: s.attendee_ratings.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        })),

      addUpcomingTasting: (input) => {
        const record: UpcomingTasting = {
          ...input,
          id: rid("ut"),
          created_at: new Date().toISOString(),
        };
        set((s) => ({ upcoming_tastings: [...s.upcoming_tastings, record] }));
        return record;
      },

      recordPresence: (signal) =>
        set((s) => {
          const others = s.presence.filter((p) => p.party_id !== signal.party_id);
          return { presence: [...others, signal] };
        }),

      initFromDB: async () => {
        const coupleId = getCurrentCoupleId();
        if (!coupleId || typeof window === "undefined") return;
        try {
          const res = await fetch(`/api/catering/data?couple_id=${encodeURIComponent(coupleId)}`);
          if (!res.ok) return;
          const json = await res.json();
          const dbEvents: MenuEvent[] = json.events ?? [];
          const dbDishes: Dish[] = json.dishes ?? [];
          const dbProposals: CatererProposal[] = json.proposals ?? [];
          if (dbEvents.length === 0 && dbDishes.length === 0 && dbProposals.length === 0) return;
          set((s) => ({
            events: dbEvents.length > 0 ? dbEvents : s.events,
            dishes: dbDishes.length > 0 ? dbDishes : s.dishes,
            proposals: dbProposals.length > 0 ? dbProposals : s.proposals,
          }));
        } catch {
          // Silently fall back to seed data
        }
      },
    }),
    {
      name: "ananya-catering-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      // Bump on schema changes — v2 adds the collaboration layer
      // (reactions, comments, open_questions, party_leans, attendee_ratings,
      // upcoming_tastings, presence) plus added_by/state on dishes, proposals,
      // staff slots, rentals.
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) return {};
        return persistedState;
      },
    },
  ),
);

// ── applyEdit ──────────────────────────────────────────────────────────────
// Pure-ish helper that folds a PendingEdit into the mutable slice of
// state. Returns the updated slice plus an `applied_id` so the caller
// can stamp the PendingEdit row. Kept outside the store so the logic
// stays exhaustive over PendingEditPayload's discriminated union.

type Slice = Pick<CateringState, "events" | "moments" | "dishes">;

function applyEdit(
  state: Slice,
  payload: PendingEditPayload,
  event_id: string,
): Slice & { applied_id?: string } {
  switch (payload.kind) {
    case "add_dish": {
      const moment =
        state.moments.find(
          (m) =>
            m.event_id === event_id &&
            m.name.toLowerCase() === payload.moment_name.toLowerCase(),
        ) ?? state.moments.find((m) => m.event_id === event_id);
      if (!moment) return state;
      const dish: Dish = {
        ...payload.dish,
        id: rid("d"),
        moment_id: moment.id,
        sort_order: nextDishOrder(state.dishes, moment.id),
      };
      return { ...state, dishes: [...state.dishes, dish], applied_id: dish.id };
    }
    case "update_dish": {
      return {
        ...state,
        dishes: state.dishes.map((d) =>
          d.id === payload.dish_id ? { ...d, ...payload.patch } : d,
        ),
        applied_id: payload.dish_id,
      };
    }
    case "remove_dish": {
      return {
        ...state,
        dishes: state.dishes.filter((d) => d.id !== payload.dish_id),
        applied_id: payload.dish_id,
      };
    }
    case "add_moment": {
      const moment: MenuMoment = {
        ...payload.moment,
        id: rid("m"),
        event_id,
        order: nextMomentOrder(state.moments, event_id),
      };
      return {
        ...state,
        moments: [...state.moments, moment],
        applied_id: moment.id,
      };
    }
    case "update_moment": {
      return {
        ...state,
        moments: state.moments.map((m) =>
          m.id === payload.moment_id ? { ...m, ...payload.patch } : m,
        ),
        applied_id: payload.moment_id,
      };
    }
    default: {
      // Exhaustiveness — TS will flag new payload kinds here.
      const _never: never = payload;
      return { ...state, applied_id: undefined };
    }
  }
}
