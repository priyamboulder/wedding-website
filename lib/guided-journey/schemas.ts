// Per-category schemas. Each entry declares the sessions for a category
// and the fields rendered inside each session. The renderer in
// components/workspace/shared/guided-journey turns these into UI.

import type { CategorySchema, CategoryKey } from "./types";

const STANDARD_EVENTS = [
  { event_name: "Haldi" },
  { event_name: "Mehendi" },
  { event_name: "Sangeet" },
  { event_name: "Wedding Ceremony" },
  { event_name: "Reception" },
];

export const CATEGORY_SCHEMAS: Record<CategoryKey, CategorySchema> = {
  // Photography stays in its bespoke component; left here as a stub so the
  // Photography canvas could opt in later if the team wants to converge.
  photography: {
    category: "photography",
    sessions: [],
  },

  // ── Videography (5 sessions) ─────────────────────────────────────────
  // Reconciled with the full workspace: every guided field exists in
  // VideographyCreativeCanvas.tsx, and vice versa. Both modes read/write
  // the same form_data bags keyed by session_key.
  videography: {
    category: "videography",
    sessions: [
      {
        key: "film_style",
        index: 1,
        fields: [
          {
            kind: "keyword_chips",
            path: "style_keywords",
            label: "Pick the words that fit the film you imagine",
            helper: "Tap as many as feel right.",
            allowCustom: true,
            suggestions: [
              "cinematic",
              "lush",
              "balanced",
              "intimate",
              "joyful",
              "documentary",
              "editorial",
              "moody",
              "warm",
              "rhythmic",
              "golden-hour",
              "unposed",
              "celebratory",
              "sweeping",
            ],
          },
          {
            kind: "intensity_slider",
            path: "film_tone_score",
            label: "Film tone",
            helper: "Slide between raw documentary and highly produced cinema.",
            lowLabel: "Raw & documentary",
            highLabel: "Highly cinematic",
            toneWords: ["Warm Documentary", "Editorial Cinematic", "Highly Produced"],
            default: 50,
          },
          {
            kind: "multi_select",
            path: "film_formats",
            label: "Film length & format",
            helper:
              "Pick every format you want — a film can be more than one.",
            options: [
              { value: "highlight_reel", label: "Highlight Reel — 1–3 min" },
              { value: "short_film", label: "Short Film — 5–8 min" },
              { value: "feature_film", label: "Feature Film — 15–25 min" },
              { value: "full_documentary", label: "Full Documentary" },
            ],
          },
          {
            kind: "textarea",
            path: "format_custom_notes",
            label: "Custom requests or notes",
            placeholder:
              "e.g., a short film for each event, a vertical cut for social, or a length that doesn't match the options above.",
            rows: 2,
          },
        ],
      },
      {
        key: "film_references",
        index: 2,
        fields: [
          {
            kind: "image_list",
            path: "reference_films",
            label: "Films that have stuck with you",
            helper:
              "Paste YouTube/Vimeo/Instagram links, with a note on what's working.",
            tagOptions: ["style", "music", "pacing", "audio", "color"],
          },
          {
            kind: "list_object",
            path: "curated_film_reactions",
            label: "React to curated films",
            helper:
              "We've collected a handful of wedding films — react to the ones that move you.",
            titleField: "film_id",
            itemFields: [
              { kind: "text", path: "film_id", label: "Film" },
              {
                kind: "keyword_chips",
                path: "reactions",
                label: "What you love",
                suggestions: [
                  "love_style",
                  "love_music",
                  "love_pacing",
                  "love_audio",
                  "love_color",
                ],
              },
              {
                kind: "boolean",
                path: "saved",
                label: "Save to references",
              },
              {
                kind: "textarea",
                path: "note",
                label: "Notes",
                rows: 2,
              },
            ],
          },
        ],
      },
      {
        key: "moments_and_story",
        index: 3,
        fields: [
          {
            kind: "list_text",
            path: "must_capture_moments",
            label: "Moments your videographer can't miss",
            helper:
              "Big arrivals, first looks, the pheras — the beats your film must include.",
            placeholder: "Baraat entrance, garlands exchange…",
            priorityToggle: true,
          },
          {
            kind: "list_text",
            path: "audio_capture_list",
            label: "Words worth capturing",
            helper:
              "The speeches, vows, and quiet words your film needs.",
            placeholder: "Dad's speech at sangeet, dhol during baraat…",
          },
          {
            kind: "list_text",
            path: "do_not_include",
            label: "What to avoid",
            placeholder: "No drone shots, don't film Uncle Raj…",
          },
          {
            kind: "textarea",
            path: "story_mockup.how_did_you_meet",
            label: "How did you meet?",
            placeholder: "A sentence or two is enough.",
            rows: 2,
          },
          {
            kind: "textarea",
            path: "story_mockup.moment_you_knew",
            label: "What's the moment you knew?",
            placeholder: "A sentence or two is enough.",
            rows: 2,
          },
          {
            kind: "textarea",
            path: "story_mockup.what_wedding_means",
            label: "What does this wedding mean to your families?",
            placeholder: "A sentence or two is enough.",
            rows: 2,
          },
          {
            kind: "textarea",
            path: "story_mockup.how_film_should_end",
            label: "How do you want the film to end?",
            placeholder: "A sentence or two is enough.",
            rows: 2,
          },
        ],
      },
      {
        key: "sound_and_voice",
        index: 4,
        fields: [
          {
            kind: "single_select",
            path: "audio_priority",
            label: "How should sound carry your film?",
            helper:
              "One signal your videographer uses to weigh score against natural audio.",
            options: [
              {
                value: "music_driven",
                label: "Music-driven — the soundtrack is the spine",
              },
              {
                value: "vows_speeches_first",
                label: "Vows & speeches first — every word matters",
              },
              {
                value: "balanced",
                label: "Balanced — weave both together",
              },
            ],
          },
          {
            kind: "single_select",
            path: "voiceover_style",
            label: "Voiceover & narration",
            options: [
              { value: "none", label: "No voiceover" },
              { value: "personal_vows", label: "Personal vows as voiceover" },
              { value: "custom_narration", label: "Custom narration" },
              {
                value: "letter_to_each_other",
                label: "Letter to each other",
              },
            ],
          },
          {
            kind: "textarea",
            path: "voiceover_notes",
            label: "Voiceover notes",
            helper:
              "If you picked custom narration or a letter, what should it say?",
            rows: 4,
          },
          {
            kind: "list_object",
            path: "per_event_music",
            label: "Music direction per event",
            titleField: "event_name",
            presetRows: STANDARD_EVENTS,
            itemFields: [
              { kind: "text", path: "event_name", label: "Event" },
              {
                kind: "keyword_chips",
                path: "mood_tags",
                label: "Mood",
                suggestions: [
                  "intimate_acoustic",
                  "bollywood_high_energy",
                  "classical_traditional",
                  "modern_cinematic",
                  "fusion",
                ],
              },
              {
                kind: "textarea",
                path: "specific_songs_notes",
                label: "Specific songs / vibe",
                rows: 2,
              },
            ],
          },
          {
            kind: "list_text",
            path: "saved_music_samples",
            label: "Saved samples",
            helper:
              "Music sampler clips you've hearted — your videographer will match the energy.",
            placeholder: "Sample title or ID…",
          },
        ],
      },
      {
        key: "film_brief",
        index: 5,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your film brief",
            helper:
              "We'll draft it from your earlier answers — read it back and refine.",
            draftCues: [
              "film_style.style_keywords",
              "film_style.film_formats",
              "moments_and_story.must_capture_moments",
              "sound_and_voice.audio_priority",
            ],
          },
        ],
      },
    ],
  },

  // ── Catering (6 sessions) ────────────────────────────────────────────
  // Reconciled with the full workspace (6 tabs): every couple-input field on
  // Tab 1 (Taste & Vision) has a guided-session counterpart and vice versa.
  // Operational sections — Menu Builder, Place Cards, Gap Detection,
  // Dietary Overview table (pulled from Guest workspace), Caterer Shortlist,
  // Tasting Log, Service Plan, Documents — stay full-workspace-only.
  catering: {
    category: "catering",
    sessions: [
      // Session 1 — Tab 1 (Cuisine direction + Food vibe + Cuisines to avoid)
      {
        key: "food_philosophy",
        index: 1,
        fields: [
          {
            kind: "single_select",
            path: "service_style",
            label: "Service style",
            options: [
              { value: "buffet_grand", label: "Grand buffet" },
              { value: "plated_curated", label: "Plated & curated" },
              { value: "family_style", label: "Family style" },
              { value: "live_stations", label: "Live stations" },
              { value: "mixed", label: "Mixed across events" },
            ],
          },
          {
            kind: "keyword_chips",
            path: "cuisine_directions",
            label: "Cuisines you want featured",
            allowCustom: true,
            suggestions: [
              "punjabi",
              "mughlai",
              "gujarati",
              "south_indian",
              "chaat",
              "live_stations",
              "fusion",
              "indo_chinese",
              "street_food",
              "traditional",
              "bengali",
              "rajasthani",
              "jain_friendly",
              "halal",
              "coastal",
              "continental",
              "italian",
              "mexican",
              "pan_asian",
            ],
          },
          {
            kind: "keyword_chips",
            path: "cuisines_to_avoid",
            label: "Cuisines we'd rather skip",
            helper: "Tap the cuisines you don't want anywhere on the menu.",
            allowCustom: true,
            suggestions: [
              "heavy_fried",
              "raw_seafood",
              "spicy_only",
              "very_sweet",
              "experimental_fusion",
              "buffet_only",
            ],
          },
          {
            kind: "intensity_slider",
            path: "food_vibe_score",
            label: "How should the food feel?",
            lowLabel: "Street food casual",
            highLabel: "Fine dining plated",
            toneWords: ["Casual & playful", "Polished & warm", "Fine dining"],
            default: 50,
          },
        ],
      },

      // Session 2 — Tab 1 (Food Inspiration by Event + Food Moodboard) — NEW
      {
        key: "food_inspiration",
        index: 2,
        fields: [
          {
            kind: "image_list",
            path: "per_event_inspiration_reactions",
            label: "Food experiences that inspire you, by event",
            helper:
              "Tag each pin to the event it belongs to — and tell us if it's a love or a no.",
            tagOptions: ["love", "not_for_us"],
            perEventTag: true,
          },
          {
            kind: "image_list",
            path: "moodboard_pins",
            label: "Your food moodboard",
            helper:
              "Pin dishes, presentations, and setups that inspire you. Tag each pin so your caterer knows what to study.",
            tagOptions: [
              "food",
              "presentation",
              "stations",
              "table_setup",
              "late_night",
            ],
          },
        ],
      },

      // Session 3 — Tab 1 (Must-haves / Don'ts) + seeds Tab 3 (Dietary Overview)
      {
        key: "dietary_landscape",
        index: 3,
        fields: [
          {
            kind: "single_select",
            path: "overall_diet",
            label: "Overall diet of your guest list",
            options: [
              { value: "veg_dominant", label: "Mostly vegetarian" },
              { value: "mixed", label: "Mixed" },
              { value: "nonveg_dominant", label: "Mostly non-vegetarian" },
              { value: "complex", label: "Complex — multiple traditions" },
            ],
          },
          {
            kind: "keyword_chips",
            path: "dietary_traditions",
            label: "Traditions to honour",
            suggestions: [
              "jain",
              "swaminarayan",
              "satvik",
              "halal",
              "kosher",
              "no_onion_garlic",
            ],
          },
          {
            kind: "keyword_chips",
            path: "allergies_restrictions",
            label: "Allergies & restrictions",
            allowCustom: true,
            suggestions: [
              "nut_free",
              "gluten_free",
              "dairy_free",
              "shellfish",
              "egg_free",
            ],
          },
          {
            kind: "number",
            path: "jain_guest_count",
            label: "Approx Jain-strict guests",
          },
          {
            kind: "number",
            path: "vegan_guest_count",
            label: "Approx vegan guests",
          },
          {
            kind: "list_text",
            path: "must_have_dishes",
            label: "Must-have dishes",
            placeholder: "Mom's dal makhani, pani puri station at Sangeet…",
          },
          {
            kind: "list_text",
            path: "please_dont_serve",
            label: "Please don't serve",
            placeholder: "No mushrooms (Priya's allergy), nothing too spicy for kids…",
          },
          {
            kind: "textarea",
            path: "special_notes",
            label: "Anything specific your caterer needs to know",
            placeholder:
              "Nani is Jain strict — no onion, no garlic, no root vegetables…",
            rows: 3,
          },
        ],
      },

      // Session 4 — Tab 1 (Bar & Beverages) — NEW section on full workspace
      {
        key: "bar_beverages",
        index: 4,
        fields: [
          {
            kind: "single_select",
            path: "bar_type",
            label: "Bar type",
            options: [
              { value: "open_full", label: "Open bar — full" },
              { value: "beer_wine", label: "Beer & wine" },
              { value: "signature_cocktails", label: "Signature cocktails only" },
              { value: "dry", label: "Dry wedding" },
              { value: "selective", label: "Selective by event" },
              { value: "byob", label: "BYOB" },
            ],
          },
          {
            kind: "list_text",
            path: "events_with_alcohol",
            label: "Events where alcohol is served",
            placeholder: "Sangeet, Reception…",
          },
          {
            kind: "list_text",
            path: "signature_cocktail_ideas",
            label: "Signature cocktail ideas",
            placeholder: "Saffron gin sour, mango margarita…",
          },
          {
            kind: "boolean",
            path: "chai_station",
            label: "Late-night chai station?",
          },
          {
            kind: "textarea",
            path: "beverage_notes",
            label: "Beverage notes",
            rows: 3,
          },
        ],
      },

      // Session 5 — Tab 2 (Menu Builder event headers) — vision only, NOT menu construction
      {
        key: "per_event_food",
        index: 5,
        fields: [
          {
            kind: "list_object",
            path: "events",
            label: "Per-event food vision",
            titleField: "event_name",
            presetRows: STANDARD_EVENTS,
            itemFields: [
              {
                kind: "text",
                path: "event_name",
                label: "Event",
                placeholder: "Haldi",
              },
              {
                kind: "keyword_chips",
                path: "cuisine_focus",
                label: "Cuisine focus",
                allowCustom: true,
                suggestions: [
                  "north_indian",
                  "south_indian",
                  "gujarati",
                  "fusion",
                  "continental",
                ],
              },
              {
                kind: "single_select",
                path: "service_style",
                label: "Service style",
                options: [
                  { value: "buffet", label: "Buffet" },
                  { value: "plated", label: "Plated" },
                  { value: "family_style", label: "Family style" },
                  { value: "live_stations", label: "Live stations" },
                ],
              },
              {
                kind: "number",
                path: "headcount",
                label: "Headcount",
              },
              {
                kind: "list_text",
                path: "hero_dishes",
                label: "Hero dishes",
                placeholder: "Pani puri station, Dadi's dal recipe…",
              },
              {
                kind: "textarea",
                path: "notes",
                label: "Notes",
                rows: 2,
              },
            ],
          },
          {
            kind: "keyword_chips",
            path: "food_priority_rank",
            label: "What matters most about the food?",
            helper: "Pick your top three. Influences how the AI drafts your brief.",
            suggestions: [
              "variety",
              "presentation",
              "specific_dishes",
              "dietary_coverage",
              "budget",
              "live_action",
              "unique_experience",
            ],
          },
        ],
      },

      // Session 6 — Tab 1 (Food Brief)
      {
        key: "dining_brief",
        index: 6,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your dining brief",
            draftCues: [
              "food_philosophy.service_style",
              "food_philosophy.cuisine_directions",
              "food_philosophy.food_vibe_score",
              "dietary_landscape.special_notes",
              "per_event_food.food_priority_rank",
            ],
          },
        ],
      },
    ],
  },

  // ── Décor & Florals (7 sessions) ─────────────────────────────────────
  // Reconciled with the full workspace (4 tabs): every guided field has a
  // counterpart in components/decor/tabs/* and vice versa. Derived views —
  // Element Shortlist, Floral Summary, Decorator Shortlist, Budget Snapshot,
  // Contract Checklist — stay full-workspace-only.
  decor: {
    category: "decor",
    sessions: [
      // Session 1 — Tab 1 (Vision & Mood): keywords, colour story, formality
      {
        key: "aesthetic_direction",
        index: 1,
        fields: [
          {
            kind: "keyword_chips",
            path: "style_keywords",
            label: "Style language",
            helper: "Tap the keywords that resonate. Add your own.",
            allowCustom: true,
            suggestions: [
              "lush",
              "minimal",
              "garden-party",
              "regal",
              "candlelit",
              "marigold",
              "modern",
              "bohemian",
              "traditional",
              "romantic",
              "dramatic",
              "earthy",
              "opulent",
              "intimate",
              "whimsical",
            ],
          },
          {
            kind: "list_object",
            path: "colour_story_per_event",
            label: "Colour story across events",
            helper:
              "The canonical palette for your wedding. Flows to Stationery, Wardrobe & Styling, and Cake & Sweets.",
            titleField: "event_name",
            presetRows: STANDARD_EVENTS,
            itemFields: [
              { kind: "text", path: "event_name", label: "Event" },
              {
                kind: "list_text",
                path: "colour_names",
                label: "Named colours",
                placeholder: "Turmeric, Marigold, Cream…",
              },
            ],
          },
          {
            kind: "intensity_slider",
            path: "formality_score",
            label: "How formal should it feel?",
            lowLabel: "Intimate & organic",
            highLabel: "Grand & opulent",
            default: 50,
          },
        ],
      },

      // Session 2 — Tab 1 Moodboard + Tab 4 Inspiration gallery + breathtaking
      {
        key: "decor_inspiration",
        index: 2,
        fields: [
          {
            kind: "image_list",
            path: "moodboard_pins",
            label: "Reference collage",
            helper: "Paste URLs or upload images. Tag each pin by element.",
            tagOptions: [
              "mandap",
              "entrance",
              "table",
              "lighting",
              "florals",
              "stage",
              "ceiling",
              "aisle",
            ],
            perEventTag: true,
          },
          {
            kind: "list_text",
            path: "breathtaking_spaces",
            label: "Spaces that took your breath away",
            placeholder:
              "The single image or feeling you can't stop thinking about…",
          },
        ],
      },

      // Session 3 — Tab 2 (Walk Through Your Spaces) + per-event scene
      {
        key: "event_scenes",
        index: 3,
        fields: [
          {
            kind: "list_object",
            path: "events",
            label: "Per-event scenes",
            titleField: "event_name",
            presetRows: STANDARD_EVENTS,
            itemFields: [
              { kind: "text", path: "event_name", label: "Event" },
              {
                kind: "single_select",
                path: "indoor_outdoor",
                label: "Indoor / outdoor",
                options: [
                  { value: "indoor", label: "Indoor" },
                  { value: "outdoor", label: "Outdoor" },
                  { value: "both", label: "Both" },
                  { value: "tbd", label: "TBD" },
                ],
              },
              {
                kind: "single_select",
                path: "time_of_day",
                label: "Time of day",
                options: [
                  { value: "morning", label: "Morning" },
                  { value: "afternoon", label: "Afternoon" },
                  { value: "evening", label: "Evening" },
                  { value: "night", label: "Night" },
                ],
              },
              {
                kind: "textarea",
                path: "mood_description",
                label: "Mood",
                placeholder:
                  "Haldi should feel like a sunny garden party with turmeric and marigold everywhere…",
                rows: 3,
              },
              {
                kind: "keyword_chips",
                path: "key_elements",
                label: "Key elements",
                suggestions: [
                  "mandap",
                  "stage",
                  "entrance_arch",
                  "table_centrepieces",
                  "ceiling",
                  "drape",
                  "lounge",
                  "aisle",
                ],
              },
            ],
          },
          {
            kind: "list_object",
            path: "spaces",
            label: "Walk through your spaces",
            helper:
              "The lawns, courtyards, ballrooms — each with its own personality.",
            titleField: "name",
            itemFields: [
              { kind: "text", path: "name", label: "Space name" },
              {
                kind: "single_select",
                path: "indoor_outdoor",
                label: "Indoor / outdoor",
                options: [
                  { value: "indoor", label: "Indoor" },
                  { value: "outdoor", label: "Outdoor" },
                ],
              },
              {
                kind: "single_select",
                path: "time_of_day",
                label: "Time of day",
                options: [
                  { value: "morning", label: "Morning" },
                  { value: "afternoon", label: "Afternoon" },
                  { value: "evening", label: "Evening" },
                  { value: "night", label: "Night" },
                ],
              },
              {
                kind: "list_text",
                path: "events",
                label: "Events held here",
                placeholder: "Sangeet, Wedding…",
              },
            ],
          },
        ],
      },

      // Session 4 — Tab 2 (Floral Style + Library + Palette + Arrangement +
      // Scale + Greenery + Fragrance + Cultural). Renamed from
      // floral_preferences to floral_vision to reflect the broader scope.
      {
        key: "floral_vision",
        index: 4,
        fields: [
          {
            kind: "single_select",
            path: "real_vs_faux_global",
            label: "Real, faux, or a mix?",
            helper:
              "Affects budget and planning. You can override per event below.",
            options: [
              { value: "real_only", label: "Real only" },
              { value: "faux", label: "Faux only" },
              { value: "mix", label: "Mix of real & faux" },
            ],
          },
          {
            kind: "keyword_chips",
            path: "favourite_flowers",
            label: "Flower library — your favourites",
            helper:
              "The flowers you'd love to see. Browse the full library in the workspace.",
            allowCustom: true,
            suggestions: [
              "peonies",
              "garden_roses",
              "ranunculus",
              "dahlias",
              "marigold",
              "jasmine",
              "tuberose",
              "orchid",
              "lotus",
              "anthurium",
              "pampas_grass",
              "monstera_leaves",
            ],
          },
          {
            kind: "keyword_chips",
            path: "avoid_flowers",
            label: "Flowers to avoid",
            allowCustom: true,
            suggestions: ["lily", "carnation", "baby_breath", "chrysanthemum"],
          },
          {
            kind: "keyword_chips",
            path: "loved_palettes",
            label: "Flower palettes you love",
            helper: "Curated colour stories for the florals.",
            suggestions: [
              "warm_sunset",
              "classic_white",
              "jewel_tones",
              "garden_mix",
              "tropical",
              "dried_earthy",
            ],
          },
          {
            kind: "keyword_chips",
            path: "arrangement_keywords",
            label: "Arrangement style",
            allowCustom: true,
            suggestions: [
              "lush",
              "sparse",
              "cascading",
              "structured",
              "wild",
              "monochrome",
              "tropical",
              "dried",
              "mixed_greenery",
              "single_variety",
            ],
          },
          {
            kind: "intensity_slider",
            path: "scale_score",
            label: "Scale preference",
            lowLabel: "Intimate & detailed",
            highLabel: "Grand & statement",
            default: 50,
          },
          {
            kind: "single_select",
            path: "greenery_preference",
            label: "Greenery level",
            options: [
              { value: "heavy", label: "Heavy" },
              { value: "moderate", label: "Moderate" },
              { value: "minimal", label: "Minimal" },
              { value: "none", label: "None" },
            ],
          },
          {
            kind: "boolean",
            path: "fragrance_important",
            label: "Fragrance is important to us",
          },
          {
            kind: "list_text",
            path: "cultural_flowers",
            label: "Cultural & ritual flowers",
            placeholder:
              "Marigold garlands for the mandap, jasmine gajra, rose petals for the pheras…",
          },
        ],
      },

      // Session 5 — Tab 2 (Lighting Mood + Lighting Elements). NEW session.
      {
        key: "lighting_vision",
        index: 5,
        fields: [
          {
            kind: "list_object",
            path: "per_event_lighting",
            label: "How each event should feel",
            helper:
              "Score 0–100. Lower = soft & candlelit, higher = dramatic & vibrant.",
            titleField: "event_name",
            presetRows: STANDARD_EVENTS,
            itemFields: [
              { kind: "text", path: "event_name", label: "Event" },
              {
                kind: "number",
                path: "mood_score",
                label: "Mood (0–100)",
                placeholder: "50",
              },
              {
                kind: "single_select",
                path: "mood_label",
                label: "Mood feel",
                options: [
                  { value: "soft", label: "Soft & candlelit" },
                  { value: "balanced", label: "Balanced" },
                  { value: "dramatic", label: "Dramatic & vibrant" },
                ],
              },
            ],
          },
          {
            kind: "keyword_chips",
            path: "loved_lighting_elements",
            label: "Lighting elements you love",
            helper:
              "Pick the fixtures that match the mood you're chasing. Browse the full gallery in the workspace.",
            allowCustom: true,
            suggestions: [
              "string_bistro_lights",
              "candle_clusters",
              "chandeliers",
              "pin_spots",
              "uplights",
              "fairy_canopy",
              "lanterns",
              "diyas",
              "fire_pits",
              "moving_heads",
            ],
          },
          {
            kind: "textarea",
            path: "lighting_notes",
            label: "Lighting notes",
            placeholder:
              "Anything specific about lighting — fixtures to avoid, dimming requirements, candles vs. open flame…",
            rows: 3,
          },
        ],
      },

      // Session 6 — Tab 1 (Want / Avoid) + Cultural requirements + Sustainability
      {
        key: "decor_boundaries",
        index: 6,
        fields: [
          {
            kind: "list_text",
            path: "must_haves",
            label: "I definitely want",
            placeholder: "Real jasmine at the mandap, marigold entrance…",
          },
          {
            kind: "list_text",
            path: "must_avoid",
            label: "Please don't include",
            placeholder: "No baby's breath, no lilies, no chair covers…",
          },
          {
            kind: "list_text",
            path: "cultural_requirements",
            label: "Cultural & ritual requirements",
            placeholder:
              "Ganesh placement at the entrance, east-facing mandap, specific aisle for bride's side…",
          },
          {
            kind: "single_select",
            path: "sustainability_preference",
            label: "Sustainability",
            options: [
              { value: "important", label: "Important to us" },
              { value: "nice_to_have", label: "Nice to have" },
              { value: "not_a_factor", label: "Not a factor" },
            ],
          },
        ],
      },

      // Session 7 — Décor brief
      {
        key: "decor_brief",
        index: 7,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your décor brief",
            draftCues: [
              "aesthetic_direction.style_keywords",
              "aesthetic_direction.formality_score",
              "floral_vision.favourite_flowers",
              "floral_vision.arrangement_keywords",
              "lighting_vision.loved_lighting_elements",
              "decor_boundaries.must_haves",
            ],
          },
        ],
      },
    ],
  },

  // ── Music & Entertainment (5 sessions) ───────────────────────────────
  // Reconciled with EntertainmentCanvas. The guided flow captures the
  // structure (genres, energy per event, must-do beats, MC tone, per-event
  // sound design, brief). The full workspace is where couples fill in the
  // operational depth (MC scripts, audio recordings, request playlists,
  // contract checklist).
  music: {
    category: "music",
    sessions: [
      // ── Session 1: Music identity ────────────────────────────────────
      {
        key: "music_identity",
        index: 1,
        fields: [
          {
            kind: "keyword_chips",
            path: "genre_preferences",
            label: "Genres you want playing",
            allowCustom: true,
            suggestions: [
              "Classic Bollywood",
              "Modern Bollywood/Punjabi",
              "Sufi & Qawwali",
              "Indie/Acoustic",
              "Western Pop & R&B",
              "Hip Hop",
              "EDM/House",
              "Classical Indian",
              "Folk/Regional",
              "Jazz",
              "Latin",
              "Country",
            ],
          },
          {
            kind: "keyword_chips",
            path: "genres_to_avoid",
            label: "Genres to avoid",
            allowCustom: true,
            suggestions: ["heavy_metal", "country", "trap"],
          },
          {
            kind: "keyword_chips",
            path: "era_preferences",
            label: "Which eras define your taste?",
            helper: "Tap the decades and traditions that should show up in the mix.",
            allowCustom: true,
            suggestions: [
              "90s Bollywood",
              "2000s Bollywood",
              "2020s Hits",
              "Classic Hindi",
              "Retro Western",
              "Contemporary Western",
            ],
          },
          {
            kind: "list_object",
            path: "per_event_energy",
            label: "Energy per event",
            helper:
              "0 is intimate, 100 is peak party. Drag each event toward the energy you want.",
            titleField: "event_name",
            presetRows: [
              { event_name: "Haldi", energy_score: 30 },
              { event_name: "Mehendi", energy_score: 45 },
              { event_name: "Sangeet", energy_score: 85 },
              { event_name: "Wedding Ceremony", energy_score: 50 },
              { event_name: "Reception", energy_score: 95 },
            ],
            itemFields: [
              { kind: "text", path: "event_name", label: "Event" },
              {
                kind: "number",
                path: "energy_score",
                label: "Energy (0-100)",
                min: 0,
                max: 100,
              },
              {
                kind: "single_select",
                path: "energy_label",
                label: "Feel",
                options: [
                  { value: "intimate", label: "Intimate" },
                  { value: "warm", label: "Warm" },
                  { value: "building", label: "Building" },
                  { value: "high_energy", label: "High Energy" },
                  { value: "peak_party", label: "Peak Party" },
                ],
              },
            ],
          },
        ],
      },

      // ── Session 2: Music explorer ────────────────────────────────────
      {
        key: "music_explorer",
        index: 2,
        fields: [
          {
            kind: "keyword_chips",
            path: "saved_vibe_categories",
            label: "Vibes that resonate",
            helper:
              "Tap the vibe categories you want anchoring the night. We'll surface tracks for these in the explorer.",
            suggestions: [
              "Romantic & Intimate",
              "Bollywood Classic",
              "Punjabi/Bhangra Energy",
              "Sufi & Soulful",
              "Western Pop & R&B",
              "Party & EDM",
              "Acoustic & Unplugged",
              "Classical & Traditional",
            ],
          },
          {
            kind: "list_object",
            path: "saved_tracks",
            label: "Tracks you've hearted",
            helper:
              "Capture the songs you want to anchor your wedding — title, artist, and which event they belong to.",
            titleField: "title",
            itemFields: [
              { kind: "text", path: "title", label: "Track" },
              { kind: "text", path: "artist", label: "Artist" },
              {
                kind: "single_select",
                path: "vibe_category",
                label: "Vibe",
                options: [
                  { value: "romantic_intimate", label: "Romantic & Intimate" },
                  { value: "bollywood_classic", label: "Bollywood Classic" },
                  { value: "punjabi_bhangra", label: "Punjabi/Bhangra Energy" },
                  { value: "sufi_soulful", label: "Sufi & Soulful" },
                  { value: "western_pop", label: "Western Pop & R&B" },
                  { value: "party_edm", label: "Party & EDM" },
                  { value: "acoustic_unplugged", label: "Acoustic & Unplugged" },
                  { value: "classical_traditional", label: "Classical & Traditional" },
                ],
              },
              {
                kind: "single_select",
                path: "event_tag",
                label: "Event",
                options: [
                  { value: "first_dance", label: "First dance" },
                  { value: "baraat", label: "Baraat" },
                  { value: "entrance", label: "Entrance" },
                  { value: "haldi", label: "Haldi" },
                  { value: "mehendi", label: "Mehendi" },
                  { value: "sangeet", label: "Sangeet" },
                  { value: "ceremony", label: "Ceremony" },
                  { value: "reception", label: "Reception" },
                  { value: "other", label: "Other" },
                ],
              },
            ],
          },
          {
            kind: "list_object",
            path: "must_do_beats",
            label: "Must-do music beats",
            helper:
              "The non-negotiable moments — the first dance, the Baraat dhol, the Vidaai song.",
            titleField: "description",
            itemFields: [
              {
                kind: "text",
                path: "description",
                label: "Moment",
                placeholder: "First dance, Baraat dhol entrance…",
              },
              {
                kind: "text",
                path: "song_preference",
                label: "Song / artist (if decided)",
              },
              {
                kind: "single_select",
                path: "event",
                label: "Event",
                options: [
                  { value: "haldi", label: "Haldi" },
                  { value: "mehendi", label: "Mehendi" },
                  { value: "sangeet", label: "Sangeet" },
                  { value: "ceremony", label: "Ceremony" },
                  { value: "reception", label: "Reception" },
                ],
              },
            ],
          },
          {
            kind: "list_text",
            path: "do_not_play",
            label: "Do-not-play list",
            placeholder: "Specific songs or artists to skip…",
          },
        ],
      },

      // ── Session 3: Speeches & MC ─────────────────────────────────────
      {
        key: "speeches_and_mc",
        index: 3,
        fields: [
          {
            kind: "list_object",
            path: "speeches",
            label: "Who speaks",
            helper:
              "Capture every speaker — names and order matter. The detail (drafts, prep, invitations) lives in the full workspace.",
            titleField: "speaker_name",
            itemFields: [
              { kind: "text", path: "speaker_name", label: "Speaker name" },
              {
                kind: "single_select",
                path: "relationship",
                label: "Relationship",
                options: [
                  { value: "best_man", label: "Best man" },
                  { value: "maid_of_honor", label: "Maid of honor" },
                  { value: "father_of_bride", label: "Father of the bride" },
                  { value: "mother_of_bride", label: "Mother of the bride" },
                  { value: "father_of_groom", label: "Father of the groom" },
                  { value: "mother_of_groom", label: "Mother of the groom" },
                  { value: "sibling", label: "Sibling" },
                  { value: "friend", label: "Friend" },
                  { value: "couple", label: "Couple themselves" },
                  { value: "other", label: "Other" },
                ],
              },
              {
                kind: "single_select",
                path: "event",
                label: "Event",
                options: [
                  { value: "rehearsal", label: "Rehearsal dinner" },
                  { value: "haldi", label: "Haldi" },
                  { value: "mehendi", label: "Mehendi" },
                  { value: "sangeet", label: "Sangeet" },
                  { value: "ceremony", label: "Ceremony" },
                  { value: "reception", label: "Reception" },
                ],
              },
              {
                kind: "number",
                path: "estimated_minutes",
                label: "Time limit (min)",
              },
            ],
          },
          {
            kind: "single_select",
            path: "couple_speech",
            label: "Couple's own speech",
            options: [
              { value: "together", label: "Writing together" },
              { value: "separately", label: "Writing separately" },
              { value: "not_doing", label: "Not doing one" },
            ],
          },
          {
            kind: "intensity_slider",
            path: "mc_tone.humor_level",
            label: "MC humor",
            lowLabel: "Serious & elegant",
            highLabel: "Full comedy / roast",
            toneWords: ["Elegant", "Warm wit", "Roast-ready"],
            default: 35,
          },
          {
            kind: "intensity_slider",
            path: "mc_tone.energy_level",
            label: "MC energy",
            lowLabel: "Calm & smooth",
            highLabel: "Hype man",
            toneWords: ["Calm", "Lively", "Hype"],
            default: 60,
          },
          {
            kind: "intensity_slider",
            path: "mc_tone.cultural_balance",
            label: "Cultural balance",
            lowLabel: "Fully traditional",
            highLabel: "Modern & Western",
            toneWords: ["Traditional", "Fusion of both", "Modern Western"],
            default: 50,
          },
          {
            kind: "intensity_slider",
            path: "mc_tone.crowd_interaction",
            label: "Crowd interaction",
            lowLabel: "Minimal — just announce",
            highLabel: "Get the crowd involved",
            toneWords: ["Minimal", "Balanced", "Involved"],
            default: 55,
          },
          {
            kind: "list_object",
            path: "pronunciation_names",
            label: "Names the MC must nail",
            helper:
              "Just the names and phonetics — record audio in the full workspace.",
            titleField: "name",
            itemFields: [
              { kind: "text", path: "name", label: "Name as written" },
              {
                kind: "text",
                path: "phonetic",
                label: "Phonetic",
                placeholder: "AH·nuh·nyah",
              },
              {
                kind: "text",
                path: "context",
                label: "Context",
                placeholder: "Bride's maternal grandmother…",
              },
            ],
          },
        ],
      },

      // ── Session 4: Per-event soundscapes ─────────────────────────────
      {
        key: "event_soundscapes",
        index: 4,
        fields: [
          {
            kind: "list_object",
            path: "per_event_soundscapes",
            label: "Per-event sound design",
            helper:
              "Walk through the four moments of each event — opening, build, peak, wind-down.",
            titleField: "event_name",
            presetRows: [
              { event_name: "Haldi" },
              { event_name: "Mehendi" },
              { event_name: "Sangeet" },
              { event_name: "Wedding Ceremony" },
              { event_name: "Reception" },
            ],
            itemFields: [
              { kind: "text", path: "event_name", label: "Event" },
              {
                kind: "textarea",
                path: "opening_mood",
                label: "Opening mood",
                placeholder: "What's playing as guests arrive?",
                rows: 2,
              },
              {
                kind: "textarea",
                path: "build",
                label: "Build",
                placeholder: "How does the energy escalate?",
                rows: 2,
              },
              {
                kind: "textarea",
                path: "peak",
                label: "Peak",
                placeholder: "The biggest moment.",
                rows: 2,
              },
              {
                kind: "textarea",
                path: "wind_down",
                label: "Wind-down",
                placeholder: "How does it end?",
                rows: 2,
              },
              {
                kind: "list_text",
                path: "must_play",
                label: "Must-play songs",
                placeholder: "Song — Artist",
              },
              {
                kind: "list_text",
                path: "entertainment_moments",
                label: "Entertainment moments",
                placeholder: "Flash mob, live Sufi singer, magician…",
              },
            ],
          },
          {
            kind: "boolean",
            path: "sangeet_performances.has_choreographed",
            label: "Choreographed Sangeet performances?",
          },
          {
            kind: "number",
            path: "sangeet_performances.number_of_acts",
            label: "Number of acts",
          },
          {
            kind: "boolean",
            path: "sangeet_performances.needs_rehearsal_time",
            label: "Need rehearsal time at venue",
          },
          {
            kind: "boolean",
            path: "sangeet_performances.needs_av_setup",
            label: "Need AV setup (projector, screens, playback speakers)",
          },
          {
            kind: "boolean",
            path: "sound_requirements.outdoor_events",
            label: "Outdoor events with amplified sound?",
          },
          {
            kind: "text",
            path: "sound_requirements.noise_curfew",
            label: "Noise curfew",
            placeholder: "10 PM",
          },
          {
            kind: "boolean",
            path: "sound_requirements.multiple_zones",
            label: "Multiple sound zones (e.g. cocktail + main hall)",
          },
          {
            kind: "textarea",
            path: "sound_requirements.notes",
            label: "Sound logistics notes",
            placeholder:
              "Generator location, cable runs, neighbour sensitivities…",
            rows: 2,
          },
        ],
      },

      // ── Session 5: Brief ─────────────────────────────────────────────
      {
        key: "music_brief",
        index: 5,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your sound brief",
            draftCues: [
              "music_identity.genre_preferences",
              "music_identity.era_preferences",
              "music_identity.per_event_energy",
              "music_explorer.must_do_beats",
              "music_explorer.do_not_play",
              "speeches_and_mc.mc_tone.cultural_balance",
              "event_soundscapes.per_event_soundscapes",
              "event_soundscapes.sangeet_performances.has_choreographed",
              "event_soundscapes.sound_requirements.notes",
            ],
          },
        ],
      },
    ],
  },

  // ── Hair & Makeup (7 sessions) ───────────────────────────────────────
  // Reconciled with the full workspace tabs: Vision & Mood (style, colour,
  // moodboard, references, skin & products, must-haves, moments, brief),
  // Bride Looks (per-event arc), and Family & Bridal Party (chair list).
  // Both modes read/write the same form_data bags keyed by session_key.
  hmua: {
    category: "hmua",
    sessions: [
      // Session 1: Tab 1 — style keywords + colour direction + makeup
      // intensity + hair length / texture.
      {
        key: "beauty_style",
        index: 1,
        fields: [
          {
            kind: "keyword_chips",
            path: "style_keywords",
            label: "Words that describe the look",
            helper: "Tap the ones that resonate. Add your own.",
            allowCustom: true,
            suggestions: [
              "dewy",
              "bold-lip",
              "soft-glam",
              "natural",
              "smokey-eye",
              "winged-liner",
              "traditional",
              "editorial",
              "minimalist",
              "south-indian",
              "fresh-faced",
              "dramatic",
              "romantic",
              "glass-skin",
              "matte",
              "statement-brows",
            ],
          },
          {
            kind: "intensity_slider",
            path: "colour_direction_score",
            label: "Colour direction",
            helper:
              "Slide to calibrate the palette. Soft & nude on the left, rich & saturated on the right.",
            lowLabel: "Soft & nude",
            highLabel: "Rich & saturated",
            toneWords: ["Soft & nude", "Balanced", "Rich & saturated"],
            default: 50,
          },
          {
            kind: "intensity_slider",
            path: "makeup_intensity_score",
            label: "Makeup weight",
            helper:
              "Independent of colour. How much coverage and definition do you want?",
            lowLabel: "Barely there",
            highLabel: "Full glam",
            toneWords: ["Barely there", "Soft glam", "Full glam"],
            default: 50,
          },
          {
            kind: "single_select",
            path: "hair_length",
            label: "Hair length",
            options: [
              { value: "short", label: "Short" },
              { value: "medium", label: "Medium" },
              { value: "long", label: "Long" },
              { value: "very_long", label: "Very long" },
            ],
          },
          {
            kind: "single_select",
            path: "hair_texture",
            label: "Hair texture",
            options: [
              { value: "straight", label: "Straight" },
              { value: "wavy", label: "Wavy" },
              { value: "curly", label: "Curly" },
              { value: "coily", label: "Coily" },
            ],
          },
        ],
      },

      // Session 2: Tab 1 — moodboard + reference looks by event.
      {
        key: "beauty_inspiration",
        index: 2,
        fields: [
          {
            kind: "image_list",
            path: "moodboard_pins",
            label: "Beauty moodboard",
            helper:
              "Paste links or upload pins. Tag each by hair, makeup, accessories, or nails.",
            tagOptions: ["hair", "makeup", "accessories", "nails"],
          },
          {
            kind: "image_list",
            path: "reference_looks_by_event",
            label: "Reference looks by event",
            helper:
              "Pin a reference for each event. Tag the event so your artist sees the arc.",
            tagOptions: ["hair", "makeup", "full_look", "accessories"],
            perEventTag: true,
          },
        ],
      },

      // Session 3 (NEW): Tab 1 — skin & hair profile + favourite products.
      {
        key: "skin_and_products",
        index: 3,
        fields: [
          {
            kind: "single_select",
            path: "skin_hair_profile.skin_type",
            label: "Skin type",
            options: [
              { value: "oily", label: "Oily" },
              { value: "dry", label: "Dry" },
              { value: "combination", label: "Combination" },
              { value: "sensitive", label: "Sensitive" },
            ],
          },
          {
            kind: "single_select",
            path: "skin_hair_profile.undertone",
            label: "Undertone",
            options: [
              { value: "fair", label: "Fair" },
              { value: "medium", label: "Medium" },
              { value: "olive", label: "Olive" },
              { value: "deep", label: "Deep" },
            ],
          },
          {
            kind: "keyword_chips",
            path: "skin_hair_profile.skin_concerns",
            label: "Skin concerns to flag",
            allowCustom: true,
            suggestions: [
              "acne",
              "dry_skin",
              "oily",
              "sensitive",
              "dark_circles",
              "rosacea",
              "pigmentation",
              "texture",
            ],
          },
          {
            kind: "list_text",
            path: "skin_hair_profile.allergies",
            label: "Allergies & sensitivities",
            placeholder: "Latex, lash adhesive, fragrance…",
          },
          {
            kind: "list_object",
            path: "favourite_products",
            label: "Products you already love",
            helper:
              "The shelfie. Add the products your artist should know you trust.",
            titleField: "brand",
            itemFields: [
              {
                kind: "text",
                path: "category",
                label: "Category",
                placeholder: "Lipstick, foundation, primer…",
              },
              { kind: "text", path: "brand", label: "Brand" },
              {
                kind: "text",
                path: "shade_name",
                label: "Shade",
                placeholder: "MAC NC42, Ruby Woo…",
              },
            ],
          },
        ],
      },

      // Session 4: Tab 4 (Bride Looks) — undertone, vibes, per-event arc.
      {
        key: "per_event_looks",
        index: 4,
        fields: [
          {
            kind: "multi_select",
            path: "vibes",
            label: "Vibes",
            helper: "Pick every vibe that fits the arc.",
            options: [
              { value: "dewy", label: "Dewy" },
              { value: "soft_romantic", label: "Soft romantic" },
              { value: "glam", label: "Glam" },
              { value: "bold_statement", label: "Bold statement" },
              { value: "editorial", label: "Editorial" },
            ],
          },
          {
            kind: "list_object",
            path: "events",
            label: "Looks per event",
            helper:
              "Each event gets its own look — map the arc from haldi to reception.",
            titleField: "event_name",
            presetRows: STANDARD_EVENTS,
            itemFields: [
              { kind: "text", path: "event_name", label: "Event" },
              {
                kind: "text",
                path: "look_label",
                label: "Look label",
                placeholder: "Fresh & dewy, Bridal & regal…",
              },
              {
                kind: "text",
                path: "hair_direction",
                label: "Hair direction",
                placeholder: "Open waves, low bun with gajra…",
              },
              {
                kind: "text",
                path: "makeup_direction",
                label: "Makeup direction",
                placeholder: "Soft dewy with nude lip…",
              },
              {
                kind: "boolean",
                path: "dupatta_draping",
                label: "Dupatta draping needed",
              },
              {
                kind: "text",
                path: "outfit_colour",
                label: "Outfit colour",
              },
              {
                kind: "list_text",
                path: "accessories",
                label: "Accessories",
                placeholder: "Maang tikka, nath, jhumkas…",
              },
              {
                kind: "textarea",
                path: "notes",
                label: "Notes",
                rows: 2,
              },
            ],
          },
        ],
      },

      // Session 5 (NEW): Tab 1 — must-haves, beauty moments, exclusions.
      {
        key: "beauty_non_negotiables",
        index: 5,
        fields: [
          {
            kind: "list_text",
            path: "definitely_want",
            label: "I definitely want",
            helper: "The non-negotiables your artist needs to see first.",
            placeholder: "Lash extensions, bold lip for reception…",
            priorityToggle: true,
          },
          {
            kind: "list_text",
            path: "beauty_moments_wishlist",
            label: "Beauty moments wishlist",
            helper:
              "The emotional moments — \"Mom seeing me in bridal makeup\" — your artist captures the energy for.",
            placeholder: "Add a moment…",
          },
          {
            kind: "list_text",
            path: "please_dont_include",
            label: "Please don't include",
            helper: "The things that are absolutely off the table.",
            placeholder: "Heavy contour, false lashes, fragrance…",
          },
        ],
      },

      // Session 6: Tab 5 (Family & Bridal Party) — chair list (simplified).
      {
        key: "chair_list",
        index: 6,
        fields: [
          {
            kind: "list_object",
            path: "people",
            label: "Who else needs hair & makeup?",
            helper:
              "Names + services for now. Artist assignments and chair minutes live in the full workspace.",
            titleField: "name",
            itemFields: [
              { kind: "text", path: "name", label: "Name" },
              {
                kind: "text",
                path: "role",
                label: "Role",
                placeholder: "Bride's mom, bridesmaid…",
              },
              {
                kind: "single_select",
                path: "side",
                label: "Side",
                options: [
                  { value: "bride", label: "Bride's side" },
                  { value: "groom", label: "Groom's side" },
                ],
              },
              {
                kind: "keyword_chips",
                path: "services",
                label: "Services",
                suggestions: ["hair", "makeup", "draping"],
              },
              {
                kind: "list_text",
                path: "events",
                label: "Events",
                placeholder: "Sangeet, Wedding…",
              },
              {
                kind: "textarea",
                path: "special_notes",
                label: "Notes",
                rows: 2,
              },
            ],
          },
        ],
      },

      // Session 7: Tab 1 — beauty brief.
      {
        key: "beauty_brief",
        index: 7,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your beauty brief",
            helper:
              "The document your artist reads first. Describe the feeling, not the products.",
            draftCues: [
              "beauty_style.style_keywords",
              "beauty_style.colour_direction_score",
              "beauty_style.makeup_intensity_score",
              "per_event_looks.vibes",
              "per_event_looks.events",
              "skin_and_products.skin_hair_profile.skin_concerns",
              "beauty_non_negotiables.definitely_want",
              "beauty_non_negotiables.please_dont_include",
            ],
          },
        ],
      },
    ],
  },

  // ── Mehendi (3 sessions) ─────────────────────────────────────────────
  mehendi: {
    category: "mehendi",
    sessions: [
      {
        key: "mehendi_style",
        index: 1,
        fields: [
          {
            kind: "single_select",
            path: "bridal_style",
            label: "Bridal mehendi style",
            options: [
              { value: "traditional_full", label: "Traditional full" },
              { value: "modern_minimal", label: "Modern minimal" },
              { value: "fusion", label: "Fusion" },
              { value: "arabic", label: "Arabic" },
              { value: "rajasthani", label: "Rajasthani" },
              { value: "portrait_style", label: "Portrait style" },
            ],
          },
          {
            kind: "single_select",
            path: "coverage",
            label: "Coverage",
            options: [
              {
                value: "full_arms_and_feet",
                label: "Full arms & feet",
              },
              { value: "hands_and_wrists", label: "Hands & wrists" },
              { value: "hands_only", label: "Hands only" },
              { value: "one_hand_accent", label: "One-hand accent" },
            ],
          },
          {
            kind: "single_select",
            path: "darkness_preference",
            label: "Darkness preference",
            options: [
              { value: "very_dark", label: "Very dark" },
              { value: "medium", label: "Medium" },
              { value: "light_natural", label: "Light & natural" },
            ],
          },
          {
            kind: "keyword_chips",
            path: "special_elements",
            label: "Special elements",
            allowCustom: true,
            suggestions: [
              "groom_hidden_name",
              "wedding_date",
              "couple_portrait",
              "elephant_motif",
              "peacock",
              "doli",
              "lotus",
            ],
          },
          {
            kind: "image_list",
            path: "inspiration_images",
            label: "Inspiration",
          },
        ],
      },
      {
        key: "guest_mehendi",
        index: 2,
        fields: [
          {
            kind: "number",
            path: "estimated_guest_count",
            label: "Approx guests who want mehendi",
          },
          {
            kind: "single_select",
            path: "guest_style",
            label: "Guest mehendi style",
            options: [
              { value: "simple_one_hand", label: "Simple, one hand" },
              { value: "moderate", label: "Moderate" },
              { value: "detailed", label: "Detailed" },
              { value: "mixed", label: "Mixed" },
            ],
          },
          {
            kind: "single_select",
            path: "setup_type",
            label: "Setup",
            options: [
              { value: "seated_stations", label: "Seated stations" },
              { value: "lounge_style", label: "Lounge-style" },
              { value: "walking_stations", label: "Walking stations" },
            ],
          },
          {
            kind: "number",
            path: "number_of_artists_needed",
            label: "Artists needed",
          },
          {
            kind: "number",
            path: "event_duration_hours",
            label: "Event duration (hours)",
          },
          {
            kind: "list_text",
            path: "entertainment_during",
            label: "What's happening during",
            placeholder: "Music, snacks, games…",
          },
          {
            kind: "textarea",
            path: "notes",
            label: "Notes",
            rows: 2,
          },
        ],
      },
      {
        key: "mehendi_brief",
        index: 3,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your mehendi brief",
            draftCues: [
              "mehendi_style.bridal_style",
              "mehendi_style.coverage",
              "guest_mehendi.estimated_guest_count",
            ],
          },
        ],
      },
    ],
  },

  // ── Priest / Pandit (3 sessions) ─────────────────────────────────────
  priest: {
    category: "priest",
    // Vision journey — 2 sessions. Aligns with the cascading tradition
    // picker on Tab 1 of the full workspace. Ritual-by-ritual decisions,
    // family roles, samagri sourcing, and day-of logistics now live in the
    // separate Build journey (`priest:build`) which unlocks once an
    // officiant has been shortlisted.
    sessions: [
      {
        key: "ceremony_traditions",
        index: 1,
        fields: [
          {
            kind: "single_select",
            path: "broad_tradition",
            label: "Broad tradition",
            helper: "Pick the high-level family — you'll narrow it next.",
            options: [
              { value: "hindu", label: "Hindu" },
              { value: "sikh", label: "Sikh" },
              { value: "jain", label: "Jain" },
              { value: "buddhist", label: "Buddhist" },
              { value: "muslim", label: "Muslim" },
              { value: "parsi", label: "Parsi / Zoroastrian" },
              { value: "christian", label: "Christian" },
              { value: "interfaith", label: "Interfaith" },
              { value: "non_religious", label: "Non-religious" },
            ],
          },
          {
            kind: "text",
            path: "specific_tradition",
            label: "Specific tradition within that family",
            helper:
              "e.g. 'vedic', 'arya_samaj', 'gujarati', 'tamil_brahmin', 'sikh_anand_karaj', 'interfaith_custom'.",
            placeholder: "vedic",
          },
          {
            kind: "single_select",
            path: "ceremony_length_preference",
            label: "Ceremony length",
            helper: "How long should the ceremony itself run?",
            options: [
              { value: "30_min", label: "30 min — bare-essentials express" },
              { value: "45_min", label: "45 min — streamlined core rituals" },
              { value: "60_min", label: "60 min — typical simplified" },
              { value: "90_min", label: "90 min — most Vedic ceremonies" },
              { value: "120_min", label: "2 hrs — full traditional" },
              { value: "no_time_pressure", label: "As long as it takes" },
            ],
          },
          {
            kind: "single_select",
            path: "language_preference",
            label: "Language balance",
            helper: "How should mantras and explanation blend?",
            options: [
              {
                value: "sanskrit_english",
                label: "Sanskrit mantras + English explanation",
              },
              {
                value: "sanskrit_hindi",
                label: "Sanskrit mantras + Hindi explanation",
              },
              {
                value: "mostly_english",
                label: "Mostly English · Sanskrit for key mantras",
              },
              { value: "full_sanskrit", label: "Full Sanskrit (no translation)" },
              { value: "regional", label: "Regional language" },
            ],
          },
          {
            kind: "single_select",
            path: "guest_participation",
            label: "Guest participation",
            helper: "How involved should your guests be?",
            options: [
              {
                value: "observe_quietly",
                label: "Observe quietly (traditional)",
              },
              {
                value: "participate_key_moments",
                label: "Participate in key moments",
              },
              {
                value: "fully_interactive",
                label: "Fully interactive with emcee-style explanation",
              },
              { value: "mixed", label: "Mixed — some observed, some participated" },
            ],
          },
        ],
      },
      {
        key: "ceremony_brief",
        index: 2,
        fields: [
          {
            kind: "list_text",
            path: "special_requests",
            label: "Special requests for your pandit",
            placeholder:
              "Please explain each phera meaning, keep under 90 minutes…",
          },
          {
            kind: "brief",
            path: "brief_text",
            label: "Your ceremony brief",
            // AI-generated cultural-context paragraph the couple shares with
            // officiant candidates. Build (priest:build) handles the ritual-
            // by-ritual decisions and operational details.
            draftCues: [
              "ceremony_traditions.broad_tradition",
              "ceremony_traditions.specific_tradition",
              "ceremony_traditions.ceremony_length_preference",
              "ceremony_traditions.language_preference",
              "ceremony_traditions.guest_participation",
            ],
          },
        ],
      },
    ],
  },

  // ── Stationery & Invitations (5 sessions) ────────────────────────────
  // Mirrors the Vision & Mood + Suite Builder + Inspiration tabs of the
  // full workspace. Each guided session drives a curated subset of the
  // same input space — the full workspace stays the place to go deep.
  stationery: {
    category: "stationery",
    sessions: [
      {
        key: "visual_identity",
        index: 1,
        fields: [
          {
            kind: "keyword_chips",
            path: "style_keywords",
            label: "Style language",
            helper: "Tap the words that describe how the paper should feel.",
            allowCustom: true,
            suggestions: [
              "letterpress",
              "minimalist",
              "gold-foil",
              "botanical",
              "hand-lettered",
              "vintage",
              "modern-clean",
              "textured",
              "watercolour",
              "monogram",
            ],
          },
          {
            kind: "intensity_slider",
            path: "colour_tone_score",
            label: "Tone & temperature",
            helper:
              "Slide warm-to-cool. Your designer reads the position, not the exact value.",
            lowLabel: "Warm ivory",
            highLabel: "Cool linen",
            toneWords: ["Warm ivory", "Neutral cream", "Cool linen"],
            default: 50,
          },
          {
            kind: "single_select",
            path: "typography_vibe",
            label: "Typography vibe",
            helper: "Your type voice — the one your invitations speak in.",
            options: [
              { value: "classic_serif", label: "Classic serif" },
              { value: "modern_sans", label: "Modern sans" },
              { value: "calligraphic", label: "Calligraphic" },
              { value: "mix", label: "Mix" },
            ],
          },
          {
            kind: "boolean",
            path: "bilingual",
            label: "Bilingual stationery",
          },
          {
            kind: "keyword_chips",
            path: "script_languages",
            label: "Script languages",
            helper: "Pick the scripts your stationery should carry.",
            allowCustom: true,
            suggestions: [
              "hindi",
              "gujarati",
              "tamil",
              "punjabi",
              "urdu",
              "english",
              "telugu",
              "marathi",
            ],
          },
          {
            kind: "keyword_chips",
            path: "motif_preferences",
            label: "Motifs & patterns",
            helper: "The decorative language of the suite.",
            allowCustom: true,
            suggestions: [
              "paisley",
              "lotus",
              "elephant",
              "peacock",
              "geometric",
              "floral",
              "mandala",
              "none",
            ],
          },
        ],
      },
      {
        key: "paper_and_palette",
        index: 2,
        fields: [
          {
            kind: "single_select",
            path: "paper_stock",
            label: "Paper & texture",
            helper: "How should the paper feel in-hand?",
            options: [
              { value: "cotton_heavyweight", label: "Cotton · Heavyweight" },
              { value: "linen_textured", label: "Linen · Textured" },
              { value: "vellum_translucent", label: "Vellum · Translucent" },
              { value: "shimmer_pearl", label: "Shimmer · Pearl Finish" },
            ],
          },
          {
            kind: "single_select",
            path: "colour_palette_source",
            label: "Colour palette source",
            helper:
              "Pull through your wedding palette from Décor, or set its own.",
            options: [
              { value: "from_decor", label: "From Décor — flow it through" },
              { value: "diverged", label: "Diverge — set its own palette" },
              { value: "custom", label: "Custom — start from scratch" },
            ],
          },
          {
            kind: "color_palette",
            path: "custom_palette",
            label: "Custom palette",
            helper:
              "Only used if you diverge or start from scratch. Add a few hex values.",
            buckets: [
              { key: "primary", label: "Primary" },
              { key: "accent", label: "Accent" },
            ],
          },
          {
            kind: "keyword_chips",
            path: "material_preferences",
            label: "Material preferences",
            helper: "Treatments and finishes you're drawn to.",
            allowCustom: true,
            suggestions: [
              "letterpress",
              "foil_stamped",
              "handmade_paper",
              "acrylic",
              "fabric",
              "laser_cut",
              "thermography",
            ],
          },
        ],
      },
      {
        key: "stationery_suite",
        index: 3,
        fields: [
          {
            kind: "multi_select",
            path: "pre_wedding_pieces",
            label: "Pre-wedding pieces",
            helper:
              "Everything that arrives at your guests' homes before the first event.",
            options: [
              { value: "save_the_date", label: "Save the Date" },
              { value: "main_invitation", label: "Main Invitation" },
              { value: "rsvp_card", label: "RSVP Card" },
              { value: "details_card", label: "Details & Dress Code" },
              { value: "mehendi_insert", label: "Mehendi Insert" },
              { value: "sangeet_insert", label: "Sangeet Insert" },
              { value: "reception_insert", label: "Reception Insert" },
              { value: "map_card", label: "Map / Directions" },
              { value: "accommodation_card", label: "Accommodation" },
              { value: "envelope_outer", label: "Outer Envelope" },
              { value: "belly_band", label: "Belly Band + Wax Seal" },
            ],
          },
          {
            kind: "multi_select",
            path: "day_of_pieces",
            label: "Day-of pieces",
            helper:
              "Every piece a guest touches or reads during the wedding itself.",
            options: [
              { value: "ceremony_program", label: "Ceremony Program" },
              { value: "menu_card", label: "Menu Cards" },
              { value: "welcome_bag_insert", label: "Welcome Bag Insert" },
              { value: "place_card", label: "Place / Escort Cards" },
              { value: "table_number", label: "Table Numbers / Names" },
              { value: "seating_chart", label: "Seating Chart Display" },
            ],
          },
          {
            kind: "multi_select",
            path: "post_wedding_pieces",
            label: "Post-wedding pieces",
            helper:
              "Thank-yous and the small follow-through that keeps the feeling going.",
            options: [
              { value: "thank_you_card", label: "Thank You Cards" },
              { value: "at_home_card", label: "At-Home Card" },
              { value: "favor_tag", label: "Favor Tags / Mithai Box" },
            ],
          },
          {
            kind: "single_select",
            path: "digital_vs_physical",
            label: "Overall preference",
            helper:
              "Where the suite lives. The full workspace lets you tune this per piece.",
            options: [
              { value: "all_physical", label: "All physical" },
              { value: "all_digital", label: "All digital" },
              { value: "mix", label: "Mix" },
            ],
          },
        ],
      },
      {
        key: "stationery_inspiration",
        index: 4,
        fields: [
          {
            kind: "image_list",
            path: "moodboard_pins",
            label: "Pins on your moodboard",
            helper:
              "Drop in a few references. Tag the part of each pin that pulled you in.",
            tagOptions: [
              "typography",
              "texture",
              "layout",
              "colour",
              "detail",
            ],
          },
          {
            kind: "list_text",
            path: "wishlist_notes",
            label: "I keep coming back to…",
            helper:
              "Free-text descriptions of details you can't get out of your head. Your designer reads these.",
            placeholder:
              "e.g. The envelope with the hand-painted floral liner I saw on Instagram…",
          },
        ],
      },
      {
        key: "stationery_brief",
        index: 5,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your stationery brief",
            helper:
              "We've stitched a starter from your earlier answers. Read, tweak, lock it in.",
            draftCues: [
              "visual_identity.style_keywords",
              "visual_identity.motif_preferences",
              "paper_and_palette.paper_stock",
              "stationery_suite.pre_wedding_pieces",
            ],
          },
        ],
      },
    ],
  },

  // ── Venue (4 sessions) ───────────────────────────────────────────────
  // Sessions 1-3 use bespoke React bodies that read/write the venue-store
  // directly (see VENUE_CUSTOM_SESSION_BODIES). The schema fields are
  // retained for hasData/summary detection inside formData mirrors.
  venue: {
    category: "venue",
    sessions: [
      {
        key: "venue_discovery",
        index: 1,
        fields: [
          {
            kind: "list_text",
            path: "quiz_completed_steps",
            label: "Quiz progress",
          },
          {
            kind: "list_text",
            path: "loved_directions",
            label: "Directions you love",
          },
          {
            kind: "list_text",
            path: "loved_inspiration",
            label: "Inspiration you've reacted to",
          },
        ],
      },
      {
        key: "venue_priorities",
        index: 2,
        fields: [
          {
            kind: "list_text",
            path: "priorities",
            label: "What matters most",
          },
          {
            kind: "list_text",
            path: "definitely_want",
            label: "I definitely want",
          },
          {
            kind: "list_text",
            path: "not_for_us",
            label: "Not for us",
          },
          {
            kind: "single_select",
            path: "single_vs_multi_venue",
            label: "Venue strategy",
            options: [
              { value: "single", label: "Single venue, all events" },
              { value: "multiple", label: "Multiple venues" },
            ],
          },
          {
            kind: "list_text",
            path: "location_preferences",
            label: "Location preferences",
            placeholder: "City or region…",
          },
          {
            kind: "number",
            path: "budget_range.min",
            label: "Budget min",
          },
          {
            kind: "number",
            path: "budget_range.max",
            label: "Budget max",
          },
          {
            kind: "number",
            path: "guest_count.smallest_event",
            label: "Smallest event guest count",
          },
          {
            kind: "number",
            path: "guest_count.largest_event",
            label: "Largest event guest count",
          },
        ],
      },
      {
        key: "venue_requirements",
        index: 3,
        fields: [
          {
            kind: "single_select",
            path: "indoor_outdoor",
            label: "Indoor / outdoor",
            options: [
              { value: "indoor", label: "Indoor" },
              { value: "outdoor", label: "Outdoor" },
              { value: "both", label: "Both" },
              { value: "flexible", label: "Flexible" },
            ],
          },
          {
            kind: "single_select",
            path: "catering_policy_preference",
            label: "Catering policy",
            options: [
              { value: "in_house_fine", label: "In-house is fine" },
              {
                value: "outside_required",
                label: "Outside catering required",
              },
              { value: "no_preference", label: "No preference" },
            ],
          },
          {
            kind: "boolean",
            path: "fire_ceremony_needed",
            label: "Fire ceremony / havan kund needed",
          },
          {
            kind: "single_select",
            path: "alcohol_policy_preference",
            label: "Alcohol policy",
            options: [
              { value: "full_bar", label: "Full bar" },
              { value: "beer_wine", label: "Beer & wine" },
              { value: "byob", label: "BYOB" },
              { value: "dry", label: "Dry" },
              { value: "no_preference", label: "No preference" },
            ],
          },
          {
            kind: "single_select",
            path: "accommodation_preference",
            label: "Accommodation preference",
            options: [
              { value: "on_site", label: "On site" },
              { value: "nearby", label: "Nearby" },
              { value: "not_important", label: "Not important" },
            ],
          },
          {
            kind: "list_text",
            path: "accessibility_requirements",
            label: "Accessibility requirements",
          },
          {
            kind: "boolean",
            path: "rain_plan_needed",
            label: "Rain plan needed",
          },
          {
            kind: "textarea",
            path: "setup_teardown_needs",
            label: "Setup / teardown",
            placeholder: "Need full day before for decor setup…",
            rows: 2,
          },
        ],
      },
      {
        key: "venue_brief",
        index: 4,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your venue brief",
            draftCues: [
              "venue_priorities.priorities",
              "venue_priorities.definitely_want",
              "venue_requirements.catering_policy_preference",
            ],
          },
        ],
      },
    ],
  },

  // ── Wardrobe & Styling (4 sessions) ──────────────────────────────────
  // ── Wardrobe & Styling Vision (3 sessions) ───────────────────────────
  // Style direction + per-event palette → moodboard with role tags +
  // per-event references → brief. Family coordination and the outfit
  // matrix moved to the Build journey (`journey_id = "build"`). Schema
  // shape mirrors the canonical Vision tab in
  // `components/workspace/wardrobe/VisionMoodTab.tsx`.
  wardrobe: {
    category: "wardrobe",
    sessions: [
      {
        key: "wardrobe_style",
        index: 1,
        fields: [
          {
            kind: "keyword_chips",
            path: "style_keywords",
            label: "Style keywords",
            helper: "Tap the words that describe your wardrobe identity.",
            allowCustom: true,
            suggestions: [
              "traditional",
              "contemporary",
              "fusion",
              "royal",
              "minimalist",
              "maximalist",
              "heritage",
              "statement",
              "editorial",
              "intricate",
              "clean_modern",
              "romantic",
              "bold",
              "soft",
              "draped",
              "structured",
            ],
          },
          {
            kind: "list_text",
            path: "designer_preferences",
            label: "Designer preferences",
            placeholder:
              "Sabyasachi, Anita Dongre, Tarun Tahiliani — or 'open to suggestions'…",
          },
          // Per-event palette: each event holds 3 swatches. The Vision tab
          // renders these as hex chips with a "Reset to defaults" CTA. The
          // schema captures the shape; defaults seed from
          // `lib/libraries/event-palette-defaults`.
          {
            kind: "list_object",
            path: "palette_by_event",
            label: "Your wardrobe colour story",
            helper:
              "Coordinate across events so your photos have a visual arc.",
            titleField: "event",
            presetRows: [
              { event: "haldi" },
              { event: "mehendi" },
              { event: "sangeet" },
              { event: "wedding" },
              { event: "reception" },
            ],
            itemFields: [
              {
                kind: "single_select",
                path: "event",
                label: "Event",
                options: [
                  { value: "haldi", label: "Haldi" },
                  { value: "mehendi", label: "Mehendi" },
                  { value: "sangeet", label: "Sangeet" },
                  { value: "wedding", label: "Wedding" },
                  { value: "reception", label: "Reception" },
                  { value: "other", label: "Other" },
                ],
              },
              {
                kind: "list_text",
                path: "swatches",
                label: "Hex swatches",
                placeholder: "#B91C1C",
              },
            ],
          },
          {
            kind: "single_select",
            path: "coordination_style",
            label: "How you coordinate",
            options: [
              { value: "matching", label: "Matching" },
              { value: "complementary", label: "Complementary" },
              { value: "independent", label: "Independent" },
            ],
          },
          {
            kind: "single_select",
            path: "shopping_status",
            label: "Where you are with shopping",
            options: [
              { value: "not_started", label: "Not started" },
              { value: "browsing", label: "Browsing" },
              { value: "some_purchased", label: "Some purchased" },
              { value: "mostly_done", label: "Mostly done" },
            ],
          },
        ],
      },
      {
        key: "wardrobe_inspiration",
        index: 2,
        fields: [
          // Style moodboard with role tagging — same shape the Vision tab
          // builds via useWorkspaceStore.moodboard.
          {
            kind: "image_list",
            path: "moodboard_pins",
            label: "Style moodboard",
            helper:
              "Paste URLs or upload photos. Tag each pin so your designer knows whose look it is.",
            tagOptions: [
              "bride",
              "groom",
              "bridesmaids",
              "family",
              "accessories",
            ],
          },
          // Per-event reference gallery with Love / No reactions.
          {
            kind: "list_object",
            path: "per_event_references",
            label: "Reference looks by event",
            helper: "Browse references, react to what speaks to you.",
            titleField: "event",
            presetRows: [
              { event: "haldi" },
              { event: "mehendi" },
              { event: "sangeet" },
              { event: "wedding" },
              { event: "reception" },
            ],
            itemFields: [
              {
                kind: "single_select",
                path: "event",
                label: "Event",
                options: [
                  { value: "haldi", label: "Haldi" },
                  { value: "mehendi", label: "Mehendi" },
                  { value: "sangeet", label: "Sangeet" },
                  { value: "wedding", label: "Wedding" },
                  { value: "reception", label: "Reception" },
                ],
              },
              {
                kind: "textarea",
                path: "notes",
                label: "Per-event reference notes",
                rows: 2,
                placeholder:
                  "Crimson bridal lehenga with zardozi · ivory sherwani for groom…",
              },
            ],
          },
        ],
      },
      {
        key: "wardrobe_brief",
        index: 3,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your wardrobe brief",
            helper:
              "Not the specific outfits — the overall arc. Heritage, statement, comfort, family tradition?",
            draftCues: [
              "wardrobe_style.style_keywords",
              "wardrobe_style.designer_preferences",
              "wardrobe_inspiration.per_event_references",
            ],
          },
          {
            kind: "multi_select",
            path: "brief_themes",
            label: "Brief themes",
            options: [
              { value: "heritage", label: "Heritage" },
              { value: "statement", label: "Statement" },
              { value: "comfort", label: "Comfort" },
              { value: "family_tradition", label: "Family tradition" },
              { value: "modernity", label: "Modernity" },
              { value: "romance", label: "Romance" },
            ],
          },
        ],
      },
    ],
  },

  // ── Jewelry (3 sessions) ─────────────────────────────────────────────
  jewelry: {
    category: "jewelry",
    sessions: [
      {
        key: "jewelry_direction",
        index: 1,
        fields: [
          {
            kind: "keyword_chips",
            path: "style_keywords",
            label: "Style keywords",
            helper: "Pick the words that feel like the jewelry version of you.",
            allowCustom: true,
            suggestions: [
              "kundan",
              "polki",
              "temple",
              "jadau",
              "diamond",
              "minimalist",
              "statement",
              "vintage",
              "layered",
              "delicate",
              "uncut_diamond",
              "pearl",
              "meenakari",
              "antique_gold",
              "rose_gold",
              "platinum",
              "fusion",
              "contemporary",
              "rani_haar",
              "choker_forward",
            ],
          },
          {
            kind: "multi_select",
            path: "direction.base_metals",
            label: "Base metal & material",
            helper: "Step 1 of 3. Pick all that apply.",
            options: [
              { value: "gold", label: "Gold" },
              { value: "silver", label: "Silver" },
              { value: "diamond", label: "Diamond" },
              { value: "platinum_white_gold", label: "Platinum / white gold" },
            ],
          },
          {
            kind: "multi_select",
            path: "direction.style_families",
            label: "Style family",
            helper: "Step 2 of 3. Picks shown depend on the metals you chose.",
            options: [
              { value: "traditional_kundan_polki", label: "Traditional kundan & polki" },
              { value: "temple", label: "Temple" },
              { value: "jadau_meenakari", label: "Jadau & meenakari" },
              { value: "modern_diamond", label: "Modern diamond" },
              { value: "minimalist_delicate", label: "Minimalist & delicate" },
              { value: "fusion_indo_western", label: "Fusion · Indo-western" },
              { value: "heirloom_revival", label: "Heirloom revival" },
            ],
          },
          {
            kind: "single_select",
            path: "direction.weight_vibe",
            label: "Weight & vibe",
            helper: "Step 3 of 3. The energy of the pieces, not just the look.",
            options: [
              { value: "simple_delicate", label: "Simple & delicate" },
              { value: "heavy_statement", label: "Heavy statement" },
              { value: "traditional_modern_twist", label: "Traditional with a modern twist" },
              { value: "fully_traditional_heritage", label: "Fully traditional heritage" },
            ],
          },
          {
            kind: "single_select",
            path: "budget_priority",
            label: "Budget priority",
            options: [
              { value: "invest_in_few", label: "Invest in a few standout pieces" },
              { value: "variety_across_events", label: "Variety across events" },
              { value: "minimal_spend", label: "Minimal spend" },
            ],
          },
          {
            kind: "boolean",
            path: "sourcing_mix.new_purchases",
            label: "Shopping for new pieces",
          },
          {
            kind: "boolean",
            path: "sourcing_mix.family_heirlooms",
            label: "Borrowing or inheriting family heirlooms",
          },
          {
            kind: "boolean",
            path: "sourcing_mix.rentals",
            label: "Open to renting one-time-wear pieces",
          },
          {
            kind: "boolean",
            path: "sourcing_mix.custom_designed",
            label: "Commissioning custom pieces",
          },
        ],
      },
      {
        key: "jewelry_inspiration",
        index: 2,
        fields: [
          {
            kind: "image_list",
            path: "moodboard_pins",
            label: "Moodboard",
            helper: "Pin what you love. Tag each pin with the piece type.",
            tagOptions: [
              "necklace",
              "earrings",
              "maang_tikka",
              "haath_phool",
              "nath",
              "bangles",
              "rings",
              "groom",
              "all",
            ],
          },
          {
            kind: "list_object",
            path: "expression_wishlist",
            label: "Expression & moment wishlist",
            helper: "Sentences that capture how you want a moment to feel.",
            titleField: "moment",
            itemFields: [
              {
                kind: "text",
                path: "moment",
                label: "Moment",
                placeholder:
                  "I want everyone to gasp when I walk out for the pheras.",
              },
            ],
          },
          {
            kind: "list_object",
            path: "outfit_pairing_anchors",
            label: "Outfit pairing anchors",
            helper:
              "Early pairing intent — full canvas comes in the Build journey.",
            titleField: "intent_note",
            itemFields: [
              {
                kind: "single_select",
                path: "person",
                label: "Person",
                options: [
                  { value: "bride", label: "Bride" },
                  { value: "groom", label: "Groom" },
                ],
              },
              {
                kind: "single_select",
                path: "event",
                label: "Event",
                options: [
                  { value: "haldi", label: "Haldi" },
                  { value: "mehendi", label: "Mehendi" },
                  { value: "sangeet", label: "Sangeet" },
                  { value: "wedding", label: "Wedding" },
                  { value: "reception", label: "Reception" },
                ],
              },
              {
                kind: "text",
                path: "intent_note",
                label: "Intent note",
                placeholder:
                  "Heritage choker mood — heavy, regal, single hero piece.",
              },
            ],
          },
        ],
      },
      {
        key: "jewelry_brief",
        index: 3,
        fields: [
          {
            kind: "boolean",
            path: "insurance_needed",
            label: "Insurance needed",
          },
          {
            kind: "number",
            path: "total_estimated_value_range.low",
            label: "Estimated total value · low",
            placeholder: "USD",
            min: 0,
          },
          {
            kind: "number",
            path: "total_estimated_value_range.high",
            label: "Estimated total value · high",
            placeholder: "USD",
            min: 0,
          },
          {
            kind: "brief",
            path: "brief_text",
            label: "Your jewelry brief",
            draftCues: [
              "jewelry_direction.style_keywords",
              "jewelry_direction.direction.style_families",
              "jewelry_inspiration.expression_wishlist",
              "jewelry_inspiration.outfit_pairing_anchors",
            ],
          },
        ],
      },
    ],
  },

  // ── Cake & Sweets (3 sessions) ───────────────────────────────────────
  cake_sweets: {
    category: "cake_sweets",
    sessions: [
      {
        key: "sweets_vision",
        index: 1,
        fields: [
          {
            kind: "keyword_chips",
            path: "sweets_types",
            label: "Sweets types",
            suggestions: [
              "wedding_cake",
              "mithai_display",
              "dessert_table",
              "late_night_sweets",
              "individual_favours",
            ],
          },
          {
            kind: "single_select",
            path: "cake_style",
            label: "Cake style",
            options: [
              { value: "tiered_classic", label: "Tiered classic" },
              { value: "naked_rustic", label: "Naked / rustic" },
              { value: "fondant_sculptural", label: "Fondant / sculptural" },
              { value: "modern_minimal", label: "Modern minimal" },
              { value: "no_cake", label: "No cake" },
            ],
          },
          {
            kind: "keyword_chips",
            path: "cake_flavours",
            label: "Cake flavours",
            allowCustom: true,
            suggestions: [
              "chocolate",
              "vanilla",
              "red_velvet",
              "pistachio",
              "mango",
              "cardamom",
              "rose",
              "saffron",
            ],
          },
          {
            kind: "keyword_chips",
            path: "mithai_preferences",
            label: "Mithai preferences",
            allowCustom: true,
            suggestions: [
              "gulab_jamun",
              "rasgulla",
              "barfi",
              "ladoo",
              "jalebi",
              "peda",
              "kaju_katli",
              "kheer",
            ],
          },
          {
            kind: "keyword_chips",
            path: "dietary_sweets",
            label: "Dietary",
            suggestions: [
              "sugar_free_options",
              "vegan_options",
              "nut_free",
              "gluten_free",
            ],
          },
          {
            kind: "keyword_chips",
            path: "design_keywords",
            label: "Design direction",
            allowCustom: true,
            suggestions: [
              "minimal",
              "ornate",
              "florals",
              "metallic",
              "watercolour",
              "modern",
            ],
          },
          {
            kind: "list_object",
            path: "per_event",
            label: "Sweets per event",
            titleField: "event_name",
            presetRows: STANDARD_EVENTS,
            itemFields: [
              { kind: "text", path: "event_name", label: "Event" },
              {
                kind: "list_text",
                path: "sweets_planned",
                label: "Sweets planned",
              },
            ],
          },
        ],
      },
      {
        key: "sweets_inspiration",
        index: 2,
        fields: [
          {
            kind: "image_list",
            path: "inspiration_images",
            label: "Cakes & displays that inspire you",
            tagOptions: [
              "cake",
              "mithai",
              "dessert_table",
              "display",
              "packaging",
            ],
          },
        ],
      },
      {
        key: "sweets_brief",
        index: 3,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your sweets brief",
            draftCues: [
              "sweets_vision.sweets_types",
              "sweets_vision.cake_style",
              "sweets_vision.mithai_preferences",
            ],
          },
        ],
      },
    ],
  },

  // ── Transportation (2 sessions) ──────────────────────────────────────
  // Vision phase. Operational depth — baraat walkthrough, shuttle math,
  // fleet roster — lives in the Build journey ("transportation:build").
  transportation: {
    category: "transportation",
    sessions: [
      {
        key: "transport_needs",
        index: 1,
        fields: [
          {
            kind: "keyword_chips",
            path: "services_needed",
            label: "Services needed",
            suggestions: [
              "guest_shuttles",
              "bridal_car",
              "baraat_vehicle",
              "baraat_horse",
              "getaway_car",
              "airport_transfers",
              "vendor_transport",
            ],
          },
          // ── Couple arrivals ────────────────────────────────────────
          // Mirrors Tab 1 "The couple" section. Four moments — bride
          // in, groom in, between events, send-off out.
          {
            kind: "single_select",
            path: "couple_arrivals.bride_arrival",
            label: "Bride arrival",
            options: [
              { value: "bridal_car", label: "Bridal car" },
              { value: "limo", label: "Limo" },
              { value: "vintage_car", label: "Vintage car" },
              { value: "horse_carriage", label: "Horse carriage" },
              { value: "walking", label: "Walking" },
              { value: "other", label: "Other" },
              { value: "tbd", label: "TBD" },
            ],
          },
          {
            kind: "single_select",
            path: "couple_arrivals.groom_arrival",
            label: "Groom arrival",
            options: [
              { value: "horse_and_car", label: "Horse + car" },
              { value: "horse_only", label: "Horse only" },
              { value: "vintage_car", label: "Vintage car" },
              { value: "limo", label: "Limo" },
              { value: "walking", label: "Walking" },
              { value: "elephant", label: "Elephant" },
              { value: "other", label: "Other" },
              { value: "tbd", label: "TBD" },
            ],
          },
          {
            kind: "single_select",
            path: "couple_arrivals.between_events",
            label: "Between events",
            options: [
              { value: "shuttle_between_venues", label: "Shuttle between venues" },
              { value: "private_car", label: "Private car" },
              { value: "self_drive", label: "Self-drive" },
              { value: "na", label: "Not applicable" },
              { value: "tbd", label: "TBD" },
            ],
          },
          {
            kind: "single_select",
            path: "couple_arrivals.send_off_exit",
            label: "Send-off / exit",
            options: [
              { value: "vintage_car", label: "Vintage car" },
              { value: "decorated_car", label: "Decorated car" },
              { value: "limo", label: "Limo" },
              { value: "getaway_car", label: "Getaway car" },
              { value: "fireworks_only", label: "Fireworks only" },
              { value: "none", label: "Not doing an exit" },
              { value: "tbd", label: "TBD" },
            ],
          },
          // ── Baraat intent (operational details live in Build) ─────
          {
            kind: "boolean",
            path: "baraat_intent.happening",
            label: "Baraat happening",
          },
          {
            kind: "single_select",
            path: "baraat_intent.style",
            label: "Baraat style",
            options: [
              { value: "horse", label: "Horse" },
              { value: "vintage_car", label: "Vintage car" },
              { value: "convertible", label: "Convertible" },
              { value: "walking", label: "Walking" },
              { value: "elephant", label: "Elephant" },
              { value: "tbd", label: "TBD" },
              { value: "none", label: "None" },
            ],
          },
          {
            kind: "boolean",
            path: "baraat_intent.dhol_with_baraat",
            label: "Dhol with baraat",
          },
          {
            kind: "textarea",
            path: "baraat_intent.dream_note",
            label: "What should it feel like?",
            rows: 2,
            placeholder: "Want it to feel like a Bollywood entrance",
          },
          // ── Guest shuttle intent (counts live in Build) ───────────
          {
            kind: "boolean",
            path: "guest_shuttle_intent.needed",
            label: "Guest shuttle needed",
          },
          {
            kind: "boolean",
            path: "guest_shuttle_intent.return_service",
            label: "Return service",
          },
          {
            kind: "boolean",
            path: "guest_shuttle_intent.late_night_service",
            label: "Late-night service after reception",
          },
          {
            kind: "number",
            path: "guest_shuttle_intent.rough_guest_count",
            label: "Rough guest count needing shuttle",
            placeholder: "60",
          },
          // ── Getaway car ────────────────────────────────────────────
          {
            kind: "boolean",
            path: "getaway_car.wanted",
            label: "Getaway car wanted",
          },
          {
            kind: "text",
            path: "getaway_car.style_preference",
            label: "Getaway car style",
            placeholder: "Vintage Rolls Royce, decorated SUV…",
          },
          // ── Vendor transport flags (early signal for Build) ───────
          {
            kind: "boolean",
            path: "vendor_transport_flags.dhol_players_need_transport",
            label: "Dhol players need transport",
          },
          {
            kind: "boolean",
            path: "vendor_transport_flags.other_vendors_need_transport",
            label: "Other vendors need transport",
          },
          {
            kind: "text",
            path: "vendor_transport_flags.notes",
            label: "Vendor transport notes",
            placeholder: "Florist van, DJ truck…",
          },
          {
            kind: "textarea",
            path: "notes",
            label: "Notes",
            rows: 3,
          },
        ],
      },
      {
        key: "transport_brief",
        index: 2,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your transport brief",
            draftCues: [
              "transport_needs.services_needed",
              "transport_needs.couple_arrivals",
              "transport_needs.baraat_intent",
              "transport_needs.guest_shuttle_intent",
            ],
          },
        ],
      },
    ],
  },

  // ── Travel & Accommodations (3 sessions) ─────────────────────────────
  // Vision phase. Guides the couple through guest math, proximity, block
  // strategy, and budget approach so the operational Build journey has a
  // clear starting point. Schema mirrors HotelStrategyTab on Tab 1 of the
  // Travel workspace.
  travel: {
    category: "travel",
    sessions: [
      {
        key: "accommodation_needs",
        index: 1,
        fields: [
          // Guest math
          {
            kind: "number",
            path: "guest_math.out_of_town_guests",
            label: "Out-of-town guests",
            helper: "Concrete count from your guest workspace.",
          },
          {
            kind: "number",
            path: "guest_math.nights_needed",
            label: "Nights needed",
            helper: "Typically 3 for Indian weddings.",
          },
          {
            kind: "text",
            path: "guest_math.dates_window",
            label: "Dates window",
            placeholder: "e.g. Apr 10–12, 2026",
          },
          {
            kind: "number",
            path: "guest_math.rooms_needed",
            label: "Rooms needed",
            helper: "Defaults to a 1.9 guests/room estimate. Override for families or suites.",
          },
          {
            kind: "number",
            path: "guest_math.rooms_per_room_estimate",
            label: "Guests per room (estimate)",
            helper: "Default 1.9. Override if more families are doubling up.",
          },

          // Proximity
          {
            kind: "single_select",
            path: "proximity.on_site_rooms_at_venue",
            label: "On-site rooms at venue?",
            options: [
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "not_sure_yet", label: "Not sure yet" },
            ],
          },
          {
            kind: "textarea",
            path: "proximity.on_site_details",
            label: "On-site details",
            placeholder: "How many rooms on-site, any suites, who gets priority…",
            rows: 2,
          },
          {
            kind: "list_text",
            path: "proximity.nearby_hotels",
            label: "Nearby hotels (within ~10 min)",
            placeholder: "List options you're considering. One per line.",
          },
          {
            kind: "boolean",
            path: "proximity.shuttle_needed_between_hotel_and_venue",
            label: "Shuttle needed between hotel and venue",
            helper: "Cross-link to Transportation if true.",
          },

          // Block strategy
          {
            kind: "single_select",
            path: "block_strategy",
            label: "Block strategy",
            options: [
              { value: "single", label: "Single — all guests at one hotel" },
              { value: "two_tier", label: "Two-tier — premium + standard" },
              { value: "multiple_hotels", label: "Multiple — guests choose 2–3 options" },
            ],
          },
          {
            kind: "textarea",
            path: "block_strategy_note",
            label: "Block strategy note",
            placeholder: "Anything you want your planner to know about this choice.",
            rows: 2,
          },

          // Budget approach — the most important early decision.
          {
            kind: "single_select",
            path: "budget_approach",
            label: "Budget approach",
            helper: "Lock this early — it changes negotiation and what guests see in their invite.",
            options: [
              { value: "couple_covers_all", label: "Couple covers all rooms" },
              {
                value: "couple_covers_family_guests_pay",
                label: "Couple covers family, guests pay their own",
              },
              {
                value: "negotiated_rate_guests_pay",
                label: "Negotiated group rate, guests pay",
              },
              {
                value: "mixed_couple_covers_elders",
                label: "Mixed — couple covers elders, group rate for rest",
              },
            ],
          },
          {
            kind: "textarea",
            path: "budget_approach_notes",
            label: "Budget notes",
            placeholder: "covering Nani and Nana fully, group rate for cousins, $200/night cap…",
            rows: 2,
          },

          // Early flags
          {
            kind: "number",
            path: "family_suites_needed",
            label: "Family suites needed",
            helper: "For immediate family.",
          },
          {
            kind: "boolean",
            path: "hospitality_suite",
            label: "Hospitality suite",
            helper: "A common room for family to gather.",
          },
          {
            kind: "boolean",
            path: "welcome_bags",
            label: "Welcome bags",
            helper: "Flag only — actual welcome bag inventory lives in Gifting.",
          },
        ],
      },
      {
        key: "guest_travel",
        index: 2,
        fields: [
          {
            kind: "boolean",
            path: "destination_wedding",
            label: "Destination wedding",
          },
          {
            kind: "boolean",
            path: "group_flights_interest",
            label: "Group flights",
          },
          {
            kind: "boolean",
            path: "airport_transfer_needed",
            label: "Airport transfers",
          },
          {
            kind: "boolean",
            path: "travel_info_page",
            label: "Create a guest travel info page",
          },
          {
            kind: "list_text",
            path: "key_airports",
            label: "Key airports",
          },
          {
            kind: "boolean",
            path: "visa_info_needed",
            label: "Visa info needed (international guests)",
          },
          {
            kind: "list_text",
            path: "pre_wedding_activities",
            label: "Pre-wedding activities",
            placeholder: "Golf day, city tour, spa day…",
          },
          // Early signal for Build's guest travel tracker.
          {
            kind: "list_text",
            path: "guest_source_cities",
            label: "Guest source cities",
            placeholder: "Mumbai, Bangalore, Houston, London…",
          },
          {
            kind: "number",
            path: "international_guest_count_estimate",
            label: "International guest count (estimate)",
          },
          {
            kind: "textarea",
            path: "notes",
            label: "Notes",
            rows: 3,
          },
        ],
      },
      {
        key: "travel_brief",
        index: 3,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your travel brief",
            draftCues: [
              "accommodation_needs.block_strategy",
              "accommodation_needs.budget_approach",
              "guest_travel.destination_wedding",
            ],
          },
        ],
      },
    ],
  },

  // ── Gifting (Vision: 3 sessions) ─────────────────────────────────────
  // Revised: Session 1 captures style direction with reactions and per-
  // category budget anchors (matching Tab 1's 5-card picker and 4-category
  // chip set). Session 2 swaps from operational details to inspiration —
  // ideas browser reactions, moodboard, palette, notes. Session 3 keeps
  // the brief.
  //
  // The bespoke widgets (5-card style picker, 4-category × 4-chip budget
  // anchors, ideas browser with sub-tab filtering, moodboard) live on Tab
  // 1 and write directly through useWorkspaceStore. The schema entries
  // below stay intentionally lean — Tab 1 is the source of truth for
  // those widgets, and the journey shell defers to it via bodyOverride.
  // The minimal fields below cover any free-text intent that isn't
  // captured by the bespoke widgets, plus the brief.
  gifting: {
    category: "gifting",
    sessions: [
      {
        key: "gifting_philosophy",
        index: 1,
        fields: [
          {
            kind: "keyword_chips",
            path: "gift_types_planned",
            label: "Gift types planned",
            helper: "Pick every category you'll have at your wedding.",
            suggestions: [
              "welcome_bags",
              "return_favors",
              "family_exchanges",
              "trousseau_packaging",
              "bridal_party_gifts",
              "vendor_thank_yous",
            ],
          },
          {
            kind: "keyword_chips",
            path: "family_gift_traditions",
            label: "Family gift traditions",
            helper:
              "The exchanges your families expect — Build's family-exchange section seeds from these.",
            allowCustom: true,
            suggestions: [
              "shagun",
              "milni_vevai",
              "trousseau",
              "vidaai",
              "mehendi_gifts",
              "other",
            ],
          },
          // The 5-card style direction picker and 4-category × 4-chip
          // budget anchors render from Tab 1's bespoke section. Their
          // selections persist as WorkspaceItems with meta.kind =
          // style_direction / budget_comfort, and Vision form_data
          // mirrors them at gifting_philosophy.style_direction[] and
          // gifting_philosophy.budget_anchors.{category}.
        ],
      },
      {
        key: "gifting_inspiration",
        index: 2,
        fields: [
          {
            kind: "image_list",
            path: "moodboard_pins",
            label: "Moodboard pins",
            helper:
              "Editorial welcome-bag shots, trousseau styling, favor presentations — anything that catches your eye.",
            tagOptions: [
              "welcome_bags",
              "return_favors",
              "trousseau",
              "family_exchanges",
            ],
          },
          {
            kind: "color_palette",
            path: "palette",
            label: "Palette",
            helper:
              "Three to five hexes that should run through every gift surface — bag tags, label colors, ribbon.",
            buckets: [{ key: "hexes", label: "Palette hexes" }],
          },
          {
            kind: "textarea",
            path: "vision_notes",
            label: "Notes",
            helper:
              "Anything else worth capturing — favorite vendors, family stories, ideas you can't shake.",
            rows: 3,
          },
          // The categorised idea-browser (sub-tabs Welcome bags / Return
          // favors / Trousseau / Family exchanges, with Love / Not for me
          // reactions) renders from Tab 1's bespoke section. Each
          // reaction persists as a WorkspaceItem in the matching tab,
          // and Vision form_data mirrors as
          // gifting_inspiration.idea_reactions[].
        ],
      },
      {
        key: "gifting_brief",
        index: 3,
        fields: [
          {
            kind: "brief",
            path: "brief_text",
            label: "Your gifting brief",
            draftCues: [
              "gifting_philosophy.gift_types_planned",
              "gifting_philosophy.family_gift_traditions",
              "gifting_inspiration.vision_notes",
            ],
          },
        ],
      },
    ],
  },

  // ── Guest Experiences (4 sessions) ──────────────────────────────────────
  // Sessions 2–4 are reaction/catalog/AI-driven and rendered by bespoke
  // shared components (see GuestExperiencesGuidedJourney). Their schema
  // entries are intentionally empty — the journey shell for this category
  // is custom because the schema-based field renderer can't express the
  // category-by-category catalog walkthrough or the event-mapping board.
  guest_experiences: {
    category: "guest_experiences",
    sessions: [
      {
        key: "experience_vibe",
        index: 1,
        fields: [
          {
            kind: "multi_select",
            path: "experience_priorities",
            label: "What matters most for your guests' experience?",
            helper: "Pick a few — we'll surface the categories that match first.",
            options: [
              { value: "guest_entertainment", label: "Guest entertainment" },
              { value: "photo_moments", label: "Instagram-worthy photo moments" },
              { value: "food_experiences", label: "Interactive food & drink" },
              { value: "wow_spectacles", label: "Big wow moments" },
              { value: "keepsakes", label: "Thoughtful keepsakes & favors" },
              { value: "cultural_traditions", label: "Cultural traditions & artists" },
            ],
          },
          {
            kind: "keyword_chips",
            path: "vibe_keywords",
            label: "Pick the words that fit the vibe",
            helper: "Tap as many as feel right.",
            allowCustom: true,
            suggestions: [
              "playful",
              "glamorous",
              "intimate",
              "high_energy",
              "instagram_worthy",
              "culturally_rich",
              "unexpected",
              "classic",
              "elegant",
              "fun",
              "luxurious",
              "warm",
            ],
          },
          {
            kind: "single_select",
            path: "budget_approach",
            label: "How do you want to spend?",
            helper: "There's no wrong answer — this just shapes what we surface first.",
            options: [
              {
                value: "splurge_on_few",
                label: "Splurge on a few wow moments",
              },
              {
                value: "spread_across_many",
                label: "Spread across many smaller touches",
              },
              {
                value: "no_budget_constraint",
                label: "No constraint — show me everything",
              },
            ],
          },
          {
            kind: "boolean",
            path: "guest_profile.mostly_young_crowd",
            label: "Mostly a young crowd",
          },
          {
            kind: "boolean",
            path: "guest_profile.significant_elderly",
            label: "Significant number of elderly guests",
          },
          {
            kind: "boolean",
            path: "guest_profile.many_children",
            label: "Lots of children attending",
          },
          {
            kind: "boolean",
            path: "guest_profile.mixed_indian_western",
            label: "Mix of Indian and Western guests",
          },
          {
            kind: "multi_select",
            path: "events_to_focus",
            label: "Which events should have the most experiences?",
            helper: "We'll prioritise loaded items for these events.",
            options: [
              { value: "haldi", label: "Haldi" },
              { value: "mehendi", label: "Mehendi" },
              { value: "sangeet", label: "Sangeet" },
              { value: "cocktail_hour", label: "Cocktail hour" },
              { value: "wedding", label: "Wedding ceremony" },
              { value: "reception", label: "Reception" },
              { value: "after_party", label: "After-party" },
            ],
          },
        ],
      },
      // Sessions 2–4 are rendered by bespoke components, not the field
      // renderer. Empty schemas keep them visible to runtime helpers
      // (progress %, completion banner) while the custom shell handles
      // the bodies.
      { key: "experience_browse", index: 2, fields: [] },
      { key: "experience_map", index: 3, fields: [] },
      { key: "experience_brief", index: 4, fields: [] },
    ],
  },
};
