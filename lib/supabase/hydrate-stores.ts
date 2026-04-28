// ── Store hydration ───────────────────────────────────────────────────────────
// Called after login to load all Zustand stores from Supabase.
// Every store already writes to DB via dbUpsert on change (subscribe pattern).
// This file handles the read side: loading DB state back into stores on login.
//
// Two patterns used in this codebase:
//   1. data-blob: { couple_id PK, data jsonb } — most stores
//   2. named-columns: separate columns per field — events, venue, aesthetic, etc.

import { dbLoadData, dbLoadRow } from "@/lib/supabase/db-sync";


export async function hydrateAllStoresFromDB(coupleId: string) {
  // ── Stores with { data: state } blob pattern ────────────────────────────
  const blobStores: Array<[string, string]> = [
    ["album_state", "useAlbumStore"],
    ["article_links_state", "useArticleLinksStore"],
    ["baby_shower_state", "useBabyShowerStore"],
    // bachelorette_state / bachelor_state use named columns — handled in loadBachelor/ette
    // They're in the named-column section below
    ["brand_overrides_state", "useBrandOverridesStore"],
    // bridal_shower_state uses named columns — handled in loadBridalShowerState
    ["cart_state", "useCartStore"],
    ["comments_state", "useCommentsStore"],
    ["community_discussions_state", "useCommunityDiscussionsStore"],
    ["community_huddles_state", "useCommunityHuddlesStore"],
    ["community_live_events_state", "useCommunityLiveEventsStore"],
    ["community_meetups_state", "useCommunityMeetupsStore"],
    ["community_profiles_state", "useCommunityProfilesStore"],
    ["community_social_state", "useCommunityStore"],
    ["content_studio_state", "useContentStudioStore"],
    ["conversation_state", "useConversationStore"],
    ["coordination_state", "useCoordinationStore"],
    ["creator_applications_state", "useCreatorApplicationsStore"],
    ["creator_portal_state", "useCreatorPortalStore"],
    ["creators_state", "useCreatorsStore"],
    ["couple_documents", "useDocumentsStore"],
    ["discovery_state", "useDiscoveryStore"],
    ["drops_state", "useDropsStore"],
    ["engagement_shoot_state", "useEngagementShootStore"],
    ["exhibitions_state", "useExhibitionsStore"],
    ["first_anniversary_state", "useFirstAnniversaryStore"],
    ["first_birthday_state", "useFirstBirthdayStore"],
    ["grapevine_state", "useGrapevineStore"],
    ["guest_categories_state", "useGuestCategoriesStore"],
    ["guest_experiences_state", "useGuestExperiencesStore"],
    ["guides_state", "useGuidesStore"],
    ["honeymoon_state", "useHoneymoonStore"],
    ["marketplace_state", "useMarketplaceStore"],
    ["matching_state", "useMatchingStore"],
    ["mentoring_state", "useMentoringStore"],
    ["one_look_state", "useOneLookStore"],
    ["partnerships_state", "usePartnershipsStore"],
    ["performances_state", "usePerformancesStore"],
    ["post_wedding_state", "usePostWeddingStore"],
    ["real_numbers_state", "useRealNumbersStore"],
    ["recommendations_state", "useRecommendationsStore"],
    ["roulette_state", "useRouletteStore"],
    ["seating_drag_state", "useSeatingDragStore"],
    ["showcases_state", "useShowcasesStore"],
    ["stationery_state", "useStationeryStore"],
    ["travel_state", "useTravelStore"],
    ["user_designs_state", "useUserDesignsStore"],
    ["vendor_needs_state", "useVendorNeedsStore"],
    ["vendor_packages_state", "useVendorPackagesStore"],
    ["vendor_reviews_state", "useVendorReviewsStore"],
    ["welcome_events_state", "useWelcomeEventsStore"],
    ["workspace_files", "useFilesStore"],
  ];

  // Map from store export name → dynamic import path
  const storeImports: Record<string, () => Promise<Record<string, unknown>>> = {
    useAlbumStore: () => import("@/stores/album-store"),
    useArticleLinksStore: () => import("@/stores/article-links-store"),
    useBabyShowerStore: () => import("@/stores/baby-shower-store"),
    useBrandOverridesStore: () => import("@/stores/brand-overrides-store"),
    useCartStore: () => import("@/stores/cart-store"),
    useCommentsStore: () => import("@/stores/comments-store"),
    useCommunityDiscussionsStore: () => import("@/stores/community-discussions-store"),
    useCommunityHuddlesStore: () => import("@/stores/community-huddles-store"),
    useCommunityLiveEventsStore: () => import("@/stores/community-live-events-store"),
    useCommunityMeetupsStore: () => import("@/stores/community-meetups-store"),
    useCommunityProfilesStore: () => import("@/stores/community-profiles-store"),
    useCommunityStore: () => import("@/stores/community-social-store"),
    useContentStudioStore: () => import("@/stores/content-studio-store"),
    useConversationStore: () => import("@/stores/conversation-store"),
    useCoordinationStore: () => import("@/stores/coordination-store"),
    useCreatorApplicationsStore: () => import("@/stores/creator-applications-store"),
    useCreatorPortalStore: () => import("@/stores/creator-portal-store"),
    useCreatorsStore: () => import("@/stores/creators-store"),
    useDocumentsStore: () => import("@/stores/documents-store"),
    useDiscoveryStore: () => import("@/stores/discovery-store"),
    useDropsStore: () => import("@/stores/drops-store"),
    useEngagementShootStore: () => import("@/stores/engagement-shoot-store"),
    useExhibitionsStore: () => import("@/stores/exhibitions-store"),
    useFirstAnniversaryStore: () => import("@/stores/first-anniversary-store"),
    useFirstBirthdayStore: () => import("@/stores/first-birthday-store"),
    useGrapevineStore: () => import("@/stores/grapevine-store"),
    useGuestCategoriesStore: () => import("@/stores/guest-categories-store"),
    useGuestExperiencesStore: () => import("@/stores/guest-experiences-store"),
    useGuidesStore: () => import("@/stores/guides-store"),
    useHoneymoonStore: () => import("@/stores/honeymoon-store"),
    useMarketplaceStore: () => import("@/stores/marketplace-store"),
    useMatchingStore: () => import("@/stores/matching-store"),
    useMentoringStore: () => import("@/stores/mentoring-store"),
    useOneLookStore: () => import("@/stores/one-look-store"),
    usePartnershipsStore: () => import("@/stores/partnerships-store"),
    usePerformancesStore: () => import("@/stores/performances-store"),
    usePostWeddingStore: () => import("@/stores/post-wedding-store"),
    useRealNumbersStore: () => import("@/stores/real-numbers-store"),
    useRecommendationsStore: () => import("@/stores/recommendations-store"),
    useRouletteStore: () => import("@/stores/roulette-store"),
    useSeatingDragStore: () => import("@/stores/seating-drag-store"),
    useShowcasesStore: () => import("@/stores/showcases-store"),
    useStationeryStore: () => import("@/stores/stationery-store"),
    useTravelStore: () => import("@/stores/travel-store"),
    useUserDesignsStore: () => import("@/stores/user-designs-store"),
    useVendorNeedsStore: () => import("@/stores/vendor-needs-store"),
    useVendorPackagesStore: () => import("@/stores/vendor-packages-store"),
    useVendorReviewsStore: () => import("@/stores/vendor-reviews-store"),
    useWelcomeEventsStore: () => import("@/stores/welcome-events-store"),
    useFilesStore: () => import("@/stores/files-store"),
  };

  // Load all blob stores concurrently.
  // Each store writes { couple_id, data: entireState } on change.
  // On load, we call zustandStore.setState(blob) to merge the blob into state.
  await Promise.allSettled(
    blobStores.map(async ([table, storeName]) => {
      const blob = await dbLoadData<Record<string, unknown>>(table, coupleId);
      if (!blob) return;
      const mod = await storeImports[storeName]?.();
      if (!mod) return;
      const zustandStore = mod[storeName] as
        | { setState: (s: Record<string, unknown>, replace?: boolean) => void }
        | undefined;
      // Merge (not replace) — preserve methods and seed defaults for keys not in DB
      zustandStore?.setState(blob, false);
    }),
  );

  // ── Stores with named-column patterns (handled individually) ─────────────
  await Promise.allSettled([
    loadEventsState(coupleId),
    loadVenueState(coupleId),
    loadAestheticState(coupleId),
    loadWorkspaceState(coupleId),
    loadDecorState(coupleId),
    loadMehndiState(coupleId),
    loadSangeetState(coupleId),
    loadVisionState(coupleId),
    loadHmuaState(coupleId),
    loadPanditState(coupleId),
    loadPhotographyState(coupleId),
    loadVideographyState(coupleId),
    loadCakeSweetsState(coupleId),
    loadBachelorState(coupleId),
    loadBacheloretteState(coupleId),
    loadContractChecklistState(coupleId),
    loadMusicScheduleState(coupleId),
    loadMusicSoundscapeState(coupleId),
    loadMusicTechState(coupleId),
    loadRsvpState(coupleId),
    loadSeatingState(coupleId),
    loadConfessionalState(coupleId),
    loadBridalShowerState(coupleId),
  ]);
}

async function loadEventsState(_coupleId: string) {
  const { loadEventsFromDB } = await import("@/stores/events-store");
  await loadEventsFromDB();
}

async function loadVenueState(_coupleId: string) {
  const { loadVenueFromDB } = await import("@/stores/venue-store");
  await loadVenueFromDB();
}

async function loadAestheticState(_coupleId: string) {
  const { loadAestheticFromDB } = await import("@/stores/aesthetic-store");
  await loadAestheticFromDB();
}

async function loadWorkspaceState(coupleId: string) {
  const row = await dbLoadRow<{
    categories: unknown; items: unknown; decisions: unknown; notes: unknown;
    moodboard: unknown; coverage: unknown; contracts: unknown; vendor_order: unknown;
  }>("workspace_state", coupleId);
  if (!row) return;
  const { useWorkspaceStore } = await import("@/stores/workspace-store");
  useWorkspaceStore.setState((s) => ({
    categories: (row.categories as never) ?? s.categories,
    items: (row.items as never) ?? s.items,
    decisions: (row.decisions as never) ?? s.decisions,
    notes: (row.notes as never) ?? s.notes,
    moodboard: (row.moodboard as never) ?? s.moodboard,
    coverage: (row.coverage as never) ?? s.coverage,
    contracts: (row.contracts as never) ?? s.contracts,
    vendorOrder: (row.vendor_order as never) ?? s.vendorOrder,
  }));
}

async function loadDecorState(coupleId: string) {
  const row = await dbLoadRow<{
    brief: unknown; style_keywords: unknown; moodboard_pins: unknown;
    event_palettes: unknown; space_dreams: unknown; floral_by_event: unknown;
    lighting_moods: unknown;
  }>("decor_state", coupleId);
  if (!row) return;
  const { useDecorStore } = await import("@/stores/decor-store");
  useDecorStore.setState((s) => ({
    brief: (row.brief as never) ?? s.brief,
    style_keywords: (row.style_keywords as never) ?? s.style_keywords,
    moodboard_pins: (row.moodboard_pins as never) ?? s.moodboard_pins,
    event_palettes: (row.event_palettes as never) ?? s.event_palettes,
    space_dreams: (row.space_dreams as never) ?? s.space_dreams,
    floral_by_event: (row.floral_by_event as never) ?? s.floral_by_event,
    lighting_moods: (row.lighting_moods as never) ?? s.lighting_moods,
  }));
}

async function loadMehndiState(coupleId: string) {
  const row = await dbLoadRow<Record<string, unknown>>("mehndi_state", coupleId);
  if (!row) return;
  const { useMehndiStore } = await import("@/stores/mehndi-store");
  useMehndiStore.setState((s) => ({
    briefs: (row.briefs as never) ?? s.briefs,
    references: (row.ref_images as never) ?? s.references,
    stylePrefs: (row.style_prefs as never) ?? s.stylePrefs,
    personalTouchImages: (row.personal_touch_images as never) ?? s.personalTouchImages,
    guestSlots: (row.guest_slots as never) ?? s.guestSlots,
    vipGuests: (row.vip_guests as never) ?? s.vipGuests,
    detailedTierGuests: (row.detailed_tier_guests as never) ?? s.detailedTierGuests,
    setups: (row.setups as never) ?? s.setups,
    scheduleItems: (row.schedule_items as never) ?? s.scheduleItems,
    brideCare: (row.bride_care as never) ?? s.brideCare,
    logisticsChecks: (row.logistics_checks as never) ?? s.logisticsChecks,
    contractChecklist: (row.contract_checklist as never) ?? s.contractChecklist,
    documents: (row.documents as never) ?? s.documents,
  }));
}

async function loadSangeetState(coupleId: string) {
  const row = await dbLoadRow<{ acts: unknown }>("sangeet_state", coupleId);
  if (!row) return;
  const { useSangeetStore } = await import("@/stores/sangeet-store");
  useSangeetStore.setState((s) => ({
    acts: (row.acts as never) ?? s.acts,
  }));
}

async function loadVisionState(coupleId: string) {
  const row = await dbLoadRow<{
    style_keywords: unknown; alignment: unknown; sections: unknown;
    moodboard_section_map: unknown; shot_list: unknown;
  }>("vision_state", coupleId);
  if (!row) return;
  const { useVisionStore } = await import("@/stores/vision-store");
  useVisionStore.setState((s) => ({
    style_keywords: (row.style_keywords as never) ?? s.style_keywords,
    alignment: (row.alignment as never) ?? s.alignment,
    sections: (row.sections as never) ?? s.sections,
    moodboard_section_map: (row.moodboard_section_map as never) ?? s.moodboard_section_map,
    shot_list: (row.shot_list as never) ?? s.shot_list,
  }));
}

async function loadHmuaState(coupleId: string) {
  const row = await dbLoadRow<{ profiles: unknown; schedules: unknown; touch_ups: unknown; ai: unknown }>(
    "hmua_state", coupleId,
  );
  if (!row) return;
  const { useHmuaStore } = await import("@/stores/hmua-store");
  useHmuaStore.setState((s) => ({
    profiles: (row.profiles as never) ?? s.profiles,
    schedules: (row.schedules as never) ?? s.schedules,
    touchUps: (row.touch_ups as never) ?? s.touchUps,
    ai: (row.ai as never) ?? s.ai,
  }));
}

async function loadPanditState(coupleId: string) {
  const row = await dbLoadRow<{
    brief: unknown; rituals: unknown; additions: unknown; roles: unknown;
    samagri: unknown; logistics: unknown; saptapadi_vows: unknown;
  }>("pandit_state", coupleId);
  if (!row) return;
  const { usePanditStore } = await import("@/stores/pandit-store");
  usePanditStore.setState((s) => ({
    brief: (row.brief as never) ?? s.brief,
    rituals: (row.rituals as never) ?? s.rituals,
    additions: (row.additions as never) ?? s.additions,
    roles: (row.roles as never) ?? s.roles,
    samagri: (row.samagri as never) ?? s.samagri,
    logistics: (row.logistics as never) ?? s.logistics,
    saptapadi_vows: (row.saptapadi_vows as never) ?? s.saptapadi_vows,
  }));
}

async function loadPhotographyState(coupleId: string) {
  const row = await dbLoadRow<{
    shots: unknown; vips: unknown; group_shots: unknown; rituals: unknown;
    day_of: unknown; crew: unknown; deliverables: unknown;
    dismissed_suggestions: unknown; custom_events: unknown;
  }>("photography_state", coupleId);
  if (!row) return;
  const { usePhotographyStore } = await import("@/stores/photography-store");
  usePhotographyStore.setState((s) => ({
    shots: (row.shots as never) ?? s.shots,
    vips: (row.vips as never) ?? s.vips,
    groupShots: (row.group_shots as never) ?? s.groupShots,
    rituals: (row.rituals as never) ?? s.rituals,
    day_of: (row.day_of as never) ?? s.day_of,
    crew: (row.crew as never) ?? s.crew,
    deliverables: (row.deliverables as never) ?? s.deliverables,
    dismissedSuggestions: (row.dismissed_suggestions as never) ?? s.dismissedSuggestions,
    customEvents: (row.custom_events as never) ?? s.customEvents,
  }));
}

async function loadVideographyState(coupleId: string) {
  const row = await dbLoadRow<{
    reference_films: unknown; film_brief: unknown; event_arcs: unknown;
    interviews: unknown; mic_assignments: unknown; coverage: unknown;
    camera_positions: unknown; coordination: unknown; deliverables: unknown; day_of: unknown;
  }>("videography_state", coupleId);
  if (!row) return;
  const { useVideographyStore } = await import("@/stores/videography-store");
  useVideographyStore.setState((s) => ({
    reference_films: (row.reference_films as never) ?? s.reference_films,
    film_brief: (row.film_brief as never) ?? s.film_brief,
    event_arcs: (row.event_arcs as never) ?? s.event_arcs,
    interviews: (row.interviews as never) ?? s.interviews,
    mic_assignments: (row.mic_assignments as never) ?? s.mic_assignments,
    coverage: (row.coverage as never) ?? s.coverage,
    camera_positions: (row.camera_positions as never) ?? s.camera_positions,
    coordination: (row.coordination as never) ?? s.coordination,
    deliverables: (row.deliverables as never) ?? s.deliverables,
    day_of: (row.day_of as never) ?? s.day_of,
  }));
}

async function loadCakeSweetsState(coupleId: string) {
  const row = await dbLoadRow<{
    flavor: unknown; allergens: unknown; cake_inspirations: unknown;
    dessert_catalog: unknown; dessert_meta: unknown; table_config: unknown;
    cutting_song: unknown; tasting_sessions: unknown;
  }>("cake_sweets_state", coupleId);
  if (!row) return;
  const { useCakeSweetsStore } = await import("@/stores/cake-sweets-store");
  useCakeSweetsStore.setState((s) => ({
    flavor: (row.flavor as never) ?? s.flavor,
    allergens: (row.allergens as never) ?? s.allergens,
    cake_inspirations: (row.cake_inspirations as never) ?? s.cake_inspirations,
    dessert_catalog: (row.dessert_catalog as never) ?? s.dessert_catalog,
    dessert_meta: (row.dessert_meta as never) ?? s.dessert_meta,
    table_config: (row.table_config as never) ?? s.table_config,
    cutting_song: (row.cutting_song as never) ?? s.cutting_song,
    tasting_sessions: (row.tasting_sessions as never) ?? s.tasting_sessions,
  }));
}

async function loadBachelorState(coupleId: string) {
  const row = await dbLoadRow<{
    basics: unknown; vibe: unknown; guests: unknown;
    budget: unknown; documents: unknown;
    rooms: unknown; expenses: unknown; vibe_profile: unknown;
  }>("bachelor_state", coupleId);
  if (!row) return;
  const { useBachelorStore } = await import("@/stores/bachelor-store");
  useBachelorStore.setState((s) => ({
    basics: (row.basics as never) ?? s.basics,
    vibe: (row.vibe as never) ?? s.vibe,
    guests: (row.guests as never) ?? s.guests,
    budget: (row.budget as never) ?? s.budget,
    documents: (row.documents as never) ?? s.documents,
    rooms: (row.rooms as never) ?? s.rooms,
    expenses: (row.expenses as never) ?? s.expenses,
    vibeProfile: (row.vibe_profile as never) ?? s.vibeProfile,
  }));
}

async function loadBacheloretteState(coupleId: string) {
  const row = await dbLoadRow<{
    basics: unknown; vibe: unknown; guests: unknown;
    budget: unknown; documents: unknown;
    rooms: unknown; expenses: unknown; vibe_profile: unknown;
  }>("bachelorette_state", coupleId);
  if (!row) return;
  const { useBacheloretteStore } = await import("@/stores/bachelorette-store");
  useBacheloretteStore.setState((s) => ({
    basics: (row.basics as never) ?? s.basics,
    vibe: (row.vibe as never) ?? s.vibe,
    guests: (row.guests as never) ?? s.guests,
    budget: (row.budget as never) ?? s.budget,
    documents: (row.documents as never) ?? s.documents,
    rooms: (row.rooms as never) ?? s.rooms,
    expenses: (row.expenses as never) ?? s.expenses,
    vibeProfile: (row.vibe_profile as never) ?? s.vibeProfile,
  }));
}

async function loadContractChecklistState(coupleId: string) {
  const row = await dbLoadRow<{ rows: unknown }>("contract_checklist_state", coupleId);
  if (!row) return;
  const { useContractChecklistStore } = await import("@/stores/contract-checklist-store");
  useContractChecklistStore.setState((s) => ({
    rows: (row.rows as never) ?? s.rows,
  }));
}

async function loadMusicScheduleState(coupleId: string) {
  const row = await dbLoadRow<{ slots: unknown }>("music_schedule_state", coupleId);
  if (!row) return;
  const { useMusicScheduleStore } = await import("@/stores/music-schedule-store");
  useMusicScheduleStore.setState((s) => ({
    slots: (row.slots as never) ?? s.slots,
  }));
}

async function loadMusicSoundscapeState(coupleId: string) {
  const row = await dbLoadRow<{ soundscapes: unknown }>("music_soundscape_state", coupleId);
  if (!row) return;
  const { useMusicSoundscapeStore } = await import("@/stores/music-soundscape-store");
  useMusicSoundscapeStore.setState((s) => ({
    soundscapes: (row.soundscapes as never) ?? s.soundscapes,
  }));
}

async function loadMusicTechState(coupleId: string) {
  const row = await dbLoadRow<{ specs: unknown }>("music_tech_state", coupleId);
  if (!row) return;
  const { useMusicTechStore } = await import("@/stores/music-tech-store");
  useMusicTechStore.setState((s) => ({
    specs: (row.specs as never) ?? s.specs,
  }));
}

async function loadRsvpState(coupleId: string) {
  const { dbLoadAll } = await import("@/lib/supabase/db-sync");
  const { useRsvpStore } = await import("@/stores/rsvp-store");

  const [events, households, guests] = await Promise.all([
    dbLoadAll("rsvp_events", coupleId),
    dbLoadAll("rsvp_households", coupleId),
    dbLoadAll("rsvp_guests", coupleId),
  ]);
  if (!events.length && !households.length && !guests.length) return;

  const rsvpRows = await dbLoadAll("rsvp_statuses", coupleId);
  const rsvps: Record<string, string> = {};
  for (const r of rsvpRows) {
    rsvps[`${r.guest_id}|${r.event_id}`] = r.status as string;
  }
  useRsvpStore.setState((s) => ({
    events: events.length ? (events as never) : s.events,
    households: households.length ? (households as never) : s.households,
    guests: guests.length ? (guests as never) : s.guests,
    rsvps: Object.keys(rsvps).length ? (rsvps as never) : s.rsvps,
  }));
}

async function loadSeatingState(_coupleId: string) {
  const { loadSeatingFromDB } = await import("@/stores/seating-store");
  await loadSeatingFromDB();
}

async function loadConfessionalState(coupleId: string) {
  const row = await dbLoadRow<{ posts: unknown; replies: unknown; votes: unknown; saves: unknown; reports: unknown }>(
    "confessional_posts", coupleId,
  );
  if (!row) return;
  const { useConfessionalStore } = await import("@/stores/confessional-store");
  useConfessionalStore.setState((s) => ({
    posts: (row.posts as never) ?? s.posts,
    replies: (row.replies as never) ?? s.replies,
    votes: (row.votes as never) ?? s.votes,
    saves: (row.saves as never) ?? s.saves,
    reports: (row.reports as never) ?? s.reports,
  }));
}

async function loadBridalShowerState(coupleId: string) {
  const row = await dbLoadRow<{
    bride_name: unknown; brief: unknown; preferences: unknown; guests: unknown;
    budget: unknown; checklist: unknown;
  }>("bridal_shower_state", coupleId);
  if (!row) return;
  const { useBridalShowerStore } = await import("@/stores/bridal-shower-store");
  useBridalShowerStore.setState((s) => ({
    brideName: (row.bride_name as never) ?? s.brideName,
    brief: (row.brief as never) ?? s.brief,
    preferences: (row.preferences as never) ?? s.preferences,
    guests: (row.guests as never) ?? s.guests,
    budget: (row.budget as never) ?? s.budget,
    checklist: (row.checklist as never) ?? s.checklist,
  }));
}
