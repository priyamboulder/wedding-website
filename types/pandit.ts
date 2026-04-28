// ── Priest / Pandit workspace data model ──────────────────────────────────
// The ceremony is the most emotionally complex workspace: tradition vs.
// personalization, information asymmetry, family politics, procurement, and
// duration management. The types below carry all six surfaces — the guided
// brief, the ceremony script, family role assignments, samagri procurement,
// and day-of logistics.

// ── Ceremony tradition ────────────────────────────────────────────────────
// Traditions are organized by category (Hindu, Sikh, Jain, Buddhist, Muslim,
// Parsi, Christian, Interfaith, Non-religious) with a sub-tradition picker
// for regional variants. Each sub-tradition maps to a distinct ritual set
// via the tradition → ritual library.

export type TraditionCategory =
  | "hindu"
  | "sikh"
  | "jain"
  | "buddhist"
  | "muslim"
  | "parsi"
  | "christian"
  | "interfaith"
  | "non_religious";

export const TRADITION_CATEGORY_LABEL: Record<TraditionCategory, string> = {
  hindu: "Hindu",
  sikh: "Sikh",
  jain: "Jain",
  buddhist: "Buddhist",
  muslim: "Muslim",
  parsi: "Parsi / Zoroastrian",
  christian: "Christian",
  interfaith: "Interfaith",
  non_religious: "Non-religious",
};

export type CeremonyTradition =
  // Hindu sub-traditions
  | "vedic"
  | "arya_samaj"
  | "north_indian"
  | "tamil_brahmin"
  | "telugu"
  | "kannada"
  | "malayali"
  | "gujarati"
  | "surti_gujarati"
  | "marathi"
  | "bengali"
  | "punjabi_hindu"
  | "rajasthani"
  | "marwari"
  | "sindhi"
  | "kashmiri_pandit"
  | "bihari_maithili"
  | "odia"
  | "assamese"
  | "konkani_goan_hindu"
  // Sikh
  | "sikh_anand_karaj"
  // Jain
  | "jain"
  // Buddhist
  | "buddhist"
  // Muslim
  | "muslim_nikah"
  | "muslim_nikah_walima"
  | "ismaili"
  // Parsi
  | "parsi_zoroastrian"
  // Christian (Indian contexts)
  | "christian_catholic_indian"
  | "christian_protestant_indian"
  | "christian_syro_malabar"
  // Interfaith
  | "interfaith_hindu_christian"
  | "interfaith_hindu_muslim"
  | "interfaith_hindu_jewish"
  | "interfaith_hindu_sikh"
  | "interfaith_sikh_christian"
  | "interfaith_sikh_muslim"
  | "interfaith_custom"
  // Non-religious
  | "spiritual_nonreligious"
  | "cultural_only";

export const CEREMONY_TRADITION_LABEL: Record<CeremonyTradition, string> = {
  vedic: "Vedic (traditional Hindu)",
  arya_samaj: "Arya Samaj (simplified / reformed Hindu)",
  north_indian: "North Indian (general)",
  tamil_brahmin: "Tamil Brahmin (Iyer / Iyengar)",
  telugu: "Telugu",
  kannada: "Kannada",
  malayali: "Malayali / Kerala Hindu",
  gujarati: "Gujarati",
  surti_gujarati: "Surti Gujarati",
  marathi: "Marathi",
  bengali: "Bengali",
  punjabi_hindu: "Punjabi Hindu",
  rajasthani: "Rajasthani",
  marwari: "Marwari",
  sindhi: "Sindhi",
  kashmiri_pandit: "Kashmiri Pandit",
  bihari_maithili: "Bihari / Maithili",
  odia: "Odia",
  assamese: "Assamese",
  konkani_goan_hindu: "Konkani / Goan Hindu",
  sikh_anand_karaj: "Sikh (Anand Karaj)",
  jain: "Jain",
  buddhist: "Buddhist",
  muslim_nikah: "Muslim — Nikah",
  muslim_nikah_walima: "Muslim — Nikah + Walima",
  ismaili: "Ismaili",
  parsi_zoroastrian: "Parsi / Zoroastrian",
  christian_catholic_indian: "Christian — Catholic (Indian)",
  christian_protestant_indian: "Christian — Protestant (Indian)",
  christian_syro_malabar: "Christian — Syro-Malabar / Kerala Christian",
  interfaith_hindu_christian: "Interfaith — Hindu + Christian",
  interfaith_hindu_muslim: "Interfaith — Hindu + Muslim",
  interfaith_hindu_jewish: "Interfaith — Hindu + Jewish",
  interfaith_hindu_sikh: "Interfaith — Hindu + Sikh",
  interfaith_sikh_christian: "Interfaith — Sikh + Christian",
  interfaith_sikh_muslim: "Interfaith — Sikh + Muslim",
  interfaith_custom: "Interfaith — custom blend",
  spiritual_nonreligious: "Spiritual but not religious",
  cultural_only: "Cultural (no religious officiation)",
};

export const TRADITION_CATEGORY_BY_TRADITION: Record<CeremonyTradition, TraditionCategory> = {
  vedic: "hindu",
  arya_samaj: "hindu",
  north_indian: "hindu",
  tamil_brahmin: "hindu",
  telugu: "hindu",
  kannada: "hindu",
  malayali: "hindu",
  gujarati: "hindu",
  surti_gujarati: "hindu",
  marathi: "hindu",
  bengali: "hindu",
  punjabi_hindu: "hindu",
  rajasthani: "hindu",
  marwari: "hindu",
  sindhi: "hindu",
  kashmiri_pandit: "hindu",
  bihari_maithili: "hindu",
  odia: "hindu",
  assamese: "hindu",
  konkani_goan_hindu: "hindu",
  sikh_anand_karaj: "sikh",
  jain: "jain",
  buddhist: "buddhist",
  muslim_nikah: "muslim",
  muslim_nikah_walima: "muslim",
  ismaili: "muslim",
  parsi_zoroastrian: "parsi",
  christian_catholic_indian: "christian",
  christian_protestant_indian: "christian",
  christian_syro_malabar: "christian",
  interfaith_hindu_christian: "interfaith",
  interfaith_hindu_muslim: "interfaith",
  interfaith_hindu_jewish: "interfaith",
  interfaith_hindu_sikh: "interfaith",
  interfaith_sikh_christian: "interfaith",
  interfaith_sikh_muslim: "interfaith",
  interfaith_custom: "interfaith",
  spiritual_nonreligious: "non_religious",
  cultural_only: "non_religious",
};

export const TRADITIONS_BY_CATEGORY: Record<TraditionCategory, CeremonyTradition[]> = {
  hindu: [
    "vedic",
    "arya_samaj",
    "north_indian",
    "tamil_brahmin",
    "telugu",
    "kannada",
    "malayali",
    "gujarati",
    "surti_gujarati",
    "marathi",
    "bengali",
    "punjabi_hindu",
    "rajasthani",
    "marwari",
    "sindhi",
    "kashmiri_pandit",
    "bihari_maithili",
    "odia",
    "assamese",
    "konkani_goan_hindu",
  ],
  sikh: ["sikh_anand_karaj"],
  jain: ["jain"],
  buddhist: ["buddhist"],
  muslim: ["muslim_nikah", "muslim_nikah_walima", "ismaili"],
  parsi: ["parsi_zoroastrian"],
  christian: [
    "christian_catholic_indian",
    "christian_protestant_indian",
    "christian_syro_malabar",
  ],
  interfaith: [
    "interfaith_hindu_christian",
    "interfaith_hindu_muslim",
    "interfaith_hindu_jewish",
    "interfaith_hindu_sikh",
    "interfaith_sikh_christian",
    "interfaith_sikh_muslim",
    "interfaith_custom",
  ],
  non_religious: ["spiritual_nonreligious", "cultural_only"],
};

// ── Language balance ──────────────────────────────────────────────────────

export type CeremonyLanguageBalance =
  | "sanskrit_english_explain"
  | "sanskrit_hindi_explain"
  | "mostly_english_key_sanskrit"
  | "full_sanskrit"
  | "regional";

export const LANGUAGE_BALANCE_LABEL: Record<CeremonyLanguageBalance, string> = {
  sanskrit_english_explain: "Sanskrit mantras + English explanation",
  sanskrit_hindi_explain: "Sanskrit mantras + Hindi explanation",
  mostly_english_key_sanskrit: "Mostly English · Sanskrit for key mantras",
  full_sanskrit: "Full Sanskrit (traditional, no translation)",
  regional: "Regional language",
};

// ── Guest participation ───────────────────────────────────────────────────

export type GuestParticipation =
  | "observe_quietly"
  | "participate_key_moments"
  | "fully_interactive"
  | "mixed";

export const GUEST_PARTICIPATION_LABEL: Record<GuestParticipation, string> = {
  observe_quietly: "Observe quietly (traditional)",
  participate_key_moments: "Participate in key moments",
  fully_interactive: "Fully interactive with emcee-style explanation",
  mixed: "Mixed — some rituals observed, some participated in",
};

// ── Ritual inclusion decision ─────────────────────────────────────────────

export type RitualInclusion = "yes" | "no" | "discuss";

export const RITUAL_INCLUSION_LABEL: Record<RitualInclusion, string> = {
  yes: "Including",
  no: "Skipping",
  discuss: "Discuss with pandit",
};

// ── Ritual ────────────────────────────────────────────────────────────────
// A single ritual in the ceremony with its traditional defaults and the
// couple's choices. The script tab layers on top of this — notes, music,
// photography hints — per-ritual.

export interface CeremonyRitual {
  id: string;
  name_sanskrit: string;
  name_english: string;
  short_description: string;
  meaning: string;
  default_duration_min: number;
  default_inclusion: RitualInclusion;
  // Traditional participants — free-text (roles are formally tracked in the
  // Family Roles tab).
  traditional_participants: string;

  // ── Couple's choices ───────────────────────────────────────────────────
  inclusion: RitualInclusion;
  included_duration_min: number;
  abbreviated: boolean;
  couple_notes: string;
  // Order within the ceremony (reorderable in Script tab).
  sort_order: number;

  // ── Script fields (Tab 3) ──────────────────────────────────────────────
  what_happens: string;
  music_note: string;
  photography_note: string;
  guest_instruction: string;

  created_at: string;
  updated_at: string;
}

// ── Personal addition ─────────────────────────────────────────────────────

export interface CeremonyPersonalAddition {
  id: string;
  body: string;
  sort_order: number;
  created_at: string;
}

// ── Saptapadi / Mangal Phera vows ─────────────────────────────────────────
// The seven rounds each carry a traditional Sanskrit vow and a theme. Couples
// can layer personal English words after each Sanskrit mantra — the pandit
// recites the traditional line, then pauses while the couple speaks their own.

export interface SaptapadiVow {
  round: number; // 1-7
  theme: string; // "Nourishment", "Strength", etc.
  traditional_meaning: string;
  personal_text: string;
}

// ── Ceremony brief ────────────────────────────────────────────────────────

export interface CeremonyBrief {
  tradition: CeremonyTradition;
  // Custom interfaith free-text (used when tradition === "interfaith_custom")
  interfaith_primary?: string;
  interfaith_secondary?: string;
  duration_target_min: number; // 30 / 45 / 60 / 90 / 120 / 180 (180 = "as long as it takes")
  language_balance: CeremonyLanguageBalance;
  guest_participation: GuestParticipation;
  // Cultural context panel — AI-style prose. Saved so the couple can edit it.
  cultural_context: string;
  // Program coordination flags (link to Stationery workspace).
  wants_printed_program: boolean;
  program_content: {
    include_ritual_meanings: boolean;
    include_family_roles: boolean;
    include_love_story: boolean;
    include_dress_code: boolean;
    include_unplugged_reminder: boolean;
  };
  updated_at: string;
}

// ── Family role ───────────────────────────────────────────────────────────

export type RoleSide = "brides" | "grooms" | "shared";

export interface CeremonyFamilyRole {
  id: string;
  role_name: string; // e.g. "Kanyadaan — who gives away the bride?"
  tradition_text: string; // "Traditionally, the bride's father and mother"
  side: RoleSide;
  linked_ritual_id?: string;

  // Assigned people. `linked_guest_id` connects to the Guest Roster so the
  // guest's contact info flows through; `primary_name`/`primary_relationship`
  // are the always-editable display strings (synced from the guest when
  // linked, free-text when not).
  primary_name: string;
  primary_relationship: string;
  linked_guest_id?: string;
  backup_name: string;
  backup_guest_id?: string;

  physical_requirements: string;
  accommodation_notes: string;
  practice_needed: boolean;
  practice_note: string;

  // Planner-only field — hidden from pandit & family views.
  planner_private_note: string;

  created_at: string;
  updated_at: string;
}

// ── Samagri item ──────────────────────────────────────────────────────────

export type SamagriCategory =
  | "general_setup"
  | "floral"
  | "food_grain"
  | "fabric"
  | "metal_vessels"
  | "personal_items"
  | "other";

export const SAMAGRI_CATEGORY_LABEL: Record<SamagriCategory, string> = {
  general_setup: "General / Setup",
  floral: "Floral",
  food_grain: "Food / Grain",
  fabric: "Fabric",
  metal_vessels: "Metal / Vessels",
  personal_items: "Personal Items",
  other: "Other",
};

export type SamagriSource =
  | "indian_grocery"
  | "temple"
  | "online"
  | "pandit_provides"
  | "venue_provides"
  | "other";

export const SAMAGRI_SOURCE_LABEL: Record<SamagriSource, string> = {
  indian_grocery: "Indian grocery store",
  temple: "Temple",
  online: "Online",
  pandit_provides: "Pandit provides",
  venue_provides: "Included in venue",
  other: "Other",
};

export type SamagriResponsibility =
  | "brides_family"
  | "grooms_family"
  | "planner"
  | "pandit"
  | "other";

export const SAMAGRI_RESPONSIBILITY_LABEL: Record<SamagriResponsibility, string> = {
  brides_family: "Bride's family",
  grooms_family: "Groom's family",
  planner: "Planner",
  pandit: "Pandit",
  other: "Other",
};

export type SamagriStatus =
  | "needed"
  | "sourced"
  | "confirmed"
  | "delivered";

export const SAMAGRI_STATUS_LABEL: Record<SamagriStatus, string> = {
  needed: "Needed",
  sourced: "Sourced",
  confirmed: "Confirmed",
  delivered: "Delivered to venue",
};

export interface SamagriItem {
  id: string;
  name_local: string; // Hindi/Sanskrit name
  name_english: string;
  category: SamagriCategory;
  used_for_ritual_id?: string; // Ritual linkage
  used_for_label?: string; // Free text if no ritual linked
  quantity: string; // "2 garlands" · "1 kg"
  source: SamagriSource;
  responsibility: SamagriResponsibility;
  status: SamagriStatus;
  due_date?: string; // ISO date
  added_by_pandit: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ── Ceremony logistics ────────────────────────────────────────────────────

export type PanditMicType = "lapel" | "podium" | "headset" | "none";
export const PANDIT_MIC_LABEL: Record<PanditMicType, string> = {
  lapel: "Lapel mic",
  podium: "Podium mic",
  headset: "Headset mic",
  none: "No mic needed",
};

export type MandapDirection = "north" | "east" | "west" | "south" | "unspecified";
export const MANDAP_DIRECTION_LABEL: Record<MandapDirection, string> = {
  north: "North",
  east: "East",
  west: "West",
  south: "South",
  unspecified: "To be decided",
};

export interface CeremonyLogistics {
  // Mandap
  mandap_orientation: MandapDirection;
  mandap_dimensions: string; // free text "12 x 12 ft"
  havan_kund_placement: string;
  fire_permit_needed: boolean;
  fire_permit_status: string; // "Not applicable" / "Pending venue" / "Secured"

  // Audio
  pandit_mic_type: PanditMicType;
  amplify_mantras: boolean;
  background_instrumental: boolean;
  background_instrumental_note: string;
  sound_check_time: string;

  // Guest experience
  shoe_removal_plan: string;
  water_available: boolean;
  weather_considerations: string;
  unplugged_ceremony: boolean;
  childrens_area: boolean;
  childrens_area_note: string;

  // Vendor timing coordination notes
  photography_note: string;
  videography_note: string;
  dj_note: string;
  decor_note: string;

  updated_at: string;
}

// ── Saptapadi defaults ────────────────────────────────────────────────────

export const SAPTAPADI_DEFAULTS: SaptapadiVow[] = [
  {
    round: 1,
    theme: "Nourishment",
    traditional_meaning:
      "We take this first step for food — may we always have enough, and share it with those who have less.",
    personal_text: "",
  },
  {
    round: 2,
    theme: "Strength",
    traditional_meaning:
      "The second step for strength — physical, emotional, and spiritual — to face life together.",
    personal_text: "",
  },
  {
    round: 3,
    theme: "Prosperity",
    traditional_meaning:
      "The third step for prosperity — to work diligently and share in what we build.",
    personal_text: "",
  },
  {
    round: 4,
    theme: "Wisdom & Joy",
    traditional_meaning:
      "The fourth step for wisdom and mutual happiness — to honor each other's families and cultivate joy.",
    personal_text: "",
  },
  {
    round: 5,
    theme: "Family",
    traditional_meaning:
      "The fifth step for progeny — for the children we may raise, or the family we choose.",
    personal_text: "",
  },
  {
    round: 6,
    theme: "Health & Longevity",
    traditional_meaning:
      "The sixth step for health and a long life together — through seasons and seasons.",
    personal_text: "",
  },
  {
    round: 7,
    theme: "Friendship",
    traditional_meaning:
      "The seventh and final step for lifelong friendship — the quiet bond beneath the marriage vow.",
    personal_text: "",
  },
];

// ── Ceremony snapshot (derived) ───────────────────────────────────────────

export interface CeremonySnapshot {
  tradition_label: string;
  total_rituals: number;
  included_rituals: number;
  discussed_rituals: number;
  estimated_duration_min: number;
  language_label: string;
}
