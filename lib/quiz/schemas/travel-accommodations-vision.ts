// ── Travel & Accommodations → Vision & Needs quiz ─────────────────────────
// Less style, more logistics: destination type, guest travel share, and
// hospitality level. Seeds moodboard with venue + hospitality refs and
// records a direction note.

import { createVisionMoodQuiz } from "./_shared";

export const travelAccommodationsVisionQuiz = createVisionMoodQuiz({
  category: "travel_accommodations",
  id: "travel_accommodations:vision:v1",
  version: "1",
  title: "Travel & stay in 4 quick answers",
  intro:
    "Tell us the travel shape of your wedding — destination vs local, how much your guests will travel, and how we should welcome them.",
  estimatedMinutes: 2,
  stylePrompt: "Which hospitality words describe your approach?",
  styleOptions: [
    { value: "destination", label: "Destination wedding" },
    { value: "local-wedding", label: "Local wedding" },
    { value: "hometown-reunion", label: "Hometown reunion" },
    { value: "luxury-resort", label: "Luxury resort" },
    { value: "boutique-hotel", label: "Boutique hotel" },
    { value: "vrbo-scatter", label: "Scattered VRBOs" },
    { value: "all-inclusive", label: "All-inclusive block" },
    { value: "guided-experience", label: "Guided experience" },
  ],
  moodPrompt: "Pick the stay experiences that feel right",
  moodOptions: [
    {
      value: "luxury_resort_pool",
      label: "Luxury resort pool",
      image_url:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=480&q=70",
    },
    {
      value: "boutique_hotel_lobby",
      label: "Boutique hotel lobby",
      image_url:
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=480&q=70",
    },
    {
      value: "beach_destination",
      label: "Beach destination",
      image_url:
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=480&q=70",
    },
    {
      value: "mountain_retreat",
      label: "Mountain retreat",
      image_url:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&q=70",
    },
    {
      value: "heritage_palace",
      label: "Heritage palace",
      image_url:
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=480&q=70",
    },
    {
      value: "welcome_bag_lobby",
      label: "Welcome bag moment",
      image_url:
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=480&q=70",
    },
  ],
  scalePrompt: "What share of guests will travel to get here?",
  scaleHelper: "Locals vs flyers shapes room blocks, shuttles, and welcome kits.",
  scaleMin: 0,
  scaleMax: 100,
  scaleStep: 5,
  scaleDefault: 40,
  scaleMinLabel: "Mostly local",
  scaleMaxLabel: "Mostly out-of-town",
  scaleDescriptors: {
    0: "Almost everyone local — no accommodation block needed",
    25: "Most guests local, small out-of-town block",
    50: "Even mix — meaningful block required",
    75: "Mostly travelers — big block, shuttles, welcome event",
    100: "Fully destination — all guests flying in, full itinerary",
  },
  scaleNoteLabel: "Travel mix direction",
  avoidPrompt: "Hospitality constraints or asks?",
  avoidHelper: "Things we need to accommodate — or avoid — for your guests.",
  avoidPlaceholder:
    "e.g. some elderly guests need ground-floor rooms, no stairs-only hotels, avoid far-away Airbnbs…",
  moodboardPreviewLabel: "Stay refs",
});
