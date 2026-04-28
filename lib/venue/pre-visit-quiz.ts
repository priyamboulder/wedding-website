// ── Pre-Site-Visit Checklist ──────────────────────────────────────────────
// Interactive "when you visit, make sure you look at and ask about these
// things" quiz. Each item has a tip that expands inline.
//
// Indexed so completion state persists per-visit in venue-store.site_visits
// → pre_visit_quiz (Record<itemId, boolean>).

export interface PreVisitQuizItem {
  id: string;
  label: string;
  tip: string;
}

export interface PreVisitQuizGroup {
  id: string;
  title: string;
  items: PreVisitQuizItem[];
}

export const PRE_VISIT_QUIZ: PreVisitQuizGroup[] = [
  {
    id: "ceremony",
    title: "Ceremony fit",
    items: [
      {
        id: "pv-ceremony-setup",
        label: "Does this space fit your ceremony setup (mandap, aisle, seating)?",
        tip: "Measure ceiling clearance if you plan a tall mandap. Check aisle width for baraat processional.",
      },
      {
        id: "pv-havan-fire",
        label: "Can you see exactly where the havan / fire ceremony would happen?",
        tip: "Indoor = usually electric-only. Outdoor = confirm distance from canopy / drapery. Ask who pulls the permit.",
      },
    ],
  },
  {
    id: "spaces",
    title: "Events & spaces",
    items: [
      {
        id: "pv-cocktail-space",
        label: "Where would the cocktail hour happen? Is there a separate space?",
        tip: "Cocktail in a different space cues guests that the ceremony is over. Look for a transition zone.",
      },
      {
        id: "pv-event-transition",
        label: "How does the space transition between events (e.g. sangeet → wedding)?",
        tip: "Ask for the flip timeline. Who moves chairs? Does the venue or your décor team own it?",
      },
      {
        id: "pv-bridal-suite",
        label: "What does the bridal suite look like? Private enough for getting ready?",
        tip: "Check natural light for photography, elevator / service access for lehengas, bathroom proximity.",
      },
    ],
  },
  {
    id: "ops",
    title: "Operations",
    items: [
      {
        id: "pv-catering-kitchen",
        label: "Where is the catering kitchen relative to the event space?",
        tip: "Closer = hotter food. Ask about prep space, refrigeration, and whether your outside caterer can use it.",
      },
      {
        id: "pv-sound-acoustics",
        label: "What's the sound situation — echo, outdoor noise, speaker restrictions?",
        tip: "Clap in the room. Ballrooms with hard surfaces echo. Outdoor = check neighbor distance + curfew.",
      },
      {
        id: "pv-vendor-loadin",
        label: "Where do vendors load in? Is there a service entrance?",
        tip: "Your florist needs a clear path for installs. Ask about window (usually 24 hrs before).",
      },
    ],
  },
  {
    id: "guests",
    title: "Guest experience",
    items: [
      {
        id: "pv-parking-valet",
        label: "What's the parking situation for guests? Valet available?",
        tip: "300+ guests needs 150+ spots or a valet setup. Ask about coach / shuttle access.",
      },
      {
        id: "pv-rain-backup",
        label: "What's the backup plan for rain if outdoor?",
        tip: "Ask to walk the backup indoor space. Is it a downgrade or equally beautiful?",
      },
    ],
  },
];

// Flat list of all item ids — useful for progress math.
export const PRE_VISIT_ALL_ITEM_IDS: string[] = PRE_VISIT_QUIZ.flatMap(
  (g) => g.items.map((i) => i.id),
);
