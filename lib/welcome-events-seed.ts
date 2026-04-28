// ── Welcome Events seed ────────────────────────────────────────────────────
// Option lists + a lightly populated default state so the module feels alive
// on first load. Matches the sample narrative from the spec (rooftop Marriott
// welcome dinner, 80 guests, 65 of 80 sent).

import type {
  BarStyle,
  DressCodeLevel,
  EventPurpose,
  HostingFamily,
  InvitationChannel,
  InviteScope,
  ServiceStyle,
  WelcomeEventsState,
} from "@/types/welcome-events";

export const HOST_OPTIONS: { value: HostingFamily; label: string }[] = [
  { value: "bride_family", label: "Bride's family" },
  { value: "groom_family", label: "Groom's family" },
  { value: "both_families", label: "Both families" },
  { value: "wedding_couple", label: "Wedding couple" },
];

export const PURPOSE_OPTIONS: { value: EventPurpose; label: string }[] = [
  { value: "families_meet", label: "Both families meet for the first time" },
  { value: "welcome_oot", label: "Welcome out-of-town guests" },
  { value: "casual_kickoff", label: "Casual kickoff to the wedding week" },
  { value: "pre_wedding_garba", label: "Pre-wedding garba / dandiya night" },
];

export const DRESS_CODE_OPTIONS: { value: DressCodeLevel; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "smart_casual", label: "Smart casual" },
  { value: "indian_casual", label: "Indian casual" },
  { value: "festive", label: "Festive" },
  { value: "cocktail", label: "Cocktail" },
];

export const ACTIVITY_OPTIONS: string[] = [
  "No structured activities — just food and mingling",
  "Family introductions (both sides introduce)",
  "Garba / dandiya (need space + music)",
  "Slideshow of couple's journey",
  "Ice-breaker game (both families)",
];

export const SERVICE_OPTIONS: { value: ServiceStyle; label: string }[] = [
  { value: "passed_apps_bar", label: "Passed appetizers + bar" },
  { value: "light_buffet", label: "Buffet (light)" },
  { value: "sit_down", label: "Sit-down dinner" },
  { value: "chai_snacks", label: "Chai + snacks only" },
  { value: "restaurant_private", label: "Restaurant private dining" },
];

export const BAR_OPTIONS: { value: BarStyle; label: string }[] = [
  { value: "dry", label: "No alcohol (dry event)" },
  { value: "cash_bar", label: "Cash bar (guests pay)" },
  { value: "open_bar", label: "Open bar (hosted)" },
  { value: "beer_wine", label: "Beer and wine only" },
  { value: "signature_cocktails", label: "Signature cocktails only" },
];

export const CHANNEL_OPTIONS: {
  value: InvitationChannel;
  label: string;
}[] = [
  { value: "printed_card", label: "Formal printed card" },
  { value: "digital", label: "Digital invite (email / WhatsApp)" },
  { value: "verbal_text", label: "Verbal / text from family" },
  { value: "wedding_website", label: "Included on wedding website" },
];

export const INVITE_SCOPE_OPTIONS: { value: InviteScope; label: string }[] = [
  { value: "oot_only", label: "Out-of-town guests only" },
  { value: "all_guests", label: "All wedding guests" },
  { value: "close_family_party", label: "Close family and bridal party only" },
  { value: "custom", label: "Custom list" },
];

export const GUEST_GROUP_OPTIONS: string[] = [
  "Bride family",
  "Groom family",
  "Friends",
  "Bridal party",
  "Out-of-town",
];

export const DEFAULT_WELCOME_EVENTS: WelcomeEventsState = {
  basics: {
    name: "Welcome Dinner",
    date: "Thursday, April 9, 2026",
    timeStart: "6:00 PM",
    timeEnd: "9:00 PM",
    location: "Marriott rooftop terrace",
    guestCount: 80,
    host: "both_families",
    purposes: ["welcome_oot", "families_meet"],
    customPurpose: "",
  },
  vibe: {
    formality: 35,
    formalityNote: "No assigned seats, finger food, mingling",
    dressCode: "smart_casual",
    activities: [
      "Family introductions (both sides introduce)",
      "Slideshow of couple's journey",
    ],
    customActivities: [],
  },
  inviteScope: "oot_only",
  guests: [
    {
      id: "wg_1",
      name: "Nani + Nana",
      group: "Bride family",
      rsvp: "yes",
      hotel: "Marriott",
    },
    {
      id: "wg_2",
      name: "Uncle Raj (+3)",
      group: "Bride family",
      rsvp: "yes",
      hotel: "Marriott",
    },
    {
      id: "wg_3",
      name: "Aunty Meera (+2)",
      group: "Groom family",
      rsvp: "yes",
      hotel: "Marriott",
    },
    {
      id: "wg_4",
      name: "College friends group",
      group: "Friends",
      rsvp: "pending",
      hotel: "Hilton",
    },
    {
      id: "wg_5",
      name: "Mehta cousins",
      group: "Groom family",
      rsvp: "pending",
      hotel: "Marriott",
    },
  ],
  serviceStyle: "passed_apps_bar",
  menu: [
    { id: "m_1", label: "Samosa + chutney", source: "Caterer" },
    { id: "m_2", label: "Paneer tikka", source: "Caterer" },
    { id: "m_3", label: "Fruit + cheese display", source: "Hotel" },
    { id: "m_4", label: "Chai station", source: "Caterer" },
    { id: "m_5", label: "Soft drinks + water", source: "Hotel" },
  ],
  bar: "beer_wine",
  setup: {
    soundSystem: true,
    projector: true,
    garbaSticks: false,
    nameTags: true,
    photoDisplay: true,
    welcomeSignage: true,
    custom: [],
  },
  comms: {
    channel: "digital",
    subject: "You're invited — Welcome dinner for Priya & Raj",
    body: `Dear [Guest],

We're so excited you're traveling to celebrate with us! Before the wedding weekend begins, please join us for a casual welcome dinner:

Thursday, April 9 · 6:00 PM
Marriott rooftop terrace
Dress code: Smart casual

Light Indian appetizers and drinks will be served. Come as you are — this is just a chance for both families and friends to meet before the festivities begin.

With love,
The Sharma & Malhotra families`,
    stats: { sent: 65, opened: 48, rsvpd: 40 },
  },
  documents: [
    {
      id: "d_1",
      label: "Marriott rooftop reservation",
      category: "reservation",
      addedAt: "2026-03-01T10:00:00Z",
    },
    {
      id: "d_2",
      label: "Caterer order — welcome dinner",
      category: "catering_order",
      addedAt: "2026-03-10T14:00:00Z",
    },
  ],
};
