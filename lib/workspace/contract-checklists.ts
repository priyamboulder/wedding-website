// ── Contract checklists by workspace slug ─────────────────────────────────
// One checklist per vendor-contract category. Items follow the Mehendi
// pattern (label + hint in planner voice) so the shared ContractChecklistBlock
// can render them uniformly. Extend here as more modules adopt the pattern.
//
// The slug keys match WorkspaceCategory.slug and CategoryShortlistContractTab's
// category prop. Photography has its own bespoke contract editor so it is
// included here as a lightweight supplement; the main editor still lives
// inside the photography workspace.

export interface ContractChecklistTemplateItem {
  id: string;
  label: string;
  hint: string;
}

export const CONTRACT_CHECKLISTS: Record<string, ContractChecklistTemplateItem[]> = {
  // ── Photography ────────────────────────────────────────────────────────
  photography: [
    {
      id: "photographers_hours",
      label: "Number of photographers and hours confirmed",
      hint: "Bride-side plus groom-side coverage, getting-ready through send-off.",
    },
    {
      id: "events_covered",
      label: "Events / ceremonies covered (list which ones)",
      hint: "Spell out mehendi, sangeet, pheras, reception — and which are half vs full day.",
    },
    {
      id: "second_shooter",
      label: "Second shooter or assistant included?",
      hint: "Essential for parallel bride/groom prep and large family photos.",
    },
    {
      id: "editing_turnaround",
      label: "Editing style and turnaround time agreed",
      hint: "Confirm sneak peeks in a week, full gallery in 8–12 weeks.",
    },
    {
      id: "deliverables",
      label: "Number of edited photos / delivery format",
      hint: "Digital gallery, print release, physical album — nail the count and format.",
    },
    {
      id: "pre_wedding",
      label: "Pre-wedding shoot included?",
      hint: "Engagement / save-the-date shoot — separate trip or bundled session?",
    },
    {
      id: "travel_accommodation",
      label: "Travel and accommodation (for destination weddings)",
      hint: "Travel days, flight class, lodging tier, per-diem.",
    },
  ],

  // ── Videography ────────────────────────────────────────────────────────
  videography: [
    {
      id: "videographers_hours",
      label: "Number of videographers and hours confirmed",
      hint: "Solo vs two-camera coverage changes the edit dramatically.",
    },
    {
      id: "deliverables_defined",
      label: "Deliverables defined (highlight reel length, full ceremony, raw footage)",
      hint: "3-min teaser, 8-min highlight, full-length pheras — specify each runtime.",
    },
    {
      id: "drone_included",
      label: "Drone footage included?",
      hint: "Venue permits and operator certification if yes.",
    },
    {
      id: "editing_turnaround",
      label: "Editing style and turnaround time agreed",
      hint: "Reference reels you love. Confirm teaser within a month, film by month 4.",
    },
    {
      id: "music_licensing",
      label: "Music licensing approach",
      hint: "Artlist / Musicbed / licensed tracks. Avoid copyright strikes on shareable reels.",
    },
    {
      id: "travel_accommodation",
      label: "Travel and accommodation (for destination weddings)",
      hint: "Equipment baggage, travel days, lodging.",
    },
  ],

  // ── Décor & Florals ────────────────────────────────────────────────────
  decor_florals: [
    {
      id: "events_setup_teardown",
      label: "Events covered and setup/teardown times",
      hint: "Confirm call time 4+ hours before guests, teardown window same night.",
    },
    {
      id: "floral_substitution",
      label: "Floral varieties and substitution policy",
      hint: "Seasonal availability — what's the fallback if peonies are out?",
    },
    {
      id: "rentals_scope",
      label: "Rentals included vs. separate vendor",
      hint: "Lounge furniture, mandap, drapery, uplights — who owns each line item?",
    },
    {
      id: "setup_timeline",
      label: "Setup crew and timeline confirmed",
      hint: "Lead installer, crew size, arrival time, and venue access window.",
    },
    {
      id: "cleanup_responsibility",
      label: "Breakdown and cleanup responsibility",
      hint: "Who pulls florals, who hauls rentals, who sweeps the venue?",
    },
    {
      id: "damage_liability",
      label: "Damage / loss liability",
      hint: "Rental insurance, replacement cost schedule, deposit return terms.",
    },
  ],

  // ── Catering ───────────────────────────────────────────────────────────
  catering: [
    {
      id: "menu_finalized",
      label: "Menu finalized with tastings complete",
      hint: "All courses, passed apps, late-night snacks — signed off after tasting.",
    },
    {
      id: "headcount_pricing",
      label: "Headcount and per-plate pricing locked",
      hint: "Confirm final headcount date and overage rate.",
    },
    {
      id: "dietary",
      label: "Dietary accommodations confirmed",
      hint: "Jain, vegan, nut-free, gluten-free — written into the quote, not just verbal.",
    },
    {
      id: "service_style",
      label: "Service style (plated, buffet, family-style)",
      hint: "Per course if different — cocktail hour vs dinner flow.",
    },
    {
      id: "bar_package",
      label: "Bar / beverage package details",
      hint: "Open bar, signature cocktails, corkage, shots policy.",
    },
    {
      id: "staffing_overtime",
      label: "Staffing levels and overtime policy",
      hint: "1 server per 10 guests is the industry norm. Overtime hourly rate in writing.",
    },
    {
      id: "cake_cutting",
      label: "Cake cutting / dessert service included?",
      hint: "Slicing fee, plating, and mithai passing — often a separate line.",
    },
  ],

  // ── Music & Entertainment ──────────────────────────────────────────────
  entertainment: [
    {
      id: "performance_duration",
      label: "Performance duration and breaks",
      hint: "Live set length, break schedule, DJ coverage during live breaks.",
    },
    {
      id: "equipment_sound",
      label: "Equipment and sound system provided?",
      hint: "Mics, monitors, speakers, DJ booth, lighting rig — who provides each?",
    },
    {
      id: "song_list",
      label: "Song list / do-not-play list submitted",
      hint: "First dance, parent dances, ethnic must-plays — and the list of songs to avoid.",
    },
    {
      id: "mc_duties",
      label: "MC duties included?",
      hint: "Announcements, entrance cues, coordinating cake cutting and dances.",
    },
    {
      id: "setup_soundcheck",
      label: "Setup and sound check timing",
      hint: "Confirm they're set up and silent 30 min before guests arrive.",
    },
    {
      id: "overtime_rate",
      label: "Overtime rate",
      hint: "Per hour, per musician. Know the cap before the party runs hot.",
    },
  ],

  // ── Hair & Makeup ──────────────────────────────────────────────────────
  hmua: [
    {
      id: "artists_trials",
      label: "Number of artists and trials completed",
      hint: "At least one trial for the bride, ideally one per event look.",
    },
    {
      id: "services_per_person",
      label: "Services per person (bride, bridesmaids, mothers)",
      hint: "Confirm who gets full glam vs touch-up, and how many looks per person.",
    },
    {
      id: "products_used",
      label: "Products used (brand preferences, allergies)",
      hint: "Airbrush vs HD, long-wear foundations, lash brand, any allergies noted.",
    },
    {
      id: "timeline_location",
      label: "Timeline and getting-ready location",
      hint: "Suite access, arrival time, last-face-done buffer before photos.",
    },
    {
      id: "touch_up_availability",
      label: "Touch-up availability during events",
      hint: "On-call artist for outfit change, post-ceremony refresh — hourly rate in writing.",
    },
    {
      id: "travel_fees",
      label: "Travel fees",
      hint: "Per-event travel, early-call premium, destination accommodation.",
    },
  ],

  // ── Venue ──────────────────────────────────────────────────────────────
  venue: [
    {
      id: "booking_deposit",
      label: "Venue hold / booking deposit and payment schedule",
      hint: "Confirm hold period, non-refundable portion, and milestone payments.",
    },
    {
      id: "capacity_events",
      label: "Capacity confirmed for each event",
      hint: "Ceremony seated, reception dancing — capacity differs by layout.",
    },
    {
      id: "vendor_restrictions",
      label: "Exclusive vendor requirements / restrictions",
      hint: "In-house catering? Approved florists list? Outside DJ penalty?",
    },
    {
      id: "noise_curfew",
      label: "Noise curfew and overtime policy",
      hint: "Music cutoff time, overtime hourly, residential noise ordinances.",
    },
    {
      id: "rain_plan",
      label: "Rain plan / backup space",
      hint: "Indoor alternative, tent rental window, decision deadline day-of.",
    },
    {
      id: "insurance",
      label: "Insurance requirements",
      hint: "Event liability policy, liquor liability, additional-insured rider.",
    },
    {
      id: "parking_transport",
      label: "Parking and guest transportation",
      hint: "Valet count, shuttle staging, accessible drop-off path.",
    },
  ],

  // ── Priest / Pandit ────────────────────────────────────────────────────
  pandit_ceremony: [
    {
      id: "ceremony_rituals",
      label: "Ceremony type and rituals confirmed",
      hint: "Which rituals are included — pheras, kanyadaan, hasta milap, etc.",
    },
    {
      id: "duration_timing",
      label: "Duration and timing",
      hint: "Total runtime, start window, muhurat alignment.",
    },
    {
      id: "materials_samagri",
      label: "Materials / samagri — who provides?",
      hint: "Who brings rice, ghee, kalash, supari, mala — and who sets the altar?",
    },
    {
      id: "rehearsal_walkthrough",
      label: "Rehearsal or walkthrough scheduled?",
      hint: "Even a 20-minute call covering pronouns and entrances saves a lot day-of.",
    },
    {
      id: "amplification",
      label: "Amplification / mic requirements",
      hint: "Lavalier for the priest, speaker coverage for guests beyond the first row.",
    },
    {
      id: "dakshina",
      label: "Dakshina / honorarium terms",
      hint: "Standard fee, envelope at end, any gift conventions for the priest's family.",
    },
    {
      id: "travel_stay",
      label: "Travel and accommodation",
      hint: "If traveling, confirm flight, lodging, and rest time before the ceremony.",
    },
  ],

  // ── Stationery & Invitations ───────────────────────────────────────────
  stationery: [
    {
      id: "design_proofs",
      label: "Design proofs approved",
      hint: "Print proof sign-off — font, color, spelling of all names.",
    },
    {
      id: "quantity_overage",
      label: "Quantity and overage count",
      hint: "Standard: order 15% over guest count for reprints and keepsakes.",
    },
    {
      id: "print_shipping",
      label: "Print timeline and shipping method",
      hint: "Letterpress runs 4–6 weeks. Confirm production and delivery dates.",
    },
    {
      id: "envelope_addressing",
      label: "Envelope addressing included?",
      hint: "Calligraphy, digital addressing, return addressing — per-envelope costs add up.",
    },
    {
      id: "rsvp_tracking",
      label: "RSVP tracking method",
      hint: "Wedding website, phone-in, mailed cards — and who checks responses.",
    },
    {
      id: "day_of_stationery",
      label: "Day-of stationery (programs, menus, place cards)",
      hint: "Separate print run — nail quantities and delivery window.",
    },
  ],

  // ── Cake & Sweets ──────────────────────────────────────────────────────
  cake_sweets: [
    {
      id: "flavors_tasting",
      label: "Flavors and tiers finalized with tasting complete",
      hint: "Tasting signed off. Confirm fillings, frosting, tier count.",
    },
    {
      id: "design_decoration",
      label: "Design / decoration confirmed",
      hint: "Reference image signed off, sugar florals, topper, cultural motifs.",
    },
    {
      id: "delivery_setup",
      label: "Delivery and setup logistics",
      hint: "Delivery window, assembly on-site, temperature control.",
    },
    {
      id: "serving_portions",
      label: "Serving portions matched to headcount",
      hint: "Wedding slice vs party slice — ask your baker's per-tier yield.",
    },
    {
      id: "display_equipment",
      label: "Display equipment (stand, table, knife)",
      hint: "Who provides the stand, cutting knife, and cake table setup?",
    },
    {
      id: "dietary_options",
      label: "Dietary options (eggless, gluten-free)",
      hint: "Eggless is standard for Indian weddings — confirm in writing.",
    },
  ],

  // ── Wardrobe & Styling ─────────────────────────────────────────────────
  wardrobe: [
    {
      id: "fitting_schedule",
      label: "Fitting schedule and alterations timeline",
      hint: "First fitting 3 months out, final fitting 2 weeks before — lock the dates.",
    },
    {
      id: "rental_purchase",
      label: "Rental vs. purchase terms",
      hint: "For rentals, confirm rental period, damage deposit, cleaning liability.",
    },
    {
      id: "delivery_pickup",
      label: "Delivery / pickup logistics",
      hint: "Delivery day, inspection window, return deadline post-wedding.",
    },
    {
      id: "steaming_pressing",
      label: "Steaming / pressing day-of",
      hint: "Who steams the lehenga and dupatta at the venue?",
    },
    {
      id: "return_damage",
      label: "Return policy and damage liability",
      hint: "Alteration allowance, stain policy, damage fee schedule.",
    },
  ],

  // ── Jewelry ────────────────────────────────────────────────────────────
  jewelry: [
    {
      id: "design_milestones",
      label: "Custom design timeline and approval milestones",
      hint: "CAD, wax model, first casting — sign-off dates for each stage.",
    },
    {
      id: "insurance_appraisal",
      label: "Insurance and appraisal",
      hint: "Written appraisal, rider on homeowner's policy, travel coverage.",
    },
    {
      id: "return_exchange",
      label: "Return / exchange policy",
      hint: "For ready pieces — size adjustment window, exchange terms.",
    },
    {
      id: "delivery_date",
      label: "Delivery date relative to wedding",
      hint: "Confirm delivery at least 2 weeks before for fit-check and cleaning.",
    },
    {
      id: "cleaning_maintenance",
      label: "Cleaning and maintenance terms",
      hint: "Complimentary cleaning window, resizing terms, re-plating schedule.",
    },
  ],
};

export function contractChecklistFor(slug: string): ContractChecklistTemplateItem[] {
  return CONTRACT_CHECKLISTS[slug] ?? [];
}
