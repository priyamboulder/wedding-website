// ── Venue store ───────────────────────────────────────────────────────────
// Single source of truth for the new, emotion-led Venue workspace.
// Zustand + localStorage (per project persistence memory — no Supabase).
//
// Slices:
//   profile      · name / type / location / hero images / floor plan
//   discovery    · brief, AI directions, inspiration gallery, keyword chips,
//                  definitely_want / not_for_us free-text lists
//   shortlist    · venue cards (with lifecycle status + compare toggle)
//   suggestions  · placeholder AI-suggested venue cards
//   requirements · computed venue checklist (seeded, editable later)
//   spaces       · space inventory
//   pairings     · event → space assignments for Spaces & Flow
//   transitions  · flip / transition notes per space
//   logistics    · structured logistics fields other workspaces can read
//   site_visits  · per-visit cards with checklist + rating + voice memo slot
//   documents    · contracts, floor plans, COIs, permits

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, dbLoadBlob, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  DiscoveryQuizAnswers,
  InspirationImage,
  InspirationReaction,
  ShortlistVenue,
  SiteVisit,
  SiteVisitChecklistItem,
  SiteVisitFollowUp,
  SiteVisitPhoto,
  SpaceEventPairing,
  SuggestionStatus,
  TransitionNote,
  VenueDirection,
  VenueDiscovery,
  VenueDocument,
  VenueHeroImage,
  VenueLogistics,
  VenueProfile,
  VenueRequirement,
  VenueSpace,
  VenueStatus,
  VenueSuggestion,
  VisitRating,
} from "@/types/venue";
import {
  DEFAULT_DISCOVERY,
  DEFAULT_DISCOVERY_QUIZ,
  DEFAULT_LOGISTICS,
  DEFAULT_PAIRINGS,
  DEFAULT_SHORTLIST,
  DEFAULT_SITE_VISITS,
  DEFAULT_SUGGESTIONS,
  DEFAULT_TRANSITIONS,
  DEFAULT_VENUE_DOCUMENTS,
  DEFAULT_VENUE_PROFILE,
  DEFAULT_VENUE_REQUIREMENTS,
  DEFAULT_VENUE_SPACES,
  DEFAULT_VISIT_CHECKLIST_TEMPLATE,
} from "@/lib/venue-seed";

interface VenueState {
  profile: VenueProfile;
  discovery: VenueDiscovery;
  shortlist: ShortlistVenue[];
  suggestions: VenueSuggestion[];
  requirements: VenueRequirement[];
  spaces: VenueSpace[];
  pairings: SpaceEventPairing[];
  transitions: TransitionNote[];
  logistics: VenueLogistics;
  site_visits: SiteVisit[];
  documents: VenueDocument[];

  // ── Profile ──
  setProfile: (patch: Partial<VenueProfile>) => void;
  addHeroImage: (url: string, caption?: string) => void;
  removeHeroImage: (id: string) => void;
  setFloorPlan: (url: string | null, caption?: string) => void;

  // ── Discovery ──
  setBrief: (text: string) => void;
  setDirectionReaction: (id: string, reaction: VenueDirection["reaction"]) => void;
  addInspiration: (url: string, caption?: string) => void;
  setInspirationReaction: (id: string, reaction: InspirationReaction) => void;
  removeInspiration: (id: string) => void;
  toggleKeywordChip: (chip: string) => void;
  setDefinitelyWant: (items: string[]) => void;
  setNotForUs: (items: string[]) => void;

  // ── Discovery quiz ──
  setQuizAnswers: (patch: Partial<DiscoveryQuizAnswers>) => void;
  setQuizCompleted: (completed: boolean) => void;
  resetQuiz: () => void;

  // ── Shortlist ──
  addShortlistVenue: (v: Partial<ShortlistVenue> & { name: string }) => string;
  updateShortlistVenue: (id: string, patch: Partial<ShortlistVenue>) => void;
  setVenueStatus: (id: string, status: VenueStatus) => void;
  toggleCompareChecked: (id: string) => void;
  removeShortlistVenue: (id: string) => void;

  // ── Suggestions ──
  setSuggestionStatus: (id: string, status: SuggestionStatus) => void;
  acceptSuggestion: (id: string) => string | null;

  // ── Requirements ──
  addCustomRequirement: (label: string, source_note?: string) => void;
  toggleRequirement: (id: string) => void;
  removeRequirement: (id: string) => void;

  // ── Spaces ──
  addSpace: (s: Partial<VenueSpace> & { name: string }) => void;
  updateSpace: (id: string, patch: Partial<VenueSpace>) => void;
  removeSpace: (id: string) => void;

  // ── Pairings ──
  addPairing: (event_id: string, space_id: string) => void;
  updatePairing: (id: string, patch: Partial<SpaceEventPairing>) => void;
  removePairing: (id: string) => void;

  // ── Transitions ──
  addTransition: (space_id: string) => void;
  updateTransition: (id: string, patch: Partial<TransitionNote>) => void;
  removeTransition: (id: string) => void;

  // ── Logistics ──
  setLogistics: (patch: Partial<VenueLogistics>) => void;
  addRestriction: (text: string) => void;
  removeRestriction: (idx: number) => void;

  // ── Shortlist · questionnaire / outreach ──
  toggleVenueQuestionAsked: (id: string, questionId: string) => void;

  // ── Site visits ──
  addSiteVisit: (input?: { venue_id?: string | null }) => void;
  updateSiteVisit: (id: string, patch: Partial<SiteVisit>) => void;
  removeSiteVisit: (id: string) => void;
  addVisitPhoto: (
    visitId: string,
    url: string,
    caption?: string,
    spaceTag?: string,
  ) => void;
  updateVisitPhoto: (
    visitId: string,
    photoId: string,
    patch: Partial<SiteVisitPhoto>,
  ) => void;
  removeVisitPhoto: (visitId: string, photoId: string) => void;
  togglePreVisitQuizItem: (visitId: string, itemId: string) => void;
  setVisitSummary: (visitId: string, text: string) => void;
  addVisitFollowUp: (visitId: string, text: string) => void;
  toggleVisitFollowUp: (visitId: string, followUpId: string) => void;
  removeVisitFollowUp: (visitId: string, followUpId: string) => void;
  toggleVisitChecklistItem: (visitId: string, itemId: string) => void;
  addVisitChecklistItem: (visitId: string, label: string) => void;
  removeVisitChecklistItem: (visitId: string, itemId: string) => void;
  setVisitRating: (visitId: string, rating: VisitRating) => void;
  setVisitVoiceMemo: (
    visitId: string,
    url: string | null,
    caption?: string,
  ) => void;

  // ── Documents ──
  addDocument: (d: Partial<VenueDocument> & { title: string; kind: VenueDocument["kind"] }) => void;
  updateDocument: (id: string, patch: Partial<VenueDocument>) => void;
  removeDocument: (id: string) => void;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `vid_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

function seededChecklist(): SiteVisitChecklistItem[] {
  return DEFAULT_VISIT_CHECKLIST_TEMPLATE.map((t) => ({ ...t, checked: false }));
}

export const useVenueStore = create<VenueState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_VENUE_PROFILE,
      discovery: DEFAULT_DISCOVERY,
      shortlist: DEFAULT_SHORTLIST,
      suggestions: DEFAULT_SUGGESTIONS,
      requirements: DEFAULT_VENUE_REQUIREMENTS,
      spaces: DEFAULT_VENUE_SPACES,
      pairings: DEFAULT_PAIRINGS,
      transitions: DEFAULT_TRANSITIONS,
      logistics: DEFAULT_LOGISTICS,
      site_visits: DEFAULT_SITE_VISITS,
      documents: DEFAULT_VENUE_DOCUMENTS,

      // ── Profile ──
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      addHeroImage: (url, caption) =>
        set((s) => {
          const hero: VenueHeroImage = { id: uid(), url, caption };
          return {
            profile: { ...s.profile, hero_images: [...s.profile.hero_images, hero] },
          };
        }),
      removeHeroImage: (id) =>
        set((s) => ({
          profile: {
            ...s.profile,
            hero_images: s.profile.hero_images.filter((h) => h.id !== id),
          },
        })),
      setFloorPlan: (url, caption) =>
        set((s) => ({
          profile: {
            ...s.profile,
            floor_plan_url: url,
            floor_plan_caption: caption ?? s.profile.floor_plan_caption,
          },
        })),

      // ── Discovery ──
      setBrief: (text) =>
        set((s) => ({ discovery: { ...s.discovery, brief_body: text } })),
      setDirectionReaction: (id, reaction) =>
        set((s) => ({
          discovery: {
            ...s.discovery,
            directions: s.discovery.directions.map((d) =>
              d.id === id
                ? { ...d, reaction: d.reaction === reaction ? null : reaction }
                : d,
            ),
          },
        })),
      addInspiration: (url, caption) =>
        set((s) => {
          const img: InspirationImage = {
            id: uid(),
            url,
            caption: caption ?? "",
            reaction: null,
            directionId: null,
          };
          return {
            discovery: {
              ...s.discovery,
              inspiration: [...s.discovery.inspiration, img],
            },
          };
        }),
      setInspirationReaction: (id, reaction) =>
        set((s) => ({
          discovery: {
            ...s.discovery,
            inspiration: s.discovery.inspiration.map((i) =>
              i.id === id
                ? { ...i, reaction: i.reaction === reaction ? null : reaction }
                : i,
            ),
          },
        })),
      removeInspiration: (id) =>
        set((s) => ({
          discovery: {
            ...s.discovery,
            inspiration: s.discovery.inspiration.filter((i) => i.id !== id),
          },
        })),
      toggleKeywordChip: (chip) =>
        set((s) => {
          const has = s.discovery.keyword_chips.some(
            (c) => c.toLowerCase() === chip.toLowerCase(),
          );
          return {
            discovery: {
              ...s.discovery,
              keyword_chips: has
                ? s.discovery.keyword_chips.filter(
                    (c) => c.toLowerCase() !== chip.toLowerCase(),
                  )
                : [...s.discovery.keyword_chips, chip],
            },
          };
        }),
      setDefinitelyWant: (items) =>
        set((s) => ({ discovery: { ...s.discovery, definitely_want: items } })),
      setNotForUs: (items) =>
        set((s) => ({ discovery: { ...s.discovery, not_for_us: items } })),

      // ── Discovery quiz ──
      setQuizAnswers: (patch) =>
        set((s) => ({
          discovery: {
            ...s.discovery,
            quiz: {
              ...s.discovery.quiz,
              answers: { ...s.discovery.quiz.answers, ...patch },
              updated_at: new Date().toISOString(),
            },
          },
        })),
      setQuizCompleted: (completed) =>
        set((s) => ({
          discovery: {
            ...s.discovery,
            quiz: {
              ...s.discovery.quiz,
              completed,
              updated_at: new Date().toISOString(),
            },
          },
        })),
      resetQuiz: () =>
        set((s) => ({
          discovery: { ...s.discovery, quiz: DEFAULT_DISCOVERY_QUIZ },
        })),

      // ── Shortlist ──
      addShortlistVenue: (v) => {
        const id = uid();
        const next: ShortlistVenue = {
          id,
          name: v.name,
          location: v.location ?? "",
          vibe_summary: v.vibe_summary ?? "",
          hero_image_url: v.hero_image_url ?? "",
          status: v.status ?? "researching",
          compare_checked: v.compare_checked ?? false,
          indoor_outdoor: v.indoor_outdoor ?? "both",
          capacity: v.capacity ?? "",
          catering_policy: v.catering_policy ?? "",
          fire_policy: v.fire_policy ?? "",
          noise_curfew: v.noise_curfew ?? "",
          rooms: v.rooms ?? "",
          cost_note: v.cost_note ?? "",
          airport_distance: v.airport_distance ?? "",
          guest_accommodation: v.guest_accommodation ?? "",
          loading_dock: v.loading_dock ?? "",
          power: v.power ?? "",
          permits: v.permits ?? "",
          your_notes: v.your_notes ?? "",
          planner_notes: v.planner_notes ?? "",
          website: v.website ?? "",
          contact_phone: v.contact_phone ?? "",
          contact_email: v.contact_email ?? "",
          seated_capacity: v.seated_capacity ?? "",
          cocktail_capacity: v.cocktail_capacity ?? "",
          outdoor_ceremony_capacity: v.outdoor_ceremony_capacity ?? "",
          num_spaces: v.num_spaces ?? "",
          alcohol_policy: v.alcohol_policy ?? "",
          corkage_fee: v.corkage_fee ?? "",
          parking_capacity: v.parking_capacity ?? "",
          load_in_window: v.load_in_window ?? "",
          minimum_night_stay: v.minimum_night_stay ?? "",
          included_in_fee: v.included_in_fee ?? "",
          availability_notes: v.availability_notes ?? "",
          virtual_tour_url: v.virtual_tour_url ?? "",
          date_contacted: v.date_contacted ?? "",
          site_visit_date: v.site_visit_date ?? "",
          questions_asked: v.questions_asked ?? [],
          sort_order: get().shortlist.length,
        };
        set((s) => ({ shortlist: [...s.shortlist, next] }));
        return id;
      },
      updateShortlistVenue: (id, patch) =>
        set((s) => ({
          shortlist: s.shortlist.map((v) =>
            v.id === id ? { ...v, ...patch } : v,
          ),
        })),
      setVenueStatus: (id, status) =>
        set((s) => ({
          shortlist: s.shortlist.map((v) =>
            v.id === id ? { ...v, status } : v,
          ),
        })),
      toggleCompareChecked: (id) =>
        set((s) => ({
          shortlist: s.shortlist.map((v) =>
            v.id === id ? { ...v, compare_checked: !v.compare_checked } : v,
          ),
        })),
      removeShortlistVenue: (id) =>
        set((s) => ({
          shortlist: s.shortlist.filter((v) => v.id !== id),
          site_visits: s.site_visits.map((sv) =>
            sv.venue_id === id ? { ...sv, venue_id: null } : sv,
          ),
        })),
      toggleVenueQuestionAsked: (id, questionId) =>
        set((s) => ({
          shortlist: s.shortlist.map((v) => {
            if (v.id !== id) return v;
            const has = v.questions_asked.includes(questionId);
            return {
              ...v,
              questions_asked: has
                ? v.questions_asked.filter((q) => q !== questionId)
                : [...v.questions_asked, questionId],
            };
          }),
        })),

      // ── Suggestions ──
      setSuggestionStatus: (id, status) =>
        set((s) => ({
          suggestions: s.suggestions.map((x) =>
            x.id === id ? { ...x, status } : x,
          ),
        })),
      acceptSuggestion: (id) => {
        const sugg = get().suggestions.find((x) => x.id === id);
        if (!sugg) return null;
        const newId = get().addShortlistVenue({
          name: sugg.name,
          location: sugg.location,
          vibe_summary: sugg.vibe_summary,
          hero_image_url: sugg.hero_image_url,
          status: "researching",
        });
        set((s) => ({
          suggestions: s.suggestions.map((x) =>
            x.id === id ? { ...x, status: "accepted" } : x,
          ),
        }));
        return newId;
      },

      // ── Requirements ──
      addCustomRequirement: (label, source_note) =>
        set((s) => ({
          requirements: [
            ...s.requirements,
            {
              id: uid(),
              group: "custom",
              label,
              met: false,
              source_note: source_note ?? "Added by you",
              sort_order: s.requirements.length,
              computed: false,
            },
          ],
        })),
      toggleRequirement: (id) =>
        set((s) => ({
          requirements: s.requirements.map((r) =>
            r.id === id ? { ...r, met: !r.met } : r,
          ),
        })),
      removeRequirement: (id) =>
        set((s) => ({
          requirements: s.requirements.filter((r) => r.id !== id),
        })),

      // ── Spaces ──
      addSpace: (space) =>
        set((s) => ({
          spaces: [
            ...s.spaces,
            {
              id: uid(),
              name: space.name,
              use: space.use ?? "",
              capacity: space.capacity ?? "",
              notes: space.notes ?? "",
              image_url: space.image_url ?? null,
              sort_order: s.spaces.length,
              ai_layout_suggestion: space.ai_layout_suggestion ?? "",
            },
          ],
        })),
      updateSpace: (id, patch) =>
        set((s) => ({
          spaces: s.spaces.map((sp) => (sp.id === id ? { ...sp, ...patch } : sp)),
        })),
      removeSpace: (id) =>
        set((s) => ({
          spaces: s.spaces.filter((sp) => sp.id !== id),
          pairings: s.pairings.filter((p) => p.space_id !== id),
          transitions: s.transitions.filter((t) => t.space_id !== id),
        })),

      // ── Pairings ──
      addPairing: (event_id, space_id) =>
        set((s) => ({
          pairings: [
            ...s.pairings,
            { id: uid(), event_id, space_id, sort_order: s.pairings.length },
          ],
        })),
      updatePairing: (id, patch) =>
        set((s) => ({
          pairings: s.pairings.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePairing: (id) =>
        set((s) => ({ pairings: s.pairings.filter((p) => p.id !== id) })),

      // ── Transitions ──
      addTransition: (space_id) =>
        set((s) => ({
          transitions: [
            ...s.transitions,
            {
              id: uid(),
              space_id,
              flip_time: "",
              changes: "",
              responsible: "",
            },
          ],
        })),
      updateTransition: (id, patch) =>
        set((s) => ({
          transitions: s.transitions.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),
      removeTransition: (id) =>
        set((s) => ({ transitions: s.transitions.filter((t) => t.id !== id) })),

      // ── Logistics ──
      setLogistics: (patch) =>
        set((s) => ({ logistics: { ...s.logistics, ...patch } })),
      addRestriction: (text) =>
        set((s) => ({
          logistics: {
            ...s.logistics,
            restrictions: [...s.logistics.restrictions, text],
          },
        })),
      removeRestriction: (idx) =>
        set((s) => ({
          logistics: {
            ...s.logistics,
            restrictions: s.logistics.restrictions.filter((_, i) => i !== idx),
          },
        })),

      // ── Site visits ──
      addSiteVisit: (input) =>
        set((s) => {
          const nextIndex =
            s.site_visits.reduce((m, x) => Math.max(m, x.visit_index), 0) + 1;
          const visit: SiteVisit = {
            id: uid(),
            visit_index: nextIndex,
            date: "",
            attendees: "",
            weather: "",
            photos: [],
            notes: "",
            follow_ups: [],
            checklist: seededChecklist(),
            voice_memo_url: null,
            voice_memo_caption: "",
            rating: null,
            venue_id: input?.venue_id ?? null,
            sort_order: s.site_visits.length,
            pre_visit_quiz: {},
            visit_summary: "",
          };
          return { site_visits: [...s.site_visits, visit] };
        }),
      updateSiteVisit: (id, patch) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === id ? { ...v, ...patch } : v,
          ),
        })),
      removeSiteVisit: (id) =>
        set((s) => ({ site_visits: s.site_visits.filter((v) => v.id !== id) })),
      addVisitPhoto: (visitId, url, caption, spaceTag) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) => {
            if (v.id !== visitId) return v;
            const photo: SiteVisitPhoto = {
              id: uid(),
              url,
              caption: caption ?? "",
              space_tag: spaceTag ?? "",
              ai_analysis: "",
            };
            return { ...v, photos: [...v.photos, photo] };
          }),
        })),
      updateVisitPhoto: (visitId, photoId, patch) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  photos: v.photos.map((p) =>
                    p.id === photoId ? { ...p, ...patch } : p,
                  ),
                }
              : v,
          ),
        })),
      removeVisitPhoto: (visitId, photoId) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId
              ? { ...v, photos: v.photos.filter((p) => p.id !== photoId) }
              : v,
          ),
        })),
      togglePreVisitQuizItem: (visitId, itemId) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  pre_visit_quiz: {
                    ...v.pre_visit_quiz,
                    [itemId]: !v.pre_visit_quiz[itemId],
                  },
                }
              : v,
          ),
        })),
      setVisitSummary: (visitId, text) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId ? { ...v, visit_summary: text } : v,
          ),
        })),
      addVisitFollowUp: (visitId, text) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) => {
            if (v.id !== visitId) return v;
            const fu: SiteVisitFollowUp = { id: uid(), text, done: false };
            return { ...v, follow_ups: [...v.follow_ups, fu] };
          }),
        })),
      toggleVisitFollowUp: (visitId, followUpId) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  follow_ups: v.follow_ups.map((f) =>
                    f.id === followUpId ? { ...f, done: !f.done } : f,
                  ),
                }
              : v,
          ),
        })),
      removeVisitFollowUp: (visitId, followUpId) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  follow_ups: v.follow_ups.filter((f) => f.id !== followUpId),
                }
              : v,
          ),
        })),
      toggleVisitChecklistItem: (visitId, itemId) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  checklist: v.checklist.map((c) =>
                    c.id === itemId ? { ...c, checked: !c.checked } : c,
                  ),
                }
              : v,
          ),
        })),
      addVisitChecklistItem: (visitId, label) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  checklist: [
                    ...v.checklist,
                    { id: uid(), label, checked: false },
                  ],
                }
              : v,
          ),
        })),
      removeVisitChecklistItem: (visitId, itemId) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  checklist: v.checklist.filter((c) => c.id !== itemId),
                }
              : v,
          ),
        })),
      setVisitRating: (visitId, rating) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId ? { ...v, rating } : v,
          ),
        })),
      setVisitVoiceMemo: (visitId, url, caption) =>
        set((s) => ({
          site_visits: s.site_visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  voice_memo_url: url,
                  voice_memo_caption: caption ?? v.voice_memo_caption,
                }
              : v,
          ),
        })),

      // ── Documents ──
      addDocument: (d) =>
        set((s) => ({
          documents: [
            ...s.documents,
            {
              id: uid(),
              title: d.title,
              kind: d.kind,
              url: d.url ?? "",
              uploaded_at: d.uploaded_at ?? new Date().toISOString().slice(0, 10),
              notes: d.notes ?? "",
              sort_order: s.documents.length,
            },
          ],
        })),
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),
      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
    }),
    {
      name: "ananya:venue",
      version: 4,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
        }
        return window.localStorage;
      }),
      partialize: (s) => ({
        profile: s.profile,
        discovery: s.discovery,
        shortlist: s.shortlist,
        suggestions: s.suggestions,
        requirements: s.requirements,
        spaces: s.spaces,
        pairings: s.pairings,
        transitions: s.transitions,
        logistics: s.logistics,
        site_visits: s.site_visits,
        documents: s.documents,
      }),
      migrate: (persistedState: unknown, version: number) => {
        // v2 and earlier used a different shape — reset fully.
        if (version < 3 || !persistedState || typeof persistedState !== "object") {
          return {
            profile: DEFAULT_VENUE_PROFILE,
            discovery: DEFAULT_DISCOVERY,
            shortlist: DEFAULT_SHORTLIST,
            suggestions: DEFAULT_SUGGESTIONS,
            requirements: DEFAULT_VENUE_REQUIREMENTS,
            spaces: DEFAULT_VENUE_SPACES,
            pairings: DEFAULT_PAIRINGS,
            transitions: DEFAULT_TRANSITIONS,
            logistics: DEFAULT_LOGISTICS,
            site_visits: DEFAULT_SITE_VISITS,
            documents: DEFAULT_VENUE_DOCUMENTS,
          };
        }
        // v3 → v4 adds additive fields. Preserve user state and backfill.
        const s = persistedState as Record<string, unknown> & {
          discovery?: { quiz?: unknown } & Record<string, unknown>;
          shortlist?: Array<Record<string, unknown>>;
          spaces?: Array<Record<string, unknown>>;
          site_visits?: Array<Record<string, unknown>>;
        };
        return {
          ...s,
          discovery: {
            ...(s.discovery ?? {}),
            quiz: s.discovery?.quiz ?? DEFAULT_DISCOVERY_QUIZ,
          },
          shortlist: (s.shortlist ?? []).map((v) => ({
            website: "",
            contact_phone: "",
            contact_email: "",
            seated_capacity: "",
            cocktail_capacity: "",
            outdoor_ceremony_capacity: "",
            num_spaces: "",
            alcohol_policy: "",
            corkage_fee: "",
            parking_capacity: "",
            load_in_window: "",
            minimum_night_stay: "",
            included_in_fee: "",
            availability_notes: "",
            virtual_tour_url: "",
            date_contacted: "",
            site_visit_date: "",
            questions_asked: [],
            ...v,
          })),
          spaces: (s.spaces ?? []).map((sp) => ({
            ai_layout_suggestion: "",
            ...sp,
          })),
          site_visits: (s.site_visits ?? []).map((sv) => {
            const prior = sv as Record<string, unknown> & {
              photos?: Array<Record<string, unknown>>;
            };
            return {
              pre_visit_quiz: {},
              visit_summary: "",
              ...prior,
              photos: (prior.photos ?? []).map((p) => ({
                space_tag: "",
                ai_analysis: "",
                ...p,
              })),
            };
          }),
        };
      },
    },
  ),
);

export async function loadVenueFromDB() {
  const coupleId = getCurrentCoupleId();
  if (!coupleId) return;
  const blob = await dbLoadBlob<Record<string, unknown>>("venue_state", coupleId);
  if (!blob) return;
  useVenueStore.setState((s) => ({
    profile: (blob.profile as never) ?? s.profile,
    discovery: (blob.discovery as never) ?? s.discovery,
    shortlist: (blob.shortlist as never) ?? s.shortlist,
    suggestions: (blob.suggestions as never) ?? s.suggestions,
    requirements: (blob.requirements as never) ?? s.requirements,
    spaces: (blob.spaces as never) ?? s.spaces,
    pairings: (blob.pairings as never) ?? s.pairings,
    transitions: (blob.transitions as never) ?? s.transitions,
    logistics: (blob.logistics as never) ?? s.logistics,
    site_visits: (blob.site_visits as never) ?? s.site_visits,
    documents: (blob.documents as never) ?? s.documents,
  }));
}

// ── Supabase background sync ─────────────────────────────────────────────
let _venueSyncTimer: ReturnType<typeof setTimeout> | null = null;
useVenueStore.subscribe((state) => {
  if (_venueSyncTimer) clearTimeout(_venueSyncTimer);
  _venueSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { profile, discovery, shortlist, suggestions, requirements, spaces, pairings, transitions, logistics, site_visits, documents } = state;
    dbUpsert("venue_state", { couple_id: coupleId, profile, discovery, shortlist, suggestions, requirements, spaces, pairings, transitions, logistics, site_visits, documents });
  }, 600);
});

// ── Derived helpers for the sidebar + other consumers ─────────────────────

// The sidebar shows "Discovering" / "Comparing 3" / "Booked — [name]"
// instead of the generic "X/Y" progress fraction.
export function deriveVenueBadge(state: Pick<VenueState, "shortlist">): string {
  const booked = state.shortlist.find((v) => v.status === "booked");
  if (booked) return `Booked — ${booked.name.split("·")[0].trim()}`;
  const shortlisted = state.shortlist.filter(
    (v) => v.status === "shortlisted" || v.status === "site_visit_planned" || v.status === "visited",
  ).length;
  if (shortlisted >= 2) return `Comparing ${shortlisted}`;
  if (state.shortlist.length > 0) return `Researching ${state.shortlist.length}`;
  return "Discovering";
}
